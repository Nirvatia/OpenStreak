/**
 * Каталог компонентов «Штампа» — для визуальной проверки в обеих темах и со всеми чернилами.
 * Открывается только в разработке: `EXPO_PUBLIC_CATALOG=1 npx expo start` или `?catalog` на вебе.
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePrefsStore, useT } from '../../store/prefsStore';
import { usePalette, useThemeStore } from '../../store/themeStore';
import { INK_NAMES, THEME_MODES, type Palette } from '../../theme/palette';
import { LINE, SPACE } from '../../theme/stamp';
import { TYPE, type TypeVariant } from '../../theme/type';
import { CatalogRows } from './CatalogRows';
import { HABIT_ICONS, HabitGlyph, Icon, UI_ICONS, WolfSeal, type UiIconName } from '../icons';

const SWATCHES: (keyof Palette)[] = [
  'bg',
  'paper',
  'ink',
  'pencil',
  'stamp',
  'debt',
  'rest',
  'nav',
  'navMark',
];

const SAMPLES: [TypeVariant, string][] = [
  ['display', 'Привычки'],
  ['title', 'Пробежать полумарафон'],
  ['numberXL', '47'],
  ['numberL', '4/5'],
  ['subtitle', 'Дней осталось'],
  ['button', 'Закрыть день'],
  ['kicker', '3 договора · 1 закрыт'],
  ['label', 'Зачёт, если'],
  ['rowTitle', 'Записаться в зал'],
  ['body', 'Всё рисуется чернилами: сплошные рамки, пунктир между строками.'],
  ['bodyStrong', '21,1 км без остановок'],
  ['meta', 'вчера · Личное'],
  ['tab', 'Сегодня'],
];

function Choice<T extends string>(props: {
  values: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  const p = usePalette();
  return (
    <View style={[styles.choice, { borderColor: p.ink }]}>
      {props.values.map((v, i) => {
        const on = v === props.value;
        return (
          <Pressable
            key={v}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            onPress={() => props.onChange(v)}
            style={[
              styles.choiceItem,
              { backgroundColor: on ? p.ink : 'transparent', borderColor: p.ink },
              i > 0 && { borderLeftWidth: LINE.frame },
            ]}
          >
            <Text style={[TYPE.tab, { color: on ? p.onInk : p.ink }]}>{v}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const p = usePalette();
  return (
    <View style={styles.section}>
      <Text style={[TYPE.label, { color: p.pencil }]}>{title}</Text>
      {children}
    </View>
  );
}

export function CatalogScreen() {
  const p = usePalette();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { mode, ink, setMode, setInk } = useThemeStore();
  const { tone, setTone } = usePrefsStore();

  return (
    <ScrollView
      style={{ backgroundColor: p.bg }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACE.lg }]}
    >
      <Text style={[TYPE.kicker, { color: p.pencil }]}>dev · каталог</Text>
      <Text style={[TYPE.display, { color: p.ink }]}>Штамп</Text>

      <Section title="Тема">
        <Choice values={THEME_MODES} value={mode} onChange={setMode} />
      </Section>
      <Section title="Чернила">
        <Choice values={INK_NAMES} value={ink} onChange={setInk} />
      </Section>
      <Section title="Тон">
        <Choice values={['plain', 'bro'] as const} value={tone} onChange={setTone} />
      </Section>

      <Section title="Палитра">
        <View style={styles.swatches}>
          {SWATCHES.map((k) => (
            <View key={k} style={styles.swatch}>
              <View style={[styles.chip, { backgroundColor: p[k], borderColor: p.ink }]} />
              <Text style={[TYPE.meta, { color: p.ink }]}>{k}</Text>
              <Text style={[TYPE.meta, { color: p.pencil }]}>{p[k]}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Текст">
        {SAMPLES.map(([v, text]) => (
          <View key={v} style={styles.sample}>
            <Text style={[TYPE.meta, { color: p.pencil }]}>{v}</Text>
            <Text style={[TYPE[v], { color: p.ink }]}>{text}</Text>
          </View>
        ))}
      </Section>

      <Section title="Иконки · сетка 24 · линия 2.5">
        <View style={styles.icons}>
          {(Object.keys(UI_ICONS) as UiIconName[]).map((name) => (
            <View key={name} style={[styles.iconCell, { borderColor: p.ink }]}>
              <Icon name={name} size={28} />
              <Text style={[TYPE.meta, { color: p.pencil }]}>{name}</Text>
            </View>
          ))}
          {Object.keys(HABIT_ICONS).map((name) => (
            <View key={name} style={[styles.iconCell, { borderColor: p.ink }]}>
              <HabitGlyph icon={name} size={28} />
              <Text style={[TYPE.meta, { color: p.pencil }]}>{name}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Волк-печать">
        <View style={styles.row}>
          {(['active', 'angry', 'rest'] as const).map((m) => (
            <View key={m} style={styles.wolf}>
              <WolfSeal mood={m} size={96} />
              <Text style={[TYPE.bodyStrong, { color: p.ink }]}>{t(`wolf.${m}`)}</Text>
            </View>
          ))}
        </View>
      </Section>

      <CatalogRows Section={Section} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SPACE.screenX, paddingBottom: 64, gap: SPACE.xl },
  section: { gap: SPACE.sm },
  choice: { flexDirection: 'row', borderWidth: LINE.frame },
  choiceItem: { flex: 1, height: 38, alignItems: 'center', justifyContent: 'center' },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.md },
  swatch: { width: 100, gap: 2 },
  chip: { height: 44, borderWidth: LINE.row },
  sample: { gap: 2 },
  icons: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm },
  iconCell: {
    width: 80,
    height: 80,
    borderWidth: LINE.row,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.lg, alignItems: 'center' },
  wolf: { alignItems: 'center', gap: SPACE.sm },
});
