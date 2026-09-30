# EPS-TOPIK Skill Test & Interview Virtual Examiner 🇰🇷
Aplikasi Latihan Mandiri Uji Keterampilan (*Point System Skill Test*) & Wawancara (*Myeonjeop*) EPS-TOPIK Korea Sektor Manufaktur (HRD Korea & BP2MI).

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi web sudah siap dan server lokal sudah aktif:

1. **Akses dari Laptop/PC:**
   Buka browser dan kunjungi:
   `http://localhost:5173/`

2. **Akses dari HP (Satu Jaringan Wi-Fi):**
   Buka browser di smartphone Anda dan kunjungi:
   `http://192.168.1.100:5173/`

---

## 🌟 Fitur Utama (Terinspirasi dari Format Video epstopikvn)

1. **Blind Mode (Sembunyikan Teks / Ẩn Text):**
   - Menghilangkan teks di layar untuk melatih respon pendengaran murni layaknya berada di ruang ujian HRD Korea.
2. **Kunci Jawaban Singkat & Lengkap (TL Rút gọn / TL Đầy đủ):**
   - Jawaban singkat (*point-to-point*) dan jawaban formal sopan (*-seumnida / -imnida*).
3. **Mode Tanya + Kunci Jawaban dengan Jeda Otomatis:**
   - Pertanyaan diputar -> timer hitung mundur (2s, 3s, 5s) untuk Anda menjawab -> kunci jawaban native otomatis diputar.
4. **Perekam Suara Latihan (Voice Practice Recording):**
   - Rekam suara Anda saat menjawab dan dengarkan kembali intonasi & pelafalan Anda.
5. **Kategori Lengkap:**
   - 🛡️ **K3 & Keselamatan Pabrik (Manufaktur):** Dilengkapi audio tanya & kunci audio native Korea.
   - 👤 **Wawancara & Situasi Kerja:** Pertanyaan data diri, alasan ke Korea, dan skenario situasi pabrik (produk cacat, kecelakaan kerja, lembur, konflik rekan).
   - 🤸 **Perintah Gerak Fisik (따라하세요):** Instruksi arah (putar kanan, kiri, balik badan, maju, mundur).
   - 🔧 **Pengenalan Alat Kerja (공구):** Pengenalan nama dan fungsi alat manufaktur.
   - 🔢 **Berhitung Lisan (산수):** Latihan hitungan cepat bahasa Korea.

---

## 🛠️ Alat Ekstraksi & Pemotong Audio (Tools)

Di dalam folder `tools/` tersedia skrip otomatis:
- `tools/slice_safety_audio.py`: Memotong segmen pertanyaan dan jawaban dari video K3 ke audio individual (`.mp3`).
- `tools/download_more_sources.py`: Mengunduh materi video/audio EPS-TOPIK tambahan via `yt-dlp` dan `ffmpeg`.
- `tools/organize_audio_and_data.py`: Mengatur file audio lokal ke direktori publik aplikasi web.
- `tools/build_master_json.py`: Memperbarui database soal di `app/src/data/questions.json`.
