import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PRIMARY = '#9b4500';
const PRIMARY_LIGHT = '#ff914d';
const CREAM = '#fcf9f4';
const BROWN = '#564339';
const MUTED = '#dcc1b4';
const BORDER = '#eadfce';
const API_BASE = 'http://localhost:8080';

const cardStyle = {
  background: '#ffffff',
  border: `1px solid ${BORDER}`,
  borderRadius: 16,
  padding: 24,
  marginBottom: 24,
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 14,
  color: BROWN,
  border: `1px solid ${MUTED}`,
  borderRadius: 10,
  background: '#fff',
  outline: 'none',
  fontFamily: '"Plus Jakarta Sans", sans-serif',
};

const labelStyle = {
  display: 'block',
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: '0.08em',
  color: BROWN,
  marginBottom: 4,
  textTransform: 'uppercase',
};

const btnPrimary = {
  padding: '10px 18px',
  background: PRIMARY,
  color: '#fff',
  border: 'none',
  borderRadius: 24,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.03em',
  cursor: 'pointer',
};

const btnGhost = {
  padding: '8px 14px',
  background: 'transparent',
  color: BROWN,
  border: `1px solid ${MUTED}`,
  borderRadius: 24,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
};

const toastStyle = (type) => ({
  position: 'fixed',
  top: 16,
  right: 16,
  zIndex: 1000,
  padding: '12px 18px',
  borderRadius: 8,
  background: type === 'success' ? '#065f46' : '#dc2626',
  color: '#fff',
  fontSize: 12,
  fontWeight: 500,
  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  maxWidth: 400,
});

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { token, role, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  }, []);

  const api = useCallback(async (path, options = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    return { ok: res.ok, status: res.status, data };
  }, [token]);

  useEffect(() => {
    if (!token || role !== 'ADMIN') {
      navigate('/admin/login', { replace: true });
    }
  }, [token, role, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', background: CREAM }}>
      {toast && (
        <div style={toastStyle(toast.type)}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px', background: '#fff', borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18 }}>🐾</span>
          <span style={{ fontWeight: 700, color: BROWN, letterSpacing: '-0.02em' }}>HappyTailsStore</span>
          <span style={{ fontSize: 10, color: PRIMARY, background: '#fdeee2', padding: '4px 10px', borderRadius: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Admin
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => navigate('/products')} style={btnGhost}>View Store</button>
          <button onClick={handleLogout} style={{ ...btnGhost, color: '#dc2626', borderColor: '#f3c0c0' }}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '24px 32px 0' }}>
        {[
          { key: 'products', label: 'Products' },
          { key: 'users', label: 'Users' },
          { key: 'analytics', label: 'Analytics' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 22px',
              border: `1px solid ${activeTab === tab.key ? PRIMARY : MUTED}`,
              borderRadius: 24,
              background: activeTab === tab.key ? PRIMARY : '#fff',
              color: activeTab === tab.key ? '#fff' : BROWN,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px 32px 48px', maxWidth: 1100, margin: '0 auto' }}>
        {activeTab === 'products' && (
          <ProductsTab api={api} showToast={showToast} />
        )}
        {activeTab === 'users' && (
          <UsersTab api={api} showToast={showToast} />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsTab api={api} showToast={showToast} />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── PRODUCTS TAB ─────────────────────────── */
function ProductsTab({ api, showToast }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', categoryId: '', imageUrl: '' });
  const [saving, setSaving] = useState(false);
  const [stockInputs, setStockInputs] = useState({});
  const [stockLoading, setStockLoading] = useState({});

  const fetchAll = useCallback(async () => {
    const [catRes, prodRes] = await Promise.all([
      api('/api/categories'),
      api('/api/products'),
    ]);
    setCategories(catRes.data || []);
    setProducts(prodRes.data || []);
    setLoading(false);
  }, [api]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await api('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: Number(form.categoryId),
        imageUrl: form.imageUrl || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      showToast('Product added successfully', 'success');
      setForm({ name: '', description: '', price: '', stock: '', categoryId: '', imageUrl: '' });
      fetchAll();
    } else {
      showToast(res.data?.message || 'Failed to add product');
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    const res = await api(`/api/admin/products/${product.productId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Product deleted', 'success');
      fetchAll();
    } else {
      showToast(res.data?.message || 'Failed to delete product');
    }
  };

  const handleAddStock = async (productId) => {
    const qty = Number(stockInputs[productId]);
    if (!qty || qty <= 0) {
      showToast('Enter a valid quantity');
      return;
    }
    setStockLoading((prev) => ({ ...prev, [productId]: true }));
    const res = await api(`/api/admin/products/${productId}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: qty }),
    });
    setStockLoading((prev) => ({ ...prev, [productId]: false }));
    if (res.ok) {
      showToast('Stock updated', 'success');
      setStockInputs((prev) => ({ ...prev, [productId]: '' }));
      fetchAll();
    } else {
      showToast(res.data?.message || 'Failed to update stock');
    }
  };

  return (
    <div>
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 4px', color: BROWN, fontSize: 18 }}>Add Product</h3>
        <p style={{ margin: '0 0 20px', fontSize: 12, color: '#8a7a6d' }}>
          Create a new product for your store.
        </p>
        <form onSubmit={handleAddProduct} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input style={inputStyle} name="name" value={form.name} onChange={handleChange} placeholder="Dog Biscuit" required />
            </div>
            <div>
              <label style={labelStyle}>Price (₹)</label>
              <input style={inputStyle} name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={handleChange} placeholder="299.00" required />
            </div>
            <div>
              <label style={labelStyle}>Stock</label>
              <input style={inputStyle} name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} placeholder="50" required />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} name="categoryId" value={form.categoryId} onChange={handleChange} required>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} name="description" value={form.description} onChange={handleChange} placeholder="A short description of the product" />
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Image URL (optional)</label>
            <input style={inputStyle} name="imageUrl" value={form.imageUrl || ''} onChange={handleChange} placeholder="https://example.com/product-image.jpg" />
          </div>
          <div style={{ marginTop: 18 }}>
            <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 16px', color: BROWN, fontSize: 18 }}>Products ({products.length})</h3>
        {loading ? (
          <p style={{ color: '#8a7a6d', fontSize: 13 }}>Loading products...</p>
        ) : products.length === 0 ? (
          <p style={{ color: '#8a7a6d', fontSize: 13 }}>No products yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {products.map((p) => (
              <div key={p.productId} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                border: `1px solid ${BORDER}`, borderRadius: 12, padding: '12px 16px', gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: BROWN, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#8a7a6d' }}>
                    ₹{Number(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })} · Stock: {p.stock} · {p.categoryName || 'Uncategorized'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    style={{ ...inputStyle, width: 60, textAlign: 'center', padding: '6px 4px', fontSize: 12 }}
                    type="number"
                    min="1"
                    placeholder="+Qty"
                    value={stockInputs[p.productId] || ''}
                    onChange={(e) => setStockInputs((prev) => ({ ...prev, [p.productId]: e.target.value }))}
                  />
                  <button
                    onClick={() => handleAddStock(p.productId)}
                    disabled={stockLoading[p.productId]}
                    style={{ ...btnPrimary, padding: '6px 10px', fontSize: 11, opacity: stockLoading[p.productId] ? 0.6 : 1 }}
                  >
                    {stockLoading[p.productId] ? '...' : 'Add'}
                  </button>
                </div>
                <button onClick={() => handleDelete(p)} style={{ ...btnGhost, color: '#dc2626', borderColor: '#f3c0c0' }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────── USERS TAB ──────────────────────────── */
function UsersTab({ api, showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', role: '' });

  const fetchUsers = useCallback(async () => {
    const res = await api('/api/admin/users');
    if (res.ok) {
      setUsers(res.data || []);
    } else {
      showToast(res.data?.message || 'Failed to load users');
    }
    setLoading(false);
  }, [api, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const startEdit = (user) => {
    setEditingId(user.userId);
    setEditForm({ username: user.username, email: user.email, role: user.role });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ username: '', email: '', role: '' });
  };

  const saveEdit = async (userId) => {
    const payload = {};
    if (editForm.username.trim()) payload.username = editForm.username.trim();
    if (editForm.email.trim()) payload.email = editForm.email.trim();
    if (editForm.role) payload.role = editForm.role;

    const res = await api(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      showToast('User updated successfully', 'success');
      cancelEdit();
      fetchUsers();
    } else {
      showToast(res.data?.message || 'Failed to update user');
    }
  };

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: '0 0 4px', color: BROWN, fontSize: 18 }}>User Management</h3>
      <p style={{ margin: '0 0 20px', fontSize: 12, color: '#8a7a6d' }}>
        Click Edit to change a user's username, email, or role.
      </p>

      {loading ? (
        <p style={{ color: '#8a7a6d', fontSize: 13 }}>Loading users...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#8a7a6d', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <th style={{ padding: '8px 10px', borderBottom: `1px solid ${BORDER}` }}>ID</th>
              <th style={{ padding: '8px 10px', borderBottom: `1px solid ${BORDER}` }}>Username</th>
              <th style={{ padding: '8px 10px', borderBottom: `1px solid ${BORDER}` }}>Email</th>
              <th style={{ padding: '8px 10px', borderBottom: `1px solid ${BORDER}` }}>Role</th>
              <th style={{ padding: '8px 10px', borderBottom: `1px solid ${BORDER}` }}>Created</th>
              <th style={{ padding: '8px 10px', borderBottom: `1px solid ${BORDER}` }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.userId} style={{ color: BROWN }}>
                {editingId === u.userId ? (
                  <>
                    <td style={{ padding: '8px 10px', borderBottom: `1px solid ${BORDER}` }}>{u.userId}</td>
                    <td style={{ padding: '8px 10px', borderBottom: `1px solid ${BORDER}` }}>
                      <input style={inputStyle} value={editForm.username} onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))} />
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: `1px solid ${BORDER}` }}>
                      <input style={inputStyle} value={editForm.email} onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))} />
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: `1px solid ${BORDER}` }}>
                      <select style={inputStyle} value={editForm.role} onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}>
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: `1px solid ${BORDER}`, color: '#8a7a6d', fontSize: 12 }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap' }}>
                      <button onClick={() => saveEdit(u.userId)} style={{ ...btnPrimary, marginRight: 8 }}>Save</button>
                      <button onClick={cancelEdit} style={btnGhost}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: '8px 10px', borderBottom: `1px solid ${BORDER}` }}>{u.userId}</td>
                    <td style={{ padding: '8px 10px', borderBottom: `1px solid ${BORDER}` }}>{u.username}</td>
                    <td style={{ padding: '8px 10px', borderBottom: `1px solid ${BORDER}` }}>{u.email}</td>
                    <td style={{ padding: '8px 10px', borderBottom: `1px solid ${BORDER}` }}>
                      <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 10, fontWeight: 700, background: u.role === 'ADMIN' ? '#fdeee2' : '#eef2f0', color: u.role === 'ADMIN' ? PRIMARY : '#2f6b4f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: `1px solid ${BORDER}`, color: '#8a7a6d', fontSize: 12 }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: `1px solid ${BORDER}` }}>
                      <button onClick={() => startEdit(u)} style={btnGhost}>Edit</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ─────────────────────────── ANALYTICS TAB ────────────────────────── */
function AnalyticsTab({ api, showToast }) {
  const [dailyDate, setDailyDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dailyResult, setDailyResult] = useState(null);

  const [monthlyYear, setMonthlyYear] = useState(() => new Date().getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState(() => String(new Date().getMonth() + 1).padStart(2, '0'));
  const [monthlyResult, setMonthlyResult] = useState(null);

  const [yearlyYear, setYearlyYear] = useState(() => new Date().getFullYear());
  const [yearlyResult, setYearlyResult] = useState(null);

  const [overallResult, setOverallResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDaily = async () => {
    setLoading(true);
    const res = await api(`/api/admin/analytics/daily?date=${dailyDate}`);
    setLoading(false);
    if (res.ok) setDailyResult(res.data);
    else showToast(res.data?.message || 'Failed to load daily revenue');
  };

  const fetchMonthly = async () => {
    setLoading(true);
    const res = await api(`/api/admin/analytics/monthly?year=${monthlyYear}&month=${monthlyMonth}`);
    setLoading(false);
    if (res.ok) setMonthlyResult(res.data);
    else showToast(res.data?.message || 'Failed to load monthly revenue');
  };

  const fetchYearly = async () => {
    setLoading(true);
    const res = await api(`/api/admin/analytics/yearly?year=${yearlyYear}`);
    setLoading(false);
    if (res.ok) setYearlyResult(res.data);
    else showToast(res.data?.message || 'Failed to load yearly revenue');
  };

  const fetchOverall = async () => {
    setLoading(true);
    const res = await api('/api/admin/analytics/overall');
    setLoading(false);
    if (res.ok) setOverallResult(res.data);
    else showToast(res.data?.message || 'Failed to load overall revenue');
  };

  const ResultCard = ({ title, result }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
      <div>
        <div style={{ fontSize: 12, color: '#8a7a6d' }}>{title}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: BROWN }}>
          {result ? `₹${Number(result.totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
        </div>
        <div style={{ fontSize: 12, color: '#8a7a6d' }}>
          {result ? `${result.orderCount} order(s)` : '—'}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {loading && <p style={{ color: '#8a7a6d', fontSize: 13 }}>Loading...</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <div style={cardStyle}>
          <h3 style={{ margin: 0, color: BROWN, fontSize: 16 }}>Daily Revenue</h3>
          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Date</label>
            <input style={inputStyle} type="date" value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} />
          </div>
          <div style={{ marginTop: 14 }}>
            <button onClick={fetchDaily} style={btnPrimary}>Get Daily Revenue</button>
          </div>
          <ResultCard title={dailyResult?.periodLabel || 'Daily Revenue'} result={dailyResult} />
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: 0, color: BROWN, fontSize: 16 }}>Monthly Revenue</h3>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Year</label>
              <input style={inputStyle} type="number" min="2000" max="2100" value={monthlyYear} onChange={(e) => setMonthlyYear(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Month</label>
              <input style={inputStyle} type="number" min="1" max="12" value={monthlyMonth} onChange={(e) => setMonthlyMonth(e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <button onClick={fetchMonthly} style={btnPrimary}>Get Monthly Revenue</button>
          </div>
          <ResultCard title={monthlyResult?.periodLabel || 'Monthly Revenue'} result={monthlyResult} />
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: 0, color: BROWN, fontSize: 16 }}>Yearly Revenue</h3>
          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Year</label>
            <input style={inputStyle} type="number" min="2000" max="2100" value={yearlyYear} onChange={(e) => setYearlyYear(e.target.value)} />
          </div>
          <div style={{ marginTop: 14 }}>
            <button onClick={fetchYearly} style={btnPrimary}>Get Yearly Revenue</button>
          </div>
          <ResultCard title={yearlyResult?.periodLabel || 'Yearly Revenue'} result={yearlyResult} />
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: 0, color: BROWN, fontSize: 16 }}>Overall Revenue</h3>
          <p style={{ fontSize: 12, color: '#8a7a6d', margin: '12px 0 0' }}>All-time successful orders.</p>
          <div style={{ marginTop: 14 }}>
            <button onClick={fetchOverall} style={btnPrimary}>Get Overall Revenue</button>
          </div>
          <ResultCard title={overallResult?.periodLabel || 'Overall Revenue'} result={overallResult} />
        </div>
      </div>
    </div>
  );
}