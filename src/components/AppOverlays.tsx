import { usePathname, useRouter, type Href } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { imageSource } from '@/config/images';
import { isLive } from '@/config/schedule';
import { useAppConfig, useShownConfig } from '@/config/store';
import { trackEvent } from '@/lib/analytics';
import { useDismissed } from '@/lib/dismissed';
import { GUTTER, colors, radius, space, type } from '@/theme';

import { BrandMark } from './BrandMark';
import { useOpenLink } from './CustomPageView';
import { PrimaryButton } from './PrimaryButton';
import { Tappable } from './Tappable';

/** Routes the app's own overlays stay out of: the dashboard and onboarding. */
function isBackstage(pathname: string): boolean {
  return pathname.startsWith('/admin') || pathname.startsWith('/onboarding');
}

/**
 * Maintenance mode: covers the app with the dashboard's message. The mark
 * is the way in for the team — a long press opens the dashboard, which stays
 * reachable so maintenance can be switched off again.
 */
export function MaintenanceCover() {
  const config = useShownConfig();
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { maintenance } = config.engagement;

  if (!maintenance.enabled || pathname.startsWith('/admin')) return null;

  return (
    <View style={[styles.cover, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.coverInner}>
        <Pressable
          accessibilityRole="image"
          accessibilityLabel={config.branding.appName}
          onLongPress={() => router.push('/admin' as Href)}
          delayLongPress={1200}
        >
          <BrandMark branding={config.branding} size={64} />
        </Pressable>
        <Text style={styles.coverTitle}>{maintenance.title}</Text>
        <Text style={styles.coverBody}>{maintenance.message}</Text>
        {maintenance.eta ? <Text style={styles.coverEta}>Back {maintenance.eta}</Text> : null}
      </View>
    </View>
  );
}

/** The dashboard's launch popup, once per person per popup id. */
export function LaunchPopup() {
  const config = useShownConfig();
  const pathname = usePathname();
  const open = useOpenLink();
  const { ready, has, dismiss } = useDismissed();
  const [closed, setClosed] = useState(false);
  const { popup } = config.engagement;

  const due =
    ready &&
    !closed &&
    popup.enabled &&
    !!popup.title.trim() &&
    isLive(popup.schedule) &&
    !has(`popup:${popup.id}`) &&
    !isBackstage(pathname) &&
    !config.engagement.maintenance.enabled;

  const close = () => {
    setClosed(true);
    dismiss(`popup:${popup.id}`);
  };

  const source = popup.image ? imageSource(popup.image) : undefined;

  return (
    <Modal visible={due} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Close">
        <Pressable style={styles.popup} onPress={(event) => event.stopPropagation()}>
          {source ? <Image source={source} style={styles.popupImage} resizeMode="cover" /> : null}
          <View style={styles.popupText}>
            <Text style={styles.popupTitle}>{popup.title}</Text>
            {popup.body ? <Text style={styles.popupBody}>{popup.body}</Text> : null}
          </View>
          {popup.ctaLabel && popup.href ? (
            <PrimaryButton
              label={popup.ctaLabel}
              onPress={() => {
                trackEvent(`popup:${popup.id}`);
                close();
                open(popup.href);
              }}
            />
          ) : null}
          <PrimaryButton label="Close" variant="outline" onPress={close} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * While someone on the team previews the draft, a strip at the bottom of the
 * app says so and leads back to the dashboard.
 */
export function PreviewStrip() {
  const { previewing, stopPreview } = useAppConfig();
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (previewing) setHidden(false);
  }, [previewing]);

  if (!previewing || hidden || pathname.startsWith('/admin')) return null;

  return (
    <View style={[styles.strip, { bottom: insets.bottom + 72 }]}>
      <Text style={styles.stripText}>Previewing the draft</Text>
      <Tappable accessibilityRole="button" onPress={() => router.push('/admin/publish' as Href)} style={styles.stripButton}>
        <Text style={styles.stripButtonText}>Dashboard</Text>
      </Tappable>
      <Tappable accessibilityRole="button" onPress={stopPreview} style={styles.stripButton}>
        <Text style={styles.stripButtonText}>End</Text>
      </Tappable>
      <Tappable accessibilityRole="button" accessibilityLabel="Hide this bar" onPress={() => setHidden(true)} style={styles.stripButton}>
        <Text style={styles.stripButtonText}>Hide</Text>
      </Tappable>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  coverInner: { maxWidth: 420, paddingHorizontal: GUTTER, gap: space.md, alignItems: 'flex-start' },
  coverTitle: { ...type.display, color: colors.ink, marginTop: space.lg },
  coverBody: { ...type.body, color: colors.body },
  coverEta: { ...type.label, color: colors.saffronDeep },

  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  popup: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.xl,
    gap: space.md,
    overflow: 'hidden',
  },
  popupImage: { height: 160, borderRadius: radius.md, backgroundColor: colors.fill },
  popupText: { gap: space.xs },
  popupTitle: { ...type.title, color: colors.ink },
  popupBody: { ...type.body, color: colors.muted },

  strip: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingLeft: space.lg,
    paddingRight: space.xs,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    zIndex: 90,
  },
  stripText: { ...type.caption, color: colors.white, marginRight: space.xs },
  stripButton: { paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill },
  stripButtonText: { ...type.caption, color: colors.saffron },
});
