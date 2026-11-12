/** Сферы жизни: список, создание, правка и удаление. Открывается из настроек. */
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { live } from '../../core/model';
import { useDataStore } from '../../core/store';
import { openTasksByArea } from '../../core/tasks';
import { useT } from '../../store/prefsStore';
import { usePalette } from '../../store/themeStore';
import { SPACE } from '../../theme/metrics';
import { TYPE } from '../../theme/type';
import { AddRow } from '../../ui/Button';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { SettingRow } from '../../ui/SettingRow';
import { Card } from '../../ui/Sticker';
import { AreaSheet } from './AreaSheet';

export function AreasScreen({ onBack }: { onBack: () => void }) {
  const p = usePalette();
  const t = useT();
  const insets = useSafeAreaInsets();
  const data = useDataStore((s) => s.data);
  const list = useMemo(() => live(data.areas).sort((a, b) => a.createdAt - b.createdAt), [data]);
  const counts = useMemo(() => openTasksByArea(data), [data]);
  const [sheet, setSheet] = useState<{ id: string | null; seq: number } | null>(null);
  const [seq, setSeq] = useState(0);

  const openSheet = (id: string | null) => {
    setSeq(seq + 1);
    setSheet({ id, seq: seq + 1 });
  };

  return (
    <ScrollView
      style={{ backgroundColor: p.bg }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + SPACE.md, paddingBottom: insets.bottom + SPACE.xl },
      ]}
    >
      <ScreenHeader title={t('areas.title')} onBack={onBack} />
      <Text style={[TYPE.body, { color: p.muted }]}>{t('areas.hint')}</Text>

      {list.length > 0 && (
        <Card padded={false}>
          {list.map((a, i) => (
            <SettingRow
              key={a.id}
              label={a.name}
              value={t('areas.open', { count: counts.get(a.id) ?? 0 })}
              onPress={() => openSheet(a.id)}
              last={i === list.length - 1}
            />
          ))}
        </Card>
      )}

      <AddRow label={t('area.add')} onPress={() => openSheet(null)} />

      {sheet && (
        <AreaSheet key={sheet.seq} visible editId={sheet.id} onClose={() => setSheet(null)} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SPACE.screenX, paddingBottom: SPACE.xl, gap: SPACE.lg },
});
