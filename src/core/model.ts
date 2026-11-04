/**
 * Модель данных v2 — источник правды приложения.
 *
 * Каждая запись несёт `id`, `createdAt`, `updatedAt` и `deletedAt` (мягкое удаление).
 * Этого достаточно для будущей синхронизации по принципу «побеждает последнее изменение»:
 * при слиянии сравнивается `updatedAt` записей с одинаковым `id`.
 *
 * Даты дней — строки `YYYY-MM-DD` в локальной зоне пользователя, время — `HH:MM` или ''.
 */

/** Локальная дата `YYYY-MM-DD`. */
export type ISODate = string;
/** Время `HH:MM`; пустая строка — не задано. */
export type ClockTime = string;

export type RecordMeta = {
  id: string;
  /** мс с эпохи */
  createdAt: number;
  /** мс с эпохи; меняется при каждом изменении записи, в том числе при удалении */
  updatedAt: number;
  /** мс с эпохи; не null — запись удалена */
  deletedAt: number | null;
};

export type Priority = 0 | 1 | 2 | 3;
export type PlaceTrigger = 'enter' | 'exit';

export type Task = RecordMeta & {
  title: string;
  notes: string;
  /** день, на который запланировано; null — без даты */
  date: ISODate | null;
  priority: Priority;
  /** день выполнения; null — не выполнено */
  doneOn: ISODate | null;
  /** момент выполнения (мс) — для журнала «Сделано»; null — не выполнено или неизвестно */
  doneAt: number | null;
  areaId: string | null;
  remindAt: ClockTime;
  placeId: string | null;
  placeTrigger: PlaceTrigger | null;
};

export type HabitKind = 'good' | 'bad';
export type HabitMeasure = 'boolean' | 'numeric';
export type HabitUnit = 'count' | 'minutes' | 'hours';

export type Habit = RecordMeta & {
  name: string;
  kind: HabitKind;
  /** ключ иконки из набора */
  icon: string;
  color: string;
  /** дни недели (0 = вс … 6 = сб); null — каждый день */
  days: number[] | null;
  question: string;
  remindAt: ClockTime;
  areaId: string | null;
  /** с этого дня привычка учитывается в сериях и идеальных днях */
  startDate: ISODate;
  measure: HabitMeasure;
  unit: HabitUnit;
  /** цель за день для numeric; для boolean всегда 1 */
  target: number;
  placeId: string | null;
  placeTrigger: PlaceTrigger | null;
  /** архив: не показывается и не учитывается, история сохраняется */
  archivedAt: number | null;
};

/**
 * Отметка привычки за день. Для полезной — сделано (или сколько сделано для numeric),
 * для вредной — срыв. `slip` — «слил сегодня» у полезной (value тогда 0). `id` детерминированный: `${habitId}|${date}`, чтобы отметки
 * с разных устройств за один день сливались, а не дублировались.
 */
export type HabitCheck = RecordMeta & {
  habitId: string;
  date: ISODate;
  value: number;
  /** полезная привычка слита за этот день; у записей до этапа 4 поля нет — значит false */
  slip?: boolean;
};

export type RestPeriod = RecordMeta & {
  habitId: string;
  from: ISODate;
  to: ISODate;
};

export type Area = RecordMeta & {
  name: string;
  color: string;
  icon: string;
};

export type Goal = RecordMeta & {
  /** сфера; null — цель без сферы */
  areaId: string | null;
  text: string;
  /** «зачёт, если» */
  criterion: string;
  reward: string;
  penalty: string;
  deadline: ISODate | null;
  doneOn: ISODate | null;
};

/** Итог дня. `id` = дата. */
export type DayReview = RecordMeta & {
  date: ISODate;
  /** 1…5 */
  mood: number;
  note: string;
};

/** Место для напоминаний по геозоне. */
export type Place = RecordMeta & {
  name: string;
  latitude: number;
  longitude: number;
  /** метры */
  radius: number;
};

export type ThemeChoice = 'dark' | 'light' | 'system';
export type ToneChoice = 'plain' | 'bro';
export type LocaleChoice = 'ru' | 'en' | 'es';

/**
 * Настройки пользователя — одна запись с id `SETTINGS_ID`. Это обычная запись с метаданными,
 * поэтому синхронизируется вместе с данными (побеждает последнее изменение).
 */
export type Settings = RecordMeta & {
  /** «Ночь» = dark, «Рассвет» = light */
  theme: ThemeChoice;
  tone: ToneChoice;
  /** цитата волка (одна в день, только в пацанском тоне) */
  quotes: boolean;
  /** звания и очки */
  ranks: boolean;
  locale: LocaleChoice;
  /** 1 — неделя с понедельника, 0 — с воскресенья */
  weekStart: 0 | 1;
  /** время напоминания об итоге дня; '' — не напоминать */
  reviewAt: ClockTime;
};

export const SETTINGS_ID = 'me';

export type Collections = {
  tasks: Task;
  habits: Habit;
  checks: HabitCheck;
  rests: RestPeriod;
  areas: Area;
  goals: Goal;
  reviews: DayReview;
  places: Place;
  settings: Settings;
};

export type CollectionName = keyof Collections;
export type AnyRecord = Collections[CollectionName];

export const COLLECTIONS: readonly CollectionName[] = [
  'tasks',
  'habits',
  'checks',
  'rests',
  'areas',
  'goals',
  'reviews',
  'places',
  'settings',
] as const;

export type Profile = {
  /** день первого запуска */
  startedAt: ISODate;
};

/** Все данные приложения в памяти (включая мягко удалённые записи). */
export type Snapshot = { [K in CollectionName]: Record<string, Collections[K]> } & {
  profile: Profile;
};

export function emptySnapshot(startedAt: ISODate): Snapshot {
  return {
    tasks: {},
    habits: {},
    checks: {},
    rests: {},
    areas: {},
    goals: {},
    reviews: {},
    places: {},
    settings: {},
    profile: { startedAt },
  };
}

export function checkId(habitId: string, date: ISODate): string {
  return `${habitId}|${date}`;
}

/** Живые (не удалённые) записи коллекции. */
export function live<T extends RecordMeta>(map: Record<string, T>): T[] {
  return Object.values(map).filter((r) => r.deletedAt === null);
}
