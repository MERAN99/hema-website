import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Award, Building2, CheckCircle2, Landmark, MapPin } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageProvider';
import { imgSet, parallaxSet } from '../data/company';
import { ParallaxImage } from './ui/ParallaxImage';
import { Reveal } from './ui/Reveal';
import { SectionHeading } from './ui/SectionHeading';

export function About() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const floatY = useTransform(scrollYProgress, [0, 1], [120, -120]);
  const badgeY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-6, 6]);

  const facts = [
    { icon: Award, label: t.about.gradeLabel, value: t.about.grade },
    { icon: Landmark, label: t.about.capitalLabel, value: t.about.capital },
    { icon: MapPin, label: t.about.badgeTitle, value: t.about.badge },
  ];

  return (
    <section id="about" className="relative overflow-hidden py-24 md:py-32">
      <div className="container-x grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
        <div ref={ref} className="relative order-2 lg:order-1">
          <ParallaxImage {...parallaxSet('engineers.jpg', '(min-width: 1024px) 85vw, 100vw')} alt="" speed={10} className="aspect-[4/5] rounded-[2rem] shadow-2xl shadow-navy/20 sm:aspect-[5/4] lg:aspect-[4/5]" />
          <motion.img
            {...imgSet('infinity-road.png', '(min-width: 1024px) 320px, (min-width: 640px) 288px, 224px')}
            loading="lazy"
            alt=""
            aria-hidden
            style={reduce ? undefined : { y: floatY, rotate }}
            className="pointer-events-none absolute -bottom-10 -end-4 w-56 drop-shadow-2xl sm:w-72 lg:-end-12 lg:w-80"
          />
          <motion.div
            style={reduce ? undefined : { y: badgeY }}
            className="absolute -top-6 start-4 flex items-center gap-3 rounded-2xl bg-navy px-5 py-4 text-white shadow-xl sm:start-8"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-navy-deep">
              <Building2 className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-display text-2xl font-bold leading-none">2004</span>
              <span className="text-xs text-white/65">{t.stats[0].label}</span>
            </span>
          </motion.div>
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeading eyebrow={t.about.eyebrow} title={t.about.title} />
          <Reveal delay={0.1} className="mt-8 space-y-5 text-[17px] leading-relaxed text-muted">
            <p>{t.about.p1}</p>
            <p>{t.about.p2}</p>
            <p>{t.about.p3}</p>
          </Reveal>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {t.about.highlights.map((h, i) => (
              <li key={h}>
                <Reveal delay={0.05 * i} className="flex h-full gap-3 rounded-2xl border border-border bg-surface p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
                  <span className="text-[15px] leading-snug text-foreground">{h}</span>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-x mt-24">
        <div className="grid gap-4 md:grid-cols-3">
          {facts.map((f, i) => (
            <Reveal key={f.label} delay={i * 0.08} className="flex items-center gap-4 rounded-2xl bg-navy p-6 text-white">
              <f.icon className="h-7 w-7 shrink-0 text-accent" />
              <div>
                <p className="text-sm text-white/60">{f.label}</p>
                <p className="font-display text-lg font-semibold">{f.value}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
