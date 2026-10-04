'use client';

import { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import type { AnswerRecord } from '@/machines/quizMachine';

export type ScoreData = {
  category: string | null;
  score: number;
  total: number;
  history: AnswerRecord[];
};

export type DuelData = { a: ScoreData; b: ScoreData };

/* ==========================================================================
   SVG ICONS & EMBLEMS
   ========================================================================== */

function KetepatanEmblem() {
  return (
    <div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shrink-0">
      <div className="absolute inset-0 bg-emerald-100/80 rounded-2xl scale-100" />
      <div className="relative w-11 h-11 md:w-13 md:h-13 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-sm">
        <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" className="stroke-white/40" />
          <circle cx="12" cy="12" r="5" className="stroke-white" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <path d="M19 5L13.5 10.5" strokeWidth="2.5" />
          <path d="M21 3L18 3L19 5L21 6L21 3Z" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

function RataRataEmblem() {
  return (
    <div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shrink-0">
      <div className="absolute inset-0 bg-blue-100/80 rounded-2xl scale-100" />
      <div className="relative w-11 h-11 md:w-13 md:h-13 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
        <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" className="stroke-white" />
          <path d="M12 7V12L15.5 14.5" strokeWidth="2.5" />
          <line x1="12" y1="4" x2="12" y2="5" strokeWidth="2" />
          <line x1="12" y1="19" x2="12" y2="20" strokeWidth="2" />
          <line x1="4" y1="12" x2="5" y2="12" strokeWidth="2" />
          <line x1="19" y1="12" x2="20" y2="12" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

function TercepatEmblem() {
  return (
    <div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shrink-0">
      <div className="absolute inset-0 bg-amber-100/80 rounded-2xl scale-100" />
      <div className="relative w-11 h-11 md:w-13 md:h-13 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-sm">
        <svg className="w-7 h-7 md:w-8 md:h-8 fill-white" viewBox="0 0 24 24">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
        </svg>
      </div>
    </div>
  );
}

function TotalWaktuEmblem() {
  return (
    <div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shrink-0">
      <div className="absolute inset-0 bg-indigo-100/80 rounded-2xl scale-100" />
      <div className="relative w-11 h-11 md:w-13 md:h-13 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
        <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2H14" strokeWidth="2.5" />
          <circle cx="12" cy="14" r="8" strokeWidth="2" />
          <path d="M12 10V14L14.5 15.5" strokeWidth="2.2" />
          <path d="M5 6L3 8" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

/* ==========================================================================
   MINI BADGES & HELPER ICONS
   ========================================================================== */

function TargetBadge() {
  return (
    <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    </div>
  );
}

function ClockBadge() {
  return (
    <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8V12L14.5 14" />
      </svg>
    </div>
  );
}

function LightningBadge() {
  return (
    <div className="w-7 h-7 flex items-center justify-center text-amber-500">
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
      </svg>
    </div>
  );
}

function PurpleClockBadge() {
  return (
    <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8V12L14.5 14" />
      </svg>
    </div>
  );
}

function CheckIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AwardBadgeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BackHomeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ==========================================================================
   HELPER FUNCTIONS & COMPUTATION
   ========================================================================== */

function formatSeconds(ms: number) {
  return (ms / 1000).toFixed(1);
}

function computeStats(data: ScoreData) {
  const accuracy = data.total > 0 ? Math.round((data.score / data.total) * 100) : 0;
  const times = data.history.map((h) => h.responseTimeMs).filter((t) => t > 0);
  const totalMs = times.reduce((sum, t) => sum + t, 0);
  const avgMs = times.length > 0 ? totalMs / times.length : 0;
  const fastestMs = times.length > 0 ? Math.min(...times) : 0;
  return { accuracy, totalMs, avgMs, fastestMs };
}

function getPredicate(accuracy: number) {
  if (accuracy >= 90) return 'Sangat Memuaskan';
  if (accuracy >= 70) return 'Memuaskan';
  if (accuracy >= 50) return 'Cukup';
  return 'Perlu Ditingkatkan';
}

function CountUp({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, duration]);

  return <>{display}</>;
}

function ScoreRing({ score, total, size = 210 }: { score: number; total: number; size?: number }) {
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? score / total : 0;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} className="stroke-slate-100" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-indigo-600"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - ratio) }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-6xl font-black text-slate-900 leading-none tracking-tight">
          <CountUp value={score} />
        </span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2.5">dari {total} soal</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   STAT TILE COMPONENT
   ========================================================================== */

export interface StatTileProps {
  label: string;
  value: string | number;
  unit: string;
  type: 'accuracy' | 'average' | 'fastest' | 'totalTime';
  delay?: number;
}

export function StatTile({ label, value, unit, type, delay = 0 }: StatTileProps) {
  const config = {
    accuracy: {
      emblem: <KetepatanEmblem />,
      badge: <TargetBadge />,
      unitColor: 'text-emerald-600',
      glowColor: 'bg-emerald-500/10',
      borderColor: 'border-slate-200/90 hover:border-emerald-300',
    },
    average: {
      emblem: <RataRataEmblem />,
      badge: <ClockBadge />,
      unitColor: 'text-blue-600',
      glowColor: 'bg-blue-500/10',
      borderColor: 'border-slate-200/90 hover:border-blue-300',
    },
    fastest: {
      emblem: <TercepatEmblem />,
      badge: <LightningBadge />,
      unitColor: 'text-amber-500',
      glowColor: 'bg-amber-500/10',
      borderColor: 'border-slate-200/90 hover:border-amber-300',
    },
    totalTime: {
      emblem: <TotalWaktuEmblem />,
      badge: <PurpleClockBadge />,
      unitColor: 'text-indigo-600',
      glowColor: 'bg-indigo-500/10',
      borderColor: 'border-slate-200/90 hover:border-indigo-300',
    },
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className={`relative overflow-hidden bg-white/90 backdrop-blur-md border ${config.borderColor} rounded-2xl p-5 md:p-6 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between gap-4`}
    >
      <div className={`absolute -bottom-8 -right-8 w-28 h-28 rounded-full blur-xl pointer-events-none ${config.glowColor}`} />

      <div className="shrink-0 z-10">{config.emblem}</div>

      <div className="flex-1 min-w-0 z-10">
        <p className="text-[11px] md:text-xs font-extrabold tracking-wider text-slate-400 uppercase mb-1">
          {label}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
            {value}
          </span>
          <span className={`text-base md:text-lg font-bold ${config.unitColor}`}>
            {unit}
          </span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10">{config.badge}</div>
    </motion.div>
  );
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function ReviewList({ history, compact = false }: { history: AnswerRecord[]; compact?: boolean }) {
  const columns = chunkArray(history, 5);

  return (
    <div className={`grid gap-3.5 w-full h-full ${columns.length > 1 && !compact ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {columns.map((column, colIndex) => (
        <div key={colIndex} className="flex flex-col justify-between min-w-0 h-full gap-3.5">
          {column.map((h, i) => {
            const globalIndex = colIndex * 5 + i;
            return (
              <motion.div
                key={`${h.questionId}-${globalIndex}`}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + globalIndex * 0.03, duration: 0.3, ease: 'easeOut' }}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  h.isCorrect
                    ? 'bg-emerald-50/30 border-emerald-200/80 hover:border-emerald-300'
                    : 'bg-rose-50/30 border-rose-200/80 hover:border-rose-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shrink-0 shadow-xs ${
                        h.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {globalIndex + 1}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                        h.isCorrect
                          ? 'bg-emerald-100/70 border-emerald-200 text-emerald-800'
                          : 'bg-rose-100/70 border-rose-200 text-rose-800'
                      }`}
                    >
                      {h.isCorrect ? <CheckIcon /> : <CrossIcon />}
                      {h.isCorrect ? 'Tepat' : 'Keliru'}
                    </span>
                  </div>

                  <p className="text-xs md:text-sm font-semibold text-slate-800 line-clamp-2 mb-2 leading-snug">
                    {h.text}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] md:text-xs">
                  <span className="text-slate-500 truncate max-w-[180px]">
                    Dipilih:{' '}
                    <strong className={h.isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                      {h.selectedOption ?? 'Tidak dijawab'}
                    </strong>
                    {!h.isCorrect && h.correctOption && (
                      <span className="text-emerald-700 ml-1 font-semibold">
                        (Benar: {h.correctOption})
                      </span>
                    )}
                  </span>
                  <span className="text-slate-400 font-semibold shrink-0 ml-1">
                    {formatSeconds(h.responseTimeMs)} dtk
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ==========================================================================
   SOLO SCOREBOARD
   ========================================================================== */

export function SoloScoreboard({ data, onBack }: { data: ScoreData; onBack: () => void }) {
  const stats = computeStats(data);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 md:p-10 relative overflow-hidden bg-slate-50/70">
      {/* Calm & Calm Professional Background Ambient */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-gradient-to-tr from-indigo-100/40 via-slate-100/30 to-blue-100/40 blur-[140px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[1380px] relative z-10 my-auto"
      >
        {/* Header Utama */}
        <div className="text-center mb-8 md:mb-10">
          <p className="text-xs font-extrabold tracking-widest text-slate-400 uppercase mb-1.5">Kuis Selesai</p>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3.5">Papan Skor</h1>
          <span className="inline-flex items-center gap-2.5 px-4.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs text-xs font-extrabold text-indigo-600">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            {data.category}
          </span>
        </div>

        {/* Layout Grid Berskala Besar & Seimbang */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Sisi Kiri: Ringkasan Skor & Statistik */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-5">
            <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-7 shadow-xs flex flex-col items-center text-center relative overflow-hidden flex-1 justify-center">
              <ScoreRing score={data.score} total={data.total} size={210} />

              <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-100 px-4 py-1.5 rounded-2xl mt-5 mb-1.5">
                <AwardBadgeIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-950">Predikat</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{getPredicate(stats.accuracy)}</h2>
            </div>

            {/* Grid 4 Kartu Statistik */}
            <div className="grid grid-cols-2 gap-3.5">
              <StatTile
                type="accuracy"
                label="KETEPATAN"
                value={stats.accuracy}
                unit="%"
                delay={0.3}
              />
              <StatTile
                type="average"
                label="RATA-RATA"
                value={formatSeconds(stats.avgMs)}
                unit="dtk"
                delay={0.4}
              />
              <StatTile
                type="fastest"
                label="TERCEPAT"
                value={formatSeconds(stats.fastestMs)}
                unit="dtk"
                delay={0.5}
              />
              <StatTile
                type="totalTime"
                label="TOTAL WAKTU"
                value={formatSeconds(stats.totalMs)}
                unit="dtk"
                delay={0.6}
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onBack}
              className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-base py-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <BackHomeIcon className="w-5 h-5 text-white/80" />
              <span>Kembali ke Menu Utama</span>
            </motion.button>
          </div>

          {/* Sisi Kanan: Rincian Jawaban */}
          <div className="lg:col-span-7 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-7 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Rincian Jawaban</h3>
              <span className="text-xs font-bold text-slate-400">{data.history.length} Soal</span>
            </div>
            
            <div className="max-h-[620px] overflow-y-auto pr-1 flex-1">
              <ReviewList history={data.history} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ==========================================================================
   DUEL SCOREBOARD (MULTIPLAYER)
   ========================================================================== */

function PlayerColumn({
  label,
  data,
  stats,
  highlighted,
  delay,
}: {
  label: string;
  data: ScoreData;
  stats: ReturnType<typeof computeStats>;
  highlighted: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex flex-col gap-5 min-w-0"
    >
      {/* Ringkasan Skor */}
      <div
        className={`bg-white/95 backdrop-blur-xl border rounded-3xl p-7 flex flex-col items-center text-center relative overflow-hidden ${
          highlighted ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' : 'border-slate-200/90 shadow-xs'
        }`}
      >
        <span
          aria-hidden={!highlighted}
          className={`text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider mb-3 ${
            highlighted ? 'bg-indigo-600 text-white' : 'invisible'
          }`}
        >
          Pemenang
        </span>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{label}</p>
        <p className="text-xs text-slate-400 font-bold mb-5">{data.category}</p>

        <ScoreRing score={data.score} total={data.total} size={190} />

        <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-100 px-4 py-1.5 rounded-2xl mt-5 mb-1.5">
          <AwardBadgeIcon className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-wider text-indigo-950">Predikat</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{getPredicate(stats.accuracy)}</h2>
      </div>

      {/* Grid 4 Kartu Statistik */}
      <div className="grid grid-cols-2 gap-3.5">
        <StatTile type="accuracy" label="KETEPATAN" value={stats.accuracy} unit="%" delay={delay + 0.2} />
        <StatTile type="average" label="RATA-RATA" value={formatSeconds(stats.avgMs)} unit="dtk" delay={delay + 0.3} />
        <StatTile type="fastest" label="TERCEPAT" value={formatSeconds(stats.fastestMs)} unit="dtk" delay={delay + 0.4} />
        <StatTile type="totalTime" label="TOTAL WAKTU" value={formatSeconds(stats.totalMs)} unit="dtk" delay={delay + 0.5} />
      </div>

      {/* Rincian Jawaban */}
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-7 shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Rincian Jawaban</h3>
          <span className="text-xs font-bold text-slate-400">{data.history.length} Soal</span>
        </div>
        <div className="max-h-[620px] overflow-y-auto pr-1">
          <ReviewList history={data.history} compact />
        </div>
      </div>
    </motion.div>
  );
}
function CompareRow({
  label,
  a,
  b,
  aText,
  bText,
  higherIsBetter,
  delay,
}: {
  label: string;
  a: number;
  b: number;
  aText: string;
  bText: string;
  higherIsBetter: boolean;
  delay: number;
}) {
  const noData = a + b === 0 || (!higherIsBetter && (a === 0 || b === 0));
  const total = a + b;
  const shareA = noData ? 0.5 : higherIsBetter ? a / total : b / total;
  const shareB = 1 - shareA;
  const leader: 'a' | 'b' | null =
    noData || a === b ? null : higherIsBetter ? (a > b ? 'a' : 'b') : a < b ? 'a' : 'b';

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
      <div className="flex items-center gap-4">
        <span className={`w-20 text-right text-lg font-black ${leader === 'a' ? 'text-indigo-600' : 'text-slate-400'}`}>
          {aText}
        </span>
        <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden flex justify-end">
          <motion.div
            className={`h-full rounded-full ${leader === 'a' ? 'bg-indigo-600' : 'bg-slate-300'}`}
            initial={{ width: 0 }}
            animate={{ width: `${shareA * 100}%` }}
            transition={{ duration: 1, delay, ease: 'easeOut' }}
          />
        </div>
      </div>

      <span className="w-36 text-center text-xs font-black tracking-widest text-slate-400 uppercase">{label}</span>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${leader === 'b' ? 'bg-indigo-600' : 'bg-slate-300'}`}
            initial={{ width: 0 }}
            animate={{ width: `${shareB * 100}%` }}
            transition={{ duration: 1, delay, ease: 'easeOut' }}
          />
        </div>
        <span className={`w-20 text-left text-lg font-black ${leader === 'b' ? 'text-indigo-600' : 'text-slate-400'}`}>
          {bText}
        </span>
      </div>
    </div>
  );
}

export function DuelScoreboard({ result, onBack }: { result: DuelData; onBack: () => void }) {
  const sa = computeStats(result.a);
  const sb = computeStats(result.b);

  let winner: 'a' | 'b' | 'draw' = 'draw';
  let verdict = 'Hasil Imbang';
  let note = '';

  if (result.a.score !== result.b.score) {
    winner = result.a.score > result.b.score ? 'a' : 'b';
    verdict = `${winner === 'a' ? 'Pemain 1' : 'Pemain 2'} Unggul`;
    note = `Selisih ${Math.abs(result.a.score - result.b.score)} poin`;
  } else if (sa.avgMs > 0 && sb.avgMs > 0 && Math.abs(sa.avgMs - sb.avgMs) > 50) {
    const faster = sa.avgMs < sb.avgMs ? 'Pemain 1' : 'Pemain 2';
    note = `Skor sama, ${faster} lebih cepat menjawab`;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 md:p-10 relative overflow-hidden bg-slate-50/70">
      {/* Calm & Professional Background Ambient */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-gradient-to-tr from-indigo-100/40 via-slate-100/30 to-blue-100/40 blur-[140px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[1380px] relative z-10 my-auto"
      >
        {/* Header Utama */}
        <div className="text-center mb-8 md:mb-10">
          <p className="text-xs font-extrabold tracking-widest text-slate-400 uppercase mb-1.5">Pertandingan Selesai</p>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3.5">Papan Skor Duel</h1>
          <span className="inline-flex items-center gap-2.5 px-4.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs text-xs font-extrabold text-indigo-600">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            {verdict}
          </span>
          {note && <p className="text-xs text-slate-500 font-bold mt-2.5">{note}</p>}
        </div>

        {/* Dua Kolom Pemain */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
          <PlayerColumn label="Pemain 1" data={result.a} stats={sa} highlighted={winner === 'a'} delay={0.1} />
          <PlayerColumn label="Pemain 2" data={result.b} stats={sb} highlighted={winner === 'b'} delay={0.2} />
        </div>

        {/* Perbandingan Langsung */}
        {/* <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-8 mb-8 shadow-xs">
          <p className="text-center text-xs font-black tracking-widest text-slate-400 uppercase mb-6">
            Perbandingan Langsung
          </p>
          <div className="flex flex-col gap-5">
            <CompareRow label="Skor" a={result.a.score} b={result.b.score} aText={`${result.a.score}`} bText={`${result.b.score}`} higherIsBetter delay={0.5} />
            <CompareRow label="Ketepatan" a={sa.accuracy} b={sb.accuracy} aText={`${sa.accuracy}%`} bText={`${sb.accuracy}%`} higherIsBetter delay={0.6} />
            <CompareRow label="Rata-rata Jawab" a={sa.avgMs} b={sb.avgMs} aText={`${formatSeconds(sa.avgMs)} dtk`} bText={`${formatSeconds(sb.avgMs)} dtk`} higherIsBetter={false} delay={0.7} />
            <CompareRow label="Jawaban Tercepat" a={sa.fastestMs} b={sb.fastestMs} aText={`${formatSeconds(sa.fastestMs)} dtk`} bText={`${formatSeconds(sb.fastestMs)} dtk`} higherIsBetter={false} delay={0.8} />
          </div>
        </div> */}

        {/* Tombol Kembali */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-base py-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <BackHomeIcon className="w-5 h-5 text-white/80" />
          <span>Kembali ke Menu Utama</span>
        </motion.button>
      </motion.div>
    </div>
  );
}