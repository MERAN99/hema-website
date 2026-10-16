import type { ReactNode } from 'react';
import { cn } from '../../lib';

type Variant = 'primary' | 'outline' | 'ghost-light';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-[#3A6DBA] shadow-[0_10px_30px_-10px_rgba(42,92,168,0.7)]',
  outline: 'border border-white/30 text-white hover:bg-white/10',
  'ghost-light': 'border border-border bg-surface text-foreground hover:border-foreground/30',
};

type Props = { href: string; children: ReactNode; variant?: Variant; className?: string; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void };

export function ButtonLink({ href, children, variant = 'primary', className, onClick }: Props) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold transition-all duration-200 active:scale-[0.98]',
        variants[variant],
        className,
      )}
    >
      {children}
    </a>
  );
}
