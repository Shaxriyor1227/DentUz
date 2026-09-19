import React from 'react';
import styles from './Logo.module.css';

/**
 * Official DentUz Brand Logo
 * Based on the official brand identity guide:
 * - Symbol: Interlocking DU molar tooth logomark (Navy + Electric Cyan)
 * - Wordmark: Geometric 'DentUz' typography
 *
 * @param {Object} props
 * @param {number} [props.size=34] - Icon size in pixels
 * @param {boolean} [props.withText=false] - Whether to render the 'DentUz' text lockup
 * @param {string} [props.subtitle] - Optional subtitle (e.g. 'Clinic OS')
 * @param {string} [props.className] - Additional CSS class name
 * @param {boolean} [props.animated=true] - Whether to include subtle hover glow animation
 * @param {'default'|'white'|'black'} [props.variant='default'] - Color variant
 */
export default function Logo({
  size = 34,
  withText = false,
  subtitle,
  className = '',
  animated = true,
  variant = 'default',
}) {
  return (
    <div
      className={`${styles.logoContainer} ${styles[variant] || ''} ${className} ${animated ? styles.animated : ''}`}
    >
      <div
        className={styles.logoMarkWrapper}
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 197 201"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${styles.logoSvg} ${styles[variant] || ''}`}
        >
          {/* Official DU Tooth Logomark: Left lobe & letter 'D' (Navy in light, White in dark) */}
          <path
            d="M 37 43 L 37 125 L 60 125 L 70 122 L 72 120 L 78 117 L 87 108 L 92 99 L 95 87 L 95 80 L 90 64 L 81 53 L 68 45 L 60 43 Z M 50 54 L 62 55 L 65 56 L 67 58 L 69 58 L 79 68 L 83 78 L 83 90 L 81 96 L 79 98 L 78 101 L 70 109 L 64 112 L 57 114 L 51 114 L 49 113 L 48 56 Z M 43 1 L 34 3 L 23 9 L 15 17 L 10 24 L 7 30 L 6 35 L 4 38 L 1 53 L 1 82 L 2 90 L 4 96 L 4 102 L 12 133 L 15 139 L 15 142 L 19 150 L 20 155 L 31 178 L 33 180 L 38 189 L 45 196 L 51 199 L 60 199 L 65 197 L 71 191 L 77 180 L 77 178 L 79 175 L 80 170 L 82 167 L 84 160 L 87 156 L 89 151 L 93 145 L 105 133 L 115 120 L 112 117 L 110 117 L 103 120 L 100 122 L 84 138 L 73 157 L 70 167 L 65 177 L 65 179 L 63 181 L 63 183 L 58 188 L 54 188 L 52 187 L 45 179 L 44 176 L 39 169 L 39 167 L 36 163 L 36 161 L 33 156 L 31 149 L 26 139 L 25 133 L 23 130 L 15 99 L 15 93 L 12 80 L 12 55 L 15 41 L 21 28 L 30 18 L 39 13 L 45 12 L 54 12 L 68 15 L 74 18 L 76 18 L 90 26 L 103 39 L 111 54 L 111 56 L 113 59 L 116 76 L 116 97 L 118 103 L 120 106 L 125 110 L 124 108 L 124 102 L 127 92 L 127 71 L 124 57 L 121 48 L 116 38 L 107 26 L 98 18 L 89 12 L 74 5 L 63 2 Z"
            className={styles.pathNavy}
            fillRule="evenodd"
          />
          {/* Official DU Tooth Logomark: Right lobe & letter 'U' (Electric Cyan) */}
          <path
            d="M 158 43 L 147 43 L 147 103 L 146 107 L 141 112 L 136 114 L 130 113 L 126 110 L 122 109 L 117 103 L 115 97 L 115 89 L 115 93 L 111 106 L 108 112 L 101 121 L 103 119 L 110 116 L 112 116 L 116 120 L 106 132 L 111 130 L 113 128 L 124 125 L 126 126 L 140 125 L 146 123 L 149 121 L 155 114 L 158 107 Z M 153 1 L 139 1 L 131 2 L 124 4 L 121 6 L 116 7 L 111 10 L 109 10 L 105 13 L 114 21 L 119 18 L 121 18 L 124 16 L 134 13 L 150 12 L 158 14 L 165 18 L 172 25 L 178 36 L 182 49 L 183 56 L 183 78 L 180 100 L 172 130 L 169 139 L 167 142 L 166 147 L 164 150 L 164 152 L 160 159 L 160 161 L 158 163 L 158 165 L 155 171 L 153 173 L 151 178 L 143 187 L 138 188 L 132 182 L 127 171 L 127 168 L 124 163 L 124 161 L 117 147 L 111 139 L 103 146 L 104 150 L 112 162 L 116 175 L 120 182 L 120 184 L 122 188 L 130 197 L 134 199 L 145 199 L 153 194 L 160 185 L 165 175 L 167 173 L 167 171 L 169 169 L 169 167 L 173 160 L 173 158 L 179 145 L 185 127 L 191 103 L 194 83 L 195 61 L 193 45 L 191 41 L 191 37 L 189 34 L 189 32 L 184 22 L 175 11 L 164 4 Z"
            className={styles.pathCyan}
            fillRule="evenodd"
          />
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
