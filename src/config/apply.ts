/**
 * Writes a config into the running app.
 *
 * The screens were written against plain modules — `colors`, `SERVICES`,
 * `chatAstrologers`, `remedyServices` — and they keep reading those. Rather
 * than thread a context through every one of them, a published config is
 * written into those same objects and arrays, in place. The next render
 * reads the new values; the root layout remounts the navigator after every
 * apply so that the next render happens straight away.
 */
import {
  aiAstrologer,
  callAstrologers,
  chatAstrologers,
  featuredAstrologers,
  ongoingSession,
  topNearbyAstrologer,
  type Astrologer,
} from '@/data/astrologers';
import {
  astroReplies,
  babaPrompts,
  directoryFilters,
  languageOptions,
  profileGroups,
  quickCategories,
  quickPrompts,
  remedyServices,
} from '@/data/content';
import { scenes, type Scene } from '@/data/images';
import { SERVICES, SERVICE_GROUPS, type Service } from '@/data/services';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';
import { bumpTheme, liveLayout, setTextScale, themeDefaults } from '@/theme/runtime';
import { font, type } from '@/theme/typography';

import { isColor } from './color';
import { SCENE_ORIGINALS } from './defaults';
import { imageSource, imageUri } from './images';
import { setLiveConfig } from './live';
import type { AppConfig, AstrologerRecord, TypeStep } from './schema';
import { setScreenRules } from './screens';
import { setStringOverrides } from './strings';

/** Empties `target` and fills it with `items`, keeping the same array. */
function replace<T>(target: readonly T[], items: T[]): void {
  const array = target as T[];
  array.splice(0, array.length, ...items);
}

function toAstrologer(record: AstrologerRecord): Astrologer {
  return {
    id: record.id,
    name: record.name,
    photo: imageUri(record.photo),
    skills: record.skills,
    languages: record.languages,
    experience: record.experience ?? undefined,
    rate: record.rate,
    discountedRate: record.discountedRate ?? undefined,
    orders: record.orders || undefined,
    rating: record.rating ?? undefined,
    verified: record.verified,
    celebrity: record.celebrity || undefined,
    waitTime: record.waitTime || undefined,
    online: record.online,
    about: record.about || undefined,
    specialities: record.specialities.length ? [...record.specialities] : ['all'],
  };
}

/* ------------------------------------------------------------------ *
 * Design tokens
 * ------------------------------------------------------------------ */

function applyTheme(config: AppConfig): void {
  const palette = config.theme.colors;
  for (const token of Object.keys(themeDefaults.colors) as (keyof typeof colors)[]) {
    const value = palette[token];
    colors[token] = typeof value === 'string' && isColor(value) ? value : themeDefaults.colors[token];
  }

  for (const step of Object.keys(themeDefaults.type) as TypeStep[]) {
    const setting = config.typography.steps[step];
    const target = type[step];
    const fallback = themeDefaults.type[step];
    target.fontSize = setting?.fontSize > 0 ? setting.fontSize : fallback.fontSize;
    target.lineHeight = setting?.lineHeight > 0 ? setting.lineHeight : fallback.lineHeight;
    target.fontFamily = setting ? font[setting.weight] ?? fallback.fontFamily : fallback.fontFamily;
  }
  setTextScale(config.typography.scale);

  Object.assign(space, themeDefaults.space, config.layout.space);
  Object.assign(radius, themeDefaults.radius, config.layout.radius);
  liveLayout.GUTTER = config.layout.gutter;
  liveLayout.SCREEN_MAX_WIDTH = config.layout.maxWidth;
  liveLayout.TAB_BAR_HEIGHT = config.layout.tabBarHeight;
  liveLayout.TOUCH_SIZE = config.layout.touchSize;

  bumpTheme();
}

/* ------------------------------------------------------------------ *
 * Photos
 * ------------------------------------------------------------------ */

function applyScenes(config: AppConfig): void {
  const all = scenes as Record<string, Scene>;
  for (const [key, original] of Object.entries(SCENE_ORIGINALS)) {
    const scene = all[key];
    if (!scene) continue;
    Object.assign(scene, original);
    const override = config.media.sceneOverrides[key];
    const source = override?.image ? imageSource(override.image) : undefined;
    if (override && source) {
      scene.source = source;
      scene.alt = override.alt || original.alt;
      scene.credit = override.credit;
    }
  }
}

