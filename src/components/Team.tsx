import { BarChart3, Crown, HardHat, Monitor, Ruler, Scale, Truck, Wallet } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageProvider';
import { team, type TeamIcon } from '../data/company';
import { Reveal } from './ui/Reveal';
import { SectionHeading } from './ui/SectionHeading';

const icons: Record<TeamIcon, typeof Crown> = {
  crown: Crown,
  hardhat: HardHat,
  wallet: Wallet,
  scale: Scale,
  chart: BarChart3,
  truck: Truck,
  ruler: Ruler,
  monitor: Monitor,
};

/** Departments per row in the large-screen org chart. */
const PER_ROW = 4;
/** Space between department cards in the org chart, in px. */
const GAP = 24;

export function Team() {
  const { t, lang } = useLanguage();
  const [lead, ...rest] = team;
  const LeadIcon = icons[lead.icon];

  const card = (m: (typeof team)[number]) => {
    const Icon = icons[m.icon];
    return (
      <div className="group flex h-full items-center gap-4 rounded-3xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-background text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-brass">{m.role[lang]}</p>
          <p className="mt-0.5 font-display text-[17px] font-semibold leading-snug">{m.name[lang]}</p>
        </div>
      </div>
    );
  };

  const rows: (typeof team)[] = [];
  for (let i = 0; i < rest.length; i += PER_ROW) rows.push(rest.slice(i, i + PER_ROW));

  return (
    <section id="team" className="py-24 md:py-32">
      <div className="container-x">
        <SectionHeading eyebrow={t.team.eyebrow} title={t.team.title} align="center" />

        <Reveal className="mx-auto mt-14 max-w-md">
          <div className="relative flex items-center gap-5 overflow-hidden rounded-3xl bg-navy p-6 text-white shadow-2xl shadow-navy/25">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-accent text-navy-deep">
              <LeadIcon className="h-7 w-7" />
            </span>
            <div>
              <p className="text-sm font-medium text-accent">{lead.role[lang]}</p>
              <p className="mt-1 font-display text-xl font-semibold">{lead.name[lang]}</p>
            </div>
          </div>
        </Reveal>

        {/* Phones and tablets: a simple grid under the general manager. */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:hidden">
          {rest.map((m, i) => (
            <Reveal key={m.name.en} delay={(i % 2) * 0.07}>
              {card(m)}
            </Reveal>
          ))}
        </div>

        {/* Large screens: org chart. A soft line runs down from the general manager to a junction dot, then a
            rounded bracket spreads across each row and a line drops to a dot on top of every department. */}
        <div className="hidden lg:block">
          {rows.map((row, r) => {
            const n = row.length;
            const last = r === rows.length - 1;
            // Centre of the first / last card, measured from the row's edges (cards are separated by a 24px gap).
            const edge = `calc(${100 / (2 * n)}% - ${((n - 1) * GAP) / (2 * n)}px)`;
            return (
              <div key={r} className={r === 0 ? 'mt-0' : 'mt-2'}>
                {/* Line down to this row. */}
                <div aria-hidden className="mx-auto h-10 w-0.5 rounded-full bg-gradient-to-b from-accent/30 to-accent/70" />
                <div className="relative mx-auto pt-12" style={{ width: `${(n / PER_ROW) * 100}%` }}>
                  {/* Rounded bracket across the row; its sides are the lines to the first and last card. */}
                  {n > 1 ? (
                    <div
                      aria-hidden
                      className="absolute top-0 h-12 rounded-t-[1.75rem] border-2 border-b-0 border-accent/70"
                      style={{ insetInlineStart: edge, insetInlineEnd: edge }}
                    />
                  ) : (
                    <div aria-hidden className="absolute start-1/2 top-0 h-12 w-0.5 -translate-x-1/2 bg-accent/70 rtl:translate-x-1/2" />
                  )}
                  {/* Junction dot where the line from above meets the bracket. */}
                  <span aria-hidden className="absolute start-1/2 top-0 z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-4 ring-background rtl:translate-x-1/2" />
                  {/* Faint line on through the middle of this row to the next one. */}
                  {!last && <div aria-hidden className="absolute start-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-accent/25 rtl:translate-x-1/2" />}
                  <div className="grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gap: GAP }}>
                    {row.map((m, i) => (
                      <div key={m.name.en} className="relative">
                        {/* Middle cards get their own drop line; the bracket's sides serve the first and last. */}
                        {i > 0 && i < n - 1 && (
                          <div aria-hidden className="absolute start-1/2 -top-12 h-12 w-0.5 -translate-x-1/2 bg-accent/70 rtl:translate-x-1/2" />
                        )}
                        {/* Dot where the line lands on the card. */}
                        <span aria-hidden className="absolute start-1/2 top-0 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-4 ring-background rtl:translate-x-1/2" />
                        <Reveal delay={i * 0.07} className="h-full">
                          {card(m)}
                        </Reveal>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
