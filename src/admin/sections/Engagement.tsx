import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { readableOn } from '@/config/color';
import { scheduleState, type ScheduleState } from '@/config/schedule';
import type { Banner, Schedule } from '@/config/schema';
import { useAppConfig } from '@/config/store';
import { Notifications, ensurePermission, notificationsSupported } from '@/lib/notifications';

import { newId, useArea } from '../editor';
import { dateTime } from '../format';
import { DateTimeField, Segmented, TextField, Toggle } from '../ui/fields';
import { Badge, Button, EmptyState, Grid, Notice, Panel } from '../ui/kit';
import { useOverlay } from '../ui/overlay';
import { AdminPage } from '../ui/Page';
import { ColorField, ImageField, ImageThumb, LinkField } from '../ui/pickers';
import { RecordList } from '../ui/RecordList';
import { A, R, S, T } from '../ui/theme';

const STATE_LABEL: Record<ScheduleState, { label: string; tone: 'success' | 'info' | 'neutral' | 'brand' }> = {
  always: { label: 'No dates', tone: 'neutral' },
  upcoming: { label: 'Scheduled', tone: 'info' },
  running: { label: 'Running', tone: 'success' },
  ended: { label: 'Ended', tone: 'neutral' },
};

function ScheduleFields({ schedule, onChange }: { schedule: Schedule; onChange: (s: Schedule) => void }) {
  return (
    <>
      <DateTimeField label="Starts" value={schedule.startsAt} onChange={(startsAt) => onChange({ ...schedule, startsAt })} />
      <DateTimeField label="Ends" value={schedule.endsAt} onChange={(endsAt) => onChange({ ...schedule, endsAt })} />
      {schedule.startsAt && schedule.endsAt && schedule.endsAt <= schedule.startsAt ? (
        <Notice tone="warning">It ends before it starts, so nobody will see it.</Notice>
      ) : null}
    </>
  );
}

/** A banner drawn the way the home screen draws it, from the draft. */
function BannerSample({ banner }: { banner: Banner }) {
  const { draft } = useAppConfig();
  const bg = banner.background || draft.theme.colors.saffronSoft;
  const fg = banner.foreground || readableOn(bg, draft.theme.colors.ink, '#FFFFFF');
  return (
    <View style={[styles.banner, { backgroundColor: bg }]}>
      {banner.image ? <ImageThumb image={banner.image} size={64} /> : null}
      <View style={styles.flex}>
        <Text style={[styles.bannerTitle, { color: fg }]}>{banner.title || 'Banner title'}</Text>
        {banner.body ? <Text style={[styles.bannerBody, { color: fg }]}>{banner.body}</Text> : null}
        {banner.ctaLabel ? <Text style={[styles.bannerCta, { color: fg }]}>{banner.ctaLabel}</Text> : null}
      </View>
    </View>
  );
}

