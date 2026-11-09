// Save layer. The game talks only to the SaveStore interface, so a cloud store
// (e.g. Supabase) can replace LocalSaveStore later without touching the rest.
import type { ConceptId, Stage } from './types';

export interface ConceptState {
  stage: Stage;
  /** Timestamps of clean (correct, unassisted) answers at the current stage. */
  wins: number[];
  /** Index into the spot-check interval ladder. */
  checkLevel: number;
  dueAt: number | null;
  /** Spot check also falls due after this many completed sessions (for one-sitting play). */
  dueAfterSession: number | null;
  attempts: number;
  cleanAttempts: number;
  lapses: number;
  lastSeen: number | null;
}

export interface SessionRecord {
  at: number;
  score: number;
  max: number;
  /** Ticked off by passing the chapter test rather than by playing it. */
  testedOut?: boolean;
}

/** A finished mock exam: the mark, the time taken, and how each concept went. */
export interface ExamRecord {
  at: number;
  paper: string;
  title: string;
  score: number;
  max: number;
  seconds: number;
  /** Per concept: marks got and marks available. */
  byConcept: Record<ConceptId, { got: number; of: number }>;
}

export interface NewsItem {
  at: number;
  delta: number;
  news: string;
}

export interface SaveData {
  version: 1;
  /** Marks the accounts edition, so a finance save can't be imported by mistake. */
  edition?: 'accounts';
  houseName: string;
  createdAt: number;
  settings: { examDate: string; theme: 'system' | 'light' | 'dark' };
  value: number;
  cash: number;
  news: NewsItem[];
  streak: { count: number; lastDay: string | null };
  sessions: Record<string, SessionRecord>;
  bosses: Record<number, SessionRecord>;
  resume: {
    sessionId: string;
    part: number;
    score: number;
    max: number;
    startValue: number;
    /** Parts already finished, with their points, so going back never re-marks them. */
    done?: Record<number, { score: number; max: number }>;
  } | null;
  mastery: Record<ConceptId, ConceptState>;
  sessionsPlayed: number;
  /** Mock exam attempts, newest first. */
  exams: ExamRecord[];
}

export interface SaveStore {
  load(): SaveData | null;
  save(data: SaveData): void;
  clear(): void;
}

const KEY = 'atelier-noor-accounts/save/v1';

export class LocalSaveStore implements SaveStore {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? migrate(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  }
  save(data: SaveData) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* storage full or blocked: progress stays in memory for this visit */
    }
  }
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }
}

export const STARTING_VALUE = 150_000;
/** Friday 11 December, 1pm to 3pm, Blackrock Examination Hall. */
export const EXAM_DAY = '2026-12-11';
/** The date used before the real one was known. A save still carrying it moves to the real exam day. */
const GUESSED_EXAM_DAY = '2026-11-22';

export function freshSave(houseName = 'Atelier Noor', now = Date.now()): SaveData {
  return {
    version: 1,
    edition: 'accounts',
    houseName,
    createdAt: now,
    settings: { examDate: EXAM_DAY, theme: 'system' },
    value: STARTING_VALUE,
    cash: STARTING_VALUE,
    news: [],
    streak: { count: 0, lastDay: null },
    sessions: {},
    bosses: {},
    resume: null,
    mastery: {},
    sessionsPlayed: 0,
    exams: [],
  };
}

/** Fills in fields added after a save was written, so old exports keep loading. */
export function migrate(raw: unknown): SaveData {
  if (!raw || typeof raw !== 'object' || (raw as SaveData).version !== 1 || (raw as SaveData).edition !== 'accounts') throw new Error('Not an Atelier Noor: The Books save file');
  const base = freshSave();
  const d = raw as Partial<SaveData>;
  const settings = { ...base.settings, ...d.settings };
  if (settings.examDate === GUESSED_EXAM_DAY) settings.examDate = EXAM_DAY;
  return { ...base, ...d, settings } as SaveData;
}

export function exportSave(data: SaveData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `atelier-noor-books-progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importSave(file: File): Promise<SaveData> {
  return migrate(JSON.parse(await file.text()));
}
