/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Range, getTrackBackground, Direction } from 'react-range';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Bell, 
  Settings, 
  Tent, 
  Car, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Home,
  Briefcase,
  X,
  RotateCcw,
  Edit2,
  Save,
  Trash2,
  ChevronUp
} from 'lucide-react';
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

export default function App() {
  // --- State ---
  const [apiKey, setApiKey] = useState('a08bef2ae4cba753bb366a281c813e030a9ec6978b6c130cb19a01165c63d66f');
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  
  // --- Filter Configs ---
  const [priceConfig, setPriceConfig] = useState({ min: 0, max: 100000 });
  const [distConfig, setDistConfig] = useState({ min: 0, max: 120 });
  const [priceLimit, setPriceLimit] = useState(50000);
  const [distLimit, setDistLimit] = useState(120);

  const [requireStone, setRequireStone] = useState(true);
  const [requireParking, setRequireParking] = useState(true);

  const [homeCoords, setHomeCoords] = useState({ lat: 37.459479, lng: 127.025171 }); // 서초구 양재동 (집)
  const [workCoords, setWorkCoords] = useState({ lat: 37.4780439, lng: 126.8815648 }); // 금천구 가산동 (회사)

  // --- Performance Configs ---
  const [fetchLimit, setFetchLimit] = useState(100); // 전수 조사 개수 (기본 100)
  const [candidateLimit, setCandidateLimit] = useState(70); // 경로 계산 후보군 (기본 70)

  // --- Bot/API Configs ---
  const [apiUrl, setApiUrl] = useState('https://script.google.com/macros/s/AKfycbyReQ-uGXRS2MwI2se5bRYPrcx15lewKXMlX4PtOqpuR8dKUzwC5ZieyrEoJIf9xZyE/exec');
  const [isBotOn, setIsBotOn] = useState(true);
  const [botInterval, setBotInterval] = useState(10);
  const [targetCamps, setTargetCamps] = useState<{name: string, url: string}[]>([]);

  // --- Persistence: Load from localStorage ---
  useEffect(() => {
    const savedApiKey = localStorage.getItem('camping_apiKey');
    const savedTelegramToken = localStorage.getItem('camping_telegramToken');
    const savedTelegramChatId = localStorage.getItem('camping_telegramChatId');
    const savedHomeCoords = localStorage.getItem('camping_homeCoords');
    const savedWorkCoords = localStorage.getItem('camping_workCoords');
    const savedPriceConfig = localStorage.getItem('camping_priceConfig');
    const savedDistConfig = localStorage.getItem('camping_distConfig');
    const savedRequireStone = localStorage.getItem('camping_requireStone');
    const savedRequireParking = localStorage.getItem('camping_requireParking');
    const savedFetchLimit = localStorage.getItem('camping_fetchLimit');
    const savedCandidateLimit = localStorage.getItem('camping_candidateLimit');
    const savedApiUrl = localStorage.getItem('camping_apiUrl');
    const savedIsBotOn = localStorage.getItem('camping_isBotOn');
    const savedBotInterval = localStorage.getItem('camping_botInterval');
    const savedTargetCamps = localStorage.getItem('camping_targetCamps');

    if (savedApiKey) setApiKey(savedApiKey);
    if (savedApiUrl) setApiUrl(savedApiUrl);
    if (savedIsBotOn) setIsBotOn(savedIsBotOn === 'true');
    if (savedBotInterval) setBotInterval(Number(savedBotInterval));
    if (savedTargetCamps) {
      try { setTargetCamps(JSON.parse(savedTargetCamps)); } catch (e) {}
    }
    if (savedTelegramToken) setTelegramToken(savedTelegramToken);
    if (savedTelegramChatId) setTelegramChatId(savedTelegramChatId);
    if (savedHomeCoords) setHomeCoords(JSON.parse(savedHomeCoords));
    if (savedWorkCoords) setWorkCoords(JSON.parse(savedWorkCoords));
    if (savedRequireStone) setRequireStone(savedRequireStone === 'true');
    if (savedRequireParking) setRequireParking(savedRequireParking === 'true');
    if (savedFetchLimit) setFetchLimit(Number(savedFetchLimit));
    if (savedCandidateLimit) setCandidateLimit(Number(savedCandidateLimit));
    if (savedPriceConfig) {
      const cfg = JSON.parse(savedPriceConfig);
      setPriceConfig(cfg);
      // Don't overwrite priceLimit if it was already set or let it be handled by a separate saved state
      const savedPriceLimit = localStorage.getItem('camping_priceLimit');
      if (savedPriceLimit) setPriceLimit(Number(savedPriceLimit));
      else setPriceLimit(cfg.max / 2);
    }
    if (savedDistConfig) {
      const cfg = JSON.parse(savedDistConfig);
      setDistConfig(cfg);
      setDistLimit(cfg.max);
    }
  }, []);

  // --- Persistence: Save to localStorage ---
  useEffect(() => {
    localStorage.setItem('camping_apiKey', apiKey);
    localStorage.setItem('camping_telegramToken', telegramToken);
    localStorage.setItem('camping_telegramChatId', telegramChatId);
    localStorage.setItem('camping_homeCoords', JSON.stringify(homeCoords));
    localStorage.setItem('camping_workCoords', JSON.stringify(workCoords));
    localStorage.setItem('camping_priceConfig', JSON.stringify(priceConfig));
    localStorage.setItem('camping_distConfig', JSON.stringify(distConfig));
    localStorage.setItem('camping_requireStone', String(requireStone));
    localStorage.setItem('camping_requireParking', String(requireParking));
    localStorage.setItem('camping_priceLimit', String(priceLimit));
    localStorage.setItem('camping_distLimit', String(distLimit));
    localStorage.setItem('camping_fetchLimit', String(fetchLimit));
    localStorage.setItem('camping_candidateLimit', String(candidateLimit));
    localStorage.setItem('camping_apiUrl', apiUrl);
    localStorage.setItem('camping_isBotOn', String(isBotOn));
    localStorage.setItem('camping_botInterval', String(botInterval));
    localStorage.setItem('camping_targetCamps', JSON.stringify(targetCamps));
  }, [apiKey, telegramToken, telegramChatId, homeCoords, workCoords, priceConfig, distConfig, requireStone, requireParking, priceLimit, distLimit, fetchLimit, candidateLimit, apiUrl, isBotOn, botInterval, targetCamps]);
  
  const [campgrounds, setCampgrounds] = useState<Campground[]>([]);
  const [totalFound, setTotalFound] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [homeUrl, setHomeUrl] = useState('');
  const [workUrl, setWorkUrl] = useState('');

  // --- Scroll to Top ---
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Settings Edit States ---
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempHomeUrl, setTempHomeUrl] = useState('');
  const [tempWorkUrl, setTempWorkUrl] = useState('');
  const [tempTelegram, setTempTelegram] = useState({ token: telegramToken, chatId: telegramChatId });
  const [tempPriceConfig, setTempPriceConfig] = useState(priceConfig);
  const [tempDistConfig, setTempDistConfig] = useState(distConfig);
  const [tempPerformance, setTempPerformance] = useState({ fetchLimit, candidateLimit });
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);

  // --- Sync to Google Sheets ---
  const updateBotSettings = async (settingsOverrides: any) => {
    if (!apiUrl) return;
    try {
      const payload = {
        isOn: isBotOn,
        intervalMins: botInterval,
        targetCampUrl: "", // Reset target by default
        ...settingsOverrides
      };
      // Send as text/plain to bypass CORS preflight
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Failed to sync settings to Google Sheets", e);
    }
  };

  const handleToggleBot = (newState: boolean) => {
    setIsBotOn(newState);
    updateBotSettings({ isOn: newState, targetCampUrl: JSON.stringify(targetCamps) });
  };
  
  const toggleTargetCamp = (camp: Campground, clickUrl: string) => {
    setIsBotOn(true);
    setTargetCamps(prev => {
      const exists = prev.find(t => t.name === camp.facltNm);
      let newTargets;
      if (exists) {
        newTargets = prev.filter(t => t.name !== camp.facltNm);
      } else {
        newTargets = [...prev, { name: camp.facltNm, url: clickUrl }];
      }
      updateBotSettings({ isOn: true, targetCampUrl: JSON.stringify(newTargets) });
      return newTargets;
    });
  };

  // --- Helper: Extract Lat/Lng from Google Maps URL ---
  const extractLatLng = (url: string, type: 'home' | 'work') => {
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(regex);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      return { lat, lng };
    }
    return null;
  };

  // --- Distance Logic ---
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // --- API Call ---
  const fetchCampgrounds = async () => {
    if (!apiKey) {
      setError('GoCamping API 키를 입력해주세요.');
      return;
    }
    
    setLoading(true);
    setLoadingStatus('캠핑장 목록 가져오는 중...');
    setError(null);
    setTotalFound(null);
    setCampgrounds([]);
    
    try {
      // 1. Fetch campgrounds (Direct API call for standalone Capacitor App)
      const url = `https://apis.data.go.kr/B551011/GoCamping/basedList?numOfRows=${fetchLimit}&pageNo=1&MobileOS=ETC&MobileApp=CampingBot&_type=json&serviceKey=${encodeURIComponent(apiKey)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      const items = data?.response?.body?.items?.item || [];
      setTotalFound(items.length);

      if (items.length === 0) {
        const resultMsg = data?.response?.header?.resultMsg;
        if (resultMsg !== 'OK') throw new Error(`API 응답 오류: ${resultMsg}`);
        return;
      }
      
      // 2. Initial filter by straight-line distance to get top candidates
      setLoadingStatus('가까운 캠핑장 선별 중...');
      const sortedByStraight = items
        .filter((item: any) => item.mapX && item.mapY && !isNaN(parseFloat(item.mapX)) && !isNaN(parseFloat(item.mapY)))
        .map((item: any) => {
          const distHome = calculateDistance(homeCoords.lat, homeCoords.lng, parseFloat(item.mapY), parseFloat(item.mapX));
          const distWork = calculateDistance(workCoords.lat, workCoords.lng, parseFloat(item.mapY), parseFloat(item.mapX));
          return { ...item, distHome, distWork };
        })
        .sort((a: any, b: any) => Math.min(a.distHome, a.distWork) - Math.min(b.distHome, b.distWork))
        .slice(0, candidateLimit); 

      // 3. Use OSRM Table API for realistic driving durations (in seconds)
      setLoadingStatus('실제 도로 주행 시간 계산 중...');
      const getRealData = async (source: {lat: number, lng: number}, targets: any[]) => {
        const results = new Array(targets.length).fill({ duration: 0, distance: 0 });
        const batchSize = 40; // OSRM has limits on coordinate count
        
        for (let i = 0; i < targets.length; i += batchSize) {
          const batch = targets.slice(i, i + batchSize);
          const validBatchWithIdx = batch
            .map((t, idx) => ({ t, i: i + idx }))
            .filter(({ t }) => t.mapX && t.mapY && !isNaN(parseFloat(t.mapX)) && !isNaN(parseFloat(t.mapY)));
          
          if (validBatchWithIdx.length === 0) continue;

          try {
            const coords = `${source.lng},${source.lat};` + validBatchWithIdx.map(({ t }) => `${t.mapX},${t.mapY}`).join(';');
            const destIndices = validBatchWithIdx.map((_, idx) => idx + 1).join(';');
            const url = `https://router.project-osrm.org/table/v1/driving/${coords}?sources=0&destinations=${destIndices}&annotations=duration,distance`;
            
            const res = await fetch(url);
            if (!res.ok) throw new Error(`OSRM API error: ${res.status}`);
            
            const tableData = await res.json();
            if (tableData.code !== 'Ok') throw new Error(`OSRM Error: ${tableData.code}`);
            
            const durations = tableData.durations?.[0] || [];
            const distances = tableData.distances?.[0] || [];
            validBatchWithIdx.forEach(({ i: originalIdx }, idx) => {
              results[originalIdx] = {
                duration: durations[idx] || 0,
                distance: distances[idx] || 0
              };
            });
          } catch (e) {
            console.error('OSRM Batch Fetch Error:', e);
          }
        }
        return results;
      };

      const [homeData, workData] = await Promise.all([
        getRealData(homeCoords, sortedByStraight),
        getRealData(workCoords, sortedByStraight)
      ]);

      const withRealTimes = sortedByStraight.map((item, idx) => {
        // Fallback to straight-line estimate if OSRM fails (returns 0)
        const timeHome = homeData[idx].duration > 0 
          ? Math.round(homeData[idx].duration / 60) 
          : Math.round((item.distHome / 60) * 60 * 1.5);
        
        const timeWork = workData[idx].duration > 0 
          ? Math.round(workData[idx].duration / 60) 
          : Math.round((item.distWork / 60) * 60 * 1.5);

        const roadDistHome = homeData[idx].distance > 0
          ? parseFloat((homeData[idx].distance / 1000).toFixed(1))
          : parseFloat(item.distHome.toFixed(1));

        const roadDistWork = workData[idx].distance > 0
          ? parseFloat((workData[idx].distance / 1000).toFixed(1))
          : parseFloat(item.distWork.toFixed(1));
          
        return { ...item, timeHome, timeWork, roadDistHome, roadDistWork };
      });

      // 4. Final Filter
      setLoadingStatus('필터 조건 적용 중...');
      const filtered = withRealTimes.filter((item: any) => {
        const content = (item.intro || '') + (item.featureNm || '') + (item.facltNm || '') + (item.lctCl || '') + (item.sbrsCl || '');
        
        const hasStone = content.includes('파쇄석') || Number(item.siteBottomCl2 || 0) > 0;
        const isTargetFloor = !requireStone || hasStone;
        
        const hasParking = content.includes('옆') || content.includes('주차') || (item.induty || '').includes('자동차야영장') || content.includes('카라반');
        const isTargetParking = !requireParking || hasParking;
        
        // Distance Filter
        const isWithinDist = item.timeHome <= distLimit && item.timeWork <= distLimit;
        
        // Price Filter (Improved Logic)
        let meetsPrice = true;
        // Regex to find prices and check surrounding context
        const priceRegex = /(?:(바베큐|당일|피크닉|대여|추가|인원)\s*)?(\d{1,3}(?:,\d{3})*)\s*원|(\d+)\s*만원/g;
        let match;
        let foundPrices: { val: number, isBait: boolean }[] = [];
        
        while ((match = priceRegex.exec(content)) !== null) {
          let val = 0;
          if (match[2]) val = parseInt(match[2].replace(/,/g, ''));
          else if (match[3]) val = parseInt(match[3]) * 10000;
          
          const isBait = !!match[1] || val < 30000; // Keywords or too cheap
          if (val > 0) foundPrices.push({ val, isBait });
        }

        if (foundPrices.length > 0) {
          // Try to find non-bait prices first
          const realPrices = foundPrices.filter(p => !p.isBait).map(p => p.val);
          const allPrices = foundPrices.map(p => p.val);
          
          // If we found "real" looking prices, use the minimum of those. 
          // Otherwise, fall back to the minimum of all found prices.
          const priceToCompare = realPrices.length > 0 ? Math.min(...realPrices) : Math.min(...allPrices);
          
          if (priceToCompare > priceLimit) meetsPrice = false;
        }
        
        return isTargetFloor && isTargetParking && isWithinDist && meetsPrice;
      });
        
      setCampgrounds(filtered);
      if (filtered.length === 0 && items.length > 0) {
        setError(`설정하신 필터(파쇄석, 주차옆, 실제 도로 2시간이내)를 모두 만족하는 곳이 없습니다.`);
      }
    } catch (err: any) {
      setError(`오류 발생: ${err.message || '데이터를 가져오지 못했습니다.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans p-4 md:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-serif italic tracking-tight flex items-center gap-2">
            <Tent className="w-8 h-8 text-[#5A5A40]" />
            캠핑가자! 싫다고? 😭
          </h1>
          <p className="text-sm text-[#5A5A40]/60 uppercase tracking-widest mt-1">실시간 필터링 시스템</p>
        </div>
        <button 
          onClick={() => setIsSettingsModalOpen(true)}
          className="p-2 rounded-full hover:bg-white transition-colors border border-transparent hover:border-[#141414]/10"
        >
          <Settings className="w-6 h-6 text-[#5A5A40]" />
        </button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar (Filters) */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="lg:col-span-4 space-y-6"
            >
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#141414]/5">
                <h2 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Search className="w-4 h-4" /> 검색 필터
                </h2>
                
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#5A5A40]/60 mb-1 block">방문 예정일</label>
                    <input 
                      type="date" 
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full bg-[#F5F5F0] rounded-xl px-4 py-3 text-sm focus:outline-none"
                    />
                  </div>

                  {/* Floor & Parking Filters */}
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-[#5A5A40]/60 mb-1 block">필수 조건</label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${requireStone ? 'bg-[#5A5A40] border-[#5A5A40]' : 'border-[#E5E5E0] group-hover:border-[#5A5A40]'}`}>
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={requireStone} 
                            onChange={() => setRequireStone(!requireStone)} 
                          />
                          {requireStone && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-sm font-medium text-[#141414]">파쇄석 바닥 필수</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${requireParking ? 'bg-[#5A5A40] border-[#5A5A40]' : 'border-[#E5E5E0] group-hover:border-[#5A5A40]'}`}>
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={requireParking} 
                            onChange={() => setRequireParking(!requireParking)} 
                          />
                          {requireParking && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-sm font-medium text-[#141414]">사이트 옆 주차 필수</span>
                      </label>
                    </div>
                    <p className="text-[9px] text-[#5A5A40]/50 leading-relaxed mt-2">
                      * 이전에 나오던 캠핑장이 안 보인다면 위 체크박스를 해제해 보세요.
                    </p>
                  </div>

                  {/* Price Limit Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] uppercase font-bold text-[#5A5A40]/60">가격 제한 (1박)</label>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-[#141414]/40">₩{priceLimit.toLocaleString()}{priceLimit >= priceConfig.max ? '+' : ''}</p>
                      </div>
                    </div>
                    <div className="px-2 pt-2">
                      <Range
                        step={1000}
                        min={priceConfig.min}
                        max={priceConfig.max}
                        values={[priceLimit]}
                        onChange={(values) => setPriceLimit(values[0])}
                        direction={Direction.Right}
                        rtl={false}
                        disabled={false}
                        allowOverlap={false}
                        draggableTrack={false}
                        label="가격 제한"
                        labelledBy="price-limit-slider"
                        renderTrack={({ props, children }) => (
                          <div
                            onMouseDown={props.onMouseDown}
                            onTouchStart={props.onTouchStart}
                            style={{ ...props.style, height: '36px', display: 'flex', width: '100%' }}
                          >
                            <div
                              ref={props.ref}
                              style={{
                                height: '6px',
                                width: '100%',
                                borderRadius: '4px',
                                background: getTrackBackground({
                                  values: [priceLimit],
                                  colors: ['#5A5A40', '#E5E5E0'],
                                  min: priceConfig.min,
                                  max: priceConfig.max
                                }),
                                alignSelf: 'center'
                              }}
                            >
                              {children}
                            </div>
                          </div>
                        )}
                        renderThumb={({ props, isDragged }) => (
                          <div
                            {...props}
                            style={{
                              ...props.style,
                              height: '24px',
                              width: '24px',
                              borderRadius: '50%',
                              backgroundColor: '#FFF',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              boxShadow: '0px 2px 6px #AAA',
                              outline: 'none'
                            }}
                          >
                            <div style={{ height: '12px', width: '2px', backgroundColor: isDragged ? '#5A5A40' : '#CCC' }} />
                          </div>
                        )}
                      />
                    </div>
                    <div className="bg-[#F5F5F0] rounded-2xl p-3 text-center">
                      <span className="text-[9px] uppercase font-bold text-[#5A5A40]/40 block mb-1">최대 금액 (1박 기준)</span>
                      <span className="text-sm font-bold">₩{priceLimit.toLocaleString()}{priceLimit >= priceConfig.max ? '+' : ''}</span>
                    </div>
                    <p className="text-[9px] text-[#5A5A40]/50 leading-relaxed">
                      * 3만원 미만의 저가 요금(바비큐, 당일 이용 등)은 지능적으로 제외하고 실제 숙박 요금 위주로 필터링합니다.
                    </p>
                  </div>

                  {/* Distance Limit Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] uppercase font-bold text-[#5A5A40]/60">주행 시간 제한 (분)</label>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-[#141414]/40">{distLimit}분{distLimit >= distConfig.max ? '+' : ''}</p>
                      </div>
                    </div>
                    <div className="px-2 pt-2">
                      <Range
                        step={5}
                        min={distConfig.min}
                        max={distConfig.max}
                        values={[distLimit]}
                        onChange={(values) => setDistLimit(values[0])}
                        direction={Direction.Right}
                        rtl={false}
                        disabled={false}
                        allowOverlap={false}
                        draggableTrack={false}
                        label="거리 제한"
                        labelledBy="distance-limit-slider"
                        renderTrack={({ props, children }) => (
                          <div
                            onMouseDown={props.onMouseDown}
                            onTouchStart={props.onTouchStart}
                            style={{ ...props.style, height: '36px', display: 'flex', width: '100%' }}
                          >
                            <div
                              ref={props.ref}
                              style={{
                                height: '6px',
                                width: '100%',
                                borderRadius: '4px',
                                background: getTrackBackground({
                                  values: [distLimit],
                                  colors: ['#5A5A40', '#E5E5E0'],
                                  min: distConfig.min,
                                  max: distConfig.max
                                }),
                                alignSelf: 'center'
                              }}
                            >
                              {children}
                            </div>
                          </div>
                        )}
                        renderThumb={({ props, isDragged }) => (
                          <div
                            {...props}
                            style={{
                              ...props.style,
                              height: '24px',
                              width: '24px',
                              borderRadius: '50%',
                              backgroundColor: '#FFF',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              boxShadow: '0px 2px 6px #AAA',
                              outline: 'none'
                            }}
                          >
                            <div style={{ height: '12px', width: '2px', backgroundColor: isDragged ? '#5A5A40' : '#CCC' }} />
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={fetchCampgrounds}
                    disabled={loading}
                    className="w-full bg-[#5A5A40] text-white rounded-xl py-4 font-bold hover:bg-[#4A4A30] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-[#5A5A40]/20"
                  >
                    {loading ? "검색 중..." : <><Search className="w-4 h-4" /> 캠핑장 검색</>}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#141414]/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 시스템 준비됨
                  </h2>
                  <p className="text-[10px] text-[#5A5A40]/40 font-bold">V1.3</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Modal */}
        <AnimatePresence>
          {isSettingsModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSettingsModalOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F5F5F0] rounded-2xl flex items-center justify-center">
                        <Settings className="w-5 h-5 text-[#5A5A40]" />
                      </div>
                      <h2 className="text-xl font-serif italic">시스템 설정</h2>
                    </div>
                    <button 
                      onClick={() => setIsSettingsModalOpen(false)}
                      className="p-2 hover:bg-[#F5F5F0] rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-6 pb-8">
                    {/* API Key Section */}
                    <div className="bg-[#F5F5F0]/50 p-6 rounded-3xl space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-bold text-[#5A5A40]/60">GoCamping API 키</label>
                        {editingSection !== 'api' ? (
                          <button onClick={() => { setEditingSection('api'); setTempApiKey(apiKey); }} className="text-[10px] font-bold text-[#5A5A40] flex items-center gap-1">
                            <Edit2 className="w-3 h-3" /> 수정
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => { setApiKey(tempApiKey); setEditingSection(null); }} className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                              <Save className="w-3 h-3" /> 저장
                            </button>
                            <button onClick={() => setEditingSection(null)} className="text-[10px] font-bold text-red-500">취소</button>
                          </div>
                        )}
                      </div>
                      {editingSection === 'api' ? (
                        <input 
                          type="password" 
                          value={tempApiKey}
                          onChange={(e) => setTempApiKey(e.target.value)}
                          className="w-full bg-white rounded-xl px-4 py-3 text-sm focus:outline-none border border-[#141414]/5"
                        />
                      ) : (
                        <div className="text-sm font-mono text-[#141414]/40 truncate">••••••••••••••••••••••••</div>
                      )}
                    </div>

                    {/* Home Location */}
                    <div className="bg-[#F5F5F0]/50 p-6 rounded-3xl space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-bold text-[#5A5A40]/60 flex items-center gap-2">
                          <Home className="w-3 h-3" /> 집 위치 (Home)
                        </label>
                        {editingSection !== 'home' ? (
                          <button onClick={() => { setEditingSection('home'); setTempHomeUrl(''); }} className="text-[10px] font-bold text-[#5A5A40] flex items-center gap-1">
                            <Edit2 className="w-3 h-3" /> 수정
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => { 
                              const coords = extractLatLng(tempHomeUrl, 'home');
                              if (coords) { setHomeCoords(coords); setEditingSection(null); }
                              else alert('유효한 구글 지도 URL이 아닙니다.');
                            }} className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                              <Save className="w-3 h-3" /> 저장
                            </button>
                            <button onClick={() => setEditingSection(null)} className="text-[10px] font-bold text-red-500">취소</button>
                          </div>
                        )}
                      </div>
                      {editingSection === 'home' ? (
                        <input 
                          type="text" 
                          placeholder="Google Maps URL 붙여넣기"
                          value={tempHomeUrl}
                          onChange={(e) => setTempHomeUrl(e.target.value)}
                          className="w-full bg-white rounded-xl px-4 py-3 text-sm focus:outline-none border border-[#141414]/5"
                        />
                      ) : (
                        <div className="flex gap-4 px-2">
                          <div className="text-[10px] font-mono bg-white/80 px-2 py-1 rounded-lg">위도: {homeCoords.lat.toFixed(6)}</div>
                          <div className="text-[10px] font-mono bg-white/80 px-2 py-1 rounded-lg">경도: {homeCoords.lng.toFixed(6)}</div>
                        </div>
                      )}
                    </div>

                    {/* Work Location */}
                    <div className="bg-[#F5F5F0]/50 p-6 rounded-3xl space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-bold text-[#5A5A40]/60 flex items-center gap-2">
                          <Briefcase className="w-3 h-3" /> 직장 위치 (Work)
                        </label>
                        {editingSection !== 'work' ? (
                          <button onClick={() => { setEditingSection('work'); setTempWorkUrl(''); }} className="text-[10px] font-bold text-[#5A5A40] flex items-center gap-1">
                            <Edit2 className="w-3 h-3" /> 수정
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => { 
                              const coords = extractLatLng(tempWorkUrl, 'work');
                              if (coords) { setWorkCoords(coords); setEditingSection(null); }
                              else alert('유효한 구글 지도 URL이 아닙니다.');
                            }} className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                              <Save className="w-3 h-3" /> 저장
                            </button>
                            <button onClick={() => setEditingSection(null)} className="text-[10px] font-bold text-red-500">취소</button>
                          </div>
                        )}
                      </div>
                      {editingSection === 'work' ? (
                        <input 
                          type="text" 
                          placeholder="Google Maps URL 붙여넣기"
                          value={tempWorkUrl}
                          onChange={(e) => setTempWorkUrl(e.target.value)}
                          className="w-full bg-white rounded-xl px-4 py-3 text-sm focus:outline-none border border-[#141414]/5"
                        />
                      ) : (
                        <div className="flex gap-4 px-2">
                          <div className="text-[10px] font-mono bg-white/80 px-2 py-1 rounded-lg">위도: {workCoords.lat.toFixed(6)}</div>
                          <div className="text-[10px] font-mono bg-white/80 px-2 py-1 rounded-lg">경도: {workCoords.lng.toFixed(6)}</div>
                        </div>
                      )}
                    </div>

                    {/* Telegram Section */}
                    <div className="bg-[#F5F5F0]/50 p-6 rounded-3xl space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-bold text-[#5A5A40]/60 flex items-center gap-2">
                          <Bell className="w-3 h-3" /> 텔레그램 봇
                        </label>
                        {editingSection !== 'telegram' ? (
                          <button onClick={() => { setEditingSection('telegram'); setTempTelegram({ token: telegramToken, chatId: telegramChatId }); }} className="text-[10px] font-bold text-[#5A5A40] flex items-center gap-1">
                            <Edit2 className="w-3 h-3" /> 수정
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => { setTelegramToken(tempTelegram.token); setTelegramChatId(tempTelegram.chatId); setEditingSection(null); }} className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                              <Save className="w-3 h-3" /> 저장
                            </button>
                            <button onClick={() => setEditingSection(null)} className="text-[10px] font-bold text-red-500">취소</button>
                          </div>
                        )}
                      </div>
                      {editingSection === 'telegram' ? (
                        <div className="space-y-2">
                          <input 
                            type="password" 
                            placeholder="봇 토큰 (Bot Token)"
                            value={tempTelegram.token}
                            onChange={(e) => setTempTelegram({...tempTelegram, token: e.target.value})}
                            className="w-full bg-white rounded-xl px-4 py-3 text-sm focus:outline-none border border-[#141414]/5"
                          />
                          <input 
                            type="text" 
                            placeholder="채팅 ID (Chat ID)"
                            value={tempTelegram.chatId}
                            onChange={(e) => setTempTelegram({...tempTelegram, chatId: e.target.value})}
                            className="w-full bg-white rounded-xl px-4 py-3 text-sm focus:outline-none border border-[#141414]/5"
                          />
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold text-[#5A5A40]/40 px-2">
                          {telegramToken ? '봇 연결됨' : '설정되지 않음'}
                        </div>
                      )}
                    </div>

                    {/* Range Configs */}
                    <div className="bg-[#F5F5F0]/50 p-6 rounded-3xl space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-bold text-[#5A5A40]/60">슬라이더 범위 설정</label>
                        {editingSection !== 'ranges' ? (
                          <button onClick={() => { setEditingSection('ranges'); setTempPriceConfig(priceConfig); setTempDistConfig(distConfig); }} className="text-[10px] font-bold text-[#5A5A40] flex items-center gap-1">
                            <Edit2 className="w-3 h-3" /> 수정
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => { setPriceConfig(tempPriceConfig); setDistConfig(tempDistConfig); setEditingSection(null); }} className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                              <Save className="w-3 h-3" /> 저장
                            </button>
                            <button onClick={() => setEditingSection(null)} className="text-[10px] font-bold text-red-500">취소</button>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold text-[#5A5A40]/40 uppercase">최대 가격</span>
                          <input 
                            type="number" 
                            disabled={editingSection !== 'ranges'}
                            value={editingSection === 'ranges' ? tempPriceConfig.max : priceConfig.max}
                            onChange={(e) => setTempPriceConfig({...tempPriceConfig, max: parseInt(e.target.value)})}
                            className="w-full bg-white rounded-xl px-3 py-2 text-xs focus:outline-none disabled:opacity-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold text-[#5A5A40]/40 uppercase">최대 시간 (분)</span>
                          <input 
                            type="number" 
                            disabled={editingSection !== 'ranges'}
                            value={editingSection === 'ranges' ? tempDistConfig.max : distConfig.max}
                            onChange={(e) => setTempDistConfig({...tempDistConfig, max: parseInt(e.target.value)})}
                            className="w-full bg-white rounded-xl px-3 py-2 text-xs focus:outline-none disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bot DB & Frequency Configs */}
                    <div className="bg-[#F5F5F0]/50 p-6 rounded-3xl space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] uppercase font-bold text-[#5A5A40]/60 flex items-center gap-2">
                          <Bell className="w-3 h-3" /> 백그라운드 봇 알림 설정 (Google Sheets)
                        </label>
                      </div>
                      
                      {/* Bot Toggle */}
                      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#141414]/5 shadow-sm">
                        <span className="text-xs font-bold">자동 알림 활성화</span>
                        <div 
                          onClick={() => handleToggleBot(!isBotOn)}
                          className={`w-12 h-6 rounded-full cursor-pointer flex items-center px-1 transition-colors ${isBotOn ? 'bg-emerald-500' : 'bg-gray-300'}`}
                        >
                          <motion.div 
                            animate={{ x: isBotOn ? 24 : 0 }}
                            className="w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Bot Interval */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-[#5A5A40]/40 uppercase">확인 주기 (분 단위)</span>
                        <select 
                          value={botInterval} 
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setBotInterval(val);
                            updateBotSettings({ intervalMins: val });
                          }}
                          className="w-full bg-white rounded-xl px-3 py-3 text-sm font-bold focus:outline-none border border-[#141414]/5"
                        >
                          <option value={10}>매 10분마다 (추천)</option>
                          <option value={30}>매 30분마다</option>
                          <option value={60}>매 1시간마다</option>
                          <option value={120}>매 2시간마다</option>
                        </select>
                      </div>

                      {/* API URL Edit */}
                      <div className="pt-2">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[9px] uppercase font-bold text-[#5A5A40]/40">구글스프레드시트 DB 주소 (API URL)</label>
                          {editingSection !== 'apiurl' ? (
                            <button onClick={() => { setEditingSection('apiurl'); setTempApiUrl(apiUrl); }} className="text-[10px] font-bold text-[#5A5A40] flex items-center gap-1">
                              <Edit2 className="w-3 h-3" /> 수정
                            </button>
                          ) : (
                            <div className="flex gap-2">
                              <button onClick={() => { setApiUrl(tempApiUrl); setEditingSection(null); }} className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                <Save className="w-3 h-3" /> 저장
                              </button>
                              <button onClick={() => setEditingSection(null)} className="text-[10px] font-bold text-red-500">취소</button>
                            </div>
                          )}
                        </div>
                        {editingSection === 'apiurl' ? (
                          <input 
                            type="text" 
                            value={tempApiUrl}
                            onChange={(e) => setTempApiUrl(e.target.value)}
                            className="w-full bg-white rounded-xl px-4 py-3 text-xs focus:outline-none border border-[#141414]/5"
                          />
                        ) : (
                          <div className="text-[10px] font-mono text-[#141414]/40 bg-white p-3 rounded-xl border border-[#141414]/5 break-all max-h-12 overflow-hidden">
                            {apiUrl ? apiUrl.substring(0, 45) + '...' : '미설정됨'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Performance Settings */}
                    <div className="bg-[#F5F5F0]/50 p-6 rounded-3xl space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-bold text-[#5A5A40]/60">검색 성능 설정 (고급)</label>
                        {editingSection !== 'performance' ? (
                          <button onClick={() => { setEditingSection('performance'); setTempPerformance({ fetchLimit, candidateLimit }); }} className="text-[10px] font-bold text-[#5A5A40] flex items-center gap-1">
                            <Edit2 className="w-3 h-3" /> 수정
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => { setFetchLimit(tempPerformance.fetchLimit); setCandidateLimit(tempPerformance.candidateLimit); setEditingSection(null); }} className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                              <Save className="w-3 h-3" /> 저장
                            </button>
                            <button onClick={() => setEditingSection(null)} className="text-[10px] font-bold text-red-500">취소</button>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold text-[#5A5A40]/40 uppercase">전수 조사 개수 (최대 5000)</span>
                          <input 
                            type="number" 
                            disabled={editingSection !== 'performance'}
                            value={editingSection === 'performance' ? tempPerformance.fetchLimit : fetchLimit}
                            onChange={(e) => setTempPerformance({...tempPerformance, fetchLimit: Math.min(5000, parseInt(e.target.value) || 0)})}
                            className="w-full bg-white rounded-xl px-3 py-2 text-xs focus:outline-none disabled:opacity-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold text-[#5A5A40]/40 uppercase">경로 계산 후보군 (최대 5000)</span>
                          <input 
                            type="number" 
                            disabled={editingSection !== 'performance'}
                            value={editingSection === 'performance' ? tempPerformance.candidateLimit : candidateLimit}
                            onChange={(e) => setTempPerformance({...tempPerformance, candidateLimit: Math.min(5000, parseInt(e.target.value) || 0)})}
                            className="w-full bg-white rounded-xl px-3 py-2 text-xs focus:outline-none disabled:opacity-50"
                          />
                        </div>
                      </div>
                      <p className="text-[9px] text-red-500/70 leading-relaxed">
                        * 후보군이 너무 많으면(예: 5000개) 검색이 매우 느려지거나 무한 루프에 빠질 수 있습니다. 기본값(70~100)을 권장합니다.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-white border-t border-[#141414]/5">
                  <button 
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="w-full bg-[#141414] text-white rounded-2xl py-4 font-bold hover:bg-black transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Results Panel */}
        <div className={`${showSettings ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6`}>
          {totalFound !== null && (
            <div className="flex items-center justify-between bg-white px-6 py-3 rounded-2xl border border-[#141414]/5 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-widest text-[#5A5A40]/60">
                  실시간 데이터 연결됨
                </p>
              </div>
              <p className="text-xs font-bold">
                총 {totalFound}개 발견 <span className="mx-2 text-[#141414]/10">|</span> {campgrounds.length}개 필터링됨
              </p>
            </div>
          )}

          <AnimatePresence>
          {targetCamps.length > 0 && (
            <motion.div 
              initial={{ y: 100, opacity: 0, x: '-50%' }}
              animate={{ y: 0, opacity: 1, x: '-50%' }}
              exit={{ y: 100, opacity: 0, x: '-50%' }}
              className="fixed bottom-6 left-1/2 z-50 w-[90%] max-w-2xl bg-white/95 backdrop-blur-lg border border-emerald-200 p-4 rounded-3xl shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-xs font-bold text-emerald-800 flex items-center gap-2 uppercase tracking-widest">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  실시간 다중 감시 중 ({targetCamps.length}개)
                </p>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto px-1 pb-1">
                {targetCamps.map(c => (
                  <div key={c.name} className="bg-emerald-50 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 border border-emerald-200 shadow-sm flex items-center gap-2 transition-all hover:bg-emerald-100">
                    {c.name}
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleTargetCamp({ facltNm: c.name } as Campground, c.url); }}
                      className="text-emerald-400 hover:text-red-500 transition-colors ml-1 p-0.5 rounded-full hover:bg-white"
                      title="감시 목록에서 제외"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          </AnimatePresence>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-[#5A5A40]/20 border-t-[#5A5A40] rounded-full animate-spin" />
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm font-bold text-[#5A5A40] animate-pulse">최적의 캠핑장을 찾는 중...</p>
                <p className="text-xs text-[#5A5A40]/60">{loadingStatus}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {campgrounds.length > 0 ? (
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${targetCamps.length > 0 ? 'pb-48' : 'pb-20'}`}>
              {campgrounds.map((camp, idx) => {
                const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(camp.facltNm)}`;
                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#141414]/5 hover:shadow-xl transition-all group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={camp.firstImageUrl || `https://picsum.photos/seed/${camp.contentId}/800/600`}
                        alt={camp.facltNm}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          {camp.doNm} {camp.sigunguNm}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-[#141414] group-hover:text-[#5A5A40] transition-colors">
                          <a href={naverMapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            {camp.facltNm}
                            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </h3>
                      </div>
                      
                      <p className="text-xs text-[#141414]/50 mb-6 line-clamp-1">{camp.addr1}</p>
                      
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-3">
                          <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-amber-700/80 mb-1">
                            <Home className="w-3 h-3" /> 집에서 (주행)
                          </div>
                          <div className="flex items-baseline gap-1">
                            <p className="text-lg font-bold text-amber-900">
                              {camp.timeHome && camp.timeHome > 0 ? camp.timeHome : 'N/A'} 
                              {camp.timeHome && camp.timeHome > 0 && <span className="text-[10px] font-normal ml-0.5">분</span>}
                            </p>
                            {camp.roadDistHome && (
                              <p className="text-[10px] text-amber-700/60 font-medium ml-auto">
                                {camp.roadDistHome}km
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-3">
                          <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-blue-700/80 mb-1">
                            <Briefcase className="w-3 h-3" /> 직장에서 (주행)
                          </div>
                          <div className="flex items-baseline gap-1">
                            <p className="text-lg font-bold text-blue-900">
                              {camp.timeWork && camp.timeWork > 0 ? camp.timeWork : 'N/A'} 
                              {camp.timeWork && camp.timeWork > 0 && <span className="text-[10px] font-normal ml-0.5">분</span>}
                            </p>
                            {camp.roadDistWork && (
                              <p className="text-[10px] text-blue-700/60 font-medium ml-auto">
                                {camp.roadDistWork}km
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6">
                        <div className="flex items-center text-[10px] uppercase font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100">
                          <span className="relative flex h-2 w-2 mr-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                          </span>
                          잔여석 직접확인 요망
                        </div>
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">
                          <Tent className="w-3 h-3" /> 파쇄석
                        </div>
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                          <Car className="w-3 h-3" /> 사이트옆주차
                        </div>
                        {camp.lctCl && camp.lctCl.split(',').map((tag: string, i: number) => (
                          <span key={i} className="text-[10px] font-bold px-2 py-1 bg-[#141414]/5 rounded-md text-[#141414]/60">
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2 relative z-10 w-full cursor-auto mt-4 pt-4 border-t border-[#141414]/5">
                        {(() => {
                          let cleanResveUrl = camp.resveUrl || '';
                          const urlRegex = /(https?:\/\/[^\s,]+)/g;
                          const matches = cleanResveUrl.match(urlRegex);
                          if (matches && matches.length > 0) cleanResveUrl = matches[0];

                          const isValidResve = cleanResveUrl && cleanResveUrl.startsWith('http') && !cleanResveUrl.includes(window.location.hostname);
                          const finalUrl = isValidResve ? cleanResveUrl : naverMapUrl;
                          
                          return (
                            <>
                              <a href={naverMapUrl} target="_blank" rel="noreferrer" className="flex-1 py-2.5 rounded-xl text-[11px] font-bold tracking-widest flex items-center justify-center gap-1.5 transition-colors bg-gray-100 text-[#141414]/70 hover:bg-gray-200 shadow-sm border border-gray-200">
                                <MapPin className="w-3 h-3" /> 지도 보기
                              </a>

                              <a 
                                href={finalUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold tracking-widest flex items-center justify-center gap-1.5 transition-colors shadow-sm ${
                                  isValidResve 
                                    ? "bg-[#141414] text-white hover:bg-[#5A5A40]" 
                                    : "bg-[#5A5A40] text-white hover:bg-[#4A4A30]"
                                }`}
                              >
                                {isValidResve ? <><ExternalLink className="w-3 h-3" /> 공식예약</> : <><Search className="w-3 h-3" /> 네이버확인</>}
                              </a>
                              
                              {(() => {
                                const isTargeted = targetCamps.some(t => t.name === camp.facltNm);
                                return (
                                  <button 
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleTargetCamp(camp, finalUrl); }}
                                    className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold tracking-widest flex items-center justify-center gap-1.5 transition-colors border shadow-sm ${
                                      isTargeted 
                                      ? "text-red-700 bg-red-50 hover:bg-red-100 border-red-200" 
                                      : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                                    }`}
                                  >
                                    {isTargeted ? <><X className="w-3 h-3" /> 감시 끄기</> : <><Bell className="w-3 h-3" /> 알림 켜기</>}
                                  </button>
                                );
                              })()}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : !loading && !error && (
            <div className="h-[60vh] flex flex-col items-center justify-center text-[#5A5A40]/40">
              <Tent className="w-24 h-24 mb-4 opacity-20" />
              <p className="font-serif italic text-xl">완벽한 캠핑장을 찾을 준비가 되셨나요?</p>
              <p className="text-xs uppercase tracking-widest mt-2">API 키를 설정하고 검색을 시작하세요</p>
            </div>
          )}
        </div>
      </main>
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 lg:bottom-12 right-6 z-[60] bg-[#141414] text-white p-3.5 rounded-full shadow-2xl hover:bg-[#5A5A40] transition-colors border border-white/20"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
