import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.response.deleteMany();
  await prisma.participant.deleteMany();
  console.log('Data peserta dan jawaban sudah dihapus. Tabel soal tidak disentuh.');
}

main().finally(() => prisma.$disconnect());