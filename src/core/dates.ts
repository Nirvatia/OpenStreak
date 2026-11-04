/**
 * Арифметика дат `YYYY-MM-DD` без часовых поясов: дата — это номер дня, а не момент времени.
 * Считаем в UTC, чтобы переход на летнее время не сдвигал дни.
 */
import type { ISODate } from './model';

const DAY_MS = 86_400_000;

function toUtc(d: ISODate): number {
  return Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)));
}

function fromUtc(ms: number): ISODate {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(d: ISODate, n: number): ISODate {
  return fromUtc(toUtc(d) + n * DAY_MS);
}

/** Сколько дней от `from` до `to` (to − from). */
export function diffDays(from: ISODate, to: ISODate): number {
  return Math.round((toUtc(to) - toUtc(from)) / DAY_MS);
}

/** День недели: 0 = вс … 6 = сб. */
export function weekday(d: ISODate): number {
  return new Date(toUtc(d)).getUTCDay();
}

/** Первый день недели, в которую входит `d`. `weekStart`: 1 — понедельник, 0 — воскресенье. */
export function startOfWeek(d: ISODate, weekStart: 0 | 1): ISODate {
  const back = (weekday(d) - weekStart + 7) % 7;
  return addDays(d, -back);
}

/** Дни от `from` до `to` включительно (пусто, если from > to). */
export function daysBetween(from: ISODate, to: ISODate): ISODate[] {
  const out: ISODate[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

/** Локальное время `HH:MM` момента `ms`. */
export function clockOf(ms: number): string {
  const t = new Date(ms);
  return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
}
