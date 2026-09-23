import { useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { Image, Linking, StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/config/format';
import { imageSource, isExternal } from '@/config/images';
import type { CustomPage, PageBlock, Tone } from '@/config/schema';
import { findAstrologer } from '@/data/astrologers';
import { serviceById } from '@/data/services';
import { ChevronRight } from '@/icons';
import { GUTTER, colors, radius, space, type } from '@/theme';

import { Avatar } from './Avatar';
import { PrimaryButton } from './PrimaryButton';
import { ServiceIcon } from './service/ServiceIcon';
import { Tappable } from './Tappable';

/**
 * A page built in the dashboard, drawn with the app's own pieces so it looks
 * like every other screen. `/page/[slug]` shows the published ones; the
 * dashboard shows the draft in its preview.
 */
export function CustomPageView({ page }: { page: CustomPage }) {
  return (
    <View style={styles.page}>
      {page.subtitle ? <Text style={styles.subtitle}>{page.subtitle}</Text> : null}
      {page.blocks.map((block) => (
        <Block key={block.id} block={block} />
      ))}
    </View>
  );
}

function toneColors(tone: Tone) {
  switch (tone) {
    case 'success':
      return { bg: colors.greenSoft, fg: colors.green, border: colors.greenSoft };
    case 'danger':
      return { bg: colors.redSoft, fg: colors.red, border: colors.redSoft };
    case 'neutral':
      return { bg: colors.fill, fg: colors.ink, border: colors.border };
    default:
      return { bg: colors.saffronSoft, fg: colors.saffronDeep, border: colors.saffronBorder };
  }
}

export function useOpenLink() {
  const router = useRouter();
  return (href: string) => {
    if (!href) return;
    if (isExternal(href)) Linking.openURL(href).catch(() => {});
    else router.push(href as Href);
  };
}

function Block({ block }: { block: PageBlock }) {
  const open = useOpenLink();

  switch (block.type) {
    case 'heading':
      return <Text style={block.size === 'lg' ? styles.headingLg : styles.heading}>{block.text}</Text>;
    case 'text':
      return <Text style={styles.text}>{block.text}</Text>;
    case 'image': {
      const source = imageSource(block.image);
      if (!source) return null;
      return (
        <View style={styles.figure}>
          <Image source={source} style={[styles.image, { height: block.height }]} resizeMode="cover" accessibilityLabel={block.caption} />
          {block.caption ? <Text style={styles.caption}>{block.caption}</Text> : null}
        </View>
      );
    }
    case 'button':
      return <PrimaryButton label={block.label} variant={block.variant} onPress={() => open(block.href)} />;
    case 'callout': {
      const tone = toneColors(block.tone);
      return (
        <View style={[styles.callout, { backgroundColor: tone.bg, borderColor: tone.border }]}>
          {block.title ? <Text style={[styles.calloutTitle, { color: tone.fg }]}>{block.title}</Text> : null}
          {block.text ? <Text style={styles.calloutText}>{block.text}</Text> : null}
        </View>
      );
    }
    case 'list':
      return (
        <View style={styles.list}>
          {block.items.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listMarker}>{block.ordered ? `${index + 1}.` : '•'}</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    case 'quote':
      return (
        <View style={styles.quote}>
          <Text style={styles.quoteText}>{block.text}</Text>
          {block.cite ? <Text style={styles.quoteCite}>— {block.cite}</Text> : null}
        </View>
      );
    case 'faq':
      return (
        <View style={styles.faq}>
          {block.items.map((item, index) => (
            <Question key={index} q={item.q} a={item.a} first={index === 0} />
          ))}
        </View>
      );
    case 'facts':
      return (
        <View style={styles.facts}>
          {block.rows.map((row, index) => (
            <View key={index} style={[styles.factRow, index > 0 && styles.factDivider]}>
              <Text style={styles.factLabel}>{row.label}</Text>
              <Text style={styles.factValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      );
    case 'astrologer': {
      const astrologer = findAstrologer(block.astrologerId);
      if (!astrologer) return null;
      const rate = astrologer.discountedRate ?? astrologer.rate;
      return (
        <Tappable feel="card" accessibilityRole="button" onPress={() => open(`/astrologer/${astrologer.id}`)} style={styles.card} pressedStyle={styles.cardPressed}>
          <Avatar uri={astrologer.photo} name={astrologer.name} size={48} />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{astrologer.name}</Text>
            <Text style={styles.cardBody} numberOfLines={1}>
              {astrologer.skills} · {rate === 0 ? 'Free' : formatMoney(rate, undefined, { perMinute: true })}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.subtle} />
        </Tappable>
      );
    }
    case 'service': {
      const service = serviceById(block.serviceId);
      if (!service) return null;
      return (
        <Tappable feel="card" accessibilityRole="button" onPress={() => open(service.href)} style={styles.card} pressedStyle={styles.cardPressed}>
          <View style={styles.serviceIcon}>
            <ServiceIcon name={service.icon} size={22} color={colors.saffronDeep} strokeWidth={1.8} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{service.name}</Text>
            <Text style={styles.cardBody} numberOfLines={2}>
              {service.tagline}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.subtle} />
        </Tappable>
      );
    }
    case 'divider':
      return <View style={styles.divider} />;
    case 'spacer':
      return <View style={{ height: block.size }} />;
  }
}

function Question({ q, a, first }: { q: string; a: string; first: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.question, !first && styles.factDivider]}>
      <Tappable
        feel="card"
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((v) => !v)}
        style={styles.questionHead}
      >
        <Text style={styles.questionText}>{q}</Text>
        <Text style={styles.questionToggle}>{open ? '−' : '+'}</Text>
      </Tappable>
      {open ? <Text style={styles.answer}>{a}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: GUTTER, paddingTop: space.lg, paddingBottom: space.xxl, gap: space.lg },
  subtitle: { ...type.body, color: colors.muted },
  heading: { ...type.section, color: colors.ink, marginTop: space.sm },
  headingLg: { ...type.title, color: colors.ink, marginTop: space.sm },
  text: { ...type.body, color: colors.body },
  figure: { gap: space.xs },
  image: { width: '100%', borderRadius: radius.lg, backgroundColor: colors.fill },
  caption: { ...type.caption, color: colors.subtle },
  callout: { borderRadius: radius.lg, borderWidth: 1, padding: space.lg, gap: space.xs },
  calloutTitle: { ...type.label },
  calloutText: { ...type.small, color: colors.body },
  list: { gap: space.sm },
  listItem: { flexDirection: 'row', gap: space.sm },
  listMarker: { ...type.body, color: colors.saffronDeep, minWidth: 16 },
  listText: { ...type.body, color: colors.body, flex: 1 },
  quote: { borderLeftWidth: 3, borderLeftColor: colors.saffron, paddingLeft: space.lg, gap: space.xs },
  quoteText: { ...type.section, color: colors.ink },
  quoteCite: { ...type.small, color: colors.muted },
  faq: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  question: {},
  questionHead: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
  questionText: { ...type.label, color: colors.ink, flex: 1 },
  questionToggle: { ...type.title, color: colors.saffronDeep },
  answer: { ...type.small, color: colors.body, paddingHorizontal: space.lg, paddingBottom: space.lg },
  facts: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: space.lg },
  factRow: { flexDirection: 'row', justifyContent: 'space-between', gap: space.lg, paddingVertical: space.md },
  factDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  factLabel: { ...type.small, color: colors.muted },
  factValue: { ...type.label, color: colors.ink, flexShrink: 1, textAlign: 'right' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  cardPressed: { backgroundColor: colors.fill },
  cardText: { flex: 1 },
  cardTitle: { ...type.label, color: colors.ink },
  cardBody: { ...type.small, color: colors.muted },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.saffronSoft,
    borderWidth: 1,
    borderColor: colors.saffronBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: colors.divider },
});
