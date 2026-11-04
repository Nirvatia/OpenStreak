// Генерация иконки и сплэша «Мульта» (вариант Б, design/mult/M-AppIcon) из тех же рисунков,
// что в приложении. Нужен Playwright с Chromium. Запуск:
//   node scripts/app-assets.cjs assets node_modules/@expo-google-fonts/unbounded/800ExtraBold/Unbounded_800ExtraBold.ttf
const { chromium } = require('playwright');
const path = require('path');
const OUT = process.argv[2];
const FONT = process.argv[3];
// Шрифт встраиваем в страницу: по file:// страница без адреса его не загрузит.
const FONT_URL = 'data:font/ttf;base64,' + require('fs').readFileSync(FONT).toString('base64');

const PAL = {
  day: {
    line: '#1E2233',
    fur: '#8796B0',
    furShade: '#6B7A96',
    muzzle: '#F1E7D3',
    ear: '#E6A391',
    eye: '#FFF8E8',
    sun: '#F5B82E',
    crater: '#E3A11C',
    track: '#E6D8B8',
    ring: '#1E2233',
    shadow: '#1E2233',
  },
  night: {
    line: '#0B1020',
    fur: '#8E9DBC',
    furShade: '#6F7FA0',
    muzzle: '#E9DFC8',
    ear: '#E08F80',
    eye: '#FFF4DC',
    sun: '#FFC94A',
    crater: '#EBB032',
    track: '#3A4A73',
    ring: '#AEB6CC',
    shadow: '#0B1020',
  },
};

// Волк с ухмылкой — те же пути, что в src/ui/icons/Wolf.tsx.
function wolf(c, { x, y, size }) {
  const k = `stroke="${c.line}" stroke-linecap="round" stroke-linejoin="round"`;
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 120 120">
  <g ${k} stroke-width="3">
    <path d="M22 62 L6 70 L20 74 L10 82 L28 80 Z" fill="${c.fur}"/>
    <path d="M98 62 L114 70 L100 74 L110 82 L92 80 Z" fill="${c.fur}"/>
    <path d="M24 46 L28 6 L54 30 Z" fill="${c.fur}"/>
    <path d="M96 46 L92 6 L66 30 Z" fill="${c.fur}"/>
    <path d="M31 36 L32 18 L45 31 Z" fill="${c.ear}" stroke-width="2"/>
    <path d="M89 36 L88 18 L75 31 Z" fill="${c.ear}" stroke-width="2"/>
    <path d="M18 54 C18 32 38 22 60 22 C82 22 102 32 102 54 C102 70 96 80 86 88 L60 108 L34 88 C24 80 18 70 18 54 Z" fill="${c.fur}"/>
    <path d="M42 70 C42 60 50 56 60 56 C70 56 78 60 78 70 C78 84 70 96 60 100 C50 96 42 84 42 70 Z" fill="${c.muzzle}"/>
  </g>
  <path d="M60 22 L54 32 L60 30 L66 34 Z" fill="${c.furShade}"/>
  <path d="M27 12 L31 16 L26 17" fill="none" ${k} stroke-width="2.5"/>
  <ellipse cx="60" cy="67" rx="8" ry="5.5" fill="${c.line}"/>
  <ellipse cx="57" cy="65.5" rx="2.4" ry="1.4" fill="${c.fur}"/>
  <g ${k}>
    <path d="M33 50 Q42 42 51 50 Q42 55 33 50 Z" fill="${c.eye}" stroke-width="2.5"/>
    <path d="M69 50 Q78 42 87 50 Q78 55 69 50 Z" fill="${c.eye}" stroke-width="2.5"/>
    <circle cx="44" cy="49.5" r="3.4" fill="${c.line}" stroke="none"/>
    <circle cx="80" cy="49.5" r="3.4" fill="${c.line}" stroke="none"/>
    <path d="M32 47 L52 45.5" stroke-width="3"/><path d="M68 45.5 L88 47" stroke-width="3"/>
    <path d="M31 39 L51 43" stroke-width="3.5"/><path d="M69 43 L89 37" stroke-width="3.5"/>
    <path d="M50 80 Q58 86 71 77" fill="none" stroke-width="3"/>
    <path d="M65 81 L66.5 86 L68.5 80" fill="${c.eye}" stroke-width="1.5"/>
  </g></svg>`;
}

// Силуэт волка для монохромной иконки Android 13+: голова и уши одним цветом, глаза и нос — дырками.
function silhouette({ x, y, size }) {
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 120 120">
  <defs><mask id="m"><rect width="120" height="120" fill="white"/>
    <path d="M33 50 Q42 42 51 50 Q42 55 33 50 Z" fill="black"/>
    <path d="M69 50 Q78 42 87 50 Q78 55 69 50 Z" fill="black"/>
    <path d="M42 70 C42 60 50 56 60 56 C70 56 78 60 78 70 C78 84 70 96 60 100 C50 96 42 84 42 70 Z" fill="none" stroke="black" stroke-width="4"/>
    <ellipse cx="60" cy="67" rx="8" ry="5.5" fill="black"/>
  </mask></defs>
  <g mask="url(#m)" fill="black">
    <path d="M22 62 L6 70 L20 74 L10 82 L28 80 Z"/><path d="M98 62 L114 70 L100 74 L110 82 L92 80 Z"/>
    <path d="M24 46 L28 6 L54 30 Z"/><path d="M96 46 L92 6 L66 30 Z"/>
    <path d="M18 54 C18 32 38 22 60 22 C82 22 102 32 102 54 C102 70 96 80 86 88 L60 108 L34 88 C24 80 18 70 18 54 Z"/>
  </g></svg>`;
}

