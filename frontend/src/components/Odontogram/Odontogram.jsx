import React, { memo, useCallback } from 'react';
import styles from './Odontogram.module.css';

// FDI Layout coordinate definitions
// Upper Row: Quadrant 1 (18..11) | Quadrant 2 (21..28)
// Lower Row: Quadrant 4 (48..41) | Quadrant 3 (31..38)

const UPPER_TEETH = [
  // Quadrant 1 (Right): 18 down to 11
  { id: '18', x: 18, w: 42, label: '18' },
  { id: '17', x: 66, w: 42, label: '17' },
  { id: '16', x: 114, w: 44, label: '16' },
  { id: '15', x: 164, w: 38, label: '15' },
  { id: '14', x: 208, w: 38, label: '14' },
  { id: '13', x: 252, w: 38, label: '13' },
  { id: '12', x: 296, w: 38, label: '12' },
  { id: '11', x: 340, w: 38, label: '11' },
  // Quadrant 2 (Left): 21 up to 28
  { id: '21', x: 442, w: 38, label: '21' },
  { id: '22', x: 486, w: 38, label: '22' },
  { id: '23', x: 530, w: 38, label: '23' },
  { id: '24', x: 574, w: 38, label: '24' },
  { id: '25', x: 618, w: 38, label: '25' },
  { id: '26', x: 662, w: 44, label: '26' },
  { id: '27', x: 712, w: 42, label: '27' },
  { id: '28', x: 760, w: 42, label: '28' }
];

const LOWER_TEETH = [
  // Quadrant 4 (Right): 48 down to 41
  { id: '48', x: 18, w: 42, label: '48' },
  { id: '47', x: 66, w: 42, label: '47' },
  { id: '46', x: 114, w: 44, label: '46' },
  { id: '45', x: 164, w: 38, label: '45' },
  { id: '44', x: 208, w: 38, label: '44' },
  { id: '43', x: 252, w: 38, label: '43' },
  { id: '42', x: 296, w: 38, label: '42' },
  { id: '41', x: 340, w: 38, label: '41' },
  // Quadrant 3 (Left): 31 up to 38
  { id: '31', x: 442, w: 38, label: '31' },
  { id: '32', x: 486, w: 38, label: '32' },
  { id: '33', x: 530, w: 38, label: '33' },
  { id: '34', x: 574, w: 38, label: '34' },
  { id: '35', x: 618, w: 38, label: '35' },
  { id: '36', x: 662, w: 44, label: '36' },
  { id: '37', x: 712, w: 42, label: '37' },
  { id: '38', x: 760, w: 42, label: '38' }
];

const STATUS_COLORS = {
  healthy: { fill: 'var(--color-surface, #FFFFFF)', stroke: 'var(--color-border, #94A3B8)' },
  caries: { fill: '#FEE2E2', stroke: '#EF4444' },
  treated: { fill: '#D1FAE5', stroke: '#10B981' },
  crown: { fill: '#E0F2FE', stroke: '#0284C7' },
  missing: { fill: 'var(--color-surface-container-low, #F1F5F9)', stroke: 'var(--color-border, #94A3B8)', dash: '3,3' }
};

