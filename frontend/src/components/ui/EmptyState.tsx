import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  cta?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, cta }) => (
  <div className="empty-state">
    {icon && <div className="empty-state-icon">{icon}</div>}
    <h3 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, fontSize: '1.35rem', color: 'var(--ink)', marginBottom: '0.375rem' }}>
      {title}
    </h3>
    {description && (
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', color: 'var(--ink2)', marginBottom: cta ? '1.5rem' : 0 }}>
        {description}
      </p>
    )}
    {cta}
  </div>
);
