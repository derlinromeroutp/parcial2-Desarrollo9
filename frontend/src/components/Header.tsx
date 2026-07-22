import { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from '../lib/auth';
import { Link } from "react-router-dom";
import { CartIcon } from "./CartIcon";
import { CartDrawer } from "./CartDrawer";
import { useCartStore } from "../store/cart.store";
import { useAdminCheck } from "./AdminRoute";
import { useWishlist } from "../hooks/useWishlist";
import { useCompareStore } from "../store/compare.store";

const CART_USER_KEY = 'safetech-cart-user';

export default function Header() {
  const { userId } = useAuth();
  const clearCart = useCartStore(state => state.clearCart);
  const { isAdmin, loading } = useAdminCheck();
  const { data: wishlistItems } = useWishlist();
  const compareCount = useCompareStore((s) => s.productIds.length);

  useEffect(() => {
    const storedUserId = localStorage.getItem(CART_USER_KEY);
    if (userId) {
      if (storedUserId && storedUserId !== userId) {
        clearCart();
      }
      localStorage.setItem(CART_USER_KEY, userId);
    }
  }, [userId, clearCart]);

  return (
    <header className="nav-header">
      <Link to="/" className="nav-brand">SafeTech</Link>

      <nav className="nav-actions">
        {!isAdmin && !loading && (
          <>
            <Link to="/wishlist" className="nav-link" style={{ position: 'relative' }} title="Mi lista de deseos">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              {wishlistItems && wishlistItems.length > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -6,
                  background: '#ef4444', color: '#fff', borderRadius: '50%',
                  width: 15, height: 15, fontSize: '.55rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link to="/compare" className="nav-link" style={{ position: 'relative' }} title="Comparar productos">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3v18M15 3v18M4 8h5m6 0h5M4 16h5m6 0h5" />
              </svg>
              {compareCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -6,
                  background: '#ef4444', color: '#fff', borderRadius: '50%',
                  width: 15, height: 15, fontSize: '.55rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {compareCount}
                </span>
              )}
            </Link>
            <CartIcon />
          </>
        )}

        <SignedIn>
          {isAdmin && (
            <Link to="/admin" className="nav-link">
              Admin
            </Link>
          )}

        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="btn-outline" style={{ fontSize: '0.78rem', padding: '6px 14px' }}>
              Iniciar Sesión
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </nav>

      <CartDrawer />
    </header>
  );
}
