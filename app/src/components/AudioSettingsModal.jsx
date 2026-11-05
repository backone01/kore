import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Volume2, Check, Sparkles, AlertCircle, Headphones, 
  SlidersHorizontal, Turtle, Zap, ShieldCheck, Play, Pause, User, Mic
} from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Badge } from './ui/badge.jsx';
import { cn } from '../utils/cn.js';
import { getAssetUrl } from '../utils/assetHelper.js';

export function AudioSettingsModal({
  open,
  onClose,
  audioSpeed,
  setAudioSpeed,
  koreanVoices,
  selectedVoiceName,
  setSelectedVoiceName,
  onTestVoice
}) {
  const [testingVoice, setTestingVoice] = useState(false);
  const [playingSample, setPlayingSample] = useState(null);
  const [answerVoiceGender, setAnswerVoiceGenderState] = useState(() => {
    try {
      return localStorage.getItem('kore_answer_voice_gender') || 'male';
    } catch {
      return 'male';
    }
  });
  const previewAudioRef = useRef(new Audio());

  const handleSelectAnswerGender = (gender) => {
    setAnswerVoiceGenderState(gender);
    try {
      localStorage.setItem('kore_answer_voice_gender', gender);
    } catch {}
  };

  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  if (!open) return null;

  const playPreviewSample = (url) => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
    }
    if (playingSample === url) {
      setPlayingSample(null);
      return;
    }
    previewAudioRef.current.src = getAssetUrl(url);
    try { previewAudioRef.current.playbackRate = audioSpeed; } catch {}
    previewAudioRef.current.onplay = () => setPlayingSample(url);
    previewAudioRef.current.onended = () => setPlayingSample(null);
    previewAudioRef.current.onerror = () => setPlayingSample(null);
    previewAudioRef.current.play().catch(() => setPlayingSample(null));
  };

  const speeds = [
    { value: 0.65, label: '0.65x', desc: 'Sangat Lambat (Pemula / Detail Huruf)', icon: Turtle },
    { value: 0.8, label: '0.8x', desc: 'Lambat & Jelas (Rekomendasi Wawancara)', icon: Turtle, recommended: true },
    { value: 1.0, label: '1.0x', desc: 'Normal (Kecepatan Asli Native Korea)', icon: Zap },
  ];

  const voiceDemos = [
    {
      id: 'injoon',
      url: '/audio/tts/voice_preview_injoon.mp3',
      name: 'InJoon Neural',
      tag: 'Penguji Resmi HRD',
      tagColor: 'border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10',
      desc: 'Intonasi tegas, formal, dan berwibawa khas penguji EPS-TOPIK. Digunakan pada Soal Ujian, Perintah Kerja, dan Pertanyaan Wawancara.',
      badge: '👨 Suara Pria 1'
    },
    {
      id: 'hyunsu',
      url: '/audio/tts/voice_preview_hyunsu.mp3',
      name: 'Hyunsu Neural',
      tag: 'Kandidat Pria',
      tagColor: 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10',
      desc: 'Intonasi energik, ramah, dan artikulasi sopan sehari-hari. Sangat cocok untuk model jawaban peserta ujian pria.',
      badge: '🧑 Suara Pria 2'
    },
    {
      id: 'sunhi',
      url: '/audio/tts/voice_preview_sunhi.mp3',
      name: 'SunHi Neural',
      tag: 'Kunci & Pilihan Jawaban',
      tagColor: 'border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-500/10',
      desc: 'Pelafalan vokal dan konsonan sangat tajam, jernih, dan mudah dipahami pemula. Digunakan pada Opsi Jawaban & Penjelasan Alat.',
      badge: '👩 Suara Wanita'
    }
  ];

  const handleTest = () => {
    setTestingVoice(true);
    if (onTestVoice) {
      onTestVoice();
    }
    setTimeout(() => setTestingVoice(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] text-left animate-scale-in"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-labelledby="audio-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <h2 id="audio-modal-title" className="font-bold text-base text-foreground leading-tight">
                Pengaturan Suara Penguji & Audio
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Konfigurasi kejernihan audio, kecepatan pelafalan, dan suara TTS
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto">
          
          {/* Status Audio Utama: AI Neural & Studio Terpadu */}
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15 text-xs space-y-1.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-bold text-emerald-800 dark:text-emerald-300">
                100% Berkas Audio Studio & Neural Aktif
              </span>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs py-0 px-1.5 ml-auto">
                Terpasang
              </Badge>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300/90 leading-relaxed">
              Seluruh soal wawancara, perintah kerja, rambu K3, dan nama perkakas kini menggunakan rekaman studio manusia & suara jernih Microsoft Neural (SunHi & InJoon). Suara tidak lagi kaku seperti robot.
            </p>
          </div>

          {/* Uji & Bandingkan Karakter Suara Asli (Pria vs Wanita) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Perbandingan Suara Asli (Pria vs Wanita)
                </label>
                <p className="text-[11px] text-muted-foreground">
                  Dengarkan langsung perbedaan intonasi suara penguji pria dan pemandu wanita
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {voiceDemos.map(demo => {
                const isPlaying = playingSample === demo.url;
                return (
                  <div 
                    key={demo.id}
                    className={cn(
                      "p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                      isPlaying 
                        ? "border-primary bg-primary/10 shadow-sm" 
                        : "border-border bg-card hover:bg-secondary/40"
                    )}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          {demo.badge} ({demo.name})
                        </span>
                        <Badge variant="outline" className={cn("text-xs py-0 px-1.5", demo.tagColor)}>
                          {demo.tag}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {demo.desc}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant={isPlaying ? "default" : "outline"}
                      size="sm"
                      onClick={() => playPreviewSample(demo.url)}
                      className={cn(
                        "h-8 px-3 text-xs gap-1.5 shrink-0 self-start sm:self-center min-w-[110px]",
                        isPlaying && "animate-pulse"
                      )}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-3.5 w-3.5 fill-current" />
                          <span>Berhenti</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Putar Suara</span>
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pengaturan Karakter Suara Kunci Jawaban & Opsi */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Karakter Suara Kunci Jawaban & Opsi Alat
                </label>
                <p className="text-[11px] text-muted-foreground">
                  Pilih apakah Anda ingin mendengar jawaban dalam suara cowok atau cewek
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectAnswerGender('male')}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2",
                  answerVoiceGender === 'male'
                    ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                    : "border-border bg-card hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-bold text-xs text-foreground">
                      🧑 Suara Cowok (Hyunsu)
                    </span>
                  </div>
                  {answerVoiceGender === 'male' && <Check className="h-4 w-4 text-primary" />}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Pria muda energik, artikulasi santai dan sopan. Sangat pas untuk persiapan kandidat pria.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAnswerGender('female')}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2",
                  answerVoiceGender === 'female'
                    ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                    : "border-border bg-card hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-500" />
                    <span className="font-bold text-xs text-foreground">
                      👩 Suara Cewek (SunHi)
                    </span>
                  </div>
                  {answerVoiceGender === 'female' && <Check className="h-4 w-4 text-primary" />}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Wanita jernih, artikulasi tajam. Memudahkan pemula menangkap detail pelafalan vokal.
                </p>
              </button>
            </div>
          </div>

          {/* Pengaturan Kecepatan Audio */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Kecepatan Pelafalan (Speed)
              </label>
              <span className="font-mono text-xs font-bold text-primary">
                {audioSpeed}x
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {speeds.map(sp => {
                const Icon = sp.icon;
                const isSelected = audioSpeed === sp.value;
                return (
                  <button
                    key={sp.value}
                    type="button"
                    onClick={() => setAudioSpeed(sp.value)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[72px]",
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                        : "border-border bg-card hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        <Icon className={cn("h-4 w-4", isSelected ? "text-primary" : "text-muted-foreground")} />
                        {sp.label}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <span className="text-xs leading-tight text-muted-foreground mt-1">
                      {sp.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pengaturan Suara TTS Cadangan Browser */}
          <div className="space-y-2.5 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Karakter Suara TTS Cadangan (Web Speech API)
                </label>
                <p className="text-[11px] text-muted-foreground">
                  Digunakan sebagai pelafalan dinamis jika ada variasi teks kustom
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={testingVoice}
                className="h-8 text-xs gap-1.5 shrink-0"
              >
                <Volume2 className={cn("h-3.5 w-3.5", testingVoice && "text-primary animate-pulse")} />
                <span>{testingVoice ? 'Memutar...' : 'Uji Suara'}</span>
              </Button>
            </div>

            {koreanVoices.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {koreanVoices.map((v) => {
                  const isSelected = selectedVoiceName === v.name || (!selectedVoiceName && v === koreanVoices[0]);
                  const isNatural = v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('SunHi') || v.name.includes('InJoon') || v.name.includes('Google');
                  
                  let cleanName = v.name
                    .replace(/Microsoft/gi, '')
                    .replace(/Online \(Natural\)/gi, '(Alami)')
                    .replace(/Korean \([^)]+\)/gi, '')
                    .trim();

                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => setSelectedVoiceName(v.name)}
                      className={cn(
                        "w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between gap-2 min-h-[44px]",
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground font-semibold"
                          : "border-border bg-card hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn("h-2 w-2 rounded-full", isSelected ? "bg-primary" : "bg-muted-foreground/40")} />
                        <span className="truncate">{cleanName || v.name}</span>
                        {isNatural && (
                          <Badge variant="outline" className="border-primary/40 text-primary text-xs py-0 px-1 shrink-0">
                            Neural
                          </Badge>
                        )}
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-border bg-secondary/30 text-xs text-muted-foreground">
                Tidak ada suara Korea tambahan yang terpasang di browser ini. Aplikasi menggunakan suara Korea default sistem Anda.
              </div>
            )}

            {/* Tips Browser Edge untuk Suara Paling Natural */}
            <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 text-[11px] text-muted-foreground space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                Rekomendasi Pengalaman Terbaik:
              </span>
              <p>
                Aplikasi ini secara otomatis memutar audio MP3 studio berkualitas tinggi. Untuk fitur TTS browser dengan intonasi paling alami seperti native speaker, disarankan membuka aplikasi melalui <strong>Microsoft Edge</strong> (mendukung suara <em>SunHi Online Natural</em> & <em>InJoon</em>).
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-border bg-secondary/20 flex justify-end">
          <Button onClick={onClose} size="sm" className="px-5">
            Selesai
          </Button>
        </div>
      </div>
    </div>
  );
}
