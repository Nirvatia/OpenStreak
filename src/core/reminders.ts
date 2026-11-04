/**
 * План напоминаний — чистая функция от данных и текущего момента.
 * Сервис уведомлений сверяет план с тем, что уже запланировано в системе.
 */
import { addDays, dstr } from '../utils/dates';
import {
  live,
  type Habit,
  type HabitCheck,
  type ISODate,
  type RestPeriod,
  type Snapshot,
} from './model';
import { settingsOf } from './settings';

export type PlannedReminder = {
  /** Стабильный идентификатор: меняется, только если меняется смысл или время. */
  id: string;
  kind: 'task' | 'habit' | 'review';
  subjectId: string;
  /** название задачи/привычки (для итога дня — пусто) — текст уведомления собирает сервис */
  title: string;
  at: Date;
};

/** iOS держит не больше 64 запланированных уведомлений на приложение. */
export const MAX_PLANNED = 60;
const HABIT_HORIZON_DAYS = 7;
const TASK_HORIZON_DAYS = 60;

export const REMINDER_ID_PREFIX = 'os:';

function at(date: ISODate, time: string): Date {
  return new Date(`${date}T${time}:00`);
}

function scheduledOn(h: Habit, date: ISODate): boolean {
  return !h.days || h.days.includes(new Date(`${date}T00:00`).getDay());
}

export function planReminders(snap: Snapshot, now: Date): PlannedReminder[] {
  const out: PlannedReminder[] = [];
  const today = dstr(now);
  const taskLimit = addDays(today, TASK_HORIZON_DAYS);

  for (const t of live(snap.tasks)) {
    if (t.doneOn || !t.date || !t.remindAt || t.date > taskLimit) continue;
    const when = at(t.date, t.remindAt);
    if (when <= now) continue;
    out.push({
      id: `${REMINDER_ID_PREFIX}t:${t.id}:${when.getTime()}`,
      kind: 'task',
      subjectId: t.id,
      title: t.title,
      at: when,
    });
  }

  const doneByHabit = new Map<string, Map<ISODate, HabitCheck>>();
  for (const c of live(snap.checks)) {
    let m = doneByHabit.get(c.habitId);
    if (!m) doneByHabit.set(c.habitId, (m = new Map()));
    m.set(c.date, c);
  }
  const restsByHabit = new Map<string, RestPeriod[]>();
  for (const r of live(snap.rests)) {
    const list = restsByHabit.get(r.habitId) ?? [];
    list.push(r);
    restsByHabit.set(r.habitId, list);
  }

  for (const h of live(snap.habits)) {
    // Для вредной привычки напоминание «не забудь» не имеет смысла.
    if (h.kind !== 'good' || h.archivedAt !== null || !h.remindAt) continue;
    const full = h.measure === 'numeric' ? h.target : 1;
    const checks = doneByHabit.get(h.id);
    const rests = restsByHabit.get(h.id) ?? [];
    for (let i = 0; i < HABIT_HORIZON_DAYS; i++) {
      const d = addDays(today, i);
      if (d < h.startDate || !scheduledOn(h, d)) continue;
      if (rests.some((r) => d >= r.from && d <= r.to)) continue;
      if ((checks?.get(d)?.value ?? 0) >= full) continue;
      const when = at(d, h.remindAt);
      if (when <= now) continue;
      out.push({
        id: `${REMINDER_ID_PREFIX}h:${h.id}:${d}:${h.remindAt}`,
        kind: 'habit',
        subjectId: h.id,
        title: h.name,
        at: when,
      });
    }
  }

  // Итог дня: каждый вечер в выбранное время, пока день не закрыт.
  const { reviewAt } = settingsOf(snap);
  if (reviewAt) {
    for (let i = 0; i < HABIT_HORIZON_DAYS; i++) {
      const d = addDays(today, i);
      const review = snap.reviews[d];
      if (review && review.deletedAt === null) continue;
      const when = at(d, reviewAt);
      if (when <= now) continue;
      out.push({
        id: `${REMINDER_ID_PREFIX}r:${d}:${reviewAt}`,
        kind: 'review',
        subjectId: d,
        title: '',
        at: when,
      });
    }
  }

  out.sort((a, b) => a.at.getTime() - b.at.getTime());
  return out.slice(0, MAX_PLANNED);
}
