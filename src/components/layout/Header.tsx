import React from 'react';
import Icon from '../common/Icon';

interface HeaderProps {
  setIsSettingsOpen: (open: boolean) => void;
  title?: string;
}

export const Header = ({ setIsSettingsOpen, title = 'CAM-MUNG' }: HeaderProps) => (
  <header className="absolute top-0 left-0 right-0 h-[calc(3.2rem+var(--safe-top))] bg-white border-b border-outline-variant/10 px-6 pt-[calc(0.4rem+var(--safe-top))] pb-2 shadow-sm z-[800] flex items-center justify-between">
    <div className="max-w-lg mx-auto w-full flex justify-between items-center h-12">
      <div className="flex flex-col">
        <h1 className="font-headline font-black text-xl tracking-tighter text-primary italic leading-none">
          {title} <span className="text-sm font-medium text-primary/70 not-italic">캠멍</span>
        </h1>
        <span className="text-[8px] font-black text-on-surface-variant/30 tracking-[0.2em] uppercase mt-0.5 ml-0.5">Camping & Relax</span>
      </div>
      <button 
        onClick={() => setIsSettingsOpen(true)} 
        className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-highest/50 active:scale-95 transition-all"
      >
        <Icon name="settings" size="text-lg" />
      </button>
    </div>
  </header>
);

export default Header;
