import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle, XCircle, Volume2, ArrowRight, 
  RotateCcw, Sparkles, HelpCircle, Trophy,
  Languages, Eye, EyeOff
} from 'lucide-react';
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

  // Bahasa Opsi Pilihan Jawaban: 'ko' (Hangul) | 'id' (Bahasa Indonesia)
  const [optionLang, setOptionLang] = useState('ko');

  // Bahasa Pertanyaan / Soal: 'bilingual' (Keduanya) | 'ko' (Korea Saja) | 'id' (Indonesia Saja)
  const [questionLang, setQuestionLang] = useState('bilingual');

  // Tampilkan arti terjemahan di bawah opsi (bantuan)
  const [showOptionHint, setShowOptionHint] = useState(false);

  // Shuffle questions for the quiz session
  const quizQuestions = useMemo(() => {
    return [...questions].sort(() => Math.random() - 0.5);
  }, [questions]);

  const currentQ = quizQuestions[currentIndex] || questions[0] || {};

  // Helper untuk mengekstrak teks jawaban Korea dan Indonesia secara berpasangan
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

  // Generate 4 pilihan ganda (1 kunci + 3 pengecoh) berpasangan { ko, id, isCorrect }
  const currentOptions = useMemo(() => {
    if (!currentQ || !questions.length) return [];
    
    const correct = getAnswerTexts(currentQ);
    if (!correct.ko && !correct.id) return [];

    // Filter kandidat dari kategori yang sama dulu
    const sameCategory = questions.filter(q => q.id !== currentQ.id && q.category === currentQ.category);
    const otherCategory = questions.filter(q => q.id !== currentQ.id && q.category !== currentQ.category);

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

    // Jika kandidat dari kategori yang sama kurang dari 3, ambil dari kategori lain
    if (distractorTexts.length < 3) {
      const extraCandidates = getUniqueCandidates(otherCategory);
      distractorTexts = [...distractorTexts, ...extraCandidates].slice(0, 3);
    }

    const allOpts = [
      { ko: correct.ko, id: correct.id, isCorrect: true, id_ref: currentQ.id },
      ...distractorTexts.map((d, i) => ({ ko: d.ko, id: d.id, isCorrect: false, id_ref: `dist_${i}` }))
    ].sort(() => Math.random() - 0.5);

    return allOpts;
  }, [currentQ, questions]);

  // Handle option select
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
      <div className="w-full max-w-lg mx-auto bg-white border border-[#E5E5E3] rounded-2xl p-6 text-center shadow-xs animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-200">
          <Trophy className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-[#191919]">Sesi Kuis Selesai!</h2>
        <p className="text-xs text-[#787774] mt-1">Berikut ringkasan hasil latihan pilihan ganda Anda:</p>

        <div className="grid grid-cols-3 gap-2 my-5">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-lg font-black text-emerald-800">{score.correct}</span>
            <span className="text-[11px] font-semibold text-emerald-700 block">Benar</span>
          </div>
          <div className="p-3 rounded-xl bg-red-50 border border-red-200">
            <span className="text-lg font-black text-red-800">{score.wrong}</span>
            <span className="text-[11px] font-semibold text-red-700 block">Salah</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-lg font-black text-blue-800">{accuracy}%</span>
            <span className="text-[11px] font-semibold text-blue-700 block">Akurasi</span>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Ulangi Kuis dari Awal</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      
      {/* 1. TOP SETTINGS & LANGUAGE CONTROL BAR */}
      <div className="w-full bg-[#F6F6F5] border border-[#E5E5E3] rounded-2xl p-2.5 mb-3 space-y-2">
        
        {/* Row 1: Soal Index, Category, Score */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[#191919] bg-white border border-[#E0E0DC] px-2.5 py-0.5 rounded-lg">
              {currentIndex + 1} / {quizQuestions.length}
            </span>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md truncate max-w-[170px] sm:max-w-xs">
              {currentQ?.category_title || currentQ?.category}
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

        {/* Row 2: Pengaturan Bahasa Pilihan Jawaban & Soal */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#EAEAE8] text-xs">
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
                title="Pilihan jawaban dalam teks Hangul Korea"
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
                title="Pilihan jawaban dalam Bahasa Indonesia"
              >
                🇮🇩 Indo
              </button>
            </div>
          </div>

          {/* Bahasa Soal & Toggle Arti */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-[#787774] uppercase tracking-wider">
                Soal:
              </span>
              <select
                value={questionLang}
                onChange={(e) => setQuestionLang(e.target.value)}
                className="bg-white border border-[#E0E0DC] text-[#191919] font-bold text-[11px] px-2 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="bilingual">🌐 Dua Bahasa</option>
                <option value="ko">🇰🇷 Hanya Korea</option>
                <option value="id">🇮🇩 Hanya Indo</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowOptionHint(!showOptionHint)}
              className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-all flex items-center gap-1 ${
                showOptionHint 
                  ? 'bg-amber-50 text-amber-800 border-amber-300' 
                  : 'bg-white text-[#787774] border-[#E0E0DC] hover:text-[#191919]'
              }`}
              title="Tampilkan arti bantuan di bawah teks pilihan"
            >
              {showOptionHint ? <Eye className="w-3 h-3 text-amber-600" /> : <EyeOff className="w-3 h-3" />}
              <span>Arti {showOptionHint ? 'ON' : 'OFF'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* 2. QUESTION CARD */}
      <div className="w-full bg-white border border-[#E5E5E3] rounded-2xl p-5 mb-3.5 shadow-xs text-center">
        
        {/* Gambar Alat / Rambu jika ada */}
        {currentQ?.image_url && (
          <div className="max-h-44 md:max-h-52 w-full flex items-center justify-center mb-3">
            <img 
              src={getAssetUrl(currentQ.image_url)} 
              alt="Soal Ujian" 
              className="max-h-40 md:max-h-48 w-auto object-contain rounded-lg border border-[#EFEFED] p-1 bg-[#FAFAFA]"
            />
          </div>
        )}

        {/* Teks Soal Sesuai Pilihan Bahasa */}
        <div className="space-y-1.5">
          {(questionLang === 'bilingual' || questionLang === 'ko') && (
            <h3 className="text-xl md:text-2xl font-black text-[#191919] font-kr tracking-tight leading-snug">
              {currentQ?.question_ko || currentQ?.title_ko || "이것은 무엇입니까?"}
            </h3>
          )}

          {questionLang === 'ko' && currentQ?.question_romaja && (
            <p className="text-xs text-[#787774] font-mono">
              {currentQ.question_romaja}
            </p>
          )}

          {(questionLang === 'bilingual' || questionLang === 'id') && (
            <p className={`font-medium ${
              questionLang === 'id' 
                ? 'text-lg md:text-xl font-bold text-[#191919]' 
                : 'text-xs md:text-sm text-[#555] bg-[#FBFBFA] border border-[#E5E5E3] px-3 py-1 rounded-xl inline-block mt-0.5'
            }`}>
              {currentQ?.question_id || currentQ?.title_id || "Apakah nama benda/alat ini?"}
            </p>
          )}
        </div>

        {/* Tombol Audio Soal */}
        {currentQ?.audio_q && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => onPlayAudio(currentQ.audio_q)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-all active:scale-95"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-pulse text-blue-600' : ''}`} />
              <span>Putar Suara Soal Penguji</span>
            </button>
          </div>
        )}

      </div>

      {/* 3. 4 PILIHAN GANDA (OPTIONS A, B, C, D) */}
      <div className="w-full space-y-2.5">
        {currentOptions.map((opt, idx) => {
          const mainText = optionLang === 'ko' ? opt.ko : opt.id;
          const secondaryText = optionLang === 'ko' ? opt.id : opt.ko;

          let btnStyle = "bg-white border-[#E5E5E3] text-[#191919] hover:border-slate-400 hover:bg-[#FBFBFA]";
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
              className={`w-full min-h-[52px] p-3.5 rounded-xl border text-left text-xs md:text-sm font-semibold transition-all flex items-center justify-between gap-3 active:scale-[0.99] ${btnStyle}`}
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-md bg-[#EFEFED] text-[#37352F] text-[11px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {String.fromCharCode(65 + idx)}
                </span>
                
                <div>
                  {/* Teks Utama Opsi */}
                  <span className={`leading-snug ${optionLang === 'ko' ? 'font-kr text-base font-bold' : 'text-sm'}`}>
                    {mainText}
                  </span>

                  {/* Teks Bantuan / Terjemahan (Tampil jika showOptionHint ON atau sudah dijawab) */}
                  {(showOptionHint || isAnswered) && secondaryText && (
                    <span className="text-[11px] text-[#787774] block font-normal mt-0.5">
                      {optionLang === 'ko' ? `(${secondaryText})` : `(${secondaryText})`}
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
        <div className="w-full mt-3.5 p-4 rounded-xl border border-[#E5E5E3] bg-[#FBFBFA] flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="text-left text-xs space-y-0.5">
            <span className={`font-bold block text-sm ${selectedOption?.isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
              {selectedOption?.isCorrect ? '✓ Jawaban Anda Benar!' : '✗ Jawaban Belum Tepat!'}
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
