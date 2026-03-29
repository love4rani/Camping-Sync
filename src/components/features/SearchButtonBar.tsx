import React from 'react';
import Icon from '../common/Icon';

interface SearchButtonBarProps {
  isSearchTab: boolean;
  handleResetFilters: () => void;
  setActiveTab: (tab: 'search' | 'results' | 'favorites') => void;
}

export const SearchButtonBar = ({ isSearchTab, handleResetFilters, setActiveTab }: SearchButtonBarProps) => {
  if (!isSearchTab) return null;
  
  return (
    <div className="flex gap-4 bg-white/70 backdrop-blur-3xl p-1.5 rounded-[2rem] border border-white/50 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] pointer-events-auto">
      <button 
        onClick={handleResetFilters} 
        className="w-14 h-10 rounded-[1.2rem] bg-white border border-outline-variant/20 flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-all shadow-sm"
      >
        <Icon name="refresh" className="text-on-surface-variant/40" size="text-lg" />
        <span className="text-[8px] font-black text-on-surface-variant/40 uppercase leading-none">초기화</span>
      </button>
      <button 
        onClick={() => setActiveTab('results')} 
        className="flex-1 vibe-gradient text-white font-headline font-black rounded-[1.2rem] shadow-xl flex flex-col items-center justify-center active:scale-[0.98] transition-all h-10"
      >
        <div className="flex items-center gap-2 leading-tight">
          <Icon name="travel_explore" size="text-xl" />
          <span className="text-lg">캠핑장 찾기</span>
        </div>
      </button>
    </div>
  );
};

export default SearchButtonBar;
