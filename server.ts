import { createServer } from 'http';
import next from 'next';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

let questionsCache: Map<string, string> = new Map();

async function loadQuestionsToCache() {
  const questions = await prisma.question.findMany({
    select: { id: true, correctOption: true },
  });
  questionsCache = new Map(questions.map((q) => [q.id, q.correctOption]));
}

async function enableWALMode() {
  try {
    await prisma.$queryRawUnsafe('PRAGMA journal_mode=WAL;');
    await prisma.$executeRawUnsafe(`PRAGMA synchronous = NORMAL;`);
    console.log('⚡ SQLite WAL mode & Synchronous NORMAL berhasil diaktifkan.');
  } catch (error) {
    console.error('Gagal mengaktifkan mode WAL:', error);
  }
}

app.prepare().then(async () => {
  await enableWALMode();
  await loadQuestionsToCache();

  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // 1. Start Quiz
    socket.on('quiz:start', async (ack?: (res: { participantId: string }) => void) => {
      try {
        const participant = await prisma.participant.create({ data: {} });
        if (typeof ack === 'function') {
          ack({ participantId: participant.id });
        }
        io.emit('dashboard:participant_joined');
      } catch (error) {
        console.error('Error starting quiz:', error);
      }
    });

    // 2. Submit Answer (Validasi Server-Side & Return ACK Feedback)
    socket.on(
      'quiz:answer',
      async (
        data: {
          participantId: string;
          questionId: string;
          answer: string;
          responseTimeMs: number;
        },
        ack?: (res: { isCorrect: boolean; correctOption: string }) => void
      ) => {
        try {
          const correctAnswer = questionsCache.get(data.questionId) || '';
          const isCorrect = correctAnswer ? correctAnswer === data.answer : false;

          await prisma.response.create({
            data: {
              participantId: data.participantId,
              questionId: data.questionId,
              answer: data.answer,
              isCorrect,
              responseTimeMs: data.responseTimeMs,
            },
          });

          // Mengembalikan feedback jawaban benar secara instan ke client
          if (typeof ack === 'function') {
            ack({ isCorrect, correctOption: correctAnswer });
          }

          io.emit('dashboard:update', {
            questionId: data.questionId,
            isCorrect,
          });
        } catch (error) {
          console.error('Error recording answer:', error);
        }
      }
    );

    // 3. Finish Quiz
    socket.on('quiz:finish', async (data: { participantId: string }, ack?: (res: { score: number }) => void) => {
      try {
        const correctCount = await prisma.response.count({
          where: {
            participantId: data.participantId,
            isCorrect: true,
          },
        });

        const finalScore = correctCount * 10;

        await prisma.participant.update({
          where: { id: data.participantId },
          data: { finishedAt: new Date(), score: finalScore },
        });

        const totalFinished = await prisma.participant.count({
          where: { finishedAt: { not: null } },
        });

        if (typeof ack === 'function') {
          ack({ score: finalScore });
        }

        io.emit('dashboard:finished', {
          participantId: data.participantId,
          totalParticipants: totalFinished,
          score: finalScore,
        });
      } catch (error) {
        console.error('Error finishing quiz:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  httpServer.listen(3000, () => {
    console.log('> Server jalan di http://localhost:3000');
  });
});