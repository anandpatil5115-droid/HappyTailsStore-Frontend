import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PRIMARY = '#9b4500';
const PRIMARY_LIGHT = '#ff914d';
const CREAM = '#fcf9f4';
const BROWN = '#564339';
const MUTED = '#dcc1b4';
const API_BASE = 'http://localhost:8080';

export default function OrderHistoryPage() {
  const [orderHistory, setOrderHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    fetchOrderHistory();
  }, [token, navigate]);

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

  const groupByOrderId = () => {
    if (!orderHistory?.orders?.products) return {};
    const grouped = {};
    orderHistory.orders.products.forEach(item => {
      if (!grouped[item.orderId]) {
        grouped[item.orderId] = {
          orderId: item.orderId,
          orderDate: item.orderDate,
          status: item.orderStatus,
          items: []
        };
      }
      grouped[item.orderId].items.push(item);
    });
    return grouped;
  };

  const groupedOrders = groupByOrderId();

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
        <button onClick={() => navigate('/products')} style={{
          padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.15)',
          border: 'none', color: '#fff', borderRadius: 20,
          fontSize: 14, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>← Continue Shopping</button>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px' }}>
        <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 28, fontWeight: 700, color: PRIMARY, marginBottom: 32, textAlign: 'center' }}>
          My Orders
        </h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: BROWN }}>Loading order history...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#dc2626' }}>{error}</div>
        ) : !orderHistory?.orders?.products || orderHistory.orders.products.length === 0 ? (
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {Object.values(groupedOrders).map((group) => (
              <div key={group.orderId} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ padding: 20, borderBottom: '1px solid #f0ece6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 20, fontWeight: 700, color: PRIMARY, margin: 0 }}>
                      Order #{group.orderId.substring(0, 8)}...
                    </h2>
                    <span style={{ fontSize: 12, color: BROWN }}>
                      {formatDate(group.orderDate)}
                    </span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ 
                      fontSize: 11, fontWeight: 600,
                      padding: '4px 10px', borderRadius: 12,
                      background: group.status === 'SUCCESS' ? '#e8f5e9' : '#fdecec',
                      color: group.status === 'SUCCESS' ? '#2e7d32' : '#b91c1c'
                    }}>
                      {group.status}
                    </span>
                  </div>
                </div>

                <div style={{ padding: 20 }}>
                  {group.items.map((item) => (
                    <div key={`${item.orderId}-${item.productId}`} style={{ 
                      display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16,
                      paddingBottom: 16, borderBottom: '1px solid #f0ece6'
                    }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12 }} />
                      ) : (
                        <div style={{ width: 80, height: 80, background: '#f0ece6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, fontSize: 12 }}>
                          🐾
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 16, fontWeight: 600, color: PRIMARY, margin: 0, marginBottom: 4 }}>
                          {item.name}
                        </h3>
                        {item.description && (
                          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: BROWN, margin: 0, marginBottom: 8 }}>
                            {item.description}
                          </p>
                        )}
                        {item.categoryName && (
                          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: MUTED, margin: 0 }}>
                            Category: {item.categoryName}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', minWidth: 120 }}>
                        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: BROWN, margin: 0, marginBottom: 4 }}>
                          Qty: {item.quantity}
                        </p>
                        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: BROWN, margin: 0, marginBottom: 4 }}>
                          ₹{item.pricePerUnit != null ? item.pricePerUnit.toFixed(2) : '—'} each
                        </p>
                        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 700, color: PRIMARY, margin: 0 }}>
                          Total: ₹{item.totalPrice != null ? item.totalPrice.toFixed(2) : '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}