// High-performance memoized tooth SVG node:
// Clicking or updating one tooth re-renders ONLY this SVG element!
const ToothSvgNode = memo(
  function ToothSvgNode({ toothConfig, toothData, isSelected, isUpper, onSelect }) {
    const { id, x, w, label } = toothConfig;
    const y = isUpper ? 24 : 142;
    const h = 50;
    const status = toothData?.status || 'healthy';
    const styling = STATUS_COLORS[status] || STATUS_COLORS.healthy;

    // 5 anatomical surfaces polygons (Occlusal center, Top, Bottom, Left, Right)
    const inset = 11;
    const cx1 = x + inset;
    const cx2 = x + w - inset;
    const cy1 = y + inset;
    const cy2 = y + h - inset;

    const handleClick = () => {
      if (onSelect) onSelect(id);
    };

    return (
      <g
        className={styles.toothNode}
        onClick={handleClick}
        transform={isSelected ? `translate(0, ${isUpper ? -2 : 2}) scale(1.02)` : undefined}
        transformOrigin={`${x + w / 2} ${y + h / 2}`}
      >
        {/* Selection Halo */}
        {isSelected && (
          <rect
            x={x - 3}
            y={y - 3}
            width={w + 6}
            height={h + 6}
            rx={8}
            fill="none"
            stroke="#06B6D4"
            strokeWidth="2.5"
            opacity="0.95"
          />
        )}

        {/* Tooth Outer Frame */}
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={6}
          fill="var(--color-surface, #FFFFFF)"
          stroke={isSelected ? '#06B6D4' : styling.stroke}
          strokeWidth={isSelected ? 2 : 1}
          strokeDasharray={styling.dash}
        />

        {/* Surface 1: Top (Buccal / Vestibular) */}
        <polygon
          className={styles.toothSurface}
          points={`${x},${y} ${x + w},${y} ${cx2},${cy1} ${cx1},${cy1}`}
          fill={styling.fill}
          stroke="var(--color-border-subtle, #E2E8F0)"
          strokeWidth="0.75"
        />

        {/* Surface 2: Bottom (Lingual / Palatal) */}
        <polygon
          className={styles.toothSurface}
          points={`${cx1},${cy2} ${cx2},${cy2} ${x + w},${y + h} ${x},${y + h}`}
          fill={styling.fill}
          stroke="var(--color-border-subtle, #E2E8F0)"
          strokeWidth="0.75"
        />

        {/* Surface 3: Left (Mesial / Distal) */}
        <polygon
          className={styles.toothSurface}
          points={`${x},${y} ${cx1},${cy1} ${cx1},${cy2} ${x},${y + h}`}
          fill={styling.fill}
          stroke="var(--color-border-subtle, #E2E8F0)"
          strokeWidth="0.75"
        />

        {/* Surface 4: Right (Distal / Mesial) */}
        <polygon
          className={styles.toothSurface}
          points={`${x + w},${y} ${x + w},${y + h} ${cx2},${cy2} ${cx2},${cy1}`}
          fill={styling.fill}
          stroke="var(--color-border-subtle, #E2E8F0)"
          strokeWidth="0.75"
        />

        {/* Surface 5: Center (Occlusal / Incisal Table) */}
        <polygon
          className={styles.toothSurface}
          points={`${cx1},${cy1} ${cx2},${cy1} ${cx2},${cy2} ${cx1},${cy2}`}
          fill={styling.fill}
          stroke="var(--color-border-subtle, #E2E8F0)"
          strokeWidth="0.75"
        />

        {/* Tooth FDI Number Indicator */}
        <text
          x={x + w / 2}
          y={isUpper ? y - 6 : y + h + 14}
          textAnchor="middle"
          fontSize="11"
          fontFamily="var(--font-mono)"
          fontWeight={isSelected ? '700' : '500'}
          fill={isSelected ? '#06B6D4' : status === 'caries' ? '#EF4444' : 'var(--color-text-secondary, #64748B)'}
        >
          {label}
        </text>
      </g>
    );
  },
  (prev, next) =>
    prev.toothData === next.toothData &&
    prev.isSelected === next.isSelected &&
    prev.toothConfig === next.toothConfig
);

