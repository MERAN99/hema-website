import { BarChart3, Crown, HardHat, Ruler, Scale, Truck, Wallet } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageProvider';
import { team, type TeamIcon } from '../data/company';
import { Reveal } from './ui/Reveal';
import { SectionHeading } from './ui/SectionHeading';

const icons: Record<TeamIcon, typeof Crown> = { crown: Crown, hardhat: HardHat, wallet: Wallet, scale: Scale, chart: BarChart3, truck: Truck, ruler: Ruler };

export function Team() {
  const { t, lang } = useLanguage();
  const [lead, ...rest] = team;
  const LeadIcon = icons[lead.icon];

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

        {/* Connector from the general manager down to the departments. */}
        <div aria-hidden className="mx-auto hidden h-12 w-[3px] lane-dash md:block" />
        <div aria-hidden className="mx-auto hidden h-[3px] w-[calc(100%-16rem)] max-w-4xl lane-dash-x lg:block" />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {rest.map((m, i) => {
            const Icon = icons[m.icon];
            return (
              <Reveal key={m.name.en} delay={(i % 3) * 0.07}>
                <div className="group flex h-full items-center gap-4 rounded-3xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-background text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brass">{m.role[lang]}</p>
                    <p className="mt-0.5 font-display text-[17px] font-semibold leading-snug">{m.name[lang]}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
