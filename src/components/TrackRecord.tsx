import { useLanguage } from '../i18n/LanguageProvider';
import { trackRecord } from '../data/company';
import { formatNumber } from '../lib';
import { Reveal } from './ui/Reveal';
import { SectionHeading } from './ui/SectionHeading';

export function TrackRecord() {
  const { t, lang } = useLanguage();
  const money = (v: number, c: 'IQD' | 'USD') => (c === 'USD' ? `$ ${formatNumber(v)}` : `${formatNumber(v)} ${t.record.iqd}`);
  const total = trackRecord.filter((r) => r.currency === 'IQD').reduce((s, r) => s + r.value, 0);

  return (
    <section className="py-24 md:py-32" aria-labelledby="record-title">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading eyebrow={t.record.eyebrow} title={t.record.title.replace('{year}', String(new Date().getFullYear()))} />
          <Reveal className="rounded-3xl bg-navy p-6 text-white lg:max-w-sm">
            <p className="text-sm text-white/60">{t.record.total}</p>
            <p className="mt-1 font-display text-2xl font-bold text-accent md:text-3xl">{money(total, 'IQD')}</p>
          </Reveal>
        </div>

        {/* Desktop table */}
        <Reveal className="mt-14 hidden overflow-hidden rounded-3xl border border-border bg-surface md:block">
          <table className="w-full text-start text-[15px]">
            <thead className="bg-navy text-white">
              <tr>
                {[t.record.no, t.record.project, t.record.location, t.record.value, t.record.period].map((h, i) => (
                  <th key={h} scope="col" className={`px-5 py-4 text-start font-semibold ${i === 0 ? 'w-16' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trackRecord.map((r, i) => (
                <tr key={i} className="border-t border-border transition-colors hover:bg-primary/[0.07]">
                  <td className="px-5 py-4 font-display font-semibold text-brass">{String(i + 1).padStart(2, '0')}</td>
                  <td className="px-5 py-4 font-medium">{r.title[lang]}</td>
                  <td className="px-5 py-4 text-muted">{r.location[lang]}</td>
                  <td className="whitespace-nowrap px-5 py-4 font-semibold tabular-nums">{money(r.value, r.currency)}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-muted tabular-nums">{r.period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        {/* Mobile timeline */}
        <ol className="relative mt-12 space-y-4 md:hidden">
          <span aria-hidden className="lane-dash absolute bottom-2 start-[1.15rem] top-2 w-[3px] rounded-full opacity-70" />
          {trackRecord.map((r, i) => (
            <li key={i}>
              <Reveal y={20} className="relative ps-12">
                <span className="absolute start-0 top-4 grid h-10 w-10 place-items-center rounded-full bg-navy font-display text-xs font-bold text-accent ring-4 ring-background">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-xs font-semibold text-brass">{r.period}</p>
                  <p className="mt-1 font-medium leading-snug">{r.title[lang]}</p>
                  <div className="mt-2 flex flex-wrap justify-between gap-2 text-sm text-muted">
                    <span>{r.location[lang]}</span>
                    <span className="font-semibold text-foreground">{money(r.value, r.currency)}</span>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
