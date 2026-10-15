import { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Calendar, Handshake, Images, MapPin, Ruler, Wallet } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageProvider';
import { featuredProjects, img, type FeaturedProject } from '../data/company';
import { cn } from '../lib';
import { Lightbox } from './ui/Lightbox';
import { ParallaxImage } from './ui/ParallaxImage';
import { Reveal } from './ui/Reveal';
import { SectionHeading } from './ui/SectionHeading';

function ProjectRow({ project, index, onOpen }: { project: FeaturedProject; index: number; onOpen: (i: number) => void }) {
  const { t, lang } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const smallY = useTransform(scrollYProgress, [0, 1], [140, -140]);
  const tinyY = useTransform(scrollYProgress, [0, 1], [-60, 90]);
  const numberY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const flip = index % 2 === 1;
  const iqd = !project.value.startsWith('$');
  const units = lang === 'en' ? null : lang === 'ku' ? { km: 'کم', m: 'م' } : { km: 'كم', m: 'م' };
  const localize = (s: string) => (units ? s.replace(/ km\b/g, ` ${units.km}`).replace(/ m\b/g, ` ${units.m}`) : s);

  const meta = [
    { icon: MapPin, label: t.projects.location, value: project.location[lang] },
    project.length && { icon: Ruler, label: t.projects.length, value: localize(project.width ? `${project.length} × ${project.width}` : project.length) },
    { icon: Calendar, label: t.projects.period, value: project.period },
    { icon: Wallet, label: t.projects.value, value: iqd ? `${project.value} ${t.record.iqd}` : project.value },
    project.partner && { icon: Handshake, label: t.projects.partner, value: project.partner[lang] },
  ].filter(Boolean) as { icon: typeof MapPin; label: string; value: string }[];

  return (
    <article ref={ref} className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
      <div className={cn('relative lg:col-span-7', flip && 'lg:order-2')}>
        <motion.span
          aria-hidden
          style={reduce ? undefined : { y: numberY }}
          className={cn('pointer-events-none absolute -top-14 z-10 font-display text-[7rem] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgb(var(--brass))] md:text-[9rem]', flip ? 'end-0' : 'start-0')}
        >
          0{index + 1}
        </motion.span>
        <ParallaxImage
          src={img(project.images[0])}
          alt={project.title[lang]}
          speed={10}
          onClick={() => onOpen(0)}
          className="aspect-[4/3] rounded-[2rem] shadow-2xl shadow-navy/20"
        />
        <motion.button
          type="button"
          onClick={() => onOpen(1)}
          style={reduce ? undefined : { y: smallY }}
          className={cn(
            'absolute -bottom-10 hidden aspect-[4/3] w-[42%] overflow-hidden rounded-3xl border-[6px] border-background shadow-2xl sm:block',
            flip ? '-start-6' : '-end-6',
          )}
          aria-label={project.title[lang]}
        >
          <img src={img(project.images[1])} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
        </motion.button>
        <motion.button
          type="button"
          onClick={() => onOpen(2)}
          style={reduce ? undefined : { y: tinyY }}
          className={cn('absolute top-10 hidden aspect-square w-[24%] overflow-hidden rounded-2xl border-4 border-background shadow-xl md:block', flip ? '-end-8' : '-start-8')}
          aria-label={project.title[lang]}
        >
          <img src={img(project.images[2])} alt="" loading="lazy" className="h-full w-full object-cover" />
        </motion.button>
      </div>

      <div className={cn('lg:col-span-5', flip && 'lg:order-1')}>
        <Reveal>
          <h3 className="font-display text-2xl font-bold leading-tight tracking-tight md:text-4xl rtl:leading-snug rtl:tracking-normal">{project.title[lang]}</h3>
          <p className="mt-5 text-[16px] leading-relaxed text-muted">{project.summary[lang]}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <ul className="mt-6 space-y-2.5">
            {project.highlights[lang].map((h) => (
              <li key={h} className="flex items-start gap-3 text-[15px] text-foreground">
                <span className="mt-2 h-1.5 w-4 shrink-0 rounded-full bg-accent" />
                {h}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.14}>
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-6">
            {meta.map((m) => (
              <div key={m.label} className="min-w-0">
                <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted rtl:tracking-normal">
                  <m.icon className="h-3.5 w-3.5" />
                  {m.label}
                </dt>
                <dd className="mt-1 break-words font-display text-[15px] font-semibold">{m.value}</dd>
              </div>
            ))}
          </dl>
          <button
            type="button"
            onClick={() => onOpen(0)}
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-surface px-5 text-[15px] font-semibold transition hover:border-foreground/30 hover:bg-navy hover:text-white"
          >
            <Images className="h-4 w-4" />
            {t.projects.gallery} ({project.images.length})
          </button>
        </Reveal>
      </div>
    </article>
  );
}

export function Projects() {
  const { t, lang } = useLanguage();
  const [gallery, setGallery] = useState<{ project: FeaturedProject; index: number } | null>(null);

  return (
    <section id="projects" className="relative overflow-hidden bg-background py-24 md:py-32">
      <div className="container-x">
        <SectionHeading eyebrow={t.projects.eyebrow} title={t.projects.title} subtitle={t.projects.subtitle} />
        <div className="mt-28 space-y-36 md:space-y-48">
          {featuredProjects.map((p, i) => (
            <ProjectRow key={p.id} project={p} index={i} onOpen={(index) => setGallery({ project: p, index })} />
          ))}
        </div>
      </div>
      <Lightbox
        images={gallery ? gallery.project.images.map(img) : []}
        index={gallery?.index ?? null}
        alt={gallery?.project.title[lang] ?? ''}
        onClose={() => setGallery(null)}
        onChange={(index) => setGallery((g) => (g ? { ...g, index } : g))}
      />
    </section>
  );
}
