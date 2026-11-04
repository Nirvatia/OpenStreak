/**
 * Привычки: состояние дня, серии, итоги. Чистые функции над снимком.
 *
 * Полезная: полная луна — норма, неполная — недобор, кровавая — «слил», пунктир — выходной.
 * Вредная: каждый день без срыва — чистый (полная луна), срыв — кровавая.
 */
import { addDays, weekday } from './dates';
import {
  live,
  type Habit,
  type HabitCheck,
  type ISODate,
  type RestPeriod,
  type Snapshot,
} from './model';

export type DayMark =
  /** норма выполнена (у вредной — чистый день) */
  | 'full'
  /** начато, но не до нормы */
  | 'partial'
  /** слил (у вредной — срыв) */
  | 'slip'
  /** выходной */
  | 'rest'
  /** день по плану, ничего не отмечено */
  | 'empty'
  /** день не по плану (не тот день недели) */
  | 'off'
  /** до начала привычки */
  | 'before'
  /** ещё не наступил */
  | 'future';

export type HabitDay = {
  date: ISODate;
  mark: DayMark;
  /** сколько сделано (для numeric — в единицах привычки) */
  value: number;
  /** доля нормы 0…1 — фаза луны */
  fraction: number;
  /** когда отмечено (мс), если отмечено */
  at: number | null;
};

export type HabitData = { checks: Map<ISODate, HabitCheck>; rests: RestPeriod[] };

/** Отметки и выходные каждой привычки — чтобы не перебирать весь снимок на каждый день. */
export function indexHabits(snap: Pick<Snapshot, 'checks' | 'rests'>): Map<string, HabitData> {
  const idx = new Map<string, HabitData>();
  const of = (id: string) => {
    let d = idx.get(id);
    if (!d) idx.set(id, (d = { checks: new Map(), rests: [] }));
    return d;
  };
  for (const c of live(snap.checks)) of(c.habitId).checks.set(c.date, c);
  for (const r of live(snap.rests)) of(r.habitId).rests.push(r);
  return idx;
}

const EMPTY: HabitData = { checks: new Map(), rests: [] };

export function dataOf(idx: Map<string, HabitData>, habitId: string): HabitData {
  return idx.get(habitId) ?? EMPTY;
}

/** Привычки, которые сейчас ведутся: не удалены и не в архиве, по порядку создания. */
export function activeHabits(snap: Pick<Snapshot, 'habits'>): Habit[] {
  return live(snap.habits)
    .filter((h) => h.archivedAt === null)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function fullValue(h: Habit): number {
  return h.measure === 'numeric' ? h.target : 1;
}

export function isScheduled(h: Habit, date: ISODate): boolean {
  return !h.days || h.days.includes(weekday(date));
}

export function isResting(data: HabitData, date: ISODate): boolean {
  return data.rests.some((r) => date >= r.from && date <= r.to);
}

export function habitDay(h: Habit, data: HabitData, date: ISODate, today: ISODate): HabitDay {
  const check = data.checks.get(date);
  const at = check ? check.updatedAt : null;
  const day = (mark: DayMark, value = 0, fraction = 0): HabitDay => ({
    date,
    mark,
    value,
    fraction,
    at,
  });
  if (date > today) return day('future');
  if (date < h.startDate) return day('before');

  if (h.kind === 'bad') {
    if (check) return day('slip', check.value, 1);
    if (isResting(data, date)) return day('rest');
    if (!isScheduled(h, date)) return day('off');
    return { ...day('full', 0, 1), at: null };
  }

  if (check?.slip) return day('slip', 0, 1);
  const full = fullValue(h);
  const value = check?.value ?? 0;
  if (value >= full) return day('full', value, 1);
  if (isResting(data, date)) return day('rest', value, 0);
  if (!isScheduled(h, date)) return value > 0 ? day('partial', value, value / full) : day('off');
  return value > 0 ? day('partial', value, value / full) : day('empty');
}

/** Дни привычки с `from` по `to` включительно. */
export function habitDays(
  h: Habit,
  data: HabitData,
  from: ISODate,
  to: ISODate,
  today: ISODate
): HabitDay[] {
  const out: HabitDay[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(habitDay(h, data, d, today));
  return out;
}

/** Как день влияет на серию: продлевает, рвёт, не влияет или ещё не решён (сегодня). */
function streakEffect(day: HabitDay, today: ISODate): 'keep' | 'break' | 'skip' {
  switch (day.mark) {
    case 'full':
      return 'keep';
    case 'slip':
      return 'break';
    case 'empty':
    case 'partial':
      // Сегодняшний день ещё можно добить — серию он не рвёт.
      return day.date === today ? 'skip' : 'break';
    default:
      return 'skip';
  }
}

export type HabitStats = {
  /** текущая серия (у вредной — чистых дней подряд) */
  streak: number;
  /** лучшая серия за всё время */
  best: number;
  /** дней с нормой (у вредной — чистых) */
  doneDays: number;
  /** сделано всего в единицах привычки (у вредной — 0) */
  total: number;
  /** сколько раз слил (у вредной — срывов) */
  slips: number;
};

export function habitStats(h: Habit, data: HabitData, today: ISODate): HabitStats {
  let run = 0;
  let best = 0;
  let doneDays = 0;
  let slips = 0;
  for (let d = h.startDate; d <= today; d = addDays(d, 1)) {
    const day = habitDay(h, data, d, today);
    if (day.mark === 'full') doneDays++;
    if (day.mark === 'slip') slips++;
    const e = streakEffect(day, today);
    if (e === 'keep') best = Math.max(best, ++run);
    else if (e === 'break') run = 0;
  }
  let total = 0;
  if (h.kind === 'good') for (const c of data.checks.values()) if (!c.slip) total += c.value;
  return { streak: run, best, doneDays, total, slips };
}
