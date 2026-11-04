/** Каталог: шапки, таб-бар, шторка, тост. */
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useT } from '../../store/prefsStore';
import { usePalette } from '../../store/themeStore';
import { SPACE } from '../../theme/metrics';
import { TYPE } from '../../theme/type';
import { Button, IconButton } from '../Button';
import { Chip } from '../Chip';
import { OptionTile } from '../OptionTile';
import { PriorityPicker, type PriorityLevel } from '../Priority';
import { ScreenHeader } from '../ScreenHeader';
import { Segmented } from '../Segmented';
import { Sheet } from '../Sheet';
import { TabBar } from '../TabBar';
import { TextField } from '../TextField';
import { showToast } from '../toast';
import { Section } from './Section';

type Tab = 'today' | 'tasks' | 'habits' | 'goals' | 'pack';

export function CatalogShell() {
  const p = usePalette();
  const t = useT();
  const [tab, setTab] = useState<Tab>('today');
  const [sheet, setSheet] = useState(false);
  const [kind, setKind] = useState<'task' | 'habit' | 'goal'>('task');
  const [title, setTitle] = useState('Записаться в зал');
  const [prio, setPrio] = useState<PriorityLevel>(2);

  return (
    <>
      <Section title="Шапки экранов">
        <View style={{ gap: SPACE.xl }}>
          <ScreenHeader
            kicker="3 договора · 1 закрыт"
            title="Цели"
            right={<IconButton icon="plus" label="Новая цель" variant="solid" />}
          />
          <ScreenHeader
            kicker="12 в работе · 1 долг"
            title="Дела"
            right={<IconButton icon="calendar" label="Календарь" tone="muted" />}
          />
          <ScreenHeader title="Настройки" onBack={() => {}} />
        </View>
      </Section>

      <Section title="Цитата">
        <View style={{ gap: 2 }}>
          <Text style={[TYPE.quote, { color: p.text }]}>
            Волк не ждёт понедельника. Волк и есть понедельник.
          </Text>
          <Text style={[TYPE.label, { color: p.muted }]}>{t('wolf.signature')}</Text>
        </View>
      </Section>

      <Section title="Таб-бар">
        <View style={{ marginHorizontal: -SPACE.screenX }}>
          <TabBar
            label="Разделы"
            active={tab}
            onSelect={setTab}
            items={[
              { key: 'today', label: t('tab.today'), icon: 'today' },
              { key: 'tasks', label: t('tab.tasks'), icon: 'tasks' },
              { key: 'habits', label: t('tab.habits'), icon: 'habits' },
              { key: 'goals', label: t('tab.goals'), icon: 'goals' },
              { key: 'pack', label: t('tab.pack'), icon: 'pack' },
            ]}
          />
        </View>
      </Section>

      <Section title="Шторка и тост">
        <View style={{ gap: SPACE.sm }}>
          <Button label="Открыть шторку" variant="secondary" onPress={() => setSheet(true)} />
          <Button
            label="Тост"
            variant="secondary"
            onPress={() => showToast(t('toast.dayClosed'))}
          />
          <Button
            label="Тост с отменой"
            variant="secondary"
            onPress={() =>
              showToast(t('toast.taskDeleted'), {
                label: t('common.undo'),
                onPress: () => showToast('Вернул.'),
              })
            }
          />
        </View>
      </Section>

      <Sheet
        visible={sheet}
        onClose={() => setSheet(false)}
        title="Новое"
        footer={<Button label="Записать" onPress={() => setSheet(false)} />}
      >
        <Segmented
          label="Что это"
          on="bg"
          value={kind}
          onChange={setKind}
          items={[
            { value: 'task', label: 'Дело' },
            { value: 'habit', label: 'Привычка' },
            { value: 'goal', label: 'Цель' },
          ]}
        />
        <TextField label="что сделать" value={title} onChangeText={setTitle} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          <Chip size="md" role="radio" label="Сегодня" selected />
          <Chip size="md" role="radio" label="Завтра" />
          <Chip size="md" label="Дата…" dashed />
        </View>
        <PriorityPicker
          label="Важность"
          value={prio}
          onChange={setPrio}
          labels={['Без важности', 'Низкая', 'Средняя', 'Высокая']}
        />
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <OptionTile icon="remind" label="По времени" />
          <OptionTile icon="place" label="У зала" hint="при входе · 150 м" selected />
        </View>
      </Sheet>
    </>
  );
}
