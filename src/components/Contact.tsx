import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, Mail, Phone, Send } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageProvider';
import { contact, parallaxSet, turnstileSiteKey } from '../data/company';
import { cn } from '../lib';
import { ParallaxImage } from './ui/ParallaxImage';
import { Reveal } from './ui/Reveal';
import { SectionHeading } from './ui/SectionHeading';

type Field = 'name' | 'email' | 'phone' | 'message';
type Status = 'idle' | 'sending' | 'success' | 'error';

const empty: Record<Field, string> = { name: '', email: '', phone: '', message: '' };
/** Same limits as contact.php, so nothing is cut off silently. */
const maxLength: Record<Field, number> = { name: 200, email: 254, phone: 50, message: 10000 };
/** Digits (Western, Arabic and Persian/Kurdish), spaces, + - ( ) and dots. */
const phonePattern = /^\+?[0-9\u0660-\u0669\u06F0-\u06F9\s().-]{6,30}$/;

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}
const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/** Loads Cloudflare's bot check into `ref` when a site key is set; returns the current token ('' until solved). */
function useTurnstile(ref: React.RefObject<HTMLDivElement>, language: string) {
  const [token, setToken] = useState('');
  const widget = useRef<string>();
  useEffect(() => {
    if (!turnstileSiteKey || !ref.current) return;
    let cancelled = false;
    const render = () => {
      if (cancelled || !ref.current || !window.turnstile) return;
      widget.current = window.turnstile.render(ref.current, {
        sitekey: turnstileSiteKey,
        appearance: 'interaction-only',
        language,
        callback: (t: string) => setToken(t),
        'expired-callback': () => setToken(''),
        'error-callback': () => setToken(''),
      });
    };
    if (window.turnstile) render();
    else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SRC}"]`);
      if (!script) {
        script = document.createElement('script');
        script.src = TURNSTILE_SRC;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', render);
    }
    return () => {
      cancelled = true;
      if (widget.current) window.turnstile?.remove(widget.current);
    };
  }, [ref, language]);
  const reset = () => {
    setToken('');
    if (widget.current) window.turnstile?.reset(widget.current);
  };
  return { token, reset };
}

export function Contact() {
  const { t, lang } = useLanguage();
  const f = t.contact.form;
  const [values, setValues] = useState<Record<Field, string>>(empty);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [honeypot, setHoneypot] = useState('');
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstile = useTurnstile(turnstileRef, lang === 'ar' ? 'ar' : lang === 'en' ? 'en' : 'auto');

  const errors: Partial<Record<Field, string>> = {};
  if (!values.name.trim()) errors.name = f.required;
  if (!values.email.trim()) errors.email = f.required;
  else if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = f.invalidEmail;
  if (values.phone.trim() && !phonePattern.test(values.phone.trim())) errors.phone = f.invalidPhone;
  if (!values.message.trim()) errors.message = f.required;

  /** Old behaviour: open the visitor's email app with the message ready to send. */
  const openMailApp = () => {
    const body = `${values.message}\n\n${values.name}\n${values.email}${values.phone ? `\n${values.phone}` : ''}`;
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(f.subject)}&body=${encodeURIComponent(body)}`;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, message: true });
    if (Object.keys(errors).length || status === 'sending') return;
    setStatus('sending');
    let res: Response;
    try {
      res = await fetch('./contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...values, subject: f.subject, website: honeypot, turnstile: turnstile.token }),
      });
    } catch {
      // Network error: never leave the visitor stuck.
      setStatus('idle');
      openMailApp();
      return;
    }
    const isJson = (res.headers.get('content-type') ?? '').includes('application/json');
    if (!isJson) {
      // contact.php isn't running here (e.g. `npm run dev`, or a host without PHP): fall back to the email app.
      setStatus('idle');
      openMailApp();
      return;
    }
    const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    turnstile.reset(); // each bot-check token works only once
    if (res.ok && data?.ok) {
      setStatus('success');
      setValues(empty);
      setTouched({});
    } else {
      setStatus('error');
    }
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
      maxLength: maxLength[name],
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
    { icon: Mail, label: t.contact.email, content: <a href={`mailto:${contact.email}`} className="break-all hover:text-accent">{contact.email}</a> },
  ];

  return (
    <section id="contact" className="relative overflow-hidden bg-navy-deep py-24 text-white md:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading tone="dark" eyebrow={t.contact.eyebrow} title={t.contact.title} subtitle={t.contact.subtitle} />
          <div className="mt-10 grid gap-3">
            {cards.map((c, i) => (
              <Reveal key={c.label} delay={i * 0.06} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <c.icon className="h-5 w-5 text-accent" />
                <p className="mt-3 text-sm text-white/55">{c.label}</p>
                <div className="mt-1 font-medium leading-relaxed">{c.content}</div>
              </Reveal>
            ))}
          </div>
          <ParallaxImage {...parallaxSet('baban-1.jpg', '(min-width: 1024px) 45vw, 1px')} alt="" speed={14} className="mt-3 hidden aspect-[16/7] rounded-2xl opacity-80 lg:block" />
        </div>

        <Reveal delay={0.1}>
          <form noValidate onSubmit={onSubmit} className="relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur md:p-8">
            {/* Honeypot: hidden from people, bots fill it in and get ignored by contact.php. */}
            <div aria-hidden="true" className="pointer-events-none absolute start-0 top-0 h-0 w-0 overflow-hidden opacity-0">
              <label htmlFor="f-website">Website</label>
              <input id="f-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {input('name', f.name, { autoComplete: 'name' })}
              {input('email', f.email, { type: 'email', autoComplete: 'email' })}
              <div className="sm:col-span-2">{input('phone', f.phone, { type: 'tel', autoComplete: 'tel' })}</div>
              {input('message', f.message, { textarea: true })}
            </div>
            {turnstileSiteKey && <div ref={turnstileRef} className="mt-5" />}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-6 font-semibold text-navy-deep transition hover:bg-white active:scale-[0.99] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
            >
              {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rtl:-scale-x-100" />}
              {status === 'sending' ? f.sending : f.send}
            </button>
            <div aria-live="polite">
              {status === 'success' && (
                <p className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  {f.success}
                </p>
              )}
              {status === 'error' && <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{f.error}</p>}
            </div>
            <p className="mt-4 text-sm text-white/50">{f.note}</p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
