/**
 * Места для напоминаний по геозоне — чистая логика без обращений к системе:
 * разбор координат из текста и ссылок карт, проверки и выбор зон под лимит ОС.
 * Саму проверку «вошёл / вышел» делает операционная система (см. services).
 */
import { live, type Place, type Snapshot } from './model';

export type Coords = { latitude: number; longitude: number };

export const RADIUS_MIN = 100;
export const RADIUS_MAX = 2000;
export const RADIUS_DEFAULT = 150;
/** Лимиты ОС на число одновременно отслеживаемых зон. */
export const ZONE_LIMIT = { ios: 20, android: 100 } as const;

export function isValidCoords(c: Coords): boolean {
  return (
    Number.isFinite(c.latitude) &&
    Number.isFinite(c.longitude) &&
    Math.abs(c.latitude) <= 90 &&
    Math.abs(c.longitude) <= 180
  );
}

export function clampRadius(r: number): number {
  if (!Number.isFinite(r)) return RADIUS_DEFAULT;
  return Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, Math.round(r)));
}

const NUM = '(-?\\d{1,3}(?:\\.\\d+)?)';

function make(lat: string, lon: string): Coords | null {
  const c = { latitude: Number(lat), longitude: Number(lon) };
  return isValidCoords(c) ? c : null;
}

function decode(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

/**
 * Достаёт широту и долготу из вставленного текста: «55.7558, 37.6173» или ссылки карт
 * (Google, Яндекс, OpenStreetMap, 2ГИС). Короткие ссылки координат не содержат — вернётся null.
 * У Яндекса и 2ГИС в ссылках порядок «долгота, широта», у остальных — «широта, долгота».
 * Текст приходит извне — любая ошибка разбора даёт null.
 */
export function parseCoordinates(input: string): Coords | null {
  const text = decode(input.trim()).slice(0, 2000);
  if (!text) return null;

  // Яндекс: ll=долгота,широта (в т. ч. pt=…)
  const yandex = text.match(new RegExp(`[?&](?:ll|pt)=${NUM}[,%2C]+${NUM}`));
  if (yandex) return make(yandex[2]!, yandex[1]!);

  // 2ГИС: m=долгота,широта/зум
  const gis = text.match(new RegExp(`[?&]m=${NUM}[,%2C]+${NUM}`));
  if (gis) return make(gis[2]!, gis[1]!);

  // OpenStreetMap: mlat=…&mlon=…
  const mlat = text.match(new RegExp(`[?&]mlat=${NUM}`));
  const mlon = text.match(new RegExp(`[?&]mlon=${NUM}`));
  if (mlat && mlon) return make(mlat[1]!, mlon[1]!);
  // OpenStreetMap: #map=зум/широта/долгота
  const osm = text.match(new RegExp(`#map=\\d+/${NUM}/${NUM}`));
  if (osm) return make(osm[1]!, osm[2]!);

  // Google: @широта,долгота или q= / ll= / query= с парой чисел; также geo:широта,долгота
  const google = text.match(new RegExp(`@${NUM},${NUM}`));
  if (google) return make(google[1]!, google[2]!);
  const query = text.match(new RegExp(`[?&](?:q|query|destination)=${NUM},\\s*${NUM}`));
  if (query) return make(query[1]!, query[2]!);
  const geo = text.match(new RegExp(`^geo:${NUM},${NUM}`));
  if (geo) return make(geo[1]!, geo[2]!);

  // Просто пара чисел; запятая как разделитель дробной части («55,7558 37,6173») тоже допустима.
  const plain = text.match(/^(-?\d{1,3}(?:[.,]\d+)?)\s*[;,\s]\s*(-?\d{1,3}(?:[.,]\d+)?)$/);
  if (plain) return make(plain[1]!.replace(',', '.'), plain[2]!.replace(',', '.'));

  return null;
}

/** «55.75580, 37.61730» — в таком виде координаты показываем и вставляем в поле. */
export function formatCoords(c: Coords): string {
  return `${c.latitude.toFixed(5)}, ${c.longitude.toFixed(5)}`;
}

/** Расстояние между точками по дуге большого круга, метры. */
export function distanceMeters(a: Coords, b: Coords): number {
  const R = 6371008.8;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Id мест, на которые есть живое невыполненное дело или живая привычка с триггером. */
export function neededPlaceIds(d: Pick<Snapshot, 'tasks' | 'habits'>): Set<string> {
  const ids = new Set<string>();
  for (const t of live(d.tasks)) {
    if (t.placeId && t.placeTrigger && t.doneOn === null) ids.add(t.placeId);
  }
  for (const h of live(d.habits)) {
    if (h.placeId && h.placeTrigger && h.archivedAt === null) ids.add(h.placeId);
  }
  return ids;
}

/**
 * Какие места ставить в ОС. Нужны только места из `neededIds`; если их больше лимита — берём ближайшие к `near` (без неё — в порядке
 * создания). Возвращает не больше `limit` мест.
 */
export function pickZones(
  places: Record<string, Place>,
  neededIds: Iterable<string>,
  limit: number,
  near?: Coords
): Place[] {
  const wanted = new Set(neededIds);
  const list = live(places).filter((p) => wanted.has(p.id));
  list.sort((a, b) =>
    near
      ? distanceMeters(near, a) - distanceMeters(near, b)
      : a.createdAt - b.createdAt || a.id.localeCompare(b.id)
  );
  return list.slice(0, Math.max(0, limit));
}
