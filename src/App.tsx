/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Camping-Sync | Vibrant Dashboard
 * Design: Stitch with Google (camping_sync_vibrant_dashboard)
 * Logic: Original GoCamping API + OSRM distance engine
 */

import React, { useState, useEffect, useRef } from 'react';
import { Range, getTrackBackground, Direction } from 'react-range';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Campground {
  facltNm: string;
  addr1: string;
  resveUrl: string;
  mapX: string;
  mapY: string;
  intro: string;
  featureNm: string;
  lctCl: string;
  doNm: string;
  sigunguNm: string;
  firstImageUrl: string;
  contentId: string;
  distHome?: number;
  distWork?: number;
  timeHome?: number;
  timeWork?: number;
  roadDistHome?: number;
  roadDistWork?: number;
}

const ICON = (name: string, fill = false, size = 'text-2xl') => (
  <span
    className={`material-symbols-outlined ${size} select-none`}
    style={fill ? { fontVariationSettings: "'FILL' 1" } : {}}
  >
    {name}
  </span>
);

export default function App() {
  // --- Core State ---
  const [apiKey, setApiKey] = useState('a08bef2ae4cba753bb366a281c813e030a9ec6978b6c130cb19a01165c63d66f');
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [priceConfig] = useState({ min: 0, max: 100000 });
  const [distConfig] = useState({ min: 0, max: 120 });
  const [priceLimit, setPriceLimit] = useState(50000);
  const [distLimit, setDistLimit] = useState(120);
  const [requireStone, setRequireStone] = useState(true);
  const [requireParking, setRequireParking] = useState(true);
  const [homeCoords, setHomeCoords] = useState({ lat: 37.459479, lng: 127.025171 });
  const [workCoords, setWorkCoords] = useState({ lat: 37.4780439, lng: 126.8815648 });
  const [fetchLimit, setFetchLimit] = useState(100);
  const [candidateLimit, setCandidateLimit] = useState(70);
  const [apiUrl, setApiUrl] = useState('https://script.google.com/macros/s/AKfycbyReQ-uGXRS2MwI2se5bRYPrcx15lewKXMlX4PtOqpuR8dKUzwC5ZieyrEoJIf9xZyE/exec');
  const [isBotOn, setIsBotOn] = useState(true);
  const [botInterval, setBotInterval] = useState(10);
  const [targetCamps, setTargetCamps] = useState<{ name: string; url: string }[]>([]);

  // --- UI State ---
  const [campgrounds, setCampgrounds] = useState<Campground[]>([]);
  const [totalFound, setTotalFound] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // --- Settings edit sub-states ---
  const [editSec, setEditSec] = useState<string | null>(null);
  const [tmpApiKey, setTmpApiKey] = useState(apiKey);
  const [tmpHomeUrl, setTmpHomeUrl] = useState('');
  const [tmpWorkUrl, setTmpWorkUrl] = useState('');
  const [tmpTelegram, setTmpTelegram] = useState({ token: telegramToken, chatId: telegramChatId });
  const [tmpFetchLimit, setTmpFetchLimit] = useState(fetchLimit);
  const [tmpCandidateLimit, setTmpCandidateLimit] = useState(candidateLimit);
  const [tmpApiUrl, setTmpApiUrl] = useState(apiUrl);

  // --- Persistence ---
  useEffect(() => {
    const load = (key: string) => localStorage.getItem(key);
    if (load('camping_apiKey')) setApiKey(load('camping_apiKey')!);
    if (load('camping_telegramToken')) setTelegramToken(load('camping_telegramToken')!);
    if (load('camping_telegramChatId')) setTelegramChatId(load('camping_telegramChatId')!);
    if (load('camping_homeCoords')) setHomeCoords(JSON.parse(load('camping_homeCoords')!));
    if (load('camping_workCoords')) setWorkCoords(JSON.parse(load('camping_workCoords')!));
    if (load('camping_priceLimit')) setPriceLimit(Number(load('camping_priceLimit')));
    if (load('camping_distLimit')) setDistLimit(Number(load('camping_distLimit')));
    if (load('camping_requireStone')) setRequireStone(load('camping_requireStone') === 'true');
    if (load('camping_requireParking')) setRequireParking(load('camping_requireParking') === 'true');
    if (load('camping_fetchLimit')) setFetchLimit(Number(load('camping_fetchLimit')));
    if (load('camping_candidateLimit')) setCandidateLimit(Number(load('camping_candidateLimit')));
    if (load('camping_apiUrl')) setApiUrl(load('camping_apiUrl')!);
    if (load('camping_isBotOn')) setIsBotOn(load('camping_isBotOn') === 'true');
    if (load('camping_botInterval')) setBotInterval(Number(load('camping_botInterval')));
    if (load('camping_targetCamps')) { try { setTargetCamps(JSON.parse(load('camping_targetCamps')!)); } catch {} }
  }, []);

  useEffect(() => {
    localStorage.setItem('camping_apiKey', apiKey);
    localStorage.setItem('camping_telegramToken', telegramToken);
    localStorage.setItem('camping_telegramChatId', telegramChatId);
    localStorage.setItem('camping_homeCoords', JSON.stringify(homeCoords));
    localStorage.setItem('camping_workCoords', JSON.stringify(workCoords));
    localStorage.setItem('camping_priceLimit', String(priceLimit));
    localStorage.setItem('camping_distLimit', String(distLimit));
    localStorage.setItem('camping_requireStone', String(requireStone));
    localStorage.setItem('camping_requireParking', String(requireParking));
    localStorage.setItem('camping_fetchLimit', String(fetchLimit));
    localStorage.setItem('camping_candidateLimit', String(candidateLimit));
    localStorage.setItem('camping_apiUrl', apiUrl);
    localStorage.setItem('camping_isBotOn', String(isBotOn));
    localStorage.setItem('camping_botInterval', String(botInterval));
    localStorage.setItem('camping_targetCamps', JSON.stringify(targetCamps));
  }, [apiKey, telegramToken, telegramChatId, homeCoords, workCoords, priceLimit, distLimit, requireStone, requireParking, fetchLimit, candidateLimit, apiUrl, isBotOn, botInterval, targetCamps]);

  // --- Scroll to top ---
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // --- Google Sheets Sync ---
  const updateBotSettings = async (overrides: any) => {
    if (!apiUrl) return;
    try {
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ isOn: isBotOn, intervalMins: botInterval, targetCampUrl: '', ...overrides }),
      });
    } catch {}
  };

  const handleToggleBot = (val: boolean) => {
    setIsBotOn(val);
    updateBotSettings({ isOn: val, targetCampUrl: JSON.stringify(targetCamps) });
  };

  const toggleTargetCamp = (camp: Campground, clickUrl: string) => {
    setIsBotOn(true);
    setTargetCamps(prev => {
      const exists = prev.find(t => t.name === camp.facltNm);
      const next = exists ? prev.filter(t => t.name !== camp.facltNm) : [...prev, { name: camp.facltNm, url: clickUrl }];
      updateBotSettings({ isOn: true, targetCampUrl: JSON.stringify(next) });
      return next;
    });
  };

  // --- Helpers ---
  const extractLatLng = (url: string) => {
    const m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    return m ? { lat: parseFloat(m[1]), lng: parseFloat(m[2]) } : null;
  };

  const calcDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // --- API Fetch ---
  const fetchCampgrounds = async () => {
    if (!apiKey) { setError('GoCamping API 키를 설정해 주세요.'); return; }
    setLoading(true); setLoadingStatus('캠핑장 목록 가져오는 중...'); setError(null); setTotalFound(null); setCampgrounds([]);
    try {
      const url = `https://apis.data.go.kr/B551011/GoCamping/basedList?numOfRows=${fetchLimit}&pageNo=1&MobileOS=ETC&MobileApp=CampingBot&_type=json&serviceKey=${encodeURIComponent(apiKey)}`;
      const data = await fetch(url).then(r => r.json());
      if (data.error) throw new Error(data.error);
      const items = data?.response?.body?.items?.item || [];
      setTotalFound(items.length);
      if (!items.length) return;

      setLoadingStatus('가까운 캠핑장 선별 중...');
      const candidates = items
        .filter((i: any) => i.mapX && i.mapY && !isNaN(parseFloat(i.mapX)) && !isNaN(parseFloat(i.mapY)))
        .map((i: any) => ({ ...i, distHome: calcDist(homeCoords.lat, homeCoords.lng, parseFloat(i.mapY), parseFloat(i.mapX)), distWork: calcDist(workCoords.lat, workCoords.lng, parseFloat(i.mapY), parseFloat(i.mapX)) }))
        .sort((a: any, b: any) => Math.min(a.distHome, a.distWork) - Math.min(b.distHome, b.distWork))
        .slice(0, candidateLimit);

      setLoadingStatus('실제 도로 주행 시간 계산 중...');
      const getRealData = async (src: { lat: number; lng: number }, targets: any[]) => {
        const results = new Array(targets.length).fill({ duration: 0, distance: 0 });
        for (let i = 0; i < targets.length; i += 40) {
          const batch = targets.slice(i, i + 40).map((t, idx) => ({ t, i: i + idx })).filter(({ t }) => t.mapX && t.mapY);
          if (!batch.length) continue;
          try {
            const coords = `${src.lng},${src.lat};` + batch.map(({ t }) => `${t.mapX},${t.mapY}`).join(';');
            const destIdx = batch.map((_, j) => j + 1).join(';');
            const res = await fetch(`https://router.project-osrm.org/table/v1/driving/${coords}?sources=0&destinations=${destIdx}&annotations=duration,distance`);
            const d = await res.json();
            if (d.code !== 'Ok') continue;
            batch.forEach(({ i: oi }, j) => { results[oi] = { duration: d.durations?.[0]?.[j] || 0, distance: d.distances?.[0]?.[j] || 0 }; });
          } catch {}
        }
        return results;
      };

      const [homeData, workData] = await Promise.all([getRealData(homeCoords, candidates), getRealData(workCoords, candidates)]);
      const withTimes = candidates.map((item: any, idx: number) => ({
        ...item,
        timeHome: homeData[idx].duration > 0 ? Math.round(homeData[idx].duration / 60) : Math.round((item.distHome / 60) * 60 * 1.5),
        timeWork: workData[idx].duration > 0 ? Math.round(workData[idx].duration / 60) : Math.round((item.distWork / 60) * 60 * 1.5),
        roadDistHome: homeData[idx].distance > 0 ? parseFloat((homeData[idx].distance / 1000).toFixed(1)) : parseFloat(item.distHome.toFixed(1)),
        roadDistWork: workData[idx].distance > 0 ? parseFloat((workData[idx].distance / 1000).toFixed(1)) : parseFloat(item.distWork.toFixed(1)),
      }));

      setLoadingStatus('필터 조건 적용 중...');
      const filtered = withTimes.filter((item: any) => {
        const content = (item.intro || '') + (item.featureNm || '') + (item.facltNm || '') + (item.lctCl || '') + (item.sbrsCl || '');
        const hasStone = content.includes('파쇄석') || Number(item.siteBottomCl2 || 0) > 0;
        const hasParking = content.includes('옆') || content.includes('주차') || (item.induty || '').includes('자동차야영장');
        const isWithinDist = item.timeHome <= distLimit && item.timeWork <= distLimit;
        let meetsPrice = true;
        const priceRegex = /(?:(바베큐|당일|피크닉|대여|추가|인원)\s*)?(\d{1,3}(?:,\d{3})*)\s*원|(\d+)\s*만원/g;
        let match; const prices: { val: number; bait: boolean }[] = [];
        while ((match = priceRegex.exec(content)) !== null) {
          let val = match[2] ? parseInt(match[2].replace(/,/g, '')) : parseInt(match[3]) * 10000;
          if (val > 0) prices.push({ val, bait: !!match[1] || val < 30000 });
        }
        if (prices.length) {
          const real = prices.filter(p => !p.bait).map(p => p.val);
          const cmp = real.length ? Math.min(...real) : Math.min(...prices.map(p => p.val));
          if (cmp > priceLimit) meetsPrice = false;
        }
        return (!requireStone || hasStone) && (!requireParking || hasParking) && isWithinDist && meetsPrice;
      });

      setCampgrounds(filtered);
      if (!filtered.length && items.length) setError('설정하신 필터를 만족하는 캠핑장이 없습니다.');
    } catch (err: any) {
      setError(`오류 발생: ${err.message || '데이터를 가져오지 못했습니다.'}`);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="bg-surface-container-low font-body text-on-surface min-h-screen pb-32">

      {/* ── Header ── */}
      <header className="bg-white/70 backdrop-blur-xl rounded-b-[2rem] sticky top-0 z-50 soft-glow flex items-center justify-between px-6 py-4 w-full">
        <div className="flex items-center gap-2">
          {ICON('forest', true, 'text-3xl text-primary')}
          <h1 className="font-headline font-black text-2xl tracking-tight text-primary italic">Camping-Sync</h1>
        </div>
        <div className="flex items-center gap-3">
          {totalFound !== null && (
            <div className="flex items-center gap-1.5 bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              {campgrounds.length}개 필터됨
            </div>
          )}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center hover:scale-105 transition-transform"
          >
            {ICON('settings', false, 'text-xl text-on-surface-variant')}
          </button>
        </div>
      </header>

      <main className="px-4 pt-6 space-y-8 max-w-lg mx-auto lg:max-w-2xl">

        {/* ── Hero ── */}
        <section className="space-y-1 px-2">
          <h2 className="font-headline font-extrabold text-4xl tracking-tight text-on-surface leading-tight">
            나만의 완벽한{' '}
            <span className="text-secondary italic underline decoration-tertiary-fixed decoration-4 underline-offset-4">캠핑지</span>
            를 찾자.
          </h2>
          <p className="text-on-surface-variant font-medium text-sm mt-1">
            {totalFound !== null ? `총 ${totalFound}개 중 ${campgrounds.length}개가 조건에 맞아요.` : '아래 필터를 설정하고 검색을 시작하세요.'}
          </p>
        </section>

        {/* ── Filter Card ── */}
        <section className="bg-surface-container-highest p-6 rounded-xl space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-headline font-bold text-lg">어드벤처 필터</h3>
            {ICON('tune', false, 'text-xl text-secondary')}
          </div>
          <div className="space-y-8">
            {/* Date */}
            <div className="space-y-2">
              <label className="font-label font-bold text-xs tracking-wide uppercase text-on-surface-variant">방문 예정일</label>
              <input
                type="date"
                value={visitDate}
                onChange={e => setVisitDate(e.target.value)}
                className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-bold focus:outline-none"
              />
            </div>
            {/* Price Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="font-label font-bold text-xs tracking-wide uppercase text-on-surface-variant">최대 금액 (1박)</label>
                <span className="font-headline font-extrabold text-secondary text-base">₩{priceLimit.toLocaleString()}{priceLimit >= priceConfig.max ? '+' : ''}</span>
              </div>
              <div className="px-1 pt-1">
                <Range step={1000} min={priceConfig.min} max={priceConfig.max} values={[priceLimit]} onChange={v => setPriceLimit(v[0])}
                  direction={Direction.Right} rtl={false} disabled={false} allowOverlap={false} draggableTrack={false}
                  label="가격" labelledBy="price-slider"
                  renderTrack={({ props, children }) => (
                    <div onMouseDown={props.onMouseDown} onTouchStart={props.onTouchStart} style={{ ...props.style, height: '36px', display: 'flex', width: '100%' }}>
                      <div ref={props.ref} style={{ height: '8px', width: '100%', borderRadius: '4px', background: getTrackBackground({ values: [priceLimit], colors: ['#9d4f00', '#ece9d4'], min: priceConfig.min, max: priceConfig.max }), alignSelf: 'center' }}>{children}</div>
                    </div>
                  )}
                  renderThumb={({ props }) => (
                    <div {...props} style={{ ...props.style, height: '28px', width: '28px', borderRadius: '50%', backgroundColor: '#fff', border: '4px solid #9d4f00', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', outline: 'none' }} />
                  )}
                />
              </div>
            </div>
            {/* Distance Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="font-label font-bold text-xs tracking-wide uppercase text-on-surface-variant">최대 주행 시간</label>
                <span className="font-headline font-extrabold text-tertiary text-base">{distLimit}분{distLimit >= distConfig.max ? '+' : ''}</span>
              </div>
              <div className="px-1 pt-1">
                <Range step={5} min={distConfig.min} max={distConfig.max} values={[distLimit]} onChange={v => setDistLimit(v[0])}
                  direction={Direction.Right} rtl={false} disabled={false} allowOverlap={false} draggableTrack={false}
                  label="거리" labelledBy="dist-slider"
                  renderTrack={({ props, children }) => (
                    <div onMouseDown={props.onMouseDown} onTouchStart={props.onTouchStart} style={{ ...props.style, height: '36px', display: 'flex', width: '100%' }}>
                      <div ref={props.ref} style={{ height: '8px', width: '100%', borderRadius: '4px', background: getTrackBackground({ values: [distLimit], colors: ['#815f00', '#ece9d4'], min: distConfig.min, max: distConfig.max }), alignSelf: 'center' }}>{children}</div>
                    </div>
                  )}
                  renderThumb={({ props }) => (
                    <div {...props} style={{ ...props.style, height: '28px', width: '28px', borderRadius: '50%', backgroundColor: '#fff', border: '4px solid #815f00', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', outline: 'none' }} />
                  )}
                />
              </div>
            </div>
            {/* Checkboxes */}
            <div className="flex gap-3 flex-wrap">
              {[
                { label: '파쇄석 바닥', val: requireStone, set: setRequireStone, icon: 'terrain' },
                { label: '사이트옆주차', val: requireParking, set: setRequireParking, icon: 'directions_car' },
              ].map(({ label, val, set, icon }) => (
                <button key={label} onClick={() => set(!val)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm border-2 transition-all ${val ? 'border-primary bg-primary-container text-on-primary-container' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'}`}>
                  {ICON(icon, val, 'text-base')} {label}
                </button>
              ))}
            </div>
            {/* Search Button */}
            <button onClick={fetchCampgrounds} disabled={loading}
              className="w-full vibe-gradient text-white font-headline font-extrabold py-4 rounded-full chunky-shadow active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-base">
              {loading ? (
                <><div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />{loadingStatus || '검색 중...'}</>
              ) : (
                <>{ICON('travel_explore', false, 'text-xl')} 캠핑장 검색</>
              )}
            </button>
          </div>
        </section>

        {/* ── Error ── */}
        {error && (
          <div className="bg-error-container/20 border border-error/30 text-on-error-container px-5 py-4 rounded-xl flex items-center gap-3">
            {ICON('error', false, 'text-xl text-error')}
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* ── Results ── */}
        {campgrounds.length > 0 && (
          <section className="space-y-4">
            <div className="flex justify-between items-end px-1">
              <h3 className="font-headline font-extrabold text-2xl tracking-tight">추천 캠핑장</h3>
              <span className="text-on-surface-variant text-sm font-bold">{campgrounds.length}곳</span>
            </div>
            <div className={`grid grid-cols-1 gap-6 ${targetCamps.length > 0 ? 'pb-52' : 'pb-24'}`}>
              {campgrounds.map((camp, idx) => {
                const naverUrl = `https://map.naver.com/v5/search/${encodeURIComponent(camp.facltNm)}`;
                let cleanUrl = camp.resveUrl || '';
                const m = cleanUrl.match(/(https?:\/\/[^\s,]+)/g);
                if (m?.length) cleanUrl = m[0];
                const isValidResve = cleanUrl && cleanUrl.startsWith('http') && !cleanUrl.includes(window.location.hostname);
                const finalUrl = isValidResve ? cleanUrl : naverUrl;
                const isTargeted = targetCamps.some(t => t.name === camp.facltNm);

                return (
                  <motion.div key={idx} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    className="bg-surface-container-lowest rounded-xl overflow-hidden chunky-shadow group">
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={camp.firstImageUrl || `https://picsum.photos/seed/${camp.contentId}/800/600`}
                        alt={camp.facltNm}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        {camp.doNm} {camp.sigunguNm}
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <a href={naverUrl} target="_blank" rel="noopener noreferrer"
                          className="font-headline font-extrabold text-xl text-on-surface hover:text-primary transition-colors leading-tight flex-1 pr-2">
                          {camp.facltNm}
                        </a>
                      </div>
                      <p className="text-on-surface-variant text-xs font-medium flex items-center gap-1">
                        {ICON('location_on', false, 'text-sm')} {camp.addr1}
                      </p>
                      {/* Distance pills */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-tertiary-container/40 border border-tertiary-fixed/30 rounded-xl p-3">
                          <p className="text-[10px] font-black uppercase tracking-wider text-on-tertiary-container mb-1 flex items-center gap-1">
                            {ICON('home', true, 'text-sm')} 집에서
                          </p>
                          <p className="font-headline font-black text-lg text-on-tertiary-container">
                            {camp.timeHome && camp.timeHome > 0 ? `${camp.timeHome}분` : 'N/A'}
                            {camp.roadDistHome ? <span className="text-xs font-normal ml-1">{camp.roadDistHome}km</span> : null}
                          </p>
                        </div>
                        <div className="bg-secondary-container/30 border border-secondary-fixed-dim/30 rounded-xl p-3">
                          <p className="text-[10px] font-black uppercase tracking-wider text-on-secondary-container mb-1 flex items-center gap-1">
                            {ICON('work', true, 'text-sm')} 회사에서
                          </p>
                          <p className="font-headline font-black text-lg text-on-secondary-container">
                            {camp.timeWork && camp.timeWork > 0 ? `${camp.timeWork}분` : 'N/A'}
                            {camp.roadDistWork ? <span className="text-xs font-normal ml-1">{camp.roadDistWork}km</span> : null}
                          </p>
                        </div>
                      </div>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        <div className="bg-primary-container/60 px-3 py-1 rounded-full flex items-center gap-1.5">
                          {ICON('grade', true, 'text-sm text-primary')}
                          <span className="font-label text-xs font-bold uppercase tracking-wide text-on-primary-container">파쇄석</span>
                        </div>
                        <div className="bg-primary-container/60 px-3 py-1 rounded-full flex items-center gap-1.5">
                          {ICON('directions_car', false, 'text-sm text-primary')}
                          <span className="font-label text-xs font-bold uppercase tracking-wide text-on-primary-container">사이트옆주차</span>
                        </div>
                        {camp.lctCl && camp.lctCl.split(',').slice(0, 2).map((tag, i) => (
                          <div key={i} className="bg-tertiary-container px-3 py-1 rounded-full">
                            <span className="font-label text-xs font-bold uppercase tracking-wide">#{tag.trim()}</span>
                          </div>
                        ))}
                      </div>
                      {/* CTA Buttons */}
                      <div className="flex gap-2 pt-2 border-t border-outline-variant/30">
                        <a href={naverUrl} target="_blank" rel="noreferrer"
                          className="flex-1 py-3 rounded-full text-xs font-black tracking-widest flex items-center justify-center gap-1.5 bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors">
                          {ICON('map', false, 'text-sm')} 지도
                        </a>
                        <a href={finalUrl} target="_blank" rel="noreferrer"
                          className={`flex-1 py-3 rounded-full text-xs font-black tracking-widest flex items-center justify-center gap-1.5 transition-colors ${isValidResve ? 'vibe-gradient text-white' : 'bg-secondary-container text-on-secondary-container'}`}>
                          {isValidResve ? <>{ICON('open_in_new', false, 'text-sm')} 공식예약</> : <>{ICON('search', false, 'text-sm')} 네이버</>}
                        </a>
                        <button
                          onClick={e => { e.preventDefault(); e.stopPropagation(); toggleTargetCamp(camp, finalUrl); }}
                          className={`flex-1 py-3 rounded-full text-xs font-black tracking-widest flex items-center justify-center gap-1.5 border-2 transition-all active:scale-95 ${isTargeted ? 'border-error bg-error-container/20 text-on-error-container' : 'border-primary bg-primary-container text-on-primary-container'}`}>
                          {isTargeted ? <>{ICON('notifications_off', false, 'text-sm')} 끄기</> : <>{ICON('notifications_active', false, 'text-sm')} 알림</>}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {!loading && !error && campgrounds.length === 0 && (
          <div className="h-[50vh] flex flex-col items-center justify-center text-on-surface-variant/40 space-y-3">
            {ICON('forest', true, 'text-[5rem]')}
            <p className="font-headline font-bold text-xl italic">완벽한 자연을 찾을 준비가 됐나요?</p>
            <p className="text-xs uppercase tracking-widest">위 필터를 설정하고 검색을 시작하세요</p>
          </div>
        )}
      </main>

      {/* ── Monitoring Bar ── */}
      <AnimatePresence>
        {targetCamps.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: 100, opacity: 0, x: '-50%' }}
            className="fixed bottom-5 left-1/2 z-50 w-[92%] max-w-lg bg-white/95 backdrop-blur-xl border border-primary-container p-4 rounded-[2rem] soft-glow"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                실시간 감시 중 ({targetCamps.length}개)
              </p>
            </div>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto px-1">
              {targetCamps.map(c => (
                <div key={c.name} className="bg-primary-container text-on-primary-container px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                  {c.name}
                  <button onClick={() => toggleTargetCamp({ facltNm: c.name } as Campground, c.url)}
                    className="text-primary/50 hover:text-error transition-colors ml-0.5">
                    {ICON('close', false, 'text-sm')}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scroll to Top ── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`fixed ${targetCamps.length > 0 ? 'bottom-44' : 'bottom-16'} right-5 z-[60] bg-primary text-on-primary w-14 h-14 rounded-full flex items-center justify-center chunky-shadow active:scale-90 transition-all`}
          >
            {ICON('arrow_upward', false, 'text-2xl')}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Settings Modal ── */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative bg-surface-container-lowest w-full max-w-lg rounded-t-[2.5rem] shadow-2xl max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center px-8 pt-8 pb-4">
                <h2 className="font-headline font-extrabold text-2xl flex items-center gap-2">
                  {ICON('tune', false, 'text-2xl text-primary')} 시스템 설정
                </h2>
                <button onClick={() => setIsSettingsOpen(false)} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                  {ICON('close', false, 'text-xl')}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-8 pb-4 space-y-5">
                {/* API Key */}
                <SettingsCard label="GoCamping API 키" icon="vpn_key"
                  editing={editSec === 'api'}
                  onEdit={() => { setEditSec('api'); setTmpApiKey(apiKey); }}
                  onSave={() => { setApiKey(tmpApiKey); setEditSec(null); }}
                  onCancel={() => setEditSec(null)}>
                  {editSec === 'api'
                    ? <input type="password" value={tmpApiKey} onChange={e => setTmpApiKey(e.target.value)} className="settings-input" placeholder="API 키 입력" />
                    : <p className="text-sm font-mono text-on-surface-variant">••••••••••••••••••••</p>}
                </SettingsCard>

                {/* Home */}
                <SettingsCard label="집 위치" icon="home"
                  editing={editSec === 'home'}
                  onEdit={() => { setEditSec('home'); setTmpHomeUrl(''); }}
                  onSave={() => { const c = extractLatLng(tmpHomeUrl); if (c) { setHomeCoords(c); setEditSec(null); } else alert('올바른 구글 지도 URL이 아닙니다.'); }}
                  onCancel={() => setEditSec(null)}>
                  {editSec === 'home'
                    ? <input type="text" value={tmpHomeUrl} onChange={e => setTmpHomeUrl(e.target.value)} className="settings-input" placeholder="Google Maps URL 붙여넣기" />
                    : <p className="text-xs font-mono text-on-surface-variant">위도 {homeCoords.lat.toFixed(4)} / 경도 {homeCoords.lng.toFixed(4)}</p>}
                </SettingsCard>

                {/* Work */}
                <SettingsCard label="직장 위치" icon="work"
                  editing={editSec === 'work'}
                  onEdit={() => { setEditSec('work'); setTmpWorkUrl(''); }}
                  onSave={() => { const c = extractLatLng(tmpWorkUrl); if (c) { setWorkCoords(c); setEditSec(null); } else alert('올바른 구글 지도 URL이 아닙니다.'); }}
                  onCancel={() => setEditSec(null)}>
                  {editSec === 'work'
                    ? <input type="text" value={tmpWorkUrl} onChange={e => setTmpWorkUrl(e.target.value)} className="settings-input" placeholder="Google Maps URL 붙여넣기" />
                    : <p className="text-xs font-mono text-on-surface-variant">위도 {workCoords.lat.toFixed(4)} / 경도 {workCoords.lng.toFixed(4)}</p>}
                </SettingsCard>

                {/* Telegram */}
                <SettingsCard label="텔레그램 봇" icon="send"
                  editing={editSec === 'telegram'}
                  onEdit={() => { setEditSec('telegram'); setTmpTelegram({ token: telegramToken, chatId: telegramChatId }); }}
                  onSave={() => { setTelegramToken(tmpTelegram.token); setTelegramChatId(tmpTelegram.chatId); setEditSec(null); }}
                  onCancel={() => setEditSec(null)}>
                  {editSec === 'telegram' ? (
                    <div className="space-y-2">
                      <input type="password" value={tmpTelegram.token} onChange={e => setTmpTelegram({ ...tmpTelegram, token: e.target.value })} className="settings-input" placeholder="봇 Token" />
                      <input type="text" value={tmpTelegram.chatId} onChange={e => setTmpTelegram({ ...tmpTelegram, chatId: e.target.value })} className="settings-input" placeholder="Chat ID" />
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-on-surface-variant">{telegramToken ? '✅ 연결됨' : '⚠️ 미설정'}</p>
                  )}
                </SettingsCard>

                {/* Bot Toggle */}
                <div className="bg-surface-container rounded-2xl p-5 flex items-center justify-between">
                  <p className="font-headline font-bold text-sm flex items-center gap-2">{ICON('notifications', false, 'text-lg text-primary')} 자동 알림 활성화</p>
                  <div onClick={() => handleToggleBot(!isBotOn)}
                    className={`w-14 h-7 rounded-full cursor-pointer flex items-center px-1 transition-colors ${isBotOn ? 'bg-primary' : 'bg-outline-variant'}`}>
                    <motion.div animate={{ x: isBotOn ? 28 : 0 }} className="w-5 h-5 bg-white rounded-full shadow-sm" />
                  </div>
                </div>

                {/* Performance */}
                <SettingsCard label="검색 성능 (고급)" icon="speed"
                  editing={editSec === 'perf'}
                  onEdit={() => { setEditSec('perf'); setTmpFetchLimit(fetchLimit); setTmpCandidateLimit(candidateLimit); }}
                  onSave={() => { setFetchLimit(tmpFetchLimit); setCandidateLimit(tmpCandidateLimit); setEditSec(null); }}
                  onCancel={() => setEditSec(null)}>
                  {editSec === 'perf' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1">전수조사</p>
                        <input type="number" value={tmpFetchLimit} onChange={e => setTmpFetchLimit(Math.min(5000, +e.target.value))} className="settings-input" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1">경로 후보</p>
                        <input type="number" value={tmpCandidateLimit} onChange={e => setTmpCandidateLimit(Math.min(5000, +e.target.value))} className="settings-input" />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant">전수 {fetchLimit}개 / 경로 {candidateLimit}개</p>
                  )}
                </SettingsCard>
              </div>
              <div className="px-8 py-5 border-t border-outline-variant/30">
                <button onClick={() => setIsSettingsOpen(false)}
                  className="w-full bg-on-surface text-surface font-headline font-extrabold py-4 rounded-full active:scale-95 transition-all">
                  완료
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── SettingsCard Helper Component ──
function SettingsCard({ label, icon, editing, onEdit, onSave, onCancel, children }: {
  label: string; icon: string; editing: boolean;
  onEdit: () => void; onSave: () => void; onCancel: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container rounded-2xl p-5 space-y-3">
      <div className="flex justify-between items-center">
        <label className="font-headline font-bold text-sm flex items-center gap-2 text-on-surface">
          <span className="material-symbols-outlined text-lg text-primary">{icon}</span> {label}
        </label>
        {!editing ? (
          <button onClick={onEdit} className="text-xs font-black text-primary uppercase tracking-widest">수정</button>
        ) : (
          <div className="flex gap-3">
            <button onClick={onSave} className="text-xs font-black text-primary uppercase tracking-widest">저장</button>
            <button onClick={onCancel} className="text-xs font-black text-error uppercase tracking-widest">취소</button>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
