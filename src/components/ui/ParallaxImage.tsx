import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { cn } from '../../lib';

type Props = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** How far (in % of the frame) the photo drifts while the frame crosses the viewport. */
  speed?: number;
  onClick?: () => void;
};

/** A cropped frame whose photo moves slower than the page, giving depth while scrolling. */
export function ParallaxImage({ src, alt, className, imgClassName, speed = 12, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${speed}%`, `${speed}%`]);
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <Wrapper
        {...(onClick ? { type: 'button' as const, onClick, 'aria-label': alt } : {})}
        className="group absolute inset-0 block h-full w-full cursor-pointer"
      >
        <motion.img
          src={src}
          alt={alt}
          loading="lazy"
          style={reduce ? undefined : { y, scale: 1 + (speed * 2.4) / 100 }}
          className={cn('h-full w-full object-cover transition-[filter] duration-500 group-hover:brightness-110', imgClassName)}
        />
      </Wrapper>
    </div>
  );
}
