export const chartColors = {
  // Risk colors
  low: '#22c55e',      // green-500
  medium: '#f59e0b',   // amber-500
  high: '#ef4444',     // red-500

  // Data series colors
  primary: '#6366f1',  // indigo-500
  secondary: '#8b5cf6', // violet-500
  accent: '#06b6d4',   // cyan-500

  // Comment sentiment colors
  authentic: '#22c55e',  // green
  genericBot: '#ef4444', // red
  emojiOnly: '#f59e0b',  // amber
  spam: '#f97316',       // orange

  // Chart infrastructure
  grid: 'rgba(255,255,255,0.06)',
  axis: '#6b7280',       // gray-500
  tooltip: {
    background: '#1f2937',
    border: 'rgba(255,255,255,0.1)',
    text: '#f9fafb',
  },
}

export const chartDefaults = {
  // Default props for all Recharts components
  margin: { top: 10, right: 10, left: 0, bottom: 0 },
  fontSize: 12,
  fontFamily: 'inherit',
}

// Tooltip style object (pass to Recharts contentStyle)
export const tooltipStyle = {
  backgroundColor: chartColors.tooltip.background,
  border: `1px solid ${chartColors.tooltip.border}`,
  borderRadius: '8px',
  color: chartColors.tooltip.text,
  fontSize: '12px',
}

// Axis tick style (pass to XAxis/YAxis tick prop)
export const axisTickStyle = {
  fill: chartColors.axis,
  fontSize: 11,
}
