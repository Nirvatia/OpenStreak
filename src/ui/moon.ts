/**
 * Луна — главный элемент «Мульта»: отметка дела, прогресс дня, оценка дня, клетка недели.
 * Здесь только расчёты; рисует `Moon.tsx`.
 */

/** Фаза в [0, 1]: 0 — новолуние (не сделано), 1 — полнолуние (зачёт). */
export function clampPhase(p: number): number {
  if (!Number.isFinite(p)) return 0;
  return Math.max(0, Math.min(1, p));
}

/** Прогресс дня: сделано из запланированного. Пустой день — полнолуние не считается. */
export function dayPhase(done: number, total: number): number {
  if (total <= 0) return 0;
  return clampPhase(done / total);
}

/** Числовая привычка: сколько из цели. */
export function habitPhase(value: number, target: number): number {
  if (target <= 0) return value > 0 ? 1 : 0;
  return clampPhase(value / target);
}

/** Оценка дня 1…5 → фаза: «Слил» — новолуние, «Красава» — полнолуние. */
export function moodPhase(mood: number): number {
  return clampPhase((Math.round(mood) - 1) / 4);
}

const R = 46;

/**
 * Освещённая часть луны в координатах 0…100: правая полуокружность и линия терминатора
 * (половина эллипса). `null` — освещённой части нет.
 */
export function litPath(phase: number): string | null {
  const p = clampPhase(phase);
  if (p <= 0.001) return null;
  if (p >= 0.999)
    return `M50 ${50 - R} A${R} ${R} 0 1 1 50 ${50 + R} A${R} ${R} 0 1 1 50 ${50 - R} Z`;
  const rx = Math.round(R * Math.abs(1 - 2 * p) * 100) / 100;
  const sweep = p < 0.5 ? 0 : 1;
  return `M50 ${50 - R} A${R} ${R} 0 0 1 50 ${50 + R} A${rx} ${R} 0 0 ${sweep} 50 ${50 - R} Z`;
}

/** Состояние дня привычки и как оно рисуется луной. */
export type DayState = 'done' | 'partial' | 'today' | 'slip' | 'rest' | 'clean' | 'empty';

export type MoonLook = {
  phase: number;
  /** освещённая часть: жёлтая луна или красная (слив) */
  tone: 'sun' | 'red';
  /** кольцо: обычное, красное (слив, долг) или приглушённое (выходной) */
  ring: 'ring' | 'red' | 'muted';
  dashed: boolean;
};

export function moonLook(state: DayState, partial = 0.5): MoonLook {
  switch (state) {
    case 'done':
    case 'clean':
      return { phase: 1, tone: 'sun', ring: 'ring', dashed: false };
    case 'partial':
    case 'today':
      return { phase: clampPhase(partial), tone: 'sun', ring: 'ring', dashed: false };
    case 'slip':
      return { phase: 1, tone: 'red', ring: 'red', dashed: false };
    case 'rest':
      return { phase: 0, tone: 'sun', ring: 'muted', dashed: true };
    case 'empty':
      return { phase: 0, tone: 'sun', ring: 'ring', dashed: false };
  }
}
