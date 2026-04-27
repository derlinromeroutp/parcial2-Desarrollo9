import { Routes, Route } from 'react-router-dom';
import { SignedIn } from '@clerk/clerk-react';
import Header from './components/Header';
import NavMenu from './components/ui/menu-hover-effects';
import Home from './pages/Home';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';
import NewWarranty from './pages/NewWarranty';
import WarrantySuccess from './pages/WarrantySuccess';
import AdminDashboard from './pages/AdminDashboard';
import Success from './pages/Success';
import ProductPage from './pages/ProductPage';
import ProductDetail from './pages/ProductDetail';
import Nosotros from './pages/Nosotros';
import Contacto from './pages/Contacto';
import MyWarranties from './pages/MyWarranties';
import { ProtectedAdminRoute, ProtectedTechnicianRoute } from './components/AdminRoute';
import TechnicianDashboard from './pages/TechnicianDashboard';

// Layout with NavMenu for all public pages
function WithNav({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-main">
      <NavMenu />
      {children}
    </div>
  );
}

function App() {
  return (
    <div>
      <Header />
      <main>
        <Routes>
          <Route path="/"              element={<Landing />} />
          <Route path="/home"          element={<WithNav><Home /></WithNav>} />
          <Route path="/nosotros"      element={<WithNav><Nosotros /></WithNav>} />
          <Route path="/contacto"      element={<WithNav><Contacto /></WithNav>} />
          <Route path="/product/:id"   element={<WithNav><ProductDetail /></WithNav>} />
          <Route path="/product"       element={<WithNav><ProductPage /></WithNav>} />
          <Route path="/login"         element={<div className="page-main"><Login /></div>} />
          <Route path="/success"       element={<Success />} />
          <Route path="/checkout"      element={<WithNav><Checkout /></WithNav>} />
          <Route
            path="/orders"
            element={
              <WithNav><Orders /></WithNav>
            }
          />
          <Route
            path="/mis-garantias"
            element={<WithNav><MyWarranties /></WithNav>}
          />
          <Route
            path="/warranties/new"
            element={
              <SignedIn>
                <WithNav><NewWarranty /></WithNav>
              </SignedIn>
            }
          />
          <Route
            path="/warranties/success"
            element={
              <SignedIn>
                <WarrantySuccess />
              </SignedIn>
            }
          />
          <Route
            path="/admin"
            element={
              <SignedIn>
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              </SignedIn>
            }
          />
          <Route
            path="/technician"
            element={
              <SignedIn>
                <ProtectedTechnicianRoute>
                  <TechnicianDashboard />
                </ProtectedTechnicianRoute>
              </SignedIn>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
