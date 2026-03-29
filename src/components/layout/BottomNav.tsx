import React from 'react';

interface BottomNavProps {
  isSimulator?: boolean;
  activeTab: 'search' | 'results' | 'favorites';
  setActiveTab: (tab: 'search' | 'results' | 'favorites') => void;
}

export const BottomNav = ({ isSimulator = false, activeTab, setActiveTab }: BottomNavProps) => (
  <nav className={`${isSimulator ? 'absolute' : 'fixed'} bottom-[64px] left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-outline-variant/10 z-[500] ${!isSimulator ? 'pb-[var(--safe-bottom,0px)]' : ''}`}>
    <div className="max-w-lg mx-auto flex h-16">
      {[
        { id: 'search', label: '검색', icon: 'search' },
        { id: 'results', label: '목록', icon: 'list' },
        { id: 'favorites', label: '찜', icon: 'favorite' }
      ].map(tab => (
        <button 
          key={tab.id} 
          onClick={() => setActiveTab(tab.id as any)} 
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all ${activeTab === tab.id ? 'text-primary' : 'text-on-surface-variant/40'}`}
        >
          <span className="material-symbols-outlined text-2xl" style={activeTab === tab.id ? { fontVariationSettings: "'FILL' 1" } : {}}>{tab.icon}</span>
          <span className="text-[10px] font-black uppercase tracking-tighter">{tab.label}</span>
        </button>
      ))}
    </div>
  </nav>
);

export default BottomNav;
