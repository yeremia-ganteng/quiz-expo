'use client';

import { useCallback, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { socket } from '@/lib/socket';

type Participant = {
  id: string;
  category: string;
  score: number;
  totalQuestions: number;
  avgResponseSeconds: number;
  totalTimeSeconds: number;
  finishedAt: string;
};

const CATEGORY_COLOR: Record<string, string> = {
  'Literasi Digital': 'text-blue-600 bg-blue-50',
  'Pengetahuan Umum': 'text-amber-600 bg-amber-50',
  'Teknologi & AI': 'text-emerald-600 bg-emerald-50',
};

export default function DashboardPage() {
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [answerCounts, setAnswerCounts] = useState<{ label: string; benar: number; salah: number }[]>([]);

  const processAggregates = useCallback((
    aggregates: { questionId: string; isCorrect: boolean; _count: number }[]
  ) => {
    const grouped: Record<string, { benar: number; salah: number }> = {};
    aggregates.forEach((row) => {
      const key = row.questionId;
      if (!grouped[key]) grouped[key] = { benar: 0, salah: 0 };
      if (row.isCorrect) grouped[key].benar += row._count;
      else grouped[key].salah += row._count;
    });

    setAnswerCounts(
      Object.entries(grouped).map(([, counts], idx) => ({
        label: `Soal ${idx + 1}`,
        ...counts,
      }))
    );
  }, []);

  const loadStats = useCallback(() => {
    fetch('/api/admin/dashboard-stats')
      .then((res) => res.json())
      .then((data) => {
        setTotalParticipants(data.totalParticipants);
        setParticipants(data.participants);
        processAggregates(data.aggregates);
      });
  }, [processAggregates]);

  useEffect(() => {
    loadStats();
    socket.connect();

    socket.on('dashboard:finished', loadStats);
    socket.on('dashboard:update', loadStats);

    return () => {
      socket.off('dashboard:finished', loadStats);
      socket.off('dashboard:update', loadStats);
      socket.disconnect();
    };
  }, [loadStats]);

  const totalJawaban = answerCounts.reduce((sum, q) => sum + q.benar + q.salah, 0);
  const totalBenar = answerCounts.reduce((sum, q) => sum + q.benar, 0);
  const akurasi = totalJawaban > 0 ? Math.round((totalBenar / totalJawaban) * 100) : 0;
  const avgAllResponse = participants.length > 0
    ? Math.round((participants.reduce((sum, p) => sum + p.avgResponseSeconds, 0) / participants.length) * 10) / 10
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10 print:hidden">
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
              Pemantauan Langsung — Khusus Admin
            </p>
            <h1 className="text-3xl font-extrabold text-slate-900">Dashboard Hasil Kuis Interaktif</h1>
          </div>
          <button
            onClick={() => window.print()}
            className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-full transition"
          >
            Cetak Laporan
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Peserta Selesai" value={totalParticipants} accent="text-slate-900" />
          <StatCard label="Tingkat Akurasi" value={`${akurasi}%`} accent="text-emerald-600" />
          <StatCard label="Rata-rata Waktu Jawab" value={`${avgAllResponse}s`} accent="text-blue-600" />
          <StatCard label="Peserta Ditampilkan" value={participants.length} accent="text-slate-900" />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-8 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-700 mb-1">Skor Peserta Terbaru</p>
            <p className="text-xs text-gray-400">Diurutkan dari yang paling baru menyelesaikan kuis</p>
          </div>

          {participants.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-gray-300 text-sm">
              Belum ada peserta yang menyelesaikan kuis
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <th className="px-8 py-3">Tema</th>
                  <th className="px-4 py-3">Skor</th>
                  <th className="px-4 py-3">Rata-rata Jawab</th>
                  <th className="px-4 py-3">Total Waktu</th>
                  <th className="px-8 py-3">Selesai</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-8 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLOR[p.category] ?? 'text-gray-600 bg-gray-50'}`}>
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-900">{p.score}</span>
                      <span className="text-gray-400"> / {p.totalQuestions}</span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-700">{p.avgResponseSeconds}s</td>
                    <td className="px-4 py-3.5 text-gray-700">{p.totalTimeSeconds}s</td>
                    <td className="px-8 py-3.5 text-gray-400 text-xs">
                      {new Date(p.finishedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <p className="text-sm font-bold text-gray-700 mb-1">Jawaban Benar vs Salah per Soal</p>
          <p className="text-xs text-gray-400 mb-6">Diperbarui otomatis setiap ada peserta menjawab</p>
          {answerCounts.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-gray-300 text-sm">
              Belum ada data jawaban masuk
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={answerCounts}>
                <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }} />
                <Bar dataKey="benar" name="Benar" fill="#0f172a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="salah" name="Salah" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-3xl font-extrabold ${accent}`}>{value}</p>
    </div>
  );
}