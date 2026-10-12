import React from 'react';
import { X, Layers, UserCheck, Activity, AlertTriangle, ShieldAlert, Wrench, Hash, Check } from 'lucide-react';
import { MAIN_MODULES } from '../utils/categoryGroups.js';

const ICON_MAP = {
  Layers,
  UserCheck,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Wrench,
  Hash
};

export function CategoryModal({
  open,
  onClose,
  categoriesList = [],
  categoryGroups = [],
  selectedCategory,
  setSelectedCategory,
  setCurrentIndex,
  questionsData = []
}) {
  if (!open) return null;

  const pick = (id) => {
    setSelectedCategory(id);
    if (setCurrentIndex) setCurrentIndex(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Pilih Modul & Kategori Soal</h3>
            <p className="text-xs text-slate-500 mt-0.5">Selaras 100% dengan materi hafalan dan tahapan ujian resmi</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scroll */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-slate-900">
          
          {/* SEKSI 1: 6 MODUL UTAMA KISI-KISI TAHAP 2 (REKOMENDASI) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                Pilihan Modul Utama (Rekomendasi)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MAIN_MODULES.map(mod => {
                const IconComponent = ICON_MAP[mod.icon] || Layers;
                const isSelected = selectedCategory === mod.id;
                
                // Hitung total soal
                const count = mod.id === 'all'
                  ? questionsData.length
                  : questionsData.filter(q => mod.categories.includes(q.category)).length;

                return (
                  <button
                    key={mod.id}
                    onClick={() => pick(mod.id)}
                    className={`flex items-start gap-2.5 p-3 rounded-2xl text-left transition-all border active:scale-95 ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-300 text-blue-950 shadow-xs ring-1 ring-blue-400'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isSelected ? 'bg-blue-600 text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black truncate">{mod.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{mod.desc}</p>
                      <span className="inline-block mt-1 text-[10px] font-mono font-bold text-slate-600 bg-white px-2 py-0.2 rounded border border-slate-200">
                        {count} Soal
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEKSI 2: SUB-KATEGORI SPESIFIK */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 block">
              Atau Pilih Sub-Kategori Spesifik:
            </span>

            <div className="space-y-3">
              {categoryGroups.map(g => {
                const items = categoriesList.filter(c => c.group === g.id);
                if (!items.length) return null;
                return (
                  <div key={g.id} className="space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-700 px-1">{g.label}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {items.map(cat => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => pick(cat.id)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="truncate pr-2">{cat.label}</span>
                            <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {cat.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
