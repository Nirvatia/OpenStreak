/**
 * Объяснение перед запросом доступа к геолокации «Всегда». Системный диалог сам по себе
 * не объясняет, зачем это нужно, а отказ потом приходится искать в настройках телефона.
 */
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { requestGeofenceAccess } from '../../services/geofence';
import { askNotificationPermission } from '../../services/notifications';
import { useT } from '../../store/prefsStore';
import { usePalette } from '../../store/themeStore';
import { SPACE } from '../../theme/metrics';
import { TYPE } from '../../theme/type';
import { Button } from '../../ui/Button';
import { Sheet } from '../../ui/Sheet';
import { useToast } from '../../ui/toast';
import { usePlaceAccess } from './placeAccessStore';

export function PlaceAccessSheet() {
  const t = useT();
  const p = usePalette();
  const open = usePlaceAccess((s) => s.open);
  const hide = usePlaceAccess((s) => s.hide);
  const toast = useToast((s) => s.show);
  const [busy, setBusy] = useState(false);

  const allow = async () => {
    setBusy(true);
    await askNotificationPermission();
    const access = await requestGeofenceAccess();
    setBusy(false);
    hide();
    toast(
      t(
        access === 'always'
          ? 'access.on'
          : access === 'foreground'
            ? 'access.foreground'
            : 'access.denied'
      )
    );
  };

  return (
    <Sheet
      visible={open}
      onClose={hide}
      title={t('access.title')}
      footer={
        <View style={styles.footer}>
          <Button label={t('access.later')} variant="secondary" onPress={hide} />
          <Button label={t('access.allow')} onPress={allow} disabled={busy} style={styles.grow} />
        </View>
      }
    >
      <Text style={[TYPE.body, { color: p.text }]}>{t('access.why')}</Text>
      <Text style={[TYPE.body, { color: p.text }]}>{t('access.privacy')}</Text>
      <Text style={[TYPE.meta, { color: p.muted }]}>{t('access.how')}</Text>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', gap: SPACE.md },
  grow: { flex: 1 },
});
