import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { label: 'Inicio',    href: '/' },
  { label: 'Catálogo',  href: '/home' },
  { label: 'Pedidos',      href: '/orders' },
  { label: 'Garantías',   href: '/mis-garantias' },
  { label: 'Soporte',    href: '/soporte' },
  { label: 'Nosotros',  href: '/nosotros' },
  { label: 'Contacto',  href: '/contacto' },
];

function isActive(href: string, pathname: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export default function NavMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <nav className="nav-menu">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="nav-menu-toggle"
        aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        <span className={`nav-menu-bar${isMenuOpen ? ' nav-menu-bar--top' : ''}`} />
        <span className={`nav-menu-bar${isMenuOpen ? ' nav-menu-bar--mid' : ''}`} />
        <span className={`nav-menu-bar${isMenuOpen ? ' nav-menu-bar--bot' : ''}`} />
      </button>

      <div className={`nav-menu-container${isMenuOpen ? ' nav-menu-container--open' : ''}`}>
        <ul className="nav-menu-list">
          {menuItems.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className={`nav-menu-item-link${active ? ' nav-menu-item-link--active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="nav-menu-item-text">{item.label}</span>
                  <span className="nav-menu-item-border" />
                  <span className="nav-menu-item-fill" />
                  {active && <span className="nav-menu-item-dot" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
