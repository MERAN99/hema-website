import { useState } from 'react';
import { ExternalLink, Globe, Mail, MapPin, Phone, Send } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageProvider';
import { contact, parallaxSet } from '../data/company';
import { cn } from '../lib';
import { ParallaxImage } from './ui/ParallaxImage';
import { Reveal } from './ui/Reveal';
import { SectionHeading } from './ui/SectionHeading';

type Field = 'name' | 'email' | 'phone' | 'message';

export function Contact() {
  const { t } = useLanguage();
  const f = t.contact.form;
  const [values, setValues] = useState<Record<Field, string>>({ name: '', email: '', phone: '', message: '' });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});

  const errors: Partial<Record<Field, string>> = {};
  if (!values.name.trim()) errors.name = f.required;
  if (!values.email.trim()) errors.email = f.required;
  else if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = f.invalidEmail;
  if (!values.message.trim()) errors.message = f.required;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(errors).length) return;
    const body = `${values.message}\n\n${values.name}\n${values.email}${values.phone ? `\n${values.phone}` : ''}`;
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(f.subject)}&body=${encodeURIComponent(body)}`;
  };

  const input = (name: Field, label: string, opts: { type?: string; textarea?: boolean; autoComplete?: string } = {}) => {
    const err = touched[name] ? errors[name] : undefined;
    const cls = cn(
      'w-full rounded-2xl border bg-white/[0.06] px-4 text-[16px] text-white placeholder-white/40 outline-none transition focus:border-accent focus:bg-white/10',
      err ? 'border-red-400' : 'border-white/15',
      opts.textarea ? 'min-h-36 py-3' : 'min-h-12',
    );
    const props = {
      id: `f-${name}`,
      name,
      value: values[name],
      'aria-invalid': !!err,
      'aria-describedby': err ? `e-${name}` : undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues((v) => ({ ...v, [name]: e.target.value })),
      onBlur: () => setTouched((tt) => ({ ...tt, [name]: true })),
      className: cls,
    };
    return (
      <div className={opts.textarea ? 'sm:col-span-2' : ''}>
        <label htmlFor={`f-${name}`} className="mb-2 block text-sm font-medium text-white/80">
          {label}
        </label>
        {opts.textarea ? <textarea {...props} rows={5} /> : <input {...props} type={opts.type ?? 'text'} autoComplete={opts.autoComplete} dir={opts.type === 'email' || opts.type === 'tel' ? 'ltr' : undefined} />}
        {err && (
          <p id={`e-${name}`} className="mt-1.5 text-sm text-red-300">
            {err}
          </p>
        )}
      </div>
    );
  };

  const cards = [
    { icon: Phone, label: t.contact.phone, content: contact.phones.map((p) => <a key={p} href={`tel:${p}`} className="block hover:text-accent"><span dir="ltr">{p.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3')}</span></a>) },
    { icon: Globe, label: t.contact.website, content: <span dir="ltr">{contact.website}</span> },
    { icon: Mail, wide: true, label: t.contact.email, content: <a href={`mailto:${contact.email}`} className="break-all hover:text-accent">{contact.email}</a> },
    { icon: MapPin, wide: true, label: t.contact.address, content: (<><span className="block">{t.contact.addressValue}</span><a href={contact.mapUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">{t.contact.map}<ExternalLink className="h-3.5 w-3.5" /></a></>) },
  ];

  return (
    <section id="contact" className="relative overflow-hidden bg-navy-deep py-24 text-white md:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading tone="dark" eyebrow={t.contact.eyebrow} title={t.contact.title} subtitle={t.contact.subtitle} />
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {cards.map((c, i) => (
              <Reveal key={c.label} delay={i * 0.06} className={cn('rounded-2xl border border-white/10 bg-white/[0.04] p-5', 'wide' in c && c.wide && 'sm:col-span-2')}>
                <c.icon className="h-5 w-5 text-accent" />
                <p className="mt-3 text-sm text-white/55">{c.label}</p>
                <div className="mt-1 font-medium leading-relaxed">{c.content}</div>
              </Reveal>
            ))}
          </div>
          <ParallaxImage {...parallaxSet('baban-1.jpg', '(min-width: 1024px) 45vw, 1px')} alt="" speed={14} className="mt-3 hidden aspect-[16/7] rounded-2xl opacity-80 lg:block" />
        </div>

        <Reveal delay={0.1}>
          <form noValidate onSubmit={onSubmit} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur md:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              {input('name', f.name, { autoComplete: 'name' })}
              {input('email', f.email, { type: 'email', autoComplete: 'email' })}
              <div className="sm:col-span-2">{input('phone', f.phone, { type: 'tel', autoComplete: 'tel' })}</div>
              {input('message', f.message, { textarea: true })}
            </div>
            <button type="submit" className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition hover:bg-[#f2b23c] active:scale-[0.99] sm:w-auto">
              <Send className="h-4 w-4 rtl:-scale-x-100" />
              {f.send}
            </button>
            <p className="mt-4 text-sm text-white/50">{f.note}</p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
