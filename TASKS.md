# Project Tasks & Auto-Memory — EPS-TOPIK Skill Test Pro

## Status Implementasi Dataset & Simulasi Wawancara 2026

### 1. Audio & Question Inventory (Total: 966 Soal Terverifikasi 100%)
- **Data Diri & Wawancara (`wawancara`)**: 54 Soal (Data Diri, Pengalaman Kerja, Situasi Lapangan).
- **Pertanyaan Wawancara Lapangan Baru (`wwc_kisi`)**: 35 Soal Kisi-Kisi Manufaktur Resmi 2025/2026.
- **Simulasi Resmi HRDK (`simulasi_hrdk`)**: 41 Soal (Transkripsi & subtitle lengkap).
- **Wawancara Sikap Kerja NCS (`wawancara_profesional`)**: 8 Soal.
- **Perintah Gerak Fisik (`gerak_fisik`)**: 51 Perintah Gerak Refleks (Tangan, Kaki, Kepala, Postur, Arah).
- **K3 & Keselamatan Pabrik (`k3_safety`)**: 112 Soal Mendalam Resmi KOSHA (30 Topik).
- **Berhitung Cepat Pabrik (`matematika`)**: 400 Soal Lengkap:
  - 100 Perkalian (1..10 x 1..10)
  - 100 Pembagian (1..10 / 1..10)
  - 100 Penambahan (1..10 + 1..10)
  - 100 Pengurangan (1..10 - 1..10)
- **Konversi Satuan & Waktu (`konversi_satuan`)**: 26 Soal.
- **Hitungan Lisan Pabrik (`hitungan_lisan`)**: 10 Soal.
- **Perkakas Manufaktur & APD (`alat_manufaktur` & `alat_klasik`)**: 90 Alat (Audio pertanyaan penguji: `examiner_tool_q.mp3`).
- **Rambu K3 Piktogram (`piktogram`)**: 98 Rambu Resmi KOSHA (지시, 경고, 금지, 안내·소방).

### 2. Validasi File Audio
- Total file audio terhubung di `questions.json`: 701 soal.
- Verifikasi keberadaan file fisik di disk (`public/audio`): **0 Missing (100% Valid)**.
- TTS Browser dihilangkan sepenuhnya (Zero TTS). Semua suara berasal dari MP3 penguji asli / rekaman studio.

### 3. Simulasi Wawancara Standar Revisi Resmi HRD Korea 2026 (27 Soal, 50 Poin)
Sesuai Surat Edaran HRDK (Notice on Point-Based Selection System - 2nd Round) & Tabel 배점표 2026:
- **1. 자기소개 및 태도 (Perkenalan Diri & Sikap - 2 Poin, Berdiri)**:
  - 1 Soal Perkenalan Diri Mandiri (2 Poin, timer 25s, audio penguji "자기소개를 해 보세요.").
- **2. 기초대화 및 행동지시 (Percakapan Dasar & Gerak Fisik - 6 Poin)**:
  - 4 Soal Gerak Fisik (@1 Poin = 4 Poin, Berdiri).
  - 2 Soal Percakapan Dasar (@1 Poin = 2 Poin, Duduk).
- **Transisi**: Arahan duduk penguji "네, 잘했습니다. 자리에 앉으세요" (0 Poin, timer 5s).
- **3. 작업도구 및 지시 수행능력 (Alat Kerja & Perintah Kerja - 20 Poin, Duduk)**:
  - 5 Kartu Perkakas Manufaktur (@1 Poin = 5 Poin, menampilkan foto alat).
  - 5 Perintah Pelaksanaan Kerja Praktik (@3 Poin = 15 Poin, bobot tertinggi).
- **4. NCS 직업기초능력 (Keterampilan Dasar Pekerjaan NCS - 6 Poin, Duduk)**:
  - 2 Soal Studi Kasus Kritis Pabrik (@3 Poin = 6 Poin: cacat produk, lembur, konflik kerja).
