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

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current || seen) return;
    const o = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setSeen(true); },
      { threshold }
    );
    o.observe(ref.current);
    return () => o.disconnect();
  }, [seen, threshold]);
  return [ref, seen] as const;
}

// ── Process Timeline ────────────────────────────────────────────────────────
const ProcessTimeline: React.FC = () => {
  const steps = [
    { n: '01', t: 'Recepción y diagnóstico', d: 'Cada dispositivo entra al laboratorio, se cataloga y se hace un diagnóstico inicial de hardware.', pts: '8 puntos' },
    { n: '02', t: 'Limpieza profunda', d: 'Limpieza de cuerpo, puertos, teclas, parlantes y reemplazo de adhesivos cuando es necesario.', pts: '6 puntos' },
    { n: '03', t: 'Inspección técnica', d: 'Pantalla, batería, cámara, sensores, conectividad. Si algo no pasa, se reemplaza con originales.', pts: '18 puntos' },
    { n: '04', t: 'Software limpio', d: 'Wipe completo, instalación limpia del SO y verificación de seguridad y autenticidad.', pts: '5 puntos' },
    { n: '05', t: 'Garantía y empaque', d: 'Cada dispositivo sale con su reporte firmado, accesorios nuevos y 90 días de garantía total.', pts: '3 puntos' },
  ];

  return (
    <section style={{ padding: '120px 32px', background: 'var(--st-cream)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 80, alignItems: 'flex-start' }}>
          {/* Header sticky */}
          <div style={{ position: 'sticky', top: 100 }}>
            <p className="st-eyebrow" style={{ marginBottom: 16 }}>Proceso · 40 puntos</p>
            <h2
              className="st-display"
              style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 300, lineHeight: 0.98, letterSpacing: '-0.035em', color: 'var(--st-clay)', marginBottom: 24 }}
            >
              Cómo<br />
              <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--st-earth)' }}>verificamos</em><br />
              cada equipo.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--st-earth)', maxWidth: 360, marginBottom: 24, fontFamily: 'var(--st-font-sans)' }}>
              No revendemos. <strong style={{ color: 'var(--st-clay)', fontWeight: 600 }}>Reacondicionamos.</strong> Cada dispositivo recorre cinco etapas con técnicos certificados antes de salir del laboratorio.
            </p>
          </div>

          {/* Steps */}
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 28, top: 20, bottom: 20, width: 1, background: 'var(--st-line)' }} />
            {steps.map((s, i) => (
              <li
                key={s.n}
                style={{ position: 'relative', display: 'grid', gridTemplateColumns: '60px 1fr', gap: 28, paddingBottom: i === steps.length - 1 ? 0 : 36 }}
              >
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: 'var(--st-bone)', border: '1px solid var(--st-line)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', zIndex: 1,
                    }}
                  >
                    <span className="st-mono" style={{ fontSize: 13, color: 'var(--st-clay)', fontWeight: 500 }}>{s.n}</span>
                  </div>
                </div>
                <div style={{ paddingTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                    <h3
                      className="st-display"
                      style={{ fontSize: 22, fontWeight: 400, color: 'var(--st-clay)', letterSpacing: '-0.02em' }}
                    >
                      {s.t}
                    </h3>
                    <span
                      className="st-mono"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 10px', fontSize: 11, fontWeight: 500,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        borderRadius: 'var(--st-radius-pill)',
                        background: 'transparent', color: 'var(--st-earth)',
                        border: '1px solid var(--st-line)',
                      }}
                    >
                      {s.pts}
                    </span>
                  </div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--st-earth)', maxWidth: 480, fontFamily: 'var(--st-font-sans)' }}>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

