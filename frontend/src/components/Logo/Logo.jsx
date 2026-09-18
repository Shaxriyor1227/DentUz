import React from 'react';
import styles from './Logo.module.css';

/**
 * DentUz Premium Brand Logo
 * @param {Object} props
 * @param {number} [props.size=32] - Icon size in pixels
 * @param {boolean} [props.withText=false] - Whether to render the 'DentUz' text lockup
 * @param {string} [props.subtitle] - Optional subtitle (e.g. 'Dental OS')
 * @param {string} [props.className] - Additional CSS class name
 * @param {boolean} [props.animated=true] - Whether to include subtle hover glow animation
 */
export default function Logo({
  size = 34,
  withText = false,
  subtitle,
  className = '',
  animated = true,
}) {
  return (
    <div className={`${styles.logoContainer} ${className} ${animated ? styles.animated : ''}`}>
      <div
        className={styles.logoMarkWrapper}
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 40 40"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.logoSvg}
        >
          <defs>
            {/* Outer Badge Gradient */}
            <linearGradient id="dentuzBadgeBg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="50%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#082F49" />
            </linearGradient>

            {/* Tooth Core Gradient */}
            <linearGradient id="dentuzToothGrad" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#5EEAD4" />
              <stop offset="40%" stopColor="#2DD4BF" />
              <stop offset="80%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            {/* Inner Enamel Highlight */}
            <linearGradient id="dentuzShineGrad" x1="12" y1="10" x2="26" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Health Cross Glow */}
            <linearGradient id="dentuzCrossGrad" x1="16" y1="14" x2="24" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E0F2FE" />
            </linearGradient>

            {/* Subtle Drop Shadow */}
            <filter id="dentuzGlow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#06B6D4" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* 1. Squircle Badge Frame */}
          <rect
            x="1.5"
            y="1.5"
            width="37"
            height="37"
            rx="11"
            fill="url(#dentuzBadgeBg)"
            stroke="rgba(45, 212, 191, 0.28)"
            strokeWidth="1.2"
          />

          {/* Inner Rim Light */}
          <rect
            x="2.5"
            y="2.5"
            width="35"
            height="35"
            rx="10"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
          />

          {/* 2. Stylized Anatomic Molar Tooth */}
          <path
            d="M20 9.2
               C23.5 9.2 26 10.3 27.8 12.2
               C29.6 14.2 30 16.8 29.2 20.2
               C28.2 24.2 26.8 27.8 25.5 30.5
               C24.7 32.1 23.4 32.2 22.3 31.0
               C21.4 30.0 20.9 27.6 20.3 25.4
               C20.1 24.6 19.9 24.6 19.7 25.4
               C19.1 27.6 18.6 30.0 17.7 31.0
               C16.6 32.2 15.3 32.1 14.5 30.5
               C13.2 27.8 11.8 24.2 10.8 20.2
               C10.0 16.8 10.4 14.2 12.2 12.2
               C14.0 10.3 16.5 9.2 20 9.2Z"
            fill="url(#dentuzToothGrad)"
            filter="url(#dentuzGlow)"
          />

          {/* 3. Left Enamel Specular Highlight */}
          <path
            d="M13.2 13.5
               C14.5 11.8 16.8 11.0 19.5 11.0
               C18.2 12.8 17.5 15.2 17.2 18.0
               C15.8 17.5 14.2 16.2 13.2 13.5Z"
            fill="url(#dentuzShineGrad)"
          />

          {/* 4. Central Medical Cross / Spark Accent */}
          <g transform="translate(20, 18.5)">
            {/* Horizontal Bar */}
            <rect x="-3" y="-1.2" width="6" height="2.4" rx="1.2" fill="url(#dentuzCrossGrad)" />
            {/* Vertical Bar */}
            <rect x="-1.2" y="-3" width="2.4" height="6" rx="1.2" fill="url(#dentuzCrossGrad)" />
            {/* Center Diamond Light */}
            <circle cx="0" cy="0" r="0.8" fill="#0EA5E9" />
          </g>

          {/* 5. Precision Diamond Sparkle (Top-Right Gleam) */}
          <g transform="translate(29, 9.5)">
            <path
              d="M0 -3.5 L0.9 -0.9 L3.5 0 L0.9 0.9 L0 3.5 L-0.9 0.9 L-3.5 0 L-0.9 -0.9 Z"
              fill="#FFFFFF"
            />
            <circle cx="0" cy="0" r="1" fill="#67E8F9" opacity="0.9" />
          </g>
        </svg>
      </div>

      {withText && (
        <div className={styles.textLockup}>
          <span className={styles.brandTitle}>
            Dent<span className={styles.brandAccent}>Uz</span>
          </span>
          {subtitle && <span className={styles.brandSubtitle}>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