- **5. 안전의식 (Kesadaran Keselamatan K3 - 16 Poin, Duduk)**:
  - 6 Kartu Rambu Piktogram KOSHA (@1 Poin = 6 Poin, 4 pilar rambu).
  - 2 Pertanyaan Mendalam K3 Industri KOSHA (@5 Poin = 10 Poin).
- **Total Keseluruhan**: **27 Butir Soal Dinilai = 50 Poin Sempurna**.
  - 2 Soal K3 Industri Mendalam @5 Poin = 10 Poin.
  - 2 Soal Situasi Kerja Pabrik (Lembur @2 Poin + Penanganan Masalah/Cacat @3 Poin) = 5 Poin.
  - 1 Soal Motivasi Kerja di Korea (2 Poin).
- **Randomizer**: Menggunakan Fisher-Yates shuffle yang mengambil sample dari pool gabungan `wawancara` + `simulasi_hrdk` (95 soal) dan `matematika` (400 soal).

### 5. Arsitektur Penyimpanan Otomatis (Auto-Save State Persistence)
- **Mode & Sub-Mode**: Menyimpan mode aktif (`kore_mode`), sub-mode latihan (`kore_practice_submode`), dan kategori/filter aktif (`kore_selected_category`, `kore_practice_type_filter`).
- **Progress Belajar**: Menyimpan nomor soal terakhir latihan (`kore_practice_index`) dengan auto-clamp batas soal.
- **Hafalan Flashcard**: Status kartu "Sudah Hafal" (`kore_flashcard_memorized`) dan "Perlu Diulang" (`kore_flashcard_review`) tersimpan permanen.
- **Preferensi Jawaban Global & Putar Jawaban (StudyGuide & QAStudy)**:
  - Gaya opsi jawaban tersimpan dan otomatis diterapkan ke seluruh soal berikutnya (`preferredOptionStyle`, `localStorage: kore_preferred_qa_style`).
  - Fitur "Putar Jawaban" aktif 100% pada seluruh tab Panduan Belajar (`Wawancara`, `30 Topik K3`, dan `Refleks Gerak Fisik`).
  - Audio Gerak Fisik terhubung ke rekaman MP3 `/audio/tts/answers/cmd_XX_a.mp3` dengan tombol Putar Jawaban baik di Player Deck maupun di setiap kartu gerak.
  - Opsi autoplay audio jawaban kini dilengkapi tombol saklar interaktif langsung di player deck: `🔇 Senyap saat autoplay (ketuk untuk aktifkan)` ↔ `🔊 Jawaban Diputar Otomatis`.
- **Player Latihan Wawancara Hands-Free & Manual (PracticeOral)**:
  - Deck pemutar otomatis interaktif terintegrasi pada tab Lisan Mode Latihan (`PracticeOral.jsx`).
  - Penguji memanggil soal, hitung mundur jeda menjawab lisan (`2s, 3s, 5s, 8s, 10s`), dan pemutaran model jawaban HRDK opsional.
  - Mode pergantian soal fleksibel: **`✋ Ganti Soal: Manual`** (tunggu klik user untuk lanjut ke soal berikutnya via tombol *Lanjut Soal Berikutnya ▶*) vs **`➡️ Ganti Soal: Otomatis`** (hands-free).
  - Dilengkapi fitur `Play Acak (Shuffle) ON/OFF`, pengaturan kecepatan audio (`0.8x/1.0x`), dan dukungan `Blind Mode` teks tersembunyi.
- **Data Generator Jagisoge**: Form data diri mandiri (`kore_jagi_form`) tersimpan otomatis di browser pengguna.
- **Hasil Simulasi Ujian**: Riwayat sesi ujian terakhir (`kore_last_exam_session`) tersimpan otomatis saat ujian selesai, lengkap dengan tombol resume `[Buka Hasil Terakhir]` di halaman awal ujian.
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

