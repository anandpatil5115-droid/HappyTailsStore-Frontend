import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoredToken } from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import { staggerContainer, staggerItem, EASE } from '../animations';
import { API_BASE } from '../utils/api';

const PRIMARY = '#9b4500';
const PRIMARY_LIGHT = '#ff914d';
const CREAM = '#fcf9f4';
const BROWN = '#564339';
const MUTED = '#dcc1b4';
const PAGE_SIZE = 4;

const PLACEHOLDER_IMG =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="#f8f5f2"/><text x="300" y="290" font-size="90" text-anchor="middle">🐾</text><text x="300" y="350" font-size="22" fill="#dcc1b4" text-anchor="middle" font-family="sans-serif">HappyTailsStore</text></svg>`
  );

const STATUS_STYLES = {
  SUCCESS: { bg: '#e8f5e9', color: '#2e7d32', label: 'Success', icon: '✓' },
  PENDING: { bg: '#fef3c7', color: '#b45309', label: 'Pending', icon: '⏳' },
  FAILED: { bg: '#fdecec', color: '#b91c1c', label: 'Failed', icon: '✕' },
};

const TRACK_STEPS = ['Order placed', 'Processing', 'Shipped', 'Delivered'];

function StarRow({ value, onChange, size = 18 }) {
  const [hover, setHover] = useState(0);
  const active = onChange ? (hover || value) : value;
  return (
    <div style={{ display: 'inline-flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange && onChange(star)}
          style={{
            fontSize: size,
            cursor: onChange ? 'pointer' : 'default',
            color: star <= active ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.15s ease',
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function OrderHistoryPage() {
  const [orderHistory, setOrderHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrders, setExpandedOrders] = useState(() => new Set());
  const [copiedId, setCopiedId] = useState(null);
  const [reorderBusy, setReorderBusy] = useState(null);
  const [review, setReview] = useState(null); // { orderId, productId, name }
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const navigate = useNavigate();
  const { username: authUsername, role, logout: authLogout } = useAuth();
  const username = authUsername || 'Pet Parent';
  const isAdmin = role === 'ADMIN';
  const token = getStoredToken();

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    fetchOrderHistory();
    fetchCart();
  }, [token, navigate]);

  useEffect(() => {
    if (!showProfile) return;
    const close = () => setShowProfile(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [showProfile]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

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
      } else {
        const stored = localStorage.getItem('cartCount');
        if (stored) setCartCount(Number(stored));
      }
    } catch (err) {
      const stored = localStorage.getItem('cartCount');
      if (stored) setCartCount(Number(stored));
    }
  };

  const fetchOrderHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE + '/api/orders/history', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (res.status === 401) { navigate('/login', { replace: true }); return; }
      if (res.ok) {
        const data = await res.json();
        setOrderHistory(data);
      } else {
        const errData = await res.json();
        setError(errData.message || 'Failed to load order history');
      }
    } catch (err) {
      setError('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Group items by order, dropping test/dummy products so real users only see real items.
  const orderGroups = useMemo(() => {
    if (!orderHistory?.orders?.products) return [];
    const map = new Map();
    orderHistory.orders.products.forEach((item) => {
      if (!item.name || /test/i.test(item.name.trim())) return;
      if (!map.has(item.orderId)) {
        map.set(item.orderId, {
          orderId: item.orderId,
          orderDate: item.orderDate,
          status: item.orderStatus,
          items: [],
        });
      }
      map.get(item.orderId).items.push(item);
    });
    return [...map.values()].filter((g) => g.items.length > 0);
  }, [orderHistory]);

  // Newest-first base ordering, used both for display and stable "Order #N" numbering.
  const sortedGroups = useMemo(() => {
    return orderGroups
      .map((g) => ({
        ...g,
        total: g.items.reduce((sum, i) => sum + (Number(i.totalPrice) || 0), 0),
      }))
      .sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0));
  }, [orderGroups]);

  const friendlyNumbers = useMemo(() => {
    const m = new Map();
    sortedGroups.forEach((g, i) => m.set(g.orderId, i + 1));
    return m;
  }, [sortedGroups]);

  const filteredGroups = useMemo(() => {
    let arr = [...sortedGroups];
    if (statusFilter !== 'ALL') {
      arr = arr.filter((g) => (g.status || 'SUCCESS').toUpperCase() === statusFilter);
    }
    if (sortOrder === 'oldest') arr.reverse();
    return arr;
  }, [sortedGroups, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageOrders = filteredGroups.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggleTrack = (orderId) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const copyOrderId = async (orderId) => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedId(orderId);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) { /* clipboard unavailable */ }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const res = await fetch(API_BASE + '/api/orders/' + orderId + '/invoice', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed to download invoice');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'invoice-' + orderId.substring(0, 8) + '.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      showToast('Failed to download invoice');
    }
  };

  const reorder = async (group) => {
    setReorderBusy(group.orderId);
    let added = 0;
    for (const item of group.items) {
      if (item.productId == null) continue;
      try {
        const res = await fetch(`${API_BASE}/api/cart/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId: item.productId, quantity: item.quantity || 1 }),
        });
        if (res.ok) added++;
      } catch (err) { /* skip failed item */ }
    }
    setReorderBusy(null);
    if (added > 0) {
      fetchCart();
      showToast(`Added ${added} item${added > 1 ? 's' : ''} to cart`);
    } else {
      showToast('Could not re-add items to cart');
    }
  };

  const openReview = (orderId, productId, name) => {
    setReview({ orderId, productId, name });
    setReviewRating(0);
    setReviewText('');
  };

  const submitReview = async () => {
    if (!review || reviewRating < 1) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          productId: review.productId,
          orderId: review.orderId,
          rating: reviewRating,
          comment: reviewText,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to submit review');
      setReview(null);
      showToast('Thanks for your review!');
      fetchOrderHistory();
    } catch (err) {
      showToast(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const logout = async () => {
    await authLogout();
    navigate('/login', { replace: true });
  };

  const handleImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = PLACEHOLDER_IMG;
  };

  const dropdownItemStyle = {
    padding: '9px 12px', borderRadius: 10, background: 'transparent', border: 'none',
    textAlign: 'left', fontSize: 13, color: BROWN, cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 8,
  };

  const statusStyle = (status) => STATUS_STYLES[(status || 'SUCCESS').toUpperCase()] || { bg: '#f0ece6', color: '#7c6a5d', label: status || 'Unknown', icon: '•' };

  const stepIndex = (status) => {
    const st = (status || '').toUpperCase();
    if (st === 'SUCCESS') return 4;
    if (st === 'FAILED') return 1;
    return 1; // PENDING / others → order placed
  };

  const statusCounts = useMemo(() => {
    const counts = { ALL: sortedGroups.length, SUCCESS: 0, PENDING: 0, FAILED: 0 };
    sortedGroups.forEach((g) => {
      const st = (g.status || 'SUCCESS').toUpperCase();
      if (counts[st] != null) counts[st]++;
    });
    return counts;
  }, [sortedGroups]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: CREAM, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <nav style={{
        backgroundColor: PRIMARY, color: '#fff', padding: '10px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div
          onClick={() => navigate('/products')}
          style={{
            fontSize: '21px', fontFamily: "'Quicksand', sans-serif", fontWeight: '700',
            letterSpacing: '-0.02em', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          HappyTailsStore 🐾
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.button
            onClick={() => navigate('/cart')}
            whileTap={{ scale: 0.96 }}
            style={{
              position: 'relative', width: 40, height: 40, borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.16)', color: '#fff', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
            }}
            aria-label="Cart"
          >
            🛒
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -3, right: -3, backgroundColor: '#ff4444', color: '#fff',
                fontSize: 10, fontWeight: 700, borderRadius: '50%', minWidth: 18, height: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
              }}>
                {cartCount}
              </span>
            )}
          </motion.button>

          <motion.button
            onClick={() => navigate('/wishlist')}
            whileTap={{ scale: 0.96 }}
            style={{
              position: 'relative', width: 40, height: 40, borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.16)', color: '#fff', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
            }}
            aria-label="Wishlist"
          >
            ♡
          </motion.button>

          <div style={{ position: 'relative', display: 'inline-block' }}>
            <motion.button
              onClick={(e) => { e.stopPropagation(); setShowProfile((s) => !s); }}
              whileTap={{ scale: 0.96 }}
              style={{
                width: 40, height: 40, borderRadius: '50%', backgroundColor: '#fff', color: PRIMARY,
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 16, fontWeight: 700, fontFamily: "'Quicksand', sans-serif",
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
              aria-label="Account menu"
            >
              {username ? username.charAt(0).toUpperCase() : '👤'}
            </motion.button>
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 200,
                    backgroundColor: '#fff', color: PRIMARY, borderRadius: 14, padding: '10px',
                    fontSize: 12, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.16)', zIndex: 150, display: 'flex', flexDirection: 'column',
                  }}
                >
                  <div style={{ padding: '6px 10px', color: BROWN, fontWeight: 700, borderBottom: '1px solid #f0ece6', marginBottom: 6 }}>
                    {username}
                    {isAdmin && <span style={{ fontSize: 10, color: PRIMARY, marginLeft: 6 }}>(Admin)</span>}
                  </div>
                  {isAdmin && (
                    <button onClick={() => navigate('/admin/dashboard')} style={dropdownItemStyle}>
                      📊 Admin Dashboard
                    </button>
                  )}
                  <button onClick={() => navigate('/products')} style={dropdownItemStyle}>🛍️ Continue Shopping</button>
                  <button onClick={() => navigate('/wishlist')} style={dropdownItemStyle}>♡ My Wishlist</button>
                  <button onClick={logout} style={{ ...dropdownItemStyle, color: '#dc2626' }}>🚪 Logout</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            style={{
              position: 'fixed', top: 70, right: 32, backgroundColor: '#4caf50', color: '#fff',
              padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 300,
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '28px 32px 64px' }}>
        <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 28, fontWeight: 700, color: PRIMARY, marginBottom: 8, textAlign: 'center' }}>
          My Orders
        </h1>
        <p style={{ textAlign: 'center', fontSize: 13, color: MUTED, margin: '0 auto 28px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {sortedGroups.length > 0
            ? `You have ${sortedGroups.length} order${sortedGroups.length > 1 ? 's' : ''}`
            : 'Track and download your past purchases'}
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: BROWN }}>Loading order history...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#dc2626' }}>{error}</div>
        ) : sortedGroups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: BROWN }}>
            <p style={{ fontSize: 18, marginBottom: 8 }}>📦 You haven't placed any orders yet</p>
            <p style={{ fontSize: 14, color: MUTED, marginBottom: 24 }}>Start shopping to see your order history</p>
            <button onClick={() => navigate('/products')} style={{
              padding: '12px 24px', backgroundColor: PRIMARY, color: '#fff',
              border: 'none', borderRadius: 24, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>Browse Products</button>
          </div>
        ) : (
          <>
            {/* Filters / sort */}
            <div style={{
              background: '#fff', borderRadius: 18, padding: '16px 18px', marginBottom: 24,
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f0ece6',
              display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { key: 'ALL', label: `All (${statusCounts.ALL})` },
                  { key: 'SUCCESS', label: `Success (${statusCounts.SUCCESS})` },
                  { key: 'PENDING', label: `Pending (${statusCounts.PENDING})` },
                  { key: 'FAILED', label: `Failed (${statusCounts.FAILED})` },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => { setStatusFilter(opt.key); setCurrentPage(1); }}
                    style={{
                      padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                      fontSize: 12.5, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
                      background: statusFilter === opt.key ? PRIMARY : '#fff',
                      color: statusFilter === opt.key ? '#fff' : BROWN,
                      boxShadow: statusFilter === opt.key ? '0 3px 8px rgba(155,69,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>Sort</span>
                <select
                  value={sortOrder}
                  onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
                  style={{
                    padding: '8px 12px', fontSize: 13, color: BROWN, border: '1px solid #e5e5e5',
                    borderRadius: 12, background: CREAM, outline: 'none', cursor: 'pointer',
                    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600,
                  }}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>

            {filteredGroups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: BROWN }}>
                <p style={{ fontSize: 16, marginBottom: 6 }}>No orders match this filter</p>
                <button onClick={() => { setStatusFilter('ALL'); setSortOrder('newest'); }} style={{
                  padding: '10px 22px', border: 'none', borderRadius: 20, background: PRIMARY, color: '#fff',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>Clear filters</button>
              </div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                key={`orders-${safePage}-${statusFilter}-${sortOrder}`}
                style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
              >
                {pageOrders.map((group) => {
                  const statusKey = (group.status || 'SUCCESS').toUpperCase();
                  const ss = statusStyle(group.status);
                  const orderNumber = friendlyNumbers.get(group.orderId) || '?';
                  const itemCount = group.items.reduce((s, i) => s + (i.quantity || 1), 0);
                  return (
                    <motion.div
                      key={group.orderId}
                      variants={staggerItem}
                      style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}
                    >
                      {/* Header */}
                      <div style={{ padding: '18px 20px', borderBottom: '1px solid #f0ece6', background: 'linear-gradient(180deg, #fffdf9, #fff)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                              <h2 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 20, fontWeight: 700, color: PRIMARY, margin: 0 }}>
                                Order #{orderNumber}
                              </h2>
                              <span
                                onClick={() => copyOrderId(group.orderId)}
                                title="Click to copy full order ID"
                                style={{
                                  fontSize: 11, color: MUTED, cursor: 'pointer',
                                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                                  padding: '3px 8px', borderRadius: 8, background: CREAM, border: '1px solid #f0ece6',
                                  userSelect: 'all',
                                }}
                              >
                                {copiedId === group.orderId ? '✓ Copied' : group.orderId.substring(0, 8) + '… 📋'}
                              </span>
                            </div>
                            <div style={{ marginTop: 6, fontSize: 12, color: MUTED, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                              Placed on {formatDate(group.orderDate)} • {itemCount} item{itemCount !== 1 ? 's' : ''}
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 12,
                              background: ss.bg, color: ss.color, letterSpacing: '0.04em',
                              fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'inline-flex', alignItems: 'center', gap: 5,
                            }}>
                              {ss.icon} {ss.label}
                            </span>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: 11, color: MUTED, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Order Total</span>
                              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: PRIMARY, margin: 0 }}>
                                ₹{group.total.toFixed(2)}
                              </p>
                            </div>
                            <button
                              onClick={() => downloadInvoice(group.orderId)}
                              style={{
                                padding: '6px 14px', backgroundColor: PRIMARY, color: '#fff',
                                border: 'none', borderRadius: 16, fontSize: 12, fontWeight: 600,
                                cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                              }}
                            >
                              Download Invoice
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ padding: '16px 20px' }}>
                        {group.items.map((item, idx) => {
                          const itemKey = group.orderId + '-' + item.productId;
                          const reviewed = item.reviewed === true;
                          return (
                            <div
                              key={itemKey}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 16,
                                paddingBottom: idx < group.items.length - 1 ? 16 : 0,
                                marginBottom: idx < group.items.length - 1 ? 16 : 0,
                                borderBottom: idx < group.items.length - 1 ? '1px solid #f0ece6' : 'none',
                              }}
                            >
                              <img
                                src={item.imageUrl || PLACEHOLDER_IMG}
                                alt={item.name}
                                onError={handleImgError}
                                style={{
                                  width: 80, height: 80, objectFit: 'contain', borderRadius: 12,
                                  background: '#f8f5f2', padding: 6, border: '1px solid #f0ece6', flexShrink: 0,
                                }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 16, fontWeight: 600, color: PRIMARY, margin: 0, marginBottom: 4 }}>
                                  {item.name}
                                </h3>
                                {item.categoryName && (
                                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: MUTED, margin: 0, marginBottom: 4 }}>
                                    {item.categoryName}
                                  </p>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                                  {reviewed ? (
                                    <>
                                      <StarRow value={item.rating || 0} />
                                      <span style={{
                                        fontSize: 11.5, fontWeight: 700, color: '#2e7d32',
                                        background: '#e8f5e9', padding: '3px 10px', borderRadius: 12,
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                      }}>
                                        ✓ Reviewed
                                      </span>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => openReview(group.orderId, item.productId, item.name)}
                                      style={{
                                        padding: '5px 12px', border: `1.5px solid ${PRIMARY}`, background: 'transparent',
                                        color: PRIMARY, borderRadius: 14, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                      }}
                                    >
                                      ⭐ Rate this product
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', minWidth: 110, flexShrink: 0 }}>
                                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: BROWN, margin: 0, marginBottom: 4 }}>
                                  Qty: {item.quantity}
                                </p>
                                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: BROWN, margin: 0, marginBottom: 4 }}>
                                  ₹{item.pricePerUnit != null ? Number(item.pricePerUnit).toFixed(2) : '—'} each
                                </p>
                                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 700, color: PRIMARY, margin: 0 }}>
                                  ₹{item.totalPrice != null ? Number(item.totalPrice).toFixed(2) : '—'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer actions */}
                      <div style={{ padding: '14px 20px', borderTop: '1px solid #f0ece6', background: '#fcf9f4', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <motion.button
                          onClick={() => reorder(group)}
                          disabled={reorderBusy === group.orderId}
                          whileTap={{ scale: 0.96 }}
                          style={{
                            padding: '9px 18px', border: 'none', borderRadius: 20,
                            background: 'linear-gradient(135deg, #9b4500, #ff914d)', color: '#fff',
                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            boxShadow: '0 4px 10px rgba(155,69,0,0.3)',
                            opacity: reorderBusy === group.orderId ? 0.6 : 1,
                          }}
                        >
                          {reorderBusy === group.orderId ? 'Adding…' : '🔄 Buy Again'}
                        </motion.button>
                        <motion.button
                          onClick={() => toggleTrack(group.orderId)}
                          whileTap={{ scale: 0.96 }}
                          style={{
                            padding: '9px 18px', border: `1.5px solid ${PRIMARY}`, background: 'transparent',
                            color: PRIMARY, borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        >
                          {expandedOrders.has(group.orderId) ? '▾ Hide tracking' : '▸ Track order'}
                        </motion.button>
                      </div>

                      {/* Tracking stepper */}
                      <AnimatePresence initial={false}>
                        {expandedOrders.has(group.orderId) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: EASE }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ padding: '18px 20px 22px', borderTop: '1px solid #f0ece6', background: '#fff' }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                {TRACK_STEPS.map((label, i) => {
                                  const idx = stepIndex(group.status);
                                  const done = i < idx;
                                  const isLast = i === TRACK_STEPS.length - 1;
                                  return (
                                    <div key={label} style={{ display: 'flex', alignItems: 'center', flex: isLast ? 'none' : 1 }}>
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 76 }}>
                                        <div style={{
                                          width: 28, height: 28, borderRadius: '50%',
                                          background: done ? PRIMARY : '#f0ece6',
                                          color: done ? '#fff' : MUTED,
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          fontSize: 12, fontWeight: 700,
                                          boxShadow: done ? '0 3px 8px rgba(155,69,0,0.3)' : 'none',
                                        }}>
                                          {done ? '✓' : i + 1}
                                        </div>
                                        <span style={{
                                          fontSize: 10, marginTop: 6, textAlign: 'center', fontWeight: 600,
                                          color: done ? BROWN : MUTED, fontFamily: "'Plus Jakarta Sans', sans-serif",
                                        }}>
                                          {label}
                                        </span>
                                      </div>
                                      {!isLast && (
                                        <div style={{
                                          flex: 1, height: 3, margin: '0 8px 24px', borderRadius: 2,
                                          background: done ? PRIMARY_LIGHT : '#f0ece6',
                                        }} />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              {statusKey === 'FAILED' && (
                                <div style={{
                                  marginTop: 16, padding: '10px 14px', borderRadius: 10,
                                  background: '#fdecec', color: '#b91c1c', fontSize: 12.5, fontWeight: 600,
                                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                                }}>
                                  ✕ This order failed. If you were charged, please contact support@happytailsstore.com
                                </div>
                              )}
                              {statusKey !== 'FAILED' && statusKey !== 'SUCCESS' && (
                                <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: '#fef3c7', color: '#b45309', fontSize: 12.5, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                  ⏳ Your order is being processed. We'll update it as it ships.
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 32 }}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                  disabled={safePage === 1}
                  style={{
                    padding: '8px 16px', borderRadius: 20, border: '1px solid #e5e5e5',
                    background: '#fff', color: PRIMARY, cursor: safePage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: 13, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
                    opacity: safePage === 1 ? 0.4 : 1,
                  }}
                >
                  ‹ Prev
                </button>
                <span style={{ fontSize: 13, color: BROWN, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                  Page {safePage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                  disabled={safePage === totalPages}
                  style={{
                    padding: '8px 16px', borderRadius: 20, border: '1px solid #e5e5e5',
                    background: '#fff', color: PRIMARY, cursor: safePage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: 13, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
                    opacity: safePage === totalPages ? 0.4 : 1,
                  }}
                >
                  Next ›
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Review modal */}
      <AnimatePresence>
        {review && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReview(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 400,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff', borderRadius: 18, padding: '24px 26px', maxWidth: 420, width: '100%',
                boxShadow: '0 16px 48px rgba(0,0,0,0.2)', fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              <h3 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 20, fontWeight: 700, color: PRIMARY, margin: 0, marginBottom: 4 }}>
                Rate this product
              </h3>
              <p style={{ fontSize: 13, color: BROWN, margin: '0 0 16px' }}>
                {review.name}
              </p>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Your rating
                </div>
                <StarRow value={reviewRating} onChange={setReviewRating} size={30} />
                {reviewRating > 0 && (
                  <span style={{ fontSize: 12, color: PRIMARY, fontWeight: 700, marginLeft: 10 }}>
                    {reviewRating}/5
                  </span>
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Review (optional)
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this product…"
                  rows={3}
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 12,
                    border: '1px solid #e5e5e5', background: CREAM, outline: 'none', fontSize: 13,
                    color: BROWN, resize: 'vertical', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  onClick={() => setReview(null)}
                  style={{
                    padding: '10px 18px', borderRadius: 20, border: '1px solid #e5e5e5',
                    background: '#fff', color: BROWN, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  disabled={reviewRating < 1 || submittingReview}
                  style={{
                    padding: '10px 20px', borderRadius: 20, border: 'none',
                    background: PRIMARY, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    opacity: reviewRating < 1 || submittingReview ? 0.5 : 1,
                  }}
                >
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
