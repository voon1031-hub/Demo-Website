import { useMemo, useRef, useState } from 'react';
import { brand } from '../config/brand';
import { useContent } from '../content';
import { gsap, MOTION_OK } from '../lib/gsap';
import { useGsap } from '../hooks/useGsap';

type Field = 'name' | 'company' | 'email' | 'from' | 'to' | 'mode' | 'details';
const REQUIRED: Field[] = ['name', 'email', 'from', 'to', 'details'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Contact: the details people need, plus a quote form. There is no backend:
 * the two send buttons are real links that open WhatsApp or the visitor's
 * email app with the request already written, so nothing claims to be sent
 * when it isn't.
 */
export function Contact() {
  const t = useContent();
  const f = t.form;
  const root = useRef<HTMLElement>(null);
  const [values, setValues] = useState<Record<Field, string>>({
    name: '',
    company: '',
    email: '',
    from: '',
    to: '',
    mode: f.fields.modes[0],
    details: '',
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  const message = useMemo(() => {
    const rows: [string, string][] = [
      [f.fields.name, values.name],
      [f.fields.company, values.company],
      [f.fields.email, values.email],
      [f.fields.from, values.from],
      [f.fields.to, values.to],
      [f.fields.mode, values.mode],
      [f.fields.details, values.details],
    ];
    return `${f.messageIntro}\n\n${rows.filter(([, v]) => v.trim()).map(([k, v]) => `${k}: ${v.trim()}`).join('\n')}`;
  }, [values, f]);

  const whatsappHref = `https://wa.me/${brand.contact.whatsapp.intl}?text=${encodeURIComponent(message)}`;
  const emailHref = `mailto:${brand.contact.email}?subject=${encodeURIComponent(`${f.messageIntro}: ${values.from} → ${values.to}`)}&body=${encodeURIComponent(message)}`;

  function validate() {
    const next: Partial<Record<Field, string>> = {};
    for (const k of REQUIRED) if (!values[k].trim()) next[k] = f.errors.required;
    if (values.email.trim() && !EMAIL.test(values.email.trim())) next.email = f.errors.email;
    setErrors(next);
    const first = REQUIRED.find((k) => next[k]);
    if (first) document.getElementById(`quote-${first}`)?.focus();
    return !first;
  }

  const onSend = (e: React.MouseEvent) => {
    if (!validate()) e.preventDefault();
  };

  const set = (k: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.from('[data-contact] > *', {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 70%' },
      });
    });
  });

  const input =
    'mt-2 block w-full rounded-xl border border-chart/35 bg-navy-deep/60 px-4 py-3 text-fog placeholder:text-chart-light/70 transition-colors focus:border-signal focus:outline-none aria-[invalid=true]:border-signal';

  const text = (k: Field, label: string, type = 'text', autoComplete?: string) => (
    <div>
      <label htmlFor={`quote-${k}`} className="text-sm text-chart-light">
        {label}
      </label>
      <input
        id={`quote-${k}`}
        type={type}
        autoComplete={autoComplete}
        value={values[k]}
        onChange={set(k)}
        aria-invalid={Boolean(errors[k])}
        aria-describedby={errors[k] ? `quote-${k}-error` : undefined}
        className={input}
      />
      {errors[k] && (
        <p id={`quote-${k}-error`} className="mt-1.5 text-sm text-signal-text">
          {errors[k]}
        </p>
      )}
    </div>
  );

  return (
    <section id="contact" ref={root} tabIndex={-1} aria-labelledby="contact-title" className="relative bg-navy-deep px-4 py-28 sm:px-8 sm:py-36">
      <div data-contact className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div>
          <h2 id="contact-title" className="type-display text-3xl text-signal-text">
            {f.heading}
          </h2>
          <p className="mt-4 max-w-[38ch] text-fog md:text-lg">{f.intro}</p>
          <dl className="mt-10 grid gap-6 border-t border-chart/25 pt-8">
            <div>
              <dt className="text-sm text-chart-light">{t.contact.whatsapp}</dt>
              <dd className="mt-1">
                <a className="type-heading whitespace-nowrap text-lg text-fog underline decoration-signal underline-offset-[6px] hover:text-signal-text sm:text-xl" href={`https://wa.me/${brand.contact.whatsapp.intl}`} target="_blank" rel="noopener noreferrer">
                  {brand.contact.whatsapp.display}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-chart-light">{t.contact.email}</dt>
              <dd className="mt-1">
                <a className="type-heading whitespace-nowrap text-lg text-fog underline sm:text-xl decoration-signal underline-offset-[6px] hover:text-signal-text" href={`mailto:${brand.contact.email}`}>
                  {brand.contact.email}
                </a>
              </dd>
            </div>
            <p className="text-sm text-chart-light">{f.responseTime}</p>
          </dl>
        </div>

        <form noValidate onSubmit={(e) => e.preventDefault()} className="grid gap-5 rounded-[28px] bg-steel p-6 sm:grid-cols-2 sm:p-10">
          {text('name', f.fields.name, 'text', 'name')}
          {text('company', f.fields.company, 'text', 'organization')}
          <div className="sm:col-span-2">{text('email', f.fields.email, 'email', 'email')}</div>
          {text('from', f.fields.from)}
          {text('to', f.fields.to)}
          <div className="sm:col-span-2">
            <label htmlFor="quote-mode" className="text-sm text-chart-light">
              {f.fields.mode}
            </label>
            <select id="quote-mode" value={values.mode} onChange={set('mode')} className={input}>
              {f.fields.modes.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="quote-details" className="text-sm text-chart-light">
              {f.fields.details}
            </label>
            <textarea
              id="quote-details"
              rows={4}
              value={values.details}
              onChange={set('details')}
              placeholder={f.fields.detailsHint}
              aria-invalid={Boolean(errors.details)}
              aria-describedby={errors.details ? 'quote-details-error' : undefined}
              className={`${input} resize-y`}
            />
            {errors.details && (
              <p id="quote-details-error" className="mt-1.5 text-sm text-signal-text">
                {errors.details}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={onSend} className="btn btn-primary">
              {f.sendWhatsApp}
            </a>
            <a href={emailHref} onClick={onSend} className="btn btn-ghost">
              {f.sendEmail}
            </a>
          </div>
          <p className="text-sm text-chart-light sm:col-span-2">{f.sendNote}</p>
        </form>
      </div>
    </section>
  );
}
