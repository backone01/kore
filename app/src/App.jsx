import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import questionsData from './data/questions.json';
import { 
  Play, Volume2, Eye, EyeOff, 
  Mic, ChevronRight, ChevronLeft, ChevronDown, CheckCircle2,
  Shuffle, X, AlertCircle, Layers,
  RefreshCw, Info, CheckCircle,
  RotateCcw, ArrowRight, Headphones, SlidersHorizontal,
  Turtle, Zap
} from 'lucide-react';
import { getRandomSample, getLogicalMovementSequence } from './utils/shuffle.js';
import { Header } from './components/Header.jsx';
import { CategoryModal } from './components/CategoryModal.jsx';
import { RevisionModal } from './components/RevisionModal.jsx';
import { AudioSettingsModal } from './components/AudioSettingsModal.jsx';
import { CheckRekap } from './components/CheckRekap.jsx';
import { PracticeFlashcard } from './components/PracticeFlashcard.jsx';
import { PracticeQuiz } from './components/PracticeQuiz.jsx';
import { PracticeListening } from './components/PracticeListening.jsx';
import { PracticeOral } from './components/PracticeOral.jsx';

// Lazy loading modul materi besar untuk performa inisial cepat
const StudyGuide = lazy(() => import('./components/StudyGuide.jsx'));
import { getAssetUrl } from './utils/assetHelper.js';
import { MAIN_MODULES, CATEGORY_GROUPS, SUB_CATEGORIES, filterQuestionsByCategory, getParentModuleId, getCategoryMeta, MODULE_COLORS } from './utils/categoryGroups.js';
import { cn } from './utils/cn.js';
import { Badge } from './components/ui/badge.jsx';
import { Button } from './components/ui/button.jsx';
import { Card } from './components/ui/card.jsx';

