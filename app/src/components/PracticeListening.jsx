import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Volume2, Headphones, CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Card } from './ui/card.jsx';
import { cn } from '../utils/cn.js';
import { getAssetUrl } from '../utils/assetHelper.js';

export function PracticeListening({
  questions,
  onPlayAudio,
  isPlayingAudio
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [quizFinished, setQuizFinished] = useState(false);

  const [optionLang, setOptionLang] = useState('ko');
  const [showScript, setShowScript] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const audioQuestions = useMemo(() => {
    const list = questions.filter(q => q.audio_q);
    return list.length > 0 ? list : questions;
  }, [questions]);

  const shuffledQuestions = useMemo(() => {
    return [...audioQuestions].sort(() => Math.random() - 0.5);
  }, [audioQuestions]);

  const currentQ = shuffledQuestions[currentIndex] || audioQuestions[0] || {};

  const localAudioRef = useRef(new Audio());
  const [isLocalPlaying, setIsLocalPlaying] = useState(false);

  const playQuestionAudio = () => {
    if (!currentQ?.audio_q) return;
    localAudioRef.current.pause();
    localAudioRef.current.src = getAssetUrl(currentQ.audio_q);
    localAudioRef.current.playbackRate = playbackRate;
    setIsLocalPlaying(true);
    localAudioRef.current.onended = () => setIsLocalPlaying(false);
    localAudioRef.current.onerror = () => setIsLocalPlaying(false);
    localAudioRef.current.play().catch(() => setIsLocalPlaying(false));
  };

  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setShowScript(false);
    const timer = setTimeout(() => {
      playQuestionAudio();
    }, 200);
    return () => {
      clearTimeout(timer);
      localAudioRef.current.pause();
      setIsLocalPlaying(false);
    };
  }, [currentIndex, currentQ?.id]);

  useEffect(() => {
    localAudioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        playQuestionAudio();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQ]);

  const getAnswerTexts = (q) => {
    if (!q) return { ko: '', id: '' };
    let ko = '';
    let id = '';
    if (q.category === 'alat_manufaktur' || q.category === 'piktogram') {
      ko = q.title_ko || (q.answer_short_ko ? q.answer_short_ko.replace(/입니다\.$/, '').trim() : '') || q.answer_short_ko || '';
      id = q.title_id || q.answer_short_id || '';
    } else {
      ko = q.answer_short_ko || q.title_ko || '';
      id = q.answer_short_id || q.title_id || '';
    }
    if (!ko) ko = q.question_ko || '';
    if (!id) id = q.question_id || '';
    return { ko: ko.trim(), id: id.trim() };
  };

  const currentOptions = useMemo(() => {
    if (!currentQ || !audioQuestions.length) return [];
    const correct = getAnswerTexts(currentQ);
    if (!correct.ko && !correct.id) return [];

    const sameCategory = audioQuestions.filter(q => q.id !== currentQ.id && q.category === currentQ.category);
    const otherCategory = audioQuestions.filter(q => q.id !== currentQ.id && q.category !== currentQ.category);

    const getUniqueCandidates = (list) => {
      const seen = new Set([correct.ko.toLowerCase(), correct.id.toLowerCase()]);
      const result = [];
      const shuffled = [...list].sort(() => Math.random() - 0.5);
      for (const item of shuffled) {
        const texts = getAnswerTexts(item);
        if (texts.ko && texts.id && !seen.has(texts.ko.toLowerCase()) && !seen.has(texts.id.toLowerCase())) {
          seen.add(texts.ko.toLowerCase());
          seen.add(texts.id.toLowerCase());
          result.push(texts);
        }
      }
      return result;
    };

    const sameCandidates = getUniqueCandidates(sameCategory);
    let distractorTexts = sameCandidates.slice(0, 3);
    if (distractorTexts.length < 3) {
      const extraCandidates = getUniqueCandidates(otherCategory);
      distractorTexts = [...distractorTexts, ...extraCandidates].slice(0, 3);
    }

    const allOpts = [
      { ko: correct.ko, id: correct.id, isCorrect: true, id_ref: currentQ.id },
      ...distractorTexts.map((d, i) => ({ ko: d.ko, id: d.id, isCorrect: false, id_ref: `dist_${i}` }))
    ].sort(() => Math.random() - 0.5);

    return allOpts;
  }, [currentQ, audioQuestions]);

  const handleSelectOption = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    setShowScript(true);
    if (option.isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < shuffledQuestions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowScript(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowScript(false);
    setScore({ correct: 0, wrong: 0 });
    setQuizFinished(false);
  };

  const totalAnswered = score.correct + score.wrong;
  const accuracy = totalAnswered > 0 ? Math.round((score.correct / totalAnswered) * 100) : 0;
  const currentAnswerTexts = getAnswerTexts(currentQ);

  if (quizFinished) {
    return (
      <div className="w-full max-w-lg mx-auto bg-card border border-border rounded-lg p-6 md:p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 border border-primary/20">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Sesi Latihan Mendengar Selesai</h2>
        <p className="text-xs text-muted-foreground mt-1">Berikut akurasi kepekaan telinga Anda menangkap pertanyaan Korea:</p>

        <div className="grid grid-cols-3 gap-2.5 my-6">
          <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200">
            <span className="text-xl font-bold text-emerald-800">{score.correct}</span>
            <span className="text-xs font-medium text-emerald-700 block mt-0.5">Benar</span>
          </div>
          <div className="p-3.5 rounded-md bg-red-50 border border-red-200">
            <span className="text-xl font-bold text-red-800">{score.wrong}</span>
            <span className="text-xs font-medium text-red-700 block mt-0.5">Salah</span>
          </div>
          <div className="p-3.5 rounded-md bg-primary/5 border border-primary/20">
            <span className="text-xl font-bold text-primary">{accuracy}%</span>
            <span className="text-xs font-medium text-primary block mt-0.5">Akurasi</span>
          </div>
        </div>

        <Button onClick={handleRestart} className="w-full">
          <RotateCcw className="h-4 w-4" />
          <span>Ulangi Latihan Mendengar dari Awal</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center animate-fade-in text-foreground">

      {/* Controls */}
      <div className="w-full bg-secondary border border-border rounded-md p-3 mb-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-foreground bg-card border border-border px-2.5 py-0.5 rounded-sm">
              Soal {currentIndex + 1} / {shuffledQuestions.length}
            </span>
            <span className="text-[11px] font-medium text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-sm flex items-center gap-1">
              <Headphones className="h-3 w-3" />
              <span>Audio-First</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {score.correct}
            </span>
            <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              {score.wrong}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-border text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pilihan:</span>
            <div className="inline-flex p-0.5 bg-card border border-border rounded-sm">
              <button type="button" onClick={() => setOptionLang('ko')}
                className={cn('px-2.5 py-1 rounded-sm text-[11px] font-medium transition-colors',
                  optionLang === 'ko' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
                Korea
              </button>
              <button type="button" onClick={() => setOptionLang('id')}
                className={cn('px-2.5 py-1 rounded-sm text-[11px] font-medium transition-colors',
                  optionLang === 'id' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
                Indo
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kecepatan:</span>
              <button onClick={() => setPlaybackRate(prev => prev === 1.0 ? 0.85 : 1.0)}
                className={cn('px-2 py-0.5 rounded-sm border text-[11px] font-mono font-bold transition-colors',
                  playbackRate === 0.85
                    ? 'bg-warn/10 text-warn border-warn/30'
                    : 'bg-card text-muted-foreground border-border hover:text-foreground')}
                title="Atur kecepatan audio (0.85x untuk pemula, 1.0x kecepatan asli penguji)">
                {playbackRate}x
              </button>
            </div>

            <Button variant="outline" size="sm" onClick={() => setShowScript(!showScript)}
              title="Buka naskah teks pertanyaan jika Anda tidak menangkap suara penguji">
              {showScript ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              <span>{showScript ? 'Tutup Teks' : 'Buka Teks'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Audio terminal */}
      <Card className={cn('w-full p-6 md:p-8 mb-4 text-center flex flex-col items-center justify-center transition-colors',
        isLocalPlaying && 'border-primary/40')}>
        <div className={cn('w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-300',
          isLocalPlaying
            ? 'bg-primary text-primary-foreground scale-105'
            : 'bg-primary/10 text-primary border border-primary/20')}>
          <Headphones className={cn('h-10 w-10', isLocalPlaying && 'animate-pulse-dot')} />
        </div>

        <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
          {isLocalPlaying ? 'Sedang Mendengarkan' : 'Dengarkan Pertanyaan Penguji'}
        </span>
        <p className="text-xs text-muted-foreground max-w-sm mb-4">
          Teks pertanyaan disembunyikan agar telinga Anda terlatih menangkap ucapan Korea asli.
        </p>

        <Button type="button" onClick={playQuestionAudio}>
          <Volume2 className="h-4 w-4" />
          <span>{isLocalPlaying ? 'Putar Ulang Suara Penguji' : 'Putar Audio Soal (Spasi)'}</span>
        </Button>

        {showScript && (
          <div className="w-full mt-5 pt-4 border-t border-border text-center animate-fade-in space-y-1">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Naskah Transkrip Soal Asli:
            </span>
            <h3 className="text-lg md:text-xl font-bold text-foreground font-kr">
              {currentQ.question_ko || currentQ.title_ko}
            </h3>
            {currentQ.question_romaja && (
              <p className="text-xs text-muted-foreground font-mono">{currentQ.question_romaja}</p>
            )}
            <p className="text-xs font-medium text-primary bg-primary/5 px-3 py-1 rounded-md inline-block mt-1 border border-primary/20">
              Artinya: "{currentQ.question_id || currentQ.title_id}"
            </p>
          </div>
        )}
      </Card>

      {/* Options */}
      <div className="w-full space-y-2.5">
        <div className="text-xs font-bold text-muted-foreground px-1 mb-1 flex items-center justify-between">
          <span>Pilih Jawaban yang Tepat Sesuai Audio:</span>
          <span className="text-[11px] font-normal">Mode: {optionLang === 'ko' ? 'Teks Korea' : 'Terjemahan Indo'}</span>
        </div>

        {currentOptions.map((opt, idx) => {
          const mainText = optionLang === 'ko' ? opt.ko : opt.id;
          const secondaryText = optionLang === 'ko' ? opt.id : opt.ko;

          let btnStyle = 'bg-card border-border text-foreground hover:border-primary/40 hover:bg-secondary';
          let icon = null;

          if (isAnswered) {
            if (opt.isCorrect) {
              btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
              icon = <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />;
            } else if (selectedOption === opt && !opt.isCorrect) {
              btnStyle = 'bg-red-50 border-red-500 text-red-950 font-bold';
              icon = <XCircle className="h-4 w-4 text-red-600 shrink-0" />;
            } else {
              btnStyle = 'bg-muted border-border text-muted-foreground opacity-50';
            }
          }

          return (
            <Button key={idx} variant="outline" disabled={isAnswered}
              onClick={() => handleSelectOption(opt)}
              className={cn('w-full min-h-[52px] p-3.5 rounded-md text-left text-xs md:text-sm font-medium justify-between gap-3', btnStyle)}>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-sm bg-secondary text-[11px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {String.fromCharCode(65 + idx)}
                </span>
                <div>
                  <span className={cn('leading-snug', optionLang === 'ko' ? 'font-kr text-base font-bold' : 'text-sm')}>
                    {mainText}
                  </span>
                  {isAnswered && secondaryText && (
                    <span className="text-[11px] text-muted-foreground block font-normal mt-0.5">
                      ({secondaryText})
                    </span>
                  )}
                </div>
              </div>
              {icon}
            </Button>
          );
        })}
      </div>

      {/* Feedback */}
      {isAnswered && (
        <div className="w-full mt-4 p-4 rounded-md border border-border bg-secondary flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <div className="text-left text-xs space-y-0.5">
            <span className={cn('font-bold block text-sm', selectedOption?.isCorrect ? 'text-emerald-700' : 'text-red-700')}>
              {selectedOption?.isCorrect ? 'Pendengaran Anda Tepat' : 'Pendengaran Belum Tepat'}
            </span>
            <div className="text-foreground text-[11px]">
              <span>Kunci Resmi: </span>
              <strong className="font-kr font-bold text-emerald-800 text-sm">{currentAnswerTexts.ko}</strong>
              <span className="text-muted-foreground ml-1">({currentAnswerTexts.id})</span>
            </div>
          </div>

          <Button onClick={handleNext} className="w-full sm:w-auto">
            <span>Soal Berikutnya</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
