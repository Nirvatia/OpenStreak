/**
 * Шторка сферы жизни: название и значок. Сфера — только способ сгруппировать дела и цели,
 * ничего не блокирует: дело можно записать и без неё.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as A from '../../core/actions';
import { useDataStore } from '../../core/store';
import { useT } from '../../store/prefsStore';
import { usePalette } from '../../store/themeStore';
import { RADIUS, SPACE, STROKE } from '../../theme/metrics';
import { TYPE } from '../../theme/type';
import { Button } from '../../ui/Button';
import { IconTile } from '../../ui/icons';
import { Sheet } from '../../ui/Sheet';
import { TextField } from '../../ui/TextField';
import { useToast } from '../../ui/toast';
import { AREA_COLOR, AREA_ICONS } from './areaIcons';

type Props = {
  visible: boolean;
  /** правка существующей сферы; null — новая */
  editId: string | null;
  onClose: () => void;
  onSaved?: (id: string) => void;
};

export function AreaSheet({ visible, editId, onClose, onSaved }: Props) {
  const t = useT();
  const p = usePalette();
  const toast = useToast((s) => s.show);
  const editing = useDataStore((s) => {
    const a = editId ? s.data.areas[editId] : undefined;
    return a && a.deletedAt === null ? a : undefined;
  });
  const [name, setName] = useState(editing?.name ?? '');
  const [icon, setIcon] = useState(editing?.icon ?? AREA_ICONS[0]!);
  // Удаление уносит цели сферы, поэтому спрашиваем второй раз.
  const [armed, setArmed] = useState(false);
  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const input = { name, icon, color: editing?.color ?? AREA_COLOR };
    const id = editing ? editing.id : A.createArea(input);
    if (editing) A.updateArea(editing.id, input);
    onClose();
    onSaved?.(id);
    toast(t('toast.saved'));
  };

  const remove = () => {
    if (!editing) return;
    if (!armed) {
      setArmed(true);
      toast(t('area.deleteConfirm'));
      return;
    }
    A.deleteArea(editing.id);
    onClose();
    toast(t('area.deleted'));
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t(editing ? 'area.edit' : 'area.add')}
      footer={
        <View style={styles.footer}>
          {editing && (
            <Button
              label={t(armed ? 'area.deleteSure' : 'edit.delete')}
              variant="danger"
              onPress={remove}
            />
          )}
          <Button
            label={t(editing ? 'edit.save' : 'new.save')}
            onPress={save}
            disabled={!canSave}
            style={styles.grow}
          />
        </View>
      }
    >
      <TextField
        label={t('area.name')}
        value={name}
        onChangeText={setName}
        autoFocus={!editing}
        returnKeyType="done"
        onSubmitEditing={save}
      />
      <View style={styles.group}>
        <Text style={[TYPE.meta, { color: p.muted }]}>{t('area.icon')}</Text>
        <View style={styles.icons} accessibilityRole="radiogroup">
          {AREA_ICONS.map((key) => (
            <Pressable
              key={key}
              accessibilityRole="radio"
              accessibilityLabel={key}
              accessibilityState={{ checked: icon === key }}
              onPress={() => setIcon(key)}
              style={[
                styles.pick,
                { borderColor: icon === key ? p.line : 'transparent', borderStyle: 'solid' },
              ]}
            >
              <IconTile icon={key} size={44} />
            </Pressable>
          ))}
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', gap: SPACE.md },
  grow: { flex: 1 },
  group: { gap: SPACE.sm },
  icons: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.tight },
  pick: {
    padding: 3,
    borderWidth: STROKE.outline,
    borderRadius: RADIUS.sm + 4,
  },
});
