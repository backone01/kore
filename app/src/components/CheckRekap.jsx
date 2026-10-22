import React, { useState, useMemo, useEffect } from 'react';
import {
  Printer, Save, Trash2, RotateCcw,
  CheckCircle, AlertCircle, XCircle,
  ClipboardCheck, Wrench, Briefcase, UserCheck
} from 'lucide-react';
import { getRandomSample } from '../utils/shuffle.js';
import { getAssetUrl } from '../utils/assetHelper.js';
import { Button } from './ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx';
import { Badge } from './ui/badge.jsx';
import { Progress } from './ui/progress.jsx';
import { Separator } from './ui/separator.jsx';
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
    <div className="w-full max-w-3xl mx-auto space-y-4 animate-fade-in">
      <style>{`
        @media print {
          header, .no-print { display: none !important; }
          .print-scroll { max-height: none !important; overflow: visible !important; }
        }
      `}</style>

      {/* Header */}
      <Card className="p-5 md:p-6 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-emerald-600" />
              Cek & Rekap Skor Ujian
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Penilaian mandiri gaya EPS Skill Test Mock Assessment : struktur penilaian resmi HRD Korea 2026.
            </p>
          </div>
          <Badge variant="outline" className="shrink-0">Total {grandMax} Poin</Badge>
        </div>
      </Card>

      {/* Struktur penilaian */}
      <Card className="p-5 md:p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Struktur Penilaian Resmi 2026</h2>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-md bg-secondary border border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><ClipboardCheck className="h-3.5 w-3.5" /> Fisik</span>
              <span className="text-xl font-bold text-foreground">30<span className="text-xs font-medium text-muted-foreground"> / 40*</span></span>
            </div>
            <p className="text-[11px] text-muted-foreground">Kekuatan otot 20 + Daya jantung-paru 10 (umum)</p>
          </div>
          <div className="p-4 rounded-md bg-secondary border border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Wrench className="h-3.5 w-3.5" /> Keahlian Dasar</span>
              <span className="text-xl font-bold text-foreground">20</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Spesialisasi: 1 tugas per industri</p>
          </div>
          <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-800 flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Wawancara</span>
              <span className="text-xl font-bold text-emerald-800">50</span>
            </div>
            <p className="text-[11px] text-emerald-800">Ambang lulus: ≥ 30 poin (60%)</p>
          </div>
        </div>

        <Separator />

        {/* Tabel kelompok */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-2 font-medium">Kelompok</th>
                <th className="py-2 px-2 font-medium text-right">Poin</th>
                <th className="py-2 px-2 font-medium text-right">Butir</th>
                <th className="py-2 pl-2 font-medium text-right">Per Butir</th>
              </tr>
            </thead>
            <tbody>
              {groupedItems.map(g => (
                <tr key={g.id} className="border-b border-border/50">
                  <td className="py-2 pr-2 text-foreground font-medium">
                    {g.label} <span className="font-kr text-muted-foreground font-normal">({g.ko})</span>
                  </td>
                  <td className="py-2 px-2 text-right font-mono font-bold">{g.points}</td>
                  <td className="py-2 px-2 text-right font-mono">{g.items}</td>
                  <td className="py-2 pl-2 text-right font-mono text-muted-foreground">{g.perItem}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-foreground">
                <td className="py-2 pr-2 font-bold text-foreground">Total Wawancara</td>
                <td className="py-2 px-2 text-right font-mono font-bold">50</td>
                <td className="py-2 px-2 text-right font-mono font-bold">25</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Penilaian mandiri */}
      <Card className="p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {linked ? 'Skor Wawancara (dari Hasil Ujian)' : 'Penilaian Mandiri 25 Butir'}
            </h2>
            {!linked && (
              <p className="text-[11px] text-muted-foreground mt-1">
                Rubrik: <span className="font-medium text-emerald-700">Lulus = 100%</span> ·{' '}
                <span className="font-medium text-warn">Tinjau = 50%</span> ·{' '}
                <span className="font-medium text-red-700">Tidak Lulus = 0%</span>
              </p>
            )}
          </div>
          {!linked && (
            <Button variant="outline" size="sm" onClick={reshuffle}>
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Paket Acak Baru</span>
            </Button>
          )}
        </div>

        {/* Progress */}
        {!linked && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progres penilaian</span>
              <span className="font-mono font-bold">{ratedCount} / {flatItems.length}</span>
            </div>
            <Progress value={flatItems.length ? (ratedCount / flatItems.length) * 100 : 0} />
          </div>
        )}

        {/* Skor akhir */}
        <div className="p-4 rounded-md bg-secondary border border-border text-center space-y-1">
          <div className="text-3xl font-bold font-mono text-foreground">{wawancaraFinal}<span className="text-base text-muted-foreground"> / {grandMax}</span></div>
          {wawancaraPassed ? (
            <Badge variant="success" className="mt-1"><CheckCircle className="h-3 w-3" /> Lulus ambang batas (≥ 60%)</Badge>
          ) : (
            <Badge variant="destructive" className="mt-1"><XCircle className="h-3 w-3" /> Belum mencapai ambang batas</Badge>
          )}
        </div>

        {/* Daftar soal */}
        {!linked && (
          <div className="print-scroll max-h-[420px] overflow-y-auto pr-1 space-y-3">
            {groupedItems.map(g => {
              const Icon = g.icon;
              return (
                <div key={g.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {g.label}
                      <span className="font-kr text-muted-foreground font-normal">({g.ko})</span>
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">{groupScores[g.id]} / {g.points}</span>
                  </div>
                  {g.list.map((q, i) => {
                    const key = `${g.id}#${q.id ?? i}`;
                    const rating = ratings[key];
                    return (
                      <div key={key} className="flex items-start gap-3 p-3 rounded-md border border-border bg-card">
                        <img
                          src={getAssetUrl(q.image_url || (q.category === 'piktogram' ? q.image_url : ''))}
                          alt=""
                          className={cn('h-10 w-10 rounded-sm object-contain border border-border bg-muted shrink-0', !q.image_url && 'hidden')}
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-xs font-medium text-foreground leading-snug">
                            <span className="font-mono text-muted-foreground mr-1">{i + 1}.</span>
                            {q.question_ko}
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-snug">{q.question_id}</p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {[
                              { v: 'pass', label: 'Lulus', icon: CheckCircle, active: 'bg-emerald-600 text-white border-emerald-600' },
                              { v: 'review', label: 'Tinjau', icon: AlertCircle, active: 'bg-warn text-warn-foreground border-warn' },
                              { v: 'fail', label: 'Gagal', icon: XCircle, active: 'bg-destructive text-destructive-foreground border-destructive' },
                            ].map(r => (
                              <button key={r.v} onClick={() => setRating(key, r.v)}
                                className={cn(
                                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] font-medium border transition-all active:scale-95',
                                  rating === r.v ? r.active : 'bg-transparent text-muted-foreground border-border hover:bg-secondary'
                                )}>
                                <r.icon className="h-3 w-3" />
                                {r.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* Aksi */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="no-print">
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak</span>
          </Button>
          <Button size="sm" onClick={saveHistory} disabled={!allRated}>
            <Save className="h-3.5 w-3.5" />
            <span>Simpan Riwayat</span>
          </Button>
          {history.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearHistory} className="no-print">
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus Riwayat</span>
            </Button>
          )}
        </div>

        {/* Riwayat */}
        {history.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground">Riwayat tersimpan</span>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 rounded-sm bg-secondary border border-border">
                  <span className="text-muted-foreground">{new Date(h.ts).toLocaleDateString('id-ID')}</span>
                  <span className="font-mono font-bold">{h.wawancara} / {h.max}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
