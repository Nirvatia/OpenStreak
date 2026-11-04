// Проверка контраста всех пар цветов из src/theme/palettes.json для каждой темы с каждыми чернилами.
// Формула — WCAG 2.x (relative luminance). Падает с кодом 1, если хоть одна пара не проходит.
import { readFileSync } from 'node:fs';

const MIN = { text: 4.5, large: 3, ui: 3 };

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const { themes, inks, checks } = JSON.parse(
  readFileSync(new URL('../src/theme/palettes.json', import.meta.url), 'utf8')
);

/** Та же сборка палитры, что в src/theme/palette.ts: тема + чернила, navMark и stampOnInk по умолчанию = stamp. */
function resolve(theme, ink) {
  const over = inks[ink][theme];
  return { ...themes[theme], navMark: over.stamp, stampOnInk: over.stamp, ...over };
}

let failed = 0;
for (const theme of Object.keys(themes)) {
  for (const ink of Object.keys(inks)) {
    const t = resolve(theme, ink);
    console.log(`\n${theme} · чернила ${ink}`);
    for (const [fg, bg, kind] of checks) {
      if (!t[fg] || !t[bg] || !MIN[kind]) {
        console.log(`  MISSING  ${fg} / ${bg} / ${kind}`);
        failed++;
        continue;
      }
      const ratio = contrast(t[fg], t[bg]);
      const ok = ratio >= MIN[kind];
      if (!ok) failed++;
      console.log(
        `  ${ok ? 'ok  ' : 'FAIL'} ${ratio.toFixed(2).padStart(5)} ≥ ${MIN[kind]}  ${fg} (${t[fg]}) на ${bg} (${t[bg]})`
      );
    }
  }
}

if (failed) {
  console.error(`\n${failed} пар(ы) не проходят контраст`);
  process.exit(1);
}
console.log('\nВсе пары проходят.');
