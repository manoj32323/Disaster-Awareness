"use client";

import React, { useState } from 'react';
import AlertBanner from '@/components/AlertBanner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alertState, setAlertState] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required.';
    else if (formData.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters.';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertState(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const host = window.location.hostname === "localhost" ? "127.0.0.1" : (window.location.hostname || "127.0.0.1");
      const response = await fetch(`http://${host}:8000/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Server error');

      setAlertState({ type: 'success', message: 'Your message has been sent successfully! We will get back to you within 24–48 hours.' });
      setFormData({ firstName: '', lastName: '', email: '', message: '' });
      setErrors({});
    } catch (err) {
      setAlertState({ type: 'error', message: 'Failed to send your message. Please try again later or email us directly.' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (fieldName) =>
    `w-full px-4 py-3 rounded-md border ${errors[fieldName] ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow`;

  return (
    <main id="main-content" className="bg-white min-h-screen text-slate-800">
      <section className="bg-slate-50 py-24 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Get in Touch
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Contact our operations center for partnership inquiries, data access, or integration support.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-3xl mx-auto px-8">
        {alertState && (
          <div className="mb-8">
            <AlertBanner 
              type={alertState.type} 
              message={alertState.message} 
              onDismiss={() => setAlertState(null)} 
            />
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={inputClass('firstName')}
                placeholder="Jane"
                aria-required="true"
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              />
              {errors.firstName && <p id="firstName-error" className="text-red-500 text-xs font-medium mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={inputClass('lastName')}
                placeholder="Doe"
                aria-required="true"
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              />
              {errors.lastName && <p id="lastName-error" className="text-red-500 text-xs font-medium mt-1">{errors.lastName}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass('email')}
              placeholder="jane@organization.org"
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && <p id="email-error" className="text-red-500 text-xs font-medium mt-1">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-bold text-slate-700 mb-2">Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              className={inputClass('message')}
              placeholder="How can we help? Tell us about your needs..."
              aria-required="true"
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'message-error' : undefined}
            ></textarea>
            {errors.message && <p id="message-error" className="text-red-500 text-xs font-medium mt-1">{errors.message}</p>}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={`w-full font-bold py-4 rounded-md shadow transition-colors flex items-center justify-center gap-2 ${submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            aria-label="Submit contact form"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Sending...
              </>
            ) : 'Send Message'}
          </button>
        </form>

        <div className="mt-16 pt-12 border-t border-gray-100 text-center">
           <h3 className="text-xl font-bold text-slate-900 mb-2">Operations Center</h3>
           <p className="text-slate-600">Disaster Awareness Systems<br/>Global Data Platform<br/>Contact us via the form above</p>
        </div>
      </section>
    </main>
  );
}
