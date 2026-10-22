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
    label: '3. K3 & Keselamatan Pabrik (산업안전 & 표지판)',
    shortLabel: '3. K3 & Rambu',
    icon: 'AlertTriangle',
    desc: '30 Tanya Jawab K3 Mendalam Resmi HRDK (SOP, APD, APAR, MSDS) & 98 Rambu Keselamatan',
    categories: ['k3_safety', 'piktogram'],
    studyTab: 'safety',
    points: 10,
    color: 'amber'
  },
  {
    id: 'tools',
    label: '4. Perkakas & Alat Kerja (공구 & 기능시험)',
    shortLabel: '4. Alat Kerja',
    icon: 'Wrench',
    desc: '90 Foto & Nama Alat Manufaktur, Fungsi Alat, serta Praktik Peragaan Aksi Alat',
    categories: ['alat_manufaktur', 'alat_klasik', 'fungsi_alat', 'praktik_alat', 'perintah_alat'],
    studyTab: 'tools',
    points: 7,
    color: 'violet'
  },
  {
    id: 'numbers',
    label: '5. Dasar Berhitung & Satuan (기초연산 & 단위)',
    shortLabel: '5. Hitungan Pabrik',
    icon: 'Hash',
    desc: 'Angka Sino/Asli, Jam/Waktu, Kalender, Satuan Hitung Manufaktur & Hitungan Lisan Pabrik',
    categories: ['matematika', 'konversi_satuan', 'hitungan_lisan'],
    studyTab: 'numbers',
    points: 4,
    color: 'rose'
  },
  {
    id: 'colors',
    label: '6. Tes Penglihatan Warna (색각검사 & 색상)',
    shortLabel: '6. Tes Warna',
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
  { id: 'safety', label: '3. K3 & Rambu Keselamatan (산업안전)' },
  { id: 'tools', label: '4. Perkakas & Praktik Alat (공구)' },
  { id: 'numbers', label: '5. Angka, Hitungan & Satuan (기초연산)' },
];

/**
 * Filter questions based on selected module or individual category
 */
export function filterQuestionsByCategory(questions, selectedCatId) {
  if (!selectedCatId || selectedCatId === 'all') return questions;
  
  // Check if selectedCatId matches a standard HRDK module
  const mod = HRDK_MODULES.find(m => m.id === selectedCatId);
  if (mod && mod.categories.length > 0) {
    return questions.filter(q => mod.categories.includes(q.category));
  }
  
  // Fallback to single category match
  return questions.filter(q => q.category === selectedCatId);
}
