/** Дела: группы «Долги / Сегодня / Завтра / Позже / Без даты» и счётчики шапки. */
import { addDays } from './dates';
import { live, type ISODate, type Snapshot, type Task } from './model';

export type TaskGroupKey = 'debts' | 'today' | 'tomorrow' | 'later' | 'someday';

export const TASK_GROUPS: readonly TaskGroupKey[] = [
  'debts',
  'today',
  'tomorrow',
  'later',
  'someday',
] as const;

export type TaskGroup = { key: TaskGroupKey; tasks: Task[] };

export function isDebt(t: Task, today: ISODate): boolean {
  return t.doneOn === null && t.date !== null && t.date < today;
}

function groupOf(t: Task, today: ISODate): TaskGroupKey {
  if (t.date === null) return 'someday';
  if (t.date < today) return 'debts';
  if (t.date === today) return 'today';
  if (t.date === addDays(today, 1)) return 'tomorrow';
  return 'later';
}

/** Порядок внутри группы: открытые выше, важные выше, по времени напоминания, по созданию. */
export function compareTasks(a: Task, b: Task): number {
  const doneA = a.doneOn !== null;
  const doneB = b.doneOn !== null;
  if (doneA !== doneB) return doneA ? 1 : -1;
  if (a.priority !== b.priority) return b.priority - a.priority;
  if (a.remindAt !== b.remindAt) {
    if (!a.remindAt) return 1;
    if (!b.remindAt) return -1;
    return a.remindAt < b.remindAt ? -1 : 1;
  }
  return a.createdAt - b.createdAt;
}

/**
 * Группы для экрана «Дела». Выполненные сегодня остаются в своей группе зачёркнутыми
 * (их можно вернуть), выполненные раньше — не показываются. Пустые группы пропускаются.
 */
export function taskGroups(
  snap: Pick<Snapshot, 'tasks'>,
  today: ISODate,
  opts: { areaId?: string | null } = {}
): TaskGroup[] {
  const by = new Map<TaskGroupKey, Task[]>();
  for (const t of live(snap.tasks)) {
    if (t.doneOn !== null && t.doneOn !== today) continue;
    if (opts.areaId !== undefined && opts.areaId !== null && t.areaId !== opts.areaId) continue;
    const k = groupOf(t, today);
    const list = by.get(k);
    if (list) list.push(t);
    else by.set(k, [t]);
  }
  return TASK_GROUPS.filter((k) => by.has(k)).map((key) => ({
    key,
    tasks: by.get(key)!.sort(compareTasks),
  }));
}

/** Шапка «Дел»: сколько в работе и сколько из них долгов. */
export function taskCounts(
  snap: Pick<Snapshot, 'tasks'>,
  today: ISODate
): { open: number; debts: number } {
  let open = 0;
  let debts = 0;
  for (const t of live(snap.tasks)) {
    if (t.doneOn !== null) continue;
    open++;
    if (isDebt(t, today)) debts++;
  }
  return { open, debts };
}

/** Открытые дела по сферам — для чипов фильтра. */
export function openTasksByArea(snap: Pick<Snapshot, 'tasks'>): Map<string | null, number> {
  const m = new Map<string | null, number>();
  for (const t of live(snap.tasks)) {
    if (t.doneOn === null) m.set(t.areaId, (m.get(t.areaId) ?? 0) + 1);
  }
  return m;
}
