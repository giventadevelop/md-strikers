'use client';

import { useState } from 'react';

/**
 * Public contact email — same flow as mosc-temp `MoscRedesignFooter` (POST /api/proxy/contact-form-email).
 * Backend: POST /api/contact-form-email/send with tenantId injected by proxy.
 */
const DEFAULT_TO_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_TO_EMAIL ||
  process.env.NEXT_PUBLIC_MOSC_CONTACT_TO_EMAIL ||
  'mdstrikersinc@gmail.com';

/** Log prefix / tag — filter CloudWatch or browser console with this string. */
const CONTACT_FORM_LOG_TAG = '[FcUnitedContactForm]';

/** Shown when the API or network fails; full detail is only in console / monitoring. */
const FRIENDLY_SEND_FAILED =
  "We couldn't deliver your message just now. Please try again in a few minutes, or email us using the address on this page.";

/** Backend may return HTTP 200 with `{ success: false, error: "..." }` (e.g. batch job failed). */
function parseContactApiFailure(data: unknown): { failed: boolean; technicalDetail: string } {
  if (!data || typeof data !== 'object') return { failed: false, technicalDetail: '' };
  const d = data as { success?: boolean; error?: string; message?: string };
  if (d.success === false) {
    const raw =
      typeof d.error === 'string' && d.error.trim()
        ? d.error.trim()
        : typeof d.message === 'string' && d.message.trim()
          ? d.message.trim()
          : '';
    return { failed: true, technicalDetail: raw || '(success=false, no error string)' };
  }
  if (d.success !== true && typeof d.error === 'string' && d.error.trim()) {
    return { failed: true, technicalDetail: d.error.trim() };
  }
  return { failed: false, technicalDetail: '' };
}

export function FcUnitedContactForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    email_address: '',
    phone_number: '',
    feedback: '',
  });
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = formData.full_name.trim();
    const email = formData.email_address.trim();
    const message = formData.feedback.trim();

    if (!name || name.length < 2) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter your name (at least 2 characters).');
      return;
    }
    if (!email) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter a valid email address.');
      return;
    }
    if (!message || message.length < 10) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter a message (at least 10 characters).');
      return;
    }
    if (!consent) {
      setSubmitStatus('error');
      setSubmitMessage('Please agree to data collection to submit.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    const [firstName, ...restNameParts] = name.split(' ');
    const lastName = restNameParts.join(' ').trim() || 'N/A';
    const messageBody = formData.phone_number.trim()
      ? `${message}\n\nPhone: ${formData.phone_number.trim()}`
      : message;

    const payload = {
      firstName,
      lastName,
      messageBody,
      fromEmail: email,
      toEmail: DEFAULT_TO_EMAIL,
    };

    try {
      const response = await fetch('/api/proxy/contact-form-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      const { failed: bodyFailed, technicalDetail: bodyTechnical } = parseContactApiFailure(data);
      const httpFailed = !response.ok;
      const extraError =
        !bodyFailed && httpFailed && typeof (data as { error?: string })?.error === 'string'
          ? (data as { error: string }).error
          : !bodyFailed && httpFailed && typeof (data as { message?: string })?.message === 'string'
            ? (data as { message: string }).message
            : '';

      if (response.ok && !bodyFailed) {
        setSubmitStatus('success');
        setSubmitMessage('Thank you for your message! We will get back to you soon.');
        setFormData({ full_name: '', email_address: '', phone_number: '', feedback: '' });
        setConsent(false);
        setTimeout(() => {
          setSubmitStatus('idle');
          setSubmitMessage('');
        }, 8000);
      } else {
        const technicalDetail =
          [bodyTechnical, extraError, httpFailed ? `HTTP ${response.status}` : '']
            .filter(Boolean)
            .join(' | ') || 'unknown failure';

        console.error(CONTACT_FORM_LOG_TAG, 'Contact send failed (full detail for support / logs)', {
          tag: 'fc-united-contact-form',
          technicalDetail,
          httpStatus: response.status,
          responseOk: response.ok,
          responseBody: data,
        });

        setSubmitStatus('error');
        setSubmitMessage(FRIENDLY_SEND_FAILED);
        setTimeout(() => {
          setSubmitStatus('idle');
          setSubmitMessage('');
        }, 12000);
      }
    } catch (err) {
      console.error(CONTACT_FORM_LOG_TAG, 'Contact send exception (network / client)', {
        tag: 'fc-united-contact-form',
        error: err,
      });
      setSubmitStatus('error');
      setSubmitMessage(FRIENDLY_SEND_FAILED);
      setTimeout(() => {
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 12000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-2xl space-y-4 text-left" autoComplete="off">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          type="text"
          name="full_name"
          placeholder="name *"
          value={formData.full_name}
          onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
          className="rounded-[3px] border border-[#e3e3e3] bg-[#fafafa] px-4 py-3 text-sm text-[#262f3e] placeholder:text-[#797e87]"
        />
        <input
          type="email"
          name="email_address"
          placeholder="email *"
          value={formData.email_address}
          onChange={(e) => setFormData((p) => ({ ...p, email_address: e.target.value }))}
          className="rounded-[3px] border border-[#e3e3e3] bg-[#fafafa] px-4 py-3 text-sm text-[#262f3e] placeholder:text-[#797e87]"
        />
      </div>
      <input
        type="tel"
        name="phone_number"
        placeholder="phone (optional)"
        value={formData.phone_number}
        onChange={(e) => setFormData((p) => ({ ...p, phone_number: e.target.value }))}
        className="w-full rounded-[3px] border border-[#e3e3e3] bg-[#fafafa] px-4 py-3 text-sm text-[#262f3e] placeholder:text-[#797e87]"
      />
      <textarea
        name="feedback"
        placeholder="message *"
        rows={6}
        value={formData.feedback}
        onChange={(e) => setFormData((p) => ({ ...p, feedback: e.target.value }))}
        className="w-full rounded-[3px] border border-[#e3e3e3] bg-[#fafafa] px-4 py-3 text-sm text-[#262f3e] placeholder:text-[#797e87]"
      />
      <label className="flex items-start gap-2 text-sm text-[#797e87]">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1"
        />
        <span>I agree that my submitted data is being collected and stored (required).</span>
      </label>
      {submitMessage && (
        <p
          className={`text-sm break-words ${submitStatus === 'success' ? 'text-green-700' : 'text-red-600'}`}
          role="status"
        >
          {submitMessage}
        </p>
      )}
      <div className="text-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-[32px] bg-[#ff0000] px-8 py-3 text-sm font-semibold text-white transition-[filter] duration-300 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Sending...' : 'Send Your Message'}
        </button>
      </div>
    </form>
  );
}
