# A Little World Made For You ♡

An intimate, bilingual love letter you can walk through. Built with Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, and Lucide. Ivory paper, rose botanicals, local fonts, and a cinematic introduction lead through eight interactive chapters.

## Run locally

Requires Node.js 20.9+ (verified with Node 24) and npm.

```sh
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Production:

```sh
npm run lint
npm run build
npm start
```

`npm run typecheck` checks TypeScript after the first build generates Next types.

## Make it yours

Start in `src/config/love.ts`. The starter name is **Sayang**; the relationship and birthday dates are illustrative. Replace these before sharing:

- `HER_NAME`, `HER_NICKNAME`, `YOUR_NAME`
- `RELATIONSHIP_START_DATE` and `HER_BIRTHDAY`: `YYYY-MM-DD`, evaluated against the visitor’s local calendar. No personal information is sent to a server.
- `FAVORITE_COLOR`, `FAVORITE_FLOWER`, `FAVORITE_SONG`
- `PHOTOS`: local image paths. Atmospheric starter photographs are included; they are not presented as actual photos of either partner. Replace them with your memories.
- `CONTENT.en` / `CONTENT.id`: optional personal letter, timeline titles/stories/dates, memory captions/stories, eight comfort letters, and reasons. Empty fields retain translated defaults. Fill arrays in the same order as their defaults in the translation files.

All remaining editorial content is in `src/i18n/en.json` and `src/i18n/id.json`, including 100 distinct reasons in each language. Keep both files in sync. Missing Indonesian keys fall back to English. Names, dates, song titles, and user-written capsule text are proper names or personal content and are not automatically translated.

The relationship counter clamps future start dates to zero. Enter valid date strings. For privacy, use nicknames and avoid putting sensitive personal information into a publicly deployed site.

### Add photos

Place photos in `public/images/` and update `PHOTOS` in the configuration. Use four images for the supplied four memory captions (additional images cycle the four captions). The story timeline reuses these images. Update captions, alt text, and story text in both locale files. `next/image` optimizes assets; keep originals reasonably sized (roughly 1600px is enough). No remote image provider is needed at runtime.

Starter photography: [Unsplash](https://unsplash.com), downloaded locally: blush bouquet `photo-1563241527-3004b7be0ffd`, sunset `photo-1470252649378-9c29740c9fa8`, forest `photo-1441974231531-c6227db76b6e`, sea `photo-1518837695005-2083093ee35b`, coffee `photo-1445116572660-236099ec97a0`. Fonts: Cormorant Garamond, DM Sans, Caveat from Google Fonts, distributed locally under their OFL licenses in `public/fonts/`.

### Language

ID / EN switches without navigation, with a short fade and sparkle. The selected language persists locally. Set `DEFAULT_LANGUAGE` for the initial language. Date-specific messages and the 404 page use the same dictionary. Language switches retain interaction state and current scroll position.

## Music and sound

`NEXT_PUBLIC_SPOTIFY_PLAYLIST_URL` defaults to the requested playlist. Only a valid `open.spotify.com/playlist/...` URL is accepted by the player.

Spotify’s official **iFrame API** loads only after a visitor chooses a song or presses **Listen together**. Song rows now play inside this page, with search by title/artist across the ten curated songs, mood filters, and an All songs option. The player card shows the selected title/artist and controls play/pause; the official embed supplies playback progress and volume. **Our whole playlist** returns to the configured playlist.

No Client ID, Client Secret, OAuth token, Spotify application installation, or backend API is needed for this integration. `.env.example` contains only public configuration. This is the public embed API, not the authenticated Spotify Web API or Web Playback SDK. Search covers our curated selection, not Spotify’s full catalog.

Track IDs are configured with the songs in `src/config/love.ts`. To add or replace a song, copy its ID from `https://open.spotify.com/track/<ID>` into `spotifyId` and keep its title, artist, mood indexes and bilingual recommendation note aligned. The ten supplied IDs were verified through Spotify’s public oEmbed metadata endpoint.

