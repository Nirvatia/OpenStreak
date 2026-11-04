# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.
The project is on **Expo SDK 57** (React Native 0.86). Install native modules with `npx expo install`
so versions match `expo/bundledNativeModules.json`; never bump `expo` to another major by hand.

# Rules for this repo

- **Contrast is mandatory.** Every text/background pair must pass WCAG 2.x (≥ 4.5 for normal text,
  ≥ 3 for large text and stamps) in **both** light and dark themes. Colours live in
  `src/theme/palettes.json`; add any new pair to `checks` there and run `npm run check:contrast`.
  No `opacity` on elements that carry text — use a solid colour token instead.
- Before committing run `npm run check` (typecheck + lint + tests + contrast) and `npm run format:check`.
- Known bugs are pinned by `test.failing` in `src/utils/__tests__`. When you fix one, turn it into a
  normal `test`.
- UI copy is Russian for now; ru/en/es localisation is planned — don't add new hard-coded strings to
  logic modules.
