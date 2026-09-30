import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Volume2, VolumeX, Headphones, CheckCircle, XCircle, 
  ArrowRight, RotateCcw, Trophy, Eye, EyeOff, Play, RefreshCw,
  Sparkles, Gauge
} from 'lucide-react';
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

  // Bahasa Pilihan Jawaban: 'ko' (Hangul) | 'id' (Bahasa Indonesia)
  const [optionLang, setOptionLang] = useState('ko');

  // Apakah naskah teks soal dibuka secara manual sebelum menjawab
  const [showScript, setShowScript] = useState(false);

  // Kecepatan putar audio: 1.0 atau 0.85
  const [playbackRate, setPlaybackRate] = useState(1.0);

  // Filter hanya soal yang memiliki audio
  const audioQuestions = useMemo(() => {
    const list = questions.filter(q => q.audio_q);
    return list.length > 0 ? list : questions;
  }, [questions]);

  // Shuffle list untuk sesi listening
  const shuffledQuestions = useMemo(() => {
    return [...audioQuestions].sort(() => Math.random() - 0.5);
  }, [audioQuestions]);

  const currentQ = shuffledQuestions[currentIndex] || audioQuestions[0] || {};

  // Audio element lokal untuk kontrol playback rate
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

  // Putar otomatis saat berganti nomor soal
  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setShowScript(false);
    
    // Auto-play audio soal
    const timer = setTimeout(() => {
      playQuestionAudio();
    }, 200);

    return () => {
      clearTimeout(timer);
      localAudioRef.current.pause();
      setIsLocalPlaying(false);
    };
  }, [currentIndex, currentQ?.id]);

  // Ubah kecepatan audio secara dinamis
  useEffect(() => {
    localAudioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  // Keyboard shortcut: Spasi untuk putar ulang audio
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

  // Helper untuk mengekstrak teks jawaban Korea dan Indonesia
  const getAnswerTexts = (q) => {
    if (!q) return { ko: '', id: '' };

    let ko = '';
    let id = '';

    if (q.category === 'alat_manufaktur' || q.category === 'piktogram') {
      ko = q.title_ko || (q.answer_short_ko ? q.answer_short_ko.replace(/입니다\.$/, '').trim() : '') || q.answer_short_ko || '';
      id = q.title_id || q.answer_short_id || '';
    } else if (q.category === 'matematika') {
      ko = q.answer_short_ko || q.title_ko || '';
      id = q.answer_short_id || q.title_id || '';
    } else {
      ko = q.answer_short_ko || q.title_ko || '';
      id = q.answer_short_id || q.title_id || '';
    }

    if (!ko) ko = q.question_ko || '';
    if (!id) id = q.question_id || '';

    return { ko: ko.trim(), id: id.trim() };
  };

  // Generate 4 pilihan ganda (1 kunci + 3 pengecoh)
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
        if (
          texts.ko && texts.id && 
          !seen.has(texts.ko.toLowerCase()) && 
          !seen.has(texts.id.toLowerCase())
        ) {
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
    setShowScript(true); // Otomatis buka naskah setelah menjawab

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
      <div className="w-full max-w-lg mx-auto bg-white border border-[#E5E5E3] rounded-3xl p-6 md:p-8 text-center shadow-xs animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-200">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-[#191919]">Sesi Latihan Mendengar Selesai!</h2>
        <p className="text-xs text-[#787774] mt-1">Berikut akurasi kepekaan telinga Anda menangkap pertanyaan Korea:</p>

        <div className="grid grid-cols-3 gap-2.5 my-6">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-xl font-black text-emerald-800">{score.correct}</span>
            <span className="text-xs font-semibold text-emerald-700 block mt-0.5">Benar</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200">
            <span className="text-xl font-black text-red-800">{score.wrong}</span>
            <span className="text-xs font-semibold text-red-700 block mt-0.5">Salah</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
            <span className="text-xl font-black text-blue-800">{accuracy}%</span>
            <span className="text-xs font-semibold text-blue-700 block mt-0.5">Akurasi</span>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Ulangi Latihan Mendengar dari Awal</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center animate-fade-in text-[#191919]">
      
      {/* 1. TOP SETTINGS & CONTROLS */}
      <div className="w-full bg-[#F6F6F5] border border-[#E5E5E3] rounded-2xl p-3 mb-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[#191919] bg-white border border-[#E0E0DC] px-2.5 py-0.5 rounded-lg">
              Soal {currentIndex + 1} / {shuffledQuestions.length}
            </span>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Headphones className="w-3 h-3" />
              <span>Mode Mendengar (Audio-First)</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ✓ {score.correct}
            </span>
            <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              ✗ {score.wrong}
            </span>
          </div>
        </div>

        {/* Row 2: Kecepatan Audio & Bahasa Pilihan */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-[#EAEAE8] text-xs">
          {/* Bahasa Pilihan Jawaban */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-[#787774] uppercase tracking-wider">
              Pilihan:
            </span>
            <div className="inline-flex p-0.5 bg-white border border-[#E0E0DC] rounded-lg">
              <button
                type="button"
                onClick={() => setOptionLang('ko')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  optionLang === 'ko'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-[#787774] hover:text-[#191919]'
                }`}
              >
                🇰🇷 Korea
              </button>
              <button
                type="button"
                onClick={() => setOptionLang('id')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  optionLang === 'id'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-[#787774] hover:text-[#191919]'
                }`}
              >
                🇮🇩 Indo
              </button>
            </div>
          </div>

          {/* Kecepatan Audio & Tombol Buka Naskah */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-[#787774] uppercase tracking-wider">
                Kecepatan:
              </span>
              <button
                onClick={() => setPlaybackRate(prev => prev === 1.0 ? 0.85 : 1.0)}
                className={`px-2 py-0.5 rounded-lg border text-[11px] font-mono font-bold transition-all ${
                  playbackRate === 0.85
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-white text-[#787774] border-[#E0E0DC] hover:text-[#191919]'
                }`}
                title="Atur kecepatan audio (0.85x untuk pemula, 1.0x kecepatan asli penguji)"
              >
                {playbackRate}x
              </button>
            </div>

            <button
              onClick={() => setShowScript(!showScript)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all ${
                showScript
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-[#787774] border-[#E0E0DC] hover:text-[#191919]'
              }`}
              title="Buka naskah teks pertanyaan jika Anda tidak menangkap suara penguji"
            >
              {showScript ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showScript ? 'Tutup Teks' : 'Buka Teks'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. AUDIO LISTENING TERMINAL (TIDAK ADA TEKS SOAL DI AWAL) */}
      <div className="w-full bg-white border-2 border-blue-500/20 rounded-3xl p-6 md:p-8 mb-4 shadow-xs text-center flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Visual Pulse Waveform */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
          isLocalPlaying 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
            : 'bg-blue-50 text-blue-600 border border-blue-200'
        }`}>
          <Headphones className={`w-10 h-10 ${isLocalPlaying ? 'animate-bounce' : ''}`} />
        </div>

        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
          {isLocalPlaying ? '🔊 Sedang Mendengarkan...' : '🎧 Dengarkan Pertanyaan Penguji'}
        </span>
        <p className="text-xs text-[#787774] max-w-sm mb-4">
          Teks pertanyaan disembunyikan agar telinga Anda terlatih menangkap ucapan Korea asli.
        </p>

        {/* Big Audio Play Button */}
        <button
          type="button"
          onClick={playQuestionAudio}
          className={`px-6 py-3.5 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition-all shadow-xs active:scale-95 ${
            isLocalPlaying
              ? 'bg-blue-700 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          <Volume2 className={`w-4 h-4 ${isLocalPlaying ? 'animate-pulse' : ''}`} />
          <span>{isLocalPlaying ? 'Putar Ulang Suara Penguji' : 'Putar Audio Soal (Spasi)'}</span>
        </button>

        {/* Naskah Soal Terbuka (Jika tombol buka teks ditekan atau sudah dijawab) */}
        {showScript && (
          <div className="w-full mt-5 pt-4 border-t border-[#EAEAE8] text-center animate-fade-in space-y-1">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
              Naskah Transkrip Soal Asli:
            </span>
            <h3 className="text-lg md:text-xl font-black text-[#191919] font-kr">
              {currentQ.question_ko || currentQ.title_ko}
            </h3>
            {currentQ.question_romaja && (
              <p className="text-xs text-[#787774] font-mono">{currentQ.question_romaja}</p>
            )}
            <p className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl inline-block mt-1 border border-blue-200">
              Artinya: "{currentQ.question_id || currentQ.title_id}"
            </p>
          </div>
        )}
      </div>

      {/* 3. 4 PILIHAN GANDA (OPTIONS A, B, C, D) */}
      <div className="w-full space-y-2.5">
        <div className="text-xs font-bold text-[#787774] px-1 mb-1 flex items-center justify-between">
          <span>Pilih Jawaban yang Tepat Sesuai Audio:</span>
          <span className="text-[11px] font-normal">Mode: {optionLang === 'ko' ? '🇰🇷 Teks Korea' : '🇮🇩 Terjemahan Indo'}</span>
        </div>

        {currentOptions.map((opt, idx) => {
          const mainText = optionLang === 'ko' ? opt.ko : opt.id;
          const secondaryText = optionLang === 'ko' ? opt.id : opt.ko;

          let btnStyle = "bg-white border-[#E5E5E3] text-[#191919] hover:border-blue-400 hover:bg-[#FBFBFA]";
          let icon = null;

          if (isAnswered) {
            if (opt.isCorrect) {
              btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs";
              icon = <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />;
            } else if (selectedOption === opt && !opt.isCorrect) {
              btnStyle = "bg-red-50 border-red-500 text-red-950 font-bold shadow-xs";
              icon = <XCircle className="w-4 h-4 text-red-600 shrink-0" />;
            } else {
              btnStyle = "bg-[#FBFBFA] border-[#E5E5E3] text-[#787774] opacity-50";
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => handleSelectOption(opt)}
              className={`w-full min-h-[52px] p-3.5 rounded-2xl border text-left text-xs md:text-sm font-semibold transition-all flex items-center justify-between gap-3 active:scale-[0.99] ${btnStyle}`}
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-[#EFEFED] text-[#37352F] text-[11px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {String.fromCharCode(65 + idx)}
                </span>
                
                <div>
                  <span className={`leading-snug ${optionLang === 'ko' ? 'font-kr text-base font-bold' : 'text-sm'}`}>
                    {mainText}
                  </span>

                  {/* Terjemahan muncul otomatis setelah dijawab */}
                  {isAnswered && secondaryText && (
                    <span className="text-[11px] text-[#787774] block font-normal mt-0.5">
                      ({secondaryText})
                    </span>
                  )}
                </div>
              </div>

              {icon}
            </button>
          );
        })}
      </div>

      {/* 4. FEEDBACK & NEXT BUTTON */}
      {isAnswered && (
        <div className="w-full mt-4 p-4 rounded-2xl border border-[#E5E5E3] bg-[#FBFBFA] flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="text-left text-xs space-y-0.5">
            <span className={`font-bold block text-sm ${selectedOption?.isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
              {selectedOption?.isCorrect ? '✓ Pendengaran Anda Tepat!' : '✗ Pendengaran Belum Tepat!'}
            </span>
            <div className="text-[#37352F] text-[11px]">
              <span>Kunci Resmi: </span>
              <strong className="font-kr font-bold text-emerald-800 text-sm">{currentAnswerTexts.ko}</strong>
              <span className="text-[#787774] ml-1">({currentAnswerTexts.id})</span>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <span>Soal Berikutnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
