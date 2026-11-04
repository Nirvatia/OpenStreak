/** Каталог: кнопки, сегменты, переключатель, чипы, поля, плитки. */
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { usePalette } from '../../store/themeStore';
import { SPACE } from '../../theme/stamp';
import { TYPE } from '../../theme/type';
import { ActionCard, Button, Fab, IconButton } from '../Button';
import { Chip } from '../Chip';
import { OptionTile } from '../OptionTile';
import { Segmented } from '../Segmented';
import { Switch } from '../Switch';
import { TextField } from '../TextField';

type SectionC = React.FC<{ title: string; children: React.ReactNode }>;

export function CatalogControls({ Section }: { Section: SectionC }) {
  const p = usePalette();
  const [filter, setFilter] = useState<'all' | 'good' | 'bad'>('all');
  const [prio, setPrio] = useState<'0' | '1' | '2' | '3'>('2');
  const [tone, setTone] = useState(true);
  const [ranks, setRanks] = useState(false);
  const [areas, setAreas] = useState<string[]>(['all']);
  const [when, setWhen] = useState('today');
  const [remind, setRemind] = useState<'time' | 'place'>('place');
  const [title, setTitle] = useState('Записаться в зал');
  const [note, setNote] = useState('');
  const [query, setQuery] = useState('');

  const toggleArea = (a: string) =>
    setAreas((s) => (s.includes(a) ? s.filter((x) => x !== a) : [...s, a]));

  return (
    <>
      <Section title="Кнопки">
        <View style={{ gap: SPACE.lg }}>
          <Button label="Записать" onPress={() => {}} />
          <Button label="Экспорт" variant="outline" onPress={() => {}} />
          <Button label="Записать" disabled />
          <ActionCard title="Подвести итог дня" meta="Вечер. Как отработал?" onPress={() => {}} />
          <View style={{ flexDirection: 'row', gap: SPACE.lg, alignItems: 'center' }}>
            <IconButton icon="settings" label="Настройки" />
            <IconButton icon="calendar" label="Календарь" variant="frame" />
            <IconButton icon="plus" label="Новая привычка" variant="solid" />
            <View style={{ flex: 1 }} />
            <Fab label="Новое дело" />
          </View>
        </View>
      </Section>

      <Section title="Сегменты">
        <View style={{ gap: SPACE.md }}>
          <Segmented
            label="Фильтр"
            value={filter}
            onChange={setFilter}
            items={[
              { value: 'all', label: 'Все' },
              { value: 'good', label: 'Полезные' },
              { value: 'bad', label: 'Вредные' },
            ]}
          />
          <Segmented
            label="Важность"
            value={prio}
            onChange={setPrio}
            font="marks"
            height={44}
            items={[
              { value: '0', label: '—', a11yLabel: 'Без важности' },
              { value: '1', label: '!', a11yLabel: 'Низкая' },
              { value: '2', label: '!!', a11yLabel: 'Средняя' },
              { value: '3', label: '!!!', a11yLabel: 'Высокая', color: p.debt },
            ]}
          />
        </View>
      </Section>

      <Section title="Переключатели">
        <View style={{ gap: SPACE.md }}>
          {[
            ['Пацанский тон', tone, setTone] as const,
            ['Звания и очки', ranks, setRanks] as const,
          ].map(([label, v, set]) => (
            <View
              key={label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={[TYPE.bodyStrong, { color: p.ink }]}>{label}</Text>
              <Switch value={v} onChange={set} label={label} />
            </View>
          ))}
        </View>
      </Section>

      <Section title="Чипы">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm }}>
          {['all', 'Работа · 5', 'Зал · 2'].map((a) => (
            <Chip
              key={a}
              label={a === 'all' ? 'Все' : a}
              selected={areas.includes(a)}
              onPress={() => toggleArea(a)}
            />
          ))}
          <Chip label="+ Сфера" dashed />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm }}>
          {[
            ['today', 'Сегодня'],
            ['tomorrow', 'Завтра'],
            ['none', 'Без даты'],
          ].map(([v, l]) => (
            <Chip
              key={v}
              size="md"
              role="radio"
              label={l}
              selected={when === v}
              onPress={() => setWhen(v)}
            />
          ))}
          <Chip size="md" label="Дата…" dashed />
        </View>
      </Section>

      <Section title="Поля">
        <View style={{ gap: SPACE.lg }}>
          <TextField label="Что сделать" value={title} onChangeText={setTitle} />
          <TextField
            label="Поиск"
            variant="search"
            placeholder="Найти дело"
            value={query}
            onChangeText={setQuery}
          />
          <TextField
            label="Пару слов (для себя)"
            variant="note"
            placeholder="Что зашло, что нет"
            value={note}
            onChangeText={setNote}
          />
        </View>
      </Section>

      <Section title="Плитки">
        <View style={{ flexDirection: 'row', gap: SPACE.sm }}>
          <OptionTile
            icon="remind"
            label="По времени"
            selected={remind === 'time'}
            onPress={() => setRemind('time')}
          />
          <OptionTile
            icon="place"
            label="У зала"
            hint="при входе · 150 м"
            selected={remind === 'place'}
            onPress={() => setRemind('place')}
          />
        </View>
      </Section>
    </>
  );
}
