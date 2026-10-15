# Hema Company website

React + Vite + Tailwind CSS website for Hema Company for General Contracting Ltd., in English, Kurdish (Sorani) and Arabic. All content and photos come from the company catalogue.

## Run it

```bash
npm install
npm run dev       # local development at http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build
```

The `dist/` folder is a static site: upload it to any host (Netlify, Vercel, cPanel, S3). Asset paths are relative, so it also works from a sub-folder.

## Languages

- Switch with the globe menu in the header. The choice is remembered in the browser.
- Link straight to a language with `?lang=en`, `?lang=ku` or `?lang=ar`.
- Kurdish and Arabic switch the whole page to right-to-left (`dir="rtl"`), with Noto Kufi Arabic and Vazirmatn fonts.
- All interface text is in `src/i18n/translations.ts`; project, fleet and team data (with their three translations) are in `src/data/company.ts`.

## Structure

```
src/
  components/      page sections (Hero, About, Services, Vision, Projects, MoreProjects,
                   TrackRecord, Fleet, Team, Certificates, Contact, Footer, Navbar)
  components/ui/   shared pieces (ParallaxImage, Reveal, Counter, Lightbox, SectionHeading, Button)
  hooks/           smooth scrolling (Lenis)
  i18n/            translations and the language provider
  data/            company facts, projects, fleet, team
public/images/     photos and logo extracted from the catalogue
```

## Motion

- Parallax: hero background, photo frames, floating project photos, vision and fleet backgrounds move at different speeds as you scroll (Framer Motion `useScroll` / `useTransform`).
- A pinned section turns vertical scrolling into a sideways slide through the smaller projects on desktop; on phones it is a swipeable row.
- Smooth inertia scrolling with Lenis, a scroll progress bar under the header, counters and reveal-on-scroll.
- Everything respects the visitor's "reduce motion" setting.

## Things to check before going live

- The contact form opens the visitor's email app addressed to hemacompany12@gmail.com (no server needed). Swap in a form service (Formspree, EmailJS) if you want messages delivered directly.
- English and Arabic spellings of staff names and place names were transliterated from the Kurdish catalogue; please confirm them.
- The generator brand written "Caminz" in the catalogue is shown as Cummins.
