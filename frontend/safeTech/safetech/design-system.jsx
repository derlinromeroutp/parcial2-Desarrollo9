/* ============================================================
   SafeTech Design System — Cream / Taupe / Earth
   Premium refurbished tech, warm + tactile + editorial-tech
   ============================================================ */

const TOKENS = {
  // Off-white / slate — sin tintes cálidos. Limpio + editorial.
  bone:    '#F4F4F2',  // fondo principal (off-white neutro casi blanco)
  cream:   '#EAEAE6',  // cards, secundario
  sand:    '#D5D4CF',  // dividers, hover
  taupe:   '#8E8D88',  // interactivo medio
  earth:   '#5C5B57',  // texto secundario
  clay:    '#2E2D2B',  // texto principal
  ink:     '#141413',  // CTAs, alto contraste
  leaf:    '#4A5C45',  // acento — verde oliva oscuro
  rust:    '#3D1F12',  // marrón oscuro (chocolate) para nav activo

  // Líneas
  line:    'rgba(20, 20, 19, 0.10)',
  lineSoft:'rgba(20, 20, 19, 0.05)',
};

// Inyecta los tokens como CSS vars para que el resto de los componentes
// puedan usar var(--st-bone), etc. Llamado una sola vez al cargar.
(function injectTokens() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('st-tokens')) return;
  const style = document.createElement('style');
  style.id = 'st-tokens';
  style.textContent = `
    :root {
      --st-bone:    ${TOKENS.bone};
      --st-cream:   ${TOKENS.cream};
      --st-sand:    ${TOKENS.sand};
      --st-taupe:   ${TOKENS.taupe};
      --st-earth:   ${TOKENS.earth};
      --st-clay:    ${TOKENS.clay};
      --st-ink:     ${TOKENS.ink};
      --st-leaf:    ${TOKENS.leaf};
      --st-rust:    ${TOKENS.rust};
      --st-line:    ${TOKENS.line};
      --st-line-soft: ${TOKENS.lineSoft};

      --st-font-display: 'Fraunces', 'Cormorant Garamond', Georgia, serif;
      --st-font-sans:    'Geist', 'Inter Tight', -apple-system, system-ui, sans-serif;
      --st-font-mono:    'JetBrains Mono', 'Geist Mono', ui-monospace, monospace;

      --st-radius-xs: 3px;
      --st-radius-sm: 6px;
      --st-radius-md: 10px;
      --st-radius-lg: 18px;
      --st-radius-pill: 999px;

      --st-ease: cubic-bezier(0.16, 1, 0.3, 1);
    }

    .st-root {
      font-family: var(--st-font-sans);
      color: var(--st-clay);
      background: var(--st-bone);
      -webkit-font-smoothing: antialiased;
      font-feature-settings: 'ss01', 'cv01';
    }

    .st-root * { box-sizing: border-box; }
    .st-root *::selection { background: var(--st-clay); color: var(--st-bone); }

    .st-mono { font-family: var(--st-font-mono); font-feature-settings: 'tnum'; }
    .st-display { font-family: var(--st-font-display); font-weight: 300; letter-spacing: -0.025em; }

    .st-eyebrow {
      font-family: var(--st-font-mono);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--st-earth);
    }

    /* Grano sutil reutilizable */
    .st-grain::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.4;
      mix-blend-mode: multiply;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.36 0 0 0 0 0.27 0 0 0 0 0.20 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }

    @keyframes st-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
    @keyframes st-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes st-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    @keyframes st-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    @keyframes st-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes st-spin-slow { to { transform: rotate(360deg); } }

    .st-fade-up { animation: st-fade-up 0.7s var(--st-ease) both; }
    .st-fade-in { animation: st-fade-in 0.6s var(--st-ease) both; }
  `;
  document.head.appendChild(style);

  // Cargar fuentes (Google Fonts)
  if (!document.getElementById('st-fonts')) {
    const pre1 = document.createElement('link');
    pre1.rel = 'preconnect';
    pre1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(pre1);
    const pre2 = document.createElement('link');
    pre2.rel = 'preconnect';
    pre2.href = 'https://fonts.gstatic.com';
    pre2.crossOrigin = 'anonymous';
    document.head.appendChild(pre2);
    const link = document.createElement('link');
    link.id = 'st-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..700,30..100,0..1&family=Geist:wght@300..700&family=JetBrains+Mono:wght@400;500&display=swap';
    document.head.appendChild(link);
  }
})();

