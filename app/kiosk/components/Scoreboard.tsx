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

function ScoreRing({ score, total, size = 200 }: { score: number; total: number; size?: number }) {
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? score / total : 0;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#0f172a"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - ratio) }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-6xl font-extrabold text-slate-900 leading-none">
          <CountUp value={score} />
        </span>
        <span className="text-sm text-gray-400 mt-2">dari {total} soal</span>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  unit,
  delay = 0,
}: {
  label: string;
  value: string | number;
  unit: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white border border-gray-200 rounded-2xl p-4.5 flex flex-col justify-center shadow-xs"
    >
      <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-slate-900 leading-none">
        {value}
        <span className="text-xs font-semibold text-gray-400 ml-1">{unit}</span>
      </p>
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
    <div className={`grid gap-3 w-full h-full ${columns.length > 1 && !compact ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {columns.map((column, colIndex) => (
        <div key={colIndex} className="flex flex-col justify-between min-w-0 h-full gap-3">
          {column.map((h, i) => {
            const globalIndex = colIndex * 5 + i;
            return (
              <motion.div
                key={`${h.questionId}-${globalIndex}`}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + globalIndex * 0.03, duration: 0.3, ease: 'easeOut' }}
                className={`flex-1 bg-white border-2 rounded-xl flex items-center gap-3 px-3.5 py-2.5 min-w-0 ${
                  h.isCorrect ? 'border-emerald-200' : 'border-red-200'
                }`}
              >
                {/* Nomor Soal */}
                <div
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    h.isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {globalIndex + 1}
                </div>

                {/* Teks Pertanyaan & Jawaban */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="font-semibold text-slate-900 text-xs leading-tight truncate">
                    {h.text}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">
                    Dipilih:{' '}
                    <span className={`font-semibold ${h.isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
                      {h.selectedOption ?? 'Tidak dijawab'}
                    </span>
                    {!h.isCorrect && h.correctOption && (
                      <>
                        {' '}· Benar:{' '}
                        <span className="font-semibold text-emerald-700">{h.correctOption}</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Status Tepat / Keliru & Waktu */}
                <div className="shrink-0 text-right flex flex-col items-end justify-center">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full leading-none ${
                      h.isCorrect ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'
                    }`}
                  >
                    {h.isCorrect ? 'Tepat' : 'Keliru'}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1 leading-none">{formatSeconds(h.responseTimeMs)} dtk</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function SoloScoreboard({ data, onBack }: { data: ScoreData; onBack: () => void }) {
  const stats = computeStats(data);

  return (
    <div className="flex-1 flex flex-col min-h-screen justify-center bg-slate-50/50 py-8">
      {/* Header Utama */}
      <div className="max-w-7xl w-full mx-auto px-8 mb-6 shrink-0 text-center">
        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Kuis Selesai</p>
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Papan Skor</h2>
        <span className="inline-block text-xs font-semibold text-slate-600 bg-white border border-gray-200 px-3.5 py-1 rounded-full">
          {data.category}
        </span>
      </div>

      {/* Container Utama Konten */}
      <div className="max-w-7xl w-full mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full items-stretch">
          {/* Sisi Kiri: Ringkasan Skor & Statistik */}
          <div className="lg:col-span-2 flex flex-col justify-between gap-3.5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col items-center shadow-xs shrink-0"
            >
              <ScoreRing score={data.score} total={data.total} size={160} />
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mt-4 mb-0.5">Predikat</p>
              <p className="text-xl font-extrabold text-slate-900">{getPredicate(stats.accuracy)}</p>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 shrink-0">
              <StatTile label="Ketepatan" value={stats.accuracy} unit="%" delay={0.3} />
              <StatTile label="Rata-rata Jawab" value={formatSeconds(stats.avgMs)} unit="detik" delay={0.4} />
              <StatTile label="Tercepat" value={formatSeconds(stats.fastestMs)} unit="detik" delay={0.5} />
              <StatTile label="Total Waktu" value={formatSeconds(stats.totalMs)} unit="detik" delay={0.6} />
            </div>

            <button
              onClick={onBack}
              className="w-full px-6 py-3.5 bg-slate-900 text-white text-base font-semibold rounded-xl hover:bg-slate-800 transition shrink-0"
            >
              Kembali ke Menu Utama
            </button>
          </div>

          {/* Sisi Kanan: Rincian Jawaban */}
          <div className="lg:col-span-3 flex flex-col h-full">
            <p className="text-xs font-bold text-gray-700 mb-2 shrink-0">Rincian Jawaban</p>
            <div className="flex-1 w-full">
              <ReviewList history={data.history} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerCard({
  label,
  data,
  accuracy,
  highlighted,
  delay,
}: {
  label: string;
  data: ScoreData;
  accuracy: number;
  highlighted: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className={`flex-1 bg-white border-2 rounded-3xl p-6 flex flex-col items-center ${
        highlighted ? 'border-slate-900 shadow-lg' : 'border-gray-200 shadow-sm'
      }`}
    >
      {highlighted && (
        <span className="text-xs font-bold text-white bg-slate-900 px-3 py-1 rounded-full mb-3">Unggul</span>
      )}
      <p className="text-xl font-extrabold text-slate-900 tracking-tight">{label}</p>
      <p className="text-xs text-gray-400 mb-4">{data.category}</p>
      <ScoreRing score={data.score} total={data.total} size={150} />
      <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mt-4 mb-1">Predikat</p>
      <p className="text-lg font-extrabold text-slate-900">{getPredicate(accuracy)}</p>
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
        <span className={`w-20 text-right text-lg font-extrabold ${leader === 'a' ? 'text-slate-900' : 'text-gray-400'}`}>
          {aText}
        </span>
        <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden flex justify-end">
          <motion.div
            className={`h-full rounded-full ${leader === 'a' ? 'bg-slate-900' : 'bg-slate-300'}`}
            initial={{ width: 0 }}
            animate={{ width: `${shareA * 100}%` }}
            transition={{ duration: 1, delay, ease: 'easeOut' }}
          />
        </div>
      </div>

      <span className="w-36 text-center text-xs font-bold tracking-widest text-gray-400 uppercase">{label}</span>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${leader === 'b' ? 'bg-slate-900' : 'bg-slate-300'}`}
            initial={{ width: 0 }}
            animate={{ width: `${shareB * 100}%` }}
            transition={{ duration: 1, delay, ease: 'easeOut' }}
          />
        </div>
        <span className={`w-20 text-left text-lg font-extrabold ${leader === 'b' ? 'text-slate-900' : 'text-gray-400'}`}>
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
    <div className="flex-1 bg-slate-50/50 min-h-screen">
      <div className="max-w-6xl mx-auto px-10 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Pertandingan Selesai</p>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Papan Skor</h2>
          <span className="inline-block text-sm font-bold text-white bg-slate-900 px-6 py-2 rounded-full">
            {verdict}
          </span>
          {note && <p className="text-xs text-gray-500 mt-2">{note}</p>}
        </motion.div>

        <div className="flex items-stretch gap-6 mb-8">
          <PlayerCard label="Pemain 1" data={result.a} accuracy={sa.accuracy} highlighted={winner === 'a'} delay={0.1} />
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-xs flex items-center justify-center">
              <span className="text-xs font-extrabold italic tracking-widest text-slate-400">VS</span>
            </div>
          </div>
          <PlayerCard label="Pemain 2" data={result.b} accuracy={sb.accuracy} highlighted={winner === 'b'} delay={0.2} />
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 mb-8 shadow-xs">
          <p className="text-center text-xs font-bold tracking-widest text-gray-400 uppercase mb-6">
            Perbandingan Langsung
          </p>
          <div className="flex flex-col gap-5">
            <CompareRow label="Skor" a={result.a.score} b={result.b.score} aText={`${result.a.score}`} bText={`${result.b.score}`} higherIsBetter delay={0.5} />
            <CompareRow label="Ketepatan" a={sa.accuracy} b={sb.accuracy} aText={`${sa.accuracy}%`} bText={`${sb.accuracy}%`} higherIsBetter delay={0.6} />
            <CompareRow label="Rata-rata Jawab" a={sa.avgMs} b={sb.avgMs} aText={`${formatSeconds(sa.avgMs)} dtk`} bText={`${formatSeconds(sb.avgMs)} dtk`} higherIsBetter={false} delay={0.7} />
            <CompareRow label="Jawaban Tercepat" a={sa.fastestMs} b={sb.fastestMs} aText={`${formatSeconds(sa.fastestMs)} dtk`} bText={`${formatSeconds(sb.fastestMs)} dtk`} higherIsBetter={false} delay={0.8} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold text-gray-700 mb-3">Rincian Pemain 1</p>
            <ReviewList history={result.a.history} compact />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-700 mb-3">Rincian Pemain 2</p>
            <ReviewList history={result.b.history} compact />
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={onBack}
            className="px-8 py-3.5 bg-slate-900 text-white text-base font-semibold rounded-xl hover:bg-slate-800 transition"
          >
            Kembali ke Menu Utama
          </button>
        </div>
      </div>
    </div>
  );
}