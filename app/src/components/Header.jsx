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
    <header className="w-full bg-white border-b border-[#E5E5E3] sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
        
        {/* TOP / LEFT: BRAND & MODE TABS */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2">
          {/* Brand Mark */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="font-black text-xs md:text-sm text-[#191919] tracking-tight">
              EPS-TOPIK PRO
            </span>
          </div>

          {/* Segmented Controls (3 Modes) */}
          <nav className="flex items-center bg-[#F2F2F0] p-1 rounded-xl gap-0.5" aria-label="Mode Aplikasi">
            <button
              onClick={() => { setMode('study'); stopAllAudio(); }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'study' 
                  ? 'bg-white text-blue-700 shadow-2xs' 
                  : 'text-[#6e6e6a] hover:text-[#191919]'
              }`}
            >
              Materi
            </button>
            <button
              onClick={() => { setMode('practice'); stopAllAudio(); }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'practice' 
                  ? 'bg-white text-[#191919] shadow-2xs' 
                  : 'text-[#6e6e6a] hover:text-[#191919]'
              }`}
            >
              Latihan
            </button>
            <button
              onClick={() => { setMode('exam'); stopAllAudio(); }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'exam' 
                  ? 'bg-blue-600 text-white shadow-2xs' 
                  : 'text-[#6e6e6a] hover:text-[#191919]'
              }`}
            >
              Simulasi Ujian
            </button>
          </nav>
        </div>

        {/* PROGRESS BAR (IF IN EXAM RUNNING) */}
        {mode === 'exam' && examPhase === 'running' && (
          <div className="w-full sm:flex-1 max-w-xs mx-2">
            <div className="w-full bg-[#EFEFED] rounded-full h-2 overflow-hidden">
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
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-white border border-[#E5E5E3] hover:border-slate-400 text-xs font-bold text-[#191919] flex items-center justify-center gap-1.5 shadow-2xs transition-all"
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
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
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
