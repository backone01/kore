import React from 'react';
import { Eye, EyeOff, Volume2, Mic, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Card } from './ui/card.jsx';
import { Badge } from './ui/badge.jsx';
import { Switch } from './ui/switch.jsx';
import { cn } from '../utils/cn.js';
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
    <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center space-y-3.5">

      {/* Meta bar */}
      <div className="w-full flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border px-0.5">
        <span className="font-mono font-bold text-foreground">
          Soal {currentIndex + 1} / {total}
        </span>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-[11px] font-medium text-foreground">Arti</span>
            <Switch
              checked={showTranslate}
              onCheckedChange={setShowTranslate}
              aria-label="Tampilkan terjemahan"
            />
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-[11px] font-medium text-foreground">Blind</span>
            <Switch
              checked={blindMode}
              onCheckedChange={setBlindMode}
              aria-label="Mode buta teks"
            />
          </label>
        </div>
      </div>

      {/* Unified Question & Answer Card (single-level surface) */}
      <Card className="w-full p-5 sm:p-6 flex flex-col items-center">
        <div className="w-full flex items-center justify-between gap-2 mb-3">
          <Badge variant="outline" className="font-mono truncate">
            {currentQ?.category_title || currentQ?.category}
          </Badge>

          <button
            type="button"
            onClick={() => setShowAnswer(!showAnswer)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0"
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
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                &ldquo;{currentQ?.question_id}&rdquo;
              </p>
            )}
          </div>
        ) : (
          <p className="py-4 text-xs text-warn font-medium my-2 max-w-md">
            Blind Mode Aktif: Teks pertanyaan disembunyikan. Dengarkan suara penguji lewat tombol di bilah bawah lalu jawab secara lisan.
          </p>
        )}

        {/* Answer Key integrated cleanly with a top divider */}
        {showAnswer && (
          <div className="w-full mt-4 pt-4 border-t border-border text-left space-y-1.5 animate-fade-in">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Jawaban Model HRD Korea
              </span>
              {currentQ?.audio_a && (
                <Button type="button" variant="secondary" size="sm" onClick={onPlayAnswer} className="h-7 text-xs">
                  <Volume2 className="h-3 w-3" />
                  <span>Audio Jawaban</span>
                </Button>
              )}
            </div>

            <p className="text-xl font-bold text-foreground font-kr">
              {currentQ?.answer_short_ko || currentQ?.title_ko}
            </p>
            {showTranslate && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Artinya: {currentQ?.answer_short_id || currentQ?.title_id}
              </p>
            )}
          </div>
        )}

        {/* Recorded voice playback integrated cleanly */}
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
        <span>Gunakan bilah kontrol di bawah layar untuk memutar soal dan merekam suara</span>
      </div>
    </div>
  );
}
