import { useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Send,
  Twitter,
} from 'lucide-react';
import { PROFILE, SOCIAL_PROFILES } from '../data/portfolioData';

interface FormValues {
  name: string;
  email: string;
  organization: string;
  inquiryType: string;
  message: string;
}

interface SubmissionReceipt {
  id: string;
  receivedAt: string;
  summary: {
    name: string;
    email: string;
    organization: string;
    inquiryType: string;
  };
}

const INQUIRY_OPTIONS = [
  'Internship / Full-Time Role',
  'Computer Vision / Robotics Project',
  'Research & Collaboration',
  'General Inquiry',
];

function ProfileIcon({ id }: { id: 'linkedin' | 'github' | 'twitter' | 'email' }) {
  if (id === 'linkedin') return <Linkedin className="h-5 w-5 text-cyan-400" />;
  if (id === 'github') return <Github className="h-5 w-5 text-cyan-400" />;
  if (id === 'twitter') return <Twitter className="h-5 w-5 text-cyan-400" />;
  return <Mail className="h-5 w-5 text-cyan-400" />;
}

export default function ContactSection() {
  const [values, setValues] = useState<FormValues>({
    name: '',
    email: '',
    organization: '',
    inquiryType: INQUIRY_OPTIONS[0],
    message: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<SubmissionReceipt | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const validateClient = (form: FormValues): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (form.name.trim().length < 2) {
      errors.name = 'Please enter your full name (at least 2 characters).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (form.message.trim().length < 15) {
      errors.message = 'Please write a brief message (at least 15 characters).';
    }
    return errors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    const clientErrors = validateClient(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data?.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        }
        setServerError(data?.error || 'Unable to send your message right now.');
        return;
      }

      setReceipt({
        id: data.id,
        receivedAt: data.receivedAt,
        summary: data.summary,
      });
    } catch {
      setServerError('Network error while sending message. You can also reach out directly by email.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      setCopiedEmail(false);
    }
  };

  const handleReset = () => {
    setValues({
      name: '',
      email: '',
      organization: '',
      inquiryType: INQUIRY_OPTIONS[0],
      message: '',
    });
    setFieldErrors({});
    setServerError(null);
    setReceipt(null);
  };

  const mailtoFallback = `mailto:${PROFILE.email}?subject=${encodeURIComponent(
    `[${values.inquiryType}] Portfolio Inquiry from ${values.name || 'Visitor'}`
  )}&body=${encodeURIComponent(values.message)}`;

  return (
    <section
      id="contact"
      data-scene-stop="contact"
      aria-labelledby="contact-heading"
      className="relative z-10 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
        {/* Dedicated Professional Social Media Profiles Section */}
        <div
          id="profiles"
          className="rounded-xl border border-slate-800/90 bg-[#070d18]/92 p-6 sm:p-10"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
              Professional Profiles
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl text-balance">
              Connect Across Engineering &amp; Code Platforms
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Follow my open-source repositories, robotics trials, and career updates directly.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SOCIAL_PROFILES.map((profile) => (
              <a
                key={profile.id}
                href={profile.url}
                target={profile.external ? '_blank' : undefined}
                rel={profile.external ? 'noopener noreferrer' : undefined}
                className="group flex flex-col justify-between rounded-lg border border-slate-800/90 bg-slate-950/75 p-5 transition-colors hover:border-cyan-400/50 focus-visible:outline-2 focus-visible:outline-cyan-400"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <ProfileIcon id={profile.id} />
                    <ArrowUpRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-300" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {profile.platform}
                  </h3>
                  <p className="mt-0.5 truncate font-mono text-xs text-cyan-300/90">
                    {profile.handle}
                  </p>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-400">
                    {profile.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Responsive Contact Form + Direct Channels */}
        <div className="rounded-xl border border-slate-800/90 bg-[#070d18]/92 p-6 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-stretch">
            {/* Left Info Column */}
            <div className="flex flex-col justify-between lg:col-span-5">
              <div>
                <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                  Direct Contact
                </p>
                <h2
                  id="contact-heading"
                  className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl text-balance"
                >
                  Let&apos;s Build Reliable AI &amp; Robotics Systems
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                  Available for AI/ML internships, computer vision engineering collaborations, and
                  autonomous robotics roles. Send a message using the form or reach out directly.
                </p>

                <div className="mt-8 space-y-4 border-t border-slate-800/80 pt-6">
                  <div>
                    <p className="text-xs font-medium text-slate-400">Direct Email</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <a
                        href={`mailto:${PROFILE.email}`}
                        className="font-mono text-sm font-medium text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline"
                      >
                        {PROFILE.email}
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="inline-flex min-h-[34px] items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-200 hover:border-cyan-400/50 transition-colors focus-visible:outline-2 focus-visible:outline-cyan-400"
                      >
                        {copiedEmail ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-300">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-sm text-slate-300">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                    <div>
                      <p className="font-medium text-slate-100">{PROFILE.location}</p>
                      <p className="text-xs text-slate-400">
                        {PROFILE.university} · {PROFILE.availability}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-lg border border-slate-800 bg-slate-950/75 p-4 text-xs leading-relaxed text-slate-400">
                Typical response time is within 24 hours for technical project inquiries and
                engineering roles.
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-7">
              <div className="h-full rounded-lg border border-slate-800/90 bg-slate-950/75 p-5 sm:p-7">
                {receipt ? (
                  <div className="flex h-full flex-col justify-between space-y-6">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Inquiry Received</span>
                      </div>

                      <h3 className="mt-4 font-display text-2xl font-bold text-slate-50">
                        Thank you, {receipt.summary.name}.
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        Your message regarding{' '}
                        <span className="font-medium text-slate-100">
                          {receipt.summary.inquiryType}
                        </span>{' '}
                        has been logged for Kabilan A.
                      </p>

                      <dl className="mt-6 grid gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-xs sm:grid-cols-2">
                        <div>
                          <dt className="text-slate-400">Reference ID</dt>
                          <dd className="mt-0.5 font-mono font-semibold text-cyan-300">
                            {receipt.id}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Reply Email</dt>
                          <dd className="mt-0.5 font-mono text-slate-200 truncate">
                            {receipt.summary.email}
                          </dd>
                        </div>
                        {receipt.summary.organization && (
                          <div>
                            <dt className="text-slate-400">Organization</dt>
                            <dd className="mt-0.5 text-slate-200">
                              {receipt.summary.organization}
                            </dd>
                          </div>
                        )}
                        <div>
                          <dt className="text-slate-400">Submitted</dt>
                          <dd className="mt-0.5 font-mono text-slate-200">
                            {new Date(receipt.receivedAt).toLocaleString()}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex min-h-[42px] items-center justify-center rounded-md bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-300 transition-colors focus-visible:outline-2 focus-visible:outline-cyan-300"
                      >
                        Send Another Message
                      </button>
                      <a
                        href={mailtoFallback}
                        className="inline-flex min-h-[42px] items-center justify-center rounded-md border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:border-cyan-400/50 transition-colors"
                      >
                        Open in Email Client
                      </a>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    {serverError && (
                      <div
                        role="alert"
                        className="flex items-start gap-2.5 rounded-md border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-200"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                        <span>{serverError}</span>
                      </div>
                    )}

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="block text-xs font-semibold text-slate-200"
                        >
                          Full Name <span className="text-cyan-400">*</span>
                        </label>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          value={values.name}
                          onChange={(e) => {
                            setValues((v) => ({ ...v, name: e.target.value }));
                            if (fieldErrors.name) {
                              setFieldErrors((err) => ({ ...err, name: '' }));
                            }
                          }}
                          aria-invalid={Boolean(fieldErrors.name)}
                          aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
                          placeholder="Your full name"
                          className={`mt-1.5 h-11 w-full rounded-md border bg-slate-900/90 px-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none ${
                            fieldErrors.name
                              ? 'border-rose-500 focus:border-rose-400'
                              : 'border-slate-700/90 focus:border-cyan-400'
                          }`}
                        />
                        {fieldErrors.name && (
                          <p
                            id="contact-name-error"
                            className="mt-1.5 flex items-center gap-1 text-xs text-rose-300"
                          >
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>{fieldErrors.name}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="contact-email"
                          className="block text-xs font-semibold text-slate-200"
                        >
                          Email Address <span className="text-cyan-400">*</span>
                        </label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={values.email}
                          onChange={(e) => {
                            setValues((v) => ({ ...v, email: e.target.value }));
                            if (fieldErrors.email) {
                              setFieldErrors((err) => ({ ...err, email: '' }));
                            }
                          }}
                          aria-invalid={Boolean(fieldErrors.email)}
                          aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
                          placeholder="you@company.com"
                          className={`mt-1.5 h-11 w-full rounded-md border bg-slate-900/90 px-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none ${
                            fieldErrors.email
                              ? 'border-rose-500 focus:border-rose-400'
                              : 'border-slate-700/90 focus:border-cyan-400'
                          }`}
                        />
                        {fieldErrors.email && (
                          <p
                            id="contact-email-error"
                            className="mt-1.5 flex items-center gap-1 text-xs text-rose-300"
                          >
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>{fieldErrors.email}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="contact-org"
                          className="block text-xs font-semibold text-slate-200"
                        >
                          Organization / Team
                        </label>
                        <input
                          id="contact-org"
                          name="organization"
                          type="text"
                          autoComplete="organization"
                          value={values.organization}
                          onChange={(e) =>
                            setValues((v) => ({ ...v, organization: e.target.value }))
                          }
                          placeholder="Company or university (optional)"
                          className="mt-1.5 h-11 w-full rounded-md border border-slate-700/90 bg-slate-900/90 px-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contact-topic"
                          className="block text-xs font-semibold text-slate-200"
                        >
                          Inquiry Topic
                        </label>
                        <select
                          id="contact-topic"
                          name="inquiryType"
                          value={values.inquiryType}
                          onChange={(e) =>
                            setValues((v) => ({ ...v, inquiryType: e.target.value }))
                          }
                          className="mt-1.5 h-11 w-full rounded-md border border-slate-700/90 bg-slate-900/90 px-3.5 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
                        >
                          {INQUIRY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="contact-message"
                          className="block text-xs font-semibold text-slate-200"
                        >
                          Message <span className="text-cyan-400">*</span>
                        </label>
                        <span className="font-mono tabular-nums text-xs text-slate-400">
                          {values.message.length} / 1500
                        </span>
                      </div>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={5}
                        maxLength={1500}
                        required
                        value={values.message}
                        onChange={(e) => {
                          setValues((v) => ({ ...v, message: e.target.value }));
                          if (fieldErrors.message) {
                            setFieldErrors((err) => ({ ...err, message: '' }));
                          }
                        }}
                        aria-invalid={Boolean(fieldErrors.message)}
                        aria-describedby={
                          fieldErrors.message ? 'contact-message-error' : undefined
                        }
                        placeholder="Share details about the role, robotics/CV pipeline, or collaboration..."
                        className={`mt-1.5 w-full rounded-md border bg-slate-900/90 p-3.5 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:outline-none ${
                          fieldErrors.message
                            ? 'border-rose-500 focus:border-rose-400'
                            : 'border-slate-700/90 focus:border-cyan-400'
                        }`}
                      />
                      {fieldErrors.message && (
                        <p
                          id="contact-message-error"
                          className="mt-1.5 flex items-center gap-1 text-xs text-rose-300"
                        >
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{fieldErrors.message}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                      <a
                        href={mailtoFallback}
                        className="text-xs font-medium text-slate-400 hover:text-cyan-300 transition-colors underline underline-offset-4"
                      >
                        Prefer your email app?
                      </a>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-cyan-300 focus-visible:outline-offset-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
