# AstroNepali

An Expo (React Native) app for **iOS, Android and web**: twenty jyotish
services computed on the device from a real ephemeris, onboarding that collects
your birth details, a reading written from your own kundli and sent to you
every five hours, an AI astrologer you can ask anything for free, astrologer
directories for chat and call, a live consultation screen, and remedies.

Everything astrological is computed on the phone. There is no server and no
network call in any of it, so a chart can be drawn in a village with no signal.
The only thing that reaches out is the AI that puts those computed facts into
words — the five-hourly reading and AI Astrologer Baba — and when it cannot be
reached the device writes the reading itself.

## Running it

```bash
npm install          # first time only
npm run web          # browser
npm run android      # Android emulator or a connected device
npm run ios          # iOS simulator (macOS only)
npm start            # dev server + QR code for Expo Go
npm run typecheck    # TypeScript, no emit
npm run selftest     # the astrology engine, checked against outside sources
```

`npm run build:web` produces a static web bundle in `dist/`.

## The twenty services

| Group | Services |
| --- | --- |
| **Every day** | Rashifal (daily/weekly/monthly/yearly) · Panchang · Nepali Patro · Date converter · Lucky colour and number · Festivals and tika sait |
| **Your chart** | Janma Kundali · Graha Dasha · Dosha check · Kundali Milan · Gochar transits · Varshaphal · Ank Jyotish |
| **Choosing a time** | Shubha Sait · Shubha Lagna · Prashna |
| **Remedies** | Ratna and Rudraksha · Namkaran · Vastu · Puja and remedies |

## The engine

`src/lib/jyotish/` is the whole of it — pure TypeScript, no native module, so
it runs unchanged on iOS, Android and web.

