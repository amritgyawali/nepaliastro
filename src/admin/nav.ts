import type { ConfigArea } from '@/config/schema';

import type { Permission } from './auth/rbac';
import type { AdminIconName } from './ui/icons';

/**
 * The dashboard's sections, in sidebar order.
 *
 * `np` is the section's name in Nepali, shown above its title — the same
 * pairing the app uses for its services. `areas` are the parts of the config
 * the section edits, so the sidebar can mark a section with unpublished
 * changes.
 */
export type SectionId =
  | 'overview'
  | 'tools'
  | 'branding'
  | 'theme'
  | 'design'
  | 'navigation'
  | 'screens'
  | 'services'
  | 'astrologers'
  | 'remedies'
  | 'media'
  | 'content'
  | 'engagement'
  | 'ai'
  | 'analytics'
  | 'publish'
  | 'team'
  | 'roles'
  | 'audit'
  | 'system'
  | 'account';

export type Section = {
  id: SectionId;
  label: string;
  np: string;
  icon: AdminIconName;
  href: string;
  /** Needed to open the section at all. */
  permission: Permission | null;
  group: 'Workspace' | 'Look' | 'Content' | 'Reach' | 'Control';
  description: string;
  areas: ConfigArea[];
};

export const SECTIONS: Section[] = [
  { id: 'overview', label: 'Overview', np: 'सारांश', icon: 'overview', href: '/admin', permission: 'dashboard.view', group: 'Workspace', description: 'How the app is doing, and what is waiting to go live', areas: [] },
  { id: 'tools', label: 'All tools', np: 'औजार', icon: 'tools', href: '/admin/tools', permission: 'dashboard.view', group: 'Workspace', description: 'Every tool in the dashboard, searchable', areas: [] },

  { id: 'branding', label: 'Branding', np: 'पहिचान', icon: 'flag', href: '/admin/branding', permission: 'branding.view', group: 'Look', description: 'Name, logo, contact details and currency', areas: ['branding'] },
  { id: 'theme', label: 'Colours', np: 'रङ', icon: 'palette', href: '/admin/theme', permission: 'design.view', group: 'Look', description: 'The palette, presets, dark theme and contrast', areas: ['theme'] },
  { id: 'design', label: 'Type and layout', np: 'अक्षर र बनोट', icon: 'type', href: '/admin/design', permission: 'design.view', group: 'Look', description: 'Type scale, spacing, corners and screen sizes', areas: ['typography', 'layout'] },
  { id: 'navigation', label: 'Home and menus', np: 'गृह र मेनु', icon: 'home', href: '/admin/navigation', permission: 'navigation.view', group: 'Look', description: 'Home screen order, shortcuts, tabs and the profile menu', areas: ['home', 'navigation'] },
  { id: 'screens', label: 'Screens and pages', np: 'पृष्ठ', icon: 'phone', href: '/admin/screens', permission: 'screens.view', group: 'Look', description: 'Turn screens off, rename them, and build new pages', areas: ['screens', 'pages', 'features'] },

  { id: 'services', label: 'Services', np: 'सेवा', icon: 'sparkle', href: '/admin/services', permission: 'catalog.view', group: 'Content', description: 'The twenty services: names, order, badges, visibility', areas: ['services'] },
  { id: 'astrologers', label: 'Astrologers', np: 'ज्योतिषी', icon: 'moon', href: '/admin/astrologers', permission: 'catalog.view', group: 'Content', description: 'Profiles, prices, availability and AI Baba', areas: ['astrologers'] },
  { id: 'remedies', label: 'Remedies', np: 'उपाय', icon: 'diyo', href: '/admin/remedies', permission: 'catalog.view', group: 'Content', description: 'Poojas, gemstones and sessions on offer', areas: ['remedies'] },
  { id: 'media', label: 'Media', np: 'तस्बिर', icon: 'image', href: '/admin/media', permission: 'media.view', group: 'Content', description: 'Uploads, bundled photographs and portraits', areas: ['media'] },
  { id: 'content', label: 'Text', np: 'शब्द', icon: 'text', href: '/admin/content', permission: 'content.view', group: 'Content', description: 'Screen text, chat prompts and languages', areas: ['content'] },

  { id: 'engagement', label: 'Announcements', np: 'सूचना', icon: 'megaphone', href: '/admin/engagement', permission: 'engagement.view', group: 'Reach', description: 'Banners, the launch popup, notices and maintenance', areas: ['engagement'] },
  { id: 'ai', label: 'AI astrologer', np: 'एआई बाबा', icon: 'aiBaba', href: '/admin/ai', permission: 'ai.view', group: 'Reach', description: 'Model, tone and instructions for Baba and the readings', areas: ['ai'] },
  { id: 'analytics', label: 'Analytics', np: 'तथ्याङ्क', icon: 'chart', href: '/admin/analytics', permission: 'analytics.view', group: 'Reach', description: 'Screens opened and app starts on this device', areas: [] },

  { id: 'publish', label: 'Publish', np: 'प्रकाशन', icon: 'send', href: '/admin/publish', permission: 'publish.preview', group: 'Control', description: 'Review the draft, preview it, send it live, roll back', areas: [] },
  { id: 'team', label: 'Team', np: 'टोली', icon: 'users', href: '/admin/team', permission: 'team.view', group: 'Control', description: 'Who can sign in to this dashboard', areas: [] },
  { id: 'roles', label: 'Roles', np: 'भूमिका', icon: 'key', href: '/admin/roles', permission: 'team.view', group: 'Control', description: 'What each role is allowed to do', areas: [] },
  { id: 'audit', label: 'Activity', np: 'गतिविधि', icon: 'history', href: '/admin/audit', permission: 'audit.view', group: 'Control', description: 'Every change, sign-in and publish', areas: [] },
  { id: 'system', label: 'System', np: 'प्रणाली', icon: 'sliders', href: '/admin/system', permission: 'system.manage', group: 'Control', description: 'Security rules, import, export, sync and storage', areas: [] },

  { id: 'account', label: 'Your account', np: 'खाता', icon: 'user', href: '/admin/account', permission: null, group: 'Control', description: 'Your details and password', areas: [] },
];

