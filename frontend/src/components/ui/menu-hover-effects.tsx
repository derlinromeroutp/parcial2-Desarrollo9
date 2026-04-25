import { useState } from 'react';
import { Link } from 'react-router-dom';

const menuItems = [
  { label: 'Inicio',    href: '/home' },
  { label: 'Catálogo',  href: '/home' },
  { label: 'Pedidos',   href: '/orders' },
  { label: 'Garantías', href: '/warranties/new' },
  { label: 'Nosotros',  href: '#' },
  { label: 'Contacto',  href: '#' },
];

export default function NavMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="nav-menu">
      {/* Hamburger — only visible on mobile */}
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
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.href}
                className="nav-menu-item-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-menu-item-text">{item.label}</span>
                <span className="nav-menu-item-border" />
                <span className="nav-menu-item-fill" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
