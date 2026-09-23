/**
 * Who on the team may do what.
 *
 * Permissions are grouped by the part of the app they cover, and most parts
 * come as a pair: `.view` to open it, `.edit` to change the draft. Publishing
 * is its own permission, so an editor can prepare a change and an admin can
 * be the one to send it live.
 */

export type Permission =
  | 'dashboard.view'
  | 'branding.view'
  | 'branding.edit'
  | 'design.view'
  | 'design.edit'
  | 'navigation.view'
  | 'navigation.edit'
  | 'screens.view'
  | 'screens.edit'
  | 'catalog.view'
  | 'catalog.edit'
  | 'media.view'
  | 'media.edit'
  | 'content.view'
  | 'content.edit'
  | 'engagement.view'
  | 'engagement.edit'
  | 'ai.view'
  | 'ai.edit'
  | 'analytics.view'
  | 'team.view'
  | 'team.manage'
  | 'roles.manage'
  | 'audit.view'
  | 'publish.preview'
  | 'publish.run'
  | 'publish.rollback'
  | 'system.manage';

export type PermissionGroup = {
  id: string;
  label: string;
  note: string;
  permissions: { id: Permission; label: string }[];
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'dashboard',
    label: 'Overview',
    note: 'The dashboard home and the tools list',
    permissions: [{ id: 'dashboard.view', label: 'Open' }],
  },
  {
    id: 'branding',
    label: 'Branding',
    note: 'Name, logo, contact details, currency',
    permissions: [
      { id: 'branding.view', label: 'View' },
      { id: 'branding.edit', label: 'Edit' },
    ],
  },
  {
    id: 'design',
    label: 'Design',
    note: 'Colours, type and layout',
    permissions: [
      { id: 'design.view', label: 'View' },
      { id: 'design.edit', label: 'Edit' },
    ],
  },
  {
    id: 'navigation',
    label: 'Home and navigation',
    note: 'Home sections, shortcuts, tabs, profile menu',
    permissions: [
      { id: 'navigation.view', label: 'View' },
      { id: 'navigation.edit', label: 'Edit' },
    ],
  },
  {
    id: 'screens',
    label: 'Screens and pages',
    note: 'Turning screens off, custom pages, features',
    permissions: [
      { id: 'screens.view', label: 'View' },
      { id: 'screens.edit', label: 'Edit' },
    ],
  },
  {
    id: 'catalog',
    label: 'Catalogue',
    note: 'Services, astrologers and remedies',
    permissions: [
      { id: 'catalog.view', label: 'View' },
      { id: 'catalog.edit', label: 'Edit' },
    ],
  },
  {
    id: 'media',
    label: 'Media',
    note: 'The picture library and bundled photos',
    permissions: [
      { id: 'media.view', label: 'View' },
      { id: 'media.edit', label: 'Edit' },
    ],
  },
  {
    id: 'content',
    label: 'Text',
    note: 'Screen text, prompts, languages',
    permissions: [
      { id: 'content.view', label: 'View' },
      { id: 'content.edit', label: 'Edit' },
    ],
  },
  {
    id: 'engagement',
    label: 'Announcements',
    note: 'Banners, popup, notice bar, maintenance',
    permissions: [
      { id: 'engagement.view', label: 'View' },
      { id: 'engagement.edit', label: 'Edit' },
    ],
  },
  {
    id: 'ai',
    label: 'AI astrologer',
    note: 'Model, tone and instructions',
    permissions: [
      { id: 'ai.view', label: 'View' },
      { id: 'ai.edit', label: 'Edit' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    note: 'Usage on this device',
    permissions: [{ id: 'analytics.view', label: 'View' }],
  },
  {
    id: 'publish',
    label: 'Publishing',
    note: 'Sending the draft live',
    permissions: [
      { id: 'publish.preview', label: 'Preview' },
      { id: 'publish.run', label: 'Publish' },
      { id: 'publish.rollback', label: 'Roll back' },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    note: 'Accounts for the people who run the app',
    permissions: [
      { id: 'team.view', label: 'View' },
      { id: 'team.manage', label: 'Manage' },
    ],
  },
  {
    id: 'roles',
    label: 'Roles',
    note: 'What each role may do',
    permissions: [{ id: 'roles.manage', label: 'Manage' }],
  },
  {
    id: 'audit',
    label: 'Activity log',
    note: 'Who changed what, and when',
    permissions: [{ id: 'audit.view', label: 'View' }],
  },
  {
    id: 'system',
    label: 'System',
    note: 'Import, export, sync, storage, reset',
    permissions: [{ id: 'system.manage', label: 'Manage' }],
  },
];

export const ALL_PERMISSIONS: Permission[] = PERMISSION_GROUPS.flatMap((group) =>
  group.permissions.map((permission) => permission.id),
);

const VIEW_ALL: Permission[] = ALL_PERMISSIONS.filter((permission) => permission.endsWith('.view'));

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  /** Shipped with the app: can be copied but not renamed or deleted. */
  builtIn: boolean;
  color: string;
};

export const OWNER_ROLE_ID = 'owner';

export const BUILT_IN_ROLES: Role[] = [
  {
    id: OWNER_ROLE_ID,
    name: 'Owner',
    description: 'Everything, including who else can do what. There is always at least one.',
    permissions: [...ALL_PERMISSIONS],
    builtIn: true,
    color: '#C9A227',
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Everything except changing what the roles allow.',
    permissions: ALL_PERMISSIONS.filter((permission) => permission !== 'roles.manage'),
    builtIn: true,
    color: '#E0692A',
  },
  {
    id: 'designer',
    name: 'Designer',
    description: 'The look of the app: brand, colours, type, layout, navigation and pictures.',
    permissions: [
      'dashboard.view',
      'branding.view', 'branding.edit',
      'design.view', 'design.edit',
      'navigation.view', 'navigation.edit',
      'screens.view', 'screens.edit',
      'media.view', 'media.edit',
      'content.view',
      'publish.preview',
    ],
    builtIn: true,
    color: '#0F8A8A',
  },
  {
    id: 'editor',
    name: 'Content editor',
    description: 'What the app says and offers: services, astrologers, remedies, text and pages.',
    permissions: [
      'dashboard.view',
      'catalog.view', 'catalog.edit',
      'content.view', 'content.edit',
      'screens.view', 'screens.edit',
      'media.view', 'media.edit',
      'engagement.view',
      'publish.preview',
    ],
    builtIn: true,
    color: '#2E8B57',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Banners, the launch popup and the notice bar, and publishing them.',
    permissions: [
      'dashboard.view',
      'engagement.view', 'engagement.edit',
      'content.view',
      'media.view', 'media.edit',
      'analytics.view',
      'publish.preview', 'publish.run',
    ],
    builtIn: true,
    color: '#D6336C',
  },
  {
    id: 'support',
    name: 'Support',
    description: 'Astrologer availability and prices, and the activity log.',
    permissions: ['dashboard.view', 'catalog.view', 'catalog.edit', 'analytics.view', 'audit.view'],
    builtIn: true,
    color: '#1C7ED6',
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Can look at every part of the dashboard and change nothing.',
    permissions: ['dashboard.view', ...VIEW_ALL],
    builtIn: true,
    color: '#868E96',
  },
];

/** `.edit` implies `.view`; `team.manage` implies `team.view`. */
export function expand(permissions: Permission[]): Set<Permission> {
  const out = new Set<Permission>(permissions);
  for (const permission of permissions) {
    if (permission.endsWith('.edit')) out.add(permission.replace('.edit', '.view') as Permission);
    if (permission === 'team.manage') out.add('team.view');
    if (permission === 'publish.run') out.add('publish.preview');
  }
  return out;
}
