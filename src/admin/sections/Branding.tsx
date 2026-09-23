import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/config/format';
import { imageSource } from '@/config/images';
import type { Branding as BrandingConfig } from '@/config/schema';
import { useAppConfig } from '@/config/store';

import { useArea } from '../editor';
import { ColorField, ImageField } from '../ui/pickers';
import { NumberField, Segmented, TextField, Toggle } from '../ui/fields';
import { Grid, KeyValue, Panel } from '../ui/kit';
import { AdminPage } from '../ui/Page';
import { PhonePreview } from '../ui/PhonePreview';
import { A, R, S, T } from '../ui/theme';

/** The mark as the app draws it: the logo image, or the monogram. */
export function BrandMark({ branding, brand, size = 64 }: { branding: BrandingConfig; brand: string; size?: number }) {
  const source = branding.logo ? imageSource(branding.logo) : undefined;
  const radius = branding.logoShape === 'circle' ? size / 2 : branding.logoShape === 'rounded' ? size * 0.24 : size * 0.06;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: branding.logoBackground || brand,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {source ? (
        <Image source={source} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityLabel={`${branding.appName} logo`} />
      ) : (
        <Text style={[T.h1, { fontSize: size * 0.42, lineHeight: size * 0.56, color: '#2B1A06' }]}>
          {branding.logoMark.slice(0, 3)}
        </Text>
      )}
    </View>
  );
}

