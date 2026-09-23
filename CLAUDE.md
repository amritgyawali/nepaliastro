# AstroNepali: rules for UI work

Read this before touching any screen, component, colour, font, image or animation.
It applies to every UI change in this project, however small.

The app should look like a Nepali product made by people who use a patro and go to
Pashupatinath. It should not look like a generic AI app template. If a choice is
there only because it is what a generated UI usually does, don't make it.

## 1. What "AI design" means here, and why none of it is allowed

These are the tells of an AI-generated interface. Never add them, and remove them
if you find them:

| Never | Use instead |
| --- | --- |
| Purple, violet, indigo or blue-to-pink gradients; "cosmic" night-sky backgrounds; neon glows | The saffron and warm-neutral tokens in `src/theme/colors.ts`. Nothing else |
| Gradients of any kind on buttons, cards, text or backgrounds | Flat fills. A pressed or hovered state is a deeper flat fill |
| Glassmorphism, frosted blur, translucent cards over a photo | Solid white cards with a 1px `colors.border` |
| Inter, Poppins, Space Grotesk, Montserrat, system-ui "startup" type, gradient text | Mukta only, one bundled file per weight (`font.*`) |
| Sparkle ✨ or star emoji as decoration, "magic" wand icons, robot icons | Hand-drawn SVG icons in `src/icons/`, and only where they carry meaning |
| AI-generated images: Stitch, Midjourney, DALL·E, Imagen, Firefly, `aida-public` URLs, stock "mystic woman with glowing orb" | Real photographs, see §4 |
| Big centred hero, three identical feature cards, bento grids, floating blobs, oversized rounded "pill" everything | The existing layout: a phone-width column, a left-aligned header, content-shaped lists and cards |
| Drop shadows on every card, coloured shadows, stacked layered shadows | A border. `shadow()` only for something that genuinely floats, such as a modal |
| Copy like "Unlock your cosmic potential", "Discover the magic of the stars", "Your AI-powered journey" | Plain, specific sentences: what this screen does and for whom |
| Looping, pulsing, shimmering, floating or auto-playing animation | Motion that answers a touch, see §3 |

When a design tool or skill suggests a palette, font pairing, "style" or layout, don't use it
here. This project's tokens are the design system. Mockups in `design/` are historical
reference, and the app no longer follows them.

## 2. Tokens: use them, never hard-code

- **Colour:** `colors` from `@/theme`. One brand colour, saffron `#FF9933`. Saffron means
  "press this". Green and red mean status only. Text on a saffron fill is
  `colors.onSaffron` (near-black), never white. Don't add a new colour without a
  status or brand reason, and add it to `colors.ts` with a comment saying what it is for.
- **Type:** one of the eight steps in `type` (`display`, `title`, `section`, `body`,
  `label`, `small`, `caption`, `button`). Pick a family from `font`. Never set
  `fontWeight`, because on web it paints a fake bold over a face that is already bold.
- **Space:** `space.xs…xxl` (4, 8, 12, 16, 24, 32) and `GUTTER` (20) for screen edges.
  No other numbers for margin, padding or gap.
- **Radius:** `radius.sm | md | lg | pill`. When a rounded thing sits inside a padded
  rounded card, the inner radius is one step smaller.
- **Layout:** every route renders inside `<Screen>`, which caps the width at
  `SCREEN_MAX_WIDTH` on desktop and tablet. Touch targets are at least `TOUCH_SIZE` (44).

## 3. Motion: buttons, links, entrances

All motion values live in `src/theme/motion.ts`. All of it runs on Reanimated and is
skipped when the system asks for reduced motion. Don't write a raw `Animated` or
Reanimated animation in a screen. Use a primitive below, or add a new primitive that
reads from `motion`.

| Use | For | What it does |
| --- | --- | --- |
| `<Tappable>` | Anything pressable larger than a line of text: cards, rows, chips, icon buttons | Sinks on a spring (`feel="button" \| "card" \| "icon"`). Takes `pressedStyle` and `hoveredStyle` for the colour change |
| `<PrimaryButton>` | The main action on a screen, or its outline twin | Tappable plus a deeper fill on press and hover. `arrow` for a step forward, `loading` for work in progress |
| `<TextLink>` | "See all", "Read more", "Full panchang", any link in text | Hairline underline at rest. On press, hover or focus it draws a full-ink underline left to right and nudges the arrow forward. `arrow={false}` for toggles |
| `<Reveal index={n}>` | Top-level sections of a screen, on first mount only | Fades in with 8pt of upward travel, staggered in reading order and capped at 360 ms |

Rules:
- Don't use a bare `Pressable` with an opacity-only `pressed` style for new UI.
  Use `Tappable`. A bare `Pressable` is fine only for a modal backdrop, or for a
  wrapper that swallows a tap.
- Don't write a link as `<Pressable><Text style={{ color: saffronDeep }}>…</Text></Pressable>`,
  and don't put a "→" character in the label. Use `TextLink`.
- Keep durations between 150 and 350 ms. Nothing loops. Nothing moves unless the person did
  something or the screen just opened. Don't use bouncy overshoot for attention.
- Never nest one pressable inside another (web renders `<button>` inside `<button>`).
  Make the card body and its action siblings, as `AstrologerCard` does.

## 4. Images

- Use images where the thing shown is physical or a real place: remedies (thali,
  mala, singing bowl), festivals, temples. Don't use them as decoration, and don't use
  them where an icon or plain text is clearer.
- Use **real photographs only.** Take them from Wikimedia Commons (or another source
  with a clear free licence), download them into `assets/images/` and resize to
  about 800px wide at JPEG quality around 78. Never hot-link.
- Register every photo in `scenes` in `src/data/images.ts` with a `source`, an `alt`
  describing what is in the frame, and a `credit` ("Photographer · licence"). Add
  the same row to `assets/images/CREDITS.md`. A photo with no credit line doesn't ship.
- Render photos with `<Photo scene={…} height={…} />`. Pass `credited` wherever
  the photo is shown large (detail screens, the next-festival card).
- Never use AI-generated images. The astrologer portraits in `photos` are
  legacy `aida-public` images waiting to be replaced. Don't add more of them.
- Don't use photos of real, identifiable people as fake astrologers.

## 5. Copy

Write short, specific sentences in the second person. Use Nepali terms where
Nepalis use them (rashifal, patro, sait, tika, jamara), with the English
alongside when the term isn't obvious. No exclamation marks, no hype, no emoji.

## 6. Before calling a UI change done

1. `npm run typecheck`. The only allowed errors are the stale typed-route ones that
   `expo start` regenerates.
2. Run it (`npm run web`) and look at the screen at phone width and on desktop.
3. Check the table in §1 again. If anything you added is in the left column, remove it.
4. New colour, type, spacing or motion values go into `src/theme/`, not into a screen.

## 7. The admin dashboard is the one exception to §2

Everything under `src/admin/` and `app/admin/` is the tool that edits the app's
tokens, so it cannot be drawn with them: a team member trying a dark palette or
a tiny type scale still needs a dashboard they can read. It has its own fixed
tokens in `src/admin/ui/theme.ts` (the temple-red sidebar, brass, saffron for
the thing to press) and its own kit in `src/admin/ui/`. Use those there, and
only there. Every rule in §1, §4 and §5 still applies to it.

The app's stylesheets follow the published theme because
`babel/themed-styles.js` rebuilds every `StyleSheet.create` in `app/` and
`src/` after a publish. Keep screens reading `colors`, `type`, `space`,
`radius` and `GUTTER` from `@/theme` and they will keep following it. After
changing the plugin, restart Metro with `npx expo start -c`.
