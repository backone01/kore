import React from 'react';
import { Eye, EyeOff, Volume2, Mic, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center space-y-4">

      {/* Meta bar */}
      <div className="w-full flex items-center justify-between text-xs text-muted-foreground px-1">
        <span className="font-mono font-bold text-foreground bg-secondary border border-border px-2.5 py-1 rounded-md">
          Soal {currentIndex + 1} / {total}
        </span>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium">Arti</span>
            <Switch
              checked={showTranslate}
              onCheckedChange={setShowTranslate}
              aria-label="Tampilkan terjemahan"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium">Blind</span>
            <Switch
              checked={blindMode}
              onCheckedChange={setBlindMode}
              aria-label="Mode buta teks"
            />
          </div>
        </div>
      </div>

      {/* Question card */}
      <Card className="w-full p-5 flex flex-col items-center">
        <Badge variant="outline" className="mb-3 font-mono">
          {currentQ?.category_title || currentQ?.category}
        </Badge>

        {currentQ?.image_url && (
          <div className="max-h-48 md:max-h-60 w-full flex items-center justify-center mb-3">
            <img
              src={getAssetUrl(currentQ.image_url)}
              alt="Perkakas atau Rambu K3"
              className="max-h-44 md:max-h-56 w-auto object-contain rounded-md"
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
            {showTranslate && (
              <p className="text-xs md:text-sm text-foreground bg-muted border border-border px-3.5 py-1.5 rounded-md inline-block mt-1 font-medium">
                "{currentQ?.question_id}"
              </p>
            )}
          </div>
        ) : (
          <div className="py-4 px-5 rounded-md bg-warn/10 border border-warn/30 text-xs text-warn font-medium my-2">
            <strong>Blind Mode Aktif:</strong> Teks pertanyaan disembunyikan. Tebak langsung nama Korea alat atau jawab audio penguji secara mandiri.
          </div>
        )}

        <div className="mt-3">
          <Button onClick={onPlayQuestion}>
            <Volume2 className={cn('h-4 w-4', isPlayingAudio && 'animate-pulse')} />
            <span>Putar Suara Penguji</span>
          </Button>
        </div>
      </Card>

      {/* Answer reveal */}
      <div className="w-full">
        {!showAnswer ? (
          <Button variant="outline" onClick={() => setShowAnswer(true)} className="w-full">
            <Eye className="h-4 w-4" />
            <span>Buka Kunci Jawaban Resmi</span>
          </Button>
        ) : (
          <Card className="w-full p-4 text-left space-y-2 animate-fade-in border-emerald-500/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Jawaban Model HRD Korea:
              </span>
              <div className="flex items-center gap-2">
                {currentQ?.audio_a && (
                  <Button type="button" variant="secondary" size="sm" onClick={onPlayAnswer}>
                    <Volume2 className="h-3 w-3" />
                    <span>Audio Jawaban</span>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowAnswer(false)}>
                  Tutup
                </Button>
              </div>
            </div>

            <p className="text-xl font-bold text-foreground font-kr">
              {currentQ?.answer_short_ko || currentQ?.title_ko}
            </p>
            {showTranslate && (
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Artinya: {currentQ?.answer_short_id || currentQ?.title_id}
              </p>
            )}
          </Card>
        )}
      </div>

      {/* Recorded voice */}
      {recordedAudioUrl && (
        <Card className="w-full p-3 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
            <span className="h-2 w-2 rounded-full bg-destructive animate-pulse-dot" />
            <span>Hasil Rekaman Suara Anda:</span>
          </div>
          <audio src={recordedAudioUrl} controls className="h-8 max-w-[200px]" />
        </Card>
      )}

      {/* Mic instruction */}
      <div className="text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1.5 pt-1">
        <Mic className={cn('h-3.5 w-3.5', isRecording ? 'text-destructive animate-pulse-dot' : 'text-muted-foreground')} />
        <span>Gunakan tombol Mikrofon di bilah bawah untuk melatih intonasi suara Anda</span>
      </div>
    </div>
  );
}
