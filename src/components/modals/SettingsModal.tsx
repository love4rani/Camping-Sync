import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../common/Icon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  homeCoords: { lat: number, lng: number };
  workCoords: { lat: number, lng: number };
  tmpHomeUrl: string;
  setTmpHomeUrl: (v: string) => void;
  tmpWorkUrl: string;
  setTmpWorkUrl: (v: string) => void;
  onApplyHome: () => void;
  onApplyWork: () => void;
  runFullAnalysis: () => void;
  dbVersion: string;
  isAutoUpdate: boolean;
  setIsAutoUpdate: (v: boolean) => void;
  onCheckUpdate: () => void;
  handleExportDB: () => void;
  handleImportDB: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDebugMode: boolean;
  setIsDebugMode: (v: boolean) => void;
}

export const SettingsModal = ({
  isOpen, onClose,
  homeCoords, workCoords,
  tmpHomeUrl, setTmpHomeUrl,
  tmpWorkUrl, setTmpWorkUrl,
  onApplyHome, onApplyWork,
  runFullAnalysis,
  dbVersion, isAutoUpdate, setIsAutoUpdate, onCheckUpdate,
  handleExportDB, handleImportDB,
  isDebugMode, setIsDebugMode
}: SettingsModalProps) => {

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed top-[calc(3.8rem+var(--safe-top))] bottom-[64px] left-0 right-0 z-[500] flex flex-col bg-surface-container-low/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/40" 
          />
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 50, opacity: 0 }} 
            className="relative bg-surface-container-lowest w-full h-full shadow-2xl overflow-hidden flex flex-col border-t border-white/10"
          >
            {/* Header */}
            <div className="px-8 pt-6 pb-4 flex justify-between items-center border-b border-outline-variant/5 shadow-sm bg-white">
              <h2 className="font-headline font-black text-xl text-primary leading-none">시스템 설정</h2>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center active:scale-90 transition-all">
                <Icon name="close" size="text-lg" />
              </button>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto no-scrollbar pb-24">
              {/* Analysis Banner */}
              <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 flex flex-col items-center gap-4 text-center">
                <div className="w-14 h-14 rounded-2xl vibe-gradient flex items-center justify-center text-white shadow-lg">
                  <Icon name="analytics" size="text-3xl" />
                </div>
                <div>
                  <h4 className="font-black text-primary uppercase text-[10px] tracking-[0.2em] mb-1 leading-none">Global Analysis</h4>
                  <p className="font-headline font-black text-lg leading-tight mb-2">전국 경로 전수 분석</p>
                  <p className="text-on-surface-variant/60 text-[10px] font-medium leading-relaxed">집과 회사로부터 모든 캠핑장까지의<br />실제 주행 시간을 계산합니다.</p>
                </div>
                <button onClick={runFullAnalysis} className="w-full h-14 rounded-2xl bg-primary text-white font-headline font-black shadow-lg shadow-primary/20 active:scale-95 transition-all">분석 시작하기</button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Guide */}
                <div className="bg-primary/5 rounded-[2rem] p-5 border border-primary/10 mb-2">
                  <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-3 flex items-center gap-1.5 leading-none">
                    <Icon name="help" size="text-sm" /> 좌표 복사 가이드
                  </p>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                       <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center font-black text-[10px] text-primary shrink-0">1</div>
                       <p className="text-[11px] font-bold text-on-surface-variant leading-relaxed">
                         <span className="text-primary">모바일:</span> 아이콘 없는 **빈 지도를 1초간 길게** 누른 후, 하단 '고정된 핀' 창을 올려 **좌표 숫자**를 터치해 복사하세요.
                       </p>
                    </div>
                    <div className="flex gap-3">
                       <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center font-black text-[10px] text-primary shrink-0">2</div>
                       <p className="text-[11px] font-bold text-on-surface-variant leading-relaxed">
                         <span className="text-secondary">PC:</span> 주소창의 **전체 URL**을 그대로 복사해서 붙여넣으세요.
                       </p>
                    </div>
                    <div className="p-3 bg-error/5 rounded-xl border border-error/10">
                       <p className="text-[10px] font-black text-error/80 flex items-center gap-1.5 leading-none">
                         <Icon name="warning" className="text-[14px]" />
                         단축 주소(maps.app.goo.gl)는 사용 불가
                       </p>
                    </div>
                  </div>
                </div>

                {/* Home */}
                <div className="bg-white border border-outline-variant/10 rounded-[2rem] p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">H</div>
                       <h4 className="font-headline font-black text-sm text-on-surface">집 주소 설정</h4>
                     </div>
                     <div className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/5 rounded-md uppercase tracking-tighter">
                       {homeCoords.lat.toFixed(4)}, {homeCoords.lng.toFixed(4)}
                     </div>
                  </div>
                  <div className="space-y-2">
                     <input 
                      value={tmpHomeUrl} 
                      onChange={e => setTmpHomeUrl(e.target.value)} 
                      placeholder="URL 또는 좌표 (예: 37.123, 127.123)" 
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-[11px] font-medium placeholder:text-on-surface-variant/30 outline-none focus:border-primary transition-all" 
                     />
                     <div className="flex gap-2">
                       <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" className="flex-[1.5] py-3 rounded-xl bg-surface-container text-on-surface-variant/60 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1 active:bg-surface-container-high transition-all">구글 지도 열기 <Icon name="open_in_new" size="text-sm" /></a>
                       <button onClick={onApplyHome} className="flex-1 vibe-gradient text-white rounded-xl font-black text-[11px] py-3 shadow-lg shadow-primary/10 transition-all active:scale-95">설정 적용</button>
                     </div>
                  </div>
                </div>

                {/* Work */}
                <div className="bg-white border border-outline-variant/10 rounded-[2rem] p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-black text-xs">W</div>
                       <h4 className="font-headline font-black text-sm text-on-surface">회사 주소 설정</h4>
                     </div>
                     <div className="text-[10px] font-bold text-secondary px-2 py-0.5 bg-secondary/5 rounded-md uppercase tracking-tighter">
                       {workCoords.lat.toFixed(4)}, {workCoords.lng.toFixed(4)}
                     </div>
                  </div>
                  <div className="space-y-2">
                     <input 
                      value={tmpWorkUrl} 
                      onChange={e => setTmpWorkUrl(e.target.value)} 
                      placeholder="URL 또는 좌표 (예: 37.123, 127.123)" 
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-[11px] font-medium placeholder:text-on-surface-variant/30 outline-none focus:border-secondary transition-all" 
                     />
                     <div className="flex gap-2">
                       <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" className="flex-[1.5] py-3 rounded-xl bg-surface-container text-on-surface-variant/60 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1 active:bg-surface-container-high transition-all">구글 지도 열기 <Icon name="open_in_new" size="text-sm" /></a>
                       <button onClick={onApplyWork} className="flex-1 vibe-gradient text-white rounded-xl font-black text-[11px] py-3 shadow-lg shadow-secondary/10 transition-all active:scale-95">설정 적용</button>
                     </div>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="bg-surface-container rounded-[2rem] p-6 space-y-6">
                 <div className="flex justify-between items-center px-1">
                  <p className="text-[10px] font-black uppercase text-on-surface-variant/40 tracking-widest">데이터 관리</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                      <Icon name="sync" className="text-[10px] text-amber-600" />
                      <span className="text-[9px] font-black text-amber-700 uppercase">Auto</span>
                      <button 
                        onClick={() => setIsAutoUpdate(!isAutoUpdate)}
                        className={`w-7 h-3.5 rounded-full relative transition-all duration-300 ${isAutoUpdate ? 'bg-amber-500' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all duration-300 ${isAutoUpdate ? 'left-4' : 'left-0.5'}`} />
                      </button>
                    </div>
                    <button 
                      onClick={onCheckUpdate}
                      className="bg-primary text-white hover:shadow-md transition-all cursor-pointer text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm active:scale-95"
                    >
                      DB {dbVersion}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-primary/5 rounded-2xl p-4 border border-primary/5">
                     <p className="text-[10px] font-black text-primary/60 mb-2 flex items-center gap-1.5 leading-none tracking-tight">
                       <Icon name="info" size="text-sm" />
                       가져오기 경로: <span className="bg-white/50 px-1.5 py-0.5 rounded border border-primary/10">내 파일 {'>'} 문서 {'>'} camp_sync</span>
                     </p>
                     <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleExportDB} className="py-4 rounded-2xl bg-white border border-outline-variant/30 text-on-surface-variant font-black text-[11px] flex flex-col items-center gap-2 shadow-sm active:bg-surface-container-low transition-all">
                          <Icon name="download" />내보내기
                        </button>
                        <label className="py-4 rounded-2xl bg-white border border-outline-variant/30 text-on-surface-variant font-black text-[11px] flex flex-col items-center gap-2 shadow-sm cursor-pointer active:bg-surface-container-low transition-all">
                          <Icon name="upload" />가져오기
                          <input type="file" hidden onChange={handleImportDB} />
                        </label>
                     </div>
                  </div>
                </div>
              </div>

              {/* Debug Settings */}
              {!(import.meta as any).env?.PROD && (
                <div className="bg-surface-container rounded-3xl p-5 space-y-3">
                  <p className="text-[10px] font-black uppercase text-on-surface-variant/40 tracking-widest flex items-center gap-2">
                    <Icon name="devices" size="text-sm" /> 디버그 모드
                  </p>
                  <button onClick={() => setIsDebugMode(!isDebugMode)} className={`w-full py-3 rounded-2xl font-black text-xs transition-all ${isDebugMode ? 'bg-error text-white' : 'bg-surface-container-high text-on-surface-variant/60'}`}>
                    {isDebugMode ? '종료' : '활성화'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
