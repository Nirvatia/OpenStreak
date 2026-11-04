/**
 * Операции над данными в терминах модели v2. Никаких побочных эффектов кроме записи данных:
 * вибро, тосты и запросы разрешений — забота слоя интерфейса.
 */
import { todayStr } from '../utils/dates';
import { newId } from './ids';
import {
  checkId,
  live,
  type Habit,
  type HabitKind,
  type HabitMeasure,
  type HabitUnit,
  type ISODate,
  type Priority,
} from './model';
import { commit, compact, draftCreate, draftDelete, draftPatch, get, useDataStore } from './store';

const data = () => useDataStore.getState().data;

// ── Задачи ───────────────────────────────────────────────────────────────────

export type TaskInput = {
  title: string;
  notes?: string;
  date?: ISODate | null;
  priority?: Priority;
  remindAt?: string;
  areaId?: string | null;
};

export function createTask(input: TaskInput): string {
  const id = newId();
  commit([
    draftCreate('tasks', id, {
      title: input.title.trim(),
      notes: (input.notes ?? '').trim(),
      date: input.date === undefined ? todayStr() : input.date,
      priority: input.priority ?? 0,
      doneOn: null,
      areaId: input.areaId ?? null,
      remindAt: input.remindAt ?? '',
      placeId: null,
      placeTrigger: null,
    }),
  ]);
  return id;
}

export function updateTask(id: string, input: TaskInput): void {
  commit(
    compact([
      draftPatch('tasks', id, {
        title: input.title.trim(),
        ...(input.notes !== undefined && { notes: input.notes.trim() }),
        ...(input.date !== undefined && { date: input.date }),
        ...(input.priority !== undefined && { priority: input.priority }),
        ...(input.remindAt !== undefined && { remindAt: input.remindAt }),
        ...(input.areaId !== undefined && { areaId: input.areaId }),
      }),
    ])
  );
}

export function toggleTask(id: string): void {
  const t = get('tasks', id);
  if (!t) return;
  commit(compact([draftPatch('tasks', id, { doneOn: t.doneOn ? null : todayStr() })]));
}

export function deleteTask(id: string): void {
  commit(compact([draftDelete('tasks', id)]));
}

// ── Сферы и цели ─────────────────────────────────────────────────────────────

export type AreaInput = { name: string; color: string; icon: string };

export function createArea(input: AreaInput, id: string = newId()): string {
  commit([draftCreate('areas', id, { ...input, name: input.name.trim() })]);
  return id;
}

export function updateArea(id: string, input: AreaInput): void {
  commit(compact([draftPatch('areas', id, { ...input, name: input.name.trim() })]));
}

/** Удалить сферу вместе с её целями; задачи и привычки остаются, но без сферы. */
export function deleteArea(id: string): void {
  const d = data();
  commit(
    compact([
      draftDelete('areas', id),
      ...live(d.goals)
        .filter((g) => g.areaId === id)
        .map((g) => draftDelete('goals', g.id)),
      ...live(d.tasks)
        .filter((t) => t.areaId === id)
        .map((t) => draftPatch('tasks', t.id, { areaId: null })),
      ...live(d.habits)
        .filter((h) => h.areaId === id)
        .map((h) => draftPatch('habits', h.id, { areaId: null })),
    ])
  );
}

export type GoalInput = {
  text: string;
  criterion: string;
  reward: string;
  penalty: string;
  deadline: ISODate | null;
  doneOn?: ISODate | null;
};

export function createGoal(areaId: string, input: GoalInput, id: string = newId()): string {
  commit([
    draftCreate('goals', id, {
      areaId,
      text: input.text.trim(),
      criterion: input.criterion,
      reward: input.reward,
      penalty: input.penalty,
      deadline: input.deadline,
      doneOn: input.doneOn ?? null,
    }),
  ]);
  return id;
}

/** Привести цели сферы к переданному списку: добавить новые, обновить изменённые, удалить лишние. */
export function syncAreaGoals(areaId: string, goals: (GoalInput & { id: string })[]): void {
  const existing = live(data().goals).filter((g) => g.areaId === areaId);
  const keep = new Set(goals.map((g) => g.id));
  commit(
    compact([
      ...existing.filter((g) => !keep.has(g.id)).map((g) => draftDelete('goals', g.id)),
      ...goals.map((g) => {
        const fields = {
          areaId,
          text: g.text.trim(),
          criterion: g.criterion,
          reward: g.reward,
          penalty: g.penalty,
          deadline: g.deadline,
          doneOn: g.doneOn ?? null,
        };
        const prev = get('goals', g.id);
        if (!prev) return draftCreate('goals', g.id, fields);
        const changed = (Object.keys(fields) as (keyof typeof fields)[]).some(
          (k) => prev[k] !== fields[k]
        );
        return changed ? draftPatch('goals', g.id, fields) : null;
      }),
    ])
  );
}

