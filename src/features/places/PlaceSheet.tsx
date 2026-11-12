/**
 * Шторка места: название, координаты (кнопкой «Я здесь», из ссылки карт или руками), радиус.
 * Приложение карт мы не встраиваем: «Из карт» открывает любое установленное, а ссылку или
 * координаты оттуда вставляют обратно — разбор в `core/places.ts`.
 */
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import * as A from '../../core/actions';
import { RADIUS_DEFAULT, formatCoords, parseCoordinates, type Coords } from '../../core/places';
import { useDataStore } from '../../core/store';
import { currentPosition, openMapsApp, readClipboard } from '../../services/location';
import { useT } from '../../store/prefsStore';
import { usePalette, usePlain } from '../../store/themeStore';
import { SPACE } from '../../theme/metrics';
import { FONT } from '../../theme/fonts';
import { TYPE } from '../../theme/type';
import { Button } from '../../ui/Button';
import { Chip } from '../../ui/Chip';
import { FormRow } from '../../ui/FormRow';
import { Sheet } from '../../ui/Sheet';
import { NO_WEB_OUTLINE, TextField } from '../../ui/TextField';
import { useToast } from '../../ui/toast';

const RADII = [100, 150, 300, 500, 1000];

type Props = {
  visible: boolean;
  /** правка существующего места; null — новое */
  editId: string | null;
  onClose: () => void;
  /** после сохранения нового или изменённого места */
  onSaved?: (id: string) => void;
};

