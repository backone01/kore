// =========================================================================
// STANDAR RESMI KISI-KISI SKILL TEST TAHAP 2 (HRD KOREA & EPSTOPIKHUB)
// =========================================================================
// Sumber: Regulasi Resmi HRDK Revisi Terbaru (50 Poin Wawancara + Job Skills)
// dan Sistem Pembagian Materi epstopikhub.com/skill-test
//
// Struktur ini adalah SINGLE SOURCE OF TRUTH yang dipakai SAMA PERSIS
// di seluruh mode: Materi (StudyGuide), Latihan (Practice), dan Ujian (Exam).

export const HRDK_MODULES = [
  {
    id: 'all',
    label: 'Semua Bank Soal Resmi',
    shortLabel: 'Semua Soal',
    icon: 'Layers',
    desc: 'Seluruh bank soal kisi-kisi resmi',
    categories: [],
    color: 'slate'
  },
  {
    id: 'interview',
    label: '1. Wawancara & Jagisoge (면접 & 자기소개)',
    shortLabel: '1. Wawancara',
    icon: 'UserCheck',
    desc: 'Perkenalan Diri (Jagisoge 25s), Data Diri, Keluarga, Sikap Kerja NCS & Simulasi HRDK',
    categories: ['wawancara', 'simulasi_hrdk', 'wawancara_profesional'],
    studyTab: 'interview',
    points: 18,
    color: 'blue'
  },
  {
    id: 'physical',
    label: '2. Gerak Fisik Tubuh (신체동작 - 따라하세요)',
    shortLabel: '2. Gerak Fisik',
    icon: 'Activity',
    desc: '47 Perintah Refleks Gerak Fisik Tubuh saat berdiri di depan penguji (Arah, Tangan, Kaki, Posisi)',
    categories: ['gerak_fisik'],
    studyTab: 'physical',
    points: 15,
    color: 'emerald'
  },
  {
    id: 'safety',
    label: '3. K3 & Keselamatan Pabrik (산업안전 - 30 Topik)',
    shortLabel: '3. K3 Industri',
    icon: 'AlertTriangle',
    desc: '30 Topik K3 Mendalam Resmi KOSHA (112 Tanya Jawab Lisan Wawancara Resmi)',
    categories: ['k3_safety'],
    studyTab: 'safety',
    points: 10,
    color: 'amber'
  },
  {
    id: 'pictogram',
    label: '4. Rambu & Piktogram K3 (안전보건표지판)',
    shortLabel: '4. Rambu Gambar',
    icon: 'ShieldAlert',
    desc: '98 Rambu Keselamatan & Piktogram Bergambar (Wajib, Peringatan, Larangan, Evakuasi)',
    categories: ['piktogram'],
    studyTab: 'piktogram',
    points: 4,
    color: 'orange'
  },
  {
    id: 'tools',
    label: '5. Perkakas & Alat Kerja (공구 & 기능시험)',
    shortLabel: '5. Alat Kerja',
    icon: 'Wrench',
    desc: '90 Foto Fisik & Nama Alat Manufaktur beserta Kalimat Fungsi Kegunaan Alat Kerja',
    categories: ['alat_manufaktur', 'alat_klasik', 'fungsi_alat', 'praktik_alat', 'perintah_alat'],
    studyTab: 'tools',
    points: 7,
    color: 'violet'
  },
  {
    id: 'numbers',
    label: '6. Dasar Berhitung & Satuan (기초연산 & 단위)',
    shortLabel: '6. Hitungan Pabrik',
    icon: 'Hash',
    desc: 'Angka Sino/Asli, Jam/Waktu, Kalender, Satuan Hitung Manufaktur & Hitungan Lisan Pabrik',
    categories: ['matematika', 'konversi_satuan', 'hitungan_lisan'],
    studyTab: 'numbers',
    points: 4,
    color: 'rose'
  },
  {
    id: 'colors',
    label: '7. Tes Penglihatan Warna (색각검사 & 색상)',
    shortLabel: '7. Tes Warna',
    icon: 'Palette',
    desc: '11 Warna Pabrik dengan Alasan Kerja & Pengetahuan Tes Warna Ishihara',
    categories: [],
    studyTab: 'colors',
    points: 0,
    color: 'pink'
  }
];

// Alias untuk kompatibilitas
export const MAIN_MODULES = HRDK_MODULES;

