/** Каталог: печати, строки, счёт палочками, прогресс, неделя привычки. */
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { usePalette } from '../../store/themeStore';
import { SPACE } from '../../theme/stamp';
import { TYPE } from '../../theme/type';
import { CheckRow } from '../CheckRow';
import { Divider } from '../Divider';
import { Icon } from '../icons';
import { ProgressTicks } from '../ProgressTicks';
import { Stamp, type StampKind } from '../Stamp';
import { Tally } from '../Tally';
import { WeekStrip, type DayState } from '../WeekStrip';

const KINDS: StampKind[] = ['done', 'debt', 'slip', 'rest', 'closed', 'clean'];

/** Неделя, кончающаяся сегодняшним днём (вт = 2), по кодам из макета. */
function week(codes: string) {
  const map: Record<string, DayState> = {
    d: 'done',
    t: 'today',
    x: 'slip',
    r: 'rest',
    c: 'clean',
    o: 'off',
  };
  return codes.split('').map((k, i) => ({ weekday: (3 + i) % 7, state: map[k] }));
}

export function CatalogRows({
  Section,
}: {
  Section: React.FC<{ title: string; children: React.ReactNode }>;
}) {
  const p = usePalette();
  const [done, setDone] = useState<Record<string, boolean>>({ water: true });
  const toggle = (k: string) => (v: boolean) => setDone((s) => ({ ...s, [k]: v }));

  return (
    <>
      <Section title="Печати · sm / md / lg">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <View
            key={size}
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: SPACE.lg,
              paddingVertical: SPACE.sm,
            }}
          >
            {KINDS.map((k) => (
              <Stamp key={k} kind={k} size={size} tilt={`${k}-${size}`} />
            ))}
          </View>
        ))}
      </Section>

      <Section title="Строки">
        <View>
          <CheckRow
            title="Отжимания"
            checked={!!done.push}
            onToggle={toggle('push')}
            checkLabel="Добавить подходы: Отжимания"
            below={<ProgressTicks done={60} total={100} />}
            right={<Text style={[TYPE.subtitle, { color: p.ink }]}>60/100</Text>}
          />
          <CheckRow
            title="Вода 2 литра"
            checked={!!done.water}
            onToggle={toggle('water')}
            stamp={done.water ? <Stamp kind="done" size="lg" tilt={-11} /> : undefined}
          />
          <CheckRow
            title="Читать 20 минут"
            checked={!!done.read}
            onToggle={toggle('read')}
            right={<Text style={[TYPE.meta, { color: p.pencil, fontSize: 13 }]}>9 дней</Text>}
          />
          <CheckRow
            title="Закрыть долг Сане"
            meta="вчера · Личное"
            checked={!!done.debt}
            onToggle={toggle('debt')}
            right={<Stamp kind="debt" size="sm" tilt={6} />}
          />
          <CheckRow
            title="Записаться в зал"
            meta="напомнит у зала · Зал"
            checked={!!done.gym}
            onToggle={toggle('gym')}
            right={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="place" size={16} />
                <Text style={[TYPE.subtitle, { color: p.ink, fontSize: 16 }]}>!!</Text>
              </View>
            }
          />
        </View>
      </Section>

      <Section title="Счёт палочками · 3 / 14 / 30 / 47">
        {[3, 14, 30, 47].map((n) => (
          <View key={n} style={{ gap: SPACE.sm }}>
            <Tally count={n} />
            <Divider />
          </View>
        ))}
      </Section>

      <Section title="Неделя привычки">
        <View style={{ gap: SPACE.lg }}>
          <WeekStrip days={week('ddddddt')} />
          <WeekStrip days={week('ddrrdxt')} />
          <WeekStrip days={week('ccccccx')} />
          <WeekStrip days={week('dododdo')} />
        </View>
      </Section>
    </>
  );
}
