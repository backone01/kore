import React, { useState, useEffect } from 'react';
import { Volume2, Eye, EyeOff, Search, Sparkles, Maximize2, X } from 'lucide-react';
import { getAssetUrl } from '../utils/assetHelper.js';
import { Badge } from './ui/badge.jsx';
import { Button } from './ui/button.jsx';
import { cn } from '../utils/cn.js';
import studyData from '../data/studyMaterials.json';

export function ToolCatalog({
  questions = [],
  isAnswerHidden,
  toggleCardAnswer,
  playAudio,
  hideAllAnswers,
  onSetGlobalHideAll,
  onInspectRambu,
  onOpenRevisionModal
}) {
  const [alatGroup, setAlatGroup] = useState(() => {
    try {
      const saved = localStorage.getItem('kore_alat_group');
      if (saved && typeof saved === 'string') return saved;
    } catch {}
    return 'all';
  });

  useEffect(() => {
    try {
      localStorage.setItem('kore_alat_group', alatGroup);
    } catch {}
  }, [alatGroup]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cardUsageOptions, setCardUsageOptions] = useState({});
  const [globalAlatUsageOption, setGlobalAlatUsageOption] = useState('mudah');

  const allAlat = questions.filter(
    (q) => q.category === 'alat_manufaktur' || q.category === 'alat_klasik'
  );
  const allPerintah = questions.filter(
    (q) => q.category === 'praktik_alat' || q.category === 'perintah_alat'
  );

  const alatGroups = [
    { id: 'all', label: 'Semua Alat', count: allAlat.length },
    { id: 'perintah', label: 'Perintah Kerja (작업지시)', count: allPerintah.length },
    { id: 'atas', label: 'Tingkat Atas (상)', count: allAlat.filter((x) => x.level === 'Atas' || x.level === 'Tinggi').length },
    { id: 'menengah', label: 'Tingkat Menengah (중)', count: allAlat.filter((x) => x.level === 'Menengah' || x.level === 'Sedang').length },
    { id: 'dasar', label: 'Tingkat Dasar (하)', count: allAlat.filter((x) => x.level === 'Dasar' || x.level === 'Rendah').length },
    { id: 'apd', label: 'APD & Klasik', count: allAlat.filter((x) => x.level === 'Wajib' || x.category === 'alat_klasik').length },
  ];

  const pool = alatGroup === 'perintah' ? allPerintah : allAlat;
  const filteredAlatList = pool.filter((item) => {
    if (alatGroup === 'perintah') {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return `${item.question_ko || ''} ${item.question_id || ''} ${item.answer_short_ko || ''} ${item.answer_short_id || ''}`.toLowerCase().includes(q);
      }
      return true;
    }
    if (alatGroup === 'atas' && !(item.level === 'Atas' || item.level === 'Tinggi')) return false;
    if (alatGroup === 'menengah' && !(item.level === 'Menengah' || item.level === 'Sedang')) return false;
    if (alatGroup === 'dasar' && !(item.level === 'Dasar' || item.level === 'Rendah')) return false;
    if (alatGroup === 'apd' && !(item.level === 'Wajib' || item.category === 'alat_klasik')) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return `${item.title_ko || ''} ${item.title_id || ''} ${item.answer_short_ko || ''} ${item.answer_short_id || ''}`.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="border-b border-border pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs">
              KISI-KISI ALAT KERJA RESMI HRDK
            </Badge>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {allAlat.length} Alat Terverifikasi
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            Katalog 90 Alat Pabrik Manufaktur & Fungsi Kerja
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
            Foto fisik perkakas, nama Korea baku, dan pola kalimat fungsinya saat ditunjuk penguji di meja ujian.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={hideAllAnswers ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSetGlobalHideAll && onSetGlobalHideAll(!hideAllAnswers)}
            className="text-xs gap-1.5 h-8 shrink-0"
            title="Klik untuk membuka atau menyembunyikan semua jawaban kartu perkakas"
          >
            {hideAllAnswers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{hideAllAnswers ? 'Buka Semua Jawaban Alat' : 'Tutup Semua Jawaban Alat'}</span>
          </Button>

          {onOpenRevisionModal && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenRevisionModal}
              className="text-xs gap-1.5 h-8 border-primary/40 text-primary hover:bg-primary/10 shrink-0"
            >
              <span>Regulasi Resmi HRDK</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {alatGroups.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setAlatGroup(cat.id)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5',
                alatGroup === cat.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary/60'
              )}
            >
              <span>{cat.label}</span>
              <span className="text-xs opacity-80">({cat.count})</span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama alat Korea / Indo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Toolbar Opsi Jawaban Fungsi Alat & Status Buka/Tutup Jawaban */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-secondary/40 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-bold text-foreground text-sm">Pilihan & Tampilan Jawaban Alat:</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Buka/tutup seluruh jawaban untuk latihan uji mandiri atau tampilkan variasi jawaban yang paling mudah
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Tombol Global Buka / Sembunyikan Semua Jawaban */}
          <div className="inline-flex rounded-lg border border-border bg-card p-0.5 gap-0.5">
            <button
              type="button"
              onClick={() => onSetGlobalHideAll && onSetGlobalHideAll(false)}
              className={cn(
                'px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer',
                !hideAllAnswers
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Buka seluruh nama dan kegunaan pada 90 kartu alat"
            >
              Buka Semua Jawaban
            </button>
            <button
              type="button"
              onClick={() => onSetGlobalHideAll && onSetGlobalHideAll(true)}
              className={cn(
                'px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer',
                hideAllAnswers
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Tutup seluruh jawaban untuk latihan tebak nama & fungsi alat"
            >
              Tutup Semua Jawaban
            </button>
          </div>

          {/* Tombol Pilihan Format Jawaban */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'mudah', label: 'Super Mudah', title: 'Pola kalimat pendek yang paling mudah diucapkan' },
              { id: 'standar', label: '⭐ Standar HRDK', title: 'Kalimat standar buku panduan HRD Korea' },
              { id: 'noun', label: '🔹 Bentuk 도구', title: 'Pola langsung menyebut jenis alat' },
              { id: 'all', label: 'Semua Opsi', title: 'Tampilkan semua opsi sekaligus pada setiap kartu' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setGlobalAlatUsageOption(opt.id);
                  if (onSetGlobalHideAll) onSetGlobalHideAll(false);
                }}
                title={opt.title}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer',
                  globalAlatUsageOption === opt.id && !hideAllAnswers
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredAlatList.map((item) => {
          const cardId = `alat_${item.id}`;
          const hidden = isAnswerHidden ? isAnswerHidden(cardId) : false;

          // Card khusus untuk Perintah Praktik Tindakan Kerja
          if (item.category === 'praktik_alat' || item.category === 'perintah_alat') {
            return (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-card p-3.5 flex flex-col justify-between gap-3 hover:border-primary/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono">
                      Perintah Kerja (작업지시)
                    </Badge>
                    <button
                      type="button"
                      onClick={() => playAudio && playAudio(item.audio_q, item.question_ko)}
                      className="w-7 h-7 rounded-md bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                      title="Putar Audio Instruksi Penguji"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      Instruksi Penguji:
                    </span>
                    <p className="text-base font-bold text-foreground font-kr leading-snug">
                      {item.question_ko}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      &ldquo;{item.question_id}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60">
                  {hidden ? (
                    <button
                      type="button"
                      onClick={() => toggleCardAnswer && toggleCardAnswer(cardId)}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-secondary/70 hover:bg-secondary text-xs font-medium text-muted-foreground flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Tampilkan Respon & Peragaan</span>
                    </button>
                  ) : (
                    <div className="space-y-1.5 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                          Respon Sopan & Tindakan Gerak:
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleCardAnswer && toggleCardAnswer(cardId)}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 cursor-pointer py-0.5 px-1.5 rounded hover:bg-secondary"
                        >
                          <EyeOff className="w-3 h-3" />
                          <span>Tutup</span>
                        </button>
                      </div>
                      <p className="text-sm font-bold font-kr text-foreground">
                        {item.answer_short_ko}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.answer_short_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          const usageObj = studyData.manufacturing?.tool_usages_catalog?.[item.id];
          const usageOptions = (item.answer_options && item.answer_options.length > 0)
            ? item.answer_options.map((opt, oIdx) => ({
                key: oIdx === 0 ? 'mudah' : oIdx === 1 ? 'standar' : oIdx === 2 ? 'noun' : 'lengkap',
                badge: opt.label,
                label: opt.label.replace(/^[^\s]+\s+/, ''),
                ko: opt.ko || opt.answer_ko,
                id: opt.id || opt.answer_id,
                audio: opt.audio
              }))
            : (item.usage_options || usageObj?.usage_options || [
                { key: 'mudah', badge: 'Super Mudah', label: 'Paling Mudah', ko: item.usage_short_ko || usageObj?.usage_short_ko, id: item.usage_short_id || usageObj?.usage_short_id, audio: item.audio_a },
                { key: 'standar', badge: '⭐ Standar HRDK', label: 'Standar', ko: item.usage_short_ko || usageObj?.usage_short_ko, id: item.usage_short_id || usageObj?.usage_short_id, audio: item.audio_a },
                { key: 'noun', badge: '🔹 Bentuk 도구', label: 'Bentuk Alat', ko: `${item.title_ko || item.answer_short_ko}입니다.`, id: item.title_id || item.answer_short_id, audio: item.audio_a }
              ]);
          const currentOptKey = cardUsageOptions[cardId] || (globalAlatUsageOption === 'all' ? 'all' : globalAlatUsageOption);
          const activeUsageOpt = usageOptions.find((o) => o.key === currentOptKey) || usageOptions[0];

          return (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-card p-3.5 flex flex-col justify-between gap-3 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                {item.image_url && (
                  <button
                    type="button"
                    onClick={() => onInspectRambu && onInspectRambu(item)}
                    className="w-16 h-16 rounded-lg border border-border bg-white p-1.5 shrink-0 flex items-center justify-center relative group cursor-pointer"
                    title="Perbesar Gambar"
                  >
                    <img
                      src={getAssetUrl(item.image_url)}
                      alt={item.title_id || item.answer_short_id}
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                    />
                    <span className="absolute bottom-1 right-1 w-4 h-4 rounded bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-2.5 h-2.5" />
                    </span>
                  </button>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
                      Level: {item.level || 'Standar'}
                    </span>
                    <button
                      type="button"
                      onClick={() => playAudio && playAudio(item.audio_a, item.answer_short_ko || item.title_ko)}
                      className="w-7 h-7 rounded-md bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                      title="Putar Audio Jawaban"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {hidden ? (
                    <div className="py-1.5 px-2 rounded-md bg-secondary/80 border border-dashed border-border flex items-center gap-1.5 text-xs text-muted-foreground my-1">
                      <EyeOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="font-bold text-foreground text-[11px]">Nama Korea Disembunyikan</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm sm:text-base font-black text-foreground leading-snug break-keep">
                        {item.title_ko || item.answer_short_ko}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Jawaban: <strong className="text-foreground">{item.answer_short_ko}</strong>
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-border/60">
                {hidden ? (
                  <button
                    type="button"
                    onClick={() => toggleCardAnswer && toggleCardAnswer(cardId)}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-secondary/70 hover:bg-secondary text-xs font-medium text-muted-foreground flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Tampilkan Nama & Kegunaan</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        {item.title_id || item.answer_short_id}
                      </p>
                      <button
                        type="button"
                        onClick={() => toggleCardAnswer && toggleCardAnswer(cardId)}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 cursor-pointer py-0.5 px-1.5 rounded hover:bg-secondary"
                        title="Tutup jawaban kartu ini"
                      >
                        <EyeOff className="w-3 h-3" />
                        <span>Tutup</span>
                      </button>
                    </div>

                    {item.note && (
                      <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-md border border-amber-200 dark:border-amber-900/40 leading-snug">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 block mb-0.5">
                          💡 Catatan Kisi-Kisi HRD Korea:
                        </span>
                        {item.note}
                      </div>
                    )}

                    {currentOptKey === 'all' ? (
                      <div className="pt-1.5 border-t border-border/40 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
                          <span>Opsi Jawaban Fungsi ({usageOptions.length}):</span>
                          <button
                            type="button"
                            onClick={() => setCardUsageOptions((prev) => ({ ...prev, [cardId]: 'mudah' }))}
                            className="text-primary hover:underline cursor-pointer"
                          >
                            Ringkas
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {usageOptions.map((opt) => (
                            <div
                              key={opt.key}
                              className="p-2 rounded-lg bg-secondary/40 border border-border/50 space-y-0.5"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-primary">{opt.badge}</span>
                                <button
                                  type="button"
                                  onClick={() => playAudio && playAudio(opt.audio || item.audio_a, opt.ko)}
                                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                                >
                                  <Volume2 className="w-3 h-3" /> Putar
                                </button>
                              </div>
                              <p className="text-xs font-bold text-foreground break-keep">{opt.ko}</p>
                              <p className="text-[11px] text-muted-foreground">{opt.id}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1.5 border-t border-border/40 space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex flex-wrap gap-1">
                            {usageOptions.map((opt) => (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => setCardUsageOptions((prev) => ({ ...prev, [cardId]: opt.key }))}
                                className={cn(
                                  'px-1.5 py-0.5 rounded text-xs font-bold transition-all cursor-pointer border',
                                  activeUsageOpt.key === opt.key
                                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                    : 'bg-secondary/70 text-muted-foreground border-border/60 hover:text-foreground'
                                )}
                                title={opt.desc}
                              >
                                {opt.badge.split(' ')[0]} {opt.label}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => playAudio && playAudio(activeUsageOpt.audio || item.audio_a, activeUsageOpt.ko)}
                            className="p-1 rounded bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                            title="Putar Suara Opsi Ini"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs font-bold text-foreground break-keep">{activeUsageOpt.ko}</p>
                        <p className="text-[11px] text-muted-foreground leading-snug">{activeUsageOpt.id}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
