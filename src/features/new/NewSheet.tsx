/**
 * Шторка «Новое» (design/mult/M-New): дело, привычка или цель.
 * Дело — когда, важность, напоминание по времени. Привычка — полезная/вредная, напоминание.
 * Цель — срок, зачёт, награда, «если слил». Напоминание по месту появится с геозонами (этап 5).
 */
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as A from '../../core/actions';
import { addDays } from '../../core/dates';
import { live, type ISODate, type Priority } from '../../core/model';
import { useDataStore } from '../../core/store';
import type { MessageKey } from '../../i18n';
import { useT } from '../../store/prefsStore';
import { usePalette } from '../../store/themeStore';
import { SPACE } from '../../theme/metrics';
import { TYPE } from '../../theme/type';
import { Button } from '../../ui/Button';
import { Chip } from '../../ui/Chip';
import { OptionTile } from '../../ui/OptionTile';
import { PriorityPicker } from '../../ui/Priority';
import { Segmented } from '../../ui/Segmented';
import { Sheet } from '../../ui/Sheet';
import { TextField } from '../../ui/TextField';
import { useToast } from '../../ui/toast';
import { dayMonth } from '../format';
import { useNewSheet, type NewKind } from './newSheetStore';

/** Системный выбор даты и времени есть только на телефонах. */
const HAS_PICKER = Platform.OS !== 'web';

const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (d: Date): ISODate =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const timeOf = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export function NewSheet() {
  const seq = useNewSheet((s) => s.seq);
  return <NewSheetForm key={seq} />;
}

