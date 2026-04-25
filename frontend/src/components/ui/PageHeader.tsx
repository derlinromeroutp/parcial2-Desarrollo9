import React from 'react';

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, breadcrumbs }) => (
  <div style={{ marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '0.5px solid var(--line)' }}>
    {breadcrumbs && breadcrumbs.length > 0 && (
      <nav style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: 'var(--line)', fontSize: '0.75rem' }}>/</span>}
            {crumb.href ? (
              <a
                href={crumb.href}
                style={{ fontSize: '0.72rem', color: 'var(--ink3)', fontFamily: 'var(--font-display)', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink3)')}
              >
                {crumb.label}
              </a>
            ) : (
              <span style={{ fontSize: '0.72rem', color: 'var(--ink2)', fontFamily: 'var(--font-display)' }}>
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    )}
    <h1 style={{
      fontFamily: 'var(--font-serif)',
      fontStyle: 'italic',
      fontWeight: 400,
      fontSize: 'clamp(1.75rem, 5vw, 3rem)',
      color: 'var(--ink)',
      lineHeight: 1.1,
      marginBottom: subtitle ? '0.375rem' : 0,
    }}>
      {title}
    </h1>
    {subtitle && (
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.875rem',
        fontWeight: 400,
        color: 'var(--ink2)',
        lineHeight: 1.5,
      }}>
        {subtitle}
      </p>
    )}
  </div>
);
