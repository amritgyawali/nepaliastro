import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

/**
 * Picking a picture off the phone (or the computer, on web) and making it
 * small enough to keep inside the config.
 *
 * An uploaded picture is stored in the config itself as a `data:` URI, so it
 * travels with an export or a sync and needs no image host. That only works
 * if it is small: every upload is scaled down and re-encoded before it is
 * kept, and the dashboard shows what each one weighs.
 */

export type PickedImage = { uri: string; bytes: number; width: number; height: number };

export type PickOptions = {
  /** Longest side after scaling, in pixels. */
  maxSize?: number;
  /** PNG keeps transparency — for logos. JPEG is far smaller for photos. */
  format?: 'jpeg' | 'png';
  quality?: number;
  /** Square crop in the system picker, where the platform offers one. */
  square?: boolean;
};

/** Roughly how many bytes a `data:` URI holds. */
export function dataUriBytes(uri: string): number {
  const comma = uri.indexOf(',');
  if (!uri.startsWith('data:') || comma === -1) return 0;
  return Math.round(((uri.length - comma - 1) * 3) / 4);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export class PickError extends Error {}

export async function pickImage({
  maxSize = 1024,
  format = 'jpeg',
  quality = 0.78,
  square,
}: PickOptions = {}): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync().catch(() => null);
  if (permission && !permission.granted && permission.canAskAgain === false) {
    throw new PickError('Photo access is turned off for this app. Turn it on in the phone’s settings.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: !!square,
    aspect: square ? [1, 1] : undefined,
    quality: 1,
  });
  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  const longest = Math.max(asset.width || 0, asset.height || 0);
  const context = ImageManipulator.manipulate(asset.uri);
  if (longest > maxSize) {
    if ((asset.width || 0) >= (asset.height || 0)) context.resize({ width: maxSize });
    else context.resize({ height: maxSize });
  }
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({
    base64: true,
    compress: quality,
    format: format === 'png' ? SaveFormat.PNG : SaveFormat.JPEG,
  });
  if (!saved.base64) throw new PickError('The picture could not be read.');

  const uri = `data:image/${format};base64,${saved.base64}`;
  return { uri, bytes: dataUriBytes(uri), width: saved.width, height: saved.height };
}
