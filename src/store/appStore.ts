/**
 * Фасад для текущих экранов: тот же API, что и раньше, но данные живут в ядре (`src/core`).
 * `state` — старое представление, пересчитывается при каждом изменении данных или смене суток.
 * Уйдёт вместе со старыми экранами при редизайне.
 */
import { create } from 'zustand';
import * as core from '../core/actions';
import { toLegacyState } from '../core/legacy';
import type { Snapshot } from '../core/model';
import { replaceAll, useDataStore } from '../core/store';
import { vibrateImpact, vibrateSuccess } from '../services/haptics';
import { askNotificationPermission } from '../services/notifications';
import type { AppState, Goal, HabitType, HabitUnit, MeasureType, Priority } from '../types/models';

type HabitFormInput = {
  name: string;
  type: HabitType;
  question: string;
  emoji: string;
  color: string;
  days: number[] | null;
  remind: string;
  area: string | null;
  measureType: MeasureType;
  unit: HabitUnit;
  target: number;
};

type AreaFormInput = { name: string; color: string; icon: string; goals?: Goal[] };

type AppStore = {
  state: AppState;
  hydrated: boolean;
  /** «Сегодня» — меняется в полночь, чтобы экраны перерисовались. */
  today: string;
  replaceAll: (snapshot: Snapshot) => Promise<void>;
  addTask: (input: { title: string; date?: string | null; area?: string | null }) => void;
  saveTask: (input: {
    id?: string;
    title: string;
    notes: string;
    date: string | null;
    priority: Priority;
    remind: string;
    area: string | null;
  }) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  addArea: (input: AreaFormInput) => void;
  updateArea: (id: string, input: AreaFormInput) => void;
  removeArea: (id: string) => void;
  addGoal: (input: {
    areaId: string;
    text: string;
    crit: string;
    rew: string;
    pen: string;
    dead: string | null;
  }) => void;
  toggleGoalDone: (input: { areaId: string; goalId: string }) => void;
  removeGoal: (input: { areaId: string; goalId: string }) => void;
  addHabit: (input: HabitFormInput) => void;
  updateHabit: (id: string, input: HabitFormInput) => void;
  removeHabit: (id: string) => void;
  toggleHabitDate: (id: string, dateStr: string) => void;
  saveHabitProgress: (input: { habitId: string; date: string; value: number }) => void;
  addRestPeriod: (input: { habitId: string; from: string; to: string }) => void;
  removeRestPeriod: (input: { habitId: string; from: string; to: string }) => void;
  saveReview: (input: { date: string; mood: number; note: string }) => void;
};

function habitInput(input: HabitFormInput): core.HabitInput {
  return {
    name: input.name,
    kind: input.type,
    icon: input.emoji,
    color: input.color,
    days: input.days,
    question: input.question,
    remindAt: input.remind,
    areaId: input.area,
    measure: input.measureType,
    unit: input.unit,
    target: input.target,
  };
}

function goalInputs(goals: Goal[]): (core.GoalInput & { id: string })[] {
  return goals.map((g) => ({
    id: g.id,
    text: g.text,
    criterion: g.crit,
    reward: g.rew,
    penalty: g.pen,
    deadline: g.dead,
    doneOn: g.done ? (g.doneAt ?? useDataStore.getState().today) : null,
  }));
}

const initial = useDataStore.getState();

export const useAppStore = create<AppStore>(() => ({
  state: toLegacyState(initial.data),
  hydrated: initial.ready,
  today: initial.today,

  replaceAll: (snapshot) => replaceAll(snapshot),

  addTask: (input) => {
    core.createTask({ title: input.title, date: input.date, areaId: input.area ?? null });
  },
  saveTask: (input) => {
    if (input.remind) void askNotificationPermission();
    vibrateSuccess();
    const fields = {
      title: input.title,
      notes: input.notes,
      date: input.date,
      priority: input.priority,
      remindAt: input.remind,
      areaId: input.area,
    };
    if (input.id) core.updateTask(input.id, fields);
    else core.createTask(fields);
  },
  toggleTask: (id) => {
    vibrateImpact();
    core.toggleTask(id);
  },
  removeTask: (id) => {
    vibrateImpact();
    core.deleteTask(id);
  },

  addArea: (input) => {
    const id = core.createArea(input);
    if (input.goals?.length) core.syncAreaGoals(id, goalInputs(input.goals));
  },
  updateArea: (id, input) => {
    core.updateArea(id, input);
    if (input.goals) core.syncAreaGoals(id, goalInputs(input.goals));
  },
  removeArea: (id) => {
    vibrateImpact();
    core.deleteArea(id);
  },
  addGoal: (input) => {
    vibrateSuccess();
    core.createGoal(input.areaId, {
      text: input.text,
      criterion: input.crit,
      reward: input.rew,
      penalty: input.pen,
      deadline: input.dead,
    });
  },
  toggleGoalDone: ({ goalId }) => {
    vibrateImpact();
    core.toggleGoal(goalId);
  },
  removeGoal: ({ goalId }) => {
    vibrateImpact();
    core.deleteGoal(goalId);
  },

  addHabit: (input) => {
    if (input.remind) void askNotificationPermission();
    vibrateSuccess();
    core.createHabit(habitInput(input));
  },
  updateHabit: (id, input) => {
    if (input.remind) void askNotificationPermission();
    vibrateSuccess();
    core.updateHabit(id, habitInput(input));
  },
  removeHabit: (id) => {
    vibrateImpact();
    core.deleteHabit(id);
  },
  toggleHabitDate: (id, date) => {
    vibrateImpact();
    core.toggleCheck(id, date);
  },
  saveHabitProgress: ({ habitId, date, value }) => {
    vibrateSuccess();
    core.setCheckValue(habitId, date, value);
  },
  addRestPeriod: ({ habitId, from, to }) => core.addRest(habitId, from, to),
  removeRestPeriod: ({ habitId, from, to }) => core.removeRest(habitId, from, to),
  saveReview: ({ date, mood, note }) => {
    vibrateSuccess();
    core.saveReview(date, mood, note);
  },
}));

// Пересчитываем старое представление, когда меняются данные или наступает новый день.
useDataStore.subscribe((s, prev) => {
  if (s.data === prev.data && s.today === prev.today && s.ready === prev.ready) return;
  useAppStore.setState({
    state:
      s.data === prev.data && s.ready === prev.ready
        ? { ...useAppStore.getState().state }
        : toLegacyState(s.data),
    hydrated: s.ready,
    today: s.today,
  });
});
