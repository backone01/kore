import React from 'react';
import {
  Volume2, Eye, EyeOff, Play, Pause,
   Shuffle, Repeat, Square,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  ListMusic
} from 'lucide-react';
import { Button } from './ui/button.jsx';
import { cn } from '../utils/cn.js';

// --- Sound Wave Equalizer (CSS-Animated, Zero-lag) ---
export function SoundWave({ playing = false, className = '' }) {
  return (
    <span className={cn('inline-flex items-end gap-0.5 h-3.5 px-0.5', className)} aria-hidden="true">
      <span
        className={cn(
          'w-0.5 bg-current rounded-full transition-all duration-300',
          playing ? 'h-3.5 animate-pulse' : 'h-1 opacity-40'
        )}
        style={{ animationDelay: '0ms' }}
      />
      <span
        className={cn(
          'w-0.5 bg-current rounded-full transition-all duration-300',
          playing ? 'h-2 animate-pulse' : 'h-1.5 opacity-40'
        )}
        style={{ animationDelay: '150ms' }}
      />
      <span
        className={cn(
          'w-0.5 bg-current rounded-full transition-all duration-300',
          playing ? 'h-3 animate-pulse' : 'h-1 opacity-40'
        )}
        style={{ animationDelay: '300ms' }}
      />
      <span
        className={cn(
          'w-0.5 bg-current rounded-full transition-all duration-300',
          playing ? 'h-2 animate-pulse' : 'h-1 opacity-40'
        )}
        style={{ animationDelay: '75ms' }}
      />
    </span>
  );
}

const ACCENTS = {
  amber: {
    badge: 'font-mono text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md',
    meanLabel: 'Maksud Soal: ',
    ansLabel: 'Jawaban · ',
    playTitle: 'Putar audio suara penguji asli',
  },
  blue: {
    badge: 'font-mono text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md truncate max-w-[220px]',
    meanLabel: 'Artinya: ',
    ansLabel: 'Respon · ',
    playTitle: 'Dengar audio soal',
  },
};