export function PlaceSheet({ visible, editId, onClose, onSaved }: Props) {
  const t = useT();
  const p = usePalette();
  const toast = useToast((s) => s.show);
  const plain = usePlain();
  const [openRow, setOpenRow] = useState<string | null>('coords');
  const editing = useDataStore((s) => {
    const place = editId ? s.data.places[editId] : undefined;
    return place && place.deletedAt === null ? place : undefined;
  });

  const [name, setName] = useState(editing?.name ?? '');
  const [coordsText, setCoordsText] = useState(editing ? formatCoords(editing) : '');
  const [radius, setRadius] = useState(editing?.radius ?? RADIUS_DEFAULT);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const coords: Coords | null = parseCoordinates(coordsText);
  const canSave = name.trim().length > 0 && coords !== null;

  // Вставленная ссылка заменяется парой чисел — так видно, что именно мы поняли.
  const changeCoords = (text: string) => {
    setError('');
    const looksLikeLink = /^(https?:|geo:)/i.test(text.trim());
    const parsed = looksLikeLink ? parseCoordinates(text) : null;
    if (parsed) setCoordsText(formatCoords(parsed));
    else {
      setCoordsText(text);
      if (looksLikeLink) setError(t('place.shortLink'));
    }
  };

  const here = async () => {
    setBusy(true);
    setError('');
    const res = await currentPosition();
    setBusy(false);
    if (res.ok) setCoordsText(formatCoords(res.coords));
    else setError(t(res.reason === 'denied' ? 'place.denied' : 'place.failed'));
  };

  const paste = async () => {
    setError('');
    const text = await readClipboard();
    const parsed = parseCoordinates(text);
    if (parsed) {
      setCoordsText(formatCoords(parsed));
      toast(t('place.pasted'));
    } else {
      setError(t(/^https?:/i.test(text.trim()) ? 'place.shortLink' : 'place.coordsBad'));
    }
  };

  const maps = async () => {
    if (!(await openMapsApp())) setError(t('place.mapsFailed'));
  };

  const save = () => {
    if (!canSave || !coords) {
      setError(t('place.coordsBad'));
      return;
    }
    const input = { name, ...coords, radius };
    const id = editing ? editing.id : A.createPlace(input);
    if (editing) A.updatePlace(editing.id, input);
    onClose();
    onSaved?.(id);
    toast(t('toast.saved'));
  };

  const remove = () => {
    if (!editing) return;
    const id = editing.id;
    A.deletePlace(id);
    onClose();
    toast(t('place.deleted'), { label: t('common.return'), onPress: () => A.restorePlace(id) });
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t(editing ? 'places.edit' : 'places.add')}
      footer={
        <View style={styles.footer}>
          {editing && <Button label={t('place.delete')} variant="danger" onPress={remove} />}
          <Button
            label={t(editing ? 'edit.save' : 'new.save')}
            onPress={save}
            disabled={!canSave}
            style={styles.grow}
          />
        </View>
      }
    >
      {plain ? (
        <>
          <TextInput
            accessibilityLabel={t('place.name')}
            placeholder={t('place.name').charAt(0).toUpperCase() + t('place.name').slice(1)}
            placeholderTextColor={p.muted}
            value={name}
            onChangeText={setName}
            autoFocus={!editing}
            returnKeyType="next"
            style={[
              TYPE.title,
              styles.titleInput,
              { color: p.text, borderBottomColor: p.divider },
              Platform.OS === 'web' ? NO_WEB_OUTLINE : null,
            ]}
          />
          <View>
            <FormRow
              icon="place"
              label={t('place.coords').charAt(0).toUpperCase() + t('place.coords').slice(1)}
              value={coords ? formatCoords(coords) : t('form.unset')}
              set={coords !== null}
              open={openRow === 'coords'}
              onPress={() => setOpenRow((cur) => (cur === 'coords' ? null : 'coords'))}
            >
              <View style={styles.chips}>
                <Chip size="md" label={t('place.here')} onPress={here} />
                <Chip size="md" label={t('place.fromMaps')} onPress={maps} />
                <Chip size="md" label={t('place.paste')} onPress={paste} />
              </View>
              <TextField
                variant="note"
                label={t('place.coords')}
                showLabel={false}
                value={coordsText}
                onChangeText={changeCoords}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="55.75580, 37.61730"
              />
              <Text style={[TYPE.meta, { color: p.muted }]}>{t('place.coordsHint')}</Text>
              {!!error && (
                <Text accessibilityRole="alert" style={[TYPE.meta, { color: p.red }]}>
                  {error}
                </Text>
              )}
            </FormRow>
            <FormRow
              icon="settings"
              label={t('place.radius').charAt(0).toUpperCase() + t('place.radius').slice(1)}
              value={t('place.meters', { m: radius })}
              set
              open={openRow === 'radius'}
              onPress={() => setOpenRow((cur) => (cur === 'radius' ? null : 'radius'))}
            >
              <View style={styles.chips} accessibilityRole="radiogroup">
                {RADII.map((r) => (
                  <Chip
                    key={r}
                    size="md"
                    role="radio"
                    label={t('place.meters', { m: r })}
                    selected={radius === r}
                    onPress={() => setRadius(r)}
                  />
                ))}
              </View>
            </FormRow>
          </View>
        </>
      ) : (
        <>
          <TextField
            label={t('place.name')}
            value={name}
            onChangeText={setName}
            autoFocus={!editing}
            returnKeyType="next"
          />

          <View style={styles.group}>
            <TextField
              variant="note"
              label={t('place.coords')}
              value={coordsText}
              onChangeText={changeCoords}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="55.75580, 37.61730"
            />
            <Text style={[TYPE.meta, { color: p.muted }]}>{t('place.coordsHint')}</Text>
            <View style={styles.row}>
              <Button
                label={t('place.here')}
                variant="secondary"
                onPress={here}
                disabled={busy}
                style={styles.grow}
              />
              <Button
                label={t('place.fromMaps')}
                variant="secondary"
                onPress={maps}
                style={styles.grow}
              />
              <Button
                label={t('place.paste')}
                variant="secondary"
                onPress={paste}
                style={styles.grow}
              />
            </View>
            {!!error && (
              <Text accessibilityRole="alert" style={[TYPE.meta, { color: p.red }]}>
                {error}
              </Text>
            )}
          </View>

          <View style={styles.group}>
            <Text style={[TYPE.meta, { color: p.muted }]}>{t('place.radius')}</Text>
            <View style={styles.chips} accessibilityRole="radiogroup">
              {RADII.map((r) => (
                <Chip
                  key={r}
                  size="md"
                  role="radio"
                  label={t('place.meters', { m: r })}
                  selected={radius === r}
                  onPress={() => setRadius(r)}
                />
              ))}
            </View>
          </View>
        </>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', gap: SPACE.md },
  grow: { flex: 1 },
  group: { gap: SPACE.sm },
  row: { flexDirection: 'row', gap: SPACE.tight },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.tight, alignItems: 'center' },
  titleInput: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    fontSize: 24,
    fontFamily: FONT.inter.medium,
  },
});
