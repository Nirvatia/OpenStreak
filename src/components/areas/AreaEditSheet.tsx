import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { useToastStore } from '../../store/toastStore';
import { ColorPicker } from './ColorPicker';
import { IconPicker } from './IconPicker';
import { COLORS } from '../../constants/colors';
import { PlaceholderIcon } from '../ui/PlaceholderIcon';
import { Goal } from '../../types/models';
import { uid, human, todayStr } from '../../utils/text';

export const AreaEditSheet: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const addArea = useAppStore((s) => s.addArea);
  const updateArea = useAppStore((s) => s.updateArea);
  const { areaEditVisible, editingAreaId, closeAreaEditSheet } = useUiStore();
  const showToast = useToastStore((s) => s.show);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState('target');
  const [nameError, setNameError] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [gText, setGText] = useState('');
  const [gCrit, setGCrit] = useState('');
  const [gRew, setGRew] = useState('');
  const [gPen, setGPen] = useState('');
  const [gDead, setGDead] = useState<string | null>(null);
  const [gTextError, setGTextError] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const editingArea = editingAreaId ? state.areas.find((a) => a.id === editingAreaId) : null;

  useEffect(() => {
    if (!areaEditVisible) return;
    if (editingArea) {
      setName(editingArea.name);
      setColor(editingArea.color);
      setIcon(editingArea.icon);
      setGoals(editingArea.goals.map((g) => ({ ...g })));
    } else {
      setName('');
      setColor(COLORS[0]);
      setIcon('target');
      setGoals([]);
    }
    setNameError(false);
    setFormOpen(false);
    setGText('');
    setGCrit('');
    setGRew('');
    setGPen('');
    setGDead(null);
    setGTextError(false);
    setShowPicker(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaEditVisible, editingAreaId]);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError(true);
      setTimeout(() => setNameError(false), 400);
      return;
    }
    if (editingAreaId) {
      updateArea(editingAreaId, { name: trimmedName, color, icon, goals });
    } else {
      addArea({ name: trimmedName, color, icon, goals });
    }
    closeAreaEditSheet();
    showToast('Сфера сохранена');
  };

  const handleAddGoal = () => {
    const trimmed = gText.trim();
    if (!trimmed) {
      setGTextError(true);
      setTimeout(() => setGTextError(false), 400);
      return;
    }
    setGoals((prev) => [
      ...prev,
      {
        id: uid(),
        text: trimmed,
        crit: gCrit.trim(),
        rew: gRew.trim(),
        pen: gPen.trim(),
        dead: gDead,
        done: false,
        doneAt: null,
      },
    ]);
    setGText('');
    setGCrit('');
    setGRew('');
    setGPen('');
    setGDead(null);
    setFormOpen(false);
  };

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, done: !g.done, doneAt: !g.done ? todayStr() : null } : g
      )
    );
  };

  const removeGoalDraft = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handlePick = (_e: any, selected?: Date) => {
    setShowPicker(false);
    if (selected) {
      const y = selected.getFullYear();
      const m = String(selected.getMonth() + 1).padStart(2, '0');
      const d = String(selected.getDate()).padStart(2, '0');
      setGDead(`${y}-${m}-${d}`);
    }
  };

  if (!areaEditVisible) return null;
  const tb = todayStr();

  return (
    <BottomSheet
      index={0}
      snapPoints={['82%']}
      enablePanDownToClose
      onClose={closeAreaEditSheet}
      backgroundStyle={{ backgroundColor: currentTheme.colors.card }}
      handleIndicatorStyle={{ backgroundColor: currentTheme.colors.line }}
      keyboardBehavior="interactive"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: currentTheme.colors.text }]}>
          {editingArea ? 'Сфера' : 'Новая сфера'}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              color: currentTheme.colors.text,
              borderBottomColor: nameError ? currentTheme.colors.red : currentTheme.colors.line,
            },
          ]}
          placeholder="Например: Учёба"
          placeholderTextColor={currentTheme.colors.muted}
          value={name}
          onChangeText={setName}
          maxLength={30}
        />
        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Цвет</Text>
        <ColorPicker selectedColor={color} onSelect={setColor} />
        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Иконка</Text>
        <IconPicker selectedIcon={icon} onSelect={setIcon} />
        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>
          Цели (необязательно)
        </Text>
        {goals.length === 0 && !formOpen && (
          <Text style={[styles.empty, { color: currentTheme.colors.muted }]}>
            Целей нет — добавьте, если хотите
          </Text>
        )}
        {goals.map((g) => {
          const late = !!g.dead && g.dead < tb && !g.done;
          return (
            <View
              key={g.id}
              style={[styles.goalItem, { backgroundColor: currentTheme.colors.card2 }]}
            >
              <TouchableOpacity
                style={[
                  styles.goalCheck,
                  { borderColor: currentTheme.colors.muted },
                  g.done && {
                    backgroundColor: currentTheme.colors.green,
                    borderColor: currentTheme.colors.green,
                  },
                ]}
                onPress={() => toggleGoal(g.id)}
                activeOpacity={0.8}
              >
                {g.done ? <PlaceholderIcon name="check" size={13} /> : null}
              </TouchableOpacity>
              <View style={styles.goalBody}>
                <Text
                  style={[
                    styles.goalText,
                    { color: g.done ? currentTheme.colors.muted : currentTheme.colors.text },
                    g.done && styles.goalTextDone,
                  ]}
                >
                  {g.text}
                </Text>
                {g.crit ? (
                  <View style={styles.goalSubRow}>
                    <PlaceholderIcon name="target" size={12} />
                    <Text style={[styles.goalSub, { color: currentTheme.colors.muted }]}>
                      {g.crit}
                    </Text>
                  </View>
                ) : null}
                {g.rew ? (
                  <View style={styles.goalSubRow}>
                    <PlaceholderIcon name="gift" size={12} />
                    <Text style={[styles.goalSub, { color: currentTheme.colors.muted }]}>
                      {g.rew}
                    </Text>
                  </View>
                ) : null}
                {g.pen ? (
                  <View style={styles.goalSubRow}>
                    <PlaceholderIcon name="warning" size={12} />
                    <Text style={[styles.goalSub, { color: currentTheme.colors.muted }]}>
                      {g.pen}
                    </Text>
                  </View>
                ) : null}
                {g.dead ? (
                  <View style={styles.goalSubRow}>
                    <PlaceholderIcon name="hourglass" size={12} />
                    <Text
                      style={[
                        styles.goalSub,
                        { color: late ? currentTheme.colors.red : currentTheme.colors.muted },
                        late && { fontWeight: '700' },
                      ]}
                    >
                      {`до ${human(g.dead)}${late ? ' · просрочена' : ''}`}
                    </Text>
                  </View>
                ) : null}
              </View>
              <TouchableOpacity
                style={styles.goalDel}
                onPress={() => removeGoalDraft(g.id)}
                activeOpacity={0.7}
              >
                <PlaceholderIcon name="trash" size={15} />
              </TouchableOpacity>
            </View>
          );
        })}
        {formOpen ? (
          <View style={[styles.gform, { backgroundColor: currentTheme.colors.card2 }]}>
            <TextInput
              style={[
                styles.ginput,
                {
                  color: currentTheme.colors.text,
                  backgroundColor: currentTheme.colors.card,
                  borderColor: gTextError ? currentTheme.colors.red : 'transparent',
                },
              ]}
              placeholder="Например: Закрыть сессию на 5"
              placeholderTextColor={currentTheme.colors.muted}
              value={gText}
              onChangeText={setGText}
              maxLength={120}
            />
            <TextInput
              style={[
                styles.ginput,
                {
                  color: currentTheme.colors.text,
                  backgroundColor: currentTheme.colors.card,
                  borderColor: 'transparent',
                },
              ]}
              placeholder="Как пойму, что достиг?"
              placeholderTextColor={currentTheme.colors.muted}
              value={gCrit}
              onChangeText={setGCrit}
              maxLength={120}
            />
            <TextInput
              style={[
                styles.ginput,
                {
                  color: currentTheme.colors.text,
                  backgroundColor: currentTheme.colors.card,
                  borderColor: 'transparent',
                },
              ]}
              placeholder="Что будет, если достигну?"
              placeholderTextColor={currentTheme.colors.muted}
              value={gRew}
              onChangeText={setGRew}
              maxLength={120}
            />
            <TextInput
              style={[
                styles.ginput,
                {
                  color: currentTheme.colors.text,
                  backgroundColor: currentTheme.colors.card,
                  borderColor: 'transparent',
                },
              ]}
              placeholder="Что будет, если нет?"
              placeholderTextColor={currentTheme.colors.muted}
              value={gPen}
              onChangeText={setGPen}
              maxLength={120}
            />
            <TouchableOpacity
              style={[styles.gdate, { borderColor: currentTheme.colors.line }]}
              onPress={() => setShowPicker(true)}
              activeOpacity={0.8}
            >
              <Text style={{ color: gDead ? currentTheme.colors.text : currentTheme.colors.muted }}>
                {gDead ? human(gDead) : 'Выбрать…'}
              </Text>
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker
                value={gDead ? new Date(gDead + 'T00:00') : new Date()}
                mode="date"
                display="default"
                onChange={handlePick}
              />
            )}
            <View style={styles.gformActions}>
              <TouchableOpacity
                style={[styles.gsave, { backgroundColor: currentTheme.colors.accent }]}
                onPress={handleAddGoal}
                activeOpacity={0.8}
              >
                <Text style={[styles.gsaveText, { color: '#fff' }]}>Сохранить</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.gcancel}
                onPress={() => setFormOpen(false)}
                activeOpacity={0.7}
              >
                <PlaceholderIcon name="close" size={16} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.addGoalBtn,
              { borderColor: currentTheme.colors.line },
              !editingAreaId && { opacity: 0.5 },
            ]}
            onPress={() => {
              if (editingAreaId) setFormOpen(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.addGoalText, { color: currentTheme.colors.muted }]}>
              ＋ Добавить цель
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentTheme.colors.accent }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>Сохранить сферу</Text>
        </TouchableOpacity>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  input: {
    fontSize: 17,
    fontWeight: '600',
    paddingVertical: 10,
    borderBottomWidth: 2,
    marginBottom: 16,
  },
  label: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginVertical: 9,
  },
  button: {
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#2f7cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 5,
  },
  buttonText: { fontSize: 15, fontWeight: '700' },
  empty: { fontSize: 12.5, paddingVertical: 6 },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  goalCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  goalBody: { flex: 1 },
  goalText: { fontSize: 14, fontWeight: '600' },
  goalTextDone: { textDecorationLine: 'line-through' },
  goalSubRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  goalSub: { fontSize: 12 },
  goalDel: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.45,
  },
  gform: { borderRadius: 14, padding: 12, marginBottom: 8, gap: 8 },
  ginput: {
    fontSize: 13.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
  },
  gdate: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  gformActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  gsave: { flex: 1, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  gsaveText: { fontSize: 14, fontWeight: '700' },
  gcancel: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addGoalBtn: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addGoalText: { fontSize: 13, fontWeight: '600' },
});
