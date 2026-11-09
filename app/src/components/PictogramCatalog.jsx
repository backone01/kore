import React, { useState, useEffect } from 'react';
import { Volume2, Eye, EyeOff, Search, ShieldAlert, Maximize2, X, Play, Pause } from 'lucide-react';
import { getAssetUrl } from '../utils/assetHelper.js';
import { Badge } from './ui/badge.jsx';
import { Button } from './ui/button.jsx';
import { QAPlayerDeck } from './QAStudy.jsx';
import { cn } from '../utils/cn.js';

export function PictogramCatalog({
  questions = [],
  filteredPik: propFilteredPik = null,
  pikGroup: propPikGroup = null,
  onGroupChange = null,
  searchQuery: propSearchQuery = null,
  onSearchChange = null,
  isAnswerHidden,
  toggleCardAnswer,
  playAudio,
  onPlayMeaning,
  hideAllAnswers,
  onSetGlobalHideAll,
  onInspectRambu,
  // Auto-player deck props
  playerUI,
  currentQ,
  currentIndex = 0,
  totalCount,
  prog,
  onSeek,
  rate = 1,
  onCycleRate,
  delaySecs = 2,
  onSetDelay,
  mode = 'sequential',
  onToggleMode,
  includeAnswers = true,
  onToggleIncludeAnswers,
  includeMeaning = false,
  onToggleIncludeMeaning,
  includeQuestionMeaning = false,
  onToggleIncludeQuestionMeaning,
  gapCountdown = 0,
  hideText = false,
  onPrev,
  onTogglePlay,
  onNext,
  onShuffle,
  onRepeat,
  onStop,
  activeSignIdx = 0,
  onSelectSign,
}) {
  const [localPikGroup, setLocalPikGroup] = useState(() => {
    try {
      const saved = localStorage.getItem('kore_pik_group');
      if (saved && ['all', 'wajib', 'peringatan', 'larangan', 'evakuasi'].includes(saved)) return saved;
    } catch {}
    return 'all';
  });

  const activePikGroup = propPikGroup !== null ? propPikGroup : localPikGroup;

  const handleGroupSelect = (grpId) => {
    if (onGroupChange) onGroupChange(grpId);
    setLocalPikGroup(grpId);
    try { localStorage.setItem('kore_pik_group', grpId); } catch {}
  };

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const activeSearchQuery = propSearchQuery !== null ? propSearchQuery : localSearchQuery;

  const handleSearchInput = (val) => {
    if (onSearchChange) onSearchChange(val);
    setLocalSearchQuery(val);
  };

  const allPik = questions.filter((q) => q.category === 'piktogram');
  const pikGroups = [
    { id: 'all', label: 'Semua Rambu', count: allPik.length },
    { id: 'wajib', label: '지시 (Wajib APD)', count: allPik.filter((x) => (x.category_title || '').includes('지시')).length },
    { id: 'peringatan', label: '경고 (Bahaya)', count: allPik.filter((x) => (x.category_title || '').includes('경고')).length },
    { id: 'larangan', label: '금지 (Larangan)', count: allPik.filter((x) => (x.category_title || '').includes('금지')).length },
    { id: 'evakuasi', label: '안내·소방 (Evakuasi & Pemadam)', count: allPik.filter((x) => /안내|소방/.test(x.category_title || '')).length },
  ];

  const computedFilteredPik = allPik.filter((item) => {
    if (activePikGroup === 'wajib' && !(item.category_title || '').includes('지시')) return false;
    if (activePikGroup === 'peringatan' && !(item.category_title || '').includes('경고')) return false;
    if (activePikGroup === 'larangan' && !(item.category_title || '').includes('금지')) return false;
    if (activePikGroup === 'evakuasi' && !/안내|소방/.test(item.category_title || '')) return false;
    if (activeSearchQuery.trim()) {
      const q = activeSearchQuery.toLowerCase();
      return `${item.title_ko || ''} ${item.title_id || ''} ${item.answer_short_ko || ''} ${item.answer_short_id || ''}`.toLowerCase().includes(q);
    }
    return true;
  });

  const displayPik = propFilteredPik || computedFilteredPik;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="border-b border-border pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs">
              TES VISUAL GAMBAR K3
            </Badge>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {allPik.length} Rambu Resmi
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            Katalog Rambu Keselamatan Kerja (안전 표지판)
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
            Ketuk gambar rambu untuk memperbesar dan dengarkan pelafalan resminya.
          </p>
        </div>

        <Button
          variant={hideAllAnswers ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSetGlobalHideAll && onSetGlobalHideAll(!hideAllAnswers)}
          className="text-xs gap-1.5 h-8 shrink-0"
          title="Klik untuk membuka atau menyembunyikan semua arti rambu"
        >
          {hideAllAnswers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{hideAllAnswers ? 'Buka Semua Arti Rambu' : 'Tutup Semua Arti Rambu'}</span>
        </Button>
      </div>

      {/* Auto-Player Deck Rambu Piktogram */}
      {playerUI && (
        <QAPlayerDeck
          ui={playerUI}
          currentQ={currentQ || displayPik[activeSignIdx] || displayPik[0]}
          currentIndex={activeSignIdx}
          totalCount={totalCount ?? displayPik.length}
          prog={prog}
          onSeek={onSeek}
          rate={rate}
          onCycleRate={onCycleRate}
          delaySecs={delaySecs}
          onSetDelay={onSetDelay}
          mode={mode}
          onToggleMode={onToggleMode}
          includeAnswers={includeAnswers}
          onToggleIncludeAnswers={onToggleIncludeAnswers}
          includeMeaning={includeMeaning}
          onToggleIncludeMeaning={onToggleIncludeMeaning}
          includeQuestionMeaning={includeQuestionMeaning}
          onToggleIncludeQuestionMeaning={onToggleIncludeQuestionMeaning}
          gapCountdown={gapCountdown}
          hideText={hideText}
          onPrev={onPrev}
          onTogglePlay={() => onTogglePlay && onTogglePlay(displayPik, activeSignIdx)}
          onNext={onNext}
          onShuffle={onShuffle}
          onRepeat={onRepeat}
          onStop={onStop}
          accent="orange"
          activeOpt={{
            ko: (currentQ || displayPik[activeSignIdx] || displayPik[0])?.title_ko || (currentQ || displayPik[activeSignIdx] || displayPik[0])?.answer_short_ko,
            id: (currentQ || displayPik[activeSignIdx] || displayPik[0])?.title_id || (currentQ || displayPik[activeSignIdx] || displayPik[0])?.answer_short_id,
            label: 'Arti Rambu'
          }}
          onPlayAnswer={() => {
            const q = currentQ || displayPik[activeSignIdx] || displayPik[0];
            if (q && playAudio) {
              playAudio(q.audio_a, q.answer_short_ko || q.title_ko);
            }
          }}
          onPlayMeaning={onPlayMeaning}
        />
      )}

      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {pikGroups.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleGroupSelect(cat.id)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5',
                activePikGroup === cat.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary/60'
              )}
            >
              <span>{cat.label}</span>
              <span className="text-xs opacity-80">({cat.count})</span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari rambu Korea / Indo..."
            value={activeSearchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
          />
          {activeSearchQuery && (
            <button
              type="button"
              onClick={() => handleSearchInput('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Toolbar Status Buka/Tutup Jawaban Rambu (Konsisten dengan Katalog Alat) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-secondary/40 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-bold text-foreground text-sm">Mode Uji Hafalan Rambu K3:</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Buka/tutup seluruh jawaban untuk latihan uji mandiri menebak arti simbol visual keselamatan kerja.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-border bg-card p-0.5 gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onSetGlobalHideAll && onSetGlobalHideAll(false)}
            className={cn(
              'px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer',
              !hideAllAnswers
                ? 'bg-foreground text-background shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="Buka seluruh nama dan arti pada 98 kartu rambu"
          >
            Buka Semua Rambu
          </button>
          <button
            type="button"
            onClick={() => onSetGlobalHideAll && onSetGlobalHideAll(true)}
            className={cn(
              'px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer',
              hideAllAnswers
                ? 'bg-foreground text-background shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="Tutup seluruh nama dan arti rambu untuk latihan tebak visual"
          >
            Tutup Semua Rambu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayPik.map((item, itemIdx) => {
          const cardId = `pik_${item.id}`;
          const hidden = isAnswerHidden ? isAnswerHidden(cardId) : false;
          const isThisPlaying = playerUI?.on && playerUI?.tab === 'piktogram' && (currentQ?.id === item.id);
          return (
            <div
              key={item.id}
              className={cn(
                "rounded-xl border p-3.5 flex flex-col justify-between gap-3 transition-all",
                isThisPlaying 
                  ? "bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/30 shadow-md" 
                  : "bg-card border-border hover:border-primary/40"
              )}
            >
              <div className="flex items-start gap-3">
                {item.image_url && (
                  <button
                    type="button"
                    onClick={() => onInspectRambu && onInspectRambu(item)}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-border bg-white dark:bg-card p-1.5 shrink-0 flex items-center justify-center relative group cursor-pointer shadow-xs hover:border-primary/50 transition-all"
                    title="Klik untuk memperbesar gambar rambu"
                  >
                    <img
                      src={getAssetUrl(item.image_url)}
                      alt={item.title_id || item.answer_short_id}
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                    />
                    <span className="absolute bottom-1 right-1 w-5 h-5 rounded-md bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3 h-3" />
                    </span>
                  </button>
                )}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate bg-secondary/80 px-2 py-0.5 rounded-md">
                      {item.category_title || 'Rambu K3'}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleCardAnswer && toggleCardAnswer(cardId)}
                        className="w-7 h-7 rounded-md bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                        title={hidden ? "Tampilkan Arti & Nama Rambu" : "Sembunyikan Arti & Nama Rambu"}
                      >
                        {hidden ? <Eye className="w-3.5 h-3.5 text-primary" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => playAudio && playAudio(item.audio_a, item.answer_short_ko || item.title_ko)}
                        className="w-7 h-7 rounded-md bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                        title="Putar Audio Jawaban Korea"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      {onPlayMeaning && (item.title_id || item.answer_short_id) && (
                        <button
                          type="button"
                          onClick={() => onPlayMeaning(item.title_id || item.answer_short_id)}
                          className="w-7 h-7 rounded-md bg-secondary hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                          title="Putar Arti Rambu Bahasa Indonesia"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  {hidden ? (
                    <div className="py-1 px-2 rounded-md bg-secondary/80 border border-dashed border-border flex items-center gap-1.5 text-xs text-muted-foreground my-1">
                      <EyeOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="font-bold text-foreground text-[11px]">Nama Rambu Disembunyikan</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectSign && onSelectSign(itemIdx)}
                      className="text-left w-full cursor-pointer hover:opacity-85 transition-opacity"
                      title="Klik untuk memilih rambu ini di pemutar atas"
                    >
                      <p className="text-sm sm:text-base font-black text-foreground leading-snug break-keep">
                        {item.title_ko || item.answer_short_ko}
                      </p>
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-border/60">
                {hidden ? (
                  <button
                    type="button"
                    onClick={() => toggleCardAnswer && toggleCardAnswer(cardId)}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-secondary/70 hover:bg-secondary text-xs font-medium text-muted-foreground flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Tampilkan Arti Rambu</span>
                  </button>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400">
                          {item.title_id || item.answer_short_id}
                        </p>
                        {onPlayMeaning && (item.title_id || item.answer_short_id) && (
                          <button
                            type="button"
                            onClick={() => onPlayMeaning(item.title_id || item.answer_short_id)}
                            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                            title="Dengar arti rambu (Bahasa Indonesia)"
                          >
                            <Volume2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCardAnswer && toggleCardAnswer(cardId)}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 cursor-pointer py-0.5 px-1.5 rounded hover:bg-secondary shrink-0"
                        title="Tutup jawaban kartu ini"
                      >
                        <EyeOff className="w-3 h-3" />
                        <span>Tutup</span>
                      </button>
                    </div>
                    {(item.answer_full_ko || item.answer_short_ko) && (
                      <p className="text-[11px] text-muted-foreground leading-snug bg-secondary/30 p-1.5 rounded-md border border-border/40">
                        <span className="text-xs uppercase font-bold text-muted-foreground block">Pola Jawaban Lisan:</span>
                        <strong>{item.answer_full_ko || item.answer_short_ko}</strong>
                      </p>
                    )}
                    {item.synonym_bab54 && (
                      <div className="text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 p-1.5 rounded-md border border-blue-200 dark:border-blue-900/40 leading-snug">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 block">
                          📖 Versi Buku Teks Bab 54:
                        </span>
                        {item.synonym_bab54}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
