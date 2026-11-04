/**
 * Построение старого представления (`types/models.ts`) из модели v2 —
 * чтобы текущие экраны работали на новом ядре без переписывания.
 */
import type {
  AppState,
  Area as LegacyArea,
  Goal as LegacyGoal,
  Habit as LegacyHabit,
  MoodEntry,
  Task as LegacyTask,
} from '../types/models';
import { live, type Habit, type HabitCheck, type Snapshot } from './model';

function legacyHabit(h: Habit, checks: HabitCheck[]): LegacyHabit {
  const dates: string[] = [];
  const progress: Record<string, number> = {};
  const full = h.measure === 'numeric' ? h.target : 1;
  for (const c of checks) {
    progress[c.date] = c.value;
    // Для numeric день засчитан, только если достигнута цель.
    if (c.value >= full) dates.push(c.date);
  }
  dates.sort();
  return {
    id: h.id,
    name: h.name,
    type: h.kind,
    emoji: h.icon,
    color: h.color,
    days: h.days,
    dates,
    question: h.question,
    remind: h.remindAt,
    area: h.areaId,
    createdAt: h.startDate,
    rest: [],
    progress,
    measureType: h.measure,
    unit: h.unit,
    target: h.target,
  };
}

export function toLegacyState(snap: Snapshot): AppState {
  const checksByHabit = new Map<string, HabitCheck[]>();
  for (const c of live(snap.checks)) {
    const list = checksByHabit.get(c.habitId);
    if (list) list.push(c);
    else checksByHabit.set(c.habitId, [c]);
  }

  const habits = live(snap.habits)
    .filter((h) => h.archivedAt === null)
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((h) => legacyHabit(h, checksByHabit.get(h.id) ?? []));
  const habitById = new Map(habits.map((h) => [h.id, h]));
  for (const r of live(snap.rests).sort((a, b) => a.from.localeCompare(b.from))) {
    habitById.get(r.habitId)?.rest.push({ f: r.from, t: r.to });
  }

  const tasks: LegacyTask[] = live(snap.tasks)
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((t) => ({
      id: t.id,
      title: t.title,
      date: t.date,
      priority: t.priority,
      notes: t.notes,
      done: t.doneOn !== null,
      doneAt: t.doneOn,
      createdAt: t.createdAt,
      area: t.areaId,
      remind: t.remindAt,
    }));

  const goalsByArea = new Map<string, LegacyGoal[]>();
  for (const g of live(snap.goals).sort((a, b) => a.createdAt - b.createdAt)) {
    const lg: LegacyGoal = {
      id: g.id,
      text: g.text,
      crit: g.criterion,
      rew: g.reward,
      pen: g.penalty,
      dead: g.deadline,
      done: g.doneOn !== null,
      doneAt: g.doneOn,
    };
    const list = goalsByArea.get(g.areaId);
    if (list) list.push(lg);
    else goalsByArea.set(g.areaId, [lg]);
  }
  const areas: LegacyArea[] = live(snap.areas)
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((a) => ({
      id: a.id,
      name: a.name,
      color: a.color,
      icon: a.icon,
      goals: goalsByArea.get(a.id) ?? [],
    }));

  const moods: Record<string, MoodEntry> = {};
  for (const r of live(snap.reviews)) moods[r.date] = { mood: r.mood, note: r.note };

  return { tasks, habits, areas, moods, startedAt: snap.profile.startedAt };
}
