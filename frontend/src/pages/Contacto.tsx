import { useState } from 'react';

type FormState = 'idle' | 'sending' | 'sent';

const faqs = [
  { q: '¿Cuánto tarda el envío?',               a: 'Envíos estándar en 2–4 días hábiles dentro de Panamá. Envío express en 24 h disponible.' },
  { q: '¿Puedo devolver un producto?',           a: 'Sí, aceptamos devoluciones en 30 días sin preguntas. Solo contáctanos y coordinamos la recogida.' },
  { q: '¿Cómo funciona la garantía?',            a: 'La garantía de 90 días cubre cualquier defecto de hardware o software. Reparación o reemplazo sin costo.' },
  { q: '¿Puedo ver el equipo antes de comprar?', a: 'Contáctanos para coordinar una visita a nuestro taller en Ciudad de Panamá.' },
];

function FaqItem({ faq, open, onToggle }: { faq: { q: string; a: string }; open: boolean; onToggle: () => void }) {
  return (
    <div style={{ borderTop: '1px solid var(--st-line)' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '24px 0', background: 'transparent', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        }}
      >
        <span className="st-display" style={{ fontSize: 20, fontWeight: 400, color: 'var(--st-clay)', letterSpacing: '-0.015em' }}>
          {faq.q}
        </span>
        <span
          style={{
            flexShrink: 0, width: 36, height: 36, borderRadius: '50%',
            border: `1px solid ${open ? 'var(--st-clay)' : 'var(--st-line)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: open ? 'var(--st-bone)' : 'var(--st-clay)',
            transition: 'all 0.3s var(--st-ease)',
            transform: open ? 'rotate(45deg)' : 'none',
            background: open ? 'var(--st-clay)' : 'transparent',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>
      <div style={{ maxHeight: open ? 200 : 0, overflow: 'hidden', transition: 'max-height 0.4s var(--st-ease)' }}>
        <p style={{ fontSize: 15, color: 'var(--st-earth)', lineHeight: 1.7, paddingBottom: 24, maxWidth: 560, fontFamily: 'var(--st-font-sans)' }}>
          {faq.a}
        </p>
      </div>
    </div>
  );
}

function SentState({ onReset }: { onReset: () => void }) {
  return (
    <div
      className="animate-slide-up"
      style={{ padding: '3rem 2rem', background: 'var(--st-cream)', border: '1px solid var(--st-line)', borderRadius: 16, textAlign: 'center' }}
    >
      <div style={{
        width: 56, height: 56, background: 'rgba(74,92,69,0.14)', border: '1px solid rgba(74,92,69,0.25)',
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem',
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--st-leaf)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h3 className="st-display" style={{ fontSize: '1.35rem', fontWeight: 400, color: 'var(--st-clay)', letterSpacing: '-0.02em', marginBottom: '.5rem' }}>
        ¡Mensaje enviado!
      </h3>
      <p style={{ fontFamily: 'var(--st-font-sans)', fontSize: '.875rem', color: 'var(--st-earth)', lineHeight: 1.65, marginBottom: '1.75rem', maxWidth: 320, margin: '0 auto 1.75rem' }}>
        Te responderemos a tu correo en menos de 24 horas en días hábiles.
      </p>
      <button
        onClick={onReset}
        style={{
          background: 'none', border: '1px solid var(--st-line)', padding: '10px 22px',
          fontFamily: 'var(--st-font-sans)', fontSize: '.8rem', fontWeight: 500,
          color: 'var(--st-earth)', cursor: 'pointer', borderRadius: 'var(--st-radius-pill)',
          transition: 'all .2s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--st-clay)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--st-clay)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--st-line)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--st-earth)'; }}
      >
        Enviar otro mensaje
      </button>
    </div>
  );
}

export default function Contacto() {
  const [form, setForm]       = useState({ nombre: '', email: '', asunto: '', mensaje: '' });
  const [status, setStatus]   = useState<FormState>('idle');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [focusedArea, setFocusedArea] = useState(false);
  const [focusedSelect, setFocusedSelect] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.mensaje) return;
    setStatus('sending');
    setTimeout(() => setStatus('sent'), 1600);
  }

  const canSubmit = !!form.nombre && !!form.email && !!form.mensaje;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px',
    border: '1px solid var(--st-line)', borderRadius: 'var(--st-radius-md)',
    fontFamily: 'var(--st-font-sans)', fontSize: '.9rem',
    background: 'var(--st-bone)', color: 'var(--st-clay)',
    transition: 'border-color 0.15s ease', outline: 'none',
  };

  return (
    <div style={{ background: 'var(--st-bone)' }}>

      {/* ── HERO ── */}
      <section style={{ padding: '80px 32px 60px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 0.8fr', gap: 64, alignItems: 'flex-end' }}>
          <div>
            <p className="st-eyebrow" style={{ marginBottom: 18 }}>ESTAMOS PARA AYUDARTE</p>
            <h1
              className="st-display"
              style={{ fontSize: 'clamp(48px, 7vw, 96px)', fontWeight: 300, lineHeight: 0.95, letterSpacing: '-0.045em', color: 'var(--st-clay)' }}
            >
              Contáctanos.
            </h1>
          </div>
          <div style={{ paddingBottom: 8 }}>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--st-earth)', fontFamily: 'var(--st-font-sans)' }}>
              Respondemos todas las consultas en menos de 24 horas en días hábiles.
            </p>
          </div>
        </div>
      </section>

      {/* divider */}
      <div style={{ height: 1, background: 'var(--st-line)', margin: '0 32px' }} />

      {/* ── MAIN GRID ── */}
      <section style={{ padding: '80px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 64, alignItems: 'start' }}>

          {/* LEFT — Form */}
          <div>
            <p className="st-eyebrow" style={{ marginBottom: 28 }}>Envíanos un mensaje</p>

            {status === 'sent' ? (
              <SentState onReset={() => { setStatus('idle'); setForm({ nombre: '', email: '', asunto: '', mensaje: '' }); }} />
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  {[
                    { label: 'Nombre completo', name: 'nombre', type: 'text', placeholder: 'Tu nombre', value: form.nombre },
                    { label: 'Correo electrónico', name: 'email', type: 'email', placeholder: 'tu@email.com', value: form.email },
                  ].map((f) => (
                    <div key={f.name}>
                      <label className="st-mono" style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--st-earth)', marginBottom: 8 }}>
                        {f.label}
                      </label>
                      <input
                        type={f.type} name={f.name} value={f.value} onChange={handleChange}
                        placeholder={f.placeholder}
                        className="input"
                        style={inputStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--st-clay)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--st-line)')}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="st-mono" style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--st-earth)', marginBottom: 8 }}>
                    Asunto
                  </label>
                  <select
                    name="asunto" value={form.asunto} onChange={handleChange}
                    onFocus={() => setFocusedSelect(true)}
                    onBlur={() => setFocusedSelect(false)}
                    style={{ ...inputStyle, cursor: 'pointer', borderColor: focusedSelect ? 'var(--st-clay)' : 'var(--st-line)' }}
                  >
                    <option value="">Selecciona un tema</option>
                    <option value="garantia">Consulta sobre garantía</option>
                    <option value="pedido">Estado de mi pedido</option>
                    <option value="devolucion">Devolución</option>
                    <option value="producto">Pregunta sobre un producto</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="st-mono" style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--st-earth)', marginBottom: 8 }}>
                    Mensaje
                  </label>
                  <textarea
                    name="mensaje" value={form.mensaje} onChange={handleChange}
                    placeholder="Cuéntanos cómo podemos ayudarte..."
                    rows={6}
                    onFocus={() => setFocusedArea(true)}
                    onBlur={() => setFocusedArea(false)}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 140, borderColor: focusedArea ? 'var(--st-clay)' : 'var(--st-line)' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending' || !canSubmit}
                  style={{
                    alignSelf: 'flex-start', padding: '14px 32px',
                    background: status === 'sending' ? 'var(--st-earth)' : 'var(--st-clay)',
                    color: 'var(--st-bone)', border: 'none',
                    borderRadius: 'var(--st-radius-pill)',
                    fontFamily: 'var(--st-font-sans)', fontSize: '.875rem', fontWeight: 500,
                    cursor: (status === 'sending' || !canSubmit) ? 'not-allowed' : 'pointer',
                    opacity: !canSubmit ? .45 : 1,
                    transition: 'all .25s var(--st-ease)',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                  onMouseEnter={e => { if (canSubmit && status !== 'sending') { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(20,20,19,.25)'; } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = ''; }}
                >
                  {status === 'sending'
                    ? <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin .8s linear infinite' }}>
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                        Enviando...
                      </>
                    : <>
                        Enviar mensaje
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                      </>
                  }
                </button>
              </form>
            )}
          </div>

          {/* RIGHT — Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p className="st-eyebrow" style={{ marginBottom: 8 }}>Información de contacto</p>

            {[
              { icon: '✉', label: 'Correo electrónico', value: 'hola@safetech.pa', sub: 'Respuesta en menos de 24 h' },
              { icon: '☎', label: 'Teléfono / WhatsApp', value: '+507 6000-0000', sub: 'Lun–Vie, 9 am – 6 pm' },
              { icon: '📍', label: 'Ubicación', value: 'Ciudad de Panamá', sub: 'Visitas al taller con cita previa' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  padding: '1.25rem 1.5rem', background: 'var(--st-cream)',
                  border: '1px solid var(--st-line)', borderRadius: 14,
                  transition: 'all .25s var(--st-ease)', cursor: 'default',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(46,45,43,.1)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--st-line)'; }}
              >
                <div style={{ width: 40, height: 40, background: 'var(--st-bone)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--st-line)', fontSize: 18 }}>
                  {item.icon}
                </div>
                <div>
                  <p className="st-eyebrow" style={{ marginBottom: 4 }}>{item.label}</p>
                  <p style={{ fontFamily: 'var(--st-font-display)', fontSize: '.95rem', fontWeight: 400, color: 'var(--st-clay)', marginBottom: 2, fontStyle: 'italic' }}>{item.value}</p>
                  <p style={{ fontFamily: 'var(--st-font-sans)', fontSize: '.75rem', color: 'var(--st-earth)' }}>{item.sub}</p>
                </div>
              </div>
            ))}

            {/* Response time */}
            <div style={{ padding: '1.25rem 1.5rem', background: 'var(--st-ink)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 40, height: 40, background: 'rgba(244,244,242,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(244,244,242,0.6)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--st-font-display)', fontSize: '1rem', fontWeight: 400, fontStyle: 'italic', color: 'var(--st-bone)', marginBottom: 2 }}>Respuesta en ~18 min</p>
                <p style={{ fontFamily: 'var(--st-font-sans)', fontSize: '.72rem', color: 'rgba(244,244,242,0.4)', lineHeight: 1.5 }}>Promedio en horario laboral</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* divider */}
      <div style={{ height: 1, background: 'var(--st-line)', margin: '0 32px' }} />

      {/* ── FAQ ── */}
      <section style={{ padding: '100px 32px', background: 'var(--st-cream)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.7fr 1fr', gap: 80, alignItems: 'flex-start' }}>
          <div style={{ position: 'sticky', top: 100 }}>
            <p className="st-eyebrow" style={{ marginBottom: 16 }}>FAQ</p>
            <h2
              className="st-display"
              style={{ fontSize: 'clamp(36px, 4vw, 48px)', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.035em', color: 'var(--st-clay)', marginBottom: 16 }}
            >
              Preguntas <em style={{ fontStyle: 'italic' }}>frecuentes.</em>
            </h2>
            <p style={{ fontSize: 14, color: 'var(--st-earth)', lineHeight: 1.65, fontFamily: 'var(--st-font-sans)' }}>
              ¿No encuentras tu respuesta? Escríbenos directamente.
            </p>
          </div>
          <div style={{ borderBottom: '1px solid var(--st-line)' }}>
            {faqs.map((faq, i) => (
              <FaqItem key={i} faq={faq} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .contacto-hero { grid-template-columns: 1fr !important; }
          .contacto-main { grid-template-columns: 1fr !important; }
          .contacto-faq  { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
