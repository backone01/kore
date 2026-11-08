import React, { useState, useEffect, useMemo } from 'react';
import { 
  Volume2, RotateCcw, Shuffle, Check, X, ArrowLeftRight, 
  Headphones, ChevronLeft, ChevronRight, Eye, EyeOff, 
  Image as ImageIcon, List, Search, Wrench, Sparkles, Filter,
  Turtle, Zap
} from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Card } from './ui/card.jsx';
import { Badge } from './ui/badge.jsx';
import { cn } from '../utils/cn.js';
import { getAssetUrl } from '../utils/assetHelper.js';

export function PracticeFlashcard({
  questions,
  onPlayAudio,
  onPlayMeaning,
  isPlayingAudio,
  audioSpeed = 0.8,
  onToggleAudioSpeed
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [memorizedIds, setMemorizedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('kore_flashcard_memorized');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [reviewLaterIds, setReviewLaterIds] = useState(() => {
    try {
      const saved = localStorage.getItem('kore_flashcard_review');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [cardDirection, setCardDirection] = useState('ko_to_id');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  // Auto-Save kartu hafal & review
  useEffect(() => {
    try {
      localStorage.setItem('kore_flashcard_memorized', JSON.stringify([...memorizedIds]));
    } catch {}
  }, [memorizedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('kore_flashcard_review', JSON.stringify([...reviewLaterIds]));
    } catch {}
  }, [reviewLaterIds]);
  // Mode tebak gambar: sembunyikan nama Korea di sisi depan jika soal memiliki gambar
  const [hideKoreanOnImage, setHideKoreanOnImage] = useState(true);

  // Mode fokus pertanyaan perkakas: 'both' (Nama & Kegunaan) | 'name' (Hanya Nama Alat) | 'usage' (Hanya Kegunaan)
  const [toolQuestionMode, setToolQuestionMode] = useState('both');

  // Modal daftar & pencarian soal cepat
  const [listModalOpen, setListModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'unmemorized' | 'memorized' | 'review'

  useEffect(() => {
    setShuffledQuestions(questions);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSelectedOptionIndex(0);
  }, [questions]);

  const currentQ = shuffledQuestions[currentIndex] || questions[0] || {};
  const total = shuffledQuestions.length;
  const hasImage = !!currentQ?.image_url;

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
  const isTool = currentQ?.category === 'alat_manufaktur' || currentQ?.category === 'alat_klasik' || currentQ?.category === 'fungsi_alat';
  const isPictogram = currentQ?.category === 'piktogram';

  // Fallback nama & pertanyaan yang bersih tanpa bocor
  const itemNameKo = currentQ?.title_ko || (currentQ?.answer_short_ko ? currentQ.answer_short_ko.replace(/입니다\.$/, '').trim() : '') || currentQ?.question_ko || '';
  const itemNameId = currentQ?.title_id || currentQ?.answer_short_id || currentQ?.question_id || '';

  let questionPromptKo = currentQ?.question_ko || '';
  let questionPromptId = currentQ?.question_id || '';

  if (isTool) {
    if (toolQuestionMode === 'name') {
      questionPromptKo = '이 공구의 이름은 무엇입니까?';
      questionPromptId = 'Apakah nama alat / perkakas ini?';
    } else if (toolQuestionMode === 'usage') {
      const toolName = currentQ?.title_ko ? currentQ.title_ko : '이 공구';
      questionPromptKo = `${toolName}는 무엇에 사용합니까?`;
      questionPromptId = `${currentQ?.title_id ? currentQ.title_id + ' ' : 'Alat ini '}digunakan untuk apa?`;
    } else {
      questionPromptKo = '이 공구의 이름과 용도는 무엇입니까?';
      questionPromptId = 'Apakah nama dan kegunaan perkakas ini?';
    }
  } else if (isPictogram) {
    questionPromptKo = '이 안전 표지는 무슨 뜻입니까?';
    questionPromptId = 'Apakah arti rambu keselamatan kerja ini?';
  }

  // Filter daftar soal di modal pencarian
  const modalQuestions = useMemo(() => {
    return shuffledQuestions.map((q, idx) => ({ ...q, originalIndex: idx })).filter(q => {
      if (filterStatus === 'memorized' && !memorizedIds.has(q.id)) return false;
      if (filterStatus === 'review' && !reviewLaterIds.has(q.id)) return false;
      if (filterStatus === 'unmemorized' && (memorizedIds.has(q.id) || reviewLaterIds.has(q.id))) return false;
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const haystack = `${q.title_ko || ''} ${q.title_id || ''} ${q.question_ko || ''} ${q.question_id || ''} ${q.answer_short_ko || ''} ${q.answer_short_id || ''} ${q.question_romaja || ''}`.toLowerCase();
        return haystack.includes(query);
      }
      return true;
    });
  }, [shuffledQuestions, filterStatus, searchQuery, memorizedIds, reviewLaterIds]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">

      {/* Top bar */}
      <div className="w-full flex flex-wrap items-center justify-between text-xs text-muted-foreground mb-2 px-0.5 gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Tombol Pemilih / Lompat Soal Cepat */}
          <button
            type="button"
            onClick={() => setListModalOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-border bg-card hover:bg-secondary text-foreground text-xs font-semibold shadow-2xs transition-colors"
            title="Klik untuk melihat daftar soal & langsung melompat ke nomor tertentu"
          >
            <List className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono">{currentIndex + 1} / {total}</span>
            <span className="text-xs text-muted-foreground font-normal hidden sm:inline">(Cari Soal)</span>
          </button>

          {hasImage && (
            <Badge variant="outline" className="text-xs gap-1 py-0 h-6 text-primary border-primary/30 bg-primary/5">
              <ImageIcon className="h-3 w-3" />
              <span>Bergambar</span>
            </Badge>
          )}
          {memorizedIds.size > 0 && (
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              · Hafal: {memorizedIds.size}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Toggle Sembunyikan Nama Korea Khusus Soal Bergambar */}
          {hasImage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHideKoreanOnImage(prev => !prev)}
              title={hideKoreanOnImage ? "Mode Tebak Gambar Aktif: Nama Korea disembunyikan di sisi depan" : "Mode Belajar: Nama Korea ditampilkan di depan"}
              className={cn(
                "h-8 text-xs gap-1",
                hideKoreanOnImage ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30" : ""
              )}
            >
              {hideKoreanOnImage ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{hideKoreanOnImage ? "Tebak: Nama Sembunyi" : "Nama Terbuka"}</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCardDirection(prev => prev === 'ko_to_id' ? 'id_to_ko' : 'ko_to_id');
              setIsFlipped(false);
            }}
            title="Ganti arah sisi kartu"
            className="h-8 text-xs"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span>{cardDirection === 'ko_to_id' ? 'Depan KR' : 'Depan ID'}</span>
          </Button>

        </div>
      </div>

      {/* Selector Mode Pertanyaan Alat: Nama vs Kegunaan vs Keduanya */}
      {isTool && (
        <div className="w-full flex items-center justify-between bg-secondary/70 border border-border/80 rounded-xl p-1 mb-2.5 gap-1">
          <span className="text-[11px] font-bold text-muted-foreground px-2 hidden sm:inline flex items-center gap-1">
            <Wrench className="h-3 w-3 text-primary" />
            <span>Fokus Pertanyaan:</span>
          </span>
          <div className="grid grid-cols-3 w-full sm:w-auto gap-1">
            <button
              type="button"
              onClick={() => { setToolQuestionMode('name'); setIsFlipped(false); }}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all text-center',
                toolQuestionMode === 'name'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
              title="Latihan menghafal Nama Alat (이름)"
            >
              🏷️ Nama Alat
            </button>
            <button
              type="button"
              onClick={() => { setToolQuestionMode('usage'); setIsFlipped(false); }}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all text-center',
                toolQuestionMode === 'usage'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
              title="Latihan menghafal Kegunaan / Fungsi Alat (용도)"
            >
              ⚙️ Kegunaan
            </button>
            <button
              type="button"
              onClick={() => { setToolQuestionMode('both'); setIsFlipped(false); }}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all text-center',
                toolQuestionMode === 'both'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
              title="Latihan Nama & Kegunaan Sekaligus"
            >
              🌟 Keduanya
            </button>
          </div>
        </div>
      )}

      {/* Flashcard */}
      <Card
        onClick={() => setIsFlipped(!isFlipped)}
        className={cn(
          'w-full min-h-[350px] md:min-h-[400px] p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all hover:border-foreground/30 shadow-xs'
        )}
      >
        {/* Status row */}
        <div className="flex items-center justify-between w-full gap-2">
          <Badge variant="outline" className="font-mono truncate max-w-[200px] sm:max-w-xs">
            {currentQ?.category_title || currentQ?.category}
          </Badge>
          <div className="flex items-center gap-1.5 shrink-0">
            {isMemorized && (
              <Badge variant="success"><Check className="h-3 w-3" /> Hafal</Badge>
            )}
            {isReview && (
              <Badge variant="warn">Ulangi Nanti</Badge>
            )}
            <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
              Ketuk untuk balik kartu ↻
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="my-auto py-3 flex flex-col items-center text-center w-full">
          {!isFlipped ? (
            /* SISI DEPAN KARTU */
            <div className="space-y-3 w-full animate-fade-in flex flex-col items-center">
              {/* Gambar Jika Ada */}
              {hasImage && (
                <div className="max-h-48 md:max-h-56 w-full flex items-center justify-center p-2 bg-secondary/20 rounded-xl border border-border/40">
                  <img
                    src={getAssetUrl(currentQ.image_url)}
                    alt="Alat atau Rambu K3"
                    className="max-h-40 md:max-h-48 w-auto object-contain rounded-lg shadow-2xs"
                  />
                </div>
              )}

              {/* Teks Sisi Depan */}
              {hasImage ? (
                /* Kasus Soal Bergambar (Piktogram & Alat) */
                <div className="space-y-2 w-full max-w-md">
                  {/* Pertanyaan Penguji */}
                  <p className="text-sm md:text-base font-bold text-primary font-kr leading-snug">
                    {questionPromptKo}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    &ldquo;{questionPromptId}&rdquo;
                  </p>

                  {/* Cek apakah nama Korea disembunyikan untuk latihan menghafal */}
                  {hideKoreanOnImage ? (
                    <div className="py-2.5 px-3.5 rounded-lg bg-secondary/80 border border-dashed border-border flex flex-col items-center justify-center gap-1 mt-2">
                      <div className="flex items-center gap-1.5">
                        <EyeOff className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="text-xs font-bold text-foreground">
                          Nama Korea Disembunyikan
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        Tebak dalam hati, lalu ketuk kartu untuk melihat nama Korea & artinya ↻
                      </span>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground font-kr leading-snug">
                        {itemNameKo}
                      </h2>
                      {currentQ?.question_romaja && (
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {currentQ.question_romaja}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Kasus Soal Teks Tanpa Gambar (Wawancara, K3, Gerak Fisik, Hitungan) */
                cardDirection === 'ko_to_id' ? (
                  <div className="space-y-1.5 max-w-md">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground font-kr leading-snug tracking-tight">
                      {currentQ?.question_ko || itemNameKo}
                    </h2>
                    {currentQ?.question_romaja && (
                      <p className="text-xs md:text-sm text-muted-foreground font-mono">
                        {currentQ.question_romaja}
                      </p>
                    )}
                    {currentQ?.question_id && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        &ldquo;{currentQ.question_id}&rdquo;
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5 max-w-md">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground leading-snug tracking-tight">
                      {currentQ?.question_id || itemNameId}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Tebak pengucapan bahasa Korea untuk pertanyaan/soal ini
                    </p>
                  </div>
                )
              )}

              {/* Audio button di depan */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                {(currentQ?.audio_q || currentQ?.question_ko) && (
                  <Button type="button" variant="secondary" size="sm"
                    onClick={(e) => { e.stopPropagation(); onPlayAudio(currentQ.audio_q, currentQ.question_ko); }}
                    title="Dengar suara penguji">
                    <Headphones className="h-3.5 w-3.5 text-primary" />
                    <span>Dengar Soal Penguji</span>
                  </Button>
                )}
                {onPlayMeaning && currentQ?.question_id && (
                  <Button type="button" variant="outline" size="sm"
                    onClick={(e) => { e.stopPropagation(); onPlayMeaning(currentQ.question_id); }}
                    title="Dengar arti maksud pertanyaan bahasa Indonesia"
                    className="border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-500/10">
                    <Volume2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Dengar Maksud (ID)</span>
                  </Button>
                )}
                {!hasImage && cardDirection === 'ko_to_id' && (currentQ?.audio_a || currentQ?.answer_short_ko || currentQ?.answer_ko) && (
                  <Button type="button" variant="secondary" size="sm"
                    onClick={(e) => { e.stopPropagation(); onPlayAudio(currentQ.audio_a, currentQ.answer_short_ko || currentQ.answer_ko); }}
                    title="Dengar pelafalan jawaban">
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Dengar Jawaban</span>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* SISI BELAKANG KARTU (JAWABAN / KUNCI) */
            (() => {
              const isTool = currentQ?.category === 'alat_manufaktur' || currentQ?.category === 'alat_klasik';
              const isPictogram = currentQ?.category === 'piktogram';
              const hasOptions = currentQ?.answer_options && currentQ.answer_options.length > 0;
              const activeOpt = hasOptions ? currentQ.answer_options[selectedOptionIndex] || currentQ.answer_options[0] : null;

              if (isTool) {
                const toolNameOnly = currentQ?.title_ko || (currentQ?.answer_short_ko ? currentQ.answer_short_ko.replace(/입니다\.?$/, '').trim() : '') || itemNameKo;
                const toolNameKo = toolNameOnly;
                const toolAnswerSentence = currentQ?.answer_short_ko || (toolNameOnly ? `${toolNameOnly}입니다.` : '');
                const toolNameId = currentQ?.title_id || currentQ?.answer_short_id || itemNameId;
                const usageDefaultKo = currentQ?.usage_short_ko || (currentQ?.answer_options?.[0]?.ko) || '쇠를 갈거나 자를 때 씁니다.';
                const usageDefaultId = currentQ?.usage_short_id || (currentQ?.answer_options?.[0]?.id) || 'Dipakai untuk mengasah atau memotong besi.';

                return (
                  <div className="space-y-3 w-full max-w-md mx-auto animate-fade-in flex flex-col items-center">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <Badge variant="success">
                        {toolQuestionMode === 'name' && 'Kunci: Nama Perkakas (공구 명칭)'}
                        {toolQuestionMode === 'usage' && 'Kunci: Kegunaan Alat (공구 용도)'}
                        {toolQuestionMode === 'both' && 'Kunci: Nama & Kegunaan Lengkap'}
                      </Badge>
                    </div>

                    {/* Mode 1: Hanya Nama Alat */}
                    {toolQuestionMode === 'name' && (
                      <div className="text-center space-y-1.5 py-1">
                        <h3 className="text-3xl md:text-4xl font-extrabold text-foreground font-kr leading-tight tracking-tight">
                          {toolNameOnly}
                        </h3>
                        {toolAnswerSentence && toolAnswerSentence !== toolNameOnly && (
                          <p className="text-base md:text-lg font-bold text-primary font-kr">
                            {toolAnswerSentence}
                          </p>
                        )}
                        <p className="font-bold text-emerald-700 dark:text-emerald-400 text-lg md:text-xl pt-0.5">
                          {toolNameId}
                        </p>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setToolQuestionMode('usage'); }}
                            className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline bg-primary/10 px-2.5 py-1 rounded-md"
                          >
                            <span>Lanjut Cek Kegunaan / Fungsinya (용도) →</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Mode 2: Hanya Kegunaan Alat */}
                    {toolQuestionMode === 'usage' && (
                      <div className="w-full space-y-2.5 text-center">
                        <div className="inline-block bg-muted px-2.5 py-1 rounded-md text-xs font-semibold text-muted-foreground">
                          Perkakas: <span className="font-bold text-foreground font-kr">{toolNameOnly}</span> ({toolNameId})
                        </div>

                        <div className="bg-secondary/60 border border-border/80 rounded-xl p-3.5 space-y-2.5 text-left">
                          <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            <span>🛠️ Kalimat Jawaban Lisan (용도):</span>
                            <span className="text-xs text-muted-foreground/80 font-normal">pilih variasi</span>
                          </div>

                          {hasOptions && (
                            <div className="flex flex-wrap items-center gap-1">
                              {currentQ.answer_options.map((opt, oIdx) => (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setSelectedOptionIndex(oIdx); }}
                                  className={cn(
                                    'px-2 py-0.5 rounded-md text-xs sm:text-[11px] font-medium border transition-colors',
                                    selectedOptionIndex === oIdx
                                      ? 'bg-foreground text-background border-foreground shadow-xs font-semibold'
                                      : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                                  )}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="pt-1">
                            <h4 className="text-xl md:text-2xl font-extrabold text-foreground font-kr leading-snug">
                              {activeOpt?.ko || activeOpt?.answer_ko || usageDefaultKo}
                            </h4>
                            <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm md:text-base mt-1">
                              {activeOpt?.id || activeOpt?.answer_id || usageDefaultId}
                            </p>
                          </div>
                        </div>

                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setToolQuestionMode('name'); }}
                            className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline bg-primary/10 px-2.5 py-1 rounded-md"
                          >
                            <span>← Kembali ke Latihan Nama Alat</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Mode 3: Keduanya (Nama & Kegunaan Sekaligus) */}
                    {toolQuestionMode === 'both' && (
                      <div className="w-full space-y-3">
                        <div className="text-center space-y-1">
                          <h3 className="text-3xl md:text-4xl font-extrabold text-foreground font-kr leading-tight tracking-tight">
                            {toolNameOnly}
                          </h3>
                          {toolAnswerSentence && toolAnswerSentence !== toolNameOnly && (
                            <p className="text-sm md:text-base font-bold text-primary font-kr">
                              {toolAnswerSentence}
                            </p>
                          )}
                          <p className="font-bold text-emerald-700 dark:text-emerald-400 text-lg md:text-xl pt-0.5">
                            {toolNameId}
                          </p>
                        </div>

                        {/* KOTAK FUNGSI / KEGUNAAN KERJA */}
                        <div className="w-full bg-secondary/50 border border-border/80 rounded-xl p-3 space-y-2 mt-2 text-left">
                          <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            <span>🛠️ Fungsi & Kegunaan (용도):</span>
                            <span className="text-xs lowercase text-muted-foreground/80 font-normal">pilihan jawaban lisan</span>
                          </div>

                          {hasOptions && (
                            <div className="flex flex-wrap items-center gap-1">
                              {currentQ.answer_options.map((opt, oIdx) => (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setSelectedOptionIndex(oIdx); }}
                                  className={cn(
                                    'px-2 py-0.5 rounded-md text-xs sm:text-[11px] font-medium border transition-colors',
                                    selectedOptionIndex === oIdx
                                      ? 'bg-foreground text-background border-foreground shadow-xs font-semibold'
                                      : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                                  )}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="pt-1">
                            <p className="text-sm sm:text-base font-bold text-foreground font-kr leading-snug">
                              {activeOpt?.ko || activeOpt?.answer_ko || usageDefaultKo}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                              {activeOpt?.id || activeOpt?.answer_id || usageDefaultId}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Audio button di belakang */}
                    <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                      {(currentQ?.audio_a || toolNameKo) && (
                        <Button type="button" variant="secondary" size="sm"
                          onClick={(e) => { e.stopPropagation(); onPlayAudio(currentQ.audio_a, toolNameKo); }}
                          title="Dengar pelafalan nama alat">
                          <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Dengar Nama Alat</span>
                        </Button>
                      )}
                      {onPlayMeaning && toolNameId && (
                        <Button type="button" variant="outline" size="sm"
                          onClick={(e) => { e.stopPropagation(); onPlayMeaning(toolNameId); }}
                          className="border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-500/10"
                          title="Dengar arti nama alat dalam bahasa Indonesia">
                          <Volume2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Arti Nama (ID)</span>
                        </Button>
                      )}
                      {(activeOpt?.audio || activeOpt?.ko) && (
                        <Button type="button" variant="outline" size="sm"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            onPlayAudio(activeOpt?.audio, activeOpt?.ko || activeOpt?.answer_ko); 
                          }}
                          className="border-primary/40 text-primary hover:bg-primary/10"
                          title="Dengar pelafalan fungsi/kegunaan alat yang dipilih">
                          <Volume2 className="h-3.5 w-3.5 text-primary" />
                          <span>Dengar Fungsi ({activeOpt?.label || 'Opsi'})</span>
                        </Button>
                      )}
                      {onPlayMeaning && (activeOpt?.id || activeOpt?.answer_id || usageDefaultId) && (
                        <Button type="button" variant="outline" size="sm"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            onPlayMeaning(activeOpt?.id || activeOpt?.answer_id || usageDefaultId); 
                          }}
                          className="border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-500/10"
                          title="Dengar arti fungsi bahasa Indonesia">
                          <Volume2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Arti Fungsi (ID)</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              }

              if (isPictogram) {
                const picName = currentQ?.title_ko || itemNameKo;
                const picSentence = currentQ?.answer_short_ko || '';
                const picId = currentQ?.title_id || itemNameId;

                return (
                  <div className="space-y-3 w-full max-w-md mx-auto animate-fade-in flex flex-col items-center">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <Badge variant="success">
                        Rambu Keselamatan K3 (안전보건표지)
                      </Badge>
                    </div>

                    <div className="text-center space-y-1">
                      <h3 className="text-2xl md:text-3xl font-extrabold text-foreground font-kr leading-tight tracking-tight">
                        {picName}
                      </h3>
                      {picSentence && picSentence !== picName && (
                        <p className="text-sm md:text-base font-semibold text-primary font-kr">
                          {picSentence}
                        </p>
                      )}
                      <p className="font-bold text-emerald-700 dark:text-emerald-400 text-base md:text-lg pt-0.5">
                        {picId}
                      </p>
                    </div>

                    {/* Audio button di belakang */}
                    <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                      {(currentQ?.audio_a || picSentence || picName) && (
                        <Button type="button" variant="secondary" size="sm"
                          onClick={(e) => { e.stopPropagation(); onPlayAudio(currentQ.audio_a, picSentence || picName); }}
                          title="Dengar pelafalan arti rambu">
                          <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Dengar Pelafalan Rambu</span>
                        </Button>
                      )}
                      {onPlayMeaning && picId && (
                        <Button type="button" variant="outline" size="sm"
                          onClick={(e) => { e.stopPropagation(); onPlayMeaning(picId); }}
                          className="border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-500/10"
                          title="Dengar arti rambu dalam bahasa Indonesia">
                          <Volume2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Dengar Arti Rambu (ID)</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              }

              // General Q&A (Interview, K3, Gerak Fisik, Hitungan)
              const hasMultipleOpts = currentQ?.answer_options && currentQ.answer_options.length > 1;
              const displayKo = activeOpt ? (activeOpt.ko || activeOpt.answer_ko) : (currentQ?.answer_short_ko || itemNameKo);
              const displayId = activeOpt ? (activeOpt.id || activeOpt.answer_id) : (currentQ?.answer_short_id || itemNameId);

              return (
                <div className="space-y-3 w-full max-w-md mx-auto animate-fade-in flex flex-col items-center">
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <Badge variant="success">
                      {activeOpt?.label || 'Kunci Jawaban Resmi'}
                    </Badge>
                  </div>

                  {hasMultipleOpts && (
                    <div className="flex flex-wrap items-center justify-center gap-1 pt-1">
                      {currentQ.answer_options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedOptionIndex(oIdx); }}
                          className={cn(
                            'px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors',
                            selectedOptionIndex === oIdx
                              ? 'bg-foreground text-background border-foreground font-semibold shadow-xs'
                              : 'bg-transparent text-muted-foreground border-border hover:bg-secondary'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <h3 className="text-xl md:text-2xl font-bold text-foreground font-kr mt-1 leading-snug text-center">
                    {displayKo}
                  </h3>

                  {currentQ?.question_romaja && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {currentQ.question_romaja}
                    </p>
                  )}

                  {/* Terjemahan Bahasa Indonesia */}
                  <div className="border-t border-border/60 pt-3 space-y-1 text-center w-full">
                    <p className="font-bold text-emerald-700 dark:text-emerald-400 text-base md:text-lg leading-snug">
                      {displayId}
                    </p>
                    {currentQ?.question_id && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Maksud Soal: &ldquo;{currentQ.question_id}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Audio button di belakang */}
                  <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                    {(activeOpt?.audio || currentQ?.audio_a || displayKo) && (
                      <Button type="button" variant="secondary" size="sm"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          const targetAudio = activeOpt?.audio || (selectedOptionIndex === 0 ? currentQ?.audio_a : null);
                          onPlayAudio(targetAudio, displayKo); 
                        }}
                        title="Dengar pelafalan jawaban pilihan ini">
                        <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Dengar Pelafalan Korea</span>
                      </Button>
                    )}
                    {onPlayMeaning && displayId && (
                      <Button type="button" variant="outline" size="sm"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onPlayMeaning(displayId); 
                        }}
                        className="border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-500/10"
                        title="Dengar arti jawaban dalam bahasa Indonesia">
                        <Volume2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Dengar Arti (ID)</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })()
          )}
        </div>

        {/* Action buttons */}
        <div className="pt-4 border-t border-border flex items-center justify-between w-full gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            title="Soal Sebelumnya (Panah Kiri)"
            className="text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); markReviewLater(currentQ?.id); }}
              className="text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 border-amber-500/30"
              title="Tandai untuk diulang nanti"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ulangi Nanti</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={(e) => { e.stopPropagation(); markMemorized(currentQ?.id); }}
              className="text-xs"
              title="Tandai sudah hafal"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Sudah Hafal</span>
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            title="Soal Berikutnya (Panah Kanan)"
            className="text-xs"
          >
            <span className="hidden sm:inline">Berikutnya</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>

      <p className="text-[11px] text-muted-foreground mt-3 text-center">
        <strong>Tip Belajar:</strong> Ketuk kartu atau tekan <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs border border-border">Spasi</kbd> untuk membalik kartu. Gunakan <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs border border-border">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs border border-border">→</kbd> untuk berpindah soal.
      </p>

      {/* Modal / Dialog Pemilih & Pencari Soal Cepat */}
      {listModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-foreground/40 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setListModalOpen(false); }}
        >
          <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between gap-2 shrink-0">
              <div className="min-w-0">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <List className="h-4 w-4 text-primary" />
                  <span>Daftar & Cari Soal Latihan</span>
                </h3>
                <p className="text-xs text-muted-foreground">Lompat langsung ke soal atau perkakas yang ingin dihafal</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setListModalOpen(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search & Filter */}
            <div className="p-3 border-b border-border bg-muted/20 space-y-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama alat / kata kunci (contoh: gerinda, obeng, 펜치, 안전모)..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: `Semua (${shuffledQuestions.length})` },
                  { id: 'unmemorized', label: 'Belum Hafal' },
                  { id: 'memorized', label: `Hafal (${memorizedIds.size})` },
                  { id: 'review', label: `Ulangi (${reviewLaterIds.size})` },
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilterStatus(f.id)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors shrink-0',
                      filterStatus === f.id
                        ? 'bg-primary text-primary-foreground border-primary font-semibold'
                        : 'bg-card text-muted-foreground border-border hover:text-foreground'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto divide-y divide-border p-2">
              {modalQuestions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">Tidak ada soal yang cocok dengan pencarian.</p>
              ) : (
                modalQuestions.map((q) => {
                  const isCurrent = q.originalIndex === currentIndex;
                  const isMem = memorizedIds.has(q.id);
                  const isRev = reviewLaterIds.has(q.id);
                  const qNameKo = q.title_ko || (q.answer_short_ko ? q.answer_short_ko.replace(/입니다\.?$/, '') : '') || q.question_ko;
                  const qNameId = q.title_id || q.answer_short_id || q.question_id;

                  return (
                    <button
                      key={q.id || q.originalIndex}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(q.originalIndex);
                        setIsFlipped(false);
                        setListModalOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors gap-2.5',
                        isCurrent
                          ? 'bg-primary/10 border border-primary/40'
                          : 'hover:bg-secondary/60'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {q.image_url ? (
                          <img
                            src={getAssetUrl(q.image_url)}
                            alt=""
                            className="h-10 w-10 object-contain rounded-md border border-border/60 bg-secondary/30 shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md border border-border bg-secondary/30 flex items-center justify-center font-mono font-bold text-xs text-muted-foreground shrink-0">
                            #{q.originalIndex + 1}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground font-kr truncate">
                            {qNameKo}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {qNameId}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isMem && <Badge variant="success" className="text-xs py-0 h-4">Hafal</Badge>}
                        {isRev && <Badge variant="warn" className="text-xs py-0 h-4">Ulangi</Badge>}
                        <span className="font-mono text-[11px] text-muted-foreground">#{q.originalIndex + 1}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
