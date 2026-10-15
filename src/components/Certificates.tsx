import { useState } from 'react';
import { BadgeCheck, ZoomIn } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageProvider';
import { certificates, img, imgSet } from '../data/company';
import { Lightbox } from './ui/Lightbox';
import { Reveal } from './ui/Reveal';
import { SectionHeading } from './ui/SectionHeading';

export function Certificates() {
  const { t } = useLanguage();
  const [index, setIndex] = useState<number | null>(null);

  return (
    <section className="border-t border-border bg-surface py-24 md:py-28" aria-label={t.certs.eyebrow}>
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:items-center">
        <div>
          <BadgeCheck className="mb-6 h-10 w-10 text-brass" strokeWidth={1.5} />
          <SectionHeading eyebrow={t.certs.eyebrow} title={t.certs.title} />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {certificates.map((c, i) => (
            <Reveal key={c} delay={i * 0.06} className={i === 0 ? 'col-span-2 sm:col-span-1 sm:row-span-2' : ''}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${t.certs.open}: ${t.certs.caption}`}
                className="group relative block h-full w-full overflow-hidden rounded-2xl border border-border bg-background p-2"
              >
                <img {...imgSet(c, '(min-width: 1024px) 20vw, 45vw')} alt={t.certs.caption} loading="lazy" className="h-full max-h-80 w-full rounded-xl object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]" />
                <span className="absolute inset-0 grid place-items-center bg-navy/0 opacity-0 transition-all group-hover:bg-navy/40 group-hover:opacity-100">
                  <ZoomIn className="h-8 w-8 text-white" />
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
      <Lightbox images={certificates.map(img)} index={index} alt={t.certs.caption} onClose={() => setIndex(null)} onChange={setIndex} />
    </section>
  );
}
