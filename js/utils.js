/**
 * Shared, dependency-free helpers. Exposed globally as `VSU`.
 * Loaded before any page script (public site and admin).
 */
const VSU = (() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  /** Escapes a value for safe insertion into HTML. */
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

  /** Stable 0-359 hue derived from a string (used for generated icons). */
  const hue = (str) => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 360;

  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Shows a short-lived notification. */
  const toast = (message, isError = false) => {
    const el = document.createElement('div');
    el.className = 'toast' + (isError ? ' bad' : '');
    el.setAttribute('role', 'status');
    el.textContent = message;
    document.body.append(el);
    setTimeout(() => el.remove(), 2500);
  };

  /** Theme manager: 'red' (red and white) or 'gold' (white and gold). */
  const theme = {
    KEY: 'vs_theme',
    list: ['red', 'gold'],
    get() {
      try { return this.list.includes(localStorage.getItem(this.KEY)) ? localStorage.getItem(this.KEY) : 'red'; }
      catch { return 'red'; }
    },
    set(name) {
      document.documentElement.dataset.theme = name;
      try { localStorage.setItem(this.KEY, name); } catch { /* storage unavailable */ }
    },
    toggle() { this.set(this.get() === 'red' ? 'gold' : 'red'); },
  };
  theme.set(theme.get());

  return { $, $$, esc, hue, reduced, toast, theme };
})();
