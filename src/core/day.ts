/**
 * День: что в него входит (дела и привычки), луна дня, «Осталось» и журнал «Сделано»,
 * номер дня и серия закрытых дней.
 */
import { addDays, diffDays } from './dates';
import { activeHabits, dataOf, habitDay, indexHabits, isScheduled, type HabitData } from './habits';
import { live, type ISODate, type Snapshot } from './model';
import { isDebt } from './tasks';

export type DayItemState = 'open' | 'partial' | 'done' | 'slip';

export type DayItem = {
  kind: 'task' | 'habit';
  id: string;
  title: string;
  state: DayItemState;
  /** дело просрочено (долг) */
  debt: boolean;
  /** вредная привычка */
  bad: boolean;
  /** доля выполнения 0…1 — фаза луны строки */
  fraction: number;
  /** когда отмечено (мс); null — неизвестно (например, чистый день вредной) */
  at: number | null;
};

export type DayView = {
  items: DayItem[];
  /** «Осталось»: открытые и недобитые, в порядке появления */
  left: DayItem[];
  /** «Сделано»: выполненные и слитые, свежие сверху */
  log: DayItem[];
  done: number;
  total: number;
  /** фаза луны дня 0…1 */
  phase: number;
};

/**
 * Состав дня. Дела: запланированные на этот день и выполненные в этот день; для сегодняшнего
 * дня — ещё и долги. Привычки: активные, у которых день по плану или уже отмечен.
 */
export function dayView(
  snap: Pick<Snapshot, 'tasks' | 'habits' | 'checks' | 'rests'>,
  date: ISODate,
  today: ISODate,
  idx: Map<string, HabitData> = indexHabits(snap)
): DayView {
  const items: DayItem[] = [];

  const tasks = live(snap.tasks)
    .filter(
      (t) =>
        t.doneOn === date ||
        (t.doneOn === null && t.date === date) ||
        (date === today && isDebt(t, today))
    )
    .sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt);
  for (const t of tasks) {
    const done = t.doneOn === date;
    items.push({
      kind: 'task',
      id: t.id,
      title: t.title,
      state: done ? 'done' : 'open',
      debt: !done && t.date !== null && t.date < date,
      bad: false,
      fraction: done ? 1 : 0,
      at: done ? t.doneAt : null,
    });
  }

  for (const h of activeHabits(snap)) {
    const day = habitDay(h, dataOf(idx, h.id), date, today);
    let state: DayItemState;
    switch (day.mark) {
      case 'full':
        state = 'done';
        break;
      case 'slip':
        state = 'slip';
        break;
      case 'partial':
        state = 'partial';
        break;
      case 'empty':
        state = 'open';
        break;
      default:
        continue; // выходной, не по плану, до начала — в день не входит
    }
    items.push({
      kind: 'habit',
      id: h.id,
      title: h.name,
      state,
      debt: false,
      bad: h.kind === 'bad',
      fraction: day.fraction,
      at: day.at,
    });
  }

  const left = items.filter((i) => i.state === 'open' || i.state === 'partial');
  const log = items
    .filter((i) => i.state === 'done' || i.state === 'slip')
    .sort((a, b) => (b.at ?? -1) - (a.at ?? -1));
  const done = items.filter((i) => i.state === 'done').length;
  const total = items.length;
  return { items, left, log, done, total, phase: total ? done / total : 0 };
}

/** Номер дня с первого запуска («день 47»). */
export function dayNumber(startedAt: ISODate, today: ISODate): number {
  return Math.max(1, diffDays(startedAt, today) + 1);
}

/** День закрыт итогом. */
export function isClosed(snap: Pick<Snapshot, 'reviews'>, date: ISODate): boolean {
  const r = snap.reviews[date];
  return !!r && r.deletedAt === null;
}

/**
 * Серия закрытых дней подряд. Сегодняшний незакрытый день серию не рвёт — его ещё можно закрыть.
 */
export function closedStreak(snap: Pick<Snapshot, 'reviews'>, today: ISODate): number {
  let d = isClosed(snap, today) ? today : addDays(today, -1);
  let n = 0;
  while (isClosed(snap, d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

/** Фаза луны для оценки дня 1…5: от новолуния до полнолуния. */
export function moodPhase(mood: number): number {
  return (Math.min(5, Math.max(1, mood)) - 1) / 4;
}

/**
 * Первое напоминание дня: дело на этот день или привычка по плану (не вредная, не в выходной)
 * с самым ранним временем. Для подписи «завтра первое — в 6:00: Подъём» на «День закрыт».
 */
export function firstReminder(
  snap: Pick<Snapshot, 'tasks' | 'habits' | 'rests'>,
  date: ISODate
): { time: string; title: string } | null {
  const candidates: { time: string; title: string }[] = [];
  for (const t of live(snap.tasks)) {
    if (t.doneOn === null && t.date === date && t.remindAt) {
      candidates.push({ time: t.remindAt, title: t.title });
    }
  }
  const rests = live(snap.rests);
  for (const h of activeHabits(snap)) {
    if (h.kind !== 'good' || !h.remindAt || h.startDate > date || !isScheduled(h, date)) continue;
    if (rests.some((r) => r.habitId === h.id && date >= r.from && date <= r.to)) continue;
    candidates.push({ time: h.remindAt, title: h.name });
  }
  candidates.sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));
  return candidates[0] ?? null;
}
