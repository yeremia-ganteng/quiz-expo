'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import { useMachine } from '@xstate/react';
import type { StateFrom } from 'xstate';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { quizMachine, type QuestionData } from '@/machines/quizMachine';
import { SoloScoreboard, DuelScoreboard, type DuelData } from './components/Scoreboard';
import { TechAIIcon, GeneralKnowledgeIcon, DigitalLiteracyIcon } from './components/CategoryIcons';
import { SoloModeIcon, VersusModeIcon } from './components/ModeIcons';
import { socket } from '@/lib/socket';

interface CategoryMetaItem {
  modul: string;
  iconBg: string;
  color: string;
  ring: string;
  description: string;
  icon: ReactNode;
}

const CATEGORY_META: Record<string, CategoryMetaItem> = {
  'Teknologi & AI': {
    modul: 'Modul 01',
    iconBg: 'bg-slate-100',
    color: 'text-slate-800',
    ring: 'ring-slate-900',
    description: 'Fondasi komputasi masa depan dan etika kecerdasan artifisial.',
    icon: <TechAIIcon className="w-6 h-6" />,
  },
  'Pengetahuan Umum': {
    modul: 'Modul 02',
    iconBg: 'bg-slate-100',
    color: 'text-slate-800',
    ring: 'ring-slate-900',
    description: 'Wawasan sains, sejarah global, dan geografi nusantara.',
    icon: <GeneralKnowledgeIcon className="w-6 h-6" />,
  },
  'Literasi Digital': {
    modul: 'Modul 03',
    iconBg: 'bg-slate-100',
    color: 'text-slate-800',
    ring: 'ring-slate-900',
    description: 'Keamanan siber, privasi data, dan etika informasi digital kampus.',
    icon: <DigitalLiteracyIcon className="w-6 h-6" />,
  },
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

type QuizState = StateFrom<typeof quizMachine>;
type UiPhase = 'landing' | 'modeSelect' | 'playing';
type Mode = 'single' | 'multiplayer' | null;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuizSet(all: QuestionData[], category: string): QuestionData[] {
  const filtered = all.filter((q) => q.category === category);
  const picked = shuffleArray(filtered).slice(0, 10);
  return picked.map((q) => ({ ...q, options: shuffleArray(q.options) }));
}

export default function KioskPage() {
  const [stateA, sendA] = useMachine(quizMachine);
  const [stateB, sendB] = useMachine(quizMachine);
  const [allQuestions, setAllQuestions] = useState<QuestionData[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [totalParticipants, setTotalParticipants] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [uiPhase, setUiPhase] = useState<UiPhase>('landing');
  const [mode, setMode] = useState<Mode>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const startTimeA = useRef(0);
  const startTimeB = useRef(0);
  const countdownRunning = useRef(false);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);
  const tapCountRef = useRef(0);
  const isStarting = useRef(false);

  useEffect(() => {
    fetch('/api/questions').then((res) => res.json()).then(setAllQuestions);
    fetch('/api/stats').then((res) => res.json()).then((data) => setTotalParticipants(data.totalParticipants));
    socket.connect();

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('dashboard:finished', (data: { totalParticipants: number }) => {
      setTotalParticipants(data.totalParticipants);
    });

    const goFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    };
    document.addEventListener('click', goFullscreen, { once: true });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('dashboard:finished');
      socket.disconnect();
      document.removeEventListener('click', goFullscreen);
    };
  }, []);

  const categories = Array.from(new Set(allQuestions.map((q) => q.category)));

  const bothStillSelecting =
    !(stateA.matches('question') || stateA.matches('feedback') || stateA.matches('results')) &&
    !(stateB.matches('question') || stateB.matches('feedback') || stateB.matches('results'));

  useEffect(() => {
    if (categories.length === 0) return;
    const interval = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % categories.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [categories.length]);

  const resetToLanding = useCallback(() => {
    sendA({ type: 'RESET' });
    sendB({ type: 'RESET' });
    setCountdown(null);
    countdownRunning.current = false;
    setUiPhase('landing');
    setMode(null);
    isStarting.current = false;
  }, [sendA, sendB]);

  useEffect(() => {
    if (mode !== 'multiplayer') return;
    const bothReady = stateA.matches('ready') && stateB.matches('ready');
    if (bothReady && !countdownRunning.current) {
      countdownRunning.current = true;
      let n = 3;
      setCountdown(n);
      const interval = setInterval(() => {
        n -= 1;
        if (n === 0) {
          clearInterval(interval);
          setCountdown(null);
          sendA({ type: 'GO' });
          sendB({ type: 'GO' });
          countdownRunning.current = false;
        } else {
          setCountdown(n);
        }
      }, 900);
    }
  }, [mode, stateA, stateB, sendA, sendB]);

  useEffect(() => {
    if (stateA.matches('question')) startTimeA.current = performance.now();
    if (stateA.matches('results')) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { x: mode === 'multiplayer' ? 0.25 : 0.5, y: 0.6 },
        colors: ['#0f172a', '#3b82f6', '#10b981'],
      });
      socket.emit('quiz:finish', { participantId: stateA.context.participantId, score: stateA.context.score });
    }
  }, [stateA, mode]);

  useEffect(() => {
    if (mode !== 'multiplayer') return;
    if (stateB.matches('question')) startTimeB.current = performance.now();
    if (stateB.matches('results')) {
      confetti({ particleCount: 150, spread: 80, origin: { x: 0.75, y: 0.6 }, colors: ['#0f172a', '#3b82f6', '#10b981'] });
      socket.emit('quiz:finish', { participantId: stateB.context.participantId, score: stateB.context.score });
    }
  }, [stateB, mode]);

  const duelResult: DuelData | null =
    mode === 'multiplayer' && stateA.matches('results') && stateB.matches('results')
      ? {
          a: {
            category: stateA.context.category,
            score: stateA.context.score,
            total: stateA.context.questions.length,
            history: stateA.context.history,
          },
          b: {
            category: stateB.context.category,
            score: stateB.context.score,
            total: stateB.context.questions.length,
            history: stateB.context.history,
          },
        }
      : null;

  const handleAdminTap = () => {
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapCountRef.current += 1;
    if (tapCountRef.current >= 5) {
      resetToLanding();
      tapCountRef.current = 0;
    }
    tapTimer.current = setTimeout(() => { tapCountRef.current = 0; }, 1500);
  };

  const handleTapLanding = () => setUiPhase('modeSelect');

  const handleChooseMode = (m: 'single' | 'multiplayer') => {
    if (isStarting.current) return;
    if (!socket.connected) {
      alert('Koneksi belum tersambung. Mohon tunggu sebentar lalu coba lagi.');
      return;
    }
    isStarting.current = true;
    setMode(m);

    if (m === 'single') {
      socket.emit('quiz:start', (res: { participantId: string }) => {
        sendA({ type: 'START', participantId: res.participantId });
        setUiPhase('playing');
        isStarting.current = false;
      });
      return;
    }

    const ids: string[] = [];
    const onAck = (res: { participantId: string }) => {
      ids.push(res.participantId);
      if (ids.length === 2) {
        sendA({ type: 'START', participantId: ids[0] });
        sendB({ type: 'START', participantId: ids[1] });
        setUiPhase('playing');
        isStarting.current = false;
      }
    };
    socket.emit('quiz:start', onAck);
    socket.emit('quiz:start', onAck);
  };

  const handleChooseCategory = (send: typeof sendA, category: string, autoStart = false) => {
    const quizSet = buildQuizSet(allQuestions, category);
    send({ type: 'CHOOSE_CATEGORY', category, questions: quizSet });
    if (autoStart) send({ type: 'GO' });
  };

  const handleAnswer = (
    send: typeof sendA,
    state: QuizState,
    startTimeRef: React.MutableRefObject<number>,
    option: string
  ) => {
    if (!socket.connected) {
      alert('Koneksi terputus. Mohon tunggu sampai tersambung kembali sebelum menjawab.');
      return;
    }
    const currentQuestion = state.context.questions[state.context.currentIndex];
    const responseTimeMs = performance.now() - startTimeRef.current;

    socket.emit(
      'quiz:answer',
      {
        participantId: state.context.participantId,
        questionId: currentQuestion.id,
        answer: option,
        responseTimeMs,
      },
      (res?: { isCorrect: boolean; correctOption: string }) => {
        send({
          type: 'ANSWER',
          option,
          responseTimeMs,
          isCorrect: res?.isCorrect,
          correctOption: res?.correctOption,
        });
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden select-none">
      <AnimatePresence>
        {!isConnected && (
          <motion.div
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            exit={{ y: -60 }}
            className="fixed top-0 left-0 w-full bg-red-600 text-white text-sm font-semibold py-3 text-center z-50 shadow-lg"
          >
            Koneksi terputus — jawaban tidak tersimpan sementara. Menghubungkan ulang...
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-40"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={countdown}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-white text-9xl font-extrabold tracking-tight"
              >
                {countdown}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LANDING */}
      {uiPhase === 'landing' && (
        <div className="flex-1 flex items-center justify-center p-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <p className="text-lg font-bold tracking-widest text-gray-400 uppercase mb-5">
              Evaluasi Mandiri &amp; Wawasan
            </p>
            <h1 className="text-8xl font-extrabold text-slate-900 tracking-tight mb-6">
              Kuis Interaktif Kampus
            </h1>
            <p className="text-2xl text-gray-500 mb-10 max-w-2xl mx-auto">
              Sentuh layar untuk memulai dan uji wawasanmu.
            </p>

            {totalParticipants !== null && totalParticipants > 0 && (
              <p className="text-xl text-slate-600 font-semibold mb-10">
                {totalParticipants} peserta sudah mencoba hari ini
              </p>
            )}

            {categories.length > 0 && (
              <div className="h-16 mb-12 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={categories[previewIndex]}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                    className={`text-xl font-semibold px-8 py-3 rounded-full ${
                      CATEGORY_META[categories[previewIndex]]?.iconBg ?? 'bg-gray-50'
                    } ${CATEGORY_META[categories[previewIndex]]?.color ?? 'text-gray-600'}`}
                  >
                    Coba tema: {categories[previewIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleTapLanding}
              disabled={allQuestions.length === 0}
              className="px-20 py-7 bg-slate-900 text-white text-3xl font-semibold rounded-2xl hover:bg-slate-800 transition disabled:opacity-40 shadow-xl"
            >
              Tap untuk mulai
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* MODE SELECT */}
      {uiPhase === 'modeSelect' && (
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center w-full max-w-3xl">
            <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">
              Evaluasi Mandiri &amp; Wawasan
            </p>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Pilih Mode Bermain</h2>
            <p className="text-slate-500 text-base mb-10 max-w-xl mx-auto">
              Sentuh salah satu mode di bawah untuk melanjutkan ke pilihan tema.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* MODE 01 - 1 PEMAIN */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200/90 rounded-2xl p-8 flex flex-col shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[11px] font-bold tracking-wider text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-md uppercase">
                    MODE 01
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    Untuk 1 orang
                  </span>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-slate-100/80 border border-slate-200/80 flex items-center justify-center mb-6 shadow-xs">
                  <SoloModeIcon className="w-8 h-8 text-slate-800" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-2">1 Pemain</h3>
                <p className="text-slate-500 text-sm leading-relaxed flex-1 mb-8">
                  Uji wawasanmu sendiri, kapan saja siap, tanpa menunggu siapa pun.
                </p>

                <div className="pt-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChooseMode('single')}
                    className="w-full flex items-center justify-between bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-6 py-4 rounded-xl transition"
                  >
                    <span>Pilih Mode Ini</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </motion.button>
                </div>
              </motion.div>

              {/* MODE 02 - 2 PEMAIN */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="bg-white border border-slate-200/90 rounded-2xl p-8 flex flex-col shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[11px] font-bold tracking-wider text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-md uppercase">
                    MODE 02
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    Untuk 2 orang
                  </span>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-slate-100/80 border border-slate-200/80 flex items-center justify-center mb-6 shadow-xs">
                  <VersusModeIcon className="w-8 h-8 text-slate-800" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-2">2 Pemain</h3>
                <p className="text-slate-500 text-sm leading-relaxed flex-1 mb-8">
                  Tanding bersama teman, pilih tema masing-masing, mulai serentak.
                </p>

                <div className="pt-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChooseMode('multiplayer')}
                    className="w-full flex items-center justify-between bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-6 py-4 rounded-xl transition"
                  >
                    <span>Pilih Mode Ini</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            </div>

            <p className="text-xs text-slate-400 mt-8">
              Ketuk kartu mode untuk melanjutkan ke pilihan tema
            </p>
          </motion.div>
        </div>
      )}

      {/* PLAYING - SINGLE */}
      {uiPhase === 'playing' && mode === 'single' && (
        stateA.matches('results') ? (
          <SoloScoreboard
            data={{
              category: stateA.context.category,
              score: stateA.context.score,
              total: stateA.context.questions.length,
              history: stateA.context.history,
            }}
            onBack={resetToLanding}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <QuizPanel
              size="full"
              state={stateA}
              categories={categories}
              allQuestions={allQuestions}
              onChooseCategory={(cat) => handleChooseCategory(sendA, cat, true)}
              onAnswer={(opt) => handleAnswer(sendA, stateA, startTimeA, opt)}
            />
          </div>
        )
      )}

      {/* PLAYING - MULTIPLAYER: pilih tema */}
      {uiPhase === 'playing' && mode === 'multiplayer' && bothStillSelecting && (
        <DuelCategorySelect
          stateA={stateA}
          stateB={stateB}
          categories={categories}
          allQuestions={allQuestions}
          onChooseCategoryA={(cat) => handleChooseCategory(sendA, cat)}
          onChooseCategoryB={(cat) => handleChooseCategory(sendB, cat)}
        />
      )}

      {/* PLAYING - MULTIPLAYER: sedang bertanding atau papan skor */}
      {uiPhase === 'playing' && mode === 'multiplayer' && !bothStillSelecting && (
        duelResult ? (
          <DuelScoreboard result={duelResult} onBack={resetToLanding} />
        ) : (
          <div className="flex-1 flex">
            <div className="flex-1 border-r border-gray-200 flex items-center justify-center p-6 relative">
              <PanelBadge label="Pemain 1" />
              <QuizPanel
                size="compact"
                state={stateA}
                categories={categories}
                allQuestions={allQuestions}
                onChooseCategory={(cat) => handleChooseCategory(sendA, cat)}
                onAnswer={(opt) => handleAnswer(sendA, stateA, startTimeA, opt)}
              />
            </div>
            <div className="flex-1 flex items-center justify-center p-6 relative">
              <PanelBadge label="Pemain 2" />
              <QuizPanel
                size="compact"
                state={stateB}
                categories={categories}
                allQuestions={allQuestions}
                onChooseCategory={(cat) => handleChooseCategory(sendB, cat)}
                onAnswer={(opt) => handleAnswer(sendB, stateB, startTimeB, opt)}
              />
            </div>
          </div>
        )
      )}

      <div
        onClick={handleAdminTap}
        className="fixed bottom-0 right-0 w-16 h-16 z-20"
        aria-hidden="true"
      />
    </div>
  );
}

function PanelBadge({ label }: { label: string }) {
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-slate-900" />
      <span className="text-sm font-extrabold tracking-widest text-slate-700 uppercase">
        {label}
      </span>
    </div>
  );
}

function DuelCategorySelect({
  stateA,
  stateB,
  categories,
  allQuestions,
  onChooseCategoryA,
  onChooseCategoryB,
}: {
  stateA: QuizState;
  stateB: QuizState;
  categories: string[];
  allQuestions: QuestionData[];
  onChooseCategoryA: (category: string) => void;
  onChooseCategoryB: (category: string) => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 relative">
      <div className="text-center mb-14">
        <p className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-3">
          Evaluasi Mandiri &amp; Wawasan
        </p>
        <h2 className="text-6xl font-extrabold text-slate-900 mb-4 tracking-tight">Pilih Tema Kuis</h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Tentukan bidang keilmuan pada tiap sisi layar, lalu mulai pertandingan bersama.
        </p>
      </div>

      <div className="relative flex w-full max-w-[1600px] gap-20">
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2" />

        <DuelColumn
          label="Pemain 1"
          state={stateA}
          categories={categories}
          allQuestions={allQuestions}
          onChooseCategory={onChooseCategoryA}
        />
        <DuelColumn
          label="Pemain 2"
          state={stateB}
          categories={categories}
          allQuestions={allQuestions}
          onChooseCategory={onChooseCategoryB}
        />
      </div>

      <div className="hidden md:flex fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center z-30">
        <span className="text-lg font-extrabold italic tracking-widest text-slate-400">VS</span>
      </div>
    </div>
  );
}

function DuelColumn({
  label,
  state,
  categories,
  allQuestions,
  onChooseCategory,
}: {
  label: string;
  state: QuizState;
  categories: string[];
  allQuestions: QuestionData[];
  onChooseCategory: (category: string) => void;
}) {
  const hasSelected = state.matches('ready');

  return (
    <div className="flex-1 flex flex-col gap-5">
      <div className="text-center mb-1">
        <h3 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">{label}</h3>
        <span
          className={`inline-block text-sm font-semibold px-4 py-1.5 rounded-full ${
            hasSelected ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
          }`}
        >
          {hasSelected ? `Tema terpilih: ${state.context.category}` : 'Menunggu Pilihan'}
        </span>
      </div>

      <div className="flex flex-col gap-4 max-h-520px overflow-y-auto pr-1">
        {categories.map((cat) => {
          const m = CATEGORY_META[cat];
          const count = allQuestions.filter((q) => q.category === cat).length;
          const isSelected = state.context.category === cat;

          return (
            <div
              key={cat}
              className={`bg-white border-2 rounded-2xl p-7 flex items-center gap-6 transition-colors ${
                isSelected ? 'border-slate-900' : 'border-gray-200'
              }`}
            >
              <div className={`rounded-xl ${m?.iconBg} ${m?.color} flex items-center justify-center shrink-0 ${isSelected ? 'w-14 h-14' : 'w-12 h-12'}`}>
                {m?.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <p className="text-xl font-bold text-slate-900 tracking-tight">{cat}</p>
                  <span className="text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                    {count} Soal
                  </span>
                </div>
                <p className="text-sm text-gray-400 truncate">{m?.description}</p>
              </div>

              <button
                onClick={() => onChooseCategory(cat)}
                className={`text-sm font-semibold px-7 py-3.5 rounded-xl transition shrink-0 ${
                  isSelected
                    ? 'bg-slate-100 text-slate-900'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isSelected ? 'Terpilih' : 'Pilih Topik'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuizPanel({
  size,
  state,
  categories,
  allQuestions,
  onChooseCategory,
  onAnswer,
}: {
  size: 'full' | 'compact';
  state: QuizState;
  categories: string[];
  allQuestions: QuestionData[];
  onChooseCategory: (category: string) => void;
  onAnswer: (option: string) => void;
}) {
  const isFull = size === 'full';
  const currentQuestion = state.context.questions[state.context.currentIndex];
  const activeCategory = state.context.category;
  const meta = activeCategory ? CATEGORY_META[activeCategory] : null;

  const lastHistoryRecord = state.context.history[state.context.history.length - 1];
  const serverCorrectOption = lastHistoryRecord?.correctOption ?? currentQuestion?.correctOption;

  return (
    <AnimatePresence mode="wait">
      {state.matches('categorySelect') && (
        <motion.div
          key="categorySelect"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={isFull ? 'w-full max-w-3xl text-center' : 'w-full max-w-sm'}
        >
          <p className={`font-bold tracking-widest text-gray-400 uppercase text-center ${isFull ? 'text-sm mb-8' : 'text-xs mb-4'}`}>
            Pilih Tema
          </p>
          <div className={isFull ? 'flex flex-col gap-5 text-left' : 'flex flex-col gap-3'}>
            {categories.map((cat, i) => {
              const m = CATEGORY_META[cat];
              const count = allQuestions.filter((q) => q.category === cat).length;
              return (
                <motion.button
                  key={cat}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onChooseCategory(cat)}
                  className={`bg-white border-2 border-gray-200 hover:border-gray-300 rounded-2xl transition-all text-left flex items-center ${
                    isFull ? 'p-7 gap-6' : 'p-4 gap-3'
                  }`}
                >
                  <div className={`rounded-xl ${m?.iconBg} ${m?.color} flex items-center justify-center shrink-0 ${isFull ? 'w-16 h-16' : 'w-10 h-10'}`}>
                    {m?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`flex items-center gap-3 ${isFull ? 'mb-1.5' : ''}`}>
                      <p className={`font-bold text-slate-900 ${isFull ? 'text-xl' : 'text-sm'}`}>{cat}</p>
                      {isFull && (
                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                          {count} Soal
                        </span>
                      )}
                    </div>
                    <p className={`text-gray-400 ${isFull ? 'text-sm' : 'text-xs truncate'}`}>{m?.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {state.matches('ready') && (
        <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
          <span className={`inline-flex items-center gap-2 text-xs font-bold ${meta?.color} ${meta?.iconBg} px-3 py-1.5 rounded-full mb-6`}>
            {meta?.modul} — {activeCategory}
          </span>
          <div className="flex items-center justify-center gap-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse [animation-delay:0.4s]" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Menyiapkan soal...</p>
        </motion.div>
      )}

      {state.matches('question') && currentQuestion && (
        <motion.div
          key={`q-${state.context.currentIndex}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className={isFull ? 'w-full max-w-2xl' : 'w-full max-w-xl'}
        >
          <div className="flex items-center justify-between gap-3 mb-6">
            <span className={`font-bold ${meta?.color} ${meta?.iconBg} border border-gray-200 rounded-full ${isFull ? 'text-xs px-3.5 py-1.5' : 'text-sm px-4 py-2'}`}>
              {activeCategory}
            </span>
            <span className={`text-gray-400 font-semibold ${isFull ? 'text-xs' : 'text-sm'}`}>
              {state.context.currentIndex + 1} / {state.context.questions.length}
            </span>
          </div>
          <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${isFull ? 'p-8' : 'p-10'}`}>
            <h2 className={`font-bold text-slate-900 leading-snug ${isFull ? 'text-2xl mb-8' : 'text-3xl mb-10'}`}>
              {currentQuestion.text}
            </h2>
            <div className={`flex flex-col ${isFull ? 'gap-3' : 'gap-4'}`}>
              {currentQuestion.options.map((opt, i) => (
                <motion.button
                  key={opt}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onAnswer(opt)}
                  className={`group flex items-center gap-4 bg-gray-50 border-2 border-transparent rounded-xl text-left font-medium text-gray-700 hover:bg-white transition-all hover:${meta?.ring} px-6 py-5 text-lg`}
                >
                  <span className={`shrink-0 rounded-full border-2 border-gray-300 group-hover:${meta?.ring} flex items-center justify-center font-bold text-gray-500 ${
                    isFull ? 'w-9 h-9 text-sm' : 'w-10 h-10 text-base'
                  }`}>
                    {OPTION_LABELS[i]}
                  </span>
                  {opt}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* FEEDBACK - POPUP OVERLAY */}
      {state.matches('feedback') && currentQuestion && (() => {
        const correctOptionIndex = currentQuestion.options.findIndex(
          (opt) => opt === serverCorrectOption
        );
        const correctLabel = correctOptionIndex !== -1 ? OPTION_LABELS[correctOptionIndex] : null;

        return (
          <div className="relative w-full">
            <div className="w-full max-w-2xl mx-auto opacity-30 pointer-events-none transition-opacity duration-300">
              <div className="flex items-center justify-between gap-3 mb-6">
                <span className={`font-bold ${meta?.color} ${meta?.iconBg} border border-gray-200 rounded-full ${isFull ? 'text-xs px-3.5 py-1.5' : 'text-sm px-4 py-2'}`}>
                  {activeCategory}
                </span>
                <span className={`text-gray-400 font-semibold ${isFull ? 'text-xs' : 'text-sm'}`}>
                  {state.context.currentIndex + 1} / {state.context.questions.length}
                </span>
              </div>
              <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${isFull ? 'p-8' : 'p-10'}`}>
                <h2 className={`font-bold text-slate-900 leading-snug ${isFull ? 'text-2xl mb-8' : 'text-3xl mb-10'}`}>
                  {currentQuestion.text}
                </h2>
                <div className={`flex flex-col ${isFull ? 'gap-3' : 'gap-4'}`}>
                  {currentQuestion.options.map((opt, i) => (
                    <div
                      key={opt}
                      className="flex items-center gap-4 bg-gray-50 border-2 border-transparent rounded-xl px-6 py-5 text-lg font-medium text-gray-700"
                    >
                      <span className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-gray-500 text-sm">
                        {OPTION_LABELS[i]}
                      </span>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <motion.div
              key="feedback-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-md backdrop-saturate-150 p-6 will-change-transform"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{
                  duration: 0.25,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`flex flex-col items-center justify-center p-10 md:p-12 rounded-3xl shadow-2xl border text-center max-w-lg w-full bg-white/95 backdrop-blur-xl ${
                  state.context.lastAnswerCorrect
                    ? 'border-emerald-200/80 shadow-emerald-500/15'
                    : 'border-rose-200/80 shadow-rose-500/15'
                }`}
              >
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-md ${
                    state.context.lastAnswerCorrect
                      ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                      : 'bg-rose-500 text-white shadow-rose-500/30'
                  }`}
                >
                  {state.context.lastAnswerCorrect ? (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  )}
                </motion.div>

                <h3
                  className={`text-3xl md:text-4xl font-extrabold tracking-tight mb-2 ${
                    state.context.lastAnswerCorrect ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {state.context.lastAnswerCorrect ? 'BENAR!' : 'KURANG TEPAT!'}
                </h3>

                {!state.context.lastAnswerCorrect && serverCorrectOption && (
                  <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 w-full text-left">
                    <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                      Jawaban Yang Benar:
                    </p>
                    <div className="flex items-center gap-3 bg-emerald-50/80 border border-emerald-200 p-3 rounded-xl">
                      {correctLabel && (
                        <span className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {correctLabel}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-emerald-950 leading-snug">
                        {serverCorrectOption}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        );
      })()}

      {state.matches('results') && (
        <motion.div
          key="results"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-center bg-white border border-gray-200 rounded-2xl shadow-sm ${isFull ? 'px-16 py-14' : 'px-10 py-10'}`}
        >
          <p className="text-gray-400 font-bold tracking-widest uppercase text-xs mb-2">Kuis Selesai</p>
          <p className="text-5xl font-extrabold text-slate-900 mb-1">{state.context.score}</p>
          <p className="text-gray-400 text-sm mb-3">dari {state.context.questions.length}</p>
          <p className="text-gray-500 text-sm">
            {isFull ? 'Terima kasih sudah berpartisipasi' : 'Menunggu pemain lain menyelesaikan kuis...'}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}