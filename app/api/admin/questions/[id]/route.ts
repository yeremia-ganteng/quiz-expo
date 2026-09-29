import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const question = await prisma.question.update({
    where: { id },
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.response.deleteMany({ where: { questionId: id } });
  await prisma.question.delete({ where: { id } });
  return NextResponse.json({ success: true });
}