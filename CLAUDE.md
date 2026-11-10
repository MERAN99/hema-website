# HEMA Company website — redesign with scroll film

Brief for redesigning the HEMA Company website. Read this whole file before changing anything.

## 0. Ground rules

- **Keep all company content.** Every project, photo, number, team member, certificate, contact detail and translation that exists now must still be on the site after the redesign. Content lives in `src/data/company.ts` and `src/i18n/translations.ts`. Move it, restyle it, but do not delete it. Never replace real project photos with AI images.
- **Three languages:** English (`en`), Kurdish Sorani (`ku`, right-to-left) and Arabic (`ar`, right-to-left). Every new string goes into all three dictionaries. Use logical CSS (`start`/`end`, `ps-`/`pe-`, `ms-`/`me-`), never `left`/`right`, so layouts mirror correctly in RTL.
- **Work in phases** (section 6). After each phase run `npm run build`, fix every error, and stop so the owner can review in the browser.
- Keep the stack: React 18 + TypeScript + Vite 6 + Tailwind 3 + framer-motion + Lenis + lucide-react. No new dependencies unless clearly needed.

## 1. Setup (owner does this once)

1. Unzip `hema-website.zip` into a projects folder, e.g. `~/Projects/hema-website`.
2. Put this file in the project root as `CLAUDE.md`.
3. Unzip `hema-film-frames.zip` and copy its `frames` folder to `public/film`, so you have:
   ```
   public/film/desktop/f_0001.webp … f_0307.webp   (1280×720)
   public/film/mobile/f_0001.webp  … f_0307.webp   (720×405)
   public/film/poster.jpg
   ```
