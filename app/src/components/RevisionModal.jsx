import React from 'react';
import { ExternalLink, X } from 'lucide-react';

export function RevisionModal({ open, onClose }) {
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const components = [
    {
      title: 'Perkenalan Diri (Jagisoge)',
      desc: 'Monolog 25-40 detik saat berdiri',
      points: '2 Poin',
    },
    {
      title: 'Instruksi Gerak Fisik',
      desc: '5 perintah refleks fisik @3 poin',
      points: '15 Poin',
    },
    {
      title: 'Perkakas & Rambu Meja',
      desc: '5 kartu visual (4 rambu + 1 alat) + 2 praktik alat (fungsi & aksi)',
      points: '7 Poin',
    },
    {
      title: 'K3 Industri Mendalam',
      desc: '2 soal studi kasus keselamatan pabrik @5 poin',
      points: '10 Poin',
      highlight: true,
    },
    {
      title: 'Percakapan & Sikap Kerja (NCS)',
      desc: '14 soal (percakapan, sikap profesional, konflik/lembur, hitungan)',
      points: '16 Poin',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-foreground/40 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border border-border rounded-t-xl sm:rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="font-bold text-base text-foreground">Regulasi Resmi Revisi HRD Korea</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Standar penilaian EPS-TOPIK & Skills Test terbaru</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body with single-level divide-y sections */}
        <div className="overflow-y-auto divide-y divide-border text-xs">
          {/* Section 1: Ringkasan Perubahan */}
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Perubahan EPS-TOPIK</h3>
              <ul className="text-xs text-muted-foreground space-y-1 leading-relaxed">
                <li>• Manufaktur: nilai minimum lulus 55 ke <strong className="text-foreground">60 poin</strong></li>
                <li>• Sektor lain: 40 ke <strong className="text-foreground">45 poin</strong></li>
              </ul>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Perubahan Skills Test</h3>
              <ul className="text-xs text-muted-foreground space-y-1 leading-relaxed">
                <li>• Wawancara naik: 30 ke <strong className="text-foreground">50 poin</strong></li>
                <li>• Keterampilan Dasar: 40 ke <strong className="text-foreground">20 poin</strong></li>
                <li>• Tes Fisik: 30 poin (Genggaman, Punggung, Burpee)</li>
              </ul>
            </div>
          </div>

          {/* Section 2: Rincian 50 Poin Wawancara */}
          <div className="px-5 py-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Rincian Wawancara (50 Poin)</h3>
              <span className="text-[11px] font-medium text-emerald-700">Lulus minimal 30 Poin (60%)</span>
            </div>

            <div className="divide-y divide-border border-t border-border">
              {components.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={item.highlight ? 'font-bold text-red-700' : 'font-semibold text-foreground'}>
                      {idx + 1}. {item.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                  <span className="font-mono font-bold text-foreground shrink-0">{item.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-border bg-secondary/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
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
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-colors min-h-[38px]"
          >
            Tutup Informasi
          </button>
        </div>
      </div>
    </div>
  );
}
