import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { useToastStore } from '../../store/toastStore';
import { importData } from '../../services/exportImport';
import { ExportDialog } from '../export/ExportDialog';
import { SvgIcon } from '../icons/SvgIcon';
import { ICON_SIZES } from '../../theme/iconSizes';

export const ProfileSection: React.FC = () => {
  const { currentTheme, setTheme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const replaceAll = useAppStore((s) => s.replaceAll);
  const showToast = useToastStore((s) => s.show);
  const [exportVisible, setExportVisible] = useState(false);
  const [importSure, setImportSure] = useState(false);
  // Тип таймера не из Node: его типы в проект не тянутся, а в RN
  // setTimeout возвращает number. ReturnType работает в обоих случаях.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleExport = () => {
    setExportVisible(true);
  };

  const handleImport = async () => {
    const hasData = state.tasks.length + state.habits.length > 0;

    if (hasData && !importSure) {
      setImportSure(true);
      showToast('Текущие данные будут заменены — нажмите ещё раз');
      timeoutRef.current = setTimeout(() => {
        setImportSure(false);
      }, 2300);
      return;
    }

    try {
      const result = await importData();
      if (!result) return;

      await replaceAll(result.snapshot);

      if (result.theme) {
        await setTheme(result.theme);
      }

      setImportSure(false);
      showToast('Профиль импортирован ✔');
    } catch {
      setImportSure(false);
      showToast('Не удалось прочитать файл');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.card }]}>
      <Text style={[styles.title, { color: currentTheme.colors.text }]}>Профиль</Text>
      <Text style={[styles.text, { color: currentTheme.colors.muted }]}>
        Экспортируйте все задачи, привычки, сферы, даты и статистику в файл — или восстановите их на
        другом устройстве.
      </Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentTheme.colors.accent }]}
          onPress={handleExport}
          activeOpacity={0.8}
        >
          <SvgIcon name="dl" size={ICON_SIZES.svg.md} color="#fff" />
          <Text style={[styles.buttonText, { color: '#fff' }]}>Экспорт</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: importSure ? 'rgba(245, 158, 11, 0.15)' : currentTheme.colors.card2,
              borderColor: importSure ? currentTheme.colors.orange : currentTheme.colors.line,
            },
          ]}
          onPress={handleImport}
          activeOpacity={0.8}
        >
          <SvgIcon
            name="ul"
            size={ICON_SIZES.svg.md}
            color={importSure ? currentTheme.colors.orange : currentTheme.colors.text}
          />
          <Text
            style={[
              styles.buttonText,
              { color: importSure ? currentTheme.colors.orange : currentTheme.colors.text },
            ]}
          >
            Импорт
          </Text>
        </TouchableOpacity>
      </View>
      <ExportDialog visible={exportVisible} onClose={() => setExportVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  text: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 14,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
