'use client';

import { useState } from 'react';

/**
 * Public contact email — POST /api/proxy/contact-form-email.
 * Backend: POST /api/contact-form-email/send with tenantId injected by proxy.
 * The inbox is sales@giventa.com. emailType CONTACT also sends a copy to the address entered on the form.
 */
const SALES_INBOX = 'sales@giventa.com';

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
      senderEmail: email,
      toEmail: SALES_INBOX,
      emailType: 'CONTACT',
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
    <form onSubmit={handleSubmit} className="md-contact-form" autoComplete="off">
      <div className="md-contact-form__row">
        <label>
          <span>Name *</span>
          <input
            type="text"
            name="full_name"
            placeholder="name *"
            value={formData.full_name}
            onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
          />
        </label>
        <label>
          <span>Email *</span>
          <input
            type="email"
            name="email_address"
            placeholder="email *"
            value={formData.email_address}
            onChange={(e) => setFormData((p) => ({ ...p, email_address: e.target.value }))}
          />
        </label>
      </div>
      <label>
        <span>Phone</span>
        <input
          type="tel"
          name="phone_number"
          placeholder="phone (optional)"
          value={formData.phone_number}
          onChange={(e) => setFormData((p) => ({ ...p, phone_number: e.target.value }))}
        />
      </label>
      <label>
        <span>Message *</span>
        <textarea
          name="feedback"
          placeholder="message *"
          rows={6}
          value={formData.feedback}
          onChange={(e) => setFormData((p) => ({ ...p, feedback: e.target.value }))}
        />
      </label>
      <label className="md-contact-form__consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>I agree that my submitted data is being collected and stored (required).</span>
      </label>
      {submitMessage ? (
        <p className={submitStatus === 'success' ? 'md-contact-note is-ok' : 'md-contact-note is-err'} role="status">
          {submitStatus === 'success' ? (
            <svg viewBox="0 0 24 24" aria-hidden>
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M8 12.5l2.5 2.5L16 9" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden>
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M12 8v5M12 16.5h.01" />
            </svg>
          )}
          <span>{submitMessage}</span>
        </p>
      ) : null}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <span className="md-contact-spin" aria-hidden /> : (
          <svg viewBox="0 0 24 24" aria-hidden>
            <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M4 12l16-7-7 16-2-7z" />
          </svg>
        )}
        {isSubmitting ? 'Sending...' : 'Send Your Message'}
      </button>
    </form>
  );
}
