import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getStoredToken } from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../utils/api';

const PRIMARY = '#9b4500';
const PRIMARY_LIGHT = '#ff914d';
const CREAM = '#fcf9f4';
const BROWN = '#564339';
const MUTED = '#dcc1b4';
const CARD_BG = '#ffffff';
const CARD_BORDER = '#e5e5e5';

const SkeletonCard = () => (
  <div style={{
    borderRadius: 12,
    background: 'linear-gradient(90deg, #f0ece6 25%, #f8f5f2 50%, #f0ece6 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
    height: 160,
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  }} />
);

export default function WishlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const token = getStoredToken();
  const { username: authUsername, logout: authLogout } = useAuth();
  const username = authUsername || 'Pet Parent';

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    fetchWishlistProducts();
    fetchCart();
  }, [token, navigate]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const wishlistIds = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('wishlist') || '[]');
    } catch {
      return [];
    }
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const count = data.items ? data.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        setCartCount(count);
        localStorage.setItem('cartCount', count);
      }
    } catch (err) {
      const stored = localStorage.getItem('cartCount');
      if (stored) setCartCount(Number(stored));
    }
  };

  const fetchWishlistProducts = async () => {
    if (wishlistIds.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { navigate('/login', { replace: true }); return; }
      const data = await res.json();
      setProducts(data.filter(p => wishlistIds.includes(p.productId)));
    } catch (err) {
      setError('Failed to load wishlist products');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = (productId) => {
    const current = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const updated = current.filter(id => id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setProducts(products.filter(p => p.productId !== productId));
    showToast('Removed from wishlist');
  };

  const addToCart = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.ok) {
        fetchCart();
        showToast('Added to cart');
      }
    } catch (err) {
      showToast('Failed to add to cart');
    }
  };

  const logout = async () => {
    await authLogout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="products-page" style={{ minHeight: '100vh', backgroundColor: CREAM, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @keyframes skeleton-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @media (max-width: 1200px) { .products-container { max-width: 100%; padding: 24px; } }
        @media (max-width: 768px) { .products-container { padding: 16px; } }
      `}</style>

      {/* Navbar */}
      <nav style={{ backgroundColor: PRIMARY, color: '#fff', padding: '12px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div 
          onClick={() => navigate('/products')}
          style={{ fontSize: '22px', fontFamily: "'Quicksand', sans-serif", fontWeight: '700', letterSpacing: '-0.02em', cursor: 'pointer' }}
        >
          HappyTailsStore 🐾
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigate('/cart')}
            style={{
              position: 'relative',
              padding: '8px 16px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#fff',
              border: 'none',
              borderRadius: 20,
              cursor: 'pointer',
              fontSize: 14,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s ease',
            }}
          >
            🛒 Cart
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -8,
                backgroundColor: '#ff4444', color: '#fff',
                fontSize: 10, fontWeight: 700,
                borderRadius: '50%', width: 20, height: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {cartCount}
              </span>
            )}
          </button>

          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowProfile(!showProfile); }}
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: 'none',
                borderRadius: 20,
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s ease',
              }}
            >
              👤 {username}
            </button>
            {showProfile && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 6,
                backgroundColor: '#fff', color: PRIMARY,
                borderRadius: 12, padding: '8px 16px', fontSize: 12,
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600,
                whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex', flexDirection: 'column', gap: 8
              }}>
                {username}
                <hr style={{ border: 'none', borderTop: '1px solid #f0ece6', margin: '4px 0' }} />
                <button 
                  onClick={() => navigate('/orders')}
                  style={{
                    background: 'none', border: 'none', color: PRIMARY,
                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: 'left',
                    padding: 0, margin: 0, width: '100%'
                  }}
                >
                  My Orders
                </button>
                <button
                  onClick={() => navigate('/wishlist')}
                  style={{
                    background: 'none', border: 'none', color: PRIMARY,
                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: 'left',
                    padding: 0, margin: 0, width: '100%'
                  }}
                >
                  My Wishlist
                </button>
                <button
                  onClick={logout}
                  style={{
                    background: 'none', border: 'none', color: '#dc2626',
                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: 'left',
                    padding: 0, margin: 0, width: '100%'
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '10px 20px', backgroundColor: '#fff', color: PRIMARY,
              border: 'none', borderRadius: '24px', fontSize: '14px', fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: 'pointer',
              transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            ← Continue Shopping
          </button>
        </div>
      </nav>

      {toast && (
        <div style={{
          position: 'fixed', top: 70, right: 32, backgroundColor: '#4caf50',
          color: '#fff', padding: '12px 24px', borderRadius: 12, fontSize: 14,
          fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 200
        }}>{toast}</div>
      )}

      {/* Breadcrumb */}
      <div style={{
        maxWidth: '1400px', margin: '0 auto', padding: '16px 32px 0',
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: '#8a7a6d'
      }}>
        <Link to="/products" style={{ color: PRIMARY, textDecoration: 'none', fontWeight: 600 }}>Home</Link>
        <span>›</span>
        <span style={{ color: BROWN, fontWeight: 600 }}>My Wishlist</span>
      </div>

      <div className="products-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        <h1 style={{
          fontFamily: "'Quicksand', sans-serif", fontSize: 28, fontWeight: 700,
          color: PRIMARY, marginBottom: 24, textAlign: 'center'
        }}>
          My Wishlist
        </h1>

        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 20
          }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#dc2626', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{error}</div>
        ) : products.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", color: BROWN }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>♡</div>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Your wishlist is empty</p>
            <p style={{ fontSize: 14, color: MUTED, marginBottom: 24 }}>Save items you love to easily find them later.</p>
            <button
              onClick={() => navigate('/products')}
              style={{
                padding: '12px 28px', backgroundColor: PRIMARY, color: '#fff',
                border: 'none', borderRadius: 24, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: 'all 0.2s ease', boxShadow: '0 4px 10px rgba(155,69,0,0.3)'
              }}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 20
          }}>
            {products.map((product) => (
              <div key={product.productId} style={{
                background: CARD_BG, borderRadius: 12, overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.2s ease', height: '100%',
                display: 'flex', flexDirection: 'column', position: 'relative',
              }}>
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: 120, background: '#f8f5f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, fontSize: 14 }}>
                    🐾
                  </div>
                )}
                <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{
                    fontFamily: "'Quicksand', sans-serif", fontSize: 16, fontWeight: 600,
                    color: PRIMARY, margin: 0, marginBottom: 4,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {product.name}
                  </h3>
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700,
                    color: PRIMARY, marginBottom: 'auto'
                  }}>
                    ₹{product.price != null ? product.price.toFixed(2) : '—'}
                  </span>
                </div>
                <div style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => addToCart(product.productId)}
                    style={{
                      flex: 1, padding: '8px',
                      backgroundColor: PRIMARY, color: '#fff',
                      border: 'none', borderRadius: 16,
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(product.productId)}
                    style={{
                      flex: 1, padding: '8px',
                      background: 'transparent', color: '#dc2626',
                      border: `1px solid #fecaca`, borderRadius: 16,
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
