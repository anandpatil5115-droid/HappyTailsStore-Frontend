import React from 'react';
import { createBrowserRouter, Navigate, RouterProvider, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import { useAuth } from './context/AuthContext';
import './index.css';

function RequireAdmin({ children }) {
  const { token, role } = useAuth();
  if (!token || role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function RootRedirect() {
  const { token, role } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    } else if (role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/products', { replace: true });
    }
  }, [token, role, navigate]);

  return null;
}

function App() {
  const router = createBrowserRouter([
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/admin/login',
      element: <AdminLoginPage />,
    },
    {
      path: '/admin/dashboard',
      element: (
        <RequireAdmin>
          <AdminDashboardPage />
        </RequireAdmin>
      ),
    },
    {
      path: '/register',
      element: <RegisterPage />,
    },
    {
      path: '/forgot-password',
      element: <ForgotPasswordPage />,
    },
    {
      path: '/products',
      element: <ProductsPage />,
    },
    {
      path: '/cart',
      element: <CartPage />,
    },
    {
      path: '/checkout',
      element: <CheckoutPage />,
    },
    {
      path: '/orders',
      element: <OrderHistoryPage />,
    },
    {
      path: '/',
      element: <RootRedirect />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;