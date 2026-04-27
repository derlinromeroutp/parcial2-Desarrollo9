import React, { useState } from 'react';

const benefits = [
  {
    eyebrow: '01 · INSPECCIÓN',
    title: '40+ puntos de control',
    desc: 'Cada dispositivo pasa por verificación rigurosa de hardware, software y batería.',
    stat: '40',
    statLabel: 'Puntos verificados',
    visual: (
      <svg viewBox="0 0 100 100" fill="none" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="0.8" opacity="0.2" strokeDasharray="2 4" />
        <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const x1 = 50 + Math.cos(angle) * 32;
          const y1 = 50 + Math.sin(angle) * 32;
          const x2 = 50 + Math.cos(angle) * 38;
          const y2 = 50 + Math.sin(angle) * 38;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.8" />;
        })}
        <circle cx="50" cy="50" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    eyebrow: '02 · GARANTÍA',
    title: '90 días de respaldo',
    desc: 'Si algo falla en los primeros tres meses, lo reemplazamos. Punto.',
    stat: '90d',
    statLabel: 'Cobertura total',
    visual: (
      <svg viewBox="0 0 100 100" fill="none" style={{ width: '100%', height: '100%' }}>
        <path d="M50 12 L82 24 V52 C82 70 68 84 50 88 C32 84 18 70 18 52 V24 L50 12 Z" stroke="currentColor" strokeWidth="0.8" fill="none" />
        <path d="M50 18 L76 28 V52 C76 67 64 79 50 82 C36 79 24 67 24 52 V28 L50 18 Z" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <path d="M40 50 L47 57 L62 42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    eyebrow: '03 · PRECIO',
    title: 'Hasta 40% menos',
    desc: 'Misma calidad técnica que un equipo nuevo. Sin pagar el sobreprecio del estreno.',
    stat: '−40%',
    statLabel: 'Vs. precio retail',
    visual: (
      <svg viewBox="0 0 100 100" fill="none" style={{ width: '100%', height: '100%' }}>
        <rect x="20" y="30" width="50" height="6" rx="3" fill="currentColor" opacity="0.15" />
        <rect x="20" y="42" width="50" height="6" rx="3" fill="currentColor" opacity="0.3" />
        <rect x="20" y="54" width="50" height="6" rx="3" fill="currentColor" opacity="0.5" />
        <rect x="20" y="66" width="30" height="6" rx="3" fill="currentColor" />
        <path d="M62 24 L72 24 L72 34 M72 24 L60 36" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    eyebrow: '04 · IMPACTO',
    title: 'Una vida más, no menos',
    desc: 'Cada dispositivo refurbished evita extracción de tierras raras y reduce e-waste.',
    stat: '12kg',
    statLabel: 'CO₂ ahorrado / equipo',
    visual: (
      <svg viewBox="0 0 100 100" fill="none" style={{ width: '100%', height: '100%' }}>
        <path d="M50 18 C30 28 24 45 30 60 C36 75 50 80 50 80 C50 80 64 75 70 60 C76 45 70 28 50 18 Z" stroke="currentColor" strokeWidth="0.8" fill="none" />
        <path d="M50 78 V40" stroke="currentColor" strokeWidth="0.8" />
        <path d="M50 50 L40 42 M50 58 L60 50 M50 66 L40 58" stroke="currentColor" strokeWidth="0.8" />
      </svg>
    ),
  },
];

const BenefitCard: React.FC<{ b: typeof benefits[0] }> = ({ b }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'var(--st-ink)' : 'var(--st-bone)',
        color: hover ? 'var(--st-bone)' : 'var(--st-clay)',
        padding: '40px 36px',
        position: 'relative',
        minHeight: 320,
        cursor: 'pointer',
        transition: 'all 0.5s var(--st-ease)',
        overflow: 'hidden',
      }}
    >
      {/* Visual graphic */}
      <div
        style={{
          position: 'absolute', top: 28, right: 28,
          width: 100, height: 100,
          color: hover ? 'var(--st-taupe)' : 'var(--st-sand)',
          opacity: hover ? 0.5 : 0.7,
          transition: 'all 0.5s var(--st-ease)',
          transform: hover ? 'rotate(20deg) scale(1.1)' : 'rotate(0) scale(1)',
        }}
      >
        {b.visual}
      </div>

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 240 }}>
        <p
          className="st-mono"
          style={{ fontSize: 11, color: hover ? 'var(--st-taupe)' : 'var(--st-earth)', letterSpacing: '0.1em', marginBottom: 'auto', transition: 'color 0.5s var(--st-ease)' }}
        >
          {b.eyebrow}
        </p>

        <div style={{ marginTop: 'auto' }}>
          <p
            className="st-display"
            style={{
              fontSize: 64, fontWeight: 300, lineHeight: 0.9, letterSpacing: '-0.04em',
              color: hover ? 'var(--st-bone)' : 'var(--st-clay)', marginBottom: 8,
              transition: 'color 0.5s var(--st-ease)',
            }}
          >
            {b.stat}
          </p>
          <p
            className="st-mono"
            style={{ fontSize: 11, color: hover ? 'var(--st-taupe)' : 'var(--st-earth)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24, transition: 'color 0.5s var(--st-ease)' }}
          >
            {b.statLabel}
          </p>

          <h3 className="st-display" style={{ fontSize: 22, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 8 }}>
            {b.title}
          </h3>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: hover ? 'rgba(244,244,242,0.7)' : 'var(--st-earth)', maxWidth: 380, fontFamily: 'var(--st-font-sans)', transition: 'color 0.5s var(--st-ease)' }}>
            {b.desc}
          </p>
        </div>
      </div>
    </div>
  );
};

export const BenefitsGrid: React.FC = () => {
  return (
    <section style={{ padding: '120px 32px', background: 'var(--st-bone)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, gap: 32, flexWrap: 'wrap' }}>
          <div>
            <p className="st-eyebrow" style={{ marginBottom: 16 }}>Por qué SafeTech</p>
            <h2
              className="st-display"
              style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.035em', color: 'var(--st-clay)', maxWidth: 640 }}
            >
              Cuatro promesas{' '}
              <em style={{ fontStyle: 'italic' }}>concretas</em>, no marketing.
            </h2>
          </div>
          <p style={{ fontSize: 14, color: 'var(--st-earth)', maxWidth: 280, lineHeight: 1.6, paddingBottom: 8, fontFamily: 'var(--st-font-sans)' }}>
            Lo que distingue un equipo de SafeTech de cualquier otro reacondicionado del mercado.
          </p>
        </div>

        <div
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1, background: 'var(--st-line)',
            border: '1px solid var(--st-line)', borderRadius: 18, overflow: 'hidden',
          }}
        >
          {benefits.map((b, i) => (
            <BenefitCard key={i} b={b} />
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .benefits-inner { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};
