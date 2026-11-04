import { Task, Goal, Area } from '../types/models';
import { todayStr, addDays, p2, MON_NOM } from './text';

export type CalendarView = 'week' | 'month' | 'year';
export type GoalWithArea = Goal & { area: Area };

export function tasksOn(dateStr: string, tasks: Task[], areaFilter: string | null): Task[] {
  return tasks.filter((task) => task.date === dateStr && (!areaFilter || task.area === areaFilter));
}

export function goalsOn(dateStr: string, areas: Area[]): GoalWithArea[] {
  return areas.flatMap((area) =>
    area.goals.filter((goal) => goal.dead === dateStr).map((goal) => ({ ...goal, area }))
  );
}

export type MonthCell = {
  date: string;
  day: number;
  isOtherMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasGoals: boolean;
  tasks: Task[];
};

export function monthCells(
  year: number,
  month: number,
  tasks: Task[],
  areas: Area[],
  areaFilter: string | null,
  selectedDate: string
): MonthCell[] {
  const tb = todayStr();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = addDays(`${year}-${p2(month + 1)}-01`, -startOffset);
  const cells: MonthCell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = addDays(startDate, i);
    const dt = new Date(date + 'T00:00');
    cells.push({
      date,
      day: dt.getDate(),
      isOtherMonth: dt.getMonth() !== month,
      isToday: date === tb,
      isSelected: date === selectedDate,
      hasGoals: goalsOn(date, areas).length > 0,
      tasks: tasksOn(date, tasks, areaFilter),
    });
  }
  return cells;
}

export type WeekCell = {
  date: string;
  day: number;
  dow: string;
  isToday: boolean;
  isSelected: boolean;
  hasGoals: boolean;
  tasks: Task[];
};

export function weekCells(
  cursor: string,
  tasks: Task[],
  areas: Area[],
  areaFilter: string | null,
  selectedDate: string
): WeekCell[] {
  const tb = todayStr();
  const cur = new Date(cursor + 'T00:00');
  const monday = addDays(cursor, -((cur.getDay() + 6) % 7));
  const DOW = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
  const cells: WeekCell[] = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(monday, i);
    const dt = new Date(date + 'T00:00');
    cells.push({
      date,
      day: dt.getDate(),
      dow: DOW[i],
      isToday: date === tb,
      isSelected: date === selectedDate,
      hasGoals: goalsOn(date, areas).length > 0,
      tasks: tasksOn(date, tasks, areaFilter),
    });
  }
  return cells;
}

export type YearCell = {
  month: number;
  monthName: string;
  days: { date: string; day: number; hasTasks: boolean; hasGoals: boolean }[];
};

export function yearCells(
  year: number,
  tasks: Task[],
  areas: Area[],
  areaFilter: string | null
): YearCell[] {
  const cells: YearCell[] = [];
  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const startOffset = (new Date(year, m, 1).getDay() + 6) % 7;
    const days: { date: string; day: number; hasTasks: boolean; hasGoals: boolean }[] = [];
    for (let i = 0; i < startOffset; i++) {
      days.push({ date: '', day: 0, hasTasks: false, hasGoals: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${p2(m + 1)}-${p2(d)}`;
      days.push({
        date,
        day: d,
        hasTasks: tasksOn(date, tasks, areaFilter).length > 0,
        hasGoals: goalsOn(date, areas).length > 0,
      });
    }
    cells.push({
      month: m,
      monthName: MON_NOM[m][0].toUpperCase() + MON_NOM[m].slice(1),
      days,
    });
  }
  return cells;
}

export function monthTitle(year: number, month: number): string {
  return MON_NOM[month][0].toUpperCase() + MON_NOM[month].slice(1) + ' ' + year;
}

export function weekTitle(cursor: string): string {
  const cur = new Date(cursor + 'T00:00');
  const monday = addDays(cursor, -((cur.getDay() + 6) % 7));
  const sunday = addDays(monday, 6);
  const monDate = new Date(monday + 'T00:00');
  const sunDate = new Date(sunday + 'T00:00');
  if (monDate.getMonth() === sunDate.getMonth()) {
    return `${monDate.getDate()}–${sunDate.getDate()} ${MON_NOM[monDate.getMonth()]}`;
  }
  return `${monDate.getDate()} ${MON_NOM[monDate.getMonth()]} – ${sunDate.getDate()} ${MON_NOM[sunDate.getMonth()]}`;
}
