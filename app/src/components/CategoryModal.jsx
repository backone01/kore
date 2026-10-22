import React from 'react';
import { X, Layers, UserCheck, Activity, AlertTriangle, ShieldAlert, Wrench, Hash, Palette, Check } from 'lucide-react';
import { MAIN_MODULES } from '../utils/categoryGroups.js';
import { Badge } from './ui/badge.jsx';
import { Button } from './ui/button.jsx';
import { cn } from '../utils/cn.js';

const ICON_MAP = { Layers, UserCheck, Activity, AlertTriangle, ShieldAlert, Wrench, Hash, Palette };

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
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const pick = (id) => {
    setSelectedCategory(id);
    if (setCurrentIndex) setCurrentIndex(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-card border border-border rounded-t-lg sm:rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3 border-b border-border">
          <div>
            <h2 className="font-bold text-base text-foreground">Pilih Modul & Kategori</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Selaras dengan materi dan ujian resmi</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Tutup">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 space-y-5">
          {/* Main modules */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Modul Utama</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {MAIN_MODULES.map(mod => {
                const IconComponent = ICON_MAP[mod.icon] || Layers;
                const isSelected = selectedCategory === mod.id
                  || (selectedCategory !== 'all' && mod.categories.includes(selectedCategory));
                const count = mod.id === 'all'
                  ? questionsData.length
                  : questionsData.filter(q => mod.categories.includes(q.category)).length;
                const countLabel = mod.categories.length === 0 && mod.id !== 'all' ? 'Materi' : `${count} soal`;
                const isStudyOnly = mod.id !== 'all' && mod.categories.length === 0;

                return (
                  <button
                    key={mod.id}
                    onClick={() => { if (!isStudyOnly) pick(mod.id); }}
                    disabled={isStudyOnly}
                    title={isStudyOnly ? 'Modul ini hanya tersedia di mode Materi' : mod.desc}
                    className={cn(
                      'flex items-start gap-2.5 p-3 rounded-md text-left border transition-all',
                      isSelected ? 'bg-primary/5 border-primary text-foreground'
                        : isStudyOnly ? 'bg-muted/50 text-muted-foreground opacity-60 cursor-not-allowed'
                        : 'bg-card border-border hover:border-foreground/30'
                    )}>
                    <span className={cn('p-1.5 rounded-md shrink-0 mt-0.5',
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground')}>
                      <IconComponent className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">{mod.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                      </span>
                      <span className="block text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{mod.desc}</span>
                      <Badge variant="outline" className="mt-1.5">{countLabel}</Badge>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-categories */}
          <div className="pt-1 border-t border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sub-Kategori Spesifik</span>
            <div className="mt-2 space-y-3">
              {categoryGroups.map(g => {
                const items = categoriesList.filter(c => c.group === g.id);
                if (!items.length) return null;
                return (
                  <div key={g.id} className="space-y-1.5">
                    <p className="text-[11px] font-medium text-muted-foreground px-0.5">{g.label}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {items.map(cat => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <button key={cat.id} onClick={() => pick(cat.id)}
                            className={cn(
                              'flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium border transition-all',
                              isSelected ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card text-foreground border-border hover:bg-secondary'
                            )}>
                            <span className="truncate pr-2">{cat.label}</span>
                            <span className={cn('font-mono text-[10px] px-1.5 py-0.5 rounded',
                              isSelected ? 'bg-white/20' : 'bg-secondary text-muted-foreground')}>
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
