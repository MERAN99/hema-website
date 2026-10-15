import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageProvider';
import { img } from '../data/company';
import { Reveal } from './ui/Reveal';

export function Vision() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-20%', '20%']);
  const quoteX = useTransform(scrollYProgress, [0, 1], [80, -80]);
  // The sideways drift needs room, so it only runs on wide screens.
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <section ref={ref} className="grain relative isolate overflow-hidden bg-navy-deep py-28 md:py-40">
      <motion.div className="absolute -inset-y-[25%] inset-x-0 -z-10" style={reduce ? undefined : { y }}>
        <img src={img('asphalt-wide.jpg')} alt="" loading="lazy" className="h-full w-full object-cover" />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-navy-deep/80" />
      <div className="container-x">
        <Reveal>
          <p className="mb-6 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-accent rtl:tracking-normal">
            <span className="lane-dash-x inline-block h-[3px] w-10 rounded-full" />
            {t.vision.eyebrow}
          </p>
        </Reveal>
        <motion.blockquote style={reduce || !wide ? undefined : { x: quoteX }} className="max-w-5xl">
          <Quote className="mb-4 h-10 w-10 text-accent rtl:-scale-x-100" />
          <p className="font-display text-3xl font-bold leading-tight text-white md:text-5xl lg:text-6xl rtl:leading-snug">{t.vision.quote}</p>
        </motion.blockquote>
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <Reveal className="text-[17px] leading-relaxed text-white/75">{t.vision.body}</Reveal>
          <Reveal delay={0.1} className="text-[17px] leading-relaxed text-white/75">
            {t.vision.body2}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
