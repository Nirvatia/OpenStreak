/**
 * Текущее оформление для значений, которые читаются прямо во время отрисовки
 * (метрики, шрифты). Меняется вместе с `themeStore.design`: палитра в сторе меняется
 * одновременно, поэтому компоненты перерисовываются и подхватывают новые значения.
 */
import type { Design } from './palette';

let current: Design = 'plain';

export const currentDesign = (): Design => current;
export function setCurrentDesign(d: Design): void {
  current = d;
}

/**
 * Стили `StyleSheet.create`, зависящие от оформления: фабрика вызывается заново для каждого
 * оформления (результат запоминается), поэтому в местах использования ничего не меняется.
 */
export function designStyles<T extends object>(factory: () => T): T {
  const cache = new Map<Design, T>();
  return new Proxy({} as T, {
    get(_target, key) {
      let styles = cache.get(current);
      if (!styles) {
        styles = factory();
        cache.set(current, styles);
      }
      return styles[key as keyof T];
    },
  });
}
