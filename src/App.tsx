/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Camping-Sync | [Main] 전역 UI 조립 및 탭 관리자
 */

import React, { useState, useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';

// --- 훅 (비즈니스 로직) ---
import { useCampData } from './hooks/useCampData';
import { useAnalysis } from './hooks/useAnalysis';

// --- 레이아웃 (고정 UI) ---
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import AdBanner from './components/layout/AdBanner';
import DeviceSimulator from './components/layout/DeviceSimulator';

// --- 피처 (서비스 핵심 기능) ---
import SearchFilter from './components/features/SearchFilter';
import ResultsView from './components/features/ResultsView';
import FavoritesView from './components/features/FavoritesView';
import SearchButtonBar from './components/features/SearchButtonBar';

// --- 모달 및 오버레이 ---
import SettingsModal from './components/modals/SettingsModal';
import AnalysisProgress from './components/modals/AnalysisProgress';

// --- 공통 및 원자 UI ---
import Toast from './components/common/Toast';

export default function App() {
  // --- [상태] 전역 서비스 제어 ---
  const [activeTab, setActiveTab] = useState<'search' | 'results' | 'favorites'>('search');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(() => localStorage.getItem('camping_isDebugMode') === 'true');
  const [deviceRatio, setDeviceRatio] = useState<'iphone' | 'pixel' | '916'>(() => (localStorage.getItem('camping_deviceRatio') as any) || '916');
  const [visibleLimit, setVisibleLimit] = useState(20);

  // --- [훅 연동] 분석 및 공통 상태 (좌표, 토스트, 시스템 작업) ---
  // 임시 데이터 상태를 분석 훅에 먼저 전달하여 분석 준비
  const [initialCachedData, setInitialCachedData] = useState<any[] | null>(null);
  
  const analysis = useAnalysis(initialCachedData, setInitialCachedData, '');
  const { 
    homeCoords, workCoords, lastAnalysisCoords, toast, showToast,
    tmpHomeUrl, setTmpHomeUrl, tmpWorkUrl, setTmpWorkUrl,
    handleApplyHome, handleApplyWork
  } = analysis;

  // 캠핑 데이터 및 필터 관리 훅
  const campData = useCampData({ homeCoords, workCoords, lastAnalysisCoords, showToast });
  const { cachedData, setCachedData, dbVersion } = campData;

  // 실제 데이터가 로드된 후 분석 훅의 데이터 레퍼런스 업데이트
  useEffect(() => {
    if (cachedData !== initialCachedData) setInitialCachedData(cachedData);
  }, [cachedData]);

  // --- [효과] 안드로이드 하드웨어 뒤로가기 버튼 대응 ---
  useEffect(() => {
    const backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (isSettingsOpen) setIsSettingsOpen(false); // 설정창 열려있으면 닫기
      else if (activeTab !== 'search') setActiveTab('search'); // 검색 탭 아니면 검색으로 이동
      else if (!canGoBack) CapApp.exitApp(); // 더 이상 뒤로갈 곳 없으면 앱 종료
    });
    return () => { backListener.then(l => l.remove()); };
  }, [isSettingsOpen, activeTab]);

  // --- [핸들러] 찜 목록 토글 ---
  const toggleTargetCamp = (camp: any) => {
    campData.setTargetCamps(prev => {
      const exists = prev.find(t => t.name === camp.nm);
      if (exists) return prev.filter(t => t.name !== camp.nm);
      return [...prev, { name: camp.nm, url: camp.url || '' }];
    });
  };

  const isAnalyzed = cachedData?.some(i => i.timeHome !== undefined) || false;

  return (
    <DeviceSimulator 
      isDebugMode={isDebugMode} deviceRatio={deviceRatio} setDeviceRatio={setDeviceRatio} 
      setIsDebugMode={setIsDebugMode} setIsSettingsOpen={setIsSettingsOpen} activeTab={activeTab}
      handleResetFilters={campData.handleResetFilters} setActiveTab={setActiveTab}
    >
      <div className="min-h-full bg-surface-container-low font-body text-on-surface text-[13px] relative">
        {/* 상단 헤더 (디버그 모드가 아닐 때만 표시) */}
        {!isDebugMode && <Header setIsSettingsOpen={setIsSettingsOpen} />}

        {/* [메인 컴포넌트 조립 영역] */}
        <main className={`px-4 pb-48 space-y-6 max-w-lg mx-auto relative ${isDebugMode ? '' : 'pt-[calc(4.2rem+var(--safe-top))]'}`}>
          {activeTab === 'search' && (
            <SearchFilter 
              {...campData}
              isAnalyzed={isAnalyzed}
              setIsSettingsOpen={setIsSettingsOpen}
            />
          )}

          {activeTab === 'results' && (
            <ResultsView 
              campgrounds={campData.campgrounds}
              totalFound={campData.totalFound}
              visibleLimit={visibleLimit}
              setVisibleLimit={setVisibleLimit}
              targetCamps={campData.targetCamps}
              toggleTargetCamp={toggleTargetCamp}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'favorites' && (
            <FavoritesView 
              cachedData={cachedData}
              targetCamps={campData.targetCamps}
              toggleTargetCamp={toggleTargetCamp}
            />
          )}
        </main>

        {/* 하단 고정 UI 요소 */}
        {!isDebugMode && (
          <>
            <div className="fixed bottom-[calc(132px+var(--safe-bottom,0px))] left-1/2 -translate-x-1/2 w-[92%] max-w-lg z-[100] pointer-events-none">
              <SearchButtonBar 
                isSearchTab={activeTab === 'search'} 
                handleResetFilters={campData.handleResetFilters} 
                setActiveTab={setActiveTab} 
              />
            </div>
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
            <AdBanner />
          </>
        )}
      </div>

      {/* 전역 설정 모달 */}
      <SettingsModal 
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        homeCoords={homeCoords} workCoords={workCoords}
        tmpHomeUrl={tmpHomeUrl} setTmpHomeUrl={setTmpHomeUrl}
        tmpWorkUrl={tmpWorkUrl} setTmpWorkUrl={setTmpWorkUrl}
        onApplyHome={handleApplyHome} onApplyWork={handleApplyWork}
        runFullAnalysis={analysis.runFullAnalysis}
        dbVersion={dbVersion} isAutoUpdate={campData.isAutoUpdate}
        setIsAutoUpdate={campData.setIsAutoUpdate}
        onCheckUpdate={() => campData.checkRemoteUpdate(dbVersion, true)}
        handleExportDB={campData.handleExportDB} handleImportDB={campData.handleImportDB}
        isDebugMode={isDebugMode} setIsDebugMode={setIsDebugMode}
      />

      {/* 분석 진행 현황 오버레이 */}
      <AnalysisProgress 
        isActive={analysis.isSystemTaskActive}
        status={analysis.systemTaskStatus}
        progress={analysis.systemTaskProgress}
        isComplete={analysis.isSystemTaskComplete}
      />

      {/* 전역 토스트 메시지 */}
      <Toast toast={toast} />
    </DeviceSimulator>
  );
}
