/**
 * Обращения к системе для мест: текущая позиция, открытие приложения карт, буфер обмена.
 * Логика (разбор ссылок, выбор зон) — в `core/places.ts`.
 */
import * as Clipboard from 'expo-clipboard';
import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';
import type { Coords } from '../core/places';

export type PositionResult =
  { ok: true; coords: Coords } | { ok: false; reason: 'denied' | 'failed' };

/** Где пользователь сейчас. Разрешение «пока приложение открыто» — для «Я здесь» достаточно. */
export async function currentPosition(): Promise<PositionResult> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) return { ok: false, reason: 'denied' };
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return { ok: true, coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude } };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}

/** Открыть приложение карт, чтобы найти место и поделиться ссылкой или координатами. */
export async function openMapsApp(): Promise<boolean> {
  const url =
    Platform.OS === 'android'
      ? 'geo:0,0?q='
      : Platform.OS === 'ios'
        ? 'https://maps.apple.com/'
        : 'https://www.openstreetmap.org/';
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

export async function readClipboard(): Promise<string> {
  try {
    return await Clipboard.getStringAsync();
  } catch {
    return '';
  }
}