export const SECTION_GROUPS: { id: Section['group']; label: string }[] = [
  { id: 'Workspace', label: '' },
  { id: 'Look', label: 'Look' },
  { id: 'Content', label: 'Content' },
  { id: 'Reach', label: 'Reach' },
  { id: 'Control', label: 'Control' },
];

export function sectionById(id: SectionId): Section {
  return SECTIONS.find((section) => section.id === id)!;
}

/** The section a pathname belongs to. */
export function sectionForPath(pathname: string): Section {
  if (pathname.startsWith('/admin/page/')) return sectionById('screens');
  const match = SECTIONS.filter((s) => s.href !== '/admin').find((s) => pathname === s.href || pathname.startsWith(`${s.href}/`));
  return match ?? sectionById('overview');
}

/**
 * The twelve houses of the kundli in the corner, and the parts of the app
 * each one lights up for.
 */
export const HOUSE_AREAS: { label: string; areas: ConfigArea[] }[] = [
  { label: 'Branding', areas: ['branding'] },
  { label: 'Colours', areas: ['theme'] },
  { label: 'Type and layout', areas: ['typography', 'layout'] },
  { label: 'Home and menus', areas: ['home', 'navigation'] },
  { label: 'Screens and pages', areas: ['screens', 'pages', 'features'] },
  { label: 'Services', areas: ['services'] },
  { label: 'Astrologers', areas: ['astrologers'] },
  { label: 'Remedies', areas: ['remedies'] },
  { label: 'Media', areas: ['media'] },
  { label: 'Text', areas: ['content'] },
  { label: 'Announcements', areas: ['engagement'] },
  { label: 'AI astrologer', areas: ['ai'] },
];
