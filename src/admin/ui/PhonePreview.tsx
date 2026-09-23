import React from 'react';
import { Image, StyleSheet, Text, View, type TextStyle } from 'react-native';

import { AppIcon } from '@/config/icons';
import { imageSource } from '@/config/images';
import type { AppConfig, TypeStep } from '@/config/schema';
import { font } from '@/theme/typography';

import { A, R } from './theme';

/**
 * A small phone showing the app's main pieces in a draft's colours, type and
 * spacing — drawn from the draft passed in, not from the live theme, so it
 * changes as the controls beside it do.
 */
export function PhonePreview({
  config,
  width = 280,
  dark,
}: {
  config: Pick<AppConfig, 'theme' | 'typography' | 'layout' | 'branding' | 'navigation'>;
  width?: number;
  /** Frame colour only; the screen follows the palette. */
  dark?: boolean;
}) {
  const c = config.theme.colors;
  const steps = config.typography.steps;
  const scale = config.typography.scale || 1;
  const sp = config.layout.space;
  const rad = config.layout.radius;
  const gutter = Math.max(8, Math.round(config.layout.gutter * 0.8));
  const k = width / 360;

  const text = (step: TypeStep, color: string, extra?: TextStyle): TextStyle => ({
    fontFamily: font[steps[step].weight],
    fontSize: steps[step].fontSize * scale * k,
    lineHeight: steps[step].lineHeight * scale * k,
    color,
    ...extra,
  });

  const s = (n: number) => Math.round(n * k);
  const logo = config.branding.logo ? imageSource(config.branding.logo) : undefined;
  const tabs = config.navigation.tabs.filter((tab) => tab.visible);

  return (
    <View style={[styles.frame, { width: width + 16, backgroundColor: dark ? '#111' : '#2B2320' }]}>
      <View style={[styles.screen, { backgroundColor: c.white, borderRadius: 22 }]}>
        <View style={[styles.status, { paddingHorizontal: gutter }]}>
          <Text style={[styles.statusText, { color: c.ink }]}>9:41</Text>
          <View style={[styles.notch, { backgroundColor: '#000' }]} />
          <Text style={[styles.statusText, { color: c.ink }]}>●●●</Text>
        </View>

        <View style={{ paddingHorizontal: gutter, paddingTop: s(sp.sm), gap: s(sp.xs) }}>
          <View style={styles.row}>
            {config.branding.showLogoOnHome ? (
              <View
                style={{
                  width: s(34),
                  height: s(34),
                  borderRadius: config.branding.logoShape === 'circle' ? s(17) : config.branding.logoShape === 'rounded' ? s(9) : s(2),
                  backgroundColor: config.branding.logoBackground || c.saffron,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  marginRight: s(sp.sm),
                }}
              >
                {logo ? (
                  <Image source={logo} style={StyleSheet.absoluteFill} resizeMode="cover" />
                ) : (
                  <Text style={text('label', c.onSaffron)}>{config.branding.logoMark.slice(0, 2)}</Text>
                )}
              </View>
            ) : null}
            <View style={{ flex: 1 }}>
              <Text style={text('display', c.ink)} numberOfLines={1}>
                Good evening, Sita
              </Text>
              <Text style={text('small', c.muted)} numberOfLines={1}>
                Sun 20 Sep · Shukla Navami
              </Text>
            </View>
            <View style={{ width: s(38), height: s(38), borderRadius: s(19), backgroundColor: c.saffronSoft }} />
          </View>

          <View
            style={{
              marginTop: s(sp.md),
              height: s(42),
              borderRadius: s(rad.md),
              backgroundColor: c.fill,
              borderWidth: 1,
              borderColor: c.border,
              justifyContent: 'center',
              paddingHorizontal: s(sp.md),
            }}
          >
            <Text style={text('body', c.subtle)} numberOfLines={1}>
              Search astrologers
            </Text>
          </View>

          <View style={[styles.row, { justifyContent: 'space-between', marginTop: s(sp.md) }]}>
            {['star', 'grid', 'clock', 'kundli'].map((icon) => (
              <View key={icon} style={{ alignItems: 'center', gap: s(4), flex: 1 }}>
                <View
                  style={{
                    width: s(48),
                    height: s(48),
                    borderRadius: s(rad.lg),
                    backgroundColor: c.saffronSoft,
                    borderWidth: 1,
                    borderColor: c.saffronBorder,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AppIcon name={icon} size={s(22)} color={c.saffronDeep} />
                </View>
                <View style={{ width: s(34), height: s(5), borderRadius: 3, backgroundColor: c.border }} />
              </View>
            ))}
          </View>

          <View
            style={{
              marginTop: s(sp.lg),
              borderRadius: s(rad.lg),
              backgroundColor: c.saffronSoft,
              borderWidth: 1,
              borderColor: c.saffronBorder,
              padding: s(sp.lg),
              gap: s(sp.xs),
            }}
          >
            <Text style={text('caption', c.saffronDeep)}>TODAY’S RASHIFAL</Text>
            <Text style={text('title', c.ink)} numberOfLines={1}>
              A steady day for work
            </Text>
            <Text style={text('small', c.body)} numberOfLines={2}>
              The moon crosses your tenth house. Finish what you started.
            </Text>
            <View
              style={{
                marginTop: s(sp.sm),
                height: s(40),
                borderRadius: s(rad.md),
                backgroundColor: c.saffron,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={text('button', c.onSaffron)}>Read today</Text>
            </View>
          </View>

          <View
            style={{
              marginTop: s(sp.md),
              borderRadius: s(rad.lg),
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.white,
              padding: s(sp.md),
              flexDirection: 'row',
              alignItems: 'center',
              gap: s(sp.md),
            }}
          >
            <View style={{ width: s(40), height: s(40), borderRadius: s(20), backgroundColor: c.saffronSoft }} />
            <View style={{ flex: 1 }}>
              <Text style={text('label', c.ink)} numberOfLines={1}>
                Vihana Ji
              </Text>
              <Text style={text('caption', c.muted)} numberOfLines={1}>
                Tarot, Vastu · English
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 2 }}>
              <Text style={text('caption', c.saffronDeep)}>0.49/min</Text>
              <View style={{ paddingHorizontal: s(6), borderRadius: s(rad.pill > 100 ? 99 : rad.pill), backgroundColor: c.greenSoft }}>
                <Text style={text('caption', c.green, { fontSize: 10 * k * scale, lineHeight: 14 * k * scale })}>Online</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <View
          style={{
            height: s(config.layout.tabBarHeight),
            borderTopWidth: 1,
            borderTopColor: c.divider,
            backgroundColor: c.white,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {tabs.map((tab, index) => {
            const tint = index === 0 ? c.saffronDeep : c.muted;
            return (
              <View key={tab.id} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
                <AppIcon name={tab.icon} size={s(20)} color={tint} filled={index === 0} />
                <Text style={text('caption', tint, { fontSize: 10 * k * scale, lineHeight: 13 * k * scale })} numberOfLines={1}>
                  {tab.title}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: 30, padding: 8, alignSelf: 'center' },
  screen: { overflow: 'hidden', aspectRatio: 9 / 18.5, borderWidth: 0, borderColor: A.line },
  status: { height: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusText: { fontFamily: font.semibold, fontSize: 11 },
  notch: { width: 70, height: 16, borderRadius: R.pill, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
});
