import { setup, assign } from 'xstate';

export type QuestionData = {
  id: string;
  category: string;
  text: string;
  options: string[];
  correctOption?: string;
};

export type AnswerRecord = {
  questionId: string;
  text: string;
  selectedOption: string | null;
  correctOption?: string;
  isCorrect: boolean;
  responseTimeMs: number;
};

type QuizContext = {
  questions: QuestionData[];
  currentIndex: number;
  score: number;
  lastAnswerCorrect: boolean | null;
  selectedOption: string | null;
  participantId: string | null;
  category: string | null;
  history: AnswerRecord[];
};

type QuizEvent =
  | { type: 'START'; participantId: string }
  | { type: 'CHOOSE_CATEGORY'; category: string; questions: QuestionData[] }
  | { type: 'GO' }
  | {
      type: 'ANSWER';
      option: string;
      responseTimeMs: number;
      isCorrect?: boolean;
      correctOption?: string;
    }
  | { type: 'TIMEOUT' }
  | { type: 'RESET' };

export const quizMachine = setup({
  types: {} as {
    context: QuizContext;
    events: QuizEvent;
  },
  guards: {
    hasMoreQuestions: ({ context }) =>
      context.currentIndex < context.questions.length - 1,
  },
}).createMachine({
  id: 'quiz',
  initial: 'idle',
  context: {
    questions: [],
    currentIndex: 0,
    score: 0,
    lastAnswerCorrect: null,
    selectedOption: null,
    participantId: null,
    category: null,
    history: [],
  },
  on: {
    RESET: '.idle',
  },
  states: {
    idle: {
      on: {
        START: {
          target: 'categorySelect',
          actions: assign({
            participantId: ({ event }) => event.participantId,
            history: [],
          }),
        },
      },
    },
    categorySelect: {
      on: {
        CHOOSE_CATEGORY: {
          target: 'ready',
          actions: assign({
            category: ({ event }) => event.category,
            questions: ({ event }) => event.questions,
            currentIndex: 0,
            score: 0,
            selectedOption: null,
            history: [],
          }),
        },
      },
    },
    ready: {
      on: {
        GO: 'question',
        CHOOSE_CATEGORY: {
          actions: assign({
            category: ({ event }) => event.category,
            questions: ({ event }) => event.questions,
            currentIndex: 0,
            score: 0,
            selectedOption: null,
            history: [],
          }),
        },
      },
    },
    question: {
      on: {
        ANSWER: {
          target: 'feedback',
          actions: assign(({ context, event }) => {
            const current = context.questions[context.currentIndex];
            const correctOpt = event.correctOption ?? current.correctOption;
            const correct = event.isCorrect ?? (event.option === correctOpt);

            return {
              lastAnswerCorrect: correct,
              selectedOption: event.option,
              score: correct ? context.score + 1 : context.score,
              history: [
                ...context.history,
                {
                  questionId: current.id,
                  text: current.text,
                  selectedOption: event.option,
                  correctOption: correctOpt,
                  isCorrect: correct,
                  responseTimeMs: event.responseTimeMs,
                },
              ],
            };
          }),
        },
        TIMEOUT: {
          target: 'feedback',
          actions: assign(({ context }) => {
            const current = context.questions[context.currentIndex];
            return {
              lastAnswerCorrect: false,
              selectedOption: null,
              history: [
                ...context.history,
                {
                  questionId: current.id,
                  text: current.text,
                  selectedOption: null,
                  correctOption: current.correctOption,
                  isCorrect: false,
                  responseTimeMs: 0,
                },
              ],
            };
          }),
        },
      },
    },
    feedback: {
      after: {
        2600: [
          {
            target: 'question',
            guard: 'hasMoreQuestions',
            actions: assign({
              currentIndex: ({ context }) => context.currentIndex + 1,
              selectedOption: null,
            }),
          },
          { target: 'results' },
        ],
      },
    },
    results: {},
  },
});