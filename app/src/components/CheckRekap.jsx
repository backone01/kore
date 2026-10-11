import React, { useState, useMemo, useEffect } from 'react';
import {
  Play, Printer, Save, Trash2, RotateCcw,
  CheckCircle, AlertCircle, XCircle,
  ClipboardCheck, Activity, Wrench, ClipboardList,
  Grid3x3, ShieldAlert, Briefcase, UserCheck
} from 'lucide-react';
import { getRandomSample } from '../utils/shuffle.js';
import { getAssetUrl } from '../utils/assetHelper.js';

const HISTORY_KEY = 'eps_check_history_v1';
const RUBRIC = { pass: 1, review: 0.5, fail: 0 };

const GROUPS = [
  {
    id: 'intro', label: 'Perkenalan Diri & Sikap', ko: '자기소개·태도',
    points: 2, items: 1, icon: UserCheck,
    pools: [['wawancara_dasar', 1]]
  },
  {
    id: 'conv', label: 'Percakapan Dasar & Perintah Tindakan', ko: '기초대화·행동지시',
    points: 6, items: 4, icon: ClipboardCheck,
    pools: [['wawancara_dasar', 2], ['perintah_kerja', 2]]
  },
  {
    id: 'tools', label: 'Peralatan Kerja', ko: '작업도구',
    points: 5, items: 5, icon: Wrench,
    pools: [['alat_manufaktur', 5]]
  },
  {
    id: 'instr', label: 'Instruksi Kerja', ko: '작업지시',
    points: 15, items: 5, icon: ClipboardList,
    pools: [['gerak_fisik', 5]]
  },
  {
    id: 'ncs', label: 'NCS / Sikap Kerja', ko: '직업기초능력',
    points: 6, items: 2, icon: Briefcase,
    pools: [['wawancara_profesional', 2]]
  },
  {
    id: 'picto', label: 'Piktogram', ko: '픽토그램',
    points: 6, items: 6, icon: Grid3x3,
    pools: [['piktogram', 6]]
  },
  {
    id: 'safety', label: 'Keselamatan Kerja (K3)', ko: '산업안전보건',
    points: 10, items: 2, icon: ShieldAlert,
    pools: [['k3_safety', 2]]
  }
];

const TIPS = [
  'Pelajari kosa kata sesuai sektor yang Anda daftarkan.',
  'Latih mendengarkan instruksi lalu merespons dengan tepat.',
  'Latih setiap tindakan dengan prosedur keselamatan yang benar.',
  'Tetap percaya diri, penuh perhatian, dan profesional.'
];