export default function App() {
  // App Mode: 'study' (Materi & Hafalan) | 'practice' (Latihan Soal) | 'exam' (Simulasi Ujian Resmi)
  // Auto-Save: memulihkan mode terakhir yang dibuka pengguna
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem('kore_mode');
      if (saved && ['study', 'practice', 'exam'].includes(saved)) return saved;
    } catch {}
    return 'study';
  });

  const [practiceSubMode, setPracticeSubMode] = useState(() => {
    try {
      const saved = localStorage.getItem('kore_practice_submode');
      if (saved && ['flashcard', 'quiz', 'listening', 'oral'].includes(saved)) return saved;
    } catch {}
    return 'flashcard';
  });

  // Modal Informasi Regulasi Resmi Revisi HRD Korea
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  // Modal Pengaturan Audio & Karakter Suara TTS
  const [audioModalOpen, setAudioModalOpen] = useState(false);

  // =========================================================================
  // 1. PRACTICE MODE (LATIHAN MANDIRI)
  // =========================================================================
  const [selectedCategory, setSelectedCategory] = useState(() => {
    try {
      const saved = localStorage.getItem('kore_selected_category');
      if (saved && typeof saved === 'string') return saved;
    } catch {}
    return 'all';
  });

  const [currentIndex, setCurrentIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('kore_practice_index');
      const idx = parseInt(saved, 10);
      if (!isNaN(idx) && idx >= 0) return idx;
    } catch {}
    return 0;
  });

  const [showAnswer, setShowAnswer] = useState(false);
  const [showTranslate, setShowTranslate] = useState(true);
  const [blindMode, setBlindMode] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // =========================================================================
  // 2. REAL EXAM SIMULATOR (STANDAR RESMI REVISI HRD KOREA)
  // =========================================================================
  const [examPhase, setExamPhase] = useState('intro'); // 'intro' | 'running' | 'summary' | 'rekap'
  const [examQuestions, setExamQuestions] = useState([]);
  const [examIndex, setExamIndex] = useState(0);
  const [examStepStatus, setExamStepStatus] = useState('asking'); // 'asking' | 'answering'
  const [examTimeLeft, setExamTimeLeft] = useState(7);
  const [examRecordings, setExamRecordings] = useState({});
  const [selfRatings, setSelfRatings] = useState({});

  // Audio References
  const practiceAudioRef = useRef(new Audio());
  const practiceAnswerAudioRef = useRef(new Audio());
  const examAudioPlayerRef = useRef(new Audio());
  const timerRef = useRef(null);

  // MediaRecorder References
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Token guard to completely prevent audio repeat/loop bugs in Exam
  const examStepTokenRef = useRef(0);
  const recentExamToolIdsRef = useRef(new Set());
  const recentExamPicIdsRef = useRef(new Set());

  // Kecepatan Audio (Slow Mode untuk Pemula & Pelafalan Jelas dengan Validasi Aman)
  const [audioSpeed, setAudioSpeed] = useState(() => {
    try {
      const saved = localStorage.getItem('kore_audio_speed');
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && [0.65, 0.8, 1.0].includes(parsed)) {
        return parsed;
      }
      return 0.8;
    } catch {
      return 0.8;
    }
  });

  const toggleAudioSpeed = () => {
    setAudioSpeed(prev => {
      let next = 1.0;
      if (prev >= 0.95) next = 0.8;
      else if (prev >= 0.75) next = 0.65;
      else next = 1.0;
      try { localStorage.setItem('kore_audio_speed', String(next)); } catch {}
      try {
        if (practiceAudioRef.current) practiceAudioRef.current.playbackRate = next;
        if (practiceAnswerAudioRef.current) practiceAnswerAudioRef.current.playbackRate = next;
      } catch {}
      return next;
    });
  };

  // Suara TTS Korea (Pilih Suara Alami / Natural Voice agar tidak kaku/robotik)
  const [koreanVoices, setKoreanVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState(() => {
    try {
      return localStorage.getItem('kore_tts_voice_name') || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const all = window.speechSynthesis.getVoices() || [];
      const ko = all.filter(v => v.lang === 'ko-KR' || v.lang === 'ko_KR' || (v.lang && v.lang.startsWith('ko')));
      // Prioritaskan Suara Natural / Neural di atas
      ko.sort((a, b) => {
        const scoreA = (a.name.includes('Natural') || a.name.includes('Online')) ? 3 : (a.name.includes('Google') || a.name.includes('한국')) ? 2 : 1;
        const scoreB = (b.name.includes('Natural') || b.name.includes('Online')) ? 3 : (b.name.includes('Google') || b.name.includes('한국')) ? 2 : 1;
        return scoreB - scoreA;
      });
      setKoreanVoices(ko);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const getBestKoreanVoice = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    const ko = voices.filter(v => v.lang === 'ko-KR' || v.lang === 'ko_KR' || (v.lang && v.lang.startsWith('ko')));
    if (!ko.length) return null;
    if (selectedVoiceName) {
      const found = ko.find(v => v.name === selectedVoiceName);
      if (found) return found;
    }
    // 1. Natural Neural Voice (Microsoft Edge: SunHi / InJoon)
    const natural = ko.find(v => v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('SunHi') || v.name.includes('InJoon'));
    if (natural) return natural;
    // 2. Google Korean Neural (Chrome)
    const google = ko.find(v => v.name.includes('Google') || v.name.includes('한국'));
    if (google) return google;
    return ko[0];
  }, [selectedVoiceName]);

  const toggleTtsVoice = () => {
    if (!koreanVoices.length) return;
    const currentIdx = koreanVoices.findIndex(v => v.name === (getBestKoreanVoice()?.name || selectedVoiceName));
    const nextIdx = (currentIdx + 1) % koreanVoices.length;
    const nextVoice = koreanVoices[nextIdx];
    if (nextVoice) {
      setSelectedVoiceName(nextVoice.name);
      try { localStorage.setItem('kore_tts_voice_name', nextVoice.name); } catch {}
    }
  };

  const currentVoiceLabel = useMemo(() => {
    const active = getBestKoreanVoice();
    if (!active) return 'Suara Korea';
    if (active.name.includes('SunHi')) return 'SunHi (Alami)';
    if (active.name.includes('InJoon')) return 'InJoon (Pria)';
    if (active.name.includes('Google') || active.name.includes('한국')) return 'Google Neural';
    if (active.name.includes('Heami')) return 'Heami (Standar)';
    return active.name.replace(/(Microsoft|Google|Korean|\(Korea\)|Online|\(Natural\))/gi, '').trim() || 'Korea';
  }, [getBestKoreanVoice]);

  const testTtsVoice = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance("안녕하세요! 한국어 듣기 및 말하기 연습입니다.");
      u.lang = 'ko-KR';
      const voice = getBestKoreanVoice();
      if (voice) u.voice = voice;
      const speedFactor = audioSpeed ?? 0.8;
      u.rate = Math.max(0.5, Math.min(1.4, 0.82 * speedFactor));
      u.pitch = 1.02;
      window.speechSynthesis.speak(u);
    } catch {}
  }, [audioSpeed, getBestKoreanVoice]);

  // Filter format latihan: 'all' (Semua) | 'image' (Hanya Soal Bergambar) | 'text' (Hanya Soal Wawancara/Teks)
  const [practiceTypeFilter, setPracticeTypeFilter] = useState(() => {
    try {
      const saved = localStorage.getItem('kore_practice_type_filter');
      if (saved && ['all', 'image', 'text'].includes(saved)) return saved;
    } catch {}
    return 'all';
  });
  const [practiceShuffleSeed, setPracticeShuffleSeed] = useState(0);

  // =========================================================================
  // AUTO-SAVE PERSISTENCE EFFECTS
  // =========================================================================
  useEffect(() => {
    try { localStorage.setItem('kore_mode', mode); } catch {}
  }, [mode]);

  useEffect(() => {
    try { localStorage.setItem('kore_practice_submode', practiceSubMode); } catch {}
  }, [practiceSubMode]);

  useEffect(() => {
    try { localStorage.setItem('kore_selected_category', selectedCategory); } catch {}
  }, [selectedCategory]);

  useEffect(() => {
    try { localStorage.setItem('kore_practice_index', String(currentIndex)); } catch {}
  }, [currentIndex]);

  useEffect(() => {
    try { localStorage.setItem('kore_practice_type_filter', practiceTypeFilter); } catch {}
  }, [practiceTypeFilter]);

  // =========================================================================
  // SCROLL POSITION PERSISTENCE (Memulihkan Posisi Halaman Terakhir Saat Reload)
  // =========================================================================
  const isRestoringScrollRef = useRef(false);

  // Simpan posisi scroll secara debounced per mode
  useEffect(() => {
    let scrollTimer = null;
    const handleScroll = () => {
      if (isRestoringScrollRef.current) return;
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        try {
          if (window.scrollY >= 0) {
            localStorage.setItem(`kore_scroll_${mode}`, String(Math.round(window.scrollY)));
          }
        } catch {}
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mode]);

  // Pulihkan posisi scroll saat mode aktif dibuka / di-reload
  useEffect(() => {
    isRestoringScrollRef.current = true;
    let savedY = 0;
    try {
      const raw = localStorage.getItem(`kore_scroll_${mode}`);
      if (raw) savedY = parseInt(raw, 10) || 0;
    } catch {}

    // Beri sedikit jeda agar DOM dan layout lazy-loaded (seperti StudyGuide) selesai render
    const t1 = setTimeout(() => {
      if (savedY > 0) {
        window.scrollTo({ top: savedY, behavior: 'instant' });
      }
      const t2 = setTimeout(() => {
        // Cek sekali lagi jika ada pergeseran tinggi layout
        if (savedY > 0 && Math.abs(window.scrollY - savedY) > 50) {
          window.scrollTo({ top: savedY, behavior: 'instant' });
        }
        isRestoringScrollRef.current = false;
      }, 150);
      return () => clearTimeout(t2);
    }, 100);

    return () => {
      clearTimeout(t1);
    };
  }, [mode]);

  // Simpan hasil ujian secara otomatis ke localStorage saat sesi selesai
  useEffect(() => {
    if ((examPhase === 'summary' || examPhase === 'rekap') && examQuestions.length > 0) {
      try {
        const payload = {
          date: Date.now(),
          questions: examQuestions,
          ratings: selfRatings
        };
        localStorage.setItem('kore_last_exam_session', JSON.stringify(payload));
      } catch {}
    }
  }, [examPhase, examQuestions, selfRatings]);

  // Pemeriksaan ketersediaan sesi ujian tersimpan sebelumnya
  const [hasSavedExam, setHasSavedExam] = useState(() => {
    try {
      return !!localStorage.getItem('kore_last_exam_session');
    } catch {
      return false;
    }
  });

  const loadSavedExam = () => {
    try {
      const raw = localStorage.getItem('kore_last_exam_session');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
          setExamQuestions(data.questions);
          setSelfRatings(data.ratings || {});
          setExamPhase('summary');
        }
      }
    } catch {}
  };

  // Filtered practice questions - Mendukung modul utama, sub-kategori, dan filter format
  const filteredQuestions = useMemo(() => {
    let list = filterQuestionsByCategory(questionsData, selectedCategory);
    if (practiceTypeFilter === 'image') {
      list = list.filter(q => !!q.image_url);
    } else if (practiceTypeFilter === 'text') {
      list = list.filter(q => !q.image_url);
    }
    if (practiceShuffleSeed > 0) {
      list = [...list].sort(() => Math.random() - 0.5);
    }
    return list;
  }, [selectedCategory, practiceTypeFilter, practiceShuffleSeed]);

  // Jaga agar currentIndex tidak keluar dari batas saat filter atau kategori berubah
  useEffect(() => {
    if (filteredQuestions.length > 0 && currentIndex >= filteredQuestions.length) {
      setCurrentIndex(0);
    }
  }, [filteredQuestions.length, currentIndex]);

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0] || {};

  // Stop all audio on state change
  const stopAllAudio = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    
    // Stop practice audio
    practiceAudioRef.current.pause();
    practiceAudioRef.current.currentTime = 0;
    practiceAnswerAudioRef.current.pause();
    practiceAnswerAudioRef.current.currentTime = 0;

    // Stop exam audio and detach listeners
    examAudioPlayerRef.current.onended = null;
    examAudioPlayerRef.current.onerror = null;
    examAudioPlayerRef.current.pause();
    examAudioPlayerRef.current.currentTime = 0;

    setIsPlayingAudio(false);
  }, []);

  const speakPracticeTTS = useCallback((text) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsPlayingAudio(false);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ko-KR';
      const voice = getBestKoreanVoice();
      if (voice) u.voice = voice;
      const speedFactor = audioSpeed ?? 0.8;
      u.rate = Math.max(0.5, Math.min(1.4, 0.82 * speedFactor));
      u.pitch = 1.02; // Sedikit dinaikkan agar resonansi lebih luwes & tidak monoton robotik
      setIsPlayingAudio(true);
      u.onend = () => setIsPlayingAudio(false);
      u.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(u);
    } catch {
      setIsPlayingAudio(false);
    }
  }, [audioSpeed, getBestKoreanVoice]);

  useEffect(() => {
    stopAllAudio();
    setShowAnswer(false);
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
  }, [currentIndex, selectedCategory, stopAllAudio]);

  // Practice Audio Play (Mendukung MP3 Native & TTS Fallback dengan Kecepatan Sesuai Preferensi)
  const playPracticeQuestion = () => {
    stopAllAudio();
    let audioSrc = currentQ?.audio_q;
    if (!audioSrc) {
      if (currentQ?.category === 'piktogram') audioSrc = '/audio/examiner_sign_q.mp3';
      else if (currentQ?.category === 'alat_manufaktur' || currentQ?.category === 'alat_klasik') audioSrc = '/audio/examiner_tool_q.mp3';
    }
    if (audioSrc) {
      practiceAudioRef.current.src = getAssetUrl(audioSrc);
      try { practiceAudioRef.current.playbackRate = audioSpeed; } catch {}
      practiceAudioRef.current.onplay = () => setIsPlayingAudio(true);
      practiceAudioRef.current.onended = () => setIsPlayingAudio(false);
      practiceAudioRef.current.onerror = () => {
        if (currentQ?.question_ko) speakPracticeTTS(currentQ.question_ko);
        else setIsPlayingAudio(false);
      };
      practiceAudioRef.current.play().catch(() => {
        if (currentQ?.question_ko) speakPracticeTTS(currentQ.question_ko);
        else setIsPlayingAudio(false);
      });
    } else if (currentQ?.question_ko) {
      speakPracticeTTS(currentQ.question_ko);
    }
  };

  const playPracticeAnswer = (specificText) => {
    stopAllAudio();
    if (specificText && typeof specificText === 'string') {
      if (specificText.includes('.mp3') || specificText.startsWith('/audio/') || specificText.startsWith('http')) {
        playAudioUrl(specificText, currentQ?.answer_short_ko || currentQ?.answer_ko);
        return;
      }
      speakPracticeTTS(specificText);
      return;
    }

    let chosenAudio = currentQ?.audio_a;
    let chosenText = currentQ?.answer_short_ko || currentQ?.answer_ko;
    try {
      const savedOptIdx = localStorage.getItem('kore_oral_opt_idx');
      if (savedOptIdx !== null && currentQ?.answer_options && currentQ.answer_options.length > 0) {
        const opt = currentQ.answer_options[parseInt(savedOptIdx, 10)] || currentQ.answer_options[0];
        if (opt) {
          if (opt.audio) chosenAudio = opt.audio;
          if (opt.answer_ko || opt.ko) chosenText = opt.answer_ko || opt.ko;
        }
      }
    } catch {}

    if (chosenAudio) {
      practiceAnswerAudioRef.current.src = getAssetUrl(chosenAudio);
      try { practiceAnswerAudioRef.current.playbackRate = audioSpeed; } catch {}
      practiceAnswerAudioRef.current.onplay = () => setIsPlayingAudio(true);
      practiceAnswerAudioRef.current.onended = () => setIsPlayingAudio(false);
      practiceAnswerAudioRef.current.onerror = () => {
        if (chosenText) speakPracticeTTS(chosenText);
        else setIsPlayingAudio(false);
      };
      practiceAnswerAudioRef.current.play().catch(() => {
        if (chosenText) speakPracticeTTS(chosenText);
      });
    } else if (chosenText) {
      speakPracticeTTS(chosenText);
    }
  };

  const playAudioUrl = (url, fallbackText) => {
    stopAllAudio();
    if (url) {
      practiceAudioRef.current.src = getAssetUrl(url);
      try { practiceAudioRef.current.playbackRate = audioSpeed; } catch {}
      practiceAudioRef.current.onplay = () => setIsPlayingAudio(true);
      practiceAudioRef.current.onended = () => setIsPlayingAudio(false);
      practiceAudioRef.current.onerror = () => {
        if (fallbackText) speakPracticeTTS(fallbackText);
        else setIsPlayingAudio(false);
      };
      practiceAudioRef.current.play().catch(() => {
        if (fallbackText) speakPracticeTTS(fallbackText);
        else setIsPlayingAudio(false);
      });
    } else if (fallbackText) {
      speakPracticeTTS(fallbackText);
    }
  };

  // Practice Mic Recording: revoke previous blob to prevent leak
  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        if (recordedAudioUrl) {
          URL.revokeObjectURL(recordedAudioUrl);
          setRecordedAudioUrl(null);
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setRecordedAudioUrl(URL.createObjectURL(blob));
          stream.getTracks().forEach(t => t.stop());
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        alert("Akses mikrofon tidak diizinkan. Periksa izin di browser Anda.");
      }
    }
  };

  // Revoke blob URLs on unmount / change
  useEffect(() => {
    return () => {
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
      Object.values(examRecordings).forEach(url => { try { URL.revokeObjectURL(url); } catch {} });
    };
  }, [recordedAudioUrl, examRecordings]);

  // =========================================================================
  // REAL EXAM ENGINE (STANDAR RESMI REVISI HRD KOREA - 50 POIN)
  // =========================================================================
  // Sesuai Peraturan Revisi Terbaru HRD Korea (Revisions to the Skills Test):
  // Total Skor Wawancara: 50 Poin (Meningkat dari 30 Poin)
  // 1. Self-Introduction (Perkenalan Diri Monolog 25 Detik): 2 Poin
  // 2. 5 Work Instructions (5 Perintah Gerak Fisik): 15 Poin (5 Soal @3 Poin)
  // 3. 5 Visual Cards (4 Rambu K3 + 1 Perkakas Manufaktur/Klasik): 5 Poin (5 Soal @1 Poin)
  // 4. 2 Praktik Alat Meja (Fungsi + Perintah Aksi): 2 Poin (2 Soal @1 Poin)
  // 5. 2 In-Depth Safety Questions (2 Pertanyaan K3 Mendalam): 10 Poin (2 Soal @5 Poin)
  // 6. Percakapan & NCS (12 Topik Unik inkl. 1 Sikap Profesional + 1 Hitung Cepat + 1 Konversi/Lisan): 16 Poin (14 Soal)
  // Total: 30 Langkah (1 intro + 5 gerak + 1 transisi + 5 visual + 2 praktik + 2 K3 + 14 NCS) | 50 Poin Penuh
  const startRealExam = () => {
    stopAllAudio();

    // 1. Monolog Perkenalan Diri Mandiri (Self-Introduction: 2 Poin, Berdiri)
    const introItem = {
      id: 'intro_monolog',
      category: 'wawancara',
      category_title: '면접 - 자기소개 (Perkenalan Diri Mandiri)',
      question_ko: '자기소개를 해 보세요.',
      question_romaja: 'Jagi-sogaereul hae boseyo.',
      question_id: 'Silakan perkenalkan diri Anda (Nama, Usia, Asal, dan Tekad Kerja).',
      image_url: null,
      answer_short_ko: '안녕하십니까! 제 이름은 [이름]입니다. 나이는 [나이]살입니다. 인도네시아에서 왔습니다. 한국에서 성실하게 일하겠습니다. 잘 부탁드립니다!',
      answer_short_id: 'Halo! Nama saya [Nama]. Usia [Umur] tahun. Berasal dari Indonesia. Saya akan bekerja dengan rajin di Korea. Mohon bantuannya!',
      answer_full_ko: '안녕하십니까! 제 이름은 [이름]입니다. 나이는 [나이]살입니다. 인도네시아에서 왔습니다. 한국에서 성실하게 일하겠습니다. 잘 부탁드립니다!',
      answer_full_id: 'Halo! Nama saya [Nama]. Usia [Umur] tahun. Berasal dari Indonesia. Saya akan bekerja dengan rajin di Korea. Mohon bantuannya!',
      title_ko: '자기소개를 해 보세요.',
      title_id: 'Silakan perkenalkan diri Anda.',
      level: 'Dasar',
      audio_q: '/audio/examiner_jagisoge.mp3',
      audio_a: null,
      section: 'Tahap 1: Berdiri (1/5)',
      part: 'intro',
      partTitle: 'Perkenalan Diri Mandiri (자기소개)',
      stance: 'standing',
      points: 2,
      duration: 25
    };

    // STANDAR RESMI REVISI HRD KOREA 2026 (TOTAL: 50 POIN / 27 SOAL)
    // Sesuai Dokumen Resmi EPSTOPIK HRDK (Notice on Point-Based Selection System - 2nd Round)
    // & Tabel 배점표:
    // 1. 자기소개 및 태도 (Perkenalan Diri): 1 Soal = 2 Poin (Berdiri)
    // 2. 기초대화 및 행동지시 (Total: 6 Poin):
    //    - 행동지시 (Gerak Fisik Tubuh): 4 Soal (@1 Poin = 4 Poin, Berdiri)
    //    - 기초대화 (Percakapan Dasar): 2 Soal (@1 Poin = 2 Poin, Duduk)
    // 3. 작업도구 및 지시 수행능력 (Total: 20 Poin):
    //    - 작업도구 (Tebak Nama Perkakas): 5 Soal (@1 Poin = 5 Poin, Duduk)
    //    - 작업지시 (Perintah Pelaksanaan Kerja): 5 Soal (@3 Poin = 15 Poin, Duduk)
    // 4. NCS 직업기초능력 (Total: 6 Poin):
    //    - NCS 질문 (Pertanyaan Sikap Kerja NCS): 2 Soal (@3 Poin = 6 Poin, Duduk)
    // 5. 안전의식 (Total: 16 Poin):
    //    - 파트구분 (Tebak Rambu K3 Piktogram): 6 Soal (@1 Poin = 6 Poin, Duduk)
    //    - 안전 심층질문 (Pertanyaan Mendalam K3 KOSHA): 2 Soal (@5 Poin = 10 Poin, Duduk)

    // 2. 4 Instruksi Gerak Fisik (4 Poin, @1 Poin, Berdiri) - Urutan Logis Gerak Tubuh
    const workInstructionsPool = questionsData.filter(q => q.category === 'gerak_fisik');
    const selectedInstructions = getLogicalMovementSequence(workInstructionsPool, 4);

    // 3. 6 Kartu Rambu K3 Piktogram Resmi (6 Poin, @1 Poin, Duduk)
    // 4 Pilar Rambu K3 KOSHA (1 Wajib, 1 Peringatan, 1 Larangan, 1 Evakuasi) + 2 Piktogram Acak
    const pictogramPool = questionsData.filter(q => q.category === 'piktogram');
    const classifyPictogram = (p) => {
      const text = ((p.title_ko || '') + ' ' + (p.title_id || '') + ' ' + (p.question_ko || '') + ' ' + (p.answer_short_ko || '')).toLowerCase();
      if (/금지|마시오|피우지|금연|접근금지|출입\s*금지|사용\s*금지|물체\s*이동\s*금지/.test(text) || /dilarang|jangan/i.test(text)) {
        return 'larangan';
      }
      if (/비상구|비상\s*계단|대피|안내|구급|유도|응급|샤워|구조|비상|슬라이딩\s*도어/.test(text) || /pintu darurat|jalur evakuasi|p3k|evakuasi|darurat/i.test(text)) {
        return 'evakuasi';
      }
      if (/경고|주의|위험|감전|낙하|추락|폭발|독성|고온|저온|방사선|부식|화기|고전압|물체|장애물/.test(text) || /peringatan|bahaya|waspada|tegangan|mudah terbakar/i.test(text)) {
        return 'peringatan';
      }
      return 'wajib';
    };

    // Filter piktogram agar tidak mengulang rambu yang sama persis di sesi ujian berikutnya
    const unpickedPics = pictogramPool.filter(p => !recentExamPicIdsRef.current.has(p.id));
    const effectivePicPool = unpickedPics.length >= 12 ? unpickedPics : pictogramPool;
    if (unpickedPics.length < 12) recentExamPicIdsRef.current.clear();

    const picWajib = effectivePicPool.filter(p => classifyPictogram(p) === 'wajib');
    const picPeringatan = effectivePicPool.filter(p => classifyPictogram(p) === 'peringatan');
    const picLarangan = effectivePicPool.filter(p => classifyPictogram(p) === 'larangan');
    const picEvakuasi = effectivePicPool.filter(p => classifyPictogram(p) === 'evakuasi');

    const selectedPic4 = [
      { ...getRandomSample(picWajib.length ? picWajib : effectivePicPool, 1)[0], visualType: 'Rambu Tindakan Wajib (지시표지)' },
      { ...getRandomSample(picPeringatan.length ? picPeringatan : effectivePicPool, 1)[0], visualType: 'Rambu Peringatan Bahaya (경고표지)' },
      { ...getRandomSample(picLarangan.length ? picLarangan : effectivePicPool, 1)[0], visualType: 'Rambu Larangan (금지표지)' },
      { ...getRandomSample(picEvakuasi.length ? picEvakuasi : effectivePicPool, 1)[0], visualType: 'Rambu Evakuasi & Pertolongan (안내표지)' }
    ];
    const usedPicIds = new Set(selectedPic4.map(p => p.id));
    const extraPics = getRandomSample(effectivePicPool.filter(p => !usedPicIds.has(p.id)), 2).map(p => ({
      ...p,
      visualType: `Rambu Keselamatan K3 (${classifyPictogram(p) === 'larangan' ? '금지' : classifyPictogram(p) === 'peringatan' ? '경고' : classifyPictogram(p) === 'evakuasi' ? '안내' : '지시'}표지)`
    }));
    const selectedPictograms = [...selectedPic4, ...extraPics].sort(() => Math.random() - 0.5);
    selectedPictograms.forEach(p => recentExamPicIdsRef.current.add(p.id));

    // 4. 5 Kartu Perkakas Manufaktur (5 Poin, @1 Poin, Duduk)
    // Diacak segar dari seluruh 90 foto fisik alat manufaktur & klasik resmi,
    // serta menghindari pengulangan alat yang sama pada ujian berturut-turut
    const toolsPool = questionsData.filter(q => (q.category === 'alat_manufaktur' || q.category === 'alat_klasik') && !!q.image_url);
    const unpickedTools = toolsPool.filter(t => !recentExamToolIdsRef.current.has(t.id));
    const poolToSampleTools = unpickedTools.length >= 5 ? unpickedTools : toolsPool;
    if (unpickedTools.length < 5) recentExamToolIdsRef.current.clear();
    
    const selectedTools = getRandomSample(poolToSampleTools, 5);
    selectedTools.forEach(t => recentExamToolIdsRef.current.add(t.id));

    // 5. 5 Perintah Pelaksanaan Kerja Praktik Manufaktur (15 Poin, @3 Poin, Duduk)
    // Sesuai standar resmi HRDK: ini adalah perintah instruksi tindakan lisan (작업지시),
    // BUKAN kartu tebak gambar (image_url diset null agar tidak rancu dengan tebak alat)
    const toolActPool = questionsData.filter(q => q.category === 'praktik_alat' || q.category === 'perintah_alat');
    const toolFuncPool = questionsData.filter(q => q.category === 'fungsi_alat');
    const mfgWorkPool = toolActPool.filter(q => 
      q.id.startsWith('hmv_0') || q.id.startsWith('hmv_10') || q.id.startsWith('tool_act') || !q.id.startsWith('hmv_')
    );
    const pickedWorkInstructions = [
      ...getRandomSample(mfgWorkPool.length ? mfgWorkPool : toolActPool, 3).map(item => ({
        ...item,
        image_url: null, // Peragaan murni tindakan kerja lisan
        visualType: 'Instruksi Tindakan Kerja (작업동작 실기)'
      })),
      ...getRandomSample(toolFuncPool.length ? toolFuncPool : toolActPool, 2).map(item => ({
        ...item,
        // PERTAHANKAN FOTO ALAT ASLI! Pertanyaan fungsi (seperti "이건 언제 사용해요?") membutuhkan gambar alat agar peserta tahu alat yang ditanyakan.
        visualType: item.image_url ? 'Fungsi Perkakas Manufaktur (공구 용도)' : 'Instruksi Kerja (작업지시)'
      }))
    ];

    // 6. 2 Pertanyaan Keselamatan K3 Industri Mendalam KOSHA (10 Poin, @5 Poin, Duduk)
    const safetyPool = questionsData.filter(q => q.category === 'k3_safety');
    const selectedSafety = getRandomSample(safetyPool, 2);

    // 7. 2 Percakapan Dasar Sehari-hari (2 Poin, @1 Poin, Duduk)
    // Mencakup data diri, keluarga, hobi, warna, dan hitungan lisan praktis
    const basicConvPool = questionsData.filter(q => q.category === 'wawancara' || q.category === 'hitungan_lisan');
    const selectedBasicConv = getRandomSample(basicConvPool, 2);

    // 8. 2 Pertanyaan Sikap & Situasi Kerja NCS (6 Poin, @3 Poin, Duduk)
    const ncsPool = questionsData.filter(q => q.category === 'simulasi_hrdk' || q.category === 'wawancara_profesional');
    const selectedNcs = getRandomSample(ncsPool, 2);

    // ==============================================================
    // TRANSISI: DUDUK / BERDIRI (0 Poin, tidak dinilai)
    // ==============================================================
    const makeSitTransition = (id) => ({
      id,
      section: 'Transisi Meja Penguji',
      part: 'transition',
      partTitle: 'Instruksi Penguji: Silakan Duduk (앉으세요)',
      stance: 'sitting',
      points: 0,
      duration: 5,
      question_ko: '앉으세요.',
      question_romaja: 'Anjeuseyo.',
      question_id: 'Instruksi Penguji: Silakan duduk di kursi depan meja penguji.',
      answer_short_ko: '감사합니다.',
      answer_short_id: 'Terima kasih (Membungkuk sopan 15° lalu duduk dengan tegap di kursi).',
      answer_full_ko: '감사합니다.',
      answer_full_id: 'Terima kasih (Membungkuk sopan 15° lalu duduk dengan tegap di kursi).',
      title_ko: '앉으세요.',
      title_id: 'Silakan duduk.',
      audio_q: '/audio/examiner_sit_down.mp3',
      audio_a: null,
      image_url: null
    });

    const examSet = [
      // ==============================================================
      // TAHAP 1: BERDIRI DI DEPAN PENGUJI (standing)
      // ==============================================================
      // 1. Monolog Perkenalan Diri (2 Poin)
      introItem,

      // 2 - 5. 4 Instruksi Kerja Gerak Fisik (4 Poin, @1 Poin)
      ...selectedInstructions.map((item, idx) => ({
        section: `Tahap 1: Gerak Fisik (${idx + 1}/4)`,
        part: 'basic_action',
        partTitle: 'Instruksi Tindakan Gerak Fisik (행동지시)',
        stance: 'standing',
        points: 1,
        duration: 6,
        ...item
      })),

      makeSitTransition('transisi_duduk'),

      // ==============================================================
      // TAHAP 2: DUDUK DI MEJA PENGUJI (sitting)
      // ==============================================================
      // 1. 6 Rambu Keselamatan K3 Piktogram (6 Poin, @1 Poin)
      ...selectedPictograms.map((item, idx) => ({
        section: `Tahap 2: Rambu K3 (${idx + 1}/6)`,
        part: 'safety',
        partTitle: item.visualType || 'Rambu Keselamatan K3 (안전표지)',
        stance: 'sitting',
        points: 1,
        duration: 6,
        ...item
      })),

      // 2. 5 Perkakas Alat Kerja Manufaktur (5 Poin, @1 Poin)
      ...selectedTools.map((item, idx) => ({
        section: `Tahap 2: Perkakas Alat (${idx + 1}/5)`,
        part: 'tools_action',
        partTitle: 'Tebak Perkakas Manufaktur (작업도구)',
        stance: 'sitting',
        points: 1,
        duration: 6,
        ...item
      })),

      // 3. 5 Perintah Pelaksanaan Kerja Praktik Manufaktur (15 Poin, @3 Poin)
      ...pickedWorkInstructions.map((item, idx) => ({
        section: `Tahap 2: Perintah Kerja (${idx + 1}/5)`,
        part: 'tools_action',
        partTitle: 'Perintah Pelaksanaan Kerja (작업지시)',
        stance: 'sitting',
        points: 3,
        duration: 8,
        ...item
      })),

      // 4. 2 Pertanyaan K3 Industri Mendalam KOSHA (10 Poin, @5 Poin)
      ...selectedSafety.map((item, idx) => ({
        section: `Tahap 2: K3 Mendalam (${idx + 1}/2)`,
        part: 'safety',
        partTitle: 'Pertanyaan K3 Mendalam (안전 심층질문)',
        stance: 'sitting',
        points: 5,
        duration: 9,
        ...item
      })),

      // 5. 2 Percakapan Dasar Sehari-hari (2 Poin, @1 Poin)
      ...selectedBasicConv.map((item, idx) => ({
        section: `Tahap 2: Percakapan Dasar (${idx + 1}/2)`,
        part: 'basic_action',
        partTitle: 'Percakapan Dasar Sehari-hari (기초대화)',
        stance: 'sitting',
        points: 1,
        duration: 8,
        ...item
      })),

      // 6. 2 Pertanyaan Sikap & Situasi Kerja NCS (6 Poin, @3 Poin)
      ...selectedNcs.map((item, idx) => ({
        section: `Tahap 2: Sikap Kerja NCS (${idx + 1}/2)`,
        part: 'ncs',
        partTitle: 'Keterampilan Dasar Pekerjaan NCS (직업기초능력)',
        stance: 'sitting',
        points: 3,
        duration: 9,
        ...item
      }))
    ].filter(Boolean);

    setExamQuestions(examSet);
    setExamIndex(0);
    setExamRecordings({});
    // Start unrated: user must self-assess objectively, not inflated 50/50
    setSelfRatings({});
    setExamPhase('running');
    
    // Start step 0
    executeExamStep(0, examSet);
  };

  // Kalkulasi Skor Wawancara Resmi (Total 50 Poin Sesuai Kisi-Kisi HRDK 2026), unrated = 0
  const examScoreSummary = useMemo(() => {
    let totalScore = 0;
    let ratedCount = 0;
    const maxScore = 50;
    const categoryScores = {
      intro: { earned: 0, max: 2, label: '1. Perkenalan Diri & Sikap (자기소개 및 태도)' },
      basic_action: { earned: 0, max: 6, label: '2. Percakapan Dasar & Gerak Tubuh (기초대화 및 행동지시)' },
      tools_action: { earned: 0, max: 20, label: '3. Alat Kerja & Perintah Kerja (작업도구 및 지시 수행능력)' },
      ncs: { earned: 0, max: 6, label: '4. Keterampilan Dasar NCS (NCS 직업기초능력)' },
      safety: { earned: 0, max: 16, label: '5. Kesadaran Keselamatan K3 (안전의식 - Rambu & Mendalam)' },
    };

    examQuestions.forEach((q, idx) => {
      const rating = selfRatings[idx];
      if (rating) ratedCount += 1;
      const isPassed = rating === 'pass';
      const pts = q.points || 0;
      if (isPassed) {
        totalScore += pts;
        if (categoryScores[q.part]) {
          categoryScores[q.part].earned += pts;
        }
      }
    });

    const isPassedExam = totalScore >= 30;
    const isComplete = ratedCount === examQuestions.length && examQuestions.length > 0;
    return { totalScore, maxScore, ratedCount, categoryScores, isPassedExam, isComplete };
  }, [examQuestions, selfRatings]);

  // Dedicated reliable exam step executor
  const executeExamStep = (stepIdx, list) => {
    const q = list[stepIdx];
    if (!q) {
      finishExam();
      return;
    }

    // Increment token so any previous timeouts or callbacks are completely ignored
    examStepTokenRef.current += 1;
    const currentToken = examStepTokenRef.current;

    // Clear previous timer
    if (timerRef.current) clearInterval(timerRef.current);

    setExamIndex(stepIdx);
    setExamStepStatus('asking');
    setExamTimeLeft(q.duration || 7);

    // Stop and detach previous audio listeners
    examAudioPlayerRef.current.onended = null;
    examAudioPlayerRef.current.onerror = null;
    examAudioPlayerRef.current.pause();
    examAudioPlayerRef.current.currentTime = 0;

    let hasAdvancedToAnswer = false;
    const advanceToAnswerPhase = () => {
      if (hasAdvancedToAnswer) return;
      hasAdvancedToAnswer = true;
      if (examStepTokenRef.current !== currentToken) return;
      beginAnswerPhase(stepIdx, q.duration || 7, list, currentToken);
    };

    // Hentikan suara TTS sebelumnya jika ada
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }

    // Transisi tanpa file MP3 (mis. 일어서세요) dilewati tanpa suara agar tidak memutar audio yang salah.
    if (q.part === 'transition' && !q.audio_q) {
      setTimeout(advanceToAnswerPhase, 1500);
      return;
    }

    // Tentukan file audio resmi atau gunakan TTS jika tidak ada MP3
    let audioSrc = null;
    if (q.audio_q) {
      audioSrc = q.audio_q;
    } else if (q.category === 'piktogram') {
      audioSrc = '/audio/examiner_sign_q.mp3';
    } else if (q.category === 'alat_manufaktur' || q.category === 'alat_klasik') {
      audioSrc = '/audio/examiner_tool_q.mp3';
    }

    // Kalkulasi kecepatan pelafalan TTS berdasarkan preferensi audioSpeed
    const examTtsRate = audioSpeed <= 0.65 ? 0.58 : audioSpeed <= 0.8 ? 0.72 : 0.88;

    if (audioSrc) {
      examAudioPlayerRef.current.src = getAssetUrl(audioSrc);
      try { examAudioPlayerRef.current.playbackRate = audioSpeed; } catch {}
      examAudioPlayerRef.current.onended = advanceToAnswerPhase;
      examAudioPlayerRef.current.onerror = () => {
        // Jika file audio benar-benar tidak ditemukan (404), beri jeda waktu lalu lanjut ke fase jawab
        setTimeout(advanceToAnswerPhase, 2000);
      };

      examAudioPlayerRef.current.play().catch((err) => {
        // AbortError wajar terjadi saat transisi cepat antar soal; abaikan agar tidak memicu bug audio ganda
        if (err && err.name === 'AbortError') return;
        // Jika autoplay diblokir kebijakan browser, tetap berikan kesempatan kandidat menjawab
        setTimeout(advanceToAnswerPhase, 2000);
      });
    } else if (q.question_ko && q.part !== 'transition' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const u = new SpeechSynthesisUtterance(q.question_ko);
        u.lang = 'ko-KR';
        u.rate = examTtsRate;
        u.onend = advanceToAnswerPhase;
        u.onerror = advanceToAnswerPhase;
        window.speechSynthesis.speak(u);
      } catch {
        setTimeout(advanceToAnswerPhase, 2000);
      }
    } else {
      // Pertanyaan transisi khusus tanpa file MP3
      setTimeout(advanceToAnswerPhase, 2000);
    }
  };

  const replayExamQuestion = (q) => {
    if (!q) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    if (examAudioPlayerRef.current) {
      examAudioPlayerRef.current.pause();
      examAudioPlayerRef.current.currentTime = 0;
    }

    const examTtsRate = audioSpeed <= 0.65 ? 0.58 : audioSpeed <= 0.8 ? 0.72 : 0.88;

    let audioSrc = null;
    if (q.audio_q) {
      audioSrc = q.audio_q;
    } else if (q.category === 'piktogram') {
      audioSrc = '/audio/examiner_sign_q.mp3';
    } else if (q.category === 'alat_manufaktur' || q.category === 'alat_klasik') {
      audioSrc = '/audio/examiner_tool_q.mp3';
    }

    if (audioSrc) {
      examAudioPlayerRef.current.src = getAssetUrl(audioSrc);
      try { examAudioPlayerRef.current.playbackRate = audioSpeed; } catch {}
      examAudioPlayerRef.current.play().catch(() => {});
    } else if (q.question_ko && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const u = new SpeechSynthesisUtterance(q.question_ko);
        u.lang = 'ko-KR';
        const voice = getBestKoreanVoice();
        if (voice) u.voice = voice;
        u.rate = examTtsRate;
        u.pitch = 1.02;
        window.speechSynthesis.speak(u);
      } catch {}
    }
  };

  const beginAnswerPhase = async (stepIdx, duration, list, stepToken) => {
    if (examStepTokenRef.current !== stepToken) return;

    // Pastikan suara penguji / TTS benar-benar berhenti saat kandidat mulai berbicara
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    if (examAudioPlayerRef.current) {
      examAudioPlayerRef.current.pause();
    }

    setExamStepStatus('answering');
    setExamTimeLeft(duration);

    // Start recording candidate voice
    let stream = null;
    let recorder = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setExamRecordings(prev => {
          const old = prev[stepIdx];
          if (old) try { URL.revokeObjectURL(old); } catch {}
          return { ...prev, [stepIdx]: url };
        });
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
    } catch (e) {
      console.warn("Mikrofon tidak aktif dalam simulasi.");
    }

    let timeLeft = duration;
    timerRef.current = setInterval(() => {
      if (examStepTokenRef.current !== stepToken) {
        clearInterval(timerRef.current);
        if (recorder && recorder.state !== 'inactive') recorder.stop();
        return;
      }

      timeLeft -= 1;
      setExamTimeLeft(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timerRef.current);
        if (recorder && recorder.state !== 'inactive') recorder.stop();

        if (stepIdx + 1 < list.length) {
          executeExamStep(stepIdx + 1, list);
        } else {
          finishExam();
        }
      }
    }, 1000);
  };

  const skipExamTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (examIndex + 1 < examQuestions.length) {
      executeExamStep(examIndex + 1, examQuestions);
    } else {
      finishExam();
    }
  };

  const finishExam = () => {
    stopAllAudio();
    setExamPhase('summary');
  };

  const exitExam = () => {
    stopAllAudio();
    setExamPhase('intro');
  };

  // Kelompok kategori gaya modul Hub: definisi bersama di utils/categoryGroups.js
  // (dipakai juga oleh mode Materi agar pengkategorian konsisten)

  const categoriesList = useMemo(() => {
    const list = [{ id: 'all', label: 'Semua Bank Soal', count: questionsData.length }];
    Object.entries(SUB_CATEGORIES).forEach(([groupKey, subs]) => {
      subs.forEach(sub => {
        if (sub.id !== groupKey) {
          list.push({
            id: sub.id,
            group: groupKey,
            label: sub.label,
            shortLabel: sub.shortLabel,
            count: filterQuestionsByCategory(questionsData, sub.id).length
          });
        }
      });
    });
    return list;
  }, []);

  const practiceProgress = filteredQuestions.length ? ((currentIndex + 1) / filteredQuestions.length) * 100 : 0;
  const examProgress = examQuestions.length ? ((examIndex + 1) / examQuestions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      
      <Header
        mode={mode}
        setMode={setMode}
        stopAllAudio={stopAllAudio}
        practiceProgress={practiceProgress}
        examProgress={examProgress}
        categoriesList={categoriesList}
        selectedCategory={selectedCategory}
        setCategoryModalOpen={setCategoryModalOpen}
        setRevisionModalOpen={setRevisionModalOpen}
        setAudioModalOpen={setAudioModalOpen}
        audioSpeed={audioSpeed}
        examPhase={examPhase}
      />

      <main className={`flex-1 ${mode === 'study' ? 'max-w-4xl' : 'max-w-3xl'} w-full mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-24 sm:pb-10 md:pt-8 flex flex-col justify-start`}>
        
        {/* ================================================================= */}
        {/* 0. MATERI & MODUL HAFALAN POKOK (STUDY GUIDE) */}
        {/* ================================================================= */}
        {mode === 'study' && (
          <Suspense fallback={
            <div className="w-full py-16 flex flex-col items-center justify-center space-y-3 text-muted-foreground animate-pulse">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-xs font-semibold">Memuat Materi & Hafalan Resmi...</p>
            </div>
          }>
            <StudyGuide 
              onStartPracticeCategory={(catId) => {
                setSelectedCategory(catId);
                setCurrentIndex(0);
                setMode('practice');
                stopAllAudio();
              }}
              onOpenRevisionModal={() => setRevisionModalOpen(true)}
            />
          </Suspense>
        )}

        {/* ================================================================= */}
        {/* A. PRACTICE MODE (LATIHAN MANDIRI) */}
        {/* ================================================================= */}
        {mode === 'practice' && (
          <div className="w-full flex flex-col items-center space-y-3 animate-fade-in">
            
            {/* Baris 1: 4 Tab Mode Latihan + Tombol Pemilih Kategori Aktif */}
            {(() => {
              const parentModId = getParentModuleId(selectedCategory);
              const activeMod = MAIN_MODULES.find(m => m.id === selectedCategory || m.id === parentModId);
              const catMeta = getCategoryMeta(selectedCategory);
              const activeCatLabel = activeMod && activeMod.id !== 'all' && selectedCategory !== activeMod.id
                ? `${activeMod.shortLabel} · ${catMeta.shortLabel}`
                : (catMeta.shortLabel || 'Semua Soal');

              return (
                <div className="w-full max-w-xl space-y-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    {/* 4 Tab Mode Latihan */}
                    <div className="grid grid-cols-4 sm:flex p-1 bg-secondary border border-border rounded-lg text-xs font-semibold gap-1">
                      {[
                        { id: 'flashcard', label: 'Flashcard', icon: Layers },
                        { id: 'quiz', label: 'Kuis', icon: CheckCircle },
                        { id: 'listening', label: 'Dengar', icon: Headphones },
                        { id: 'oral', label: 'Lisan', icon: Mic },
                      ].map(tab => {
                        const Icon = tab.icon;
                        const active = practiceSubMode === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => { setPracticeSubMode(tab.id); stopAllAudio(); }}
                            className={cn(
                              'flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-md transition-colors min-h-[44px] sm:min-h-[40px] text-xs font-semibold cursor-pointer',
                              active
                                ? 'bg-card text-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0 hidden sm:inline" />
                            <span className="truncate">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                  </div>

                  {/* Baris Chip Filter Modul Cepat Horizontal (1 Baris) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {MAIN_MODULES.filter(m => m.id === 'all' || m.categories.length > 0).map(mod => {
                      const isSelected = selectedCategory === mod.id || parentModId === mod.id;
                      const count = mod.id === 'all'
                        ? questionsData.length
                        : questionsData.filter(q => mod.categories.includes(q.category)).length;

                      return (
                        <button
                          key={mod.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(mod.id);
                            setCurrentIndex(0);
                            stopAllAudio();
                          }}
                          className={cn(
                            'shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border flex items-center gap-1.5 min-h-[40px] cursor-pointer',
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                              : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary/60'
                          )}
                        >
                          <span>{mod.shortLabel}</span>
                          <span className={cn('text-xs font-mono', isSelected ? 'text-primary-foreground/85' : 'text-muted-foreground')}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Baris 2.5: Sub-kategori Chips jika modul aktif memiliki sub-kategori spesifik */}
                  {(() => {
                    if (!parentModId || parentModId === 'all') return null;
                    const subCats = SUB_CATEGORIES[parentModId] || [];
                    if (subCats.length <= 1) return null;

                    return (
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs bg-secondary/30 px-2 rounded-xl border border-border/50">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
                          Pilihan Kategori:
                        </span>
                        {subCats.map(sub => {
                          const isSubSelected = selectedCategory === sub.id;
                          const count = filterQuestionsByCategory(questionsData, sub.id).length;
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => { setSelectedCategory(sub.id); setCurrentIndex(0); stopAllAudio(); }}
                              className={cn(
                                'px-2.5 py-1 rounded-lg border text-[11px] font-medium shrink-0 transition-all flex items-center gap-1 cursor-pointer',
                                isSubSelected
                                  ? 'bg-foreground text-background border-foreground font-semibold shadow-xs'
                                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary'
                              )}
                            >
                              <span>{sub.shortLabel}</span>
                              <span className={cn('text-xs font-mono', isSubSelected ? 'text-background/80' : 'text-muted-foreground')}>
                                ({count})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* Baris 3: Filter Format Soal (Semua / Bergambar / Lisan Teks) + Tebak Acak */}
                  <div className="flex items-center justify-between gap-2 pt-0.5 text-xs">
                    <div className="grid grid-cols-3 flex-1 sm:flex-none sm:inline-flex items-center p-0.5 bg-secondary/80 border border-border rounded-lg">
                      <button
                        type="button"
                        onClick={() => { setPracticeTypeFilter('all'); setCurrentIndex(0); stopAllAudio(); }}
                        className={cn(
                          'px-2.5 py-2 sm:py-1.5 rounded-md text-xs font-medium transition-colors text-center',
                          practiceTypeFilter === 'all'
                            ? 'bg-card text-foreground shadow-xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        Semua
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPracticeTypeFilter('image'); setCurrentIndex(0); stopAllAudio(); }}
                        className={cn(
                          'px-2.5 py-2 sm:py-1.5 rounded-md text-xs font-medium transition-colors text-center flex items-center gap-1',
                          practiceTypeFilter === 'image'
                            ? 'bg-card text-foreground shadow-xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                        title="Hanya rambu piktogram dan perkakas manufaktur bergambar"
                      >
                        <span>Bergambar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPracticeTypeFilter('text'); setCurrentIndex(0); stopAllAudio(); }}
                        className={cn(
                          'px-2.5 py-2 sm:py-1.5 rounded-md text-xs font-medium transition-colors text-center flex items-center gap-1',
                          practiceTypeFilter === 'text'
                            ? 'bg-card text-foreground shadow-xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                        title="Hanya pertanyaan lisan wawancara, K3, dan gerakan"
                      >
                        <span>Tanya Jawab</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPracticeShuffleSeed(p => p + 1);
                        setCurrentIndex(0);
                        stopAllAudio();
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 min-h-[44px] sm:min-h-[40px] rounded-lg border border-border bg-card hover:bg-secondary/70 text-xs font-semibold text-foreground transition-colors shrink-0"
                      title="Acak urutan soal untuk melatih daya ingat spontan"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-primary" />
                      <span>Tebak Acak</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Sub-mode Content */}
            {practiceSubMode === 'flashcard' && (
              <PracticeFlashcard
                questions={filteredQuestions}
                onPlayAudio={playAudioUrl}
                isPlayingAudio={isPlayingAudio}
                audioSpeed={audioSpeed}
                onToggleAudioSpeed={toggleAudioSpeed}
              />
            )}

            {practiceSubMode === 'quiz' && (
              <PracticeQuiz
                questions={filteredQuestions}
                onPlayAudio={playAudioUrl}
                isPlayingAudio={isPlayingAudio}
              />
            )}

            {practiceSubMode === 'listening' && (
              <PracticeListening
                questions={filteredQuestions}
                onPlayAudio={playAudioUrl}
                isPlayingAudio={isPlayingAudio}
              />
            )}

            {practiceSubMode === 'oral' && (
              <PracticeOral
                questions={filteredQuestions}
                onSelectIndex={setCurrentIndex}
                onPrev={() => setCurrentIndex(p => Math.max(0, p - 1))}
                onNext={() => setCurrentIndex(p => (p + 1 < filteredQuestions.length ? p + 1 : 0))}
                currentQ={currentQ}
                currentIndex={currentIndex}
                total={filteredQuestions.length}
                blindMode={blindMode}
                setBlindMode={setBlindMode}
                showTranslate={showTranslate}
                setShowTranslate={setShowTranslate}
                showAnswer={showAnswer}
                setShowAnswer={setShowAnswer}
                onPlayQuestion={playPracticeQuestion}
                onPlayAnswer={playPracticeAnswer}
                isPlayingAudio={isPlayingAudio}
                isRecording={isRecording}
                onToggleRecording={toggleRecording}
                recordedAudioUrl={recordedAudioUrl}
                audioSpeed={audioSpeed}
                onToggleAudioSpeed={toggleAudioSpeed}
              />
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* B. EXAM MODE (SIMULASI UJIAN RESMI HRD KOREA) */}
        {/* ================================================================= */}
        {mode === 'exam' && (
          <div className="w-full flex flex-col items-center text-center space-y-5 animate-fade-in">
            
            {/* Phase 1: Intro Briefing (Clean, Modern, Immediate Action) */}
            {examPhase === 'intro' && (
              <div className="w-full max-w-xl space-y-4 text-left">
                {/* Hero Card dengan CTA Mulai Ujian di Atas */}
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-xs font-bold">
                        STANDAR HRDK
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-secondary text-muted-foreground font-mono text-xs font-bold">
                        50 POIN
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">Lulus: ≥30 Poin (60%)</span>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                      Simulasi Ujian Wawancara Resmi
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                      27 butir soal terstruktur (28 langkah) dengan audio penguji asli Korea. Waktu menjawab 6–9 detik per butir.
                    </p>
                  </div>

                  {/* Tombol Utama Mulai Ujian: Langsung Terlihat & Mudah Dijangkau */}
                  <div className="pt-1 flex flex-col sm:flex-row items-stretch gap-2.5">
                    <Button 
                      onClick={startRealExam} 
                      size="lg" 
                      className="min-h-[48px] text-sm font-bold flex-1 justify-center shadow-xs cursor-pointer"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      <span>Mulai Ujian Sekarang (27 Soal)</span>
                    </Button>
                    {hasSavedExam && (
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={loadSavedExam}
                        className="min-h-[48px] text-sm font-semibold justify-center cursor-pointer"
                      >
                        <RotateCcw className="h-4 w-4 mr-1.5" />
                        <span>Hasil Terakhir</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* 5 Komponen Ujian (Collapsible Details agar Rapi dan Tidak Menyita Layar) */}
                <details className="group rounded-xl border border-border bg-card px-4 overflow-hidden">
                  <summary className="flex items-center justify-between min-h-[48px] text-sm font-semibold text-foreground cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span>Rincian 5 Komponen Penilaian (50 Poin)</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="divide-y divide-border border-t border-border py-1 text-xs">
                    <div className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">1. Perkenalan Diri (자기소개) · Berdiri</p>
                        <p className="text-muted-foreground text-[11px]">Monolog nama, umur, asal & tekad kerja (25 detik)</p>
                      </div>
                      <span className="font-mono font-bold text-primary shrink-0">2 Poin</span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">2. Percakapan Dasar & Gerak Tubuh</p>
                        <p className="text-muted-foreground text-[11px]">4 gerak refleks berdiri (@1 pt) + 2 tanya jawab dasar (@1 pt)</p>
                      </div>
                      <span className="font-mono font-bold text-primary shrink-0">6 Poin</span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">3. Alat & Perintah Kerja (작업도구)</p>
                        <p className="text-muted-foreground text-[11px]">5 tebak nama (@1 pt) + 5 perintah kerja (@3 pt)</p>
                      </div>
                      <span className="font-mono font-bold text-primary shrink-0">20 Poin</span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">4. Keterampilan Dasar NCS (Pabrik)</p>
                        <p className="text-muted-foreground text-[11px]">Studi kasus barang cacat, lembur, konflik (2 soal @3 pt)</p>
                      </div>
                      <span className="font-mono font-bold text-primary shrink-0">6 Poin</span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">5. Keselamatan K3 (안전의식)</p>
                        <p className="text-muted-foreground text-[11px]">6 rambu piktogram (@1 pt) + 2 soal lisan K3 (@5 pt)</p>
                      </div>
                      <span className="font-mono font-bold text-primary shrink-0">16 Poin</span>
                    </div>
                  </div>
                </details>

                {/* Bar Bawah: Pengaturan Audio & Info Regulasi */}
                <div className="flex items-center justify-between gap-2 px-1 text-xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRevisionModalOpen(true)}
                    className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span>Regulasi Resmi HRDK</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAudioModalOpen(true)}
                    className="h-9 px-3 text-xs font-semibold gap-1.5"
                  >
                    <Headphones className="h-3.5 w-3.5 text-primary" />
                    <span>Suara: {currentVoiceLabel} ({audioSpeed}x)</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Phase 2: Live Exam Terminal */}
            {examPhase === 'running' && (
              <Card className="w-full max-w-xl p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-5">
                
                {/* Stage Header */}
                <div className="flex items-start sm:items-center justify-between pb-3.5 border-b border-border text-left gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                        {examQuestions[examIndex]?.section}
                      </span>
                      <Badge variant="outline" className="text-xs">Bobot: {examQuestions[examIndex]?.points} Poin</Badge>
                      <Badge variant="outline" className="font-mono text-xs">
                        {examQuestions[examIndex]?.stance === 'standing' ? 'BERDIRI' : 'DUDUK'}
                      </Badge>
                    </div>
                    <h3 className="text-xs text-muted-foreground font-medium truncate">
                      Soal No. {examIndex + 1} dari {examQuestions.length} · {examQuestions[examIndex]?.partTitle}
                    </h3>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 flex-nowrap justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAudioModalOpen(true)}
                      className="h-7 px-2 text-[11px] font-semibold text-primary border-primary/30 hover:bg-primary/10 cursor-pointer transition-colors flex items-center gap-1 shrink-0"
                      title="Pengaturan Suara Penguji & Audio"
                    >
                      <Headphones className="h-3 w-3 shrink-0" />
                      <span>{audioSpeed}x</span>
                    </Button>

                    {examStepStatus === 'asking' ? (
                      <Badge variant="outline" className="font-mono text-xs sm:text-xs shrink-0 whitespace-nowrap">PENGUJI BERTANYA</Badge>
                    ) : (
                      <Badge variant="success" className="font-mono text-xs sm:text-xs animate-pulse-dot shrink-0 whitespace-nowrap">WAKTU MENJAWAB</Badge>
                    )}
                  </div>
                </div>

                {/* Transition Instruction Banner */}
                {examQuestions[examIndex]?.transitionNote && (
                  <div className="pb-3 border-b border-border text-xs text-foreground flex items-center justify-between gap-2.5 text-left animate-fade-in">
                    <div className="min-w-0">
                      <p className="font-bold truncate">Arahan Transisi Bilik Ujian</p>
                      <p className="text-muted-foreground text-[11px] truncate">{examQuestions[examIndex].transitionNote}</p>
                    </div>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => {
                        const a = new Audio(getAssetUrl('/audio/examiner_sit_down.mp3'));
                        a.play().catch(() => {});
                      }}
                      className="shrink-0">
                      <Volume2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Dengar</span>
                    </Button>
                  </div>
                )}

                {/* Hero Visual or Audio Prompt (no nested card around image) */}
                <div className="py-4 flex flex-col items-center justify-center min-h-[200px]">
                  {examQuestions[examIndex]?.part === 'transition' ? (
                    <div className="space-y-4 text-center py-2 w-full max-w-sm mx-auto animate-fade-in">
                      <Badge variant="outline" className="mx-auto font-mono">
                        {examQuestions[examIndex]?.stance === 'standing' ? 'BERDIRI' : 'DUDUK'}
                      </Badge>
                      <div className="space-y-1">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground font-kr">
                          {examQuestions[examIndex]?.question_ko}
                        </h2>
                        <p className="text-xs text-muted-foreground font-mono">{examQuestions[examIndex]?.question_romaja}</p>
                        <p className="text-sm font-medium text-primary pt-1">
                          {examQuestions[examIndex]?.question_id}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-border text-xs space-y-1 text-center">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                          Respon Sopan Kandidat
                        </span>
                        <strong className="text-lg font-kr font-bold text-foreground block">
                          &ldquo;{examQuestions[examIndex]?.answer_short_ko}&rdquo;
                        </strong>
                        <span className="text-xs text-muted-foreground block">
                          ({examQuestions[examIndex]?.answer_short_id})
                        </span>
                      </div>
                    </div>
                  ) : examQuestions[examIndex]?.image_url ? (
                    <div className="w-full flex flex-col items-center space-y-3">
                      <img
                        src={getAssetUrl(examQuestions[examIndex].image_url)}
                        alt="Soal Ujian Bergambar"
                        className="max-h-52 sm:max-h-60 w-auto mx-auto object-contain"
                      />
                      <Button variant="outline" size="sm"
                        onClick={() => replayExamQuestion(examQuestions[examIndex])}>
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>Dengar Ulang Suara Penguji</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 text-center">
                      <Button variant="outline" size="lg"
                        onClick={() => replayExamQuestion(examQuestions[examIndex])}
                        title="Putar Ulang Audio Pertanyaan">
                        <Volume2 className="h-5 w-5" />
                        <span>Putar Ulang Pertanyaan</span>
                      </Button>
                    </div>
                  )}

                  {/* Response Timer Bar */}
                  {examStepStatus === 'answering' && (
                    <div className="w-full max-w-sm mt-5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-destructive flex items-center gap-1.5">
                          <Mic className="h-3.5 w-3.5 animate-pulse-dot" /> Sedang Merekam Suara...
                        </span>
                        <span className="text-foreground font-mono">
                          Sisa: {examTimeLeft}s
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="bg-destructive h-full rounded-full transition-all duration-1000 ease-linear"
                          style={{
                            width: `${(examTimeLeft / (examQuestions[examIndex]?.duration || 7)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Skip / Next Footer */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <Button variant="ghost" size="sm" onClick={exitExam}>
                    Batalkan Ujian
                  </Button>

                  <div className="flex items-center gap-2">
                    {examStepStatus === 'asking' && (
                      <Button variant="outline" size="sm"
                        onClick={() => beginAnswerPhase(examIndex, examQuestions[examIndex]?.duration || 7, examQuestions, examStepTokenRef.current)}>
                        <Mic className="h-3.5 w-3.5 text-destructive" />
                        <span>Langsung Jawab</span>
                      </Button>
                    )}

                    <Button size="sm" onClick={skipExamTimer}>
                      <span>{examIndex + 1 === examQuestions.length ? 'Selesai & Lihat Skor' : 'Lanjut'}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

              </Card>
            )}

            {/* Phase 3: Exam Summary (Zero Nested Cards, Natural Page Scroll) */}
            {examPhase === 'summary' && (
              <div className="w-full max-w-2xl space-y-5 text-left">
                
                {/* 1. Ringkasan Skor di atas (1 kartu bersih) */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Badge variant="outline" className="font-mono">LAPORAN HASIL UJIAN</Badge>
                    <span className="text-xs text-muted-foreground font-medium">
                      Dinilai: {examScoreSummary.ratedCount} / {examQuestions.length} Butir
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                        Total Skor Wawancara Anda
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl sm:text-4xl font-bold font-mono text-foreground">
                          {Number(examScoreSummary.totalScore.toFixed(1))}
                        </span>
                        <span className="text-base text-muted-foreground font-bold">/ 50 Poin</span>
                      </div>
                    </div>

                    <div>
                      {examScoreSummary.isPassedExam ? (
                        <Badge variant="success"><CheckCircle className="h-3.5 w-3.5" /> LULUS AMBANG BATAS (≥ 60%)</Badge>
                      ) : (
                        <Badge variant="destructive"><AlertCircle className="h-3.5 w-3.5" /> BELUM MENCAPAI AMBANG BATAS</Badge>
                      )}
                    </div>
                  </div>

                  {/* Rincian per bagian dengan garis pemisah tipis tanpa kotak bertumpuk */}
                  <div className="divide-y divide-border text-xs">
                    {Object.entries(examScoreSummary.categoryScores).map(([key, item]) => (
                      <div key={key} className="py-2 flex items-center justify-between gap-2">
                        <span className="text-muted-foreground font-medium">{item.label}</span>
                        <span className="font-bold text-foreground font-mono">
                          {Number(item.earned.toFixed(1))} / {item.max} Poin
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-border flex items-center justify-between gap-2 flex-wrap">
                    <Button variant="ghost" size="sm" onClick={() => setMode('practice')}>
                      Kembali ke Latihan
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => setExamPhase('rekap')}
                        title="Lanjut ke lembar rekap skor resmi 2026"
                        variant="default">
                        <span>Rekap Skor Resmi</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={startRealExam}>
                        <span>Ulangi Ujian</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 2. Daftar Evaluasi 27 Butir Soal Resmi (1 level divide-y, natural page scroll) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 px-1 flex-wrap">
                    <p className="text-xs text-muted-foreground">
                      Dengarkan kembali rekaman suara Anda per nomor, lalu tandai penilaian mandiri secara objektif:
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="xs"
                        variant="outline"
                        className="h-7 text-[11px] px-2.5 text-primary border-primary/30 hover:bg-primary/10"
                        onClick={() => {
                          const allPass = {};
                          examQuestions.forEach((_, i) => { allPass[i] = 'pass'; });
                          setSelfRatings(allPass);
                        }}
                      >
                        ✓ Tandai Semua Benar
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setSelfRatings({})}
                      >
                        Reset Penilaian
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden text-xs">
                    {examQuestions.map((q, idx) => {
                      const recUrl = examRecordings[idx];
                      const rating = selfRatings[idx];

                      return (
                        <div key={q.id || idx} className="p-4 sm:p-5 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-primary">
                                  #{idx + 1} · {q.section}
                                </span>
                                <Badge variant="outline" className="font-mono">Bobot: {q.points} Poin</Badge>
                              </div>
                              <p className="text-foreground font-bold font-kr text-base">
                                {q.question_ko}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                &ldquo;{q.question_id}&rdquo;
                              </p>
                            </div>

                            {q.image_url && (
                              <img
                                src={getAssetUrl(q.image_url)}
                                alt="Soal"
                                className="w-16 h-16 object-contain shrink-0"
                              />
                            )}
                          </div>

                          {/* Official Answer & Action Guide */}
                          <div className="pt-2.5 border-t border-border/60 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
                                {q.category === 'gerak_fisik' || q.category === 'praktik_alat' || q.category === 'perintah_alat'
                                  ? 'Kunci Respon & Tindakan Fisik'
                                  : 'Kunci Jawaban Resmi'}
                              </span>
                              {(q.category === 'gerak_fisik' || q.category === 'praktik_alat' || q.category === 'perintah_alat') && (
                                <Badge variant="outline" className="text-xs py-0 px-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono">
                                  Peragaan Gerak Fisik
                                </Badge>
                              )}
                            </div>
                            <p className="text-foreground font-bold font-kr text-base leading-snug">
                              {q.answer_short_ko || q.title_ko}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Artinya: {q.answer_short_id || q.title_id}
                            </p>

                            {/* Variasi Jawaban Terstandar Sesuai Materi jika ada */}
                            {q.answer_options && q.answer_options.length > 0 && (
                              <div className="pt-2 mt-1 space-y-1 border-t border-dashed border-border/60">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                                  Variasi Jawaban Terstandar (Sesuai Materi):
                                </span>
                                <div className="space-y-1">
                                    {q.answer_options.map((opt, oIdx) => (
                                      <div key={oIdx} className="text-[11px] p-1.5 rounded bg-secondary/50 border border-border/40 flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                          <span className="font-semibold text-primary">{opt.label}: </span>
                                          <span className="font-kr font-bold text-foreground">{opt.ko || opt.answer_ko} </span>
                                          <span className="text-muted-foreground">({opt.id || opt.answer_id})</span>
                                        </div>
                                        {(opt.audio || q.audio_a) && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              stopAllAudio();
                                              const a = new Audio(getAssetUrl(opt.audio || q.audio_a));
                                              try { a.playbackRate = audioSpeed; } catch {}
                                              a.play().catch(() => {});
                                            }}
                                            className="p-1 rounded hover:bg-primary/20 text-primary cursor-pointer shrink-0 transition-colors"
                                            title="Dengar Suara Opsi Ini"
                                          >
                                            <Volume2 className="h-3.5 w-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                              </div>
                            )}
                          </div>

                          {/* Audio Penguji & Kunci Jawaban vs Rekaman Kandidat */}
                          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-border/60">
                            <div className="flex items-center gap-2 flex-wrap">
                              {q.audio_q && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    stopAllAudio();
                                    const a = new Audio(getAssetUrl(q.audio_q));
                                    a.playbackRate = audioSpeed;
                                    a.play().catch(() => {});
                                  }}
                                  className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                                >
                                  <Volume2 className="h-3 w-3" />
                                  <span>Dengar Soal</span>
                                </Button>
                              )}
                              {q.audio_a && (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    stopAllAudio();
                                    const a = new Audio(getAssetUrl(q.audio_a));
                                    a.playbackRate = audioSpeed;
                                    a.play().catch(() => {});
                                  }}
                                  className="h-7 text-xs gap-1"
                                >
                                  <Volume2 className="h-3 w-3" />
                                  <span>Dengar Kunci</span>
                                </Button>
                              )}
                              {recUrl ? (
                                <div className="flex items-center gap-1.5 ml-1">
                                  <span className="text-[11px] text-muted-foreground font-medium">Rekaman Anda:</span>
                                  <audio src={recUrl} controls className="h-7 w-36 sm:w-44" />
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic text-[11px] ml-1">(Tidak ada rekaman suara)</span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                              <Button 
                                size="sm" 
                                variant={rating === 'pass' ? 'default' : 'outline'}
                                className="h-8 px-2.5 sm:px-3 text-xs"
                                onClick={() => setSelfRatings(prev => ({ ...prev, [idx]: 'pass' }))}
                              >
                                <span>Benar (+{q.points})</span>
                              </Button>
                              <Button 
                                size="sm" 
                                variant={rating === 'fail' ? 'destructive' : 'outline'}
                                className="h-8 px-2.5 sm:px-3 text-xs"
                                onClick={() => setSelfRatings(prev => ({ ...prev, [idx]: 'fail' }))}
                              >
                                <span>Salah (0)</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {examPhase === 'rekap' && (
              <div className="w-full space-y-3">
                <button
                  type="button"
                  onClick={() => setExamPhase('summary')}
                  className="no-print text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  ← Kembali ke Hasil Ujian
                </button>
                <CheckRekap
                  questionsData={questionsData}
                  playAudioUrl={playAudioUrl}
                  stopAllAudio={stopAllAudio}
                  examWawancara={examScoreSummary.totalScore}
                />
              </div>
            )}

          </div>
        )}

      </main>

      {/* =================================================================== */}
      {/* 3. BOTTOM ACTION DOCK (FIXED AT BOTTOM ALA DUOLINGO / APPLE) */}
      {/* =================================================================== */}
      {mode === 'practice' && practiceSubMode === 'oral' && (
        <footer className="w-full bg-card border-t border-border py-3 px-4 sticky bottom-0 z-30">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
            
            <Button variant="outline" size="icon"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(p => p - 1)}
              title="Sebelumnya">
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Button 
                onClick={playPracticeQuestion}
                className="h-10 px-3 sm:px-4 text-xs font-semibold gap-1.5"
                title="Dengarkan suara penguji Korea asli"
              >
                <Play className="h-4 w-4" />
                <span>{isPlayingAudio ? 'Memutar...' : 'Putar Soal'}</span>
              </Button>

              {currentQ?.audio_a && (
                <Button 
                  variant="secondary" 
                  onClick={() => playPracticeAnswer()}
                  className="h-10 px-3 text-xs font-semibold gap-1.5"
                  title="Dengarkan kunci jawaban penutur Korea asli"
                >
                  <Volume2 className="h-4 w-4 text-primary" />
                  <span className="hidden sm:inline">Kunci</span>
                </Button>
              )}

              <Button 
                variant="outline" 
                size="icon"
                onClick={toggleRecording}
                title={isRecording ? 'Selesai Merekam' : 'Rekam Suara Mandiri'}
                className={cn('h-10 w-10', isRecording ? 'bg-destructive text-destructive-foreground border-destructive animate-pulse-dot' : '')}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" size="icon"
              onClick={() => setCurrentIndex(p => (p + 1 < filteredQuestions.length ? p + 1 : 0))}
              title="Berikutnya">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </footer>
      )}

      <CategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categoriesList={categoriesList}
        categoryGroups={CATEGORY_GROUPS}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        setCurrentIndex={setCurrentIndex}
        questionsData={questionsData}
      />
      <RevisionModal open={revisionModalOpen} onClose={() => setRevisionModalOpen(false)} />
      <AudioSettingsModal
        open={audioModalOpen}
        onClose={() => setAudioModalOpen(false)}
        audioSpeed={audioSpeed}
        setAudioSpeed={(val) => {
          setAudioSpeed(val);
          try { localStorage.setItem('kore_audio_speed', String(val)); } catch {}
          if (practiceAudioRef.current) practiceAudioRef.current.playbackRate = val;
          if (practiceAnswerAudioRef.current) practiceAnswerAudioRef.current.playbackRate = val;
          if (examAudioPlayerRef.current) examAudioPlayerRef.current.playbackRate = val;
        }}
        koreanVoices={koreanVoices}
        selectedVoiceName={selectedVoiceName}
        setSelectedVoiceName={(name) => {
          setSelectedVoiceName(name);
          try { localStorage.setItem('kore_tts_voice_name', name); } catch {}
        }}
        onTestVoice={testTtsVoice}
      />

    </div>
  );
}
