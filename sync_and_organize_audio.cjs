const fs = require('fs');
const path = require('path');

const srcDir1 = 'E:\\code\\proyek\\kore\\file listening  interview @by MSK INDONESIA-20260920T145515Z-1-001';
const srcDir2 = 'E:\\code\\proyek\\kore\\audio_hasil_potong';
const destBase = 'E:\\code\\proyek\\kore\\app\\public\\audio';

function copyFolder(src, destSubfolder) {
  const targetDir = path.join(destBase, destSubfolder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const files = fs.readdirSync(src).filter(f => f.endsWith('.mp3'));
  let count = 0;
  for (const f of files) {
    // Sanitize space to underscore for clean URL encoding in web browser
    const cleanName = f.replace(/\s+/g, '_');
    const srcPath = path.join(src, f);
    const destPath = path.join(targetDir, cleanName);
    fs.copyFileSync(srcPath, destPath);
    count++;
  }
  console.log(`Copied ${count} files to ${destSubfolder}`);
  return count;
}

console.log('=== SYNCING ALL AUDIO FILES TO WEB APP ===');

let total = 0;

// 1. Wawancara (43 files)
total += copyFolder(path.join(srcDir2, '02_Wawancara_Data_Diri_dan_Situasi'), '01_wawancara_data_diri');

// 2. Gerak Fisik (16 files)
total += copyFolder(path.join(srcDir2, '03_Perintah_Gerak_Fisik_따라하세요'), '02_perintah_gerak_fisik');

// 3. K3 Keselamatan (20 files)
total += copyFolder(path.join(srcDir2, '01_K3_dan_Keselamatan_Pabrik'), '03_k3_keselamatan_pabrik');

// 4. Perkalian (100 files)
total += copyFolder(path.join(srcDir1, 'Perkalian @byMSK INDONESIA'), '04_matematika_perkalian');

// 5. Pembagian (99 files)
total += copyFolder(path.join(srcDir1, 'Pembagian @byMSK INDONESIA'), '05_matematika_pembagian');

// 6. Penambahan (99 files)
total += copyFolder(path.join(srcDir1, 'Penambahan @byMSK INDONESIA'), '06_matematika_penambahan');

// 7. Pengurangan (99 files)
total += copyFolder(path.join(srcDir1, 'Pengurangan @byMSK INDONESIA'), '07_matematika_pengurangan');

// 8. Simulasi HRDK 50 Soal (52 files)
total += copyFolder(path.join(srcDir2, '04_Simulasi_Resmi_50_Soal_Wawancara_HRDK'), '08_simulasi_resmi_hrdk');

console.log(`\n=== TOTAL AUDIO FILES SYNCED: ${total} ===`);
