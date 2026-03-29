import React from 'react';
import Icon from '../common/Icon';

interface AnalysisProgressProps {
  isActive: boolean;
  status: string;
  progress: number;
  isComplete: boolean;
}

export const AnalysisProgress = ({ isActive, status, progress, isComplete }: AnalysisProgressProps) => {
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-6 border border-white/50 overflow-hidden">
        {/* Animated Background Pulse */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-surface-container-highest">
          <div 
            className="h-full vibe-gradient transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg transition-all duration-500 ${isComplete ? 'bg-emerald-500 rotate-[360deg]' : 'bg-primary animate-pulse'}`}>
            <Icon name={isComplete ? 'check_circle' : 'analytics'} size="text-3xl" className="text-white" />
          </div>
          
          <div className="space-y-1">
            <h3 className="font-headline font-black text-xl text-on-surface italic">
              {isComplete ? '분석 완료!' : '경로 분석 중...'}
            </h3>
            <p className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">
              {status}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end px-1">
            <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Progress</span>
            <span className="font-headline font-black text-2xl text-primary leading-none">{progress}%</span>
          </div>
          <div className="h-4 bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/10 p-1">
            <div 
              className="h-full rounded-full vibe-gradient shadow-sm transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className="text-[10px] text-center text-on-surface-variant font-medium leading-relaxed opacity-40">
          OSRM 엔진을 사용하여 각 캠핑장까지의<br />
          실제 도로 주행 거리와 소요 시간을 계산하고 있습니다.
        </p>
      </div>
    </div>
  );
};

export default AnalysisProgress;
