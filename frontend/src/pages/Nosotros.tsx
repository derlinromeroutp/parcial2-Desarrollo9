import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function useCount(target: number, active: boolean, ms = 1100) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let t0: number | null = null;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / ms, 1);
      setV(Math.floor((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) requestAnimationFrame(tick); else setV(target);
    };
    requestAnimationFrame(tick);
  }, [active, target, ms]);
  return v;
}

const team = [
  { name: 'Camila Ruiz',   role: 'CEO & Co-fundadora',   bio: 'Ingeniera en electrónica con 12 años certificando equipos para distribuidoras regionales.', initials: 'CR', color: '#3D1F12' },
  { name: 'Mateo Reyes',   role: 'Director técnico',      bio: 'Apple Certified Technician. Lidera el protocolo de inspección de 40+ puntos.', initials: 'MR', color: '#4A5C45' },
  { name: 'Lucía Ortiz',   role: 'Inspectora senior',     bio: 'Especialista en pantallas y baterías. Más de 3,000 dispositivos certificados.', initials: 'LO', color: '#2E2D2B' },
  { name: 'Daniel Vega',   role: 'Logística',             bio: 'Operaciones y cadena de suministro. Tiempo promedio de entrega: 3.2 días.', initials: 'DV', color: '#5C5B57' },
];

const pillars = [
  { n: '01', t: 'Inspección obsesiva',      d: 'Cada dispositivo se prueba en 40 puntos: pantalla, batería, puertos, sensores, software. Si reprueba uno, no se vende.' },
  { n: '02', t: 'Garantía sin asteriscos',  d: '90 días totales desde la entrega. Si falla, lo reemplazamos. No hay lectura de letra chica.' },
  { n: '03', t: 'Cero residuos electrónicos', d: 'Lo que no se puede restaurar se desmonta. Las piezas regresan al ciclo. Cero al vertedero.' },
];

