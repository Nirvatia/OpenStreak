/** Цели-договоры: номер договора, срок, порядок на экране. */
import { diffDays } from './dates';
import { live, type Goal, type ISODate, type Snapshot } from './model';

export type GoalState = 'open' | 'overdue' | 'done';

export type GoalView = {
  goal: Goal;
  /** номер договора: порядок заключения, начиная с 1; не меняется после удаления других */
  number: number;
  state: GoalState;
  /** дней до срока (отрицательное — просрочено); null — без срока или закрыта */
  daysLeft: number | null;
};

export function goalState(g: Goal, today: ISODate): GoalState {
  if (g.doneOn !== null) return 'done';
  return g.deadline !== null && g.deadline < today ? 'overdue' : 'open';
}

/**
 * Все живые цели для экрана: сначала открытые и просроченные по сроку (без срока — в конце),
 * затем закрытые, свежие сверху.
 */
export function goalViews(snap: Pick<Snapshot, 'goals'>, today: ISODate): GoalView[] {
  // Номер считаем по всем целям, включая удалённые, чтобы он не «переезжал».
  const order = Object.values(snap.goals).sort(
    (a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id)
  );
  const numbers = new Map(order.map((g, i) => [g.id, i + 1]));
  const views = live(snap.goals).map((goal): GoalView => {
    const state = goalState(goal, today);
    return {
      goal,
      number: numbers.get(goal.id)!,
      state,
      daysLeft: state !== 'done' && goal.deadline ? diffDays(today, goal.deadline) : null,
    };
  });
  return views.sort((a, b) => {
    const doneA = a.state === 'done';
    const doneB = b.state === 'done';
    if (doneA !== doneB) return doneA ? 1 : -1;
    if (doneA) return (b.goal.doneOn ?? '').localeCompare(a.goal.doneOn ?? '');
    const da = a.goal.deadline;
    const db = b.goal.deadline;
    if (da !== db) {
      if (!da) return 1;
      if (!db) return -1;
      return da < db ? -1 : 1;
    }
    return a.number - b.number;
  });
}

/** Шапка «Целей»: сколько договоров и сколько закрыто. */
export function goalCounts(snap: Pick<Snapshot, 'goals'>): { total: number; done: number } {
  const all = live(snap.goals);
  return { total: all.length, done: all.filter((g) => g.doneOn !== null).length };
}