function NewSheetForm() {
  const t = useT();
  const today = useDataStore((s) => s.today);
  const { open, kind: initialKind, editId, editHabitId, areaId: initialArea, hide } = useNewSheet();
  const toast = useToast((s) => s.show);
  const editing = useDataStore((s) => {
    const task = editId ? s.data.tasks[editId] : undefined;
    return task && task.deletedAt === null ? task : undefined;
  });
  const editingHabit = useDataStore((s) => {
    const habit = editHabitId ? s.data.habits[editHabitId] : undefined;
    return habit && habit.deletedAt === null ? habit : undefined;
  });
  const areas = useDataStore((s) => s.data.areas);
  const areaList = useMemo(() => live(areas).sort((a, b) => a.createdAt - b.createdAt), [areas]);

  const [kind, setKind] = useState<NewKind>(initialKind);
  const [title, setTitle] = useState(editing?.title ?? editingHabit?.name ?? '');
  const [date, setDate] = useState<ISODate | null>(
    editing ? editing.date : initialKind === 'goal' ? null : today
  );
  const [priority, setPriority] = useState<Priority>(editing?.priority ?? 0);
  const [remindAt, setRemindAt] = useState(editing?.remindAt ?? editingHabit?.remindAt ?? '');
  const [areaId, setAreaId] = useState<string | null>(editing ? editing.areaId : initialArea);
  const [bad, setBad] = useState(editingHabit?.kind === 'bad');
  const [criterion, setCriterion] = useState('');
  const [reward, setReward] = useState('');
  const [penalty, setPenalty] = useState('');
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);

  const changeKind = (k: NewKind) => {
    setKind(k);
    setDate(k === 'goal' ? null : today);
  };

  const tomorrow = addDays(today, 1);
  const custom = date !== null && date !== today && date !== tomorrow;
  const canSave = title.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    if (editingHabit) {
      A.editHabitBasics(editingHabit.id, { name: title, kind: bad ? 'bad' : 'good', remindAt });
    } else if (editing) {
      A.updateTask(editing.id, { title, date, priority, remindAt, areaId });
    } else if (kind === 'task') {
      A.createTask({ title, date, priority, remindAt, areaId });
    } else if (kind === 'habit') {
      A.createQuickHabit({ name: title, kind: bad ? 'bad' : 'good', remindAt });
    } else {
      A.createGoal(null, { text: title, criterion, reward, penalty, deadline: date });
    }
    hide();
    toast(t('toast.saved'));
  };

  const onPick = (e: DateTimePickerEvent, value?: Date) => {
    const mode = picker;
    setPicker(null);
    if (e.type !== 'set' || !value) return;
    if (mode === 'date') setDate(isoOf(value));
    else setRemindAt(timeOf(value));
  };

  const label = (k: NewKind) => t(`new.kind.${k}` as MessageKey);

  return (
    <Sheet
      visible={open}
      onClose={hide}
      title={t(editing ? 'new.kind.task' : editingHabit ? 'edit.habit' : 'new.title')}
      footer={
        <Button
          label={t(editing || editingHabit ? 'edit.save' : 'new.save')}
          onPress={save}
          disabled={!canSave}
        />
      }
    >
      {!editing && !editingHabit && (
        <Segmented<NewKind>
          label={t('new.kind')}
          on="bg"
          value={kind}
          onChange={changeKind}
          items={(['task', 'habit', 'goal'] as const).map((k) => ({ value: k, label: label(k) }))}
        />
      )}

      <TextField
        label={t(kind === 'task' ? 'new.task' : kind === 'habit' ? 'new.habit' : 'new.goal')}
        value={title}
        onChangeText={setTitle}
        autoFocus={!editing && !editingHabit}
        returnKeyType="done"
        onSubmitEditing={save}
      />

      {kind === 'habit' && (
        <Group title={t('new.habitKind')}>
          <View style={styles.chips} accessibilityRole="radiogroup">
            <Chip
              size="md"
              role="radio"
              label={t('habit.good')}
              selected={!bad}
              onPress={() => setBad(false)}
            />
            <Chip
              size="md"
              role="radio"
              label={t('habit.bad')}
              selected={bad}
              onPress={() => setBad(true)}
            />
          </View>
        </Group>
      )}

      {kind !== 'habit' && (
        <Group title={t(kind === 'goal' ? 'new.deadline' : 'new.when')}>
          <View style={styles.chips} accessibilityRole="radiogroup">
            {kind === 'task' && (
              <>
                <Chip
                  size="md"
                  role="radio"
                  label={t('when.today')}
                  selected={date === today}
                  onPress={() => setDate(today)}
                />
                <Chip
                  size="md"
                  role="radio"
                  label={t('when.tomorrow')}
                  selected={date === tomorrow}
                  onPress={() => setDate(tomorrow)}
                />
              </>
            )}
            <Chip
              size="md"
              role="radio"
              label={t(kind === 'goal' ? 'deadline.none' : 'when.none')}
              selected={date === null}
              onPress={() => setDate(null)}
            />
            {HAS_PICKER && (
              <Chip
                size="md"
                role="radio"
                dashed={!custom}
                selected={custom}
                label={custom ? dayMonth(t, date) : t('when.pick')}
                onPress={() => setPicker('date')}
              />
            )}
          </View>
        </Group>
      )}

      {kind === 'task' && (
        <Group title={t('new.priority')}>
          <PriorityPicker
            label={t('new.priority')}
            value={priority}
            onChange={setPriority}
            labels={[t('priority.0'), t('priority.1'), t('priority.2'), t('priority.3')]}
          />
        </Group>
      )}

      {kind === 'task' && areaList.length > 0 && (
        <Group title={t('new.area')}>
          <View style={styles.chips} accessibilityRole="radiogroup">
            <Chip
              size="md"
              role="radio"
              label={t('area.none')}
              selected={areaId === null}
              onPress={() => setAreaId(null)}
            />
            {areaList.map((a) => (
              <Chip
                key={a.id}
                size="md"
                role="radio"
                label={a.name}
                selected={areaId === a.id}
                onPress={() => setAreaId(a.id)}
              />
            ))}
          </View>
        </Group>
      )}

      {kind === 'goal' && (
        <>
          <TextField
            variant="note"
            label={t('goal.criterion')}
            value={criterion}
            onChangeText={setCriterion}
          />
          <TextField
            variant="note"
            label={t('goal.reward')}
            value={reward}
            onChangeText={setReward}
          />
          <TextField
            variant="note"
            label={t('goal.penalty')}
            value={penalty}
            onChangeText={setPenalty}
          />
        </>
      )}

      {HAS_PICKER && kind !== 'goal' && !(kind === 'habit' && bad) && (
        <Group title={t('new.remind')}>
          <View style={styles.tiles}>
            <OptionTile
              icon="remind"
              label={t('remind.time')}
              hint={remindAt ? t('remind.at', { time: remindAt }) : undefined}
              selected={!!remindAt}
              onPress={() => (remindAt ? setRemindAt('') : setPicker('time'))}
            />
          </View>
        </Group>
      )}

      {picker && (
        <DateTimePicker
          mode={picker}
          value={
            picker === 'date'
              ? new Date(`${date ?? today}T12:00`)
              : remindAt
                ? new Date(`2000-01-01T${remindAt}`)
                : new Date()
          }
          minimumDate={picker === 'date' ? new Date(`${today}T00:00`) : undefined}
          onChange={onPick}
        />
      )}
    </Sheet>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const p = usePalette();
  return (
    <View style={styles.group}>
      <Text style={[TYPE.meta, { color: p.muted }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: SPACE.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.tight },
  tiles: { flexDirection: 'row', gap: SPACE.tight },
});
