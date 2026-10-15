import { Reveal } from './Reveal';
import { cn } from '../../lib';

type Props = { eyebrow: string; title: string; subtitle?: string; tone?: 'light' | 'dark'; className?: string; align?: 'start' | 'center' };

export function SectionHeading({ eyebrow, title, subtitle, tone = 'light', className, align = 'start' }: Props) {
  const dark = tone === 'dark';
  return (
    <Reveal className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      <p className={cn('mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] rtl:tracking-normal', align === 'center' && 'justify-center', dark ? 'text-accent' : 'text-brass')}>
        <span className="lane-dash-x inline-block h-[3px] w-10 rounded-full" aria-hidden />
        {eyebrow}
      </p>
      <h2 className={cn('font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl rtl:leading-snug rtl:tracking-normal', dark ? 'text-white' : 'text-foreground')}>
        {title}
      </h2>
      {subtitle && <p className={cn('mt-5 text-base leading-relaxed md:text-lg', dark ? 'text-white/70' : 'text-muted')}>{subtitle}</p>}
    </Reveal>
  );
}
