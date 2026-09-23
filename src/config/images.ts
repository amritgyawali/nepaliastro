import { Image, type ImageSourcePropType } from 'react-native';

import { scenes } from '@/data/images';

import type { ImageRef } from './schema';

/** The bundled scene an `ImageRef` names, if it names one. */
export function sceneKeyOf(ref: ImageRef): string | null {
  return ref.startsWith('scene:') ? ref.slice(6) : null;
}

/** An `ImageRef` as something `<Image source>` accepts. */
export function imageSource(ref: ImageRef): ImageSourcePropType | undefined {
  if (!ref) return undefined;
  const key = sceneKeyOf(ref);
  if (key) return (scenes as Record<string, { source: ImageSourcePropType }>)[key]?.source;
  return { uri: ref };
}

/**
 * An `ImageRef` as a plain URI string, for components such as `Avatar` that
 * take a `uri`. A bundled scene resolves to wherever the bundler put it.
 */
export function imageUri(ref: ImageRef): string {
  if (!ref) return '';
  const key = sceneKeyOf(ref);
  if (!key) return ref;
  const source = imageSource(ref);
  if (!source) return '';
  if (typeof source === 'string') return source;
  if (typeof source === 'object' && !Array.isArray(source) && 'uri' in source && source.uri) {
    return source.uri;
  }
  const resolve = (Image as unknown as {
    resolveAssetSource?: (s: ImageSourcePropType) => { uri?: string } | null;
  }).resolveAssetSource;
  return resolve?.(source)?.uri ?? '';
}

/** True for a link that leaves the app. */
export function isExternal(href: string): boolean {
  return /^(https?:|mailto:|tel:)/i.test(href.trim());
}
