import React, { useState, useRef, useMemo } from 'react';
import studyData from '../data/studyMaterials.json';
import allQuestions from '../data/questions.json';
import { 
  Volume2, Eye, EyeOff, Search, Sparkles, BookOpen, 
  Calendar, Clock, Hash, Palette, Users, UserCheck, 
  Factory, Wrench, CheckCircle2, ArrowRight, RotateCcw, AlertTriangle,
  Activity, ChevronRight, Check, ShieldAlert, Image
} from 'lucide-react';
import { getAssetUrl } from '../utils/assetHelper.js';

export function StudyGuide({ onStartPracticeCategory }) {
  // Active Tab
  const [activeTab, setActiveTab] = useState('k3'); // Default to K3
  
  // Universal Eye Hide/Reveal State
  // hideAllAnswers: Master switch untuk menyembunyikan semua jawaban
  const [hideAllAnswers, setHideAllAnswers] = useState(false);
  // revealedCardAnswers: Menyimpan kartu mana saja yang dibuka/ditutup secara individual
  const [revealedCardAnswers, setRevealedCardAnswers] = useState({});

  const [searchQuery, setSearchQuery] = useState('');
  const [playingAudio, setPlayingAudio] = useState(null);
  
  // Sub-filter for K3 & Interview
  const [k3Filter, setK3Filter] = useState('all');
  const [interviewFilter, setInterviewFilter] = useState('all');

  const audioRef = useRef(new Audio());

  const playAudio = (url) => {
    if (!url) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.src = getAssetUrl(url);
    setPlayingAudio(url);
    audioRef.current.onended = () => setPlayingAudio(null);
    audioRef.current.onerror = () => setPlayingAudio(null);
    audioRef.current.play().catch(() => setPlayingAudio(null));
  };

  // Helper untuk mengecek apakah jawaban kartu tertentu disembunyikan
  const isAnswerHidden = (cardId) => {
    if (hideAllAnswers) {
      // Jika master hide aktif, kartu tertutup kecuali dibuka secara eksplisit
      return !revealedCardAnswers[cardId];
    } else {
      // Jika master hide mati, kartu terbuka kecuali ditutup secara eksplisit
      return revealedCardAnswers[cardId] === true;
    }
  };

  // Toggle mata per-kartu
  const toggleCardAnswer = (cardId) => {
    setRevealedCardAnswers(prev => ({
      ...prev,
      [cardId]: hideAllAnswers ? !prev[cardId] : !prev[cardId]
    }));
  };

  const tabs = [
    { id: 'k3', label: 'K3 & Keselamatan Pabrik', icon: AlertTriangle, count: '30 Q&A & APD' },
    { id: 'interview', label: 'Tanya Jawab Wawancara', icon: UserCheck, count: '95 Soal & Situasi' },
    { id: 'commands', label: 'Gerak Fisik (따라하세요)', icon: Activity, count: '16 Gerakan' },
    { id: 'jagisoge', label: 'Jagisoge 25 Detik', icon: Sparkles, count: 'Perkenalan Diri' },
    { id: 'numbers', label: 'Nomor & Angka', icon: Hash, count: 'Sino & Asli' },
    { id: 'time', label: 'Jam & Waktu', icon: Clock, count: 'Format & Soal' },
    { id: 'calendar', label: 'Hari & Kalender', icon: Calendar, count: 'Hari, Bulan, Tgl' },
    { id: 'colors', label: 'Warna Pabrik', icon: Palette, count: '11 Warna + Alasan' },
    { id: 'family', label: 'Keluarga & Relasi', icon: Users, count: 'Silsilah & Hitungan' },
    { id: 'piktogram', label: 'Piktogram & Rambu', icon: ShieldAlert, count: '95 Rambu K3' },
    { id: 'alat', label: 'Alat Manufaktur', icon: Image, count: '65 Foto Alat' },
    { id: 'manufacturing', label: 'Pos Praktik & SOP', icon: Factory, count: 'SOP & 3 Tugas' },
  ];

  // Filter K3 Questions
  const filteredK3 = useMemo(() => {
    let list = studyData.k3_safety || [];
    if (k3Filter === 'apd') {
      list = list.slice(0, 14); // Q1 - Q14 (APD & Pelindung Diri)
    } else if (k3Filter === 'evakuasi') {
      list = list.slice(14, 18); // Q15 - Q18 (Pintu Darurat, Jalur Evakuasi, APAR)
    } else if (k3Filter === 'rambu') {
      list = list.slice(18, 22); // Q19 - Q22 (Rambu K3)
    } else if (k3Filter === 'mesin') {
      list = list.slice(22, 26); // Q23 - Q26 (Pengaman Mesin & Inspeksi)
    } else if (k3Filter === 'kimia') {
      list = list.slice(26, 30); // Q27 - Q30 (Bahan Kimia & MSDS)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => 
        item.question_ko?.toLowerCase().includes(q) ||
        item.question_id?.toLowerCase().includes(q) ||
        item.answer_ko?.toLowerCase().includes(q) ||
        item.answer_id?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [k3Filter, searchQuery]);

  // Filter Interview Questions
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
        q.question_ko?.includes('키') || 
        q.question_ko?.includes('몸무게') || 
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
        item.question_ko?.toLowerCase().includes(q) ||
        item.question_id?.toLowerCase().includes(q) ||
        item.answer_ko?.toLowerCase().includes(q) ||
        item.answer_id?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [interviewFilter, searchQuery]);

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pb-20 animate-fade-in text-[#191919]">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-white border border-[#E5E5E3] rounded-3xl p-5 md:p-6 mb-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Pusat Materi & Hafalan Kisi-Kisi Resmi HRD Korea</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight leading-snug">
              Buku Saku Hafalan Skill Test Manufaktur & Wawancara
            </h1>
            <p className="text-xs md:text-sm text-[#787774] mt-1 leading-relaxed">
              Dilengkapi 10 modul hafalan lengkap, 30 tanya jawab K3 resmi, 95 bank soal wawancara, serta 134+ audio pelafalan asli.
            </p>
          </div>

          {/* Master Toggle Mode Uji Hafalan (Sembunyikan Semua Jawaban) */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              onClick={() => {
                setHideAllAnswers(prev => !prev);
                setRevealedCardAnswers({}); // Reset individual reveals
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                hideAllAnswers 
                  ? 'bg-amber-600 text-white border-amber-600 shadow-2xs' 
                  : 'bg-white text-[#37352F] border-[#E5E5E3] hover:border-slate-400 hover:bg-[#FBFBFA]'
              }`}
              title="Sembunyikan seluruh kunci jawaban untuk menguji daya ingat Anda (setiap kartu tetap bisa dibuka dengan tombol mata)"
            >
              {hideAllAnswers ? <EyeOff className="w-4 h-4 text-white" /> : <Eye className="w-4 h-4 text-blue-600" />}
              <span>{hideAllAnswers ? 'Mode Hafal: Jawaban Tersembunyi' : 'Sembunyikan Semua Jawaban'}</span>
            </button>
          </div>
        </div>

        {/* Tab Selector Pills (10 Tabs) */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 scrollbar-none border-t border-[#EAEAE8] pt-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { 
                  setActiveTab(tab.id); 
                  setSearchQuery(''); 
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#191919] text-white shadow-2xs'
                    : 'bg-[#FBFBFA] text-[#787774] hover:bg-[#F2F2F0] hover:text-[#191919] border border-[#E5E5E3]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-[#787774]'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#EAEAE8] text-[#555]'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. K3 & KESELAMATAN PABRIK (산업안전보건 & 보호구) */}
      {/* ========================================================================= */}
      {activeTab === 'k3' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white border border-[#E5E5E3] rounded-2xl p-4 md:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>30 Tanya Jawab Standar K3 Industri HRD Korea</span>
                </h3>
                <p className="text-xs text-[#787774] mt-0.5">
                  Mencakup APD (보호구), Pintu Darurat, APAR, Rambu K3, Pengaman Mesin, dan Lembar Data Keselamatan Bahan Kimia (MSDS).
                </p>
              </div>

              <button
                onClick={() => onStartPracticeCategory && onStartPracticeCategory('k3_safety')}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all shrink-0 self-start sm:self-center active:scale-95"
              >
                <span>Latih K3 di Flashcard / Kuis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sub-Filters */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
              {[
                { id: 'all', label: `Semua Topik (30)` },
                { id: 'apd', label: `Alat Pelindung Diri APD (14)` },
                { id: 'evakuasi', label: `Pintu Darurat & APAR (4)` },
                { id: 'rambu', label: `Rambu-Rambu K3 (4)` },
                { id: 'mesin', label: `Pengaman Mesin & Cek (4)` },
                { id: 'kimia', label: `Bahan Kimia & MSDS (4)` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setK3Filter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                    k3Filter === f.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-[#F6F6F5] text-[#787774] hover:bg-[#EAEAE8] hover:text-[#191919]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#999]" />
              <input
                type="text"
                placeholder="Cari kata kunci K3 (misal: 안전모, 소화기, MSDS, 방호장치, pelindung)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FBFBFA] border border-[#E5E5E3] rounded-xl text-xs font-semibold text-[#191919] focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {filteredK3.map((q, idx) => {
              const cardId = `k3_${q.id || idx}`;
              const hidden = isAnswerHidden(cardId);

              return (
                <div key={cardId} className="bg-white border border-[#E5E5E3] rounded-2xl p-4 md:p-5 shadow-xs space-y-3 transition-all hover:border-slate-300">
                  {/* Card Header: Topic & Audio Pertanyaan */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                      #{idx + 1} • {q.topic || 'K3 Industri Pabrik'}
                    </span>

                    {/* Audio Pertanyaan */}
                    {q.audio_q && (
                      <button
                        type="button"
                        onClick={() => playAudio(q.audio_q)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-all active:scale-95 ${
                          playingAudio === q.audio_q
                            ? 'bg-blue-600 text-white border-blue-600 animate-pulse'
                            : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                        }`}
                        title="Putar audio suara penguji asli"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Putar Soal</span>
                      </button>
                    )}
                  </div>

                  {/* Pertanyaan */}
                  <div>
                    <h4 className="text-xl md:text-2xl font-black text-[#191919] font-kr tracking-tight leading-snug">
                      {q.question_ko}
                    </h4>
                    {q.question_ro && (
                      <p className="text-xs text-[#787774] font-mono mt-0.5">{q.question_ro}</p>
                    )}
                    <p className="text-xs font-medium text-[#555] mt-1 bg-[#FBFBFA] px-2.5 py-1 rounded-lg border border-[#EFEFED] inline-block">
                      Maksud Soal: "{q.question_id}"
                    </p>
                  </div>

                  {/* Kotak Kunci Jawaban dengan Tombol Mata */}
                  <div className="p-3.5 rounded-xl bg-[#FBFBFA] border border-[#E5E5E3] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kunci Jawaban Resmi HRD Korea:</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Audio Jawaban */}
                        {q.audio_a && !hidden && (
                          <button
                            type="button"
                            onClick={() => playAudio(q.audio_a)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                              playingAudio === q.audio_a
                                ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Audio Jawaban</span>
                          </button>
                        )}

                        {/* Tombol Mata Interaktif (Hide/Unhide Jawaban) */}
                        <button
                          type="button"
                          onClick={() => toggleCardAnswer(cardId)}
                          className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                            hidden 
                              ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200' 
                              : 'bg-white text-[#787774] border-[#E5E5E3] hover:text-[#191919] hover:bg-slate-50'
                          }`}
                          title={hidden ? "Tampilkan kunci jawaban" : "Sembunyikan kunci jawaban"}
                        >
                          {hidden ? <EyeOff className="w-4 h-4 text-amber-700" /> : <Eye className="w-4 h-4 text-blue-600" />}
                          <span className="text-[11px] hidden sm:inline">{hidden ? 'Buka Kunci' : 'Tutup'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Isi Jawaban (Terbuka atau Tersembunyi) */}
                    {hidden ? (
                      <div 
                        onClick={() => toggleCardAnswer(cardId)}
                        className="py-3 px-4 rounded-xl bg-amber-50/70 border border-dashed border-amber-300 text-center cursor-pointer hover:bg-amber-100/70 transition-colors"
                      >
                        <span className="text-xs font-bold text-amber-900 flex items-center justify-center gap-1.5">
                          <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                          <span>Jawaban disembunyikan untuk hafalan — Ketuk di sini untuk melihat</span>
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 animate-fade-in">
                        <p className="text-base md:text-lg font-black text-[#191919] font-kr leading-snug">
                          {q.answer_ko}
                        </p>
                        <p className="text-xs text-[#37352F] font-semibold pt-1 border-t border-[#EAEAE8]">
                          Artinya: {q.answer_id}
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TANYA JAWAB WAWANCARA & SITUASI PABRIK (면접 & 직장생활) */}
      {/* ========================================================================= */}
      {activeTab === 'interview' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E5E3] rounded-2xl p-4 md:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>95 Bank Soal Wawancara Resmi MSK Indonesia & HRD Korea</span>
                </h3>
                <p className="text-xs text-[#787774] mt-0.5">
                  Pertanyaan data diri, alasan bekerja di Korea, ketahanan fisik, serta respon cepat atas situasi kritis di pabrik.
                </p>
              </div>

              <button
                onClick={() => onStartPracticeCategory && onStartPracticeCategory('wawancara')}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all shrink-0 self-start sm:self-center active:scale-95"
              >
                <span>Latih Wawancara Lisan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
              {[
                { id: 'all', label: `Semua Soal (95)` },
                { id: 'pribadi', label: `Data Diri & Pribadi` },
                { id: 'situasi', label: `Situasi Kritis Pabrik (SOP)` },
                { id: 'hrdk', label: `Simulasi Resmi HRDK (50 Q&A)` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setInterviewFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                    interviewFilter === f.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-[#F6F6F5] text-[#787774] hover:bg-[#EAEAE8] hover:text-[#191919]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#999]" />
              <input
                type="text"
                placeholder="Cari pertanyaan wawancara (misal: 불량품, 사고, 이름, 나이, 야근, gaji, teman)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FBFBFA] border border-[#E5E5E3] rounded-xl text-xs font-semibold text-[#191919] focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {filteredInterview.map((q, idx) => {
              const cardId = `int_${q.id || idx}`;
              const hidden = isAnswerHidden(cardId);

              return (
                <div key={cardId} className="bg-white border border-[#E5E5E3] rounded-2xl p-4 md:p-5 shadow-xs space-y-3 transition-all hover:border-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md truncate max-w-[200px]">
                      #{idx + 1} • {q.category_title || q.category}
                    </span>

                    {q.audio_q && (
                      <button
                        type="button"
                        onClick={() => playAudio(q.audio_q)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-all active:scale-95 ${
                          playingAudio === q.audio_q
                            ? 'bg-blue-600 text-white border-blue-600 animate-pulse'
                            : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Putar Soal</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xl md:text-2xl font-black text-[#191919] font-kr tracking-tight leading-snug">
                      {q.question_ko}
                    </h4>
                    {q.question_ro && (
                      <p className="text-xs text-[#787774] font-mono mt-0.5">{q.question_ro}</p>
                    )}
                    <p className="text-xs font-medium text-[#555] mt-1 bg-[#FBFBFA] px-2.5 py-1 rounded-lg border border-[#EFEFED] inline-block">
                      Artinya: "{q.question_id}"
                    </p>
                  </div>

                  {/* Kotak Jawaban dengan Tombol Mata */}
                  <div className="p-3.5 rounded-xl bg-[#FBFBFA] border border-[#E5E5E3] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Model Jawaban Standar:</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        {q.audio_a && !hidden && (
                          <button
                            type="button"
                            onClick={() => playAudio(q.audio_a)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                              playingAudio === q.audio_a
                                ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Audio Jawaban</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleCardAnswer(cardId)}
                          className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                            hidden 
                              ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200' 
                              : 'bg-white text-[#787774] border-[#E5E5E3] hover:text-[#191919] hover:bg-slate-50'
                          }`}
                          title={hidden ? "Tampilkan kunci jawaban" : "Sembunyikan kunci jawaban"}
                        >
                          {hidden ? <EyeOff className="w-4 h-4 text-amber-700" /> : <Eye className="w-4 h-4 text-blue-600" />}
                          <span className="text-[11px] hidden sm:inline">{hidden ? 'Buka Kunci' : 'Tutup'}</span>
                        </button>
                      </div>
                    </div>

                    {hidden ? (
                      <div 
                        onClick={() => toggleCardAnswer(cardId)}
                        className="py-3 px-4 rounded-xl bg-amber-50/70 border border-dashed border-amber-300 text-center cursor-pointer hover:bg-amber-100/70 transition-colors"
                      >
                        <span className="text-xs font-bold text-amber-900 flex items-center justify-center gap-1.5">
                          <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                          <span>Jawaban disembunyikan untuk hafalan — Ketuk di sini untuk melihat</span>
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 animate-fade-in">
                        <p className="text-base md:text-lg font-black text-[#191919] font-kr leading-snug">
                          {q.answer_ko}
                        </p>
                        <p className="text-xs text-[#37352F] font-semibold pt-1 border-t border-[#EAEAE8]">
                          {q.answer_id}
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PERINTAH GERAK FISIK PENGUJI (따라하세요) */}
      {/* ========================================================================= */}
      {activeTab === 'commands' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E5E3] rounded-2xl p-4 md:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>16 Perintah Gerakan Fisik Penguji Wawancara (따라하세요)</span>
                </h3>
                <p className="text-xs text-[#787774] mt-0.5">
                  Diujikan saat Anda berdiri di depan penguji untuk mengetes refleks mendengar dan arah tubuh.
                </p>
              </div>

              <button
                onClick={() => onStartPracticeCategory && onStartPracticeCategory('gerak_fisik')}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all shrink-0 self-start sm:self-center active:scale-95"
              >
                <span>Latih Refleks Gerak Fisik</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(studyData.physical_commands || []).map((cmd, idx) => {
              const cardId = `cmd_${cmd.id || idx}`;
              const hidden = isAnswerHidden(cardId);

              return (
                <div key={cardId} className="bg-white border border-[#E5E5E3] rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Perintah #{idx + 1}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {cmd.audio_q && (
                          <button
                            type="button"
                            onClick={() => playAudio(cmd.audio_q)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all active:scale-95 ${
                              playingAudio === cmd.audio_q
                                ? 'bg-blue-600 text-white border-blue-600 animate-pulse'
                                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            }`}
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Dengar</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleCardAnswer(cardId)}
                          className={`p-1 rounded border text-xs transition-all ${
                            hidden ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white text-[#787774] border-[#E5E5E3] hover:text-[#191919]'
                          }`}
                          title={hidden ? "Buka arti" : "Tutup arti"}
                        >
                          {hidden ? <EyeOff className="w-3.5 h-3.5 text-amber-700" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xl font-black text-[#191919] font-kr tracking-tight">
                      {cmd.command_ko}
                    </h4>
                    {cmd.command_ro && (
                      <p className="text-xs text-[#787774] font-mono">{cmd.command_ro}</p>
                    )}

                    {hidden ? (
                      <div 
                        onClick={() => toggleCardAnswer(cardId)}
                        className="py-1.5 px-3 rounded-lg bg-amber-50/70 border border-dashed border-amber-300 text-center cursor-pointer text-[11px] font-bold text-amber-900"
                      >
                        Arti disembunyikan (Klik mata)
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-blue-700">
                        Artinya: {cmd.command_id}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#EFEFED] text-[11px] text-[#555] font-medium bg-[#FAFAFA] p-2 rounded-xl">
                    🚶 <strong>Refleks:</strong> {cmd.action_desc || cmd.command_id}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. JAGISOGE 25 DETIK */}
      {/* ========================================================================= */}
      {activeTab === 'jagisoge' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E5E3] rounded-2xl p-5 md:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-700 uppercase">Tahap 1 Ujian Resmi</span>
                <h3 className="text-lg md:text-xl font-black text-[#191919]">Template Standar Jagisoge (25 Detik)</h3>
              </div>
              <button
                onClick={() => playAudio('/audio/examiner_jagisoge.mp3')}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audio Penguji</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#FBFBFA] border border-[#E5E5E3] text-sm md:text-base font-kr font-bold text-[#191919] leading-relaxed">
              {studyData.jagisoge.template_korean}
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
              <strong>Terjemahan Bahasa Indonesia:</strong><br />
              {studyData.jagisoge.template_indonesia}
            </div>

            <div className="mt-5 space-y-3">
              <h4 className="font-extrabold text-xs text-[#787774] uppercase tracking-wider">
                Struktur Per Kalimat & Tips Skor Maksimal:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {studyData.jagisoge.structure.map((st, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-[#E5E5E3] bg-white">
                    <span className="text-[10px] font-bold text-blue-700 uppercase">Langkah {idx + 1}: {st.step}</span>
                    <div className="font-kr font-extrabold text-sm text-[#191919] mt-1">{st.ko}</div>
                    <div className="text-xs text-[#787774] mt-0.5">{st.id}</div>
                    <div className="mt-2 text-[11px] text-amber-900 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60">
                      💡 <strong>Tips Penguji:</strong> {st.tips}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <h4 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider mb-2">
                Checklist Kelulusan Sesi Jagisoge:
              </h4>
              <div className="space-y-1 text-xs text-emerald-900">
                {studyData.jagisoge.examiner_checklist.map((item, idx) => (
                  <div key={idx}>{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. NOMOR & ANGKA (SINO & ASLI) */}
      {/* ========================================================================= */}
      {activeTab === 'numbers' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E5E3] rounded-2xl p-4 md:p-5 shadow-xs">
            <h3 className="font-extrabold text-sm mb-1">Perbedaan Angka Sino-Korea vs Angka Asli Korea:</h3>
            <p className="text-xs text-[#787774] leading-relaxed">
              <strong>Sino-Korea:</strong> Menit, Tanggal/Bulan/Tahun, Uang (Won), Nomor Telepon, Berat/Panjang.<br />
              <strong>Asli Korea:</strong> Jam (waktu), Umur (살), dan Satuan Hitung Barang (개, 대, 명, 마리, 박스, 권).
            </p>
          </div>

          {/* Sino Table */}
          <div className="bg-white border border-[#E5E5E3] rounded-2xl p-4 md:p-5 shadow-xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-700 mb-3">1. Angka Sino-Korea (일, 이, 삼, 사...):</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {studyData.numbers.sino.map((n, idx) => {
                const cardId = `num_s_${idx}`;
                const hidden = isAnswerHidden(cardId);
                return (
                  <div key={idx} className="p-2.5 rounded-xl border border-[#E5E5E3] bg-[#FBFBFA] flex items-center justify-between">
                    <div>
                      {hidden ? (
                        <div onClick={() => toggleCardAnswer(cardId)} className="cursor-pointer text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                          Angka {n.val} (?)
                        </div>
                      ) : (
                        <>
                          <div className="font-kr font-black text-base text-[#191919]">{n.ko}</div>
                          <div className="text-[11px] text-[#787774] font-mono">{n.ro} = {n.val}</div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      {n.audio && (
                        <button
                          onClick={() => playAudio(n.audio)}
                          className="p-1 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleCardAnswer(cardId)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700"
                      >
                        {hidden ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Native Table */}
          <div className="bg-white border border-[#E5E5E3] rounded-2xl p-4 md:p-5 shadow-xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-700 mb-3">2. Angka Asli Korea (하나, 둘, 셋, 넷...):</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {studyData.numbers.native.map((n, idx) => {
                const cardId = `num_n_${idx}`;
                const hidden = isAnswerHidden(cardId);
                return (
                  <div key={idx} className="p-2.5 rounded-xl border border-[#E5E5E3] bg-[#FBFBFA] flex items-center justify-between">
                    <div>
                      {hidden ? (
                        <div onClick={() => toggleCardAnswer(cardId)} className="cursor-pointer text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                          Angka {n.val} (?)
                        </div>
                      ) : (
                        <>
                          <div className="font-kr font-black text-base text-[#191919]">{n.ko}</div>
                          <div className="text-[11px] text-[#787774] font-mono">{n.ro} = {n.val}</div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      {n.audio && (
                        <button
                          onClick={() => playAudio(n.audio)}
                          className="p-1 rounded text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleCardAnswer(cardId)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700"
                      >
                        {hidden ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Satuan Manufaktur */}
          <div className="bg-white border border-[#E5E5E3] rounded-2xl p-4 md:p-5 shadow-xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-purple-700 mb-3">3. Satuan Hitung Manufaktur & Gudang Pabrik:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {studyData.numbers.counters.map((c, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-[#E5E5E3] bg-[#FBFBFA]">
                  <div className="flex items-center justify-between">
                    <span className="font-kr font-black text-base text-[#191919]">{c.ko}</span>
                    <span className="text-[10px] font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">{c.meaning}</span>
                  </div>
                  <div className="text-xs text-[#787774] mt-1.5 leading-relaxed">{c.desc}</div>
                  <div className="text-xs font-semibold text-emerald-800 mt-1 font-mono">{c.example}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. JAM & WAKTU */}
      {/* ========================================================================= */}
      {activeTab === 'time' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E5E3] rounded-2xl p-4 md:p-5 shadow-xs">
            <h3 className="font-extrabold text-sm mb-1">Rumus Utama Membaca Jam:</h3>
            <p className="text-xs text-[#787774] leading-relaxed">
              <strong>Jam = Angka Asli Korea + 시 (si)</strong> | <strong>Menit = Angka Sino-Korea + 분 (bun)</strong> | <strong>Detik = Sino + 초 (cho)</strong><br />
              Contoh: 08:30 = <em>여덟 시 삼십 분</em> (yeodeol-si samsip-bun) atau <em>여덟 시 반</em> (yeodeol-si ban).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {studyData.time.examples.map((item, idx) => {
              const cardId = `time_${idx}`;
              const hidden = isAnswerHidden(cardId);

              return (
                <div key={idx} className="p-4 rounded-xl border border-[#E5E5E3] bg-white flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">{item.time}</span>
                    {hidden ? (
                      <div onClick={() => toggleCardAnswer(cardId)} className="cursor-pointer text-xs font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded mt-2">
                        Jawaban tersembunyi (Klik)
                      </div>
                    ) : (
                      <>
                        <div className="font-kr font-black text-base text-[#191919] mt-2">{item.ko}</div>
                        <div className="text-xs text-[#787774] font-mono">{item.ro}</div>
                        <div className="text-xs text-[#555] mt-0.5">{item.id}</div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {item.audio && (
                      <button
                        onClick={() => playAudio(item.audio)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => toggleCardAnswer(cardId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                    >
                      {hidden ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. HARI & KALENDER */}
      {/* ========================================================================= */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E5E3] rounded-2xl p-4 md:p-5 shadow-xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-700 mb-3">Nama-Nama Hari (요일):</h4>
            <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
              {studyData.calendar.days_of_week.map((d, idx) => {
                const cardId = `cal_d_${idx}`;
                const hidden = isAnswerHidden(cardId);

                return (
                  <div key={idx} className="p-3 rounded-xl border border-[#E5E5E3] bg-[#FBFBFA] text-center relative group">
                    <button onClick={() => toggleCardAnswer(cardId)} className="absolute top-1 right-1 text-slate-300 hover:text-slate-600">
                      {hidden ? <EyeOff className="w-3 h-3 text-amber-600" /> : <Eye className="w-3 h-3" />}
                    </button>
                    {hidden ? (
                      <div onClick={() => toggleCardAnswer(cardId)} className="cursor-pointer text-xs font-bold text-amber-800 py-2">
                        {d.id} (?)
                      </div>
                    ) : (
                      <>
                        <div className="font-kr font-black text-base text-[#191919]">{d.ko}</div>
                        <div className="text-[11px] text-[#787774] font-mono">{d.ro}</div>
                        <div className="text-xs font-bold text-blue-700 mt-1">{d.id}</div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-[#E5E5E3] rounded-2xl p-4 md:p-5 shadow-xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-700 mb-3">12 Bulan Kalender (월):</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {studyData.calendar.months.map((m, idx) => (
                <div key={idx} className={`p-3 rounded-xl border text-center ${m.note ? 'bg-amber-50/50 border-amber-200' : 'bg-[#FBFBFA] border-[#E5E5E3]'}`}>
                  <div className="font-kr font-black text-base text-[#191919]">{m.ko}</div>
                  <div className="text-[11px] text-[#787774] font-mono">{m.ro}</div>
                  <div className="text-xs font-bold text-[#37352F] mt-1">{m.id}</div>
                  {m.note && <div className="text-[10px] text-amber-800 font-bold mt-1">⚠️ {m.note}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. WARNA DASAR */}
      {/* ========================================================================= */}
      {activeTab === 'colors' && (
        <div className="space-y-4">
          {/* Info box */}
          <div className="bg-white border border-[#E5E5E3] rounded-2xl p-4 shadow-xs">
            <h3 className="font-extrabold text-sm flex items-center gap-2 mb-1">
              <Palette className="w-4 h-4 text-rose-500 shrink-0" />
              11 Warna Pabrik & Alasan Korea (색깔 & 이유)
            </h3>
            <p className="text-xs text-[#787774]">
              Pertanyaan wawancara: <em>"무슨 색깔을 좋아해요?"</em> — Hafal nama warna + alasan singkat Korea.
              Aktifkan <strong>Mode Sembunyikan</strong> (tombol atas) untuk berlatih menebak.
            </p>
          </div>

          {/* Colour grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(studyData.colors.items || []).map((c, idx) => {
              const cardId = `col_${idx}`;
              const hidden = isAnswerHidden(cardId);

              return (
                <div key={idx} className="rounded-2xl border border-[#E5E5E3] bg-white overflow-hidden shadow-xs hover:shadow-sm transition-shadow">
                  {/* Colour swatch strip */}
                  <div
                    className="h-14 w-full"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div className="p-3.5 space-y-2">
                    {/* Korean name + romaji + Indonesian */}
                    {hidden ? (
                      <div
                        onClick={() => toggleCardAnswer(cardId)}
                        className="cursor-pointer py-2 px-3 rounded-xl bg-amber-50 border border-dashed border-amber-300 text-center"
                      >
                        <span className="text-xs font-bold text-amber-800 flex items-center justify-center gap-1">
                          <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                          Tebak warna — ketuk untuk lihat
                        </span>
                      </div>
                    ) : (
                      <div className="animate-fade-in">
                        <div className="font-kr font-black text-lg text-[#191919] leading-tight">{c.ko}</div>
                        <div className="text-xs text-[#787774] font-mono mt-0.5">{c.ro}</div>
                        <div className="text-sm font-bold text-[#37352F] mt-1">{c.id}</div>
                      </div>
                    )}

                    {/* Reason (alasan) — always shown when not hidden */}
                    {!hidden && c.reason && (
                      <div className="text-[11px] text-[#555] bg-[#FBFBFA] border border-[#EAEAE8] rounded-xl px-2.5 py-2 leading-relaxed">
                        💬 {c.reason}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {c.audio && (
                        <button
                          onClick={() => playAudio(c.audio)}
                          aria-label={`Putar audio ${c.id}`}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all min-h-[36px] ${
                            playingAudio === c.audio
                              ? 'bg-blue-600 text-white border-blue-600 animate-pulse'
                              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Dengar</span>
                        </button>
                      )}
                      <button
                        onClick={() => toggleCardAnswer(cardId)}
                        aria-label={hidden ? 'Tampilkan jawaban' : 'Sembunyikan jawaban'}
                        className={`ml-auto p-2 rounded-xl border transition-all min-h-[36px] min-w-[36px] flex items-center justify-center ${
                          hidden
                            ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                            : 'bg-white text-slate-400 border-[#E5E5E3] hover:text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {hidden ? <EyeOff className="w-4 h-4 text-amber-700" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interview QA bonus */}
          {studyData.colors.interview_qa && (
            <div className="bg-white border border-[#E5E5E3] rounded-2xl p-4 shadow-xs space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-rose-700">
                Contoh Tanya Jawab Warna di Wawancara:
              </h4>
              {studyData.colors.interview_qa.map((qa, i) => (
                <div key={i} className="border border-[#EAEAE8] rounded-xl p-3 space-y-1">
                  <div className="text-xs font-bold text-[#787774]">❓ {qa.q_id}</div>
                  <div className="font-kr font-black text-sm text-[#191919]">{qa.q_ko}</div>
                  <div className="text-[11px] text-[#787774] font-mono">{qa.q_ro}</div>
                  <div className="mt-2 pt-2 border-t border-[#EAEAE8] text-xs text-emerald-900 bg-emerald-50 rounded-lg p-2">
                    ✅ {qa.a_id}<br />
                    <span className="font-kr font-bold">{qa.a_ko}</span>
                  </div>
                  {qa.audio && (
                    <button onClick={() => playAudio(qa.audio)} className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 mt-1">
                      <Volume2 className="w-3 h-3" /> Putar Audio
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}




      {/* ========================================================================= */}
      {/* 9. KELUARGA & RELASI */}

      {/* ========================================================================= */}
      {activeTab === 'family' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(studyData.family.items || studyData.family.members || []).map((f, idx) => {
              const cardId = `fam_${idx}`;
              const hidden = isAnswerHidden(cardId);

              return (
                <div key={idx} className="p-4 rounded-xl border border-[#E5E5E3] bg-white flex items-center justify-between">
                  <div>
                    {hidden ? (
                      <div onClick={() => toggleCardAnswer(cardId)} className="cursor-pointer text-xs font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded">
                        {f.id} (?)
                      </div>
                    ) : (
                      <>
                        <div className="font-kr font-black text-base text-[#191919]">{f.ko}</div>
                        <div className="text-xs text-[#787774] font-mono">{f.ro}</div>
                        <div className="text-xs font-bold text-blue-800 mt-1">{f.id}</div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {f.audio && (
                      <button onClick={() => playAudio(f.audio)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl">
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => toggleCardAnswer(cardId)} className="p-1 text-slate-400 hover:text-slate-700">
                      {hidden ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. PIKTOGRAM & RAMBU KESELAMATAN */}
      {/* ========================================================================= */}
      {activeTab === 'piktogram' && (() => {
        const piktogramList = allQuestions.filter(q => q.category === 'piktogram');
        const groups = piktogramList.reduce((acc, q) => {
          const g = q.category_title || 'Lainnya';
          if (!acc[g]) acc[g] = [];
          acc[g].push(q);
          return acc;
        }, {});
        return (
          <div className="space-y-4">
            <div className="bg-white border border-[#E5E5E3] rounded-2xl p-4 shadow-xs">
              <h3 className="font-extrabold text-sm flex items-center gap-2 mb-1">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                {piktogramList.length} Piktogram & Rambu Keselamatan Kerja (안전 표지)
              </h3>
              <p className="text-xs text-[#787774]">
                Pertanyaan penguji: <em>"이 안전 표지는 무슨 뜻입니까?"</em> — Hafal arti setiap rambu beserta nama Koreanya.
              </p>
            </div>
            {Object.entries(groups).map(([groupName, items]) => (
              <div key={groupName} className="bg-white border border-[#E5E5E3] rounded-2xl p-4 shadow-xs space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-700">{groupName}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {items.map((p, idx) => {
                    const cardId = `pik_${p.id || idx}`;
                    const hidden = isAnswerHidden(cardId);
                    return (
                      <div key={cardId} className="rounded-xl border border-[#E5E5E3] bg-[#FBFBFA] overflow-hidden flex flex-col hover:shadow-sm transition-shadow">
                        {/* Pictogram image */}
                        <div className="bg-white p-2 flex items-center justify-center min-h-[80px]">
                          <img
                            src={getAssetUrl(p.image_url)}
                            alt={p.title_id || p.title_ko}
                            className="max-h-20 w-auto object-contain"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-2.5 flex flex-col gap-1.5 flex-1">
                          {hidden ? (
                            <div
                              onClick={() => toggleCardAnswer(cardId)}
                              className="cursor-pointer text-center py-1.5 px-2 rounded-lg bg-amber-50 border border-dashed border-amber-300"
                            >
                              <EyeOff className="w-3.5 h-3.5 text-amber-700 mx-auto mb-0.5" />
                              <span className="text-[10px] font-bold text-amber-800">Ketuk untuk lihat</span>
                            </div>
                          ) : (
                            <div className="animate-fade-in">
                              <div className="font-kr font-black text-xs text-[#191919] leading-tight">{p.title_ko}</div>
                              <div className="text-[11px] text-blue-700 font-medium mt-0.5">{p.title_id}</div>
                            </div>
                          )}
                          <div className="flex items-center gap-1 mt-auto">
                            {p.audio_q && (
                              <button
                                onClick={() => playAudio(p.audio_q)}
                                aria-label="Putar soal"
                                className={`p-1.5 rounded-lg transition-all min-h-[32px] min-w-[32px] flex items-center justify-center ${
                                  playingAudio === p.audio_q
                                    ? 'bg-blue-600 text-white animate-pulse'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                }`}
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => toggleCardAnswer(cardId)}
                              aria-label={hidden ? 'Tampilkan jawaban' : 'Sembunyikan jawaban'}
                              className={`ml-auto p-1.5 rounded-lg border transition-all min-h-[32px] min-w-[32px] flex items-center justify-center ${
                                hidden
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-white text-slate-400 border-[#E5E5E3] hover:text-slate-700'
                              }`}
                            >
                              {hidden ? <EyeOff className="w-3.5 h-3.5 text-amber-700" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 11. ALAT MANUFAKTUR (Foto + Nama) */}
      {/* ========================================================================= */}
      {activeTab === 'alat' && (() => {
        const alatList = allQuestions.filter(q => q.category === 'alat_manufaktur');
        const groups = alatList.reduce((acc, q) => {
          const g = q.category_title || 'Alat Manufaktur';
          if (!acc[g]) acc[g] = [];
          acc[g].push(q);
          return acc;
        }, {});
        return (
          <div className="space-y-4">
            <div className="bg-white border border-[#E5E5E3] rounded-2xl p-4 shadow-xs">
              <h3 className="font-extrabold text-sm flex items-center gap-2 mb-1">
                <Wrench className="w-4 h-4 text-slate-600 shrink-0" />
                {alatList.length} Alat & Perkakas Manufaktur (공구 & 기계)
              </h3>
              <p className="text-xs text-[#787774]">
                Pertanyaan penguji: <em>"이 공구의 이름은 무엇입니까?"</em> — Hafal nama Korea setiap alat dari fotonya.
              </p>
            </div>
            {Object.entries(groups).map(([groupName, items]) => (
              <div key={groupName} className="bg-white border border-[#E5E5E3] rounded-2xl p-4 shadow-xs space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">{groupName}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {items.map((a, idx) => {
                    const cardId = `alat_${a.id || idx}`;
                    const hidden = isAnswerHidden(cardId);
                    return (
                      <div key={cardId} className="rounded-xl border border-[#E5E5E3] bg-[#FBFBFA] overflow-hidden flex flex-col hover:shadow-sm transition-shadow">
                        {/* Tool image */}
                        <div className="bg-white p-2 flex items-center justify-center min-h-[90px]">
                          <img
                            src={getAssetUrl(a.image_url)}
                            alt={a.title_id || a.title_ko}
                            className="max-h-24 w-auto object-contain"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-2.5 flex flex-col gap-1.5 flex-1">
                          {/* Level badge */}
                          {a.level && (
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full w-fit ${
                              a.level === 'Atas' ? 'bg-red-50 text-red-700'
                              : a.level === 'Menengah' ? 'bg-amber-50 text-amber-700'
                              : 'bg-blue-50 text-blue-700'
                            }`}>
                              Tingkat {a.level}
                            </span>
                          )}
                          {hidden ? (
                            <div
                              onClick={() => toggleCardAnswer(cardId)}
                              className="cursor-pointer text-center py-1.5 px-2 rounded-lg bg-amber-50 border border-dashed border-amber-300"
                            >
                              <EyeOff className="w-3.5 h-3.5 text-amber-700 mx-auto mb-0.5" />
                              <span className="text-[10px] font-bold text-amber-800">Ketuk untuk lihat</span>
                            </div>
                          ) : (
                            <div className="animate-fade-in">
                              <div className="font-kr font-black text-xs text-[#191919] leading-tight">{a.title_ko}</div>
                              <div className="text-[11px] text-blue-700 font-medium mt-0.5">{a.title_id}</div>
                            </div>
                          )}
                          <div className="flex items-center gap-1 mt-auto">
                            {a.audio_q && (
                              <button
                                onClick={() => playAudio(a.audio_q)}
                                aria-label="Putar soal"
                                className={`p-1.5 rounded-lg transition-all min-h-[32px] min-w-[32px] flex items-center justify-center ${
                                  playingAudio === a.audio_q
                                    ? 'bg-blue-600 text-white animate-pulse'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                }`}
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => toggleCardAnswer(cardId)}
                              aria-label={hidden ? 'Tampilkan jawaban' : 'Sembunyikan jawaban'}
                              className={`ml-auto p-1.5 rounded-lg border transition-all min-h-[32px] min-w-[32px] flex items-center justify-center ${
                                hidden
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-white text-slate-400 border-[#E5E5E3] hover:text-slate-700'
                              }`}
                            >
                              {hidden ? <EyeOff className="w-3.5 h-3.5 text-amber-700" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 12. POS PRAKTIK & ALAT MANUFAKTUR */}
      {/* ========================================================================= */}
      {activeTab === 'manufacturing' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E5E3] rounded-2xl p-4 md:p-5 shadow-xs">
            <h3 className="font-extrabold text-sm mb-1">3 Pos Ujian Keterampilan Fisik Manufaktur (기초기능):</h3>
            <p className="text-xs text-[#787774] mb-3">Sesuai buku panduan ujian resmi Sistem Poin HRD Korea:</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {studyData.manufacturing.practical_tasks.map((task, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-[#E5E5E3] bg-[#FBFBFA] flex flex-col justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] uppercase">
                      {task.task_num}
                    </span>
                    <h4 className="font-black text-sm text-[#191919] mt-2">{task.task_name}</h4>
                    <p className="text-xs text-[#787774] mt-1.5 leading-relaxed">{task.desc}</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#EAEAE8] text-[11px] text-emerald-900 font-medium bg-emerald-50/50 p-2 rounded-xl">
                    ⭐ <strong>Kunci Penilaian:</strong> {task.evaluation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fungsi & Kegunaan Perkakas Manufaktur (도구의 용도) */}
          <div className="bg-white border border-[#E5E5E3] rounded-2xl p-4 md:p-5 shadow-xs space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] uppercase">
                  Wajib Dihafal
                </span>
                <h3 className="font-extrabold text-sm text-[#191919]">
                  Tanya-Jawab Fungsi & Kegunaan Perkakas (도구의 용도):
                </h3>
              </div>
              <p className="text-xs text-[#787774] mt-1">
                Pertanyaan resmi penguji di bilik meja: <em>"이 도구는 무엇에 사용합니까?"</em> (Alat ini digunakan untuk apa?):
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(studyData.manufacturing.tool_functions || []).map((tf, idx) => {
                const cardId = `tool_func_${idx}`;
                const hidden = isAnswerHidden(cardId);

                return (
                  <div key={idx} className="p-3.5 rounded-xl border border-[#E5E5E3] bg-[#FBFBFA] flex flex-col justify-between space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {tf.title_ko} • {tf.title_id}
                        </span>
                        <div className="font-kr font-bold text-sm text-[#191919] mt-1.5">
                          {tf.question_ko}
                        </div>
                        <div className="text-[11px] text-[#787774] font-mono">{tf.question_romaja}</div>
                        <div className="text-xs text-[#787774] italic mt-0.5">{tf.question_id}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {tf.audio_q && (
                          <button onClick={() => playAudio(tf.audio_q)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Volume2 className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => toggleCardAnswer(cardId)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                          {hidden ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#EAEAE8]">
                      {hidden ? (
                        <div onClick={() => toggleCardAnswer(cardId)} className="cursor-pointer text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-dashed border-amber-300 text-center">
                          Klik ikon mata 👁️ untuk membuka fungsi alat
                        </div>
                      ) : (
                        <div className="space-y-0.5 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                            Jawaban Resmi (Fungsi Alat):
                          </span>
                          <div className="font-kr font-bold text-xs text-emerald-950">{tf.answer_short_ko}</div>
                          <div className="text-[11px] text-emerald-800 font-medium">{tf.answer_short_id}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Perintah Aksi Penggunaan & Penataan Alat (작업 지시 이행) */}
          <div className="bg-white border border-[#E5E5E3] rounded-2xl p-4 md:p-5 shadow-xs space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[10px] uppercase">
                  Peragaan Praktik
                </span>
                <h3 className="font-extrabold text-sm text-[#191919]">
                  Perintah Aksi Penggunaan & Penataan Alat (작업 지시 이행):
                </h3>
              </div>
              <p className="text-xs text-[#787774] mt-1">
                Instruksi lisan penguji saat menyuruh peserta mengambil, menggunakan, atau merapikan alat kerja ke kotak perkakas (공구함):
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(studyData.manufacturing.tool_action_commands || []).map((ta, idx) => {
                const cardId = `tool_act_${idx}`;
                const hidden = isAnswerHidden(cardId);

                return (
                  <div key={idx} className="p-3.5 rounded-xl border border-[#E5E5E3] bg-[#FBFBFA] flex flex-col justify-between space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                          {ta.title_id}
                        </span>
                        <div className="font-kr font-bold text-sm text-[#191919] mt-1.5">
                          {ta.question_ko}
                        </div>
                        <div className="text-[11px] text-[#787774] font-mono">{ta.question_romaja}</div>
                        <div className="text-xs text-[#787774] italic mt-0.5">{ta.question_id}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {ta.audio_q && (
                          <button onClick={() => playAudio(ta.audio_q)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Volume2 className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => toggleCardAnswer(cardId)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                          {hidden ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#EAEAE8]">
                      {hidden ? (
                        <div onClick={() => toggleCardAnswer(cardId)} className="cursor-pointer text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-dashed border-amber-300 text-center">
                          Klik ikon mata 👁️ untuk membuka respon sopan
                        </div>
                      ) : (
                        <div className="space-y-0.5 bg-blue-50/60 p-2.5 rounded-xl border border-blue-200">
                          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                            Respon Sopan & Tindakan Kandidat:
                          </span>
                          <div className="font-kr font-bold text-xs text-blue-950">{ta.answer_short_ko}</div>
                          <div className="text-[11px] text-blue-800 font-medium">{ta.answer_short_id}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-[#E5E5E3] rounded-2xl p-4 md:p-5 shadow-xs">
            <h3 className="font-extrabold text-sm mb-1">3 Tingkatan Alat Manufaktur HRD Korea 2026:</h3>
            <p className="text-xs text-[#787774] mb-3">Klasifikasi resmi kisi-kisi manufaktur 2026 (Tingkat Atas, Menengah, Bawah):</p>

            <div className="space-y-3">
              {studyData.manufacturing.hrdk_tool_tiers.map((t, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[#E5E5E3] bg-[#FBFBFA]">
                  <div className="font-black text-xs text-[#191919] uppercase tracking-wider mb-1">{t.tier}</div>
                  <div className="text-xs text-[#787774] mb-2">{t.desc}</div>
                  <div className="flex flex-wrap gap-2">
                    {t.tools.map((tool, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E5E3] font-mono text-xs font-bold text-[#37352F]">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
