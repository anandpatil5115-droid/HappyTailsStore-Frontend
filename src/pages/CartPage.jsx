import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getStoredToken } from '../utils/auth';
import { staggerContainer, staggerItem, EASE } from '../animations';

const PRIMARY = '#9b4500';
const PRIMARY_LIGHT = '#ff914d';
const CREAM = '#fcf9f4';
const BROWN = '#564339';
const MUTED = '#dcc1b4';
const BORDER = '#eadfce';
const API_BASE = 'http://localhost:8080';
const CARD_BG = '#ffffff';
const CARD_BORDER = '#e5e5e5';
const GREEN_UP = '#22c55e';

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [toast, setToast] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const { username, role } = useAuth();

  const token = getStoredToken();

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    fetchCart();
    fetchProducts();
  }, [token, navigate]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { navigate('/login', { replace: true }); return; }
      if (res.ok) {
        const data = await res.json();
        setCart(data);
        localStorage.setItem('cartData', JSON.stringify(data));
        const count = data?.items ? data.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        localStorage.setItem('cartCount', count);
      } else {
        const cached = localStorage.getItem('cartData');
        if (cached) {
          setCart(JSON.parse(cached));
        }
        setError('Failed to load cart');
      }
    } catch (err) {
      const cached = localStorage.getItem('cartData');
      if (cached) {
        setCart(JSON.parse(cached));
      }
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data || []);
      }
    } catch (err) {
      // ignore
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    setUpdating(productId);
    try {
      const res = await fetch(`${API_BASE}/api/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });
      if (res.ok) {
        const newData = await fetch(`${API_BASE}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json());
        setCart(newData);
        localStorage.setItem('cartData', JSON.stringify(newData));
        const count = newData?.items ? newData.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        localStorage.setItem('cartCount', count);
      } else {
        showToast('Failed to update quantity');
      }
    } catch (err) {
      showToast('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchCart();
        showToast('Removed from cart');
      } else {
        showToast('Failed to remove item');
      }
    } catch (err) {
      showToast('Failed to remove item');
    }
  };

  const goToCheckout = () => {
    navigate('/checkout');
  };

  const subtotal = (item) => {
    return (item.price * item.quantity).toFixed(2);
  };

  const totalAmount = () => {
    if (!cart || !cart.items) return '0.00';
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  const shippingFee = () => {
    const sub = cart?.items ? cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
    return sub < 1000 ? 100 : 0;
  };

  const grandTotal = () => {
    const sub = cart?.items ? cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
    return (sub + shippingFee()).toFixed(2);
  };

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Get related products (exclude items already in cart)
  const relatedProducts = products.filter(p =>
    !cart?.items?.some(item => item.productId === p.productId)
  ).slice(0, 3);

  // Touch targets need to be at least 44x44px
  const touchButtonStyle = {
    width: 44,
    height: 44,
    border: `1px solid ${MUTED}`,
    borderRadius: 20,
    background: '#fff',
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 600,
    color: BROWN,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div className="products-page" style={{ minHeight: '100vh', backgroundColor: CREAM, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <nav className="products-navbar" style={{
        backgroundColor: PRIMARY, color: '#fff', padding: '12px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div 
          onClick={() => navigate('/products')}
          style={{ 
            fontSize: '22px', fontFamily: "'Quicksand', sans-serif", fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          HappyTailsStore 🐾
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Cart Badge */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
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
                gap: 6
              }}
            >
              🛒 Cart
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -6,
                  right: -8,
                  backgroundColor: '#ff4444',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {role === 'ADMIN' && (
            <button
              onClick={() => navigate('/admin/dashboard')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3B82F6',
                color: '#fff',
                border: 'none',
                borderRadius: 20,
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => { e.target.style.backgroundColor = '#2563EB'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = '#3B82F6'; }}
            >
              Go to Admin Dashboard
            </button>
          )}

          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }}></div>

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
                gap: 6
              }}
            >
              👤 {username || 'Pet Parent'}
            </button>
            {showProfile && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 6,
                backgroundColor: '#fff',
                color: PRIMARY,
                borderRadius: 12,
                padding: '8px 16px',
                fontSize: 12,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600,
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                {username || 'Pet Parent'}
                <hr style={{ border: 'none', borderTop: '1px solid #f0ece6', margin: '4px 0' }} />
                <button
                  onClick={() => navigate('/orders')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: PRIMARY,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    textAlign: 'left',
                    padding: 0,
                    margin: 0,
                    width: '100%'
                  }}
                >
                  My Orders
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#fff',
              color: PRIMARY,
              border: 'none',
              borderRadius: '24px',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            ← Continue Shopping
          </button>
        </div>
      </nav>

      <div className="products-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
        <h1 style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: 28,
          fontWeight: 700,
          color: PRIMARY,
          marginBottom: 24,
          letterSpacing: '-0.01em',
          textAlign: 'center'
        }}>
          Your Cart
        </h1>

        {toast && (
          <div style={{
            position: 'fixed', top: 70, right: 32, backgroundColor: '#4caf50',
            color: '#fff', padding: '12px 24px', borderRadius: 12, fontSize: 14,
            fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 200
          }}>{toast}</div>
        )}

        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: 24,
            alignItems: 'start',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  background: '#fff', borderRadius: 16, padding: 20,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                  <div style={{
                    width: 120, height: 120, borderRadius: 12,
                    background: 'linear-gradient(90deg, #f0ece6 25%, #f8f5f2 50%, #f0ece6 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      width: '60%', height: 18, borderRadius: 6,
                      background: 'linear-gradient(90deg, #f0ece6 25%, #f8f5f2 50%, #f0ece6 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
                      marginBottom: 12,
                    }} />
                    <div style={{
                      width: '40%', height: 14, borderRadius: 6,
                      background: 'linear-gradient(90deg, #f0ece6 25%, #f8f5f2 50%, #f0ece6 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#dc2626', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {error}
          </div>
        ) : !cart || !cart.items || cart.items.length === 0 ? (
          // Empty Cart State
          <div style={{
            textAlign: 'center', padding: '80px 20px', color: BROWN,
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            <div style={{
              fontSize: 64, marginBottom: 24, opacity: 0.3
            }}>🛒</div>
            <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Your cart is empty</p>
            <p style={{ fontSize: 14, color: MUTED, marginBottom: 32, maxWidth: 480, margin: '0 auto 24px' }}>
              Let's find your pet something great! Browse our collection and discover the perfect treats, toys, or accessories.
            </p>
            <button
              onClick={() => navigate('/products')}
              style={{
                padding: '12px 28px', backgroundColor: PRIMARY, color: '#fff',
                border: 'none', borderRadius: 24, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 10px rgba(155,69,0,0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(155,69,0,0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 10px rgba(155,69,0,0.3)';
              }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
            {/* Cart Items */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              key={(cart.items || []).map(i => i.productId).join(',')}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              {(cart.items || []).map((item, index) => (
                <motion.div
                  key={item.productId}
                  variants={staggerItem}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="cart-item-card"
                  style={{
                    background: index % 2 === 0 ? CARD_BG : '#ffffff',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    transformOrigin: 'center',
                  }}
                >
                  {item.productImage ? (
                    <img src={item.productImage} alt={item.productName} style={{ width: 120, height: 120, objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: 120,
                      height: 120,
                      background: '#f8f5f2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: MUTED,
                      fontSize: 14,
                      fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}>
                      🐾
                    </div>
                  )}
                  <div style={{ padding: 20, flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: 18,
                      fontWeight: 600,
                      color: PRIMARY,
                      margin: 0,
                      marginBottom: 4,
                      lineHeight: 1.3
                    }}>
                      {item.productName}
                    </h3>
                    <p style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 13,
                      color: BROWN,
                      margin: 0,
                      marginBottom: 12
                    }}>
                      ₹{item.price.toFixed(2)} each
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <button
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        disabled={updating === item.productId}
                        style={{
                          ...touchButtonStyle,
                          transition: 'all 0.2s ease',
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = `${PRIMARY}10`;
                          e.target.style.borderColor = PRIMARY;
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = '#fff';
                          e.target.style.borderColor = MUTED;
                        }}
                        onMouseDown={(e) => { e.target.style.transform = 'scale(0.95)'; }}
                        onMouseUp={(e) => { e.target.style.transform = 'scale(1)'; }}
                      >
                        −
                      </button>
                      <span style={{
                        minWidth: 32,
                        textAlign: 'center',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                        color: BROWN
                      }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={updating === item.productId}
                        style={{
                          ...touchButtonStyle,
                          transition: 'all 0.2s ease',
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = `${PRIMARY}10`;
                          e.target.style.borderColor = PRIMARY;
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = '#fff';
                          e.target.style.borderColor = MUTED;
                        }}
                        onMouseDown={(e) => { e.target.style.transform = 'scale(0.95)'; }}
                        onMouseUp={(e) => { e.target.style.transform = 'scale(1)'; }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      style={{
                        padding: '8px 14px',
                        border: `1px solid ${MUTED}`,
                        background: 'transparent',
                        color: '#dc2626',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        transition: 'all 0.2s ease',
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = '#fef2f2';
                        e.target.style.borderColor = '#fecaca';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.borderColor = MUTED;
                      }}
                    >
                      Remove Item
                    </button>
                  </div>
                  <div style={{ padding: '0 20px', minWidth: 100, textAlign: 'right' }}>
                    <p style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 16,
                      fontWeight: 700,
                      color: PRIMARY,
                      margin: 0
                    }}>
                      ₹{subtotal(item)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Order Summary */}
            <div style={{
              background: CARD_BG,
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: 'fit-content',
              borderTop: `3px solid ${PRIMARY_LIGHT}`,
            }} id="order-summary">
              <h3 style={{
                margin: '0 0 20px',
                fontFamily: "'Quicksand', sans-serif",
                fontSize: 20,
                fontWeight: 700,
                color: BROWN
              }}>
                Order Summary
              </h3>
              <div style={{ marginBottom: 16 }}>
                {/* Subtotal Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: '#8a7a6d' }}>
                    <span>🧾</span>
                    Subtotal
                  </span>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: BROWN, fontWeight: 600 }}>₹{totalAmount()}</span>
                </div>
                {/* Shipping Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: '#8a7a6d' }}>
                    <span>🚚</span>
                    Shipping
                    {shippingFee() > 0 && (
                      <span style={{ fontSize: 10, color: '#b45309', background: '#fef3c7', padding: '1px 6px', borderRadius: 6, fontWeight: 600 }}>
                        Orders under ₹1,000
                      </span>
                    )}
                  </span>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: shippingFee() === 0 ? GREEN_UP : BROWN, fontWeight: 600 }}>
                    {shippingFee() === 0 ? 'Free' : `₹${shippingFee().toFixed(2)}`}
                  </span>
                </div>
                {/* Tax Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: '#8a7a6d' }}>
                    <span>💰</span>
                    Tax
                  </span>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: BROWN, fontWeight: 600 }}>₹0.00</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px dashed #f0ece6', margin: '12px 0' }} />
                {/* Total Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 18, fontWeight: 700, color: PRIMARY }}>Total</span>
                  <span style={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: PRIMARY,
                    transition: 'all 0.3s ease'
                  }}>
                    ₹{grandTotal()}
                  </span>
                </div>
              </div>
              <button
                onClick={goToCheckout}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_LIGHT})`,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 24,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: '0 4px 10px rgba(155,69,0,0.3)',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}

        {/* Continue Shopping Suggestion */}
        {!loading && !error && cart && cart.items && cart.items.length > 0 && relatedProducts.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h2 style={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: PRIMARY,
              marginBottom: 20,
              textAlign: 'left'
            }}>
              You Might Also Like
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 20
            }}>
              {relatedProducts.map((product, index) => (
                <div
                  key={product.productId}
                  onClick={() => navigate('/product/' + product.productId)}
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'fadeInUp 0.5s ease forwards',
                    animationDelay: `${(index + 1) * 100}ms`,
                    opacity: 0,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                  }}
                >
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: 200,
                        objectFit: 'contain',
                        backgroundColor: '#f8f5f2'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: 200,
                      background: '#f8f5f2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: MUTED,
                      fontSize: 14
                    }}>
                      🐾
                    </div>
                  )}
                  <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: 16,
                      fontWeight: 600,
                      color: PRIMARY,
                      margin: 0,
                      marginBottom: 8,
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.name}
                    </h3>
                    <p style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 13,
                      color: BROWN,
                      lineHeight: 1.5,
                      margin: 0,
                      marginBottom: 12,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flex: 1
                    }}>
                      {product.description || ''}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto'
                    }}>
                      <span style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 18,
                        fontWeight: 700,
                        color: PRIMARY
                      }}>
                        ₹{product.price != null ? product.price.toFixed(2) : '—'}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        style={{
                          padding: '8px 16px',
                          border: `2px solid ${PRIMARY}`,
                          background: 'transparent',
                          color: PRIMARY,
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = `${PRIMARY}10`;
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = 'transparent';
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes skeleton-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* Focus states for accessibility */
        .cart-item-card:focus-within {
          outline: 2px solid ${PRIMARY};
          outline-offset: 2px;
        }

        /* Hover effects for cart item cards */
        .cart-item-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        }

        /* Responsive design */
        @media (max-width: 1024px) {
          .products-container {
            padding: 24px 24px 48px;
          }

          /* Stack Order Summary below cart items on tablet */
          @media (min-width: 768px) {
            .products-container > div > div:first-child {
              /* This targets the grid parent */
            }
          }
        }

        @media (max-width: 768px) {
          .products-container {
            padding: 16px;
          }

          /* For mobile, we need to stack the grid differently */
          .products-container > div > div:first-child > .cart-item-card,
          .products-container > div > div:first-child > div,
          .products-container > div > div:first-child > div > * {
            /* Mobile overrides will be handled inline via JS detection */
          }

          h1 {
            fontSize: 24px !important;
          }
        }

        @media (max-width: 480px) {
          .products-container {
            padding: 12px;
          }

          h1 {
            fontSize: 22px !important;
          }

          /* Reduce gaps on mobile */
          .cart-item-card {
            padding: 0 !important;
          }
        }

        @media (max-width: 360px) {
          .products-container {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
}
