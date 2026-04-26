/* Warranty Flow + Testimonials + Stats + FAQ + Final CTA */

const STWarrantyFlow = () => {
  const steps = [
    { n: '01', t: 'Reportas la falla', d: 'Desde tu cuenta o WhatsApp, en menos de 2 minutos.' },
    { n: '02', t: 'Diagnosticamos', d: 'Recogemos el equipo o lo revisas con un técnico certificado.' },
    { n: '03', t: 'Reemplazamos', d: 'Si la falla está cubierta, recibes un equipo equivalente o reembolso.' },
  ];
  return (
    <section style={{ padding: '120px 32px', background: 'var(--st-ink)', color: 'var(--st-bone)', position: 'relative', overflow: 'hidden' }} className="st-grain">
      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 64px' }}>
          <p className="st-mono" style={{ fontSize: 11, color: 'var(--st-taupe)', letterSpacing: '0.15em', marginBottom: 16 }}>
            GARANTÍA · CÓMO FUNCIONA
          </p>
          <h2 className="st-display" style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.04em' }}>
            Si algo falla, <em style={{ fontStyle: 'italic', color: 'var(--st-sand)' }}>respondemos.</em>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(247,243,236,0.65)', marginTop: 20, lineHeight: 1.65 }}>
            Tres pasos. Sin letra chica, sin esperas eternas, sin disculpas.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'rgba(247,243,236,0.1)', border: '1px solid rgba(247,243,236,0.1)', borderRadius: 18, overflow: 'hidden' }}>
          {steps.map((s) => (
            <div key={s.n} style={{ background: 'var(--st-ink)', padding: 40, minHeight: 240 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <span className="st-display" style={{ fontSize: 56, fontWeight: 300, color: 'var(--st-taupe)', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.n}</span>
                <STIcons.arrow style={{ width: 18, height: 18, color: 'var(--st-taupe)' }} />
              </div>
              <h3 className="st-display" style={{ fontSize: 24, fontWeight: 400, marginBottom: 10, letterSpacing: '-0.02em' }}>{s.t}</h3>
              <p style={{ fontSize: 14, color: 'rgba(247,243,236,0.6)', lineHeight: 1.6 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const STTestimonials = () => {
  const items = [
    { q: 'Compré un MacBook Pro y, dos meses después, fallé yo, no el equipo. SafeTech me ayudó igual.', a: 'María Granados', r: 'Diseñadora · Bogotá' },
    { q: 'Lo abrí, lo encendí y supe inmediatamente que no era un usado más. Es otro nivel.', a: 'Daniel Ortiz', r: 'Ingeniero · CDMX' },
    { q: 'El reporte de inspección viene firmado, con foto. Es la primera vez que confío en algo refurbished.', a: 'Carolina M.', r: 'Founder · Lima' },
  ];
  const logos = ['Notion', 'Figma', 'Linear', 'Vercel', 'Stripe', 'Loom', 'Notion', 'Figma'];

  return (
    <section style={{ padding: '120px 0', background: 'var(--st-bone)', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto 60px', padding: '0 32px' }}>
        <p className="st-eyebrow" style={{ marginBottom: 16 }}>Voces reales</p>
        <h2 className="st-display" style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.035em', color: 'var(--st-clay)', maxWidth: 720 }}>
          Quienes ya hicieron <em style={{ fontStyle: 'italic' }}>el cambio.</em>
        </h2>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto 60px', padding: '0 32px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {items.map((t, i) => (
          <figure key={i} style={{ background: 'var(--st-cream)', border: '1px solid var(--st-line)', borderRadius: 16, padding: 28 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
              {Array.from({ length: 5 }).map((_, j) => (
                <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="var(--st-rust)">
                  <path d="M12 2l2.5 7h7l-5.5 4.5L18 21l-6-4.5L6 21l2-7.5L2.5 9h7L12 2z" />
                </svg>
              ))}
            </div>
            <blockquote className="st-display" style={{ fontSize: 19, fontWeight: 400, lineHeight: 1.4, color: 'var(--st-clay)', marginBottom: 24, fontStyle: 'italic', letterSpacing: '-0.015em' }}>
              "{t.q}"
            </blockquote>
            <figcaption style={{ borderTop: '1px solid var(--st-line)', paddingTop: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--st-clay)' }}>{t.a}</p>
              <p className="st-mono" style={{ fontSize: 11, color: 'var(--st-earth)', letterSpacing: '0.06em', marginTop: 2 }}>{t.r}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Marquee de logos */}
      <div style={{ position: 'relative', overflow: 'hidden', borderTop: '1px solid var(--st-line)', borderBottom: '1px solid var(--st-line)', padding: '32px 0' }}>
        <div style={{ display: 'flex', gap: 80, width: 'max-content', animation: 'st-marquee 30s linear infinite' }}>
          {[...logos, ...logos, ...logos].map((l, i) => (
            <span key={i} className="st-display" style={{ fontSize: 26, fontStyle: 'italic', fontWeight: 400, color: 'var(--st-taupe)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

const STStats = () => {
  const [ref, seen] = useInView(0.3);
  const a = useCountUp(5247, 1600, seen);
  const b = useCountUp(97, 1500, seen);
  const c = useCountUp(12, 1400, seen);
  const d = useCountUp(63, 1700, seen);

  const stats = [
    { v: a.toLocaleString(), s: '+', l: 'Dispositivos entregados', d: 'Desde 2023' },
    { v: b, s: '%', l: 'Satisfacción post-venta', d: 'Encuesta NPS' },
    { v: c, s: '', l: 'Técnicos certificados', d: 'En laboratorio' },
    { v: d, s: 't', l: 'CO₂ ahorrado', d: 'Vs. fabricación nueva' },
  ];

  return (
    <section ref={ref} style={{ padding: '100px 32px', background: 'var(--st-cream)', borderTop: '1px solid var(--st-line)', borderBottom: '1px solid var(--st-line)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ borderLeft: i === 0 ? 'none' : '1px solid var(--st-line)', paddingLeft: i === 0 ? 0 : 32 }}>
            <p className="st-display" style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 300, color: 'var(--st-clay)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 14 }}>
              {s.v}<span style={{ color: 'var(--st-taupe)' }}>{s.s}</span>
            </p>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--st-clay)', marginBottom: 4 }}>{s.l}</p>
            <p className="st-mono" style={{ fontSize: 10.5, color: 'var(--st-earth)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const STFAQ = () => {
  const items = [
    { q: '¿Qué significa exactamente "Premium Refurbished"?', a: 'Que pasó por más de 40 puntos de inspección, se reemplazaron piezas dañadas por originales y se entregó con software limpio y reporte firmado.' },
    { q: '¿Cuál es la diferencia con un "usado"?', a: 'Un usado se vende como está. Un SafeTech se reacondiciona: lo dejamos en estado funcional como nuevo o no sale del laboratorio.' },
    { q: '¿Qué cubre la garantía de 90 días?', a: 'Cualquier falla de hardware no relacionada con uso indebido. Reemplazamos o reembolsamos, tú eliges.' },
    { q: '¿Puedo devolver el equipo si no me gusta?', a: 'Sí, tienes 14 días de devolución sin preguntas, además de la garantía.' },
    { q: '¿Cómo sé que el equipo es legítimo?', a: 'Cada dispositivo viene con su número de serie, reporte de inspección firmado y procedencia documentada.' },
  ];
  const [open, setOpen] = React.useState(0);

  return (
    <section style={{ padding: '120px 32px', background: 'var(--st-bone)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.7fr 1fr', gap: 80, alignItems: 'flex-start' }}>
        <div style={{ position: 'sticky', top: 100 }}>
          <p className="st-eyebrow" style={{ marginBottom: 16 }}>Preguntas frecuentes</p>
          <h2 className="st-display" style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.035em', color: 'var(--st-clay)', marginBottom: 20 }}>
            Lo que <em style={{ fontStyle: 'italic' }}>siempre</em> nos preguntan.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--st-earth)', lineHeight: 1.65, marginBottom: 24 }}>
            ¿No encuentras tu duda? Escríbenos directo y te respondemos.
          </p>
          <STButton variant="secondary" iconRight={<STIcons.arrow />}>Hablar con un humano</STButton>
        </div>

        <div>
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{ borderTop: '1px solid var(--st-line)', borderBottom: i === items.length - 1 ? '1px solid var(--st-line)' : 'none' }}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{
                    width: '100%',
                    padding: '24px 0',
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 24,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  <span className="st-display" style={{ fontSize: 20, fontWeight: 400, color: 'var(--st-clay)', letterSpacing: '-0.015em' }}>
                    {it.q}
                  </span>
                  <span style={{ flexShrink: 0, width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--st-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--st-clay)', transition: 'all 0.3s var(--st-ease)', transform: isOpen ? 'rotate(45deg)' : 'none', background: isOpen ? 'var(--st-clay)' : 'transparent', borderColor: isOpen ? 'var(--st-clay)' : 'var(--st-line)' }}>
                    <STIcons.plus style={{ color: isOpen ? 'var(--st-bone)' : 'var(--st-clay)' }} />
                  </span>
                </button>
                <div style={{ maxHeight: isOpen ? 200 : 0, overflow: 'hidden', transition: 'max-height 0.4s var(--st-ease)' }}>
                  <p style={{ fontSize: 15, color: 'var(--st-earth)', lineHeight: 1.7, paddingBottom: 24, maxWidth: 560 }}>
                    {it.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const STFinalCTA = () => (
  <section style={{ padding: '140px 32px', background: 'var(--st-cream)', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', width: 800, height: 800, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(217,205,184,0.6) 0%, transparent 60%)', pointerEvents: 'none', filter: 'blur(40px)' }} />
    <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
      <STBadge variant="leaf" style={{ marginBottom: 32 }}>
        <STDot color="var(--st-leaf)" />
        Garantía 90 días incluida
      </STBadge>
      <h2 className="st-display" style={{ fontSize: 'clamp(48px, 7vw, 96px)', fontWeight: 300, lineHeight: 0.95, letterSpacing: '-0.04em', color: 'var(--st-clay)', marginBottom: 28 }}>
        Tecnología seria,<br />
        <em style={{ fontStyle: 'italic', color: 'var(--st-earth)' }}>precio justo.</em>
      </h2>
      <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--st-earth)', maxWidth: 540, margin: '0 auto 36px' }}>
        Más de 5,000 personas ya cambiaron a SafeTech. Sigue tú.
      </p>
      <div style={{ display: 'inline-flex', gap: 12 }}>
        <STButton variant="primary" size="lg" iconRight={<STIcons.arrow />}>Ver el catálogo</STButton>
        <STButton variant="secondary" size="lg">Hablar con ventas</STButton>
      </div>
    </div>
  </section>
);

Object.assign(window, { STWarrantyFlow, STTestimonials, STStats, STFAQ, STFinalCTA });
