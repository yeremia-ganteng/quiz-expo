import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const questions = await prisma.question.findMany({ orderBy: [{ category: 'asc' }, { order: 'asc' }] });
  return NextResponse.json(questions);
}

export async function POST(req: Request) {
  const body = await req.json();
  const question = await prisma.question.create({
    data: {
      category: body.category,
      text: body.text,
      options: JSON.stringify(body.options),
      correctOption: body.correctOption,
      order: body.order,
    },
  });
  return NextResponse.json(question);
}