export default function Nosotros() {
  const navigate = useNavigate();
  const statsRef = useRef<HTMLDivElement>(null);
  const [fired, setFired] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setFired(true); }, { threshold: 0.25 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const c1 = useCount(27,    fired, 800);
  const c2 = useCount(5200,  fired, 1400);
  const c3 = useCount(40,    fired, 900);
  const c4 = useCount(49,    fired, 1000);

  return (
    <div style={{ background: 'var(--st-bone)' }}>

      {/* ── HERO ── */}
      <section style={{ padding: '80px 32px 60px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 64, alignItems: 'flex-end' }}>
          <div>
            <p className="st-eyebrow" style={{ marginBottom: 18 }}>NOSOTROS · DESDE 2023</p>
            <h1
              className="st-display"
              style={{ fontSize: 'clamp(48px, 7vw, 96px)', fontWeight: 300, lineHeight: 0.95, letterSpacing: '-0.045em', color: 'var(--st-clay)' }}
            >
              Reparamos<br />tecnología,<br />
              <em style={{ fontStyle: 'italic', color: 'var(--st-earth)' }}>no la desechamos.</em>
            </h1>
          </div>
          <div>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--st-earth)', marginBottom: 16, fontFamily: 'var(--st-font-sans)' }}>
              SafeTech nació con una idea simple: la tecnología no se gasta — se descarta. Cada año millones de dispositivos perfectamente funcionales terminan en gavetas o vertederos.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--st-earth)', fontFamily: 'var(--st-font-sans)' }}>
              Llevamos años devolviéndolos al mundo. Cada uno pasa por <strong style={{ color: 'var(--st-clay)' }}>40 puntos de inspección</strong> y sale con 90 días de garantía.
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section
        ref={statsRef}
        style={{ padding: '40px 32px', borderTop: '1px solid var(--st-line)', borderBottom: '1px solid var(--st-line)', overflow: 'hidden' }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
          {[
            { n: `${c1}`, l: 'años de oficio' },
            { n: `${c2.toLocaleString()}+`, l: 'dispositivos restaurados' },
            { n: `${c3}`, l: 'puntos de inspección' },
            { n: `4.${c4 > 49 ? 9 : c4 < 49 ? Math.floor(c4 / 10) : 9}`, l: 'rating en reseñas' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '28px 32px', borderRight: i < 3 ? '1px solid var(--st-line)' : 'none' }}>
              <p
                className="st-display"
                style={{ fontSize: 'clamp(48px, 5.5vw, 72px)', fontWeight: 300, lineHeight: 0.95, letterSpacing: '-0.04em', color: 'var(--st-clay)', marginBottom: 8 }}
              >
                {s.n}
              </p>
              <p className="st-eyebrow">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PILLARS ── */}
      <section style={{ padding: '100px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p className="st-eyebrow" style={{ marginBottom: 16 }}>NUESTROS PILARES</p>
          <h2
            className="st-display"
            style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.035em', color: 'var(--st-clay)', marginBottom: 60, maxWidth: 720 }}
          >
            Lo que hacemos diferente, <em style={{ fontStyle: 'italic' }}>en práctica.</em>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {pillars.map((p) => (
              <article
                key={p.n}
                style={{ padding: '28px 0 32px', borderTop: '1px solid var(--st-clay)' }}
              >
                <p className="st-mono" style={{ fontSize: 11, color: 'var(--st-rust)', letterSpacing: '0.1em', marginBottom: 18 }}>{p.n}</p>
                <h3
                  className="st-display"
                  style={{ fontSize: 26, fontWeight: 400, lineHeight: 1.1, color: 'var(--st-clay)', marginBottom: 14, letterSpacing: '-0.02em' }}
                >
                  {p.t}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--st-earth)', fontFamily: 'var(--st-font-sans)' }}>{p.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section style={{ padding: '60px 32px 100px', background: 'var(--st-cream)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 24 }}>
            <div>
              <p className="st-eyebrow" style={{ marginBottom: 16 }}>EL EQUIPO</p>
              <h2
                className="st-display"
                style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.035em', color: 'var(--st-clay)' }}
              >
                Personas reales, <em style={{ fontStyle: 'italic' }}>oficio real.</em>
              </h2>
            </div>
            <p style={{ fontSize: 14, color: 'var(--st-earth)', maxWidth: 320, fontFamily: 'var(--st-font-sans)' }}>
              Técnicos certificados, no operarios de línea. Cada inspector firma su reporte.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {team.map((m) => (
              <TeamCard key={m.name} member={m} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '120px 32px', background: 'var(--st-ink)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: 600, height: 600, top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(74,92,69,0.15) 0%, transparent 60%)',
          pointerEvents: 'none', filter: 'blur(60px)',
        }} />
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <h2
            className="st-display"
            style={{ fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--st-bone)', marginBottom: 24 }}
          >
            ¿Listo para comprar <em style={{ fontStyle: 'italic', color: 'var(--st-sand)' }}>con confianza?</em>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(244,244,242,0.55)', lineHeight: 1.75, marginBottom: 36, fontFamily: 'var(--st-font-sans)' }}>
            Cada dispositivo con garantía de 90 días incluida. Sin sorpresas.
          </p>
          <button
            onClick={() => navigate('/home')}
            style={{
              padding: '16px 36px', background: 'var(--st-bone)', color: 'var(--st-ink)',
              border: 'none', borderRadius: 'var(--st-radius-pill)',
              fontFamily: 'var(--st-font-sans)', fontSize: 15, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.25s var(--st-ease)',
              display: 'inline-flex', alignItems: 'center', gap: 10,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 28px rgba(0,0,0,0.3)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--st-bone)'; (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = ''; }}
          >
            Ver catálogo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .nosotros-hero  { grid-template-columns: 1fr !important; }
          .nosotros-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .nosotros-team  { grid-template-columns: repeat(2, 1fr) !important; }
          .nosotros-pillars { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .nosotros-team  { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function TeamCard({ member }: { member: typeof team[0] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--st-bone)', borderRadius: 14, overflow: 'hidden',
        border: '1px solid var(--st-line)', transition: 'all 0.3s var(--st-ease)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 20px 48px -12px rgba(46,45,43,0.15)' : 'none',
      }}
    >
      <div
        style={{
          aspectRatio: '4/3', background: member.color, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span
          className="st-display"
          style={{ fontSize: 40, fontWeight: 300, color: 'rgba(244,244,242,0.8)', letterSpacing: '-0.02em' }}
        >
          {member.initials}
        </span>
      </div>
      <div style={{ padding: '20px 20px 24px' }}>
        <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--st-clay)', marginBottom: 4, fontFamily: 'var(--st-font-sans)' }}>
          {member.name}
        </p>
        <p className="st-mono" style={{ fontSize: 10, color: 'var(--st-rust)', letterSpacing: '0.08em', marginBottom: 12 }}>
          {member.role.toUpperCase()}
        </p>
        <p style={{ fontSize: 13, color: 'var(--st-earth)', lineHeight: 1.6, fontFamily: 'var(--st-font-sans)' }}>
          {member.bio}
        </p>
      </div>
    </article>
  );
}
