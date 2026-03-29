/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * [Logic] OSRM 분석, 토스트/상태 관리
 */

import { useState, useEffect } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Campground } from '../types';
import { extractLatLng } from '../utils/geo';

interface AnalysisProps {
  cachedData: Campground[] | null;
  setCachedData: (data: Campground[]) => void;
  dbVersion: string;
}

/**
 * 전수 분석 로직 및 앱 전역 상태(좌표, 토스트)를 관리하는 훅
 */
export const useAnalysis = (cachedData: Campground[] | null, setCachedData: (data: Campground[]) => void, dbVersion: string) => {
  // --- [상태] 사용자 좌표 (집/회사) ---
  const [homeCoords, setHomeCoords] = useState<{ lat: number, lng: number }>(() => {
    const saved = localStorage.getItem('camping_homeCoords');
    return saved ? JSON.parse(saved) : { lat: 0, lng: 0 };
  });
  const [workCoords, setWorkCoords] = useState<{ lat: number, lng: number }>(() => {
    const saved = localStorage.getItem('camping_workCoords');
    return saved ? JSON.parse(saved) : { lat: 0, lng: 0 };
  });

  // --- [상태] 설정용 임시 URL 입력값 ---
  const [tmpHomeUrl, setTmpHomeUrl] = useState('');
  const [tmpWorkUrl, setTmpWorkUrl] = useState('');

  // --- [상태] 마지막 분석 시점의 좌표 (재분석 방지용) ---
  const [lastAnalysisCoords, setLastAnalysisCoords] = useState<{home: any, work: any} | null>(() => {
    const saved = localStorage.getItem('camping_lastAnalysisCoords');
    return saved ? JSON.parse(saved) : null;
  });

  // --- [상태] 전역 토스트 알림 ---
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // --- [상태] 분석 작업 진행 현황 ---
  const [isSystemTaskActive, setIsSystemTaskActive] = useState(false);
  const [systemTaskStatus, setSystemTaskStatus] = useState('');
  const [systemTaskProgress, setSystemTaskProgress] = useState(0);
  const [isSystemTaskComplete, setIsSystemTaskComplete] = useState(false);

  // --- [효과] 좌표 변경 시 로컬 스토리지 동기화 ---
  useEffect(() => { localStorage.setItem('camping_homeCoords', JSON.stringify(homeCoords)); }, [homeCoords]);
  useEffect(() => { localStorage.setItem('camping_workCoords', JSON.stringify(workCoords)); }, [workCoords]);
  useEffect(() => { localStorage.setItem('camping_lastAnalysisCoords', JSON.stringify(lastAnalysisCoords)); }, [lastAnalysisCoords]);

  // --- [핸들러] 좌표 적용 로직 ---
  const handleApplyHome = () => {
    const c = extractLatLng(tmpHomeUrl, showToast);
    if (c) { 
      setHomeCoords(c); 
      setTmpHomeUrl(''); 
      showToast('집 좌표 설정이 완료되었습니다.', 'success'); 
    } else {
      showToast('유효하지 않은 좌표 형식입니다. 구글 지도 URL을 확인해 주세요.', 'error');
    }
  };

  const handleApplyWork = () => {
    const c = extractLatLng(tmpWorkUrl, showToast);
    if (c) { 
      setWorkCoords(c); 
      setTmpWorkUrl(''); 
      showToast('회사 좌표 설정이 완료되었습니다.', 'success'); 
    } else {
      showToast('유효하지 않은 좌표 형식입니다. 구글 지도 URL을 확인해 주세요.', 'error');
    }
  };

  /**
   * 전 구간 OSRM 도로 주행 시간/거리 전수 분석 실행
   */
  const runFullAnalysis = async () => {
    if (!cachedData) return;
    
    // 집/회사 설정 여부 검증
    const isHomeSet = homeCoords.lat !== 0 && homeCoords.lng !== 0;
    const isWorkSet = workCoords.lat !== 0 && workCoords.lng !== 0;
    
    if (!isHomeSet || !isWorkSet) {
      showToast('분석을 위해 집과 회사의 주소를 모두 설정해 주세요.', 'error');
      return;
    }

    setIsSystemTaskActive(true);
    setIsSystemTaskComplete(false);
    setSystemTaskProgress(0);
    setSystemTaskStatus('분석 준비 중...');

    const items = [...cachedData];
    const batchSize = 100;

    const getOSRMData = async (src: { lat: number, lng: number }, targets: Campground[], offset: number, scale: number) => {
      for (let i = 0; i < targets.length; i += batchSize) {
        const batch = targets.slice(i, i + batchSize);
        const batchIndices = Array.from({ length: batch.length }, (_, j) => i + j);
        setSystemTaskStatus(`경로 분석 중... (${i + batch.length}/${targets.length})`);
        setSystemTaskProgress(offset + Math.round((i / targets.length) * scale));

        try {
          const coords = `${src.lng},${src.lat};` + batch.map(t => `${t.lng},${t.lat}`).join(';');
          const destIdx = batch.map((_, j) => j + 1).join(';');
          const res = await fetch(`https://router.project-osrm.org/table/v1/driving/${coords}?sources=0&destinations=${destIdx}&annotations=duration,distance`);
          const d = await res.json();
          if (d.code === 'Ok' && d.durations) {
            batchIndices.forEach((idx, j) => {
              items[idx] = {
                ...items[idx],
                [src === homeCoords ? 'timeHome' : 'timeWork']: Math.round((d.durations[0][j] || 0) / 60),
                [src === homeCoords ? 'roadDistHome' : 'roadDistWork']: parseFloat(((d.distances[0][j] || 0) / 1000).toFixed(2))
              };
            });
          }
        } catch (e) { console.error(e); }
        await new Promise(r => setTimeout(r, 600)); // Rate limit protection
      }
    };

    try {
      await getOSRMData(homeCoords, items, 0, 45);
      await getOSRMData(workCoords, items, 45, 45);
      
      // 분석 결과 물리 저장 (Filesystem)
      await Filesystem.writeFile({
        path: 'analyzed-camping-db.json',
        data: JSON.stringify({ version: dbVersion, items }),
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });
      setLastAnalysisCoords({ home: homeCoords, work: workCoords });

      setCachedData(items);
      setSystemTaskProgress(100);
      setSystemTaskStatus('전국 주행시간 전수 분석 완료!');
      setIsSystemTaskComplete(true);
      showToast('모든 캠핑장의 최적 경로 거리와 주행시간 분석이 완료되었습니다.', 'success');
    } catch (err: any) {
      showToast(`분석 중 오류 발생: ${err.message}`, 'error');
      setIsSystemTaskActive(false);
    }
  };

  return {
    homeCoords, setHomeCoords,
    workCoords, setWorkCoords,
    tmpHomeUrl, setTmpHomeUrl,
    tmpWorkUrl, setTmpWorkUrl,
    handleApplyHome, handleApplyWork,
    lastAnalysisCoords,
    toast, showToast,
    isSystemTaskActive, setIsSystemTaskActive,
    systemTaskStatus,
    systemTaskProgress,
    isSystemTaskComplete,
    runFullAnalysis
  };
};

export default useAnalysis;
