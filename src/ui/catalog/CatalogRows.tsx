/** Каталог: строки с луной, журнал, строка «Запиши», неделя и месяц лунами, зарубки. */
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useT } from '../../store/prefsStore';
import { usePalette } from '../../store/themeStore';
import { SPACE } from '../../theme/metrics';
import { TYPE } from '../../theme/type';
import { AddRow, LinkRow } from '../Button';
import { IconTile } from '../icons';
import { Badge, Card, Pill } from '../Sticker';
import type { DayState } from '../moon';
import { LogRow, MoonRow } from '../MoonRow';
import { Notches } from '../Notches';
import { PriorityMarks } from '../Priority';
import { SectionTitle } from '../ScreenHeader';
import { MoonGrid, WeekMoons } from '../WeekMoons';
import { Section } from './Section';

const CODES: Record<string, DayState> = {
  d: 'done',
  p: 'partial',
  t: 'today',
  x: 'slip',
  r: 'rest',
  c: 'clean',
  e: 'empty',
};
/** Неделя, кончающаяся сегодняшним вторником. */
const week = (codes: string, part = 0.6) =>
  codes.split('').map((k, i) => ({ weekday: (3 + i) % 7, state: CODES[k], part, today: i === 6 }));

export function CatalogRows() {
  const p = usePalette();
  const t = useT();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => () => setDone((s) => ({ ...s, [k]: !s[k] }));
  const meta = (text: string, color = p.muted) => (
    <Text style={[TYPE.meta, { color }]}>{text}</Text>
  );

  return (
    <>
      <Section title="Строки">
        <AddRow label={t('common.addPrompt')} />
        <View style={{ gap: SPACE.md }}>
          <SectionTitle title="Осталось" count={4} tone="sun" tilt={-3} />
          <Card padded={false}>
            <MoonRow
              title="Отжимания"
              sub="ещё 40 · серия 14"
              phase={done.push ? 1 : 0.6}
              done={!!done.push}
              onToggle={toggle('push')}
              toggleLabel="Добавить подходы: Отжимания"
              right={meta('60/100')}
            />
            <MoonRow
              title="Читать 20 минут"
              phase={done.read ? 1 : 0}
              done={!!done.read}
              onToggle={toggle('read')}
              right={meta('9 дн')}
            />
            <MoonRow
              title="Закрыть долг Сане"
              sub="со вчера"
              debt
              phase={done.debt ? 1 : 0}
              done={!!done.debt}
              onToggle={toggle('debt')}
              right={<Pill label={t('mark.debt')} tone="red" filled />}
            />
            <MoonRow
              title="Записаться в зал"
              sub="напомню у зала"
              phase={done.gym ? 1 : 0}
              done={!!done.gym}
              onToggle={toggle('gym')}
              right={<PriorityMarks level={2} />}
              last
            />
          </Card>
        </View>
        <View style={{ gap: SPACE.md }}>
          <SectionTitle title="Сделано" count={3} tone="teal" tilt={1.5} />
          <LogRow time="13:20" title="Вода 2 литра" mark={t('mark.done')} />
          <LogRow time="08:00" title="Не курить" mark={t('mark.clean')} />
          <LogRow time="07:05" title="Подъём в 6:00" mark={t('mark.slip')} bad />
        </View>
        <LinkRow title="Итог дня" sub="Как отработал?" />
      </Section>

      <Section title="Привычка: неделя лунами">
        <Card style={{ gap: SPACE.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <IconTile icon="dumbbell" />
            <View style={{ flex: 1 }}>
              <Text style={[TYPE.itemStrong, { color: p.text }]}>Отжимания</Text>
              {meta('100 в день · сегодня 60')}
            </View>
            <Badge value={14} label="дней" tilt={8} />
          </View>
          <WeekMoons days={week('ddddddp')} />
        </Card>
        <WeekMoons days={week('ddrrdxt', 0)} />
        <WeekMoons days={week('ccccccc')} />
      </Section>

      <Section title="Карточка привычки: месяц и зарубки">
        <MoonGrid
          days={'pddddrrdddddrrdxdddrrpddtee'
            .split('')
            .map((k) => ({ state: CODES[k], part: 0.6 }))}
        />
        <Notches count={14} />
        <Notches count={47} />
      </Section>
    </>
  );
}
