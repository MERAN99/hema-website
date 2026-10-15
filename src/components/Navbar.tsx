import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { Check, ChevronDown, Globe, Menu, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageProvider';
import { languages } from '../i18n/translations';
import { scrollToId, setScrollLocked } from '../hooks/useSmoothScroll';
import { img } from '../data/company';
import { cn } from '../lib';

const sections = ['about', 'services', 'projects', 'fleet', 'team', 'contact'] as const;

function LanguageMenu({ solid, onOpen }: { solid: boolean; onOpen?: () => void }) {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = languages.find((l) => l.code === lang)!;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.nav.language}
        onClick={() => {
          if (!open) onOpen?.();
          setOpen((o) => !o);
        }}
        className={cn(
          'flex min-h-11 items-center gap-2 rounded-full border px-3 text-sm font-semibold transition-colors',
          solid ? 'border-white/15 text-white hover:bg-white/10' : 'border-white/25 text-white hover:bg-white/10',
        )}
      >
        <Globe className="h-4 w-4" aria-hidden />
        <span>{current.label}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute end-0 top-full mt-2 w-44 overflow-hidden rounded-2xl border border-border bg-surface p-1.5 shadow-2xl"
          >
            {languages.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={l.code === lang}
                  lang={l.htmlLang}
                  dir={l.dir}
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex min-h-11 w-full items-center justify-between gap-2 rounded-xl px-3 text-start text-[15px] font-medium transition-colors',
                    l.code === lang ? 'bg-primary/15 text-foreground' : 'text-foreground hover:bg-background',
                  )}
                >
                  {l.label}
                  {l.code === lang && <Check className="h-4 w-4 text-brass" aria-hidden />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const { t, isRtl } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setScrollLocked(open);
    if (!open) return () => setScrollLocked(false);
    // Close on Escape, or if the window grows to the desktop layout where the menu is hidden.
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const wide = window.matchMedia('(min-width: 1024px)');
    const onWide = () => wide.matches && setOpen(false);
    document.addEventListener('keydown', esc);
    wide.addEventListener('change', onWide);
    return () => {
      document.removeEventListener('keydown', esc);
      wide.removeEventListener('change', onWide);
      setScrollLocked(false);
    };
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    setScrollLocked(false);
    scrollToId(id);
  };

  return (
    <>
      <header className={cn('fixed inset-x-0 top-0 z-50 transition-all duration-300', open ? 'bg-navy' : scrolled ? 'bg-navy/90 shadow-lg shadow-black/10 backdrop-blur-xl' : 'bg-transparent')}>
        <div className={cn('container-x flex items-center justify-between gap-4 transition-all duration-300', scrolled ? 'h-16' : 'h-20')}>
          <a href="#top" onClick={go('top')} className="flex items-center gap-3" aria-label={t.brand.name}>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white p-1.5 shadow-md">
              <img src={img('logo-mark.png')} alt="" className="h-full w-full object-contain" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[15px] font-bold text-white">{t.brand.name}</span>
              <span className="hidden text-xs text-white/60 sm:block">{t.brand.tagline}</span>
            </span>
          </a>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {sections.map((s) => (
              <a key={s} href={`#${s}`} onClick={go(s)} className="rounded-full px-3.5 py-2 text-[15px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white">
                {t.nav[s]}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageMenu solid={scrolled} onOpen={() => setOpen(false)} />
            <a href="#contact" onClick={go('contact')} className="hidden min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-[#f2b23c] md:inline-flex">
              {t.nav.cta}
            </a>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full text-white hover:bg-white/10 lg:hidden"
              aria-label={open ? t.nav.close : t.nav.menu}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <motion.div className="absolute inset-x-0 bottom-0 h-[3px] bg-accent" style={{ scaleX: progress, transformOrigin: isRtl ? '100% 50%' : '0% 50%' }} aria-hidden />
      </header>

      {/* Rendered outside <header>: its backdrop-blur would otherwise become the containing block and clip this fixed menu.
          The dimmed backdrop behind the panel closes the menu when tapped. */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            aria-hidden
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
        {open && (
          <motion.nav
            key="panel"
            aria-label="Mobile"
            data-lenis-prevent
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-0 z-40 max-h-[100dvh] overflow-y-auto overscroll-contain rounded-b-3xl bg-navy px-4 pb-6 pt-24 shadow-2xl shadow-black/40 lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {sections.map((s, i) => (
                <motion.li key={s} initial={{ opacity: 0, x: isRtl ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <a href={`#${s}`} onClick={go(s)} className="flex min-h-14 items-center justify-between border-b border-white/10 font-display text-2xl font-semibold text-white">
                    {t.nav[s]}
                    <span className="text-sm text-accent">0{i + 1}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <a href="#contact" onClick={go('contact')} className="mt-6 flex min-h-12 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
              {t.nav.cta}
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