// ── Warranty Flow ───────────────────────────────────────────────────────────
const WarrantyFlow: React.FC = () => {
  const steps = [
    { n: '01', t: 'Reportas la falla', d: 'Desde tu cuenta o WhatsApp, en menos de 2 minutos.' },
    { n: '02', t: 'Diagnosticamos', d: 'Recogemos el equipo o lo revisas con un técnico certificado.' },
    { n: '03', t: 'Reemplazamos', d: 'Si la falla está cubierta, recibes un equipo equivalente o reembolso.' },
  ];

  return (
    <section style={{ padding: '120px 32px', background: 'var(--st-ink)', color: 'var(--st-bone)', position: 'relative', overflow: 'hidden' }}>
      {/* grain */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4, mixBlendMode: 'multiply',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.36 0 0 0 0 0.27 0 0 0 0 0.20 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />
      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 64px' }}>
          <p className="st-eyebrow" style={{ marginBottom: 16, color: 'var(--st-taupe)' }}>GARANTÍA · CÓMO FUNCIONA</p>
          <h2
            className="st-display"
            style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--st-bone)' }}
          >
            Si algo falla,{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--st-sand)' }}>respondemos.</em>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(244,244,242,0.65)', marginTop: 20, lineHeight: 1.65, fontFamily: 'var(--st-font-sans)' }}>
            Tres pasos. Sin letra chica, sin esperas eternas, sin disculpas.
          </p>
        </div>

        <div
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1,
            background: 'rgba(244,244,242,0.1)', border: '1px solid rgba(244,244,242,0.1)',
            borderRadius: 18, overflow: 'hidden',
          }}
        >
          {steps.map((s) => (
            <div key={s.n} style={{ background: 'var(--st-ink)', padding: 40, minHeight: 240 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <span className="st-display" style={{ fontSize: 56, fontWeight: 300, color: 'var(--st-taupe)', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.n}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--st-taupe)" strokeWidth="1.6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="st-display" style={{ fontSize: 24, fontWeight: 400, marginBottom: 10, letterSpacing: '-0.02em', color: 'var(--st-bone)' }}>{s.t}</h3>
              <p style={{ fontSize: 14, color: 'rgba(244,244,242,0.6)', lineHeight: 1.6, fontFamily: 'var(--st-font-sans)' }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .warranty-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

// ── Stats Section ───────────────────────────────────────────────────────────
const StatsSection: React.FC = () => {
  const [ref, seen] = useInView(0.3);
  const a = useCountUp(5247, 1600, seen);
  const b = useCountUp(97, 1500, seen);
  const c = useCountUp(12, 1400, seen);
  const d = useCountUp(63, 1700, seen);

  const stats = [
    { v: a.toLocaleString(), s: '+', l: 'Dispositivos entregados', sub: 'Desde 2023' },
    { v: b, s: '%', l: 'Satisfacción post-venta', sub: 'Encuesta NPS' },
    { v: c, s: '', l: 'Técnicos certificados', sub: 'En laboratorio' },
    { v: d, s: 't', l: 'CO₂ ahorrado', sub: 'Vs. fabricación nueva' },
  ];

  return (
    <section
      ref={ref}
      style={{ padding: '100px 32px', background: 'var(--st-cream)', borderTop: '1px solid var(--st-line)', borderBottom: '1px solid var(--st-line)' }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ borderLeft: i === 0 ? 'none' : '1px solid var(--st-line)', paddingLeft: i === 0 ? 0 : 32 }}>
            <p
              className="st-display"
              style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 300, color: 'var(--st-clay)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 14 }}
            >
              {s.v}<span style={{ color: 'var(--st-taupe)' }}>{s.s}</span>
            </p>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--st-clay)', marginBottom: 4, fontFamily: 'var(--st-font-sans)' }}>{s.l}</p>
            <p className="st-eyebrow">{s.sub}</p>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .stats-inner { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
};

// ── FAQ Section ─────────────────────────────────────────────────────────────
const FAQSection: React.FC = () => {
  const items = [
    { q: '¿Qué significa exactamente "Premium Refurbished"?', a: 'Que pasó por más de 40 puntos de inspección, se reemplazaron piezas dañadas por originales y se entregó con software limpio y reporte firmado.' },
    { q: '¿Cuál es la diferencia con un "usado"?', a: 'Un usado se vende como está. Un SafeTech se reacondiciona: lo dejamos en estado funcional como nuevo o no sale del laboratorio.' },
    { q: '¿Qué cubre la garantía de 90 días?', a: 'Cualquier falla de hardware no relacionada con uso indebido. Reemplazamos o reembolsamos, tú eliges.' },
    { q: '¿Puedo devolver el equipo si no me gusta?', a: 'Sí, tienes 14 días de devolución sin preguntas, además de la garantía.' },
    { q: '¿Cómo sé que el equipo es legítimo?', a: 'Cada dispositivo viene con su número de serie, reporte de inspección firmado y procedencia documentada.' },
  ];
  const [open, setOpen] = useState(0);

  return (
    <section style={{ padding: '120px 32px', background: 'var(--st-bone)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.7fr 1fr', gap: 80, alignItems: 'flex-start' }}>
        <div style={{ position: 'sticky', top: 100 }}>
          <p className="st-eyebrow" style={{ marginBottom: 16 }}>Preguntas frecuentes</p>
          <h2
            className="st-display"
            style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.035em', color: 'var(--st-clay)', marginBottom: 20 }}
          >
            Lo que{' '}
            <em style={{ fontStyle: 'italic' }}>siempre</em>{' '}
            nos preguntan.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--st-earth)', lineHeight: 1.65, marginBottom: 24, fontFamily: 'var(--st-font-sans)' }}>
            ¿No encuentras tu duda? Escríbenos directo y te respondemos.
          </p>
        </div>

        <div>
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{ borderTop: '1px solid var(--st-line)', borderBottom: i === items.length - 1 ? '1px solid var(--st-line)' : 'none' }}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{
                    width: '100%', padding: '24px 0', background: 'transparent', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 24, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  }}
                >
                  <span className="st-display" style={{ fontSize: 20, fontWeight: 400, color: 'var(--st-clay)', letterSpacing: '-0.015em' }}>
                    {it.q}
                  </span>
                  <span
                    style={{
                      flexShrink: 0, width: 36, height: 36, borderRadius: '50%',
                      border: `1px solid ${isOpen ? 'var(--st-clay)' : 'var(--st-line)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isOpen ? 'var(--st-bone)' : 'var(--st-clay)',
                      transition: 'all 0.3s var(--st-ease)',
                      transform: isOpen ? 'rotate(45deg)' : 'none',
                      background: isOpen ? 'var(--st-clay)' : 'transparent',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>
                <div style={{ maxHeight: isOpen ? 200 : 0, overflow: 'hidden', transition: 'max-height 0.4s var(--st-ease)' }}>
                  <p style={{ fontSize: 15, color: 'var(--st-earth)', lineHeight: 1.7, paddingBottom: 24, maxWidth: 560, fontFamily: 'var(--st-font-sans)' }}>
                    {it.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .faq-inner { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

// ── Final CTA ───────────────────────────────────────────────────────────────
const FinalCTA: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section style={{ padding: '140px 32px', background: 'var(--st-cream)', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', width: 800, height: 800, top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(circle, rgba(213,212,207,0.6) 0%, transparent 60%)',
        pointerEvents: 'none', filter: 'blur(40px)',
      }} />
      <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <span
          className="st-mono"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', fontSize: 11, fontWeight: 500,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            borderRadius: 'var(--st-radius-pill)',
            background: 'rgba(74,92,69,0.14)', color: 'var(--st-leaf)',
            marginBottom: 32,
          }}
        >
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--st-leaf)', animation: 'st-pulse 2s ease-in-out infinite' }} />
          Garantía 90 días incluida
        </span>
        <h2
          className="st-display"
          style={{ fontSize: 'clamp(48px, 7vw, 96px)', fontWeight: 300, lineHeight: 0.95, letterSpacing: '-0.04em', color: 'var(--st-clay)', marginBottom: 28 }}
        >
          Tecnología seria,<br />
          <em style={{ fontStyle: 'italic', color: 'var(--st-earth)' }}>precio justo.</em>
        </h2>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--st-earth)', maxWidth: 540, margin: '0 auto 36px', fontFamily: 'var(--st-font-sans)' }}>
          Miles de personas ya cambiaron a SafeTech. Sigue tú.
        </p>
        <div style={{ display: 'inline-flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              padding: '16px 28px', background: 'var(--st-clay)', color: 'var(--st-bone)',
              border: '1px solid var(--st-clay)', borderRadius: 'var(--st-radius-pill)',
              fontFamily: 'var(--st-font-sans)', fontSize: 15, fontWeight: 500, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 10,
              transition: 'all 0.3s var(--st-ease)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(20,20,19,0.25)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = ''; }}
          >
            Ver el catálogo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => navigate('/contacto')}
            style={{
              padding: '16px 28px', background: 'transparent', color: 'var(--st-clay)',
              border: '1px solid var(--st-clay)', borderRadius: 'var(--st-radius-pill)',
              fontFamily: 'var(--st-font-sans)', fontSize: 15, fontWeight: 500, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 10,
              transition: 'all 0.3s var(--st-ease)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--st-ink)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--st-bone)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--st-ink)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--st-clay)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--st-clay)'; }}
          >
            Hablar con ventas
          </button>
        </div>
      </div>
    </section>
  );
};

// ── Footer ──────────────────────────────────────────────────────────────────
const Footer: React.FC = () => {
  const navigate = useNavigate();
  return (
    <footer style={{ background: 'var(--st-ink)', color: 'var(--st-bone)', padding: '80px 32px 32px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 48, marginBottom: 64 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, color: 'var(--st-bone)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 5v6.5c0 4.7 3.3 8.9 8 10.5 4.7-1.6 8-5.8 8-10.5V5l-8-3z" stroke="currentColor" strokeWidth="1.4" />
                <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <path d="M12 7v2M12 15v2M7 12h2M15 12h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span className="st-display" style={{ fontSize: 18, fontWeight: 400, letterSpacing: '-0.03em', fontStyle: 'italic' }}>
                Safe<span style={{ fontStyle: 'normal', fontWeight: 300 }}>Tech</span>
              </span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(244,244,242,0.55)', maxWidth: 280, fontFamily: 'var(--st-font-sans)' }}>
              Tecnología reacondicionada con 40 puntos de inspección, 90 días de garantía y precio justo.
            </p>
          </div>
          <div>
            <p className="st-eyebrow" style={{ color: 'rgba(244,244,242,0.4)', marginBottom: 20 }}>Tienda</p>
            {['Catálogo', 'Celulares', 'Laptops', 'Tablets', 'Audio'].map((l) => (
              <p key={l} style={{ fontSize: 14, color: 'rgba(244,244,242,0.6)', marginBottom: 10, cursor: 'pointer', fontFamily: 'var(--st-font-sans)', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--st-bone)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(244,244,242,0.6)')}
              >{l}</p>
            ))}
          </div>
          <div>
            <p className="st-eyebrow" style={{ color: 'rgba(244,244,242,0.4)', marginBottom: 20 }}>Empresa</p>
            {[
              { label: 'Nosotros', path: '/nosotros' },
              { label: 'Proceso de certificación', path: '/nosotros' },
              { label: 'Blog', path: '/' },
              { label: 'Contacto', path: '/contacto' },
            ].map((l) => (
              <p
                key={l.label}
                onClick={() => navigate(l.path)}
                style={{ fontSize: 14, color: 'rgba(244,244,242,0.6)', marginBottom: 10, cursor: 'pointer', fontFamily: 'var(--st-font-sans)', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--st-bone)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(244,244,242,0.6)')}
              >{l.label}</p>
            ))}
          </div>
          <div>
            <p className="st-eyebrow" style={{ color: 'rgba(244,244,242,0.4)', marginBottom: 20 }}>Soporte</p>
            {['Garantías', 'Devoluciones', 'Mis pedidos', 'FAQ'].map((l) => (
              <p key={l} style={{ fontSize: 14, color: 'rgba(244,244,242,0.6)', marginBottom: 10, cursor: 'pointer', fontFamily: 'var(--st-font-sans)', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--st-bone)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(244,244,242,0.6)')}
              >{l}</p>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 32, borderTop: '1px solid rgba(244,244,242,0.1)', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'rgba(244,244,242,0.35)', fontFamily: 'var(--st-font-sans)' }}>© 2025 SafeTech · Todos los derechos reservados</p>
          <p className="st-mono" style={{ fontSize: 11, color: 'rgba(244,244,242,0.25)' }}>Panamá · Est. 2023</p>
        </div>
      </div>
    </footer>
  );
};

export default function Landing() {
  return (
    <div>
      <HeroSection />
      <ProcessTimeline />
      <BenefitsGrid />
      <FeaturedProducts />
      <WarrantyFlow />
      <StatsSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
