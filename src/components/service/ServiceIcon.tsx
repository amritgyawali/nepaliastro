import React from 'react';

import { AppIcon } from '@/config/icons';
import type { IconProps } from '@/icons';

/**
 * A service's icon, by the name the catalogue (or the dashboard) gives it.
 * The services draw from the same set as every other icon in the app, so a
 * service and a shortcut to it can never disagree.
 */
export function ServiceIcon({ name, ...props }: IconProps & { name: string }) {
  return <AppIcon name={name} {...props} />;
}
