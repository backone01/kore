import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import questionsData from './data/questions.json';
import { 
  Play, Volume2, Eye, EyeOff, 
  Mic, ChevronRight, ChevronLeft, CheckCircle2,
  Shuffle, X, AlertCircle, Layers,
  RefreshCw, Info, CheckCircle,
  RotateCcw, ArrowRight, Headphones
} from 'lucide-react';
import { getRandomSample, getLogicalMovementSequence } from './utils/shuffle.js';
import { Header } from './components/Header.jsx';
import { CategoryModal } from './components/CategoryModal.jsx';
import { RevisionModal } from './components/RevisionModal.jsx';
import { StudyGuide } from './components/StudyGuide.jsx';
import { PracticeFlashcard } from './components/PracticeFlashcard.jsx';
import { PracticeQuiz } from './components/PracticeQuiz.jsx';
import { PracticeListening } from './components/PracticeListening.jsx';
import { PracticeOral } from './components/PracticeOral.jsx';
import { getAssetUrl } from './utils/assetHelper.js';

export default function App() {
  // App Mode: 'study' (Materi & Hafalan) | 'practice' (Latihan Soal) | 'exam' (Simulasi Ujian Resmi)
  const [mode, setMode] = useState('study');
  const [practiceSubMode, setPracticeSubMode] = useState('flashcard'); // 'flashcard' | 'quiz' | 'listening' | 'oral'

  // Modal Informasi Regulasi Resmi Revisi HRD Korea
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);

  // =========================================================================
  // 1. PRACTICE MODE (LATIHAN MANDIRI)
  // =========================================================================
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
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
  const [examPhase, setExamPhase] = useState('intro'); // 'intro' | 'running' | 'summary'
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

  // Filtered practice questions
  const filteredQuestions = useMemo(() => {
    if (selectedCategory === 'all') return questionsData;
    return questionsData.filter(q => q.category === selectedCategory);
  }, [selectedCategory]);

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0] || {};

  // Stop all audio on state change
  const stopAllAudio = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
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

  useEffect(() => {
    stopAllAudio();
    setShowAnswer(false);
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
  }, [currentIndex, selectedCategory, stopAllAudio]);

  // Practice Audio Play - PURE NATIVE MP3 ONLY (ZERO TTS)
  const playPracticeQuestion = () => {
    stopAllAudio();
    if (currentQ?.audio_q) {
      practiceAudioRef.current.src = getAssetUrl(currentQ.audio_q);
      practiceAudioRef.current.onplay = () => setIsPlayingAudio(true);
      practiceAudioRef.current.onended = () => setIsPlayingAudio(false);
      practiceAudioRef.current.onerror = () => setIsPlayingAudio(false);
      practiceAudioRef.current.play().catch(() => setIsPlayingAudio(false));
    }
  };

  const playPracticeAnswer = () => {
    stopAllAudio();
    if (currentQ?.audio_a) {
      practiceAnswerAudioRef.current.src = getAssetUrl(currentQ.audio_a);
      practiceAnswerAudioRef.current.play().catch(() => {});
    }
  };

  const playAudioUrl = (url) => {
    stopAllAudio();
    if (!url) return;
    practiceAudioRef.current.src = getAssetUrl(url);
    practiceAudioRef.current.onplay = () => setIsPlayingAudio(true);
    practiceAudioRef.current.onended = () => setIsPlayingAudio(false);
    practiceAudioRef.current.onerror = () => setIsPlayingAudio(false);
    practiceAudioRef.current.play().catch(() => setIsPlayingAudio(false));
  };

  // Practice Mic Recording — revoke previous blob to prevent leak
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
  // 1. Self-Introduction (Perkenalan Diri): 2 Poin (2 Soal: Nama & Umur/Lahir, @1 Poin)
  // 2. 5 Work Instructions (5 Perintah Kerja): 15 Poin (5 Soal, @3 Poin - Ditingkatkan dari 3 ke 5 item)
  // 3. 5 Tools (5 Perkakas Manufaktur): 5 Poin (5 Soal, @1 Poin - Ditingkatkan dari 3 ke 5 item)
  // 4. 2 In-Depth Safety Questions (2 Pertanyaan K3 Mendalam): 10 Poin (2 Soal, @5 Poin - Fitur K3 Baru)
  // 5. Basic Conversation & NCS Vocational Competency (Percakapan & Sikap): 18 Poin
  //    - Dasar Berhitung Cepat Pabrik: 4 Poin
  //    - Sikap Kerja / Respon Masalah Pabrik: 7 Poin
  //    - Motivasi & Komitmen Bekerja di Korea: 7 Poin
  // Total: 17 Soal | 50 Poin Penuh
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
      section: 'Tahap 1: Berdiri (1/6)',
      part: 'intro',
      partTitle: 'Perkenalan Diri Mandiri (자기소개)',
      stance: 'standing',
      points: 2,
      duration: 25
    };

    // 2. 5 Instruksi Gerak Fisik (15 Poin, @3 Poin, Berdiri) - Urutan Logis: Naikkan Dulu Baru Turunkan
    const workInstructionsPool = questionsData.filter(q => q.category === 'gerak_fisik');
    const selectedInstructions = getLogicalMovementSequence(workInstructionsPool, 5);

    // 3. 5 Kartu Visual Meja Resmi HRD Korea (5 Poin, @1 Poin, Duduk)
    // Terdiri dari 4 Pilar Rambu K3 (1 Wajib, 1 Peringatan, 1 Larangan, 1 Evakuasi) + 1 Perkakas Manufaktur
    const toolsPool = questionsData.filter(q => q.category === 'alat_manufaktur');
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

    const picWajib = pictogramPool.filter(p => classifyPictogram(p) === 'wajib');
    const picPeringatan = pictogramPool.filter(p => classifyPictogram(p) === 'peringatan');
    const picLarangan = pictogramPool.filter(p => classifyPictogram(p) === 'larangan');
    const picEvakuasi = pictogramPool.filter(p => classifyPictogram(p) === 'evakuasi');

    const selectedVisualCards = [
      { ...getRandomSample(picWajib, 1)[0], visualType: 'Rambu Tindakan Wajib (지시표지)' },
      { ...getRandomSample(picPeringatan, 1)[0], visualType: 'Rambu Peringatan Bahaya (경고표지)' },
      { ...getRandomSample(picLarangan, 1)[0], visualType: 'Rambu Larangan (금지표지)' },
      { ...getRandomSample(picEvakuasi, 1)[0], visualType: 'Rambu Evakuasi & Pertolongan (안내표지)' },
      { ...getRandomSample(toolsPool, 1)[0], visualType: 'Perkakas Manufaktur (도구 명칭)' }
    ].sort(() => Math.random() - 0.5);

    // 4. Praktik & Fungsi Perkakas Meja (2 Soal, @1 Poin = 2 Poin, Duduk)
    // - 1 Soal Fungsi Alat ("드라이버는 무엇에 사용합니까?")
    // - 1 Soal Perintah Aksi Praktik ("나사를 조이는 도구(드라이버)를 공구함에 넣으세요")
    const toolFuncPool = questionsData.filter(q => q.category === 'fungsi_alat');
    const toolActPool = questionsData.filter(q => q.category === 'perintah_alat');
    const practicalToolQuestions = [
      {
        section: 'Tahap 2: Praktik Alat (1/2)',
        part: 'tools',
        partTitle: 'Fungsi Perkakas Manufaktur (도구의 용도)',
        stance: 'sitting',
        points: 1,
        duration: 8,
        ...(getRandomSample(toolFuncPool, 1)[0] || toolFuncPool[0])
      },
      {
        section: 'Tahap 2: Praktik Alat (2/2)',
        part: 'tools',
        partTitle: 'Perintah Aksi Perkakas Manufaktur (작업 지시 이행)',
        stance: 'sitting',
        points: 1,
        duration: 8,
        ...(getRandomSample(toolActPool, 1)[0] || toolActPool[0])
      }
    ];

    // 5. 2 Pertanyaan K3 Industri Mendalam (10 Poin, @5 Poin, Duduk)
    const safetyPool = questionsData.filter(q => q.category === 'k3_safety');
    const selectedSafety = getRandomSample(safetyPool, 2);

    // 6. Percakapan Dasar & Sikap Kerja NCS Pabrik (Total: 14 Soal = 16 Poin, Duduk)
    // Pengacakan Cerdas: 12 pertanyaan dari rumpun topik unik + 2 hitungan stok pabrik (tanpa duplikat)
    const isConv = q => q.category === 'wawancara' || q.category === 'simulasi_hrdk';
    const allConv = questionsData.filter(isConv);

    // Klasifikasi topik unik agar tidak ada duplikasi materi atau pertanyaan kembar
    const getTopicTag = (q) => {
      const ko = q.question_ko || '';
      if (/시예요|몇 시/.test(ko)) return 'waktu_jam';
      if (/요일/.test(ko)) return 'hari_kalender';
      if (/며칠|몇 월/.test(ko)) return 'tanggal_bulan';
      if (/날씨|계절/.test(ko)) return 'cuaca_musim';
      if (/이름|성함/.test(ko)) return 'nama_identitas';
      if (/나이|연세|몇 살/.test(ko)) return 'umur_usia';
      if (/생일/.test(ko)) return 'tanggal_lahir';
      if (/고향/.test(ko)) return 'kampung_halaman';
      if (/키가|몸무게/.test(ko)) return 'fisik_badan';
      if (/결혼/.test(ko)) return 'status_nikah';
      if (/부모님/.test(ko)) return 'orang_tua';
      if (/가족|식구|누구 누구/.test(ko)) return 'anggota_keluarga';
      if (/형제/.test(ko)) return 'saudara_kandung';
      if (/아이/.test(ko)) return 'anak_keturunan';
      if (/배웠|공부/.test(ko)) return 'belajar_bahasa';
      if (/취미/.test(ko)) return 'hobi_kegemaran';
      if (/운동/.test(ko)) return 'olahraga_kegemaran';
      if (/색깔|음식/.test(ko)) return 'preferensi_warna_makanan';
      if (/타고|얼마나 걸렸/.test(ko)) return 'transportasi_perjalanan';
      if (/동료/.test(ko)) return 'rekan_kerja';
      if (/일이 많|야근|잔업/.test(ko)) return 'tanggung_jawab_lembur';
      if (/불량품/.test(ko)) return 'kasus_cacat_produk';
      if (/실수/.test(ko)) return 'kasus_kesalahan_kerja';
      if (/사고/.test(ko)) return 'kasus_kecelakaan_kerja';
      if (/상사|의견/.test(ko)) return 'hubungan_atasan';
      if (/한국에 왜|고용/.test(ko)) return 'motivasi_alasan_korea';
      if (/기술|다른 사람보다/.test(ko)) return 'keterampilan_keunggulan';
      if (/어떤 일|전에 무슨|요즘/.test(ko)) return 'pengalaman_bidang_kerja';
      return 'lainnya';
    };

    // Kelompokkan pool berdasarkan tag topik unik
    const topicMap = new Map();
    allConv.forEach(q => {
      const t = getTopicTag(q);
      if (!topicMap.has(t)) topicMap.set(t, []);
      topicMap.get(t).push(q);
    });

    // Pilih 12 topik berbeda dari klaster seimbang
    const selectedTopics = [
      ...getRandomSample(['waktu_jam', 'hari_kalender', 'tanggal_bulan', 'cuaca_musim'], 2),
      ...getRandomSample(['umur_usia', 'tanggal_lahir', 'kampung_halaman', 'fisik_badan'], 2),
      ...getRandomSample(['status_nikah', 'orang_tua', 'anggota_keluarga', 'saudara_kandung', 'anak_keturunan'], 2),
      ...getRandomSample(['belajar_bahasa', 'hobi_kegemaran', 'olahraga_kegemaran', 'preferensi_warna_makanan', 'transportasi_perjalanan'], 2),
      ...getRandomSample(['rekan_kerja', 'tanggung_jawab_lembur', 'pengalaman_bidang_kerja', 'hubungan_atasan'], 1),
      ...getRandomSample(['motivasi_alasan_korea', 'keterampilan_keunggulan', 'lainnya'], 1),
      ...getRandomSample(['kasus_cacat_produk', 'kasus_kesalahan_kerja', 'kasus_kecelakaan_kerja'], 2)
    ];

    const selectedConvQuestions = selectedTopics.map(t => {
      const list = topicMap.get(t) || [];
      const item = getRandomSample(list, 1)[0] || list[0];
      const isIssue = t.startsWith('kasus_');
      return {
        part: 'ncs',
        partTitle: 'Percakapan Dasar & Sikap Kerja (NCS)',
        stance: 'sitting',
        duration: isIssue ? 9 : 8,
        points: isIssue ? 1.5 : 1,
        ...item
      };
    });

    // 2 Soal Hitungan Berhitung Cepat Pabrik (@1.5 Poin = 3 Poin)
    const mathPool = questionsData.filter(q => q.category === 'matematika');
    const selectedMath = getRandomSample(mathPool, 2).map((item) => ({
      part: 'ncs',
      partTitle: 'Dasar Berhitung Cepat Pabrik (수리능력 - Stok Gudang)',
      stance: 'sitting',
      duration: 8,
      points: 1.5,
      ...item
    }));

    // Acak urutan ke-14 pertanyaan percakapan & NCS agar alami dan tidak template kaku!
    const randomizedNcsSection = getRandomSample([...selectedConvQuestions, ...selectedMath], 14).map((item, idx) => ({
      ...item,
      section: `Tahap 2: Tanya-Jawab Meja (${idx + 1}/14)`
    }));

    const examSet = [
      // ==============================================================
      // TAHAP 1: BERDIRI DI DEPAN KAMERA (🧍)
      // ==============================================================
      // 1. Monolog Perkenalan Diri (2 Poin)
      introItem,

      // 2 - 6. 5 Instruksi Kerja Gerak Fisik (15 Poin, @3 Poin)
      ...selectedInstructions.map((item, idx) => ({
        section: `Tahap 1: Gerak Fisik (${idx + 1}/5)`,
        part: 'instructions',
        partTitle: 'Instruksi Gerak Fisik (행동 지시)',
        stance: 'standing',
        points: 3,
        duration: 6,
        ...item
      })),

      // ==============================================================
      // TRANSISI RESMI: DUDUK DI MEJA PENGUJI (🪑) - "앉으세요"
      // ==============================================================
      {
        id: 'transisi_duduk',
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
      },

      // ==============================================================
      // TAHAP 2: DUDUK DI MEJA PENGUJI (🪑)
      // ==============================================================
      // 1. 5 Kartu Visual Meja Resmi HRDK: 4 Pilar Rambu K3 + 1 Perkakas (5 Poin, @1 Poin)
      ...selectedVisualCards.map((item, idx) => ({
        section: `Tahap 2: Kartu Visual (${idx + 1}/5)`,
        part: 'tools',
        partTitle: item.visualType || (item.category === 'piktogram' ? 'Tebak Rambu Piktogram K3 (안전표지)' : 'Tebak Perkakas Manufaktur (도구 명칭)'),
        stance: 'sitting',
        points: 1,
        duration: 6,
        ...item
      })),

      // 2. 2 Soal Praktik Perkakas Meja: Fungsi & Perintah Aksi Alat (2 Poin, @1 Poin)
      ...practicalToolQuestions,

      // 3. 2 Pertanyaan K3 Industri Mendalam (10 Poin, @5 Poin)
      ...selectedSafety.map((item, idx) => ({
        section: `Tahap 2: K3 Mendalam (${idx + 1}/2)`,
        part: 'safety',
        partTitle: 'Pertanyaan K3 Industri Mendalam (안전 심층)',
        stance: 'sitting',
        points: 5,
        duration: 9,
        ...item
      })),

      // 4. 14 Soal Tanya-Jawab Acak Percakapan, Sikap Kerja, Masalah & Hitungan (16 Poin)
      ...randomizedNcsSection
    ].filter(Boolean);

    setExamQuestions(examSet);
    setExamIndex(0);
    setExamRecordings({});
    // Start unrated — user must self-assess objectively, not inflated 50/50
    setSelfRatings({});
    setExamPhase('running');
    
    // Start step 0
    executeExamStep(0, examSet);
  };

  // Kalkulasi Skor Wawancara Resmi (Total 50 Poin) — unrated = 0
  const examScoreSummary = useMemo(() => {
    let totalScore = 0;
    let ratedCount = 0;
    const maxScore = 50;
    const categoryScores = {
      intro: { earned: 0, max: 2, label: 'Perkenalan Diri Mandiri' },
      instructions: { earned: 0, max: 15, label: '5 Instruksi Gerak Fisik' },
      tools: { earned: 0, max: 7, label: '5 Kartu Visual & Praktik Alat' },
      safety: { earned: 0, max: 10, label: '2 Pertanyaan K3 Mendalam' },
      ncs: { earned: 0, max: 16, label: 'Percakapan Dasar & Sikap Kerja' },
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

    // Play Question Audio ONLY from real MP3 file!
    const audioSrc = q.audio_q || (q.category === 'piktogram' ? '/audio/examiner_sign_q.mp3' : '/audio/examiner_tool_q.mp3');
    examAudioPlayerRef.current.src = audioSrc;
    examAudioPlayerRef.current.onended = advanceToAnswerPhase;
    examAudioPlayerRef.current.onerror = () => {
      // In worst-case fallback, wait 2 seconds and advance (ZERO looping TTS!)
      setTimeout(advanceToAnswerPhase, 2000);
    };

    examAudioPlayerRef.current.play().catch(() => {
      // If browser blocked play, advance immediately after 2 seconds
      setTimeout(advanceToAnswerPhase, 2000);
    });
  };

  const beginAnswerPhase = async (stepIdx, duration, list, stepToken) => {
    if (examStepTokenRef.current !== stepToken) return;

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

  const categoriesList = [
    { id: 'all', label: 'Semua Bank Soal', count: questionsData.length },
    { id: 'matematika', label: 'Dasar Berhitung Pabrik', count: questionsData.filter(q=>q.category==='matematika').length },
    { id: 'simulasi_hrdk', label: 'Simulasi Resmi HRDK (50 Q&A)', count: questionsData.filter(q=>q.category==='simulasi_hrdk').length },
    { id: 'wawancara', label: 'Wawancara Data Diri & Situasi', count: questionsData.filter(q=>q.category==='wawancara').length },
    { id: 'k3_safety', label: 'K3 & Keselamatan Pabrik', count: questionsData.filter(q=>q.category==='k3_safety').length },
    { id: 'gerak_fisik', label: 'Perintah Gerak Fisik (따라하세요)', count: questionsData.filter(q=>q.category==='gerak_fisik').length },
    { id: 'alat_manufaktur', label: 'Perkakas Manufaktur & APD', count: questionsData.filter(q=>q.category==='alat_manufaktur').length },
    { id: 'piktogram', label: 'Piktogram Keselamatan K3', count: questionsData.filter(q=>q.category==='piktogram').length },
  ];

  const practiceProgress = filteredQuestions.length ? ((currentIndex + 1) / filteredQuestions.length) * 100 : 0;
  const examProgress = examQuestions.length ? ((examIndex + 1) / examQuestions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#191919] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
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
        examPhase={examPhase}
      />

      <main className={`flex-1 ${mode === 'study' ? 'max-w-4xl' : 'max-w-3xl'} w-full mx-auto px-4 md:px-8 py-2 md:py-6 flex flex-col justify-center`}>
        
        {/* ================================================================= */}
        {/* 0. MATERI & MODUL HAFALAN POKOK (STUDY GUIDE) */}
        {/* ================================================================= */}
        {mode === 'study' && (
          <StudyGuide 
            onStartPracticeCategory={(catId) => {
              setSelectedCategory(catId);
              setCurrentIndex(0);
              setMode('practice');
              stopAllAudio();
            }}
          />
        )}

        {/* ================================================================= */}
        {/* A. PRACTICE MODE (LATIHAN MANDIRI) */}
        {/* ================================================================= */}
        {mode === 'practice' && (
          <div className="w-full flex flex-col items-center space-y-4 animate-in fade-in duration-200">
            
            {/* Category Quick Filter Bar */}
            <div className="w-full max-w-3xl px-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none justify-start sm:justify-center">
                {categoriesList.map(cat => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setCurrentIndex(0);
                        stopAllAudio();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border ${
                        isSelected
                          ? 'bg-[#191919] text-white border-[#191919] shadow-2xs'
                          : 'bg-white text-[#787774] border-[#E5E5E3] hover:text-[#191919] hover:bg-[#F9F9F8]'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#EAEAE8] text-[#555]'
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-mode Navigation Selector */}
            <div className="w-full max-w-xl flex items-center justify-center">
              <div className="inline-flex p-1 bg-[#F0F0EE] border border-[#E5E5E3] rounded-xl text-xs font-semibold">
                <button
                  onClick={() => {
                    setPracticeSubMode('flashcard');
                    stopAllAudio();
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                    practiceSubMode === 'flashcard'
                      ? 'bg-white text-[#191919] font-bold shadow-2xs border border-[#E0E0DC]'
                      : 'text-[#787774] hover:text-[#191919]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Flashcard</span>
                </button>

                <button
                  onClick={() => {
                    setPracticeSubMode('quiz');
                    stopAllAudio();
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                    practiceSubMode === 'quiz'
                      ? 'bg-white text-[#191919] font-bold shadow-2xs border border-[#E0E0DC]'
                      : 'text-[#787774] hover:text-[#191919]'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pilihan Ganda</span>
                </button>

                <button
                  onClick={() => {
                    setPracticeSubMode('listening');
                    stopAllAudio();
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                    practiceSubMode === 'listening'
                      ? 'bg-white text-[#191919] font-bold shadow-2xs border border-[#E0E0DC]'
                      : 'text-[#787774] hover:text-[#191919]'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5 text-amber-600" />
                  <span>Latihan Mendengar</span>
                </button>

                <button
                  onClick={() => {
                    setPracticeSubMode('oral');
                    stopAllAudio();
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                    practiceSubMode === 'oral'
                      ? 'bg-white text-[#191919] font-bold shadow-2xs border border-[#E0E0DC]'
                      : 'text-[#787774] hover:text-[#191919]'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5 text-purple-600" />
                  <span>Latihan Lisan</span>
                </button>
              </div>
            </div>

            {/* Sub-mode Content */}
            {practiceSubMode === 'flashcard' && (
              <PracticeFlashcard
                questions={filteredQuestions}
                onPlayAudio={playAudioUrl}
                isPlayingAudio={isPlayingAudio}
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
              />
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* B. EXAM MODE (SIMULASI UJIAN RESMI HRD KOREA) */}
        {/* ================================================================= */}
        {mode === 'exam' && (
          <div className="w-full flex flex-col items-center text-center space-y-6 animate-in fade-in duration-200">
            
            {/* Phase 1: Intro Briefing */}
            {examPhase === 'intro' && (
              <div className="w-full max-w-xl bg-white border border-[#E9E9E7] rounded-3xl p-6 md:p-9 shadow-sm space-y-6 text-left">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
                      Standar Revisi Resmi HRD Korea
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                      Total: 50 Poin
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#191919] tracking-tight">
                    Simulasi Ujian Wawancara Resmi HRD Korea
                  </h2>
                  <p className="text-xs md:text-sm text-[#787774] leading-relaxed">
                    Sesuai perubahan regulasi terbaru HRD Korea (Revisions to the Skills Test), bobot wawancara dinaikkan menjadi 50 poin dengan 21 soal komprehensif:
                  </p>
                </div>

                {/* 5 Komponen Resmi Revisi HRD Korea */}
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-2xl bg-[#FBFBFA] border border-[#E9E9E7] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-[#191919]">1. Perkenalan Diri Mandiri (Self-Introduction)</p>
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">🧍 BERDIRI</span>
                      </div>
                      <p className="text-[11px] text-[#787774]">Monolog 자기소개 (Nama, Usia, Asal, Tekad Bekerja) [25 Detik]</p>
                    </div>
                    <span className="font-mono font-bold px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs">
                      2 Poin
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FBFBFA] border border-[#E9E9E7] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-[#191919]">2. Instruksi Gerak Fisik (Work Instructions)</p>
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">🧍 BERDIRI</span>
                      </div>
                      <p className="text-[11px] text-[#787774]">Arah & gerak refleks fisik perintah kerja (5 Soal, @3 Poin)</p>
                    </div>
                    <span className="font-mono font-bold px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs">
                      15 Poin
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FBFBFA] border border-[#E9E9E7] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-[#191919]">3. Kartu Visual Meja: Alat & Rambu K3</p>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">🪑 DUDUK ("앉으세요")</span>
                      </div>
                      <p className="text-[11px] text-[#787774]">Tebak nama/kegunaan perkakas manufaktur & piktogram K3 (5 Kartu, @1 Poin)</p>
                    </div>
                    <span className="font-mono font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs">
                      5 Poin
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FBFBFA] border border-[#E9E9E7] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-[#191919]">4. Pertanyaan K3 Industri Mendalam</p>
                        <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 text-[9px] font-bold">BARU</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">🪑 DUDUK</span>
                      </div>
                      <p className="text-[11px] text-[#787774]">Safety guard, APD wajib, & tanggap bahaya darurat (2 Soal, @5 Poin)</p>
                    </div>
                    <span className="font-mono font-bold px-2.5 py-1 rounded-xl bg-red-50 text-red-700 text-xs">
                      10 Poin
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FBFBFA] border border-[#E9E9E7] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-[#191919]">5. Percakapan Dasar & Sikap Kerja NCS</p>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">🪑 DUDUK</span>
                      </div>
                      <p className="text-[11px] text-[#787774]">Waktu/pribadi, hitung cepat gudang, situasi kerja & motivasi (8 Soal)</p>
                    </div>
                    <span className="font-mono font-bold px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 text-xs">
                      18 Poin
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span>Ambang Batas Kelulusan:</span>
                    <span className="text-emerald-700 font-extrabold">Minimal 30 / 50 Poin (60%)</span>
                  </div>
                  <p className="text-amber-800 text-[11px]">
                    Ujian berlangsung otomatis dengan rekaman MP3 penguji asli dan batas waktu bicara 6–9 detik per nomor.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    onClick={() => setRevisionModalOpen(true)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Info className="w-3.5 h-3.5" /> Pelajari Detail Regulasi Resmi HRDK
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setMode('practice')}
                      className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#787774] hover:text-[#191919]"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={startRealExam}
                      className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm shadow-blue-500/25 transition-all active:scale-98"
                    >
                      Mulai Simulasi (21 Soal)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Phase 2: Live Exam Terminal */}
            {examPhase === 'running' && (
              <div className="w-full max-w-xl bg-white border border-[#E9E9E7] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#EFEFED] text-left">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                        {examQuestions[examIndex]?.section}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                        Bobot: {examQuestions[examIndex]?.points} Poin
                      </span>
                      {examQuestions[examIndex]?.stance === 'standing' ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                          🧍 Posisi: Berdiri
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          🪑 Posisi: Duduk di Meja
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs text-[#787774] font-medium">
                      Soal No. {examIndex + 1} dari {examQuestions.length} • {examQuestions[examIndex]?.partTitle}
                    </h3>
                  </div>

                  <div>
                    {examStepStatus === 'asking' ? (
                      <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold">
                        Penguji Bertanya...
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold animate-pulse">
                        Waktu Menjawab!
                      </span>
                    )}
                  </div>
                </div>

                {/* Transition Instruction Banner (e.g. 앉으세요) */}
                {examQuestions[examIndex]?.transitionNote && (
                  <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200 text-xs text-blue-900 font-semibold flex items-center justify-between gap-2.5 text-left animate-in slide-in-from-top duration-200">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🪑</span>
                      <div>
                        <p className="font-bold text-blue-950">Arahan Transisi Bilik Ujian:</p>
                        <p className="text-blue-800 text-[11px] font-medium">{examQuestions[examIndex].transitionNote}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const a = new Audio(getAssetUrl('/audio/examiner_sit_down.mp3'));
                        a.play().catch(() => {});
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-900 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Dengar "앉으세요"
                    </button>
                  </div>
                )}

                {/* Hero Visual or Audio Prompt */}
                <div className="py-6 flex flex-col items-center justify-center min-h-[220px]">
                  {examQuestions[examIndex]?.part === 'transition' ? (
                    <div className="space-y-4 text-center py-4 w-full max-w-sm mx-auto animate-fade-in">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
                        <span className="text-3xl">🪑</span>
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-black text-[#191919] font-kr">
                          앉으세요.
                        </h2>
                        <p className="text-xs text-[#787774] font-mono mt-0.5">Anjeuseyo.</p>
                        <p className="text-xs font-bold text-blue-800 mt-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl inline-block">
                          Instruksi Penguji: Silakan duduk di depan meja penguji
                        </p>
                      </div>
                      <div className="p-3.5 bg-[#FBFBFA] border border-[#E5E5E3] rounded-xl text-xs space-y-1">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                          Respon Sopan Kandidat:
                        </span>
                        <strong className="text-lg font-kr font-bold text-emerald-900 block">"감사합니다."</strong>
                        <span className="text-[11px] text-[#787774] block">(Membungkuk sopan 15° lalu duduk dengan tegap)</span>
                      </div>
                    </div>
                  ) : examQuestions[examIndex]?.image_url ? (
                    <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E9E9E7] p-4 shadow-xs">
                      <img
                        src={getAssetUrl(examQuestions[examIndex].image_url)}
                        alt="Soal Ujian Bergambar"
                        className="max-h-60 w-auto mx-auto object-contain"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-[#EFEFED] flex items-center justify-center mx-auto text-blue-600">
                        <Volume2 className="w-8 h-8" />
                      </div>
                      <p className="text-xs text-[#787774] font-medium max-w-xs">
                        Dengarkan pertanyaan penguji dengan cermat dan jawab langsung secara lisan.
                      </p>
                    </div>
                  )}

                  {/* Response Timer Bar */}
                  {examStepStatus === 'answering' && (
                    <div className="w-full max-w-sm mt-6 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-red-600 flex items-center gap-1.5">
                          <Mic className="w-3.5 h-3.5 animate-pulse" /> Sedang Merekam Suara...
                        </span>
                        <span className="text-[#191919] font-mono">
                          Sisa: {examTimeLeft}s
                        </span>
                      </div>
                      <div className="w-full bg-[#EFEFED] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-red-500 h-full rounded-full transition-all duration-1000 ease-linear"
                          style={{
                            width: `${(examTimeLeft / (examQuestions[examIndex]?.duration || 7)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Skip / Next Footer */}
                <div className="pt-3 border-t border-[#EFEFED] flex items-center justify-between">
                  <button
                    onClick={exitExam}
                    className="text-xs text-[#787774] hover:text-[#191919]"
                  >
                    Batalkan Ujian
                  </button>

                  <div className="flex items-center gap-2">
                    {examStepStatus === 'asking' && (
                      <button
                        onClick={() => beginAnswerPhase(examIndex, examQuestions[examIndex]?.duration || 7, examQuestions, examStepTokenRef.current)}
                        className="px-3.5 py-2 rounded-xl bg-[#FBFBFA] hover:bg-[#EFEFED] border border-[#E9E9E7] text-[#37352F] text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Mic className="w-3.5 h-3.5 text-red-600" /> Langsung Jawab
                      </button>
                    )}

                    <button
                      onClick={skipExamTimer}
                      className="px-4 py-2 rounded-xl bg-[#191919] hover:bg-[#333] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      {examIndex + 1 === examQuestions.length ? 'Selesai & Lihat Skor' : 'Lanjut ke Soal Berikutnya'} <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* Phase 3: Exam Summary */}
            {examPhase === 'summary' && (
              <div className="w-full max-w-2xl bg-white border border-[#E9E9E7] rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left">
                
                {/* Official Scorecard Header */}
                <div className="border-b border-[#EFEFED] pb-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider">
                      Laporan Hasil Ujian Wawancara (Standar Revisi HRD Korea)
                    </span>
                    <span className="text-xs text-[#787774] font-medium">{examQuestions.length} Butir Ujian Selesai</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FBFBFA] border border-[#E9E9E7]">
                    <div>
                      <span className="text-xs text-[#787774] uppercase tracking-wider font-semibold">
                        Total Skor Wawancara Anda:
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl sm:text-4xl font-black text-[#191919]">
                          {Number(examScoreSummary.totalScore.toFixed(1))}
                        </span>
                        <span className="text-base text-[#787774] font-bold">/ 50 Poin</span>
                      </div>
                      <div className="mt-2">
                        {examScoreSummary.isPassedExam ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                            <CheckCircle className="w-3.5 h-3.5" /> LULUS AMBANG BATAS WAWANCARA (≥ 60%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
                            <AlertCircle className="w-3.5 h-3.5" /> BELUM MENCAPAI AMBANG BATAS (Min. 30 Poin)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Breakdown Scores Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] sm:min-w-[240px]">
                      <div className="p-2 rounded-xl bg-white border border-[#E9E9E7]">
                        <span className="text-[#787774] block">Perkenalan Diri:</span>
                        <span className="font-bold text-[#191919] font-mono">
                          {examScoreSummary.categoryScores.intro.earned} / {examScoreSummary.categoryScores.intro.max} Poin
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#E9E9E7]">
                        <span className="text-[#787774] block">5 Instruksi Kerja:</span>
                        <span className="font-bold text-[#191919] font-mono">
                          {examScoreSummary.categoryScores.instructions.earned} / {examScoreSummary.categoryScores.instructions.max} Poin
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#E9E9E7]">
                        <span className="text-[#787774] block">5 Perkakas:</span>
                        <span className="font-bold text-[#191919] font-mono">
                          {examScoreSummary.categoryScores.tools.earned} / {examScoreSummary.categoryScores.tools.max} Poin
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#E9E9E7]">
                        <span className="text-[#787774] block">2 Soal K3 Mendalam:</span>
                        <span className="font-bold text-[#191919] font-mono">
                          {examScoreSummary.categoryScores.safety.earned} / {examScoreSummary.categoryScores.safety.max} Poin
                        </span>
                      </div>
                      <div className="col-span-2 p-2 rounded-xl bg-white border border-[#E9E9E7] flex items-center justify-between">
                        <span className="text-[#787774]">Sikap Kerja & NCS:</span>
                        <span className="font-bold text-[#191919] font-mono">
                          {examScoreSummary.categoryScores.ncs.earned} / {examScoreSummary.categoryScores.ncs.max} Poin
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#787774]">
                    Dengarkan kembali rekaman suara Anda per nomor. Klik tombol status untuk menyesuaikan penilaian mandiri secara objektif:
                  </p>
                </div>

                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                  {examQuestions.map((q, idx) => {
                    const recUrl = examRecordings[idx];
                    const rating = selfRatings[idx];

                    return (
                      <div key={q.id || idx} className="p-4 rounded-2xl bg-[#FBFBFA] border border-[#E9E9E7] space-y-3 text-xs">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-blue-600">
                                {q.section}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                                Bobot: {q.points} Poin
                              </span>
                            </div>
                            <p className="text-[#191919] font-bold font-kr text-base mt-1">
                              {q.question_ko}
                            </p>
                            <p className="text-[#787774] text-xs italic">
                              "{q.question_id}"
                            </p>
                          </div>

                          {q.image_url && (
                            <div className="w-16 h-16 bg-white p-1 rounded-xl border border-[#E9E9E7] flex-shrink-0">
                              <img src={getAssetUrl(q.image_url)} alt="Thumbnail" className="w-full h-full object-contain" />
                            </div>
                          )}
                        </div>

                        {/* Official Answer */}
                        <div className="p-3 rounded-xl bg-white border border-[#E9E9E7] space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                            Kunci Jawaban Resmi:
                          </span>
                          <p className="text-[#191919] font-bold font-kr text-base">
                            {q.answer_short_ko || q.title_ko}
                          </p>
                          <p className="text-[#787774] text-xs">
                            Artinya: {q.answer_short_id || q.title_id}
                          </p>
                        </div>

                        {/* Candidate Audio & Rating */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EFEFED]">
                          <div className="flex items-center gap-2">
                            <span className="text-[#787774] font-medium">Rekaman Suara Anda:</span>
                            {recUrl ? (
                              <audio src={recUrl} controls className="h-7 w-44" />
                            ) : (
                              <span className="text-[#787774] italic">Tidak ada rekaman</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelfRatings(prev => ({ ...prev, [idx]: 'pass' }))}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                                rating === 'pass'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white text-[#787774] border border-[#E9E9E7]'
                              }`}
                            >
                              Benar (+{q.points} Poin)
                            </button>
                            <button
                              onClick={() => setSelfRatings(prev => ({ ...prev, [idx]: 'fail' }))}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                                rating === 'fail'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-white text-[#787774] border border-[#E9E9E7]'
                              }`}
                            >
                              Salah (0 Poin)
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-[#EFEFED] flex items-center justify-between">
                  <button
                    onClick={() => setMode('practice')}
                    className="text-xs font-semibold text-[#787774] hover:text-[#191919]"
                  >
                    Kembali ke Latihan
                  </button>
                  <button
                    onClick={startRealExam}
                    className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Ulangi Ujian (Paket Acak Baru)
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* =================================================================== */}
      {/* 3. BOTTOM ACTION DOCK (FIXED AT BOTTOM ALA DUOLINGO / APPLE) */}
      {/* =================================================================== */}
      {mode === 'practice' && practiceSubMode === 'oral' && (
        <footer className="w-full bg-white border-t border-[#E9E9E7] py-4 px-4 sticky bottom-0 z-30 shadow-xs">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
            
            {/* Tombol Sebelumnya */}
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(p => p - 1)}
              className="p-3.5 rounded-2xl border border-[#E9E9E7] hover:bg-[#FBFBFA] text-[#37352F] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Tombol Tengah: Audio Soal + Rekam Suara */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={playPracticeQuestion}
                className="px-5 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-blue-500/25 transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isPlayingAudio ? 'Memutar...' : 'Putar Audio Soal'}</span>
              </button>

              <button
                onClick={toggleRecording}
                className={`p-3.5 rounded-2xl border transition-all active:scale-95 ${
                  isRecording
                    ? 'bg-red-600 text-white border-red-600 animate-pulse'
                    : 'bg-white border-[#E9E9E7] hover:bg-red-50 text-red-600'
                }`}
                title={isRecording ? 'Selesai Merekam' : 'Rekam Suara Mandiri'}
              >
                <Mic className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  const rand = Math.floor(Math.random() * filteredQuestions.length);
                  setCurrentIndex(rand);
                }}
                className="p-3.5 rounded-2xl border border-[#E9E9E7] hover:bg-[#FBFBFA] text-[#787774] transition-all"
                title="Soal Acak"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>

            {/* Tombol Selanjutnya */}
            <button
              disabled={currentIndex >= filteredQuestions.length - 1}
              onClick={() => setCurrentIndex(p => p + 1)}
              className="p-3.5 rounded-2xl bg-[#191919] hover:bg-[#333] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              title="Selanjutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

          </div>
        </footer>
      )}

      <CategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categoriesList={categoriesList}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        setCurrentIndex={setCurrentIndex}
      />
      <RevisionModal open={revisionModalOpen} onClose={() => setRevisionModalOpen(false)} />

    </div>
  );
}
