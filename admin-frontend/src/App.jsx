import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Customers from './pages/Customers.jsx';
import Carts from './pages/Carts.jsx';
import CustomerDetail from './pages/CustomerDetail.jsx';
import Products from './pages/Products.jsx';
import Profile from './pages/Profile.jsx';
import { PageTransition } from './components/motion/PageTransition.jsx';

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageTransition locationKey="login"><Login /></PageTransition>} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PageTransition locationKey="dashboard"><Dashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <PageTransition locationKey="orders"><Orders /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/carts"
          element={
            <ProtectedRoute>
              <PageTransition locationKey="carts"><Carts /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <PageTransition locationKey="order-detail"><OrderDetail /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <PageTransition locationKey="customers"><Customers /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <ProtectedRoute>
              <PageTransition locationKey="customer-detail"><CustomerDetail /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <PageTransition locationKey="products"><Products /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PageTransition locationKey="profile"><Profile /></PageTransition>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}
