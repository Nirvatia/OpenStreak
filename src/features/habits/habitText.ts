/** Подписи и вид дней привычки — общие для списка «Привычки» и карточки привычки. */
import { weekday } from '../../core/dates';
import type { HabitDay } from '../../core/habits';
import type { Habit, ISODate } from '../../core/model';
import type { MessageKey } from '../../i18n';
import type { Translate } from '../../store/prefsStore';
import type { MoonDay } from '../../ui/WeekMoons';
import type { DayState } from '../../ui/moon';
import { dayMonth } from '../format';

const short = (t: Translate, d: number) => t(`day.short.${d}` as MessageKey);

/** «каждый день», «пн–пт», «пн, ср, пт» — дни в порядке недели пользователя. */
export function scheduleLabel(t: Translate, days: number[] | null, weekStart: 0 | 1): string {
  if (!days || days.length === 7) return t('habits.everyDay');
  const order = Array.from({ length: 7 }, (_, i) => (i + weekStart) % 7).filter((d) =>
    days.includes(d)
  );
  // Подряд идущие дни (3 и больше) — диапазоном.
  const pos = order.map((d) => (d - weekStart + 7) % 7);
  const consecutive = pos.every((p, i) => i === 0 || p === pos[i - 1] + 1);
  if (consecutive && order.length >= 3) {
    return `${short(t, order[0])}–${short(t, order[order.length - 1])}`;
  }
  return order.map((d) => short(t, d)).join(', ');
}

/** Норма: «100 в день», «20 мин в день»; для отметок «да/нет» — расписание. */
export function targetLabel(t: Translate, h: Habit, weekStart: 0 | 1): string {
  if (h.measure !== 'numeric') return scheduleLabel(t, h.days, weekStart);
  if (h.unit === 'count') return t('habits.perDay', { target: h.target });
  return t('habits.perDayUnit', { target: h.target, unit: t(`unit.${h.unit}` as MessageKey) });
}

/** Подпись под названием в списке. */
export function habitMeta(t: Translate, h: Habit, todayValue: number, weekStart: 0 | 1): string {
  if (h.kind === 'bad') return t('habits.badSince', { date: dayMonth(t, h.startDate) });
  if (h.measure === 'numeric') {
    return `${targetLabel(t, h, weekStart)} · ${t('habits.today', { value: todayValue })}`;
  }
  return targetLabel(t, h, weekStart);
}

/** Подпись бейджа серии: «дней», «чистых», «с нуля». */
export function streakLabel(t: Translate, h: Habit, streak: number): string {
  if (streak === 0) return t('habits.streakZero');
  return t(h.kind === 'bad' ? 'habits.streakClean' : 'habits.streakDays', { count: streak });
}

/** День привычки → вид луны. Дни не по плану рисуем как выходной (пунктир). */
export function dayState(day: HabitDay, h: Habit, today: ISODate): DayState {
  switch (day.mark) {
    case 'full':
      return h.kind === 'bad' ? 'clean' : 'done';
    case 'partial':
      return 'partial';
    case 'slip':
      return 'slip';
    case 'rest':
    case 'off':
      return 'rest';
    case 'empty':
      return day.date === today ? 'today' : 'empty';
    default:
      return 'empty';
  }
}

export function moonDays(days: HabitDay[], h: Habit, today: ISODate): MoonDay[] {
  return days.map((d) => ({
    weekday: weekday(d.date),
    state: dayState(d, h, today),
    part: d.fraction,
    today: d.date === today,
  }));
}
