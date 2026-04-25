import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Counter hook ──────────────────────────────────────────────────────────
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

// ── Team data ─────────────────────────────────────────────────────────────
const team = [
  { name: 'Carlos Mendoza', role: 'CEO & Fundador',     bio: 'Ingeniero en electrónica con 12 años certificando equipos para distribuidoras regionales.', initials: 'CM', color: '#441306' },
  { name: 'Ana Torres',     role: 'Directora Técnica',  bio: 'Apple Certified Technician. Lidera el protocolo de inspección de 40+ puntos de SafeTech.', initials: 'AT', color: '#1e3a5f' },
  { name: 'Luis Vargas',    role: 'Jefe de Logística',  bio: 'Operaciones y cadena de suministro para garantizar que cada equipo llegue en condición óptima.', initials: 'LV', color: '#1a4731' },
  { name: 'María Solís',    role: 'Atención al Cliente', bio: 'Especialista en posventa. Tiempo de respuesta promedio: 18 minutos en horario laboral.', initials: 'MS', color: '#4a1942' },
];

const values = [
  {
    n: '01',
    title: 'Transparencia total',
    body: 'Cada dispositivo llega con su reporte de inspección detallado. Sin sorpresas, sin letra pequeña. Sabes exactamente qué compras.',
  },
  {
    n: '02',
    title: 'Calidad garantizada',
    body: '40+ puntos de verificación técnica por equipo. Si un dispositivo no pasa, no se vende. No hay excepciones.',
  },
  {
    n: '03',
    title: 'Precio justo',
    body: 'Hasta 40% más barato que comprar nuevo. La misma tecnología, sin el costo del empaque y el marketing original.',
  },
  {
    n: '04',
    title: 'Impacto sostenible',
    body: 'Cada equipo reacondicionado evita hasta 70 kg de CO₂. Elegir SafeTech es también elegir el planeta.',
  },
];

