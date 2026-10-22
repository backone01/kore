import React from 'react';
import { ExternalLink, X } from 'lucide-react';
import { Card, CardContent } from './ui/card.jsx';
import { Badge } from './ui/badge.jsx';
import { Separator } from './ui/separator.jsx';

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

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-card border border-border rounded-t-lg sm:rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-4 pb-3 border-b border-border">
          <h2 className="font-bold text-base text-foreground">Regulasi Resmi Revisi HRD Korea</h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label="Tutup">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <Card className="p-4 space-y-2">
            <h3 className="font-bold text-sm text-foreground">Perubahan EPS-TOPIK</h3>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>• Nilai minimum lulus naik: Manufaktur 55 → <strong className="text-foreground">60 poin</strong></li>
              <li>• Sektor lain: 40 → <strong className="text-foreground">45 poin</strong></li>
            </ul>
          </Card>

          <Card className="p-4 space-y-2">
            <h3 className="font-bold text-sm text-foreground">Perubahan Skills Test</h3>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>• Bobot Wawancara naik: 30 → <strong className="text-foreground">50 poin</strong></li>
              <li>• Bobot Keterampilan Dasar turun: 40 → <strong className="text-foreground">20 poin</strong> (spesialisasi industri)</li>
              <li>• Fisik: Genggaman, Punggung, Tinggi/Berat + Burpee Test (spesialisasi)</li>
            </ul>
          </Card>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-foreground">Rincian Wawancara 50 Poin</h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-md bg-secondary border border-border flex justify-between gap-2">
                <div>
                  <span className="font-medium text-foreground">Perkenalan Diri (Jagisoge)</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Monolog 40 detik</p>
                </div>
                <span className="font-mono font-bold text-foreground shrink-0">2 Poin</span>
              </div>
              <div className="p-3 rounded-md bg-secondary border border-border flex justify-between gap-2">
                <div>
                  <span className="font-medium text-foreground">Instruksi Gerak Fisik</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">5 perintah @3</p>
                </div>
                <span className="font-mono font-bold text-foreground shrink-0">15 Poin</span>
              </div>
              <div className="p-3 rounded-md bg-secondary border border-border flex justify-between gap-2">
                <div>
                  <span className="font-medium text-foreground">Perkakas & Rambu Meja</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">5 visual (4 rambu + 1 alat) + 2 praktik alat (fungsi & aksi)</p>
                </div>
                <span className="font-mono font-bold text-foreground shrink-0">7 Poin</span>
              </div>
              <div className="p-3 rounded-md bg-red-50 border border-red-200 flex justify-between gap-2">
                <div>
                  <span className="font-medium text-red-950">K3 Mendalam</span>
                  <p className="text-[11px] text-red-800 mt-0.5">2 soal studi kasus pabrik @5</p>
                </div>
                <span className="font-mono font-bold text-red-700 shrink-0">10 Poin</span>
              </div>
              <div className="p-3 rounded-md bg-secondary border border-border flex justify-between gap-2">
                <div>
                  <span className="font-medium text-foreground">Percakapan & Sikap Kerja (NCS)</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">14 soal (9 percakapan + 1 sikap profesional @1, 2 konflik/lembur @1.5, 1 hitung cepat + 1 konversi/lisan @1.5)</p>
                </div>
                <span className="font-mono font-bold text-foreground shrink-0">16 Poin</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
            <a href="https://epstopik.hrdkorea.or.kr/epstopik/skill/SkillTest.do?lang=en" target="_blank" rel="noreferrer" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium">
              Portal HRD Korea <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button onClick={onClose} className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-foreground text-background text-xs font-medium hover:bg-foreground/90 transition-colors">
              Tutup Informasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
