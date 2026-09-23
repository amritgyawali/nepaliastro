import React, { useState } from 'react';
import { View } from 'react-native';

import { formatMoney } from '@/config/format';
import type { RemedyRecord } from '@/config/schema';
import { useAppConfig } from '@/config/store';

import { newId, useArea } from '../editor';
import { NumberField, StringList, TextField, Toggle } from '../ui/fields';
import { Badge, Button, Grid, KeyValue, Panel, Row } from '../ui/kit';
import { useOverlay } from '../ui/overlay';
import { AdminPage } from '../ui/Page';
import { ImageField } from '../ui/pickers';
import { RecordList } from '../ui/RecordList';
import { S } from '../ui/theme';

export default function Remedies() {
  const { value: remedies, update, canEdit } = useArea('remedies');
  const { draft } = useAppConfig();
  const { confirm, toast } = useOverlay();
  const [percent, setPercent] = useState<number | null>(10);
  const currency = draft.branding.currency;

  const bulk = async (direction: 1 | -1) => {
    if (!percent) return;
    const factor = 1 + (direction * percent) / 100;
    const ok = await confirm({
      title: `${direction > 0 ? 'Raise' : 'Lower'} every remedy price by ${percent}%?`,
      body: 'Prices are rounded to whole numbers.',
      confirmLabel: direction > 0 ? 'Raise prices' : 'Lower prices',
    });
    if (!ok) return;
    update(remedies.map((r) => ({ ...r, price: Math.max(0, Math.round(r.price * factor)) })), `${direction > 0 ? 'raised' : 'lowered'} remedy prices ${percent}%`);
    toast('Prices changed in the draft');
  };

  return (
    <AdminPage section="remedies" canEdit={canEdit}>
      <Panel
        id="remedy-list"
        title="Remedies"
        description="The cards on the Remedies tab and the screen each one opens. A photograph of the real thing works best."
        icon="diyo"
        actions={<Badge label={`${remedies.filter((r) => !r.hidden).length} shown`} />}
      >
        <RecordList<RemedyRecord>
          items={remedies}
          onChange={(items, what) => update(items, what)}
          getId={(r) => r.id}
          getTitle={(r) => r.title}
          getSubtitle={(r) => `from ${formatMoney(r.price, currency, { decimals: 0 })} · ${r.description}`}
          getImage={(r) => r.image}
          isHidden={(r) => r.hidden}
          setHidden={(r, hidden) => ({ ...r, hidden })}
          noun="remedy"
          create={() => ({
            id: newId('rem'),
            title: 'New remedy',
            description: 'What it is, in one line',
            image: 'scene:pooja',
            imageAlt: '',
            imageCredit: '',
            price: 20,
            lead: '',
            includes: [],
            hidden: true,
          })}
          duplicate={(r) => ({ ...r, id: newId('rem'), title: `${r.title} (copy)`, hidden: true })}
          addLabel="Add a remedy"
          renderEditor={(r, set) => (
            <>
              <ImageField label="Photograph" value={r.image} onChange={(image) => set({ ...r, image })} hint="Use a real photo of the thali, mala or ritual, never a generated image." />
              <TextField label="What the photo shows" value={r.imageAlt} onChange={(imageAlt) => set({ ...r, imageAlt })} hint="Read out by screen readers." />
              <TextField label="Photo credit" value={r.imageCredit} onChange={(imageCredit) => set({ ...r, imageCredit })} placeholder="Photographer · licence" />
              <TextField label="Title" value={r.title} maxLength={40} onChange={(title) => set({ ...r, title })} />
              <TextField label="One line" value={r.description} maxLength={100} multiline rows={2} onChange={(description) => set({ ...r, description })} />
              <NumberField label={`Price from (${currency.code})`} value={r.price} min={0} max={100000} onChange={(price) => set({ ...r, price: price ?? 0 })} />
              <TextField label="When it happens" value={r.lead} onChange={(lead) => set({ ...r, lead })} placeholder="Performed within 3 days of booking" />
              <StringList label="What it includes" items={r.includes} onChange={(includes) => set({ ...r, includes })} placeholder="Another thing included" />
              <Toggle label="Hidden from the Remedies tab" value={r.hidden} onChange={(hidden) => set({ ...r, hidden })} />
            </>
          )}
        />
      </Panel>

      <Grid min={380} max={2}>
        <Panel id="remedy-pricing" title="Remedy prices in bulk" description="Every remedy at once" icon="coins">
          <NumberField label="By" value={percent} min={1} max={90} suffix="%" onChange={setPercent} />
          <Row gap={S.sm} wrap>
            <Button label="Raise" icon="up" disabled={!canEdit || !percent} onPress={() => bulk(1)} />
            <Button label="Lower" icon="down" disabled={!canEdit || !percent} onPress={() => bulk(-1)} />
          </Row>
          <View>
            <KeyValue rows={remedies.map((r) => ({ label: r.title, value: formatMoney(r.price, currency, { decimals: 0 }) }))} />
          </View>
        </Panel>
      </Grid>
    </AdminPage>
  );
}
