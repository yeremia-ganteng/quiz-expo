import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const totalParticipants = await prisma.participant.count({
    where: { finishedAt: { not: null } },
  });

  const aggregates = await prisma.response.groupBy({
    by: ['questionId', 'isCorrect'],
    _count: true,
  });

  const recentParticipants = await prisma.participant.findMany({
    where: { finishedAt: { not: null } },
    orderBy: { finishedAt: 'desc' },
    take: 25,
    include: {
      responses: {
        include: { question: true },
      },
    },
  });

  const participants = recentParticipants.map((p) => {
    const totalQuestions = p.responses.length;
    const totalTimeMs = p.responses.reduce((sum, r) => sum + r.responseTimeMs, 0);
    const avgResponseSeconds = totalQuestions > 0
      ? Math.round((totalTimeMs / totalQuestions) / 100) / 10
      : 0;
    const totalTimeSeconds = Math.round(totalTimeMs / 100) / 10;
    const category = p.responses[0]?.question.category ?? '-';

    return {
      id: p.id,
      category,
      score: p.score,
      totalQuestions,
      avgResponseSeconds,
      totalTimeSeconds,
      finishedAt: p.finishedAt,
    };
  });

  return NextResponse.json({ totalParticipants, aggregates, participants });
}