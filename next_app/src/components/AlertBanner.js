"use client";

import React, { useState, useEffect } from 'react';

/**
 * AlertBanner — A toast/banner component for success/error feedback.
 * Replaces unprofessional window.alert() calls.
 * Auto-dismisses after a configurable duration.
 */
export default function AlertBanner({ type = 'info', message, onDismiss, autoDismissMs = 5000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoDismissMs > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [autoDismissMs, onDismiss]);

  if (!visible || !message) return null;

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
  };

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warning: 'warning',
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 px-5 py-4 rounded-xl border ${styles[type]} animate-in fade-in slide-in-from-top duration-300`}
    >
      <span className="material-symbols-outlined text-xl mt-0.5">{icons[type]}</span>
      <p className="flex-1 font-medium text-sm">{message}</p>
      <button
        onClick={() => { setVisible(false); if (onDismiss) onDismiss(); }}
        className="text-current opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}
