import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { getStoredToken } from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import { SuccessOverlay, FailureOverlay } from '../components/PaymentOverlays';

const PRIMARY = '#9b4500';
const PRIMARY_LIGHT = '#ff914d';
const CREAM = '#fcf9f4';
const BROWN = '#564339';
const MUTED = '#dcc1b4';
const API_BASE = 'http://localhost:8080';
const CARD_BG = '#ffffff';
const CARD_BORDER = '#e5e5e5';
const CARD_BORDER_LIGHT = '#f0ece6';
const GREEN_UP = '#22c55e';

export default function CheckoutPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentCancelled, setPaymentCancelled] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '123 Pet Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    zip: '400001',
    country: 'India',
  });
  const navigate = useNavigate();

  const token = getStoredToken();
  const { username: authUsername, role } = useAuth();
  const username = authUsername || 'Pet Parent';

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    fetchCart();
  }, [token, navigate]);

  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
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
      const res = await fetch(`${API_BASE}/api/payment/create-order`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
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
      const res = await fetch(`${API_BASE}/api/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ razorpayOrderId, razorpayPaymentId, razorpaySignature }),
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

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setPaymentProcessing(true);
    setError(null);
    setPaymentCancelled(false);
    setPaymentFailed(false);
    try {
      await loadRazorpayScript();
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
            setSuccessData({
              orderId: result.orderId,
              totalAmount: result.totalAmount,
              itemCount: cartCount,
              estimatedDeliveryDate: getEstimatedDeliveryDate(),
            });
            setCart(null);
            toast.success('Order placed successfully');
          } catch (verifyError) {
            console.error('Payment verification failed:', verifyError);
            setPaymentFailed(true);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentCancelled(true);
          },
        },
        theme: { color: PRIMARY },
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

  const subtotal = parseFloat(totalAmount()) || 0;
  const shippingFee = subtotal < 1000 ? 100 : 0;
  const remainingForFreeDelivery = subtotal < 1000 ? (1000 - subtotal) : 0;
  const finalTotal = () => (subtotal + shippingFee).toFixed(2);

  const itemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const getEstimatedDeliveryDate = () => {
    const date = new Date();
    let businessDays = 0;
    while (businessDays < 5) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 0 && day !== 6) businessDays++;
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const estimatedDeliveryDate = getEstimatedDeliveryDate();

  const btnPrimaryStyle = {
    padding: '12px 24px',
    background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_LIGHT})`,
    color: '#fff',
    border: 'none',
    borderRadius: 24,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(155,69,0,0.25)',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: CREAM, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(12px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Navbar */}
      <nav style={{
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
          {/* Cart Button */}
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
                gap: 6,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.25)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.15)'}
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
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Admin Dashboard
            </button>
          )}

          {/* Profile Dropdown */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              onClick={() => setShowProfile(!showProfile)}
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
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.25)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.15)'}
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

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: '#8a7a6d' }}>
          <button
            onClick={() => navigate('/cart')}
            style={{
              background: 'none',
              border: 'none',
              color: PRIMARY,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              padding: 0,
              textDecoration: 'underline'
            }}
          >
            Cart
          </button>
          <span style={{ color: MUTED }}>›</span>
          <span style={{ color: PRIMARY, fontWeight: 600 }}>Checkout</span>
          <span style={{ color: MUTED }}>›</span>
          <span style={{ color: '#8a7a6d' }}>Payment</span>
        </nav>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: BROWN, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div style={{ display: 'inline-block', width: 40, height: 40, border: '3px solid #f0ece6', borderTopColor: PRIMARY, borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }}></div>
            Loading cart...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#dc2626', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            {error}
          </div>
        ) : !cart || !cart.items || cart.items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: BROWN, background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
            <p style={{ fontSize: 18, marginBottom: 8 }}>Your cart is empty</p>
            <p style={{ fontSize: 13, color: '#8a7a6d', marginBottom: 20 }}>Add some products to your cart to proceed to checkout.</p>
            <button onClick={() => navigate('/products')} style={{
              ...btnPrimaryStyle,
              padding: '12px 32px',
              fontSize: 16,
              }}
              onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 16px rgba(155,69,0,0.4)'; }}
              onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 10px rgba(155,69,0,0.3)'; }}
            >
              Go to Products
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
            {/* Left Column - Order Items */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 22, fontWeight: 700, color: PRIMARY, margin: 0 }}>
                  Order Items
                </h2>
                <button
                  onClick={() => navigate('/cart')}
                  style={{ ...btnPrimaryStyle, padding: '8px 16px', fontSize: 12 }}
                >
                  ← Edit Cart
                </button>
              </div>

              <div style={{
                background: CARD_BG,
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: `1px solid ${CARD_BORDER_LIGHT}`
              }}>
                {(cart?.items || []).map((item, index) => (
                  <div
                    key={item.productId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '20px 24px',
                      animation: 'fadeInUp 0.5s ease forwards',
                      animationDelay: `${index * 100}ms`,
                      opacity: 0,
                      background: index % 2 === 0 ? CARD_BG : CREAM,
                    }}
                  >
                    {/* Product Image */}
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        style={{
                          width: 96,
                          height: 96,
                          objectFit: 'cover',
                          borderRadius: 12,
                          border: `1px solid ${CARD_BORDER}`,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 96,
                        height: 96,
                        background: CREAM,
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: MUTED,
                        fontSize: 28,
                        border: `1px solid ${CARD_BORDER}`
                      }}>
                        🐾
                      </div>
                    )}

                    {/* Product Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontSize: 18,
                        fontWeight: 600,
                        color: PRIMARY,
                        margin: 0,
                        marginBottom: 4
                      }}>
                        {item.productName}
                      </h3>
                      <p style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 13,
                        color: BROWN,
                        margin: '0 0 4px',
                      }}>
                        ₹{Number(item.price).toFixed(2)} each
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 13,
                        color: '#8a7a6d'
                      }}>
                        Qty: {item.quantity}
                      </div>
                    </div>

                    {/* Item Total */}
                    <div style={{ padding: '0 8px', minWidth: 100, textAlign: 'right' }}>
                      <p style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 16,
                        fontWeight: 700,
                        color: PRIMARY,
                        margin: 0
                      }}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Order Summary (sticky) */}
            <div style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
              <div style={{
                background: CARD_BG,
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                borderTop: `3px solid ${PRIMARY_LIGHT}`,
                border: `1px solid ${CARD_BORDER_LIGHT}`
              }}>
                <h3 style={{
                  margin: '0 0 20px',
                  fontFamily: "'Quicksand', sans-serif",
                  fontSize: 20,
                  fontWeight: 700,
                  color: BROWN
                }}>
                  Order Summary
                </h3>

                {/* Delivery Address */}
                <div style={{ marginBottom: 20 }}>
                  {!editingAddress ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: `${PRIMARY}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: 18 }}>🏠</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: 12, color: '#8a7a6d'
                        }}>
                          Deliver to
                        </p>
                        <p style={{
                          margin: '4px 0 0', fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: 13, color: BROWN, fontWeight: 600,
                          lineHeight: 1.4
                        }}>
                          {username} • {deliveryAddress.street}, {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zip}
                        </p>
                      </div>
                      <button
                        onClick={() => setEditingAddress(true)}
                        style={{
                          background: 'none', border: 'none', color: PRIMARY,
                          fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: 0,
                          textDecoration: 'underline'
                        }}
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 18 }}>🏠</span>
                        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: BROWN, fontWeight: 600 }}>Edit Address</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Street address"
                        value={deliveryAddress.street}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                        style={{
                          padding: '10px 14px', fontSize: 13, color: BROWN,
                          border: `1px solid ${CARD_BORDER}`, borderRadius: 10, background: '#fff',
                          outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <input
                          type="text"
                          placeholder="City"
                          value={deliveryAddress.city}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                          style={{
                            padding: '10px 14px', fontSize: 13, color: BROWN,
                            border: `1px solid ${CARD_BORDER}`, borderRadius: 10, background: '#fff',
                            outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={deliveryAddress.state}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                          style={{
                            padding: '10px 14px', fontSize: 13, color: BROWN,
                            border: `1px solid ${CARD_BORDER}`, borderRadius: 10, background: '#fff',
                            outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          value={deliveryAddress.zip}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zip: e.target.value })}
                          style={{
                            padding: '10px 14px', fontSize: 13, color: BROWN,
                            border: `1px solid ${CARD_BORDER}`, borderRadius: 10, background: '#fff',
                            outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Country"
                          value={deliveryAddress.country}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, country: e.target.value })}
                          style={{
                            padding: '10px 14px', fontSize: 13, color: BROWN,
                            border: `1px solid ${CARD_BORDER}`, borderRadius: 10, background: '#fff',
                            outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <button
                          onClick={() => setEditingAddress(false)}
                          style={{ ...btnPrimaryStyle, padding: '8px 16px', fontSize: 12 }}
                        >
                          Save Address
                        </button>
                        <button
                          onClick={() => setEditingAddress(false)}
                          style={{
                            padding: '8px 16px', background: 'transparent', color: '#8a7a6d',
                            border: `1px solid ${CARD_BORDER}`, borderRadius: 20, fontSize: 12,
                            fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: '#8a7a6d' }}>
                      <span>🧾</span>
                      Subtotal
                    </span>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: BROWN, fontWeight: 600 }}>₹{totalAmount()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: '#8a7a6d' }}>
                      <span>🚚</span>
                      Shipping
                    </span>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: BROWN, fontWeight: 600 }}>{shippingFee === 0 ? 'Free' : `₹${shippingFee.toFixed(2)}`}</span>
                  </div>
                  {remainingForFreeDelivery > 0 && (
                    <p style={{
                      margin: '8px 0 12px',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 12,
                      color: '#b45309',
                      textAlign: 'center',
                      fontStyle: 'italic',
                    }}>
                      Add ₹{remainingForFreeDelivery.toFixed(2)} more to get free delivery!
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: '#8a7a6d' }}>
                      <span>💰</span>
                      Tax
                    </span>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: BROWN, fontWeight: 600 }}>₹0.00</span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px dashed #f0ece6', margin: '12px 0' }} />
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    marginBottom: 12,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 12,
                    color: '#2e7d32',
                    background: '#e8f5e9',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontWeight: 600,
                  }}>
                    <span>📦</span>
                    <span>Estimated Delivery: {estimatedDeliveryDate}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 0, alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 18, fontWeight: 700, color: PRIMARY }}>
                      Total
                    </span>
                    <span style={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: 22,
                      fontWeight: 700,
                      color: PRIMARY
                    }}>
                      ₹{finalTotal()}
                    </span>
                  </div>
                </div>

                {error && <p style={{ color: '#dc2626', marginBottom: 16, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13 }}>{error}</p>}
                {paymentCancelled && (
                  <div style={{ backgroundColor: '#fef3c7', color: '#b45309', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    ⚠️ Payment cancelled. Your order has not been created — your cart is intact.
                  </div>
                )}

                <button
                  onClick={handleRazorpayPayment}
                  disabled={paymentProcessing || itemCount() === 0}
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_LIGHT})`,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 24,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: paymentProcessing || itemCount() === 0 ? 'not-allowed' : 'pointer',
                    opacity: paymentProcessing || itemCount() === 0 ? 0.7 : 1,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    boxShadow: '0 4px 10px rgba(155,69,0,0.3)',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                  onMouseEnter={(e) => {
                    if (!paymentProcessing && itemCount() > 0) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(155,69,0,0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!paymentProcessing && itemCount() > 0) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 10px rgba(155,69,0,0.3)';
                    }
                  }}
                >
                  {paymentProcessing ? (
                    <>
                      <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></span>
                      Processing...
                    </>
                  ) : 'Proceed to Payment'}
                </button>

                {/* Trust/Security Note */}
                <div style={{
                  marginTop: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 12,
                  color: '#8a7a6d'
                }}>
                  <span style={{ fontSize: 14 }}>🔒</span>
                  <span>Secure checkout powered by Razorpay</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {checkoutResult && successData && (
          <SuccessOverlay data={successData} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {paymentFailed && !checkoutResult && (
          <FailureOverlay
            onRetry={() => handleRazorpayPayment()}
            onBack={() => navigate('/cart')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
