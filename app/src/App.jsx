import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import questionsData from './data/questions.json';
import { 
  Play, Volume2, Eye, EyeOff, 
  Mic, ChevronRight, ChevronLeft, CheckCircle2,
  Shuffle, X, AlertCircle, Layers,
  RefreshCw, Info, CheckCircle,
  RotateCcw, ArrowRight, Headphones, SlidersHorizontal
} from 'lucide-react';
import { getRandomSample, getLogicalMovementSequence } from './utils/shuffle.js';
import { Header } from './components/Header.jsx';
import { CategoryModal } from './components/CategoryModal.jsx';
import { RevisionModal } from './components/RevisionModal.jsx';
import { StudyGuide } from './components/StudyGuide.jsx';
import { CheckRekap } from './components/CheckRekap.jsx';
import { PracticeFlashcard } from './components/PracticeFlashcard.jsx';
import { PracticeQuiz } from './components/PracticeQuiz.jsx';
import { PracticeListening } from './components/PracticeListening.jsx';
import { PracticeOral } from './components/PracticeOral.jsx';
import { getAssetUrl } from './utils/assetHelper.js';
import { MAIN_MODULES, CATEGORY_GROUPS, filterQuestionsByCategory, MODULE_COLORS } from './utils/categoryGroups.js';
import { cn } from './utils/cn.js';
import { Badge } from './components/ui/badge.jsx';
import { Button } from './components/ui/button.jsx';
import { Card } from './components/ui/card.jsx';

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

  // Filtered practice questions - Mendukung modul utama maupun sub-kategori spesifik
  const filteredQuestions = useMemo(() => {
    return filterQuestionsByCategory(questionsData, selectedCategory);
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
    const toolsPool = questionsData.filter(q => q.category === 'alat_manufaktur' || q.category === 'alat_klasik');
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
    const toolActPool = questionsData.filter(q => q.category === 'praktik_alat' || q.category === 'perintah_alat');
    const toolActFallback = toolActPool.length > 0 ? toolActPool : toolFuncPool;
    // Peta nama alat -> foto (dari 90 kartu nama alat) agar soal fungsi/praktik
    // tekstual tetap menampilkan foto alatnya seperti di meja ujian asli.
    const toolPhotoByName = {};
    questionsData
      .filter(q => (q.category === 'alat_manufaktur' || q.category === 'alat_klasik') && q.image_url)
      .forEach(q => {
        const m = ((q.answer_short_ko || '').trim()).match(/^(.+?)입니다\.?$/);
        const name = (m ? m[1] : (q.title_ko || '').trim());
        if (name && !toolPhotoByName[name]) toolPhotoByName[name] = q.image_url;
      });
    const norm = (s) => (s || '').replace(/\s+/g, '');
    const photoByFlat = {};
    Object.entries(toolPhotoByName).forEach(([name, url]) => { photoByFlat[norm(name)] = url; });
    const normNames = Object.keys(toolPhotoByName).map(n => ({ raw: n, flat: norm(n) })).sort((a, b) => b.flat.length - a.flat.length);
    const attachToolPhoto = (item) => {
      if (!item || item.image_url) return item;
      const ko = item.question_ko || '';
      const subjMatch = ko.match(/^(.+?)[은는] (무엇에 사용합니까|어디에 쓰는 도구입니까)/);
      let hit = (subjMatch && (toolPhotoByName[subjMatch[1]] || photoByFlat[norm(subjMatch[1])])) || null;
      if (!hit) {
        const haystack = `${ko} ${item.answer_short_ko || ''} ${item.answer_full_ko || ''}`;
        const flatHay = norm(haystack);
        const found = normNames.find(n => n.flat && (haystack.includes(n.raw) || flatHay.includes(n.flat)));
        if (found) hit = toolPhotoByName[found.raw];
      }
      return hit ? { ...item, image_url: hit } : item;
    };
    const practicalToolQuestions = [
      {
        section: 'Tahap 2: Praktik Alat (1/2)',
        part: 'tools',
        partTitle: 'Fungsi Perkakas Manufaktur (도구의 용도)',
        stance: 'sitting',
        points: 1,
        duration: 8,
        ...attachToolPhoto(getRandomSample(toolFuncPool, 1)[0] || toolFuncPool[0])
      },
      {
        section: 'Tahap 2: Praktik Alat (2/2)',
        part: 'tools',
        partTitle: 'Perintah Aksi Perkakas Manufaktur (작업 지시 이행)',
        stance: 'sitting',
        points: 1,
        duration: 8,
        ...attachToolPhoto(getRandomSample(toolActFallback, 1)[0] || toolActFallback[0])
      }
    ];

    // 5. 2 Pertanyaan K3 Industri Mendalam (10 Poin, @5 Poin, Duduk)
    const safetyPool = questionsData.filter(q => q.category === 'k3_safety');
    const selectedSafety = getRandomSample(safetyPool, 2);

    // 6. Percakapan Dasar & Sikap Kerja NCS Pabrik (Total: 14 Soal = 16 Poin, Duduk)
    // Pengacakan Cerdas: 12 pertanyaan dari rumpun topik unik + 2 hitungan stok pabrik (tanpa duplikat)
    const isConv = q => q.category === 'wawancara' || q.category === 'simulasi_hrdk' || q.category === 'wawancara_profesional';
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

    // Jaminan: minimal 1 soal Sikap Kerja Profesional (wawancara_profesional) di tiap paket.
    // Jika belum ada, ganti slot fleksibel (lainnya/motivasi/keunggulan, @1 Poin) dengan 1 soal profesional.
    const profPool = questionsData.filter(q => q.category === 'wawancara_profesional');
    const usedConvIds = new Set(selectedConvQuestions.map(q => q && q.id));
    const hasProf = selectedConvQuestions.some(q => q && q.category === 'wawancara_profesional');
    if (!hasProf && profPool.length) {
      const profPick = getRandomSample(profPool.filter(q => !usedConvIds.has(q.id)), 1)[0] || getRandomSample(profPool, 1)[0];
      const replaceIdx = selectedTopics.findIndex(t => t === 'lainnya' || t === 'motivasi_alasan_korea' || t === 'keterampilan_keunggulan');
      if (profPick && replaceIdx >= 0) {
        selectedConvQuestions[replaceIdx] = {
          part: 'ncs',
          partTitle: 'Sikap Kerja Profesional (NCS)',
          stance: 'sitting',
          duration: 8,
          points: 1,
          ...profPick
        };
      }
    }

    // 2 Soal Hitungan (@1.5 Poin = 3 Poin): 1 Berhitung Cepat Pabrik + 1 Konversi Satuan/Hitungan Lisan
    // Slot kedua dijamin dari konversi_satuan/hitungan_lisan agar semua materi hitungan masuk tiap paket
    const mathPool = questionsData.filter(q => q.category === 'matematika');
    const convertPool = questionsData.filter(q => q.category === 'konversi_satuan' || q.category === 'hitungan_lisan');
    const selectedMath = [
      ...getRandomSample(mathPool, 1),
      ...getRandomSample(convertPool.length ? convertPool : mathPool, 1)
    ].map((item) => ({
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

    // (Transisi berdiri tidak dipakai: blok berdiri dimainkan sekaligus di depan
    // agar alur masuk akal: berdiri, gerak, lalu duduk sekali sampai selesai.)

    const examSet = [
      // ==============================================================
      // TAHAP 1: BERDIRI DI DEPAN KAMERA (standing)
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

      makeSitTransition('transisi_duduk'),

      // ==============================================================
      // TAHAP 2: DUDUK DI MEJA PENGUJI (sitting)
      // ==============================================================
      // 1. 5 Kartu Visual Meja Resmi HRDK: 4 Pilar Rambu K3 + 1 Perkakas (5 Poin, @1 Poin)
      ...selectedVisualCards.map((item, idx) => ({
        section: `Tahap 2: Kartu Visual (${idx + 1}/5)`,
        part: 'tools',
        partTitle: item.visualType || (item.category === 'piktogram' ? 'Tebak Rambu Piktogram K3 (안전표지)' : item.category === 'alat_klasik' ? 'Tebak Perkakas Klasik (도구 명칭)' : 'Tebak Perkakas Manufaktur (도구 명칭)'),
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
    // Start unrated: user must self-assess objectively, not inflated 50/50
    setSelfRatings({});
    setExamPhase('running');
    
    // Start step 0
    executeExamStep(0, examSet);
  };

  // Kalkulasi Skor Wawancara Resmi (Total 50 Poin), unrated = 0
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
    // Transisi tanpa file MP3 (mis. 일어서세요) dilewati tanpa suara agar tidak memutar audio yang salah.
    if (q.part === 'transition' && !q.audio_q) {
      setTimeout(advanceToAnswerPhase, 1500);
      return;
    }
    const audioSrc = q.audio_q || (q.category === 'piktogram' ? '/audio/examiner_sign_q.mp3' : '/audio/examiner_tool_q.mp3');
    examAudioPlayerRef.current.src = getAssetUrl(audioSrc);
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

  // Kelompok kategori gaya modul Hub: definisi bersama di utils/categoryGroups.js
  // (dipakai juga oleh mode Materi agar pengkategorian konsisten)

  const categoriesList = [
    { id: 'all', label: 'Semua Bank Soal', count: questionsData.length },
    { id: 'simulasi_hrdk', group: 'interview', label: 'Simulasi Resmi HRDK', count: questionsData.filter(q=>q.category==='simulasi_hrdk').length },
    { id: 'wawancara', group: 'interview', label: 'Wawancara Data Diri & Situasi', count: questionsData.filter(q=>q.category==='wawancara').length },
    { id: 'wawancara_profesional', group: 'interview', label: 'Wawancara Sikap Kerja NCS', count: questionsData.filter(q=>q.category==='wawancara_profesional').length },
    { id: 'gerak_fisik', group: 'physical', label: 'Perintah Gerak Fisik Tubuh (따라하세요)', count: questionsData.filter(q=>q.category==='gerak_fisik').length },
    { id: 'k3_safety', group: 'safety', label: 'K3 & Keselamatan Pabrik', count: questionsData.filter(q=>q.category==='k3_safety').length },
    { id: 'piktogram', group: 'safety', label: 'Piktogram & Rambu K3', count: questionsData.filter(q=>q.category==='piktogram').length },
    { id: 'alat_manufaktur', group: 'tools', label: 'Perkakas Manufaktur & APD', count: questionsData.filter(q=>q.category==='alat_manufaktur').length },
    { id: 'alat_klasik', group: 'tools', label: 'Perkakas Klasik (JAGISOSE)', count: questionsData.filter(q=>q.category==='alat_klasik').length },
    { id: 'fungsi_alat', group: 'tools', label: 'Fungsi Perkakas Manufaktur', count: questionsData.filter(q=>q.category==='fungsi_alat').length },
    { id: 'praktik_alat', group: 'tools', label: 'Praktik & Penggunaan Alat Kerja', count: questionsData.filter(q=>q.category==='praktik_alat').length },
    { id: 'matematika', group: 'numbers', label: 'Dasar Berhitung Pabrik', count: questionsData.filter(q=>q.category==='matematika').length },
    { id: 'konversi_satuan', group: 'numbers', label: 'Konversi Satuan & Waktu', count: questionsData.filter(q=>q.category==='konversi_satuan').length },
    { id: 'hitungan_lisan', group: 'numbers', label: 'Hitungan Lisan Pabrik', count: questionsData.filter(q=>q.category==='hitungan_lisan').length },
  ];

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
            onOpenRevisionModal={() => setRevisionModalOpen(true)}
          />
        )}

        {/* ================================================================= */}
        {/* A. PRACTICE MODE (LATIHAN MANDIRI) */}
        {/* ================================================================= */}
        {mode === 'practice' && (
          <div className="w-full flex flex-col items-center space-y-3 animate-fade-in">
            
            {/* Baris 1: 4 Tab Mode Latihan + Tombol Pemilih Kategori Aktif */}
            {(() => {
              const activeMod = MAIN_MODULES.find(m => m.id === selectedCategory);
              const activeSub = categoriesList.find(c => c.id === selectedCategory);
              const activeCatLabel = activeMod ? activeMod.shortLabel : (activeSub ? activeSub.label.split('(')[0].trim() : 'Semua Soal');

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
                              'flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-md transition-colors min-h-[36px] text-xs font-semibold',
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

                    {/* Tombol Pemilih Kategori Aktif */}
                    <button
                      type="button"
                      onClick={() => setCategoryModalOpen(true)}
                      className="flex items-center justify-between sm:justify-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary/60 text-xs font-semibold text-foreground min-h-[38px] shrink-0 transition-colors"
                      title="Klik untuk memilih modul atau sub-kategori spesifik"
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate max-w-[180px]">{activeCatLabel}</span>
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded shrink-0">
                        {filteredQuestions.length} soal
                      </span>
                    </button>
                  </div>

                  {/* Baris Chip Filter Modul Cepat Horizontal (1 Baris) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {MAIN_MODULES.filter(m => m.id === 'all' || m.categories.length > 0).map(mod => {
                      const isDirect = selectedCategory === mod.id;
                      const isIncludedSub = mod.categories.includes(selectedCategory);
                      const isSelected = isDirect || (selectedCategory !== 'all' && isIncludedSub);
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
                            'shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border flex items-center gap-1.5 min-h-[32px]',
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary/60'
                          )}
                        >
                          <span>{mod.shortLabel}</span>
                          <span className={cn('text-[10px] font-mono', isSelected ? 'text-primary-foreground/85' : 'text-muted-foreground')}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
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
          <div className="w-full flex flex-col items-center text-center space-y-5 animate-fade-in">
            
            {/* Phase 1: Intro Briefing (Zero Nested Cards) */}
            {examPhase === 'intro' && (
              <div className="w-full max-w-xl space-y-5 text-left">
                {/* Clean Page Header */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono">STANDAR RESMI HRDK</Badge>
                    <Badge variant="outline" className="font-mono">TOTAL 50 POIN</Badge>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                    Simulasi Ujian Wawancara Resmi HRD Korea
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    Sesuai perubahan regulasi terbaru HRD Korea (Revisions to the Skills Test), bobot wawancara dinaikkan menjadi 50 poin dengan 30 langkah simulasi:
                  </p>
                </div>

                {/* 5 Komponen Ujian Wawancara dalam 1 container tunggal divide-y */}
                <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden text-xs">
                  <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-sm text-foreground">1. Perkenalan Diri Mandiri (Self-Introduction)</p>
                        <Badge variant="outline" className="font-mono text-[10px]">BERDIRI</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Monolog 자기소개 (Nama, Usia, Asal, Tekad Bekerja) · 25 Detik</p>
                    </div>
                    <span className="font-mono font-bold text-sm text-primary shrink-0">2 Poin</span>
                  </div>

                  <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-sm text-foreground">2. Instruksi Gerak Fisik (Work Instructions)</p>
                        <Badge variant="outline" className="font-mono text-[10px]">BERDIRI</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Arah & gerak refleks fisik perintah kerja (5 Soal @3 Poin)</p>
                    </div>
                    <span className="font-mono font-bold text-sm text-primary shrink-0">15 Poin</span>
                  </div>

                  <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-sm text-foreground">3. Kartu Visual & Praktik Alat Meja</p>
                        <Badge variant="outline" className="font-mono text-[10px]">DUDUK</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">5 kartu visual (4 rambu + 1 alat) + 2 praktik alat fungsi & aksi (@1 Poin)</p>
                    </div>
                    <span className="font-mono font-bold text-sm text-primary shrink-0">7 Poin</span>
                  </div>

                  <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-sm text-foreground">4. Pertanyaan K3 Industri Mendalam</p>
                        <Badge variant="outline" className="font-mono text-[10px]">BARU</Badge>
                        <Badge variant="outline" className="font-mono text-[10px]">DUDUK</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Safety guard, APD wajib, & tanggap bahaya darurat (2 Soal @5 Poin)</p>
                    </div>
                    <span className="font-mono font-bold text-sm text-primary shrink-0">10 Poin</span>
                  </div>

                  <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-sm text-foreground">5. Percakapan Dasar & Sikap Kerja NCS</p>
                        <Badge variant="outline" className="font-mono text-[10px]">DUDUK</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Tanggal/hari/waktu, data diri, sikap kerja, hitungan gudang (14 Soal)</p>
                    </div>
                    <span className="font-mono font-bold text-sm text-primary shrink-0">16 Poin</span>
                  </div>

                  {/* Passing threshold info row inside same container */}
                  <div className="p-3.5 sm:p-4 bg-secondary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <span>Ambang Batas Kelulusan:</span>
                      <span className="text-emerald-700 font-bold">Minimal 30 / 50 Poin (60%)</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Otomatis dengan audio penguji asli (6-9 detik/soal)
                    </span>
                  </div>
                </div>

                {/* Action controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <Button variant="link" size="sm" onClick={() => setRevisionModalOpen(true)} className="px-0">
                    <Info className="h-3.5 w-3.5" />
                    <span>Detail Regulasi Resmi HRDK</span>
                  </Button>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button variant="ghost" onClick={() => setMode('practice')}>
                      <span>Kembali</span>
                    </Button>
                    <Button onClick={startRealExam} size="lg" className="flex-1 sm:flex-initial">
                      <span>Mulai Simulasi (30 Soal)</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Phase 2: Live Exam Terminal */}
            {examPhase === 'running' && (
              <Card className="w-full max-w-xl p-5 sm:p-6 md:p-8 space-y-5">
                
                {/* Stage Header */}
                <div className="flex items-start sm:items-center justify-between pb-3.5 border-b border-border text-left gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                        {examQuestions[examIndex]?.section}
                      </span>
                      <Badge variant="outline" className="text-[10px]">Bobot: {examQuestions[examIndex]?.points} Poin</Badge>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {examQuestions[examIndex]?.stance === 'standing' ? 'BERDIRI' : 'DUDUK'}
                      </Badge>
                    </div>
                    <h3 className="text-xs text-muted-foreground font-medium truncate">
                      Soal No. {examIndex + 1} dari {examQuestions.length} · {examQuestions[examIndex]?.partTitle}
                    </h3>
                  </div>

                  <div className="shrink-0">
                    {examStepStatus === 'asking' ? (
                      <Badge variant="outline" className="font-mono">PENGUJI BERTANYA</Badge>
                    ) : (
                      <Badge variant="success" className="font-mono animate-pulse-dot">WAKTU MENJAWAB</Badge>
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
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
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
                        onClick={() => {
                          if (examAudioPlayerRef.current) {
                            examAudioPlayerRef.current.currentTime = 0;
                            examAudioPlayerRef.current.play().catch(() => {});
                          }
                        }}>
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>Dengar Ulang Suara Penguji</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 text-center">
                      <Button variant="outline" size="lg"
                        onClick={() => {
                          if (examAudioPlayerRef.current) {
                            examAudioPlayerRef.current.currentTime = 0;
                            examAudioPlayerRef.current.play().catch(() => {});
                          }
                        }}
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
                        disabled={!examScoreSummary.isComplete}
                        title={examScoreSummary.isComplete ? 'Lanjut ke lembar skor resmi 2026' : 'Nilai semua butir dulu (Benar/Salah) agar rekap akurat'}
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

                {/* 2. Daftar Evaluasi 30 Soal (1 level divide-y, natural page scroll) */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground px-1">
                    Dengarkan kembali rekaman suara Anda per nomor, lalu tandai penilaian mandiri secara objektif:
                  </p>

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

                          {/* Official Answer (clean typography with subtle left accent or top divider) */}
                          <div className="pt-2.5 border-t border-border/60 space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
                              Kunci Jawaban Resmi
                            </span>
                            <p className="text-foreground font-bold font-kr text-base">
                              {q.answer_short_ko || q.title_ko}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Artinya: {q.answer_short_id || q.title_id}
                            </p>
                          </div>

                          {/* Candidate Audio & Self Rating */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-border/60">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground font-medium">Rekaman:</span>
                              {recUrl ? (
                                <audio src={recUrl} controls className="h-7 w-44" />
                              ) : (
                                <span className="text-muted-foreground italic">Tidak ada rekaman</span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Button size="sm" variant={rating === 'pass' ? 'default' : 'outline'}
                                onClick={() => setSelfRatings(prev => ({ ...prev, [idx]: 'pass' }))}>
                                <span>Benar (+{q.points})</span>
                              </Button>
                              <Button size="sm" variant={rating === 'fail' ? 'destructive' : 'outline'}
                                onClick={() => setSelfRatings(prev => ({ ...prev, [idx]: 'fail' }))}>
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

            <div className="flex items-center gap-2.5">
              <Button onClick={playPracticeQuestion}>
                <Play className="h-4 w-4" />
                <span>{isPlayingAudio ? 'Memutar...' : 'Putar Soal'}</span>
              </Button>

              <Button variant="outline" size="icon"
                onClick={toggleRecording}
                title={isRecording ? 'Selesai Merekam' : 'Rekam Suara Mandiri'}
                className={isRecording ? 'bg-destructive text-destructive-foreground border-destructive animate-pulse-dot' : ''}>
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

    </div>
  );
}
