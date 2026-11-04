export async function askNotificationPermission(): Promise<void> {
  try {
    const N = await import('expo-notifications');
    await N.requestPermissionsAsync();
  } catch (e) {
    console.warn('Notifications unavailable:', e);
  }
}

export async function showNativeNotification(title: string, body: string): Promise<void> {
  try {
    const N = await import('expo-notifications');
    await N.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  } catch (e) {
    console.warn('Native notification failed:', e);
  }
}
