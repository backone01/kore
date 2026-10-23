import React from 'react';
import {
  Volume2, Eye, EyeOff, Play, Pause,
  SkipBack, SkipForward, Shuffle, Repeat, Square,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  ListMusic, RotateCcw, VolumeX
} from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Card } from './ui/card.jsx';
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
    card: 'p-4 md:p-5 space-y-3 border-l-4 border-l-amber-500 bg-amber-50/30',
    badge: 'font-mono text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md',
    mean: 'text-xs text-amber-800 bg-amber-100/60 border border-amber-200 px-2.5 py-1 rounded-md',
    meanLabel: 'Maksud Soal: ',
    ansLabel: 'Jawaban · ',
    playTitle: 'Putar audio suara penguji asli',
    rowActive: 'border-amber-500 bg-amber-50/80 ring-1 ring-amber-400',
  },
  blue: {
    card: 'p-4 md:p-5 border-l-4 border-l-blue-500 bg-blue-50/30',
    badge: 'font-mono text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md truncate max-w-[200px]',
    mean: 'text-xs text-blue-800 bg-blue-100/60 border border-blue-200 px-2.5 py-1 rounded-md',
    meanLabel: 'Artinya: ',
    ansLabel: 'Respon · ',
    playTitle: 'Dengar audio soal',
    rowActive: 'border-blue-500 bg-blue-50/80 ring-1 ring-blue-400',
  },
};

