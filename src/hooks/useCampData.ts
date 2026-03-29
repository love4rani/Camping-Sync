/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * [Logic] 데이터 로딩, 필터링, DB 관리 훅
 */

import { useState, useEffect, useRef } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Campground } from '../types';

interface useCampDataProps {
  homeCoords: { lat: number, lng: number };
  workCoords: { lat: number, lng: number };
  lastAnalysisCoords: { home: any, work: any } | null;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

/**
 * 캠핑장 데이터를 로컬/원격에서 로드하고 검색/필터링을 담당하는 핵심 훅
 */
export const useCampData = ({
  homeCoords, workCoords, lastAnalysisCoords, showToast
}: useCampDataProps) => {
  // --- [상태] 원본 및 필터링된 데이터 ---
  const [cachedData, setCachedData] = useState<Campground[] | null>(null);
  const [campgrounds, setCampgrounds] = useState<Campground[]>([]);
  const [targetCamps, setTargetCamps] = useState<{name: string, url: string}[]>(() => {
    const saved = localStorage.getItem('camping_targetCamps');
    return saved ? JSON.parse(saved) : [];
  });

  // --- [상태] 서비스 설정 관련 ---
  const [dbVersion, setDbVersion] = useState(() => localStorage.getItem('camping_dbVersion') || '2026.03.29 17:00');
  const [isAutoUpdate, setIsAutoUpdate] = useState(() => {
    const saved = localStorage.getItem('camping_isAutoUpdate');
    return saved === null ? true : saved === 'true';
  });

  // --- [상태] 로딩 및 에러 제어 ---
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [totalFound, setTotalFound] = useState<number | null>(null);
  
  // --- [상태] 필터 조건 (내부 관리) ---
  const [selDo, setSelDo] = useState('전체');
  const [selSigungu, setSelSigungu] = useState('전체');
  const [selEnvs, setSelEnvs] = useState<string[]>([]);
  const [selTypes, setSelTypes] = useState<string[]>([]);
  const [selFacs, setSelFacs] = useState<string[]>([]);
  const [selTags, setSelTags] = useState<string[]>([]);
  const [distLimit, setDistLimit] = useState(240);
  const [priceLimit, setPriceLimit] = useState(200000);
  const [searchQuery, setSearchQuery] = useState('');
  const [candidateLimit] = useState(4000);

  // --- [상태] 슬라이더 최대치 수정 모드 ---
  const [editingMaxField, setEditingMaxField] = useState<'dist' | 'price' | null>(null);
  const [tempMaxInput, setTempMaxInput] = useState('');
  const [distConfig, setDistConfig] = useState({ min: 0, max: 240 });
  const [priceConfig, setPriceConfig] = useState({ min: 0, max: 200000 });

  const isUpdateNotified = useRef(false);

  /**
   * 전체 데이터에서 현재 필터 조건에 맞는 항목을 계산하여 결과 업데이트
   */
  const processItems = (items: Campground[]) => {
    let filtered = items;

    // 1. 텍스트 검색 (이름, 주소, 지역명)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = items.filter(i =>
        i.nm.toLowerCase().includes(q) ||
        i.addr.toLowerCase().includes(q) ||
        i.do.toLowerCase().includes(q) ||
        i.sigungu.toLowerCase().includes(q)
      );
    }

    // 2. 카테고리/지역/시설 필터 적용
    filtered = filtered.filter(i => {
      const meetsPrice = i.price === null || i.price <= priceLimit;
      const meetsDo = selDo === '전체' || i.do.startsWith(selDo);
      const meetsSigungu = selSigungu === '전체' || i.sigungu === selSigungu;
      const meetsType = selTypes.length === 0 || selTypes.some(t => i.type.includes(t));
      const meetsEnv = selEnvs.length === 0 || selEnvs.some(e => i.env.includes(e));
      const meetsFac = selFacs.length === 0 || selFacs.every(f => (i.fac || '').includes(f));
      const meetsTag = selTags.length === 0 || selTags.some(t => (i.fac || '').includes(t.replace('#', '')));

      return meetsPrice && meetsDo && meetsSigungu && meetsType && meetsEnv &&
        meetsFac && meetsTag;
    });

    // 3. 거리/시간순 정렬 및 필터 (분석 데이터가 있을 경우만)
    const hasAnalysis = items.some(i => i.timeHome !== undefined);
    if (hasAnalysis) {
      filtered = filtered.filter(i => (i.timeHome || 0) <= distLimit);
      filtered.sort((a, b) => (a.timeHome || 999) - (b.timeHome || 999));
    }

