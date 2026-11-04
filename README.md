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

### Веб-режим для разработки

```bash
npm run web        # откроет http://localhost:8081
```

Интерфейс можно проверять в браузере на ПК: на широком окне приложение показывается в колонке
шириной с телефон (`src/app/WebFrame.tsx`), данные хранятся в `localStorage` браузера.
Уведомления, вибрация, выбор даты и экспорт файлов на вебе не работают или работают упрощённо —
их проверяйте на телефоне.

Каталог компонентов «Штампа» (только в разработке): `http://localhost:8081/?catalog` на вебе или
`EXPO_PUBLIC_CATALOG=1 npx expo start` для телефона.

### Нативная сборка

Напоминания и (в будущем) геозоны требуют dev-сборки — в Expo Go они работают не полностью:

```bash
npx expo run:android                                     # локально (нужен Android Studio)
npx eas build --profile development --platform android   # или в облаке EAS
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
