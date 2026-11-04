/** Даты и время для подписей экранов — через строки (`src/i18n`), без текста в коде. */
import { weekday } from '../core/dates';
import type { ISODate } from '../core/model';
import type { MessageKey } from '../i18n';
import type { Translate } from '../store/prefsStore';

const month = (d: ISODate) => `date.month.${Number(d.slice(5, 7)) - 1}` as MessageKey;

/** «Вторник, 3 ноября» */
export function fullDate(t: Translate, d: ISODate): string {
  return t('date.full', {
    weekday: t(`date.weekdayTitle.${weekday(d)}` as MessageKey),
    day: Number(d.slice(8, 10)),
    month: t(month(d)),
  });
}

/** «3 ноября» */
export function dayMonth(t: Translate, d: ISODate): string {
  return t('date.dayMonth', { day: Number(d.slice(8, 10)), month: t(month(d)) });
}
