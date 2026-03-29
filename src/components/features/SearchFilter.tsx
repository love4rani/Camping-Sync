/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * [Feature] 캠핑장 검색 및 상세 필터 제어
 */

import React from 'react';
import { Range, getTrackBackground, Direction } from 'react-range';
import Icon from '../common/Icon';
import { Campground } from '../../types';

interface SearchFilterProps {
  cachedData: Campground[] | null;
  selDo: string;
  setSelDo: (v: string) => void;
  selSigungu: string;
  setSelSigungu: (v: string) => void;
  selEnvs: string[];
  setSelEnvs: (v: string[]) => void;
  selTypes: string[];
  setSelTypes: (v: string[]) => void;
  selFacs: string[];
  setSelFacs: (v: string[]) => void;
  selTags: string[];
  setSelTags: (v: string[]) => void;
  distLimit: number;
  setDistLimit: (v: number) => void;
  distConfig: { min: number, max: number };
  priceLimit: number;
  setPriceLimit: (v: number) => void;
  priceConfig: { min: number, max: number };
  isAnalyzed: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  editingMaxField: 'dist' | 'price' | null;
  tempMaxInput: string;
  setTempMaxInput: (v: string) => void;
  handleEditMaxDist: () => void;
  handleSaveMaxDist: () => void;
  handleEditMaxPrice: () => void;
  handleSaveMaxPrice: () => void;
  setIsSettingsOpen: (v: boolean) => void;
  totalFound: number | null;
}

/**
 * 전국 지역, 거리, 가격, 시설 및 테마 필터를 통합 관리하는 대시보드
 */