export function toggleGoal(id: string): void {
  const g = get('goals', id);
  if (!g) return;
  commit(compact([draftPatch('goals', id, { doneOn: g.doneOn ? null : todayStr() })]));
}

export function deleteGoal(id: string): void {
  commit(compact([draftDelete('goals', id)]));
}

// ── Привычки ─────────────────────────────────────────────────────────────────

export type HabitInput = {
  name: string;
  kind: HabitKind;
  icon: string;
  color: string;
  days: number[] | null;
  question: string;
  remindAt: string;
  areaId: string | null;
  measure: HabitMeasure;
  unit: HabitUnit;
  target: number;
};

function habitFields(input: HabitInput) {
  const numeric = input.measure === 'numeric';
  return {
    name: input.name.trim(),
    kind: input.kind,
    icon: input.icon,
    color: input.color,
    days: input.days && input.days.length ? [...input.days].sort() : null,
    question: input.question,
    remindAt: input.remindAt,
    areaId: input.areaId,
    measure: input.measure,
    unit: numeric ? input.unit : ('count' as const),
    target: numeric && input.target > 0 ? input.target : 1,
  };
}

export function createHabit(input: HabitInput): string {
  const id = newId();
  commit([
    draftCreate('habits', id, {
      ...habitFields(input),
      startDate: todayStr(),
      placeId: null,
      placeTrigger: null,
      archivedAt: null,
    }),
  ]);
  return id;
}

export function updateHabit(id: string, input: HabitInput): void {
  commit(compact([draftPatch('habits', id, habitFields(input))]));
}

/** Удалить привычку вместе с отметками и периодами отдыха. */
export function deleteHabit(id: string): void {
  const d = data();
  commit(
    compact([
      draftDelete('habits', id),
      ...live(d.checks)
        .filter((c) => c.habitId === id)
        .map((c) => draftDelete('checks', c.id)),
      ...live(d.rests)
        .filter((r) => r.habitId === id)
        .map((r) => draftDelete('rests', r.id)),
    ])
  );
}

/** Значение «выполнено полностью» для привычки: цель для numeric, 1 для остальных. */
export function fullValue(h: Habit): number {
  return h.measure === 'numeric' ? h.target : 1;
}

/** Отметить/снять отметку за день (для вредной — срыв). */
export function toggleCheck(habitId: string, date: ISODate): void {
  const h = get('habits', habitId);
  if (!h) return;
  const id = checkId(habitId, date);
  if (get('checks', id)) {
    commit(compact([draftDelete('checks', id)]));
  } else {
    commit([draftCreate('checks', id, { habitId, date, value: fullValue(h) })]);
  }
}

/** Задать значение за день; 0 и меньше — снять отметку. */
export function setCheckValue(habitId: string, date: ISODate, value: number): void {
  if (!get('habits', habitId)) return;
  const id = checkId(habitId, date);
  if (value <= 0) {
    commit(compact([draftDelete('checks', id)]));
  } else {
    commit([draftCreate('checks', id, { habitId, date, value })]);
  }
}

export function addRest(habitId: string, from: ISODate, to: ISODate): void {
  if (!get('habits', habitId)) return;
  const [f, t] = from <= to ? [from, to] : [to, from];
  commit([draftCreate('rests', newId(), { habitId, from: f, to: t })]);
}

export function removeRest(habitId: string, from: ISODate, to: ISODate): void {
  commit(
    compact(
      live(data().rests)
        .filter((r) => r.habitId === habitId && r.from === from && r.to === to)
        .map((r) => draftDelete('rests', r.id))
    )
  );
}

// ── Итог дня ─────────────────────────────────────────────────────────────────

export function saveReview(date: ISODate, mood: number, note: string): void {
  commit([
    draftCreate('reviews', date, {
      date,
      mood: Math.min(5, Math.max(1, Math.round(mood))),
      note: note.trim(),
    }),
  ]);
}
