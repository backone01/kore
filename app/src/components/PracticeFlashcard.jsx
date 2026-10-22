import React, { useState, useEffect } from 'react';
import { Volume2, RotateCcw, Shuffle, Check, X, ArrowLeftRight, Headphones, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Card } from './ui/card.jsx';
import { Badge } from './ui/badge.jsx';
import { cn } from '../utils/cn.js';
import { getAssetUrl } from '../utils/assetHelper.js';

export function PracticeFlashcard({
  questions,
  onPlayAudio,
  isPlayingAudio
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [memorizedIds, setMemorizedIds] = useState(new Set());
  const [reviewLaterIds, setReviewLaterIds] = useState(new Set());
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [cardDirection, setCardDirection] = useState('ko_to_id');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  useEffect(() => {
    setShuffledQuestions(questions);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSelectedOptionIndex(0);
  }, [questions]);

  const currentQ = shuffledQuestions[currentIndex] || questions[0] || {};
  const total = shuffledQuestions.length;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1 < total ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 >= 0 ? prev - 1 : total - 1));
  };

  const handleShuffle = () => {
    setShuffledQuestions(prev => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const markMemorized = (id) => {
    setMemorizedIds(prev => new Set(prev).add(id));
    setReviewLaterIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    handleNext();
  };

  const markReviewLater = (id) => {
    setReviewLaterIds(prev => new Set(prev).add(id));
    setMemorizedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    handleNext();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, total]);

  const isMemorized = memorizedIds.has(currentQ?.id);
  const isReview = reviewLaterIds.has(currentQ?.id);

  const titleKo = currentQ?.title_ko || currentQ?.question_ko || '';
  const titleId = currentQ?.title_id || currentQ?.question_id || '';
  const answerKo = currentQ?.answer_short_ko || currentQ?.title_ko || '';
  const answerId = currentQ?.answer_short_id || currentQ?.title_id || '';

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">

      {/* Top bar */}
      <div className="w-full flex items-center justify-between text-xs text-muted-foreground mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-foreground bg-secondary border border-border px-2.5 py-1 rounded-md">
            {currentIndex + 1} / {total}
          </span>
          <span className="text-[11px] font-medium hidden sm:inline text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Hafal: {memorizedIds.size}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCardDirection(prev => prev === 'ko_to_id' ? 'id_to_ko' : 'ko_to_id');
              setIsFlipped(false);
            }}
            title="Ganti arah sisi kartu"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{cardDirection === 'ko_to_id' ? 'Depan Korea' : 'Depan Indo'}</span>
          </Button>

          <Button variant="outline" size="icon" onClick={handleShuffle} title="Acak urutan kartu">
            <Shuffle className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Flashcard */}
      <Card
        onClick={() => setIsFlipped(!isFlipped)}
        className={cn(
          'w-full min-h-[350px] md:min-h-[390px] p-6 flex flex-col justify-between cursor-pointer transition-colors hover:border-foreground/30'
        )}
      >
        {/* Status row */}
        <div className="flex items-center justify-between w-full">
          <Badge variant="outline" className="font-mono">
            {currentQ?.category_title || currentQ?.category}
          </Badge>
          <div className="flex items-center gap-1.5">
            {isMemorized && (
              <Badge variant="success"><Check className="h-3 w-3" /> Hafal</Badge>
            )}
            {isReview && (
              <Badge variant="warn">Ulangi Nanti</Badge>
            )}
            <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
              Ketuk untuk membalik
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="my-auto py-4 flex flex-col items-center text-center">
          {!isFlipped ? (
            <div className="space-y-3 w-full animate-fade-in">
              {currentQ?.image_url && (
                <div className="max-h-48 md:max-h-56 w-full flex items-center justify-center mb-2">
                  <img
                    src={getAssetUrl(currentQ.image_url)}
                    alt="Alat atau Rambu K3"
                    className="max-h-44 md:max-h-52 w-auto object-contain rounded-md border border-border p-1 bg-muted"
                  />
                </div>
              )}

              {cardDirection === 'ko_to_id' ? (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground font-kr leading-snug tracking-tight">
                    {titleKo}
                  </h2>
                  {currentQ?.question_romaja && (
                    <p className="text-xs md:text-sm text-muted-foreground font-mono">
                      {currentQ.question_romaja}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground leading-snug tracking-tight">
                    {titleId}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Tebak nama Korea atau jawaban Hangul alat/soal ini
                  </p>
                </>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                {cardDirection === 'ko_to_id' && currentQ?.audio_a && (
                  <Button type="button" variant="secondary" size="sm"
                    onClick={(e) => { e.stopPropagation(); onPlayAudio(currentQ.audio_a); }}
                    title="Dengar pelafalan nama item dalam bahasa Korea">
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Dengar Nama Korea</span>
                  </Button>
                )}

                {currentQ?.audio_q && (
                  <Button type="button" variant="secondary" size="sm"
                    onClick={(e) => { e.stopPropagation(); onPlayAudio(currentQ.audio_q); }}
                    title="Dengar pertanyaan penguji">
                    <Headphones className="h-3.5 w-3.5" />
                    <span>Soal Penguji</span>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            (() => {
              const hasOptions = currentQ?.answer_options && currentQ.answer_options.length > 1;
              const activeOpt = hasOptions ? currentQ.answer_options[selectedOptionIndex] || currentQ.answer_options[0] : null;
              const displayKo = activeOpt ? activeOpt.ko : answerKo;
              const displayId = activeOpt ? activeOpt.id : answerId;

              return (
                <div className="space-y-3 w-full animate-fade-in">
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <Badge variant="success">
                      {activeOpt?.label || 'Kunci Jawaban Resmi'}
                    </Badge>
                  </div>

                  {hasOptions && (
                    <div className="flex flex-wrap items-center justify-center gap-1 pt-1">
                      {currentQ.answer_options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedOptionIndex(oIdx); }}
                          className={cn(
                            'px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors',
                            selectedOptionIndex === oIdx
                              ? 'bg-foreground text-background border-foreground'
                              : 'bg-transparent text-muted-foreground border-border hover:bg-secondary'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <h3 className="text-2xl md:text-3xl font-bold text-foreground font-kr mt-1">
                    {displayKo}
                  </h3>

                  <div className="p-3.5 rounded-lg border border-border bg-muted text-xs md:text-sm text-foreground font-medium leading-relaxed max-w-md mx-auto">
                    <p className="font-bold text-emerald-800 text-base">
                      {displayId}
                    </p>
                    {currentQ?.question_id && (
                      <p className="text-[11px] text-muted-foreground mt-1.5 pt-1.5 border-t border-border">
                        Maksud Soal: "{currentQ.question_id}"
                      </p>
                    )}
                  </div>

                  {(currentQ?.usage_short_ko || currentQ?.usage_full_ko) && (
                    <div className="p-2.5 rounded-lg border border-border bg-muted max-w-md mx-auto text-left space-y-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Kegunaan Alat (용도):
                      </span>
                      <p className="font-kr font-bold text-xs text-foreground">
                        {currentQ.usage_short_ko || currentQ.usage_full_ko}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {currentQ.usage_short_id || currentQ.usage_full_id}
                      </p>
                    </div>
                  )}

                  <div className="pt-1">
                    <Button type="button" variant="secondary" size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activeOpt?.audio) {
                          onPlayAudio(activeOpt.audio);
                        } else if (selectedOptionIndex === 0 && currentQ?.audio_a) {
                          onPlayAudio(currentQ.audio_a);
                        } else {
                          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                            window.speechSynthesis.cancel();
                            const u = new SpeechSynthesisUtterance(displayKo);
                            u.lang = 'ko-KR';
                            u.rate = 0.85;
                            window.speechSynthesis.speak(u);
                          }
                        }
                      }}>
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Dengar Pelafalan ({activeOpt?.label || 'Jawaban'})</span>
                    </Button>
                  </div>
                </div>
              );
            })()
          )}
        </div>

        {/* Flip hint */}
        <div className="flex items-center justify-center text-[11px] text-muted-foreground font-medium pt-2 border-t border-border">
          <RotateCcw className="h-3 w-3 mr-1" />
          <span>{isFlipped ? 'Klik kartu untuk kembali ke depan' : 'Klik kartu atau tekan Spasi untuk melihat kunci jawaban'}</span>
        </div>
      </Card>

      {/* Actions */}
      <div className="w-full grid grid-cols-2 gap-3 mt-4">
        <Button variant="outline" onClick={() => markReviewLater(currentQ?.id)}>
          <X className="h-4 w-4 text-warn" />
          <span>Ulangi Nanti</span>
        </Button>

        <Button onClick={() => markMemorized(currentQ?.id)}>
          <Check className="h-4 w-4" />
          <span>Sudah Hafal</span>
        </Button>
      </div>

      {/* Navigation */}
      <div className="w-full flex items-center justify-between mt-3.5 text-xs text-muted-foreground px-1">
        <Button variant="ghost" size="sm" onClick={handlePrev}>
          <ChevronLeft className="h-4 w-4" />
          <span>Sebelumnya</span>
        </Button>

        <span className="font-mono text-[11px] text-muted-foreground">Gunakan panah keyboard</span>

        <Button variant="ghost" size="sm" onClick={handleNext}>
          <span>Berikutnya</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
