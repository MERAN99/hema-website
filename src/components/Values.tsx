import { HardHat, Handshake, MessagesSquare, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageProvider';
import { Reveal } from './ui/Reveal';

const icons = [Handshake, ShieldCheck, MessagesSquare, HardHat];

export function Values() {
  const { t } = useLanguage();
  return (
    <section className="border-y border-border bg-surface py-16 md:py-20" aria-label={t.values.eyebrow}>
      <div className="container-x">
        <p className="mb-10 text-sm font-semibold uppercase tracking-[0.18em] text-brass rtl:tracking-normal">{t.values.eyebrow}</p>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {t.values.items.map((v, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={v.title} delay={i * 0.08}>
                <Icon className="h-8 w-8 text-foreground" strokeWidth={1.5} />
                <h3 className="mt-5 font-display text-xl font-semibold">{v.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{v.text}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
