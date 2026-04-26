import { HeroSection } from '../components/HeroSection';
import { BenefitsGrid } from '../components/BenefitsGrid';
import { FeaturedProducts } from '../components/FeaturedProducts';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

function useCountUp(target: number, duration = 1500, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
      else setValue(target);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return value;
}

const StatsSection: React.FC = () => {
  const [counting, setCounting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setCounting(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const c1 = useCountUp(5000, 1800, counting);
  const c2 = useCountUp(97, 1600, counting);
  const c3 = useCountUp(12, 1400, counting);

  return (
    <section 
      ref={ref}
      style={{ 
        padding: '4rem 0', 
        background: 'var(--ink)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="page-container">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '2rem',
          textAlign: 'center',
        }}>
          {[
            { value: `${c1.toLocaleString()}+`, label: 'Dispositivos reacondicionados', sub: 'desde 2023' },
            { value: `${c2}%`, label: 'Satisfacción', sub: 'en post-venta' },
            { value: `${c3}`, label: 'Técnicos', sub: 'certificados' },
          ].map((stat, i) => (
            <div key={i} style={{ padding: '1rem' }}>
              <p style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 300,
                color: 'var(--white)',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                marginBottom: '0.5rem',
              }}>
                {stat.value}
              </p>
              <p style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'var(--white)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-sans)',
                marginBottom: '0.25rem',
              }}>
                {stat.label}
              </p>
              <p style={{
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.35)',
                fontFamily: 'var(--font-sans)',
              }}>
                {stat.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div>
      <HeroSection />
      <BenefitsGrid />
      <FeaturedProducts />
      <StatsSection />

      <section style={{
        padding: '5rem 0',
        background: 'var(--ink)',
      }}>
        <div className="page-container" style={{ textAlign: 'center', maxWidth: 540 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            fontWeight: 300,
            marginBottom: '1rem',
            color: 'var(--white)',
            letterSpacing: '-0.02em',
          }}>
            Empieza a comprar tecnología que vale la pena
          </h2>
          <p style={{
            fontSize: '0.9rem',
            marginBottom: '2rem',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.65,
            fontFamily: 'var(--font-sans)',
            fontWeight: 300,
          }}>
            Sin trampas. Sin sorpresas. Solo dispositivos que funcionan.
          </p>
          <button
            onClick={() => navigate('/home')}
            style={{
              background: 'var(--white)',
              color: 'var(--ink)',
              border: 'none',
              padding: '14px 32px',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8rem',
              fontWeight: 500,
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = '';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
            }}
          >
            Ver catálogo ahora
          </button>
        </div>
      </section>

      <footer style={{
        padding: '2.5rem 0',
        background: 'var(--ink)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 400, color: 'var(--white)', letterSpacing: '-0.01em' }}>SafeTech</p>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-sans)' }}>© 2025 SafeTech.</p>
        </div>
      </footer>
    </div>
  );
}