import type { CustomPage, PageBlock, PageBlockType } from './schema';

/**
 * Custom pages: the block types the page builder offers, a fresh block of
 * each, and the templates a new page can start from.
 */

let counter = 0;
export function blockId(): string {
  counter += 1;
  return `b${Date.now().toString(36).slice(-4)}${counter}`;
}

export const BLOCK_TYPES: { type: PageBlockType; label: string; note: string }[] = [
  { type: 'heading', label: 'Heading', note: 'A title for a part of the page' },
  { type: 'text', label: 'Text', note: 'A paragraph or two' },
  { type: 'image', label: 'Picture', note: 'A photo with a caption' },
  { type: 'button', label: 'Button', note: 'Opens a screen, a page or a website' },
  { type: 'callout', label: 'Callout', note: 'A tinted box for something important' },
  { type: 'list', label: 'List', note: 'Bulleted or numbered points' },
  { type: 'quote', label: 'Quote', note: 'A line from someone, with their name' },
  { type: 'faq', label: 'Questions', note: 'Questions that open to show the answer' },
  { type: 'facts', label: 'Facts', note: 'Labels and values in rows' },
  { type: 'astrologer', label: 'Astrologer', note: 'A card that opens their profile' },
  { type: 'service', label: 'Service', note: 'A card that opens one of the services' },
  { type: 'divider', label: 'Divider', note: 'A line between parts' },
  { type: 'spacer', label: 'Space', note: 'Empty room' },
];

export function newBlock(type: PageBlockType): PageBlock {
  const id = blockId();
  switch (type) {
    case 'heading':
      return { id, type, text: 'A heading', size: 'md' };
    case 'text':
      return { id, type, text: 'Write something here.' };
    case 'image':
      return { id, type, image: '', caption: '', height: 180 };
    case 'button':
      return { id, type, label: 'Open', href: '/(tabs)/services', variant: 'solid' };
    case 'callout':
      return { id, type, title: 'Good to know', text: '', tone: 'brand' };
    case 'list':
      return { id, type, items: ['First point', 'Second point'], ordered: false };
    case 'quote':
      return { id, type, text: '', cite: '' };
    case 'faq':
      return { id, type, items: [{ q: 'A question people ask?', a: 'The answer.' }] };
    case 'facts':
      return { id, type, rows: [{ label: 'Label', value: 'Value' }] };
    case 'astrologer':
      return { id, type, astrologerId: '' };
    case 'service':
      return { id, type, serviceId: 'kundli' };
    case 'divider':
      return { id, type };
    case 'spacer':
      return { id, type, size: 24 };
  }
}

type Template = { id: string; name: string; note: string; build: () => Omit<CustomPage, 'id' | 'updatedAt'> };

export const PAGE_TEMPLATES: Template[] = [
  {
    id: 'blank',
    name: 'Blank',
    note: 'Start from nothing',
    build: () => ({ slug: 'new-page', title: 'New page', subtitle: '', published: false, blocks: [] }),
  },
  {
    id: 'about',
    name: 'About us',
    note: 'Who you are and why the app exists',
    build: () => ({
      slug: 'about',
      title: 'About us',
      subtitle: 'Jyotish, computed on your phone',
      published: false,
      blocks: [
        { id: blockId(), type: 'text', text: 'We built this app so that anyone in Nepal can read their own kundli, panchang and rashifal — worked out on their own phone, with no signal needed.' },
        { id: blockId(), type: 'heading', text: 'What we believe', size: 'md' },
        { id: blockId(), type: 'list', ordered: false, items: ['A reading should come from your own chart.', 'Astrologers should be named, rated and fairly priced.', 'Nothing should frighten you into paying.'] },
        { id: blockId(), type: 'button', label: 'Talk to an astrologer', href: '/(tabs)/chat', variant: 'solid' },
      ],
    }),
  },
  {
    id: 'faq',
    name: 'Questions',
    note: 'The questions people ask most',
    build: () => ({
      slug: 'faq',
      title: 'Questions and answers',
      subtitle: '',
      published: false,
      blocks: [
        {
          id: blockId(),
          type: 'faq',
          items: [
            { q: 'Do I need my exact birth time?', a: 'For your moon sign and nakshatra, the date is enough. For the lagna and houses, the time matters — within a few minutes if you have it.' },
            { q: 'Is my data sent anywhere?', a: 'Your chart is computed on your phone. Only the AI astrologer and the five-hourly reading send your chart’s facts to be put into words.' },
            { q: 'How are astrologers paid?', a: 'By the minute, at the rate on their card. The first minute of your first chat is free.' },
          ],
        },
        { id: blockId(), type: 'callout', title: 'Still stuck?', text: 'Write to us from the profile screen and we will answer within a day.', tone: 'neutral' },
      ],
    }),
  },
  {
    id: 'terms',
    name: 'Terms of use',
    note: 'The rules of using the app',
    build: () => ({
      slug: 'terms',
      title: 'Terms of use',
      subtitle: `Last updated ${new Date().toLocaleDateString()}`,
      published: false,
      blocks: [
        { id: blockId(), type: 'callout', title: 'Replace this text', text: 'This is a starting outline, not legal advice. Have it checked before you publish it.', tone: 'danger' },
        { id: blockId(), type: 'heading', text: 'Using the app', size: 'md' },
        { id: blockId(), type: 'text', text: 'Readings in this app are for guidance. They are not medical, legal or financial advice.' },
        { id: blockId(), type: 'heading', text: 'Consultations', size: 'md' },
        { id: blockId(), type: 'text', text: 'Paid consultations are charged by the minute at the rate shown before you start.' },
      ],
    }),
  },
  {
    id: 'privacy',
    name: 'Privacy',
    note: 'What is kept, and where',
    build: () => ({
      slug: 'privacy',
      title: 'Privacy',
      subtitle: '',
      published: false,
      blocks: [
        { id: blockId(), type: 'callout', title: 'Replace this text', text: 'Describe what your own servers keep before publishing this page.', tone: 'danger' },
        { id: blockId(), type: 'facts', rows: [
          { label: 'Birth details', value: 'Kept on your phone' },
          { label: 'Your chart', value: 'Computed on your phone' },
          { label: 'AI readings', value: 'Chart facts sent to write them' },
        ] },
      ],
    }),
  },
  {
    id: 'contact',
    name: 'Contact',
    note: 'How to reach you',
    build: () => ({
      slug: 'contact',
      title: 'Contact us',
      subtitle: 'We answer within a day',
      published: false,
      blocks: [
        { id: blockId(), type: 'facts', rows: [
          { label: 'Email', value: 'help@example.com' },
          { label: 'Phone', value: '+977 …' },
          { label: 'Hours', value: 'Sunday to Friday, 10 to 5' },
        ] },
        { id: blockId(), type: 'button', label: 'Write to us', href: 'mailto:help@example.com', variant: 'solid' },
      ],
    }),
  },
];
