import { X, ArrowRight, ExternalLink } from 'lucide-react';

export function RevisionModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-[#E9E9E7] rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-[#EFEFED]">
          <div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold uppercase tracking-wider">Pengumuman Resmi HRD Korea</span>
            <h3 className="font-extrabold text-[#191919] text-xl mt-1.5">Notice of Revisions (Revisi Ujian EPS-TOPIK)</h3>
            <p className="text-xs text-[#787774] mt-0.5">Berdasarkan pembaruan resmi Human Resources Development Service of Korea (HRDK)</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-[#787774] hover:bg-[#FBFBFA]"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1</span><h4 className="font-bold text-sm text-[#191919]">Kenaikan Nilai Minimum Kelulusan (Passing Score)</h4></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#FBFBFA] border border-[#E9E9E7] space-y-1">
              <span className="font-semibold text-[#787774]">Sektor Manufaktur:</span>
              <div className="flex items-center gap-2"><span className="text-[#787774] line-through font-mono">55 Poin</span><ArrowRight className="w-3.5 h-3.5 text-blue-600" /><span className="text-red-600 font-extrabold font-mono text-base">60 Poin</span></div>
              <span className="text-[11px] text-red-600 font-semibold block">Wajib minimal 60 poin</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FBFBFA] border border-[#E9E9E7] space-y-1">
              <span className="font-semibold text-[#787774]">Sektor Lainnya:</span>
              <div className="flex items-center gap-2"><span className="text-[#787774] line-through font-mono">40 Poin</span><ArrowRight className="w-3.5 h-3.5 text-blue-600" /><span className="text-red-600 font-extrabold font-mono text-base">45 Poin</span></div>
              <span className="text-[11px] text-[#787774] block">Naik 5 poin</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">2</span><h4 className="font-bold text-sm text-[#191919]">Penyesuaian Bobot Ujian Keterampilan (100 Poin)</h4></div>
          <div className="overflow-x-auto border border-[#E9E9E7] rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FBFBFA] text-[#787774] border-b border-[#E9E9E7]"><tr><th className="p-3 font-semibold">Komponen</th><th className="p-3">Sebelumnya</th><th className="p-3 text-blue-700">Revisi</th><th className="p-3">Ket</th></tr></thead>
              <tbody className="divide-y divide-[#EFEFED]">
                <tr><td className="p-3 font-bold">Kebugaran Fisik</td><td className="p-3 font-mono">30</td><td className="p-3 font-mono font-bold">30</td><td className="p-3 text-[11px]">Grip, back, Burpee</td></tr>
                <tr><td className="p-3 font-bold">Keterampilan Dasar</td><td className="p-3 font-mono line-through">40</td><td className="p-3 font-mono font-bold text-blue-700">20</td><td className="p-3 text-[11px]">1 tugas industri</td></tr>
                <tr className="bg-blue-50/50"><td className="p-3 font-bold text-blue-900">Wawancara</td><td className="p-3 font-mono line-through">30</td><td className="p-3 font-mono font-black text-red-600">50</td><td className="p-3 text-[11px] font-semibold text-blue-900">Naik 30→50!</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">3</span><h4 className="font-bold text-sm text-[#191919]">Rincian Wawancara 50 Poin</h4></div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-[#FBFBFA] border flex justify-between"><div><span className="font-bold">Perkenalan Diri (Jagisoge)</span><p className="text-[11px] text-[#787774]">1 Monolog (40 detik)</p></div><span className="font-mono font-bold">2 Poin</span></div>
              <div className="p-3 rounded-2xl bg-[#FBFBFA] border flex justify-between"><div><span className="font-bold">Instruksi Kerja Gerak Fisik</span><p className="text-[11px]">5 perintah @3</p></div><span className="font-mono font-bold text-indigo-700">15 Poin</span></div>
              <div className="p-3 rounded-2xl bg-[#FBFBFA] border flex justify-between"><div><span className="font-bold">Perkakas & Rambu Meja</span><p className="text-[11px]">5 visual (4 rambu + 1 alat) + 2 praktik alat (fungsi & aksi)</p></div><span className="font-mono font-bold text-emerald-700">7 Poin</span></div>
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 flex justify-between"><div><span className="font-bold text-red-950">K3 Mendalam</span><p className="text-[11px] text-red-800">2 soal studi kasus pabrik @5</p></div><span className="font-mono font-bold text-red-700">10 Poin</span></div>
              <div className="p-3 rounded-2xl bg-[#FBFBFA] border flex justify-between"><div><span className="font-bold">Percakapan Dasar & Sikap Kerja (NCS)</span><p className="text-[11px]">14 soal (10 percakapan @1 + 2 konflik/lembur @1.5 + 2 hitungan @1.5)</p></div><span className="font-mono font-bold text-purple-700">16 Poin</span></div>
            </div>
        </div>

        <div className="pt-3 border-t border-[#EFEFED] flex flex-col sm:flex-row items-center justify-between gap-3">
          <a href="https://epstopik.hrdkorea.or.kr/epstopik/skill/SkillTest.do?lang=en" target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold">Portal HRD Korea <ExternalLink className="w-3.5 h-3.5" /></a>
          <button onClick={onClose} className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#191919] text-white text-xs font-bold hover:bg-[#333]">Tutup Informasi</button>
        </div>
      </div>
    </div>
  );
}
