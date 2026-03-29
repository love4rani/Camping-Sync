import React from 'react';
import { HelpCircle, RefreshCw, Edit3, Github, Save, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Guide({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-w-2xl w-full translate-z-0">
      <div className="px-8 pt-8 pb-6 bg-slate-50 flex justify-between items-center border-b border-slate-200">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-6 h-6 text-primary" />
          <h2 className="font-headline font-bold text-2xl text-slate-800">DB Management 가이드</h2>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
          <span className="material-symbols-outlined text-slate-400">close</span>
        </button>
      </div>

      <div className="p-8 space-y-8 overflow-y-auto no-scrollbar max-h-[70vh]">
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <RefreshCw className="w-5 h-5 animate-spin-slow" />
            <h3 className="font-bold">1단계: GoCamping 데이터 동기화</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed pl-8">
            상단의 <strong>'동기화 (GoCamping)'</strong> 버튼을 클릭하여 공공데이터 API에서 최신 정보를 가져옵니다. 
            이미 등록된 데이터와 비교하여 변경된 내역을 시각적으로 보여주며, '일괄 적용' 시 로컬 메모리에 즉시 반영됩니다.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-sky-500">
            <Edit3 className="w-5 h-5" />
            <h3 className="font-bold">2단계: 정밀 편집 및 상태 관리</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed pl-8">
            목록에서 특정 캠핑장을 선택해 정보를 수정하거나 영업 상태(영업/휴업/폐업)를 관리하세요. 
            소개 본문에서 가격 정보를 자동으로 추출하는 기능이 내장되어 있어 관리가 더욱 편리합니다.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-emerald-600">
            <Save className="w-5 h-5" />
            <h3 className="font-bold">3단계: 로컬 저장</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed pl-8">
            편집된 내용은 <strong>'로컬 저장'</strong> 버튼을 눌러야 실제 <code className="bg-slate-100 px-1 rounded">camping-db.json</code> 파일에 기록됩니다. 
            저장 전까지는 파일에 영향을 주지 않으므로 안심하고 마음껏 편집하세요.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-slate-800">
            <Github className="w-5 h-5" />
            <h3 className="font-bold">4단계: GitHub 저장소 배포</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed pl-8">
            상단의 <strong>'GitHub 배포'</strong> 버튼을 클릭하세요. 
            작성된 내용이 GitHub 저장소로 직접 푸시되어, 실제 모바일 앱 사용자들이 즉시 업데이트된 정보를 받을 수 있게 됩니다.
          </p> 
        </section>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-xs text-emerald-700 font-medium">
            <strong>Tip:</strong> 지역 필터 오작동 방지를 위해 수집 시 '경기도' 등의 긴 지역명을 '경기'와 같은 표준형 2글자로 자동 정규화합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
