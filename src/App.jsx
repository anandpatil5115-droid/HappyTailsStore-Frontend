import React from 'react';
import { createBrowserRouter, Navigate, RouterProvider, useNavigate } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import WishlistPage from './pages/WishlistPage';
import NotFoundPage from './pages/NotFoundPage';
import PageTransition from './components/PageTransition';
import { useAuth } from './context/AuthContext';
import { SuccessOverlay } from './components/PaymentOverlays';
import './index.css';

function RequireAdmin({ children }) {
  const { token, role } = useAuth();
  if (!token || role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

// Admins are confined to the admin console — any store-facing route
// (products, cart, orders, customer login, etc.) redirects them to the dashboard.
function CustomerArea({ children }) {
  const { token, role } = useAuth();
  if (token && role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
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
      element: <PageTransition />,
      children: [
        {
          path: '/login',
          element: (
            <CustomerArea>
              <LoginPage />
            </CustomerArea>
          ),
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
          element: (
            <CustomerArea>
              <RegisterPage />
            </CustomerArea>
          ),
        },
        {
          path: '/forgot-password',
          element: (
            <CustomerArea>
              <ForgotPasswordPage />
            </CustomerArea>
          ),
        },
        {
          path: '/products',
          element: (
            <CustomerArea>
              <ProductsPage />
            </CustomerArea>
          ),
        },
        {
          path: '/cart',
          element: (
            <CustomerArea>
              <CartPage />
            </CustomerArea>
          ),
        },
        {
          path: '/checkout',
          element: (
            <CustomerArea>
              <CheckoutPage />
            </CustomerArea>
          ),
        },
        {
          path: '/orders',
          element: (
            <CustomerArea>
              <OrderHistoryPage />
            </CustomerArea>
          ),
        },
        {
          path: '/wishlist',
          element: (
            <CustomerArea>
              <WishlistPage />
            </CustomerArea>
          ),
        },
        {
          path: '/preview-success',
          element: (
            <SuccessOverlay
              data={{
                orderId: 'a1b2c3d4',
                totalAmount: 2759.0,
                itemCount: 3,
                estimatedDeliveryDate: new Date().toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric',
                }),
              }}
            />
          ),
        },
        {
          path: '*',
          element: <NotFoundPage />,
        },
        {
          path: '/',
          element: <RootRedirect />,
        },
      ],
    },
  ]);

  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  );
}

export default App;