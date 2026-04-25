import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'card' | 'table-row';
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  style,
}) => (
  <div
    className={`skeleton skeleton-${variant}`}
    style={{ width, height, ...style }}
  />
);

export const SkeletonCard: React.FC = () => (
  <div style={{ background: 'var(--white)', border: '0.5px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
    <Skeleton variant="card" style={{ height: 200, borderRadius: 0 }} />
    <div style={{ padding: '1.125rem' }}>
      <Skeleton variant="text" style={{ width: '70%', marginBottom: 10 }} />
      <Skeleton variant="text" style={{ width: '40%', marginBottom: 16 }} />
      <Skeleton variant="text" style={{ width: '90%' }} />
      <Skeleton variant="text" style={{ width: '80%' }} />
    </div>
  </div>
);

export const SkeletonTableRow: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} style={{ padding: '13px 16px', borderBottom: '0.5px solid var(--line)' }}>
        <Skeleton variant="text" style={{ width: i === 0 ? '60%' : '80%' }} />
      </td>
    ))}
  </tr>
);
