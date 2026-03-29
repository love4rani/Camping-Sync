/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * [Feature] DB 도구 전용 Git/버전 히스토리 매니저
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import axios from 'axios';
import { 
  X, 
  Database, 
  RefreshCw, 
  Github, 
  Info,
  Clock,
  ArrowLeftCircle
} from 'lucide-react';

interface VersionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
  githubPat: string;
  currentVersion: string;
  onRestoreSuccess: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

/**
 * 로컬 백업 및 GitHub 온라인 버전 이력을 조회하고 복구를 실행하는 컴포넌트
 */
const VersionHistory = ({
  isOpen,
  onClose,
  apiBase,
  githubPat,
  currentVersion,
  onRestoreSuccess,
  showToast
}: VersionHistoryProps) => {
  const [historyTab, setHistoryTab] = useState<'local' | 'github'>('local');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 히스토리 데이터 로드 (로컬 또는 GitHub)
  const fetchHistory = async () => {
    try {
      setLoading(true);
      if (historyTab === 'local') {
        const res = await axios.get(`${apiBase}/db/history`);
        setHistory(res.data);
      } else {
        const res = await axios.get(`${apiBase}/github/history`, {
          params: {
            owner: 'love4rani',
            repo: 'Camping-Sync',
            path: 'public/camping-db.json',
            token: githubPat
          }
        });
        setHistory(res.data);
      }
    } catch (err) {
      showToast('히스토리 로드에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen, historyTab]);

  /**
   * 로컬 백업 파일로 복원
   */
  const handleLocalRestore = async (fileName: string) => {
    if (!window.confirm('선택한 로컬 시점으로 데이터를 복원하시겠습니까? 현재 변경사항은 덮어씌워집니다.')) return;
    try {
      const res = await axios.post(`${apiBase}/db/restore/${fileName}`);
      if (res.data.success) {
        showToast('로컬 데이터 복원이 완료되었습니다.', 'success');
        onRestoreSuccess();
        onClose();
      }
    } catch (err) {
      showToast('로컬 복원에 실패했습니다.', 'error');
    }
  };

  /**
   * GitHub 온라인 커밋으로 복원 (Online Rollback)
   */
  const handleGithubRestore = async (sha: string) => {
    if (!window.confirm(`GitHub의 [${sha.slice(0, 7)}] 시점으로 데이터를 복원하시겠습니까? 온라인의 원본 데이터를 로컬에 즉시 반영합니다.`)) return;
    try {
      const res = await axios.post(`${apiBase}/github/restore`, {
        owner: 'love4rani',
        repo: 'Camping-Sync',
        path: 'public/camping-db.json',
        sha,
        token: githubPat,
        version: currentVersion
      });
      if (res.data.success) {
        showToast('GitHub 온라인 데이터 복원이 완료되었습니다.', 'success');
        onRestoreSuccess();
        onClose();
      }
    } catch (err: any) {
      showToast(`GitHub 복원 실패: ${err.response?.data?.error || err.message}`, 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
      
      {/* 모달 본체 */}
      <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }} className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* 헤더 */}
        <div className="px-10 py-8 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-black text-xl text-slate-800 tracking-tight">Version Center</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local Snapshot & GitHub SVN</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* 탭 전환 */}
        <div className="flex bg-slate-50/50 p-1 mx-10 mt-6 rounded-2xl border border-slate-200/50">
          <button onClick={() => setHistoryTab('local')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${historyTab === 'local' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}>
            <Clock className="w-3.5 h-3.5" /> LOCAL BACKUPS
          </button>
          <button onClick={() => setHistoryTab('github')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${historyTab === 'github' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}>
            <Github className="w-3.5 h-3.5" /> ONLINE (GITHUB)
          </button>
        </div>

        {/* 히스토리 리스트 영역 */}
        <div className="flex-1 overflow-y-auto p-10 no-scrollbar space-y-4">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-bold text-slate-400">데이터 이력을 불러오는 중...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-300 gap-4">
              <Info className="w-12 h-12 opacity-20" />
              <p className="text-sm font-bold">표시할 히스토리가 없습니다.</p>
            </div>
          ) : (
            history.map((item, idx) => (
              <div key={idx} className="group p-5 bg-white border border-slate-100 rounded-2xl hover:border-primary/30 hover:shadow-md transition-all flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className={`w-1 h-8 rounded-full transition-all ${historyTab === 'local' ? 'bg-emerald-100 group-hover:bg-emerald-500' : 'bg-sky-100 group-hover:bg-sky-500'}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${historyTab === 'local' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-sky-50 text-sky-500 border-sky-100'}`}>
                        {item.version || item.sha?.slice(0, 7)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(item.timestamp || item.date).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 line-clamp-1">{item.message}</p>
                    {item.author && <p className="text-[10px] font-medium text-slate-400 mt-1">By {item.author}</p>}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {historyTab === 'local' ? (
                    <button 
                      onClick={() => handleLocalRestore(item.fileName)} 
                      className="px-4 py-2 rounded-xl bg-emerald-50 text-[10px] font-black text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <ArrowLeftCircle className="w-3.5 h-3.5" /> RESTORE
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <a href={item.url} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
                        <Github className="w-4 h-4" />
                      </a>
                      <button 
                        onClick={() => handleGithubRestore(item.sha)} 
                        className="px-4 py-2 rounded-xl bg-sky-50 text-[10px] font-black text-sky-600 hover:bg-sky-500 hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> ONLINE RESTORE
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* 푸터 */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2">
            <Info className="w-3 h-3" /> Total {history.length} snapshots discovered on {historyTab.toUpperCase()}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VersionHistory;
