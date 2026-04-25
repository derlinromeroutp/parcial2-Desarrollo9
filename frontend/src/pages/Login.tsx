import { SignIn } from '@clerk/clerk-react';

const clerkAppearance = {
  variables: {
    colorPrimary:          '#441306',
    colorBackground:       '#FFFFFF',
    colorInputBackground:  '#F5F4F2',
    colorText:             '#441306',
    colorTextSecondary:    '#3A3A3A',
    colorInputText:        '#441306',
    colorNeutral:          '#9A9A9A',
    borderRadius:          '4px',
    fontFamily:            "'Playfair Display', serif",
    fontFamilyButtons:     "'Playfair Display', serif",
    fontSize:              '15px',
    fontWeight:            { normal: 400, medium: 500, bold: 700 },
  },
  elements: {
    rootBox: { width: '100%' },
    card: {
      boxShadow: '0 12px 48px rgba(68,19,6,0.10)',
      border: '1.5px solid #E0E0E0',
      borderRadius: '10px',
      padding: '2.25rem',
    },
    headerTitle: {
      fontFamily:    "'Playfair Display', serif",
      fontWeight:    '800',
      fontSize:      '1.75rem',
      color:         '#441306',
      letterSpacing: '-0.04em',
    },
    headerSubtitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize:   '0.9rem',
      color:      '#3A3A3A',
    },
    formButtonPrimary: {
      backgroundColor: '#441306',
      fontFamily:      "'Playfair Display', serif",
      fontSize:        '0.9rem',
      fontWeight:      '700',
      borderRadius:    '4px',
      boxShadow:       '0 4px 16px rgba(68,19,6,0.25)',
      border:          'none',
      padding:         '13px 0',
    },
    formFieldInput: {
      border:          '1.5px solid #E0E0E0',
      borderRadius:    '4px',
      fontFamily:      "'Playfair Display', serif",
      fontSize:        '0.9rem',
      backgroundColor: '#F5F4F2',
      boxShadow:       'none',
      color:           '#441306',
    },
    formFieldLabel: {
      fontFamily:    "'Playfair Display', serif",
      fontSize:      '0.75rem',
      fontWeight:    '700',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      color:         '#3A3A3A',
    },
    dividerLine: { backgroundColor: '#E0E0E0', height: '1px' },
    dividerText: { fontFamily: "'Playfair Display', serif", fontSize: '0.78rem', color: '#9A9A9A' },
    socialButtonsBlockButton: {
      border:       '1.5px solid #E0E0E0',
      borderRadius: '4px',
      fontFamily:   "'Playfair Display', serif",
      fontSize:     '0.875rem',
      fontWeight:   '600',
      boxShadow:    'none',
      color:        '#441306',
    },
    footerActionLink: {
      color:      '#441306',
      fontFamily: "'Playfair Display', serif",
      fontSize:   '0.875rem',
      fontWeight: '600',
    },
    identityPreviewText: { fontFamily: "'Playfair Display', serif" },
    alertText:           { fontFamily: "'Playfair Display', serif", fontSize: '0.875rem' },
  },
};

export default function Login() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--ink)',
      display: 'flex',
      alignItems: 'stretch',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Grid de fondo */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      {/* Glow */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '20%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(200,100,60,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Columna izquierda — Branding ── */}
      <div
        className="login-branding"
        style={{
          flex: '0 0 460px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '3rem 3.5rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div>
          <p style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--white)',
            letterSpacing: '-0.03em',
          }}>
            SafeTech
          </p>
        </div>

        {/* Headline */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(245,244,242,0.1)',
            border: '1px solid rgba(245,244,242,0.2)',
            borderRadius: 20,
            padding: '5px 14px',
            marginBottom: '2rem',
          }}>
            <span style={{ width: 7, height: 7, background: '#F5C8A8', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#F5C8A8', letterSpacing: '0.3px' }}>
              Tu cuenta segura
            </span>
          </div>

          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 800,
            color: 'var(--white)',
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            marginBottom: '1.25rem',
          }}>
            Gestiona tus<br />
            pedidos y<br />
            <span style={{
              background: 'linear-gradient(135deg, #F5C8A8 0%, #E8956A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              garantías.
            </span>
          </h2>

          <p style={{
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.7,
            maxWidth: 340,
          }}>
            Accede a tu cuenta para ver el historial de compras,
            solicitar garantías y comprar con total confianza.
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: '2.5rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '2rem',
        }}>
          {[
            { value: '40+', label: 'Inspecciones' },
            { value: '90d', label: 'Garantía'     },
            { value: '−40%', label: 'vs nuevo'    },
          ].map((s) => (
            <div key={s.value}>
              <p style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--white)',
                letterSpacing: '-0.04em',
                lineHeight: 1,
                marginBottom: '0.25rem',
              }}>
                {s.value}
              </p>
              <p style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                color: 'rgba(255,255,255,0.3)',
              }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Columna derecha — Clerk ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        background: 'var(--cream)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/register"
            appearance={clerkAppearance}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-branding { display: none !important; }
        }
      `}</style>
    </div>
  );
}
