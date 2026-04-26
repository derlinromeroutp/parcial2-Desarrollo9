/* Hero — Cinematic full-bleed, dark scene, floating glass cards, 3D parallax */

const STHero = () => {
  const sectionRef = React.useRef(null);
  const [mouse, setMouse] = React.useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleMouse = (e) => {
    if (!sectionRef.current) return;
    const r = sectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    setMouse({ x, y });
  };

  const [statsRef, statsSeen] = useInView(0.4);
  const c1 = useCountUp(40, 1000, statsSeen);
  const c2 = useCountUp(90, 1100, statsSeen);
  const c3 = useCountUp(40, 1200, statsSeen);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouse}
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'var(--st-bone)',
        padding: '24px 24px 80px',
        overflow: 'hidden',
      }}
    >
      {/* CONTENEDOR CINEMÁTICO — el "envuelve" */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: 'calc(100vh - 48px)',
          borderRadius: 28,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1F1D1A 0%, #2A2622 40%, #3D3934 100%)',
          boxShadow: '0 40px 80px -30px rgba(31,29,26,0.35), 0 0 0 1px rgba(31,29,26,0.04)',
          transform: `translateY(${scrollY * 0.05}px)`,
          transition: 'transform 0.1s linear',
        }}
      >
        {/* Capa de "escena" — dispositivos gigantes desenfocados como decorado */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(circle at 20% 30%, rgba(90,107,82,0.18) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(140,87,66,0.15) 0%, transparent 45%),
              radial-gradient(circle at 50% 100%, rgba(239,237,232,0.06) 0%, transparent 50%)
            `,
            transform: `translate(${mouse.x * -15}px, ${mouse.y * -15}px)`,
            transition: 'transform 0.5s var(--st-ease)',
            pointerEvents: 'none',
          }}
        />

        {/* "Profundidad" de habitación — siluetas de dispositivos atrás */}
        <BgDevices mouse={mouse} />

        {/* Grid sutil */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(rgba(239,237,232,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(239,237,232,0.025) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
            pointerEvents: 'none',
          }}
        />

        {/* Vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* CONTENIDO CENTRAL */}
        <div
          style={{
            position: 'relative', zIndex: 4,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', textAlign: 'center',
            padding: '120px 32px 0',
          }}
        >
          <div
            className="st-fade-up"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '6px 14px 6px 8px',
              background: 'rgba(239,237,232,0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(239,237,232,0.12)',
              borderRadius: 999, marginBottom: 36,
            }}
          >
            <span style={{
              padding: '3px 10px', background: '#5A6B52', color: '#EFEDE8',
              borderRadius: 999, fontSize: 10.5, fontFamily: 'var(--st-font-mono)',
              fontWeight: 600, letterSpacing: '0.08em',
            }}>NUEVO</span>
            <span style={{ fontSize: 12.5, color: 'rgba(239,237,232,0.85)' }}>
              Garantía total ampliada a 90 días
            </span>
            <STIcons.arrow style={{ color: 'rgba(239,237,232,0.5)', width: 14, height: 14 }} />
          </div>

          <h1
            className="st-display st-fade-up"
            style={{
              fontSize: 'clamp(56px, 9vw, 132px)',
              fontWeight: 300,
              lineHeight: 0.93,
              letterSpacing: '-0.045em',
              color: '#EFEDE8',
              marginBottom: 28,
              maxWidth: 1100,
              animationDelay: '0.1s',
              textWrap: 'balance',
            }}
          >
            Tecnología que <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#C9C3B6' }}>vuelve a vivir</em>.
          </h1>

          <p
            className="st-fade-up"
            style={{
              fontSize: 17, lineHeight: 1.55,
              color: 'rgba(239,237,232,0.7)',
              maxWidth: 560, marginBottom: 40,
              animationDelay: '0.2s',
            }}
          >
            Dispositivos reacondicionados con 40 puntos de inspección.
            Hasta 40% más asequibles. 90 días de garantía total, sin letra chica.
          </p>

          <div className="st-fade-up" style={{ display: 'flex', gap: 10, animationDelay: '0.3s' }}>
            <button style={{
              padding: '14px 26px',
              background: '#EFEDE8', color: '#1F1D1A',
              border: 'none', borderRadius: 999,
              fontFamily: 'inherit', fontSize: 14.5, fontWeight: 500,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10,
              transition: 'all 0.25s var(--st-ease)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#EFEDE8'; e.currentTarget.style.transform = 'none'; }}
            >
              Ver catálogo
              <STIcons.arrow />
            </button>
            <button style={{
              padding: '14px 26px',
              background: 'rgba(239,237,232,0.06)',
              backdropFilter: 'blur(12px)',
              color: '#EFEDE8',
              border: '1px solid rgba(239,237,232,0.18)',
              borderRadius: 999,
              fontFamily: 'inherit', fontSize: 14.5, fontWeight: 500,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Cómo lo hacemos
            </button>
          </div>
        </div>

        {/* Tarjeta lateral izquierda — review */}
        <div
          className="st-fade-up"
          style={{
            position: 'absolute', left: 32, bottom: 32, zIndex: 5,
            width: 220, padding: 18,
            background: 'rgba(31,29,26,0.55)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(239,237,232,0.1)',
            borderRadius: 16,
            color: '#EFEDE8',
            transform: `translate(${mouse.x * -8}px, ${mouse.y * -8}px) rotate(-2deg)`,
            transition: 'transform 0.4s var(--st-ease)',
            animationDelay: '0.5s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span className="st-display" style={{ fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1 }}>4.9</span>
            <div style={{ display: 'flex', gap: 1 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="#C9C3B6">
                  <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/>
                </svg>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 12.5, lineHeight: 1.5, color: 'rgba(239,237,232,0.85)', marginBottom: 10 }}>
            "El MacBook llegó como nuevo. La garantía es real — ya la usé."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 10, borderTop: '1px solid rgba(239,237,232,0.1)' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #5A6B52, #8C5742)' }} />
            <div>
              <p style={{ fontSize: 11, fontWeight: 500 }}>Andrea M.</p>
              <p className="st-mono" style={{ fontSize: 9, color: 'rgba(239,237,232,0.5)', letterSpacing: '0.06em' }}>VERIFIED · 12.04</p>
            </div>
          </div>
        </div>

        {/* Tarjeta de inspección — top right (3D) */}
        <div
          style={{
            position: 'absolute', right: 40, top: 120, zIndex: 5,
            width: 230, padding: 18,
            background: 'rgba(239,237,232,0.96)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(239,237,232,0.4)',
            borderRadius: 16,
            color: '#1F1D1A',
            transform: `perspective(1000px) rotateY(${mouse.x * -6}deg) rotateX(${mouse.y * 4}deg) translate(${mouse.x * 12}px, ${mouse.y * 12}px) rotate(3deg)`,
            transition: 'transform 0.4s var(--st-ease)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{
              padding: '3px 10px', background: 'rgba(90,107,82,0.18)', color: '#5A6B52',
              borderRadius: 999, fontSize: 10, fontFamily: 'var(--st-font-mono)', fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              <STDot color="#5A6B52" size={5} />PASS
            </span>
            <span className="st-mono" style={{ fontSize: 9.5, color: '#6B655C' }}>#ST-4421</span>
          </div>
          <p className="st-mono" style={{ fontSize: 9.5, color: '#6B655C', letterSpacing: '0.08em', marginBottom: 4 }}>
            REPORTE DE INSPECCIÓN
          </p>
          <p className="st-display" style={{ fontSize: 19, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 14, lineHeight: 1.05 }}>
            MacBook Pro 14"
          </p>
          {[
            ['Batería', '94%', 0.94],
            ['Pantalla', 'OK', 1],
            ['Teclado', 'OK', 1],
            ['Puertos', '4/4', 1],
          ].map(([k, v, p]) => (
            <div key={k} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: '#6B655C' }}>{k}</span>
                <span style={{ color: '#1F1D1A', fontWeight: 500 }}>{v}</span>
              </div>
              <div style={{ height: 2, background: 'rgba(31,29,26,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${p * 100}%`, height: '100%', background: '#5A6B52' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar — abajo flotante (como el ref) */}
        <div
          ref={statsRef}
          style={{
            position: 'absolute', left: '50%', bottom: -36, zIndex: 6,
            transform: 'translateX(-50%)',
            display: 'flex', gap: 0,
            background: 'rgba(31,29,26,0.85)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(239,237,232,0.12)',
            borderRadius: 20,
            color: '#EFEDE8',
            boxShadow: '0 30px 60px rgba(0,0,0,0.35)',
          }}
        >
          {[
            { n: `${c1}+`, l: 'Puntos de\ninspección' },
            { n: `${c2}d`, l: 'Garantía\ntotal' },
            { n: `−${c3}%`, l: 'Vs. precio\nnuevo' },
            { n: 'Desde', l: '1998' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '20px 28px',
              borderRight: i < 3 ? '1px solid rgba(239,237,232,0.1)' : 'none',
              minWidth: 130,
            }}>
              <p className="st-display" style={{ fontSize: 30, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6 }}>
                {s.n}
              </p>
              <p className="st-mono" style={{ fontSize: 9.5, color: 'rgba(239,237,232,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'pre-line', lineHeight: 1.3 }}>
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* Background — siluetas de dispositivos como "habitación" */
const BgDevices = ({ mouse }) => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    {/* Laptop silueta izquierda */}
    <div style={{
      position: 'absolute', left: '8%', top: '38%',
      width: 280, height: 180,
      background: 'linear-gradient(160deg, rgba(57,52,46,0.7), rgba(31,29,26,0.4))',
      borderRadius: '8px 8px 4px 4px',
      filter: 'blur(2px)',
      transform: `perspective(800px) rotateX(60deg) rotateZ(-8deg) translate(${mouse.x * -20}px, ${mouse.y * -10}px)`,
      transition: 'transform 0.6s var(--st-ease)',
      boxShadow: 'inset 0 0 40px rgba(0,0,0,0.4)',
    }} />
    {/* Phone silueta centro-derecha */}
    <div style={{
      position: 'absolute', right: '15%', top: '30%',
      width: 100, height: 200,
      background: 'linear-gradient(160deg, rgba(57,52,46,0.6), rgba(31,29,26,0.3))',
      borderRadius: 18,
      filter: 'blur(1.5px)',
      transform: `perspective(1000px) rotateY(-22deg) translate(${mouse.x * 18}px, ${mouse.y * 15}px)`,
      transition: 'transform 0.6s var(--st-ease)',
    }} />
    {/* Tablet silueta lejana */}
    <div style={{
      position: 'absolute', left: '60%', top: '55%',
      width: 220, height: 160,
      background: 'linear-gradient(160deg, rgba(57,52,46,0.4), rgba(31,29,26,0.2))',
      borderRadius: 14,
      filter: 'blur(3px)',
      transform: `perspective(1200px) rotateY(35deg) rotateX(15deg) translate(${mouse.x * 10}px, ${mouse.y * 8}px)`,
      transition: 'transform 0.6s var(--st-ease)',
    }} />
    {/* Pendant lights — como en la ref */}
    {[20, 50, 80].map((x, i) => (
      <div key={i} style={{
        position: 'absolute', left: `${x}%`, top: 0,
        width: 2, height: '22%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(239,237,232,0.08) 100%)',
      }}>
        <div style={{
          position: 'absolute', bottom: -8, left: -5,
          width: 12, height: 12, borderRadius: '50%',
          background: 'radial-gradient(circle, #C9C3B6 0%, #6B655C 70%, transparent 100%)',
          boxShadow: '0 0 30px rgba(201,195,182,0.25)',
        }} />
      </div>
    ))}
  </div>
);

window.STHero = STHero;
