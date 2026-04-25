import React from 'react';

interface DividerProps {
  label?: string;
  style?: React.CSSProperties;
}

export const Divider: React.FC<DividerProps> = ({ label, style }) => {
  if (label) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0', ...style }}>
        <div style={{ flex: 1, height: '0.5px', background: 'var(--line)' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ink3)' }}>
          {label}
        </span>
        <div style={{ flex: 1, height: '0.5px', background: 'var(--line)' }} />
      </div>
    );
  }

  return (
    <div style={{ height: '0.5px', background: 'var(--line)', margin: '1.5rem 0', ...style }} />
  );
};
