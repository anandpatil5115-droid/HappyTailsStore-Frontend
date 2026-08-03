import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PRIMARY = '#9b4500';
const PRIMARY_LIGHT = '#ff914d';
const CREAM = '#fcf9f4';
const BROWN = '#564339';
const MUTED = '#dcc1b4';
const API_BASE = 'http://localhost:8080';

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [toast, setToast] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Pet Parent';

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    fetchCart();
  }, [token, navigate]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE + '/api/cart', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (res.status === 401) { navigate('/login', { replace: true }); return; }
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      } else {
        setError('Failed to load cart');
      }
    } catch (err) {
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    setUpdating(productId);
    try {
      const res = await fetch(API_BASE + '/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });
      if (res.ok) {
        fetchCart();
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
      const res = await fetch(API_BASE + '/api/cart/remove/' + productId, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: CREAM, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <nav style={{ backgroundColor: PRIMARY, color: '#fff', padding: '12px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div 
          onClick={() => navigate('/products')}
          style={{ 
            fontSize: '22px', 
            fontFamily: "'Quicksand', sans-serif", 
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          HappyTailsStore 🐾
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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
              👤 {username}
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
                {username}
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
          <button onClick={() => navigate('/products')} style={{
            padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.15)', border: 'none',
            color: '#fff', borderRadius: 20, fontSize: 14, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>← Continue Shopping</button>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px' }}>
        <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 28, fontWeight: 700, color: PRIMARY, marginBottom: 24, textAlign: 'center' }}>
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
          <div style={{ textAlign: 'center', padding: 40, color: BROWN }}>Loading cart...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#dc2626' }}>{error}</div>
        ) : !cart || !cart.items || cart.items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: BROWN, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <p style={{ fontSize: 18, marginBottom: 8 }}>🛒 Your cart is empty</p>
            <p style={{ fontSize: 14, color: MUTED, marginBottom: 24 }}>Add some products to get started</p>
            <button onClick={() => navigate('/products')} style={{
              padding: '12px 24px', backgroundColor: PRIMARY, color: '#fff',
              border: 'none', borderRadius: 24, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>Browse Products</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cart.items.map((item) => (
              <div key={item.productId} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: '#fff', borderRadius: 16, padding: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                {item.productImage ? (
                  <img src={item.productImage} alt={item.productName} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12 }} />
                ) : (
                  <div style={{ width: 80, height: 80, background: '#f0ece6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, fontSize: 12 }}>
                    No Image
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 16, fontWeight: 700, color: PRIMARY, margin: 0 }}>{item.productName}</h3>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: BROWN, margin: 0, marginTop: 4 }}>₹{item.price.toFixed(2)} each</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))} disabled={updating === item.productId} style={{
                    width: 32, height: 32, border: '1px solid #ddd', borderRadius: 8,
                    background: '#fff', cursor: 'pointer', fontSize: 14
                  }}>−</button>
                  <span style={{ minWidth: 32, textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14 }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={updating === item.productId} style={{
                    width: 32, height: 32, border: '1px solid #ddd', borderRadius: 8,
                    background: '#fff', cursor: 'pointer', fontSize: 14
                  }}>+</button>
                </div>
                <div style={{ minWidth: 80, textAlign: 'right' }}>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 700, color: PRIMARY, margin: 0 }}>
                    ₹{subtotal(item)}
                  </p>
                  <button onClick={() => removeItem(item.productId)} style={{
                    marginTop: 6, padding: '4px 8px', background: 'transparent',
                    border: 'none', color: '#dc2626', fontSize: 11, cursor: 'pointer',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}>Remove</button>
                </div>
              </div>
            ))}

            <div style={{ borderTop: '2px solid #f0ece6', paddingTop: 16, marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: BROWN }}>Total:</span>
                <span style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 24, fontWeight: 700, color: PRIMARY }}>₹{totalAmount()}</span>
              </div>
            </div>

            <button onClick={goToCheckout} style={{
              width: '100%', padding: '14px 0', backgroundColor: PRIMARY,
              color: '#fff', border: 'none', borderRadius: 24, fontSize: 16,
              fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
              marginTop: 8, boxShadow: '0 4px 10px rgba(155,69,0,0.3)'
            }}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
