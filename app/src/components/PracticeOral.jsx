import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Mic,
  CheckCircle2,
  Zap,
  Play,
  Pause,
  Shuffle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Headphones,
  RotateCcw,
  Hand,
  FastForward
} from 'lucide-react';
import { SoundWave } from './QAStudy.jsx';
import { Button } from './ui/button.jsx';
import { Card } from './ui/card.jsx';
import { Badge } from './ui/badge.jsx';
import { Switch } from './ui/switch.jsx';
import { cn } from '../utils/cn.js';
import { getAssetUrl } from '../utils/assetHelper.js';

export function PracticeOral({
  questions = [],
  onSelectIndex,
  onPrev,
  onNext,
  currentQ,
  currentIndex = 0,
  total = 0,
  blindMode,
  setBlindMode,
  showTranslate,
  setShowTranslate,
  showAnswer,
  setShowAnswer,
  onPlayQuestion,
  onPlayAnswer,
  onPlayMeaning,
  isPlayingAudio,
  isRecording,
  onToggleRecording,
  recordedAudioUrl,
  audioSpeed = 0.8,
  onToggleAudioSpeed
}) {
  // =========================================================================
  // Hands-Free Automated Interview Drill Engine
  // =========================================================================
  const [isDrillActive, setIsDrillActive] = useState(false);
  const [drillStep, setDrillStep] = useState('idle'); // 'idle' | 'question' | 'gap' | 'answer'
  const [gapCountdown, setGapCountdown] = useState(0);

  const [drillShuffle, setDrillShuffle] = useState(() => {
    try {
      const s = localStorage.getItem('kore_oral_shuffle');
      return s !== null ? s === 'true' : true;
    } catch {
      return true;
    }
  });

  const [drillDelay, setDrillDelay] = useState(() => {
    try {
      const s = localStorage.getItem('kore_oral_delay');
      return s ? parseInt(s, 10) : 5;
    } catch {
      return 5;
    }
  });

  const [drillIncludeAnswers, setDrillIncludeAnswers] = useState(() => {
    try {
      const s = localStorage.getItem('kore_oral_include_answers');
      return s !== null ? s === 'true' : true;
    } catch {
      return true;
    }
  });

  const [drillAutoAdvance, setDrillAutoAdvance] = useState(() => {
    try {
      const s = localStorage.getItem('kore_oral_auto_advance');
      return s !== null ? s === 'true' : false; // Default manual ganti soal sesuai permintaan user
    } catch {
      return false;
    }
  });

  const [selectedOptionIndex, setSelectedOptionIndex] = useState(() => {
    try {
      const s = localStorage.getItem('kore_oral_opt_idx');
      return s !== null ? parseInt(s, 10) : 0;
    } catch {
      return 0;
    }
  });

  const drillAudioRef = useRef(new Audio());
  const countdownIntervalRef = useRef(null);
  const transitionTimerRef = useRef(null);
  const isDrillActiveRef = useRef(isDrillActive);
  isDrillActiveRef.current = isDrillActive;

  const drillDelayRef = useRef(drillDelay);
  drillDelayRef.current = drillDelay;

  const drillIncludeAnswersRef = useRef(drillIncludeAnswers);
  drillIncludeAnswersRef.current = drillIncludeAnswers;

  const drillAutoAdvanceRef = useRef(drillAutoAdvance);
  drillAutoAdvanceRef.current = drillAutoAdvance;

  const selectedOptionIndexRef = useRef(selectedOptionIndex);
  selectedOptionIndexRef.current = selectedOptionIndex;

  const handleSelectOptionIndex = (idx) => {
    setSelectedOptionIndex(idx);
    selectedOptionIndexRef.current = idx;
    try {
      localStorage.setItem('kore_oral_opt_idx', String(idx));
    } catch {}
  };

  const orderRef = useRef([]);
  const posRef = useRef(0);

  const generateOrder = (len, startIdx, shuffle) => {
    if (!len || len <= 0) return [0];
    const arr = Array.from({ length: len }, (_, i) => i);
    if (!shuffle) return arr;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (typeof startIdx === 'number' && startIdx >= 0 && startIdx < len) {
      const curPos = arr.indexOf(startIdx);
      if (curPos > 0) {
        [arr[0], arr[curPos]] = [arr[curPos], arr[0]];
      }
    }
    return arr;
  };

  const clearDrillTimers = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    setGapCountdown(0);
  };

  const stopDrillAudio = () => {
    try {
      drillAudioRef.current.pause();
    } catch {}
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  };

  const stopDrill = () => {
    clearDrillTimers();
    stopDrillAudio();
    setIsDrillActive(false);
    setDrillStep('idle');
  };

  const resolveOralAnswerAudio = (q) => {
    if (!q) return null;
    const prefIdx = selectedOptionIndexRef.current ?? 0;
    if (q.answer_options && q.answer_options.length > 0) {
      const opt = q.answer_options[prefIdx] || q.answer_options[0];
      if (opt && opt.audio) return opt.audio;
    }
    if (q.audio_a) return q.audio_a;
    if (q.id) {
      if (q.id.startsWith('cmd_') || q.id.startsWith('wwc_') || q.id.startsWith('safety_')) {
        return `/audio/tts/answers/${q.id}_a.mp3`;
      }
    }
    return null;
  };

  const driveDrillQuestion = () => {
    const list = questions.length > 0 ? questions : [currentQ];
    if (!orderRef.current || orderRef.current.length !== list.length) {
      orderRef.current = generateOrder(list.length, currentIndex, drillShuffle);
      posRef.current = orderRef.current.indexOf(currentIndex);
      if (posRef.current === -1) posRef.current = 0;
    }

    const qIdx = orderRef.current[posRef.current] ?? 0;
    const q = list[qIdx] || currentQ;
    if (!q) {
      stopDrill();
      return;
    }

    if (qIdx !== currentIndex && onSelectIndex) {
      onSelectIndex(qIdx);
    }

    clearDrillTimers();
    setDrillStep('question');

    const audioUrl = q.audio_q || (q.category === 'piktogram' ? '/audio/examiner_sign_q.mp3' : (q.category === 'alat_manufaktur' || q.category === 'alat_klasik') ? '/audio/examiner_tool_q.mp3' : null);
    if (audioUrl) {
      drillAudioRef.current.pause();
      drillAudioRef.current.src = getAssetUrl(audioUrl);
      drillAudioRef.current.playbackRate = audioSpeed;
      drillAudioRef.current.onended = () => onQuestionAudioEnd(q);
      drillAudioRef.current.onerror = () => onQuestionAudioEnd(q);
      drillAudioRef.current.play().catch(() => onQuestionAudioEnd(q));
    } else if (q.question_ko && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
      const u = new SpeechSynthesisUtterance(q.question_ko);
      u.lang = 'ko-KR';
      u.rate = audioSpeed;
      u.onend = () => onQuestionAudioEnd(q);
      u.onerror = () => onQuestionAudioEnd(q);
      window.speechSynthesis.speak(u);
    } else {
      transitionTimerRef.current = setTimeout(() => onQuestionAudioEnd(q), 1500);
    }
  };

  const onQuestionAudioEnd = (q) => {
    if (!isDrillActiveRef.current) return;
    const delay = drillDelayRef.current;
    if (delay <= 0) {
      proceedToAnswerOrNext(q);
      return;
    }

    setDrillStep('gap');
    setGapCountdown(delay);

    let rem = delay;
    countdownIntervalRef.current = setInterval(() => {
      rem -= 1;
      setGapCountdown(rem);
      if (rem <= 0) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        if (isDrillActiveRef.current) {
          proceedToAnswerOrNext(q);
        }
      }
    }, 1000);
  };

  const proceedToAnswerOrNext = (q) => {
    if (!isDrillActiveRef.current) return;
    if (drillIncludeAnswersRef.current) {
      const answerUrl = resolveOralAnswerAudio(q);
      const prefIdx = selectedOptionIndexRef.current ?? 0;
      const opt = (q.answer_options && q.answer_options[prefIdx]) || (q.answer_options && q.answer_options[0]);
      const answerText = opt?.answer_ko || opt?.ko || q.answer_short_ko || q.answer_ko || q.title_ko;
      if (answerUrl) {
        setDrillStep('answer');
        setShowAnswer(true);
        drillAudioRef.current.pause();
        drillAudioRef.current.src = getAssetUrl(answerUrl);
        drillAudioRef.current.playbackRate = audioSpeed;
        drillAudioRef.current.onended = () => onStepCycleComplete();
        drillAudioRef.current.onerror = () => onStepCycleComplete();
        drillAudioRef.current.play().catch(() => onStepCycleComplete());
        return;
      } else if (answerText && 'speechSynthesis' in window) {
        setDrillStep('answer');
        setShowAnswer(true);
        try { window.speechSynthesis.cancel(); } catch {}
        const u = new SpeechSynthesisUtterance(answerText);
        u.lang = 'ko-KR';
        u.rate = audioSpeed;
        u.onend = () => onStepCycleComplete();
        u.onerror = () => onStepCycleComplete();
        window.speechSynthesis.speak(u);
        return;
      }
    }
    onStepCycleComplete();
  };

  const onStepCycleComplete = () => {
    if (!isDrillActiveRef.current) return;
    if (!drillAutoAdvanceRef.current) {
      // MODE MANUAL: Berhenti di soal ini dan tunggu user klik tombol berikutnya
      setDrillStep('waiting_manual');
      return;
    }
    // MODE OTOMATIS: Lanjut ke soal berikutnya secara otomatis
    advanceToNextQuestion();
  };

  const advanceToNextQuestion = () => {
    if (!isDrillActiveRef.current) return;
    const list = questions.length > 0 ? questions : [currentQ];
    const last = posRef.current + 1 >= orderRef.current.length;

    if (last && drillShuffle && list.length > 1) {
      orderRef.current = generateOrder(list.length, -1, true);
      posRef.current = 0;
    } else {
      posRef.current = last ? 0 : posRef.current + 1;
    }

    setDrillStep('question');
    transitionTimerRef.current = setTimeout(() => {
      if (isDrillActiveRef.current) {
        driveDrillQuestion();
      }
    }, 700);
  };

  const toggleDrillPlay = () => {
    if (isDrillActive && drillStep !== 'waiting_manual') {
      stopDrill();
    } else {
      setIsDrillActive(true);
      isDrillActiveRef.current = true;
      const list = questions.length > 0 ? questions : [currentQ];
      if (!orderRef.current || orderRef.current.length !== list.length) {
        orderRef.current = generateOrder(list.length, currentIndex, drillShuffle);
        posRef.current = orderRef.current.indexOf(currentIndex);
        if (posRef.current === -1) posRef.current = 0;
      }
      driveDrillQuestion();
    }
  };

  const stepDrill = (direction, autoStart = false) => {
    const list = questions.length > 0 ? questions : [currentQ];
    clearDrillTimers();
    stopDrillAudio();

    if (!orderRef.current || orderRef.current.length !== list.length) {
      orderRef.current = generateOrder(list.length, currentIndex, drillShuffle);
      posRef.current = orderRef.current.indexOf(currentIndex);
      if (posRef.current === -1) posRef.current = 0;
    }

    let nextPos = posRef.current + direction;
    if (nextPos < 0) nextPos = Math.max(0, orderRef.current.length - 1);
    if (nextPos >= orderRef.current.length) {
      if (drillShuffle && list.length > 1) {
        orderRef.current = generateOrder(list.length, -1, true);
        nextPos = 0;
      } else {
        nextPos = 0;
      }
    }

    posRef.current = nextPos;
    const nextIdx = orderRef.current[nextPos] ?? 0;
    if (onSelectIndex) onSelectIndex(nextIdx);

    if (isDrillActiveRef.current || autoStart) {
      setIsDrillActive(true);
      isDrillActiveRef.current = true;
      transitionTimerRef.current = setTimeout(() => {
        if (isDrillActiveRef.current) driveDrillQuestion();
      }, 200);
    }
  };

  const toggleAutoAdvance = () => {
    const next = !drillAutoAdvance;
    setDrillAutoAdvance(next);
    drillAutoAdvanceRef.current = next;
    try {
      localStorage.setItem('kore_oral_auto_advance', String(next));
    } catch {}
    if (next && drillStep === 'waiting_manual') {
      advanceToNextQuestion();
    }
  };

  const toggleShuffle = () => {
    const next = !drillShuffle;
    setDrillShuffle(next);
    try {
      localStorage.setItem('kore_oral_shuffle', String(next));
    } catch {}
    const list = questions.length > 0 ? questions : [currentQ];
    orderRef.current = generateOrder(list.length, currentIndex, next);
    posRef.current = orderRef.current.indexOf(currentIndex);
    if (posRef.current === -1) posRef.current = 0;
  };

  const handleSetDelay = (sec) => {
    setDrillDelay(sec);
    drillDelayRef.current = sec;
    try {
      localStorage.setItem('kore_oral_delay', String(sec));
    } catch {}
  };

  const toggleIncludeAnswers = () => {
    const next = !drillIncludeAnswers;
    setDrillIncludeAnswers(next);
    drillIncludeAnswersRef.current = next;
    try {
      localStorage.setItem('kore_oral_include_answers', String(next));
    } catch {}
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearDrillTimers();
      stopDrillAudio();
    };
  }, []);

  // Sync speed changes to running drill audio
  useEffect(() => {
    if (drillAudioRef.current) {
      drillAudioRef.current.playbackRate = audioSpeed;
    }
  }, [audioSpeed]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center space-y-3.5 animate-fade-in">

      {/* ========================================================= */}
      {/* 1. Hands-Free Automated Interview Drill Player Deck       */}
      {/* ========================================================= */}
      <div className="w-full rounded-2xl border-2 border-primary/25 bg-card p-3.5 sm:p-4 shadow-sm space-y-3 transition-all text-left">
        {/* Baris 1: Header + Status Stage Badge */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              <Headphones className="size-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5 truncate">
                <span>Player Latihan Wawancara</span>
                <span className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0",
                  drillAutoAdvance
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                    : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-bold"
                )}>
                  {drillAutoAdvance ? "Hands-Free (Otomatis)" : "Mode Manual"}
                </span>
              </h3>
              <p className="text-[11px] text-muted-foreground truncate">
                {drillAutoAdvance
                  ? "Penguji bertanya otomatis & ganti soal sendiri"
                  : "Audio penguji diputar, ganti soal menunggu klik Anda"}
              </p>
            </div>
          </div>

          {/* Real-time Status Badge */}
          <div className="shrink-0">
            {drillStep === 'question' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/30 animate-pulse">
                <SoundWave playing className="text-primary" />
                <span>Penguji Bertanya...</span>
              </span>
            )}
            {drillStep === 'gap' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 animate-pulse">
                <Mic className="size-3.5 text-amber-600 dark:text-amber-400 animate-bounce" />
                <span>Waktunya Anda Bicara · {gapCountdown}s</span>
              </span>
            )}
            {drillStep === 'answer' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                <SoundWave playing className="text-emerald-700 dark:text-emerald-300" />
                <span>Kunci Jawaban Model HRDK</span>
              </span>
            )}
            {drillStep === 'waiting_manual' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border border-indigo-500/40">
                <CheckCircle2 className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Selesai · Tekan 'Lanjut Soal'</span>
              </span>
            )}
            {drillStep === 'idle' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary text-muted-foreground border border-border">
                <span>Siap Latihan</span>
              </span>
            )}
          </div>
        </div>

        {/* Baris 2: Central Controls (Play/Pause, Prev, Next, Nomor Soal) */}
        <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-center gap-2">
            {drillStep === 'waiting_manual' ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => stepDrill(1, true)}
                  className="h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl text-xs font-bold flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-md active:scale-95 animate-pulse"
                  title="Lanjut ke soal berikutnya dan putar audio pertanyaan"
                >
                  <Play className="size-4 ml-0.5" />
                  <span>Lanjut Soal Berikutnya ▶</span>
                </button>
                <button
                  type="button"
                  onClick={() => driveDrillQuestion()}
                  className="h-10 sm:h-11 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 text-foreground border border-border cursor-pointer transition-colors"
                  title="Putar ulang pertanyaan ini"
                >
                  <RotateCcw className="size-3.5" />
                  <span className="hidden sm:inline">Ulangi</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={toggleDrillPlay}
                className={cn(
                  "h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95",
                  isDrillActive
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                )}
                title={isDrillActive ? "Jeda pemutar" : "Mulai wawancara"}
              >
                {isDrillActive ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
                <span>{isDrillActive ? "Jeda Wawancara" : "Mulai Wawancara"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => stepDrill(-1)}
              disabled={currentIndex === 0 && !drillShuffle}
              className="size-9 rounded-lg border border-border bg-card hover:bg-secondary text-foreground grid place-items-center cursor-pointer transition-colors disabled:opacity-40"
              title="Soal Sebelumnya"
            >
              <ChevronLeft className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => stepDrill(1)}
              className="size-9 rounded-lg border border-border bg-card hover:bg-secondary text-foreground grid place-items-center cursor-pointer transition-colors"
              title="Soal Berikutnya"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Quick Info & Shuffle indicator */}
          <div className="text-right shrink-0">
            <span className="font-mono text-sm font-bold text-foreground">
              #{currentIndex + 1} <span className="text-xs text-muted-foreground font-normal">/ {total}</span>
            </span>
            <div className="text-[11px] font-medium text-muted-foreground">
              {drillShuffle ? "🔀 Acak Aktif" : "➡️ Berurutan"}
            </div>
          </div>
        </div>

        {/* Baris 3: Settings Strip (Ganti Soal Manual/Otomatis, Play Acak, Jeda Bicara, Kunci Otomatis, Kecepatan) */}
        <div className="flex items-center gap-2 flex-wrap pt-0.5 text-xs">
          {/* Mode Ganti Soal: Otomatis vs Manual */}
          <button
            type="button"
            onClick={toggleAutoAdvance}
            className={cn(
              "px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-xs",
              !drillAutoAdvance
                ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-bold"
                : "bg-secondary text-muted-foreground border-border hover:text-foreground"
            )}
            title={drillAutoAdvance ? "Saat ini Ganti Soal Otomatis. Klik untuk beralih ke Mode Manual (tunggu Anda siap sebelum pindah soal)" : "Saat ini Ganti Soal Manual (tunggu klik Anda). Klik untuk beralih ke Mode Otomatis"}
          >
            {!drillAutoAdvance ? (
              <>
                <Hand className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Ganti Soal: Manual</span>
              </>
            ) : (
              <>
                <FastForward className="size-3.5 text-primary" />
                <span>Ganti Soal: Otomatis</span>
              </>
            )}
          </button>

          {/* Shuffle Toggle */}
          <button
            type="button"
            onClick={toggleShuffle}
            className={cn(
              "px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-xs",
              drillShuffle
                ? "bg-primary/10 text-primary border-primary/30 font-bold"
                : "bg-secondary text-muted-foreground border-border hover:text-foreground"
            )}
            title="Acak urutan pertanyaan agar mirip wawancara sungguhan"
          >
            <Shuffle className="size-3.5" />
            <span>Play Acak {drillShuffle ? "ON" : "OFF"}</span>
          </button>

          {/* Jeda Menjawab (Delay Pills) */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary border border-border text-xs">
            <Clock className="size-3 text-muted-foreground mr-0.5 shrink-0" />
            <span className="text-[11px] font-medium text-muted-foreground shrink-0">Jeda Jawab:</span>
            {[2, 3, 5, 8, 10].map(sec => (
              <button
                key={sec}
                type="button"
                onClick={() => handleSetDelay(sec)}
                className={cn(
                  "px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer",
                  drillDelay === sec
                    ? "bg-foreground text-background font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={`Waktu jeda bicara ${sec} detik sebelum lanjut`}
              >
                {sec}s
              </button>
            ))}
          </div>

          {/* Putar Jawaban Otomatis Toggle */}
          <button
            type="button"
            onClick={toggleIncludeAnswers}
            className={cn(
              "px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-xs",
              drillIncludeAnswers
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                : "bg-secondary text-muted-foreground border-border hover:text-foreground"
            )}
            title="Putar audio kunci jawaban model HRDK setelah waktu bicara selesai"
          >
            {drillIncludeAnswers ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
            <span>{drillIncludeAnswers ? "🔊 Kunci Diputar" : "🔇 Kunci Senyap"}</span>
          </button>

          {/* Speed Toggle */}
          {onToggleAudioSpeed && (
            <button
              type="button"
              onClick={onToggleAudioSpeed}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-secondary text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1 cursor-pointer transition-colors text-xs"
              title="Atur kecepatan bicara penguji (0.8x santai, 1.0x kecepatan normal Korea)"
            >
              <Zap className="size-3.5" />
              <span>{audioSpeed}x</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. Clean Meta Bar & Visual Toggles                        */}
      {/* ========================================================= */}
      <div className="w-full flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border px-0.5">
        <span className="font-mono font-bold text-foreground text-sm">
          #{currentIndex + 1} <span className="text-muted-foreground text-xs font-normal">/ {total}</span>
        </span>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-xs font-medium text-foreground">Arti</span>
            <Switch
              checked={showTranslate}
              onCheckedChange={setShowTranslate}
              aria-label="Tampilkan terjemahan"
            />
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-xs font-medium text-foreground">Blind Mode</span>
            <Switch
              checked={blindMode}
              onCheckedChange={setBlindMode}
              aria-label="Mode buta teks untuk melatih pendengaran"
            />
          </label>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. Question & Answer Card                                  */}
      {/* ========================================================= */}
      <Card className="w-full p-5 sm:p-6 flex flex-col items-center">
        <div className="w-full flex items-center justify-between gap-2 mb-3">
          <Badge variant="outline" className={cn(
            "font-mono text-xs px-2.5 py-1 rounded-full font-bold truncate",
            currentQ?.category === 'fungsi_alat'
              ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
              : currentQ?.category === 'praktik_alat' || currentQ?.category === 'perintah_alat'
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
              : currentQ?.category === 'alat_manufaktur' || currentQ?.category === 'alat_klasik'
              ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30"
              : ""
          )}>
            {currentQ?.category === 'fungsi_alat'
              ? '⚙️ Soal Fungsi Alat (공구 용도)'
              : currentQ?.category === 'praktik_alat' || currentQ?.category === 'perintah_alat'
              ? '🛠️ Soal Instruksi Kerja (작업지시 실기)'
              : currentQ?.category === 'alat_manufaktur' || currentQ?.category === 'alat_klasik'
              ? '📌 Soal Tebak Nama Alat (이것은 무엇입니까?)'
              : currentQ?.category_title || currentQ?.category}
          </Badge>

          <button
            type="button"
            onClick={() => setShowAnswer(!showAnswer)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0 cursor-pointer"
          >
            {showAnswer ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{showAnswer ? 'Tutup Kunci' : 'Lihat Kunci Jawaban'}</span>
          </button>
        </div>

        {currentQ?.image_url && (
          <div className="max-h-48 md:max-h-60 w-full flex items-center justify-center mb-3">
            <img
              src={getAssetUrl(currentQ.image_url)}
              alt="Perkakas atau Rambu K3"
              className="max-h-44 md:max-h-56 w-auto object-contain"
            />
          </div>
        )}

        {!blindMode ? (
          <div className="space-y-1.5 my-2">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground font-kr tracking-tight leading-snug">
              {currentQ?.question_ko}
            </h2>
            {currentQ?.question_romaja && (
              <p className="text-xs text-muted-foreground font-mono">
                {currentQ?.question_romaja}
              </p>
            )}
            {showTranslate && currentQ?.question_id && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  &ldquo;{currentQ?.question_id}&rdquo;
                </p>
                {onPlayMeaning && (
                  <button
                    type="button"
                    onClick={() => onPlayMeaning(currentQ.question_id)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer shrink-0"
                    title="Dengar maksud pertanyaan dalam bahasa Indonesia"
                  >
                    <Volume2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Dengar Maksud</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-xs text-warn font-medium my-2 max-w-md bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 text-center">
            <p className="font-bold text-amber-800 dark:text-amber-300 mb-1">
              Blind Mode Aktif (Teks Disembunyikan)
            </p>
            <p className="text-muted-foreground">
              Dengarkan pertanyaan penguji lewat pemutar otomatis di atas, lalu latih jawaban lisan Anda tanpa membaca teks.
            </p>
          </div>
        )}

        {/* Answer Key Model HRD Korea */}
        {showAnswer && (
          <div className="w-full mt-4 pt-4 border-t border-border text-left space-y-2.5 animate-fade-in">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Jawaban Model HRD Korea
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => {
                    const ansUrl = resolveOralAnswerAudio(currentQ);
                    const activeOpt = (currentQ?.answer_options && currentQ.answer_options[selectedOptionIndex]) || (currentQ?.answer_options && currentQ.answer_options[0]);
                    const activeTxt = activeOpt?.answer_ko || activeOpt?.ko || currentQ?.answer_short_ko || currentQ?.answer_ko;
                    if (ansUrl) onPlayAnswer(ansUrl);
                    else if (activeTxt) onPlayAnswer(activeTxt);
                    else onPlayAnswer();
                  }} 
                  className="h-8 px-2.5 text-xs gap-1.5 cursor-pointer"
                  title="Putar suara jawaban model yang dipilih (Korea)"
                >
                  <Volume2 className="h-3.5 w-3.5 text-primary" />
                  <span>Putar Jawaban (KR)</span>
                </Button>

                {onPlayMeaning && (() => {
                  const activeOpt = (currentQ?.answer_options && currentQ.answer_options[selectedOptionIndex]) || (currentQ?.answer_options && currentQ.answer_options[0]) || null;
                  const ansId = activeOpt?.answer_id || activeOpt?.id || currentQ?.answer_short_id || currentQ?.title_id || currentQ?.answer_id;
                  if (!ansId) return null;
                  return (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onPlayMeaning(ansId)}
                      className="h-8 px-2.5 text-xs gap-1.5 cursor-pointer border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
                      title="Dengar arti terjemahan jawaban dalam bahasa Indonesia"
                    >
                      <Volume2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Dengar Arti (ID)</span>
                    </Button>
                  );
                })()}
              </div>
            </div>

            {/* Answer Options Selector (⚡ Super Mudah, ⭐ Standar HRDK, 🔹 Bentuk 도구, 📘 Lengkap) */}
            {currentQ?.answer_options && currentQ.answer_options.length > 1 && (
              <div className="space-y-1.5 py-1.5 px-2.5 bg-secondary/50 rounded-xl border border-border">
                <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>Pilihan Opsi Jawaban:</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold normal-case">
                    ✓ Diingat untuk semua soal
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {currentQ.answer_options.map((opt, oi) => {
                    const isSelected = selectedOptionIndex === oi;
                    return (
                      <button
                        key={oi}
                        type="button"
                        onClick={() => {
                          handleSelectOptionIndex(oi);
                          if (opt.audio) onPlayAnswer(opt.audio);
                          else if (opt.answer_ko || opt.ko) onPlayAnswer(opt.answer_ko || opt.ko);
                        }}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer",
                          isSelected
                            ? "bg-emerald-600 text-white shadow-xs font-bold"
                            : "bg-card text-muted-foreground hover:text-foreground border border-border"
                        )}
                        title={`Pilih ${opt.label || `Opsi ${oi + 1}`} (klik untuk dengar & simpan)`}
                      >
                        <span>{opt.label || `Opsi ${oi + 1}`}</span>
                        {isSelected && <span className="text-[10px] opacity-80">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Teks Jawaban Terpilih */}
            {(() => {
              const activeOpt = (currentQ?.answer_options && currentQ.answer_options[selectedOptionIndex]) || (currentQ?.answer_options && currentQ.answer_options[0]) || null;
              const ansKo = activeOpt?.answer_ko || activeOpt?.ko || currentQ?.answer_short_ko || currentQ?.title_ko || currentQ?.answer_ko;
              const ansId = activeOpt?.answer_id || activeOpt?.id || currentQ?.answer_short_id || currentQ?.title_id || currentQ?.answer_id;
              return (
                <div className="space-y-1 pt-0.5">
                  <p className="text-xl font-bold text-foreground font-kr">
                    {ansKo}
                  </p>
                  {showTranslate && ansId && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Artinya: {ansId}
                      </p>
                      {onPlayMeaning && (
                        <button
                          type="button"
                          onClick={() => onPlayMeaning(ansId)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer shrink-0"
                          title="Dengar terjemahan bahasa Indonesia"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Dengar</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Recorded voice playback */}
        {recordedAudioUrl && (
          <div className="w-full mt-4 pt-3.5 border-t border-border flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse-dot" />
              <span>Rekaman Suara Anda:</span>
            </div>
            <audio src={recordedAudioUrl} controls className="h-8 max-w-[220px]" />
          </div>
        )}
      </Card>

      {/* Mic instruction */}
      <div className="text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1.5">
        <Mic className={cn('h-3.5 w-3.5 shrink-0', isRecording ? 'text-destructive animate-pulse-dot' : 'text-muted-foreground')} />
        <span>Gunakan tombol play otomatis di atas untuk simulasi mengalir, atau bilah bawah untuk latihan manual</span>
      </div>
    </div>
  );
}
