/**
 * Очки и звания «Стаи». Очки не хранятся, а считаются из данных — поэтому они одинаковые
 * на всех устройствах и не расходятся при синхронизации.
 *
 * За день: дело +10, норма привычки +10, чистый день вредной +10 (сегодняшний — после
 * закрытия дня), слил или сорвался −10, закрыл день +20, полнолуние (всё сделано) ещё +20,
 * закрыл цель +100. Общий счёт не уходит ниже нуля.
 */
import { addDays, daysBetween } from './dates';
import { dayView, isClosed } from './day';
import { activeHabits, dataOf, habitDay, habitStats, indexHabits, type HabitData } from './habits';
import { live, type ISODate, type Snapshot } from './model';

export const POINTS = {
  task: 10,
  habit: 10,
  clean: 10,
  slip: -10,
  closedDay: 20,
  fullMoon: 20,
  goal: 100,
} as const;

export type RankKey = 'pup' | 'cub' | 'wolf' | 'leader' | 'alpha';

/** Щенок → Волчонок → Волк → Вожак → Альфа; `min` — сколько очков нужно. */
export const RANKS: readonly { key: RankKey; min: number }[] = [
  { key: 'pup', min: 0 },
  { key: 'cub', min: 300 },
  { key: 'wolf', min: 1000 },
  { key: 'leader', min: 2000 },
  { key: 'alpha', min: 4000 },
] as const;

type Data = Pick<Snapshot, 'tasks' | 'habits' | 'checks' | 'rests' | 'goals' | 'reviews'>;

/** Очки за один день. */
export function dayPoints(
  snap: Data,
  date: ISODate,
  today: ISODate,
  idx: Map<string, HabitData> = indexHabits(snap)
): number {
  let p = 0;
  for (const t of live(snap.tasks)) if (t.doneOn === date) p += POINTS.task;
  for (const g of live(snap.goals)) if (g.doneOn === date) p += POINTS.goal;
  const closed = isClosed(snap, date);
  for (const h of live(snap.habits)) {
    const day = habitDay(h, dataOf(idx, h.id), date, today);
    if (day.mark === 'slip') p += POINTS.slip;
    else if (day.mark === 'full') {
      if (h.kind === 'good') p += POINTS.habit;
      else if (date < today || closed) p += POINTS.clean;
    }
  }
  if (closed) {
    p += POINTS.closedDay;
    const v = dayView(snap, date, today, idx);
    if (v.total > 0 && v.done === v.total) p += POINTS.fullMoon;
  }
  return p;
}

/** Все очки с первого дня по сегодня. */
export function totalPoints(snap: Data & Pick<Snapshot, 'profile'>, today: ISODate): number {
  const idx = indexHabits(snap);
  let p = 0;
  for (const t of live(snap.tasks)) if (t.doneOn && t.doneOn <= today) p += POINTS.task;
  for (const g of live(snap.goals)) if (g.doneOn && g.doneOn <= today) p += POINTS.goal;
  for (const h of live(snap.habits)) {
    const data = dataOf(idx, h.id);
    for (let d = h.startDate; d <= today; d = addDays(d, 1)) {
      const day = habitDay(h, data, d, today);
      if (day.mark === 'slip') p += POINTS.slip;
      else if (day.mark === 'full') {
        if (h.kind === 'good') p += POINTS.habit;
        else if (d < today || isClosed(snap, d)) p += POINTS.clean;
      }
    }
  }
  for (const r of live(snap.reviews)) {
    if (r.date > today) continue;
    p += POINTS.closedDay;
    const v = dayView(snap, r.date, today, idx);
    if (v.total > 0 && v.done === v.total) p += POINTS.fullMoon;
  }
  return Math.max(0, p);
}

export type RankProgress = {
  points: number;
  /** номер звания в `RANKS` */
  rank: number;
  key: RankKey;
  /** следующее звание и сколько до него осталось; null — уже Альфа */
  next: { rank: number; key: RankKey; left: number } | null;
};

export function rankOf(points: number): RankProgress {
  let rank = 0;
  for (let i = 0; i < RANKS.length; i++) if (points >= RANKS[i].min) rank = i;
  const n = RANKS[rank + 1];
  return {
    points,
    rank,
    key: RANKS[rank].key,
    next: n ? { rank: rank + 1, key: n.key, left: n.min - points } : null,
  };
}

export type PackWeek = {
  /** последние 7 дней, сегодня — последний; marks — дел и норм привычек за день */
  days: { date: ISODate; marks: number }[];
  marks: number;
  /** дел закрыто за неделю */
  tasksDone: number;
  /** чистых дней подряд по всем вредным (наименьшая серия); null — вредных нет */
  cleanStreak: number | null;
  /** лучшая серия среди привычек */
  bestStreak: number;
  /** сливов и срывов за неделю */
  slips: number;
};

/** Неделя для «Стаи». */
export function packWeek(snap: Data, today: ISODate): PackWeek {
  const idx = indexHabits(snap);
  const dates = daysBetween(addDays(today, -6), today);
  const habits = activeHabits(snap);

  const marks = new Map(dates.map((d) => [d, 0]));
  let tasksDone = 0;
  for (const t of live(snap.tasks)) {
    if (t.doneOn && marks.has(t.doneOn)) {
      marks.set(t.doneOn, marks.get(t.doneOn)! + 1);
      tasksDone++;
    }
  }

  let slips = 0;
  let bestStreak = 0;
  let cleanStreak: number | null = null;
  for (const h of habits) {
    const data = dataOf(idx, h.id);
    for (const d of dates) {
      const day = habitDay(h, data, d, today);
      if (day.mark === 'slip') slips++;
      if (day.mark === 'full' && h.kind === 'good') marks.set(d, marks.get(d)! + 1);
    }
    const s = habitStats(h, data, today);
    bestStreak = Math.max(bestStreak, s.best);
    if (h.kind === 'bad')
      cleanStreak = cleanStreak === null ? s.streak : Math.min(cleanStreak, s.streak);
  }

  const days = dates.map((date) => ({ date, marks: marks.get(date)! }));
  return {
    days,
    marks: days.reduce((n, d) => n + d.marks, 0),
    tasksDone,
    cleanStreak,
    bestStreak,
    slips,
  };
}
