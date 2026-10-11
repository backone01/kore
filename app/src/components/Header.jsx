import React from 'react';
import { SlidersHorizontal, BookOpen, Layers, Award } from 'lucide-react';

export function Header({ 
  mode, 
  setMode, 
  stopAllAudio, 
  practiceProgress, 
  examProgress, 
  categoriesList, 
  selectedCategory, 
  setCategoryModalOpen, 
  setRevisionModalOpen, 
  examPhase 
}) {
  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-colors">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
        
        {/* TOP / LEFT: BRAND & MODE TABS */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3">
          {/* Brand Mark */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-50" />
            <span className="font-black text-xs md:text-sm text-slate-900 tracking-tight">
              EPS-TOPIK PRO
            </span>
          </div>

          {/* Segmented Controls (3 Modes) */}
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl gap-0.5 border border-slate-200/60" aria-label="Mode Aplikasi">
            <button
              onClick={() => { setMode('study'); stopAllAudio(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'study' 
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Materi
            </button>
            <button
              onClick={() => { setMode('practice'); stopAllAudio(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'practice' 
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Latihan
            </button>
            <button
              onClick={() => { setMode('exam'); stopAllAudio(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'exam' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Simulasi Ujian
            </button>
          </nav>
        </div>

        {/* PROGRESS BAR (IF IN EXAM RUNNING) */}
        {mode === 'exam' && examPhase === 'running' && (
          <div className="w-full sm:flex-1 max-w-xs mx-2">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300" 
                style={{ width: `${examProgress}%` }} 
              />
            </div>
          </div>
        )}

        {/* RIGHT CONTROLS: CATEGORY FILTER & REGULATION BUTTON */}
        <div className="w-full sm:w-auto flex items-center justify-end gap-2 shrink-0">
          {mode === 'practice' && (
            <button
              onClick={() => setCategoryModalOpen(true)}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
              title="Pilih Kategori Soal Latihan"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate max-w-[130px]">
                {categoriesList.find(c => c.id === selectedCategory)?.label?.split('(')[0] || 'Kategori'}
              </span>
            </button>
          )}

          <button
            onClick={() => setRevisionModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
            title="Lihat Regulasi Resmi Revisi HRD Korea 2026"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="whitespace-nowrap">Regulasi HRDK</span>
          </button>
        </div>

      </div>
    </header>
  );
}