function sceneFor(ref: string, alt: string, credit: string): Scene {
  const key = ref.startsWith('scene:') ? ref.slice(6) : '';
  const bundled = key ? (scenes as Record<string, Scene>)[key] : undefined;
  // A bundled scene is shared by reference, so a later override of that scene
  // reaches the remedy too.
  if (bundled) return bundled;
  return { source: imageSource(ref) ?? { uri: '' }, alt, credit };
}

/* ------------------------------------------------------------------ *
 * Content
 * ------------------------------------------------------------------ */

function applyCatalogue(config: AppConfig): void {
  replace(SERVICE_GROUPS, config.services.groups.map((group) => ({ ...group })));
  replace(
    SERVICES,
    config.services.items
      .filter((item) => !item.hidden)
      .map(
        (item): Service => ({
          id: item.id,
          href: item.href,
          name: item.name,
          np: item.np,
          tagline: item.tagline,
          icon: item.icon as Service['icon'],
          group: item.group,
          needsBirth: item.needsBirth || undefined,
          needsTime: item.needsTime || undefined,
          badge: item.badge || undefined,
        }),
      ),
  );

  const { astrologers } = config;
  const listed = (listing: AstrologerRecord['listings'][number]) =>
    astrologers.roster.filter((record) => record.listings.includes(listing)).map(toAstrologer);

  Object.assign(aiAstrologer, {
    name: astrologers.ai.name,
    photo: imageUri(astrologers.ai.photo),
    skills: astrologers.ai.skills,
    languages: astrologers.ai.languages,
    about: astrologers.ai.about,
  });

  replace(featuredAstrologers, listed('featured'));
  replace(chatAstrologers, [...(astrologers.ai.enabled ? [aiAstrologer] : []), ...listed('chat')]);
  replace(callAstrologers, listed('call'));
  replace(
    directoryFilters as unknown as { id: string; label: string }[],
    astrologers.filters.map((filter) => ({ ...filter })),
  );

  Object.assign(ongoingSession, {
    id: astrologers.ongoing.id,
    name: astrologers.ongoing.name,
    photo: imageUri(astrologers.ongoing.photo),
    portrait: imageUri(astrologers.ongoing.photo),
    status: astrologers.ongoing.status,
    verified: astrologers.ongoing.verified,
  });

  const humans = chatAstrologers.filter((astrologer) => !astrologer.ai);
  const chosen =
    humans.find((astrologer) => astrologer.id === astrologers.freeMinute.astrologerId) ??
    [...humans].sort(
      (a, b) =>
        (b.rating ?? 0) - (a.rating ?? 0) || (b.experience ?? 0) - (a.experience ?? 0),
    )[0];
  if (chosen) {
    Object.assign(topNearbyAstrologer, chosen, {
      city: astrologers.freeMinute.city,
      distance: astrologers.freeMinute.distance,
    });
  }

  replace(
    remedyServices as unknown as unknown[],
    config.remedies
      .filter((remedy) => !remedy.hidden)
      .map((remedy) => ({
        id: remedy.id,
        title: remedy.title,
        description: remedy.description,
        image: sceneFor(remedy.image, remedy.imageAlt || remedy.title, remedy.imageCredit),
        price: remedy.price,
        lead: remedy.lead,
        includes: [...remedy.includes],
      })),
  );
}

function applyWords(config: AppConfig): void {
  setStringOverrides(config.content.strings);
  replace(quickPrompts, [...config.content.chatPrompts]);
  replace(babaPrompts, [...config.content.babaPrompts]);
  replace(astroReplies, config.content.cannedReplies.length ? [...config.content.cannedReplies] : ['…']);
  replace(languageOptions, [...config.content.languages]);

  replace(
    quickCategories as unknown as { id: string; label: string; icon: string; href: string }[],
    config.home.quickLinks.map((link) => ({ ...link })),
  );
  replace(
    profileGroups as unknown as { title: string; items: unknown[] }[],
    config.navigation.profileMenu.map((group) => ({
      title: group.title,
      items: group.items.map((item) => ({ ...item })),
    })),
  );
}

/**
 * Everything, in one go. Safe to call repeatedly: every step starts from the
 * shipped defaults or replaces a whole list, so nothing from an earlier
 * config survives into a later one.
 */
export function applyConfig(config: AppConfig): void {
  setLiveConfig(config);
  applyTheme(config);
  applyScenes(config);
  applyCatalogue(config);
  applyWords(config);
  setScreenRules(config.screens);
}
