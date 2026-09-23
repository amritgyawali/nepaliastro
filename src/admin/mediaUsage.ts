import type { AppConfig, ImageRef } from '@/config/schema';

/** Every place a config shows a picture, and what is there. */
export type ImageUse = { ref: ImageRef; where: string };

export function imageUses(config: AppConfig): ImageUse[] {
  const out: ImageUse[] = [];
  const add = (ref: ImageRef, where: string) => {
    if (ref) out.push({ ref, where });
  };
  add(config.branding.logo, 'Logo');
  for (const r of config.astrologers.roster) add(r.photo, `Portrait: ${r.name}`);
  add(config.astrologers.ai.photo, `Portrait: ${config.astrologers.ai.name}`);
  add(config.astrologers.ongoing.photo, '“Chat in progress” card');
  for (const r of config.remedies) add(r.image, `Remedy: ${r.title}`);
  for (const b of config.engagement.banners) add(b.image, `Banner: ${b.title}`);
  add(config.engagement.popup.image, 'Launch popup');
  for (const page of config.pages) {
    for (const block of page.blocks) if (block.type === 'image') add(block.image, `Page: ${page.title}`);
  }
  for (const [key, override] of Object.entries(config.media.sceneOverrides)) add(override.image, `In place of the ${key} photo`);
  return out;
}

/** The same config with every use of `from` pointing at `to` instead. */
export function replaceImage(config: AppConfig, from: ImageRef, to: ImageRef): AppConfig {
  const swap = (ref: ImageRef) => (ref === from ? to : ref);
  return {
    ...config,
    branding: { ...config.branding, logo: swap(config.branding.logo) },
    astrologers: {
      ...config.astrologers,
      roster: config.astrologers.roster.map((r) => ({ ...r, photo: swap(r.photo) })),
      ai: { ...config.astrologers.ai, photo: swap(config.astrologers.ai.photo) },
      ongoing: { ...config.astrologers.ongoing, photo: swap(config.astrologers.ongoing.photo) },
    },
    remedies: config.remedies.map((r) => ({ ...r, image: swap(r.image) })),
    engagement: {
      ...config.engagement,
      banners: config.engagement.banners.map((b) => ({ ...b, image: swap(b.image) })),
      popup: { ...config.engagement.popup, image: swap(config.engagement.popup.image) },
    },
    pages: config.pages.map((page) => ({
      ...page,
      blocks: page.blocks.map((block) => (block.type === 'image' ? { ...block, image: swap(block.image) } : block)),
    })),
    media: {
      ...config.media,
      sceneOverrides: Object.fromEntries(
        Object.entries(config.media.sceneOverrides).map(([key, o]) => [key, { ...o, image: swap(o.image) }]),
      ),
    },
  };
}
