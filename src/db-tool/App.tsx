import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { 
  RefreshCw, 
  Save, 
  Github, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Database,
  Info,
  MapPin,
  X,
  Plus,
  HelpCircle,
  BarChart3,
  Download,
  Upload,
  Layout,
  Check,
  FolderOpen,
  Calendar,
  Send
} from 'lucide-react';
import Guide from './Guide';
import VersionHistory from './VersionHistory';

interface Campground {
  id: string;
  nm: string;
  addr: string;
  lat: number;
  lng: number;
  do: string;
  sigungu: string;
  type: string;
  env: string;
  fac: string;
  img: string;
  resve: string;
  price: number | null;
  stone: boolean;
  parking: boolean;
  camfit: boolean;
  status?: number; // 0: 영업정상, 1: 임시휴업, 2: 영구폐업
}

interface DBFile {
  version: string;
  items: Campground[];
}

const API_BASE = 'http://localhost:3001/api';
const PAGE_SIZE = 50;

const MASTER_TAGS = {
  types: ["일반야영장", "자동차야영장", "카라반", "글램핑"],
  envs: ["숲", "계곡", "해변", "섬", "산", "강", "호수", "평지", "도심"],
  facs: ["전기", "와이파이", "장작판매", "온수", "트램폴린", "물놀이장", "산책로", "운동시설", "투어"]
};

const getStatusLabel = (code?: number) => {
  if (code === 1) return '임시휴업';
  if (code === 2) return '영구폐업';
  return '영업정상';
};

