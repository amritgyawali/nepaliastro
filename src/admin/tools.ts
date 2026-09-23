import type { SectionId } from './nav';

/**
 * Every tool in the dashboard, for the Tools page and the search palette.
 *
 * Each `id` is the id of a panel on its section's page; opening a tool goes
 * to that page and scrolls the panel into view. `keywords` are the other
 * words someone might search for it by.
 */
export type Tool = {
  id: string;
  section: SectionId;
  title: string;
  description: string;
  keywords?: string;
};

export const TOOLS: Tool[] = [
  /* Overview */
  { id: 'kpis', section: 'overview', title: 'Today at a glance', description: 'Screen views, app starts, drafts waiting and team size', keywords: 'kpi stats numbers summary' },
  { id: 'traffic', section: 'overview', title: 'Screen views, last 14 days', description: 'A bar for each day', keywords: 'chart traffic usage' },
  { id: 'top-screens', section: 'overview', title: 'Most opened screens', description: 'This week’s ranking', keywords: 'popular top' },
  { id: 'pending', section: 'overview', title: 'Waiting to go live', description: 'The parts of the app with unpublished changes', keywords: 'draft changes unpublished kundli' },
  { id: 'activity', section: 'overview', title: 'Recent team activity', description: 'The last things the team changed', keywords: 'audit log recent' },
  { id: 'health', section: 'overview', title: 'Health checks', description: 'Contrast, missing text, empty lists and switched-off screens', keywords: 'problems warnings issues' },
  { id: 'shortcuts', section: 'overview', title: 'Quick actions', description: 'The things done most often, one tap away', keywords: 'shortcut' },
  { id: 'command-palette', section: 'tools', title: 'Search every tool', description: 'Find any tool by what it does', keywords: 'command palette find' },

  /* Branding */
  { id: 'app-name', section: 'branding', title: 'App name and tagline', description: 'What the app is called on its own screens', keywords: 'title name' },
  { id: 'logo', section: 'branding', title: 'Logo', description: 'Upload a logo or pick a picture', keywords: 'icon brand mark image' },
  { id: 'logo-mark', section: 'branding', title: 'Monogram and shape', description: 'Letters shown when there is no logo, and the mark’s shape', keywords: 'initials badge' },
  { id: 'home-logo', section: 'branding', title: 'Logo on the home screen', description: 'Show the mark beside the greeting', keywords: 'header' },
  { id: 'contact', section: 'branding', title: 'Support contact', description: 'Email, phone and website on the profile screen', keywords: 'help email phone' },
  { id: 'socials', section: 'branding', title: 'Social links', description: 'Facebook, Instagram, YouTube, TikTok and X', keywords: 'social media' },
  { id: 'currency', section: 'branding', title: 'Currency and prices', description: 'How rates and prices are written', keywords: 'money usd npr rupees price format' },
  { id: 'footer', section: 'branding', title: 'Footer line', description: 'A small line at the foot of the profile screen', keywords: 'copyright' },
  { id: 'brand-preview', section: 'branding', title: 'Brand preview', description: 'The mark and name together, as the app shows them', keywords: 'lockup' },

  /* Colours */
  { id: 'brand-color', section: 'theme', title: 'Brand colour', description: 'One colour; its shades are worked out for you', keywords: 'primary accent saffron' },
  { id: 'theme-presets', section: 'theme', title: 'Theme presets', description: 'Ten complete palettes to start from', keywords: 'template palette' },
  { id: 'color-tokens', section: 'theme', title: 'Every colour', description: 'Each of the app’s colour tokens, one by one', keywords: 'tokens hex surface text border' },
  { id: 'status-colors', section: 'theme', title: 'Status colours', description: 'Online, success and error colours', keywords: 'green red success error' },
  { id: 'dark-mode', section: 'theme', title: 'Dark theme', description: 'Turn the current palette dark', keywords: 'night dark mode' },
  { id: 'contrast', section: 'theme', title: 'Contrast check', description: 'Is every text colour readable on its background?', keywords: 'wcag accessibility a11y readable' },
  { id: 'harmony', section: 'theme', title: 'Colour ideas', description: 'Colours that go with your brand colour', keywords: 'harmony complementary analogous triadic' },
  { id: 'shuffle', section: 'theme', title: 'Surprise me', description: 'A random brand colour with everything derived', keywords: 'random generate' },
  { id: 'palette-io', section: 'theme', title: 'Copy or paste a palette', description: 'Move a palette between apps as text', keywords: 'import export json' },
  { id: 'theme-preview', section: 'theme', title: 'Preview', description: 'The app’s main pieces in the draft colours', keywords: 'mockup phone' },
  { id: 'theme-reset', section: 'theme', title: 'Reset colours', description: 'Back to the shipped saffron palette', keywords: 'default restore' },

  /* Type and layout */
  { id: 'type-presets', section: 'design', title: 'Type presets', description: 'Compact, relaxed, large and largest', keywords: 'font size' },
  { id: 'text-scale', section: 'design', title: 'Text size', description: 'Scales every piece of text in the app', keywords: 'font scale bigger smaller accessibility' },
  { id: 'type-steps', section: 'design', title: 'Type scale', description: 'Size and line height of each text style', keywords: 'font sizes heading body' },
  { id: 'font-weights', section: 'design', title: 'Weights', description: 'How bold each text style is', keywords: 'bold semibold' },
  { id: 'type-specimen', section: 'design', title: 'Specimen', description: 'Every text style, in English and Nepali', keywords: 'preview fonts mukta' },
  { id: 'density', section: 'design', title: 'Spacing density', description: 'Compact, comfortable or spacious', keywords: 'padding margin' },
  { id: 'space-scale', section: 'design', title: 'Spacing steps', description: 'The six spacing values everything uses', keywords: 'padding margin gap' },
  { id: 'corners', section: 'design', title: 'Corner radius', description: 'Sharp, soft or round corners', keywords: 'border radius rounded' },
  { id: 'gutter', section: 'design', title: 'Screen edges', description: 'The margin at the left and right of every screen', keywords: 'padding margin gutter' },
  { id: 'max-width', section: 'design', title: 'Width on tablets and computers', description: 'How wide the app may grow on a large screen', keywords: 'desktop tablet responsive' },
  { id: 'tab-bar-height', section: 'design', title: 'Tab bar height', description: 'The height of the bottom tabs', keywords: 'bottom navigation' },
  { id: 'touch-size', section: 'design', title: 'Touch target size', description: 'The smallest a button may be', keywords: 'accessibility tap' },
  { id: 'layout-preview', section: 'design', title: 'Layout preview', description: 'Spacing and corners on a sample screen', keywords: 'mockup' },

  /* Home and menus */
  { id: 'home-order', section: 'navigation', title: 'Home screen order', description: 'Move and hide the home screen’s sections', keywords: 'arrange sections reorder visibility' },
  { id: 'home-titles', section: 'navigation', title: 'Home section titles', description: 'Rename the headings on the home screen', keywords: 'rename heading' },
  { id: 'home-search', section: 'navigation', title: 'Home search bar', description: 'Show it or hide it, and what it says', keywords: 'placeholder' },
  { id: 'quick-links', section: 'navigation', title: 'Shortcuts', description: 'The round shortcuts under the search bar', keywords: 'quick categories icons' },
  { id: 'tabs', section: 'navigation', title: 'Bottom tabs', description: 'Order, names, icons and which tabs show', keywords: 'tab bar navigation menu' },
  { id: 'landing-tab', section: 'navigation', title: 'First screen', description: 'The tab the app opens on', keywords: 'start landing default' },
  { id: 'profile-menu', section: 'navigation', title: 'Profile menu', description: 'The groups and rows on the profile screen', keywords: 'settings menu links' },

  /* Screens and pages */
  { id: 'screen-switches', section: 'screens', title: 'Turn screens on or off', description: 'Switch any screen off with a message in its place', keywords: 'disable enable hide feature flag' },
  { id: 'screen-titles', section: 'screens', title: 'Screen headings and messages', description: 'Rename a screen, or say why it is off', keywords: 'title rename' },
  { id: 'pages', section: 'screens', title: 'Your pages', description: 'New screens of your own: about, FAQ, offers', keywords: 'custom page cms create' },
  { id: 'page-templates', section: 'screens', title: 'Page templates', description: 'Start a page from About, FAQ, Terms, Privacy or Contact', keywords: 'template' },
  { id: 'features', section: 'screens', title: 'Feature switches', description: 'Pull to refresh, the session card, directory filters', keywords: 'toggle flags' },
  { id: 'open-screen', section: 'screens', title: 'Open any screen', description: 'Jump into the app at a particular screen', keywords: 'route navigate test' },
  { id: 'page-blocks', section: 'screens', title: 'Page builder', description: 'Headings, text, pictures, buttons, FAQs and more', keywords: 'blocks editor content' },
  { id: 'page-preview', section: 'screens', title: 'Page preview', description: 'The page as it will look in the app', keywords: 'preview' },
  { id: 'page-settings', section: 'screens', title: 'Page address and publishing', description: 'Title, address and whether the page is live', keywords: 'slug url' },

  /* Services */
  { id: 'service-list', section: 'services', title: 'Services', description: 'Names, taglines, icons, links and order', keywords: 'edit rename reorder' },
  { id: 'service-visibility', section: 'services', title: 'Show and hide services', description: 'Take a service off the Services tab', keywords: 'hide visibility' },
  { id: 'service-badges', section: 'services', title: 'Badges', description: 'Mark a service “New” or “Popular”', keywords: 'label tag new popular' },
  { id: 'service-groups', section: 'services', title: 'Service groups', description: 'The four headings, in English and Nepali', keywords: 'categories' },

  /* Astrologers */
  { id: 'roster', section: 'astrologers', title: 'Astrologers', description: 'Add, edit and remove astrologer profiles', keywords: 'profiles people consultants' },
  { id: 'availability', section: 'astrologers', title: 'Who is online', description: 'Switch astrologers on and off in one place', keywords: 'online offline status' },
  { id: 'bulk-pricing', section: 'astrologers', title: 'Change prices in bulk', description: 'Raise or lower every rate by a percentage', keywords: 'rates discount money' },
  { id: 'ai-card', section: 'astrologers', title: 'AI Baba’s card', description: 'His name, picture and description in the lists', keywords: 'ai baba bot' },
  { id: 'directory-filters', section: 'astrologers', title: 'Directory filters', description: 'The chips at the top of Chat and Call', keywords: 'speciality tarot palmistry' },
  { id: 'ongoing-session', section: 'astrologers', title: '“Chat in progress” card', description: 'The resume card on the directories', keywords: 'session pill' },
  { id: 'free-minute', section: 'astrologers', title: 'Free first minute', description: 'The offer after onboarding, and who it is with', keywords: 'offer promo trial' },

  /* Remedies */
  { id: 'remedy-list', section: 'remedies', title: 'Remedies', description: 'Titles, photos, prices and what each includes', keywords: 'pooja gemstone healing' },
  { id: 'remedy-pricing', section: 'remedies', title: 'Remedy prices in bulk', description: 'Raise or lower every price by a percentage', keywords: 'money' },

  /* Media */
  { id: 'library', section: 'media', title: 'Picture library', description: 'Upload, rename and remove pictures', keywords: 'images photos upload gallery' },
  { id: 'bundled-photos', section: 'media', title: 'Photographs in the app', description: 'Swap any bundled photograph for another picture', keywords: 'festival remedy scenes replace' },
  { id: 'portraits', section: 'media', title: 'Astrologer portraits', description: 'Every portrait in one place', keywords: 'avatar photo' },
  { id: 'replace-everywhere', section: 'media', title: 'Replace a picture everywhere', description: 'Swap one picture for another wherever it appears', keywords: 'find replace image' },
  { id: 'media-cleanup', section: 'media', title: 'Unused pictures', description: 'Uploads nothing uses any more', keywords: 'clean delete unused' },
  { id: 'media-check', section: 'media', title: 'Check for broken pictures', description: 'Finds links that no longer load', keywords: 'broken 404 missing' },
  { id: 'media-storage', section: 'media', title: 'Space used by uploads', description: 'How much the uploads weigh', keywords: 'size storage bytes' },

  /* Text */
  { id: 'strings', section: 'content', title: 'Screen text', description: 'Headings, buttons and notes across the app', keywords: 'copy words labels translate' },
  { id: 'find-replace', section: 'content', title: 'Find and replace', description: 'Change a word everywhere at once', keywords: 'search replace bulk' },
  { id: 'chat-prompts', section: 'content', title: 'Chat suggestions', description: 'The tap-to-send questions above the chat box', keywords: 'prompts questions' },
  { id: 'baba-prompts', section: 'content', title: 'Baba’s openers', description: 'The suggestions in AI Baba’s chat', keywords: 'ai prompts' },
  { id: 'canned-replies', section: 'content', title: 'Demo replies', description: 'What a human astrologer says in the demo chat', keywords: 'responses' },
  { id: 'languages', section: 'content', title: 'Languages', description: 'The choices on the last onboarding question', keywords: 'onboarding language list' },
  { id: 'content-audit', section: 'content', title: 'Text check', description: 'Empty fields, and text too long for its space', keywords: 'lint validate missing' },

  /* Announcements */
  { id: 'banners', section: 'engagement', title: 'Home banners', description: 'Cards on the home screen, with dates and a button', keywords: 'promo offer carousel campaign' },
  { id: 'popup', section: 'engagement', title: 'Launch popup', description: 'A message shown once when the app opens', keywords: 'modal announcement' },
  { id: 'notice', section: 'engagement', title: 'Notice bar', description: 'One line across the top of the home screen', keywords: 'alert strip' },
  { id: 'maintenance', section: 'engagement', title: 'Maintenance mode', description: 'Close the app for a while, with a message', keywords: 'offline downtime closed' },
  { id: 'test-notification', section: 'engagement', title: 'Send a test notification', description: 'See how a notification lands on this phone', keywords: 'push notification' },
  { id: 'campaign-calendar', section: 'engagement', title: 'What is scheduled', description: 'Banners and popups by the dates they run', keywords: 'calendar schedule timeline' },

  /* AI */
  { id: 'ai-switch', section: 'ai', title: 'AI Baba on or off', description: 'List him in Chat, or take him out', keywords: 'enable disable ai' },
  { id: 'ai-model', section: 'ai', title: 'Model', description: 'Which Groq model writes the answers', keywords: 'llama groq llm' },
  { id: 'ai-tuning', section: 'ai', title: 'Tone and length', description: 'How varied and how long the answers are', keywords: 'temperature tokens creativity' },
  { id: 'ai-persona', section: 'ai', title: 'Extra instructions for Baba', description: 'Added to the end of his brief', keywords: 'prompt system persona' },
  { id: 'ai-readings', section: 'ai', title: 'Extra instructions for readings', description: 'Added to the five-hourly reading writer’s brief', keywords: 'prompt predictions' },
  { id: 'ai-key', section: 'ai', title: 'API key on this device', description: 'The Groq key this phone uses', keywords: 'groq key secret' },
  { id: 'ai-console', section: 'ai', title: 'Try it', description: 'Ask the model something with the draft settings', keywords: 'test playground console' },

  /* Analytics */
  { id: 'views', section: 'analytics', title: 'Screen views', description: 'Views per day over the period you choose', keywords: 'traffic chart' },
  { id: 'sessions', section: 'analytics', title: 'App starts', description: 'How often the app was opened', keywords: 'opens sessions launches' },
  { id: 'screen-table', section: 'analytics', title: 'Every screen, ranked', description: 'Views for each screen', keywords: 'table ranking' },
  { id: 'service-popularity', section: 'analytics', title: 'Services by use', description: 'Which of the twenty are opened most', keywords: 'popular' },
  { id: 'events', section: 'analytics', title: 'Recent activity on this device', description: 'The last screens and starts, in order', keywords: 'stream log' },
  { id: 'analytics-export', section: 'analytics', title: 'Export or reset', description: 'Download the counts as CSV, or start again', keywords: 'csv download clear' },

  /* Publish */
  { id: 'publish-now', section: 'publish', title: 'Publish', description: 'Send the draft live, with a note', keywords: 'release deploy go live' },
  { id: 'review', section: 'publish', title: 'Review changes', description: 'Every field that differs from what is live', keywords: 'diff compare changes' },
  { id: 'preview', section: 'publish', title: 'Preview in the app', description: 'Use the app with the draft before anyone else sees it', keywords: 'try test' },
  { id: 'schedule', section: 'publish', title: 'Schedule a publish', description: 'Send the draft live at a set time', keywords: 'later timer' },
  { id: 'history', section: 'publish', title: 'Version history', description: 'Everything published before, and rolling back', keywords: 'rollback revert undo versions' },
  { id: 'discard', section: 'publish', title: 'Discard the draft', description: 'Throw the draft away and start again from live', keywords: 'undo revert cancel' },

  /* Team and access */
  { id: 'members', section: 'team', title: 'Team members', description: 'Everyone who can sign in, with their role', keywords: 'users accounts staff' },
  { id: 'invite', section: 'team', title: 'Add someone', description: 'Create an account with a temporary password', keywords: 'invite new user' },
  { id: 'access-check', section: 'team', title: 'What can they do?', description: 'A person’s permissions, in plain words', keywords: 'permissions check' },
  { id: 'role-list', section: 'roles', title: 'Roles', description: 'Built-in roles, and roles of your own', keywords: 'rbac' },
  { id: 'permission-matrix', section: 'roles', title: 'Permissions', description: 'Tick what each role may do', keywords: 'matrix grid access' },
  { id: 'role-compare', section: 'roles', title: 'Compare roles', description: 'Two roles side by side', keywords: 'difference' },
  { id: 'audit-log', section: 'audit', title: 'Activity log', description: 'Every change, filtered by person or part of the app', keywords: 'history audit trail' },
  { id: 'security-events', section: 'audit', title: 'Sign-ins and lockouts', description: 'Only the security events', keywords: 'login failed locked' },
  { id: 'audit-export', section: 'audit', title: 'Export the log', description: 'The whole log as CSV', keywords: 'csv download' },

  /* System */
  { id: 'security-policy', section: 'system', title: 'Sign-in rules', description: 'Auto-lock, lockout and password strength', keywords: 'security password policy timeout' },
  { id: 'export', section: 'system', title: 'Export the config', description: 'Everything the dashboard controls, as one file', keywords: 'backup download json' },
  { id: 'import', section: 'system', title: 'Import a config', description: 'Load a config into the draft', keywords: 'restore upload json' },
  { id: 'remote-sync', section: 'system', title: 'Sync with a server', description: 'Send the live config to every phone', keywords: 'cloud remote server push pull' },
  { id: 'reset-area', section: 'system', title: 'Reset one part', description: 'Put one part of the draft back to how it shipped', keywords: 'default restore' },
  { id: 'factory-reset', section: 'system', title: 'Reset everything', description: 'The app exactly as it shipped', keywords: 'wipe clear default' },
  { id: 'storage', section: 'system', title: 'Storage on this device', description: 'What the app keeps on this phone, and how much', keywords: 'asyncstorage cache data' },
  { id: 'device-profile', section: 'system', title: 'The profile on this device', description: 'The birth details this phone holds', keywords: 'user onboarding' },
  { id: 'diagnostics', section: 'system', title: 'About this device', description: 'Platform, screen size and versions', keywords: 'debug info version' },
  { id: 'engine-check', section: 'system', title: 'Astrology engine check', description: 'Computes today’s panchang and times it', keywords: 'test ephemeris performance' },

  /* Account */
  { id: 'my-profile', section: 'account', title: 'Your details', description: 'Your name, email and colour', keywords: 'profile me' },
  { id: 'my-password', section: 'account', title: 'Change your password', description: 'Choose a new password', keywords: 'security' },
  { id: 'my-permissions', section: 'account', title: 'What you can do', description: 'Your role’s permissions', keywords: 'access' },
  { id: 'sign-out', section: 'account', title: 'Sign out', description: 'Leave the dashboard on this device', keywords: 'logout lock' },
];

/** Tools matching a search, best first. */
export function searchTools(query: string): Tool[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return TOOLS;
  return TOOLS.map((tool) => {
    const title = tool.title.toLowerCase();
    const haystack = `${title} ${tool.description.toLowerCase()} ${tool.keywords ?? ''} ${tool.section}`;
    let score = 0;
    for (const word of words) {
      if (!haystack.includes(word)) return { tool, score: -1 };
      score += title.startsWith(word) ? 4 : title.includes(word) ? 3 : 1;
    }
    return { tool, score };
  })
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.tool);
}