// Warna solid per modul untuk filter buttons (semua hardcoded inline class)
export const MODULE_COLORS = {
  all: {
    active: 'bg-slate-800 text-white border-slate-800',
    dot: 'bg-slate-800',
    text: 'text-slate-700',
    border: 'border-slate-800'
  },
  interview: {
    active: 'bg-blue-700 text-white border-blue-700',
    dot: 'bg-blue-600',
    text: 'text-blue-700',
    border: 'border-blue-700'
  },
  physical: {
    active: 'bg-emerald-700 text-white border-emerald-700',
    dot: 'bg-emerald-600',
    text: 'text-emerald-700',
    border: 'border-emerald-700'
  },
  safety: {
    active: 'bg-amber-600 text-white border-amber-600',
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    border: 'border-amber-600'
  },
  pictogram: {
    active: 'bg-orange-600 text-white border-orange-600',
    dot: 'bg-orange-500',
    text: 'text-orange-700',
    border: 'border-orange-600'
  },
  tools: {
    active: 'bg-violet-700 text-white border-violet-700',
    dot: 'bg-violet-600',
    text: 'text-violet-700',
    border: 'border-violet-700'
  },
  numbers: {
    active: 'bg-rose-700 text-white border-rose-700',
    dot: 'bg-rose-600',
    text: 'text-rose-700',
    border: 'border-rose-700'
  },
  colors: {
    active: 'bg-pink-700 text-white border-pink-700',
    dot: 'bg-pink-600',
    text: 'text-pink-700',
    border: 'border-pink-700'
  }
};

export const CATEGORY_GROUPS = [
  { id: 'interview', label: '1. Wawancara & Jagisoge (면접)' },
  { id: 'physical', label: '2. Gerak Fisik Tubuh (신체동작)' },
  { id: 'safety', label: '3. K3 & Keselamatan Pabrik (산업안전)' },
  { id: 'pictogram', label: '4. Rambu & Piktogram K3 (표지판)' },
  { id: 'tools', label: '5. Perkakas & Praktik Alat (공구)' },
  { id: 'numbers', label: '6. Angka, Hitungan & Satuan (기초연산)' },
];

/**
 * Sub-kategori mendalam per modul untuk mode Latihan dan Pemilih Kategori
 */
export const SUB_CATEGORIES = {
  interview: [
    { id: 'interview', label: 'Semua Wawancara (103 Soal)', shortLabel: 'Semua Wawancara' },
    { id: 'wwc_pribadi', label: 'Data Diri, Keluarga & Hobi (자기소개)', shortLabel: 'Data Diri & Keluarga' },
    { id: 'wwc_situasi', label: 'Situasi Kerja & Lembur (작업상황)', shortLabel: 'Situasi Kerja Pabrik' },
    { id: 'wwc_lapangan', label: 'Pertanyaan Lapangan Baru (현장면접 · 35 Soal)', shortLabel: 'Wawancara Lapangan' },
    { id: 'simulasi_hrdk', label: 'Simulasi Resmi HRDK (모의면접)', shortLabel: 'Simulasi HRDK' },
  ],
  physical: [
    { id: 'physical', label: 'Semua Perintah Fisik (51 Gerak)', shortLabel: 'Semua Gerak' },
    { id: 'cmd_tangan', label: 'Gerakan Tangan & Jari (손·손가락)', shortLabel: 'Tangan & Jari' },
    { id: 'cmd_kaki', label: 'Gerakan Kaki & Postur (발·자세)', shortLabel: 'Kaki & Postur' },
    { id: 'cmd_kepala', label: 'Kepala & Panca Indra (머리·눈·귀)', shortLabel: 'Kepala & Indra' },
    { id: 'cmd_arah', label: 'Arah & Pandangan (방향·시선)', shortLabel: 'Arah & Pandangan' },
  ],
  safety: [
    { id: 'safety', label: 'Semua Topik K3 (112 Soal)', shortLabel: 'Semua K3' },
    { id: 'k3_before', label: 'Sebelum Bekerja (작업 전 · Topik 1-10)', shortLabel: 'Sebelum Bekerja' },
    { id: 'k3_during', label: 'Saat Bekerja (작업 중 · Topik 11-22)', shortLabel: 'Saat Bekerja' },
    { id: 'k3_after', label: 'Setelah Selesai Kerja (작업 후 · Topik 23-28)', shortLabel: 'Setelah Bekerja' },
    { id: 'k3_emergency', label: 'Situasi Darurat & P3K (비상시 · Topik 29-30)', shortLabel: 'Darurat & P3K' },
  ],
  pictogram: [
    { id: 'pictogram', label: 'Semua Rambu (98 Rambu)', shortLabel: 'Semua Rambu' },
    { id: 'pik_wajib', label: '지시 · Tindakan Wajib APD (23 Rambu)', shortLabel: '지시 (Wajib APD)' },
    { id: 'pik_peringatan', label: '경고 · Peringatan Bahaya (12 Rambu)', shortLabel: '경고 (Peringatan)' },
    { id: 'pik_larangan', label: '금지 · Tanda Larangan (29 Rambu)', shortLabel: '금지 (Larangan)' },
    { id: 'pik_evakuasi', label: '안내·소방 · Evakuasi & Fasilitas (31 Rambu)', shortLabel: '안내·소방 (Evakuasi)' },
  ],
  tools: [
    { id: 'tools', label: 'Semua Alat Kerja (90 Alat)', shortLabel: 'Semua Alat' },
    { id: 'alat_dasar', label: 'Tingkat Dasar (하)', shortLabel: 'Tingkat Dasar' },
    { id: 'alat_menengah', label: 'Tingkat Menengah (중)', shortLabel: 'Tingkat Menengah' },
    { id: 'alat_atas', label: 'Tingkat Atas (상)', shortLabel: 'Tingkat Atas' },
    { id: 'alat_apd', label: 'Wajib APD & Perkakas Klasik', shortLabel: 'APD & Klasik' },
  ],
  numbers: [
    { id: 'numbers', label: 'Semua Hitungan & Satuan (436 Soal)', shortLabel: 'Semua Hitungan' },
    { id: 'matematika', label: 'Dasar Berhitung Pabrik (400 Soal)', shortLabel: 'Aritmatika Pabrik' },
    { id: 'konversi_satuan', label: 'Konversi Satuan & Waktu (26 Soal)', shortLabel: 'Satuan & Waktu' },
    { id: 'hitungan_lisan', label: 'Hitungan Lisan Pabrik (10 Soal)', shortLabel: 'Hitungan Lisan' },
  ],
};

