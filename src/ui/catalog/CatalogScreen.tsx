/**
 * Каталог компонентов «Мульта» — для визуальной проверки в обеих темах.
 * Открывается только в разработке: `EXPO_PUBLIC_CATALOG=1 npx expo start` или `?catalog` на вебе.
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePrefsStore, useT } from '../../store/prefsStore';
import { usePalette, useThemeStore } from '../../store/themeStore';
import { THEME_MODES, type Palette, type ThemeMode } from '../../theme/palette';
import { SPACE } from '../../theme/metrics';
import { TYPE, type TypeVariant } from '../../theme/type';
import { HABIT_ICONS, Icon, IconTile, UI_ICONS, Wolf, type UiIconName } from '../icons';
import { Badge, Card, Pill, Tag } from '../Sticker';
import { Moon } from '../Moon';
import { moonLook, type DayState } from '../moon';
import { Segmented } from '../Segmented';
import { CatalogControls } from './CatalogControls';
import { CatalogRows } from './CatalogRows';
import { CatalogShell } from './CatalogShell';
import { Section } from './Section';

const SWATCHES: (keyof Palette)[] = [
  'bg',
  'surface',
  'text',
  'muted',
  'sun',
  'teal',
  'red',
  'tag',
  'sky',
  'track',
];

const SAMPLES: [TypeVariant, string][] = [
  ['display', 'День закрыт.'],
  ['numberXL', '3 / 9'],
  ['title', 'Привычки'],
  ['rank', 'Волк'],
  ['heading', 'Пробежать полумарафон'],
  ['button', 'Записать'],
  ['item', 'Записаться в зал'],
  ['quote', 'Волк не ждёт понедельника. Волк и есть понедельник.'],
  ['body', 'Наклейки: обводка и жёсткая тень.'],
  ['label', 'Осталось 4'],
  ['mark', 'зачёт'],
  ['meta', '18:00 · Работа'],
  ['badge', '+30 очков'],
  ['tab', 'Сегодня'],
];

const STATES: [DayState, string][] = [
  ['empty', 'не сделано'],
  ['partial', 'в процессе'],
  ['done', 'зачёт'],
  ['slip', 'слив'],
  ['rest', 'выходной'],
];

export function CatalogScreen() {
  const p = usePalette();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { mode, setMode } = useThemeStore();
  const { tone, setTone } = usePrefsStore();

  return (
    <ScrollView
      style={{ backgroundColor: p.bg }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACE.lg }]}
    >
      <Text style={[TYPE.meta, { color: p.muted }]}>dev · каталог</Text>
      <Text style={[TYPE.title, { color: p.text }]}>Мульт</Text>

      <Section title="Тема">
        <Segmented<ThemeMode>
          label="Тема"
          value={mode}
          onChange={setMode}
          items={THEME_MODES.map((m) => ({ value: m, label: t(`theme.${m}`) }))}
        />
      </Section>
      <Section title="Тон">
        <Segmented
          label="Тон"
          value={tone}
          onChange={setTone}
          items={[
            { value: 'plain', label: 'Обычный' },
            { value: 'bro', label: 'Пацанский' },
          ]}
        />
      </Section>

      <Section title="Палитра">
        <View style={styles.swatches}>
          {SWATCHES.map((k) => (
            <View key={k} style={styles.swatch}>
              <View style={[styles.chip, { backgroundColor: p[k], borderColor: p.line }]} />
              <Text style={[TYPE.meta, { color: p.text }]}>{k}</Text>
              <Text style={[TYPE.meta, { color: p.muted }]}>{p[k]}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Текст · Unbounded и Rubik">
        {SAMPLES.map(([v, text]) => (
          <View key={v} style={{ gap: 2 }}>
            <Text style={[TYPE.meta, { color: p.muted }]}>{v}</Text>
            <Text style={[TYPE[v], { color: p.text }]}>{text}</Text>
          </View>
        ))}
      </Section>

      <Section title="Наклейки, плашки, бейджи">
        <View style={styles.row}>
          <Tag label="Среда, 4 ноября" font="date" tilt={-2} shadow="sm" />
          <Tag label="Осталось" count={4} tone="sun" tilt={-3} />
          <Tag label="Сделано" count={3} tone="teal" tilt={1.5} />
          <Tag label="Долги" count={1} tone="red" tilt={-2} />
          <Tag label="+30 очков" tone="sun" font="badge" tilt={6} />
        </View>
        <View style={styles.row}>
          <Pill label="зачёт" />
          <Pill label="слив" tone="red" />
          <Pill label="долг" tone="red" filled />
          <Badge value={14} label="дней" tilt={8} />
          <Badge value={23} label="чистых" tone="teal" tilt={-5} />
          <Badge value={0} label="с нуля" tone="tag" tilt={4} />
        </View>
        <Card>
          <Text style={[TYPE.heading, { color: p.text }]}>Наклейка</Text>
          <Text style={[TYPE.body, { color: p.muted }]}>Обводка 2,5 и жёсткая тень.</Text>
        </Card>
      </Section>

      <Section title="Луна — отметка, прогресс, день">
        <View style={styles.row}>
          {[0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1].map((ph) => (
            <Moon key={ph} phase={ph} size={30} />
          ))}
        </View>
        <View style={styles.row}>
          {STATES.map(([s, name]) => (
            <View key={s} style={styles.state}>
              <Moon size={34} {...moonLook(s, 0.6)} />
              <Text style={[TYPE.meta, { color: p.muted }]}>{name}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Иконки · контур">
        <View style={styles.icons}>
          {(Object.keys(UI_ICONS) as UiIconName[]).map((name) => (
            <View
              key={name}
              style={[styles.iconCell, { backgroundColor: p.surface, borderRadius: 14 }]}
            >
              <Icon name={name} size={26} />
              <Text style={[TYPE.tiny, { color: p.muted }]}>{name}</Text>
            </View>
          ))}
        </View>
        <View style={styles.icons}>
          {Object.keys(HABIT_ICONS).map((name) => (
            <View key={name} style={[styles.iconCell, { backgroundColor: p.surface }]}>
              <IconTile icon={name} size={40} />
              <Text style={[TYPE.tiny, { color: p.muted }]}>{name}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Волк">
        <View style={styles.row}>
          {(['smirk', 'proud', 'meh'] as const).map((m) => (
            <View key={m} style={styles.state}>
              <Wolf mood={m} size={88} />
              <Text style={[TYPE.meta, { color: p.text }]}>{t(`wolf.${m}`)}</Text>
            </View>
          ))}
        </View>
      </Section>

      <CatalogRows />
      <CatalogControls />
      <CatalogShell />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SPACE.screenX, paddingBottom: 120, gap: SPACE.xl },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.md },
  swatch: { width: 92, gap: 2 },
  chip: { height: 40, borderWidth: 2.5, borderRadius: 20 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.md, alignItems: 'center' },
  state: { alignItems: 'center', gap: 4, minWidth: 56 },
  icons: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  iconCell: { width: 66, height: 70, alignItems: 'center', justifyContent: 'center', gap: 5 },
});
