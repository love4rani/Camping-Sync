import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import AdBanner from './AdBanner';
import SearchButtonBar from '../features/SearchButtonBar';

interface DeviceSimulatorProps {
  isDebugMode: boolean;
  deviceRatio: 'iphone' | 'pixel' | '916';
  setDeviceRatio: (r: 'iphone' | 'pixel' | '916') => void;
  setIsDebugMode: (v: boolean) => void;
  setIsSettingsOpen: (v: boolean) => void;
  activeTab: 'search' | 'results' | 'favorites';
  handleResetFilters: () => void;
  setActiveTab: (tab: 'search' | 'results' | 'favorites') => void;
  children: React.ReactNode;
}

export const DeviceSimulator = ({ 
  isDebugMode, 
  deviceRatio, 
  setDeviceRatio, 
  setIsDebugMode, 
  setIsSettingsOpen, 
  activeTab, 
  handleResetFilters, 
  setActiveTab, 
  children 
}: DeviceSimulatorProps) => {
  if (!isDebugMode) return <>{children}</>;

  const ratios = {
    iphone: { w: 390, h: 844, name: 'iPhone 14' },
    pixel: { w: 412, h: 915, name: 'Pixel 7' },
    916: { w: 450, h: 800, name: '표준 (9:16)' }
  };
  
  const current = ratios[deviceRatio as keyof typeof ratios];

  return (
    <div className="fixed inset-0 bg-neutral-900 flex items-center justify-center p-8 overflow-hidden z-[9999]">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 shadow-2xl">
        {(Object.keys(ratios) as Array<keyof typeof ratios>).map(r => (
          <button 
            key={r} 
            onClick={() => setDeviceRatio(r as 'iphone'|'pixel'|'916')} 
            className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full transition-all ${deviceRatio === r ? 'bg-primary text-white' : 'text-white/40 hover:text-white/60'}`}
          >
            {ratios[r].name}
          </button>
        ))}
        <button 
          onClick={() => setIsDebugMode(false)} 
          className="text-[10px] font-black text-error uppercase tracking-widest px-4 py-1.5 rounded-full hover:bg-error/10 transition-all ml-4"
        >
          종료
        </button>
      </div>

      <div className="relative shadow-[0_0_100px_rgba(0,0,0,0.5)] border-[12px] border-neutral-800 rounded-[3.5rem] overflow-hidden bg-white" style={{ width: current.w, height: current.h }}>
        <div className="w-full h-full overflow-hidden relative bg-white">
          <Header setIsSettingsOpen={setIsSettingsOpen} />

          <div className="w-full h-full overflow-y-auto no-scrollbar overflow-x-hidden pt-[calc(4.2rem+var(--safe-top))] pb-48">
            {children}
          </div>

          <div className="absolute bottom-[64px] left-0 right-0 h-[160px] bg-white z-[90] pointer-events-none shadow-[0_-30px_60px_rgba(0,0,0,0.08)]" />
          
          <div className="absolute bottom-[calc(140px+var(--safe-bottom,0px))] left-1/2 -translate-x-1/2 w-[92%] max-w-lg z-[100] pointer-events-none">
            <SearchButtonBar 
              isSearchTab={activeTab === 'search'} 
              handleResetFilters={handleResetFilters} 
              setActiveTab={setActiveTab} 
            />
          </div>
        </div>
        <BottomNav isSimulator={true} activeTab={activeTab} setActiveTab={setActiveTab} />
        <AdBanner isSimulator={true} />
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-neutral-300 rounded-full z-[600]" />
      </div>
    </div>
  );
};

export default DeviceSimulator;
