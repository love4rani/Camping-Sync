import React from 'react';

export const AdBanner = ({ isSimulator = false }: { isSimulator?: boolean }) => (
  <div className={`${isSimulator ? 'absolute' : 'fixed'} bottom-0 left-0 right-0 z-[600] bg-white border-t border-outline-variant/10 pb-[var(--safe-bottom,0px)] pointer-events-auto shadow-[0_-10px_30px_rgba(0,0,0,0.1)]`}>
    <div className="max-w-lg mx-auto h-[64px] flex items-center justify-center px-4">
      <div className="w-full bg-surface-container-low rounded-2xl vibe-gradient border border-black/5 shadow-sm px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-lg">campaign</span>
          </div>
          <span className="font-headline font-black text-[11px] text-white tracking-tight italic">채서나라 - 프리미엄 캠핑의 시작</span>
        </div>
        <button className="bg-white/20 text-white text-[9px] font-black px-3 py-1.5 rounded-lg border border-white/30 uppercase tracking-widest active:scale-95 transition-all">더보기</button>
      </div>
    </div>
  </div>
);

export default AdBanner;
