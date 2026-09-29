import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const totalParticipants = await prisma.participant.count({
    where: { finishedAt: { not: null } },
  });

  const latestParticipant = await prisma.participant.findFirst({
    where: { finishedAt: { not: null } },
    orderBy: { finishedAt: 'desc' },
  });

  const aggregates = await prisma.response.groupBy({
    by: ['questionId', 'isCorrect'],
    _count: true,
  });

  // Rata-rata waktu jawab per soal
  const avgTimeRaw = await prisma.response.groupBy({
    by: ['questionId'],
    _avg: { responseTimeMs: true },
  });
  const questions = await prisma.question.findMany({ orderBy: { order: 'asc' } });
  const avgTimePerQuestion = avgTimeRaw.map((row) => {
    const q = questions.find((q) => q.id === row.questionId);
    return {
      questionText: q?.text ?? 'Soal tidak diketahui',
      category: q?.category ?? '-',
      avgSeconds: Math.round((row._avg.responseTimeMs ?? 0) / 100) / 10,
    };
  });

  // Popularitas tema (dihitung dari jumlah Response per kategori soal)
  const categoryCounts: Record<string, number> = {};
  aggregates.forEach((row) => {
    const q = questions.find((q) => q.id === row.questionId);
    if (!q) return;
    categoryCounts[q.category] = (categoryCounts[q.category] ?? 0) + row._count;
  });
  const categoryPopularity = Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    count,
  }));

  // Tren partisipasi per jam
  const allParticipants = await prisma.participant.findMany({
    where: { finishedAt: { not: null } },
    select: { finishedAt: true },
  });
  const hourCounts: Record<string, number> = {};
  allParticipants.forEach((p) => {
    if (!p.finishedAt) return;
    const hour = new Date(p.finishedAt).getHours();
    const label = `${hour.toString().padStart(2, '0')}:00`;
    hourCounts[label] = (hourCounts[label] ?? 0) + 1;
  });
  const participationByHour = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  return NextResponse.json({
    totalParticipants,
    recentScore: latestParticipant?.score ?? null,
    aggregates,
    avgTimePerQuestion,
    categoryPopularity,
    participationByHour,
  });
}