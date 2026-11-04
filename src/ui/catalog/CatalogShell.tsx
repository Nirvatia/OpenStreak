/** Каталог: шапки, заголовки разделов, таб-бар, шторка, тост. */
import React, { useState } from 'react';
import { View } from 'react-native';
import { useT } from '../../store/prefsStore';
import { usePalette } from '../../store/themeStore';
import { SPACE } from '../../theme/stamp';
import { Button, IconButton } from '../Button';
import { Chip } from '../Chip';
import { Divider } from '../Divider';
import { OptionTile } from '../OptionTile';
import { ScreenHeader, SectionTitle } from '../ScreenHeader';
import { Segmented } from '../Segmented';
import { Sheet } from '../Sheet';
import { TabBar } from '../TabBar';
import { TextField } from '../TextField';
import { showToast } from '../toast';

type SectionC = React.FC<{ title: string; children: React.ReactNode }>;
type Tab = 'today' | 'tasks' | 'habits' | 'goals' | 'stats';

export function CatalogShell({ Section }: { Section: SectionC }) {
  const p = usePalette();
  const t = useT();
  const [tab, setTab] = useState<Tab>('today');
  const [sheet, setSheet] = useState(false);
  const [title, setTitle] = useState('Записаться в зал');
  const [prio, setPrio] = useState<'0' | '1' | '2' | '3'>('2');

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
            title="Задачи"
            right={<IconButton icon="calendar" label="Календарь" variant="frame" />}
          />
          <ScreenHeader title="Настройки" onBack={() => {}} />
          <View>
            <SectionTitle title="Долги" count={1} color={p.debt} />
            <Divider dashed />
            <SectionTitle title="Сегодня" count={3} />
          </View>
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
              { key: 'stats', label: t('tab.stats'), icon: 'stats' },
            ]}
          />
        </View>
      </Section>

      <Section title="Шторка и тост">
        <View style={{ gap: SPACE.md }}>
          <Button label="Открыть шторку" variant="outline" onPress={() => setSheet(true)} />
          <Button label="Тост" variant="outline" onPress={() => showToast(t('toast.dayClosed'))} />
          <Button
            label="Тост с отменой"
            variant="outline"
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
        title="Новое дело"
        footer={<Button label="Записать" onPress={() => setSheet(false)} />}
      >
        <TextField label="Что сделать" value={title} onChangeText={setTitle} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm }}>
          <Chip size="md" role="radio" label="Сегодня" selected />
          <Chip size="md" role="radio" label="Завтра" />
          <Chip size="md" label="Дата…" dashed />
        </View>
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
        <View style={{ flexDirection: 'row', gap: SPACE.sm }}>
          <OptionTile icon="remind" label="По времени" />
          <OptionTile icon="place" label="У зала" hint="при входе · 150 м" selected />
        </View>
      </Sheet>
    </>
  );
}
