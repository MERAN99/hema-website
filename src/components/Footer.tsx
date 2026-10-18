import { ArrowUp } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageProvider';
import { scrollToId } from '../hooks/useSmoothScroll';
import { contact, img } from '../data/company';

const links = ['about', 'services', 'projects', 'fleet', 'team', 'contact'] as const;

export function Footer() {
  const { t } = useLanguage();
  const [before, after] = t.footer.credit.split('{name}');
  return (
    <footer className="relative bg-navy-deep text-white">
      <div aria-hidden className="flex h-7 items-center bg-[#123361]">
        <div className="lane-dash-x h-[3px] w-full [background-size:56px_100%]" />
      </div>
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <img src={img('logo-full.png')} alt={t.brand.name} className="h-24 w-auto rounded-2xl bg-white p-3" />
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/60">{t.footer.blurb}</p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-white/75 md:grid-cols-1">
            {links.map((l) => (
              <li key={l}>
                <a
                  href={`#${l}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToId(l);
                  }}
                  className="hover:text-accent"
                >
                  {t.nav[l]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-2 text-white/75">
          {contact.phones.map((p) => (
            <a key={p} href={`tel:${p}`} className="block hover:text-accent">
              <span dir="ltr">{p}</span>
            </a>
          ))}
          <a href={`mailto:${contact.email}`} className="block break-all hover:text-accent">
            {contact.email}
          </a>
          <p className="text-sm text-white/50">{t.contact.addressValue}</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-4 py-6 text-sm text-white/50 sm:flex-row">
          <div className="space-y-1 text-center sm:text-start">
            <p>
              © {new Date().getFullYear()} {t.brand.name} {t.brand.tagline.replace(/\.$/, '')}. {t.footer.rights}
            </p>
            <p className="text-white/60">
              {before}
              {/* <bdi> keeps the Latin brand name in the right order inside Kurdish and Arabic sentences. */}
              <bdi dir="ltr" className="font-semibold text-white/70">
                DAAR AI
              </bdi>
              {after}
            </p>
          </div>
          <button type="button" onClick={() => scrollToId('top')} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-white/80 hover:bg-white/10">
            <ArrowUp className="h-4 w-4" />
            {t.footer.top}
          </button>
        </div>
      </div>
    </footer>
  );
}
