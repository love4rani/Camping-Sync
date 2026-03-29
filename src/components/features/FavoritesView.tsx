/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * [Feature] 찜한 캠핑장 목록 뷰
 */

import React from 'react';
import CampCard from './CampCard';
import Icon from '../common/Icon';
import { Campground } from '../../types';

interface FavoritesViewProps {
  cachedData: Campground[] | null;
  targetCamps: { name: string; url: string }[];
  toggleTargetCamp: (camp: any) => void;
}

/**
 * 사용자가 즐겨찾기(찜)한 캠핑장만 필터링하여 보여주는 뷰
 */
const FavoritesView = ({
  cachedData,
  targetCamps,
  toggleTargetCamp
}: FavoritesViewProps) => {
  // 캐시 데이터 중 targetCamps에 포함된 캠핑장만 추출
  const FavoriteItems = cachedData?.filter(i => targetCamps.some(t => t.name === i.nm)) || [];

  return (
    <div className="animate-in slide-in-from-bottom duration-300 space-y-4 pb-24">
      <h2 className="font-headline font-black text-2xl px-2">찜한 캠핑장</h2>
      
      {FavoriteItems.length === 0 ? (
        /* 찜한 목록이 없는 경우 표시되는 텅 빈 상태 UI */
        <div className="h-64 flex flex-col items-center justify-center text-on-surface-variant/30 space-y-2">
          <Icon name="favorite_border" size="text-6xl" />
          <p className="font-bold">찜한 캠핑장이 없습니다.</p>
          <span className="text-[11px]">가고 싶은 캠핑장에 하트를 눌러보세요!</span>
        </div>
      ) : (
        /* 찜한 캠핑장 리스트 */
        <div className="grid grid-cols-1 gap-6">
          {FavoriteItems.map((c, idx) => (
            <CampCard 
              key={c.id} 
              camp={c} 
              idx={idx} 
              targetCamps={targetCamps} 
              toggleTargetCamp={() => toggleTargetCamp(c)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesView;