// ─── Primitives ────────────────────────────────────────────

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  iconRight = null,
  onClick,
  style = {},
  ...rest
}) => {
  const sizes = {
    sm: { padding: '8px 14px', fontSize: 13 },
    md: { padding: '12px 20px', fontSize: 14 },
    lg: { padding: '16px 28px', fontSize: 15 },
  };
  const variants = {
    primary: { background: 'var(--st-ink)', color: 'var(--st-bone)', border: '1px solid var(--st-ink)' },
    secondary: { background: 'transparent', color: 'var(--st-clay)', border: '1px solid var(--st-clay)' },
    ghost: { background: 'transparent', color: 'var(--st-clay)', border: '1px solid transparent' },
    cream: { background: 'var(--st-cream)', color: 'var(--st-clay)', border: '1px solid var(--st-line)' },
  };
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...sizes[size],
        ...variants[variant],
        fontFamily: 'var(--st-font-sans)',
        fontWeight: 500,
        letterSpacing: '-0.005em',
        borderRadius: 'var(--st-radius-pill)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        transition: 'all 0.3s var(--st-ease)',
        transform: hover ? 'translateY(-1px)' : 'none',
        boxShadow: hover && variant === 'primary' ? '0 8px 24px rgba(42,31,23,0.25)' : 'none',
        ...style,
      }}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
};

const Badge = ({ children, variant = 'default', style = {} }) => {
  const variants = {
    default: { background: 'var(--st-cream)', color: 'var(--st-clay)' },
    leaf: { background: 'rgba(111,122,90,0.14)', color: 'var(--st-leaf)' },
    rust: { background: 'rgba(168,92,62,0.12)', color: 'var(--st-rust)' },
    outline: { background: 'transparent', color: 'var(--st-earth)', border: '1px solid var(--st-line)' },
    dark: { background: 'var(--st-ink)', color: 'var(--st-bone)' },
  };
  return (
    <span
      className="st-mono"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        borderRadius: 'var(--st-radius-pill)',
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
};

const Dot = ({ color = 'var(--st-leaf)', size = 6, pulse = true, style = {} }) => (
  <span
    style={{
      display: 'inline-block',
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      animation: pulse ? 'st-pulse 2s ease-in-out infinite' : 'none',
      ...style,
    }}
  />
);

// Util: count up para stats
function useCountUp(target, duration = 1400, start = false) {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    if (!start) return;
    let s = null;
    const step = (ts) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
      else setV(target);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return v;
}

// In-view detector
function useInView(threshold = 0.2) {
  const ref = React.useRef(null);
  const [seen, setSeen] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current || seen) return;
    const o = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setSeen(true); },
      { threshold }
    );
    o.observe(ref.current);
    return () => o.disconnect();
  }, [seen, threshold]);
  return [ref, seen];
}

// SVG icons (línea fina)
const Icons = {
  arrow: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  ),
  check: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5L20 7" />
    </svg>
  ),
  shield: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 3v6c0 4.5-3.5 8.5-8 9-4.5-.5-8-4.5-8-9V6l8-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  ),
  spark: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </svg>
  ),
  cart: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h2l2.4 12.4a2 2 0 002 1.6h8.6a2 2 0 002-1.6L21 8H6" />
      <circle cx="9" cy="21" r="1.2" />
      <circle cx="18" cy="21" r="1.2" />
    </svg>
  ),
  search: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
    </svg>
  ),
  menu: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  plus: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  ),
  minus: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path strokeLinecap="round" d="M5 12h14" />
    </svg>
  ),
};

// ─── Marca / logo ──────────────────────────────────────────
const SafeTechMark = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Escudo redondeado con notch */}
    <path
      d="M12 2L4 5v6.5c0 4.7 3.3 8.9 8 10.5 4.7-1.6 8-5.8 8-10.5V5l-8-3z"
      stroke={color}
      strokeWidth="1.4"
      fill="none"
    />
    {/* Pequeño chip / nodo central */}
    <rect x="9" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="1.4" fill="none" />
    <path d="M12 7v2M12 15v2M7 12h2M15 12h2" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const Wordmark = ({ size = 18, color = 'var(--st-clay)' }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color }}>
    <SafeTechMark size={size} color={color} />
    <span
      className="st-display"
      style={{
        fontSize: size * 1.05,
        fontWeight: 400,
        letterSpacing: '-0.03em',
        fontStyle: 'italic',
      }}
    >
      Safe<span style={{ fontStyle: 'normal', fontWeight: 300 }}>Tech</span>
    </span>
  </span>
);

// Export a window
Object.assign(window, {
  STTokens: TOKENS,
  STButton: Button,
  STBadge: Badge,
  STDot: Dot,
  STIcons: Icons,
  STMark: SafeTechMark,
  STWordmark: Wordmark,
  useCountUp,
  useInView,
});
