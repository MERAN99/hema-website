import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageProvider';
import { fleet, fleetBrands, imgSet } from '../data/company';
import { Counter } from './ui/Counter';
import { Reveal } from './ui/Reveal';
import { SectionHeading } from './ui/SectionHeading';

export function Fleet() {
  const { t, isRtl } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);
  const max = Math.max(...fleet.map((f) => f.count));
  const total = fleet.reduce((s, f) => s + f.count, 0);

  return (
    <section id="fleet" ref={ref} className="grain relative isolate overflow-hidden bg-navy py-24 text-white md:py-32">
      <motion.div aria-hidden className="absolute -inset-y-[20%] end-0 -z-10 hidden w-1/2 opacity-25 lg:block" style={reduce ? undefined : { y: imgY }}>
        <img {...imgSet('baban-4.jpg', '50vw')} alt="" loading="lazy" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy to-transparent rtl:bg-gradient-to-l" />
      </motion.div>

      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <SectionHeading tone="dark" eyebrow={t.fleet.eyebrow} title={t.fleet.title} subtitle={t.fleet.subtitle} />
          <Reveal className="lg:text-end">
            <p className="font-display text-7xl font-extrabold text-accent md:text-8xl">
              <Counter value={total} />
            </p>
            <p className="text-white/60">{t.fleet.total}</p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fleet.map((f, i) => (
            <Reveal key={f.key} delay={(i % 3) * 0.06} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition-colors hover:bg-white/[0.08]">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-lg font-semibold">{t.fleet.categories[f.key]}</h3>
                <p className="shrink-0 font-display text-3xl font-bold text-accent">
                  <Counter value={f.count} />
                </p>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-accent"
                  initial={{ width: reduce ? `${(f.count / max) * 100}%` : 0 }}
                  whileInView={{ width: `${(f.count / max) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                />
              </div>
              <p className="mt-3 text-sm text-white/55">
                {f.brands}
              </p>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-20 overflow-hidden border-y border-white/10 py-6" aria-hidden>
        <div className={`flex w-max gap-14 ${isRtl ? 'animate-marquee-rtl' : 'animate-marquee'}`}>
          {[...fleetBrands, ...fleetBrands].map((b, i) => (
            <span key={i} className="flex items-center gap-14 whitespace-nowrap font-display text-2xl font-bold text-white/25 md:text-4xl">
              {b}
              <span className="h-2 w-2 rounded-full bg-accent/60" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