/**
 * Mencari modul induk untuk kategori atau sub-kategori apa pun
 */
export function getParentModuleId(catId) {
  if (!catId || catId === 'all') return 'all';
  if (HRDK_MODULES.some(m => m.id === catId)) return catId;
  for (const [modId, subList] of Object.entries(SUB_CATEGORIES)) {
    if (subList.some(s => s.id === catId)) return modId;
  }
  const mod = HRDK_MODULES.find(m => m.categories.includes(catId));
  if (mod) return mod.id;
  return 'all';
}

/**
 * Metadata label nama untuk kategori/sub-kategori apa pun
 */
export function getCategoryMeta(catId) {
  if (!catId || catId === 'all') return { label: 'Semua Bank Soal', shortLabel: 'Semua Soal' };
  const mod = HRDK_MODULES.find(m => m.id === catId);
  if (mod) return { label: mod.label, shortLabel: mod.shortLabel };
  for (const subList of Object.values(SUB_CATEGORIES)) {
    const found = subList.find(s => s.id === catId);
    if (found) return found;
  }
  return { label: catId, shortLabel: catId };
}

/**
 * Filter questions based on selected module or individual sub-category
 */
export function filterQuestionsByCategory(questions, selectedCatId) {
  if (!selectedCatId || selectedCatId === 'all') return questions;
  
  // 1. Standar Modul Utama
  const mod = HRDK_MODULES.find(m => m.id === selectedCatId);
  if (mod && mod.categories.length > 0) {
    return questions.filter(q => mod.categories.includes(q.category));
  }

  // 2. Sub-Kategori Rambu & Piktogram K3
  if (selectedCatId === 'pik_wajib') {
    return questions.filter(q => q.category === 'piktogram' && (q.category_title || '').includes('지시'));
  }
  if (selectedCatId === 'pik_peringatan') {
    return questions.filter(q => q.category === 'piktogram' && (q.category_title || '').includes('경고'));
  }
  if (selectedCatId === 'pik_larangan') {
    return questions.filter(q => q.category === 'piktogram' && (q.category_title || '').includes('금지'));
  }
  if (selectedCatId === 'pik_evakuasi') {
    return questions.filter(q => q.category === 'piktogram' && /안내|소방/.test(q.category_title || ''));
  }

  // 3. Sub-Kategori K3 Industri (30 Topik)
  if (selectedCatId === 'k3_before') {
    return questions.filter(q => q.category === 'k3_safety' && (q.phase_key === 'before' || (typeof q.topic_no === 'number' && q.topic_no <= 10)));
  }
  if (selectedCatId === 'k3_during') {
    return questions.filter(q => q.category === 'k3_safety' && (q.phase_key === 'during' || (typeof q.topic_no === 'number' && q.topic_no >= 11 && q.topic_no <= 22)));
  }
  if (selectedCatId === 'k3_after') {
    return questions.filter(q => q.category === 'k3_safety' && (q.phase_key === 'after' || (typeof q.topic_no === 'number' && q.topic_no >= 23 && q.topic_no <= 28)));
  }
  if (selectedCatId === 'k3_emergency') {
    return questions.filter(q => q.category === 'k3_safety' && (q.phase_key === 'emergency' || (typeof q.topic_no === 'number' && q.topic_no >= 29)));
  }

  // 4. Sub-Kategori Perkakas & Alat Kerja
  if (selectedCatId === 'alat_dasar') {
    return questions.filter(q => (q.category === 'alat_manufaktur' || q.category === 'alat_klasik') && (q.level === 'Dasar' || q.level === 'Rendah'));
  }
  if (selectedCatId === 'alat_menengah') {
    return questions.filter(q => (q.category === 'alat_manufaktur' || q.category === 'alat_klasik') && (q.level === 'Menengah' || q.level === 'Sedang'));
  }
  if (selectedCatId === 'alat_atas') {
    return questions.filter(q => (q.category === 'alat_manufaktur' || q.category === 'alat_klasik') && (q.level === 'Atas' || q.level === 'Tinggi'));
  }
  if (selectedCatId === 'alat_apd') {
    return questions.filter(q => (q.category === 'alat_manufaktur' || q.category === 'alat_klasik') && (q.level === 'Wajib' || q.category === 'alat_klasik'));
  }

  // 5. Sub-Kategori Gerak Fisik Tubuh (따라하세요)
  if (selectedCatId === 'cmd_tangan') {
    return questions.filter(q => q.category === 'gerak_fisik' && /손|팔|주먹|박수|손가락|tangan|jari|kepal|tepuk/i.test(`${q.question_ko || ''} ${q.question_id || ''}`));
  }
  if (selectedCatId === 'cmd_kaki') {
    return questions.filter(q => q.category === 'gerak_fisik' && /발|앉|일어나|허리|어깨|kaki|duduk|berdiri|pinggang|bahu|membungkuk|bungkuk/i.test(`${q.question_ko || ''} ${q.question_id || ''}`));
  }
  if (selectedCatId === 'cmd_kepala') {
    return questions.filter(q => q.category === 'gerak_fisik' && /눈|입|코|귀|고개|mata|mulut|hidung|telinga|kepala/i.test(`${q.question_ko || ''} ${q.question_id || ''}`));
  }
  if (selectedCatId === 'cmd_arah') {
    return questions.filter(q => q.category === 'gerak_fisik' && !/손|팔|주먹|박수|손가락|tangan|jari|kepal|tepuk|발|앉|일어나|허리|어깨|kaki|duduk|berdiri|pinggang|bahu|membungkuk|bungkuk|눈|입|코|귀|고개|mata|mulut|hidung|telinga|kepala/i.test(`${q.question_ko || ''} ${q.question_id || ''}`));
  }

  // 6. Sub-Kategori Wawancara & Jagisoge
  if (selectedCatId === 'wwc_pribadi') {
    return questions.filter(q => (q.category === 'wawancara' || q.category === 'simulasi_hrdk' || q.category === 'wawancara_profesional') && /이름|나이|생일|고향|가족|결혼|취미|운동|색깔|asal|umur|nama|keluarga|hobi/i.test(`${q.question_ko || ''} ${q.question_id || ''}`));
  }
  if (selectedCatId === 'wwc_situasi') {
    return questions.filter(q => (q.category === 'wawancara' || q.category === 'simulasi_hrdk' || q.category === 'wawancara_profesional') && /불량품|실수|사고|동료|상사|반대|어려우면|야근|잔업|월급|rusak|cacat|kesalahan|lembur|gaji|atasan|rekan/i.test(`${q.question_ko || ''} ${q.question_id || ''}`));
  }
  if (selectedCatId === 'wwc_lapangan') {
    return questions.filter(q => (q.category === 'wawancara' || q.category === 'wawancara_profesional') && String(q.id || '').startsWith('wwc_kisi'));
  }

  // Fallback direct match
  return questions.filter(q => q.category === selectedCatId);
}
