import React, { useState, useMemo, useEffect } from 'react';
import {
  Printer, Save, Trash2, RotateCcw,
  CheckCircle, AlertCircle, XCircle,
  ClipboardCheck, Wrench, Briefcase, UserCheck
} from 'lucide-react';
import { getRandomSample } from '../utils/shuffle.js';
import { getAssetUrl } from '../utils/assetHelper.js';
import { Button } from './ui/button.jsx';
import { Badge } from './ui/badge.jsx';
import { Progress } from './ui/progress.jsx';
import { cn } from '../utils/cn.js';

const HISTORY_KEY = 'eps_check_history_v1';
const RUBRIC = { pass: 1, review: 0.5, fail: 0 };

const GROUPS = [
  {
    id: 'intro', label: 'Perkenalan Diri', ko: '자기소개',
    points: 2, items: 1, icon: UserCheck,
    pools: [['wawancara', 1]]
  },
  {
    id: 'instr', label: 'Instruksi Gerak Fisik', ko: '작업지시',
    points: 15, items: 5, icon: ClipboardCheck,
    pools: [['gerak_fisik', 5]]
  },
  {
    id: 'tools', label: 'Visual & Praktik Alat', ko: '작업도구',
    points: 7, items: 7, icon: Wrench,
    pools: [['alat_manufaktur', 4], ['alat_klasik', 1], ['fungsi_alat', 1], ['praktik_alat', 1]]
  },
  {
    id: 'safety', label: 'K3 Mendalam', ko: '안전보건',
    points: 10, items: 2, icon: AlertCircle,
    pools: [['k3_safety', 2]]
  },
  {
    id: 'ncs', label: 'Percakapan & NCS', ko: '기초대화·NCS',
    points: 16, items: 14, icon: Briefcase,
    pools: [['wawancara', 5], ['simulasi_hrdk', 5], ['wawancara_profesional', 1], ['matematika', 1], ['konversi_satuan', 1], ['hitungan_lisan', 1]]
  }
];

