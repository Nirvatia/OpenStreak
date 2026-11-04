import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { useToastStore } from '../../store/toastStore';
import { PlaceholderIcon } from '../ui/PlaceholderIcon';
import { human } from '../../utils/text';

export const RestSheet: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const addRestPeriod = useAppStore((s) => s.addRestPeriod);
  const removeRestPeriod = useAppStore((s) => s.removeRestPeriod);
  const { restHabitId, closeRestSheet } = useUiStore();
  const showToast = useToastStore((s) => s.show);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const [sureKey, setSureKey] = useState<string | null>(null);
  // Тип таймера не из Node: его типы в проект не тянутся, а в RN
  // setTimeout возвращает number. ReturnType работает в обоих случаях.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const habit = restHabitId ? state.habits.find((h) => h.id === restHabitId) : null;

  useEffect(() => {
    setFrom('');
    setTo('');
    setSureKey(null);
  }, [restHabitId]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!habit) return null;

  const handlePickFrom = (event: any, selected?: Date) => {
    setShowFrom(false);
    if (selected) {
      const y = selected.getFullYear();
      const m = String(selected.getMonth() + 1).padStart(2, '0');
      const d = String(selected.getDate()).padStart(2, '0');
      setFrom(`${y}-${m}-${d}`);
    }
  };

  const handlePickTo = (event: any, selected?: Date) => {
    setShowTo(false);
    if (selected) {
      const y = selected.getFullYear();
      const m = String(selected.getMonth() + 1).padStart(2, '0');
      const d = String(selected.getDate()).padStart(2, '0');
      setTo(`${y}-${m}-${d}`);
    }
  };

  const handleAdd = () => {
    if (!from) {
      showToast('Выберите дату начала');
      return;
    }
    const tt = to || from;
    if (tt < from) {
      showToast('Конец раньше начала');
      return;
    }
    addRestPeriod({ habitId: habit.id, from, to: tt });
    setFrom('');
    setTo('');
    showToast('Период отдыха добавлен');
  };

  const handleDelete = (f: string, t: string) => {
    const key = `${f}|${t}`;
    if (sureKey === key) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setSureKey(null);
      removeRestPeriod({ habitId: habit.id, from: f, to: t });
      showToast('Период удалён');
    } else {
      setSureKey(key);
      showToast('Нажмите ещё раз для удаления');
      timeoutRef.current = setTimeout(() => {
        setSureKey(null);
      }, 2300);
    }
  };

  const sortedRest = (habit.rest || []).slice().sort((a, b) => (a.f < b.f ? -1 : 1));

  return (
    <BottomSheet
      index={0}
      snapPoints={['62%']}
      enablePanDownToClose
      onClose={closeRestSheet}
      backgroundStyle={{ backgroundColor: currentTheme.colors.card }}
      handleIndicatorStyle={{ backgroundColor: currentTheme.colors.line }}
    >
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: currentTheme.colors.text }]}>
          Отдых · {habit.name}
        </Text>
        <Text style={[styles.hint, { color: currentTheme.colors.muted }]}>
          Дни отдыха не требуют отметок и не разрывают серию — например, отпуск или командировка.
        </Text>

        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Новый период</Text>
        <View style={styles.range}>
          <TouchableOpacity
            style={[styles.dateBtn, { borderColor: currentTheme.colors.line }]}
            onPress={() => setShowFrom(true)}
          >
            <Text style={{ color: from ? currentTheme.colors.text : currentTheme.colors.muted }}>
              {from ? human(from) : 'от'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateBtn, { borderColor: currentTheme.colors.line }]}
            onPress={() => setShowTo(true)}
          >
            <Text style={{ color: to ? currentTheme.colors.text : currentTheme.colors.muted }}>
              {to ? human(to) : 'до'}
            </Text>
          </TouchableOpacity>
        </View>
        {showFrom && (
          <DateTimePicker
            value={from ? new Date(from + 'T00:00') : new Date()}
            mode="date"
            display="default"
            onChange={handlePickFrom}
          />
        )}
        {showTo && (
          <DateTimePicker
            value={to ? new Date(to + 'T00:00') : new Date()}
            mode="date"
            display="default"
            onChange={handlePickTo}
          />
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentTheme.colors.accent }]}
          onPress={handleAdd}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>Добавить период</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Запланирован отдых</Text>
        {sortedRest.length === 0 ? (
          <Text style={[styles.empty, { color: currentTheme.colors.muted }]}>
            Периодов отдыха нет
          </Text>
        ) : (
          sortedRest.map((r) => (
            <View
              key={`${r.f}|${r.t}`}
              style={[styles.restItem, { backgroundColor: currentTheme.colors.card2 }]}
            >
              <PlaceholderIcon name="rest" size={16} />
              <Text style={[styles.restText, { color: currentTheme.colors.text }]}>
                {human(r.f)} – {human(r.t)}
              </Text>
              <TouchableOpacity
                style={[
                  styles.delBtn,
                  sureKey === `${r.f}|${r.t}` && { backgroundColor: 'rgba(239, 68, 68, 0.14)' },
                ]}
                onPress={() => handleDelete(r.f, r.t)}
              >
                <PlaceholderIcon name="trash" size={15} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  hint: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 4,
  },
  label: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginVertical: 9,
  },
  range: {
    flexDirection: 'row',
    gap: 10,
  },
  dateBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  button: {
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    shadowColor: '#2f7cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 5,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  empty: {
    fontSize: 12.5,
    paddingVertical: 6,
  },
  restItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    padding: 8,
    paddingLeft: 14,
    marginBottom: 8,
  },
  restText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
  },
  delBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
