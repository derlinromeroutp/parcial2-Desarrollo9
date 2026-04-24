import { Routes, Route } from 'react-router-dom';
import { SignedIn } from '@clerk/clerk-react';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Orders from './pages/Orders';
import NewWarranty from './pages/NewWarranty';
import WarrantySuccess from './pages/WarrantySuccess';
import AdminDashboard from './pages/AdminDashboard';
import Success from './pages/Success';
import { ProtectedAdminRoute } from './components/AdminRoute';

function App() {
  return (
    <div>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/success" element={<Success />} />
          <Route
            path="/orders"
            element={
              <SignedIn>
                <Orders />
              </SignedIn>
            }
          />
          <Route
            path="/warranties/new"
            element={
              <SignedIn>
                <NewWarranty />
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
        </Routes>
      </main>
    </div>
  );
}

export default App;