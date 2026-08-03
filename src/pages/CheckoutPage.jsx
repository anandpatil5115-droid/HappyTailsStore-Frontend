import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PRIMARY = '#9b4500';
const PRIMARY_LIGHT = '#ff914d';
const CREAM = '#fcf9f4';
const BROWN = '#564339';
const MUTED = '#dcc1b4';
const API_BASE = 'http://localhost:8080';

export default function CheckoutPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentCancelled, setPaymentCancelled] = useState(false);
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

  const fetchCart = async () => {
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

  const createRazorpayOrder = async () => {
    try {
      const res = await fetch(API_BASE + '/api/payment/create-order', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create payment order');
      }
      return await res.json();
    } catch (err) {
      setError(err.message || 'Failed to create payment order');
      throw err;
    }
  };

  const verifyRazorpayPayment = async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    try {
      const res = await fetch(API_BASE + '/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Payment verification failed');
      }
      return await res.json();
    } catch (err) {
      setError(err.message || 'Payment verification failed');
      throw err;
    }
  };

  const handleRazorpayPayment = async () => {
    setPaymentProcessing(true);
    setError(null);
    setPaymentCancelled(false);
    try {
      const orderData = await createRazorpayOrder();
      const options = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency,
        order_id: orderData.razorpayOrderId,
        name: 'HappyTailsStore',
        description: 'Order Payment',
        handler: async function (razorpayResponse) {
          try {
            const result = await verifyRazorpayPayment(
              razorpayResponse.razorpay_order_id,
              razorpayResponse.razorpay_payment_id,
              razorpayResponse.razorpay_signature
            );
            setCheckoutResult(result);
            setCart(null);
          } catch (verifyError) {
            console.error('Payment verification failed:', verifyError);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentCancelled(true);
          },
        },
        theme: { color: '#9b4500' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Razorpay payment setup failed:', err);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const totalAmount = () => {
    if (!cart || !cart.items) return '0.00';
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  const itemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: CREAM, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
       <nav style={{ backgroundColor: PRIMARY, color: '#fff', padding: '12px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
        </div>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px' }}>
        {checkoutResult ? (
          <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 24, fontWeight: 700, color: PRIMARY, marginBottom: 16 }}>
              Order Confirmed!
            </h2>
            <p style={{ color: BROWN, marginBottom: 8 }}>Order ID: <strong>{checkoutResult.orderId}</strong></p>
            <p style={{ color: BROWN, marginBottom: 8 }}>Total: <strong>₹{checkoutResult.totalAmount.toFixed(2)}</strong></p>
            <p style={{ color: '#2e7d32', marginBottom: 24, fontWeight: 600 }}>
              Status: {checkoutResult.status}
            </p>
            <button onClick={() => navigate('/products')} style={{
              padding: '12px 32px', backgroundColor: PRIMARY, color: '#fff',
              border: 'none', borderRadius: 24, fontSize: 16, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>
              Continue Shopping
            </button>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: BROWN }}>Loading cart...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#dc2626' }}>{error}</div>
        ) : !cart || !cart.items || cart.items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: BROWN }}>
            <p style={{ fontSize: 18, marginBottom: 8 }}>🛒 Your cart is empty</p>
            <button onClick={() => navigate('/products')} style={{
              padding: '12px 24px', backgroundColor: PRIMARY, color: '#fff',
              border: 'none', borderRadius: 24, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>Go to Products</button>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 22, fontWeight: 700, color: PRIMARY, marginBottom: 20 }}>
              Checkout Summary
            </h1>

            <div style={{ marginBottom: 16 }}>
              {cart.items.map((item) => (
                <div key={item.productId} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid #f0ece6'
                }}>
                  <span style={{ color: BROWN, fontSize: 14 }}>{item.productName} x {item.quantity}</span>
                  <span style={{ color: PRIMARY, fontWeight: 600, fontSize: 14 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #f0ece6', paddingTop: 16, marginBottom: 24 }}>
              <span style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 18, fontWeight: 700, color: PRIMARY }}>Total: ₹{totalAmount()}</span>
            </div>

            {error && <p style={{ color: '#dc2626', marginBottom: 16 }}>{error}</p>}
            {paymentCancelled && (
              <div style={{ backgroundColor: '#fef3c7', color: '#b45309', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 14 }}>
                ⚠️ Payment cancelled. Your order has not been created — your cart is intact.
              </div>
            )}

            <button
              onClick={handleRazorpayPayment}
              disabled={paymentProcessing || itemCount() === 0}
              style={{
                width: '100%', padding: '14px 0', backgroundColor: PRIMARY,
                color: '#fff', border: 'none', borderRadius: 24, fontSize: 16,
                fontWeight: 600, cursor: paymentProcessing || itemCount() === 0 ? 'not-allowed' : 'pointer',
                opacity: paymentProcessing || itemCount() === 0 ? 0.7 : 1, fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: '0 4px 10px rgba(155,69,0,0.3)'
              }}
            >
              {paymentProcessing ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}