import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageProvider';
import { scrollToId, scrollToY } from '../hooks/useSmoothScroll';
import { FILM_FRAMES, FILM_HOLD, filmChapters } from '../data/company';
import { ButtonLink } from './ui/Button';
import { Counter } from './ui/Counter';
import { cn } from '../lib';

const pad = (n: number) => String(n).padStart(4, '0');

/** Opening frames that must be ready before the loading screen (#boot in index.html) fades out. */
const BOOT_FRAMES = 6;
const hideBoot = () => {
  const boot = document.getElementById('boot');
  if (!boot || boot.classList.contains('done')) return;
  boot.classList.add('done');
  window.setTimeout(() => boot.remove(), 450);
};
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * Scroll-scrubbed film: the scroll position through the tall section is the playhead. Frames are drawn on
 * one canvas with blending between neighbours; captions, progress bar and hint are updated through refs
 * inside the animation loop, so only the active chapter number goes through React state.
 */
function useFilmEngine() {
  const trackRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captionRefs = useRef<(HTMLElement | null)[]>([]);
  const statsRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false); // first frame drawn: hide the poster background

  useEffect(() => {
    const track = trackRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const N = FILM_FRAMES;
    // Two copies of every frame: a light one (384 px, ~10 KB) and the full-quality one. The light copies of the
    // whole film arrive within seconds, so scrolling is smooth from the first visit; each frame is then swapped
    // for its full-quality copy as soon as that has loaded (frames on screen first).
    const frames: HTMLImageElement[] = new Array(N);
    const ready = new Uint8Array(N);
    const lite: HTMLImageElement[] = new Array(N);
    const liteReady = new Uint8Array(N);
    let dirty = true;
    let alive = true;

    // Frames download a dozen at a time (the site is served through Cloudflare over HTTP/2 and HTTP/3, so
    // many requests share one connection) without crowding out the page's own code, fonts and poster.
    // Frame 1 comes first (it's preloaded in index.html); the rest start once the page has loaded.
    // On slow or data-saving connections full-quality frames are only fetched around the playhead.
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slow = !!conn && (!!conn.saveData || /(^|-)(2g|3g)$/.test(conn.effectiveType ?? ''));
    const MAX_ACTIVE = slow ? 4 : 12;
    // Full quality (1280×720) on every screen, phones included; the smaller set only on slow or data-saving connections.
    const set = slow ? 'mobile' : 'desktop';
    // Look far enough ahead to cover the whole opening chapter, so the first thing visitors scroll is complete.
    const LOOK_AHEAD = Math.ceil(filmChapters[1].from * FILM_HOLD * (N - 1)) + 4;
    const requested = new Uint8Array(N);
    const liteRequested = new Uint8Array(N);
    let active = 0;
    let streaming = false;

    const request = (i: number, light = false) => {
      (light ? liteRequested : requested)[i] = 1;
      active++;
      const im = new Image();
      im.decoding = 'async';
      im.setAttribute('fetchpriority', i === 0 && !light ? 'high' : 'low');
      const finish = () => {
        active--;
        pump();
      };
      im.onload = () => {
        if (!alive) return;
        if (light) liteReady[i] = 1;
        else ready[i] = 1;
        dirty = true;
        if (!light && i < BOOT_FRAMES && ready.subarray(0, BOOT_FRAMES).every(Boolean)) hideBoot();
        finish();
      };
      im.onerror = finish;
      im.src = light ? `./film/lite/f_${pad(i + 1)}.webp` : `./film/${set}/f_${pad(i + 1)}.webp`;
      if (light) lite[i] = im;
      else frames[i] = im;
    };

    type Job = [number, boolean];
    const nextJob = (): Job | null => {
      const here = Math.round(Math.min(1, target / FILM_HOLD) * (N - 1));
      // 1. Full quality for what is on screen now and just ahead.
      for (let d = 0; d < 10; d++) {
        if (here + d < N && !requested[here + d]) return [here + d, false];
        if (d < 3 && here - d >= 0 && !requested[here - d]) return [here - d, false];
      }
      // 2. Light copies of the whole film: around the playhead first, then coarse to fine.
      for (let d = 0; d < LOOK_AHEAD; d++) {
        if (here + d < N && !liteRequested[here + d] && !ready[here + d]) return [here + d, true];
        if (d < 6 && here - d >= 0 && !liteRequested[here - d] && !ready[here - d]) return [here - d, true];
      }
      for (const step of [8, 1]) for (let i = 0; i < N; i += step) if (!liteRequested[i] && !ready[i]) return [i, true];
      // 3. Full quality for the rest: ahead of the playhead first, then coarse to fine.
      for (let d = 0; d < LOOK_AHEAD; d++) {
        if (here + d < N && !requested[here + d]) return [here + d, false];
        if (d < 6 && here - d >= 0 && !requested[here - d]) return [here - d, false];
      }
      if (slow) return null;
      for (const step of [16, 4, 1]) for (let i = 0; i < N; i += step) if (!requested[i]) return [i, false];
      return null;
    };

    function pump() {
      if (!alive || !streaming) return;
      while (active < MAX_ACTIVE) {
        const job = nextJob();
        if (!job) return;
        request(job[0], job[1]);
      }
    }

    for (let i = 0; i < BOOT_FRAMES; i++) request(i);
    // Fade out by 2.5 s at the latest (the CSS in index.html does the same if this script never runs).
    const bootTimer = window.setTimeout(hideBoot, 2100);
    const startStreaming = () => {
      streaming = true;
      pump();
    };
    const afterLoad = () => window.setTimeout(startStreaming, 150);
    if (document.readyState === 'complete') afterLoad();
    else window.addEventListener('load', afterLoad, { once: true });

    /** Best loaded copy of frame i: full quality if it has arrived, otherwise the light one. */
    const pick = (i: number) => (ready[i] ? frames[i] : liteReady[i] ? lite[i] : null);
    const nearest = (i: number) => {
      for (let d = 0; d < N; d++) {
        if (i - d >= 0 && (ready[i - d] || liteReady[i - d])) return i - d;
        if (i + d < N && (ready[i + d] || liteReady[i + d])) return i + d;
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
      const W = canvas.width;
      const H = canvas.height;
      const s = Math.max(W / im.naturalWidth, H / im.naturalHeight);
      const w = im.naturalWidth * s;
      const h = im.naturalHeight * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
      ctx.globalAlpha = 1;
    };

    let target = 0;
    let cur = 0;
    let raf = 0;
    let lastActive = -1;
    let drewFirst = false;

    const readScroll = () => {
      const max = track.offsetHeight - window.innerHeight;
      target = max > 0 ? clamp01(-track.getBoundingClientRect().top / max) : 0;
      pump();
    };

    const styleCaption = (el: HTMLElement | null, fadeIn: number, fadeOut: number) => {
      if (!el) return;
      const o = Math.min(fadeIn, fadeOut);
      el.style.opacity = String(o);
      el.style.transform = `translateY(${(1 - fadeIn) * 40 - (1 - fadeOut) * 40}px)`;
      el.style.filter = reduce || o > 0.98 ? 'none' : `blur(${(1 - o) * 12}px)`;
      el.style.pointerEvents = o > 0.6 ? 'auto' : 'none';
      el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
      el.setAttribute('aria-hidden', o < 0.5 ? 'true' : 'false');
    };

    const render = (p: number) => {
      const fp = Math.min(1, p / FILM_HOLD); // film position 0..1
      const fi = fp * (N - 1);
      const i0 = Math.floor(fi);
      const frac = fi - i0;
      const a = nearest(i0);
      if (a >= 0) {
        drawCover(pick(a)!, 1);
        const next = a === i0 && frac > 0.01 && i0 + 1 < N ? pick(i0 + 1) : null;
        if (next) drawCover(next, frac);
        if (!drewFirst) {
          drewFirst = true;
          setStarted(true);
        }
      }

      let act = 0;
      filmChapters.forEach((c, i) => {
        const f = 0.25 * (c.to - c.from);
        const fadeIn = i === 0 ? 1 : smooth(c.from, c.from + f, fp);
        const fadeOut = i === filmChapters.length - 1 ? 1 : 1 - smooth(c.to - f, c.to, fp);
        if (fp >= c.from) act = i;
        styleCaption(captionRefs.current[i], fadeIn, fadeOut);
        if (i === 0) styleCaption(statsRef.current, fadeIn, fadeOut);
      });
      if (act !== lastActive) {
        lastActive = act;
        setActive(act);
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (hintRef.current) {
        const h = 1 - smooth(0, 0.03, p);
        hintRef.current.style.opacity = String(h);
        hintRef.current.style.pointerEvents = h > 0.5 ? 'auto' : 'none';
      }
    };

    const tick = () => {
      const prev = cur;
      cur = reduce ? target : cur + (target - cur) * 0.12;
      if (Math.abs(target - cur) < 0.0001) cur = target;
      if (cur !== prev || dirty) {
        render(cur);
        dirty = false;
      }
      raf = requestAnimationFrame(tick);
    };

    const onResize = () => {
      resize();
      readScroll();
    };

    resize();
    readScroll();
    cur = target;
    window.addEventListener('scroll', readScroll, { passive: true });
    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', afterLoad);
      window.clearTimeout(bootTimer);
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

  return { trackRef, canvasRef, captionRefs, statsRef, barRef, hintRef, active, started, goToChapter };
}

const SOUND_KEY = 'hema-film-sound';
const readSoundPref = () => {
  try {
    return window.localStorage.getItem(SOUND_KEY) === 'on';
  } catch {
    return false;
  }
};

/**
 * Optional cinematic music for the film. Off by default (browsers block sound that starts by itself); the file
 * is only fetched once the visitor turns sound on. It keeps playing while the film is on screen (also when the
 * visitor stops scrolling), loops seamlessly (the file's end is crossfaded into its start), fades out over 1 s
 * after the film and back in when the visitor scrolls back up.
 * Fades use a Web Audio gain node, because iOS ignores HTMLMediaElement.volume.
 */
function useFilmSound(trackRef: React.RefObject<HTMLElement>) {
  const [on, setOn] = useState(false);
  const audioRef = useRef<{ el: HTMLAudioElement; ctx: AudioContext; gain: GainNode } | null>(null);
  const insideRef = useRef(true);

  const ensureAudio = () => {
    if (audioRef.current) return audioRef.current;
    const el = new Audio('./film/music.m4a');
    el.loop = true;
    el.preload = 'auto';
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    ctx.createMediaElementSource(el).connect(gain).connect(ctx.destination);
    audioRef.current = { el, ctx, gain };
    return audioRef.current;
  };

  const fadeTo = (value: number, seconds: number) => {
    const a = audioRef.current;
    if (!a) return;
    const now = a.ctx.currentTime;
    a.gain.gain.cancelScheduledValues(now);
    a.gain.gain.setValueAtTime(a.gain.gain.value, now);
    a.gain.gain.linearRampToValueAtTime(value, now + seconds);
  };

  const start = async () => {
    const a = ensureAudio();
    await a.ctx.resume();
    await a.el.play();
    if (insideRef.current) fadeTo(1, 0.8);
  };

  const toggle = async () => {
    const next = !on;
    setOn(next);
    try {
      window.localStorage.setItem(SOUND_KEY, next ? 'on' : 'off');
    } catch {
      // Storage blocked (private mode): the choice just isn't remembered.
    }
    if (next) {
      try {
        await start();
      } catch {
        setOn(false);
      }
    } else {
      fadeTo(0, 0.4);
      window.setTimeout(() => audioRef.current?.el.pause(), 450);
    }
  };

  useEffect(() => {
    // A remembered "on" can't start sound by itself: browsers need a tap or key press first.
    if (!readSoundPref()) return;
    const resume = (e: Event) => {
      // A tap on the sound button itself is handled by toggle(); resuming here as well would switch it straight off.
      if ((e.target as Element | null)?.closest?.('[data-sound-toggle]')) return;
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
      setOn(true);
      start().catch(() => setOn(false));
    };
    window.addEventListener('pointerdown', resume);
    window.addEventListener('keydown', resume);
    return () => {
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const t = trackRef.current;
      if (!t) return;
      const inside = window.scrollY < t.offsetTop + t.offsetHeight - window.innerHeight * 0.5;
      if (inside === insideRef.current) return;
      insideRef.current = inside;
      const a = audioRef.current;
      if (!a || !on) return;
      if (inside) {
        a.el.play().catch(() => undefined);
        fadeTo(1, 0.8);
      } else {
        fadeTo(0, 1);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  // Stop everything when the film unmounts (e.g. on a language change, which re-mounts the page).
  useEffect(
    () => () => {
      const a = audioRef.current;
      if (!a) return;
      a.el.pause();
      a.ctx.close().catch(() => undefined);
    },
    [],
  );

  return { on, toggle };
}

export function ScrollFilm() {
  const { t, lang } = useLanguage();
  const reduce = useReducedMotion();
  const { trackRef, canvasRef, captionRefs, statsRef, barRef, hintRef, active, started, goToChapter } = useFilmEngine();
  const sound = useFilmSound(trackRef);
  const posterSet = 'desktop'; // same file as the preload in index.html

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToId(id);
  };
  const words = (s: string) => s.split(' ');
  const last = filmChapters.length - 1;
  const railLabel = (i: number) => (i === 0 ? t.hero.eyebrow : t.film.chapters[i].kicker);

  const buttons = (
    <div className="mt-8 flex flex-wrap gap-3">
      <ButtonLink href="#projects" variant="light" onClick={go('projects')}>
        {t.hero.primary}
        <ArrowRight className="h-4 w-4 rtl:rotate-180" />
      </ButtonLink>
      <ButtonLink href="#contact" variant="outline" onClick={go('contact')}>
        {t.hero.secondary}
      </ButtonLink>
    </div>
  );

  return (
    <section id="top" ref={trackRef} aria-label={t.hero.eyebrow} className="relative h-[650vh] bg-navy-deep md:h-[800vh]">
      <div
        className="sticky top-0 h-[100svh] overflow-hidden bg-cover bg-center"
        // Frame 1 (preloaded in index.html) shows as a background instantly, until the canvas has drawn it.
        style={started ? undefined : { backgroundImage: `url('./film/${posterSet}/f_0001.webp')` }}
      >
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />

        {/* Readability: dark from the text side (desktop) or from the bottom (phone), plus a bottom fade. */}
        <div aria-hidden className="absolute inset-0 hidden bg-gradient-to-r from-navy-deep/90 via-navy-deep/45 to-transparent md:block rtl:bg-gradient-to-l" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[75%] bg-gradient-to-t from-navy-deep via-navy-deep/70 to-transparent md:h-1/2 md:from-navy-deep/85 md:via-navy-deep/30" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-navy-deep/60 to-transparent" />
        <div aria-hidden className="grain pointer-events-none absolute inset-0" />

        {/* Chapter 00: the hero. Fully visible at rest. */}
        <div
          ref={(el) => (captionRefs.current[0] = el)}
          className="absolute inset-x-0 bottom-[15.5rem] top-20 flex items-end md:bottom-44 md:top-0 md:items-center"
        >
          <div className="container-x w-full">
            <p className="mb-5 inline-flex w-fit items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/85 backdrop-blur md:mb-6 md:text-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              {t.hero.eyebrow}
            </p>
            <h1 key={`h1-${lang}`} className="max-w-4xl font-display text-[clamp(2rem,9vw,3rem)] font-extrabold leading-[1.15] tracking-tight text-white sm:text-6xl sm:leading-[1.15] lg:text-7xl lg:leading-[1.15] rtl:text-[clamp(1.7rem,7.5vw,2.4rem)] rtl:leading-[1.7] rtl:tracking-normal rtl:sm:text-5xl rtl:sm:leading-[1.7] rtl:lg:text-[3.6rem] rtl:lg:leading-[1.7]">
              {[...words(t.hero.titleA), '\n', ...words(t.hero.titleB)].map((w, i) =>
                w === '\n' ? (
                  <br key={i} />
                ) : (
                  // Padding (offset by negative margin) gives the reveal mask room for marks above and below Arabic-script letters.
                  <span key={i} className="-my-[0.15em] inline-block overflow-hidden py-[0.15em] align-bottom rtl:-my-[0.35em] rtl:py-[0.35em]">
                    <motion.span
                      className={cn('inline-block', i > words(t.hero.titleA).length && 'text-accent')}
                      initial={reduce ? false : { y: '160%' }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.8, delay: 0.15 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {w}&nbsp;
                    </motion.span>
                  </span>
                ),
              )}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 md:mt-6 md:text-lg">{t.hero.subtitle}</p>
            {buttons}
          </div>
        </div>

        {/* Chapters 01–07 */}
        {filmChapters.slice(1).map((_, k) => {
          const i = k + 1;
          const c = t.film.chapters[i];
          return (
            <div
              key={i}
              ref={(el) => (captionRefs.current[i] = el)}
              aria-hidden
              className="invisible absolute inset-x-0 bottom-16 opacity-0 md:bottom-0 md:top-0 md:flex md:items-center"
            >
              <div className="container-x w-full">
                <div className="max-w-xl lg:max-w-2xl">
                  <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent md:text-sm rtl:tracking-normal">
                    <span aria-hidden className="lane-dash-x h-[3px] w-8 [background-size:12px_100%]" />
                    {c.kicker}
                  </p>
                  <h2 className="mt-4 font-display text-[clamp(2rem,9vw,3rem)] font-extrabold leading-[1.12] tracking-tight text-white md:text-6xl md:leading-[1.08] rtl:leading-[1.6] rtl:tracking-normal rtl:md:text-5xl rtl:md:leading-[1.6]">
                    {c.title}
                  </h2>
                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 md:mt-5 md:text-lg">{c.body}</p>
                  {i === last && buttons}
                </div>
              </div>
            </div>
          );
        })}

        {/* Hero stats, along the bottom while the opening is on screen. */}
        <div ref={statsRef} className="absolute inset-x-0 bottom-0">
          <div className="container-x">
            <dl className="grid grid-cols-2 overflow-hidden rounded-t-3xl border border-b-0 border-white/10 bg-white/[0.06] backdrop-blur-xl md:grid-cols-4">
              {t.stats.map((s, i) => (
                <div key={s.label} className={cn('px-5 py-4 md:px-7 md:py-6', i % 2 === 1 && 'border-s border-white/10', i >= 2 && 'border-t border-white/10 md:border-t-0', i === 2 && 'md:border-s')}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-2xl font-bold text-white md:text-4xl">
                    <Counter value={s.value} suffix={s.suffix} isYear={s.value > 1900} delay={0.6 + i * 0.15} duration={2} />
                  </dd>
                  <dd className="mt-1 text-xs text-white/65 md:text-sm">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Chapter rail (desktop) */}
        <nav aria-label={t.film.rail} className="absolute end-6 top-1/2 hidden -translate-y-1/2 flex-col gap-1 lg:flex xl:end-10">
          {filmChapters.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToChapter(i)}
              aria-label={railLabel(i)}
              aria-current={active === i ? 'step' : undefined}
              className={cn(
                'group flex items-center justify-end gap-3 rounded-full py-1.5 ps-3 font-display text-xs font-semibold tabular-nums transition-colors',
                active === i ? 'text-accent' : 'text-white/45 hover:text-white',
              )}
            >
              <span className={cn('h-px transition-all duration-300', active === i ? 'w-8 bg-accent' : 'w-4 bg-white/30 group-hover:w-6 group-hover:bg-white')} />
              {String(i).padStart(2, '0')}
            </button>
          ))}
        </nav>

        {/* Scroll hint, gone after the first 3% */}
        <button
          ref={hintRef}
          type="button"
          onClick={() => goToChapter(1)}
          className="absolute bottom-48 end-6 hidden flex-col items-center gap-3 text-xs uppercase tracking-widest text-white/70 hover:text-white md:flex xl:end-10 rtl:tracking-normal"
        >
          {t.hero.scroll}
          <span aria-hidden className="lane-dash h-12 w-[3px] [background-size:100%_12px]" />
        </button>

        {/* Sound toggle */}
        <button
          type="button"
          onClick={sound.toggle}
          data-sound-toggle
          aria-pressed={sound.on}
          aria-label={sound.on ? t.film.soundOff : t.film.soundOn}
          className="absolute end-4 top-24 flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-navy-deep/40 px-4 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10 md:end-6 md:top-28 xl:end-10"
        >
          {sound.on ? <Volume2 className="h-4 w-4 text-accent" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
          <span className="hidden sm:inline">{sound.on ? t.film.soundOff : t.film.soundOn}</span>
        </button>

        {/* Progress bar */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10">
          <div ref={barRef} className="h-full origin-left scale-x-0 bg-accent rtl:origin-right" />
        </div>
      </div>
    </section>
  );
}