// --- Format detik ke menit:detik ---
const fmtTime = (s) => {
  if (!s || !isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
};

// --- Audio Player Deck ala epstopikhub.com/skill-test/interview ---
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
  onToggleIncludeAnswers = null,
  gapCountdown = 0,
  hideText = false,
  onToggleHideText = null,
  onToggleCollapse = null,
  collapsed = false,
  totalCount = 0,
  currentIndex = 0,
  accent = 'blue',
  activeOpt = null,
  onPlayAnswer = null,
}) {
  const pct = prog && prog.d > 0 ? Math.min(100, (prog.t / prog.d) * 100) : 0;
  const canSeek = prog && prog.isFile && prog.d > 0 && onSeek;
  const isPlaying = ui.on;

  // Status visual badge text and color
  let statusBadge = (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-secondary text-muted-foreground border border-border">
      <Square className="h-2.5 w-2.5" />
      <span>Siap diputar</span>
    </span>
  );

  if (isPlaying) {
    if (ui.step === 'q') {
      statusBadge = (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950/60 dark:text-blue-200">
          <SoundWave playing className="text-blue-700 dark:text-blue-300" />
          <span>Mendengarkan Soal (질문)</span>
        </span>
      );
    } else if (ui.step === 'gap') {
      statusBadge = (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 animate-pulse">
          <span>⏳ Jeda hafalan · {gapCountdown > 0 ? `${gapCountdown}s` : `${delaySecs}s`} (Waktunya menjawab!)</span>
        </span>
      );
    } else if (ui.step === 'a') {
      statusBadge = (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200">
          <SoundWave playing className="text-emerald-700 dark:text-emerald-300" />
          <span>Kunci Jawaban Resmi (답변)</span>
        </span>
      );
    }
  }

  // Collapsed mini-bar mode
  if (collapsed) {
    return (
      <div className="rounded-xl border border-border bg-card p-2.5 shadow-sm flex items-center justify-between gap-2 text-foreground transition-all">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onTogglePlay}
            title={isPlaying ? 'Jeda' : 'Putar'}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-transform active:scale-95"
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
          className="p-1.5 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground shrink-0 text-xs flex items-center gap-1"
        >
          <ChevronDown className="h-4 w-4" />
          <span className="hidden sm:inline">Buka Pemutar</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-3.5 sm:p-4 text-foreground space-y-3 transition-all">
      {/* 1. Header Bar: Status & Window Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border shrink-0">
            #{currentIndex + 1} dari {totalCount}
          </span>
          {ui.shuffle && isPlaying && (
            <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shrink-0">
              Acak #{ui.pos + 1}/{totalCount}
            </span>
          )}
          {statusBadge}
        </div>

        <div className="flex items-center gap-1 shrink-0">
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
        </div>
      </div>

      {/* 2. Track Showcase Card (Tampilan Soal & Jawaban Utama ala Epstopikhub) */}
      <div className="rounded-xl border border-border bg-secondary/30 p-3 sm:p-4 space-y-2">
        {hideText ? (
          <div className="py-4 text-center space-y-1.5">
            <Volume2 className="h-6 w-6 mx-auto text-primary animate-pulse" />
            <p className="text-xs font-bold text-muted-foreground">
              Mode Latihan Dengar Murni (Teks Disembunyikan)
            </p>
            <p className="text-[11px] text-muted-foreground/80">
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
                <div className="pt-2 border-t border-border/70 mt-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Kunci Jawaban Peserta (답변)
                    </p>
                    {onPlayAnswer && (
                      <button
                        type="button"
                        onClick={onPlayAnswer}
                        title="Dengar jawaban ini saja"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
                      >
                        <Volume2 className="h-3 w-3" />
                        <span>Dengar Jawaban</span>
                      </button>
                    )}
                  </div>
                  <p className="text-sm sm:text-base font-bold font-kr text-emerald-800 dark:text-emerald-200 mt-0.5">
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
              <div className="pt-2 border-t border-border/70 mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">
                  Mode: Hanya membaca pertanyaan penguji (Jawaban tidak bersuara)
                </span>
                {onPlayAnswer && (
                  <button
                    type="button"
                    onClick={onPlayAnswer}
                    title="Dengar kunci jawaban secara mandiri"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
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
            'h-2 rounded-full bg-secondary overflow-hidden transition-all',
            canSeek ? 'cursor-pointer hover:h-2.5' : ''
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

      {/* 4. Controls Toolbar (Tata Letak Presisi ala Epstopikhub) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-border/60">
        {/* Left: Mode & Delay & Rate */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {onToggleMode && (
            <button
              type="button"
              onClick={onToggleMode}
              title={mode === 'sequential' ? 'Mode putar: Berurutan semua soal' : 'Mode putar: Hanya 1 soal ini'}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all min-h-[34px]',
                mode === 'sequential'
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-secondary text-foreground border-border hover:bg-secondary/80'
              )}
            >
              <ListMusic className="h-3.5 w-3.5" />
              <span>{mode === 'sequential' ? 'Putar Berurutan' : 'Putar 1 Soal'}</span>
            </button>
          )}

          {/* Delay Stepper */}
          {onSetDelay && (
            <div
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-border bg-secondary text-xs font-medium min-h-[34px]"
              title="Jeda hafalan antar soal dan jawaban untuk berpikir"
            >
              <span className="text-[11px] text-muted-foreground">Jeda:</span>
              <button
                type="button"
                onClick={() => onSetDelay(Math.max(0, delaySecs - 1))}
                className="w-5 h-5 rounded flex items-center justify-center font-bold hover:bg-background text-foreground"
              >
                -
              </button>
              <span className="font-mono font-bold text-xs px-1 text-foreground">
                {delaySecs}s
              </span>
              <button
                type="button"
                onClick={() => onSetDelay(Math.min(15, delaySecs + 1))}
                className="w-5 h-5 rounded flex items-center justify-center font-bold hover:bg-background text-foreground"
              >
                +
              </button>
            </div>
          )}

          {/* Speed Selector */}
          {onCycleRate && (
            <button
              type="button"
              onClick={onCycleRate}
              title="Kecepatan putar suara"
              className="px-2.5 py-1.5 rounded-lg border border-border bg-secondary hover:bg-secondary/80 font-mono text-xs font-bold text-foreground min-h-[34px]"
            >
              {rate}x
            </button>
          )}
        </div>

        {/* Center: Main Transport (Previous, Primary Play/Pause, Next) */}
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={isPlaying ? (!ui.repeat && ui.pos <= 0) : currentIndex <= 0}
            onClick={onPrev}
            title="Soal sebelumnya"
            className="grid size-9 place-items-center rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground disabled:opacity-35 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            title={isPlaying ? 'Jeda pemutar' : 'Putar audio'}
            className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-transform active:scale-95 shrink-0"
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
            className="grid size-9 place-items-center rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground disabled:opacity-35 transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Right: Shuffle & Repeat */}
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={onShuffle}
            title={ui.shuffle ? 'Acak urutan: Aktif (Shuffle On)' : 'Acak urutan: Nonaktif (Shuffle Off)'}
            className={cn(
              'px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all min-h-[34px] flex items-center gap-1.5',
              ui.shuffle
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-1 ring-emerald-400'
                : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
            )}
          >
            <Shuffle className="h-3.5 w-3.5" />
            <span className="text-[11px] font-bold">{ui.shuffle ? 'Acak' : 'Urut'}</span>
          </button>

          <button
            type="button"
            onClick={onRepeat}
            title={ui.repeat ? 'Ulangi playlist: Aktif (Loop On)' : 'Ulangi playlist: Nonaktif (Loop Off)'}
            className={cn(
              'px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all min-h-[34px] flex items-center gap-1.5',
              ui.repeat
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-1 ring-emerald-400'
                : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
            )}
          >
            <Repeat className="h-3.5 w-3.5" />
            <span className="text-[11px] font-bold">{ui.repeat ? 'Loop' : '1x'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Baris List Tanya Jawab Lengkap ala Epstopikhub ---
export function QAList({
  items,
  selIdx,
  playIdx,
  onPick,
  onPlayRow,
  subOf,
  tabKey,
  accent = 'blue',
  expandedIdx = -1,
  renderDetail = null,
  mode = 'list',
  isPlaying = false,
  hideAnswers = false,
}) {
  const A = ACCENTS[accent] || ACCENTS.blue;
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

        return (
          <div key={q.id || idx} id={`qarow-${tabKey}-${idx}`} className="transition-all">
            <div
              onClick={() => onPick(idx)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer min-h-[48px]',
                isCurrentPlaying
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs'
                  : isSelected
                  ? A.rowActive + ' border-2 shadow-xs'
                  : 'bg-card border-border hover:border-border/80 hover:bg-secondary/50'
              )}
            >
              {/* Number Badge */}
              <span
                className={cn(
                  'font-mono text-xs font-bold w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                  isCurrentPlaying
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : isSelected
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-muted-foreground'
                )}
              >
                {idx + 1}
              </span>

              {/* Korean & Indonesian preview */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-kr font-bold text-sm text-foreground truncate leading-snug">
                    {q.question_ko}
                  </span>
                  {isCurrentPlaying && (
                    <SoundWave playing={isPlaying} className="text-primary shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate mt-0.5">
                  <span className="truncate">{subOf(q)}</span>
                  {q.question_id && (
                    <>
                      <span>·</span>
                      <span className="truncate italic opacity-85">"{q.question_id}"</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Button: Play sequentially from this exact question */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayRow(idx);
                }}
                title={`Putar berurutan mulai dari nomor #${idx + 1}`}
                className={cn(
                  'p-2 rounded-lg transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold',
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

            {/* Expandable detail right below the item */}
            {idx === expandedIdx && renderDetail && (
              <div className="pt-2 pb-1 animate-fade-in">{renderDetail(q, idx)}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Detail Satu Soal Focus Card (QADetail) ---
export function QADetail({
  q,
  num,
  cardId,
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
}) {
  const A = ACCENTS[accent] || ACCENTS.blue;
  if (!q) return null;

  return (
    <Card className={A.card}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          <span className={A.badge}>
            #{num} · {subLabel}
          </span>
          <div className="flex items-center gap-1 sm:hidden">
            <Button type="button" variant="ghost" size="icon" onClick={onPrev} title="Soal sebelumnya" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-mono text-[11px] font-bold text-muted-foreground px-1">{posLabel}</span>
            <Button type="button" variant="ghost" size="icon" onClick={onNext} title="Soal berikutnya" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-border/40">
          <div className="hidden sm:flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon" onClick={onPrev} title="Soal sebelumnya" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-mono text-[11px] font-bold text-muted-foreground px-1">{posLabel}</span>
            <Button type="button" variant="ghost" size="icon" onClick={onNext} title="Soal berikutnya" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
            {q.audio_q && (
              <Button type="button" variant="outline" size="sm" onClick={onPlayQ} title={A.playTitle} className="h-8 text-xs">
                <Volume2 className="h-3.5 w-3.5" />
                <span>Putar Soal</span>
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={onToggle} className="h-8 text-xs">
              {hidden ? <EyeOff className="h-3.5 w-3.5 text-warn" /> : <Eye className="h-3.5 w-3.5" />}
              <span>{hidden ? 'Kunci' : 'Tutup'}</span>
            </Button>
          </div>
        </div>
      </div>

      <h4 className="text-xl md:text-2xl font-bold text-foreground font-kr tracking-tight leading-snug">
        {q.question_ko}
      </h4>
      {q.question_ro && (
        <p className="text-xs text-muted-foreground font-mono -mt-1">{q.question_ro}</p>
      )}
      <p className={A.mean}>
        {A.meanLabel}"{q.question_id}"
      </p>

      <div className="border-t border-border pt-3">
        <div className="mb-2 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {A.ansLabel}{activeOpt.label || ansFallback}
          </span>

          {q.answer_options && q.answer_options.length > 1 && !hidden && (
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap rounded-lg border border-border bg-secondary/50 p-1 gap-1">
              {q.answer_options.map((opt, optIdx) => {
                const isSelected = (selOptIdx ?? 0) === optIdx;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => onSelectOpt(optIdx)}
                    className={cn(
                      'px-2 py-1.5 rounded-md text-[11px] font-bold transition-all leading-tight text-left sm:text-center sm:flex-1 sm:min-w-[90px]',
                      isSelected
                        ? 'bg-foreground text-background shadow-xs'
                        : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {hidden ? (
          <div
            onClick={onToggle}
            className="py-3 px-4 rounded-md bg-warn/10 border border-dashed border-warn/30 text-center cursor-pointer hover:bg-warn/20 transition-colors"
          >
            <span className="text-xs font-bold text-warn flex items-center justify-center gap-1.5">
              <EyeOff className="h-3.5 w-3.5" />
              <span>Jawaban disembunyikan untuk hafalan. Ketuk di sini untuk melihat</span>
            </span>
          </div>
        ) : (
          <div className="rounded-lg bg-emerald-600 border-2 border-emerald-700 px-4 py-3.5 shadow-sm text-white space-y-1.5">
            <p className="text-base md:text-lg font-bold font-kr leading-snug">
              {activeOpt.ko}
            </p>
            {activeOpt.ro && (
              <p className="text-[11px] text-emerald-100 font-mono">{activeOpt.ro}</p>
            )}
            <p className="text-xs text-emerald-100 font-medium">
              <strong>Artinya:</strong> {activeOpt.id}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-2 bg-white/20 text-white border-white/30 hover:bg-white/30"
              onClick={onPlayAnswer}
            >
              <Volume2 className="h-3 w-3" />
              <span>Dengar Jawaban</span>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

// --- Bar Tampilan ala Epstopikhub: Daftar/Satu item + Sertakan/Hanya pertanyaan + Teks ---
export function QAViewBar({
  view = 'list',
  onView,
  hideAnswers,
  onOnlyQ,
  onWithA,
  hideText = false,
  onToggleHideText,
  visible,
  total,
}) {
  const segBtn = (active) =>
    cn(
      'px-3 py-1.5 rounded-md text-[11px] font-bold transition-all min-h-[30px]',
      active
        ? 'bg-foreground text-background shadow-xs'
        : 'text-muted-foreground hover:text-foreground'
    );

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Toggle View: Daftar vs Satu item */}
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5 gap-0.5 shadow-xs">
          <button type="button" onClick={() => onView('list')} className={segBtn(view === 'list')}>
            Daftar
          </button>
          <button type="button" onClick={() => onView('single')} className={segBtn(view === 'single')}>
            Satu item
          </button>
        </div>

        {/* Toggle Audio Mode: Hanya soal vs Sertakan jawaban */}
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5 gap-0.5 shadow-xs">
          <button type="button" onClick={onOnlyQ} className={segBtn(hideAnswers)}>
            Hanya Soal (Standar)
          </button>
          <button type="button" onClick={onWithA} className={segBtn(!hideAnswers)}>
            Sertakan Jawaban
          </button>
        </div>

        {/* Toggle Text: Teks Soal vs Dengar Murni */}
        {onToggleHideText && (
          <div className="inline-flex rounded-lg border border-border bg-card p-0.5 gap-0.5 shadow-xs">
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
export function QAControls({ count, active, onStart, onStop }) {
  if (active) return null;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button type="button" onClick={onStart} className="shadow-xs font-semibold">
        <ListMusic className="h-4 w-4" />
        <span>Autoplay {count} Soal Berurutan</span>
      </Button>
      <span className="text-[11px] text-muted-foreground">
        Format resmi: Pertanyaan penguji → Jeda hafalan → Kunci jawaban.
      </span>
    </div>
  );
}
