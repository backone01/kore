import React from 'react';
import { X, Layers, UserCheck, Activity, AlertTriangle, ShieldAlert, Wrench, Hash, Palette, Check } from 'lucide-react';
import { MAIN_MODULES } from '../utils/categoryGroups.js';
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
    <div
      className="fixed inset-0 z-50 bg-foreground/40 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border border-border rounded-t-xl sm:rounded-xl w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="font-bold text-base text-foreground">Pilih Modul & Kategori</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Filter bank soal sesuai fokus latihan Anda</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Tutup">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto divide-y divide-border">
          {/* Main modules */}
          <div className="p-4 sm:p-5 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Modul Utama
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MAIN_MODULES.map(mod => {
                const IconComponent = ICON_MAP[mod.icon] || Layers;
                const isSelected = selectedCategory === mod.id
                  || (selectedCategory !== 'all' && mod.categories.includes(selectedCategory));
                const count = mod.id === 'all'
                  ? questionsData.length
                  : questionsData.filter(q => mod.categories.includes(q.category)).length;
                const isStudyOnly = mod.id !== 'all' && mod.categories.length === 0;
                const countLabel = isStudyOnly ? 'Khusus Materi' : `${count} soal`;

                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => { if (!isStudyOnly) pick(mod.id); }}
                    disabled={isStudyOnly}
                    title={isStudyOnly ? 'Modul ini hanya tersedia di mode Materi' : mod.desc}
                    className={cn(
                      'flex items-center justify-between gap-3 p-3 rounded-lg text-left border transition-colors min-h-[52px]',
                      isSelected
                        ? 'bg-primary/5 border-primary text-foreground'
                        : isStudyOnly
                          ? 'bg-muted/40 border-border text-muted-foreground opacity-60 cursor-not-allowed'
                          : 'bg-card border-border hover:bg-secondary/60'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent className={cn('h-4 w-4 shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{mod.label}</p>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{countLabel}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-categories */}
          <div className="p-4 sm:p-5 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Sub-Kategori Spesifik
            </span>
            <div className="space-y-4">
              {categoryGroups.map(g => {
                const items = categoriesList.filter(c => c.group === g.id);
                if (!items.length) return null;
                return (
                  <div key={g.id} className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground">{g.label}</p>
                    <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                      {items.map(cat => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => pick(cat.id)}
                            className={cn(
                              'w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium transition-colors text-left min-h-[42px]',
                              isSelected
                                ? 'bg-primary text-primary-foreground font-semibold'
                                : 'bg-card text-foreground hover:bg-secondary/60'
                            )}
                          >
                            <span className="truncate pr-2">{cat.label}</span>
                            <span className={cn('font-mono text-[11px] shrink-0',
                              isSelected ? 'text-primary-foreground/90' : 'text-muted-foreground')}>
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
