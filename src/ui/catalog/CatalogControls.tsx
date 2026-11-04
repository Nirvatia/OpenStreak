/** Каталог: кнопки, сегменты, чипы, важность, переключатель, поля, плитки. */
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { usePalette } from '../../store/themeStore';
import { SPACE } from '../../theme/metrics';
import { TYPE } from '../../theme/type';
import { Button, IconButton } from '../Button';
import { Chip } from '../Chip';
import { OptionTile } from '../OptionTile';
import { PriorityPicker, type PriorityLevel } from '../Priority';
import { Segmented } from '../Segmented';
import { Switch } from '../Switch';
import { TextField } from '../TextField';
import { Section } from './Section';

const PRIORITY_LABELS: [string, string, string, string] = [
  'Без важности',
  'Низкая',
  'Средняя',
  'Высокая',
];

export function CatalogControls() {
  const p = usePalette();
  const [filter, setFilter] = useState<'all' | 'good' | 'bad'>('all');
  const [prio, setPrio] = useState<PriorityLevel>(2);
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
        <View style={{ gap: SPACE.md }}>
          <Button label="Записать" onPress={() => {}} />
          <Button label="Выходной" variant="secondary" onPress={() => {}} />
          <Button label="Слил сегодня" variant="danger" onPress={() => {}} />
          <Button label="Записать" disabled />
          <View style={{ flexDirection: 'row', gap: SPACE.lg, alignItems: 'center' }}>
            <IconButton icon="settings" label="Настройки" tone="muted" />
            <IconButton icon="calendar" label="Календарь" tone="muted" />
            <IconButton icon="plus" label="Новая привычка" variant="solid" />
          </View>
        </View>
      </Section>

      <Section title="Сегменты и важность">
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
        <PriorityPicker label="Важность" value={prio} onChange={setPrio} labels={PRIORITY_LABELS} />
      </Section>

      <Section title="Переключатели">
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
              minHeight: 52,
              borderBottomWidth: 1,
              borderBottomColor: p.line,
            }}
          >
            <Text style={[TYPE.item, { color: p.text }]}>{label}</Text>
            <Switch value={v} onChange={set} label={label} />
          </View>
        ))}
      </Section>

      <Section title="Чипы">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
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
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
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
          <TextField label="что сделать" value={title} onChangeText={setTitle} />
          <TextField
            label="Поиск"
            variant="search"
            placeholder="Найти дело"
            value={query}
            onChangeText={setQuery}
          />
          <TextField
            label="пару слов (для себя)"
            variant="note"
            placeholder="Что зашло, что нет"
            value={note}
            onChangeText={setNote}
          />
        </View>
      </Section>

      <Section title="Плитки">
        <View style={{ flexDirection: 'row', gap: 6 }}>
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
