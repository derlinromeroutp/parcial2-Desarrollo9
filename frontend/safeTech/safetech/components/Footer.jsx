/* Footer SafeTech — rico, cálido, con jerarquía editorial */

const STFooter = () => {
  const cols = [
    {
      title: 'Tienda',
      links: ['Todos los productos', 'iPhone', 'MacBook', 'iPad', 'Apple Watch', 'Audio'],
    },
    {
      title: 'Confianza',
      links: ['Cómo funciona', 'Inspección 40 puntos', 'Garantía 90 días', 'Devoluciones', 'Reclamos'],
    },
    {
      title: 'Compañía',
      links: ['Nosotros', 'Sostenibilidad', 'Prensa', 'Carreras', 'Contacto'],
    },
  ];

  return (
    <footer
      style={{
        background: 'var(--st-ink)',
        color: 'var(--st-bone)',
        padding: '80px 32px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="st-grain"
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
        {/* Top: huge wordmark */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
            gap: 48,
            paddingBottom: 60,
            borderBottom: '1px solid rgba(247,243,236,0.1)',
          }}
        >
          <div>
            <STWordmark size={20} color="var(--st-bone)" />
            <p
              className="st-display"
              style={{
                fontSize: 28,
                fontWeight: 300,
                lineHeight: 1.2,
                margin: '24px 0 18px',
                fontStyle: 'italic',
                color: 'var(--st-bone)',
                maxWidth: 320,
                letterSpacing: '-0.02em',
              }}
            >
              Tecnología que sirve <span style={{ color: 'var(--st-taupe)' }}>una</span> vida más.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <input
                placeholder="tu@email.com"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid rgba(247,243,236,0.2)',
                  color: 'var(--st-bone)',
                  padding: '10px 14px',
                  fontSize: 13,
                  borderRadius: 'var(--st-radius-pill)',
                  fontFamily: 'var(--st-font-sans)',
                  outline: 'none',
                }}
              />
              <button
                style={{
                  background: 'var(--st-bone)',
                  color: 'var(--st-ink)',
                  border: 'none',
                  padding: '10px 18px',
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 'var(--st-radius-pill)',
                  cursor: 'pointer',
                  fontFamily: 'var(--st-font-sans)',
                }}
              >
                Suscribirme
              </button>
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <p className="st-eyebrow" style={{ color: 'var(--st-taupe)', marginBottom: 20 }}>
                {c.title}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      style={{
                        color: 'rgba(247,243,236,0.75)',
                        fontSize: 13.5,
                        textDecoration: 'none',
                        fontWeight: 400,
                      }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Wordmark gigante */}
        <div
          className="st-display"
          style={{
            fontSize: 'clamp(80px, 16vw, 220px)',
            fontWeight: 300,
            lineHeight: 0.9,
            letterSpacing: '-0.05em',
            color: 'rgba(247,243,236,0.06)',
            margin: '40px 0 24px',
            fontStyle: 'italic',
            userSelect: 'none',
          }}
        >
          SafeTech.
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 24,
            borderTop: '1px solid rgba(247,243,236,0.1)',
            color: 'var(--st-taupe)',
            fontSize: 12,
          }}
          className="st-mono"
        >
          <span>© 2026 SAFETECH — REFURBISHED WITH CARE</span>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>PRIVACIDAD</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>TÉRMINOS</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>COOKIES</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

window.STFooter = STFooter;