export default function Engagement() {
  const { value: e, patch, canEdit } = useArea('engagement');
  const { toast } = useOverlay();
  const [testTitle, setTestTitle] = useState('A test from the dashboard');
  const [testBody, setTestBody] = useState('This is how a notification from the app looks on this phone.');
  const [sending, setSending] = useState(false);

  const calendar = useMemo(() => {
    const rows = [
      ...e.banners.map((b) => ({ id: b.id, name: `Banner · ${b.title || 'untitled'}`, enabled: b.enabled, schedule: b.schedule })),
      { id: 'popup', name: `Popup · ${e.popup.title || 'untitled'}`, enabled: e.popup.enabled, schedule: e.popup.schedule },
    ];
    return rows.sort((a, b) => (a.schedule.startsAt || 0) - (b.schedule.startsAt || 0));
  }, [e]);

  const sendTest = async () => {
    setSending(true);
    try {
      const permission = await ensurePermission();
      if (permission !== 'granted') {
        toast('Notifications are blocked for this app in the phone’s settings.', 'warning');
        return;
      }
      await Notifications.scheduleNotificationAsync({ content: { title: testTitle, body: testBody, sound: 'default' }, trigger: null });
      toast('Sent to this phone');
    } catch {
      toast('The notification could not be sent.', 'danger');
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminPage section="engagement" canEdit={canEdit}>
      {e.maintenance.enabled ? (
        <Notice tone="danger" title="Maintenance mode is on in the draft">
          Once published, nobody can use the app until it is turned off. The dashboard stays open.
        </Notice>
      ) : null}

      <Panel id="banners" title="Home banners" description="Cards on the home screen, each with its own dates, colours and button" icon="megaphone" actions={<Badge label={`${e.banners.filter((b) => b.enabled).length} on`} />}>
        <RecordList<Banner>
          items={e.banners}
          onChange={(banners, what) => patch({ banners }, `banners: ${what}`)}
          getId={(b) => b.id}
          getTitle={(b) => b.title}
          getSubtitle={(b) =>
            [b.schedule.startsAt ? `from ${dateTime(b.schedule.startsAt)}` : '', b.schedule.endsAt ? `until ${dateTime(b.schedule.endsAt)}` : '', b.href].filter(Boolean).join(' · ') || 'Always, no link'
          }
          getImage={(b) => b.image}
          getBadges={(b) => [STATE_LABEL[scheduleState(b.schedule)]]}
          isHidden={(b) => !b.enabled}
          setHidden={(b, hidden) => ({ ...b, enabled: !hidden })}
          noun="banner"
          create={() => ({
            id: newId('ban'),
            title: 'Dashain tika sait is out',
            body: 'See the auspicious time for tika this year.',
            image: 'scene:dashain',
            ctaLabel: 'See the sait',
            href: '/festivals',
            background: '',
            foreground: '',
            enabled: false,
            dismissible: true,
            schedule: { startsAt: 0, endsAt: 0 },
          })}
          duplicate={(b) => ({ ...b, id: newId('ban'), title: `${b.title} (copy)`, enabled: false })}
          addLabel="Add a banner"
          emptyBody="A banner can point to a festival, an offer, or one of your pages."
          renderEditor={(b, set) => (
            <>
              <BannerSample banner={b} />
              <Toggle label="Switched on" value={b.enabled} onChange={(enabled) => set({ ...b, enabled })} />
              <TextField label="Title" value={b.title} maxLength={60} onChange={(title) => set({ ...b, title })} />
              <TextField label="Text" value={b.body} maxLength={140} multiline rows={2} onChange={(body) => set({ ...b, body })} />
              <ImageField label="Picture" value={b.image} onChange={(image) => set({ ...b, image })} />
              <TextField label="Button label" value={b.ctaLabel} maxLength={24} onChange={(ctaLabel) => set({ ...b, ctaLabel })} hint="Empty for no button; the whole card still opens the link." />
              <LinkField label="Opens" value={b.href} onChange={(href) => set({ ...b, href })} />
              <ColorField label="Background" value={b.background || '#FFF2E4'} onChange={(background) => set({ ...b, background })} hint="Empty uses the soft brand colour." />
              <ColorField label="Text colour" value={b.foreground || '#1B1A17'} against={b.background || '#FFF2E4'} onChange={(foreground) => set({ ...b, foreground })} />
              <Toggle label="Can be closed" description="Shows a close button; once closed it stays closed on that phone" value={b.dismissible} onChange={(dismissible) => set({ ...b, dismissible })} />
              <ScheduleFields schedule={b.schedule} onChange={(schedule) => set({ ...b, schedule })} />
            </>
          )}
        />
      </Panel>

      <Grid min={400} max={2}>
        <Panel id="popup" title="Launch popup" description="Shown once, when the app opens, to everyone who has not closed it yet" icon="bell" actions={<Badge {...STATE_LABEL[scheduleState(e.popup.schedule)]} />}>
          <Toggle label="Show the popup" value={e.popup.enabled} onChange={(enabled) => patch({ popup: { ...e.popup, enabled } }, `popup ${enabled ? 'on' : 'off'}`)} />
          <TextField label="Title" value={e.popup.title} maxLength={60} onChange={(title) => patch({ popup: { ...e.popup, title } }, 'popup title')} />
          <TextField label="Text" value={e.popup.body} multiline rows={3} maxLength={300} onChange={(body) => patch({ popup: { ...e.popup, body } }, 'popup text')} />
          <ImageField label="Picture" value={e.popup.image} onChange={(image) => patch({ popup: { ...e.popup, image } }, 'popup picture')} />
          <TextField label="Button label" value={e.popup.ctaLabel} maxLength={24} onChange={(ctaLabel) => patch({ popup: { ...e.popup, ctaLabel } }, 'popup button')} />
          <LinkField label="Button opens" value={e.popup.href} onChange={(href) => patch({ popup: { ...e.popup, href } }, 'popup link')} />
          <ScheduleFields schedule={e.popup.schedule} onChange={(schedule) => patch({ popup: { ...e.popup, schedule } }, 'popup dates')} />
          <Button
            label="Show it again to everyone"
            size="sm"
            variant="ghost"
            icon="refresh"
            disabled={!canEdit}
            onPress={() => {
              patch({ popup: { ...e.popup, id: newId('pop') } }, 'popup reset');
              toast('Everyone will see the popup again once you publish');
            }}
          />
        </Panel>

        <Panel id="notice" title="Notice bar" description="One line across the top of the home screen" icon="info">
          <Toggle label="Show the notice" value={e.notice.enabled} onChange={(enabled) => patch({ notice: { ...e.notice, enabled } }, `notice ${enabled ? 'on' : 'off'}`)} />
          <TextField label="Text" value={e.notice.text} maxLength={120} onChange={(text) => patch({ notice: { ...e.notice, text } }, 'notice text')} placeholder="Chat is free all day on Bhai Tika" />
          <LinkField label="Opens" value={e.notice.href} onChange={(href) => patch({ notice: { ...e.notice, href } }, 'notice link')} hint="Optional." />
          <Segmented
            label="Tone"
            value={e.notice.tone}
            onChange={(tone) => patch({ notice: { ...e.notice, tone } }, 'notice tone')}
            options={[{ value: 'brand', label: 'Brand' }, { value: 'neutral', label: 'Plain' }, { value: 'success', label: 'Good' }, { value: 'danger', label: 'Warning' }]}
          />
        </Panel>

        <Panel id="maintenance" title="Maintenance mode" description="Closes the app for everyone, with your message, until it is turned off. The dashboard stays reachable." icon="warning">
          <Toggle
            label="Close the app for maintenance"
            value={e.maintenance.enabled}
            onChange={(enabled) => patch({ maintenance: { ...e.maintenance, enabled } }, `maintenance ${enabled ? 'on' : 'off'}`)}
          />
          <TextField label="Heading" value={e.maintenance.title} maxLength={60} onChange={(title) => patch({ maintenance: { ...e.maintenance, title } }, 'maintenance heading')} />
          <TextField label="Message" value={e.maintenance.message} multiline rows={3} maxLength={300} onChange={(message) => patch({ maintenance: { ...e.maintenance, message } }, 'maintenance message')} />
          <TextField label="Back by" value={e.maintenance.eta} maxLength={40} placeholder="6 pm today" onChange={(eta) => patch({ maintenance: { ...e.maintenance, eta } }, 'maintenance eta')} />
        </Panel>

        <Panel id="test-notification" title="Send a test notification" description="Delivered to this phone only, straight away" icon="bell">
          {notificationsSupported ? (
            <>
              <TextField label="Title" value={testTitle} onChange={setTestTitle} alwaysEditable maxLength={52} />
              <TextField label="Text" value={testBody} onChange={setTestBody} alwaysEditable multiline rows={2} maxLength={110} />
              <Button label="Send to this phone" icon="send" variant="primary" onPress={sendTest} loading={sending} />
            </>
          ) : (
            <Notice tone="info">Notifications only work in the phone app. Open the dashboard on an Android or iOS device to try one.</Notice>
          )}
        </Panel>

        <Panel id="campaign-calendar" title="What is scheduled" description="Banners and the popup by the date they start" icon="calendar">
          {calendar.map((row) => {
            const state = scheduleState(row.schedule);
            return (
              <View key={row.id} style={styles.calendarRow}>
                <View style={[styles.calendarBar, { backgroundColor: !row.enabled ? A.lineStrong : state === 'running' || state === 'always' ? A.green : state === 'upcoming' ? A.blue : A.subtle }]} />
                <View style={styles.flex}>
                  <Text style={styles.calendarName} numberOfLines={1}>
                    {row.name}
                  </Text>
                  <Text style={styles.calendarDates}>
                    {row.schedule.startsAt ? dateTime(row.schedule.startsAt) : 'Any time'} → {row.schedule.endsAt ? dateTime(row.schedule.endsAt) : 'no end'}
                  </Text>
                </View>
                <Badge label={row.enabled ? STATE_LABEL[state].label : 'Off'} tone={row.enabled ? STATE_LABEL[state].tone : 'neutral'} />
              </View>
            );
          })}
          {!calendar.length ? <EmptyState icon="calendar" title="Nothing scheduled" /> : null}
        </Panel>
      </Grid>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  banner: { flexDirection: 'row', gap: S.md, padding: S.lg, borderRadius: R.lg, alignItems: 'center' },
  bannerTitle: { ...T.h3 },
  bannerBody: { ...T.small, opacity: 0.9 },
  bannerCta: { ...T.label, marginTop: 4, textDecorationLine: 'underline' },
  calendarRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: 4 },
  calendarBar: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  calendarName: { ...T.label, color: A.ink },
  calendarDates: { ...T.small, color: A.muted },
});