    setTotalFound(filtered.length);
    setCampgrounds(filtered.slice(0, candidateLimit));
  };

  // 필터 조건 변경 시마다 자동 계산
  useEffect(() => {
    if (cachedData) processItems(cachedData);
  }, [selDo, selSigungu, selEnvs, selTypes, selFacs, selTags, distLimit, priceLimit, searchQuery]);

  /**
   * 원격 저장소(GitHub 또는 로컬 서버)에서 최신 데이터를 다운로드하고 로컬 분석 데이터와 결합(Merge)
   */
  const updateRemoteDB = async (version: string, isManual = false) => {
    try {
      if (isManual) setLoadingStatus('최신 데이터 다운로드 중...');
      const timestamp = new Date().getTime();
      
      // 로컬/배포 환경에 따라 최적의 소스 URL 선택
      const url = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? `./camping-db.json?t=${timestamp}`
        : `https://raw.githubusercontent.com/love4rani/Camping-Sync/main/public/camping-db.json?t=${timestamp}`;

      const res = await fetch(url, { cache: 'no-store' });
      const remoteData = await res.json();
      
      if (remoteData.version) {
        let finalItems = [...remoteData.items];

        try {
          // 기존 분석된 데이터가 있다면 새 데이터에 덮어쓰기 (스마트 머지)
          const file = await Filesystem.readFile({
            path: 'analyzed-camping-db.json',
            directory: Directory.Documents,
            encoding: Encoding.UTF8
          });
          const oldAnalyzedData = JSON.parse(file.data as string);
          
          if (oldAnalyzedData && oldAnalyzedData.items) {
            const analysisMap = new Map((oldAnalyzedData.items as any[]).map((i: any) => [i.id, i]));
            finalItems = remoteData.items.map((newItem: any) => {
              const oldItem = analysisMap.get(newItem.id) as any;
              if (oldItem && oldItem.timeHome !== undefined) {
                return {
                  ...newItem,
                  roadDistHome: oldItem.roadDistHome,
                  timeHome: oldItem.timeHome,
                  roadDistWork: oldItem.roadDistWork,
                  timeWork: oldItem.timeWork,
                  price: newItem.price // 가격 정보는 새 정보로 갱신
                };
              }
              return newItem;
            });
          }
        } catch (e) { console.log('병합할 이전 분석 데이터가 없습니다.'); }

        const finalData = { ...remoteData, items: finalItems };
        await Filesystem.writeFile({
          path: 'cached-camping-db.json',
          data: JSON.stringify(finalData),
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });
        
        await Filesystem.writeFile({
          path: 'analyzed-camping-db.json',
          data: JSON.stringify(finalData),
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });

        localStorage.setItem('camping_dbVersion', remoteData.version);
        setDbVersion(remoteData.version);
        setCachedData(finalItems);
        processItems(finalItems);
        showToast(`데이터베이스 업데이트가 완료되었습니다 (${remoteData.version})`, 'success');
      }
    } catch (err) {
      if (isManual) showToast('데이터 다운로드 중 오류가 발생했습니다.', 'error');
    }
  };

  /**
   * 원격 서버의 버전을 체크하고 수동/자동 업데이트 실행
   */
  const checkRemoteUpdate = async (localVersion: string, isManual = false) => {
    try {
      if (!navigator.onLine) {
        if (isManual) showToast('네트워크 상태를 확인해 주세요.', 'error');
        return;
      }
      if (isManual) showToast('최신 정보를 확인하는 중입니다...', 'info');
      
      const timestamp = new Date().getTime();
      const url = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? `./camping-db.json?t=${timestamp}`
        : `https://raw.githubusercontent.com/love4rani/Camping-Sync/main/public/camping-db.json?t=${timestamp}`;

      const res = await fetch(url, { cache: 'no-store' });
      const remoteData = await res.json();

      if (remoteData.version !== localVersion) {
        if (isAutoUpdate || isManual) {
            updateRemoteDB(remoteData.version, isManual);
        } else {
            showToast(`새로운 DB 버전(${remoteData.version})이 출시되었습니다.`, 'info');
        }
      } else if (isManual) {
        showToast('현재 최신 버전을 사용하고 있습니다.', 'success');
      }
    } catch (e) {
      if (isManual) showToast('버전 정보를 가져올 수 없습니다.', 'error');
    }
  };

  /**
   * 앱 실행 시 영속성 저장소에서 데이터를 읽어와 초기화
   */
  const loadData = async () => {
    setLoading(true);
    setLoadingStatus('데이터를 준비하고 있습니다...');
    try {
      let data;
      // 마지막 분석 시점의 좌표와 현재 좌표가 일치하면 분석 파일을 우선 로드
      const matches = lastAnalysisCoords && 
                     lastAnalysisCoords.home.lat === homeCoords.lat && 
                     lastAnalysisCoords.home.lng === homeCoords.lng &&
                     lastAnalysisCoords.work.lat === workCoords.lat &&
                     lastAnalysisCoords.work.lng === workCoords.lng;

      if (matches) {
        try {
          const file = await Filesystem.readFile({
            path: 'analyzed-camping-db.json',
            directory: Directory.Documents,
            encoding: Encoding.UTF8
          });
          data = JSON.parse(file.data as string);
        } catch (e) { console.warn('분석 데이터 읽기 실패', e); }
      }

      if (!data) {
        try {
          const file = await Filesystem.readFile({
            path: 'cached-camping-db.json',
            directory: Directory.Documents,
            encoding: Encoding.UTF8
          });
          data = JSON.parse(file.data as string);
        } catch (e) {
          // 로컬 캐시가 없을 시 번들된 기본 DB 로드
          const res = await fetch('./camping-db.json');
          data = await res.json();
        }
      }

      if (data && data.items) {
        setDbVersion(data.version);
        setCachedData(data.items);
        processItems(data.items);
        
        if (typeof window !== 'undefined' && navigator.onLine) {
          checkRemoteUpdate(data.version);
        }
      }
    } catch (err: any) {
      setError(`DB 로드 실패: ${err.message}`);
      showToast('데이터베이스를 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => { if (dbVersion) checkRemoteUpdate(dbVersion); };
    window.addEventListener('online', handleOnline);
    loadData();
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // 설정 변경 시 스토리지 저장
  useEffect(() => { localStorage.setItem('camping_dbVersion', dbVersion); }, [dbVersion]);
  useEffect(() => { localStorage.setItem('camping_isAutoUpdate', String(isAutoUpdate)); }, [isAutoUpdate]);
  useEffect(() => { localStorage.setItem('camping_targetCamps', JSON.stringify(targetCamps)); }, [targetCamps]);

  /**
   * 분석된 데이터베이스를 JSON 파일로 내보내기 (Documents 폴더)
   */
  const handleExportDB = async () => {
    try {
      if (!cachedData) return;
      const data = JSON.stringify({ version: dbVersion, items: cachedData }, null, 2);
      await Filesystem.writeFile({
        path: `camping-db-export-${dbVersion.replace(/[.: ]/g, '-')}.json`,
        data,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });
      showToast('DB 내보내기가 성공했습니다. (Documents 폴더 확인)', 'success');
    } catch (e) { showToast('DB 내보내기 중 오류가 발생했습니다.', 'error'); }
  };

  const handleImportDB = async () => {
    showToast('JSON 파일을 cached-camping-db.json으로 직접 교체해 주세요.', 'info');
  };

  /**
   * 모든 검색 조건 및 필터를 초기화
   */
  const handleResetFilters = () => {
    setSelDo('전체');
    setSelSigungu('전체');
    setSelTypes([]);
    setSelEnvs([]);
    setSelFacs([]);
    setSelTags([]);
    setDistLimit(240);
    setPriceLimit(200000);
    setSearchQuery('');
    showToast('검색 필터가 모두 초기화되었습니다.', 'info');
  };

  const handleEditMaxDist = () => {
    setEditingMaxField('dist');
    setTempMaxInput(distConfig.max.toString());
  };
  const handleSaveMaxDist = () => {
    const val = parseInt(tempMaxInput);
    if (!isNaN(val) && val > 0) setDistConfig(prev => ({ ...prev, max: val }));
    setEditingMaxField(null);
  };
  const handleEditMaxPrice = () => {
    setEditingMaxField('price');
    setTempMaxInput(priceConfig.max.toString());
  };
  const handleSaveMaxPrice = () => {
    const val = parseInt(tempMaxInput);
    if (!isNaN(val) && val > 0) setPriceConfig(prev => ({ ...prev, max: val }));
    setEditingMaxField(null);
  };

  return {
    cachedData, setCachedData,
    campgrounds, setCampgrounds,
    targetCamps, setTargetCamps,
    dbVersion, setDbVersion,
    isAutoUpdate, setIsAutoUpdate,
    loading, loadingStatus, error,
    totalFound,
    processItems,
    checkRemoteUpdate,
    updateRemoteDB,
    handleExportDB,
    handleImportDB,
    handleResetFilters,
    selDo, setSelDo,
    selSigungu, setSelSigungu,
    selEnvs, setSelEnvs,
    selTypes, setSelTypes,
    selFacs, setSelFacs,
    selTags, setSelTags,
    distLimit, setDistLimit,
    priceLimit, setPriceLimit,
    searchQuery, setSearchQuery,
    editingMaxField, setEditingMaxField,
    tempMaxInput, setTempMaxInput,
    distConfig, priceConfig,
    handleEditMaxDist, handleSaveMaxDist,
    handleEditMaxPrice, handleSaveMaxPrice
  };
};

export default useCampData;