export default function Odontogram({
  chartData = {},
  selectedToothId = '16',
  onSelectTooth,
  onUpdateStatus
}) {
  const handleSelect = useCallback(
    (toothId) => {
      if (onSelectTooth) {
        onSelectTooth(toothId);
      }
    },
    [onSelectTooth]
  );

  return (
    <div className={styles.odontogramContainer}>
      {/* Top Header Row with Title and Mode Switch */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>FDI Tizimi bo'yicha tishlar xaritasi</h2>
          <p className={styles.subtitle}>
            Xalqaro standart FDI Two-Digit tizimi: doimiy tishlar holati (11–48)
          </p>
        </div>
        <div className={styles.viewModeSwitch}>
          <button className={`${styles.modeBtn} ${styles.modeBtnActive}`} type="button">
            Doimiy (Kattalar)
          </button>
          <button className={styles.modeBtn} type="button">
            Sut tishlari
          </button>
        </div>
      </div>

      {/* Arch Visualizer Frame: Contains Headers, 32-Teeth SVG, and Legend */}
      <div className={styles.archFrame}>
        {/* Upper Arch (Maxilla) Header Row */}
        <div className={styles.archHeader}>
          <div className={styles.archHeaderGroup}>
            <span className={styles.archTitle}>Yuqori Jag' (Maxilla)</span>
            <span className={styles.quadrantBadge}>Q1 (O'ng)</span>
          </div>
          <div className={styles.archHeaderGroup}>
            <span className={styles.quadrantBadge}>Q2 (Chap)</span>
            <span className={styles.fdiTag}>FDI Standart</span>
          </div>
        </div>

        {/* ONE unified SVG canvas containing all 32 teeth */}
        <div className={styles.svgWrapper}>
          <svg
            className={styles.odontogramSvg}
            viewBox="0 0 820 226"
            width="820"
            height="226"
            fill="none"
          >
            {/* Background Canvas Card */}
            <rect
              x="2"
              y="2"
              width="816"
              height="222"
              rx="10"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="1"
            />

            {/* Sagittal Vertical Meridian Line (R • L) */}
            <line
              x1="410"
              y1="8"
              x2="410"
              y2="218"
              stroke="#CBD5E1"
              strokeWidth="1"
              strokeDasharray="3,3"
            />

            {/* Horizontal Okklyuzion Meridian Bar */}
            <rect
              x="14"
              y="94"
              width="792"
              height="28"
              rx="6"
              fill="#EFF4FF"
              stroke="#E2E8F0"
              strokeWidth="1"
            />
            <circle cx="30" cy="108" r="3.5" fill="#06B6D4" />
            <text
              x="42"
              y="112"
              fontFamily="Inter, sans-serif"
              fontSize="11"
              fontWeight="600"
              fill="#475569"
            >
              Sagittal & Okklyuzion Meridian Chizig'i (R • L)
            </text>
            <circle cx="410" cy="108" r="4.5" fill="#06B6D4" />
            <text
              x="790"
              y="112"
              textAnchor="end"
              fontFamily="JetBrains Mono, monospace"
              fontSize="10"
              fontWeight="600"
              fill="#94A3B8"
            >
              Okklyuziya tekisligi
            </text>

            {/* Upper Row Teeth (18..11, 21..28) */}
            {UPPER_TEETH.map((tooth) => (
              <ToothSvgNode
                key={tooth.id}
                toothConfig={tooth}
                toothData={chartData[tooth.id]}
                isSelected={selectedToothId === tooth.id}
                isUpper={true}
                onSelect={handleSelect}
              />
            ))}

            {/* Lower Row Teeth (48..41, 31..38) */}
            {LOWER_TEETH.map((tooth) => (
              <ToothSvgNode
                key={tooth.id}
                toothConfig={tooth}
                toothData={chartData[tooth.id]}
                isSelected={selectedToothId === tooth.id}
                isUpper={false}
                onSelect={handleSelect}
              />
            ))}
          </svg>
        </div>

        {/* Lower Arch (Mandibula) Footer Row */}
        <div className={styles.archHeader}>
          <div className={styles.archHeaderGroup}>
            <span className={styles.archTitle}>Pastki Jag' (Mandibula)</span>
            <span className={styles.quadrantBadge}>Q4 (O'ng)</span>
          </div>
          <div className={styles.archHeaderGroup}>
            <span className={styles.quadrantBadge}>Q3 (Chap)</span>
            <span className={styles.fdiTag}>FDI Standart</span>
          </div>
        </div>

        {/* Legend Footer */}
        <div className={styles.legendRow}>
          <div className={styles.legendItem}>
            <span
              className={styles.legendIndicator}
              style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #94A3B8' }}
            />
            <span>Sog'lom</span>
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendIndicator}
              style={{ backgroundColor: '#FEE2E2', border: '1.5px solid #EF4444' }}
            />
            <span>Kariyes</span>
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendIndicator}
              style={{ backgroundColor: '#D1FAE5', border: '1.5px solid #10B981' }}
            />
            <span>Davolangan / Plomba</span>
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendIndicator}
              style={{ backgroundColor: '#E0F2FE', border: '1.5px solid #0284C7' }}
            />
            <span>Toj / Qoplama</span>
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendIndicator}
              style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', border: '2px solid #06B6D4' }}
            />
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Tanlangan tish
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