export default function App() {
  const [db, setDb] = useState<DBFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDo, setFilterDo] = useState('전체');
  const [filterStatus, setFilterStatus] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<Campground | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [diffResults, setDiffResults] = useState<{ new: any[], updated: any[], removed: any[] } | null>(null);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  
  // 배포 관련 상태
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [githubPat, setGithubPat] = useState(() => (import.meta as any).env.VITE_GITHUB_PAT || '');
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [nextVersion, setNextVersion] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchDB(); }, []);

  const fetchDB = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/db`);
      setDb(res.data);
      
      // 저장 예정 버전 초기값 설정 (현재 시각)
      updateNextVersion();
      
      showToast('DB 파일 로드 성공', 'info');
    } catch (err) { showToast('DB 로드 실패', 'error'); } 
    finally { setLoading(false); }
  };

  const updateNextVersion = () => {
    const now = new Date();
    const formatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setNextVersion(formatted);
  };

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
     setToast({ msg, type });
     setTimeout(() => setToast(null), 3000);
  };

  const extractPrice = (text: string): number | null => {
    if (!text) return null;
    const p1 = text.match(/(\d{1,3}(?:,\d{3})+)\s*원/); if (p1) return parseInt(p1[1].replace(/,/g, ''));
    const p2 = text.match(/(\d{1,2})만\s*원/); if (p2) return parseInt(p2[1]) * 10000;
    const p3 = text.match(/(\d{5,6})\s*원/); if (p3) return parseInt(p3[1]);
    return null;
  };

  const handleSyncFromAPI = async () => {
    try {
      setSyncing(true);
      const res = await axios.get(`${API_BASE}/gocamping/fetch`);
      const remoteItems = res.data?.response?.body?.items?.item || [];
      const current = db?.items || [];
      const results = { new: [] as Campground[], updated: [] as any[], removed: [] as Campground[] };

      remoteItems.forEach((r: any) => {
        const existing = current.find(c => c.id === r.contentId);
        const mapped: Campground = {
          id: r.contentId, nm: r.facltNm, addr: r.addr1,
          lat: parseFloat(r.mapY || 0), lng: parseFloat(r.mapX || 0),
          do: r.doNm || "", sigungu: r.sigunguNm,
          type: r.induty || "", env: r.lctCl || "", fac: r.sbrsCl || "",
          img: r.firstImageUrl || "", resve: r.resveUrl || "",
          price: extractPrice(r.intro + r.featureNm),
          stone: (r.sbrsCl || '').includes('파쇄석'),
          parking: (r.sbrsCl || '').includes('사이트옆주차'),
          camfit: (r.resveUrl || '').includes('camfit'),
          status: 0
        };
        if (!existing) results.new.push(mapped);
        else if (existing.nm !== mapped.nm || existing.addr !== mapped.addr || (mapped.price && existing.price !== mapped.price)) {
          results.updated.push({ id: existing.id, old: existing, new: { ...existing, ...mapped } });
        }
      });
      current.forEach(c => {
         if (!remoteItems.find((r: any) => r.contentId === c.id) && c.status !== 2) results.removed.push(c);
      });
      setDiffResults(results); setIsDiffModalOpen(true);
    } catch (err) { showToast('API 불러오기 실패', 'error'); } 
    finally { setSyncing(false); }
  };

  const applySync = () => {
    if (!diffResults || !db) return;
    let updatedItems = [...db.items];
    const uniqueNew = diffResults.new.filter(n => !updatedItems.find(u => u.id === n.id));
    updatedItems = [...uniqueNew, ...updatedItems];
    diffResults.updated.forEach(u => {
      const idx = updatedItems.findIndex(i => i.id === u.id);
      if (idx > -1) updatedItems[idx] = { ...updatedItems[idx], ...u.new };
    });
    diffResults.removed.forEach(r => {
      const idx = updatedItems.findIndex(i => i.id === r.id);
      if (idx > -1) updatedItems[idx] = { ...updatedItems[idx], status: 1 };
    });
    const now = new Date();
    const formattedVersion = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setDb({ ...db, items: updatedItems, version: formattedVersion });
    setIsDiffModalOpen(false); showToast('업데이트 반영됨 (저장 필요)', 'success');
  };

  const handleSaveLocal = async () => {
    if (!db) return;
    try {
      // 저장 시점에 버전 확정
      const finalVer = nextVersion;
      const res = await axios.post(`${API_BASE}/db/save`, { ...db, version: finalVer });
      if (res.data.success) {
        showToast(`JSON 파일 저장 완료 (${finalVer})`, 'success');
        setDb({ ...db, version: finalVer });
        updateNextVersion(); // 다음 저장을 위해 갱신
      }
    } catch (err) { showToast('저장 실패', 'error'); }
  };

  const handleOpenPublishModal = () => {
    if (!db) return;
    setCommitMessage(`DB 업데이트: ${db.version} (데이터 ${db.items.length}건)`);
    setIsPublishModalOpen(true);
  };

  const handlePublishFinal = async () => {
    if (!db || !githubPat) {
      showToast('GitHub PAT가 필요합니다.', 'error');
      return;
    }
    try {
      setIsPublishing(true);
      showToast('GitHub 배포 전송 중...', 'info');
      await axios.post(`${API_BASE}/github/publish`, {
        owner: 'love4rani', repo: 'Camping-Sync', path: 'public/camping-db.json',
        message: commitMessage, content: JSON.stringify(db, null, 2),
        token: githubPat // API 서버에서 처리하도록 전달
      });
      showToast('GitHub 배포 성공!', 'success');
      setIsPublishModalOpen(false);
    } catch (err: any) { 
      showToast(`배포 실패: ${err.response?.data?.error || err.message}`, 'error'); 
    } finally {
      setIsPublishing(false);
    }
  };


  // --- CSV / Utils ---
  const exportCSV = () => {
    if (!db) return;
    const header = "ID,이름,주소,도,시군구,업종,입지,가격,운영상태코드\n";
    const rows = db.items.map(i => `${i.id},"${i.nm}","${i.addr}",${i.do},${i.sigungu},"${i.type}","${i.env}",${i.price || 0},${i.status ?? 0}`).join("\n");
    const blob = new Blob(["\uFEFF" + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.setAttribute("download", `camping_db_${db.version}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !db) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").slice(1);
      const newItems = [...db.items];
      lines.filter(l => l.trim()).forEach(line => {
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const id = parts[0];
        const idx = newItems.findIndex(n => n.id === id);
        if (idx > -1) {
            newItems[idx] = { ...newItems[idx], nm: parts[1]?.replace(/"/g, '') || newItems[idx].nm, status: parseInt(parts[8]) || 0 };
        }
      });
      setDb({ ...db, items: newItems });
      showToast('CSV 데이터 병합 완료', 'success');
    };
    reader.readAsText(file);
  };

  const dynamicDoList = useMemo(() => {
    if (!db) return ['전체'];
    const dos = new Set(db.items.map(i => i.do).filter(Boolean).sort());
    return ['전체', ...Array.from(dos)];
  }, [db]);

  const stats = useMemo(() => {
    if (!db) return { total: 0, normal: 0, suspended: 0, closed: 0 };
    return db.items.reduce((acc, i) => {
      acc.total++;
      if (i.status === 2) acc.closed++;
      else if (i.status === 1) acc.suspended++;
      else acc.normal++;
      return acc;
    }, { total: 0, normal: 0, suspended: 0, closed: 0 });
  }, [db]);

  const filteredItems = useMemo(() => {
    if (!db) return [];
    return db.items.filter(i => {
      const matchesSearch = i.nm.toLowerCase().includes(searchTerm.toLowerCase()) || i.addr.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDo = filterDo === '전체' || i.do === filterDo;
      const statusCode = filterStatus === '영업정상' ? 0 : filterStatus === '임시휴업' ? 1 : filterStatus === '영구폐업' ? 2 : -1;
      const matchesStatus = filterStatus === '전체' || (i.status === statusCode || (statusCode === 0 && !i.status));
      return matchesSearch && matchesDo && matchesStatus;
    });
  }, [db, searchTerm, filterDo, filterStatus]);

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);
  const paginatedItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleTag = (type: 'types' | 'envs' | 'facs', tag: string) => {
     if (!selectedItem) return;
     const field = type === 'types' ? 'type' : type === 'envs' ? 'env' : 'fac';
     const tags = (selectedItem as any)[field].split(',').map((t: string) => t.trim()).filter((t: string) => t);
     const newTags = tags.includes(tag) ? tags.filter((t: string) => t !== tag) : [...tags, tag];
     setSelectedItem({ ...selectedItem, [field]: newTags.join(', ') });
  };

  if (loading && !db) return <div className="h-screen flex items-center justify-center bg-slate-50"><RefreshCw className="w-10 h-10 text-primary animate-spin" /></div>;

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col overflow-hidden font-body text-slate-800">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-primary" />
          <h1 className="font-bold text-lg">Camping-Sync <span className="text-slate-400 font-medium">Master</span></h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsGuideOpen(true)} className="p-2.5 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200"><HelpCircle className="w-5 h-5" /></button>
          <button onClick={handleSyncFromAPI} disabled={syncing} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 flex items-center gap-2"><RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} /> 고캠핑 불러오기</button>
          <button onClick={handleSaveLocal} className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:shadow-lg transition-all flex items-center gap-2"><Save className="w-3 h-3" /> 로컬 저장</button>
          <button onClick={handleOpenPublishModal} className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 flex items-center gap-2"><Github className="w-3 h-3" /> 배포하기</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 shrink-0 overflow-y-auto no-scrollbar">
           {/* 데이터 요약 및 버전 */}
           <section className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1"><BarChart3 className="w-3 h-3" /> 마스터 DB 요약</h4>
              <div className="grid grid-cols-2 gap-2">
                 <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Total</p>
                    <p className="text-sm font-black text-slate-700">{stats.total.toLocaleString()}</p>
                 </div>
                 <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-emerald-400 uppercase">Normal</p>
                    <p className="text-sm font-black text-emerald-600">{stats.normal.toLocaleString()}</p>
                 </div>
                 <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-amber-400 uppercase">Suspended</p>
                    <p className="text-sm font-black text-amber-600">{stats.suspended.toLocaleString()}</p>
                 </div>
                 <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-rose-400 uppercase">Closed</p>
                    <p className="text-sm font-black text-rose-600">{stats.closed.toLocaleString()}</p>
                 </div>
              </div>
              
              <div className="p-5 bg-slate-900 rounded-[2rem] space-y-4 shadow-xl border border-slate-800">
                 <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Version Control</label>
                    <button onClick={() => setIsHistoryModalOpen(true)} className="text-[9px] font-bold text-primary hover:underline flex items-center gap-1"><RefreshCw className="w-2.5 h-2.5" /> History</button>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-3">
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                       <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Current File Version</p>
                       <p className="text-[11px] font-bold text-slate-300">{db?.version || 'Unknown'}</p>
                    </div>
                    <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                       <p className="text-[8px] font-black text-primary/60 uppercase mb-1">Next Version (On Save)</p>
                       <div className="flex items-center gap-2">
                          <input type="text" value={nextVersion} onChange={e => setNextVersion(e.target.value)} className="bg-transparent border-none text-[11px] font-black text-primary w-full outline-none" />
                          <button onClick={updateNextVersion} className="p-1 hover:bg-primary/10 rounded text-primary"><RefreshCw className="w-3 h-3" /></button>
                       </div>
                    </div>
                 </div>
                 
                 <button onClick={fetchDB} className="w-full py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center gap-2 transition-all"><FolderOpen className="w-3 h-3" /> 파일 다시 불러오기</button>
              </div>
           </section>

           <section className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1"><Filter className="w-3 h-3" /> 조건 필터링</h4>
              <div className="space-y-4">
                 <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-300 pl-1">통합 검색</label>
                 <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="이름, 주소..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:bg-white transition-all" /></div></div>
                 <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-300 pl-1">지역 (Do)</label><select value={filterDo} onChange={e => setFilterDo(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none">{dynamicDoList.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                 <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-300 pl-1">운영 상태</label><div className="flex flex-col gap-1">{['전체', '영업정상', '임시휴업', '영구폐업'].map(s => (<button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 rounded-xl text-left text-xs font-bold transition-all ${filterStatus === s ? 'bg-primary text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{s}</button>))}</div></div>
              </div>
           </section>

           <section className="space-y-4 mt-auto">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1"><Download className="w-3 h-3 inline mr-2" /> 데이터 유틸리티</h4>
              <div className="grid grid-cols-2 gap-2">
                 <button onClick={exportCSV} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center gap-2 hover:bg-slate-100 text-slate-500 transition-all"><Download className="w-4 h-4" /><span className="text-[10px] font-bold">CSV 익스포트</span></button>
                 <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center gap-2 hover:bg-slate-100 text-slate-500 transition-all"><Upload className="w-4 h-4" /><span className="text-[10px] font-bold">CSV 임포트</span></button>
                 <input type="file" ref={fileInputRef} onChange={importCSV} accept=".csv" className="hidden" />
              </div>
           </section>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/30">
           <div className="flex-1 overflow-y-auto p-6 scroll-smooth no-scrollbar">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-w-[900px]">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
                       <tr><th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">캠핑장 마스터 정보</th><th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">주소</th><th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">요금</th><th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">상태</th><th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">제어</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {paginatedItems.map(item => (
                         <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="px-6 py-5"><p className="font-bold text-sm text-slate-800">{item.nm}</p><p className="text-[9px] font-black text-slate-300 uppercase letter-tight">{item.id}</p></td>
                           <td className="px-6 py-5"><p className="text-xs text-slate-500 line-clamp-1"><MapPin className="inline w-3.5 h-3.5 mr-1 align-text-top opacity-30" /> {item.addr}</p></td>
                           <td className="px-6 py-5 text-center font-bold text-primary text-sm">{item.price ? `${item.price.toLocaleString()}원` : '-'}</td>
                           <td className="px-6 py-5 text-center"><span className={`px-2 py-1 rounded-md text-[9px] font-black tracking-wider uppercase ${item.status === 2 ? 'bg-rose-100 text-rose-500' : item.status === 1 ? 'bg-amber-100 text-amber-500' : 'bg-emerald-100 text-emerald-500'}`}>{getStatusLabel(item.status)}</span></td>
                           <td className="px-6 py-5 text-right"><div className="flex justify-end gap-1 opacity-10 group-hover:opacity-100 transition-all"><button onClick={() => { setSelectedItem(item); setIsEditModalOpen(true); }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"><Edit3 className="w-4 h-4" /></button></div></td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           <footer className="h-16 bg-white border-t border-slate-200 px-8 grid grid-cols-3 items-center shrink-0 z-20">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DATA: {filteredItems.length.toLocaleString()}건</p>
              <div className="flex items-center justify-center gap-1">
                 <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-slate-50 disabled:opacity-20"><ChevronLeft className="w-4 h-4" /></button>
                 <div className="flex gap-1 mx-2">{Array.from({ length: Math.min(5, totalPages) }, (_, i) => { let p = currentPage - 2 + i; if(currentPage <= 2) p = i + 1; if(currentPage >= totalPages - 1) p = totalPages - 4 + i; if(p < 1 || p > totalPages) return null; return <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === p ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>{p}</button>; })}</div>
                 <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-slate-50 disabled:opacity-20"><ChevronRight className="w-4 h-4" /></button>
              </div>
              <p className="text-right text-[10px] font-bold text-slate-300 uppercase tracking-widest">PAGE {currentPage} / {totalPages || 1}</p>
           </footer>
        </main>
      </div>

      {/* --- Modals --- */}
      <AnimatePresence>
        {isEditModalOpen && selectedItem && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
               <div className="px-10 py-8 flex justify-between items-center bg-slate-50 border-b border-slate-200"><h2 className="font-bold text-2xl flex items-center gap-3"><Edit3 className="w-7 h-7 text-primary" /> 데이터 수정</h2><button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-slate-200 transition-all flex items-center justify-center text-slate-400"><X className="w-6 h-6" /></button></div>
               <div className="p-10 grid grid-cols-2 gap-10 overflow-y-auto no-scrollbar">
                  <div className="space-y-6">
                     <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">기본 식별 정보</h4>
                     <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">캠핑장 이름</label><input value={selectedItem.nm} onChange={e => setSelectedItem({...selectedItem, nm: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none" /></div>
                     <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">1박 요금</label><div className="relative"><input type="number" value={selectedItem.price || ''} onChange={e => setSelectedItem({...selectedItem, price: parseInt(e.target.value) || null})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">KRW</span></div></div>
                     <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">운영 현황</label><div className="flex gap-2 text-center">{[0, 1, 2].map(v => (<button key={v} onClick={() => setSelectedItem({...selectedItem, status: v})} className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all ${selectedItem.status === v ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}>{getStatusLabel(v)}</button>))}</div></div>
                     <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">정밀 소재지</label><textarea value={selectedItem.addr} onChange={e => setSelectedItem({...selectedItem, addr: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs h-24 no-scrollbar resize-none" /></div>
                  </div>
                  <div className="space-y-8">
                     <h4 className="text-[10px] font-black text-sky-500 uppercase tracking-widest">속성/환경 옵션</h4>
                     <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">분류 (Induty)</label><div className="flex flex-wrap gap-1.5">{MASTER_TAGS.types.map(t => (<button key={t} onClick={() => toggleTag('types', t)} className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all border ${selectedItem.type.includes(t) ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>{t}</button>))}</div></div>
                     <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">환경 (LctCl)</label><div className="flex flex-wrap gap-1.5">{MASTER_TAGS.envs.map(t => (<button key={t} onClick={() => toggleTag('envs', t)} className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all border ${selectedItem.env.includes(t) ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>{t}</button>))}</div></div>
                     <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">시설 (SbrsCl)</label><div className="flex flex-wrap gap-1.5">{MASTER_TAGS.facs.map(t => (<button key={t} onClick={() => toggleTag('facs', t)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${selectedItem.fac.includes(t) ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{t}</button>))}</div></div>
                  </div>
               </div>
               <div className="p-8 bg-white border-t border-slate-100 flex gap-4"><button onClick={() => setIsEditModalOpen(false)} className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-500 font-bold text-sm">취소</button><button onClick={() => { if (!db) return; const idx = db.items.findIndex(i => i.id === selectedItem.id); if (idx > -1) { const items = [...db.items]; items[idx] = selectedItem; setDb({...db, items}); } setIsEditModalOpen(false); showToast('정상 업데이트되었습니다.', 'success'); }} className="flex-1 py-4 rounded-2xl vibe-gradient text-white font-bold text-sm shadow-xl">설정 즉시 반영</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPublishModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8 flex flex-col gap-6">
               <div className="flex flex-col gap-2 items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-white mb-2"><Github className="w-8 h-8" /></div>
                  <h3 className="font-bold text-xl">GitHub 배포 컨펌</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">현재 DB 마스터 데이터를 외부 저장소로 배포합니다.<br/>앱 서비스에 즉시 영향을 줄 수 있습니다.</p>
               </div>
               <div className="space-y-4">
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">배포 기록 (Commit Message)</label><textarea value={commitMessage} onChange={e => setCommitMessage(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs h-20 outline-none focus:bg-white transition-all resize-none" /></div>
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">GitHub Access Token (PAT)</label><div className="relative"><input type="password" value={githubPat} onChange={e => setGithubPat(e.target.value)} placeholder="ghp_..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] outline-none" /></div><p className="text-[9px] text-slate-400 px-1 pt-1 opacity-60">* 세션 동안 임시로 기억하며, .env 설정 시 자동 로드됩니다.</p></div>
               </div>
               <div className="flex gap-2 pt-2">
                  <button onClick={() => setIsPublishModalOpen(false)} className="flex-1 py-3 text-xs font-bold text-slate-400 hover:text-slate-600">취소</button>
                  <button onClick={handlePublishFinal} disabled={isPublishing} className="flex-[2] py-3 bg-slate-800 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-slate-900 disabled:opacity-50 transition-all">{isPublishing ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Send className="w-3 h-3"/>} 최종 배포 전송</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- 버전 히스토리 모달 (모듈화됨) --- */}
      <VersionHistory 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        apiBase={API_BASE}
        githubPat={githubPat}
        currentVersion={db?.version || ''}
        onRestoreSuccess={fetchDB}
        showToast={showToast}
      />

      <AnimatePresence>
        {isDiffModalOpen && diffResults && (
           <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDiffModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" /><motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"><div className="px-8 pt-8 pb-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center"><h2 className="font-bold text-2xl text-slate-800">공공데이터 대조 결과</h2><X className="w-6 h-6 text-slate-400 cursor-pointer" onClick={() => setIsDiffModalOpen(false)} /></div><div className="p-8 space-y-6 overflow-y-auto no-scrollbar max-h-[60vh]">{diffResults.new.length > 0 && (<div className="space-y-3"><h4 className="font-black text-xs text-primary uppercase tracking-widest flex items-center gap-2"><Plus className="w-3 h-3" /> 신규 발견 캠핑장 ({diffResults.new.length})</h4><div className="border border-emerald-500/10 rounded-2xl bg-emerald-50/20 divide-y divide-emerald-500/10">{diffResults.new.slice(0, 10).map(n => (<div key={n.id} className="p-4 flex justify-between"><div><p className="font-bold text-xs">{n.nm} <span className="opacity-30 text-[9px]">{n.id}</span></p><p className="text-[10px] text-slate-400">{n.addr}</p></div><span className="text-[10px] font-black text-primary px-2 py-0.5 bg-white rounded border border-primary/20">NEW</span></div>))}</div></div>)}</div><div className="p-8 bg-slate-100 flex gap-4"><button onClick={() => setIsDiffModalOpen(false)} className="flex-1 py-4 rounded-2xl bg-white border border-slate-200 text-slate-400 font-bold text-sm">무시</button><button onClick={applySync} className="flex-1 py-4 rounded-2xl vibe-gradient text-white font-bold text-sm shadow-xl">업데이트 반영</button></div></motion.div></div>
        )}
      </AnimatePresence>

      <AnimatePresence>{isGuideOpen && (<div className="fixed inset-0 z-[1100] flex items-center justify-center p-8"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsGuideOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" /><motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative z-10 w-full max-w-2xl"><Guide onClose={() => setIsGuideOpen(false)} /></motion.div></div>)}</AnimatePresence>

      <AnimatePresence>{toast && (<motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[3000] w-[90%] max-w-sm"><div className={`px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border backdrop-blur-md ${toast.type === 'error' ? 'bg-rose-500/95 text-white border-rose-400' : toast.type === 'info' ? 'bg-slate-800/95 text-white border-slate-700' : 'bg-emerald-500/95 text-white border-emerald-400'}`}><CheckCircle2 className="w-5 h-5 flex-shrink-0" /><p className="text-sm font-bold tracking-tight">{toast.msg}</p></div></motion.div>)}</AnimatePresence>
    </div>
  );
}
