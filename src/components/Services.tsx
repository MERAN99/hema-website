import { Building2, Construction, Droplets, Factory, Milestone, Ruler } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageProvider';
import { Reveal } from './ui/Reveal';
import { SectionHeading } from './ui/SectionHeading';

const icons: Record<string, typeof Building2> = {
  buildings: Building2,
  roads: Milestone,
  water: Droplets,
  bridges: Construction,
  survey: Ruler,
  plants: Factory,
};

export function Services() {
  const { t } = useLanguage();
  return (
    <section id="services" className="py-24 md:py-32">
      <div className="container-x">
        <SectionHeading eyebrow={t.services.eyebrow} title={t.services.title} />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.services.items.map((s, i) => {
            const Icon = icons[s.key];
            return (
              <Reveal key={s.key} delay={(i % 3) * 0.08}>
                <article className="group relative h-full overflow-hidden rounded-3xl border border-border bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:bg-navy hover:shadow-2xl hover:shadow-navy/25 md:p-8">
                  <div className="flex items-start justify-between">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="font-display text-sm font-semibold text-muted/60 transition-colors group-hover:text-white/40">0{i + 1}</span>
                  </div>
                  <h3 className="mt-8 font-display text-xl font-semibold transition-colors group-hover:text-white">{s.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted transition-colors group-hover:text-white/70">{s.text}</p>
                  <span aria-hidden className="lane-dash-x absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" />
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
