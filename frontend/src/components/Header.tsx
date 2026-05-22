import { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from '../lib/auth';
import { Link } from "react-router-dom";
import { CartIcon } from "./CartIcon";
import { CartDrawer } from "./CartDrawer";
import { useCartStore } from "../store/cart.store";
import { useAdminCheck } from "./AdminRoute";

const CART_USER_KEY = 'safetech-cart-user';

export default function Header() {
  const { userId } = useAuth();
  const clearCart = useCartStore(state => state.clearCart);
  const { isAdmin, loading } = useAdminCheck();

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
        {!isAdmin && !loading && <CartIcon />}

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
