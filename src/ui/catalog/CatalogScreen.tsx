/**
 * Каталог компонентов «Луны» — для визуальной проверки в обеих темах.
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
import { HABIT_ICONS, HabitGlyph, Icon, UI_ICONS, Wolf, type UiIconName } from '../icons';
import { Moon } from '../Moon';
import { moonLook, type DayState } from '../moon';
import { Segmented } from '../Segmented';
import { CatalogControls } from './CatalogControls';
import { CatalogRows } from './CatalogRows';
import { CatalogShell } from './CatalogShell';
import { Section } from './Section';

const SWATCHES: (keyof Palette)[] = ['bg', 'surface', 'raised', 'line', 'text', 'muted', 'blood'];

const SAMPLES: [TypeVariant, string][] = [
  ['display', 'День закрыт.'],
  ['numberXL', '3 / 9'],
  ['title', 'Привычки'],
  ['rank', 'Волк'],
  ['heading', 'Пробежать полумарафон'],
  ['button', 'Записать'],
  ['item', 'Записаться в зал'],
  ['quote', 'Волк не ждёт понедельника. Волк и есть понедельник.'],
  ['body', 'Блоки отделяются фоном, а не рамками.'],
  ['label', 'Осталось 4'],
  ['mark', 'зачёт'],
  ['meta', '18:00 · Работа'],
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
      <Text style={[TYPE.title, { color: p.text }]}>Луна</Text>

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

      <Section title="Текст · Onest">
        {SAMPLES.map(([v, text]) => (
          <View key={v} style={{ gap: 2 }}>
            <Text style={[TYPE.meta, { color: p.muted }]}>{v}</Text>
            <Text style={[TYPE[v], { color: p.text }]}>{text}</Text>
          </View>
        ))}
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

      <Section title="Иконки · грани">
        <View style={styles.icons}>
          {(Object.keys(UI_ICONS) as UiIconName[]).map((name) => (
            <View key={name} style={[styles.iconCell, { backgroundColor: p.surface }]}>
              <Icon name={name} size={26} />
              <Text style={[TYPE.tiny, { color: p.muted }]}>{name}</Text>
            </View>
          ))}
        </View>
        <View style={styles.icons}>
          {Object.keys(HABIT_ICONS).map((name) => (
            <View key={name} style={[styles.iconCell, { backgroundColor: p.surface }]}>
              <HabitGlyph icon={name} size={26} />
              <Text style={[TYPE.tiny, { color: p.muted }]}>{name}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Волк">
        <View style={styles.row}>
          {(['active', 'angry', 'rest'] as const).map((m) => (
            <View key={m} style={styles.state}>
              <Wolf mood={m} size={72} />
              <Text style={[TYPE.meta, { color: p.text }]}>{t(`wolf.${m}`)}</Text>
            </View>
          ))}
          <View style={{ width: 110, height: 110, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'absolute' }}>
              <Moon phase={1} size={110} ring="text" />
            </View>
            <View style={{ marginTop: 26 }}>
              <Wolf size={64} silhouette />
            </View>
          </View>
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
  chip: { height: 40, borderWidth: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.md, alignItems: 'center' },
  state: { alignItems: 'center', gap: 4, minWidth: 56 },
  icons: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  iconCell: { width: 66, height: 66, alignItems: 'center', justifyContent: 'center', gap: 5 },
});
