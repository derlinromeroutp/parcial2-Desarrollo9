import { useState, useRef, useEffect } from 'react';

type FormState = 'idle' | 'sending' | 'sent';

const faqs = [
  { q: '¿Cuánto tarda el envío?',               a: 'Envíos estándar en 2–4 días hábiles dentro de Panamá. Envío express en 24 h disponible.' },
  { q: '¿Puedo devolver un producto?',           a: 'Sí, aceptamos devoluciones en 30 días sin preguntas. Solo contáctanos y coordinamos la recogida.' },
  { q: '¿Cómo funciona la garantía?',            a: 'La garantía de 90 días cubre cualquier defecto de hardware o software. Reparación o reemplazo sin costo.' },
  { q: '¿Puedo ver el equipo antes de comprar?', a: 'Contáctanos para coordinar una visita a nuestro taller en Ciudad de Panamá.' },
];

// ── Shared styles ─────────────────────────────────────────────────────────
const labelSt: React.CSSProperties = {
  display: 'block', fontSize: '.72rem', fontWeight: 600, letterSpacing: '.5px',
  color: 'var(--ink2)', fontFamily: 'var(--font-sans)', marginBottom: 6, textTransform: 'uppercase',
};
const inputSt: React.CSSProperties = {
  width: '100%', padding: '11px 14px', border: '1.5px solid var(--line)', borderRadius: 4,
  fontFamily: 'var(--font-sans)', fontSize: '.9rem', background: 'var(--white)',
  color: 'var(--ink)', outline: 'none', transition: 'border-color .2s ease',
};

// ── Icons ─────────────────────────────────────────────────────────────────
const MailIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const PhoneIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.11 10.1 19.79 19.79 0 012.1 1.47 2 2 0 014.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
const PinIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const ClockIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

// ── Field ─────────────────────────────────────────────────────────────────
function Field({ label, name, type = 'text', value, onChange, placeholder }: {
  label: string; name: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={labelSt}>{label}</label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...inputSt, borderColor: focused ? 'var(--ink)' : 'var(--line)' }}
      />
    </div>
  );
}

// ── Info card ─────────────────────────────────────────────────────────────
function InfoCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div
      style={{ display:'flex', gap:'1rem', alignItems:'flex-start', padding:'1.25rem', background:'var(--white)', border:'1.5px solid var(--line)', borderRadius:6, transition:'all .25s ease', cursor:'default' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='0 6px 24px rgba(0,0,0,.08)'; (e.currentTarget as HTMLDivElement).style.borderColor='transparent'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow=''; (e.currentTarget as HTMLDivElement).style.borderColor='var(--line)'; }}
    >
      <div style={{ width:40, height:40, background:'rgba(0,0,0,.04)', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'var(--ink)' }}>
        {icon}
      </div>
      <div>
        <p style={{ fontFamily:'var(--font-sans)', fontSize:'.65rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'1px', color:'var(--gray)', marginBottom:3 }}>{label}</p>
        <p style={{ fontFamily:'var(--font-display)', fontSize:'.95rem', fontWeight:600, color:'var(--ink)', marginBottom:2 }}>{value}</p>
        <p style={{ fontFamily:'var(--font-sans)', fontSize:'.75rem', color:'var(--ink3)', fontWeight:300 }}>{sub}</p>
      </div>
    </div>
  );
}

