import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { SCENE_KEYS, SCENE_ORIGINALS } from '@/config/defaults';
import { imageSource } from '@/config/images';
import type { ImageRef, MediaItem } from '@/config/schema';
import { useAppConfig } from '@/config/store';

import { useAdmin } from '../auth/store';
import { newId, useArea } from '../editor';
import { ago } from '../format';
import { PickError, dataUriBytes, formatBytes, pickImage } from '../media';
import { imageUses, replaceImage } from '../mediaUsage';
import { Meter } from '../ui/charts';
import { Field } from '../ui/fields';
import { Badge, Button, EmptyState, Grid, IconButton, KeyValue, Notice, Panel, Row } from '../ui/kit';
import { ImageChooser, ImageThumb } from '../ui/pickers';
import { copyText, useOverlay } from '../ui/overlay';
import { AdminPage } from '../ui/Page';
import { A, R, S, T } from '../ui/theme';

type Check = { ref: ImageRef; ok: boolean | null };

function probe(ref: ImageRef): Promise<boolean> {
  const source = imageSource(ref);
  if (!source || typeof source === 'number' || ref.startsWith('scene:') || ref.startsWith('data:')) return Promise.resolve(true);
  const uri = (source as { uri?: string }).uri;
  if (!uri) return Promise.resolve(false);
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), 12_000);
    Image.getSize(
      uri,
      () => {
        clearTimeout(timer);
        resolve(true);
      },
      () => {
        clearTimeout(timer);
        resolve(false);
      },
    );
  });
}