const fmtTime = (s) => {
  if (!s || !isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
};

// --- Audio Player Deck (1-Layer Flat Container, Zero Nested Box) ---
export function QAPlayerDeck({
  ui,
  currentQ,
  onPrev,
  onTogglePlay,
  onNext,
  onShuffle,
  onRepeat,
  onStop,
  prog = null,
  onSeek = null,
  rate = 1,
  onCycleRate = null,
  delaySecs = 2,
  onSetDelay = null,
  mode = 'sequential',
  onToggleMode = null,
  includeAnswers = true,
  gapCountdown = 0,
  hideText = false,
  onToggleCollapse = null,
  collapsed = false,
  totalCount = 0,
  currentIndex = 0,
  activeOpt = null,
  onPlayAnswer = null,
}) {
  const pct = prog && prog.d > 0 ? Math.min(100, (prog.t / prog.d) * 100) : 0;
  const canSeek = prog && prog.isFile && prog.d > 0 && onSeek;
  const isPlaying = ui.on;

  let statusBadge = (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-secondary text-muted-foreground border border-border">
      <Square className="h-2.5 w-2.5" />
      <span>Siap diputar</span>
    </span>
  );

  if (isPlaying) {
    if (ui.step === 'q') {
      statusBadge = (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/30">
          <SoundWave playing className="text-primary" />
          <span>Mendengarkan Soal (질문)</span>
        </span>
      );
    } else if (ui.step === 'gap') {
      statusBadge = (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 animate-pulse">
          <span>Jeda hafalan · {gapCountdown > 0 ? `${gapCountdown}s` : `${delaySecs}s`}</span>
        </span>
      );
    } else if (ui.step === 'a') {
      statusBadge = (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
          <SoundWave playing className="text-emerald-700 dark:text-emerald-300" />
          <span>Kunci Jawaban Resmi (답변)</span>
        </span>
      );
    }
  }

  if (collapsed) {
    return (
      <div className="rounded-xl border border-border bg-card p-2.5 flex items-center justify-between gap-2 text-foreground transition-all">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onTogglePlay}
            title={isPlaying ? 'Jeda' : 'Putar'}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>
          <div className="min-w-0 truncate">
            <span className="text-xs font-bold font-kr truncate block">
              #{currentIndex + 1}. {currentQ ? currentQ.question_ko : '-'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {statusBadge}
              <span className="font-mono text-[10px] text-muted-foreground">
                {currentIndex + 1}/{totalCount}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Buka pemutar penuh"
          className="px-2.5 py-1.5 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground shrink-0 text-xs font-medium flex items-center gap-1 min-h-[36px]"
        >
          <ChevronDown className="h-4 w-4" />
          <span className="hidden sm:inline">Buka Pemutar</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 text-foreground space-y-3 transition-all">
      {/* 1. Header Bar: Status & Window Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border shrink-0">
            #{currentIndex + 1} / {totalCount}
          </span>
          {ui.shuffle && isPlaying && (
            <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
              Acak #{ui.pos + 1}/{totalCount}
            </span>
          )}
          {statusBadge}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isPlaying && (
            <button
              type="button"
              onClick={onStop}
              title="Hentikan pemutar"
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <Square className="h-4 w-4" />
            </button>
          )}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Ciutkan pemutar"
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {/* 2. Track Surface (Pemisah garis tipis langsung di permukaan player, tanpa kotak di dalam kotak) */}
      <div className="border-y border-border/60 py-3 space-y-2">
        {hideText ? (
          <div className="py-3 text-center space-y-1">
            <Volume2 className="h-5 w-5 mx-auto text-primary animate-pulse" />
            <p className="text-xs font-bold text-foreground">
              Mode Latihan Dengar Murni (Teks Disembunyikan)
            </p>
            <p className="text-[11px] text-muted-foreground">
              Fokus dengarkan audio ucapan penguji dan latih ingatan tanpa membaca teks.
            </p>
          </div>
        ) : (
          <>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Pertanyaan Penguji (질문)
              </p>
              <h4 className="text-base sm:text-xl font-bold font-kr text-foreground mt-0.5 leading-snug">
                {currentQ?.question_ko || 'Silakan pilih pertanyaan dari daftar di bawah'}
              </h4>
              {currentQ?.question_id && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Artinya: "{currentQ.question_id}"
                </p>
              )}
            </div>

            {includeAnswers ? (
              (currentQ?.answer_ko || activeOpt?.ko) && (
                <div className="pt-2 border-t border-border/50 mt-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Kunci Jawaban Peserta (답변)
                    </p>
                    {onPlayAnswer && (
                      <button
                        type="button"
                        onClick={onPlayAnswer}
                        title="Dengar jawaban ini saja"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        <Volume2 className="h-3 w-3" />
                        <span>Dengar Jawaban</span>
                      </button>
                    )}
                  </div>
                  <p className="text-sm sm:text-base font-bold font-kr text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {activeOpt?.ko || currentQ?.answer_ko}
                  </p>
                  {(activeOpt?.id || currentQ?.answer_id) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activeOpt?.id || currentQ?.answer_id}
                    </p>
                  )}
                </div>
              )
            ) : (
              <div className="pt-2 border-t border-border/50 mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">
                  Mode: Hanya soal penguji (jawaban senyap)
                </span>
                {onPlayAnswer && (
                  <button
                    type="button"
                    onClick={onPlayAnswer}
                    title="Dengar kunci jawaban secara mandiri"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
                  >
                    <Volume2 className="h-3 w-3" />
                    <span>Dengar Jawaban</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 3. Progress Slider Bar */}
      <div className="space-y-1">
        <div
          onClick={(e) => {
            if (!canSeek) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            onSeek(frac);
          }}
          title={canSeek ? 'Lompat ke bagian audio' : ''}
          className={cn(
            'h-1.5 rounded-full bg-secondary overflow-hidden transition-all',
            canSeek ? 'cursor-pointer hover:h-2' : ''
          )}
        >
          {prog && !prog.isFile && isPlaying ? (
            <div className="h-full w-full bg-primary/40 animate-pulse" />
          ) : (
            <div
              className="h-full bg-primary rounded-full transition-all duration-150"
              style={{ width: `${pct}%` }}
            />
          )}
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground px-0.5">
          <span>{fmtTime(prog ? prog.t : 0)}</span>
          <span>{prog && prog.d > 0 ? fmtTime(prog.d) : '0:00'}</span>
        </div>
      </div>

      {/* 4. Controls Toolbar: Baris 1 Transport Utama, Baris 2 Pengaturan Putar */}
      <div className="space-y-2.5">
        {/* Baris Transport Utama: Acak | Prev - Play - Next | Loop */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onShuffle}
            title={ui.shuffle ? 'Acak urutan: Aktif' : 'Acak urutan: Nonaktif'}
            className={cn(
              'px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all min-h-[38px] flex items-center gap-1.5',
              ui.shuffle
                ? 'bg-foreground text-background border-foreground'
                : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
            )}
          >
            <Shuffle className="h-3.5 w-3.5" />
            <span className="text-[11px] font-bold">{ui.shuffle ? 'Acak' : 'Urut'}</span>
          </button>

          <div className="flex items-center justify-center gap-2.5">
            <button
              type="button"
              disabled={isPlaying ? (!ui.repeat && ui.pos <= 0) : currentIndex <= 0}
              onClick={onPrev}
              title="Soal sebelumnya"
              className="grid size-10 place-items-center rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground disabled:opacity-35 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onTogglePlay}
              title={isPlaying ? 'Jeda pemutar' : 'Putar audio'}
              className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-transform active:scale-95 shrink-0"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </button>

            <button
              type="button"
              disabled={isPlaying ? (!ui.repeat && ui.pos >= (ui.total ? ui.total - 1 : totalCount - 1)) : currentIndex >= totalCount - 1}
              onClick={onNext}
              title="Soal berikutnya"
              className="grid size-10 place-items-center rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground disabled:opacity-35 transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onRepeat}
            title={ui.repeat ? 'Ulangi playlist: Aktif' : 'Ulangi playlist: Nonaktif'}
            className={cn(
              'px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all min-h-[38px] flex items-center gap-1.5',
              ui.repeat
                ? 'bg-foreground text-background border-foreground'
                : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
            )}
          >
            <Repeat className="h-3.5 w-3.5" />
            <span className="text-[11px] font-bold">{ui.repeat ? 'Loop' : '1x'}</span>
          </button>
        </div>

        {/* Baris Pengaturan: Mode Berurutan/1 Soal, Jeda Hafalan, Kecepatan */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-border/50">
          {onToggleMode && (
            <button
              type="button"
              onClick={onToggleMode}
              title={mode === 'sequential' ? 'Mode putar: Berurutan semua soal' : 'Mode putar: Hanya 1 soal ini'}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all min-h-[36px] flex-1 sm:flex-initial',
                mode === 'sequential'
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-secondary text-foreground border-border hover:bg-secondary/80'
              )}
            >
              <ListMusic className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{mode === 'sequential' ? 'Berurutan' : '1 Soal'}</span>
            </button>
          )}

          {onSetDelay && (
            <div
              className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg border border-border bg-secondary text-xs font-medium min-h-[36px]"
              title="Jeda hafalan antar soal dan jawaban"
            >
              <span className="text-[11px] text-muted-foreground">Jeda:</span>
              <button
                type="button"
                onClick={() => onSetDelay(Math.max(0, delaySecs - 1))}
                className="w-6 h-6 rounded flex items-center justify-center font-bold hover:bg-background text-foreground"
              >
                -
              </button>
              <span className="font-mono font-bold text-xs px-1 text-foreground">
                {delaySecs}s
              </span>
              <button
                type="button"
                onClick={() => onSetDelay(Math.min(15, delaySecs + 1))}
                className="w-6 h-6 rounded flex items-center justify-center font-bold hover:bg-background text-foreground"
              >
                +
              </button>
            </div>
          )}

          {onCycleRate && (
            <button
              type="button"
              onClick={onCycleRate}
              title="Kecepatan putar suara"
              className="px-2.5 py-1.5 rounded-lg border border-border bg-secondary hover:bg-secondary/80 font-mono text-xs font-bold text-foreground min-h-[36px]"
            >
              {rate}x
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Baris List Tanya Jawab (Unified Accordion Tanpa Card-in-Card) ---
export function QAList({
  items = [],
  selIdx,
  playIdx,
  onPick,
  onPlayRow,
  subOf,
  tabKey,
  expandedIdx = -1,
  renderDetail = null,
  mode = 'list',
  isPlaying = false,
  hideAnswers = false,
  showAllOptions = false,
}) {
  if (!items.length) {
    return <p className="text-xs text-muted-foreground py-6 text-center">Tidak ada soal yang cocok dengan filter pencarian.</p>;
  }

  if (mode === 'single') {
    const si = selIdx < 0 ? 0 : selIdx;
    const q = items[si];
    if (!q) return <p className="text-xs text-muted-foreground py-6 text-center">Tidak ada soal yang cocok.</p>;
    return <div className="animate-fade-in">{renderDetail ? renderDetail(q, si) : null}</div>;
  }

  return (
    <div className="space-y-1.5">
      {items.map((q, idx) => {
        const isSelected = idx === selIdx;
        const isCurrentPlaying = idx === playIdx;
        // Jika hideAnswers = false (Tampilkan Semua Jawaban), semua nomor langsung terbuka
        const isExpanded = (!hideAnswers || idx === expandedIdx) && !!renderDetail;
        const detailNode = isExpanded ? renderDetail(q, idx) : null;

        return (
          <div
            key={q.id || idx}
            id={`qarow-${tabKey}-${idx}`}
            className={cn(
              'rounded-xl border transition-all overflow-hidden bg-card',
              isCurrentPlaying
                ? 'border-primary ring-1 ring-primary/30'
                : isSelected
                ? 'border-foreground/40'
                : 'border-border hover:border-border/80'
            )}
          >
            <div
              onClick={() => onPick(idx)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors cursor-pointer min-h-[48px]',
                isCurrentPlaying
                  ? 'bg-primary/5'
                  : isSelected
                  ? 'bg-secondary/40'
                  : 'hover:bg-secondary/30'
              )}
            >
              <span
                className={cn(
                  'font-mono text-xs font-bold w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors',
                  isCurrentPlaying
                    ? 'bg-primary text-primary-foreground'
                    : isSelected
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-muted-foreground'
                )}
              >
                {idx + 1}
              </span>

              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-kr font-bold text-sm text-foreground truncate leading-snug">
                    {q.question_ko}
                  </span>
                  {isCurrentPlaying && (
                    <SoundWave playing={isPlaying} className="text-primary shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate mt-0.5">
                  {q.level_mark && (
                    <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 shrink-0">
                      [{q.level_mark}]
                    </span>
                  )}
                  <span className="truncate">{subOf(q)}</span>
                  {q.question_id && (
                    <>
                      <span>·</span>
                      <span className="truncate opacity-85">"{q.question_id}"</span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayRow(idx);
                }}
                title={`Putar berurutan mulai dari nomor #${idx + 1}`}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold min-h-[34px]',
                  isCurrentPlaying
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground'
                )}
              >
                {isCurrentPlaying && isPlaying ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5 ml-0.5" />
                )}
                <span className="hidden sm:inline text-[11px]">
                  {isCurrentPlaying && isPlaying ? 'Jeda' : 'Putar'}
                </span>
              </button>
            </div>

            {isExpanded && (
              <div className="border-t border-border bg-muted/20 px-3.5 py-3 rounded-b-xl animate-fade-in">
                {React.isValidElement(detailNode)
                  ? React.cloneElement(detailNode, { embedded: true })
                  : detailNode}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Detail Satu Soal (Menyatu di Accordion atau Flat Container di Single View) ---
export function QADetail({
  q,
  num,
  hidden,
  activeOpt,
  selOptIdx,
  onSelectOpt,
  onToggle,
  onPlayQ,
  onPlayAnswer,
  accent = 'blue',
  subLabel,
  onPrev,
  onNext,
  posLabel,
  ansFallback = 'Kunci Resmi',
  embedded = false,
  showAllOptions = false,
}) {
  const A = ACCENTS[accent] || ACCENTS.blue;
  if (!q) return null;

  const content = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={A.badge}>
            #{num} · {subLabel}
          </span>
          {q.phase_ko && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
              {q.phase_ko} ({q.phase_id})
            </span>
          )}
          {q.level_mark && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Tingkat {q.level_mark}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {!embedded && onPrev && onNext && (
            <div className="flex items-center gap-1 mr-1">
              <Button type="button" variant="ghost" size="icon" onClick={onPrev} title="Soal sebelumnya" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-mono text-[11px] font-bold text-muted-foreground px-1">{posLabel}</span>
              <Button type="button" variant="ghost" size="icon" onClick={onNext} title="Soal berikutnya" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {q.audio_q && (
            <Button type="button" variant="outline" size="sm" onClick={onPlayQ} title={A.playTitle} className="h-8 text-xs">
              <Volume2 className="h-3.5 w-3.5" />
              <span>Putar Soal</span>
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={onToggle} className="h-8 text-xs">
            {hidden ? <EyeOff className="h-3.5 w-3.5 text-warn" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{hidden ? 'Buka Kunci' : 'Sembunyikan'}</span>
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="text-lg sm:text-xl font-bold text-foreground font-kr tracking-tight leading-snug">
          {q.question_ko}
        </h4>
        {(q.question_ro || q.question_romaja) && (
          <p className="text-xs text-muted-foreground font-mono">{q.question_ro || q.question_romaja}</p>
        )}
        <p className="text-xs sm:text-sm text-muted-foreground">
          <strong>{A.meanLabel}</strong>"{q.question_id}"
        </p>
      </div>

      <div className="border-t border-border/70 pt-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            {A.ansLabel}{showAllOptions && q.answer_options?.length > 1 ? `Semua Pilihan Jawaban (${q.answer_options.length})` : (activeOpt.label || ansFallback)}
          </span>

          {!hidden && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={onPlayAnswer}
            >
              <Volume2 className="h-3 w-3" />
              <span>Dengar Jawaban</span>
            </Button>
          )}
        </div>

        {q.answer_options && q.answer_options.length > 1 && !hidden && !showAllOptions && (
          <div className="flex flex-wrap gap-1.5">
            {q.answer_options.map((opt, optIdx) => {
              const isSelected = (selOptIdx ?? 0) === optIdx;
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => onSelectOpt(optIdx)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-[11px] font-bold transition-all leading-tight border',
                    isSelected
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-card text-muted-foreground hover:text-foreground border-border'
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {hidden ? (
          <div
            onClick={onToggle}
            className="py-2.5 px-3 rounded-lg bg-secondary/60 border border-dashed border-border text-center cursor-pointer hover:bg-secondary transition-colors"
          >
            <span className="text-xs font-semibold text-muted-foreground flex items-center justify-center gap-1.5">
              <EyeOff className="h-3.5 w-3.5 text-warn" />
              <span>Jawaban disembunyikan untuk hafalan. Ketuk untuk melihat</span>
            </span>
          </div>
        ) : showAllOptions && q.answer_options && q.answer_options.length > 1 ? (
          <div className="space-y-2 pt-1">
            {q.answer_options.map((opt, oi) => (
              <div
                key={oi}
                onClick={() => onSelectOpt(oi)}
                className={cn(
                  'p-2.5 rounded-lg border transition-all cursor-pointer space-y-0.5',
                  (selOptIdx ?? 0) === oi
                    ? 'bg-emerald-500/10 border-emerald-500/40 dark:bg-emerald-950/20'
                    : 'bg-secondary/40 border-border hover:border-border/80'
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-primary">{opt.badge || opt.label}</span>
                  {(selOptIdx ?? 0) === oi && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">✓ Dipilih</span>
                  )}
                </div>
                <p className="text-sm sm:text-base font-bold font-kr text-foreground leading-snug break-keep">
                  {opt.ko}
                </p>
                {opt.ro && <p className="text-xs text-muted-foreground font-mono">{opt.ro}</p>}
                <p className="text-xs text-muted-foreground">{opt.id}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-base sm:text-lg font-bold font-kr text-emerald-700 dark:text-emerald-400 leading-snug">
              {activeOpt.ko}
            </p>
            {activeOpt.ro && (
              <p className="text-xs text-muted-foreground font-mono">{activeOpt.ro}</p>
            )}
            <p className="text-xs sm:text-sm text-foreground/90">
              <strong>Artinya:</strong> {activeOpt.id}
            </p>
          </div>
        )}
      </div>
    </>
  );

  if (embedded) {
    return <div className="space-y-2.5">{content}</div>;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3">
      {content}
    </div>
  );
}

// --- Bar Tampilan: Daftar/Satu item + Sertakan/Hanya pertanyaan + Teks ---
export function QAViewBar({
  view = 'list',
  onView,
  hideAnswers,
  onOnlyQ,
  onWithA,
  hideText = false,
  onToggleHideText,
  showAllOptions = false,
  onToggleShowAllOptions,
  visible,
  total,
}) {
  const segBtn = (active) =>
    cn(
      'px-3 py-1.5 rounded-md text-[11px] font-bold transition-all min-h-[30px] cursor-pointer',
      active
        ? 'bg-foreground text-background shadow-xs'
        : 'text-muted-foreground hover:text-foreground'
    );

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5 gap-0.5">
          <button type="button" onClick={() => onView('list')} className={segBtn(view === 'list')}>
            Daftar
          </button>
          <button type="button" onClick={() => onView('single')} className={segBtn(view === 'single')}>
            Satu item
          </button>
        </div>

        <div className="inline-flex rounded-lg border border-border bg-card p-0.5 gap-0.5">
          <button type="button" onClick={onOnlyQ} className={segBtn(hideAnswers)}>
            🙈 Tutup Semua Jawaban
          </button>
          <button type="button" onClick={onWithA} className={segBtn(!hideAnswers)}>
            👁️ Buka Semua Jawaban
          </button>
        </div>

        {onToggleShowAllOptions && (
          <div className="inline-flex rounded-lg border border-border bg-card p-0.5 gap-0.5">
            <button
              type="button"
              onClick={onToggleShowAllOptions}
              className={segBtn(showAllOptions)}
              title="Tampilkan seluruh variasi jawaban sekaligus (Mudah, Standar, Lengkap)"
            >
              {showAllOptions ? '👁️ Semua Opsi Terbuka' : '⚡ 1 Opsi Ringkas'}
            </button>
          </div>
        )}

        {onToggleHideText && (
          <div className="inline-flex rounded-lg border border-border bg-card p-0.5 gap-0.5">
            <button
              type="button"
              onClick={onToggleHideText}
              className={segBtn(hideText)}
              title="Sembunyikan teks untuk latihan mendengar murni"
            >
              {hideText ? 'Dengar Murni' : 'Tampilkan Teks'}
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Menampilkan {visible}/{total} soal · Ketuk tombol putar di nomor mana saja untuk memutar berurutan dari nomor tersebut.
      </p>
    </div>
  );
}

// --- Quick Play Trigger Bar ---
export function QAControls({ count, active, onStart }) {
  if (active) return null;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button type="button" onClick={onStart} className="shadow-xs font-semibold">
        <ListMusic className="h-4 w-4" />
        <span>Autoplay {count} Soal Berurutan</span>
      </Button>
      <span className="text-[11px] text-muted-foreground">
        Format resmi: Pertanyaan penguji · Jeda hafalan · Kunci jawaban.
      </span>
    </div>
  );
}
