import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, Volume2, ArrowRight, RotateCcw, Trophy, Eye, EyeOff, Shuffle, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Card } from './ui/card.jsx';
import { Badge } from './ui/badge.jsx';
import { cn } from '../utils/cn.js';
import { getAssetUrl } from '../utils/assetHelper.js';

export function PracticeQuiz({
  questions,
  onPlayAudio,
  isPlayingAudio
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [quizFinished, setQuizFinished] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);

  const [optionLang, setOptionLang] = useState('ko');
  const [questionLang, setQuestionLang] = useState('bilingual');
  const [showOptionHint, setShowOptionHint] = useState(false);

  // Fokus kuis alat: 'name' (Kuis Nama Alat) | 'usage' (Kuis Kegunaan / Fungsi Alat)
  const [toolQuizMode, setToolQuizMode] = useState('name');

  const quizQuestions = useMemo(() => {
    return [...questions].sort(() => Math.random() - 0.5);
  }, [questions, shuffleKey]);

  const currentQ = quizQuestions[currentIndex] || questions[0] || {};
  const hasImage = !!currentQ?.image_url;
  const isTool = currentQ?.category === 'alat_manufaktur' || currentQ?.category === 'alat_klasik' || currentQ?.category === 'fungsi_alat';

  const handleShuffle = () => {
    setShuffleKey(prev => prev + 1);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore({ correct: 0, wrong: 0 });
    setQuizFinished(false);
  };

  const getAnswerTexts = (q) => {
    if (!q) return { ko: '', id: '' };
    let ko = '';
    let id = '';

    const isQTool = q.category === 'alat_manufaktur' || q.category === 'alat_klasik' || q.category === 'fungsi_alat';

    if (isQTool && toolQuizMode === 'usage') {
      // Fokus Kegunaan / Fungsi Alat
      ko = q.usage_short_ko || q.answer_options?.[0]?.ko || q.answer_short_ko || '';
      id = q.usage_short_id || q.answer_options?.[0]?.id || q.answer_short_id || '';
    } else if (isQTool || q.category === 'piktogram') {
      // Fokus Nama Alat atau Rambu
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
    if (!currentQ || !questions.length) return [];
    const correct = getAnswerTexts(currentQ);
    if (!correct.ko && !correct.id) return [];

    const sameCategory = questions.filter(q => q.id !== currentQ.id && q.category === currentQ.category);
    const otherCategory = questions.filter(q => q.id !== currentQ.id && q.category !== currentQ.category);

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
  }, [currentQ, questions, toolQuizMode]);

  const handleSelectOption = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (option.isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < quizQuestions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore({ correct: 0, wrong: 0 });
    setQuizFinished(false);
  };

  const totalAnswered = score.correct + score.wrong;
  const accuracy = totalAnswered > 0 ? Math.round((score.correct / totalAnswered) * 100) : 0;
  const currentAnswerTexts = getAnswerTexts(currentQ);

  if (quizFinished) {
    return (
      <Card className="w-full max-w-lg mx-auto p-6 text-center animate-fade-in space-y-5">
        <div className="space-y-1.5">
          <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
          <h2 className="text-xl font-bold text-foreground">Sesi Kuis Selesai</h2>
          <p className="text-xs text-muted-foreground">Ringkasan hasil latihan pilihan ganda Anda:</p>
        </div>

        <div className="grid grid-cols-3 divide-x divide-border border-y border-border py-4">
          <div>
            <span className="text-xl font-bold text-emerald-700 font-mono">{score.correct}</span>
            <span className="text-[11px] font-medium text-muted-foreground block mt-0.5">Benar</span>
          </div>
          <div>
            <span className="text-xl font-bold text-red-700 font-mono">{score.wrong}</span>
            <span className="text-[11px] font-medium text-muted-foreground block mt-0.5">Salah</span>
          </div>
          <div>
            <span className="text-xl font-bold text-primary font-mono">{accuracy}%</span>
            <span className="text-[11px] font-medium text-muted-foreground block mt-0.5">Akurasi</span>
          </div>
        </div>

        <Button onClick={handleRestart} className="w-full">
          <RotateCcw className="h-4 w-4" />
          <span>Ulangi Kuis dari Awal</span>
        </Button>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">

      {/* Clean, Modern Toolbar */}
      <div className="w-full flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-border text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-foreground text-sm">
            #{currentIndex + 1} <span className="text-muted-foreground text-xs font-normal">/ {quizQuestions.length}</span>
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">✓ {score.correct}</span>
          <span className="font-mono text-xs font-bold text-red-700 dark:text-red-400">✗ {score.wrong}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Option language toggle */}
          <div className="inline-flex rounded-lg border border-border bg-secondary p-0.5">
            <button
              type="button"
              onClick={() => setOptionLang('ko')}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer',
                optionLang === 'ko' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              KR
            </button>
            <button
              type="button"
              onClick={() => setOptionLang('id')}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer',
                optionLang === 'id' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              ID
            </button>
          </div>

          {/* Question language selector */}
          <select
            value={questionLang}
            onChange={(e) => setQuestionLang(e.target.value)}
            aria-label="Bahasa Soal"
            className="bg-card border border-border text-foreground font-semibold text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <option value="bilingual">2 Bahasa</option>
            <option value="ko">Soal: KR</option>
            <option value="id">Soal: ID</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOptionHint(!showOptionHint)}
            title="Tampilkan arti bantuan di bawah teks pilihan"
            className={cn(
              'h-8 px-2 text-xs font-medium gap-1',
              showOptionHint ? 'border-primary/40 text-primary bg-primary/10' : 'text-muted-foreground'
            )}
          >
            {showOptionHint ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Arti</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShuffle}
            title="Acak urutan soal kuis"
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Shuffle className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Fokus Pertanyaan Kuis Alat: Nama vs Kegunaan */}
      {isTool && (
        <div className="w-full flex items-center justify-between bg-secondary/70 border border-border/80 rounded-xl p-1 mb-2.5 gap-1">
          <span className="text-[11px] font-bold text-muted-foreground px-2 hidden sm:inline">
            Fokus Kuis Perkakas:
          </span>
          <div className="grid grid-cols-2 w-full sm:w-auto gap-1">
            <button
              type="button"
              onClick={() => { setToolQuizMode('name'); setSelectedOption(null); setIsAnswered(false); }}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-semibold transition-all text-center',
                toolQuizMode === 'name'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              🏷️ Kuis Nama Alat (이름)
            </button>
            <button
              type="button"
              onClick={() => { setToolQuizMode('usage'); setSelectedOption(null); setIsAnswered(false); }}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-semibold transition-all text-center',
                toolQuizMode === 'usage'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              ⚙️ Kuis Kegunaan Alat (용도)
            </button>
          </div>
        </div>
      )}

      {/* Question card - clean without inner boxes */}
      <Card className="w-full p-5 mb-3.5 text-center">
        {hasImage && (
          <div className="max-h-44 md:max-h-52 w-full flex items-center justify-center mb-3 p-2 bg-secondary/20 rounded-xl border border-border/40">
            <img
              src={getAssetUrl(currentQ.image_url)}
              alt="Soal Ujian"
              className="max-h-40 md:max-h-48 w-auto object-contain rounded-lg"
            />
          </div>
        )}

        <div className="space-y-1.5">
          {(questionLang === 'bilingual' || questionLang === 'ko') && (
            <h3 className="text-xl md:text-2xl font-bold text-foreground font-kr tracking-tight leading-snug">
              {isTool && toolQuizMode === 'usage'
                ? `${currentQ?.title_ko || '이 공구'}는 무엇에 사용합니까?`
                : hasImage
                  ? (currentQ?.category === 'piktogram' ? '이 안전 표지는 무슨 뜻입니까?' : '이 공구의 이름은 무엇입니까?')
                  : (currentQ?.question_ko || currentQ?.title_ko || '이것은 무엇입니까?')}
            </h3>
          )}

          {questionLang === 'ko' && currentQ?.question_romaja && (
            <p className="text-xs text-muted-foreground font-mono">{currentQ.question_romaja}</p>
          )}

          {(questionLang === 'bilingual' || questionLang === 'id') && (
            <p
              className={cn(
                questionLang === 'id'
                  ? 'text-lg md:text-xl font-bold text-foreground'
                  : 'text-sm text-muted-foreground mt-1'
              )}
            >
              {isTool && toolQuizMode === 'usage'
                ? `${currentQ?.title_id || 'Alat ini'} digunakan untuk apa?`
                : hasImage
                  ? (currentQ?.category === 'piktogram' ? 'Apakah arti rambu keselamatan kerja ini?' : 'Apakah nama alat / perkakas ini?')
                  : (currentQ?.question_id || currentQ?.title_id || 'Apakah nama benda/alat ini?')}
            </p>
          )}
        </div>

        {currentQ?.audio_q && (
          <div className="mt-3.5">
            <Button type="button" variant="secondary" size="sm" onClick={() => onPlayAudio(currentQ.audio_q)}>
              <Volume2 className={cn('h-3.5 w-3.5', isPlayingAudio && 'animate-pulse text-primary')} />
              <span>Putar Suara Soal Penguji</span>
            </Button>
          </div>
        )}
      </Card>

      {/* Options */}
      <div className="w-full space-y-2">
        {currentOptions.map((opt, idx) => {
          const mainText = optionLang === 'ko' ? opt.ko : opt.id;
          const secondaryText = optionLang === 'ko' ? opt.id : opt.ko;

          let btnStyle = 'bg-card border-border text-foreground hover:border-foreground/40 hover:bg-secondary/60';
          let icon = null;

          if (isAnswered) {
            if (opt.isCorrect) {
              btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
              icon = <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />;
            } else if (selectedOption === opt && !opt.isCorrect) {
              btnStyle = 'bg-red-50 border-red-500 text-red-950 font-semibold';
              icon = <XCircle className="h-4 w-4 text-red-600 shrink-0" />;
            } else {
              btnStyle = 'bg-muted/40 border-border text-muted-foreground opacity-60';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelectOption(opt)}
              className={cn(
                'w-full min-h-[48px] px-3.5 py-3 rounded-lg border text-left transition-colors flex items-center justify-between gap-3 whitespace-normal',
                btnStyle
              )}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className="w-6 h-6 rounded bg-secondary text-[11px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 text-foreground">
                  {String.fromCharCode(65 + idx)}
                </span>
                <div className="min-w-0 flex-1 whitespace-normal text-left">
                  <span className={cn('block leading-snug break-words', optionLang === 'ko' ? 'font-kr text-base font-bold' : 'text-sm font-medium')}>
                    {mainText}
                  </span>
                  {(showOptionHint || isAnswered) && secondaryText && (
                    <span className="text-xs text-muted-foreground block font-normal mt-0.5 leading-snug break-words">
                      {secondaryText}
                    </span>
                  )}
                </div>
              </div>
              {icon}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {isAnswered && (
        <div className="w-full mt-3.5 pt-3.5 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="text-left text-xs space-y-0.5">
            <span className={cn('font-bold block text-sm', selectedOption?.isCorrect ? 'text-emerald-700' : 'text-red-700')}>
              {selectedOption?.isCorrect ? 'Jawaban Anda Benar' : 'Jawaban Belum Tepat'}
            </span>
            <div className="text-foreground text-xs">
              <span className="text-muted-foreground">Kunci Resmi: </span>
              <strong className="font-kr font-bold text-emerald-800 text-sm">{currentAnswerTexts.ko}</strong>
              <span className="text-muted-foreground ml-1">({currentAnswerTexts.id})</span>
            </div>
          </div>

          <Button onClick={handleNext} className="w-full sm:w-auto shrink-0">
            <span>Soal Berikutnya</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
