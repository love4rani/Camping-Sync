/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * [Feature] 검색 결과 리스트 뷰
 */

import React from 'react';
import CampCard from './CampCard';
import Icon from '../common/Icon';
import { Campground } from '../../types';

interface ResultsViewProps {
  campgrounds: Campground[];
  totalFound: number | null;
  visibleLimit: number;
  setVisibleLimit: React.Dispatch<React.SetStateAction<number>>;
  targetCamps: { name: string; url: string }[];
  toggleTargetCamp: (camp: any) => void;
  setActiveTab: (tab: 'search' | 'results' | 'favorites') => void;
}

/**
 * 필터링된 캠핑장 결과 목록을 보여주는 컴포넌트
 */
const ResultsView = ({
  campgrounds,
  totalFound,
  visibleLimit,
  setVisibleLimit,
  targetCamps,
  toggleTargetCamp,
  setActiveTab
}: ResultsViewProps) => {
  return (
    <div className="animate-in slide-in-from-right duration-300 space-y-4 pb-24">
      {/* 상단 요약 정보 및 필터 수정 버튼 */}
      <div className="flex justify-between items-center px-2">
        <button 
          onClick={() => setActiveTab('search')} 
          className="flex items-center gap-1 text-on-surface-variant font-bold active:opacity-50 transition-opacity"
        >
          <Icon name="arrow_back" /> 필터 수정
        </button>
        <span className="font-black text-primary uppercase tracking-widest text-[10px]">
          총 {totalFound?.toLocaleString()}개 발견
        </span>
      </div>
      
      {/* 캠핑장 카드 리스트 (그리드) */}
      <div className="grid grid-cols-1 gap-6">
        {campgrounds.slice(0, visibleLimit).map((c, idx) => (
          <CampCard 
            key={c.id} 
            camp={c} 
            idx={idx} 
            targetCamps={targetCamps} 
            toggleTargetCamp={() => toggleTargetCamp(c)} 
          />
        ))}
      </div>

      {/* 더 보기 버튼 (전체 결과가 표시 제한보다 많을 때만 표시) */}
      {totalFound !== null && totalFound > visibleLimit && (
        <div className="flex justify-center pt-8 pb-12">
          <button 
            onClick={() => setVisibleLimit(prev => prev + 20)} 
            className="vibe-gradient text-white px-10 py-5 rounded-[2rem] font-headline font-black text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center gap-3"
          >
            <Icon name="add_circle" fill />
            더 많은 캠핑장 보기 ({Math.min(visibleLimit + 20, totalFound).toLocaleString()} / {totalFound.toLocaleString()})
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultsView;
