import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { readableOn } from '@/config/color';
import { imageSource } from '@/config/images';
import { isLive } from '@/config/schedule';
import type { Banner, Tone } from '@/config/schema';
import { useShownConfig } from '@/config/store';
import { Close } from '@/icons';
import { trackEvent } from '@/lib/analytics';
import { useDismissed } from '@/lib/dismissed';
import { GUTTER, TOUCH_SIZE, colors, radius, space, type } from '@/theme';

import { useOpenLink } from '../CustomPageView';
import { Tappable } from '../Tappable';

/**
 * The banners the dashboard has switched on and whose dates include today.
 * The card opens its link; the close button beside it (never inside it)
 * hides that banner on this phone for good.
 */
export function HomeBanners() {
  const config = useShownConfig();
  const { ready, has, dismiss } = useDismissed();
  const open = useOpenLink();
  const now = Date.now();

  const banners = config.engagement.banners.filter(
    (banner) => banner.enabled && isLive(banner.schedule, now) && !(banner.dismissible && has(banner.id)),
  );
  if (!ready || !banners.length) return null;

  return (
    <View style={styles.list}>
      {banners.map((banner) => (
        <BannerCard
          key={banner.id}
          banner={banner}
          onOpen={() => {
            trackEvent(`banner:${banner.id}`);
            open(banner.href);
          }}
          onClose={banner.dismissible ? () => dismiss(banner.id) : undefined}
        />
      ))}
    </View>
  );
}

function BannerCard({ banner, onOpen, onClose }: { banner: Banner; onOpen: () => void; onClose?: () => void }) {
  const background = banner.background || colors.saffronSoft;
  const ink = banner.foreground || readableOn(background, colors.ink, colors.white);
  const source = banner.image ? imageSource(banner.image) : undefined;

  return (
    <View style={[styles.card, { backgroundColor: background }]}>
      <Tappable
        feel="card"
        accessibilityRole={banner.href ? 'link' : undefined}
        accessibilityLabel={`${banner.title}. ${banner.body}`}
        onPress={banner.href ? onOpen : undefined}
        disabled={!banner.href}
        style={styles.body}
      >
        {source ? <Image source={source} style={styles.image} resizeMode="cover" /> : null}
        <View style={styles.text}>
          <Text style={[styles.title, { color: ink }]}>{banner.title}</Text>
          {banner.body ? <Text style={[styles.copy, { color: ink }]}>{banner.body}</Text> : null}
          {banner.ctaLabel ? <Text style={[styles.cta, { color: ink }]}>{banner.ctaLabel}</Text> : null}
        </View>
      </Tappable>
      {onClose ? (
        <Tappable
          feel="icon"
          accessibilityRole="button"
          accessibilityLabel={`Close ${banner.title}`}
          onPress={onClose}
          hitSlop={8}
          style={styles.close}
        >
          <Close size={14} color={ink} strokeWidth={2.4} />
        </Tappable>
      ) : null}
    </View>
  );
}

/** One line across the top of the home screen, when the dashboard sets one. */
export function NoticeBar() {
  const config = useShownConfig();
  const open = useOpenLink();
  const notice = config.engagement.notice;
  if (!notice.enabled || !notice.text.trim()) return null;

  const tones: Record<Tone, { bg: string; fg: string }> = {
    brand: { bg: colors.saffronSoft, fg: colors.saffronDeep },
    neutral: { bg: colors.fill, fg: colors.ink },
    success: { bg: colors.greenSoft, fg: colors.green },
    danger: { bg: colors.redSoft, fg: colors.red },
  };
  const tone = tones[notice.tone] ?? tones.brand;

  return (
    <Tappable
      feel="card"
      accessibilityRole={notice.href ? 'link' : 'text'}
      disabled={!notice.href}
      onPress={notice.href ? () => open(notice.href) : undefined}
      style={[styles.notice, { backgroundColor: tone.bg }]}
    >
      <Text style={[styles.noticeText, { color: tone.fg }]}>{notice.text}</Text>
    </Tappable>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.md, paddingHorizontal: GUTTER, marginTop: space.lg },
  card: { borderRadius: radius.lg, flexDirection: 'row', overflow: 'hidden' },
  body: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
  image: { width: 64, height: 64, borderRadius: radius.md },
  text: { flex: 1, gap: 2 },
  title: { ...type.label },
  copy: { ...type.small },
  cta: { ...type.label, marginTop: space.xs, textDecorationLine: 'underline' },
  close: { width: TOUCH_SIZE, height: TOUCH_SIZE, alignItems: 'center', justifyContent: 'center' },
  notice: {
    marginHorizontal: GUTTER,
    marginTop: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.md,
  },
  noticeText: { ...type.small },
});
