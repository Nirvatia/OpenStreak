/**
 * Русские строки. Ключ — «где.что». Значение — строка, формы множественного числа
 * ({ one, few, many, other }) или пара тонов ({ plain, bro }).
 * Подстановки — `{name}`; число для форм — параметр `count`.
 * Заглавные буквы в макете делает стиль (`textTransform`), здесь пишем обычным регистром.
 */
import type { Message } from './types';

export const ru = {
  'tab.today': 'Сегодня',
  'tab.tasks': 'Задачи',
  'tab.habits': 'Привычки',
  'tab.goals': 'Цели',
  'tab.stats': 'Статы',

  'stamp.done': { plain: 'Готово', bro: 'Зачёт' },
  'stamp.debt': { plain: 'Просрочено', bro: 'Долг' },
  'stamp.slip': { plain: 'Срыв', bro: 'Слив' },
  'stamp.rest': 'Вых',
  'stamp.closed': 'Закрыт',
  'stamp.clean': { plain: 'Чисто', bro: 'Держись' },

  'wolf.active': 'В деле',
  'wolf.angry': 'Злой',
  'wolf.rest': 'Отдых',

  'common.undo': 'Отменить',
  'common.back': 'Назад',
  'common.close': 'Закрыть',
  'common.add': 'Добавить',

  'day.short.0': 'Вс',
  'day.short.1': 'Пн',
  'day.short.2': 'Вт',
  'day.short.3': 'Ср',
  'day.short.4': 'Чт',
  'day.short.5': 'Пт',
  'day.short.6': 'Сб',

  'a11y.check': 'Отметить: {title}',
  'a11y.uncheck': 'Снять отметку: {title}',
  'a11y.progress': '{done} из {total}',
  'a11y.tally': {
    one: '{count} палочка',
    few: '{count} палочки',
    many: '{count} палочек',
    other: '{count} палочки',
  },
  'week.clean': 'Чисто',

  'unit.days': {
    one: '{count} день',
    few: '{count} дня',
    many: '{count} дней',
    other: '{count} дня',
  },

  'toast.taskDeleted': { plain: 'Задача удалена', bro: 'Вычеркнул.' },
  'toast.dayClosed': { plain: 'Все привычки выполнены', bro: 'День закрыт. Красава.' },
  'toast.confirmDelete': { plain: 'Нажмите ещё раз для удаления', bro: 'Точно? Жми ещё раз.' },
  'toast.restDay': { plain: 'Сегодня у привычек выходной', bro: 'Выходной. Серия не горит.' },
  'toast.streakLost': { plain: 'Серия прервана', bro: 'Слил — бывает. Встал и пошёл.' },
  'toast.goalCreated': { plain: 'Цель создана', bro: 'Слово дано. Печать стоит.' },
  'tasks.overdue': { plain: 'Просроченные', bro: 'Долги' },
} as const satisfies Record<string, Message>;

export type MessageKey = keyof typeof ru;
