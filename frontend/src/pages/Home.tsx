import { ProductList } from '../components/ProductList';
import { BestSellersSection } from '../components/BestSellersSection';
import { RecentlyViewedSection } from '../components/RecentlyViewedSection';

export default function Home() {
  return (
    <div>

      {/* Hero small del catálogo */}
      <section style={{
        padding: '4rem 0 3rem',
        background: 'var(--white)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div className="page-container">
          <p style={{
            fontSize: '0.65rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '2.5px',
            color: 'var(--gray)',
            marginBottom: '1rem',
            fontFamily: 'var(--font-sans)',
          }}>
            Tecnología reacondicionada
          </p>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 300,
            color: 'var(--ink)',
            lineHeight: 1.1,
            letterSpacing: '-0.025em',
            fontFamily: 'var(--font-display)',
          }}>
            Catálogo
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink2)', marginTop: '1rem', fontFamily: 'var(--font-sans)', maxWidth: 500, lineHeight: 1.6 }}>
            Cada dispositivo verifica 40+ puntos. Incluye garantía de 90 días.
          </p>
        </div>
      </section>

      <BestSellersSection />

      <RecentlyViewedSection />

      {/* Productos */}
      <section style={{ padding: '3rem 0 5rem', background: 'var(--white)' }}>
        <div className="page-container">
          <ProductList />
        </div>
      </section>
    </div>
  );
}