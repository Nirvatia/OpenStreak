// Вибрация через expo-haptics, загрузка ленивая: отметка — короткий толчок, закрытый договор
// и закрытый день — «успех».

export function vibrateImpact(): void {
  import('expo-haptics').then((H) => H.impactAsync(H.ImpactFeedbackStyle.Medium)).catch(() => {});
}

export function vibrateSuccess(): void {
  import('expo-haptics')
    .then((H) => H.notificationAsync(H.NotificationFeedbackType.Success))
    .catch(() => {});
}
