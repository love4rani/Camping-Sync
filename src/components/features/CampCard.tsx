import React from 'react';
import { Campground } from '../../types';
import Icon from '../common/Icon';

interface CampCardProps {
  camp: Campground;
  idx: number; // For animation delay or similar
  targetCamps: { name: string; url: string }[];
  toggleTargetCamp: (camp: Campground, url: string) => void;
}

export const CampCard = React.memo(({ camp, targetCamps, toggleTargetCamp }: CampCardProps) => {
  const isTargeted = targetCamps.some(t => t.name === camp.nm);
  const naverUrl = `https://map.naver.com/v5/search/${encodeURIComponent(camp.nm)}`;
  
  let resveUrl = camp.resve || '';
  const m = resveUrl.match(/(https?:\/\/[^\s,]+)/g);
  if (m?.length) resveUrl = m[0];

  const isRealResve = resveUrl && resveUrl.startsWith('http') &&
    !resveUrl.includes('naver.com') &&
    !resveUrl.includes('kakao.com');

  const getBookingLabel = () => {
    if (!resveUrl) return '정보없음';
    const lowUrl = resveUrl.toLowerCase();
    const lowFac = (camp.fac || '').toLowerCase();
    if (lowUrl.includes('campfit.co.kr') || lowFac.includes('캠핏')) return '캠핏';
    if (lowUrl.includes('naver.com')) return '네이버';
    if (lowUrl.includes('interpark.com')) return '인터파크';
    if (lowUrl.includes('thankqcamping.com') || lowFac.includes('땡큐')) return '땡큐캠핑';
    if (lowUrl.includes('camlink.co.kr')) return '캠링크';
    if (isRealResve) return '전용사이트';
    return '문의필요';
  };

  const clickUrl = resveUrl || naverUrl;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-outline-variant/10 active:scale-[0.98] transition-all group">
      <div className="relative aspect-[16/10] bg-surface-container-highest overflow-hidden">
        {camp.img ? (
          <img src={camp.img} alt={camp.nm} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/20 gap-2">
            <Icon name="image_not_supported" size="text-4xl" />
            <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); toggleTargetCamp(camp, clickUrl); }}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md transition-all shadow-lg ${isTargeted ? 'bg-primary text-white scale-110' : 'bg-white/80 text-on-surface-variant hover:bg-white'}`}
          >
            <Icon name={isTargeted ? 'favorite' : 'favorite_border'} size="text-xl" fill={isTargeted} />
          </button>
        </div>
        
        {/* Distance Badges */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2">
          {camp.timeHome !== undefined && camp.timeHome > 0 && (
            <div className="flex-1 bg-white/90 backdrop-blur-md rounded-xl p-2 flex items-center gap-2 border border-white shadow-lg">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Icon name="home" size="text-[10px]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-emerald-600/50 uppercase leading-none">HOME</span>
                <span className="text-[11px] font-black text-emerald-700 leading-tight">{camp.timeHome}분</span>
              </div>
            </div>
          )}
          {camp.timeWork !== undefined && camp.timeWork > 0 && (
            <div className="flex-1 bg-white/90 backdrop-blur-md rounded-xl p-2 flex items-center gap-2 border border-white shadow-lg">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Icon name="work" size="text-[10px]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-blue-600/50 uppercase leading-none">WORK</span>
                <span className="text-[11px] font-black text-blue-700 leading-tight">{camp.timeWork}분</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-[9px] font-black tracking-tight uppercase">{camp.do} {camp.sigungu}</span>
            {camp.type && <span className="text-[9px] font-bold text-on-surface-variant/40 tracking-tighter">{camp.type}</span>}
          </div>
          <h3 className="font-headline font-black text-lg text-on-surface leading-tight group-hover:text-primary transition-colors line-clamp-1">{camp.nm}</h3>
          <p className="text-[11px] text-on-surface-variant font-medium mt-1 line-clamp-1 opacity-60 leading-relaxed">{camp.addr}</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10 gap-2">
          <div className="flex flex-col shrink-0">
            <span className="text-[9px] font-black text-on-surface-variant/30 uppercase tracking-widest leading-none">Price From</span>
            <span className="font-headline font-black text-secondary text-base italic">{camp.price ? `${camp.price.toLocaleString()}원` : '정보없음'}</span>
          </div>
          
          <div className="flex gap-2 flex-grow justify-end">
            <a href={naverUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-xl bg-surface-container text-primary text-[11px] font-black shadow-sm hover:shadow-md transition-all flex items-center gap-2 border border-primary/5">
              지도 <Icon name="map" size="text-sm" />
            </a>
            
            {isRealResve ? (
              <a href={resveUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-xl vibe-gradient text-white text-[11px] font-black shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2">
                {getBookingLabel()} <Icon name="open_in_new" size="text-sm" />
              </a>
            ) : (
              <div className="px-4 py-2.5 rounded-xl bg-surface-container/50 text-on-surface-variant/30 text-[11px] font-black border border-outline-variant/10 flex items-center gap-2 cursor-not-allowed">
                {getBookingLabel()} <Icon name="event_busy" size="text-sm" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default CampCard;
