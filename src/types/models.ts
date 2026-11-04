/**
 * Представление данных для текущего интерфейса (структуры старой версии приложения).
 * Строится из модели v2 (`src/core/model.ts`) в `src/core/legacy.ts` и уйдёт вместе
 * со старыми экранами при редизайне. Новую логику пишите на модели v2.
 */
export type Priority = 0 | 1 | 2 | 3;

export type Task = {
  id: string;
  title: string;
  date: string | null;
  priority: Priority;
  notes: string;
  done: boolean;
  doneAt: string | null;
  createdAt: number;
  area: string | null;
  remind: string;
};

export type RestPeriod = { f: string; t: string };

export type HabitType = 'good' | 'bad';
export type MeasureType = 'boolean' | 'numeric';
export type HabitUnit = 'count' | 'minutes' | 'hours';

export type Habit = {
  id: string;
  name: string;
  type: HabitType;
  emoji: string;
  color: string;
  days: number[] | null;
  dates: string[];
  question: string;
  remind: string;
  area: string | null;
  createdAt: string;
  rest: RestPeriod[];
  progress: Record<string, number>;
  measureType: MeasureType;
  unit: HabitUnit;
  target: number;
};

export type Goal = {
  id: string;
  text: string;
  crit: string;
  rew: string;
  pen: string;
  dead: string | null;
  done: boolean;
  doneAt: string | null;
};

export type Area = {
  id: string;
  name: string;
  color: string;
  icon: string;
  goals: Goal[];
};

export type MoodEntry = {
  mood: number;
  note: string;
};

export type AppState = {
  tasks: Task[];
  habits: Habit[];
  areas: Area[];
  moods: Record<string, MoodEntry>;
  startedAt: string;
};
