import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageProvider';
import { imgSet, moreProjects, type SmallProject } from '../data/company';
import { SectionHeading } from './ui/SectionHeading';

function Card({ p }: { p: SmallProject }) {
  const { lang } = useLanguage();
  return (
    <article className="group relative aspect-[3/4] w-[78vw] shrink-0 snap-start overflow-hidden rounded-[1.75rem] bg-navy sm:w-[46vw] lg:h-[min(62vh,36rem)] lg:w-auto">
      <img {...imgSet(p.image, '(min-width: 1024px) 45vw, (min-width: 640px) 82vw, 140vw')} alt={p.title[lang]} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="mb-2 inline-flex rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">{p.period}</p>
        <h3 className="font-display text-xl font-semibold leading-snug text-white">{p.title[lang]}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-white/70">
          <MapPin className="h-4 w-4" />
          {p.location[lang]}
        </p>
      </div>
    </article>
  );
}

/** Pinned section: vertical scrolling drives the cards sideways on large screens; a swipeable row on small ones. */
export function MoreProjects() {
  const { t, isRtl } = useLanguage();
  const reduce = useReducedMotion();
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [pinned, setPinned] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const lg = window.matchMedia('(min-width: 1024px)').matches && !reduce;
      setPinned(lg);
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [reduce]);

  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, isRtl ? distance : -distance]);

  return (
    <section className="bg-surface" aria-label={t.projects.moreEyebrow}>
      <div ref={outer} style={pinned ? { height: `calc(100vh + ${distance}px)` } : undefined} className="relative">
        <div className={pinned ? 'sticky top-0 flex h-screen flex-col justify-center overflow-hidden' : 'py-24'}>
          <div className="container-x mb-10 flex items-end justify-between gap-6">
            <SectionHeading eyebrow={t.projects.moreEyebrow} title={t.projects.moreTitle} />
            <p className="hidden shrink-0 items-center gap-2 text-sm text-muted lg:flex">
              {t.projects.dragHint}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </p>
          </div>
          <motion.div
            ref={track}
            style={pinned ? { x } : undefined}
            className={
              pinned
                ? 'flex w-max gap-5 ps-12 pe-12'
                : 'flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] md:px-8 [&::-webkit-scrollbar]:hidden'
            }
          >
            {moreProjects.map((p) => (
              <Card key={p.id} p={p} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
