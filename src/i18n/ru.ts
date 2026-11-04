/**
 * Русские строки. Ключ — «где.что». Значение — строка, формы множественного числа
 * ({ one, few, many, other }) или пара тонов ({ plain, bro }).
 * Подстановки — `{name}`; число для форм — параметр `count`.
 * Заглавные буквы в макете делает стиль (`textTransform`), здесь пишем обычным регистром.
 */
import type { Message } from './types';

export const ru = {
  'tab.today': 'Сегодня',
  'tab.tasks': 'Дела',
  'tab.habits': 'Привычки',
  'tab.goals': 'Цели',
  'tab.pack': 'Стая',

  // Пометки в журнале дня и на карточках
  'mark.done': 'зачёт',
  'mark.slip': { plain: 'срыв', bro: 'слив' },
  'mark.clean': { plain: 'чисто', bro: 'держусь' },
  'mark.rest': 'выходной',
  'mark.debt': { plain: 'просрочено', bro: 'долг' },
  'mark.closed': 'закрыт',

  'wolf.active': 'В деле',
  'wolf.angry': 'Злой',
  'wolf.rest': 'Отдых',

  'common.undo': 'Отменить',
  'common.back': 'Назад',
  'common.close': 'Закрыть',
  'common.add': 'Добавить',
  'common.addPrompt': 'Запиши дело или привычку',

  'theme.dark': 'Ночь',
  'theme.light': 'Рассвет',
  'theme.system': 'Как в системе',

  'wolf.signature': '— волк',

  'day.short.0': 'вс',
  'day.short.1': 'пн',
  'day.short.2': 'вт',
  'day.short.3': 'ср',
  'day.short.4': 'чт',
  'day.short.5': 'пт',
  'day.short.6': 'сб',

  'a11y.check': 'Отметить: {title}',
  'a11y.uncheck': 'Снять отметку: {title}',
  'a11y.progress': '{done} из {total}',
  'a11y.notches': {
    one: '{count} зарубка',
    few: '{count} зарубки',
    many: '{count} зарубок',
    other: '{count} зарубки',
  },
  'a11y.priority': 'Важность {count} из 3',

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