Positions come from [`astronomy-engine`](https://github.com/cosinekitty/astronomy)
(VSOP87 for the planets, a Brown lunar theory for the moon). Everything on top
of that is rules applied to those numbers:

| File | What it does |
| --- | --- |
| `ephemeris.ts` | Sidereal positions of the nine grahas, Lahiri ayanamsa, retrogression, combustion, rise and set |
| `chart.ts` | Sidereal ascendant, whole-sign houses, dignity, aspects, fourteen divisional charts |
| `panchang.ts` | The five limbs with exact end times, rahu kaal, choghadiya, hora |
| `bikram.ts` | Bikram Sambat, Nepal Sambat, the patro grid |
| `dasha.ts` | Vimshottari to three levels |
| `dosha.ts` | Manglik, Kaal Sarp, Sade Sati, Gandmool, Pitru — with the classical cancellations |
| `matching.ts` | The eight koots, out of thirty-six |
| `muhurta.ts` | Activity-specific sait, tarabala, chandrabala, lagna windows |
| `festivals.ts` | The festival year, found from the real lunation |
| `rashifal.ts`, `transit.ts`, `varshaphal.ts`, `prashna.ts` | Readings derived from the above |
| `lucky.ts`, `numerology.ts`, `gemstone.ts`, `naming.ts`, `vastu.ts` | The smaller daily answers |

### Where a convention is contested

The code says which one it took and why. Mean Rahu, because that is what Nepali
almanacs print. Amanta lunar months, because purnimanta cannot pin a
Krishna-paksha tithi to one month. Noon for an unknown birth time, with the
screens that depend on the ascendant saying plainly that they are unreliable.
Where something cannot be computed honestly — a chart with no birth date, a BS
year outside the published tables — it returns `null` rather than a plausible
number.

### Checking it

`npm run selftest` verifies the parts an outside authority can settle:

- Lahiri ayanamsa against published values for 1980, 2000 and 2025
- A tithi ending at the exact instant of a real full moon
- Fourteen 2025 festival dates against the days Nepal actually kept them
- Nepal Sambat against Mha Puja; Bikram Sambat round-tripped over 3000 days
- Vimshottari spanning 120 years less the balance already spent, with no gaps
- All twelve lagnas rising in order and tiling a full day

It is worth running under more than one zone, since the engine's whole contract
is that it answers for Kathmandu whatever the phone is set to:

```bash
for tz in UTC America/New_York Asia/Kathmandu Australia/Sydney; do
  TZ=$tz npm run selftest | tail -1
done
```

## Screens

| Route | What it is |
| --- | --- |
| `/onboarding/*` | Six questions: name, gender, birth date, birth time, birth place, languages |
| `/(tabs)` | Home: greeting, search, shortcuts, today's reading, astrologers, panchang |
| `/(tabs)/services` | All twenty services, grouped and searchable |
| `/horoscope` | Rashifal for any sign, daily to yearly |
| `/panchang` | The five limbs with end times, and the day's good and bad windows |
| `/patro` | The Bikram Sambat calendar, a month at a time |
| `/date-converter` | BS ↔ AD ↔ Nepal Sambat |
| `/kundli` | The birth chart, with fourteen divisional charts |
| `/dasha` | Vimshottari mahadasha and antardasha |
| `/dosha` | Manglik, Kaal Sarp, Sade Sati, Gandmool, Pitru |
| `/matching` | Kundali milan on the eight koots |
| `/transit` | Gochar, counted from your moon sign |
| `/varshaphal` | The year ahead, from your solar return |
| `/numerology` | Mulank, bhagyank and the Lo Shu grid |
| `/muhurta` | The right day for a marriage, a shop, a journey |
| `/lagna` | Which lagna is rising, hour by hour |
| `/prashna` | One question, answered from the moment you ask — no birth details needed |
| `/gemstone` | Which stone suits your chart, and which to avoid |
| `/naming` | The syllable a newborn's name should begin with |
| `/festivals` | The festival year, with Dashain and Bhai Tika sait |
| `/lucky` | Today's colour, number and direction |
| `/vastu` | Room by room, and the direction that favours you |
| `/(tabs)/chat` | Astrologers you can message, with AI Astrologer Baba at the top |
| `/(tabs)/call` | Astrologers you can call |
| `/(tabs)/remedies` | Poojas, gemstones and healing sessions |
| `/chat/[id]` | The live consultation, including the free first minute. `/chat/ai-baba` is the AI |
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
- **Motion** answers a touch and nothing else: buttons and cards sink on a
  spring (`Tappable`, `PrimaryButton`), links draw their underline in and nudge
  their arrow (`TextLink`), and a screen's sections settle in once when it opens
  (`Reveal`). The timings live in `src/theme/motion.ts`, and all of it switches
  off under the system's reduced-motion setting.
- **Photography** of remedies and festivals is real, not generated: photos
  from Wikimedia Commons, bundled in `assets/images/` so they work offline, and
  credited in `assets/images/CREDITS.md` and under each large photo. The
  astrologer portraits still come from CDN URLs in `src/data/images.ts`; `Avatar`
  falls back to an initials circle if one fails.

The rules behind all of this, including what counts as "AI-looking" design
and is kept out of the app, are in [`CLAUDE.md`](CLAUDE.md). Read it before
changing any UI.

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

**Who writes it.** If a Groq key is configured, one request per day asks
`llama-3.3-70b-versatile` for all of the day's windows at once — it sees what it
wrote at eleven when it writes the four o'clock one, so they do not repeat — in
the language you picked during onboarding. With no key, or when the call fails,
`composePrediction` writes the reading on the device from the same facts, and
the notification still goes out. The screen says which of the two wrote it.

**How delivery works.** These are local notifications, so there is no server, no
push token and no account: the readings for the next day are written while the
app is open and handed to the operating system with the instant each should
appear, and the schedule is topped up every time the app comes back to the
foreground. That needs a development build or a store build — `expo-notifications`
cannot schedule from Expo Go on Android — and the web build has no equivalent, so
there the readings wait in `/predictions` instead.

## AI Astrologer Baba

The first name in the chat directory is not a person. **AI Astrologer Baba**
(`/chat/ai-baba`) is the same AI that writes the readings, answering questions
live — free, always online, and no queue.

**What he knows.** Before a word is sent, `src/lib/baba.ts` hands him the brief
built by `src/lib/chart-brief.ts` — the same one the five-hourly reading is
written from. It carries your name, gender, birth date, birth time and birth
place, the chart `src/lib/jyotish/` computes from them (moon sign, nakshatra and
pada with its lord, sidereal sun sign, lagna, tithi and vara at birth), the
mahadasha and antardasha you are running, whichever doshas are actually active
— a dosha the engine finds cancelled is reported as absent, not as a caveat —
and where the moon is *right now* against that chart, including the house it is
transiting from your natal moon. You never have to open the Kundli screen
first: if no chart has been built yet, one is built from the birth details on
the spot. Every answer is read from that one person's chart.

**What he will not do.** He is told never to name a graha, dasha or yoga the
brief did not give him, and that a dosha it does not list is simply not there.
He will not guarantee an outcome or a date, will not read death, illness or
pregnancy from a chart, and will not give medical, legal or financial
instructions. An unknown birth time takes the lagna and every house placement
out of the brief, so he cannot lean on one. The chat says under every
conversation that he is an AI.

**When it fails.** A refused key, a rate limit or a dropped connection is
answered in the bubble, in red, with the reason — a question is never silently
dropped.

## The AI key

Both the readings and Baba run on [Groq](https://console.groq.com/keys), whose
free tier costs nothing. Either paste the key into *Profile → Prediction
alerts*, where it is kept on that device only, or set `EXPO_PUBLIC_GROQ_API_KEY`
in a `.env` before building (see `.env.example`). Be clear-eyed about the second
one: a key compiled into an app ships to every device that installs it and can
be read back off any of them. For a published build, set
`EXPO_PUBLIC_ASTRO_AI_URL` to your own endpoint that holds the real key and
forwards to Groq — the app then sends no key at all.

With no key the app still works: the readings are written on the device, and
Baba says so rather than pretending.

## State

The onboarding answers are held in `src/store/onboarding.tsx` and persisted
with AsyncStorage, so the app skips straight to the tabs on later launches.
The daily reading is derived from the date and your sign (`src/lib/astro.ts`),
so it is stable for a day and needs no backend. Baba answers from Groq; the human
astrologers still reply with canned responses from `src/data/content.ts`, and
wiring those to a real backend means replacing the non-AI branch of `send()` in
`app/chat/[id].tsx`.

The five-hourly readings, the alert settings and the Groq key live in
`src/store/predictions.tsx`, persisted under a signature of the birth details
they were written from — change a birth time, or log out, and the old readings
are dropped rather than shown to the next person.
