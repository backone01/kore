# Project Tasks & Auto-Memory — EPS-TOPIK Skill Test Pro

## Status Implementasi Dataset & Simulasi Wawancara 2026

### 1. Audio & Question Inventory (Total: 701 Soal Terverifikasi 100%)
- **Data Diri & Wawancara (`wawancara`)**: 43 Soal (dari `01_wawancara_data_diri`, MP3 lengkap).
- **Simulasi Resmi HRDK (`simulasi_hrdk`)**: 52 Soal (dari `hrdk_50`, transkripsi & subtitle lengkap).
- **Perintah Gerak Fisik (`gerak_fisik`)**: 16 Perintah (dari `02_perintah_gerak_fisik`, MP3 lengkap).
- **K3 & Keselamatan Pabrik (`k3_safety`)**: 30 Soal Mendalam (dari `03_k3_keselamatan_pabrik`, 30 Tanya + 30 Jawab MP3).
- **Berhitung Cepat Pabrik (`matematika`)**: 400 Soal Lengkap:
  - 100 Perkalian (1..10 x 1..10)
  - 100 Pembagian (1..10 / 1..10)
  - 100 Penambahan (1..10 + 1..10)
  - 100 Pengurangan (1..10 - 1..10)
- **Perkakas Manufaktur & APD (`alat_manufaktur`)**: 65 Alat (Audio pertanyaan penguji: `examiner_tool_q.mp3`).
- **Rambu K3 Piktogram (`piktogram`)**: 95 Rambu (Audio pertanyaan penguji: `examiner_sign_q.mp3`).

### 2. Validasi File Audio
- Total file audio terhubung di `questions.json`: 701 soal.
- Verifikasi keberadaan file fisik di disk (`public/audio`): **0 Missing (100% Valid)**.
- TTS Browser dihilangkan sepenuhnya (Zero TTS). Semua suara berasal dari MP3 penguji asli / rekaman studio.

### 3. Simulasi Wawancara Standar Revisi HRD Korea (21 Soal, 50 Poin)
- **Tahap 1: Berdiri (17 Poin)**:
  - 1 Soal Perkenalan Diri Mandiri (2 Poin, timer 25s, audio penguji "자기소개를 해 보세요.").
  - 5 Soal Gerak Fisik (@3 Poin = 15 Poin).
- **Transisi**: Arahan duduk penguji "네, 잘했습니다. 자리에 앉으세요" dengan audio tombol.
- **Tahap 2: Duduk di Meja (33 Poin)**:
  - 4 Soal Percakapan Dasar (Waktu, Kalender, Keluarga, Belajar Bahasa) @2 Poin = 8 Poin.
  - 5 Kartu Visual Meja (Perkakas & Rambu K3) @1 Poin = 5 Poin.
  - 1 Soal Berhitung Cepat Pabrik (3 Poin, diacak bebas dari 400 soal).
  - 2 Soal K3 Industri Mendalam @5 Poin = 10 Poin.
  - 2 Soal Situasi Kerja Pabrik (Lembur @2 Poin + Penanganan Masalah/Cacat @3 Poin) = 5 Poin.
  - 1 Soal Motivasi Kerja di Korea (2 Poin).
- **Randomizer**: Menggunakan Fisher-Yates shuffle yang mengambil sample dari pool gabungan `wawancara` + `simulasi_hrdk` (95 soal) dan `matematika` (400 soal).

### 4. Modul Hafalan & Kisi-Kisi Manufaktur (Buku Saku Interaktif)
- Diekstrak dari 4 dokumen kisi-kisi:
  1. `REVISI - KISI KISI SKILL TES MANUFAKTUR - 2025.pdf`
  2. `외국인력 선발포인트제 기능시험 가이드북_내지_외부용_인도네시아 (2).pdf`
  3. `20260306023013893.pdf` (HRD Korea 2026)
  4. `JAGISOGE & SKIL ALAT KUMPLIT.pdf`
- 8 Sub-Materi Interaktif:
  - **Nomor & Angka**: Tabel lengkap Sino-Korea vs Asli Korea + Aturan Satuan (명, 개, 병, 장, 켤레, 대, 살, 시, 분, 원).
  - **Jam & Waktu**: Rumus membaca waktu (Jam Asli + Menit Sino), kosakata waktu (오전/오후/새벽/정오/자정/반), Q&A jam.
  - **Hari & Kalender**: 7 hari, 12 bulan (pengecualian 유월 & 시월), relasi waktu (그저께/어제/오늘/내일/모레).
  - **11 Warna Pabrik**: Warna primer + formula jawaban alasan favorit saat wawancara.
  - **Keluarga**: Bagan silsilah + rumus menjawab jumlah anggota keluarga (Asli Korea + 명).
  - **Jagisoge (자기소개)**: Template baku 5 kalimat (25 detik) + checklist kriteria penilaian penguji.
  - **Situasi Pabrik & Respon Kerja**: SOP lembur (잔업/야근), rekan kerja sibuk, barang cacat (불량품), kecelakaan, dll.
  - **Ujian Praktik Manufaktur**: 3 tugas fisik (Pin, Ukur Potong, Gerinda) + 3 tingkatan alat HRDK (상, 중, 하).
- **Fitur Unggulan**:
  - Mode Hafalan (Toggle sembunyikan/tampilkan terjemahan Indonesia untuk menguji daya ingat).
  - 134 file audio MP3 pelafalan jernih untuk setiap kata/frasa materi di `/audio/materi/`.

