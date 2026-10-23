import React, { useState, useRef, useMemo, useEffect } from 'react';
import studyData from '../data/studyMaterials.json';
import allQuestions from '../data/questions.json';
import {
  Volume2, Eye, EyeOff, Search, Sparkles, BookOpen,
  Calendar, Clock, Hash, Palette, Users, UserCheck,
  Factory, Wrench, CheckCircle2, ArrowRight, RotateCcw, AlertTriangle,
  Activity, ChevronRight, ChevronDown, ChevronUp, Check, ShieldAlert, Image, Headphones, Copy, Play
} from 'lucide-react';
import { getAssetUrl } from '../utils/assetHelper.js';
import { HRDK_MODULES, MODULE_COLORS } from '../utils/categoryGroups.js';
import { Badge } from './ui/badge.jsx';
import { Button } from './ui/button.jsx';
import { Card, CardContent } from './ui/card.jsx';
import { QADetail, QAList, QAPlayerDeck, QAControls, QAViewBar, SoundWave } from './QAStudy.jsx';
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

export function StudyGuide({ onStartPracticeCategory }) {
  const [activeModule, setActiveModule] = useState('interview');
  const [activeTab, setActiveTab] = useState('interview');
  const [activeSampleIdx, setActiveSampleIdx] = useState(0);
  const [hideAllAnswers, setHideAllAnswers] = useState(true);
  const [revealedCardAnswers, setRevealedCardAnswers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [playingAudio, setPlayingAudio] = useState(null);
  const [selectedOptionByCard, setSelectedOptionByCard] = useState({});
  const [k3Filter, setK3Filter] = useState('all');
  const [interviewFilter, setInterviewFilter] = useState('all');
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
  const [page, setPage] = useState({});
  const PAGE_SIZE = 8;

  // Jagisoge wizard
  const JAGI_OPTS = (studyData.jagisoge || {}).form_options || {};
  const SLOT_OPTS = {
    asal: JAGI_OPTS.asal || [{ id: '인도네시아', text: 'Indonesia' }],
    hobi: JAGI_OPTS.hobi || [{ id: '운동', text: 'olahraga' }],
    nikah: JAGI_OPTS.nikah || [{ id: '아직 결혼하지 않았습니다', text: 'belum menikah' }],
    kelebihan: JAGI_OPTS.kelebihan || [{ id: '부지런한 사람이고 빨리 적응할 수 있습니다', text: 'rajin dan cepat beradaptasi' }],
    tutup: JAGI_OPTS.tutup || [{ id: '열심히 일하겠습니다. 잘 부탁드립니다. 감사합니다', text: 'kerja rajin, mohon bimbingannya' }],
    pengalaman: ((studyData.jagisoge || {}).optional_slots || {}).pengalaman || [
      '선택한 분야(서비스/제조)의 경력이 없지만 최선을 다하겠습니다',
    ],
  };
  const [jagiForm, setJagiForm] = useState({
    nama: '', namaPanggilan: '', umur: '', tahunLahir: '', bulanLahir: '',
    keluarga: '', anggota: '', asal: '인도네시아', hobi: '운동',
    pengalaman: '선택한 분야(서비스/제조)의 경력이 없지만 최선을 다하겠습니다',
    kelebihan: '부지런한 사람이고 빨리 적응할 수 있습니다',
    tutup: '열심히 일하겠습니다. 잘 부탁드립니다. 감사합니다',
  });
  const [jagiTemplate, setJagiTemplate] = useState('standar');
  const [jagiCopied, setJagiCopied] = useState(false);
  const [jagiStep, setJagiStep] = useState(0);
  const JAGI_STEPS = ['Data Wajib', 'Opsional', 'Slot Bebas'];
  const wajibIsi = [jagiForm.nama.trim(), jagiForm.umur, jagiForm.asal, jagiForm.hobi].filter(Boolean).length;

  const optText = (key, val) => {
    const hit = (SLOT_OPTS[key] || []).find(o => o.id === val);
    return hit ? hit.text : val;
  };

  const PENGALAMAN_ID = {
    '저는 2년 동안 자동차 공장에서 일한 적이 있습니다': 'Saya pernah bekerja di pabrik mobil selama 2 tahun',
    '선택한 분야(서비스/제조)의 경력이 없지만 최선을 다하겠습니다': 'Saya belum punya pengalaman di bidang yang dipilih, tapi akan berusaha sebaik mungkin',
    '지금은 직업이 없습니다. 그래서 한국에 가서 일을 하고 싶습니다': 'Saat ini saya tidak bekerja, jadi ingin bekerja di Korea',
    '고향에서 사업을 시작하고 싶지만 돈이 없습니다. 그래서 한국에 가서 돈을 많이 벌고 싶습니다': 'Saya ingin membuka usaha di kampung halaman tapi tidak punya modal, jadi ingin mencari uang di Korea',
  };

  // Angka asli Korea 1-99 (umur, jumlah keluarga)
  const nativeKo = (n) => {
    n = parseInt(n, 10);
    if (!n || n < 1 || n > 99) return '';
    const ONE = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉'];
    const TENS = { 1: '열', 2: '스물', 3: '서른', 4: '마흔', 5: '쉰', 6: '예순', 7: '일흔', 8: '여든', 9: '아흔' };
    if (n <= 9) return ONE[n];
    const t = Math.floor(n / 10), o = n % 10;
    return TENS[t] + (o ? ONE[o] : '');
  };

  // Angka Sino-Korea (bulan)
  const sinoKo = (n) => {
    n = parseInt(n, 10);
    if (!n || n < 1) return '';
    const D = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
    if (n <= 9) return D[n];
    if (n < 100) {
      const t = Math.floor(n / 10), o = n % 10;
      return (t === 1 ? '십' : D[t] + '십') + (o ? D[o] : '');
    }
    return '';
  };

  // Tahun lahir -> sino (1990 = 천구백구십)
  const yearKo = (y) => {
    y = parseInt(y, 10);
    if (!y || y < 1000 || y > 2100) return '';
    const D = ['공', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
    const th = Math.floor(y / 1000), h = Math.floor((y % 1000) / 100);
    const t = Math.floor((y % 100) / 10), o = y % 10;
    let out = '';
    if (th) out += (th === 1 ? '' : D[th]) + '천';
    if (h) out += (h === 1 ? '' : D[h]) + '백';
    if (t) out += (t === 1 ? '' : D[t]) + '십';
    if (o) out += D[o];
    return out;
  };

  // (이)라고 rule untuk nama panggilan latin
  const ragoKo = (name) => {
    name = (name || '').trim();
    if (!name) return '';
    const last = name.slice(-1).toLowerCase();
    const particle = 'aiueo'.includes(last) ? '라고' : '이라고';
    return `${name}${particle} 불러 주시면 됩니다`;
  };

  const fillJagi = (tpl) => {
    const f = jagiForm;
    const yKo = yearKo(f.tahunLahir);
    const bKo = sinoKo(f.bulanLahir);
    const map = {
      nama: (f.nama || '').trim() || '[Nama]',
      namaPanggilKo: ragoKo(f.namaPanggil),
      namaPanggilId: f.namaPanggil ? `Bisa dipanggil ${f.namaPanggil.trim()}` : '',
      umur: f.umur || '[Umur]',
      umurKo: nativeKo(f.umur) || '[Usia]',
      lahirKo: [yKo ? `${yKo}년` : '', bKo ? `${bKo}월` : ''].filter(Boolean).join(' ') || '[Tanggal]',
      lahir: [f.tahunLahir ? `tahun ${f.tahunLahir}` : '', f.bulanLahir ? `bulan ${f.bulanLahir}` : ''].filter(Boolean).join(', ') || '[Tanggal]',
      nikah: f.nikah || '',
      nikahId: optText('nikah', f.nikah),
      keluarga: f.keluarga || '[Jumlah]',
      keluargaKo: nativeKo(f.keluarga) || '[Jumlah]',
      anggotaKo: f.anggota ? `${f.anggota.trim()} 그리고 저 있습니다` : '',
      anggotaId: f.anggota ? `${f.anggota.trim()}, dan saya` : '',
      hobi: f.hobi,
      hobiId: optText('hobi', f.hobi),
      asal: f.asal,
      pengalaman: f.pengalaman,
      pengalamanId: PENGALAMAN_ID[f.pengalaman] || f.pengalaman,
      kelebihan: f.kelebihan,
      kelebihanId: optText('kelebihan', f.kelebihan),
      tutup: f.tutup,
      tutupId: optText('tutup', f.tutup),
    };
    let s = tpl || '';
    for (const [k, v] of Object.entries(map)) {
      s = s.split(`{${k}}`).join(v ?? '');
    }
    return s.replace(/\s+/g, ' ').replace(/\s+([.,!?])/g, '$1').trim();
  };

  const activeTpl =
    ((studyData.jagisoge || {}).templates || []).find(t => t.id === jagiTemplate) ||
    ((studyData.jagisoge || {}).templates || [])[0] || { sentences: [] };

  const jagiSentences = () =>
    (activeTpl.sentences || [])
      .map(s => ({ ko: fillJagi(s.ko), id: fillJagi(s.id) }))
      .filter(s => s.ko && s.ko.length > 1);

  const copyJagi = async () => {
    const text = jagiSentences().map(s => s.ko).join(' ');
    try {
      await navigator.clipboard.writeText(text);
      setJagiCopied(true);
      setTimeout(() => setJagiCopied(false), 2000);
    } catch { setJagiCopied(false); }
  };

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

  // =========================================================================
  // PLAYER AUTOPLAY ALA EPSTOPIKHUB: soal → jeda hafalan → jawaban → lanjut.
  // Mesin memakai ref agar callback async audio/TTS selalu baca state segar.
  // =========================================================================
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
    const targetPos = 0;
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

  const resumePlayer = () => {
    const r = playerRef.current;
    if (!r.order.length) return;
    r.on = true;
    r.step = 'q';
    drivePlayer();
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

  const cycleDelay = () => {
    const steps = [1, 2, 3, 5];
    const i = steps.indexOf(playDelay);
    setPlayDelay(steps[(i + 1) % steps.length]);
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
    } else {
      return revealedCardAnswers[cardId] === true;
    }
  };

  const toggleCardAnswer = (cardId) => {
    setRevealedCardAnswers(prev => ({
      ...prev,
      [cardId]: hideAllAnswers ? !prev[cardId] : !prev[cardId]
    }));
  };

  const getPagedItems = (items, key) => {
    const total = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const p = Math.min(page[key] || 1, total);
    const start = (p - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  };

  const pageOffset = (key) => {
    return ((page[key] || 1) - 1) * PAGE_SIZE;
  };

  const getTotalPages = (items) => {
    return Math.ceil(items.length / PAGE_SIZE);
  };

  const Pagination = ({ items, pkey }) => {
    const total = getTotalPages(items);
    if (total <= 1) return null;
    const current = Math.min(page[pkey] || 1, total);
    const go = (n) => setPage(prev => ({ ...prev, [pkey]: Math.max(1, Math.min(total, n)) }));
    // Nomor halaman ringkas: 1 … c-1 c c+1 … total
    const nums = [];
    for (let n = 1; n <= total; n++) {
      if (n === 1 || n === total || Math.abs(n - current) <= 1) nums.push(n);
      else if (nums[nums.length - 1] !== '…') nums.push('…');
    }
    return (
      <div className="flex items-center justify-center gap-1.5 pt-2 flex-wrap">
        <button
          onClick={() => go(1)}
          disabled={current === 1}
          title="Halaman pertama"
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50"
        >
          «
        </button>
        <button
          onClick={() => go(current - 1)}
          disabled={current === 1}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50"
        >
          ←
        </button>
        {nums.map((n, i) => n === '…' ? (
          <span key={'e' + i} className="text-slate-400 font-bold px-1">…</span>
        ) : (
          <button
            key={n}
            onClick={() => go(n)}
            className={cn(
              'w-9 h-9 rounded-lg text-sm font-bold transition-all',
              current === n
                ? 'bg-slate-800 text-white shadow-md'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => go(current + 1)}
          disabled={current === total}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50"
        >
          →
        </button>
        <button
          onClick={() => go(total)}
          disabled={current === total}
          title="Halaman terakhir"
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50"
        >
          »
        </button>
      </div>
    );
  };

  const subTabs = [
    { id: 'interview', moduleId: 'interview', label: 'Tanya Jawab Wawancara', icon: UserCheck, count: `${interviewCount} Soal & Situasi` },
    { id: 'jagisoge', moduleId: 'interview', label: 'Jagisoge 40 Detik', icon: Sparkles, count: 'Perkenalan Diri' },
    { id: 'family', moduleId: 'interview', label: 'Keluarga & Relasi', icon: Users, count: 'Silsilah & Hitungan' },

    { id: 'commands', moduleId: 'physical', label: 'Refleks Gerak Fisik', icon: Activity, count: '47 Gerakan' },

    { id: 'k3', moduleId: 'safety', label: '30 Q&A K3 Resmi', icon: AlertTriangle, count: '30 Q&A & APD' },
    { id: 'piktogram', moduleId: 'safety', label: 'Piktogram & Rambu K3', icon: ShieldAlert, count: '98 Rambu K3' },

    { id: 'alat', moduleId: 'tools', label: 'Foto & Nama Alat Manufaktur', icon: Image, count: `${alatCount} Foto Alat` },
    { id: 'manufacturing', moduleId: 'tools', label: 'Pos Praktik & SOP Pabrik', icon: Factory, count: 'SOP & 3 Tugas' },

    { id: 'numbers', moduleId: 'numbers', label: 'Nomor & Angka Sino/Asli', icon: Hash, count: 'Sino & Asli' },
    { id: 'time', moduleId: 'numbers', label: 'Jam & Waktu', icon: Clock, count: 'Format & Soal' },
    { id: 'calendar', moduleId: 'numbers', label: 'Hari & Kalender', icon: Calendar, count: 'Hari, Bulan, Tgl' },

    { id: 'colors', moduleId: 'colors', label: 'Warna Pabrik & Tes Warna', icon: Palette, count: '11 Warna' },
  ];

  // Filter K3
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

  // Filter Interview
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

  const selK3Eff = Math.min(selK3, Math.max(0, filteredK3.length - 1));
  const selIntEff = Math.min(selInt, Math.max(0, filteredInterview.length - 1));

  const MOD_KO = {
    interview: '면접',
    physical: '신체동작',
    safety: '산업안전',
    tools: '공구 · 기능',
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
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Skill Test · Tahap 2</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">Materi & Hafalan</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Kisi-kisi resmi HRD Korea: wawancara, gerak fisik, K3, alat, hitungan.
            </p>
          </div>
          <div className="shrink-0">
            <Button
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

        {/* Module rail */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
          {HRDK_MODULES.filter(m => m.id !== 'all').map((mod, i) => {
            const active = activeModule === mod.id;
            const count = mod.categories.length === 0
              ? 'Materi'
              : `${allQuestions.filter(q => mod.categories.includes(q.category)).length} soal`;
            return (
              <button
                key={mod.id}
                onClick={() => selectModule(mod.id)}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'flex items-center gap-2.5 sm:gap-3 p-3 sm:px-4 sm:py-3.5 rounded-lg border text-left transition-all min-h-[52px]',
                  active
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-card text-foreground border-border hover:bg-secondary/70'
                )}
              >
                <span className={cn('font-mono text-xs font-bold w-7 h-7 rounded-md flex items-center justify-center shrink-0',
                  active ? 'bg-white/20 text-white' : 'bg-secondary text-muted-foreground border border-border/40')}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="hidden sm:inline-block font-kr text-base md:text-lg font-bold leading-none shrink-0 w-20 md:w-24">
                  {MOD_KO[mod.id] || mod.shortLabel}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-xs sm:text-sm font-bold truncate">
                    {mod.shortLabel.replace(/^\d+\.\s*/, '')}
                  </span>
                  <span className={cn('block text-[11px] truncate mt-0.5', active ? 'text-white/80' : 'text-muted-foreground')}>
                    <span className="sm:hidden font-kr font-bold mr-1">{MOD_KO[mod.id]} •</span>
                    {count}
                  </span>
                </span>
                {mod.points > 0 && (
                  <span className={cn('font-mono text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded shrink-0',
                    active ? 'bg-white/20 text-white' : 'bg-secondary text-muted-foreground border border-border/40')}>
                    {mod.points} Poin
                  </span>
                )}
                <ChevronRight className={cn('h-4 w-4 shrink-0', active ? 'text-white/80' : 'text-muted-foreground')} />
              </button>
            );
          })}
        </div>

        {/* Sub-nav */}
        {(() => {
          const currentSubTabs = subTabs.filter(st => st.moduleId === activeModule);
          if (currentSubTabs.length <= 1) return null;

          return (
            <div className="sticky top-14 z-30 -mx-3 px-3 sm:-mx-4 sm:px-4 bg-background/95 backdrop-blur py-2 border-b border-border mb-4">
              <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-0.5">
                {currentSubTabs.map(st => {
                  const isTabActive = activeTab === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => {
                        stopPlayer();
                        setActiveTab(st.id);
                        setSearchQuery('');
                      }}
                      className={cn(
                        'shrink-0 pb-1.5 text-xs font-medium whitespace-nowrap border-b-2 -mb-2 transition-colors min-h-[32px] flex items-center',
                        isTabActive
                          ? 'border-foreground text-foreground font-bold'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      )}>
                      <span>{st.label}</span>
                      <span className="ml-1.5 font-mono text-[10px] opacity-70 bg-secondary px-1.5 py-0.5 rounded-sm">{st.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

      {/* K3 Tab */}
      {activeTab === 'k3' && (
        <div className="space-y-4">
          <Card className="p-4 md:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>30 Tanya Jawab Standar K3 Industri HRD Korea</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mencakup APD (보호구), Pintu Darurat, APAR, Rambu K3, Pengaman Mesin, dan Lembar Data Keselamatan Bahan Kimia (MSDS).
                </p>
              </div>

              <Button onClick={() => onStartPracticeCategory && onStartPracticeCategory('safety')}>
                <span>Latih K3 di Flashcard / Kuis (30 Soal)</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
              {[
                { id: 'all', label: 'Semua Topik (30)' },
                { id: 'apd', label: 'Alat Pelindung Diri APD (14)' },
                { id: 'evakuasi', label: 'Pintu Darurat & APAR (4)' },
                { id: 'rambu', label: 'Rambu-Rambu K3 (4)' },
                { id: 'mesin', label: 'Pengaman Mesin & Cek (4)' },
                { id: 'kimia', label: 'Bahan Kimia & MSDS (4)' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => { setK3Filter(f.id); setSelK3(0); stopPlayer(); }}
                  className={cn('px-3 py-1.5 rounded-sm font-medium transition-all',
                    k3Filter === f.id
                      ? 'bg-foreground text-background'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/70 hover:text-foreground border border-border/60'
                  )}>
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari kata kunci K3 (misal: 안전모, 소화기, MSDS, 방호장치, pelindung)..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelK3(0); stopPlayer(); }}
                className="w-full pl-9 pr-4 py-2 bg-muted border border-input rounded-md text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring"
              />
            </div>
          </Card>

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
            onToggleIncludeAnswers={() => setIncludeAnswers(p => !p)}
            gapCountdown={gapCountdown}
            hideText={hideText}
            onToggleHideText={() => setHideText(p => !p)}
            onPrev={() => {
              if (playerUI.on && playerUI.tab === 'k3') {
                stepPlayer(-1);
              } else {
                setSelK3(Math.max(0, selK3Eff - 1));
              }
            }}
            onTogglePlay={() => {
              if (playerUI.on && playerUI.tab === 'k3') {
                pausePlayer();
              } else {
                startPlayer('k3', filteredK3, selK3Eff, playerMode);
              }
            }}
            onNext={() => {
              if (playerUI.on && playerUI.tab === 'k3') {
                stepPlayer(1);
              } else {
                setSelK3(Math.min(filteredK3.length - 1, selK3Eff + 1));
              }
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
                  onPlayQ={() => playAudio(q.audio_q)}
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

      {/* Interview Tab */}
      {activeTab === 'interview' && (
        <div className="space-y-4">
          <Card className="p-4 md:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary shrink-0" />
                  <span>{interviewCount} Bank Soal Wawancara Resmi MSK Indonesia & HRD Korea</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pertanyaan data diri, alasan bekerja di Korea, ketahanan fisik, serta respon cepat atas situasi kritis di pabrik.
                </p>
              </div>

              <Button onClick={() => onStartPracticeCategory && onStartPracticeCategory('interview')}>
                <span>Latih Wawancara di Flashcard</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
              {[
                { id: 'all', label: `Semua Soal (${interviewCount})` },
                { id: 'pribadi', label: 'Data Diri & Pribadi' },
                { id: 'situasi', label: 'Situasi Kritis Pabrik (SOP)' },
                { id: 'hrdk', label: `Simulasi Resmi HRDK (${hrdkSimCount} Q&A)` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => { setInterviewFilter(f.id); setSelInt(0); stopPlayer(); }}
                  className={cn('px-3 py-1.5 rounded-sm font-medium transition-all',
                    interviewFilter === f.id
                      ? 'bg-foreground text-background'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/70 hover:text-foreground border border-border/60'
                  )}>
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari pertanyaan wawancara (misal: 불량품, 사고, 이름, 나이, 야근, gaji, teman)..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelInt(0); stopPlayer(); }}
                className="w-full pl-9 pr-4 py-2 bg-muted border border-input rounded-md text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring"
              />
            </div>
          </Card>

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
            onToggleIncludeAnswers={() => setIncludeAnswers(p => !p)}
            gapCountdown={gapCountdown}
            hideText={hideText}
            onToggleHideText={() => setHideText(p => !p)}
            onPrev={() => {
              if (playerUI.on && playerUI.tab === 'interview') {
                stepPlayer(-1);
              } else {
                setSelInt(Math.max(0, selIntEff - 1));
              }
            }}
            onTogglePlay={() => {
              if (playerUI.on && playerUI.tab === 'interview') {
                pausePlayer();
              } else {
                startPlayer('interview', filteredInterview, selIntEff, playerMode);
              }
            }}
            onNext={() => {
              if (playerUI.on && playerUI.tab === 'interview') {
                stepPlayer(1);
              } else {
                setSelInt(Math.min(filteredInterview.length - 1, selIntEff + 1));
              }
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
                  onPlayQ={() => playAudio(q.audio_q)}
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

      {/* Physical Commands Tab */}
      {activeTab === 'commands' && (
        <div className="space-y-4">
          <Card className="p-4 md:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Perintah Gerakan Fisik Penguji (따라하세요)</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Diujikan saat Anda berdiri di depan penguji untuk mengetes refleks mendengar dan arah tubuh.
                </p>
              </div>

              <Button onClick={() => onStartPracticeCategory && onStartPracticeCategory('physical')}>
                <span>Latih Refleks Gerak Fisik di Flashcard</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {getPagedItems(studyData.physical_commands || [], 'physical').map((cmd, idx) => {
              const cardId = `cmd_${cmd.id || idx}`;
              const hidden = isAnswerHidden(cardId);

              return (
                <Card key={cardId} className="p-4 flex flex-col justify-between hover:shadow-md transition-all border-l-4 border-l-emerald-500 bg-emerald-50/30">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                        Perintah #{idx + 1}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {cmd.audio_q && (
                          <Button type="button" variant="secondary" size="sm"
                            onClick={() => playAudio(cmd.audio_q)}>
                            <Volume2 className="h-3 w-3" />
                            <span>Dengar</span>
                          </Button>
                        )}

                        <Button type="button" variant="outline" size="sm"
                          onClick={() => toggleCardAnswer(cardId)}
                          title={hidden ? 'Buka arti' : 'Tutup arti'}>
                          {hidden ? <EyeOff className="h-3.5 w-3.5 text-warn" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>

                    <h4 className="text-xl font-bold text-foreground font-kr tracking-tight">
                      {cmd.command_ko}
                    </h4>
                    {cmd.command_ro && (
                      <p className="text-xs text-muted-foreground font-mono">{cmd.command_ro}</p>
                    )}

                    {hidden ? (
                      <div 
                        onClick={() => toggleCardAnswer(cardId)}
                        className="py-1.5 px-3 rounded-sm bg-warn/10 border border-dashed border-warn/30 text-center cursor-pointer text-[11px] font-bold text-warn"
                      >
                        Arti disembunyikan (Klik mata)
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-primary">
                        Artinya: {cmd.command_id}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-border text-[11px] text-muted-foreground font-medium bg-muted p-2 rounded-md">
                    <strong>Refleks:</strong> {cmd.action_desc || cmd.command_id}
                  </div>
                </Card>
              );
            })}
          </div>
          <Pagination items={studyData.physical_commands || []} pkey="physical" />
        </div>
      )}

      {/* Jagisoge Tab */}
      {activeTab === 'jagisoge' && (
        <div className="space-y-4">
          {/* 4 Contoh Resmi Perkenalan Diri (자기 소개 샘플) ala EPSTOPIK HUB */}
          <Card className="p-4 md:p-5 space-y-3.5 border-l-4 border-l-primary bg-primary/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-primary">Part 1 · Self-introduction</p>
                <h3 className="text-base sm:text-lg font-bold font-kr text-foreground mt-0.5">
                  {JAGISOGE_SAMPLES[activeSampleIdx].koTitle}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {JAGISOGE_SAMPLES[activeSampleIdx].desc}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  onClick={() => {
                    const text = JAGISOGE_SAMPLES[activeSampleIdx].sentences.map(s => s.ko).join(' ');
                    if (playingAudio === text) {
                      stopAudioOnly();
                    } else {
                      playAudio(null, text);
                    }
                  }}
                  className="font-bold gap-2 shadow-xs"
                >
                  {playingAudio === JAGISOGE_SAMPLES[activeSampleIdx].sentences.map(s => s.ko).join(' ') ? (
                    <>
                      <Pause className="h-4 w-4" />
                      <span>Jeda Contoh</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4" />
                      <span>Putar Contoh (Play sample)</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Sample Selector Tabs */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {JAGISOGE_SAMPLES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    stopAudioOnly();
                    setActiveSampleIdx(idx);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shrink-0 min-h-[36px]',
                    activeSampleIdx === idx
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
                  )}
                >
                  Sample {s.id}
                </button>
              ))}
            </div>

            {/* Sample Content */}
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
              {JAGISOGE_SAMPLES[activeSampleIdx].sentences.map((st, i) => (
                <div key={i} className="text-sm">
                  <p className="font-kr font-bold text-foreground">{st.ko}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 italic">{st.id}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Form */}
          <Card className="p-4 md:p-5 space-y-4">
            <div>
              <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span>Buat Jagisoge-mu (자기소개 생성기)</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Isi data diri, pilih versi template, teks perkenalan jadi otomatis. Umur & jumlah keluarga langsung dikonversi ke angka Korea.
              </p>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {JAGI_STEPS.map((s, i) => {
                const done = i === 0 ? (wajibIsi >= 4) : i < jagiStep;
                const active = jagiStep === i;
                return (
                  <React.Fragment key={s}>
                    {i > 0 && <div className={cn('hidden sm:block flex-1 h-0.5 rounded-full transition-colors min-w-[12px]', jagiStep >= i ? 'bg-primary' : 'bg-border')} />}
                    <button onClick={() => setJagiStep(i)}
                      className={cn('shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all active:scale-95 border min-h-[32px]',
                        active ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : done ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-card text-muted-foreground border-border hover:border-foreground/30')}>
                      {done && !active
                        ? <Check className="h-3 w-3 text-emerald-700" />
                        : <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">{i + 1}</span>}
                      <span>{s}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-muted-foreground">Kelengkapan data wajib</span>
                <span className={cn('text-[10px] font-mono font-bold', wajibIsi >= 4 ? 'text-emerald-700' : 'text-amber-700')}>{wajibIsi}/4</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full transition-all duration-300', wajibIsi >= 4 ? 'bg-emerald-500' : 'bg-primary')} style={{ width: `${(wajibIsi / 4) * 100}%` }} />
              </div>
            </div>

            {/* Step 1: Wajib */}
            {jagiStep === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 animate-fade-in">
                <label className="block md:col-span-2">
                  <span className="text-[11px] font-bold text-muted-foreground">Nama Lengkap <span className="text-destructive">*</span></span>
                  <input type="text" placeholder="cth: BAMBANG SUTEJO"
                    value={jagiForm.nama}
                    onChange={(e) => setJagiForm({ ...jagiForm, nama: e.target.value })}
                    className={cn('mt-1 w-full px-3 py-2.5 border rounded-md text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all',
                      jagiForm.nama.trim() ? 'bg-emerald-50/50 border-emerald-200 focus:ring-emerald-600/20 focus:border-emerald-500' : 'bg-muted border-input focus:ring-ring/30 focus:border-ring')} />
                </label>
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground">Umur (tahun) <span className="text-destructive">*</span></span>
                  <div className="mt-1 flex items-stretch gap-1.5">
                    <button onClick={() => setJagiForm(f => ({ ...f, umur: String(Math.max(0, (parseInt(f.umur || '0', 10) || 0) - 1)) }))}
                      className="px-3 rounded-md bg-secondary hover:bg-secondary/70 border border-border font-bold text-muted-foreground transition-all active:scale-90">−</button>
                    <input type="number" min="1" max="99" placeholder="35"
                      value={jagiForm.umur}
                      onChange={(e) => setJagiForm({ ...jagiForm, umur: e.target.value })}
                      className="w-full px-3 py-2.5 bg-muted border border-input rounded-md text-sm font-bold text-center text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring" />
                    <button onClick={() => setJagiForm(f => ({ ...f, umur: String(Math.min(99, (parseInt(f.umur || '0', 10) || 0) + 1)) }))}
                      className="px-3 rounded-md bg-secondary hover:bg-secondary/70 border border-border font-bold text-muted-foreground transition-all active:scale-90">+</button>
                  </div>
                  {nativeKo(jagiForm.umur) && (
                    <span className="inline-block mt-1 text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">= {nativeKo(jagiForm.umur)} 살</span>
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground">Asal <span className="text-destructive">*</span></span>
                  <select value={jagiForm.asal}
                    onChange={(e) => setJagiForm({ ...jagiForm, asal: e.target.value })}
                    className="mt-1 w-full px-3 py-2.5 bg-muted border border-input rounded-md text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring">
                    {SLOT_OPTS.asal.map(o => <option key={o.id} value={o.id}>{o.id} ({o.text})</option>)}
                  </select>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground">Hobi <span className="text-destructive">*</span></span>
                  <select value={jagiForm.hobi}
                    onChange={(e) => setJagiForm({ ...jagiForm, hobi: e.target.value })}
                    className="mt-1 w-full px-3 py-2.5 bg-muted border border-input rounded-md text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring">
                    {SLOT_OPTS.hobi.map(o => <option key={o.id} value={o.id}>{o.id} ({o.text})</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Opsional */}
            {jagiStep === 1 && (
              <div className="space-y-2.5 animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  <label className="block">
                    <span className="text-[11px] font-bold text-muted-foreground">Nama Panggilan</span>
                    <input type="text" placeholder="cth: BUDI"
                      value={jagiForm.namaPanggil}
                      onChange={(e) => setJagiForm({ ...jagiForm, namaPanggil: e.target.value })}
                      className="mt-1 w-full px-3 py-2 bg-muted border border-input rounded-md text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring" />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-bold text-muted-foreground">Tahun Lahir</span>
                    <input type="number" min="1900" max="2099" placeholder="cth: 1990"
                      value={jagiForm.tahunLahir}
                      onChange={(e) => setJagiForm({ ...jagiForm, tahunLahir: e.target.value })}
                      className="mt-1 w-full px-3 py-2 bg-muted border border-input rounded-md text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring" />
                    {yearKo(jagiForm.tahunLahir) && (
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">= {yearKo(jagiForm.tahunLahir)}년</span>
                    )}
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-bold text-muted-foreground">Bulan Lahir</span>
                    <input type="number" min="1" max="12" placeholder="cth: 4 (April)"
                      value={jagiForm.bulanLahir}
                      onChange={(e) => setJagiForm({ ...jagiForm, bulanLahir: e.target.value })}
                      className="mt-1 w-full px-3 py-2 bg-muted border border-input rounded-md text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring" />
                    {sinoKo(jagiForm.bulanLahir) && (
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">= {sinoKo(jagiForm.bulanLahir)}월</span>
                    )}
                  </label>
                  <div>
                    <span className="text-[11px] font-bold text-muted-foreground">Jumlah Keluarga</span>
                    <div className="mt-1 flex items-stretch gap-1.5">
                      <button onClick={() => setJagiForm(f => ({ ...f, keluarga: String(Math.max(0, (parseInt(f.keluarga || '0', 10) || 0) - 1)) }))}
                        className="px-3 rounded-md bg-secondary hover:bg-secondary/70 border border-border font-bold text-muted-foreground transition-all active:scale-90">−</button>
                      <input type="number" min="1" max="99" placeholder="4"
                        value={jagiForm.keluarga}
                        onChange={(e) => setJagiForm({ ...jagiForm, keluarga: e.target.value })}
                        className="w-full px-3 py-2 bg-muted border border-input rounded-md text-sm font-bold text-center text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring" />
                      <button onClick={() => setJagiForm(f => ({ ...f, keluarga: String(Math.min(99, (parseInt(f.keluarga || '0', 10) || 0) + 1)) }))}
                        className="px-3 rounded-md bg-secondary hover:bg-secondary/70 border border-border font-bold text-muted-foreground transition-all active:scale-90">+</button>
                    </div>
                    {nativeKo(jagiForm.keluarga) && (
                      <span className="inline-block mt-1 text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">= {nativeKo(jagiForm.keluarga)} 명</span>
                    )}
                  </div>
                </div>
                <label className="block md:col-span-2">
                  <span className="text-[11px] font-bold text-muted-foreground">Sebut Anggota Keluarga <span className="font-medium">(opsional)</span></span>
                  <input type="text" placeholder="cth: 아버지, 어머니, 누나"
                    value={jagiForm.anggota}
                    onChange={(e) => setJagiForm({ ...jagiForm, anggota: e.target.value })}
                    className="mt-1 w-full px-3 py-2 bg-muted border border-input rounded-md text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring" />
                </label>
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground">Status Pernikahan</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {SLOT_OPTS.nikah.map(o => (
                      <button key={o.id} onClick={() => setJagiForm({ ...jagiForm, nikah: o.id })}
                        className={cn('px-3 py-2 rounded-sm text-xs font-medium transition-all',
                          jagiForm.nikah === o.id
                            ? 'bg-foreground text-background'
                            : 'bg-card text-muted-foreground border-border hover:bg-secondary')}>
                        {optText('nikah', o.id)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Slot Bebas */}
            {jagiStep === 2 && (
              <div className="space-y-3 animate-fade-in">
                <div className="p-2.5 rounded-md bg-warn/5 border border-warn/30 text-xs text-warn leading-relaxed">
                  Aturan 40 detik: <strong>pilih tepat 1 per slot</strong>. Kebanyakan slot = kepotong penguji.
                </div>
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground">Pengalaman Kerja</span>
                  <select value={jagiForm.pengalaman}
                    onChange={(e) => setJagiForm({ ...jagiForm, pengalaman: e.target.value })}
                    className="mt-1 w-full px-3 py-2 bg-warn/5 border border-warn/30 rounded-md text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-warn/30 focus:border-warn">
                    {SLOT_OPTS.pengalaman.map((o, i) => <option key={o} value={o}>{i + 1}. {o}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[11px] font-bold text-muted-foreground">Kelebihan</span>
                    <select value={jagiForm.kelebihan}
                      onChange={(e) => setJagiForm({ ...jagiForm, kelebihan: e.target.value })}
                      className="mt-1 w-full px-3 py-2 bg-warn/5 border border-warn/30 rounded-md text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-warn/30 focus:border-warn">
                      {SLOT_OPTS.kelebihan.map(o => <option key={o.id} value={o.id}>{o.id}</option>)}
                    </select>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-muted-foreground">Penutup</span>
                    <select value={jagiForm.tutup}
                      onChange={(e) => setJagiForm({ ...jagiForm, tutup: e.target.value })}
                      className="mt-1 w-full px-3 py-2 bg-warn/5 border border-warn/30 rounded-md text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-warn/30 focus:border-warn">
                      {SLOT_OPTS.tutup.map(o => <option key={o.id} value={o.id}>{o.id}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Navigasi langkah */}
            <div className="flex items-center justify-between pt-1">
              {jagiStep > 0 ? (
                <Button variant="outline" size="sm" onClick={() => setJagiStep(s => s - 1)}>
                  <span>Kembali</span>
                </Button>
              ) : <span />}
              {jagiStep < 2 ? (
                <Button size="sm" onClick={() => setJagiStep(s => s + 1)}>
                  <span>Lanjut: {JAGI_STEPS[jagiStep + 1]}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button size="sm" onClick={() => document.getElementById('jagi-hasil')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  <span>Lihat Hasil</span>
                </Button>
              )}
            </div>

            {/* Template picker */}
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-0.5">Template:</span>
              <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(studyData.jagisoge?.templates || []).map(t => {
                  const sel = jagiTemplate === t.id;
                  const n = (t.sentences || []).length;
                  return (
                    <button key={t.id} onClick={() => setJagiTemplate(t.id)} title={t.desc}
                      className={cn('text-left p-3 rounded-md border transition-all',
                        sel ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card text-foreground border-border hover:border-primary/40')}>
                      <div className="flex items-center justify-between gap-1">
                        <span className={cn('text-xs font-bold truncate', sel ? 'text-white' : 'text-foreground')}>{t.label}</span>
                        {sel && <Check className="h-4 w-4 shrink-0" />}
                      </div>
                      <div className={cn('mt-1 flex items-center gap-1.5 text-[10px] font-mono font-bold',
                        sel ? 'text-white/80' : 'text-muted-foreground')}>
                        <span className={cn('px-1.5 py-0.5 rounded-sm', sel ? 'bg-white/20' : 'bg-secondary')}>{n} kalimat</span>
                        {t.duration && <span className={cn('px-1.5 py-0.5 rounded-sm', sel ? 'bg-white/20' : 'bg-secondary')}>{t.duration}</span>}
                      </div>
                      <p className={cn('mt-1.5 text-[11px] leading-snug line-clamp-2', sel ? 'text-white/80' : 'text-muted-foreground')}>{t.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hasil */}
            <div id="jagi-hasil" className="p-4 rounded-md bg-foreground text-background space-y-3 scroll-mt-24">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Hasil: {(studyData.jagisoge?.templates || []).find(t => t.id === jagiTemplate)?.label} · {jagiSentences().length} kalimat
                </span>
                <div className="flex items-center gap-1.5">
                  <Button type="button" variant="secondary" size="sm"
                    onClick={() => playAudio(null, jagiSentences().map(s => s.ko).join(' '))}>
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Dengar Semua</span>
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={copyJagi}>
                    <Copy className="h-3.5 w-3.5" />
                    <span>{jagiCopied ? 'Tersalin!' : 'Salin'}</span>
                  </Button>
                </div>
              </div>
              <p className="font-kr font-bold text-base md:text-lg leading-relaxed">
                {jagiSentences().map(s => s.ko).join(' ')}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {jagiSentences().map(s => s.id).filter(Boolean).join(' ')}
              </p>
              <div className="pt-1 space-y-1.5">
                {jagiSentences().map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 bg-white/5 rounded-sm px-2.5 py-1.5">
                    <span className="font-kr text-xs font-bold truncate">{s.ko}</span>
                    <Button type="button" variant="ghost" size="icon"
                      onClick={() => playAudio(null, s.ko)}
                      title="Dengar kalimat ini"
                      className={cn('shrink-0', playingAudio === s.ko && 'text-emerald-400 animate-pulse-dot')}>
                      <Volume2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Naskah Baku */}
          <Card className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-primary uppercase">Tahap 1 Ujian Resmi</span>
                <h3 className="text-lg md:text-xl font-bold text-foreground">Naskah Baku Jagisoge (Batas Resmi 40 Detik)</h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => playAudio('/audio/examiner_jagisoge.mp3')}>
                <Volume2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Audio Penguji</span>
              </Button>
            </div>

            <div className="p-4 rounded-md bg-muted border border-border text-sm md:text-base font-kr font-bold text-foreground leading-relaxed">
              {(studyData.jagisoge.sentences || []).map(s => s.ko).join(' ')}
            </div>

            <div className="mt-4 p-4 rounded-md bg-warn/5 border border-warn/30 text-xs text-warn leading-relaxed">
              <strong>Terjemahan Bahasa Indonesia:</strong><br />
              {(studyData.jagisoge.sentences || []).map(s => s.id).join(' ')}
            </div>

            <div className="mt-5 space-y-3">
              <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
                Struktur Per Kalimat & Tips Skor Maksimal:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(studyData.jagisoge.sentences || []).map((st, idx) => (
                  <div key={idx} className="p-3.5 rounded-md border border-border bg-card">
                    <span className="text-[10px] font-bold text-primary uppercase">Langkah {idx + 1}: {st.step}</span>
                    <div className="font-kr font-bold text-sm text-foreground mt-1">{st.ko}</div>
                    {st.ro && <div className="text-[11px] text-muted-foreground font-mono">{st.ro}</div>}
                    <div className="text-xs text-muted-foreground mt-0.5">{st.id}</div>
                    <div className="mt-2 text-[11px] text-warn bg-warn/8 px-2.5 py-1 rounded-md border border-warn/20">
                      <strong>Tips Penguji:</strong> {st.tips}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 p-4 rounded-md bg-emerald-50/60 border border-emerald-200">
              <h4 className="font-bold text-xs text-emerald-950 uppercase tracking-wider mb-2">
                Checklist Kelulusan Sesi Jagisoge:
              </h4>
              <div className="space-y-1 text-xs text-emerald-900">
                {studyData.jagisoge.examiner_checklist.map((item, idx) => (
                  <div key={idx}>{item}</div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Time Tab */}
      {activeTab === 'time' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-base text-slate-800 mb-1">Rumus Utama Membaca Jam:</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>Jam = Angka Asli Korea + 시 (si)</strong> | <strong>Menit = Angka Sino-Korea + 분 (bun)</strong> | <strong>Detik = Sino + 초 (cho)</strong><br />
              Contoh: 08:30 = <em>여덟 시 삼십 분</em> (yeodeol-si samsip-bun) atau <em>여덟 시 반</em> (yeodeol-si ban).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {getPagedItems(studyData.time.examples || [], 'time').map((item, idx) => {
              const cardId = `time_${idx}`;
              const hidden = isAnswerHidden(cardId);

              return (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-700">{item.time}</span>
                    <div className="flex items-center gap-1">
                      {item.audio && (
                        <button onClick={() => playAudio(item.audio)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                          <Volume2 className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => toggleCardAnswer(cardId)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
                        {hidden ? <EyeOff className="h-4 w-4 text-amber-600" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {hidden ? (
                    <div onClick={() => toggleCardAnswer(cardId)} className="cursor-pointer text-xs font-bold text-amber-700 bg-amber-50 px-3 py-2 rounded-lg mt-3 text-center">
                      Tersembunyi
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="font-kr font-bold text-lg text-slate-800">{item.ko}</div>
                      <div className="text-sm text-slate-500 mt-0.5">{item.id}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <Pagination items={studyData.time.examples || []} pkey="time" />
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-sm text-slate-700 mb-2">Nama-Nama Hari (요일):</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {(studyData.calendar.days || []).map((d, idx) => {
                const cardId = `cal_d_${idx}`;
                const hidden = isAnswerHidden(cardId);

                return (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white text-center shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <button onClick={() => toggleCardAnswer(cardId)} className="text-slate-400 hover:text-slate-600">
                        {hidden ? <EyeOff className="h-3.5 w-3.5 text-amber-600" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    {hidden ? (
                      <div onClick={() => toggleCardAnswer(cardId)} className="cursor-pointer text-xs font-bold text-amber-700 py-2">
                        ?
                      </div>
                    ) : (
                      <>
                        <div className="font-kr font-bold text-base text-slate-800">{d.ko}</div>
                        <div className="text-xs text-slate-500 font-medium">{d.id}</div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm text-slate-700 mb-2">12 Bulan Kalender (월):</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {(studyData.calendar.months || []).map((m, idx) => (
                <div key={idx} className={cn('p-3 rounded-xl border text-center shadow-sm', m.note ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200')}>
                  <div className="font-kr font-bold text-base text-slate-800">{m.ko}</div>
                  <div className="text-xs text-slate-500 font-medium">{m.id}</div>
                  {m.note && <div className="text-[10px] text-amber-700 font-bold mt-0.5">{m.note}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Colors Tab */}
      {activeTab === 'colors' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2 mb-1">
              <Palette className="h-4 w-4 text-slate-500 shrink-0" />
              11 Warna Pabrik & Alasan Korea (색깔 & 이유)
            </h3>
            <p className="text-sm text-slate-600">
              Pertanyaan wawancara: <em>"무슨 색깔을 좋아해요?"</em> (Hafal nama warna + alasan singkat Korea).
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(studyData.colors.items || []).map((c, idx) => {
              const cardId = `col_${idx}`;
              const hidden = isAnswerHidden(cardId);

              return (
                <div key={idx} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="h-16 w-full" style={{ backgroundColor: c.hex }} />
                  <div className="p-3.5 space-y-2">
                    {hidden ? (
                      <div
                        onClick={() => toggleCardAnswer(cardId)}
                        className="cursor-pointer py-2 px-3 rounded-lg bg-amber-50 border border-amber-200 text-center"
                      >
                        <span className="text-xs font-bold text-amber-700 flex items-center justify-center gap-1.5">
                          <EyeOff className="h-3.5 w-3.5" />
                          Tebak warna
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div className="font-kr font-bold text-lg text-slate-800 leading-tight">{c.ko}</div>
                        <div className="text-sm text-slate-600 font-medium">{c.id}</div>
                      </div>
                    )}

                    {!hidden && c.reason && (
                      <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 leading-relaxed">
                        {c.reason}
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      {c.audio && (
                        <button onClick={() => playAudio(c.audio)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button onClick={() => toggleCardAnswer(cardId)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 ml-auto">
                        {hidden ? <EyeOff className="h-3.5 w-3.5 text-amber-600" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {studyData.colors.interview_qa && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-sm text-slate-700">
                Contoh Tanya Jawab Warna di Wawancara:
              </h4>
              {studyData.colors.interview_qa.map((qa, i) => (
                <div key={i} className="border border-slate-200 rounded-xl p-3 bg-white space-y-1">
                  <div className="text-xs font-bold text-slate-500">{qa.q_id}</div>
                  <div className="font-kr font-bold text-base text-slate-800">{qa.q_ko}</div>
                  <div className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                    {qa.a_id} <span className="font-kr font-bold">{qa.a_ko}</span>
                  </div>
                  {qa.audio && (
                    <button onClick={() => playAudio(qa.audio)} className="text-xs text-slate-600 hover:text-slate-800 font-bold flex items-center gap-0.5">
                      <Volume2 className="h-3 w-3" /> Putar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Family Tab */}
      {activeTab === 'family' && (
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-sm text-slate-700 mb-2">Anggota Keluarga (가족 구성원):</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {getPagedItems(studyData.family.items || studyData.family.members || [], 'family').map((f, idx) => {
              const cardId = `fam_${idx}`;
              const hidden = isAnswerHidden(cardId);

              return (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    {hidden ? (
                      <div onClick={() => toggleCardAnswer(cardId)} className="cursor-pointer text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1.5 rounded-lg">
                        ?
                      </div>
                    ) : (
                      <>
                        <div className="font-kr font-bold text-base text-slate-800">{f.ko}</div>
                        <div className="text-xs text-slate-500 font-medium">{f.id}</div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {f.audio && (
                      <button onClick={() => playAudio(f.audio)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button onClick={() => toggleCardAnswer(cardId)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
                      {hidden ? <EyeOff className="h-3.5 w-3.5 text-amber-600" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination items={studyData.family.items || studyData.family.members || []} pkey="family" />
        </div>
      )}

      {/* Piktogram Tab */}
      {activeTab === 'piktogram' && (() => {
        const piktogramList = allQuestions.filter(q => q.category === 'piktogram');
        // 3 rambu nyasar di grup generik "Piktogram & Rambu Keselamatan K3", title_id-nya
        // sudah memuat tag standar (지시표지/경고표지/금지표지/안내표지), jadi gabungkan ke grup standar tsb.
        // Grup standar lain dipertahankan apa adanya dari data.
        const GENERIC_GROUP = 'Piktogram & Rambu Keselamatan K3';
        const remapGeneric = (item) => {
          if (item.category_title !== GENERIC_GROUP) return item.category_title || 'Lainnya';
          const tag = (item.title_id || '') + (item.title_ko || '');
          const target = piktogramList.find(q =>
            q.category_title !== GENERIC_GROUP &&
            ((tag.includes('지시표지') && (q.category_title || '').includes('지시')) ||
             (tag.includes('경고표지') && (q.category_title || '').includes('경고')) ||
             (tag.includes('금지표지') && (q.category_title || '').includes('금지')) ||
             ((tag.includes('안내표지') || tag.includes('유도')) && ((q.category_title || '').includes('안내') || (q.category_title || '').includes('유도') || (q.category_title || '').includes('Evakuasi'))))
          );
          return (target && target.category_title) || item.category_title || 'Lainnya';
        };
        const groups = piktogramList.reduce((acc, q) => {
          const g = remapGeneric(q);
          if (!acc[g]) acc[g] = [];
          acc[g].push(q);
          return acc;
        }, {});
        const pikQ = (searchQuery || '').trim().toLowerCase();
        const pikMatch = (p) => !pikQ || ((p.title_ko || '') + ' ' + (p.title_id || '') + ' ' + (p.category_title || '')).toLowerCase().includes(pikQ);
        const pikShown = Object.entries(groups)
          .filter(([n]) => pikGroup === 'all' || n === pikGroup)
          .map(([n, arr]) => [n, arr.filter(pikMatch)])
          .filter(([, arr]) => arr.length > 0);
        const pikFound = Object.values(groups).reduce((s, arr) => s + arr.filter(pikMatch).length, 0);
        return (
          <div className="space-y-4">
            <Card className="p-4 md:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm md:text-base flex items-center gap-2 mb-1">
                    <ShieldAlert className="h-4 w-4 text-warn shrink-0" />
                    <span>{piktogramList.length} Piktogram & Rambu Keselamatan Kerja (안전 표지)</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Pertanyaan penguji: <em>"이 안전 표지는 무슨 뜻입니까?"</em> (Hafal arti setiap rambu beserta nama Koreanya).
                  </p>
                </div>

                <Button onClick={() => onStartPracticeCategory && onStartPracticeCategory('safety')}>
                  <span>Latih Rambu K3 di Kuis / Flashcard</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari rambu (misal: rompi, APAR, 대피, 금지, 소화기)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-muted border border-input rounded-md text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setPikGroup('all')}
                className={cn('px-3 py-1.5 rounded-md font-bold transition-all border',
                  pikGroup === 'all'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                )}>
                Semua ({piktogramList.length})
              </button>
              {Object.entries(groups).map(([n, arr]) => (
                <button
                  key={n}
                  onClick={() => setPikGroup(n)}
                  className={cn('px-3 py-1.5 rounded-md font-bold transition-all border',
                    pikGroup === n
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  )}>
                  {n} ({arr.length})
                </button>
              ))}
            </div>
            {pikQ ? (
              <p className="text-xs text-slate-600 font-medium">Hasil pencarian "{searchQuery.trim()}"{pikGroup !== 'all' ? ` di ${pikGroup}` : ''}: <strong>{pikFound} rambu</strong></p>
            ) : pikGroup !== 'all' ? (
              <p className="text-xs text-slate-600 font-medium">Menampilkan: <strong>{pikGroup}</strong> ({(groups[pikGroup] || []).length} rambu)</p>
            ) : null}
            {pikShown.length === 0 && (
              <p className="text-xs text-slate-500 py-4 text-center">Tidak ada rambu yang cocok dengan pencarian.</p>
            )}
            {pikShown.map(([groupName, items]) => (
              <div key={groupName} className="space-y-2">
                <h4 className="font-bold text-sm text-slate-700">{groupName} ({items.length})</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {getPagedItems(items, 'pik_' + groupName).map((p, idx) => {
                    const cardId = `pik_${p.id || idx}`;
                    const hidden = isAnswerHidden(cardId);
                    return (
                      <div key={cardId} className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col shadow-sm">
                        <div className="bg-slate-50 p-2 flex items-center justify-center min-h-[70px]">
                          <img
                            src={getAssetUrl(p.image_url)}
                            alt={p.title_id || p.title_ko}
                            className="max-h-16 w-auto object-contain"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-2.5 flex flex-col gap-1 flex-1">
                          {hidden ? (
                            <div
                              onClick={() => toggleCardAnswer(cardId)}
                              className="cursor-pointer text-center py-1.5 px-2 rounded-lg bg-amber-50 border border-amber-200"
                            >
                              <EyeOff className="h-3 w-3 text-amber-600 mx-auto mb-0.5" />
                              <span className="text-[10px] font-bold text-amber-700">Tebak</span>
                            </div>
                          ) : (
                            <div>
                              <div className="font-kr font-bold text-xs text-slate-800 leading-tight">{p.title_ko}</div>
                              <div className="text-[10px] text-slate-500 font-medium">{p.title_id}</div>
                            </div>
                          )}
                          <div className="flex items-center gap-0.5 mt-auto">
                            {(p.audio_a || p.title_ko) && (
                              <button onClick={() => playAudio(p.audio_a, p.title_ko)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100" title={`Dengar: ${p.title_ko}`}>
                                <Volume2 className="h-3 w-3" />
                              </button>
                            )}
                            <button onClick={() => toggleCardAnswer(cardId)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 ml-auto" aria-label={hidden ? 'Tampilkan' : 'Sembunyikan'}>
                              {hidden ? <EyeOff className="h-3 w-3 text-amber-600" /> : <Eye className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Pagination items={items} pkey={'pik_' + groupName} />
              </div>
            ))}
          </div>
        );
      })()}

      {/* Alat Tab */}
      {activeTab === 'alat' && (() => {
        const alatList = allQuestions.filter(q => q.category === 'alat_manufaktur' || q.category === 'alat_klasik');
        const groups = alatList.reduce((acc, q) => {
          const g = q.category_title || 'Alat Manufaktur';
          if (!acc[g]) acc[g] = [];
          acc[g].push(q);
          return acc;
        }, {});
        const alatQ = (searchQuery || '').trim().toLowerCase();
        const alatMatch = (a) => !alatQ || ((a.title_ko || '') + ' ' + (a.title_id || '') + ' ' + (a.category_title || '') + ' ' + (a.usage_short_ko || '') + ' ' + (a.usage_short_id || '')).toLowerCase().includes(alatQ);
        const alatShown = Object.entries(groups)
          .filter(([n]) => alatGroup === 'all' || n === alatGroup)
          .map(([n, arr]) => [n, arr.filter(alatMatch)])
          .filter(([, arr]) => arr.length > 0);
        const alatFound = Object.values(groups).reduce((s, arr) => s + arr.filter(alatMatch).length, 0);
        return (
          <div className="space-y-4">
            <Card className="p-4 md:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm md:text-base flex items-center gap-2 mb-1">
                    <Wrench className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{alatList.length} Alat & Perkakas Manufaktur (공구 & 기계)</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Pertanyaan penguji: <em>"이 공구의 이름은 무엇입니까?"</em> (Hafal nama Korea setiap alat dari fotonya).
                  </p>
                </div>

                <Button onClick={() => onStartPracticeCategory && onStartPracticeCategory('tools')}>
                  <span>Latih Perkakas di Flashcard</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari alat (misal: gerinda, 드릴, pompa, solder)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-muted border border-input rounded-md text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setAlatGroup('all')}
                className={cn('px-3 py-1.5 rounded-md font-bold transition-all border',
                  alatGroup === 'all'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                )}>
                Semua ({alatList.length})
              </button>
              {Object.entries(groups).map(([n, arr]) => (
                <button
                  key={n}
                  onClick={() => setAlatGroup(n)}
                  className={cn('px-3 py-1.5 rounded-md font-bold transition-all border',
                    alatGroup === n
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  )}>
                  {n} ({arr.length})
                </button>
              ))}
            </div>
            {alatQ ? (
              <p className="text-xs text-slate-600 font-medium">Hasil pencarian "{searchQuery.trim()}"{alatGroup !== 'all' ? ` di ${alatGroup}` : ''}: <strong>{alatFound} alat</strong></p>
            ) : alatGroup !== 'all' ? (
              <p className="text-xs text-slate-600 font-medium">Menampilkan: <strong>{alatGroup}</strong> ({(groups[alatGroup] || []).length} alat)</p>
            ) : null}
            {alatShown.length === 0 && (
              <p className="text-xs text-slate-500 py-4 text-center">Tidak ada alat yang cocok dengan pencarian.</p>
            )}
            {alatShown.map(([groupName, items]) => (
              <div key={groupName} className="space-y-2">
                <h4 className="font-bold text-sm text-slate-700">{groupName} ({items.length})</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {getPagedItems(items, 'alat_' + groupName).map((a, idx) => {
                    const cardId = `alat_${a.id || idx}`;
                    const hidden = isAnswerHidden(cardId);
                    return (
                      <div key={cardId} className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col shadow-sm">
                        <div className="bg-slate-50 p-2 flex items-center justify-center min-h-[80px] border-b border-slate-200">
                          <img
                            src={getAssetUrl(a.image_url)}
                            alt={a.title_id || a.title_ko}
                            className="max-h-20 w-auto object-contain"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-2.5 flex flex-col gap-1 flex-1">
                          {a.level && (
                            <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                              Tingkat {a.level}
                            </span>
                          )}
                          {hidden ? (
                            <div
                              onClick={() => toggleCardAnswer(cardId)}
                              className="cursor-pointer text-center py-1.5 px-2 rounded-lg bg-amber-50 border border-amber-200"
                            >
                              <EyeOff className="h-3 w-3 text-amber-600 mx-auto mb-0.5" />
                              <span className="text-[10px] font-bold text-amber-700">Tebak</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div>
                                <div className="font-kr font-bold text-xs text-slate-800 leading-tight">{a.title_ko}</div>
                                <div className="text-[10px] text-slate-500 font-medium">{a.title_id}</div>
                              </div>

                              {(a.usage_short_ko || a.usage_full_ko) && (
                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-left space-y-0.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                      Kegunaan:
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => playAudio(null, a.usage_short_ko || a.usage_full_ko)}
                                      className="text-[10px] text-slate-600 hover:text-slate-800 font-bold flex items-center gap-0.5"
                                      title="Dengar pelafalan fungsi alat"
                                    >
                                      <Volume2 className="w-2.5 h-2.5" />
                                      <span>Dengar</span>
                                    </button>
                                  </div>
                                  <p className="font-kr font-bold text-[11px] text-slate-800 leading-snug">
                                    {a.usage_short_ko || a.usage_full_ko}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-0.5 mt-auto">
                            {(a.audio_a || a.title_ko) && (
                              <button onClick={() => playAudio(a.audio_a, a.title_ko)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100" title={`Dengar: ${a.title_ko}`}>
                                <Volume2 className="h-3 w-3" />
                              </button>
                            )}
                            <button onClick={() => toggleCardAnswer(cardId)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 ml-auto" aria-label={hidden ? 'Tampilkan' : 'Sembunyikan'}>
                              {hidden ? <EyeOff className="h-3 w-3 text-amber-600" /> : <Eye className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Pagination items={items} pkey={'alat_' + groupName} />
              </div>
            ))}
          </div>
        );
      })()}

      {/* Manufacturing Tab */}
      {activeTab === 'manufacturing' && (
        <div className="space-y-4">
          <Card className="p-4 md:p-5">
            <h3 className="font-bold text-sm mb-1">3 Pos Ujian Keterampilan Fisik Manufaktur (기초기능):</h3>
            <p className="text-xs text-muted-foreground mb-3">Sesuai buku panduan ujian resmi Sistem Poin HRD Korea:</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {(studyData.manufacturing.practical_tasks || []).map((task, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {task.task_num}
                    </span>
                    <h4 className="font-bold text-sm text-slate-800 mt-1.5">{task.task_name}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-snug">{task.desc}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-emerald-700 font-medium bg-emerald-50 p-2 rounded-lg">
                    <strong>Kunci:</strong> {task.evaluation}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 md:p-5 space-y-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="font-mono">WAJIB DIHAFAL</Badge>
                <h3 className="font-bold text-sm text-foreground">
                  Tanya-Jawab Fungsi & Kegunaan Perkakas (도구의 용도):
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Pertanyaan resmi penguji di bilik meja: <em>"이 도구는 무엇에 사용합니까?"</em> (Alat ini digunakan untuk apa?):
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {getPagedItems(studyData.manufacturing.tool_functions || [], 'toolFunc').map((tf, idx) => {
                const cardId = `tool_func_${idx}`;
                const hidden = isAnswerHidden(cardId);

                return (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-1.5 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {tf.title_ko} • {tf.title_id}
                        </span>
                        <div className="font-kr font-bold text-sm text-slate-800 mt-1">
                          {tf.question_ko}
                        </div>
                        <div className="text-xs text-slate-500 italic">{tf.question_id}</div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {tf.audio_q && (
                          <button onClick={() => playAudio(tf.audio_q)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100">
                            <Volume2 className="h-3 w-3" />
                          </button>
                        )}
                        <button onClick={() => toggleCardAnswer(cardId)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                          {hidden ? <EyeOff className="h-3 w-3 text-amber-600" /> : <Eye className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200">
                      {hidden ? (
                        <div onClick={() => toggleCardAnswer(cardId)} className="cursor-pointer text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1.5 rounded-lg border border-amber-200 text-center">
                          Klik mata untuk lihat
                        </div>
                      ) : (
                        <div className="space-y-0.5 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                            Fungsi Alat:
                          </span>
                          <div className="font-kr font-bold text-xs text-emerald-900">{tf.answer_short_ko}</div>
                          <div className="text-[10px] text-emerald-700 font-medium">{tf.answer_short_id}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination items={studyData.manufacturing.tool_functions || []} pkey="toolFunc" />
          </Card>

          <Card className="p-4 md:p-5 space-y-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="font-mono">PERAGAAN PRAKTIK</Badge>
                <h3 className="font-bold text-sm text-foreground">
                  Perintah Aksi Penggunaan & Penataan Alat (작업 지시 이행):
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Instruksi lisan penguji saat menyuruh peserta mengambil, menggunakan, atau merapikan alat kerja ke kotak perkakas (공구함):
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {getPagedItems(studyData.manufacturing.tool_action_commands || [], 'toolAct').map((ta, idx) => {
                const cardId = `tool_act_${idx}`;
                const hidden = isAnswerHidden(cardId);

                return (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-1.5 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {ta.title_id}
                        </span>
                        <div className="font-kr font-bold text-sm text-slate-800 mt-1">
                          {ta.question_ko}
                        </div>
                        <div className="text-xs text-slate-500 italic">{ta.question_id}</div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {ta.audio_q && (
                          <button onClick={() => playAudio(ta.audio_q)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100">
                            <Volume2 className="h-3 w-3" />
                          </button>
                        )}
                        <button onClick={() => toggleCardAnswer(cardId)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                          {hidden ? <EyeOff className="h-3 w-3 text-amber-600" /> : <Eye className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200">
                      {hidden ? (
                        <div onClick={() => toggleCardAnswer(cardId)} className="cursor-pointer text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1.5 rounded-lg border border-amber-200 text-center">
                          Klik mata untuk lihat
                        </div>
                      ) : (
                        <div className="space-y-0.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                            Respon Sopan:
                          </span>
                          <div className="font-kr font-bold text-xs text-slate-800">{ta.answer_short_ko}</div>
                          <div className="text-[10px] text-slate-600 font-medium">{ta.answer_short_id}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination items={studyData.manufacturing.tool_action_commands || []} pkey="toolAct" />
          </Card>

          <Card className="p-4 md:p-5">
            <h3 className="font-bold text-sm mb-1">3 Tingkatan Alat Manufaktur HRD Korea 2026:</h3>
            <p className="text-xs text-muted-foreground mb-3">Klasifikasi resmi kisi-kisi manufaktur 2026 (Tingkat Atas, Menengah, Bawah):</p>

            <div className="space-y-2">
              {(studyData.manufacturing.hrdk_tool_tiers || []).map((t, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-0.5">{t.tier}</div>
                  <div className="text-xs text-slate-600 mb-1.5">{t.desc}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(t.tools || []).map((tool, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 font-mono text-[10px] font-bold text-slate-700">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}


      {/* Numbers Tab */}
      {activeTab === 'numbers' && (
        <div className="space-y-4">
          <Card className="p-4 md:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm md:text-base mb-1">Perbedaan Angka Sino-Korea vs Angka Asli Korea:</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Sino-Korea:</strong> Menit, Tanggal/Bulan/Tahun, Uang (Won), Nomor Telepon, Berat/Panjang.<br />
                  <strong>Asli Korea:</strong> Jam (waktu), Umur (살), dan Satuan Hitung Barang (개, 대, 명, 마리, 박스, 권).
                </p>
              </div>

              <Button onClick={() => onStartPracticeCategory && onStartPracticeCategory('numbers')}>
                <span>Latih Hitungan Pabrik di Kuis</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>

          <div>
            <h4 className="font-bold text-sm text-slate-700 mb-2">Angka Sino-Korea (일, 이, 삼, 사...):</h4>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-10 gap-1.5">
              {(studyData.numbers.sino || []).map((n, idx) => {
                const cardId = `num_s_${idx}`;
                const hidden = isAnswerHidden(cardId);
                return (
                  <div key={idx} className="p-2 rounded-lg border border-slate-200 bg-white flex flex-col items-center text-center shadow-sm">
                    {hidden ? (
                      <div onClick={() => toggleCardAnswer(cardId)} className="cursor-pointer text-[10px] font-bold text-amber-700 py-1">
                        {n.val}?
                      </div>
                    ) : (
                      <>
                        <div className="font-kr font-bold text-sm text-slate-800">{n.ko}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{n.val}</div>
                      </>
                    )}
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {n.audio && (
                        <button onClick={() => playAudio(n.audio)} className="p-0.5 rounded text-slate-500 hover:bg-slate-100 transition-colors">
                          <Volume2 className="h-3 w-3" />
                        </button>
                      )}
                      <button onClick={() => toggleCardAnswer(cardId)} className="p-0.5 rounded text-slate-400 hover:text-slate-600">
                        {hidden ? <EyeOff className="h-3 w-3 text-amber-600" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm text-slate-700 mb-2">Angka Asli Korea (하나, 둘, 셋, 넷...):</h4>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-10 gap-1.5">
              {(studyData.numbers.native || []).map((n, idx) => {
                const cardId = `num_n_${idx}`;
                const hidden = isAnswerHidden(cardId);
                return (
                  <div key={idx} className="p-2 rounded-lg border border-slate-200 bg-white flex flex-col items-center text-center shadow-sm">
                    {hidden ? (
                      <div onClick={() => toggleCardAnswer(cardId)} className="cursor-pointer text-[10px] font-bold text-amber-700 py-1">
                        {n.val}?
                      </div>
                    ) : (
                      <>
                        <div className="font-kr font-bold text-sm text-slate-800">{n.ko}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{n.val}</div>
                      </>
                    )}
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {n.audio && (
                        <button onClick={() => playAudio(n.audio)} className="p-0.5 rounded text-slate-500 hover:bg-slate-100 transition-colors">
                          <Volume2 className="h-3 w-3" />
                        </button>
                      )}
                      <button onClick={() => toggleCardAnswer(cardId)} className="p-0.5 rounded text-slate-400 hover:text-slate-600">
                        {hidden ? <EyeOff className="h-3 w-3 text-amber-600" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm text-slate-700 mb-2">Satuan Hitung Manufaktur dan Gudang Pabrik:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {(studyData.numbers.counters || studyData.numbers.units || []).map((c, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-kr font-bold text-base text-slate-800">{c.ko || c.unit}</span>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{c.meaning || c.type}</span>
                  </div>
                  <div className="text-sm text-slate-600 mt-1 leading-snug">{c.desc || (c.ro ? `${c.ro} - ${c.id}` : c.id)}</div>
                  <div className="text-xs font-medium text-emerald-700 mt-0.5 font-mono">{c.example}</div>
                </div>
              ))}
            </div>
          </div>

          <BankSoalSection
            icon={Hash}
            title="Bank Soal Hitungan Pabrik"
            desc="Soal hitungan lisan dan matematika pabrik dari bank soal resmi."
            badge={`${hitunganQuestions.length} Soal`}
            questions={hitunganQuestions}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder="Cari soal hitungan..."
            idPrefix="hit"
            practiceTarget="numbers"
            practiceLabel="Latih Semua di Kuis"
            onPractice={onStartPracticeCategory}
            isAnswerHidden={isAnswerHidden}
            toggleCardAnswer={toggleCardAnswer}
            playAudio={playAudio}
            playingAudio={playingAudio}
          />

          <BankSoalSection
            icon={Clock}
            title="Bank Soal Konversi Waktu dan Satuan"
            desc="Soal konversi resmi: 1 jam = 60 menit, meter ke cm ke mm, kg ke gram, liter ke ml."
            badge={`${konversiQuestions.length} Soal`}
            questions={konversiQuestions}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder="Cari konversi..."
            idPrefix="konv"
            practiceTarget="numbers"
            practiceLabel="Latih Semua di Kuis"
            onPractice={onStartPracticeCategory}
            isAnswerHidden={isAnswerHidden}
            toggleCardAnswer={toggleCardAnswer}
            playAudio={playAudio}
            playingAudio={playingAudio}
          />

          <BankSoalSection
            icon={Clock}
            title="Soal Lisan Jam"
            desc="Pertanyaan jam lisan, keluar di ujian sebagai bagian Wawancara dan Percakapan Dasar (Modul 1)."
            badge={`${jamLisanQuestions.length} Soal`}
            questions={jamLisanQuestions}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder="Cari soal jam..."
            idPrefix="jam"
            practiceTarget="interview"
            practiceLabel="Latih di Wawancara"
            onPractice={onStartPracticeCategory}
            isAnswerHidden={isAnswerHidden}
            toggleCardAnswer={toggleCardAnswer}
            playAudio={playAudio}
            playingAudio={playingAudio}
          />
        </div>
      )}

      </div>
    );
  }

// --- Section bank soal yang reusable (dipakai tab Angka/Jam/Kalender) ---
function BankSoalSection({
  icon: Icon,
  title,
  desc,
  badge,
  questions,
  searchQuery,
  setSearchQuery,
  searchPlaceholder = 'Cari soal...',
  idPrefix,
  practiceTarget,
  practiceLabel,
  onPractice,
  isAnswerHidden,
  toggleCardAnswer,
  playAudio,
  playingAudio,
}) {
  const q = (searchQuery || '').trim().toLowerCase();
  const filtered = q
    ? questions.filter(item =>
        ((item.question_ko || '') + ' ' + (item.question_id || '') + ' ' + (item.answer_short_ko || '') + ' ' + (item.answer_short_id || '')).toLowerCase().includes(q)
      )
    : questions;
  const shown = filtered.slice(0, 60);
  const hiddenRest = filtered.length - shown.length;

  return (
    <Card className="p-4 md:p-5 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-sm md:text-base flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary shrink-0" />
            <span>{title}</span>
            <Badge variant="outline" className="font-mono">{badge}</Badge>
          </h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
        </div>
        {onPractice && practiceTarget && (
          <Button size="sm" onClick={() => onPractice(practiceTarget)} className="shrink-0">
            <span>{practiceLabel}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {setSearchQuery && (
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-muted border border-input rounded-md text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring"
          />
        </div>
      )}

      {shown.length === 0 ? (
        <p className="text-xs text-muted-italic py-2">Tidak ada soal yang cocok dengan pencarian.</p>
      ) : (
        <div className="space-y-2.5">
          {shown.map((item, idx) => {
            const cardId = `${idPrefix}_${item.id || idx}`;
            const hidden = isAnswerHidden(cardId);
            return (
              <div key={cardId} className="p-3.5 rounded-md border border-border bg-muted space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-primary">
                    #{idx + 1} • {item.category_title || item.category}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.audio_q && (
                      <Button type="button" variant="secondary" size="sm"
                        onClick={() => playAudio(item.audio_q)}>
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>Soal</span>
                      </Button>
                    )}
                    <Button type="button" variant="outline" size="icon"
                      onClick={() => toggleCardAnswer(cardId)}
                      title="Sembunyi/tampilkan jawaban">
                      {hidden ? <EyeOff className="h-4 w-4 text-warn" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="font-kr font-bold text-lg text-foreground leading-snug">{item.question_ko}</div>
                {item.question_romaja && (
                  <div className="text-[11px] text-muted-foreground font-mono">{item.question_romaja}</div>
                )}
                <div className="text-xs text-foreground">Artinya: "{item.question_id}"</div>
                {hidden ? (
                  <div onClick={() => toggleCardAnswer(cardId)} className="cursor-pointer text-xs font-bold text-warn bg-warn/10 border border-dashed border-warn/30 px-2.5 py-1.5 rounded-md">
                    Jawaban tersembunyi (klik untuk mengintip)
                  </div>
                ) : (
                  <div className="p-2.5 rounded-sm bg-card border border-emerald-200 space-y-0.5">
                    <div className="font-kr font-bold text-sm text-emerald-900">{item.answer_short_ko}</div>
                    <div className="text-xs text-muted-foreground">{item.answer_short_id}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {hiddenRest > 0 && (
        <Button variant="outline" className="w-full" onClick={() => onPractice && practiceTarget && onPractice(practiceTarget)}>
          <span>+{hiddenRest} soal lainnya (buka latihan lengkap)</span>
        </Button>
      )}
    </Card>
  );
}
