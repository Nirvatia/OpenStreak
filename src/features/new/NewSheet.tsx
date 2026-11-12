/**
 * Шторка «Новое» (design/mult/M-New): дело, привычка или цель.
 * Дело — когда, важность, напоминание по времени. Привычка — полезная/вредная, напоминание.
 * Цель — срок, зачёт, награда, «если слил». Дело и полезная привычка — ещё и напоминание по месту.
 */
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import * as A from '../../core/actions';
import { addDays } from '../../core/dates';
import { live, type ISODate, type PlaceTrigger, type Priority } from '../../core/model';
import { useDataStore } from '../../core/store';
import type { MessageKey } from '../../i18n';
import { useT } from '../../store/prefsStore';
import { usePalette, usePlain } from '../../store/themeStore';
import { SPACE } from '../../theme/metrics';
import { FONT } from '../../theme/fonts';
import { TYPE } from '../../theme/type';
import { Button } from '../../ui/Button';
import { Chip } from '../../ui/Chip';
import { FormRow } from '../../ui/FormRow';
import { OptionTile } from '../../ui/OptionTile';
import { PriorityPicker } from '../../ui/Priority';
import { Segmented } from '../../ui/Segmented';
import { Sheet } from '../../ui/Sheet';
import { NO_WEB_OUTLINE, TextField } from '../../ui/TextField';
import { useToast } from '../../ui/toast';
import { dayMonth } from '../format';
import { AreaSheet } from '../areas/AreaSheet';
import { usePlaceAccess } from '../places/placeAccessStore';
import { PlaceSheet } from '../places/PlaceSheet';
import { geofenceAccess } from '../../services/geofence';
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
  const {
    open,
    kind: initialKind,
    editId,
    editHabitId,
    editGoalId,
    areaId: initialArea,
    hide,
  } = useNewSheet();
  const toast = useToast((s) => s.show);
  const editing = useDataStore((s) => {
    const task = editId ? s.data.tasks[editId] : undefined;
    return task && task.deletedAt === null ? task : undefined;
  });
  const editingHabit = useDataStore((s) => {
    const habit = editHabitId ? s.data.habits[editHabitId] : undefined;
    return habit && habit.deletedAt === null ? habit : undefined;
  });
  const editingGoal = useDataStore((s) => {
    const goal = editGoalId ? s.data.goals[editGoalId] : undefined;
    return goal && goal.deletedAt === null ? goal : undefined;
  });
  const editingAny = !!(editing || editingHabit || editingGoal);
  const areas = useDataStore((s) => s.data.areas);
  const areaList = useMemo(() => live(areas).sort((a, b) => a.createdAt - b.createdAt), [areas]);

  const [kind, setKind] = useState<NewKind>(initialKind);
  const [title, setTitle] = useState(
    editing?.title ?? editingHabit?.name ?? editingGoal?.text ?? ''
  );
  const [date, setDate] = useState<ISODate | null>(
    editing
      ? editing.date
      : editingGoal
        ? editingGoal.deadline
        : initialKind === 'goal'
          ? null
          : today
  );
  const [priority, setPriority] = useState<Priority>(editing?.priority ?? 0);
  const [remindAt, setRemindAt] = useState(editing?.remindAt ?? editingHabit?.remindAt ?? '');
  const [areaId, setAreaId] = useState<string | null>(editing ? editing.areaId : initialArea);
  const [bad, setBad] = useState(editingHabit?.kind === 'bad');
  const [criterion, setCriterion] = useState(editingGoal?.criterion ?? '');
  const [reward, setReward] = useState(editingGoal?.reward ?? '');
  const [penalty, setPenalty] = useState(editingGoal?.penalty ?? '');
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);
  const places = useDataStore((s) => s.data.places);
  const placeList = useMemo(() => live(places).sort((a, b) => a.createdAt - b.createdAt), [places]);
  const [placeId, setPlaceId] = useState<string | null>(
    editing?.placeId ?? editingHabit?.placeId ?? null
  );
  const [placeTrigger, setPlaceTrigger] = useState<PlaceTrigger>(
    editing?.placeTrigger ?? editingHabit?.placeTrigger ?? 'enter'
  );
  const [placeSheet, setPlaceSheet] = useState(false);
  const [areaSheet, setAreaSheet] = useState(false);
  const plain = usePlain();
  const [openRow, setOpenRow] = useState<string | null>(
    initialKind === 'goal' ? 'deadline' : initialKind === 'habit' ? 'kind' : 'when'
  );
  const toggleRow = (k: string) => setOpenRow((cur) => (cur === k ? null : k));

  const changeKind = (k: NewKind) => {
    setKind(k);
    setDate(k === 'goal' ? null : today);
  };

  const tomorrow = addDays(today, 1);
  const custom = date !== null && date !== today && date !== tomorrow;
  const canSave = title.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    if (editingGoal) {
      A.editGoal(editingGoal.id, { text: title, criterion, reward, penalty, deadline: date });
    } else if (editingHabit) {
      A.editHabitBasics(editingHabit.id, {
        name: title,
        kind: bad ? 'bad' : 'good',
        remindAt,
        placeId,
        placeTrigger,
      });
    } else if (editing) {
      A.updateTask(editing.id, { title, date, priority, remindAt, areaId, placeId, placeTrigger });
    } else if (kind === 'task') {
      A.createTask({ title, date, priority, remindAt, areaId, placeId, placeTrigger });
    } else if (kind === 'habit') {
      A.createQuickHabit({
        name: title,
        kind: bad ? 'bad' : 'good',
        remindAt,
        placeId,
        placeTrigger,
      });
    } else {
      A.createGoal(null, { text: title, criterion, reward, penalty, deadline: date });
    }
    hide();
    toast(t('toast.saved'));
    // Напоминание по месту работает только с доступом «Всегда» — объясняем и просим.
    if (placeId && kind !== 'goal' && !(kind === 'habit' && bad)) {
      void geofenceAccess().then((a) => {
        if (a === 'foreground' || a === 'denied') usePlaceAccess.getState().show();
      });
    }
  };

  const removeGoal = () => {
    if (!editingGoal) return;
    const id = editingGoal.id;
    A.deleteGoal(id);
    hide();
    toast(t('toast.goalDeleted'), { label: t('common.return'), onPress: () => A.restoreGoal(id) });
  };

  const onPick = (e: DateTimePickerEvent, value?: Date) => {
    const mode = picker;
    setPicker(null);
    if (e.type !== 'set' || !value) return;
    if (mode === 'date') setDate(isoOf(value));
    else setRemindAt(timeOf(value));
  };

  const label = (k: NewKind) => t(`new.kind.${k}` as MessageKey);

  const pal = usePalette();
  const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
  const dateLabel =
    date === null
      ? t(kind === 'goal' ? 'deadline.none' : 'when.none')
      : date === today
        ? t('when.today')
        : date === tomorrow
          ? t('when.tomorrow')
          : dayMonth(t, date);
  const placeName = placeId ? (placeList.find((x) => x.id === placeId)?.name ?? '') : '';
  const areaName = areaId ? areaList.find((a) => a.id === areaId)?.name : undefined;
  const short = (x: string) => (x.length > 22 ? `${x.slice(0, 21)}…` : x);
  const titleKey = kind === 'task' ? 'new.task' : kind === 'habit' ? 'new.habit' : 'new.goal';

  /** «Обычный»: поле названия и строки со значениями; выбор раскрывается внутри строки. */
  const plainBody = (
    <>
      {!editingAny && (
        <Segmented<NewKind>
          label={t('new.kind')}
          on="bg"
          value={kind}
          onChange={(k) => {
            changeKind(k);
            setOpenRow(k === 'goal' ? 'deadline' : k === 'habit' ? 'kind' : 'when');
          }}
          items={(['task', 'habit', 'goal'] as const).map((k) => ({ value: k, label: label(k) }))}
        />
      )}

      <TextInput
        accessibilityLabel={t(titleKey)}
        placeholder={cap(t(titleKey))}
        placeholderTextColor={pal.muted}
        value={title}
        onChangeText={setTitle}
        autoFocus={!editingAny}
        returnKeyType="done"
        onSubmitEditing={save}
        style={[
          TYPE.title,
          styles.titleInput,
          { color: pal.text, borderBottomColor: pal.divider },
          Platform.OS === 'web' ? NO_WEB_OUTLINE : null,
        ]}
      />

      <View>
        {kind === 'task' && (
          <>
            <FormRow
              icon="calendar"
              label={cap(t('new.when'))}
              value={dateLabel}
              set={date !== null}
              open={openRow === 'when'}
              onPress={() => toggleRow('when')}
            >
              <View style={styles.chips} accessibilityRole="radiogroup">
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
                <Chip
                  size="md"
                  role="radio"
                  label={t('when.none')}
                  selected={date === null}
                  onPress={() => setDate(null)}
                />
                {HAS_PICKER && (
                  <Chip
                    size="md"
                    dashed
                    label={custom ? dayMonth(t, date) : t('when.pick')}
                    onPress={() => setPicker('date')}
                  />
                )}
              </View>
            </FormRow>
            <FormRow
              icon="goals"
              label={cap(t('new.priority'))}
              value={t(`priority.${priority}` as MessageKey)}
              set={priority > 0}
              open={openRow === 'priority'}
              onPress={() => toggleRow('priority')}
            >
              <View style={styles.chips} accessibilityRole="radiogroup">
                {([0, 1, 2, 3] as const).map((n) => (
                  <Chip
                    key={n}
                    size="md"
                    role="radio"
                    label={t(`priority.${n}` as MessageKey)}
                    selected={priority === n}
                    onPress={() => setPriority(n)}
                  />
                ))}
              </View>
            </FormRow>
            <FormRow
              icon="habits"
              label={cap(t('new.area'))}
              value={areaName ?? t('area.none')}
              set={areaId !== null}
              open={openRow === 'area'}
              onPress={() => toggleRow('area')}
            >
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
                <Chip size="md" dashed label={t('area.add')} onPress={() => setAreaSheet(true)} />
              </View>
            </FormRow>
          </>
        )}

        {kind === 'habit' && (
          <FormRow
            icon="pack"
            label={cap(t('new.habitKind'))}
            value={t(bad ? 'habit.bad' : 'habit.good')}
            set
            open={openRow === 'kind'}
            onPress={() => toggleRow('kind')}
          >
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
          </FormRow>
        )}

        {kind === 'goal' && (
          <>
            <FormRow
              icon="calendar"
              label={cap(t('new.deadline'))}
              value={dateLabel}
              set={date !== null}
              open={openRow === 'deadline'}
              onPress={() => toggleRow('deadline')}
            >
              <View style={styles.chips} accessibilityRole="radiogroup">
                <Chip
                  size="md"
                  role="radio"
                  label={t('deadline.none')}
                  selected={date === null}
                  onPress={() => setDate(null)}
                />
                {HAS_PICKER && (
                  <Chip
                    size="md"
                    dashed
                    label={date !== null ? dayMonth(t, date) : t('when.pick')}
                    onPress={() => setPicker('date')}
                  />
                )}
              </View>
            </FormRow>
            {(
              [
                ['criterion', 'tasks', 'goal.criterion', criterion, setCriterion],
                ['reward', 'goals', 'goal.reward', reward, setReward],
                ['penalty', 'history', 'goal.penalty', penalty, setPenalty],
              ] as const
            ).map(([key, icon, labelKey, value, setValue]) => (
              <FormRow
                key={key}
                icon={icon}
                label={cap(t(labelKey))}
                value={value ? short(value) : t('form.unset')}
                set={!!value}
                open={openRow === key}
                onPress={() => toggleRow(key)}
              >
                <TextField
                  variant="note"
                  label={t(labelKey)}
                  showLabel={false}
                  value={value}
                  onChangeText={setValue}
                />
              </FormRow>
            ))}
          </>
        )}

        {kind !== 'goal' && !(kind === 'habit' && bad) && (
          <FormRow
            icon="place"
            label={cap(t('new.place'))}
            value={
              placeId
                ? `${placeName} · ${t(placeTrigger === 'enter' ? 'place.enter' : 'place.exit').toLowerCase()}`
                : t('place.none')
            }
            set={placeId !== null}
            open={openRow === 'place'}
            onPress={() => toggleRow('place')}
          >
            <View style={styles.chips} accessibilityRole="radiogroup">
              <Chip
                size="md"
                role="radio"
                label={t('place.none')}
                selected={placeId === null}
                onPress={() => setPlaceId(null)}
              />
              {placeList.map((pl) => (
                <Chip
                  key={pl.id}
                  size="md"
                  role="radio"
                  label={pl.name}
                  selected={placeId === pl.id}
                  onPress={() => setPlaceId(pl.id)}
                />
              ))}
              <Chip size="md" dashed label={t('places.add')} onPress={() => setPlaceSheet(true)} />
            </View>
            {placeId !== null && (
              <View style={styles.chips} accessibilityRole="radiogroup">
                <Chip
                  size="md"
                  role="radio"
                  label={t('place.enter')}
                  selected={placeTrigger === 'enter'}
                  onPress={() => setPlaceTrigger('enter')}
                />
                <Chip
                  size="md"
                  role="radio"
                  label={t('place.exit')}
                  selected={placeTrigger === 'exit'}
                  onPress={() => setPlaceTrigger('exit')}
                />
              </View>
            )}
          </FormRow>
        )}

        {HAS_PICKER && kind !== 'goal' && !(kind === 'habit' && bad) && (
          <FormRow
            icon="remind"
            label={cap(t('new.remind'))}
            value={remindAt || t('form.unset')}
            set={!!remindAt}
            open={openRow === 'remind'}
            onPress={() => toggleRow('remind')}
          >
            <View style={styles.chips}>
              <Chip size="md" dashed label={t('form.pickTime')} onPress={() => setPicker('time')} />
              {!!remindAt && (
                <Chip size="md" label={t('form.clear')} onPress={() => setRemindAt('')} />
              )}
            </View>
          </FormRow>
        )}
      </View>
    </>
  );

  return (
    <Sheet
      visible={open}
      onClose={hide}
      title={t(
        editing
          ? 'new.kind.task'
          : editingHabit
            ? 'edit.habit'
            : editingGoal
              ? 'edit.goal'
              : 'new.title'
      )}
      footer={
        <View style={styles.footer}>
          {editingGoal && <Button label={t('edit.delete')} variant="danger" onPress={removeGoal} />}
          <Button
            label={t(editingAny ? 'edit.save' : 'new.save')}
            onPress={save}
            disabled={!canSave}
            style={styles.grow}
          />
        </View>
      }
    >
      {plain ? (
        plainBody
      ) : (
        <>
          {!editingAny && (
            <Segmented<NewKind>
              label={t('new.kind')}
              on="bg"
              value={kind}
              onChange={changeKind}
              items={(['task', 'habit', 'goal'] as const).map((k) => ({
                value: k,
                label: label(k),
              }))}
            />
          )}

          <TextField
            label={t(kind === 'task' ? 'new.task' : kind === 'habit' ? 'new.habit' : 'new.goal')}
            value={title}
            onChangeText={setTitle}
            autoFocus={!editingAny}
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

          {kind === 'task' && (
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
                <Chip size="md" dashed label={t('area.add')} onPress={() => setAreaSheet(true)} />
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

          {kind !== 'goal' && !(kind === 'habit' && bad) && (
            <Group title={t('new.place')}>
              <View style={styles.chips} accessibilityRole="radiogroup">
                <Chip
                  size="md"
                  role="radio"
                  label={t('place.none')}
                  selected={placeId === null}
                  onPress={() => setPlaceId(null)}
                />
                {placeList.map((pl) => (
                  <Chip
                    key={pl.id}
                    size="md"
                    role="radio"
                    label={pl.name}
                    selected={placeId === pl.id}
                    onPress={() => setPlaceId(pl.id)}
                  />
                ))}
                <Chip
                  size="md"
                  dashed
                  label={t('places.add')}
                  onPress={() => setPlaceSheet(true)}
                />
              </View>
              {placeId !== null && (
                <View style={styles.chips} accessibilityRole="radiogroup">
                  <Chip
                    size="md"
                    role="radio"
                    label={t('place.enter')}
                    selected={placeTrigger === 'enter'}
                    onPress={() => setPlaceTrigger('enter')}
                  />
                  <Chip
                    size="md"
                    role="radio"
                    label={t('place.exit')}
                    selected={placeTrigger === 'exit'}
                    onPress={() => setPlaceTrigger('exit')}
                  />
                </View>
              )}
            </Group>
          )}
        </>
      )}

      {areaSheet && (
        <AreaSheet
          visible
          editId={null}
          onClose={() => setAreaSheet(false)}
          onSaved={(id) => setAreaId(id)}
        />
      )}

      {placeSheet && (
        <PlaceSheet
          visible
          editId={null}
          onClose={() => setPlaceSheet(false)}
          onSaved={(id) => setPlaceId(id)}
        />
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
  footer: { flexDirection: 'row', gap: SPACE.md },
  grow: { flex: 1 },
  group: { gap: SPACE.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.tight, alignItems: 'center' },
  titleInput: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    fontSize: 24,
    fontFamily: FONT.inter.medium,
  },
  tiles: { flexDirection: 'row', gap: SPACE.tight },
});
