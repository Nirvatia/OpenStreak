/**
 * Геозоны: места для напоминаний ставятся в систему, и она сама будит приложение при входе в
 * круг или выходе из него — даже при закрытом экране. Что ставить — решает `core/places.ts`,
 * что напомнить — `core/placeAlerts.ts`; здесь только обращения к системе.
 *
 * Задача объявляется при загрузке модуля (см. index.ts): в фоне интерфейса нет, а система
 * ищет задачу по имени сразу после запуска JS.
 */
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { loadData } from '../app/loadData';
import { todayStr } from '../core/dates';
import { placeAlerts, shouldFire, type PlaceEvent } from '../core/placeAlerts';
import { ZONE_LIMIT, neededTriggers, pickZones } from '../core/places';
import { effectiveSettings } from '../core/settings';
import { useDataStore } from '../core/store';
import { translate } from '../i18n';
import { notifyNow } from './notifications';
import { storage as kv } from './storage';

export const GEOFENCE_TASK = 'openstreak-geofence';
const ALERTS_KEY = 'openstreak.placeAlerts';
const DAY_MS = 24 * 60 * 60 * 1000;

const supported = Platform.OS === 'ios' || Platform.OS === 'android';
const zoneLimit = Platform.OS === 'ios' ? ZONE_LIMIT.ios : ZONE_LIMIT.android;

export type GeoAccess = 'always' | 'foreground' | 'denied' | 'unsupported';

async function readSent(): Promise<Record<string, number>> {
  try {
    const raw = await kv.getString(ALERTS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== 'object') return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed)) if (typeof v === 'number') out[k] = v;
    return out;
  } catch {
    return {};
  }
}

/** Система сообщила о входе или выходе — показываем напоминания этого места. */
async function onPlaceEvent(event: PlaceEvent, placeId: string): Promise<void> {
  await loadData();
  const data = useDataStore.getState().data;
  const alerts = placeAlerts(data, placeId, event, todayStr());
  if (alerts.length === 0) return;

  const { locale, tone } = effectiveSettings(data);
  const sent = await readSent();
  const nowMs = Date.now();
  for (const k of Object.keys(sent)) if (nowMs - sent[k]! > DAY_MS) delete sent[k];

  for (const a of alerts) {
    if (!shouldFire(sent[a.key], nowMs)) continue;
    sent[a.key] = nowMs;
    await notifyNow({
      title: a.title,
      body: translate(locale, tone, event === 'enter' ? 'notify.placeEnter' : 'notify.placeExit', {
        place: a.placeName,
      }),
      data: { kind: a.kind, id: a.subjectId, placeId },
    });
  }
  await kv.setString(ALERTS_KEY, JSON.stringify(sent));
}

if (supported) {
  TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
    if (error || !data) return;
    const { eventType, region } = data as {
      eventType: Location.GeofencingEventType;
      region: Location.LocationRegion;
    };
    if (!region.identifier) return;
    const event: PlaceEvent | null =
      eventType === Location.GeofencingEventType.Enter
        ? 'enter'
        : eventType === Location.GeofencingEventType.Exit
          ? 'exit'
          : null;
    if (!event) return;
    try {
      await onPlaceEvent(event, region.identifier);
    } catch (e) {
      console.warn('Place alert failed', e);
    }
  });
}

/** Какой доступ к геолокации у приложения: для работы в фоне нужен «Всегда». */
export async function geofenceAccess(): Promise<GeoAccess> {
  if (!supported) return 'unsupported';
  try {
    const bg = await Location.getBackgroundPermissionsAsync();
    if (bg.granted) return 'always';
    const fg = await Location.getForegroundPermissionsAsync();
    return fg.granted ? 'foreground' : 'denied';
  } catch {
    return 'denied';
  }
}

/** Спросить доступ: сначала «пока открыто», затем «Всегда» (на Android 11+ — через настройки). */
export async function requestGeofenceAccess(): Promise<GeoAccess> {
  if (!supported) return 'unsupported';
  try {
    const fg = await Location.requestForegroundPermissionsAsync();
    if (!fg.granted) return 'denied';
    await Location.requestBackgroundPermissionsAsync();
  } catch (e) {
    console.warn('Location permission request failed', e);
  }
  const access = await geofenceAccess();
  if (access === 'always') await syncGeofences();
  return access;
}

let lastSignature: string | null = null;

/**
 * Привести геозоны в системе к данным: поставить нужные места (не больше лимита ОС),
 * лишние снять. Без доступа «Всегда» ничего не ставит.
 */
export async function syncGeofences(): Promise<void> {
  if (!supported) return;
  try {
    const data = useDataStore.getState().data;
    const triggers = neededTriggers(data);
    const started = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK);

    if (triggers.size === 0) {
      lastSignature = null;
      if (started) await Location.stopGeofencingAsync(GEOFENCE_TASK);
      return;
    }
    if ((await geofenceAccess()) !== 'always') return;

    // Мест больше лимита — берём ближайшие к последней известной позиции.
    let near: { latitude: number; longitude: number } | undefined;
    if (triggers.size > zoneLimit) {
      const last = await Location.getLastKnownPositionAsync().catch(() => null);
      if (last) near = { latitude: last.coords.latitude, longitude: last.coords.longitude };
    }
    const regions: Location.LocationRegion[] = pickZones(
      data.places,
      triggers.keys(),
      zoneLimit,
      near
    ).map((p) => ({
      identifier: p.id,
      latitude: p.latitude,
      longitude: p.longitude,
      radius: p.radius,
      notifyOnEnter: triggers.get(p.id)!.enter,
      notifyOnExit: triggers.get(p.id)!.exit,
    }));

    const signature = JSON.stringify(regions);
    if (started && signature === lastSignature) return;
    await Location.startGeofencingAsync(GEOFENCE_TASK, regions);
    lastSignature = signature;
  } catch (e) {
    console.warn('Geofence sync failed', e);
  }
}
