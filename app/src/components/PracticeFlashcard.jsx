import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, RotateCcw, Shuffle, Check, X, 
  ChevronLeft, ChevronRight, Eye, Sparkles, BookOpen,
  ArrowLeftRight, Headphones
} from 'lucide-react';
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

  // Arah kartu: 'ko_to_id' (Depan Korea, Belakang Indonesia) | 'id_to_ko' (Depan Indonesia, Belakang Korea)
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
    const arr = [...shuffledQuestions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(arr);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const markMemorized = (id) => {
    setMemorizedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setReviewLaterIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    handleNext();
  };

  const markReviewLater = (id) => {
    setReviewLaterIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setMemorizedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    handleNext();
  };

  // Keyboard navigation
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

  // Helper untuk teks Korea & Indonesia
  const titleKo = currentQ?.title_ko || currentQ?.question_ko || '';
  const titleId = currentQ?.title_id || currentQ?.question_id || '';
  const answerKo = currentQ?.answer_short_ko || currentQ?.title_ko || '';
  const answerId = currentQ?.answer_short_id || currentQ?.title_id || '';

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">
      
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
            {currentIndex + 1} / {total}
          </span>
          <span className="text-[11px] font-medium hidden sm:inline text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Hafal: {memorizedIds.size}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Arah Kartu (Korea -> Indo vs Indo -> Korea) */}
          <button
            type="button"
            onClick={() => {
              setCardDirection(prev => prev === 'ko_to_id' ? 'id_to_ko' : 'ko_to_id');
              setIsFlipped(false);
            }}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
            title="Ganti arah sisi kartu (Korea ke Indo atau sebaliknya)"
          >
            <ArrowLeftRight className="w-3 h-3 text-blue-600" />
            <span>{cardDirection === 'ko_to_id' ? '🇰🇷 Depan Korea' : '🇮🇩 Depan Indo'}</span>
          </button>

          <button
            onClick={handleShuffle}
            className="p-1.5 px-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1 text-[11px] font-semibold active:scale-95"
            title="Acak urutan kartu"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Acak</span>
          </button>
        </div>
      </div>

      {/* FLASHCARD INTERACTIVE CONTAINER */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full min-h-[350px] md:min-h-[390px] bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-xs hover:shadow-sm relative"
      >
        {/* Status Badge */}
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md truncate max-w-[200px]">
            {currentQ?.category_title || currentQ?.category}
          </span>
          <div className="flex items-center gap-1.5">
            {isMemorized && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                <Check className="w-3 h-3" /> Hafal
              </span>
            )}
            {isReview && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                Ulangi Nanti
              </span>
            )}
            <span className="text-[11px] text-[#787774] font-medium hidden sm:inline">
              Ketuk untuk membalik
            </span>
          </div>
        </div>

        {/* CARD CONTENT */}
        <div className="my-auto py-4 flex flex-col items-center text-center">
          {!isFlipped ? (
            /* SISI DEPAN (FRONT) */
            <div className="space-y-3 w-full animate-fade-in">
              {currentQ?.image_url && (
                <div className="max-h-48 md:max-h-56 w-full flex items-center justify-center mb-2">
                  <img 
                    src={getAssetUrl(currentQ.image_url)} 
                    alt="Alat atau Rambu K3" 
                    className="max-h-44 md:max-h-52 w-auto object-contain rounded-lg border border-[#EFEFED] p-1 bg-[#FAFAFA]"
                  />
                </div>
              )}

              {cardDirection === 'ko_to_id' ? (
                <>
                  <h2 className="text-2xl md:text-3xl font-black text-[#191919] font-kr leading-snug tracking-tight">
                    {titleKo}
                  </h2>
                  {currentQ?.question_romaja && (
                    <p className="text-xs md:text-sm text-[#787774] font-mono">
                      {currentQ.question_romaja}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-xl md:text-2xl font-black text-[#191919] leading-snug tracking-tight">
                    {titleId}
                  </h2>
                  <p className="text-xs text-[#787774]">
                    Tebak nama Korea atau jawaban Hangul alat/soal ini
                  </p>
                </>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                {/* Jika sisi depan menampilkan bahasa Korea dan ada audio nama/kunci, putar audio nama */}
                {cardDirection === 'ko_to_id' && currentQ?.audio_a && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayAudio(currentQ.audio_a);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-all shadow-2xs active:scale-95"
                    title="Dengar pelafalan nama item dalam bahasa Korea"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Dengar Nama Korea</span>
                  </button>
                )}

                {/* Audio Soal Penguji (Misal: "이 공구의 이름은 무엇입니까?") */}
                {currentQ?.audio_q && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayAudio(currentQ.audio_q);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-all shadow-2xs active:scale-95"
                    title="Dengar pertanyaan penguji"
                  >
                    <Headphones className="w-3.5 h-3.5 text-blue-600" />
                    <span>Soal Penguji</span>
                  </button>
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {activeOpt?.label || 'Kunci Jawaban Resmi'}
                    </span>
                  </div>

                  {/* Selector Pill Versi Jawaban */}
                  {hasOptions && (
                    <div className="flex flex-wrap items-center justify-center gap-1 pt-1">
                      {currentQ.answer_options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOptionIndex(oIdx);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                            selectedOptionIndex === oIdx
                              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <h3 className="text-2xl md:text-3xl font-black text-[#191919] font-kr mt-1">
                    {displayKo}
                  </h3>

                  <div className="p-3.5 rounded-xl bg-[#FBFBFA] border border-[#E5E5E3] text-xs md:text-sm text-[#191919] font-medium leading-relaxed max-w-md mx-auto">
                    <p className="font-bold text-emerald-800 text-base">
                      {displayId}
                    </p>
                    {currentQ?.question_id && (
                      <p className="text-[11px] text-[#787774] mt-1.5 pt-1.5 border-t border-[#E5E5E3]">
                        Maksud Soal: "{currentQ.question_id}"
                      </p>
                    )}
                  </div>

                  {/* Info Kegunaan Perkakas Manufaktur jika kartu berupa alat */}
                  {(currentQ?.usage_short_ko || currentQ?.usage_full_ko) && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Kegunaan Alat (용도):
                      </span>
                      <p className="font-kr font-bold text-xs text-slate-900">
                        {currentQ.usage_short_ko || currentQ.usage_full_ko}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {currentQ.usage_short_id || currentQ.usage_full_id}
                      </p>
                    </div>
                  )}

                  {/* Tombol Audio */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedOptionIndex === 0 && currentQ?.audio_a) {
                          onPlayAudio(currentQ.audio_a);
                        } else {
                          // Fallback speak
                          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                            window.speechSynthesis.cancel();
                            const u = new SpeechSynthesisUtterance(displayKo);
                            u.lang = 'ko-KR';
                            u.rate = 0.85;
                            window.speechSynthesis.speak(u);
                          }
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-all active:scale-95"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Dengar Pelafalan ({activeOpt?.label || 'Jawaban'})</span>
                    </button>
                  </div>
                </div>
              );
            })()
          )}
        </div>

        {/* BOTTOM FLIP INSTRUCTION */}
        <div className="flex items-center justify-center text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
          <RotateCcw className="w-3 h-3 mr-1 text-slate-400" />
          <span>{isFlipped ? 'Klik kartu untuk kembali ke depan' : 'Klik kartu atau tekan Spasi untuk melihat kunci jawaban'}</span>
        </div>
      </div>

      {/* ACTION BUTTONS (BELUM HAFAL / SUDAH HAFAL) */}
      <div className="w-full grid grid-cols-2 gap-3 mt-4">
        <button
          onClick={() => markReviewLater(currentQ?.id)}
          className="h-11 rounded-xl bg-white border border-amber-300/80 hover:bg-amber-50 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95"
        >
          <X className="w-4 h-4 text-amber-600" />
          <span>Ulangi Nanti</span>
        </button>

        <button
          onClick={() => markMemorized(currentQ?.id)}
          className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
        >
          <Check className="w-4 h-4" />
          <span>Sudah Hafal</span>
        </button>
      </div>

      {/* PREV / NEXT NAVIGATION ROW */}
      <div className="w-full flex items-center justify-between mt-3.5 text-xs text-slate-500 px-1">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1 hover:text-slate-900 font-semibold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </button>

        <span className="font-mono text-[11px] text-slate-400">Gunakan panah ◀ ▶ keyboard</span>

        <button
          onClick={handleNext}
          className="flex items-center gap-1 hover:text-[#191919] font-semibold transition-colors"
        >
          <span>Berikutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
