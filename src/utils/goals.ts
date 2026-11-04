import { Area, Goal } from '../types/models';
import { todayStr } from './text';

export type GoalWithArea = Goal & { area: Area };

export function daysToGoal(dead: string): number {
  const today = todayStr();
  return Math.round(
    (new Date(dead + 'T00:00').getTime() - new Date(today + 'T00:00').getTime()) / 86400000
  );
}

export function daysUsed(startedAt: string): number {
  return (
    Math.round(
      (new Date(todayStr() + 'T00:00').getTime() - new Date(startedAt + 'T00:00').getTime()) /
        86400000
    ) + 1
  );
}

export function deadlineGoals(areas: Area[]): GoalWithArea[] {
  const all: GoalWithArea[] = [];
  areas.forEach((area) => {
    area.goals.forEach((goal) => {
      if (goal.dead && !goal.done) all.push({ ...goal, area });
    });
  });
  all.sort((a, b) => (a.dead || '').localeCompare(b.dead || ''));
  return all;
}
