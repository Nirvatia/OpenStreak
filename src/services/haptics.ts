// Вибрация через expo-haptics, загрузка ленивая.

export function vibrateImpact(): void {
  import('expo-haptics').then((H) => H.impactAsync(H.ImpactFeedbackStyle.Medium)).catch(() => {});
}

export function vibrateSuccess(): void {
  import('expo-haptics')
    .then((H) => H.notificationAsync(H.NotificationFeedbackType.Success))
    .catch(() => {});
}