const SearchFilter = ({
  cachedData,
  selDo, setSelDo,
  selFacs, setSelFacs,
  selTags, setSelTags,
  distLimit, setDistLimit, distConfig,
  priceLimit, setPriceLimit, priceConfig,
  isAnalyzed,
  searchQuery, setSearchQuery,
  editingMaxField,
  tempMaxInput, setTempMaxInput,
  handleEditMaxDist, handleSaveMaxDist,
  handleEditMaxPrice, handleSaveMaxPrice,
  setIsSettingsOpen,
  totalFound
}: SearchFilterProps) => {

  const facOptions = ["전기", "무선인터넷", "장작판매", "온수", "트램펄린", "물놀이장", "놀이터", "산책로", "운동시설", "운동장"];
  const tagOptions = ["#차박", "#반려동물", "#트레일러", "#캠핑카", "#가족", "#커플", "#솔캠", "#바베큐"];

  const toggleList = (list: string[], item: string, setter: (v: string[]) => void) => {
    if (list.includes(item)) setter(list.filter(i => i !== item));
    else setter([...list, item]);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* 🔍 통합 검색창 및 실시간 검색 결과 요약 */}
      <section className="space-y-5">
        <div className="flex justify-between items-end px-1">
          <label className="flex items-center gap-2 font-headline font-black text-xs tracking-widest uppercase text-on-surface-variant opacity-40">
            <Icon name="search" size="text-sm" /> 무엇을 찾으세요?
          </label>
          <span className="font-black text-primary text-[10px] uppercase tracking-tighter bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
             총 {cachedData?.length.toLocaleString()}개 중 {totalFound?.toLocaleString()}개 발견
          </span>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-on-surface-variant/40 group-focus-within:text-primary transition-colors">
            <Icon name="search" size="text-xl" />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="캠핑장 이름, 주소, 지역명으로 검색"
            className="w-full bg-surface-container-highest/50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-[2rem] py-5 pl-14 pr-6 font-headline font-black text-sm outline-none shadow-sm transition-all placeholder:text-on-surface-variant/30"
          />
        </div>
      </section>

      {/* 지역 필터 (도 단위) */}
      <section className="space-y-6">
        <label className="flex items-center gap-2 font-headline font-black text-xs tracking-widest uppercase text-on-surface-variant opacity-40">
          <Icon name="location_on" size="text-sm" /> 지역 선택
        </label>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mask-linear-right">
          {["전체", "강원", "경기", "경남", "경북", "광주", "대구", "대전", "부산", "서울", "세종", "울산", "인천", "전남", "전북", "제주", "충남", "충북"].map(d => (
            <button key={d} onClick={() => { setSelDo(d); }} 
              className={`flex-shrink-0 px-6 py-3.5 rounded-2xl font-black transition-all transform active:scale-90 ${selDo === d ? 'vibe-gradient text-white shadow-lg shadow-primary/20 scale-105' : 'bg-surface-container-highest text-on-surface-variant hover:bg-primary/5'}`}>
              {d}
            </button>
          ))}
        </div>
      </section>

      {/* 거리/시간 슬라이더 세션 */}
      <section className="space-y-6 bg-white/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/50 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
        
        <div className="flex justify-between items-center relative z-10">
          <label className="flex items-center gap-2 font-headline font-black text-xs tracking-widest uppercase text-on-surface-variant opacity-40">
            <Icon name="route" size="text-sm" fill={isAnalyzed} /> 집에서의 거리 (시간)
          </label>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-black/5 rounded-full transition-colors active:scale-90 text-on-surface-variant/40">
              <Icon name="settings" size="text-sm" />
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-4">
           {/* 거리 현재 설정값 표시 */}
           <div className="flex justify-between items-end">
             <div className="space-y-0.5">
               <label className="block font-label font-black text-[9px] tracking-widest uppercase text-on-surface-variant opacity-30 leading-none">현재 설정</label>
               <span className="font-headline font-black text-primary text-xl leading-none">{Math.floor(distLimit / 60)}시간 {distLimit % 60}분</span>
             </div>
             <div className="flex flex-col items-end gap-0.5">
               <label className="block font-label font-black text-[9px] tracking-widest uppercase text-on-surface-variant opacity-30 leading-none text-right">MAX 설정</label>
               {editingMaxField === 'dist' ? (
                 <input autoFocus type="number" value={tempMaxInput} onChange={e => setTempMaxInput(e.target.value)} onBlur={handleSaveMaxDist} onKeyDown={e => e.key === 'Enter' && handleSaveMaxDist()}
                   className="w-20 bg-surface-container-highest border border-primary/30 rounded-lg px-2 py-1 font-headline font-black text-xs text-primary text-right outline-none shadow-sm focus:border-primary" />
               ) : (
                 <button onClick={handleEditMaxDist} className="font-headline font-black text-on-surface-variant/40 text-xs leading-none hover:text-primary transition-all">{distConfig.max}분</button>
               )}
             </div>
           </div>

           {/* 거리 슬라이더 본체 */}
           <div className="px-2 pb-2 mt-4 relative">
             {!isAnalyzed && (
               /* 분석 전 표시되는 안내 오버레이 (잠금 기능 유지) */
               <div className="absolute inset-x-0 -bottom-4 z-20 flex justify-center pointer-events-none">
                 <p className="text-[10px] font-black text-amber-700/60 bg-white/80 px-4 py-2 rounded-full shadow-sm border border-black/5">집 주소를 설정하고 분석을 완료해 주세요</p>
               </div>
             )}
             
             <Range 
               step={1} min={distConfig.min} max={distConfig.max} values={[distLimit]} onChange={v => setDistLimit(v[0])}
               disabled={!isAnalyzed}
               direction={Direction.Right}
               rtl={false}
               allowOverlap={false}
               draggableTrack={false}
               label="거리 필터 슬라이더"
               labelledBy="distance-slider"
               renderTrack={({ props, children }) => (
                 <div onMouseDown={props.onMouseDown} onTouchStart={props.onTouchStart} style={{ ...props.style, height: '44px', display: 'flex', width: '100%' }}>
                   <div ref={props.ref} style={{ height: '10px', width: '100%', borderRadius: '5px', background: getTrackBackground({ values: [distLimit], colors: ['#007439', '#ece9d4'], min: distConfig.min, max: distConfig.max }), alignSelf: 'center' }}>{children}</div>
                 </div>
               )}
               renderThumb={({ props, isDragged }) => {
                 const { key, ...thumbProps } = props;
                 return (
                   <div {...thumbProps} key={key} style={{ ...thumbProps.style, height: '36px', width: '36px', borderRadius: '12px', backgroundColor: '#fff', border: '5px solid #007439', boxShadow: isDragged ? '0 10px 20px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.15)', outline: 'none', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <div className="flex gap-[3px]">
                       {[1, 2, 3].map(i => <div key={i} className="w-[3px] h-3 bg-primary/20 rounded-full" />)}
                     </div>
                   </div>
                 );
               }}
             />
           </div>
         </div>

        {/* 가격 슬라이더 세션 */}
        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-end">
            <div className="space-y-0.5">
              <label className="block font-label font-black text-[9px] tracking-widest uppercase text-on-surface-variant opacity-30 leading-none">현재 설정</label>
              <span className="font-headline font-black text-secondary text-xl leading-none">{priceLimit.toLocaleString()}원</span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <label className="block font-label font-black text-[9px] tracking-widest uppercase text-on-surface-variant opacity-30 leading-none text-right">MAX 설정</label>
              {editingMaxField === 'price' ? (
                <input autoFocus type="number" value={tempMaxInput} onChange={e => setTempMaxInput(e.target.value)} onBlur={handleSaveMaxPrice} onKeyDown={e => e.key === 'Enter' && handleSaveMaxPrice()}
                  className="w-20 bg-surface-container-highest border border-secondary/30 rounded-lg px-2 py-1 font-headline font-black text-xs text-secondary text-right outline-none shadow-sm focus:border-secondary" />
              ) : (
                <button onClick={handleEditMaxPrice} className="font-headline font-black text-on-surface-variant/40 text-xs leading-none hover:text-secondary transition-all">{priceConfig.max === 200000 ? '제한 없음' : `${priceConfig.max.toLocaleString()}원`}</button>
              )}
            </div>
          </div>
          <div key={`price-${priceConfig.max}`} className="px-2 pb-2 mt-4">
            <Range 
              step={1000} min={0} max={priceConfig.max} values={[priceLimit]} onChange={v => setPriceLimit(v[0])}
              disabled={false}
              direction={Direction.Right}
              rtl={false}
              allowOverlap={false}
              draggableTrack={false}
              label="가격 필터 슬라이더"
              labelledBy="price-slider"
              renderTrack={({ props, children }) => (
                <div onMouseDown={props.onMouseDown} onTouchStart={props.onTouchStart} style={{ ...props.style, height: '44px', display: 'flex', width: '100%' }}>
                  <div ref={props.ref} style={{ height: '10px', width: '100%', borderRadius: '5px', background: getTrackBackground({ values: [priceLimit], colors: ['#5b6146', '#ece9d4'], min: 0, max: priceConfig.max }), alignSelf: 'center' }}>{children}</div>
                </div>
              )}
              renderThumb={({ props, isDragged }) => {
                const { key, ...thumbProps } = props;
                return (
                  <div {...thumbProps} key={key} style={{ ...thumbProps.style, height: '36px', width: '36px', borderRadius: '12px', backgroundColor: '#fff', border: '5px solid #5b6146', boxShadow: isDragged ? '0 10px 20px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.15)', outline: 'none', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="flex gap-[3px]">
                      {[1, 2, 3].map(i => <div key={i} className="w-[3px] h-3 bg-secondary/20 rounded-full" />)}
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </div>
      </section>

      {/* 부대시설 및 감성 태그 선택 세션 */}
      <section className="space-y-12 pb-12">
        <div className="space-y-6">
          <label className="flex items-center gap-2 font-headline font-black text-xs tracking-widest uppercase text-on-surface-variant opacity-40">
            <Icon name="outdoor_grill" size="text-sm" /> 시설 및 테마
          </label>
          <div className="flex flex-wrap gap-2.5">
            {facOptions.map(f => (
              <button key={f} onClick={() => toggleList(selFacs, f, setSelFacs)}
                className={`px-5 py-3 rounded-full font-black text-[11px] transition-all active:scale-95 ${selFacs.includes(f) ? 'bg-secondary text-white shadow-md' : 'bg-surface-container text-on-surface-variant/60 hover:bg-neutral-200'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <label className="flex items-center gap-2 font-headline font-black text-xs tracking-widest uppercase text-on-surface-variant opacity-40">
            <Icon name="tag" size="text-sm" /> 감성 태그
          </label>
          <div className="flex flex-wrap gap-2.5">
            {tagOptions.map(t => (
              <button key={t} onClick={() => toggleList(selTags, t, setSelTags)}
                className={`px-5 py-3 rounded-full font-black text-[11px] transition-all active:scale-95 ${selTags.includes(t) ? 'bg-primary text-white shadow-md' : 'bg-surface-container text-on-surface-variant/60 hover:bg-neutral-200'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SearchFilter;