Selection uses `loadEntity` (with `loadUri` compatibility) on one persistent controller. Choices made while the script/iframe is loading use the latest selected track. The visualization and play/pause icon follow actual playback events. The API and embed have loading timeouts, a retry action and a direct link to the selected track if unavailable; they never display fake playback progress. The iframe stays mounted in the final ambient scene.

Full playback or previews remain controlled by Spotify, region, browser policies and the visitor’s account. Browsers may require an additional tap on the embedded player after asynchronous loading. The translated player hint explains that action. The integration cannot bypass Spotify’s login, Premium, or content restrictions.

The separate Sound switch enables gentle synthesized interaction chimes using Web Audio. It starts off and is never enabled automatically. It does not control the Spotify player. External music is never cached by the PWA.

## Things to discover

- First-visit flower bloom, progressive messages, name reveal, skip and replay
- Flower messages, butterflies, gathering fireflies, night mode
- Live relationship counter; birthdays, anniversaries, and midnight messages
- Music moods, actual Spotify embed, favorites
- Seven timeline chapters, memory viewer, Polaroid favorites and moving film
- Physical envelope, eight unique comfort letters, copy controls
- All 100 reasons, sequential/random selection, favorites
- Compliments, quiz, eight poetic comparisons, love slider, keyboard-accessible hold-to-hug
- Daily message, emotional check-in, bloom game, heart rain, keepsake Polaroid placeholders
- Future checklist, date generator, persistent time capsule
- Search across content and navigation; Ctrl/Cmd + K; favorites collection
- Hidden garden and secret letter; keyboard surprises
- Part II portal, cinematic finale, ambient garden (Escape or double-click to return)

The camera deliberately creates an illustrated keepsake placeholder, not a device photo or screenshot. A favorite can also be saved with its accessible bookmark button. Opening a memory retains a double-click favorite interaction in the enlarged view.

## Local storage

Only `little-world:*` keys are used. Favorites, language, night mode, intro completion, checklist, camera keepsakes, and capsule entries persist in the current browser. There is no database, cloud synchronization, login, analytics, or export to another device. Clearing browser data clears saved memories. Storage errors are surfaced instead of reporting a successful save. Do not treat the capsule as a backup.

## PWA and offline

The manifest, 192px/512px icons, maskable icon, and service worker support installation over HTTPS (or localhost). Use **More → Keep this world close**; when the browser exposes an installation prompt it is used, otherwise instructions point to the browser menu. On iOS use Share → Add to Home Screen.

The service worker registers in production only. It caches the home shell and visited static assets, then falls back to the cached home on offline navigation. A first online visit is required. Spotify and uncached external content require a connection. Increment the cache version in `public/sw.js` when changing offline behavior; old application cache versions are cleaned up on activation.

## Deploy to Vercel

1. Push this project to GitHub.
2. Import it into Vercel; choose the Next.js framework preset.
3. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin for metadata, sitemap, and social sharing.
4. Optionally set `NEXT_PUBLIC_SPOTIFY_PLAYLIST_URL` and `NEXT_PUBLIC_PART_2_URL`.
5. Deploy using the default `npm run build` command. No database or API credentials are needed.

Public environment variables are embedded during the build; redeploy after changing them. `.env.local` is ignored. `.env.example` contains no credentials.

## Part II

Set `NEXT_PUBLIC_PART_2_URL=https://your-second-domain.example` to unlock the portal. Without it the portal reveals “Not yet, pretty girl.” HTTP(S) is validated before rendering a link. The second domain can be a separate project with its own visual identity. Keep the typography and small botanical symbols for continuity; this repository does not deploy a second application. Local storage is origin-specific and will not transfer across domains.

## Accessibility and performance

Semantic sections, native modal dialogs (focus containment and Escape), visible focus, labeled buttons, keyboard timeline navigation, reduced-motion support, and touch-friendly navigation are included. The garden limits particles on mobile. Reduced motion removes continuous animation and skips the timed opening. Local fonts and local photos avoid third-party render dependencies; Spotify loads on demand. The playful, future, and command-palette modules are dynamically imported.

Lighthouse scores vary by device, network and the interactive state being audited. A score of 90+ is a target, not a claimed measurement. Browser smoke checks and build/lint validation should be repeated after personalizing content.