export default function Branding() {
  const { value: b, patch, canEdit } = useArea('branding');
  const { draft } = useAppConfig();
  const brand = draft.theme.colors.saffron;

  const socials: { key: keyof BrandingConfig['socials']; label: string; placeholder: string }[] = [
    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/…' },
    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/…' },
    { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@…' },
    { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@…' },
    { key: 'x', label: 'X', placeholder: 'https://x.com/…' },
  ];

  return (
    <AdminPage section="branding" canEdit={canEdit}>
      <Grid min={360} max={2}>
        <Panel id="app-name" title="App name and tagline" description="Shown on the loading screen, the maintenance screen and the profile footer" icon="flag">
          <TextField label="App name" value={b.appName} onChange={(appName) => patch({ appName }, 'app name')} maxLength={32} />
          <TextField label="Tagline" value={b.tagline} onChange={(tagline) => patch({ tagline }, 'tagline')} maxLength={80} />
        </Panel>

        <Panel id="logo" title="Logo" description="A square picture works best. PNG keeps a transparent background." icon="image">
          <ImageField
            value={b.logo}
            onChange={(logo) => patch({ logo }, 'logo')}
            pick={{ maxSize: 512, format: 'png', square: true }}
            hint="With no logo, the monogram below is drawn instead."
          />
        </Panel>

        <Panel id="logo-mark" title="Monogram and shape" description="The letters in the mark when there is no logo, and the mark’s outline" icon="star">
          <TextField
            label="Monogram"
            value={b.logoMark}
            onChange={(logoMark) => patch({ logoMark }, 'monogram')}
            maxLength={3}
            hint="One to three characters. Devanagari works: ॐ, ज्यो."
          />
          <Segmented
            label="Shape"
            value={b.logoShape}
            onChange={(logoShape) => patch({ logoShape }, 'logo shape')}
            options={[
              { value: 'circle', label: 'Circle' },
              { value: 'rounded', label: 'Rounded' },
              { value: 'square', label: 'Square' },
            ]}
          />
          <ColorField
            label="Background"
            value={b.logoBackground || brand}
            onChange={(logoBackground) => patch({ logoBackground }, 'logo background')}
            hint="Behind the mark and on the loading screen."
          />
        </Panel>

        <Panel id="brand-preview" title="Brand preview" description="The mark and name, large and small" icon="eye" subtle>
          <View style={styles.lockups}>
            <View style={styles.lockup}>
              <BrandMark branding={b} brand={brand} size={72} />
              <View style={styles.lockupText}>
                <Text style={styles.lockupName}>{b.appName || 'Untitled'}</Text>
                <Text style={styles.lockupTagline}>{b.tagline}</Text>
              </View>
            </View>
            <View style={styles.sizes}>
              {[48, 32, 20].map((size) => (
                <BrandMark key={size} branding={b} brand={brand} size={size} />
              ))}
            </View>
          </View>
        </Panel>

        <Panel id="home-logo" title="Logo on the home screen" description="Puts the mark beside the greeting at the top of Home" icon="home">
          <Toggle
            label="Show the logo on Home"
            description="Off keeps the greeting on its own, as the app shipped."
            value={b.showLogoOnHome}
            onChange={(showLogoOnHome) => patch({ showLogoOnHome }, 'home logo')}
          />
          <PhonePreview config={{ ...draft, branding: b }} width={220} />
        </Panel>

        <Panel id="contact" title="Support contact" description="Shown under “Help and support” on the profile screen. Leave a field empty to hide it." icon="mail">
          <TextField label="Email" value={b.supportEmail} onChange={(supportEmail) => patch({ supportEmail }, 'support email')} keyboardType="email-address" autoCapitalize="none" placeholder="help@example.com" />
          <TextField label="Phone" value={b.supportPhone} onChange={(supportPhone) => patch({ supportPhone }, 'support phone')} keyboardType="phone-pad" placeholder="+977 …" />
          <TextField label="Website" value={b.website} onChange={(website) => patch({ website }, 'website')} autoCapitalize="none" mono placeholder="https://" />
        </Panel>

        <Panel id="socials" title="Social links" description="Each filled link becomes a row under “Help and support”" icon="globe">
          {socials.map((social) => (
            <TextField
              key={social.key}
              label={social.label}
              value={b.socials[social.key]}
              onChange={(value) => patch({ socials: { ...b.socials, [social.key]: value } }, `${social.label} link`)}
              placeholder={social.placeholder}
              autoCapitalize="none"
              mono
            />
          ))}
        </Panel>

        <Panel id="currency" title="Currency and prices" description="How every rate and price in the app is written" icon="coins">
          <Segmented
            label="Style"
            value={b.currency.style}
            onChange={(style) => patch({ currency: { ...b.currency, style } }, 'currency style')}
            options={[
              { value: 'code', label: 'Code — USD 0.49' },
              { value: 'symbol', label: 'Symbol — $0.49' },
            ]}
          />
          <View style={styles.pair}>
            <View style={styles.half}>
              <TextField label="Code" value={b.currency.code} onChange={(code) => patch({ currency: { ...b.currency, code: code.toUpperCase() } }, 'currency code')} maxLength={4} autoCapitalize="characters" />
            </View>
            <View style={styles.half}>
              <TextField label="Symbol" value={b.currency.symbol} onChange={(symbol) => patch({ currency: { ...b.currency, symbol } }, 'currency symbol')} maxLength={4} />
            </View>
          </View>
          <View style={styles.pair}>
            <View style={styles.half}>
              <NumberField label="Decimals" value={b.currency.decimals} min={0} max={3} onChange={(decimals) => patch({ currency: { ...b.currency, decimals: decimals ?? 2 } }, 'decimals')} />
            </View>
            <View style={styles.half}>
              <TextField label="Per minute" value={b.currency.perMinute} onChange={(perMinute) => patch({ currency: { ...b.currency, perMinute } }, 'per-minute suffix')} maxLength={8} />
            </View>
          </View>
          <KeyValue
            rows={[
              { label: 'A rate', value: formatMoney(0.49, b.currency, { perMinute: true }) },
              { label: 'A price', value: formatMoney(45, b.currency) },
              { label: 'Nepali rupees, for example', value: 'Code NPR, symbol रू, 0 decimals' },
            ]}
          />
        </Panel>

        <Panel id="footer" title="Footer line" description="A small line at the very bottom of the profile screen" icon="text">
          <TextField
            label="Footer"
            value={b.footer}
            onChange={(footer) => patch({ footer }, 'footer')}
            placeholder={`© ${new Date().getFullYear()} ${b.appName}`}
            maxLength={120}
          />
        </Panel>
      </Grid>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  lockups: { gap: S.lg },
  lockup: { flexDirection: 'row', alignItems: 'center', gap: S.lg },
  lockupText: { flex: 1 },
  lockupName: { ...T.h1, color: A.ink },
  lockupTagline: { ...T.small, color: A.muted },
  sizes: { flexDirection: 'row', alignItems: 'flex-end', gap: S.lg, padding: S.md, borderRadius: R.md, backgroundColor: A.surface },
  pair: { flexDirection: 'row', gap: S.md, flexWrap: 'wrap' },
  half: { flex: 1, minWidth: 130 },
});