export default function Media() {
  const media = useArea('media');
  const { draft, setDraft } = useAppConfig();
  const { me, log, can } = useAdmin();
  const { confirm, prompt, toast } = useOverlay();
  const canEdit = media.canEdit;
  const [busy, setBusy] = useState(false);
  const [sceneFor, setSceneFor] = useState<string | null>(null);
  const [portraitFor, setPortraitFor] = useState<string | null>(null);
  const [from, setFrom] = useState<ImageRef>('');
  const [to, setTo] = useState<ImageRef>('');
  const [choosing, setChoosing] = useState<'from' | 'to' | null>(null);
  const [checks, setChecks] = useState<Check[]>([]);
  const [checking, setChecking] = useState(false);

  const uses = useMemo(() => imageUses(draft), [draft]);
  const usedRefs = useMemo(() => new Set(uses.map((u) => u.ref)), [uses]);
  const library = media.value.library;
  const unused = library.filter((item) => !usedRefs.has(item.uri));
  const totalBytes = library.reduce((sum, item) => sum + (item.bytes || dataUriBytes(item.uri)), 0);

  const setLibrary = (next: MediaItem[], what: string) => media.patch({ library: next }, what);

  const upload = async () => {
    setBusy(true);
    try {
      const picked = await pickImage();
      if (!picked) return;
      setLibrary(
        [{ id: newId('m'), name: `Upload ${new Date().toLocaleDateString()}`, uri: picked.uri, addedAt: Date.now(), addedBy: me?.name ?? '', bytes: picked.bytes }, ...library],
        'uploaded a picture',
      );
      toast(`Uploaded · ${formatBytes(picked.bytes)}`);
    } catch (problem) {
      toast(problem instanceof PickError ? problem.message : 'That picture could not be added.', 'danger');
    } finally {
      setBusy(false);
    }
  };

  const addLink = async () => {
    const url = await prompt({
      title: 'Add a picture by link',
      label: 'Link',
      placeholder: 'https://…',
      confirmLabel: 'Add picture',
      validate: (value) => (/^https:\/\//i.test(value.trim()) ? null : 'Use a link that starts with https://'),
    });
    if (!url) return;
    setLibrary([{ id: newId('m'), name: new URL(url.trim()).pathname.split('/').pop() || 'Linked picture', uri: url.trim(), addedAt: Date.now(), addedBy: me?.name ?? '', bytes: 0 }, ...library], 'linked a picture');
  };

  const runCheck = async () => {
    setChecking(true);
    const refs = [...new Set([...uses.map((u) => u.ref), ...library.map((i) => i.uri)])];
    setChecks(refs.map((ref) => ({ ref, ok: null })));
    const results = await Promise.all(refs.map(async (ref) => ({ ref, ok: await probe(ref) })));
    setChecks(results);
    setChecking(false);
    const broken = results.filter((r) => !r.ok).length;
    toast(broken ? `${broken} picture${broken === 1 ? '' : 's'} did not load` : 'Every picture loaded', broken ? 'warning' : 'success');
  };

  const overrides = media.value.sceneOverrides;

  return (
    <AdminPage section="media" canEdit={canEdit}>
      <Panel
        id="library"
        title="Picture library"
        description="Uploads are scaled down and kept inside the config, so they travel with an export or a sync."
        icon="image"
        actions={
          canEdit ? (
            <Row gap={S.sm}>
              <Button label="Link" icon="link" size="sm" onPress={addLink} />
              <Button label="Upload" icon="upload" size="sm" variant="primary" onPress={upload} loading={busy} />
            </Row>
          ) : undefined
        }
      >
        {library.length ? (
          <View style={styles.grid}>
            {library.map((item) => {
              const used = uses.filter((u) => u.ref === item.uri);
              return (
                <View key={item.id} style={styles.card}>
                  <ImageThumb image={item.uri} size={132} />
                  <Text style={styles.cardName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.cardMeta} numberOfLines={2}>
                    {item.bytes ? formatBytes(item.bytes) : 'Linked'} · {ago(item.addedAt)}
                    {item.addedBy ? ` · ${item.addedBy}` : ''}
                  </Text>
                  <Badge label={used.length ? `Used ${used.length}×` : 'Not used'} tone={used.length ? 'success' : 'neutral'} />
                  <Row gap={0}>
                    {canEdit ? (
                      <IconButton
                        icon="edit"
                        label="Rename"
                        size={30}
                        onPress={async () => {
                          const name = await prompt({ title: 'Rename picture', initial: item.name, confirmLabel: 'Rename' });
                          if (name) setLibrary(library.map((i) => (i.id === item.id ? { ...i, name } : i)), 'renamed a picture');
                        }}
                      />
                    ) : null}
                    {!item.uri.startsWith('data:') ? (
                      <IconButton
                        icon="copy"
                        label="Copy link"
                        size={30}
                        onPress={async () => toast((await copyText(item.uri)) ? 'Link copied' : 'Copying is not available here', 'neutral')}
                      />
                    ) : null}
                    {canEdit ? (
                      <IconButton
                        icon="trash"
                        label="Delete"
                        tone="danger"
                        size={30}
                        onPress={async () => {
                          const ok = await confirm({
                            title: `Delete “${item.name}”?`,
                            body: used.length ? `It is used in ${used.length} place${used.length === 1 ? '' : 's'}: ${used.map((u) => u.where).join(', ')}. Those will show nothing.` : 'Nothing uses it.',
                            confirmLabel: 'Delete picture',
                            destructive: true,
                          });
                          if (ok) setLibrary(library.filter((i) => i.id !== item.id), 'deleted a picture');
                        }}
                      />
                    ) : null}
                  </Row>
                </View>
              );
            })}
          </View>
        ) : (
          <EmptyState icon="image" title="No uploads yet" body="Upload a logo, a banner or a portrait. Pictures you choose elsewhere in the dashboard land here too." />
        )}
      </Panel>

      <Grid min={400} max={2}>
        <Panel id="bundled-photos" title="Photographs in the app" description="The remedy and festival photographs that ship with the app. Swap one and it changes everywhere it appears." icon="layers">
          {SCENE_KEYS.map((key) => {
            const override = overrides[key];
            return (
              <View key={key} style={styles.sceneRow}>
                <ImageThumb image={override?.image || `scene:${key}`} size={52} />
                <View style={styles.flex}>
                  <Text style={styles.sceneName} numberOfLines={1}>
                    {override?.alt || SCENE_ORIGINALS[key].alt}
                  </Text>
                  <Text style={styles.sceneMeta} numberOfLines={1}>
                    {override ? 'Replaced' : SCENE_ORIGINALS[key].credit}
                  </Text>
                </View>
                {canEdit ? (
                  <Row gap={4}>
                    <Button label="Replace" size="sm" onPress={() => setSceneFor(key)} />
                    {override ? (
                      <Button
                        label="Restore"
                        size="sm"
                        variant="ghost"
                        onPress={() => {
                          const next = { ...overrides };
                          delete next[key];
                          media.patch({ sceneOverrides: next }, `restored the ${key} photo`);
                        }}
                      />
                    ) : null}
                  </Row>
                ) : null}
              </View>
            );
          })}
        </Panel>

        <Panel id="portraits" title="Astrologer portraits" description="Every portrait in one place. Use a photo of the real astrologer, with their consent." icon="users">
          {draft.astrologers.roster.map((r) => (
            <View key={r.id} style={styles.sceneRow}>
              <ImageThumb image={r.photo} size={44} round />
              <View style={styles.flex}>
                <Text style={styles.sceneName}>{r.name}</Text>
                <Text style={styles.sceneMeta}>{r.photo ? (r.photo.startsWith('data:') ? 'Uploaded' : 'Linked') : 'No portrait — initials shown'}</Text>
              </View>
              {can('catalog.edit') ? <Button label="Change" size="sm" onPress={() => setPortraitFor(r.id)} /> : null}
            </View>
          ))}
          {draft.astrologers.roster.some((r) => r.photo.includes('aida-public')) ? (
            <Notice tone="warning">Some portraits are generated placeholder images. Replace them with real photographs before launch.</Notice>
          ) : null}
        </Panel>

        <Panel id="replace-everywhere" title="Replace a picture everywhere" description="Swap one picture for another in the logo, portraits, remedies, banners and pages at once" icon="refresh">
          <Field label="Replace">
            <Row gap={S.md}>
              <ImageThumb image={from} size={56} />
              <Button label={from ? 'Change' : 'Choose'} size="sm" onPress={() => setChoosing('from')} disabled={!canEdit} />
              {from ? <Text style={styles.sceneMeta}>{uses.filter((u) => u.ref === from).length} uses</Text> : null}
            </Row>
          </Field>
          <Field label="With">
            <Row gap={S.md}>
              <ImageThumb image={to} size={56} />
              <Button label={to ? 'Change' : 'Choose'} size="sm" onPress={() => setChoosing('to')} disabled={!canEdit} />
            </Row>
          </Field>
          <Button
            label="Replace everywhere"
            variant="primary"
            disabled={!canEdit || !from || !to || from === to}
            onPress={async () => {
              const count = uses.filter((u) => u.ref === from).length;
              const ok = await confirm({ title: `Replace it in ${count} place${count === 1 ? '' : 's'}?`, confirmLabel: 'Replace' });
              if (!ok) return;
              setDraft((current) => replaceImage(current, from, to));
              log('Edited the draft', 'media', `Replaced a picture in ${count} places`);
              toast(`Replaced in ${count} place${count === 1 ? '' : 's'}`);
              setFrom('');
              setTo('');
            }}
          />
        </Panel>

        <Panel id="media-cleanup" title="Unused pictures" description="Uploads that nothing in the draft uses any more" icon="trash" actions={<Badge label={`${unused.length}`} />}>
          {unused.map((item) => (
            <View key={item.id} style={styles.sceneRow}>
              <ImageThumb image={item.uri} size={40} />
              <Text style={[styles.sceneName, styles.flex]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.sceneMeta}>{formatBytes(item.bytes || dataUriBytes(item.uri))}</Text>
            </View>
          ))}
          {unused.length && canEdit ? (
            <Button
              label={`Delete ${unused.length} unused`}
              variant="danger"
              onPress={async () => {
                const ok = await confirm({ title: `Delete ${unused.length} unused pictures?`, confirmLabel: 'Delete', destructive: true });
                if (ok) setLibrary(library.filter((i) => usedRefs.has(i.uri)), `deleted ${unused.length} unused pictures`);
              }}
            />
          ) : null}
          {!unused.length ? <EmptyState icon="check" title="Every upload is in use" /> : null}
        </Panel>

        <Panel id="media-check" title="Check for broken pictures" description="Loads every linked picture and lists the ones that fail" icon="warning">
          <Button label={checking ? 'Checking…' : 'Check every picture'} icon="refresh" onPress={runCheck} loading={checking} />
          {checks.filter((c) => c.ok === false).map((c) => (
            <View key={c.ref} style={styles.sceneRow}>
              <Badge label="Broken" tone="danger" />
              <Text style={[styles.mono, styles.flex]} numberOfLines={1}>
                {c.ref}
              </Text>
            </View>
          ))}
          {checks.length && !checking && checks.every((c) => c.ok) ? <Notice tone="success">All {checks.length} pictures load.</Notice> : null}
        </Panel>

        <Panel id="media-storage" title="Space used by uploads" description="Uploads live inside the config. Keep it under 2.5 MB so saving and syncing stay quick." icon="database">
          <Meter value={totalBytes} max={2_500_000} tone={totalBytes > 2_500_000 ? A.red : A.saffron} />
          <KeyValue
            rows={[
              { label: 'Uploads', value: String(library.filter((i) => i.uri.startsWith('data:')).length) },
              { label: 'Linked pictures', value: String(library.filter((i) => !i.uri.startsWith('data:')).length) },
              { label: 'Total size', value: formatBytes(totalBytes) },
              { label: 'Places a picture is shown', value: String(uses.length) },
            ]}
          />
        </Panel>
      </Grid>

      <ImageChooser
        visible={!!sceneFor}
        onClose={() => setSceneFor(null)}
        title="Replace the photograph"
        onChoose={(image) => {
          if (!sceneFor) return;
          media.patch(
            { sceneOverrides: { ...overrides, [sceneFor]: { image, alt: SCENE_ORIGINALS[sceneFor].alt, credit: '' } } },
            `replaced the ${sceneFor} photo`,
          );
          setSceneFor(null);
        }}
      />
      <ImageChooser
        visible={!!portraitFor}
        onClose={() => setPortraitFor(null)}
        title="Choose a portrait"
        allowScenes={false}
        pick={{ maxSize: 480, square: true }}
        onChoose={(photo) => {
          if (!portraitFor) return;
          setDraft((current) => ({
            ...current,
            astrologers: { ...current.astrologers, roster: current.astrologers.roster.map((r) => (r.id === portraitFor ? { ...r, photo } : r)) },
          }));
          log('Edited the draft', 'astrologers', 'Changed a portrait');
          setPortraitFor(null);
        }}
      />
      <ImageChooser
        visible={!!choosing}
        onClose={() => setChoosing(null)}
        onChoose={(image) => {
          if (choosing === 'from') setFrom(image);
          else setTo(image);
          setChoosing(null);
        }}
      />
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.md },
  card: { width: 150, padding: 8, gap: 4, borderRadius: R.md, borderWidth: 1, borderColor: A.line },
  cardName: { ...T.label, color: A.ink },
  cardMeta: { ...T.small, fontSize: 11.5, lineHeight: 15, color: A.muted },
  sceneRow: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  sceneName: { ...T.label, color: A.ink },
  sceneMeta: { ...T.small, color: A.muted },
  mono: { ...T.mono, color: A.body },
});