export default function Nosotros() {
  const navigate     = useNavigate();
  const statsRef     = useRef<HTMLDivElement>(null);
  const [fired, setFired] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setFired(true); }, { threshold: 0.25 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const c1 = useCount(5000,  fired, 1400);
  const c2 = useCount(97,    fired, 1000);
  const c3 = useCount(12,    fired,  900);
  const c4 = useCount(90,    fired,  800);

  return (
    <div style={{ background: 'var(--cream)' }}>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section style={{
        background: 'var(--ink)',
        position: 'relative',
        overflow: 'hidden',
        padding: '5rem 0 5.5rem',
      }}>
        {/* Noise */}
        <div style={{ position:'absolute', inset:0, opacity:.04, pointerEvents:'none',
          backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
        {/* Diagonal lines */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:'repeating-linear-gradient(45deg,transparent,transparent 80px,rgba(255,255,255,.015) 80px,rgba(255,255,255,.015) 81px)' }} />

        <div className="page-container" style={{ position:'relative', zIndex:2 }}>
          <p className="animate-slide-up" style={{ fontSize:'.62rem', fontWeight:600, letterSpacing:'3px', textTransform:'uppercase', color:'rgba(255,255,255,.35)', fontFamily:'var(--font-sans)', marginBottom:'1.25rem' }}>
            Nuestra historia
          </p>
          <h1 className="animate-slide-up stagger-2" style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2.75rem,6vw,5rem)', fontWeight:300, color:'var(--white)', lineHeight:1.05, letterSpacing:'-.035em', maxWidth:700, marginBottom:'1.75rem' }}>
            Creemos que la tecnología buena no debería costar una fortuna.
          </h1>
          <p className="animate-slide-up stagger-3" style={{ fontFamily:'var(--font-sans)', fontSize:'1rem', color:'rgba(255,255,255,.5)', lineHeight:1.8, maxWidth:520, fontWeight:300 }}>
            SafeTech nació en Panamá en 2023 con una idea simple: darle una segunda vida a los dispositivos electrónicos de calidad, con inspección técnica rigurosa y garantía real.
          </p>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section ref={statsRef} style={{ background:'var(--white)', borderBottom:'1px solid var(--line)' }}>
        <div className="page-container">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderLeft:'1px solid var(--line)' }}>
            {[
              { value: `${c1.toLocaleString()}+`, label:'Dispositivos certificados', sub:'desde 2023' },
              { value: `${c2}%`,                  label:'Satisfacción de clientes',  sub:'en post-venta' },
              { value: `${c3}`,                   label:'Técnicos certificados',      sub:'en nuestro equipo' },
              { value: `${c4} días`,              label:'Garantía incluida',          sub:'en cada equipo' },
            ].map((s, i) => (
              <div key={i} style={{ padding:'2.5rem 2rem', borderRight:'1px solid var(--line)', borderBottom:'1px solid var(--line)' }}>
                <p style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,3.5vw,2.75rem)', fontWeight:300, color:'var(--ink)', letterSpacing:'-.04em', lineHeight:1, marginBottom:'.5rem' }}>
                  {s.value}
                </p>
                <p style={{ fontFamily:'var(--font-sans)', fontSize:'.78rem', fontWeight:600, color:'var(--ink2)', marginBottom:'.2rem' }}>{s.label}</p>
                <p style={{ fontFamily:'var(--font-sans)', fontSize:'.7rem', color:'var(--gray)' }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORY ───────────────────────────────────────────── */}
      <section style={{ padding:'5.5rem 0', background:'var(--cream)' }}>
        <div className="page-container">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6rem', alignItems:'start' }}>
            {/* Left: big manifesto */}
            <div>
              <p style={{ fontSize:'.62rem', fontWeight:600, letterSpacing:'3px', textTransform:'uppercase', color:'var(--gray)', fontFamily:'var(--font-sans)', marginBottom:'1.25rem' }}>
                Nuestra misión
              </p>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.75rem,3vw,2.5rem)', fontWeight:400, fontStyle:'italic', color:'var(--ink)', letterSpacing:'-.03em', lineHeight:1.2, marginBottom:'2rem' }}>
                "Democratizar el acceso a la tecnología sin sacrificar calidad ni confianza."
              </h2>
              <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                {[
                  'Cada dispositivo que vendemos ha pasado por nuestro protocolo de inspección de 40+ puntos antes de llegar a tus manos.',
                  'Trabajamos con técnicos certificados por los fabricantes originales. No aceptamos dispositivos que no cumplan nuestros estándares, sin excepciones.',
                  'La garantía de 90 días no es un slogan — es un compromiso legal que cubrimos con nuestro propio equipo técnico.',
                ].map((t, i) => (
                  <div key={i} style={{ display:'flex', gap:'1rem', alignItems:'flex-start' }}>
                    <span style={{ width:20, height:20, background:'var(--ink)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                    <p style={{ fontFamily:'var(--font-sans)', fontSize:'.9rem', color:'var(--ink2)', lineHeight:1.75, fontWeight:300 }}>{t}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: timeline */}
            <div>
              <p style={{ fontSize:'.62rem', fontWeight:600, letterSpacing:'3px', textTransform:'uppercase', color:'var(--gray)', fontFamily:'var(--font-sans)', marginBottom:'1.25rem' }}>
                Nuestro camino
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {[
                  { year:'2023', title:'Fundación',       body:'SafeTech abre sus puertas en Ciudad de Panamá con 3 técnicos y el compromiso de hacer las cosas diferente.' },
                  { year:'2023', title:'Primer millar',   body:'500 dispositivos certificados en los primeros 6 meses. 98% de satisfacción en encuestas post-venta.' },
                  { year:'2024', title:'Garantía 90 días', body:'Lanzamos la garantía ampliada de 90 días — la más generosa del mercado local de reacondicionados.' },
                  { year:'2024', title:'Expansión',       body:'Abrimos taller técnico propio y ampliamos el equipo a 12 especialistas certificados.' },
                  { year:'2025', title:'SafeTech Online',  body:'Lanzamos nuestra plataforma digital para que cualquier persona en Panamá pueda comprar con confianza.' },
                ].map((m, i, arr) => (
                  <div key={i} style={{ display:'flex', gap:'1.25rem', paddingBottom: i < arr.length - 1 ? '1.75rem' : 0 }}>
                    {/* Line + dot */}
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                      <div style={{ width:10, height:10, borderRadius:'50%', background:'var(--ink)', flexShrink:0, marginTop:4 }} />
                      {i < arr.length - 1 && (
                        <div style={{ width:1, flex:1, background:'var(--line)', marginTop:6 }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: i < arr.length - 1 ? '0' : 0 }}>
                      <div style={{ display:'flex', gap:'.75rem', alignItems:'baseline', marginBottom:'.3rem' }}>
                        <span style={{ fontFamily:'var(--font-sans)', fontSize:'.65rem', fontWeight:700, letterSpacing:'1.5px', color:'var(--gray)', textTransform:'uppercase' }}>{m.year}</span>
                        <span style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:600, color:'var(--ink)' }}>{m.title}</span>
                      </div>
                      <p style={{ fontFamily:'var(--font-sans)', fontSize:'.82rem', color:'var(--ink3)', lineHeight:1.65, fontWeight:300 }}>{m.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ──────────────────────────────────────────── */}
      <section style={{ background:'var(--white)', borderTop:'1px solid var(--line)', padding:'5.5rem 0' }}>
        <div className="page-container">
          <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
            <p style={{ fontSize:'.62rem', fontWeight:600, letterSpacing:'3px', textTransform:'uppercase', color:'var(--gray)', fontFamily:'var(--font-sans)', marginBottom:'.875rem' }}>
              Lo que nos define
            </p>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:400, fontStyle:'italic', color:'var(--ink)', letterSpacing:'-.025em' }}>
              Nuestros valores
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0, border:'1px solid var(--line)' }}>
            {values.map((v, i) => (
              <ValueCard key={i} v={v} last={i === values.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ────────────────────────────────────────────── */}
      <section style={{ background:'var(--cream)', padding:'5.5rem 0' }}>
        <div className="page-container">
          <div style={{ marginBottom:'3rem' }}>
            <p style={{ fontSize:'.62rem', fontWeight:600, letterSpacing:'3px', textTransform:'uppercase', color:'var(--gray)', fontFamily:'var(--font-sans)', marginBottom:'.875rem' }}>
              Quiénes somos
            </p>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:400, fontStyle:'italic', color:'var(--ink)', letterSpacing:'-.025em' }}>
              El equipo detrás de SafeTech
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1.25rem' }}>
            {team.map((member, i) => (
              <TeamCard key={i} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section style={{ background:'var(--ink)', padding:'5rem 0' }}>
        <div className="page-container" style={{ textAlign:'center', maxWidth:560 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.75rem,3.5vw,2.5rem)', fontWeight:300, color:'var(--white)', letterSpacing:'-.03em', marginBottom:'1rem', lineHeight:1.15 }}>
            ¿Listo para comprar con confianza?
          </h2>
          <p style={{ fontFamily:'var(--font-sans)', fontSize:'.9rem', color:'rgba(255,255,255,.45)', lineHeight:1.75, marginBottom:'2rem', fontWeight:300 }}>
            Explora nuestro catálogo de dispositivos verificados. Cada uno con garantía de 90 días incluida.
          </p>
          <button
            onClick={() => navigate('/home')}
            style={{ background:'var(--white)', color:'var(--ink)', border:'none', padding:'14px 32px', fontFamily:'var(--font-sans)', fontSize:'.85rem', fontWeight:600, letterSpacing:'.3px', cursor:'pointer', transition:'all .25s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow='0 10px 28px rgba(0,0,0,.3)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform=''; (e.currentTarget as HTMLButtonElement).style.boxShadow=''; }}
          >
            Ver catálogo
          </button>
        </div>
      </section>

    </div>
  );
}

// ── Value card ────────────────────────────────────────────────────────────
function ValueCard({ v, last }: { v: { n: string; title: string; body: string }; last: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ padding:'2.5rem 2rem', borderRight: last ? 'none' : '1px solid var(--line)', position:'relative', overflow:'hidden', cursor:'default', transition:'background .35s ease', background: hovered ? 'var(--ink)' : 'var(--white)' }}
    >
      <p style={{ fontFamily:'var(--font-display)', fontSize:'3rem', fontWeight:300, color: hovered ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.05)', letterSpacing:'-.04em', lineHeight:1, marginBottom:'1.5rem', transition:'color .35s ease' }}>
        {v.n}
      </p>
      <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', fontWeight:600, color: hovered ? 'var(--white)' : 'var(--ink)', marginBottom:'.625rem', letterSpacing:'-.01em', transition:'color .35s ease' }}>
        {v.title}
      </h3>
      <p style={{ fontFamily:'var(--font-sans)', fontSize:'.82rem', color: hovered ? 'rgba(255,255,255,.5)' : 'var(--ink3)', lineHeight:1.7, fontWeight:300, transition:'color .35s ease' }}>
        {v.body}
      </p>
    </div>
  );
}

// ── Team card ─────────────────────────────────────────────────────────────
function TeamCard({ member }: { member: typeof team[0] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background:'var(--white)', border:'1.5px solid', borderColor: hovered ? 'transparent' : 'var(--line)', borderRadius:6, padding:'1.75rem 1.5rem', transition:'all .25s ease', boxShadow: hovered ? '0 12px 40px rgba(0,0,0,.1)' : 'none', transform: hovered ? 'translateY(-4px)' : 'none', cursor:'default' }}
    >
      {/* Avatar */}
      <div style={{ width:56, height:56, borderRadius:6, background:member.color, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.25rem' }}>
        <span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:600, color:'rgba(255,255,255,.9)', letterSpacing:'-.01em' }}>
          {member.initials}
        </span>
      </div>
      <p style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:600, color:'var(--ink)', marginBottom:'.2rem', letterSpacing:'-.01em' }}>
        {member.name}
      </p>
      <p style={{ fontFamily:'var(--font-sans)', fontSize:'.7rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'1.5px', color:'var(--gray)', marginBottom:'1rem' }}>
        {member.role}
      </p>
      <p style={{ fontFamily:'var(--font-sans)', fontSize:'.8rem', color:'var(--ink3)', lineHeight:1.65, fontWeight:300 }}>
        {member.bio}
      </p>
    </div>
  );
}
