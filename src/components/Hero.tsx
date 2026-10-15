import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageProvider';
import { scrollToId } from '../hooks/useSmoothScroll';
import { img } from '../data/company';
import { ButtonLink } from './ui/Button';
import { Counter } from './ui/Counter';

export function Hero() {
  const { t, lang } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.25]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const laneY = useTransform(scrollYProgress, [0, 1], ['0%', '-60%']);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToId(id);
  };

  const words = (s: string) => s.split(' ');

  return (
    <section id="top" ref={ref} className="grain relative isolate min-h-[100svh] overflow-hidden bg-navy-deep">
      <motion.div className="absolute inset-0 -z-10" style={reduce ? undefined : { y: bgY, scale: bgScale }}>
        <img src={img('hero-road.jpg')} alt="" className="h-full w-full object-cover object-center" />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-deep/80 via-navy-deep/55 to-navy-deep" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-deep/85 via-navy-deep/30 to-transparent rtl:bg-gradient-to-l" />

      {/* Lane marking that drifts as you scroll: the brand's road motif. */}
      <motion.div aria-hidden className="lane-dash absolute bottom-0 end-[8%] top-0 hidden w-1.5 opacity-60 md:block" style={reduce ? undefined : { y: laneY, height: '200%' }} />

      <motion.div style={reduce ? undefined : { y: textY, opacity: textOpacity }} className="container-x flex min-h-[100svh] flex-col justify-center pb-56 pt-32 md:pb-48">
        <motion.p
          key={`eyebrow-${lang}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex w-fit items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 backdrop-blur"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
          {t.hero.eyebrow}
        </motion.p>

        <h1 key={`h1-${lang}`} className="max-w-4xl font-display text-[2.6rem] font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl rtl:text-[2.1rem] rtl:leading-[1.4] rtl:tracking-normal rtl:sm:text-5xl rtl:lg:text-[3.6rem]">
          {[...words(t.hero.titleA), '\n', ...words(t.hero.titleB)].map((w, i) =>
            w === '\n' ? (
              <br key={i} />
            ) : (
              <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
                <motion.span
                  className={`inline-block ${i > words(t.hero.titleA).length ? 'text-accent' : ''}`}
                  initial={reduce ? false : { y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.15 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}&nbsp;
                </motion.span>
              </span>
            ),
          )}
        </h1>

        <motion.p
          key={`sub-${lang}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg"
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.75 }} className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="#projects" onClick={go('projects')}>
            {t.hero.primary}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </ButtonLink>
          <ButtonLink href="#contact" variant="outline" onClick={go('contact')}>
            {t.hero.secondary}
          </ButtonLink>
        </motion.div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0">
        <div className="container-x">
          <motion.dl
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="grid grid-cols-2 overflow-hidden rounded-t-3xl border border-b-0 border-white/10 bg-white/[0.06] backdrop-blur-xl md:grid-cols-4"
          >
            {t.stats.map((s, i) => (
              <div key={s.label} className={`px-5 py-5 md:px-7 md:py-7 ${i % 2 === 1 ? 'border-s border-white/10' : ''} ${i >= 2 ? 'border-t border-white/10 md:border-t-0' : ''} ${i === 2 ? 'md:border-s' : ''}`}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-3xl font-bold text-white md:text-4xl">
                  <Counter value={s.value} suffix={s.suffix} isYear={s.value > 1900} />
                </dd>
                <dd className="mt-1 text-sm text-white/65">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>

      <button type="button" onClick={() => scrollToId('about')} className="absolute bottom-40 end-6 hidden flex-col items-center gap-2 text-xs uppercase tracking-widest text-white/60 hover:text-white lg:flex rtl:tracking-normal">
        {t.hero.scroll}
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </button>
    </section>
  );
}