function moon(c, { cx, cy, r }) {
  const s = r / 46;
  return `<g transform="translate(${cx - 50 * s} ${cy - 50 * s}) scale(${s})">
    <circle cx="50" cy="50" r="46" fill="${c.sun}"/>
    <circle cx="36" cy="38" r="8" fill="${c.crater}"/><circle cx="62" cy="62" r="11" fill="${c.crater}"/><circle cx="66" cy="32" r="5" fill="${c.crater}"/>
    <circle cx="50" cy="50" r="46" fill="none" stroke="${c.ring}" stroke-width="5"/></g>`;
}

const svg = (w, h, body, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ''}${body}</svg>`;

// Сплэш: луна, волк перед ней и жёлтая плашка-наклейка «OpenStreak» под углом.
function splash(c) {
  const W = 880,
    H = 1120;
  const plate = `<g transform="rotate(-3 440 1010)">
    <rect x="${440 - 310 + 16}" y="${948 + 16}" width="620" height="124" rx="44" fill="${c.shadow}"/>
    <rect x="${440 - 310}" y="948" width="620" height="124" rx="44" fill="#F5B82E" stroke="${c.line}" stroke-width="10"/>
    <text x="440" y="1031" text-anchor="middle" font-family="Unbounded" font-weight="800" font-size="62" textLength="520" lengthAdjust="spacingAndGlyphs" fill="#1E2233">OpenStreak</text></g>`;
  return svg(
    W,
    H,
    moon(c, { cx: 440, cy: 410, r: 360 }) + wolf(c, { x: 150, y: 330, size: 580 }) + plate
  );
}

const jobs = [
  // iOS и общая иконка: волк на жёлтом во весь квадрат (система сама скругляет углы).
  [
    'icon.png',
    1024,
    1024,
    svg(1024, 1024, wolf(PAL.day, { x: 61, y: 82, size: 901 }), '#F5B82E'),
    false,
  ],
  // Android: передний слой — волк в безопасной зоне (66 % по центру), фон — тот же жёлтый.
  [
    'android-icon-foreground.png',
    1024,
    1024,
    svg(1024, 1024, wolf(PAL.day, { x: 192, y: 200, size: 640 })),
    true,
  ],
  ['android-icon-background.png', 1024, 1024, svg(1024, 1024, '', '#F5B82E'), false],
  [
    'android-icon-monochrome.png',
    1024,
    1024,
    svg(1024, 1024, silhouette({ x: 192, y: 200, size: 640 })),
    true,
  ],
  [
    'favicon.png',
    48,
    48,
    svg(1024, 1024, wolf(PAL.day, { x: 61, y: 82, size: 901 }), '#F5B82E'),
    false,
  ],
  ['splash-icon.png', 880, 1120, splash(PAL.day), true],
  ['splash-icon-dark.png', 880, 1120, splash(PAL.night), true],
];

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ deviceScaleFactor: 1 });
  for (const [name, w, h, markup, transparent] of jobs) {
    await p.setViewportSize({ width: w, height: h });
    await p.setContent(`<!doctype html><html><head><style>
      @font-face { font-family: Unbounded; font-weight: 800; src: url('${FONT_URL}'); }
      html,body{margin:0;background:transparent} svg{display:block;width:${w}px;height:${h}px}</style></head>
      <body>${markup}</body></html>`);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(200);
    await p.screenshot({
      path: path.join(OUT, name),
      omitBackground: transparent,
      clip: { x: 0, y: 0, width: w, height: h },
    });
    console.log('ok', name);
  }
  await b.close();
})();
