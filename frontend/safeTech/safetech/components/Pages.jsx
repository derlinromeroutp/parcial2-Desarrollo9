/* Páginas: Pedidos · Nosotros · Contacto */

/* ============================================================
   PEDIDOS — lista de pedidos del usuario, tracking, detalle
   ============================================================ */
const STOrdersPage = () => {
  const [activeTab, setActiveTab] = React.useState('all');
  const [openOrder, setOpenOrder] = React.useState('ORD-2841');

  const orders = [
    {
      id: 'ORD-2841', date: '14 Mar 2026', status: 'in-transit',
      total: 849, items: 1,
      product: 'iPhone 14 Pro · Space Black · 256GB',
      eta: '17 Mar', progress: 0.66,
      tracking: 'DHL · 1Z999AA10123456784',
      steps: [
        { l: 'Pedido', d: '14 Mar · 09:24', done: true },
        { l: 'Inspección final', d: '14 Mar · 18:02', done: true },
        { l: 'Empacado', d: '15 Mar · 08:15', done: true },
        { l: 'En camino', d: '15 Mar · 14:30', done: true, current: true },
        { l: 'Entregado', d: '17 Mar · estimado', done: false },
      ],
    },
    { id: 'ORD-2799', date: '02 Mar 2026', status: 'delivered', total: 459, items: 1, product: 'iPad Air 5 · 64GB · Space Gray', eta: '06 Mar', progress: 1 },
    { id: 'ORD-2734', date: '18 Feb 2026', status: 'delivered', total: 159, items: 1, product: 'AirPods Pro 2 · USB-C', eta: '21 Feb', progress: 1 },
    { id: 'ORD-2698', date: '04 Feb 2026', status: 'returned', total: 289, items: 1, product: 'Apple Watch S9 · 45mm', eta: '—', progress: 1 },
  ];

  const tabs = [
    { id: 'all', label: 'Todos', count: orders.length },
    { id: 'in-transit', label: 'En camino', count: orders.filter(o => o.status === 'in-transit').length },
    { id: 'delivered', label: 'Entregados', count: orders.filter(o => o.status === 'delivered').length },
    { id: 'returned', label: 'Devoluciones', count: orders.filter(o => o.status === 'returned').length },
  ];

  const filtered = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab);
  const open = orders.find(o => o.id === openOrder);

  const statusBadge = (s) => {
    if (s === 'in-transit') return { bg: 'rgba(74,92,69,0.14)', fg: 'var(--st-leaf)', label: 'En camino', dot: 'var(--st-leaf)' };
    if (s === 'delivered') return { bg: 'rgba(20,20,19,0.06)', fg: 'var(--st-clay)', label: 'Entregado', dot: 'var(--st-clay)' };
    return { bg: 'rgba(61,31,18,0.10)', fg: 'var(--st-rust)', label: 'Devuelto', dot: 'var(--st-rust)' };
  };

  return (
    <div className="st-root" style={{ background: 'var(--st-bone)', minHeight: '100vh' }}>
      <STHeader active="PEDIDOS" />

      {/* Hero */}
      <section style={{ padding: '64px 32px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p className="st-eyebrow" style={{ marginBottom: 12 }}>MI CUENTA · {orders.length} pedidos en total</p>
          <h1 className="st-display" style={{ fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 300, lineHeight: 0.98, letterSpacing: '-0.04em', color: 'var(--st-clay)' }}>
            Tus pedidos, <em style={{ fontStyle: 'italic', color: 'var(--st-earth)' }}>en una vista.</em>
          </h1>
        </div>
      </section>

      {/* Tabs */}
      <section style={{ padding: '0 32px', borderBottom: '1px solid var(--st-line)', position: 'sticky', top: 64, background: 'rgba(244,244,242,0.92)', backdropFilter: 'blur(12px)', zIndex: 30 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 4 }}>
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '16px 18px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${active ? 'var(--st-rust)' : 'transparent'}`,
                  color: active ? 'var(--st-clay)' : 'var(--st-earth)',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                }}
              >
                {t.label}
                <span className="st-mono" style={{ fontSize: 10.5, color: 'var(--st-earth)', opacity: 0.7 }}>{t.count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Layout 2 columnas */}
      <section style={{ padding: '32px 32px 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 32 }}>
          {/* Lista */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((o) => {
              const isOpen = openOrder === o.id;
              const sb = statusBadge(o.status);
              return (
                <button
                  key={o.id}
                  onClick={() => setOpenOrder(o.id)}
                  style={{
                    textAlign: 'left',
                    padding: 20,
                    background: isOpen ? 'var(--st-cream)' : 'transparent',
                    border: `1px solid ${isOpen ? 'transparent' : 'var(--st-line)'}`,
                    borderLeft: `3px solid ${isOpen ? 'var(--st-rust)' : 'transparent'}`,
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'all 0.2s var(--st-ease)',
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <p className="st-mono" style={{ fontSize: 11, color: 'var(--st-earth)', letterSpacing: '0.08em', marginBottom: 6 }}>{o.id}</p>
                      <p style={{ fontSize: 13.5, color: 'var(--st-clay)', fontWeight: 500, marginBottom: 4 }}>{o.product}</p>
                      <p style={{ fontSize: 12, color: 'var(--st-earth)' }}>{o.date}</p>
                    </div>
                    <span style={{
                      padding: '4px 10px', background: sb.bg, color: sb.fg,
                      borderRadius: 999, fontSize: 11, fontWeight: 600,
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}>
                      <STDot color={sb.dot} size={5} />{sb.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="st-display" style={{ fontSize: 22, fontWeight: 400, color: 'var(--st-clay)' }}>${o.total}</span>
                    <span style={{ fontSize: 11.5, color: 'var(--st-earth)' }}>ETA {o.eta}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detalle pedido seleccionado */}
          {open && (
            <div style={{ position: 'sticky', top: 140, height: 'fit-content', background: 'var(--st-cream)', border: '1px solid var(--st-line)', borderRadius: 16, overflow: 'hidden' }}>
              {/* Hero del detalle */}
              <div style={{ padding: 28, borderBottom: '1px solid var(--st-line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <p className="st-eyebrow" style={{ marginBottom: 8 }}>PEDIDO {open.id}</p>
                    <p className="st-display" style={{ fontSize: 28, fontWeight: 400, color: 'var(--st-clay)', letterSpacing: '-0.02em' }}>{open.product}</p>
                  </div>
                  <div style={{ width: 72, height: 72, borderRadius: 14, background: 'linear-gradient(145deg, #2E2D2B, #141413)', boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, paddingTop: 18, borderTop: '1px solid var(--st-line)' }}>
                  <div><p className="st-eyebrow" style={{ marginBottom: 4 }}>TOTAL</p><p style={{ fontSize: 16, fontWeight: 500, color: 'var(--st-clay)' }}>${open.total}.00</p></div>
                  <div><p className="st-eyebrow" style={{ marginBottom: 4 }}>FECHA</p><p style={{ fontSize: 13, color: 'var(--st-clay)' }}>{open.date}</p></div>
                  <div><p className="st-eyebrow" style={{ marginBottom: 4 }}>ETA</p><p style={{ fontSize: 13, color: 'var(--st-clay)' }}>{open.eta}</p></div>
                </div>
              </div>

              {/* Tracking timeline */}
              {open.steps && (
                <div style={{ padding: 28 }}>
                  <p className="st-eyebrow" style={{ marginBottom: 18 }}>SEGUIMIENTO · {open.tracking}</p>
                  <div style={{ position: 'relative', paddingLeft: 28 }}>
                    <div style={{ position: 'absolute', left: 8, top: 8, bottom: 8, width: 2, background: 'var(--st-line)' }} />
                    <div style={{ position: 'absolute', left: 8, top: 8, height: `${open.progress * 100}%`, width: 2, background: 'var(--st-rust)' }} />
                    {open.steps.map((s, i) => (
                      <div key={i} style={{ position: 'relative', paddingBottom: i < open.steps.length - 1 ? 22 : 0 }}>
                        <div style={{
                          position: 'absolute', left: -28, top: 2,
                          width: 18, height: 18, borderRadius: '50%',
                          background: s.done ? 'var(--st-rust)' : 'var(--st-bone)',
                          border: `2px solid ${s.done ? 'var(--st-rust)' : 'var(--st-line)'}`,
                          display: 'grid', placeItems: 'center',
                          boxShadow: s.current ? '0 0 0 6px rgba(61,31,18,0.15)' : 'none',
                        }}>
                          {s.done && !s.current && <span style={{ color: 'var(--st-bone)', fontSize: 9, fontWeight: 700 }}>✓</span>}
                          {s.current && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--st-bone)' }} />}
                        </div>
                        <p style={{ fontSize: 13.5, fontWeight: s.current ? 600 : 500, color: s.done ? 'var(--st-clay)' : 'var(--st-earth)' }}>{s.l}</p>
                        <p className="st-mono" style={{ fontSize: 10.5, color: 'var(--st-earth)', marginTop: 2 }}>{s.d}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 20, padding: 14, background: 'var(--st-bone)', borderRadius: 10, fontSize: 12, color: 'var(--st-earth)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <STIcons.shield style={{ color: 'var(--st-leaf)', flexShrink: 0 }} />
                    Garantía SafeTech 90 días — activa desde la fecha de entrega.
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div style={{ padding: '0 28px 28px', display: 'flex', gap: 8 }}>
                <button style={{ flex: 1, padding: '11px 16px', background: 'var(--st-ink)', color: 'var(--st-bone)', border: 'none', borderRadius: 999, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Rastrear envío</button>
                <button style={{ flex: 1, padding: '11px 16px', background: 'transparent', color: 'var(--st-clay)', border: '1px solid var(--st-line)', borderRadius: 999, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Soporte</button>
              </div>
            </div>
          )}
        </div>
      </section>

      <STFooter />
    </div>
  );
};

/* ============================================================
   NOSOTROS — historia, valores, equipo, números, CTA
   ============================================================ */
const STAboutPage = () => {
  return (
    <div className="st-root" style={{ background: 'var(--st-bone)', minHeight: '100vh' }}>
      <STHeader active="NOSOTROS" />

      {/* Hero editorial */}
      <section style={{ padding: '80px 32px 60px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 64, alignItems: 'flex-end' }}>
          <div>
            <p className="st-eyebrow" style={{ marginBottom: 18 }}>NOSOTROS · DESDE 1998</p>
            <h1 className="st-display" style={{ fontSize: 'clamp(48px, 7vw, 96px)', fontWeight: 300, lineHeight: 0.95, letterSpacing: '-0.045em', color: 'var(--st-clay)' }}>
              Reparamos<br />tecnología,<br /><em style={{ fontStyle: 'italic', color: 'var(--st-earth)' }}>no la desechamos.</em>
            </h1>
          </div>
          <div>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--st-earth)', marginBottom: 16 }}>
              SafeTech nació con una idea simple: la tecnología no se gasta — se descarta. Cada año millones de dispositivos perfectamente funcionales terminan en gavetas o vertederos.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--st-earth)' }}>
              Llevamos 27 años devolviéndolos al mundo. Cada uno pasa por <strong style={{ color: 'var(--st-clay)' }}>40 puntos de inspección</strong> y sale con 90 días de garantía. Calidad sin etiqueta de "primera mano".
            </p>
          </div>
        </div>
      </section>

      {/* Big number marquee */}
      <section style={{ padding: '40px 32px', borderTop: '1px solid var(--st-line)', borderBottom: '1px solid var(--st-line)', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
          {[
            { n: '27', l: 'años de oficio' },
            { n: '5,200+', l: 'dispositivos restaurados' },
            { n: '40', l: 'puntos de inspección' },
            { n: '4.9', l: 'rating en reseñas' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '28px 32px', borderRight: i < 3 ? '1px solid var(--st-line)' : 'none' }}>
              <p className="st-display" style={{ fontSize: 'clamp(48px, 5.5vw, 72px)', fontWeight: 300, lineHeight: 0.95, letterSpacing: '-0.04em', color: 'var(--st-clay)', marginBottom: 8 }}>{s.n}</p>
              <p className="st-eyebrow">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pilares — bloques editoriales */}
      <section style={{ padding: '100px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p className="st-eyebrow" style={{ marginBottom: 16 }}>NUESTROS PILARES</p>
          <h2 className="st-display" style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.035em', color: 'var(--st-clay)', marginBottom: 60, maxWidth: 720 }}>
            Lo que hacemos diferente, <em style={{ fontStyle: 'italic' }}>en práctica.</em>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              { n: '01', t: 'Inspección obsesiva', d: 'Cada dispositivo se prueba en 40 puntos: pantalla, batería, puertos, sensores, software. Si reprueba uno, no se vende.' },
              { n: '02', t: 'Garantía sin asteriscos', d: '90 días totales desde la entrega. Si falla, lo reemplazamos. No hay lectura de letra chica.' },
              { n: '03', t: 'Cero residuos electrónicos', d: 'Lo que no se puede restaurar se desmonta. Las piezas regresan al ciclo. Cero al vertedero.' },
            ].map((p) => (
              <article key={p.n} style={{ padding: '28px 0 32px', borderTop: '1px solid var(--st-clay)' }}>
                <p className="st-mono" style={{ fontSize: 11, color: 'var(--st-rust)', letterSpacing: '0.1em', marginBottom: 18 }}>{p.n}</p>
                <h3 className="st-display" style={{ fontSize: 26, fontWeight: 400, lineHeight: 1.1, color: 'var(--st-clay)', marginBottom: 14, letterSpacing: '-0.02em' }}>{p.t}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--st-earth)' }}>{p.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Equipo — grid con avatares */}
      <section style={{ padding: '60px 32px 100px', background: 'var(--st-cream)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 24 }}>
            <div>
              <p className="st-eyebrow" style={{ marginBottom: 16 }}>EL EQUIPO</p>
              <h2 className="st-display" style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.035em', color: 'var(--st-clay)' }}>
                Personas reales, <em style={{ fontStyle: 'italic' }}>oficio real.</em>
              </h2>
            </div>
            <p style={{ fontSize: 14, color: 'var(--st-earth)', maxWidth: 320 }}>
              Técnicos certificados, no operarios de línea. Cada inspector firma su reporte.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { n: 'Camila Ruiz', r: 'CEO & Co-fundadora', a: '#3D1F12', i: 'CR' },
              { n: 'Mateo Reyes', r: 'Director técnico', a: '#4A5C45', i: 'MR' },
              { n: 'Lucía Ortiz', r: 'Inspectora senior', a: '#2E2D2B', i: 'LO' },
              { n: 'Daniel Vega', r: 'Logística', a: '#5C5B57', i: 'DV' },
            ].map((m) => (
              <article key={m.n} style={{ background: 'var(--st-bone)', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--st-line)' }}>
                <div style={{
                  aspectRatio: '4/5',
                  background: `linear-gradient(155deg, ${m.a} 0%, ${m.a}DD 100%)`,
                  display: 'grid', placeItems: 'center',
                  color: 'var(--st-bone)',
                  position: 'relative',
                }}>
                  <span className="st-display" style={{ fontSize: 80, fontWeight: 300, opacity: 0.85, letterSpacing: '-0.04em' }}>{m.i}</span>
                  <span className="st-mono" style={{ position: 'absolute', bottom: 14, left: 14, fontSize: 10, color: 'rgba(244,244,242,0.7)', letterSpacing: '0.1em' }}>SAFETECH · TEAM</span>
                </div>
                <div style={{ padding: 18 }}>
                  <p className="st-display" style={{ fontSize: 18, fontWeight: 400, color: 'var(--st-clay)', letterSpacing: '-0.01em' }}>{m.n}</p>
                  <p style={{ fontSize: 12.5, color: 'var(--st-earth)', marginTop: 4 }}>{m.r}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ padding: '80px 32px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '60px 48px', background: 'var(--st-ink)', borderRadius: 24, textAlign: 'center', color: 'var(--st-bone)' }}>
          <h2 className="st-display" style={{ fontSize: 'clamp(34px, 4.5vw, 56px)', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.035em', marginBottom: 20 }}>
            ¿Listo para hacer <em style={{ fontStyle: 'italic', color: 'var(--st-sand)' }}>el cambio</em>?
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(244,244,242,0.7)', marginBottom: 28 }}>
            Explora el catálogo o cuéntanos qué buscas. Respondemos en menos de 24h.
          </p>
          <div style={{ display: 'inline-flex', gap: 8 }}>
            <button style={{ padding: '13px 24px', background: 'var(--st-bone)', color: 'var(--st-ink)', border: 'none', borderRadius: 999, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}>Ver catálogo</button>
            <button style={{ padding: '13px 24px', background: 'transparent', color: 'var(--st-bone)', border: '1px solid rgba(244,244,242,0.25)', borderRadius: 999, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}>Hablar con nosotros</button>
          </div>
        </div>
      </section>

      <STFooter />
    </div>
  );
};

/* ============================================================
   CONTACTO — split layout: form + info + mapa decorativo
   ============================================================ */
const STContactPage = () => {
  const [reason, setReason] = React.useState('soporte');
  const reasons = [
    { id: 'soporte', label: 'Soporte de pedido', icon: '↗' },
    { id: 'garantia', label: 'Reclamo de garantía', icon: '✓' },
    { id: 'producto', label: 'Pregunta de producto', icon: '?' },
    { id: 'otro', label: 'Otro', icon: '•' },
  ];

  return (
    <div className="st-root" style={{ background: 'var(--st-bone)', minHeight: '100vh' }}>
      <STHeader active="CONTACTO" />

      <section style={{ padding: '64px 32px 100px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {/* Hero */}
          <div style={{ marginBottom: 60, maxWidth: 720 }}>
            <p className="st-eyebrow" style={{ marginBottom: 16 }}>CONTACTO · LUN–VIE 9–18H</p>
            <h1 className="st-display" style={{ fontSize: 'clamp(44px, 6vw, 84px)', fontWeight: 300, lineHeight: 0.96, letterSpacing: '-0.04em', color: 'var(--st-clay)' }}>
              ¿Una pregunta? <em style={{ fontStyle: 'italic', color: 'var(--st-earth)' }}>Hablemos.</em>
            </h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 48 }}>
            {/* Formulario */}
            <div style={{ background: 'var(--st-cream)', borderRadius: 20, padding: 36, border: '1px solid var(--st-line)' }}>
              {/* Razón — chips */}
              <p className="st-eyebrow" style={{ marginBottom: 14 }}>¿SOBRE QUÉ ES?</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 28 }}>
                {reasons.map((r) => {
                  const active = reason === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setReason(r.id)}
                      style={{
                        padding: '14px 16px',
                        background: active ? 'var(--st-clay)' : 'var(--st-bone)',
                        color: active ? 'var(--st-bone)' : 'var(--st-clay)',
                        border: `1px solid ${active ? 'var(--st-clay)' : 'var(--st-line)'}`,
                        borderRadius: 12,
                        fontFamily: 'inherit',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.2s var(--st-ease)',
                      }}
                    >
                      <span>{r.label}</span>
                      <span style={{ opacity: 0.5, fontSize: 14 }}>{r.icon}</span>
                    </button>
                  );
                })}
              </div>

              {/* Inputs */}
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <STField label="NOMBRE" placeholder="Tu nombre" />
                  <STField label="EMAIL" placeholder="tu@correo.com" />
                </div>
                {reason === 'soporte' && <STField label="N° DE PEDIDO" placeholder="ORD-XXXX" />}
                <STField label="MENSAJE" placeholder="Cuéntanos qué necesitas..." multiline />
              </div>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <p style={{ fontSize: 11.5, color: 'var(--st-earth)' }}>
                  Tu mensaje llega directo al equipo. Respuesta &lt; 24h.
                </p>
                <button style={{ padding: '13px 26px', background: 'var(--st-ink)', color: 'var(--st-bone)', border: 'none', borderRadius: 999, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', gap: 10, alignItems: 'center' }}>
                  Enviar mensaje <STIcons.arrow />
                </button>
              </div>
            </div>

            {/* Sidebar info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Tarjeta tipo "mapa" decorativo */}
              <div style={{
                position: 'relative',
                aspectRatio: '4/3',
                borderRadius: 20,
                overflow: 'hidden',
                background: 'linear-gradient(140deg, #2E2D2B 0%, #141413 100%)',
                color: 'var(--st-bone)',
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                {/* Mapa SVG decorativo */}
                <svg viewBox="0 0 400 300" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }}>
                  <defs>
                    <pattern id="dots" patternUnits="userSpaceOnUse" width="14" height="14">
                      <circle cx="2" cy="2" r="1" fill="#F4F4F2"/>
                    </pattern>
                  </defs>
                  <rect width="400" height="300" fill="url(#dots)"/>
                  <path d="M 20 180 Q 100 80 200 130 T 380 100" stroke="#F4F4F2" strokeWidth="1.2" fill="none" strokeDasharray="3,4" opacity="0.6"/>
                  <circle cx="200" cy="130" r="6" fill="#3D1F12" stroke="#F4F4F2" strokeWidth="2"/>
                  <circle cx="200" cy="130" r="14" fill="none" stroke="#3D1F12" strokeWidth="1" opacity="0.6"/>
                </svg>
                <div style={{ position: 'relative' }}>
                  <p className="st-eyebrow" style={{ color: 'rgba(244,244,242,0.6)', marginBottom: 10 }}>NUESTRO TALLER</p>
                  <p className="st-display" style={{ fontSize: 26, fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                    Calle 72 #10-34<br />Bogotá, Colombia
                  </p>
                </div>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <p className="st-mono" style={{ fontSize: 11, color: 'rgba(244,244,242,0.5)', letterSpacing: '0.08em' }}>04°41′N · 74°03′W</p>
                  <button style={{ padding: '8px 14px', background: 'rgba(244,244,242,0.08)', backdropFilter: 'blur(10px)', color: 'var(--st-bone)', border: '1px solid rgba(244,244,242,0.18)', borderRadius: 999, fontFamily: 'inherit', fontSize: 11.5, cursor: 'pointer', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                    Cómo llegar <STIcons.arrow />
                  </button>
                </div>
              </div>

              {/* Canales */}
              {[
                { l: 'Soporte rápido', v: 'soporte@safetech.com', d: 'Respuesta < 24h' },
                { l: 'WhatsApp', v: '+57 310 555 0142', d: 'Lun–Vie · 9–18h' },
                { l: 'Garantías', v: 'garantia@safetech.com', d: 'Reclamos de 90 días' },
              ].map((c) => (
                <a key={c.l} href="#" style={{
                  textDecoration: 'none',
                  padding: 20,
                  background: 'var(--st-cream)',
                  border: '1px solid var(--st-line)',
                  borderRadius: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s var(--st-ease)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--st-bone)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--st-cream)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div>
                    <p className="st-eyebrow" style={{ marginBottom: 4 }}>{c.l}</p>
                    <p style={{ fontSize: 14.5, color: 'var(--st-clay)', fontWeight: 500, marginBottom: 2 }}>{c.v}</p>
                    <p style={{ fontSize: 11.5, color: 'var(--st-earth)' }}>{c.d}</p>
                  </div>
                  <span style={{ color: 'var(--st-earth)', fontSize: 18 }}>→</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <STFooter />
    </div>
  );
};

const STField = ({ label, placeholder, multiline }) => {
  const [focused, setFocused] = React.useState(false);
  return (
    <label style={{ display: 'block' }}>
      <p className="st-eyebrow" style={{ marginBottom: 8 }}>{label}</p>
      {multiline ? (
        <textarea
          rows={4}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: '14px 16px',
            background: 'var(--st-bone)',
            border: `1px solid ${focused ? 'var(--st-clay)' : 'var(--st-line)'}`,
            borderRadius: 10,
            fontFamily: 'inherit',
            fontSize: 14,
            color: 'var(--st-clay)',
            resize: 'vertical',
            outline: 'none',
            transition: 'border 0.15s',
          }}
        />
      ) : (
        <input
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: '14px 16px',
            background: 'var(--st-bone)',
            border: `1px solid ${focused ? 'var(--st-clay)' : 'var(--st-line)'}`,
            borderRadius: 10,
            fontFamily: 'inherit',
            fontSize: 14,
            color: 'var(--st-clay)',
            outline: 'none',
            transition: 'border 0.15s',
          }}
        />
      )}
    </label>
  );
};

window.STOrdersPage = STOrdersPage;
window.STAboutPage = STAboutPage;
window.STContactPage = STContactPage;
