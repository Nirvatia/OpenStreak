import { create } from 'zustand';
import {
  AppState,
  Task,
  Priority,
  Area,
  Goal,
  Habit,
  HabitType,
  MeasureType,
  HabitUnit,
} from '../types/models';
import { storage, STATE_KEY } from '../services/storage';
import { todayStr, uid } from '../utils/text';
import { isScheduled, isRest } from '../utils/habits';
import { isPerfect } from '../utils/moods';
import { vibrateImpact, vibrateSuccess } from '../services/haptics';
import { askNotificationPermission } from '../services/notifications';

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

type AppStore = {
  state: AppState;
  hydrated: boolean;
  load: () => Promise<void>;
  save: () => Promise<void>;
  setState: (updater: (prev: AppState) => AppState) => void;
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
  addArea: (input: { name: string; color: string; icon: string; goals?: Goal[] }) => void;
  updateArea: (
    id: string,
    input: { name: string; color: string; icon: string; goals?: Goal[] }
  ) => void;
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

function getDefaultState(): AppState {
  return {
    tasks: [],
    habits: [],
    events: [],
    areas: [],
    moods: {},
    fired: {},
    startedAt: todayStr(),
  };
}

function normalizeState(raw: any): AppState {
  const state: AppState = {
    tasks: [],
    habits: [],
    events: [],
    areas: [],
    moods: {},
    fired: {},
    startedAt: raw.startedAt || todayStr(),
  };
  if (Array.isArray(raw.tasks)) {
    state.tasks = raw.tasks.map((x: any) => ({
      id: x.id,
      title: x.title,
      date: x.date ?? null,
      priority: x.priority ?? 0,
      notes: x.notes ?? '',
      done: x.done ?? false,
      doneAt: x.doneAt ?? null,
      createdAt: x.createdAt,
      area: x.area ?? null,
      remind: x.remind ?? '',
    }));
  }
  if (Array.isArray(raw.habits)) {
    state.habits = raw.habits.map((h: any) => ({
      id: h.id,
      name: h.name,
      type: h.type ?? 'good',
      emoji: h.emoji,
      color: h.color,
      days: h.days ?? null,
      dates: h.dates ?? [],
      question: h.question ?? '',
      remind: h.remind ?? '',
      area: h.area ?? null,
      createdAt: h.createdAt ?? state.startedAt,
      rest: Array.isArray(h.rest) ? h.rest : [],
      progress: h.progress ?? {},
      measureType: h.measureType ?? 'boolean',
      unit: h.unit ?? 'count',
      target: h.target ?? 1,
    }));
  }
  if (Array.isArray(raw.events)) state.events = raw.events;
  if (Array.isArray(raw.areas)) {
    state.areas = raw.areas.map((a: any) => ({
      id: a.id,
      name: a.name,
      color: a.color,
      icon: a.icon ?? 'target',
      goals: Array.isArray(a.goals)
        ? a.goals.map((g: any) => ({
            id: g.id,
            text: g.text,
            crit: g.crit ?? '',
            rew: g.rew ?? '',
            pen: g.pen ?? '',
            dead: g.dead ?? null,
            done: g.done ?? false,
            doneAt: g.doneAt ?? null,
          }))
        : [],
    }));
  }
  if (raw.moods && typeof raw.moods === 'object') state.moods = raw.moods;
  if (raw.fired && typeof raw.fired === 'object') state.fired = raw.fired;
  return state;
}

export const useAppStore = create<AppStore>((set, get) => ({
  state: getDefaultState(),
  hydrated: false,
  load: async () => {
    try {
      const saved = await storage.getString(STATE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const normalized = normalizeState(parsed);
          set({ state: normalized, hydrated: true });
        } catch (parseError) {
          console.warn('Corrupted state, resetting:', parseError);
          await storage.delete(STATE_KEY);
          const defaultState = getDefaultState();
          await storage.setString(STATE_KEY, JSON.stringify(defaultState));
          set({ state: defaultState, hydrated: true });
        }
      } else {
        const defaultState = getDefaultState();
        await storage.setString(STATE_KEY, JSON.stringify(defaultState));
        set({ state: defaultState, hydrated: true });
      }
    } catch (e) {
      console.error('Failed to load state:', e);
      const defaultState = getDefaultState();
      set({ state: defaultState, hydrated: true });
    }
  },
  save: async () => {
    try {
      const state = get().state;
      await storage.setString(STATE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  },
  setState: (updater: (prev: AppState) => AppState) => {
    set((current) => {
      const newState = updater(current.state);
      return { state: newState };
    });
    get().save();
  },
  addTask: (input: { title: string; date?: string | null; area?: string | null }) => {
    const newTask: Task = {
      id: uid(),
      title: input.title.trim(),
      date: input.date ?? todayStr(),
      priority: 0,
      notes: '',
      done: false,
      doneAt: null,
      createdAt: Date.now(),
      area: input.area ?? null,
      remind: '',
    };
    get().setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
  },
  saveTask: (input: {
    id?: string;
    title: string;
    notes: string;
    date: string | null;
    priority: Priority;
    remind: string;
    area: string | null;
  }) => {
    if (input.remind) askNotificationPermission();
    vibrateSuccess();
    get().setState((prev) => {
      if (input.id) {
        return {
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === input.id
              ? {
                  ...t,
                  title: input.title,
                  notes: input.notes,
                  date: input.date,
                  priority: input.priority,
                  remind: input.remind,
                  area: input.area,
                }
              : t
          ),
        };
      }
      const newTask: Task = {
        id: uid(),
        title: input.title,
        notes: input.notes,
        date: input.date,
        priority: input.priority,
        done: false,
        doneAt: null,
        createdAt: Date.now(),
        area: input.area,
        remind: input.remind,
      };
      return { ...prev, tasks: [...prev.tasks, newTask] };
    });
  },
  toggleTask: (id: string) => {
    vibrateImpact();
    get().setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done, doneAt: !t.done ? todayStr() : null } : t
      ),
    }));
  },
  removeTask: (id: string) => {
    vibrateImpact();
    get().setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  },
  addArea: (input: { name: string; color: string; icon: string; goals?: Goal[] }) => {
    const newArea: Area = {
      id: uid(),
      name: input.name.trim(),
      color: input.color,
      icon: input.icon,
      goals: input.goals ?? [],
    };
    get().setState((prev) => ({
      ...prev,
      areas: [...prev.areas, newArea],
    }));
  },
  updateArea: (
    id: string,
    input: { name: string; color: string; icon: string; goals?: Goal[] }
  ) => {
    get().setState((prev) => ({
      ...prev,
      areas: prev.areas.map((a) =>
        a.id === id
          ? {
              ...a,
              name: input.name,
              color: input.color,
              icon: input.icon,
              goals: input.goals ?? a.goals,
            }
          : a
      ),
    }));
  },
  removeArea: (id: string) => {
    vibrateImpact();
    get().setState((prev) => ({
      ...prev,
      areas: prev.areas.filter((a) => a.id !== id),
      tasks: prev.tasks.map((t) => (t.area === id ? { ...t, area: null } : t)),
      habits: prev.habits.map((h) => (h.area === id ? { ...h, area: null } : h)),
    }));
  },
  addGoal: (input: {
    areaId: string;
    text: string;
    crit: string;
    rew: string;
    pen: string;
    dead: string | null;
  }) => {
    vibrateSuccess();
    get().setState((prev) => ({
      ...prev,
      areas: prev.areas.map((a) =>
        a.id === input.areaId
          ? {
              ...a,
              goals: [
                ...a.goals,
                {
                  id: uid(),
                  text: input.text,
                  crit: input.crit,
                  rew: input.rew,
                  pen: input.pen,
                  dead: input.dead,
                  done: false,
                  doneAt: null,
                },
              ],
            }
          : a
      ),
    }));
  },
  toggleGoalDone: (input: { areaId: string; goalId: string }) => {
    vibrateImpact();
    get().setState((prev) => ({
      ...prev,
      areas: prev.areas.map((a) =>
        a.id === input.areaId
          ? {
              ...a,
              goals: a.goals.map((g) =>
                g.id === input.goalId
                  ? { ...g, done: !g.done, doneAt: !g.done ? todayStr() : null }
                  : g
              ),
            }
          : a
      ),
    }));
  },
  removeGoal: (input: { areaId: string; goalId: string }) => {
    vibrateImpact();
    get().setState((prev) => ({
      ...prev,
      areas: prev.areas.map((a) =>
        a.id === input.areaId ? { ...a, goals: a.goals.filter((g) => g.id !== input.goalId) } : a
      ),
    }));
  },
  addHabit: (input: HabitFormInput) => {
    if (input.remind) askNotificationPermission();
    vibrateSuccess();
    const newHabit: Habit = {
      id: uid(),
      name: input.name.trim(),
      type: input.type,
      question: input.question,
      emoji: input.emoji,
      color: input.color,
      days: input.days,
      dates: [],
      remind: input.remind,
      area: input.area,
      createdAt: todayStr(),
      rest: [],
      progress: {},
      measureType: input.measureType,
      unit: input.measureType === 'numeric' ? input.unit : 'count',
      target: input.measureType === 'numeric' ? input.target : 1,
    };
    get().setState((prev) => ({
      ...prev,
      habits: [...prev.habits, newHabit],
    }));
  },
  updateHabit: (id: string, input: HabitFormInput) => {
    if (input.remind) askNotificationPermission();
    vibrateSuccess();
    get().setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) =>
        h.id === id
          ? {
              ...h,
              name: input.name,
              type: input.type,
              question: input.question,
              emoji: input.emoji,
              color: input.color,
              days: input.days,
              remind: input.remind,
              area: input.area,
              measureType: input.measureType,
              unit: input.measureType === 'numeric' ? input.unit : 'count',
              target: input.measureType === 'numeric' ? input.target : 1,
            }
          : h
      ),
    }));
  },
  removeHabit: (id: string) => {
    vibrateImpact();
    get().setState((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== id),
    }));
  },
  toggleHabitDate: (id: string, dateStr: string) => {
    vibrateImpact();
    get().setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => {
        if (h.id !== id) return h;
        const ix = h.dates.indexOf(dateStr);
        const dates = [...h.dates];
        const progress = { ...h.progress };
        if (ix > -1) {
          dates.splice(ix, 1);
          delete progress[dateStr];
        } else {
          dates.push(dateStr);
          progress[dateStr] = 1;
        }
        return { ...h, dates, progress };
      }),
    }));
  },
  saveHabitProgress: (input: { habitId: string; date: string; value: number }) => {
    vibrateSuccess();
    get().setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => {
        if (h.id !== input.habitId) return h;
        const target = h.target || 1;
        const dates = [...h.dates];
        const progress = { ...h.progress };
        const value = input.value;
        if (value <= 0) {
          delete progress[input.date];
          const ix = dates.indexOf(input.date);
          if (ix > -1) dates.splice(ix, 1);
        } else {
          progress[input.date] = value;
          const ix = dates.indexOf(input.date);
          if (value >= target) {
            if (ix === -1) dates.push(input.date);
          } else {
            if (ix > -1) dates.splice(ix, 1);
          }
        }
        return { ...h, dates, progress };
      }),
    }));
  },
  addRestPeriod: (input: { habitId: string; from: string; to: string }) => {
    get().setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) =>
        h.id === input.habitId
          ? { ...h, rest: [...(h.rest || []), { f: input.from, t: input.to }] }
          : h
      ),
    }));
  },
  removeRestPeriod: (input: { habitId: string; from: string; to: string }) => {
    get().setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) =>
        h.id === input.habitId
          ? {
              ...h,
              rest: (h.rest || []).filter((r) => !(r.f === input.from && r.t === input.to)),
            }
          : h
      ),
    }));
  },
  saveReview: (input: { date: string; mood: number; note: string }) => {
    const state = get().state;
    const { date, mood, note } = input;
    const scope = state.tasks.filter((task) => task.date === date);
    const done = scope.filter((task) => task.done).length;
    const scheduled = state.habits.filter(
      (habit) => isScheduled(habit, date) && !isRest(habit, date)
    );
    const ok = scheduled.filter((habit) =>
      habit.type === 'bad' ? !habit.dates.includes(date) : habit.dates.includes(date)
    ).length;
    vibrateSuccess();
    get().setState((prev) => ({
      ...prev,
      moods: {
        ...prev.moods,
        [date]: {
          mood,
          note: note.trim(),
          tasksDone: done,
          tasksTotal: scope.length,
          habitsDone: ok,
          habitsTotal: scheduled.length,
          perfect: isPerfect(date, state.habits, state.startedAt),
        },
      },
    }));
  },
}));
