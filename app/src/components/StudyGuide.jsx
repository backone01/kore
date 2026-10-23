import React, { useState, useRef, useMemo, useEffect } from 'react';
import studyData from '../data/studyMaterials.json';
import allQuestions from '../data/questions.json';
import {
  Volume2, Eye, EyeOff, Search, Sparkles,
  Calendar, Clock, Hash, Palette, Users, UserCheck,
  Factory, Wrench, AlertTriangle,
  Activity, ChevronRight, ShieldAlert, Image, Copy, Play, Pause,
  X, Maximize2
} from 'lucide-react';
import { getAssetUrl } from '../utils/assetHelper.js';
import { HRDK_MODULES } from '../utils/categoryGroups.js';
import { Badge } from './ui/badge.jsx';
import { Button } from './ui/button.jsx';
import { QADetail, QAList, QAPlayerDeck, QAViewBar } from './QAStudy.jsx';
import { cn } from '../utils/cn.js';

const JAGISOGE_SAMPLES = [
  {
    id: 1,
    title: 'Sample 1 · Standar HRD Korea',
    koTitle: 'Sample 1 · 자기 소개',
    desc: 'Format umum paling aman untuk semua usia dan sektor.',
    sentences: [
      { ko: '안녕하십니까? 만나서 반갑습니다.', id: 'Halo, senang bertemu dengan Anda.' },
      { ko: '저는 인도네시아 자바에서 온 부디입니다.', id: 'Saya Budi yang datang dari Jawa, Indonesia.' },
      { ko: '올해 서른 살입니다.', id: 'Tahun ini saya berumur 30 tahun.' },
      { ko: '우리 가족은 모두 네 명입니다. 부모님과 동생, 그리고 저입니다.', id: 'Keluarga kami semuanya ada 4 orang: orang tua, adik, dan saya.' },
      { ko: '제 취미는 운동입니다.', id: 'Hobi saya adalah berolahraga.' },
      { ko: '전에는 전자 제품 조립 작업을 3년 동안 했습니다.', id: 'Sebelumnya saya bekerja perakitan produk elektronik selama 3 tahun.' },
      { ko: '한국에서 일하게 되기를 기대하고 있습니다.', id: 'Saya sangat menantikan kesempatan untuk bekerja di Korea.' },
      { ko: '뽑아주신다면 한국에 가서 열심히 일하겠습니다.', id: 'Jika Anda memilih saya, saya akan bekerja keras di Korea.' },
      { ko: '잘 부탁드립니다. 감사합니다.', id: 'Mohon bimbingan dan bantuannya. Terima kasih.' },
    ],
  },
  {
    id: 2,
    title: 'Sample 2 · Pengalaman Manufaktur',
    koTitle: 'Sample 2 · 제조업 경력형',
    desc: 'Menekankan ketahanan fisik, kerja tim, dan pengalaman mesin.',
    sentences: [
      { ko: '안녕하십니까? 처음 뵙겠습니다.', id: 'Halo, senang pertama kali berjumpa dengan Anda.' },
      { ko: '저는 인도네시아에서 온 수기안토입니다.', id: 'Saya Sugianto dari Indonesia.' },
      { ko: '올해 스물여덟 살이고 아직 미혼입니다.', id: 'Tahun ini saya 28 tahun dan belum menikah.' },
      { ko: '인도네시아 공장에서 기계 조작과 용접 일을 4년 동안 했습니다.', id: 'Di pabrik Indonesia saya mengoperasikan mesin dan mengelas selama 4 tahun.' },
      { ko: '저는 건강하고 힘이 세며 야근이나 잔업도 문제없습니다.', id: 'Saya berbadan sehat, kuat, dan lembur malam tidak masalah.' },
      { ko: '한국 상사님과 동료들의 지시를 잘 따르겠습니다.', id: 'Saya akan mematuhi arahan atasan dan rekan kerja Korea dengan baik.' },
      { ko: '회사에 꼭 필요한 일꾼이 되겠습니다. 감사합니다.', id: 'Saya akan menjadi pekerja yang sangat berharga bagi perusahaan. Terima kasih.' },
    ],
  },
  {
    id: 3,
    title: 'Sample 3 · Tekad Bekerja & Keluarga',
    koTitle: 'Sample 3 · 성실 의지형',
    desc: 'Menonjolkan motivasi keluarga, disiplin, dan keselamatan kerja.',
    sentences: [
      { ko: '안녕하십니까? 면접관님.', id: 'Halo bapak/ibu penguji wawancara.' },
      { ko: '제 이름은 리키입니다. 인도네시아 반둥에서 왔습니다.', id: 'Nama saya Riki. Datang dari Bandung, Indonesia.' },
      { ko: '우리 가족은 아내와 아기, 저까지 세 명입니다.', id: 'Keluarga saya ada 3 orang: istri, anak bayi, dan saya.' },
      { ko: '가족의 미래와 한국 기술을 배우기 위해 지원했습니다.', id: 'Saya melamar untuk masa depan keluarga dan belajar teknologi Korea.' },
      { ko: '항상 안전 수칙을 지키고 시간 약속을 철저히 지키겠습니다.', id: 'Saya selalu mematuhi peraturan K3 dan sangat tepat waktu.' },
      { ko: '어떤 힘든 일이라도 끝까지 해내겠습니다. 잘 부탁드립니다.', id: 'Pekerjaan seberat apapun akan saya selesaikan sampai tuntas. Mohon bantuannya.' },
    ],
  },
  {
    id: 4,
    title: 'Sample 4 · Ringkas 30 Detik',
    koTitle: 'Sample 4 · 30초 스피드형',
    desc: 'Format super padat agar selesai sebelum bel waktu 40 detik berbunyi.',
    sentences: [
      { ko: '안녕하십니까? 제 이름은 아디입니다.', id: 'Halo, nama saya Adi.' },
      { ko: '인도네시아에서 왔고 올해 스물다섯 살입니다.', id: 'Berasal dari Indonesia dan tahun ini berusia 25 tahun.' },
      { ko: '성격이 밝고 성실하며 체력이 아주 좋습니다.', id: 'Kepribadian saya ceria, rajin, dan stamina saya sangat kuat.' },
      { ko: '한국에 가면 지시사항을 잘 따르고 열심히 일하겠습니다.', id: 'Bila pergi ke Korea, saya akan mematuhi instruksi kerja dan bekerja giat.' },
      { ko: '감사합니다. 잘 부탁드립니다.', id: 'Terima kasih, mohon bantuannya.' },
    ],
  },
];

const JAGI_FOKUS_OPTIONS = [
  {
    id: 'manufaktur',
    label: 'Pabrik & Manufaktur (제조업)',
    desc: 'Pengalaman kerja pabrik, rajin, disiplin',
    ko: '저는 공장에서 성실하게 일한 경험이 있습니다.',
    idText: 'Saya memiliki pengalaman bekerja dengan rajin di pabrik.',
  },
  {
    id: 'pertanian',
    label: 'Pertanian & Nelayan (농축산업/어업)',
    desc: 'Pekerjaan luar ruangan, fisik tangguh',
    ko: '저는 농업과 야외 작업에 익숙하고 힘든 일도 잘 해낼 수 있습니다.',
    idText: 'Saya terbiasa dengan pertanian dan kerja lapangan, serta mampu bekerja berat.',
  },
  {
    id: 'konstruksi',
    label: 'Konstruksi & Pertukangan (건설업)',
    desc: 'Pengalaman proyek bangunan, taat K3',
    ko: '저는 건설 현장에서 일한 경험이 있고 안전 수칙을 철저히 지킵니다.',
    idText: 'Saya berpengalaman di lapangan konstruksi dan taat pada aturan K3.',
  },
  {
    id: 'rajin',
    label: 'Fisik Sehat & Cepat Belajar (성실/체력)',
    desc: 'Format umum terbaik untuk fresh graduate',
    ko: '저는 몸이 건강하고 부지런하며 새로운 기술을 빨리 배울 수 있습니다.',
    idText: 'Tubuh saya sehat, rajin, dan mampu mempelajari hal baru dengan cepat.',
  },
];

function classifyPhysicalGroup(ko = '', id = '') {
  const s = `${ko} ${id}`.toLowerCase();
  if (/눈|입|코|귀|고개|mata|mulut|hidung|telinga|kepala/.test(s)) {
    return 'Kepala, Mata, Hidung & Telinga';
  }
  if (/손|팔|주먹|박수|손가락|tangan|jari|kepal|tepuk/.test(s)) {
    return 'Tangan & Jari';
  }
  if (/발|앉|일어나|허리|어깨|kaki|duduk|berdiri|pinggang|bahu|membungkuk|bungkuk/.test(s)) {
    return 'Kaki & Postur Tubuh';
  }
  return 'Arah & Pandangan';
}