4. Copy `HEMA_road_film.mp4` to `media/HEMA_road_film.mp4` (source only, not served).
5. Run `npm install` then `npm run dev`, and open the address it prints (usually http://localhost:5173).

Node 18 or newer is required (`node -v`).

## 2. The project as it is today

```
src/
  App.tsx                Navbar → Hero → About → Values → Services → Vision → Projects →
                         MoreProjects → TrackRecord → Fleet → Team → Certificates → Contact → Footer
  components/            one file per section + ui/ (Button, Counter, SectionHeading,
                         ParallaxImage, Lightbox, Reveal)
  data/company.ts        contact, featuredProjects, moreProjects, trackRecord, fleet,
                         fleetBrands, team, certificates, img() helper
  i18n/translations.ts   en / ku / ar dictionaries (type Dict = typeof en)
  i18n/LanguageProvider  useLanguage() → { lang, dir, isRtl, t, setLang }
  hooks/useSmoothScroll  Lenis + scrollToId(id)
  index.css              CSS variables, .container-x, .lane-dash, .grain
public/images/           real photos: kalar-*, baban-*, tasluja-*, kunamasi-*, sitak-*,
                         courthouse, schools, stadium, sewer, sidewalks, darwaza, goran,
                         engineers, asphalt-wide, hero-road, infinity-road, cert-1..5,
                         logo-full.png, logo-mark.png
```

`App.tsx` re-keys the page on language change (`<div key={lang}>`). Keep that.

**Brand palette (from the HEMA catalogue, already in `index.css`):** navy `rgb(15 24 40)`, deep navy `rgb(9 14 25)`, amber accent `rgb(232 160 32)`, brass `rgb(185 141 69)`, warm off-white background `rgb(248 246 241)`. Fonts: Sora (display) and Inter (body); Noto Kufi Arabic and Vazirmatn for RTL. Keep this palette. The film's golden light matches the amber.

## 3. The scroll film (new opening of the site)

Replaces `Hero.tsx` as the first thing on the page.

### 3.1 How it works

- A tall section (`~800vh` desktop, `~650vh` phone) holds a `position: sticky` stage that fills the screen (`100svh`).
- Scroll position through that section = playhead. A `<canvas>` draws the matching frame from `public/film/*`. Scrolling down plays the film, scrolling up rewinds it.
- **Smoothing:** the drawn position eases toward the scroll position (`cur += (target - cur) * 0.12` per animation frame), so fast flicks look like a smooth camera move.
- **Frame blending:** the film has 307 frames (6 per second of footage). Between frame *n* and *n+1*, draw frame *n*, then draw *n+1* on top with `globalAlpha` equal to the fractional part. That makes the motion smooth with a third of the file size.
- **Loading:** pick `mobile` frames when the screen is under 768 px wide, `desktop` otherwise. Show `poster.jpg` immediately. Request frames coarse-to-fine (every 16th, then every 4th, then all), and draw the nearest loaded frame until the exact one arrives.
- **Last 6% of the section holds on the final frame** so the closing headline and buttons can be read (`filmP = min(1, p / 0.94)`).
- `prefers-reduced-motion`: no easing (`cur = target`) and no caption blur.
- Lenis keeps native scrolling, so `position: sticky` and `getBoundingClientRect()` work as normal.

### 3.2 Film timeline (positions are fractions of the film, 0–1)

Joined from 9 clips with 0.5 s cross-fades, 51.2 s total, 1280×720, 24 fps. Each chapter starts in the middle of a cross-fade, so the headline changes exactly when the picture does.

| # | Chapter | From | To | Picture |
|---|---|---|---|---|
| 00 | Opening / hero | 0.000 | 0.143 | Untouched valley at dawn, a glowing line draws the future road |
| 01 | Survey & design | 0.143 | 0.252 | Two surveyors, total station, orange flags |
| 02 | Route, clearing & rock cutting | 0.252 | 0.360 | Bulldozer pushes rock, excavator breaks limestone |
| 03 | Embankment, layer by layer | 0.360 | 0.468 | Aerial: dump trucks, grader, roller, water truck |
| 04 | Retaining walls | 0.468 | 0.557 | Camera glides along a tall concrete wall |
| 05 | Sub-base, base & crushed stone | 0.557 | 0.665 | Grader spreading crushed stone, low angle |
| 06 | Asphalt, 140–160 °C | 0.665 | 0.882 | Prime coat, paver laying hot asphalt, rollers |
| 07 | Finished road | 0.882 | 1.000 | Lit highway at dusk, cars, street lights |

Culverts (stage 4 of the source text) are not in this cut. If `shot4` is added later the film and this table get regenerated.

Put these numbers in `src/data/company.ts`:

```ts
export const FILM_FRAMES = 307;
export const FILM_HOLD = 0.94; // last 6% of the section holds the final frame
export const filmChapters: { from: number; to: number }[] = [
  { from: 0.0, to: 0.143 },
  { from: 0.143, to: 0.252 },
  { from: 0.252, to: 0.36 },
  { from: 0.36, to: 0.468 },
  { from: 0.468, to: 0.557 },
  { from: 0.557, to: 0.665 },
  { from: 0.665, to: 0.882 },
  { from: 0.882, to: 1.0 },
];
```

### 3.3 Layout of the stage

- **Canvas** fills the screen, cover-fit, devicePixelRatio capped at 2.
- **Gradient** from deep navy at the text side (start side) to transparent, plus a bottom fade, so white text is always readable. A light grain overlay (existing `.grain`).
- **Chapter captions:** one block per chapter on the start side, vertically centred: small amber kicker (`01 · Survey & design`), big display headline, one or two lines of body. Each fades in, rises 40 px and un-blurs (12 px → 0) over the first quarter of its range, and does the reverse over the last quarter. Chapter 00 is fully visible at rest (no fade-in), because it is the first thing visitors see.
- **Chapter 00 = the hero:** reuse `t.hero` (eyebrow, titleA, titleB in amber, subtitle, both buttons) and the `t.stats` counters strip along the bottom. Buttons must be clickable only while that caption is visible (`pointer-events`).
- **Chapter 07 (finale):** closing headline plus the two hero buttons again (Explore projects / Contact us).
- **HUD:**
  - Top: the existing `Navbar` sits over the film (transparent, turns solid after the film).
  - End side (desktop only): vertical chapter rail `00`–`07` with the active one in amber. Clicking a number scrolls to that chapter.
  - Bottom: thin amber progress bar across the screen, plus "Scroll" hint with a lane-dash line that disappears after 3% progress.
- **Phone:** chapter rail hidden, captions full width at the bottom third, smaller headline (`clamp(2rem, 9vw, 3rem)`), gradient from the bottom instead of the side.

### 3.4 Copy for the chapters (add `film` to all three dictionaries)

Shape: `film: { chapters: { kicker: string; title: string; body: string }[]; rail: string; scroll: string }`. Index 0 is unused (chapter 00 uses `t.hero`), so start the array with an empty item or index from 1. Pick one and stay consistent.

**English**

| # | Kicker | Title | Body |
|---|---|---|---|
| 01 | 01 · Survey & design | Every road starts on paper. | Surveying, mapping and a design built on the loads and traffic the road will carry. |
| 02 | 02 · Route & clearing | We open the way. | Setting out the alignment, clearing the land, cutting through rock, testing the soil and widening the route. |
| 03 | 03 · Embankment | Built up, layer by layer. | Suitable fill spread in layers, compacted by rollers and tested for strength after every layer. |
| 04 | 04 · Retaining walls | Holding the mountain back. | Reinforced concrete walls wherever a slope could fail. |
| 05 | 05 · Base courses | The foundation you never see. | Sub-base, base and crushed stone: graded, brought to the right moisture, compacted and tested. |
| 06 | 06 · Asphalt · 140–160 °C | Three layers of hot asphalt. | Prime coat on the base, tack coat between layers. Base course 7–10 cm · Binder 5–7 cm · Wearing course 4–5 cm. |
| 07 | 07 · Finished road | Ready for the people who use it. | Lane markings, road signs, lighting and shoulders. Then the road opens. |

**Kurdish (Sorani)** — wording follows HEMA's own Kurdish text about the construction stages. Match the numeral style already used in `translations.ts`.

| # | Kicker | Title | Body |
|---|---|---|---|
| 01 | ٠١ · نەخشە و دیزاین | هەموو ڕێگایەک لەسەر کاغەز دەست پێدەکات. | ڕووپێوی، نەخشەکێشان و دیزاینێکی شایستە بەپێی ئەو بار و بەکارهێنانەی بۆ ڕێگاکە پێشبینی دەکرێت. |
| 02 | ٠٢ · ئاراستە و پاککردنەوە | ڕێگا دەکەینەوە. | دیاریکردنی ئاراستەی شەقام، پاککردنەوە و بڕینی شاخ، پشکنینی خاک و فراوانکردنی ڕێگا. |
| 03 | ٠٣ · پڕکردنەوەی نزمایی | چین بە چین بەرز دەبێتەوە. | خاکی گونجاو چین بە چین ڕادەخرێت، بە ڕۆڵە دەپەستێورێت و هێز و بەرگەگرییەکەی پشکنینی بۆ دەکرێت. |
| 04 | ٠٤ · دیواری ڕاگر | شاخ ڕادەگرین. | دیواری کۆنکرێتی لەو شوێنانەی مەترسی داڕمانیان لەسەرە. |
| 05 | ٠٥ · بەیس و سەب بەیس | بناغەیەک کە نابینرێت. | چینەکانی سەب بەیس، بەیس و کراش ستۆن، بە شێی پێویست، پەستاندن بە ڕۆڵە و پشکنینی هێز. |
| 06 | ٠٦ · قیرتاوکردن · ١٤٠–١٦٠ پلە | سێ چین ئەسفەڵتی گەرم. | پرایم کۆت لەسەر بەیس و تاک کۆت لە نێوان چینەکاندا. چینی بنەڕەتی ٧–١٠ سم · چینی بەستنەوە ٥–٧ سم · چینی ڕووکار ٤–٥ سم. |
| 07 | ٠٧ · ڕێگای تەواوکراو | ئامادە بۆ خەڵک. | هێڵکاری، نیشانەکانی ڕێگا، ڕووناکی و شانەی ڕێگا. پاشان ڕێگاکە دەکرێتەوە. |

**Arabic**

| # | Kicker | Title | Body |
|---|---|---|---|
| 01 | ٠١ · المسح والتصميم | كل طريق يبدأ على الورق. | مسح ورسم خرائط وتصميم يناسب الأحمال وحركة المرور المتوقعة للطريق. |
| 02 | ٠٢ · المسار والتنظيف | نفتح الطريق. | تحديد المسار وتنظيف الأرض وقطع الصخور وفحص التربة وتوسيع الطريق. |
| 03 | ٠٣ · أعمال الردم | طبقة فوق طبقة. | تُفرش التربة المناسبة على طبقات وتُدمك بالحادلات وتُفحص قوتها بعد كل طبقة. |
| 04 | ٠٤ · الجدران الساندة | نسند الجبل. | جدران خرسانية مسلحة حيث يوجد خطر الانهيار. |
| 05 | ٠٥ · طبقات الأساس | أساس لا تراه. | طبقات ما تحت الأساس والأساس والحصى المكسر، بالرطوبة الصحيحة، مدموكة ومفحوصة. |
| 06 | ٠٦ · الإسفلت · ١٤٠–١٦٠ درجة | ثلاث طبقات من الإسفلت الساخن. | برايم كوت على الأساس وتاك كوت بين الطبقات. الطبقة الأساسية ٧–١٠ سم · الرابطة ٥–٧ سم · السطحية ٤–٥ سم. |
| 07 | ٠٧ · طريق مكتمل | جاهز لمن يستخدمه. | التخطيط والإشارات والإنارة والأكتاف، ثم يُفتتح الطريق. |

Have a native speaker check the Kurdish and Arabic before launch.

`rail`: "Chapters" / "بەشەکان" / "الفصول". `scroll`: reuse `t.hero.scroll`.

### 3.5 Reference implementation of the engine

Use this as the core of `src/components/ScrollFilm.tsx`; build the JSX and styling around it. Captions and the progress bar are updated through refs inside the animation loop (no React re-render per frame). Only the active chapter number goes through state.

```tsx
import { useEffect, useRef, useState } from 'react';
import { FILM_FRAMES, FILM_HOLD, filmChapters } from '../data/company';

const pad = (n: number) => String(n).padStart(4, '0');
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function useFilmEngine() {
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captionRefs = useRef<(HTMLElement | null)[]>([]);
  const barRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState(0); // 0..1, for an optional loading bar

  useEffect(() => {
    const track = trackRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const set = window.innerWidth < 768 ? 'mobile' : 'desktop';
    const N = FILM_FRAMES;
    const frames: HTMLImageElement[] = new Array(N);
    const ready = new Uint8Array(N);
    let count = 0;
    let dirty = true;

    const load = (i: number) => {
      if (frames[i]) return;
      const im = new Image();
      im.decoding = 'async';
      im.src = `./film/${set}/f_${pad(i + 1)}.webp`;
      im.onload = () => {
        ready[i] = 1;
        count++;
        dirty = true;
        if (count % 12 === 0 || count === N) setLoaded(count / N);
      };
      frames[i] = im;
    };
    for (const step of [16, 4, 1]) for (let i = 0; i < N; i += step) load(i);

    const nearest = (i: number) => {
      for (let d = 0; d < N; d++) {
        if (i - d >= 0 && ready[i - d]) return i - d;
        if (i + d < N && ready[i + d]) return i + d;
      }
      return -1;
    };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      dirty = true;
    };

    const drawCover = (im: HTMLImageElement, alpha: number) => {
      const W = canvas.width, H = canvas.height;
      const s = Math.max(W / im.naturalWidth, H / im.naturalHeight);
      const w = im.naturalWidth * s, h = im.naturalHeight * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
      ctx.globalAlpha = 1;
    };

    let target = 0, cur = 0, raf = 0, lastActive = -1;

    const readScroll = () => {
      const max = track.offsetHeight - window.innerHeight;
      target = max > 0 ? clamp01(-track.getBoundingClientRect().top / max) : 0;
    };

    const render = (p: number) => {
      const fp = Math.min(1, p / FILM_HOLD); // film position 0..1
      const fi = fp * (N - 1);
      const i0 = Math.floor(fi);
      const frac = fi - i0;
      const a = nearest(i0);
      if (a >= 0) {
        drawCover(frames[a], 1);
        if (a === i0 && frac > 0.01 && i0 + 1 < N && ready[i0 + 1]) drawCover(frames[i0 + 1], frac);
      }

      let act = 0;
      filmChapters.forEach((c, i) => {
        const el = captionRefs.current[i];
        const f = 0.25 * (c.to - c.from);
        const fadeIn = i === 0 ? 1 : smooth(c.from, c.from + f, fp);
        const fadeOut = i === filmChapters.length - 1 ? 1 : 1 - smooth(c.to - f, c.to, fp);
        const o = Math.min(fadeIn, fadeOut);
        if (fp >= c.from) act = i;
        if (!el) return;
        el.style.opacity = String(o);
        el.style.transform = `translateY(${(1 - fadeIn) * 40 - (1 - fadeOut) * 40}px)`;
        el.style.filter = reduce || o > 0.98 ? 'none' : `blur(${(1 - o) * 12}px)`;
        el.style.pointerEvents = o > 0.6 ? 'auto' : 'none';
        el.setAttribute('aria-hidden', o < 0.5 ? 'true' : 'false');
      });
      if (act !== lastActive) { lastActive = act; setActive(act); }
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (hintRef.current) hintRef.current.style.opacity = String(1 - smooth(0, 0.03, p));
    };

    const tick = () => {
      const prev = cur;
      cur = reduce ? target : cur + (target - cur) * 0.12;
      if (Math.abs(target - cur) < 0.0001) cur = target;
      if (cur !== prev || dirty) { render(cur); dirty = false; }
      raf = requestAnimationFrame(tick);
    };

    resize();
    readScroll();
    cur = target;
    window.addEventListener('scroll', readScroll, { passive: true });
    window.addEventListener('resize', () => { resize(); readScroll(); });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', readScroll);
    };
  }, []);

  /** Scroll so the film sits at the start of chapter i. */
  const goToChapter = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.offsetHeight - window.innerHeight;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const fp = i === 0 ? 0 : filmChapters[i].from + 0.02;
    scrollToY(top + fp * FILM_HOLD * max);
  };

  return { trackRef, canvasRef, captionRefs, barRef, hintRef, active, loaded, goToChapter };
}
```

Notes for the implementation:
- The resize listener above is an inline arrow, so it isn't removed on unmount. Give it a name and remove it in the cleanup.
- Add `export function scrollToY(y: number)` to `hooks/useSmoothScroll.ts` (Lenis `scrollTo(y)` when active, otherwise `window.scrollTo({ top: y, behavior: 'smooth' })`) and import it in the film component.
- Section markup: `<section id="top" ref={trackRef} className="relative h-[650vh] md:h-[800vh] bg-navy-deep">` containing `<div className="sticky top-0 h-[100svh] overflow-hidden">` with the canvas (`absolute inset-0 h-full w-full`), the poster as a CSS background on that div until the first frame draws, gradients, captions (all absolutely positioned in the same spot), rail, progress bar and hint.
- Navbar: transparent while inside the film (`scrollY < film height - innerHeight`), solid navy after.

## 4. Redesign of the rest of the site

Direction: **cinematic dark opening → calm, editorial content.** After the film the page moves to the warm off-white background with navy text, large real photography and generous spacing. Amber is used sparingly: kickers, numbers, active states, the lane-dash motif. One consistent section header: amber kicker with a short lane-dash line, Sora headline, muted intro paragraph.

Section order and treatment (keep every existing piece of content):

1. **ScrollFilm** — section 3. Includes the hero copy and stats.
2. **About** — two columns: story and the four credentials (licensed management, 10–32 years experience, safety courses, social insurance) on one side; Grade 1 classification and registered capital as large figures on the other. One large real photo (`engineers.jpg`).
3. **Values** — four values in a single row of cards with thin borders; icons in amber.
4. **Services** — six services as a grid of tall image cards with the number (01–06), title and one line. Images: use real photos where they exist (roads → `asphalt-wide.jpg`, water & sewer → `sewer.jpg`, buildings → `schools.jpg` or `courthouse.jpg`). Surveying can use a still from chapter 01 of the film (`public/film/desktop/f_0050.webp`).
5. **Vision** — full-bleed photo (`infinity-road.png` or a film still from the finale) with a dark overlay and the vision text large in white.
6. **Projects** — featured projects as alternating full-width stories: image gallery on one side (opens the existing `Lightbox`), title, location, period, value, summary and highlights on the other.
7. **MoreProjects** — compact grid of smaller project cards.
8. **TrackRecord** — clean table of contracts with values in IQD/USD and periods; total value as a large counter on top.
9. **Fleet** — counts per machine type as big numbers, with the brand marquee (`fleetBrands`) below.
10. **Team** — role cards with the existing icons.
11. **Certificates** — row of certificate thumbnails opening the `Lightbox`.
12. **Contact** — phones, email, map link, and a dark navy panel. Footer stays.

Motion after the film: keep it quiet. Existing `Reveal` (fade + 24 px rise) on section entry, `ParallaxImage` on large photos only. No other scroll-jacking.

## 5. Performance and quality targets

- First frame visible within ~1 s on a normal connection: `poster.jpg` shows instantly, `<link rel="preload" as="image" href="./film/desktop/f_0001.webp">` in `index.html`.
- Total film download: ~19 MB desktop, ~9 MB phone, loaded progressively; the page is usable before all frames arrive.
- Smooth at 60 fps on a mid-range laptop: one canvas, no layout reads inside the animation loop except the scroll position.
- Images below the film: `loading="lazy"`, explicit `width`/`height` to avoid layout shift.
- Lighthouse accessibility ≥ 95: captions are real text, chapter rail buttons have labels, focus rings visible, hidden captions `aria-hidden`.

## 6. Work order

1. **Phase 1 — scroll film.** Add frames, data, translations and `ScrollFilm.tsx`; replace `Hero` in `App.tsx`; Navbar transparency. Check in English, Kurdish and Arabic, on desktop and at 375 px width. **Stop for review.**
2. **Phase 2 — design system.** Section header component, spacing scale, card styles, buttons. Restyle About, Values and Services. **Stop for review.**
3. **Phase 3 — work.** Vision, Projects, MoreProjects, TrackRecord. **Stop for review.**
4. **Phase 4 — company.** Fleet, Team, Certificates, Contact, Footer. **Stop for review.**
5. **Phase 5 — polish.** RTL pass, phone pass, reduced motion, performance and accessibility checks, `npm run build` clean.

## 7. Done checklist

- [ ] Every item in `company.ts` and every translation key still appears on the site
- [ ] Film scrubs smoothly forwards and backwards; captions change exactly at the picture changes
- [ ] Chapter rail jumps to the right chapter
- [ ] English, Kurdish and Arabic all correct, RTL mirrored properly
- [ ] Works at 375 px, 768 px, 1280 px and 1920 px widths
- [ ] Reduced motion respected
- [ ] `npm run build` passes with no errors
- [ ] No AI images used for named real projects

## 8. Asset reference

| File | What it is |
|---|---|
| `HEMA_road_film.mp4` | Joined film, 1280×720, 24 fps, 51.2 s, no audio |
| `hema-film-frames.zip` | `frames/desktop` (307 × 1280 px WebP), `frames/mobile` (307 × 720 px WebP), `frames/poster.jpg` |
| Higgsfield library | Source clips and 6 extra images (services, vision, fleet backgrounds); job IDs in `HEMA_PROJECT.md` |

To rebuild frames after changing the film (needs ffmpeg, `brew install ffmpeg`):

```bash
ffmpeg -i media/HEMA_road_film.mp4 -vf "fps=6,scale=1280:-2" -c:v libwebp -quality 58 public/film/desktop/f_%04d.webp
ffmpeg -i media/HEMA_road_film.mp4 -vf "fps=6,scale=720:-2"  -c:v libwebp -quality 62 public/film/mobile/f_%04d.webp
```
Then update `FILM_FRAMES` to the new count and the chapter table.
