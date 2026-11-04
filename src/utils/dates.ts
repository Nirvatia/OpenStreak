export const DAYN = [
  'воскресенье',
  'понедельник',
  'вторник',
  'среда',
  'четверг',
  'пятница',
  'суббота',
];
export const DAYN2 = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
export const MON = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];
export const MON_NOM = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
];

export function p2(n: number): string {
  return String(n).padStart(2, '0');
}

export function dstr(d: Date): string {
  return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
}

export function todayStr(): string {
  return dstr(new Date());
}

export function addDays(s: string, n: number): string {
  const d = new Date(s + 'T00:00');
  d.setDate(d.getDate() + n);
  return dstr(d);
}

export function human(s: string): string {
  const d = new Date(s + 'T00:00');
  return d.getDate() + ' ' + MON[d.getMonth()];
}

export function rel(s: string): string {
  const t = todayStr();
  if (s === t) return 'Сегодня';
  if (s === addDays(t, 1)) return 'Завтра';
  if (s === addDays(t, -1)) return 'Вчера';
  const d = new Date(s + 'T00:00');
  const diff = Math.round((d.getTime() - new Date(t + 'T00:00').getTime()) / 864e5);
  if (diff > 1 && diff < 7) return DAYN[d.getDay()];
  return human(s);
}

export function last7(): string[] {
  const a: string[] = [];
  for (let i = 6; i >= 0; i--) {
    a.push(addDays(todayStr(), -i));
  }
  return a;
}

export function monthTitle(y: number, m: number): string {
  return MON_NOM[m][0].toUpperCase() + MON_NOM[m].slice(1) + ' ' + y;
}
