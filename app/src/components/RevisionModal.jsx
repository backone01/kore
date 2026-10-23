import React, { useState } from 'react';
import { ExternalLink, X, Wrench, UserCheck, Activity, Award, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/cn.js';

export function RevisionModal({ open, onClose }) {
  const [activeTab, setActiveTab] = useState('ringkasan');

  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const interviewStages = [
    {
      stage: 'Tahap 1',
      title: 'Perkenalan Diri Mandiri (자기소개)',
      stance: 'Berdiri',
      desc: 'Monolog perkenalan diri 25-40 detik di depan penguji (Nama, Umur, Asal, Pengalaman, Tekad Kerja).',
      points: '2 Poin',
      duration: '25-40 dtk'
    },
    {
      stage: 'Tahap 2',
      title: 'Instruksi Gerak Fisik (신체동작)',
      stance: 'Berdiri',
      desc: '5 perintah refleks gerakan tubuh (@3 poin): arah langkah, tangan/jari, kaki, postur tubuh, kepala/mata/hidung/telinga.',
      points: '15 Poin',
      duration: '5 Gerakan'
    },
    {
      stage: 'Tahap 3',
      title: 'Perkakas & Rambu K3 Meja (도구 & 표지판)',
      stance: 'Duduk',
      desc: 'Menyebutkan nama 5 kartu visual meja (4 pilar rambu K3 + 1 perkakas manufaktur) serta praktik fungsi dan aksi perkakas.',
      points: '7 Poin',
      duration: '5 Kartu + 2 Aksi'
    },
    {
      stage: 'Tahap 4',
      title: 'K3 Industri Mendalam (산업안전)',
      stance: 'Duduk',
      desc: '2 pertanyaan studi kasus keselamatan kerja pabrik (@5 poin) dari 30 topik resmi HRDK (SOP, APD, APAR, MSDS, evakuasi).',
      points: '10 Poin',
      duration: '2 Kasus'
    },
    {
      stage: 'Tahap 5',
      title: 'Percakapan & Sikap Kerja NCS (대화 & 직업기초능력)',
      stance: 'Duduk',
      desc: '14 pertanyaan seputar situasi kritis pabrik (lembur, barang cacat, atasan, rekan kerja) serta hitungan stok barang dan hari/jam.',
      points: '16 Poin',
      duration: '14 Soal'
    },
  ];

  const practicalTasks = [
    {
      pos: 'Pos 1',
      title: 'Memasukkan Pin Logam (핀 꽂기 - Pin Board)',
      time: 'Waktu: ± 60 detik',
      desc: 'Peserta mencocokkan pin pasak logam berbagai warna, bentuk, dan ukuran ke lubang papan kerja (380 x 380 mm) sesuai lembar pola yang ditentukan penguji.',
      evaluation: 'Kecepatan motorik kedua tangan, ketelitian pencocokan warna/posisi, dan kerapian hasil.'
    },
    {
      pos: 'Pos 2',
      title: 'Pengukuran & Pemotongan (계측 및 절단)',
      time: 'Waktu: ± 60-90 detik',
      desc: 'Mengukur panjang benda kerja (kawat, pelat, kayu) menggunakan mistar baja atau jangka sorong (vernier caliper), menimbang massa bahan dengan timbangan, lalu memotong tepat sesuai ukuran batas toleransi.',
      evaluation: 'Presisi pengukuran milimeter, cara memegang dan membaca alat ukur dengan benar, serta kepatuhan batas toleransi.'
    },
    {
      pos: 'Pos 3',
      title: 'Perakitan & Kelayakan Mesin (그라인더 및 조립)',
      time: 'Waktu: ± 60-90 detik',
      desc: 'SOP keselamatan sebelum memegang alat kerja: wajib memeriksa pelindung cover (방호덮개), memakai APD lengkap (helm, kacamata pelindung, sarung tangan), dan merakit pelat dengan mur-baut.',
      evaluation: 'SOP Keselamatan K3 paling diutamakan! Dilarang menyalakan atau memegang alat sebelum mengenakan kacamata pelindung (보안경).'
    }
  ];

  const physicalFitness = [
    {
      name: 'Kekuatan Cengkeraman Tangan (악력 - Grip Strength)',
      desc: 'Diukur menggunakan alat dinamometer digital/analog untuk tangan kanan dan kiri secara bergantian.',
      standar: 'Standar minimum pria: ≥ 45 kg, wanita: ≥ 25 kg.'
    },
    {
      name: 'Kekuatan Otot Punggung (배근력 - Back Strength)',
      desc: 'Mengukur kekuatan tarikan otot punggung dan kaki dengan posisi berdiri tegak di atas plat pengukur beban.',
      standar: 'Standar minimum pria: ≥ 110 kg, wanita: ≥ 65 kg.'
    },
    {
      name: 'Kelenturan & Ketahanan Tubuh (체전굴 / Burpee)',
      desc: 'Membungkukkan badan ke depan untuk mengukur kelenturan sendi dan otot pinggang, serta tes refleks fisik.',
      standar: 'Memastikan kondisi fisik sehat, tidak ada cedera tulang belakang atau sendi.'
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-foreground/40 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border border-border rounded-t-xl sm:rounded-xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0 bg-card">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Award className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-base text-foreground">Ketentuan & Rangkaian Ujian Skill Test</h2>
            </div>
            <p className="text-xs text-muted-foreground">Standar Resmi Penilaian HRD Korea (Total: 100 Poin)</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation inside modal */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-secondary/30 text-xs overflow-x-auto shrink-0">
          {[
            { id: 'ringkasan', label: 'Ringkasan 100 Poin', icon: Award },
            { id: 'praktik', label: '3 Pos Praktik Meja (20 Poin)', icon: Wrench },
            { id: 'wawancara', label: 'Wawancara (50 Poin)', icon: UserCheck },
            { id: 'fisik', label: 'Tes Fisik (30 Poin)', icon: Activity },
          ].map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer',
                  active
                    ? 'bg-foreground text-background shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 text-xs space-y-4">
          {/* TAB 1: RINGKASAN */}
          {activeTab === 'ringkasan' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">BOBOT TERBESAR</span>
                  <h3 className="font-bold text-sm text-foreground">Wawancara & Lisan</h3>
                  <p className="text-xl font-black text-primary font-mono">50 Poin</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                    Jagisoge, refleks gerak fisik, rambu K3, perkakas meja, kasus K3, dan situasi kerja NCS.
                  </p>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">TES PRAKTIK</span>
                  <h3 className="font-bold text-sm text-foreground">Keterampilan Meja</h3>
                  <p className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">20 Poin</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                    3 Pos Praktik: Papan Pasak (Pin Board), Pengukuran Kawat/Bahan, dan Perakitan Mur Baut/Gerinda.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">KONDISI TUBUH</span>
                  <h3 className="font-bold text-sm text-foreground">Uji Fisik & Badan</h3>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">30 Poin</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                    Kekuatan cengkeraman tangan (악력), kekuatan otot punggung (배근력), dan kelenturan tubuh.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Ketentuan Ambang Kelulusan (Passing Grade)</span>
                </h4>
                <ul className="text-muted-foreground space-y-1.5 leading-relaxed pl-1">
                  <li>• <strong>Sektor Manufaktur:</strong> Nilai minimum kumulatif kelulusan adalah <strong>60 Poin</strong>.</li>
                  <li>• <strong>Sektor Lain (Pertanian / Perikanan / Konstruksi):</strong> Nilai minimum kelulusan <strong>45 Poin</strong>.</li>
                  <li>• <strong>Ujian Wawancara (50 Poin):</strong> Wajib mengumpulkan minimal <strong>30 Poin (60%)</strong> agar tidak gugur otomatis.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: TIGA POS PRAKTIK MEJA */}
          {activeTab === 'praktik' && (
            <div className="space-y-3.5">
              <div className="border-b border-border pb-2">
                <h3 className="font-bold text-sm text-foreground">3 Pos Praktik Meja Penguji (기능시험 3대 과제 - 20 Poin)</h3>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Diuji langsung di meja kerja fisik. Penguji menilai kecepatan motorik, presisi, dan kepatuhan SOP K3.
                </p>
              </div>

              <div className="space-y-3">
                {practicalTasks.map((task, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {task.pos} · {task.time}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-foreground">{task.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{task.desc}</p>
                    <div className="pt-2 border-t border-border/60">
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-snug">
                        <strong>Fokus Penilaian:</strong> {task.evaluation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: WAWANCARA LISAN */}
          {activeTab === 'wawancara' && (
            <div className="space-y-3.5">
              <div className="border-b border-border pb-2">
                <h3 className="font-bold text-sm text-foreground">Rangkaian 5 Tahap Ujian Wawancara (50 Poin)</h3>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Diuji di hadapan 2-3 penguji asli dari HRD Korea (dimulai dari posisi berdiri lalu duduk di kursi).
                </p>
              </div>

              <div className="divide-y divide-border border rounded-xl overflow-hidden bg-card">
                {interviewStages.map((st, idx) => (
                  <div key={idx} className="p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">{st.stage}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                          {st.stance}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-foreground text-xs">{st.points}</span>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-foreground">{st.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{st.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TES FISIK */}
          {activeTab === 'fisik' && (
            <div className="space-y-3.5">
              <div className="border-b border-border pb-2">
                <h3 className="font-bold text-sm text-foreground">Tes Kebugaran & Kondisi Fisik Jasmani (30 Poin)</h3>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Diuji untuk memastikan calon tenaga kerja memiliki kekuatan fisik prima yang sesuai dengan beban kerja manufaktur Korea.
                </p>
              </div>

              <div className="space-y-3">
                {physicalFitness.map((f, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <h4 className="font-bold text-sm text-foreground">{idx + 1}. {f.name}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                    <div className="pt-2 border-t border-border/60">
                      <p className="text-[11px] text-primary leading-snug">
                        <strong>Standar Evaluasi:</strong> {f.standar}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-border bg-secondary/30 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <a
            href="https://epstopik.hrdkorea.or.kr/epstopik/skill/SkillTest.do?lang=en"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
          >
            Portal Resmi HRD Korea <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-colors min-h-[36px] cursor-pointer"
          >
            Tutup Informasi
          </button>
        </div>
      </div>
    </div>
  );
}
