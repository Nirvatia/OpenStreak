/**
 * Места: список мест для напоминаний «при входе / при выходе». Тап — правка в шторке,
 * «Новое место» — создание. Сами геозоны ставит система (этап 5, шаг «фон»).
 */
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCoords } from '../../core/places';
import { live } from '../../core/model';
import { useDataStore } from '../../core/store';
import { useT } from '../../store/prefsStore';
import { usePalette } from '../../store/themeStore';
import { SPACE } from '../../theme/metrics';
import { TYPE } from '../../theme/type';
import { AddRow } from '../../ui/Button';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { SettingRow } from '../../ui/SettingRow';
import { Card } from '../../ui/Sticker';
import { PlaceSheet } from './PlaceSheet';

export function PlacesScreen({ onBack }: { onBack: () => void }) {
  const p = usePalette();
  const t = useT();
  const insets = useSafeAreaInsets();
  const places = useDataStore((s) => s.data.places);
  const list = useMemo(() => live(places).sort((a, b) => a.createdAt - b.createdAt), [places]);
  const [sheet, setSheet] = useState<{ id: string | null; seq: number } | null>(null);
  const [seq, setSeq] = useState(0);

  const openSheet = (id: string | null) => {
    setSeq(seq + 1);
    setSheet({ id, seq: seq + 1 });
  };

  return (
    <ScrollView
      style={{ backgroundColor: p.bg }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACE.md }]}
    >
      <ScreenHeader
        title={t('places.title')}
        kicker={list.length ? t('places.count', { count: list.length }) : undefined}
        onBack={onBack}
      />

      {list.length === 0 ? (
        <Text style={[TYPE.body, { color: p.muted }]}>{t('places.empty')}</Text>
      ) : (
        <Card padded={false}>
          {list.map((place, i) => (
            <SettingRow
              key={place.id}
              label={place.name}
              hint={formatCoords(place)}
              value={t('place.meters', { m: place.radius })}
              onPress={() => openSheet(place.id)}
              last={i === list.length - 1}
            />
          ))}
        </Card>
      )}

      <AddRow label={t('places.add')} onPress={() => openSheet(null)} />

      {sheet && (
        <PlaceSheet key={sheet.seq} visible editId={sheet.id} onClose={() => setSheet(null)} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SPACE.screenX, paddingBottom: SPACE.xl, gap: SPACE.lg },
});
