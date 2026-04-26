/* Login (Clerk-style) + Admin Dashboard */

const STLoginPage = () => {
  const [email, setEmail] = React.useState('');
  return (
    <div style={{ minHeight: 720, display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--st-bone)', position: 'relative', overflow: 'hidden' }}>
      {/* Branding side */}
      <div style={{ background: 'var(--st-ink)', color: 'var(--st-bone)', padding: '60px 56px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }} className="st-grain">
        {/* Halo */}
        <div style={{ position: 'absolute', width: 600, height: 600, top: '20%', left: '-10%', background: 'radial-gradient(circle, rgba(181,161,135,0.3) 0%, transparent 60%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <STWordmark size={20} color="var(--st-bone)" />
        </div>

        <div style={{ position: 'relative' }}>
          <STBadge variant="outline" style={{ borderColor: 'rgba(247,243,236,0.2)', color: 'var(--st-sand)', marginBottom: 28 }}>
            <STDot color="var(--st-sand)" />
            Tu cuenta segura
          </STBadge>
          <h2 className="st-display" style={{ fontSize: 56, fontWeight: 300, lineHeight: 1, letterSpacing: '-0.04em', marginBottom: 24 }}>
            Tus pedidos,<br />tus garantías,<br /><em style={{ fontStyle: 'italic', color: 'var(--st-sand)' }}>en un sitio.</em>
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(247,243,236,0.6)', maxWidth: 360, lineHeight: 1.65 }}>
            Accede para gestionar pedidos, activar garantías y comprar con tus métodos guardados.
          </p>
        </div>

        <div style={{ position: 'relative', display: 'flex', gap: 36, paddingTop: 28, borderTop: '1px solid rgba(247,243,236,0.1)' }}>
          {[['40+', 'Inspecciones'], ['90d', 'Garantía'], ['−40%', 'Vs nuevo']].map(([v, l]) => (
            <div key={l}>
              <p className="st-display" style={{ fontSize: 26, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4 }}>{v}</p>
              <p className="st-mono" style={{ fontSize: 10, color: 'var(--st-taupe)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form side (Clerk mock) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 380, background: 'var(--st-bone)', border: '1px solid var(--st-line)', borderRadius: 18, padding: 36, boxShadow: '0 20px 50px -20px rgba(92,70,50,0.12)' }}>
          <h3 className="st-display" style={{ fontSize: 28, fontWeight: 400, color: 'var(--st-clay)', letterSpacing: '-0.025em', marginBottom: 6 }}>
            Hola de nuevo
          </h3>
          <p style={{ fontSize: 14, color: 'var(--st-earth)', marginBottom: 28 }}>Inicia sesión en tu cuenta SafeTech</p>

          {/* Social */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {['Google', 'Apple'].map((s) => (
              <button key={s} style={{ padding: '10px 0', border: '1px solid var(--st-line)', borderRadius: 'var(--st-radius-pill)', background: 'transparent', fontSize: 13, fontFamily: 'inherit', color: 'var(--st-clay)', cursor: 'pointer', fontWeight: 500 }}>
                {s}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
            <span style={{ flex: 1, height: 1, background: 'var(--st-line)' }} />
            <span className="st-mono" style={{ fontSize: 10, color: 'var(--st-earth)', letterSpacing: '0.1em' }}>O CON EMAIL</span>
            <span style={{ flex: 1, height: 1, background: 'var(--st-line)' }} />
          </div>

          <label className="st-mono" style={{ fontSize: 10, color: 'var(--st-earth)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Correo
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            style={{ width: '100%', padding: '12px 14px', background: 'var(--st-cream)', border: '1px solid var(--st-line)', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', color: 'var(--st-clay)', outline: 'none', marginBottom: 20 }}
          />

          <button style={{ width: '100%', padding: '13px 0', background: 'var(--st-ink)', color: 'var(--st-bone)', border: 'none', borderRadius: 'var(--st-radius-pill)', fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer' }}>
            Continuar
          </button>

          <p style={{ fontSize: 13, color: 'var(--st-earth)', textAlign: 'center', marginTop: 24 }}>
            ¿Aún no tienes cuenta? <a href="#" style={{ color: 'var(--st-clay)', fontWeight: 500 }}>Regístrate</a>
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Admin Dashboard ──────────────────────────────────────

const STAdminDashboard = () => {
  const [active, setActive] = React.useState('dashboard');
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '◫' },
    { id: 'orders', label: 'Órdenes', icon: '◊' },
    { id: 'warranties', label: 'Garantías', icon: '◈' },
    { id: 'products', label: 'Productos', icon: '◇' },
    { id: 'technicians', label: 'Técnicos', icon: '○' },
  ];

  return (
    <div style={{ minHeight: 800, display: 'grid', gridTemplateColumns: '240px 1fr', background: 'var(--st-bone)' }}>
      {/* Sidebar */}
      <aside style={{ background: 'var(--st-cream)', borderRight: '1px solid var(--st-line)', padding: 24, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <STWordmark size={16} />
          <STBadge variant="dark">Admin</STBadge>
        </div>

        <p className="st-mono" style={{ fontSize: 10, color: 'var(--st-earth)', letterSpacing: '0.12em', marginBottom: 12 }}>GESTIÓN</p>
        <nav style={{ display: 'grid', gap: 2, marginBottom: 'auto' }}>
          {navItems.map((it) => (
            <button
              key={it.id}
              onClick={() => setActive(it.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: active === it.id ? 'var(--st-ink)' : 'transparent',
                color: active === it.id ? 'var(--st-bone)' : 'var(--st-clay)',
                border: 'none',
                borderRadius: 10,
                fontFamily: 'inherit',
                fontSize: 13.5,
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s var(--st-ease)',
              }}
            >
              <span style={{ width: 18, fontSize: 14, opacity: 0.7 }}>{it.icon}</span>
              {it.label}
            </button>
          ))}
        </nav>

        <div style={{ paddingTop: 20, borderTop: '1px solid var(--st-line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--st-taupe)', color: 'var(--st-bone)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>AC</div>
            <div>
              <p style={{ fontSize: 13, color: 'var(--st-clay)', fontWeight: 500 }}>Ana Castro</p>
              <p className="st-mono" style={{ fontSize: 10, color: 'var(--st-earth)', letterSpacing: '0.06em' }}>OWNER</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ padding: '32px 40px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <p className="st-eyebrow" style={{ marginBottom: 8 }}>Resumen · Hoy</p>
            <h1 className="st-display" style={{ fontSize: 40, fontWeight: 300, color: 'var(--st-clay)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              Dashboard
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <STButton variant="secondary" size="sm">Exportar</STButton>
            <STButton variant="primary" size="sm" iconRight={<STIcons.plus />}>Nuevo producto</STButton>
          </div>
        </div>

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { l: 'Ingresos', v: '$48,290', d: '+12.4%', positive: true },
            { l: 'Órdenes', v: '127', d: '+8 nuevas', positive: true },
            { l: 'Garantías activas', v: '342', d: '12 abiertas', positive: false },
            { l: 'Stock disponible', v: '89', d: 'Bajo en 3', positive: false },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--st-cream)', border: '1px solid var(--st-line)', borderRadius: 14, padding: 20 }}>
              <p className="st-mono" style={{ fontSize: 10.5, color: 'var(--st-earth)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>{s.l}</p>
              <p className="st-display" style={{ fontSize: 32, fontWeight: 300, color: 'var(--st-clay)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 8 }}>{s.v}</p>
              <p className="st-mono" style={{ fontSize: 11, color: s.positive ? 'var(--st-leaf)' : 'var(--st-rust)', letterSpacing: '0.05em' }}>
                {s.positive ? '↑' : '!'} {s.d}
              </p>
            </div>
          ))}
        </div>

        {/* Chart + table */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 32 }}>
          {/* Chart */}
          <div style={{ background: 'var(--st-cream)', border: '1px solid var(--st-line)', borderRadius: 14, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 className="st-display" style={{ fontSize: 18, fontWeight: 400, color: 'var(--st-clay)' }}>Ventas — últimos 30 días</h3>
              <STBadge variant="leaf"><STDot color="var(--st-leaf)" />Tendencia +</STBadge>
            </div>
            <svg viewBox="0 0 600 180" style={{ width: '100%', height: 180 }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--st-clay)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--st-clay)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[40, 80, 120].map((y) => (
                <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="var(--st-line)" strokeWidth="0.5" strokeDasharray="2 4" />
              ))}
              <path d="M0,140 C50,130 100,120 150,100 S250,70 300,80 S400,40 450,50 S550,30 600,20 L600,180 L0,180 Z" fill="url(#chartGrad)" />
              <path d="M0,140 C50,130 100,120 150,100 S250,70 300,80 S400,40 450,50 S550,30 600,20" stroke="var(--st-clay)" strokeWidth="2" fill="none" strokeLinecap="round" />
              {[[150, 100], [300, 80], [450, 50], [600, 20]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="3" fill="var(--st-clay)" />
              ))}
            </svg>
          </div>

          {/* Top products */}
          <div style={{ background: 'var(--st-cream)', border: '1px solid var(--st-line)', borderRadius: 14, padding: 24 }}>
            <h3 className="st-display" style={{ fontSize: 18, fontWeight: 400, color: 'var(--st-clay)', marginBottom: 16 }}>Top productos</h3>
            {[
              ['iPhone 14 Pro', 42, '#3A2E26'],
              ['MacBook Pro', 28, '#5C4632'],
              ['iPad Air 5', 18, '#8C7256'],
              ['AirPods Pro', 12, '#B5A187'],
            ].map(([n, p, c]) => (
              <div key={n} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: 'var(--st-clay)' }}>{n}</span>
                  <span className="st-mono" style={{ color: 'var(--st-earth)' }}>{p}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--st-bone)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${p * 2}%`, height: '100%', background: c, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders table */}
        <div style={{ background: 'var(--st-cream)', border: '1px solid var(--st-line)', borderRadius: 14, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="st-display" style={{ fontSize: 18, fontWeight: 400, color: 'var(--st-clay)' }}>Órdenes recientes</h3>
            <STButton variant="ghost" size="sm">Ver todas →</STButton>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--st-line)' }}>
                {['Orden', 'Cliente', 'Producto', 'Total', 'Estado'].map((h) => (
                  <th key={h} className="st-mono" style={{ textAlign: 'left', padding: '12px 8px', fontSize: 10.5, color: 'var(--st-earth)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['#ST-4421', 'María Granados', 'MacBook Pro 14"', '$1,620', 'Enviado', 'leaf'],
                ['#ST-4420', 'Daniel Ortiz', 'iPhone 14 Pro', '$849', 'Procesando', 'rust'],
                ['#ST-4419', 'Carolina Mejía', 'iPad Air 5', '$459', 'Entregado', 'leaf'],
                ['#ST-4418', 'Roberto Silva', 'AirPods Pro 2', '$159', 'Pendiente', 'outline'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: i === 3 ? 'none' : '1px solid var(--st-line)' }}>
                  <td className="st-mono" style={{ padding: '14px 8px', color: 'var(--st-clay)' }}>{row[0]}</td>
                  <td style={{ padding: '14px 8px', color: 'var(--st-clay)' }}>{row[1]}</td>
                  <td style={{ padding: '14px 8px', color: 'var(--st-earth)' }}>{row[2]}</td>
                  <td className="st-mono" style={{ padding: '14px 8px', color: 'var(--st-clay)', fontWeight: 500 }}>{row[3]}</td>
                  <td style={{ padding: '14px 8px' }}>
                    <STBadge variant={row[5]}>{row[4]}</STBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

Object.assign(window, { STLoginPage, STAdminDashboard });
