# OpenStreak

Трекер задач, привычек и целей с сериями, «идеальными днями» и итогом дня.
Работает офлайн, все данные хранятся на устройстве.

**Стек:** Expo SDK 58 · React Native 0.88 · TypeScript · zustand

## Запуск

```bash
npm install
npm start          # Expo dev server
npm run android    # или ios / web
```

Напоминания и (в будущем) геозоны требуют dev-сборки — в Expo Go они работают не полностью:

```bash
npx eas build --profile development --platform android
```

## Проверки

```bash
npm run check           # typecheck + lint + тесты + контраст
npm run format          # Prettier
npm run check:contrast  # WCAG-контраст всех пар цветов обеих тем
```

## Структура

```
src/
  app/          корневой компонент
  navigation/   нижние вкладки
  screens/      5 экранов: Сегодня, Задачи, Привычки, Цели, Статистика
  components/   UI и шторки (bottom sheets)
  store/        zustand-сторы (данные, UI, тема, календарь)
  services/     хранилище, уведомления, экспорт/импорт, вибро
  core/         ядро: модель данных v2, хранилище, миграция, операции, план напоминаний
  utils/        логика экранов: даты, серии, идеальные дни, статистика
  theme/        токены и палитры тем
scripts/        служебные скрипты (проверка контраста)
```

## Дорожная карта

См. [ROADMAP.md](ROADMAP.md).

## Лицензия

См. [LICENSE](LICENSE).
