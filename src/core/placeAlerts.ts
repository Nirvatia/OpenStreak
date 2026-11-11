/**
 * Что напомнить, когда система сообщила о входе в зону или выходе из неё. Чистая логика:
 * тексты уведомлений строит слой services (строки — в i18n).
 */
import type { ISODate, Snapshot } from './model';
import { live } from './model';
import { dataOf, habitDay, indexHabits } from './habits';

export type PlaceEvent = 'enter' | 'exit';

export type PlaceAlert = {
  /** стабильный id: место + событие + запись — для защиты от повторов */
  key: string;
  kind: 'task' | 'habit';
  subjectId: string;
  title: string;
  placeName: string;
  event: PlaceEvent;
};

/** Не напоминать об одном и том же чаще, чем раз в это время: граница зоны «дребезжит». */
export const ALERT_MIN_GAP_MS = 30 * 60 * 1000;

export function placeAlerts(
  d: Pick<Snapshot, 'tasks' | 'habits' | 'checks' | 'rests' | 'places'>,
  placeId: string,
  event: PlaceEvent,
  today: ISODate
): PlaceAlert[] {
  const place = d.places[placeId];
  if (!place || place.deletedAt !== null) return [];
  const out: PlaceAlert[] = [];

  for (const t of live(d.tasks)) {
    if (t.placeId !== placeId || t.placeTrigger !== event || t.doneOn !== null) continue;
    // Дело на будущий день у места не напоминает: оно ещё не наступило.
    if (t.date !== null && t.date > today) continue;
    out.push({
      key: `${placeId}:${event}:t:${t.id}`,
      kind: 'task',
      subjectId: t.id,
      title: t.title,
      placeName: place.name,
      event,
    });
  }

  const idx = indexHabits(d);
  for (const h of live(d.habits)) {
    if (h.placeId !== placeId || h.placeTrigger !== event || h.archivedAt !== null) continue;
    if (h.kind === 'bad') continue;
    const mark = habitDay(h, dataOf(idx, h.id), today, today).mark;
    // Напоминаем, только если день по плану и норма ещё не выполнена.
    if (mark !== 'empty' && mark !== 'partial') continue;
    out.push({
      key: `${placeId}:${event}:h:${h.id}`,
      kind: 'habit',
      subjectId: h.id,
      title: h.name,
      placeName: place.name,
      event,
    });
  }
  return out;
}

/** Можно ли показать напоминание с этим ключом сейчас, если в прошлый раз показали в `last`. */
export function shouldFire(last: number | undefined, now: number): boolean {
  return last === undefined || now - last >= ALERT_MIN_GAP_MS || now < last;
}
