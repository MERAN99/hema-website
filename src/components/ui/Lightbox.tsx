import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageProvider';

type Props = { images: string[]; index: number | null; onClose: () => void; onChange: (i: number) => void; alt: string };

export function Lightbox({ images, index, onClose, onChange, alt }: Props) {
  const { t, isRtl } = useLanguage();
  const open = index !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      const forward = isRtl ? 'ArrowLeft' : 'ArrowRight';
      const back = isRtl ? 'ArrowRight' : 'ArrowLeft';
      if (e.key === forward) onChange((index! + 1) % images.length);
      if (e.key === back) onChange((index! - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [open, index, images.length, isRtl, onChange, onClose]);

  const navBtn = 'grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-deep/95 p-4 md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button type="button" onClick={onClose} aria-label={t.lightbox.close} className={`${navBtn} absolute end-4 top-4`}>
            <X className="h-5 w-5" />
          </button>
          <motion.img
            key={images[index!]}
            src={images[index!]}
            alt={alt}
            className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-4" onClick={(e) => e.stopPropagation()}>
              <button type="button" aria-label={t.lightbox.prev} className={navBtn} onClick={() => onChange((index! - 1 + images.length) % images.length)}>
                <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
              </button>
              <span dir="ltr" className="min-w-16 text-center text-sm text-white/70 tabular-nums">
                {index! + 1} / {images.length}
              </span>
              <button type="button" aria-label={t.lightbox.next} className={navBtn} onClick={() => onChange((index! + 1) % images.length)}>
                <ChevronRight className="h-5 w-5 rtl:rotate-180" />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
