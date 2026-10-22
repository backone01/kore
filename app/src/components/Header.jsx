import React from 'react';
import { SlidersHorizontal, BookOpen, Layers, Award, FileText } from 'lucide-react';
import { Button } from './ui/button.jsx';
import { cn } from '../utils/cn.js';

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
  const modes = [
    { id: 'study', label: 'Materi', icon: BookOpen },
    { id: 'practice', label: 'Latihan', icon: Layers },
    { id: 'exam', label: 'Ujian', icon: Award },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="max-w-5xl mx-auto flex h-14 items-center justify-between px-3 sm:px-6 gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shadow-xs">
            <span className="font-kr text-xs font-bold text-primary-foreground">E</span>
          </span>
          <span className="font-bold text-sm tracking-tight text-foreground hidden md:inline">
            EPS-TOPIK PRO
          </span>
        </div>

        {/* Mode tabs with comfortable touch targets and visible labels */}
        <nav className="flex items-center rounded-lg bg-secondary p-1 gap-1" aria-label="Mode aplikasi">
          {modes.map(m => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); stopAllAudio(); }}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold transition-all border min-h-[36px]',
                  active
                    ? 'bg-card text-foreground border-border shadow-xs'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-card/50'
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {mode === 'practice' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoryModalOpen(true)}
              aria-label="Pilih Kategori Bank Soal"
              className="h-9 px-2.5 sm:px-3 text-xs"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Kategori</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRevisionModalOpen(true)}
            aria-label="Panduan Regulasi HRDK"
            className="h-9 px-2 sm:px-3 text-xs text-muted-foreground hover:text-foreground"
          >
            <FileText className="h-3.5 w-3.5 sm:hidden" />
            <span className="hidden sm:inline">Regulasi</span>
          </Button>
        </div>
      </div>

      {/* Exam progress bar */}
      {mode === 'exam' && examPhase === 'running' && (
        <div className="h-1 w-full bg-secondary">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${examProgress}%` }} />
        </div>
      )}
    </header>
  );
}
