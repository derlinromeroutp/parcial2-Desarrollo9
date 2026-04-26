/* Trust Bar — logos / "visto en" + Process Timeline (40 puntos) */

const STTrustBar = () => {
  const logos = ['TechCrunch', 'Forbes', 'Wired', 'The Verge', 'Bloomberg', 'Fast Co.'];
  return (
    <section style={{ padding: '64px 32px', background: 'var(--st-bone)', borderTop: '1px solid var(--st-line)', borderBottom: '1px solid var(--st-line)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <p className="st-mono" style={{ fontSize: 11, color: 'var(--st-earth)', letterSpacing: '0.15em', textAlign: 'center', marginBottom: 32 }}>
          MENCIONADOS POR
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${logos.length}, 1fr)`, gap: 32, alignItems: 'center' }}>
          {logos.map((l) => (
            <p
              key={l}
              className="st-display"
              style={{ fontSize: 22, fontStyle: 'italic', fontWeight: 400, color: 'var(--st-taupe)', textAlign: 'center', letterSpacing: '-0.02em', opacity: 0.7 }}
            >
              {l}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

const STProcessTimeline = () => {
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
            <h2 className="st-display" style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 300, lineHeight: 0.98, letterSpacing: '-0.035em', color: 'var(--st-clay)', marginBottom: 24 }}>
              Cómo<br />
              <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--st-earth)' }}>verificamos</em><br />
              cada equipo.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--st-earth)', maxWidth: 360, marginBottom: 24 }}>
              No revendemos. <strong style={{ color: 'var(--st-clay)', fontWeight: 600 }}>Reacondicionamos.</strong> Cada
              dispositivo recorre cinco etapas con técnicos certificados antes de salir del laboratorio.
            </p>
            <STButton variant="secondary" iconRight={<STIcons.arrow />}>Ver el reporte tipo</STButton>
          </div>

          {/* Steps */}
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, position: 'relative' }}>
            {/* Línea vertical */}
            <div style={{ position: 'absolute', left: 28, top: 20, bottom: 20, width: 1, background: 'var(--st-line)' }} />
            {steps.map((s, i) => (
              <li key={s.n} style={{ position: 'relative', display: 'grid', gridTemplateColumns: '60px 1fr', gap: 28, paddingBottom: i === steps.length - 1 ? 0 : 36 }}>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: 'var(--st-bone)',
                      border: '1px solid var(--st-line)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <span className="st-mono" style={{ fontSize: 13, color: 'var(--st-clay)', fontWeight: 500 }}>{s.n}</span>
                  </div>
                </div>
                <div style={{ paddingTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h3 className="st-display" style={{ fontSize: 24, fontWeight: 400, color: 'var(--st-clay)', letterSpacing: '-0.02em' }}>
                      {s.t}
                    </h3>
                    <STBadge variant="outline">{s.pts}</STBadge>
                  </div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--st-earth)', maxWidth: 480 }}>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

window.STTrustBar = STTrustBar;
window.STProcessTimeline = STProcessTimeline;
