import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useToastStore } from '../../store/toastStore';
import { exportData, copyToClipboard } from '../../services/exportImport';
import { SvgIcon } from '../icons/SvgIcon';
import { ICON_SIZES } from '../../theme/iconSizes';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const ExportDialog: React.FC<Props> = ({ visible, onClose }) => {
  const { currentTheme, theme } = useThemeStore();
  const showToast = useToastStore((s) => s.show);

  const handleDownload = async () => {
    try {
      await exportData(theme);
      onClose();
      showToast('Файл готов к сохранению');
    } catch (e: any) {
      console.error('Export error:', e);
      // На iOS в Expo Go шаринг может не работать
      if (Platform.OS === 'ios') {
        showToast('На iOS используйте "Скопировать в буфер" или соберите нативное приложение');
      } else {
        showToast('Не удалось сохранить файл: ' + (e.message || 'unknown error'));
      }
    }
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(theme);
      onClose();
      showToast('JSON скопирован в буфер — вставьте куда нужно ✓');
    } catch (e) {
      console.error('Copy error:', e);
      showToast('Не удалось скопировать');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: currentTheme.colors.card }]}>
          <Text style={[styles.title, { color: currentTheme.colors.text }]}>Экспорт данных</Text>
          <Text style={[styles.subtitle, { color: currentTheme.colors.muted }]}>
            Выберите способ сохранить бэкап
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.colors.card2 }]}
            onPress={handleDownload}
            activeOpacity={0.8}
          >
            <SvgIcon name="dl" size={ICON_SIZES.svg.lg} color={currentTheme.colors.accent} />
            <Text style={[styles.buttonText, { color: currentTheme.colors.text }]}>
              Скачать файл
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.colors.card2 }]}
            onPress={handleCopy}
            activeOpacity={0.8}
          >
            <SvgIcon name="copy" size={ICON_SIZES.svg.lg} color={currentTheme.colors.accent} />
            <Text style={[styles.buttonText, { color: currentTheme.colors.text }]}>
              Скопировать JSON в буфер
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={[styles.cancelText, { color: currentTheme.colors.muted }]}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 20, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 18,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    gap: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
