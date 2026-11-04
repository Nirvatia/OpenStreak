/**
 * Системные уведомления: разрешения, канал Android и сверка запланированных напоминаний
 * с планом из `core/reminders`. Напоминания ставятся в систему заранее — приходят,
 * даже если приложение закрыто.
 */
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';
import { REMINDER_ID_PREFIX, type PlannedReminder } from '../core/reminders';

const CHANNEL_ID = 'reminders';
const supported = Platform.OS === 'ios' || Platform.OS === 'android';

if (supported) {
  // Без обработчика уведомление при открытом приложении не показывается.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

let channelReady: Promise<void> | null = null;
function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return Promise.resolve();
  if (!channelReady) {
    channelReady = Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Напоминания',
      importance: AndroidImportance.HIGH,
    })
      .then(() => undefined)
      .catch((e) => {
        channelReady = null;
        console.warn('Notification channel setup failed', e);
      });
  }
  return channelReady;
}

/** Спросить разрешение (показывает системный диалог, если ещё не спрашивали). */
export async function askNotificationPermission(): Promise<boolean> {
  if (!supported) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const res = await Notifications.requestPermissionsAsync();
    return res.granted;
  } catch (e) {
    console.warn('Notifications unavailable:', e);
    return false;
  }
}

function content(r: PlannedReminder): Notifications.NotificationContentInput {
  return r.kind === 'task'
    ? { title: 'Задача', body: r.title, data: { kind: r.kind, id: r.subjectId } }
    : { title: r.title, body: 'Не забудь сегодня', data: { kind: r.kind, id: r.subjectId } };
}

/**
 * Привести запланированные напоминания к плану: отменить лишние и устаревшие,
 * добавить недостающие. Чужие уведомления (без нашего префикса) не трогаем.
 */
export async function syncReminders(plan: PlannedReminder[]): Promise<void> {
  if (!supported) return;
  try {
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return;
    await ensureChannel();

    const wanted = new Map(plan.map((r) => [r.id, r]));
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const have = new Set<string>();
    for (const n of scheduled) {
      const id = n.identifier;
      if (!id.startsWith(REMINDER_ID_PREFIX)) continue;
      const w = wanted.get(id);
      const c = w && content(w);
      if (!w || !c || n.content.title !== c.title || n.content.body !== c.body) {
        await Notifications.cancelScheduledNotificationAsync(id);
      } else {
        have.add(id);
      }
    }
    for (const r of plan) {
      if (have.has(r.id)) continue;
      await Notifications.scheduleNotificationAsync({
        identifier: r.id,
        content: content(r),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: r.at,
          channelId: CHANNEL_ID,
        },
      });
    }
  } catch (e) {
    console.warn('Reminder sync failed', e);
  }
}
