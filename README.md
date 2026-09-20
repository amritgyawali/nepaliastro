# AstroNepali

An Expo (React Native) app for **iOS, Android and web**: onboarding that
collects your birth details, a reading written from your own kundli and sent to
you every five hours, astrologer directories for chat and call, a live
consultation screen, and remedies.

## Running it

```bash
npm install          # first time only
npm run web          # browser
npm run android      # Android emulator or a connected device
npm run ios          # iOS simulator (macOS only)
npm start            # dev server + QR code for Expo Go
npm run typecheck    # TypeScript, no emit
```

`npm run build:web` produces a static web bundle in `dist/`.

## Screens

| Route | What it is |
| --- | --- |
| `/onboarding/*` | Six questions: name, gender, birth date, birth time, birth place, languages |
| `/(tabs)` | Home: greeting, search, shortcuts, today's reading, astrologers, panchang |
| `/(tabs)/chat` | Astrologers you can message |
| `/(tabs)/call` | Astrologers you can call |
| `/(tabs)/remedies` | Poojas, gemstones and healing sessions |
| `/chat/[id]` | The live consultation, including the free first minute |
| `/predictions` | Every reading written for you: this window, the ones still to come, and the ones you have had |
| `/prediction/[id]` | One reading in full — where a tapped notification lands, with an astrologer at the bottom |
| `/notifications` | Prediction alerts: the cadence, the AI key, and a test notification |
| `/profile` | Your details and the way back into each part of the app |

## Design

One brand colour, one typeface, one spacing scale — all of it in
`src/theme/`, and nothing hard-coded in a screen.

- **Colour.** Deep saffron, `#FF9933`, on a warm neutral scale. Saffron means
  "this is the thing to press"; green, red and grey are kept for status.
  Text on a saffron fill is near-black (`colors.onSaffron`) rather than white,
  which keeps the contrast readable at any size.
- **Type.** [Mukta](https://fonts.google.com/specimen/Mukta), bundled with the
  app, so a Nepali name and an English label share a baseline. React Native
  does not synthesise weights for a bundled font, so each weight is its own
  family: styles pick one from `font` and never set `fontWeight`.
- **Layout.** A single `space` scale (4, 8, 12, 16, 24, 32), one `GUTTER` for
  every screen edge, four radii, and cards drawn with a border rather than a
  shadow.
- **Wide screens.** The app centres a phone-width column on desktop web and
  tablets instead of stretching the layout.
- **Icons** are hand-drawn SVG paths in `src/icons/`, not an icon font.
- **Photography** comes from the CDN URLs in `src/data/images.ts`. `Avatar`
  falls back to an initials circle if one fails; to go fully offline, download
  them into `assets/` and swap those values for `require()` calls.

`design/` holds the original Stitch mockups the first version was traced from.
They are kept for reference only — the app no longer follows them.

## Layout

```
app/                 expo-router routes (file = screen)
src/theme/           colour, type, spacing and layout tokens
src/icons/           every icon, as an SVG component
src/components/      shared UI (cards, tab bar, wheel picker, headers, …)
src/data/            astrologers, categories, languages, copy
src/store/           onboarding profile, persisted with AsyncStorage
design/              the original Stitch exports and screenshots
```

## Your prediction, every five hours

Four times a day — 6 AM, 11 AM, 4 PM and 9 PM, with a fifth at 1 AM if you ask
for it — the app sends one short reading written for your chart alone. Tapping
it opens the whole text, the chart facts it was written from, and a button
through to an astrologer.

**What makes it yours.** Not your sun sign. `src/lib/predictions.ts` takes the
kundli already computed in `src/lib/kundli.ts` — your moon sign, nakshatra and
lagna — and asks where the moon is *now* relative to it: the house it is
transiting counted from your natal moon. That number is different for every
rashi, changes through the day, and is the oldest answer to "what about today,
for me?". The tithi, the weekday lord and the hour of the window come in on top
of it. Two people with different birth details never receive the same reading.

**Who writes it.** If an Anthropic key is configured, one request per day asks
`claude-opus-5` for all of the day's windows at once — it sees what it wrote at
eleven when it writes the four o'clock one, so they do not repeat — in the
language you picked during onboarding. With no key, or when the call fails,
`composePrediction` writes the reading on the device from the same facts, and
the notification still goes out. The screen says which of the two wrote it.

**Setting the key.** Either paste it into *Profile → Prediction alerts*, where
it is kept on that device only, or set `EXPO_PUBLIC_ANTHROPIC_API_KEY` in a
`.env` before building (see `.env.example`). Be clear-eyed about the second one:
a key compiled into an app ships to every device that installs it and can be
read back off any of them. For a published build, set `EXPO_PUBLIC_ASTRO_AI_URL`
to your own endpoint that holds the real key and forwards to the Messages API —
the app then sends no key at all.

**How delivery works.** These are local notifications, so there is no server, no
push token and no account: the readings for the next day are written while the
app is open and handed to the operating system with the instant each should
appear, and the schedule is topped up every time the app comes back to the
foreground. That needs a development build or a store build — `expo-notifications`
cannot schedule from Expo Go on Android — and the web build has no equivalent, so
there the readings wait in `/predictions` instead.

## State

The onboarding answers are held in `src/store/onboarding.tsx` and persisted
with AsyncStorage, so the app skips straight to the tabs on later launches.
The daily reading is derived from the date and your sign (`src/lib/astro.ts`),
so it is stable for a day and needs no backend. The chat replies with canned
responses from `src/data/content.ts`; wiring it to a real backend means
replacing `send()` in `app/chat/[id].tsx`.

The five-hourly readings, the alert settings and the API key live in
`src/store/predictions.tsx`, persisted under a signature of the birth details
they were written from — change a birth time, or log out, and the old readings
are dropped rather than shown to the next person.
