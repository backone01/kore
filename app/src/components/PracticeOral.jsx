import React from 'react';
import { 
  Eye, EyeOff, Volume2, Mic, CheckCircle2, 
  RotateCcw, Sparkles 
} from 'lucide-react';
import { getAssetUrl } from '../utils/assetHelper.js';

export function PracticeOral({
  currentQ,
  currentIndex,
  total,
  blindMode,
  setBlindMode,
  showTranslate,
  setShowTranslate,
  showAnswer,
  setShowAnswer,
  onPlayQuestion,
  onPlayAnswer,
  isPlayingAudio,
  isRecording,
  onToggleRecording,
  recordedAudioUrl
}) {
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center space-y-4">
      
      {/* Top Meta Bar */}
      <div className="w-full flex items-center justify-between text-xs text-[#787774] px-1">
        <span className="font-mono font-bold text-[#191919] bg-white border border-[#E5E5E3] px-2.5 py-1 rounded-lg">
          Soal {currentIndex + 1} / {total}
        </span>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBlindMode(!blindMode)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              blindMode 
                ? 'bg-amber-50 text-amber-800 border-amber-300' 
                : 'bg-white text-[#787774] border-[#E5E5E3] hover:text-[#191919]'
            }`}
          >
            {blindMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Blind Mode</span>
          </button>

          <button
            onClick={() => setShowTranslate(!showTranslate)}
            className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E5E3] text-[#787774] hover:text-[#191919] text-xs font-semibold"
          >
            Arti {showTranslate ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* QUESTION CARD */}
      <div className="w-full bg-white border border-[#E5E5E3] rounded-2xl p-5 shadow-xs flex flex-col items-center">
        {/* Category Pill */}
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded mb-3">
          {currentQ?.category_title || currentQ?.category}
        </span>

        {/* HERO IMAGE DISPLAY */}
        {currentQ?.image_url && (
          <div className="max-h-48 md:max-h-60 w-full flex items-center justify-center mb-3">
            <img
              src={getAssetUrl(currentQ.image_url)}
              alt="Perkakas atau Rambu K3"
              className="max-h-44 md:max-h-56 w-auto object-contain rounded-lg"
            />
          </div>
        )}

        {/* TYPOGRAPHY */}
        {!blindMode ? (
          <div className="space-y-1.5 my-2">
            <h2 className="text-2xl md:text-3xl font-black text-[#191919] font-kr tracking-tight leading-snug">
              {currentQ?.question_ko}
            </h2>
            {currentQ?.question_romaja && (
              <p className="text-xs text-[#787774] font-mono">
                {currentQ?.question_romaja}
              </p>
            )}
            {showTranslate && (
              <p className="text-xs md:text-sm text-[#37352F] bg-[#FBFBFA] border border-[#E5E5E3] px-3.5 py-1.5 rounded-xl inline-block mt-1 font-medium">
                "{currentQ?.question_id}"
              </p>
            )}
          </div>
        ) : (
          <div className="py-4 px-5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium my-2">
            <strong>Blind Mode Aktif:</strong> Teks pertanyaan disembunyikan. Tebak langsung nama Korea alat atau jawab audio penguji secara mandiri!
          </div>
        )}

        {/* AUDIO QUESTION BUTTON */}
        <div className="mt-3">
          <button
            onClick={onPlayQuestion}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-all active:scale-95"
          >
            <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
            <span>Putar Suara Penguji</span>
          </button>
        </div>
      </div>

      {/* ANSWER REVEAL SECTION */}
      <div className="w-full">
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full h-11 rounded-xl bg-white border border-[#E5E5E3] hover:border-slate-400 text-xs font-bold text-[#37352F] shadow-2xs transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Eye className="w-4 h-4 text-blue-600" />
            <span>Buka Kunci Jawaban Resmi</span>
          </button>
        ) : (
          <div className="w-full bg-white border-2 border-emerald-500/80 rounded-2xl p-4.5 shadow-xs text-left space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Jawaban Model HRD Korea:
              </span>
              <div className="flex items-center gap-2">
                {currentQ?.audio_a && (
                  <button
                    onClick={onPlayAnswer}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[11px] font-bold flex items-center gap-1 border border-emerald-200 transition-colors"
                  >
                    <Volume2 className="w-3 h-3" /> Audio Jawaban
                  </button>
                )}
                <button
                  onClick={() => setShowAnswer(false)}
                  className="text-xs text-[#787774] hover:text-[#191919] px-1 font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>

            <p className="text-xl font-black text-[#191919] font-kr">
              {currentQ?.answer_short_ko || currentQ?.title_ko}
            </p>
            {showTranslate && (
              <p className="text-xs text-[#787774] font-medium leading-relaxed">
                Artinya: {currentQ?.answer_short_id || currentQ?.title_id}
              </p>
            )}
          </div>
        )}
      </div>

      {/* RECORDED VOICE PLAYBACK */}
      {recordedAudioUrl && (
        <div className="w-full p-3 rounded-xl bg-white border border-[#E5E5E3] shadow-xs flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#191919]">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span>Hasil Rekaman Suara Anda:</span>
          </div>
          <audio src={recordedAudioUrl} controls className="h-8 max-w-[200px]" />
        </div>
      )}

      {/* MIC INSTRUCTION */}
      <div className="text-[11px] text-[#787774] font-medium flex items-center justify-center gap-1.5 pt-1">
        <Mic className={`w-3.5 h-3.5 ${isRecording ? 'text-red-600 animate-pulse' : 'text-slate-400'}`} />
        <span>Gunakan tombol Mikrofon di bilah bawah untuk melatih intonasi suara Anda</span>
      </div>

    </div>
  );
}