// ── FAQ item ──────────────────────────────────────────────────────────────
function FaqItem({ faq, open, onToggle }: { faq: { q: string; a: string }; open: boolean; onToggle: () => void }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  useEffect(() => { if (bodyRef.current) setH(bodyRef.current.scrollHeight); }, [faq]);
  return (
    <div style={{ borderBottom:'1px solid var(--line)' }}>
      <button
        onClick={onToggle}
        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.25rem 0', background:'none', border:'none', cursor:'pointer', textAlign:'left', gap:'1rem' }}
      >
        <span style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:400, color:'var(--ink)', letterSpacing:'-.01em' }}>{faq.q}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition:'transform .28s ease', flexShrink:0, color:'var(--ink3)' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div style={{ maxHeight: open ? h + 2 : 0, overflow:'hidden', transition:'max-height .35s cubic-bezier(.16,1,.3,1)' }}>
        <div ref={bodyRef} style={{ paddingBottom:'1.25rem' }}>
          <p style={{ fontFamily:'var(--font-sans)', fontSize:'.875rem', color:'var(--ink2)', lineHeight:1.75, fontWeight:300 }}>{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

// ── Sent state ────────────────────────────────────────────────────────────
function SentState({ onReset }: { onReset: () => void }) {
  return (
    <div className="animate-slide-up" style={{ padding:'3rem 2rem', background:'var(--white)', border:'1.5px solid var(--line)', borderRadius:6, textAlign:'center' }}>
      <div style={{ width:56, height:56, background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.25)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.35rem', fontWeight:400, color:'var(--ink)', letterSpacing:'-.02em', marginBottom:'.5rem' }}>
        ¡Mensaje enviado!
      </h3>
      <p style={{ fontFamily:'var(--font-sans)', fontSize:'.875rem', color:'var(--ink3)', lineHeight:1.65, marginBottom:'1.75rem', maxWidth:320, margin:'0 auto 1.75rem' }}>
        Te responderemos a tu correo en menos de 24 horas en días hábiles.
      </p>
      <button
        onClick={onReset}
        style={{ background:'none', border:'1.5px solid var(--line)', padding:'10px 22px', fontFamily:'var(--font-sans)', fontSize:'.8rem', fontWeight:500, color:'var(--ink2)', cursor:'pointer', borderRadius:4, transition:'all .2s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='var(--ink)'; (e.currentTarget as HTMLButtonElement).style.color='var(--ink)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='var(--line)'; (e.currentTarget as HTMLButtonElement).style.color='var(--ink2)'; }}
      >
        Enviar otro mensaje
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function Contacto() {
  const [form, setForm]     = useState({ nombre:'', email:'', asunto:'', mensaje:'' });
  const [status, setStatus] = useState<FormState>('idle');
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

  return (
    <div style={{ background:'var(--cream)' }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ background:'var(--ink)', position:'relative', overflow:'hidden', padding:'4.5rem 0 5rem' }}>
        <div style={{ position:'absolute', inset:0, opacity:.04, pointerEvents:'none',
          backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
        <div className="page-container" style={{ position:'relative', zIndex:2 }}>
          <p className="animate-slide-up" style={{ fontSize:'.62rem', fontWeight:600, letterSpacing:'3px', textTransform:'uppercase', color:'rgba(255,255,255,.35)', fontFamily:'var(--font-sans)', marginBottom:'1.25rem' }}>
            Estamos para ayudarte
          </p>
          <h1 className="animate-slide-up stagger-2" style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2.5rem,5.5vw,4.5rem)', fontWeight:300, color:'var(--white)', lineHeight:1.05, letterSpacing:'-.035em', marginBottom:'1rem' }}>
            Contáctanos
          </h1>
          <p className="animate-slide-up stagger-3" style={{ fontFamily:'var(--font-sans)', fontSize:'.95rem', color:'rgba(255,255,255,.45)', lineHeight:1.75, maxWidth:460, fontWeight:300 }}>
            Respondemos todas las consultas en menos de 24 horas en días hábiles.
          </p>
        </div>
      </section>

      {/* ── MAIN GRID ────────────────────────────────────────── */}
      <section style={{ padding:'5rem 0' }}>
        <div className="page-container">
          <div className="contacto-grid">

            {/* LEFT — Form */}
            <div>
              <p style={{ fontSize:'.62rem', fontWeight:600, letterSpacing:'3px', textTransform:'uppercase', color:'var(--gray)', fontFamily:'var(--font-sans)', marginBottom:'2rem' }}>
                Envíanos un mensaje
              </p>

              {status === 'sent' ? (
                <SentState onReset={() => { setStatus('idle'); setForm({ nombre:'', email:'', asunto:'', mensaje:'' }); }} />
              ) : (
                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
                    <Field label="Nombre completo"     name="nombre" value={form.nombre} onChange={handleChange} placeholder="Tu nombre" />
                    <Field label="Correo electrónico"  name="email"  type="email" value={form.email} onChange={handleChange} placeholder="tu@email.com" />
                  </div>

                  <div>
                    <label style={labelSt}>Asunto</label>
                    <select
                      name="asunto" value={form.asunto} onChange={handleChange}
                      onFocus={() => setFocusedSelect(true)}
                      onBlur={() => setFocusedSelect(false)}
                      style={{ ...inputSt, cursor:'pointer', borderColor: focusedSelect ? 'var(--ink)' : 'var(--line)' }}
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
                    <label style={labelSt}>Mensaje</label>
                    <textarea
                      name="mensaje" value={form.mensaje} onChange={handleChange}
                      placeholder="Cuéntanos cómo podemos ayudarte..."
                      rows={6}
                      onFocus={() => setFocusedArea(true)}
                      onBlur={() => setFocusedArea(false)}
                      style={{ ...inputSt, resize:'vertical', minHeight:140, borderColor: focusedArea ? 'var(--ink)' : 'var(--line)' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'sending' || !canSubmit}
                    style={{
                      alignSelf:'flex-start', padding:'14px 36px',
                      background: status === 'sending' ? 'var(--ink2)' : 'var(--ink)',
                      color:'var(--white)', border:'none',
                      fontFamily:'var(--font-sans)', fontSize:'.85rem', fontWeight:600, letterSpacing:'.3px',
                      cursor: (status === 'sending' || !canSubmit) ? 'not-allowed' : 'pointer',
                      opacity: !canSubmit ? .45 : 1,
                      transition:'all .25s ease',
                      display:'flex', alignItems:'center', gap:10,
                      borderRadius: 4,
                    }}
                    onMouseEnter={e => { if (canSubmit && status !== 'sending') { (e.currentTarget as HTMLButtonElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow='0 8px 24px rgba(68,19,6,.28)'; } }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform=''; (e.currentTarget as HTMLButtonElement).style.boxShadow=''; }}
                  >
                    {status === 'sending'
                      ? <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation:'spin .8s linear infinite' }}>
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                          </svg>
                          Enviando...
                        </>
                      : <>
                          Enviar mensaje
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                          </svg>
                        </>
                    }
                  </button>
                </form>
              )}
            </div>

            {/* RIGHT — Info */}
            <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              <p style={{ fontSize:'.62rem', fontWeight:600, letterSpacing:'3px', textTransform:'uppercase', color:'var(--gray)', fontFamily:'var(--font-sans)' }}>
                Información de contacto
              </p>
              <InfoCard icon={<MailIcon />}  label="Correo electrónico"    value="hola@safetech.pa"        sub="Respuesta en menos de 24 h" />
              <InfoCard icon={<PhoneIcon />} label="Teléfono / WhatsApp"   value="+507 6000-0000"          sub="Lun–Vie, 9 am – 6 pm" />
              <InfoCard icon={<PinIcon />}   label="Ubicación"             value="Ciudad de Panamá, Panamá" sub="Visitas al taller con cita previa" />

              {/* Response time badge */}
              <div style={{ padding:'1.25rem 1.5rem', background:'var(--ink)', borderRadius:6, display:'flex', alignItems:'center', gap:'1rem' }}>
                <div style={{ width:40, height:40, background:'rgba(255,255,255,.08)', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <ClockIcon />
                </div>
                <div>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:600, color:'var(--white)', marginBottom:2 }}>Respuesta en ~18 min</p>
                  <p style={{ fontFamily:'var(--font-sans)', fontSize:'.72rem', color:'rgba(255,255,255,.4)', lineHeight:1.5 }}>Promedio en horario laboral</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section style={{ background:'var(--white)', borderTop:'1px solid var(--line)', padding:'5rem 0' }}>
        <div className="page-container">
          <div className="faq-grid">
            <div>
              <p style={{ fontSize:'.62rem', fontWeight:600, letterSpacing:'3px', textTransform:'uppercase', color:'var(--gray)', fontFamily:'var(--font-sans)', marginBottom:'.875rem' }}>FAQ</p>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.5rem,2.5vw,2rem)', fontWeight:400, fontStyle:'italic', color:'var(--ink)', letterSpacing:'-.025em', lineHeight:1.2 }}>
                Preguntas frecuentes
              </h2>
            </div>
            <div style={{ borderTop:'1px solid var(--line)' }}>
              {faqs.map((faq, i) => (
                <FaqItem key={i} faq={faq} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .contacto-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 5rem;
          align-items: start;
        }
        .faq-grid {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 5rem;
          align-items: start;
        }
        @media (max-width: 900px) {
          .contacto-grid { grid-template-columns: 1fr; gap: 3rem; }
          .faq-grid { grid-template-columns: 1fr; gap: 2rem; }
        }
      `}</style>
    </div>
  );
}
