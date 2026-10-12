// Sistem Pengelompokan Modul Materi & Latihan Terpadu
// Menyelaraskan 100% antara Materi (StudyGuide), Latihan (Practice), dan Ujian Resmi (Exam).

export const MAIN_MODULES = [
  {
    id: 'all',
    label: 'Semua Bank Soal',
    shortLabel: 'Semua',
    icon: 'Layers',
    desc: 'Seluruh bank soal kisi-kisi resmi (889 soal)',
    categories: []
  },
  {
    id: 'mod_wawancara',
    label: 'Wawancara & Jagisoge',
    shortLabel: 'Wawancara',
    icon: 'UserCheck',
    desc: 'Data diri, perkenalan diri (Jagisoge), situasi kerja, dan respon HRDK',
    categories: ['wawancara', 'simulasi_hrdk', 'wawancara_dasar', 'wawancara_profesional'],
    studyTab: 'interview'
  },
  {
    id: 'mod_fisik',
    label: 'Gerak Fisik & Instruksi',
    shortLabel: 'Gerak Fisik',
    icon: 'Activity',
    desc: 'Instruksi gerak fisik (따라하세요), perintah arah, dan aksi kerja',
    categories: ['gerak_fisik', 'perintah_gerak', 'perintah_kerja'],
    studyTab: 'commands'
  },
  {
    id: 'mod_k3',
    label: 'K3 & Keselamatan Pabrik',
    shortLabel: 'K3 Pabrik',
    icon: 'AlertTriangle',
    desc: '30 Tanya Jawab Keselamatan Kerja resmi, APD, dan SOP darurat',
    categories: ['k3_safety'],
    studyTab: 'k3'
  },
  {
    id: 'mod_piktogram',
    label: 'Piktogram & Rambu K3',
    shortLabel: 'Rambu K3',
    icon: 'ShieldAlert',
    desc: 'Rambu larangan, peringatan, tindakan wajib, dan jalur evakuasi',
    categories: ['piktogram', 'rambu_lalulintas'],
    studyTab: 'piktogram'
  },
  {
    id: 'mod_alat',
    label: 'Peralatan Kerja & APD',
    shortLabel: 'Alat Kerja',
    icon: 'Wrench',
    desc: 'Nama alat manufaktur, fungsi alat, aksi penggunaan, dan penyimpanan',
    categories: ['alat_manufaktur', 'alat_klasik', 'fungsi_alat', 'perintah_alat', 'penjelasan_alat', 'penggunaan_alat', 'penyimpanan_alat'],
    studyTab: 'alat'
  },
  {
    id: 'mod_angka',
    label: 'Hitungan, Jam & Satuan',
    shortLabel: 'Hitungan Pabrik',
    icon: 'Hash',
    desc: 'Hitungan lisan pabrik, waktu/jam, kalender, dan konversi satuan',
    categories: ['matematika', 'konversi_satuan', 'hitungan_lisan'],
    studyTab: 'numbers'
  }
];

export const CATEGORY_GROUPS = [
  { id: 'g_wawancara', label: 'Wawancara & Perkenalan Diri (Interview)' },
  { id: 'g_fisik', label: 'Gerak Fisik & Instruksi Kerja (Physical)' },
  { id: 'g_skills', label: 'Peralatan, Rambu & K3 (Skills)' },
  { id: 'g_angka', label: 'Angka, Hitungan & Konversi Satuan' },
];

/**
 * Filter questions based on selected module or individual category
 */
export function filterQuestionsByCategory(questions, selectedCatId) {
  if (!selectedCatId || selectedCatId === 'all') return questions;
  
  // Check if selectedCatId is a main module
  const mod = MAIN_MODULES.find(m => m.id === selectedCatId);
  if (mod && mod.categories.length > 0) {
    return questions.filter(q => mod.categories.includes(q.category));
  }
  
  // Fallback to single category match
  return questions.filter(q => q.category === selectedCatId);
}
