/**
 * Icon Component — Inline SVG icons for performance-critical pages.
 * 
 * Using inline SVGs instead of Material Symbols icon font eliminates
 * the 321 KB font payload on the public/marketing pages, significantly
 * improving FCP, LCP, and mobile performance scores.
 * 
 * Icons included: only what's needed for Homepage + PublicLayout
 */

import React from 'react';

const ICONS = {
  // Homepage icons
  warning: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  ),
  check_circle: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  ),
  cancel: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
    </svg>
  ),
  health_and_safety: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.5 13H8v-3h2.5V7.5h3V10H16v3h-2.5v2.5h-3V13zM12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
    </svg>
  ),
  verified_user: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  ),
  credit_card_off: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.9 21.9L2.1 2.1.69 3.51 3 5.83V7c0-1.11.89-2 2-2h.17l2 2H5v2h4.17l2 2H7v2h6.17l5.12 5.12c-.09.48-.55.88-1.29.88H5c-1.11 0-1.99-.89-1.99-2L3 7.83l-2-2V19c0 1.11.89 2 2 2h14c.24 0 .47-.04.69-.1l1.82 1.82 1.39-1.82zM21 5H9.83l2 2H21v2H13.83l6 6H21c1.11 0 2-.89 2-2V7c0-1.11-.89-2-2-2z"/>
    </svg>
  ),
  expand_more: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/>
    </svg>
  ),
  support_agent: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 12.22C21 6.73 16.74 3 12 3c-4.69 0-9 3.65-9 9.28-.6.34-1 .98-1 1.72v2c0 1.1.9 2 2 2h1v-6.1c0-3.87 3.13-7 7-7s7 3.13 7 7V19h-8v2h8c1.1 0 2-.9 2-2v-1.22c.59-.31 1-.92 1-1.64v-2.3c0-.7-.41-1.31-1-1.62z"/>
      <circle cx="9" cy="13" r="1"/>
      <circle cx="15" cy="13" r="1"/>
    </svg>
  ),
  apartment: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 11V3H7v4H3v14h8v-4h2v4h8V11h-4zM7 19H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5v-2h2v2zm4 4H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V7h2v2zm0-4H9V3h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm0-4h-2V3h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/>
    </svg>
  ),
  location_on: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  ),
  schedule: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
    </svg>
  ),
  call: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
    </svg>
  ),
  send: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
  ),
  edit_note: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 10h11v2H3zm0-2h11V6H3zm0 8h7v-2H3zm15.01-3.13l.71-.71c.39-.39 1.02-.39 1.41 0l.71.71c.39.39.39 1.02 0 1.41l-.71.71-2.12-2.12zm-.71.71l-5.3 5.3V21h2.12l5.3-5.3-2.12-2.12z"/>
    </svg>
  ),
  // PublicLayout icons
  dark_mode: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
    </svg>
  ),
  light_mode: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
    </svg>
  ),
  cloud_done: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17 15.18 9l1.41 1.42L10 17z"/>
    </svg>
  ),
  arrow_upward: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
    </svg>
  ),
};

/**
 * Icon component - renders inline SVG instead of icon font
 * @param {string} name - icon name (matches Material Symbols name)
 * @param {object} style - optional inline style
 * @param {string} className - optional CSS class
 * @param {number} size - icon size in px (default: 20)
 */
export default function Icon({ name, style, className, size = 20, 'aria-hidden': ariaHidden = true }) {
  const svg = ICONS[name];
  if (!svg) {
    // Fallback: render nothing if icon not found
    return null;
  }

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        ...style,
      }}
      aria-hidden={ariaHidden}
    >
      {React.cloneElement(svg, {
        width: size,
        height: size,
        style: { display: 'block' },
      })}
    </span>
  );
}