export function CheckRekap({ questionsData, playAudioUrl, stopAllAudio, examWawancara = null }) {
  const [seed, setSeed] = useState(0);
  const [ratings, setRatings] = useState({});
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
  const grandTotal = wawancaraFinal;
  const grandMax = 50;
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
    <div className="w-full max-w-3xl mx-auto space-y-5 text-left animate-fade-in">
      <style>{`
        @media print {
          header, .no-print { display: none !important; }
        }
      `}</style>

      {/* Clean Page Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>Cek & Rekap Skor Ujian</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Penilaian mandiri gaya EPS Skill Test Mock Assessment · struktur penilaian resmi HRD Korea 2026.
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 font-mono">Total {grandMax} Poin</Badge>
      </div>

      {/* Single-level container: Struktur Penilaian & Ringkasan Skor */}
      <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
        {/* 3 Pillar Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
          <div className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <ClipboardCheck className="h-3.5 w-3.5" /> Fisik
              </span>
              <span className="text-lg font-bold font-mono text-foreground">
                30<span className="text-xs font-normal text-muted-foreground"> / 40*</span>
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Kekuatan otot 20 + Daya jantung-paru 10</p>
          </div>
          <div className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5" /> Keahlian Dasar
              </span>
              <span className="text-lg font-bold font-mono text-foreground">20</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Spesialisasi: 1 tugas per industri</p>
          </div>
          <div className="p-4 space-y-1 bg-emerald-50/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" /> Wawancara
              </span>
              <span className="text-lg font-bold font-mono text-emerald-800">50</span>
            </div>
            <p className="text-[11px] text-emerald-800">Ambang lulus: minimal 30 poin (60%)</p>
          </div>
        </div>

        {/* Tabel Kelompok */}
        <div className="p-4 sm:p-5 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-2 font-medium">Kelompok Wawancara</th>
                <th className="py-2 px-2 font-medium text-right">Poin</th>
                <th className="py-2 px-2 font-medium text-right">Butir</th>
                <th className="py-2 pl-2 font-medium text-right">Skor Anda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {groupedItems.map(g => (
                <tr key={g.id}>
                  <td className="py-2 pr-2 text-foreground font-medium">
                    {g.label} <span className="font-kr text-muted-foreground font-normal">({g.ko})</span>
                  </td>
                  <td className="py-2 px-2 text-right font-mono">{g.points}</td>
                  <td className="py-2 px-2 text-right font-mono text-muted-foreground">{g.items}</td>
                  <td className="py-2 pl-2 text-right font-mono font-bold text-foreground">
                    {linked ? '-' : Number((groupScores[g.id] || 0).toFixed(1))}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-foreground">
                <td className="py-2.5 pr-2 font-bold text-foreground">Total Wawancara</td>
                <td className="py-2.5 px-2 text-right font-mono font-bold">50</td>
                <td className="py-2.5 px-2 text-right font-mono font-bold">25</td>
                <td className="py-2.5 pl-2 text-right font-mono font-bold text-emerald-700">
                  {Number(wawancaraFinal.toFixed(1))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Skor Akhir & Tombol Aksi */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-secondary/30">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              {linked ? 'Skor Wawancara (dari Hasil Ujian)' : 'Total Skor Penilaian Mandiri'}
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl font-bold font-mono text-foreground">
                {Number(wawancaraFinal.toFixed(1))}<span className="text-base text-muted-foreground font-normal"> / {grandMax}</span>
              </span>
              {wawancaraPassed ? (
                <Badge variant="success"><CheckCircle className="h-3 w-3" /> Lulus ambang batas (≥ 60%)</Badge>
              ) : (
                <Badge variant="destructive"><XCircle className="h-3 w-3" /> Belum mencapai ambang batas</Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 no-print">
            {!linked && (
              <Button variant="outline" size="sm" onClick={reshuffle}>
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Paket Baru</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak</span>
            </Button>
            <Button size="sm" onClick={saveHistory} disabled={!allRated}>
              <Save className="h-3.5 w-3.5" />
              <span>Simpan Riwayat</span>
            </Button>
            {history.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearHistory}>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Daftar 25 Butir Penilaian Mandiri (1 level divide-y, natural page scroll) */}
      {!linked && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div>
              <h2 className="text-sm font-bold text-foreground">Penilaian Mandiri 25 Butir</h2>
              <p className="text-[11px] text-muted-foreground">
                Rubrik: <span className="font-medium text-emerald-700">Lulus = 100%</span> ·{' '}
                <span className="font-medium text-warn">Tinjau = 50%</span> ·{' '}
                <span className="font-medium text-red-700">Gagal = 0%</span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs min-w-[160px]">
              <span className="text-muted-foreground shrink-0">Dinilai:</span>
              <Progress value={flatItems.length ? (ratedCount / flatItems.length) * 100 : 0} className="w-24" />
              <span className="font-mono font-bold shrink-0">{ratedCount}/{flatItems.length}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
            {groupedItems.map(g => {
              const Icon = g.icon;
              return (
                <React.Fragment key={g.id}>
                  <div className="px-4 py-2.5 bg-secondary/50 flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{g.label}</span>
                      <span className="font-kr text-muted-foreground font-normal">({g.ko})</span>
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {Number((groupScores[g.id] || 0).toFixed(1))} / {g.points} Poin
                    </span>
                  </div>
                  {g.list.map((q, i) => {
                    const key = `${g.id}#${q.id ?? i}`;
                    const rating = ratings[key];
                    return (
                      <div key={key} className="p-4 flex items-start gap-3">
                        {q.image_url && (
                          <img
                            src={getAssetUrl(q.image_url)}
                            alt=""
                            className="h-12 w-12 object-contain shrink-0"
                            loading="lazy"
                          />
                        )}
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs sm:text-sm font-semibold text-foreground font-kr leading-snug">
                                <span className="font-mono text-muted-foreground mr-1.5">{i + 1}.</span>
                                {q.question_ko}
                              </p>
                              <p className="text-xs text-muted-foreground leading-snug mt-0.5">{q.question_id}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {[
                                { v: 'pass', label: 'Lulus', icon: CheckCircle, active: 'bg-emerald-600 text-white border-emerald-600' },
                                { v: 'review', label: 'Tinjau', icon: AlertCircle, active: 'bg-warn text-warn-foreground border-warn' },
                                { v: 'fail', label: 'Gagal', icon: XCircle, active: 'bg-destructive text-destructive-foreground border-destructive' },
                              ].map(r => (
                                <button
                                  key={r.v}
                                  type="button"
                                  onClick={() => setRating(key, r.v)}
                                  className={cn(
                                    'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-colors min-h-[32px]',
                                    rating === r.v ? r.active : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                                  )}
                                >
                                  <r.icon className="h-3 w-3 shrink-0" />
                                  <span>{r.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Riwayat Tersimpan (1-level container) */}
      {history.length > 0 && (
        <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
          <div className="px-4 py-2.5 bg-secondary/50 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Riwayat Tersimpan
          </div>
          {history.map((h, i) => (
            <div key={i} className="px-4 py-2.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{new Date(h.ts).toLocaleDateString('id-ID')}</span>
              <span className="font-mono font-bold text-foreground">{h.wawancara} / {h.max} Poin</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
