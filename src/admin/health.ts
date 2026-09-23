import { CONTRAST_PAIRS, contrast, isColor } from '@/config/color';
import { APP_SCREENS } from '@/config/screens';
import type { AppConfig } from '@/config/schema';

import { dataUriBytes, formatBytes } from './media';
import type { AdminTone } from './ui/theme';

/**
 * Things in a config worth someone's attention before it goes live: text
 * that will not read, lists left empty, a screen switched off and forgotten.
 * Each finding says where to fix it.
 */
export type Finding = {
  id: string;
  tone: AdminTone;
  title: string;
  detail: string;
  /** The dashboard page (and tool) that fixes it. */
  href: string;
};

export function checkConfig(config: AppConfig, now = Date.now()): Finding[] {
  const out: Finding[] = [];
  const palette = config.theme.colors;

  const failing = CONTRAST_PAIRS.filter((pair) => {
    const fg = palette[pair.fg];
    const bg = palette[pair.bg];
    if (!isColor(fg) || !isColor(bg)) return true;
    return contrast(fg, bg) < (pair.large ? 3 : 4.5);
  });
  if (failing.length) {
    out.push({
      id: 'contrast',
      tone: 'warning',
      title: `${failing.length} colour pair${failing.length === 1 ? '' : 's'} hard to read`,
      detail: failing.map((pair) => pair.use).slice(0, 3).join(', '),
      href: '/admin/theme?tool=contrast',
    });
  }

  if (config.engagement.maintenance.enabled) {
    out.push({
      id: 'maintenance',
      tone: 'danger',
      title: 'Maintenance mode is on',
      detail: 'Nobody can use the app until it is turned off.',
      href: '/admin/engagement?tool=maintenance',
    });
  }

  const off = Object.entries(config.screens).filter(
    ([key, rule]) => !rule.enabled && !APP_SCREENS.find((s) => s.key === key)?.essential,
  );
  if (off.length) {
    out.push({
      id: 'screens-off',
      tone: 'info',
      title: `${off.length} screen${off.length === 1 ? ' is' : 's are'} switched off`,
      detail: off.map(([key]) => APP_SCREENS.find((s) => s.key === key)?.label ?? key).slice(0, 4).join(', '),
      href: '/admin/screens?tool=screen-switches',
    });
  }

  const hiddenTabs = config.navigation.tabs.filter((tab) => !tab.visible);
  if (config.navigation.tabs.find((tab) => tab.id === config.navigation.landingTab && !tab.visible)) {
    out.push({
      id: 'landing-hidden',
      tone: 'warning',
      title: 'The first screen is a hidden tab',
      detail: 'The app opens on a tab that is not in the tab bar.',
      href: '/admin/navigation?tool=landing-tab',
    });
  } else if (hiddenTabs.length >= 4) {
    out.push({
      id: 'tabs',
      tone: 'warning',
      title: 'Only one tab is showing',
      detail: 'With one tab the tab bar has nothing to switch between.',
      href: '/admin/navigation?tool=tabs',
    });
  }

  const blankServices = config.services.items.filter((s) => !s.name.trim() || !s.tagline.trim());
  if (blankServices.length) {
    out.push({
      id: 'services-blank',
      tone: 'warning',
      title: `${blankServices.length} service${blankServices.length === 1 ? ' has' : 's have'} no name or tagline`,
      detail: 'They show as empty cards on the Services tab.',
      href: '/admin/services?tool=service-list',
    });
  }

  const roster = config.astrologers.roster;
  const unlisted = roster.filter((a) => !a.listings.length);
  if (unlisted.length) {
    out.push({
      id: 'unlisted',
      tone: 'info',
      title: `${unlisted.length} astrologer${unlisted.length === 1 ? ' is' : 's are'} on no list`,
      detail: unlisted.map((a) => a.name).slice(0, 3).join(', '),
      href: '/admin/astrologers?tool=roster',
    });
  }
  if (roster.length && !roster.some((a) => a.online)) {
    out.push({
      id: 'nobody-online',
      tone: 'warning',
      title: 'No astrologer is online',
      detail: '“Available now” on the home screen will be empty.',
      href: '/admin/astrologers?tool=availability',
    });
  }
  const noPhoto = roster.filter((a) => !a.photo);
  if (noPhoto.length) {
    out.push({
      id: 'no-photo',
      tone: 'info',
      title: `${noPhoto.length} astrologer${noPhoto.length === 1 ? ' has' : 's have'} no portrait`,
      detail: 'Their initials are shown instead.',
      href: '/admin/media?tool=portraits',
    });
  }

  const freeRemedies = config.remedies.filter((r) => !r.hidden && r.price <= 0);
  if (freeRemedies.length) {
    out.push({
      id: 'remedy-price',
      tone: 'info',
      title: `${freeRemedies.length} remed${freeRemedies.length === 1 ? 'y is' : 'ies are'} priced at 0`,
      detail: freeRemedies.map((r) => r.title).join(', '),
      href: '/admin/remedies?tool=remedy-list',
    });
  }

  const ended = config.engagement.banners.filter((b) => b.enabled && b.schedule.endsAt && b.schedule.endsAt < now);
  if (ended.length) {
    out.push({
      id: 'banners-ended',
      tone: 'info',
      title: `${ended.length} banner${ended.length === 1 ? ' has' : 's have'} ended`,
      detail: 'Switched on, but past their end date, so nobody sees them.',
      href: '/admin/engagement?tool=banners',
    });
  }

  const emptyPages = config.pages.filter((p) => p.published && !p.blocks.length);
  if (emptyPages.length) {
    out.push({
      id: 'empty-pages',
      tone: 'warning',
      title: `${emptyPages.length} published page${emptyPages.length === 1 ? ' is' : 's are'} empty`,
      detail: emptyPages.map((p) => p.title).join(', '),
      href: '/admin/screens?tool=pages',
    });
  }

  const uploadBytes = config.media.library.reduce((sum, item) => sum + (item.bytes || dataUriBytes(item.uri)), 0);
  if (uploadBytes > 2_500_000) {
    out.push({
      id: 'media-weight',
      tone: 'warning',
      title: `Uploads weigh ${formatBytes(uploadBytes)}`,
      detail: 'A heavy config is slow to save and to sync. Remove pictures nothing uses.',
      href: '/admin/media?tool=media-cleanup',
    });
  }

  return out;
}