export function CheckRekap({ questionsData, playAudioUrl, stopAllAudio, examWawancara = null }) {
  const [seed, setSeed] = useState(0);
  const [ratings, setRatings] = useState({});
  const [fisik, setFisik] = useState(0);
  const [keahlian, setKeahlian] = useState(0);
  const [fishery, setFishery] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    setRatings({});
  }, [seed]);

  const groupedItems = useMemo(() => {
    const used = new Set();
    const pick = (cat, n) => {
      const pool = questionsData.filter(q => q.category === cat && !used.has(q.id) && (q.question_ko || q.question_id));
      const sample = getRandomSample(pool, n);
      sample.forEach(q => used.add(q.id));
      if (sample.length < n) {
        const rest = questionsData.filter(q => !used.has(q.id) && (q.question_ko || q.question_id));
        getRandomSample(rest, n - sample.length).forEach(q => { used.add(q.id); sample.push(q); });
      }
      return sample;
    };

    return GROUPS.map(g => {
      const list = [];
      g.pools.forEach(([cat, n]) => list.push(...pick(cat, n)));
      return { ...g, perItem: g.points / g.items, list };
    });
  }, [questionsData, seed]);

  const flatItems = useMemo(
    () => groupedItems.flatMap(g => g.list.map((q, i) => ({ q, g, i, key: `${g.id}#${q.id ?? i}`, perItem: g.perItem }))),
    [groupedItems]
  );

  const ratedCount = flatItems.filter(it => ratings[it.key]).length;

  const groupScores = useMemo(() => {
    const map = {};
    groupedItems.forEach(g => {
      let earned = 0;
      g.list.forEach((q, i) => {
        const mult = RUBRIC[ratings[`${g.id}#${q.id ?? i}`]] ?? 0;
        earned += g.perItem * mult;
      });
      map[g.id] = earned;
    });
    return map;
  }, [groupedItems, ratings]);

  const wawancaraScore = Object.values(groupScores).reduce((a, b) => a + b, 0);
  const linked = examWawancara != null;
  const wawancaraFinal = linked ? (Number(examWawancara) || 0) : wawancaraScore;
  const fisikMax = fishery ? 40 : 30;
  const fisikVal = Math.min(Number(fisik) || 0, fisikMax);
  const keahlianVal = Math.min(Math.max(Number(keahlian) || 0, 0), 20);
  const grandTotal = wawancaraFinal + fisikVal + keahlianVal;
  const grandMax = fishery ? 110 : 100;
  const wawancaraPassed = wawancaraFinal >= 30;
  const allRated = linked ? true : (ratedCount === flatItems.length);

  const reshuffle = () => {
    stopAllAudio();
    setSeed(s => s + 1);
  };

  const saveHistory = () => {
    if (!allRated) return;
    const entry = {
      ts: Date.now(),
      wawancara: Number(wawancaraFinal.toFixed(1)),
      fisik: fisikVal,
      keahlian: keahlianVal,
      total: Number(grandTotal.toFixed(1)),
      max: grandMax
    };
    const next = [entry, ...history].slice(0, 20);
    setHistory(next);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
  };

  const clearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch {}
  };

  const setRating = (key, val) => {
    setRatings(prev => {
      const next = { ...prev };
      if (next[key] === val) delete next[key];
      else next[key] = val;
      return next;
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 animate-in fade-in duration-200">
      <style>{`
        @media print {
          header, .no-print { display: none !important; }
          .print-scroll { max-height: none !important; overflow: visible !important; }
          body { background: #fff !important; }
        }
      `}</style>

      <div className="bg-white border border-[#E9E9E7] rounded-3xl p-5 md:p-6 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-black text-[#191919] flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Cek & Rekap Skor Ujian Kemampuan
            </h1>
            <p className="text-xs text-[#787774] mt-1">
              Penilaian mandiri gaya EPS Skill Test Mock Assessment (epstopikhub.com/skill-test/check) —
              struktur penilaian resmi HRD Korea 2026.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold">
              Total 100 Poin (Umum)
            </span>
            <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 text-[11px] font-bold">
              110 Poin (어업특례 / Perikanan)
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E9E9E7] rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#787774]">1. Struktur Penilaian Resmi 2026</h2>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[#FBFBFA] border border-[#E9E9E7] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#787774] flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Fisik</span>
              <span className="text-xl font-black text-[#191919]">30<span className="text-xs font-bold text-[#787774]"> / 40*</span></span>
            </div>
            <p className="text-[11px] text-[#787774]">Kekuatan otot 20 + Daya jantung-paru 10 (umum); 20+20 (perikanan)</p>
            <p className="text-[11px] text-[#787774]">Alat: ukur kekuatan punggung, tinggi & berat badan; beep test (spesialisasi)</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#FBFBFA] border border-[#E9E9E7] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#787774] flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" /> Keahlian Dasar</span>
              <span className="text-xl font-black text-[#191919]">20</span>
            </div>
            <p className="text-[11px] text-[#787774]">Spesialisasi: 1 tugas per industri</p>
            <p className="text-[11px] text-[#787774]">Umum: sementara belum dilaksanakan (한시적 미시행)</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5"><ClipboardCheck className="w-3.5 h-3.5" /> Wawancara</span>
              <span className="text-xl font-black text-emerald-800">50</span>
            </div>
            <p className="text-[11px] text-emerald-800">25 butir · 7 kelompok resmi · dirinci di bawah</p>
            <p className="text-[11px] text-emerald-800">Ambang: ≥ 30 poin (60%)</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-full sm:w-64 shrink-0 bg-white border border-[#E9E9E7] rounded-2xl p-2">
            <img
              src={getAssetUrl('/images/hub/scoring_for_the_skills_test.webp')}
              alt="Struktur penilaian ujian kemampuan EPS 2026: bagian fisik, keahlian dasar, dan wawancara"
              className="w-full rounded-xl"
              loading="lazy"
            />
            <p className="text-[10px] text-[#787774] text-center mt-1.5">배점표 resmi (sumber: epstopikhub.com)</p>
          </div>

          <div className="flex-1 w-full overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-left text-[#787774] border-b border-[#E9E9E7]">
                  <th className="py-2 pr-2 font-bold">Kelompok Wawancara</th>
                  <th className="py-2 px-2 font-bold text-right">Poin</th>
                  <th className="py-2 px-2 font-bold text-right">Butir</th>
                  <th className="py-2 pl-2 font-bold text-right">Per Butir</th>
                </tr>
              </thead>
              <tbody>
                {groupedItems.map(g => (
                  <tr key={g.id} className="border-b border-[#F2F2F0]">
                    <td className="py-2 pr-2 text-[#191919] font-semibold">
                      {g.label} <span className="font-kr text-[#787774] font-normal">({g.ko})</span>
                    </td>
                    <td className="py-2 px-2 text-right font-mono font-bold">{g.points}</td>
                    <td className="py-2 px-2 text-right font-mono">{g.items}</td>
                    <td className="py-2 pl-2 text-right font-mono text-[#787774]">{g.perItem}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-[#191919]">
                  <td className="py-2 pr-2 font-black">Total Wawancara</td>
                  <td className="py-2 px-2 text-right font-mono font-black">50</td>
                  <td className="py-2 px-2 text-right font-mono font-black">25</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E9E9E7] rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-[#787774]">
              {linked ? '2. Skor Wawancara (dari Hasil Ujian)' : '2. Penilaian Mandiri 25 Butir'}
            </h2>
            {!linked && (
            <p className="text-[11px] text-[#787774] mt-1">
              Rubrik: <span className="font-bold text-emerald-700">Lulus = 100%</span> ·{' '}
              <span className="font-bold text-amber-700">Tinjau = 50%</span> ·{' '}
              <span className="font-bold text-red-700">Tidak Lulus = 0%</span> — nilai diri terhadap kunci resmi.
            </p>
            )}
          </div>
          {!linked && (
          <button
            onClick={reshuffle}
            className="no-print px-3.5 py-2 rounded-xl bg-white border border-[#E5E5E3] hover:border-slate-400 text-xs font-bold text-[#191919] flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Paket Acak Baru
          </button>
          )}
        </div>

        {linked ? (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-emerald-800">Nilai wawancara diambil langsung dari hasil Simulasi Ujian Anda.</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">Tidak perlu menilai manual — kembali ke layar hasil untuk mengubah penilaian per butir.</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-2xl font-black font-mono text-emerald-800">{Number(wawancaraFinal.toFixed(1))}</span>
            <span className="text-xs font-bold text-emerald-700"> / 50</span>
          </div>
        </div>
        ) : (
        <>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          {groupedItems.map(g => (
            <div key={g.id} className="p-2.5 rounded-xl bg-[#FBFBFA] border border-[#E9E9E7]">
              <span className="text-[#787774] block truncate">{g.label}</span>
              <span className="font-bold text-[#191919] font-mono">
                {Number(groupScores[g.id].toFixed(1))} / {g.points}
              </span>
            </div>
          ))}
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 col-span-2 sm:col-span-4 flex items-center justify-between">
            <span className="text-emerald-800 font-bold">Total Wawancara ({ratedCount}/{flatItems.length} dinilai)</span>
            <span className="font-black text-emerald-800 font-mono text-sm">
              {Number(wawancaraScore.toFixed(1))} / 50 Poin
            </span>
          </div>
        </div>

        <div className="print-scroll space-y-3 max-h-[560px] overflow-y-auto pr-1">
          {groupedItems.map(g => {
            const Icon = g.icon;
            return (
              <div key={g.id} className="space-y-2">
                <div className="flex items-center gap-2 sticky top-0 bg-white py-1 z-10">
                  <Icon className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-black text-[#191919]">{g.label}</span>
                  <span className="font-kr text-[11px] text-[#787774]">({g.ko})</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold font-mono">
                    {g.points} Poin / {g.items} Butir
                  </span>
                </div>

                {g.list.map((q, i) => {
                  const key = `${g.id}#${q.id ?? i}`;
                  const rating = ratings[key];
                  return (
                    <div key={key} className="p-3.5 rounded-2xl bg-[#FBFBFA] border border-[#E9E9E7] space-y-2.5 text-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-[#787774] uppercase tracking-wider">
                            <span className="px-1.5 py-0.5 rounded bg-white border border-[#E9E9E7] font-mono">
                              #{i + 1} · {g.perItem} Poin
                            </span>
                            {q.level && <span className="font-normal normal-case">{q.level}</span>}
                          </div>
                          <p className="font-kr font-bold text-[#191919] text-sm mt-1 leading-snug">{q.question_ko}</p>
                          <p className="text-[#787774] text-[11px] italic mt-0.5">"{q.question_id}"</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {q.image_url && (
                            <div className="w-14 h-14 bg-white p-1 rounded-xl border border-[#E9E9E7]">
                              <img src={getAssetUrl(q.image_url)} alt="" className="w-full h-full object-contain" />
                            </div>
                          )}
                          {q.audio_q && (
                            <button
                              onClick={() => playAudioUrl(q.audio_q)}
                              className="no-print p-1.5 rounded-lg bg-white border border-[#E5E5E3] hover:border-blue-400 text-blue-600 transition-all"
                              title="Putar audio soal"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {(q.answer_short_id || q.title_id) && (
                        <div className="p-2.5 rounded-xl bg-white border border-[#E9E9E7] space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Kunci Resmi:</span>
                          <p className="font-kr font-bold text-[#191919]">{q.answer_short_ko || q.title_ko}</p>
                          <p className="text-[#787774]">{q.answer_short_id || q.title_id}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 no-print">
                        <span className="text-[10px] text-[#787774]">Penilaian Anda:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setRating(key, 'pass')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              rating === 'pass' ? 'bg-emerald-600 text-white' : 'bg-white text-[#787774] border border-[#E9E9E7] hover:border-emerald-400'
                            }`}
                          >
                            <CheckCircle className="w-3 h-3 inline mr-0.5" />Lulus
                          </button>
                          <button
                            onClick={() => setRating(key, 'review')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              rating === 'review' ? 'bg-amber-500 text-white' : 'bg-white text-[#787774] border border-[#E9E9E7] hover:border-amber-400'
                            }`}
                          >
                            <AlertCircle className="w-3 h-3 inline mr-0.5" />Tinjau
                          </button>
                          <button
                            onClick={() => setRating(key, 'fail')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              rating === 'fail' ? 'bg-red-600 text-white' : 'bg-white text-[#787774] border border-[#E9E9E7] hover:border-red-400'
                            }`}
                          >
                            <XCircle className="w-3 h-3 inline mr-0.5" />Gagal
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        </>
        )}
      </div>

      <div className="bg-white border border-[#E9E9E7] rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#787774]">3. Total Keseluruhan (100 / 110 Poin)</h2>

        <label className="flex items-center gap-2.5 text-xs font-bold text-[#191919] no-print cursor-pointer">
          <input
            type="checkbox"
            checked={fishery}
            onChange={e => { setFishery(e.target.checked); setFisik(f => Math.min(Number(f) || 0, e.target.checked ? 40 : 30)); }}
            className="w-4 h-4 accent-blue-600"
          />
          Jalur 어업특례 (Perikanan) — Fisik maksimal 40 poin, total 110
        </label>

        <div className="grid sm:grid-cols-3 gap-3 no-print">
          <div className="p-3 rounded-2xl bg-[#FBFBFA] border border-[#E9E9E7] space-y-1.5">
            <span className="text-[11px] font-bold text-[#787774]">Fisik (input manual, 0–{fisikMax})</span>
            <input
              type="number" min="0" max={fisikMax} step="0.5" value={fisik}
              onChange={e => setFisik(Math.min(Math.max(Number(e.target.value) || 0, 0), fisikMax))}
              className="w-full px-3 py-2 rounded-xl border border-[#E5E5E3] text-lg font-black font-mono focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="p-3 rounded-2xl bg-[#FBFBFA] border border-[#E9E9E7] space-y-1.5">
            <span className="text-[11px] font-bold text-[#787774]">Keahlian Dasar (0–20)</span>
            <input
              type="number" min="0" max="20" step="0.5" value={keahlian}
              onChange={e => setKeahlian(Math.min(Math.max(Number(e.target.value) || 0, 0), 20))}
              className="w-full px-3 py-2 rounded-xl border border-[#E5E5E3] text-lg font-black font-mono focus:outline-none focus:border-blue-500"
            />
            <p className="text-[10px] text-[#787774]">Jalur umum: penilaian ini sementara belum dilaksanakan.</p>
          </div>
          <div className="p-3 rounded-2xl bg-[#191919] text-white space-y-1.5">
            <span className="text-[11px] font-bold text-white/70">Total Anda</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono">{Number(grandTotal.toFixed(1))}</span>
              <span className="text-sm font-bold text-white/60">/ {grandMax}</span>
            </div>
            <p className="text-[10px] text-white/60">
              {Math.round((grandTotal / grandMax) * 100)}% dari total skala {grandMax} poin
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap no-print">
          <div>
            {wawancaraPassed ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> Wawancara LULUS ambang (≥ 30/50)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> Wawancara belum mencapai 30/50
              </span>
            )}
            {!allRated && (
              <span className="ml-2 text-[11px] text-[#787774]">Sisa {flatItems.length - ratedCount} butir belum dinilai.</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={saveHistory}
              disabled={!allRated}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
            >
              <Save className="w-3.5 h-3.5" /> Simpan ke Riwayat
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-2xl bg-white border border-[#E5E5E3] hover:border-slate-400 text-xs font-bold text-[#191919] flex items-center gap-2 shadow-2xs transition-all"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak / PDF
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E9E9E7] rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#787774]">4. Riwayat Penilaian</h2>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="no-print text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Hapus semua
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-[#787774]">
            {linked
              ? 'Belum ada riwayat. Isi nilai Fisik & Keahlian lalu tekan "Simpan ke Riwayat".'
              : 'Belum ada riwayat. Selesaikan 25 butir lalu tekan "Simpan ke Riwayat".'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-left text-[#787774] border-b border-[#E9E9E7]">
                  <th className="py-2 pr-2 font-bold">Tanggal</th>
                  <th className="py-2 px-2 font-bold text-right">Wawancara</th>
                  <th className="py-2 px-2 font-bold text-right">Fisik</th>
                  <th className="py-2 px-2 font-bold text-right">Keahlian</th>
                  <th className="py-2 pl-2 font-bold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.ts} className="border-b border-[#F2F2F0]">
                    <td className="py-2 pr-2 text-[#191919]">{new Date(h.ts).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                    <td className="py-2 px-2 text-right font-mono">{h.wawancara}/50</td>
                    <td className="py-2 px-2 text-right font-mono">{h.fisik}</td>
                    <td className="py-2 px-2 text-right font-mono">{h.keahlian}</td>
                    <td className="py-2 pl-2 text-right font-mono font-bold">{h.total}/{h.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#E9E9E7] rounded-3xl p-5 md:p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#787774]">5. Tips Persiapan</h2>
        <ul className="space-y-2">
          {TIPS.map((t, i) => (
            <li key={i} className="text-xs text-[#191919] flex items-start gap-2">
              <span className="mt-0.5 w-5 h-5 shrink-0 rounded-lg bg-blue-50 text-blue-700 font-bold text-[10px] flex items-center justify-center">{i + 1}</span>
              {t}
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-[#787774] border-t border-[#EFEFED] pt-3">
          Struktur ini mengikuti tabel 배점표 resmi 2026.{' '}
          {linked
            ? 'Skor wawancara di atas diambil langsung dari hasil Simulasi Ujian Anda.'
            : 'Skor simulasi ujian wawancara aplikasi (2+15+5+10+18 = 50 poin) dihitung terpisah pada layar hasil Simulasi Ujian.'}
        </p>
      </div>
    </div>
  );
}