export function StudyGuide({ onStartPracticeCategory }) {
  const [activeModule, setActiveModule] = useState('interview');
  const [activeTab, setActiveTab] = useState('interview');
  const [activeSampleIdx, setActiveSampleIdx] = useState(0);
  const [jagiSubTab, setJagiSubTab] = useState('generator');
  const [inspectRambu, setInspectRambu] = useState(null);
  const [hideAllAnswers, setHideAllAnswers] = useState(true);
  const [revealedCardAnswers, setRevealedCardAnswers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [playingAudio, setPlayingAudio] = useState(null);
  const [selectedOptionByCard, setSelectedOptionByCard] = useState({});
  const [k3Filter, setK3Filter] = useState('all');
  const [interviewFilter, setInterviewFilter] = useState('all');
  const [cmdFilter, setCmdFilter] = useState('all');
  const [pikGroup, setPikGroup] = useState('all');
  const [alatGroup, setAlatGroup] = useState('all');
  const [selK3, setSelK3] = useState(0);
  const [selInt, setSelInt] = useState(0);
  const [qaView, setQaView] = useState({});
  const [playerHidden, setPlayerHidden] = useState({});
  const [playerMode, setPlayerMode] = useState('sequential');
  const [gapCountdown, setGapCountdown] = useState(0);
  const [hideText, setHideText] = useState(false);
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [playRate, setPlayRate] = useState(1);
  const [playDelay, setPlayDelay] = useState(2);
  const [audioProg, setAudioProg] = useState({ t: 0, d: 0 });

  const [jagiForm, setJagiForm] = useState({
    nama: 'BAMBANG SUTEJO',
    umur: '25',
    keluarga: '4',
    nikah: '아직 결혼하지 않았습니다',
    fokus: 'manufaktur',
  });
  const [jagiCopied, setJagiCopied] = useState(false);

  const nativeKo = (n) => {
    n = parseInt(n, 10);
    if (!n || n < 1 || n > 99) return '';
    const ONE = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉'];
    const TENS = { 1: '열', 2: '스물', 3: '서른', 4: '마흔', 5: '쉰', 6: '예순', 7: '일흔', 8: '여든', 9: '아흔' };
    if (n <= 9) return ONE[n];
    const t = Math.floor(n / 10), o = n % 10;
    return TENS[t] + (o ? ONE[o] : '');
  };

  const getJagiSentences = () => {
    const f = jagiForm;
    const nama = (f.nama || '').trim() || 'OOO';
    const umurKo = nativeKo(f.umur) || '스물다섯';
    const keluargaKo = nativeKo(f.keluarga) || '네';
    const nikahText = f.nikah === '결혼했습니다' ? '결혼했습니다' : '아직 결혼하지 않았습니다';
    const nikahId = f.nikah === '결혼했습니다' ? 'sudah menikah' : 'belum menikah';
    const fokusObj = JAGI_FOKUS_OPTIONS.find(o => o.id === f.fokus) || JAGI_FOKUS_OPTIONS[0];

    return [
      {
        no: 1,
        title: 'Salam & Izin Perkenalan',
        ko: '안녕하십니까! 지금부터 자기소개를 하겠습니다.',
        id: 'Selamat pagi / siang! Mulai sekarang saya akan memperkenalkan diri.',
        durasi: '3s',
      },
      {
        no: 2,
        title: 'Nama Lengkap',
        ko: `제 이름은 ${nama}입니다.`,
        id: `Nama saya adalah ${nama}.`,
        durasi: '3s',
      },
      {
        no: 3,
        title: 'Asal & Usia Resmi Korea',
        ko: `인도네시아에서 왔고, 나이는 ${umurKo} 살입니다.`,
        id: `Saya berasal dari Indonesia, dan usia saya ${f.umur || '25'} tahun.`,
        durasi: '5s',
      },
      {
        no: 4,
        title: 'Jumlah Keluarga & Status',
        ko: `우리 가족은 ${keluargaKo} 명이고, 저는 ${nikahText}.`,
        id: `Keluarga kami berjumlah ${f.keluarga || '4'} orang, dan saya ${nikahId}.`,
        durasi: '6s',
      },
      {
        no: 5,
        title: 'Pengalaman & Keunggulan',
        ko: fokusObj.ko,
        id: fokusObj.idText,
        durasi: '7s',
      },
      {
        no: 6,
        title: 'Komitmen Kerja & Penutup',
        ko: '한국에 가면 성실하고 열심히 일하겠습니다. 잘 부탁드립니다. 감사합니다!',
        id: 'Jika bekerja di Korea saya akan bekerja dengan rajin dan jujur. Mohon bimbingannya. Terima kasih!',
        durasi: '8s',
      },
    ];
  };
  const jagiSentences = getJagiSentences;

  const copyJagi = async () => {
    const text = getJagiSentences().map(s => s.ko).join(' ');
    try {
      await navigator.clipboard.writeText(text);
      setJagiCopied(true);
      setTimeout(() => setJagiCopied(false), 2000);
    } catch { setJagiCopied(false); }
  };

  // Gabungkan dan deduplikasi seluruh perintah gerak fisik dari studyData.physical_commands & allQuestions (gerak_fisik)
  const mergedPhysicalCommands = useMemo(() => {
    const normKo = (t) => (t || '').replace(/[.?!]/g, '').replace(/\s+/g, ' ').trim();
    const map = new Map();

    (studyData.physical_commands || []).forEach((c, i) => {
      const key = normKo(c.command_ko);
      if (!key) return;
      map.set(key, {
        id: c.id || `sm_cmd_${i}`,
        command_ko: c.command_ko,
        command_ro: c.command_ro || '',
        command_id: c.command_id || '',
        action_desc: c.action_desc || c.command_id || '',
        audio_q: c.audio_q || null,
        group: classifyPhysicalGroup(c.command_ko, c.command_id),
      });
    });

    allQuestions
      .filter(q => q.category === 'gerak_fisik')
      .forEach((q, i) => {
        const ko = q.question_ko || q.title_ko || '';
        const key = normKo(ko);
        if (!key) return;
        const existing = map.get(key);
        if (existing) {
          if (!existing.command_ro && q.question_romaja) existing.command_ro = q.question_romaja;
          if (!existing.audio_q && q.audio_q) existing.audio_q = q.audio_q;
          if (!existing.action_desc && q.answer_short_id) existing.action_desc = q.answer_short_id;
        } else {
          const idText = q.question_id || q.title_id || '';
          map.set(key, {
            id: q.id || `q_cmd_${i}`,
            command_ko: ko,
            command_ro: q.question_romaja || '',
            command_id: idText,
            action_desc: q.answer_short_id || `Langsung peragakan gerakan: ${idText}`,
            audio_q: q.audio_q || null,
            group: classifyPhysicalGroup(ko, idText),
          });
        }
      });

    return Array.from(map.values());
  }, []);

  const alatCount = allQuestions.filter(
    q => q.category === 'alat_manufaktur' || q.category === 'alat_klasik'
  ).length;

  const interviewCount = allQuestions.filter(
    q => q.category === 'wawancara' || q.category === 'simulasi_hrdk' || q.category === 'wawancara_profesional'
  ).length;
  const hrdkSimCount = allQuestions.filter(q => q.category === 'simulasi_hrdk').length;

  const hitunganQuestions = allQuestions.filter(
    q => q.category === 'hitungan_lisan' || q.category === 'matematika'
  );
  const konversiQuestions = allQuestions.filter(q => q.category === 'konversi_satuan');
  const jamLisanQuestions = allQuestions.filter(
    q => (q.category === 'wawancara' || q.category === 'simulasi_hrdk' || q.category === 'wawancara_profesional')
      && /시예요|몇 시|몇 분|몇 초/.test(q.question_ko || '')
  );
  const tanggalLisanQuestions = allQuestions.filter(
    q => (q.category === 'wawancara' || q.category === 'simulasi_hrdk' || q.category === 'wawancara_profesional')
      && /요일|며칠|몇 월|날짜|생일/.test(q.question_ko || '')
  );

  const audioRef = useRef(new Audio());

  const speakKorean = (text, onEnd) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ko-KR';
      u.rate = 0.85 * (liveRef.current.playRate ?? 1);
      setPlayingAudio(text);
      u.onend = () => { setPlayingAudio(null); if (onEnd) onEnd(); };
      u.onerror = () => { setPlayingAudio(null); if (onEnd) onEnd(); };
      window.speechSynthesis.speak(u);
    } catch {
      setPlayingAudio(null);
      if (onEnd) onEnd();
    }
  };

  const playAudio = (url, fallbackText, onEnd) => {
    if (!url) {
      if (fallbackText) speakKorean(fallbackText, onEnd);
      else if (onEnd) onEnd();
      return;
    }
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = getAssetUrl(url);
      try { audioRef.current.playbackRate = liveRef.current.playRate ?? 1; } catch { /* abaikan */ }
      setPlayingAudio(url);
      audioRef.current.onended = () => { setPlayingAudio(null); if (onEnd) onEnd(); };
      audioRef.current.onerror = () => {
        if (fallbackText) {
          speakKorean(fallbackText, onEnd);
        } else {
          setPlayingAudio(null);
          if (onEnd) onEnd();
        }
      };
      audioRef.current.play().catch(() => {
        if (fallbackText) {
          speakKorean(fallbackText, onEnd);
        } else {
          setPlayingAudio(null);
          if (onEnd) onEnd();
        }
      });
    } catch {
      if (fallbackText) speakKorean(fallbackText, onEnd);
      else if (onEnd) onEnd();
    }
  };

  const playerRef = useRef({
    tab: null,
    items: [],
    order: [],
    pos: 0,
    step: 'idle',
    on: false,
    shuffle: false,
    repeat: true,
    mode: 'sequential',
    timer: null,
    gapInterval: null,
    isFile: false,
  });
  const liveRef = useRef({});
  liveRef.current = { selectedOptionByCard, playRate, playDelay, includeAnswers, playerMode };
  const [playerUI, setPlayerUI] = useState({
    on: false,
    tab: null,
    step: 'idle',
    pos: 0,
    total: 0,
    shuffle: false,
    repeat: true,
    mode: 'sequential',
    isFile: false,
  });

  const clearPlayerTimer = () => {
    if (playerRef.current.timer) {
      clearTimeout(playerRef.current.timer);
      playerRef.current.timer = null;
    }
    if (playerRef.current.gapInterval) {
      clearInterval(playerRef.current.gapInterval);
      playerRef.current.gapInterval = null;
    }
    setGapCountdown(0);
  };

  const stopAudioOnly = () => {
    try { audioRef.current.pause(); } catch { /* abaikan */ }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch { /* abaikan */ }
    }
    setPlayingAudio(null);
  };

  const syncPlayer = () => {
    const r = playerRef.current;
    setPlayerUI({
      on: r.on,
      tab: r.tab,
      step: r.step,
      pos: r.pos,
      total: r.order.length,
      shuffle: r.shuffle,
      repeat: r.repeat,
      mode: r.mode,
      isFile: !!r.isFile,
    });
    if (r.tab && r.order.length) {
      const idx = r.order[r.pos] ?? 0;
      if (r.tab === 'k3') setSelK3(idx); else setSelInt(idx);
    }
  };

  const resolveAnswerAudio = (tab, q, idx) => {
    const cardId = `${tab === 'k3' ? 'k3' : 'int'}_${q.id ?? idx}`;
    const opts = q.answer_options;
    const selIdx = (liveRef.current.selectedOptionByCard || {})[cardId] ?? 0;
    const opt = (opts && opts.length > 0 ? (opts[selIdx] || opts[0]) : null) || { ko: q.answer_ko, id: q.answer_id };
    const url = opt.audio || (selIdx === 0 && q.audio_a ? q.audio_a : null);
    return { url, text: opt.ko };
  };

  const drivePlayer = () => {
    const r = playerRef.current;
    if (!r.on) return;
    const idx = r.order[r.pos];
    const q = r.items[idx];
    if (!q) { stopPlayer(); return; }
    syncPlayer();
    if (r.step === 'q') {
      r.isFile = !!q.audio_q;
      syncPlayer();
      playAudio(q.audio_q, q.question_ko, onPlayerStepEnd);
    } else {
      const { url, text } = resolveAnswerAudio(r.tab, q, idx);
      r.isFile = !!url;
      syncPlayer();
      playAudio(url, text, onPlayerStepEnd);
    }
  };

  const advanceOrStopNext = () => {
    const r = playerRef.current;
    if (r.mode === 'single') {
      stopPlayer();
      return;
    }
    const last = r.pos + 1 >= r.order.length;
    if (last && !r.repeat) {
      stopPlayer();
      return;
    }
    if (last && r.repeat && r.shuffle && r.order.length > 1) {
      const newOrder = [...r.order];
      for (let i = newOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
      }
      r.order = newOrder;
    }
    r.pos = last ? 0 : r.pos + 1;
    r.step = 'q';
    syncPlayer();
    r.timer = setTimeout(() => {
      if (playerRef.current.on) drivePlayer();
    }, 700);
  };

  const onPlayerStepEnd = () => {
    const r = playerRef.current;
    if (!r.on) return;
    if (r.step === 'q') {
      r.step = 'gap';
      const delay = liveRef.current.playDelay ?? 2;
      setGapCountdown(delay);
      syncPlayer();

      if (delay <= 0) {
        if (liveRef.current.includeAnswers) {
          playerRef.current.step = 'a';
          drivePlayer();
        } else {
          advanceOrStopNext();
        }
        return;
      }

      let rem = delay;
      r.gapInterval = setInterval(() => {
        rem -= 1;
        setGapCountdown(Math.max(0, rem));
        if (rem <= 0) {
          if (r.gapInterval) {
            clearInterval(r.gapInterval);
            r.gapInterval = null;
          }
          if (!playerRef.current.on) return;
          if (liveRef.current.includeAnswers) {
            playerRef.current.step = 'a';
            drivePlayer();
          } else {
            advanceOrStopNext();
          }
        }
      }, 1000);
    } else if (r.step === 'a') {
      advanceOrStopNext();
    }
  };

  const startPlayer = (tab, items, startIdx, playMode = 'sequential') => {
    stopAudioOnly();
    clearPlayerTimer();
    if (!items.length) return;
    const s0 = Math.max(0, Math.min(startIdx, items.length - 1));
    let order = items.map((_, i) => i);
    if (playerRef.current.shuffle) {
      const remaining = order.filter(i => i !== s0);
      for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
      }
      order = [s0, ...remaining];
    }
    const targetPos = playerRef.current.shuffle ? 0 : s0;
    Object.assign(playerRef.current, {
      tab,
      items: [...items],
      order,
      pos: targetPos,
      step: 'q',
      mode: playMode,
      on: true,
    });
    setPlayerMode(playMode);
    drivePlayer();
  };

  const stopPlayer = () => {
    clearPlayerTimer();
    stopAudioOnly();
    playerRef.current.on = false;
    playerRef.current.tab = null;
    syncPlayer();
  };

  const pausePlayer = () => {
    clearPlayerTimer();
    stopAudioOnly();
    playerRef.current.on = false;
    syncPlayer();
  };

  const stepPlayer = (d) => {
    const r = playerRef.current;
    if (!r.order.length) return;
    clearPlayerTimer();
    stopAudioOnly();
    r.pos = (r.pos + d + r.order.length) % r.order.length;
    r.step = 'q';
    r.on = true;
    drivePlayer();
  };

  const jumpPlayer = (idx) => {
    const r = playerRef.current;
    const p = r.order.indexOf(idx);
    if (p < 0) return;
    clearPlayerTimer();
    stopAudioOnly();
    r.pos = p;
    r.step = 'q';
    r.on = true;
    drivePlayer();
  };

  const toggleShuffle = () => {
    const r = playerRef.current;
    const nextShuffle = !r.shuffle;
    r.shuffle = nextShuffle;

    if (r.items && r.items.length > 0) {
      const currentIdx = r.order && r.order.length > 0 ? (r.order[r.pos] ?? 0) : 0;
      if (nextShuffle) {
        const remaining = r.items.map((_, i) => i).filter(i => i !== currentIdx);
        for (let i = remaining.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
        }
        r.order = [currentIdx, ...remaining];
        r.pos = 0;
      } else {
        r.order = r.items.map((_, i) => i);
        r.pos = Math.max(0, r.order.indexOf(currentIdx));
      }
    }
    syncPlayer();
  };
  const toggleRepeat = () => { playerRef.current.repeat = !playerRef.current.repeat; syncPlayer(); };

  const seekPlayer = (frac) => {
    try {
      const a = audioRef.current;
      if (a && a.duration && isFinite(a.duration) && playerRef.current.isFile) {
        a.currentTime = frac * a.duration;
      }
    } catch { /* abaikan */ }
  };

  const cycleRate = () => {
    const steps = [1, 1.25, 1.5, 0.75];
    const i = steps.indexOf(playRate);
    const next = steps[(i + 1) % steps.length];
    setPlayRate(next);
    try { audioRef.current.playbackRate = next; } catch { /* abaikan */ }
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return undefined;
    const upd = () => setAudioProg({ t: a.currentTime || 0, d: a.duration || 0 });
    a.addEventListener('timeupdate', upd);
    a.addEventListener('loadedmetadata', upd);
    a.addEventListener('ended', upd);
    return () => {
      a.removeEventListener('timeupdate', upd);
      a.removeEventListener('loadedmetadata', upd);
      a.removeEventListener('ended', upd);
    };
  }, []);

  useEffect(() => () => {
    try { audioRef.current.pause(); } catch { /* abaikan */ }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch { /* abaikan */ }
    }
    if (playerRef.current.timer) clearTimeout(playerRef.current.timer);
  }, []);

  const isAnswerHidden = (cardId) => {
    if (hideAllAnswers) {
      return !revealedCardAnswers[cardId];
    }
    return revealedCardAnswers[cardId] === true;
  };

  const toggleCardAnswer = (cardId) => {
    setRevealedCardAnswers(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const subTabs = [
    { id: 'interview', moduleId: 'interview', label: 'Tanya Jawab Wawancara', icon: UserCheck, count: `${interviewCount}` },
    { id: 'jagisoge', moduleId: 'interview', label: 'Jagisoge 40 Detik', icon: Sparkles, count: 'Naskah' },
    { id: 'family', moduleId: 'interview', label: 'Keluarga & Relasi', icon: Users, count: 'Silsilah' },

    { id: 'commands', moduleId: 'physical', label: 'Refleks Gerak Fisik', icon: Activity, count: `${mergedPhysicalCommands.length} Gerak` },

    { id: 'k3', moduleId: 'safety', label: '30 Q&A K3 Resmi', icon: AlertTriangle, count: '30 Q&A' },
    { id: 'piktogram', moduleId: 'safety', label: 'Piktogram & Rambu K3', icon: ShieldAlert, count: '98 Rambu' },

    { id: 'alat', moduleId: 'tools', label: 'Foto & Nama Alat Manufaktur', icon: Image, count: `${alatCount} Alat` },
    { id: 'manufacturing', moduleId: 'tools', label: 'Pos Praktik & SOP Pabrik', icon: Factory, count: 'SOP' },

    { id: 'numbers', moduleId: 'numbers', label: 'Nomor & Angka Sino/Asli', icon: Hash, count: 'Sino/Asli' },
    { id: 'time', moduleId: 'numbers', label: 'Jam & Waktu', icon: Clock, count: 'Format' },
    { id: 'calendar', moduleId: 'numbers', label: 'Hari & Kalender', icon: Calendar, count: 'Kalender' },

    { id: 'colors', moduleId: 'colors', label: 'Warna Pabrik & Tes Warna', icon: Palette, count: '11 Warna' },
  ];

  const filteredK3 = useMemo(() => {
    let list = studyData.k3_safety || [];
    if (k3Filter === 'apd') {
      list = list.slice(0, 14);
    } else if (k3Filter === 'evakuasi') {
      list = list.slice(14, 18);
    } else if (k3Filter === 'rambu') {
      list = list.slice(18, 22);
    } else if (k3Filter === 'mesin') {
      list = list.slice(22, 26);
    } else if (k3Filter === 'kimia') {
      list = list.slice(26, 30);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item =>
        ((item.question_ko || '') + ' ' + (item.question_id || '') + ' ' + (item.answer_ko || '') + ' ' + (item.answer_id || '') + ' ' + (item.topic || '')).toLowerCase().includes(q)
      );
    }
    return list;
  }, [k3Filter, searchQuery]);

  const filteredInterview = useMemo(() => {
    let list = studyData.interview || [];
    if (interviewFilter === 'pribadi') {
      list = list.filter(q =>
        q.question_ko?.includes('이름') ||
        q.question_ko?.includes('나이') ||
        q.question_ko?.includes('생일') ||
        q.question_ko?.includes('고향') ||
        q.question_ko?.includes('가족') ||
        q.question_ko?.includes('결혼') ||
        q.question_ko?.includes('취미') ||
        q.question_ko?.includes('운동') ||
        q.question_ko?.includes('색깔')
      );
    } else if (interviewFilter === 'situasi') {
      list = list.filter(q =>
        q.question_ko?.includes('불량품') ||
        q.question_ko?.includes('실수') ||
        q.question_ko?.includes('사고') ||
        q.question_ko?.includes('동료') ||
        q.question_ko?.includes('상사') ||
        q.question_ko?.includes('반대') ||
        q.question_ko?.includes('어려우면') ||
        q.question_ko?.includes('야근') ||
        q.question_ko?.includes('잔업') ||
        q.question_ko?.includes('월급')
      );
    } else if (interviewFilter === 'hrdk') {
      list = list.filter(q => q.category === 'simulasi_hrdk');
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item =>
        ((item.question_ko || '') + ' ' + (item.question_id || '') + ' ' + (item.answer_ko || '') + ' ' + (item.answer_id || '')).toLowerCase().includes(q)
      );
    }
    return list;
  }, [interviewFilter, searchQuery]);

  const filteredCommands = useMemo(() => {
    let list = mergedPhysicalCommands;
    if (cmdFilter !== 'all') {
      list = list.filter(c => c.group === cmdFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        `${c.command_ko} ${c.command_ro} ${c.command_id} ${c.action_desc}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [mergedPhysicalCommands, cmdFilter, searchQuery]);

  const selK3Eff = Math.min(selK3, Math.max(0, filteredK3.length - 1));
  const selIntEff = Math.min(selInt, Math.max(0, filteredInterview.length - 1));

  const MOD_KO = {
    interview: '면접',
    physical: '신체동작',
    safety: '산업안전',
    tools: '공구·기능',
    numbers: '기초연산',
    colors: '색각검사',
  };

  const selectModule = (id) => {
    stopPlayer();
    setActiveModule(id);
    setSearchQuery('');
    const firstSub = subTabs.find(st => st.moduleId === id);
    if (firstSub) setActiveTab(firstSub.id);
  };

  const getActiveOption = (cardId, options, fallbackKo, fallbackId) => {
    if (options && options.length > 0) {
      const idx = selectedOptionByCard[cardId] ?? 0;
      return options[idx] || options[0];
    }
    return { ko: fallbackKo, id: fallbackId, label: 'Standar' };
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pb-20 animate-fade-in text-foreground">
      {/* Page header */}
      <div className="mb-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
          <div>
            <p className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Skill Test · Tahap 2</p>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5">Materi & Hafalan</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Kisi-kisi resmi HRD Korea: wawancara, gerak fisik, K3, alat, dan hitungan.
            </p>
          </div>
          <div className="shrink-0">
            <Button
              size="sm"
              variant={hideAllAnswers ? 'default' : 'outline'}
              onClick={() => {
                setHideAllAnswers(prev => !prev);
                setRevealedCardAnswers({});
              }}
              title="Sembunyikan seluruh kunci jawaban untuk menguji daya ingat Anda"
            >
              {hideAllAnswers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{hideAllAnswers ? 'Mode Hafal' : 'Sembunyikan Jawaban'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Compact Module Grid (2x3 Mobile, 3x2 Desktop - Ringkas & Tidak Bertumpuk) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 mb-3">
        {HRDK_MODULES.filter(m => m.id !== 'all').map((mod, i) => {
          const active = activeModule === mod.id;
          const cleanName = mod.shortLabel.replace(/^\d+\.\s*/, '');
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => selectModule(mod.id)}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'flex items-center gap-2 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border text-left transition-all min-h-[46px]',
                active
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card text-foreground border-border hover:bg-secondary/60'
              )}
            >
              <span
                className={cn(
                  'font-mono text-[11px] font-bold w-6 h-6 rounded-md flex items-center justify-center shrink-0',
                  active ? 'bg-white/20 text-white' : 'bg-secondary text-muted-foreground'
                )}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold truncate leading-tight">
                  {cleanName}
                </span>
                <span
                  className={cn(
                    'block text-[10px] font-kr truncate mt-0.5 leading-none',
                    active ? 'text-white/80' : 'text-muted-foreground'
                  )}
                >
                  {MOD_KO[mod.id]}
                  {mod.points > 0 ? ` · ${mod.points}P` : ''}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub-navigation bar */}
      {(() => {
        const currentSubTabs = subTabs.filter(st => st.moduleId === activeModule);
        if (currentSubTabs.length <= 1) return null;

        return (
          <div className="sticky top-14 z-30 -mx-3 px-3 sm:-mx-4 sm:px-4 bg-background/95 backdrop-blur py-1.5 border-b border-border mb-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
              {currentSubTabs.map(st => {
                const isTabActive = activeTab === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      stopPlayer();
                      setActiveTab(st.id);
                      setSearchQuery('');
                    }}
                    className={cn(
                      'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[34px] flex items-center gap-1.5 border',
                      isTabActive
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-card text-muted-foreground border-border hover:text-foreground'
                    )}
                  >
                    <span>{st.label}</span>
                    <span
                      className={cn(
                        'font-mono text-[10px] px-1.5 py-0.5 rounded',
                        isTabActive ? 'bg-background/20 text-background' : 'bg-secondary text-muted-foreground'
                      )}
                    >
                      {st.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* K3 Tab (Flat Open Header, Zero Outer Card) */}
      {activeTab === 'k3' && (
        <div className="space-y-4">
          <div className="space-y-3 pb-3 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>30 Tanya Jawab Standar K3 Industri HRD Korea</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mencakup APD (보호구), Pintu Darurat, APAR, Rambu K3, Pengaman Mesin, dan MSDS.
                </p>
              </div>

              <Button size="sm" onClick={() => onStartPracticeCategory && onStartPracticeCategory('safety')} className="shrink-0">
                <span>Latih K3 di Flashcard</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: 'all', label: 'Semua Topik (30)' },
                { id: 'apd', label: 'APD (14)' },
                { id: 'evakuasi', label: 'Pintu Darurat & APAR (4)' },
                { id: 'rambu', label: 'Rambu K3 (4)' },
                { id: 'mesin', label: 'Pengaman Mesin (4)' },
                { id: 'kimia', label: 'Bahan Kimia & MSDS (4)' },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => { setK3Filter(f.id); setSelK3(0); stopPlayer(); }}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg font-semibold transition-all border',
                    k3Filter === f.id
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-card text-muted-foreground hover:text-foreground border-border'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari kata kunci K3 (misal: 안전모, 소화기, MSDS, 방호장치, pelindung)..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelK3(0); stopPlayer(); }}
                className="w-full pl-9 pr-4 py-2 bg-card border border-input rounded-lg text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring"
              />
            </div>
          </div>

          <QAPlayerDeck
            ui={playerUI.tab === 'k3' ? playerUI : { on: false, step: 'idle', shuffle: playerRef.current.shuffle, repeat: playerRef.current.repeat }}
            currentQ={filteredK3[selK3Eff]}
            currentIndex={selK3Eff}
            totalCount={filteredK3.length}
            prog={{ t: audioProg.t, d: audioProg.d, isFile: playerUI.tab === 'k3' && playerUI.isFile }}
            onSeek={seekPlayer}
            rate={playRate}
            onCycleRate={cycleRate}
            delaySecs={playDelay}
            onSetDelay={setPlayDelay}
            mode={playerMode}
            onToggleMode={() => {
              const next = playerMode === 'sequential' ? 'single' : 'sequential';
              setPlayerMode(next);
              playerRef.current.mode = next;
            }}
            includeAnswers={includeAnswers}
            gapCountdown={gapCountdown}
            hideText={hideText}
            onPrev={() => {
              if (playerUI.on && playerUI.tab === 'k3') stepPlayer(-1);
              else setSelK3(Math.max(0, selK3Eff - 1));
            }}
            onTogglePlay={() => {
              if (playerUI.on && playerUI.tab === 'k3') pausePlayer();
              else startPlayer('k3', filteredK3, selK3Eff, playerMode);
            }}
            onNext={() => {
              if (playerUI.on && playerUI.tab === 'k3') stepPlayer(1);
              else setSelK3(Math.min(filteredK3.length - 1, selK3Eff + 1));
            }}
            onShuffle={toggleShuffle}
            onRepeat={toggleRepeat}
            onStop={stopPlayer}
            collapsed={playerHidden.k3}
            onToggleCollapse={() => setPlayerHidden((p) => ({ ...p, k3: !p.k3 }))}
            accent="amber"
            activeOpt={getActiveOption(
              `k3_${filteredK3[selK3Eff]?.id ?? selK3Eff}`,
              filteredK3[selK3Eff]?.answer_options,
              filteredK3[selK3Eff]?.answer_ko,
              filteredK3[selK3Eff]?.answer_id
            )}
            onPlayAnswer={() => {
              const q = filteredK3[selK3Eff];
              if (!q) return;
              const cardId = `k3_${q.id ?? selK3Eff}`;
              const activeOpt = getActiveOption(cardId, q.answer_options, q.answer_ko, q.answer_id);
              if (activeOpt?.audio) playAudio(activeOpt.audio, activeOpt.ko);
              else if (q.audio_a) playAudio(q.audio_a, activeOpt?.ko || q.answer_ko);
              else playAudio(null, activeOpt?.ko || q.answer_ko);
            }}
          />

          <QAViewBar
            view={qaView.k3 || 'list'}
            onView={(v) => {
              setQaView((p) => ({ ...p, k3: v }));
              if (v === 'single' && selK3 < 0) setSelK3(0);
            }}
            hideAnswers={!includeAnswers}
            onOnlyQ={() => { setIncludeAnswers(false); setHideAllAnswers(true); setRevealedCardAnswers({}); }}
            onWithA={() => { setIncludeAnswers(true); setHideAllAnswers(false); setRevealedCardAnswers({}); }}
            hideText={hideText}
            onToggleHideText={() => setHideText(p => !p)}
            visible={filteredK3.length}
            total={(studyData.k3_safety || []).length}
          />

          <QAList
            items={filteredK3}
            selIdx={selK3Eff}
            playIdx={playerUI.tab === 'k3' ? (playerRef.current.order[playerUI.pos] ?? -1) : -1}
            isPlaying={playerUI.on && playerUI.tab === 'k3'}
            tabKey="k3"
            accent="amber"
            mode={qaView.k3 || 'list'}
            subOf={(q) => q.topic || 'K3 Industri Pabrik'}
            expandedIdx={selK3Eff}
            hideAnswers={!includeAnswers}
            renderDetail={(q, idx) => {
              const cardId = `k3_${q.id ?? idx}`;
              const activeOpt = getActiveOption(cardId, q.answer_options, q.answer_ko, q.answer_id);
              return (
                <QADetail
                  q={q}
                  num={idx + 1}
                  cardId={cardId}
                  hidden={isAnswerHidden(cardId)}
                  activeOpt={activeOpt}
                  selOptIdx={selectedOptionByCard[cardId] ?? 0}
                  onSelectOpt={(oi) => setSelectedOptionByCard(prev => ({ ...prev, [cardId]: oi }))}
                  onToggle={() => toggleCardAnswer(cardId)}
                  onPlayQ={() => playAudio(q.audio_q, q.question_ko)}
                  onPlayAnswer={() => {
                    const si = selectedOptionByCard[cardId] ?? 0;
                    if (activeOpt.audio) playAudio(activeOpt.audio, activeOpt.ko);
                    else if (si === 0 && q.audio_a) playAudio(q.audio_a, activeOpt.ko);
                    else playAudio(null, activeOpt.ko);
                  }}
                  accent="amber"
                  ansFallback="Kunci Resmi"
                  subLabel={q.topic || 'K3 Industri Pabrik'}
                  posLabel={`${idx + 1}/${filteredK3.length}`}
                  onPrev={() => setSelK3(Math.max(0, idx - 1))}
                  onNext={() => setSelK3(Math.min(filteredK3.length - 1, idx + 1))}
                />
              );
            }}
            onPick={(i) => {
              if (playerUI.on && playerUI.tab === 'k3') { setSelK3(i); jumpPlayer(i); return; }
              setSelK3(i === selK3 ? -1 : i);
              const q = filteredK3[i];
              if (q && i !== selK3) playAudio(q.audio_q, q.question_ko);
            }}
            onPlayRow={(i) => {
              setSelK3(i);
              startPlayer('k3', filteredK3, i, 'sequential');
            }}
          />
        </div>
      )}

      {/* Interview Tab (Flat Open Header, Zero Outer Card) */}
      {activeTab === 'interview' && (
        <div className="space-y-4">
          <div className="space-y-3 pb-3 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary shrink-0" />
                  <span>{interviewCount} Bank Soal Wawancara Resmi MSK Indonesia & HRD Korea</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pertanyaan data diri, alasan bekerja di Korea, ketahanan fisik, serta situasi kritis di pabrik.
                </p>
              </div>

              <Button size="sm" onClick={() => onStartPracticeCategory && onStartPracticeCategory('interview')} className="shrink-0">
                <span>Latih Wawancara di Flashcard</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: 'all', label: `Semua Soal (${interviewCount})` },
                { id: 'pribadi', label: 'Data Diri & Pribadi' },
                { id: 'situasi', label: 'Situasi Kritis Pabrik (SOP)' },
                { id: 'hrdk', label: `Simulasi Resmi HRDK (${hrdkSimCount} Q&A)` },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => { setInterviewFilter(f.id); setSelInt(0); stopPlayer(); }}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg font-semibold transition-all border',
                    interviewFilter === f.id
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-card text-muted-foreground hover:text-foreground border-border'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari pertanyaan wawancara (misal: 불량품, 사고, 이름, 나이, 야근, gaji, teman)..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelInt(0); stopPlayer(); }}
                className="w-full pl-9 pr-4 py-2 bg-card border border-input rounded-lg text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring"
              />
            </div>
          </div>

          <QAPlayerDeck
            ui={playerUI.tab === 'interview' ? playerUI : { on: false, step: 'idle', shuffle: playerRef.current.shuffle, repeat: playerRef.current.repeat }}
            currentQ={filteredInterview[selIntEff]}
            currentIndex={selIntEff}
            totalCount={filteredInterview.length}
            prog={{ t: audioProg.t, d: audioProg.d, isFile: playerUI.tab === 'interview' && playerUI.isFile }}
            onSeek={seekPlayer}
            rate={playRate}
            onCycleRate={cycleRate}
            delaySecs={playDelay}
            onSetDelay={setPlayDelay}
            mode={playerMode}
            onToggleMode={() => {
              const next = playerMode === 'sequential' ? 'single' : 'sequential';
              setPlayerMode(next);
              playerRef.current.mode = next;
            }}
            includeAnswers={includeAnswers}
            gapCountdown={gapCountdown}
            hideText={hideText}
            onPrev={() => {
              if (playerUI.on && playerUI.tab === 'interview') stepPlayer(-1);
              else setSelInt(Math.max(0, selIntEff - 1));
            }}
            onTogglePlay={() => {
              if (playerUI.on && playerUI.tab === 'interview') pausePlayer();
              else startPlayer('interview', filteredInterview, selIntEff, playerMode);
            }}
            onNext={() => {
              if (playerUI.on && playerUI.tab === 'interview') stepPlayer(1);
              else setSelInt(Math.min(filteredInterview.length - 1, selIntEff + 1));
            }}
            onShuffle={toggleShuffle}
            onRepeat={toggleRepeat}
            onStop={stopPlayer}
            collapsed={playerHidden.interview}
            onToggleCollapse={() => setPlayerHidden((p) => ({ ...p, interview: !p.interview }))}
            accent="blue"
            activeOpt={getActiveOption(
              `int_${filteredInterview[selIntEff]?.id ?? selIntEff}`,
              filteredInterview[selIntEff]?.answer_options,
              filteredInterview[selIntEff]?.answer_ko,
              filteredInterview[selIntEff]?.answer_id
            )}
            onPlayAnswer={() => {
              const q = filteredInterview[selIntEff];
              if (!q) return;
              const cardId = `int_${q.id ?? selIntEff}`;
              const activeOpt = getActiveOption(cardId, q.answer_options, q.answer_ko, q.answer_id);
              if (activeOpt?.audio) playAudio(activeOpt.audio, activeOpt.ko);
              else if (q.audio_a) playAudio(q.audio_a, activeOpt?.ko || q.answer_ko);
              else playAudio(null, activeOpt?.ko || q.answer_ko);
            }}
          />

          <QAViewBar
            view={qaView.interview || 'list'}
            onView={(v) => {
              setQaView((p) => ({ ...p, interview: v }));
              if (v === 'single' && selInt < 0) setSelInt(0);
            }}
            hideAnswers={!includeAnswers}
            onOnlyQ={() => { setIncludeAnswers(false); setHideAllAnswers(true); setRevealedCardAnswers({}); }}
            onWithA={() => { setIncludeAnswers(true); setHideAllAnswers(false); setRevealedCardAnswers({}); }}
            hideText={hideText}
            onToggleHideText={() => setHideText(p => !p)}
            visible={filteredInterview.length}
            total={interviewCount}
          />

          <QAList
            items={filteredInterview}
            selIdx={selIntEff}
            playIdx={playerUI.tab === 'interview' ? (playerRef.current.order[playerUI.pos] ?? -1) : -1}
            isPlaying={playerUI.on && playerUI.tab === 'interview'}
            tabKey="interview"
            accent="blue"
            mode={qaView.interview || 'list'}
            subOf={(q) => q.category_title || q.category}
            expandedIdx={selIntEff}
            hideAnswers={!includeAnswers}
            renderDetail={(q, idx) => {
              const cardId = `int_${q.id ?? idx}`;
              const activeOpt = getActiveOption(cardId, q.answer_options, q.answer_ko, q.answer_id);
              return (
                <QADetail
                  q={q}
                  num={idx + 1}
                  cardId={cardId}
                  hidden={isAnswerHidden(cardId)}
                  activeOpt={activeOpt}
                  selOptIdx={selectedOptionByCard[cardId] ?? 0}
                  onSelectOpt={(oi) => setSelectedOptionByCard(prev => ({ ...prev, [cardId]: oi }))}
                  onToggle={() => toggleCardAnswer(cardId)}
                  onPlayQ={() => playAudio(q.audio_q, q.question_ko)}
                  onPlayAnswer={() => {
                    const si = selectedOptionByCard[cardId] ?? 0;
                    if (activeOpt.audio) playAudio(activeOpt.audio, activeOpt.ko);
                    else if (si === 0 && q.audio_a) playAudio(q.audio_a, activeOpt.ko);
                    else playAudio(null, activeOpt.ko);
                  }}
                  accent="blue"
                  ansFallback="Standar"
                  subLabel={q.category_title || q.category}
                  posLabel={`${idx + 1}/${filteredInterview.length}`}
                  onPrev={() => setSelInt(Math.max(0, idx - 1))}
                  onNext={() => setSelInt(Math.min(filteredInterview.length - 1, idx + 1))}
                />
              );
            }}
            onPick={(i) => {
              if (playerUI.on && playerUI.tab === 'interview') { setSelInt(i); jumpPlayer(i); return; }
              setSelInt(i === selInt ? -1 : i);
              const q = filteredInterview[i];
              if (q && i !== selInt) playAudio(q.audio_q, q.question_ko);
            }}
            onPlayRow={(i) => {
              setSelInt(i);
              startPlayer('interview', filteredInterview, i, 'sequential');
            }}
          />
        </div>
      )}

      {/* Physical Commands Tab (Lengkap 48 Gerakan, Tanpa Paginasi Sempit, Zero Nested Box) */}
      {activeTab === 'commands' && (
        <div className="space-y-4">
          <div className="space-y-3 pb-3 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{mergedPhysicalCommands.length} Perintah Gerakan Fisik Penguji (따라하세요)</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Diujikan saat berdiri di depan penguji: refleks tangan/jari, kaki/postur, kepala/mata/hidung/telinga, dan arah.
                </p>
              </div>

              <Button size="sm" onClick={() => onStartPracticeCategory && onStartPracticeCategory('physical')} className="shrink-0">
                <span>Latih di Flashcard</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: 'all', label: `Semua (${mergedPhysicalCommands.length})` },
                { id: 'Tangan & Jari', label: `Tangan & Jari (${mergedPhysicalCommands.filter(c => c.group === 'Tangan & Jari').length})` },
                { id: 'Kaki & Postur Tubuh', label: `Kaki & Postur Tubuh (${mergedPhysicalCommands.filter(c => c.group === 'Kaki & Postur Tubuh').length})` },
                { id: 'Kepala, Mata, Hidung & Telinga', label: `Kepala, Mata, Hidung & Telinga (${mergedPhysicalCommands.filter(c => c.group === 'Kepala, Mata, Hidung & Telinga').length})` },
                { id: 'Arah & Pandangan', label: `Arah & Pandangan (${mergedPhysicalCommands.filter(c => c.group === 'Arah & Pandangan').length})` },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCmdFilter(f.id)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg font-semibold transition-all border',
                    cmdFilter === f.id
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-card text-muted-foreground hover:text-foreground border-border'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari perintah fisik (misal: 오른손, 오른발, 눈, 귀, 코, 손가락, tangan, kaki, mata, telinga)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-card border border-input rounded-lg text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring"
              />
            </div>
          </div>

          {filteredCommands.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              Tidak ada perintah gerak fisik yang cocok dengan pencarian.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredCommands.map((cmd, idx) => {
                const cardId = `cmd_${cmd.id || idx}`;
                const hidden = isAnswerHidden(cardId);

                return (
                  <div
                    key={cardId}
                    className="rounded-xl border border-border bg-card p-3.5 sm:p-4 flex flex-col justify-between transition-colors hover:border-border/80"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-bold text-muted-foreground">
                          #{idx + 1} · {cmd.group}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-7 px-2.5 text-xs gap-1"
                            onClick={() => playAudio(cmd.audio_q, cmd.command_ko)}
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                            <span>Dengar</span>
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toggleCardAnswer(cardId)}
                            title={hidden ? 'Buka arti' : 'Tutup arti'}
                          >
                            {hidden ? <EyeOff className="h-3.5 w-3.5 text-warn" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </div>

                      <h4 className="text-lg sm:text-xl font-bold text-foreground font-kr tracking-tight leading-snug">
                        {cmd.command_ko}
                      </h4>
                      {cmd.command_ro && (
                        <p className="text-xs text-muted-foreground font-mono">{cmd.command_ro}</p>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2.5 border-t border-border/60">
                      {hidden ? (
                        <button
                          type="button"
                          onClick={() => toggleCardAnswer(cardId)}
                          className="w-full text-left text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5"
                        >
                          <EyeOff className="h-3.5 w-3.5 text-warn shrink-0" />
                          <span>Arti & refleks disembunyikan (ketuk untuk membuka)</span>
                        </button>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400">
                            {cmd.command_id}
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-snug">
                            <strong>Refleks:</strong> {cmd.action_desc}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}


      {/* 4. JAGISOGE (SELF INTRO) */}
      {activeTab === 'jagisoge' && (
        <div className="space-y-6 animate-fade-in">
          <div className="border-b border-border pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-[10px]">
                WAJIB HAFAL MATI ({studyData.jagisoge.duration})
              </Badge>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {studyData.jagisoge.points}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {studyData.jagisoge.title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
              {studyData.jagisoge.duration_note}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setJagiSubTab('generator')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                jagiSubTab === 'generator'
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary/60'
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generator Kustom (Data Diri Anda)
            </button>
            <button
              type="button"
              onClick={() => setJagiSubTab('samples')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                jagiSubTab === 'samples'
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary/60'
              )}
            >
              <Users className="w-3.5 h-3.5" />
              10 Contoh Variasi Peserta ({JAGISOGE_SAMPLES.length})
            </button>
          </div>

          {jagiSubTab === 'generator' ? (
            <div className="space-y-6">
              {/* Form Input Data Diri - Single Flat Container */}
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Isi Data Diri Anda</h3>
                    <p className="text-xs text-muted-foreground">
                      Angka usia dan jumlah keluarga otomatis dikonversi ke Angka Asli Korea (고유어 수).
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">Auto-Convert</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={jagiForm.nama}
                      onChange={(e) => setJagiForm({ ...jagiForm, nama: e.target.value })}
                      placeholder="Contoh: BUDI SANTOSO"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">
                      Usia (Tahun)
                    </label>
                    <input
                      type="number"
                      min={18}
                      max={50}
                      value={jagiForm.umur}
                      onChange={(e) => setJagiForm({ ...jagiForm, umur: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">
                      Jumlah Keluarga (Orang)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={jagiForm.keluarga}
                      onChange={(e) => setJagiForm({ ...jagiForm, keluarga: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">
                      Status Pernikahan
                    </label>
                    <select
                      value={jagiForm.nikah}
                      onChange={(e) => setJagiForm({ ...jagiForm, nikah: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                    >
                      <option value="아직 결혼하지 않았습니다">Belum Menikah (아직 결혼하지 않았습니다)</option>
                      <option value="결혼했습니다">Sudah Menikah (결혼했습니다)</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2 lg:col-span-4">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">
                      Pengalaman & Fokus Sektor
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-0.5">
                      {JAGI_FOKUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setJagiForm({ ...jagiForm, fokus: opt.id })}
                          className={cn(
                            'text-left p-2.5 rounded-lg border transition-all cursor-pointer',
                            jagiForm.fokus === opt.id
                              ? 'border-primary bg-primary/5 text-foreground'
                              : 'border-border bg-background text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <p className="text-xs font-bold">{opt.label}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Script Naskah Utuh Kustom */}
              {(() => {
                const customSentences = getJagiSentences();
                const fullScriptKo = customSentences.map((s) => s.ko).join(' ');
                return (
                  <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          Naskah Lengkap Siap Ucap
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-foreground">
                          Urutan Kalimat Perkenalan Diri ({customSentences.length} Bagian)
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={copyJagi}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {jagiCopied ? 'Tersalin!' : 'Salin Teks'}
                        </button>
                        <button
                          type="button"
                          onClick={() => playAudio(null, fullScriptKo)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          Putar Seluruh Naskah
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-border">
                      {customSentences.map((item) => (
                        <div key={item.no} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {item.no}
                          </span>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                {item.title} · {item.durasi}
                              </span>
                              <button
                                type="button"
                                onClick={() => playAudio(null, item.ko)}
                                className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                <Volume2 className="w-3 h-3" />
                                Dengarkan
                              </button>
                            </div>
                            <p className="text-base sm:text-lg font-black text-foreground leading-snug break-keep">
                              {item.ko}
                            </p>
                            <p className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                              "{item.id}"
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* 5 Kalimat Dasar & Checklist Penguji */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      5 Struktur Kalimat Dasar HRD Korea
                    </h3>
                    {studyData.jagisoge.audio_examiner && (
                      <button
                        type="button"
                        onClick={() => playAudio(studyData.jagisoge.audio_examiner, '자기소개를 해 보세요')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary hover:bg-primary hover:text-primary-foreground text-[11px] font-semibold text-foreground transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" /> Perintah Penguji
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-border">
                    {studyData.jagisoge.sentences.map((s, idx) => (
                      <div key={idx} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-primary">{s.step}</span>
                          <button
                            type="button"
                            onClick={() => playAudio(null, s.ko)}
                            className="text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-foreground">{s.ko}</p>
                        <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">[{s.ro}]</p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400">"{s.id}"</p>
                        {s.tips && <p className="text-[11px] text-muted-foreground">{s.tips}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {studyData.jagisoge.examiner_checklist && (
                  <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2.5">
                      Checklist Penilaian Penguji Saat Jagisoge
                    </h3>
                    <ul className="space-y-2.5">
                      {studyData.jagisoge.examiner_checklist.map((pt, i) => (
                        <li key={i} className="text-xs text-foreground leading-relaxed">
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selector 10 Variasi */}
              <div className="flex flex-wrap gap-1.5">
                {JAGISOGE_SAMPLES.map((v, idx) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setActiveSampleIdx(idx)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer',
                      activeSampleIdx === idx
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary/60'
                    )}
                  >
                    {v.title}
                  </button>
                ))}
              </div>

              {(() => {
                const chosen = JAGISOGE_SAMPLES[activeSampleIdx] || JAGISOGE_SAMPLES[0];
                const fullKo = chosen.sentences.map((s) => s.ko).join(' ');
                return (
                  <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          {chosen.koTitle}
                        </span>
                        <h3 className="text-base font-bold text-foreground">{chosen.title}</h3>
                        <p className="text-xs text-muted-foreground">{chosen.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => playAudio(null, fullKo)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Putar Semua Kalimat
                      </button>
                    </div>

                    <div className="divide-y divide-border">
                      {chosen.sentences.map((s, idx) => (
                        <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Kalimat #{idx + 1}
                            </span>
                            <p className="text-sm sm:text-base font-bold text-foreground break-keep">
                              {s.ko}
                            </p>
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                              "{s.id}"
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => playAudio(null, s.ko)}
                            className="w-8 h-8 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                            title="Putar Audio"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* 5. TIME (JAM & WAKTU) */}
      {activeTab === 'time' && (
        <div className="space-y-6 animate-fade-in">
          <div className="border-b border-border pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="border-sky-500/30 text-sky-600 dark:text-sky-400 text-[10px]">
                ATURAN KOMBINASI ANGKA
              </Badge>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Jam (Native) + Menit (Sino)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Panduan Membaca Jam & Waktu Kerja (시간)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
              {studyData.time.formula}
            </p>
          </div>

          {/* Kosakata Keterangan Waktu (Semua 15 Item Tanpa Paginasi) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Kosakata Keterangan Waktu ({studyData.time.terms.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {studyData.time.terms.map((t, idx) => (
                <div
                  key={idx}
                  onClick={() => playAudio(t.audio, t.ko)}
                  className="rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition-colors cursor-pointer flex flex-col justify-between gap-1.5"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-base font-black text-foreground">{t.ko}</span>
                    <Volume2 className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                  <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                    [{t.ro}]
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {t.id}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contoh Praktik Jam */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Contoh Pembacaan Jam Lengkap ({studyData.time.examples.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {studyData.time.examples.map((ex, idx) => (
                <div
                  key={idx}
                  onClick={() => playAudio(ex.audio, ex.ko)}
                  className="rounded-xl border border-border bg-card p-3.5 hover:border-primary/40 transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-secondary text-foreground font-mono text-xs font-bold">
                      {ex.time}
                    </span>
                    <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-sm sm:text-base font-black text-foreground break-keep">
                    {ex.ko}
                  </p>
                  <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                    [{ex.ro}]
                  </p>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {ex.id}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tanya Jawab Lisan Jam */}
          {studyData.time.interview_qa && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Tanya Jawab Wawancara Seputar Jam ({studyData.time.interview_qa.length})
              </h3>
              <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
                {studyData.time.interview_qa.map((qa, idx) => (
                  <div key={idx} className="p-3.5 sm:p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Pertanyaan Penguji #{idx + 1}
                        </span>
                        <p className="text-sm sm:text-base font-bold text-foreground">
                          Q: {qa.q_ko}
                        </p>
                        {qa.q_ro && (
                          <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                            [{qa.q_ro}]
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">"{qa.q_id}"</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => playAudio(qa.audio, qa.q_ko)}
                        className="px-2.5 py-1 rounded-md bg-secondary hover:bg-primary hover:text-primary-foreground text-[11px] font-semibold text-foreground flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" /> Q
                      </button>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Format Jawaban Sopan
                        </span>
                        <p className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400">
                          A: {qa.a_ko}
                        </p>
                        <p className="text-xs text-muted-foreground">"{qa.a_id}"</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => playAudio(null, qa.a_ko)}
                        className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" /> A
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bank Soal Jam Lisan */}
          <BankSoalSection
            title="Latihan Soal Jam & Waktu dari Bank Soal"
            questions={jamLisanQuestions}
            isAnswerHidden={isAnswerHidden}
            toggleCardAnswer={toggleCardAnswer}
            playAudio={playAudio}
            playingAudio={playingAudio}
          />
        </div>
      )}

      {/* 6. CALENDAR (HARI, BULAN, TANGGAL) */}
      {activeTab === 'calendar' && (
        <div className="space-y-6 animate-fade-in">
          <div className="border-b border-border pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-[10px]">
                KALENDER & TANGGAL LAHIR
              </Badge>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Wajib Ingat Pengecualian Juni (유월) & Oktober (시월)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Nama Hari, Bulan & Tanggal (요일 · 날짜)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
              Seluruh bulan dan tanggal menggunakan Angka Sino-Korea. Ketuk kartu untuk mendengarkan pelafalan.
            </p>
          </div>

          {/* Nama Hari */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Nama Hari & Akhir Pekan ({studyData.calendar.days.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {studyData.calendar.days.map((d, idx) => (
                <div
                  key={idx}
                  onClick={() => playAudio(d.audio, d.ko)}
                  className="rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{d.id}</span>
                    <Volume2 className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <p className="text-base font-black text-foreground">{d.ko}</p>
                  <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                    [{d.ro}]
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Keterangan Hari Relatif */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Kosakata Hari, Minggu & Bulan Relatif ({studyData.calendar.rel_days.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {studyData.calendar.rel_days.map((r, idx) => (
                <div
                  key={idx}
                  onClick={() => playAudio(r.audio, r.ko)}
                  className="rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-foreground">{r.ko}</span>
                    <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                    [{r.ro}]
                  </p>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {r.id}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 12 Bulan */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              12 Nama Bulan (월 - Wol) - Perhatikan Juni (유월) & Oktober (시월)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {studyData.calendar.months.map((m, idx) => {
                const isSpecial = m.note && m.note !== 'Normal';
                return (
                  <div
                    key={idx}
                    onClick={() => playAudio(m.audio, m.ko)}
                    className={cn(
                      'rounded-xl border p-3 transition-colors cursor-pointer space-y-1',
                      isSpecial
                        ? 'border-rose-500/40 bg-rose-500/5 hover:border-rose-500'
                        : 'border-border bg-card hover:border-primary/40'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground">
                        {m.id}
                      </span>
                      <Volume2 className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <p className="text-base font-black text-foreground">{m.ko}</p>
                    <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                      [{m.ro}]
                    </p>
                    {isSpecial && (
                      <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 leading-tight">
                        {m.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tanya Jawab Kalender */}
          {studyData.calendar.interview_qa && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Tanya Jawab Wawancara Hari & Tanggal Lahir ({studyData.calendar.interview_qa.length})
              </h3>
              <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
                {studyData.calendar.interview_qa.map((qa, idx) => (
                  <div key={idx} className="p-3.5 sm:p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm sm:text-base font-bold text-foreground">
                          Q: {qa.q_ko}
                        </p>
                        {qa.q_ro && (
                          <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                            [{qa.q_ro}]
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">"{qa.q_id}"</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => playAudio(qa.audio, qa.q_ko)}
                        className="px-2.5 py-1 rounded-md bg-secondary hover:bg-primary hover:text-primary-foreground text-[11px] font-semibold text-foreground flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" /> Q
                      </button>
                    </div>
                    <div className="pt-2 border-t border-border/60 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400">
                          A: {qa.a_ko}
                        </p>
                        <p className="text-xs text-muted-foreground">"{qa.a_id}"</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => playAudio(null, qa.a_ko)}
                        className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" /> A
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bank Soal Tanggal Lisan */}
          <BankSoalSection
            title="Latihan Soal Hari, Bulan & Tanggal dari Bank Soal"
            questions={tanggalLisanQuestions}
            isAnswerHidden={isAnswerHidden}
            toggleCardAnswer={toggleCardAnswer}
            playAudio={playAudio}
            playingAudio={playingAudio}
          />
        </div>
      )}

      {/* 7. COLORS (TES BUTA WARNA & WARNA) */}
      {activeTab === 'colors' && (
        <div className="space-y-6 animate-fade-in">
          <div className="border-b border-border pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="border-pink-500/30 text-pink-600 dark:text-pink-400 text-[10px]">
                TES BUTA WARNA & OBJEK
              </Badge>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {studyData.colors.items.length} Warna Utama
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Kosakata Warna & Tes Buta Warna (색깔 · 색각검사)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
              Ketuk kartu warna untuk mendengarkan pelafalan dan alasan menyukai warna tersebut saat wawancara.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {studyData.colors.items.map((c, idx) => (
              <div
                key={idx}
                onClick={() => playAudio(c.audio, c.ko)}
                className="rounded-xl border border-border bg-card p-3.5 hover:border-primary/40 transition-colors cursor-pointer flex items-start gap-3"
              >
                <div
                  className="w-10 h-10 rounded-lg border border-border shrink-0 shadow-inner mt-0.5"
                  style={{ backgroundColor: c.hex }}
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-sm sm:text-base font-black text-foreground leading-snug">
                      {c.ko}
                    </p>
                    <Volume2 className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                  <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                    [{c.ro}]
                  </p>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {c.id}
                  </p>
                  {c.reason && (
                    <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/60 leading-snug">
                      {c.reason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {studyData.colors.interview_qa && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Tanya Jawab Tes Warna Saat Wawancara ({studyData.colors.interview_qa.length})
              </h3>
              <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
                {studyData.colors.interview_qa.map((qa, idx) => (
                  <div key={idx} className="p-3.5 sm:p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm sm:text-base font-bold text-foreground">
                          Q: {qa.q_ko}
                        </p>
                        {qa.q_ro && (
                          <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                            [{qa.q_ro}]
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">"{qa.q_id}"</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => playAudio(qa.audio, qa.q_ko)}
                        className="px-2.5 py-1 rounded-md bg-secondary hover:bg-primary hover:text-primary-foreground text-[11px] font-semibold text-foreground flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" /> Q
                      </button>
                    </div>
                    <div className="pt-2 border-t border-border/60 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400">
                          A: {qa.a_ko}
                        </p>
                        <p className="text-xs text-muted-foreground">"{qa.a_id}"</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => playAudio(null, qa.a_ko)}
                        className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" /> A
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 8. FAMILY (ANGGOTA KELUARGA) */}
      {activeTab === 'family' && (
        <div className="space-y-6 animate-fade-in">
          <div className="border-b border-border pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="border-teal-500/30 text-teal-600 dark:text-teal-400 text-[10px]">
                KOSAKATA KELUARGA INTI
              </Badge>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {studyData.family.items.length} Anggota Keluarga
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Silsilah & Anggota Keluarga (가족 관계)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
              Jumlah anggota keluarga wajib dihitung menggunakan Angka Asli Korea + 명 (myeong).
            </p>
          </div>

          {studyData.family.rules && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Aturan Penting Menyebut Keluarga di Wawancara
              </h3>
              <ul className="space-y-1.5">
                {studyData.family.rules.map((r, i) => (
                  <li key={i} className="text-xs text-foreground leading-relaxed flex items-start gap-2">
                    <span className="font-bold text-primary">{i + 1}.</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {studyData.family.items.map((f, idx) => (
              <div
                key={idx}
                onClick={() => playAudio(f.audio, f.ko)}
                className="rounded-xl border border-border bg-card p-3.5 hover:border-primary/40 transition-colors cursor-pointer space-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-base font-black text-foreground">{f.ko}</p>
                  <Volume2 className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                </div>
                <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                  [{f.ro}]
                </p>
                <p className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {f.id}
                </p>
              </div>
            ))}
          </div>

          {studyData.family.interview_qa && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Tanya Jawab Wawancara Seputar Keluarga ({studyData.family.interview_qa.length})
              </h3>
              <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
                {studyData.family.interview_qa.map((qa, idx) => (
                  <div key={idx} className="p-3.5 sm:p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm sm:text-base font-bold text-foreground">
                          Q: {qa.q_ko}
                        </p>
                        {qa.q_ro && (
                          <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                            [{qa.q_ro}]
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">"{qa.q_id}"</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => playAudio(qa.audio, qa.q_ko)}
                        className="px-2.5 py-1 rounded-md bg-secondary hover:bg-primary hover:text-primary-foreground text-[11px] font-semibold text-foreground flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" /> Q
                      </button>
                    </div>
                    <div className="pt-2 border-t border-border/60 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400">
                          A: {qa.a_ko}
                        </p>
                        <p className="text-xs text-muted-foreground">"{qa.a_id}"</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => playAudio(null, qa.a_ko)}
                        className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" /> A
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 9. PIKTOGRAM (RAMBU K3 VISUAL) */}
      {activeTab === 'piktogram' && (() => {
        const allPik = allQuestions.filter((q) => q.category === 'piktogram');
        const pikGroups = [
          { id: 'all', label: 'Semua Rambu', count: allPik.length },
          { id: 'wajib', label: '지시 (Wajib APD)', count: allPik.filter((x) => (x.category_title || '').includes('지시')).length },
          { id: 'peringatan', label: '경고 (Bahaya)', count: allPik.filter((x) => (x.category_title || '').includes('경고')).length },
          { id: 'larangan', label: '금지 (Larangan)', count: allPik.filter((x) => (x.category_title || '').includes('금지')).length },
          { id: 'evakuasi', label: '안내·소방 (Evakuasi & Pemadam)', count: allPik.filter((x) => /안내|소방/.test(x.category_title || '')).length },
        ];
        const filteredPik = allPik.filter((item) => {
          if (pikGroup === 'wajib' && !(item.category_title || '').includes('지시')) return false;
          if (pikGroup === 'peringatan' && !(item.category_title || '').includes('경고')) return false;
          if (pikGroup === 'larangan' && !(item.category_title || '').includes('금지')) return false;
          if (pikGroup === 'evakuasi' && !/안내|소방/.test(item.category_title || '')) return false;
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return `${item.title_ko || ''} ${item.title_id || ''} ${item.answer_short_ko || ''} ${item.answer_short_id || ''}`.toLowerCase().includes(q);
          }
          return true;
        });

        return (
          <div className="space-y-5 animate-fade-in">
            <div className="border-b border-border pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px]">
                  TES VISUAL GAMBAR K3
                </Badge>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {allPik.length} Rambu Resmi
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Katalog Rambu Keselamatan Kerja (안전 표지판)
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
                Ketuk gambar rambu untuk memperbesar dan dengarkan pelafalan resminya.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {pikGroups.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setPikGroup(cat.id)}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5',
                      pikGroup === cat.id
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary/60'
                    )}
                  >
                    <span>{cat.label}</span>
                    <span className="text-[10px] opacity-80">({cat.count})</span>
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari rambu Korea / Indo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPik.map((item) => {
                const cardId = `pik_${item.id}`;
                const hidden = isAnswerHidden(cardId);
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border bg-card p-3.5 flex flex-col justify-between gap-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {item.image_url && (
                        <button
                          type="button"
                          onClick={() => setInspectRambu(item)}
                          className="w-16 h-16 rounded-lg border border-border bg-white p-1.5 shrink-0 flex items-center justify-center relative group cursor-pointer"
                          title="Perbesar Gambar"
                        >
                          <img
                            src={getAssetUrl(item.image_url)}
                            alt={item.title_id || item.answer_short_id}
                            className="max-w-full max-h-full object-contain"
                            loading="lazy"
                          />
                          <span className="absolute bottom-1 right-1 w-4 h-4 rounded bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Maximize2 className="w-2.5 h-2.5" />
                          </span>
                        </button>
                      )}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                            {item.category_title || 'Rambu K3'}
                          </span>
                          <button
                            type="button"
                            onClick={() => playAudio(item.audio_a, item.answer_short_ko || item.title_ko)}
                            className="w-7 h-7 rounded-md bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                            title="Putar Audio Jawaban"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-sm sm:text-base font-black text-foreground leading-snug break-keep">
                          {item.title_ko || item.answer_short_ko}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/60">
                      {hidden ? (
                        <button
                          type="button"
                          onClick={() => toggleCardAnswer(cardId)}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-secondary/70 hover:bg-secondary text-xs font-medium text-muted-foreground flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Tampilkan Arti Rambu</span>
                        </button>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400">
                            {item.title_id || item.answer_short_id}
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-snug">
                            Kalimat Lengkap: <strong>{item.answer_short_ko}</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* 10. ALAT KERJA & APD */}
      {activeTab === 'alat' && (() => {
        const allAlat = allQuestions.filter(
          (q) => q.category === 'alat_manufaktur' || q.category === 'alat_klasik'
        );
        const alatGroups = [
          { id: 'all', label: 'Semua Alat', count: allAlat.length },
          { id: 'atas', label: 'Tingkat Atas (상)', count: allAlat.filter((x) => x.level === 'Atas' || x.level === 'Tinggi').length },
          { id: 'menengah', label: 'Tingkat Menengah (중)', count: allAlat.filter((x) => x.level === 'Menengah' || x.level === 'Sedang').length },
          { id: 'dasar', label: 'Tingkat Dasar (하)', count: allAlat.filter((x) => x.level === 'Dasar' || x.level === 'Rendah').length },
          { id: 'apd', label: 'APD & Klasik', count: allAlat.filter((x) => x.level === 'Wajib' || x.category === 'alat_klasik').length },
        ];
        const filteredAlatList = allAlat.filter((item) => {
          if (alatGroup === 'atas' && !(item.level === 'Atas' || item.level === 'Tinggi')) return false;
          if (alatGroup === 'menengah' && !(item.level === 'Menengah' || item.level === 'Sedang')) return false;
          if (alatGroup === 'dasar' && !(item.level === 'Dasar' || item.level === 'Rendah')) return false;
          if (alatGroup === 'apd' && !(item.level === 'Wajib' || item.category === 'alat_klasik')) return false;
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return `${item.title_ko || ''} ${item.title_id || ''} ${item.answer_short_ko || ''} ${item.answer_short_id || ''} ${item.usage_short_ko || ''} ${item.usage_short_id || ''}`.toLowerCase().includes(q);
          }
          return true;
        });

        return (
          <div className="space-y-5 animate-fade-in">
            <div className="border-b border-border pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="border-orange-500/30 text-orange-600 dark:text-orange-400 text-[10px]">
                  IDENTIFIKASI OBJEK & FUNGSI
                </Badge>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {allAlat.length} Alat & APD
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Katalog Alat Kerja Pabrik & APD (작업 공구 및 보호구)
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
                Hafalkan nama alat beserta kalimat fungsinya ketika penguji menunjuk foto atau benda kerja di meja.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {alatGroups.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setAlatGroup(cat.id)}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5',
                      alatGroup === cat.id
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary/60'
                    )}
                  >
                    <span>{cat.label}</span>
                    <span className="text-[10px] opacity-80">({cat.count})</span>
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama alat Korea / Indo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredAlatList.map((item) => {
                const cardId = `alat_${item.id}`;
                const hidden = isAnswerHidden(cardId);
                const usageObj = studyData.manufacturing?.tool_usages_catalog?.[item.id];
                const usageKo = item.usage_short_ko || usageObj?.usage_short_ko;
                const usageId = item.usage_short_id || usageObj?.usage_short_id;

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border bg-card p-3.5 flex flex-col justify-between gap-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {item.image_url && (
                        <button
                          type="button"
                          onClick={() => setInspectRambu(item)}
                          className="w-16 h-16 rounded-lg border border-border bg-white p-1.5 shrink-0 flex items-center justify-center relative group cursor-pointer"
                          title="Perbesar Gambar"
                        >
                          <img
                            src={getAssetUrl(item.image_url)}
                            alt={item.title_id || item.answer_short_id}
                            className="max-w-full max-h-full object-contain"
                            loading="lazy"
                          />
                          <span className="absolute bottom-1 right-1 w-4 h-4 rounded bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Maximize2 className="w-2.5 h-2.5" />
                          </span>
                        </button>
                      )}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                            Level: {item.level || 'Standar'}
                          </span>
                          <button
                            type="button"
                            onClick={() => playAudio(item.audio_a, item.answer_short_ko || item.title_ko)}
                            className="w-7 h-7 rounded-md bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                            title="Putar Audio Jawaban"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-sm sm:text-base font-black text-foreground leading-snug break-keep">
                          {item.title_ko || item.answer_short_ko}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Jawaban: <strong className="text-foreground">{item.answer_short_ko}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/60">
                      {hidden ? (
                        <button
                          type="button"
                          onClick={() => toggleCardAnswer(cardId)}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-secondary/70 hover:bg-secondary text-xs font-medium text-muted-foreground flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Tampilkan Nama & Kegunaan</span>
                        </button>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400">
                            {item.title_id || item.answer_short_id}
                          </p>
                          {usageKo && (
                            <div className="pt-1 border-t border-border/40 space-y-0.5">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                  Fungsi (용도):
                                </span>
                                <button
                                  type="button"
                                  onClick={() => playAudio(null, usageKo)}
                                  className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                                >
                                  Putar Fungsi
                                </button>
                              </div>
                              <p className="text-xs font-bold text-foreground break-keep">{usageKo}</p>
                              <p className="text-[11px] text-muted-foreground">{usageId}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* 11. MANUFACTURING (PRAKTIK KERJA MANUFAKTUR) */}
      {activeTab === 'manufacturing' && (
        <div className="space-y-7 animate-fade-in">
          <div className="border-b border-border pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px]">
                TES PRAKTIK MEJA PENGUJI
              </Badge>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Perakitan, Pengukuran & Instruksi Alat
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {studyData.manufacturing.title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
              Pelajari 3 pos ujian praktik meja, tanya jawab fungsi alat, perintah mengambil alat, dan skenario situasi pabrik.
            </p>
          </div>

          {/* Bagian 1: 3 Pos Tugas Praktik Utama */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              1. Tiga Pos Praktik Utama di Meja Ujian ({studyData.manufacturing.practical_tasks.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {studyData.manufacturing.practical_tasks.map((task, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-card p-4 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {task.task_num}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-foreground">
                      {task.task_name}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {task.desc}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-border/60">
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-snug">
                      <strong>Fokus Penilaian:</strong> {task.evaluation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bagian 2: Tanya Jawab Fungsi Alat Kerja */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              2. Tanya Jawab Fungsi Alat Kerja ({studyData.manufacturing.tool_functions.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {studyData.manufacturing.tool_functions.map((tf) => (
                <div
                  key={tf.id}
                  onClick={() => playAudio(tf.audio_a, tf.answer_short_ko)}
                  className="rounded-xl border border-border bg-card p-3.5 hover:border-primary/40 transition-colors cursor-pointer space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        {tf.title_id}
                      </span>
                      <Volume2 className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    </div>
                    <p className="text-xs font-semibold text-foreground break-keep">
                      Q: {tf.question_ko}
                    </p>
                    <p className="text-[11px] text-muted-foreground">"{tf.question_id}"</p>
                  </div>
                  <div className="pt-2 border-t border-border/60 space-y-0.5">
                    <p className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-400 break-keep">
                      A: {tf.answer_short_ko}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      "{tf.answer_short_id}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bagian 3: Instruksi Ambil & Serahkan Alat */}
          {studyData.manufacturing.tool_action_commands && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                3. Perintah Mengambil, Memilih & Menyerahkan Alat ({studyData.manufacturing.tool_action_commands.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {studyData.manufacturing.tool_action_commands.map((cmd) => (
                  <div
                    key={cmd.id}
                    onClick={() => playAudio(cmd.audio_q, cmd.question_ko)}
                    className="rounded-xl border border-border bg-card p-3.5 hover:border-primary/40 transition-colors cursor-pointer space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          {cmd.title_id}
                        </span>
                        <p className="text-sm sm:text-base font-black text-foreground break-keep mt-0.5">
                          "{cmd.question_ko}"
                        </p>
                      </div>
                      <Volume2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    </div>
                    {cmd.question_romaja && (
                      <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                        [{cmd.question_romaja}]
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">{cmd.question_id}</p>
                    <div className="pt-2 border-t border-border/60">
                      <p className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        Respon: "{cmd.answer_short_ko}"
                      </p>
                      <p className="text-[11px] text-muted-foreground">"{cmd.answer_short_id}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bagian 4: Skenario Situasi Kritis Pabrik */}
          {studyData.manufacturing.scenarios && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                4. Skenario Situasi Kerja & Lembur di Pabrik ({studyData.manufacturing.scenarios.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {studyData.manufacturing.scenarios.map((sc, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          {sc.key_attitude}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-foreground">{sc.situation}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => playAudio(sc.audio, sc.q_ko)}
                        className="px-2 py-1 rounded-md bg-secondary hover:bg-primary hover:text-primary-foreground text-[11px] font-semibold text-foreground flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" /> Q
                      </button>
                    </div>
                    <p className="text-sm font-bold text-foreground">Q: {sc.q_ko}</p>
                    <p className="text-xs text-muted-foreground">"{sc.q_id}"</p>
                    <div className="pt-2 border-t border-border/60 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400">
                          A: {sc.a_ko}
                        </p>
                        <button
                          type="button"
                          onClick={() => playAudio(null, sc.a_ko)}
                          className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" /> A
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">"{sc.a_id}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bagian 5: Daftar Tier Alat HRDK */}
          {studyData.manufacturing.hrdk_tool_tiers && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                5. Pengelompokan Tingkat Alat Standar HRD Korea
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {studyData.manufacturing.hrdk_tool_tiers.map((tier, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-card p-4 space-y-2.5">
                    <div>
                      <Badge variant="secondary" className="text-[10px] mb-1">
                        {tier.tier}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{tier.desc}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tier.tools.map((t, i) => {
                        const koPart = t.split('(')[0].trim();
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => playAudio(null, koPart)}
                            className="px-2.5 py-1 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-xs font-semibold text-foreground transition-colors cursor-pointer text-left"
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 12. NUMBERS (ANGKA SINO, NATIVE & SATUAN HITUNG) */}
      {activeTab === 'numbers' && (
        <div className="space-y-7 animate-fade-in">
          <div className="border-b border-border pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400 text-[10px]">
                DUA SISTEM ANGKA KOREA
              </Badge>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Ketuk Kartu untuk Dengarkan Audio
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Panduan Sistem Angka Sino-Korea, Asli Korea & Satuan Hitung
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
              Ketuk kartu angka atau satuan mana saja untuk langsung mendengarkan pelafalan Koreanya.
            </p>
          </div>

          {studyData.numbers.rules && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Aturan Kapan Memakai Angka Sino vs Angka Asli Korea
              </h3>
              <ul className="space-y-1.5">
                {studyData.numbers.rules.map((r, i) => (
                  <li key={i} className="text-xs text-foreground leading-relaxed flex items-start gap-2">
                    <span className="font-bold text-primary">{i + 1}.</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sino-Korean Numbers */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                1. Angka Sino-Korea (한자어 수) - Tanggal, Bulan, Tahun, Menit, Detik, Uang & Nomor
              </h3>
              <p className="text-xs text-muted-foreground">
                Ketuk kartu untuk memutar pelafalan angka Sino-Korea.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {studyData.numbers.sino.map((n, idx) => (
                <div
                  key={idx}
                  onClick={() => playAudio(n.audio, n.ko)}
                  className="rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition-colors cursor-pointer space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-primary">
                      {n.val}
                    </span>
                    <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-base sm:text-lg font-black text-foreground">{n.ko}</p>
                  <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                    [{n.ro}]
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Native Korean Numbers */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                2. Angka Asli Korea / Native (고유어 수) - Jam, Umur, Jumlah Barang & Orang
              </h3>
              <p className="text-xs text-muted-foreground">
                Perhatikan angka 1, 2, 3, 4, dan 20 berubah bentuk menjadi 한, 두, 세, 네, 스무 saat diikuti satuan hitung!
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {studyData.numbers.native.map((n, idx) => (
                <div
                  key={idx}
                  onClick={() => playAudio(n.audio, n.ko.split('(')[0].trim())}
                  className="rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition-colors cursor-pointer space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {n.val}
                    </span>
                    <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-base sm:text-lg font-black text-foreground">{n.ko}</p>
                  <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                    [{n.ro}]
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Satuan Hitung (Units) */}
          {studyData.numbers.units && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                3. Satuan Hitung Benda & Pabrik (단위 명사) - {studyData.numbers.units.length} Satuan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {studyData.numbers.units.map((u, idx) => (
                  <div
                    key={idx}
                    onClick={() => playAudio(u.audio, u.unit)}
                    className="rounded-xl border border-border bg-card p-3.5 hover:border-primary/40 transition-colors cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-base font-black text-foreground">
                          {u.unit}
                        </span>
                        <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 ml-1.5">
                          [{u.ro}]
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {u.type}
                      </Badge>
                    </div>
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {u.id}
                    </p>
                    {u.example && (
                      <p className="text-xs text-muted-foreground pt-1 border-t border-border/60">
                        Contoh: <strong className="text-foreground">{u.example}</strong>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bank Soal Angka & Hitungan */}
          <BankSoalSection
            title="Latihan Soal Hitungan, Satuan & Konversi Angka"
            questions={[...hitunganQuestions, ...konversiQuestions]}
            isAnswerHidden={isAnswerHidden}
            toggleCardAnswer={toggleCardAnswer}
            playAudio={playAudio}
            playingAudio={playingAudio}
          />
        </div>
      )}

      {/* Modal Inspector untuk Gambar Piktogram & Alat */}
      {inspectRambu && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setInspectRambu(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {inspectRambu.category_title || 'Detail Gambar'}
              </span>
              <button
                type="button"
                onClick={() => setInspectRambu(null)}
                className="w-7 h-7 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {inspectRambu.image_url && (
              <div className="w-full h-56 rounded-xl border border-border bg-white p-4 flex items-center justify-center">
                <img
                  src={getAssetUrl(inspectRambu.image_url)}
                  alt={inspectRambu.title_id || inspectRambu.answer_short_id}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-black text-foreground">
                  {inspectRambu.title_ko || inspectRambu.answer_short_ko}
                </p>
                <button
                  type="button"
                  onClick={() => playAudio(inspectRambu.audio_a, inspectRambu.answer_short_ko || inspectRambu.title_ko)}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Dengarkan
                </button>
              </div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {inspectRambu.title_id || inspectRambu.answer_short_id}
              </p>
              <p className="text-xs text-muted-foreground pt-2 border-t border-border leading-relaxed">
                Jawaban Lengkap: <strong className="text-foreground">{inspectRambu.answer_full_ko || inspectRambu.answer_short_ko}</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BankSoalSection({
  title,
  questions,
  isAnswerHidden,
  toggleCardAnswer,
  playAudio,
}) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
          {title} ({questions.length} Soal)
        </h3>
      </div>

      <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
        {questions.map((q, idx) => {
          const cardId = `bank_${q.id || idx}`;
          const hidden = isAnswerHidden ? isAnswerHidden(cardId) : false;
          const ansKo = q.answer_short_ko || q.answer_full_ko || q.answer_ko || '';
          const ansId = q.answer_short_id || q.answer_full_id || q.answer_id || '';
          return (
            <div key={q.id || idx} className="p-3.5 sm:p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                      #{idx + 1}
                    </span>
                    {q.category_title && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {q.category_title}
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base font-black text-foreground break-keep">
                    Q: {q.question_ko}
                  </p>
                  {q.question_romaja && (
                    <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                      [{q.question_romaja}]
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">"{q.question_id}"</p>
                </div>
                <button
                  type="button"
                  onClick={() => playAudio(q.audio_q, q.question_ko)}
                  className="px-2.5 py-1 rounded-md bg-secondary hover:bg-primary hover:text-primary-foreground text-[11px] font-semibold text-foreground flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3 h-3" /> Q
                </button>
              </div>

              <div className="pt-2 border-t border-border/60">
                {hidden ? (
                  <button
                    type="button"
                    onClick={() => toggleCardAnswer && toggleCardAnswer(cardId)}
                    className="w-full py-1.5 px-3 rounded-lg bg-secondary/70 hover:bg-secondary text-xs font-medium text-muted-foreground flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Jawaban disembunyikan (ketuk untuk melihat)</span>
                  </button>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400 break-keep">
                        A: {ansKo}
                      </p>
                      <p className="text-xs text-muted-foreground">"{ansId}"</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => playAudio(q.audio_a, ansKo)}
                      className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" /> A
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
