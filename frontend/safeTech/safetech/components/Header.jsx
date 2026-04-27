/* Header SafeTech — uppercase serif/sans, pill-active estilo nav clásico */

const STHeader = ({ active = 'INICIO' }) => {
  const [scrolled, setScrolled] = React.useState(false);
  const [hovered, setHovered] = React.useState(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = ['INICIO', 'CATÁLOGO', 'PEDIDOS', 'NOSOTROS', 'CONTACTO'];

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? 'rgba(244,244,242,0.92)' : 'rgba(244,244,242,0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: scrolled ? '1px solid var(--st-line)' : '1px solid transparent',
        transition: 'all 0.3s var(--st-ease)',
      }}
    >
      <div
        style={{
          maxWidth: 1320, margin: '0 auto',
          padding: '18px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 32,
        }}
      >
        {/* Wordmark */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'var(--st-rust)',
            display: 'grid', placeItems: 'center',
            color: 'var(--st-bone)',
            fontFamily: 'var(--st-font-mono)', fontWeight: 700, fontSize: 13,
          }}>S</div>
          <span className="st-display" style={{
            fontSize: 20, fontWeight: 500, color: 'var(--st-clay)',
            letterSpacing: '-0.02em',
          }}>SafeTech</span>
        </a>

        {/* Nav central uppercase */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {links.map((label, i) => {
            const isActive = label === active;
            const isHover = hovered === i;
            return (
              <a
                key={label}
                href="#"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: 'relative',
                  padding: '10px 18px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  color: isActive ? 'var(--st-bone)' : 'var(--st-clay)',
                  background: isActive ? 'var(--st-rust)' : 'transparent',
                  borderRadius: 6,
                  textDecoration: 'none',
                  transition: 'all 0.2s var(--st-ease)',
                  fontFamily: 'var(--st-font-sans)',
                  opacity: !isActive && hovered !== null && !isHover ? 0.55 : 1,
                }}
              >
                {label}
              </a>
            );
          })}
        </nav>

        {/* Acciones derecha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            aria-label="Buscar"
            style={{
              width: 38, height: 38, borderRadius: '50%',
              border: 'none', background: 'transparent',
              color: 'var(--st-clay)', cursor: 'pointer',
              display: 'grid', placeItems: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(20,20,19,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <STIcons.search />
          </button>
          <button
            aria-label="Carrito"
            style={{
              position: 'relative',
              width: 38, height: 38, borderRadius: '50%',
              border: 'none', background: 'transparent',
              color: 'var(--st-clay)', cursor: 'pointer',
              display: 'grid', placeItems: 'center',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l3 14h13l2-9H6"/>
              <circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/>
            </svg>
            <span style={{
              position: 'absolute', top: 6, right: 6,
              width: 16, height: 16, borderRadius: '50%',
              background: 'var(--st-rust)', color: 'var(--st-bone)',
              fontSize: 9, fontWeight: 700,
              display: 'grid', placeItems: 'center',
              fontFamily: 'var(--st-font-mono)',
            }}>2</span>
          </button>
          <button style={{
            marginLeft: 8,
            padding: '9px 18px',
            background: 'var(--st-ink)', color: 'var(--st-bone)',
            border: 'none', borderRadius: 999,
            fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            transition: 'transform 0.2s var(--st-ease), background 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </header>
  );
};

window.STHeader = STHeader;
