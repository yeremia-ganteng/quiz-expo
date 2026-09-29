import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const questions = await prisma.question.findMany({
    orderBy: { order: 'asc' },
    select: {
      id: true,
      category: true,
      text: true,
      options: true,
      // correctOption DIBUANG dari select agar kunci jawaban tidak bocor!
    },
  });

  const formatted = questions.map((q) => ({
    id: q.id,
    category: q.category,
    text: q.text,
    options: JSON.parse(q.options) as string[],
  }));

  return NextResponse.json(formatted);
}