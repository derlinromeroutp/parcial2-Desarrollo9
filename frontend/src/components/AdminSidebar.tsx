import { Link } from 'react-router-dom';

interface AdminSidebarProps {
  onNavigate?:   (section: string) => void;
  activeSection?: string;
  isOpen?:       boolean;
  onToggle?:     () => void;
}

const DashboardIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);
const OrdersIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);
const WarrantyIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);
const ProductsIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);
const TechnicianIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);
const BackIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const navSections = [
  {
    label: 'General',
    items: [
      { id: 'dashboard',    label: 'Dashboard',  icon: <DashboardIcon /> },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { id: 'orders',       label: 'Órdenes',    icon: <OrdersIcon /> },
      { id: 'warranties',   label: 'Garantías',  icon: <WarrantyIcon /> },
      { id: 'products',     label: 'Productos',  icon: <ProductsIcon /> },
      { id: 'technicians',  label: 'Técnicos',   icon: <TechnicianIcon /> },
    ],
  },
];

export default function AdminSidebar({
  onNavigate,
  activeSection = 'dashboard',
  isOpen = false,
  onToggle,
}: AdminSidebarProps) {

  const handleClick = (id: string) => {
    if (onNavigate) onNavigate(id);
    if (onToggle && window.innerWidth <= 900) onToggle();
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Header */}
      <div className="admin-sidebar-header">
        <Link to="/" className="admin-sidebar-brand">SafeTech</Link>
        <span className="admin-sidebar-badge">Admin</span>
      </div>

      {/* Nav */}
      <nav className="admin-sidebar-nav">
        <ul>
          {navSections.map((section) => (
            <li key={section.label}>
              <div className="admin-sidebar-section-label">{section.label}</div>
              <ul>
                {section.items.map((item) => (
                  <li key={item.id}>
                    <button
                      className={`admin-sidebar-link ${activeSection === item.id ? 'active' : ''}`}
                      onClick={() => handleClick(item.id)}
                    >
                      <span className="admin-sidebar-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="admin-sidebar-footer">
        <Link to="/" className="admin-sidebar-link">
          <span className="admin-sidebar-icon"><BackIcon /></span>
          <span>Volver al sitio</span>
        </Link>
      </div>
    </aside>
  );
}
