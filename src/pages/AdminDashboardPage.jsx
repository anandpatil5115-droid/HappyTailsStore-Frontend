import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Package, Users, DollarSign, BarChart3, Calendar,
  Trophy, TrendingUp, Search, Download, Trash2, Edit3, ChevronLeft,
  ChevronRight, AlertTriangle, Eye, EyeOff, X, Check, Filter,
  ArrowUpDown, Image, Plus, Loader2, AlertCircle, CheckCircle2,
  Menu, LogOut, RotateCcw, UserX, Shield,
} from 'lucide-react';

const PRIMARY = '#9b4500';
const PRIMARY_LIGHT = '#ff914d';
const CREAM = '#fcf9f4';
const BROWN = '#564339';
const MUTED = '#dcc1b4';
const BORDER = '#eadfce';
const API_BASE = 'http://localhost:8080';
const CARD_BG = '#ffffff';
const CARD_BORDER = '#e5e5e5';
const TEXT_DARK = '#2d2d2d';
const TEXT_MEDIUM = '#8a7a6d';
const GREEN_UP = '#22c55e';
const PURPLE_ACCENT = '#8b5cf6';
const BLUE_ACCENT = '#3b82f6';
const LOW_STOCK_THRESHOLD = 10;
const PRODUCTS_PER_PAGE = 20;
const USERS_PER_PAGE = 20;

const PLACEHOLDER_IMG =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#f0ece6" rx="8"/><text x="40" y="44" font-size="28" text-anchor="middle">🐾</text></svg>`
  );

const cardStyle = {
  background: CARD_BG,
  border: `1px solid ${CARD_BORDER}`,
  borderRadius: 16,
  padding: 24,
  marginBottom: 20,
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 13,
  color: TEXT_DARK,
  border: `1px solid ${CARD_BORDER}`,
  borderRadius: 10,
  background: '#fff',
  outline: 'none',
  fontFamily: '"Plus Jakarta Sans", sans-serif',
  transition: 'border-color 0.2s ease',
};

const labelStyle = {
  display: 'block',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.06em',
  color: TEXT_MEDIUM,
  marginBottom: 5,
  textTransform: 'uppercase',
};

const btnPrimary = {
  padding: '9px 18px',
  background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_LIGHT})`,
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(155,69,0,0.2)',
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  whiteSpace: 'nowrap',
};

const btnGhost = {
  padding: '8px 14px',
  background: 'transparent',
  color: TEXT_DARK,
  border: `1px solid ${CARD_BORDER}`,
  borderRadius: 10,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  whiteSpace: 'nowrap',
};

const btnDanger = {
  ...btnGhost,
  color: '#dc2626',
  borderColor: '#fecaca',
};

const btnSmall = {
  padding: '5px 10px',
  fontSize: 11,
  borderRadius: 8,
};

const exportToCSV = (rows, filename, columns) => {
  if (!rows || rows.length === 0) return;
  const headers = columns.map(c => c.header).join(',');
  const body = rows.map(row =>
    columns.map(c => `"${String(row[c.key] ?? '').replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  const csv = headers + '\n' + body;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
};

function ConfirmModal({ open, title, message, onConfirm, onCancel, danger }) {
  if (!open) return null;
  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, padding: 28, maxWidth: 400, width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: danger ? '#fef2f2' : '#f0fdf4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {danger ? <AlertTriangle size={18} color="#dc2626" /> : <CheckCircle2 size={18} color="#16a34a" />}
          </div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TEXT_DARK }}>{title}</h3>
        </div>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: TEXT_MEDIUM, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onCancel} style={btnGhost}>Cancel</button>
          <button onClick={onConfirm} style={{
            ...btnPrimary,
            background: danger ? '#dc2626' : btnPrimary.background,
            boxShadow: danger ? '0 2px 8px rgba(220,38,38,0.2)' : btnPrimary.boxShadow,
          }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonRow({ height = 48 }) {
  return (
    <div style={{
      height, borderRadius: 10,
      background: 'linear-gradient(90deg, #f0ece6 25%, #f8f5f2 50%, #f0ece6 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
    }} />
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { token, role, username, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
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
    if (!token || role !== 'ADMIN') navigate('/admin/login', { replace: true });
  }, [token, role, navigate]);

  const handleLogout = () => { logout(); navigate('/admin/login', { replace: true }); };

  const navItems = [
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'users', label: 'Users', icon: Users },
  ];

  const breadcrumbs = {
    analytics: ['Admin', 'Analytics'],
    products: ['Admin', 'Products'],
    users: ['Admin', 'Users'],
  };

  const pageHeaders = {
    analytics: { title: 'Analytics Dashboard', desc: 'Revenue insights and top-selling products' },
    products: { title: 'Product Management', desc: 'Add, edit, and manage your product catalog' },
    users: { title: 'User Management', desc: 'View and manage user accounts and roles' },
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f3f0',
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      display: 'flex',
    }}>
      <style>{`
        @keyframes skeleton-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .admin-sidebar { animation: fadeIn 0.2s ease; }
        .admin-table tr:hover td { background: #faf8f5; }
        .admin-btn:hover { filter: brightness(1.05); transform: translateY(-1px); }
        .admin-ghost:hover { background: #f5f3f0; }
        input:focus { border-color: ${PRIMARY_LIGHT} !important; box-shadow: 0 0 0 3px rgba(255,145,77,0.12); }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 1000, padding: '12px 18px',
          borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8,
          background: toast.type === 'success' ? '#065f46' : '#dc2626',
          color: '#fff', fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="admin-sidebar" style={{
          width: 240, flexShrink: 0, background: '#1a1a1a', color: '#fff',
          display: 'flex', flexDirection: 'column', position: isMobile ? 'fixed' : 'sticky',
          top: 0, left: 0, height: '100vh', zIndex: 200,
          boxShadow: '2px 0 12px rgba(0,0,0,0.15)',
        }}>
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #2d2d2d' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>🐾</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>HappyTailsStore</div>
                <div style={{ fontSize: 10, color: PRIMARY_LIGHT, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin Panel</div>
              </div>
            </div>
          </div>
          <nav style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => { setActiveTab(item.key); if (isMobile) setSidebarOpen(false); }}
                  style={{
                    width: '100%', padding: '11px 14px', border: 'none', borderRadius: 10,
                    background: active ? PRIMARY : 'transparent',
                    color: active ? '#fff' : '#999',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>
      )}

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 150,
        }} />
      )}

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 24px', background: '#fff', borderBottom: `1px solid ${CARD_BORDER}`,
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'none', border: 'none', color: TEXT_DARK, cursor: 'pointer', padding: 4, display: 'flex' }}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: TEXT_MEDIUM }}>
              {(breadcrumbs[activeTab] || []).map((crumb, i, arr) => (
                <React.Fragment key={i}>
                  {i > 0 && <span style={{ color: MUTED }}>/</span>}
                  <span style={{ color: i === arr.length - 1 ? TEXT_DARK : PRIMARY, fontWeight: i === arr.length - 1 ? 700 : 500 }}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: TEXT_MEDIUM, display: isMobile ? 'none' : 'block' }}>
              Welcome, {username || 'Admin'}
            </span>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: PURPLE_ACCENT,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700,
            }}>
              {(username || 'AD').charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              style={{ ...btnGhost, color: '#dc2626', borderColor: '#fecaca', padding: '6px 12px', fontSize: 11 }}
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: 24, maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: TEXT_DARK }}>
              {pageHeaders[activeTab]?.title}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: TEXT_MEDIUM }}>
              {pageHeaders[activeTab]?.desc}
            </p>
          </div>

          {activeTab === 'analytics' && <AnalyticsTab api={api} showToast={showToast} />}
          {activeTab === 'products' && <ProductsTab api={api} showToast={showToast} />}
          {activeTab === 'users' && <UsersTab api={api} showToast={showToast} />}
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────── ANALYTICS TAB ────────────────────────── */
function AnalyticsTab({ api, showToast }) {
  const [dailyDate, setDailyDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dailyResult, setDailyResult] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [monthlyYear, setMonthlyYear] = useState(() => new Date().getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState(() => new Date().getMonth() + 1);
  const [monthlyResult, setMonthlyResult] = useState(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [yearlyYear, setYearlyYear] = useState(() => new Date().getFullYear());
  const [yearlyResult, setYearlyResult] = useState(null);
  const [yearlyLoading, setYearlyLoading] = useState(false);
  const [overallResult, setOverallResult] = useState(null);
  const [overallLoading, setOverallLoading] = useState(false);
  const [bestSelling, setBestSelling] = useState([]);
  const [bestLoading, setBestLoading] = useState(false);
  const [bestLoaded, setBestLoaded] = useState(false);

  const fmt = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fetchBestSelling = async () => {
    setBestLoading(true);
    const res = await api('/api/admin/analytics/best-selling');
    setBestLoading(false);
    setBestLoaded(true);
    if (res.ok) setBestSelling(res.data || []);
    else showToast(res.data?.message || 'Failed to load best-selling products');
  };

  const fetchDaily = async () => {
    setDailyLoading(true);
    const res = await api(`/api/admin/analytics/daily?date=${dailyDate}`);
    setDailyLoading(false);
    if (res.ok) setDailyResult(res.data);
    else showToast(res.data?.message || 'Failed to load daily revenue');
  };

  const fetchMonthly = async () => {
    setMonthlyLoading(true);
    const res = await api(`/api/admin/analytics/monthly?year=${monthlyYear}&month=${monthlyMonth}`);
    setMonthlyLoading(false);
    if (res.ok) setMonthlyResult(res.data);
    else showToast(res.data?.message || 'Failed to load monthly revenue');
  };

  const fetchYearly = async () => {
    setYearlyLoading(true);
    const res = await api(`/api/admin/analytics/yearly?year=${yearlyYear}`);
    setYearlyLoading(false);
    if (res.ok) setYearlyResult(res.data);
    else showToast(res.data?.message || 'Failed to load yearly revenue');
  };

  const fetchOverall = async () => {
    setOverallLoading(true);
    const res = await api('/api/admin/analytics/overall');
    setOverallLoading(false);
    if (res.ok) setOverallResult(res.data);
    else showToast(res.data?.message || 'Failed to load overall revenue');
  };

  const StatCard = ({ title, result, loading, icon: Icon, accentColor, onFetch, periodLabel }) => (
    <div style={{ ...cardStyle, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, color: TEXT_DARK, fontSize: 15, fontWeight: 600 }}>{title}</h3>
          <p style={{ margin: '3px 0 0', fontSize: 11, color: TEXT_MEDIUM }}>{periodLabel || 'Not loaded'}</p>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${accentColor}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={accentColor} />
        </div>
      </div>
      {loading ? (
        <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={20} color={MUTED} style={{ animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : result ? (
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: TEXT_DARK, marginBottom: 2 }}>₹{fmt(result.totalRevenue)}</div>
          <div style={{ fontSize: 12, color: TEXT_MEDIUM }}>{result.orderCount} orders</div>
        </div>
      ) : (
        <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${CARD_BORDER}`, borderRadius: 8, color: MUTED, fontSize: 12 }}>
          —
        </div>
      )}
      <button onClick={onFetch} disabled={loading} style={{ ...btnPrimary, ...btnSmall, marginTop: 14, width: '100%', justifyContent: 'center', opacity: loading ? 0.6 : 1 }}>
        {loading ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Loading...</> : `Get ${title.replace(' Revenue', '')} Revenue`}
      </button>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Overall Revenue */}
      <div style={{ ...cardStyle, padding: 28, marginBottom: 24, background: 'linear-gradient(135deg, #f0fdfa, #ecfdf5)', border: '1px solid #99f6e4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, color: TEXT_DARK, fontSize: 17, fontWeight: 600 }}>Overall Revenue</h3>
            <p style={{ margin: '3px 0 0', fontSize: 11, color: TEXT_MEDIUM }}>All-time successful orders</p>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `${PURPLE_ACCENT}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={22} color={PURPLE_ACCENT} />
          </div>
        </div>
        {overallLoading ? (
          <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 8, color: TEXT_MEDIUM, fontSize: 13 }}>
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Loading revenue data...
          </div>
        ) : overallResult ? (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 38, fontWeight: 700, color: TEXT_DARK }}>₹{fmt(overallResult.totalRevenue)}</div>
            <div style={{ fontSize: 13, color: TEXT_MEDIUM, marginTop: 4 }}>{overallResult.orderCount} orders processed</div>
          </div>
        ) : (
          <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${CARD_BORDER}`, borderRadius: 10, color: MUTED, fontSize: 13, marginBottom: 16 }}>
            Click below to load revenue data
          </div>
        )}
        <button onClick={fetchOverall} disabled={overallLoading} style={{ ...btnPrimary, opacity: overallLoading ? 0.6 : 1 }}>
          {overallLoading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading...</> : <><DollarSign size={14} /> Get Overall Revenue</>}
        </button>
      </div>

      {/* Period Revenue Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 24 }}>
        <StatCard title="Daily Revenue" result={dailyResult} loading={dailyLoading} icon={Calendar} accentColor={BLUE_ACCENT} onFetch={fetchDaily} periodLabel={dailyDate} />
        <StatCard title="Monthly Revenue" result={monthlyResult} loading={monthlyLoading} icon={TrendingUp} accentColor={PURPLE_ACCENT} onFetch={fetchMonthly} periodLabel={`${monthlyYear}-${String(monthlyMonth).padStart(2, '0')}`} />
        <StatCard title="Yearly Revenue" result={yearlyResult} loading={yearlyLoading} icon={BarChart3} accentColor={GREEN_UP} onFetch={fetchYearly} periodLabel={String(yearlyYear)} />
      </div>

      {/* Best-Selling Products */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, color: TEXT_DARK, fontSize: 16, fontWeight: 600 }}>Top 5 Best-Selling Products</h3>
            <p style={{ margin: '3px 0 0', fontSize: 11, color: TEXT_MEDIUM }}>Ranked by total units sold</p>
          </div>
          <button onClick={fetchBestSelling} disabled={bestLoading} style={{ ...btnPrimary, opacity: bestLoading ? 0.6 : 1 }}>
            {bestLoading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading...</> : <><Trophy size={14} /> Load Best Sellers</>}
          </button>
        </div>
        {bestLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4,5].map(i => <SkeletonRow key={i} height={52} />)}
          </div>
        ) : !bestLoaded ? (
          <div style={{ textAlign: 'center', padding: 32, border: `1px dashed ${CARD_BORDER}`, borderRadius: 10, color: MUTED, fontSize: 13 }}>
            Click "Load Best Sellers" to view top products
          </div>
        ) : bestSelling.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, border: `1px dashed ${CARD_BORDER}`, borderRadius: 10, color: MUTED, fontSize: 13 }}>
            No sales data yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bestSelling.map((item, i) => (
              <div key={item.productId} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                background: i === 0 ? '#fff7ed' : '#fff', border: `1px solid ${i === 0 ? '#fed7aa' : CARD_BORDER}`,
                borderRadius: 12,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: i === 0 ? PRIMARY : `${PRIMARY}10`, color: i === 0 ? '#fff' : PRIMARY,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
                }}>
                  {i === 0 ? <Trophy size={14} /> : i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: TEXT_DARK, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: TEXT_MEDIUM }}>₹{fmt(item.price)} / unit</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: PRIMARY, fontSize: 14 }}>{item.totalQuantity} sold</div>
                  <div style={{ fontSize: 11, color: GREEN_UP, fontWeight: 600 }}>₹{fmt(item.totalRevenue)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revenue Filters */}
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 16px', color: TEXT_DARK, fontSize: 16, fontWeight: 600 }}>Revenue Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <label style={labelStyle}>Daily Date</label>
            <input style={inputStyle} type="date" value={dailyDate} onChange={e => setDailyDate(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Monthly Year</label>
            <input style={inputStyle} type="number" min="2000" max="2100" value={monthlyYear} onChange={e => setMonthlyYear(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Monthly Month</label>
            <input style={inputStyle} type="number" min="1" max="12" value={monthlyMonth} onChange={e => setMonthlyMonth(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Yearly Year</label>
            <input style={inputStyle} type="number" min="2000" max="2100" value={yearlyYear} onChange={e => setYearlyYear(e.target.value)} />
          </div>
        </div>
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('name-az');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    const [catRes, prodRes] = await Promise.all([api('/api/categories'), api('/api/products')]);
    setCategories(catRes.data || []);
    setProducts(prodRes.data || []);
    setLoading(false);
  }, [api]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const dedupedProducts = useMemo(() => {
    const seen = new Set();
    return products.filter(p => {
      const key = (p.name || '').trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...dedupedProducts];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.categoryName || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }
    if (filterCategory) result = result.filter(p => String(p.categoryId) === filterCategory);
    if (filterLowStock) result = result.filter(p => p.stock != null && p.stock < LOW_STOCK_THRESHOLD);
    switch (sortOption) {
      case 'price-asc': result.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
      case 'price-desc': result.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
      case 'stock-asc': result.sort((a, b) => (a.stock || 0) - (b.stock || 0)); break;
      case 'stock-desc': result.sort((a, b) => (b.stock || 0) - (a.stock || 0)); break;
      case 'name-az': result.sort((a, b) => (a.name || '').localeCompare(b.name || '')); break;
      case 'name-za': result.sort((a, b) => (b.name || '').localeCompare(a.name || '')); break;
    }
    return result;
  }, [dedupedProducts, searchQuery, filterCategory, filterLowStock, sortOption]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageProducts = useMemo(() => {
    const start = (safePage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, safePage]);

  const lowStockCount = dedupedProducts.filter(p => p.stock != null && p.stock < LOW_STOCK_THRESHOLD).length;

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await api('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify({
        name: form.name, description: form.description,
        price: Number(form.price), stock: Number(form.stock),
        categoryId: Number(form.categoryId), imageUrl: form.imageUrl || null,
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
    setDeleteTarget(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const res = await api(`/api/admin/products/${deleteTarget.productId}`, { method: 'DELETE' });
    setShowDeleteModal(false);
    setDeleteTarget(null);
    if (res.ok) {
      showToast('Product deleted', 'success');
      fetchAll();
    } else {
      showToast(res.data?.message || 'Failed to delete product');
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    let deleted = 0;
    for (const id of ids) {
      const res = await api(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) deleted++;
    }
    setSelectedIds(new Set());
    showToast(`Deleted ${deleted} product${deleted !== 1 ? 's' : ''}`, 'success');
    fetchAll();
  };

  const startEdit = (product) => {
    setEditingProduct(product.productId);
    setEditForm({ name: product.name, description: product.description || '', price: product.price, stock: product.stock, categoryId: product.categoryId, imageUrl: (product.images && product.images[0]) || '' });
  };

  const saveEdit = async (productId) => {
    setEditSaving(true);
    const res = await api(`/api/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: editForm.name, description: editForm.description,
        price: Number(editForm.price), stock: Number(editForm.stock),
        categoryId: Number(editForm.categoryId), imageUrl: editForm.imageUrl || null,
      }),
    });
    setEditSaving(false);
    if (res.ok) {
      showToast('Product updated', 'success');
      setEditingProduct(null);
      fetchAll();
    } else {
      showToast(res.data?.message || 'Failed to update product');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pageProducts.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(pageProducts.map(p => p.productId)));
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const pageNumbers = useMemo(() => {
    const nums = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - safePage) <= 1) nums.push(i);
    }
    const result = [];
    let prev = 0;
    nums.forEach(n => { if (n - prev > 1) result.push('…'); result.push(n); prev = n; });
    return result;
  }, [totalPages, safePage]);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <ConfirmModal open={showDeleteModal} title="Delete Product" danger
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete} onCancel={() => { setShowDeleteModal(false); setDeleteTarget(null); }} />

      {/* Add Product Form */}
      <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #fff5f0, #fffbeb)', border: '1px solid #ffcc80' }}>
        <h3 style={{ margin: '0 0 4px', color: '#7a3e00', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={18} /> Add New Product
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: 12, color: '#8a6d4b' }}>Create a new product for your store.</p>
        <form onSubmit={handleAddProduct} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
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
                {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: 56, resize: 'vertical' }} name="description" value={form.description} onChange={handleChange} placeholder="A short description" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, marginTop: 14, alignItems: 'start' }}>
            <div>
              <label style={labelStyle}>Image URL (optional)</label>
              <input style={inputStyle} name="imageUrl" value={form.imageUrl || ''} onChange={handleChange} placeholder="https://example.com/image.jpg" />
            </div>
            <div style={{ paddingTop: 18 }}>
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="Preview" onError={e => { e.target.src = PLACEHOLDER_IMG; }} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', border: `1px solid ${CARD_BORDER}` }} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: 10, border: `1px dashed ${CARD_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>
                  <Image size={18} />
                </div>
              )}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
              {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Adding...</> : <><Plus size={14} /> Add Product</>}
            </button>
          </div>
        </form>
      </div>

      {/* Products List */}
      <div style={cardStyle}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ margin: 0, color: TEXT_DARK, fontSize: 16 }}>
            Products ({filteredProducts.length})
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {selectedIds.size > 0 && (
              <button onClick={() => { if (window.confirm(`Delete ${selectedIds.size} selected product(s)?`)) handleBulkDelete(); }} style={{ ...btnDanger, ...btnSmall }}>
                <Trash2 size={13} /> Delete Selected ({selectedIds.size})
              </button>
            )}
            <button onClick={() => exportToCSV(dedupedProducts, 'products.csv', [
              { key: 'productId', header: 'ID' }, { key: 'name', header: 'Name' },
              { key: 'categoryName', header: 'Category' }, { key: 'price', header: 'Price' },
              { key: 'stock', header: 'Stock' },
            ])} style={{ ...btnPrimary, ...btnSmall }} disabled={dedupedProducts.length === 0}>
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockCount > 0 && (
          <button onClick={() => setFilterLowStock(!filterLowStock)} style={{
            width: '100%', backgroundColor: filterLowStock ? '#fde68a' : '#fef3c7',
            border: `1px solid ${filterLowStock ? '#f59e0b' : '#fbbf24'}`,
            borderRadius: 10, padding: '10px 16px', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            fontSize: 13, color: '#92400e', fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: 'all 0.2s ease',
          }}>
            <AlertTriangle size={16} />
            <span style={{ fontWeight: 600 }}>Low Stock Alert:</span>
            <span>{lowStockCount} product{lowStockCount !== 1 ? 's' : ''} below {LOW_STOCK_THRESHOLD} units</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: PRIMARY, fontWeight: 600 }}>{filterLowStock ? 'Clear filter' : 'Click to filter'}</span>
          </button>
        )}

        {/* Search + Sort + Filter */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 220px', position: 'relative' }}>
            <Search size={14} color={MUTED} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              style={{ ...inputStyle, paddingLeft: 34 }}
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <select style={{ ...inputStyle, width: 'auto', minWidth: 140 }} value={sortOption} onChange={e => setSortOption(e.target.value)}>
            <option value="name-az">Name: A–Z</option>
            <option value="name-za">Name: Z–A</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="stock-asc">Stock: Low → High</option>
            <option value="stock-desc">Stock: High → Low</option>
          </select>
          <select style={{ ...inputStyle, width: 'auto', minWidth: 140 }} value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1,2,3,4,5,6].map(i => <SkeletonRow key={i} />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: MUTED, fontSize: 13 }}>
            <Package size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p>No products found</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: TEXT_MEDIUM, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <th style={{ padding: '8px 10px', borderBottom: `1px solid ${CARD_BORDER}`, width: 36 }}>
                      <input type="checkbox" checked={selectedIds.size === pageProducts.length && pageProducts.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer' }} />
                    </th>
                    <th style={{ padding: '8px 10px', borderBottom: `1px solid ${CARD_BORDER}` }}>Product</th>
                    <th style={{ padding: '8px 10px', borderBottom: `1px solid ${CARD_BORDER}` }}>Category</th>
                    <th style={{ padding: '8px 10px', borderBottom: `1px solid ${CARD_BORDER}` }}>Price</th>
                    <th style={{ padding: '8px 10px', borderBottom: `1px solid ${CARD_BORDER}` }}>Stock</th>
                    <th style={{ padding: '8px 10px', borderBottom: `1px solid ${CARD_BORDER}`, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageProducts.map(p => {
                    const img = (p.images && p.images[0]) || PLACEHOLDER_IMG;
                    const isLow = p.stock != null && p.stock < LOW_STOCK_THRESHOLD;
                    const isOut = p.stock === 0;
                    const isEditing = editingProduct === p.productId;
                    return (
                      <tr key={p.productId} style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
                        <td style={{ padding: '10px' }}>
                          <input type="checkbox" checked={selectedIds.has(p.productId)} onChange={() => toggleSelect(p.productId)} style={{ cursor: 'pointer' }} />
                        </td>
                        <td style={{ padding: '10px' }}>
                          {isEditing ? (
                            <input style={{ ...inputStyle, fontSize: 12, padding: '6px 8px' }} value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img src={img} alt="" onError={e => { e.target.src = PLACEHOLDER_IMG; }} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: `1px solid ${CARD_BORDER}`, flexShrink: 0, background: '#f8f5f2' }} />
                              <div>
                                <div style={{ fontWeight: 600, color: TEXT_DARK, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {p.name}
                                  {isLow && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 8, background: isOut ? '#fef2f2' : '#fef3c7', color: isOut ? '#dc2626' : '#92400e', textTransform: 'uppercase' }}>{isOut ? 'Out' : 'Low'}</span>}
                                </div>
                                <div style={{ fontSize: 11, color: TEXT_MEDIUM }}>ID: {p.productId}</div>
                              </div>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px', color: TEXT_MEDIUM, fontSize: 12 }}>
                          {isEditing ? (
                            <select style={{ ...inputStyle, fontSize: 12, padding: '6px 8px' }} value={editForm.categoryId} onChange={e => setEditForm(prev => ({ ...prev, categoryId: e.target.value }))}>
                              {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                            </select>
                          ) : (p.categoryName || '—')}
                        </td>
                        <td style={{ padding: '10px', fontWeight: 600, color: TEXT_DARK }}>
                          {isEditing ? (
                            <input style={{ ...inputStyle, fontSize: 12, padding: '6px 8px', width: 90 }} type="number" min="0" step="0.01" value={editForm.price} onChange={e => setEditForm(prev => ({ ...prev, price: e.target.value }))} />
                          ) : (`₹${Number(p.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`)}
                        </td>
                        <td style={{ padding: '10px' }}>
                          {isEditing ? (
                            <input style={{ ...inputStyle, fontSize: 12, padding: '6px 8px', width: 70 }} type="number" min="0" value={editForm.stock} onChange={e => setEditForm(prev => ({ ...prev, stock: e.target.value }))} />
                          ) : (
                            <span style={{ fontWeight: 600, color: isOut ? '#dc2626' : isLow ? '#b45309' : TEXT_DARK }}>{p.stock}</span>
                          )}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button onClick={() => saveEdit(p.productId)} disabled={editSaving} style={{ ...btnPrimary, ...btnSmall, opacity: editSaving ? 0.6 : 1 }}>
                                {editSaving ? '...' : <><Check size={12} /> Save</>}
                              </button>
                              <button onClick={() => setEditingProduct(null)} style={{ ...btnGhost, ...btnSmall }}>Cancel</button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button onClick={() => startEdit(p)} style={{ ...btnGhost, ...btnSmall }}><Edit3 size={12} /> Edit</button>
                              <button onClick={() => handleDelete(p)} style={{ ...btnDanger, ...btnSmall }}><Trash2 size={12} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 20 }}>
                <button onClick={() => { setCurrentPage(safePage - 1); }} disabled={safePage === 1} style={{ ...btnGhost, ...btnSmall, opacity: safePage === 1 ? 0.4 : 1 }}>
                  <ChevronLeft size={14} /> Prev
                </button>
                {pageNumbers.map((n, i) => n === '…' ? (
                  <span key={`e${i}`} style={{ fontSize: 12, color: MUTED, padding: '0 4px' }}>…</span>
                ) : (
                  <button key={n} onClick={() => setCurrentPage(n)} style={{
                    ...btnSmall, border: 'none', width: 32, height: 32, borderRadius: 8, justifyContent: 'center',
                    background: n === safePage ? PRIMARY : '#fff', color: n === safePage ? '#fff' : TEXT_DARK,
                    boxShadow: n === safePage ? '0 2px 6px rgba(155,69,0,0.2)' : `0 1px 3px rgba(0,0,0,0.06)`,
                    fontWeight: 700, fontSize: 12,
                  }}>{n}</button>
                ))}
                <button onClick={() => { setCurrentPage(safePage + 1); }} disabled={safePage === totalPages} style={{ ...btnGhost, ...btnSmall, opacity: safePage === totalPages ? 0.4 : 1 }}>
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────── USERS TAB ──────────────────────────── */
function UsersTab({ api, showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', role: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkRoleModal, setBulkRoleModal] = useState(false);
  const [bulkRole, setBulkRole] = useState('CUSTOMER');

  const fetchUsers = useCallback(async () => {
    const res = await api('/api/admin/users');
    if (res.ok) setUsers(res.data || []);
    else showToast(res.data?.message || 'Failed to load users');
    setLoading(false);
  }, [api, showToast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u =>
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageUsers = useMemo(() => {
    const start = (safePage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, safePage]);

  const pageNumbers = useMemo(() => {
    const nums = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - safePage) <= 1) nums.push(i);
    }
    const result = [];
    let prev = 0;
    nums.forEach(n => { if (n - prev > 1) result.push('…'); result.push(n); prev = n; });
    return result;
  }, [totalPages, safePage]);

  const startEdit = (user) => {
    setEditingId(user.userId);
    setEditForm({ username: user.username, email: user.email, role: user.role });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({ username: '', email: '', role: '' }); };

  const saveEdit = async (userId) => {
    const payload = {};
    if (editForm.username.trim()) payload.username = editForm.username.trim();
    if (editForm.email.trim()) payload.email = editForm.email.trim();
    if (editForm.role) payload.role = editForm.role;
    const res = await api(`/api/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify(payload) });
    if (res.ok) { showToast('User updated', 'success'); cancelEdit(); fetchUsers(); }
    else showToast(res.data?.message || 'Failed to update user');
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    const res = await api(`/api/admin/users/${deleteTarget.userId}`, { method: 'DELETE' });
    setShowDeleteModal(false);
    setDeleteTarget(null);
    if (res.ok) { showToast('User deleted', 'success'); fetchUsers(); }
    else showToast(res.data?.message || 'Failed to delete user');
  };

  const handleBulkRoleChange = async () => {
    const ids = [...selectedIds];
    let updated = 0;
    for (const id of ids) {
      const res = await api(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify({ role: bulkRole }) });
      if (res.ok) updated++;
    }
    setSelectedIds(new Set());
    setBulkRoleModal(false);
    showToast(`Updated ${updated} user(s) to ${bulkRole}`, 'success');
    fetchUsers();
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pageUsers.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(pageUsers.map(u => u.userId)));
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const avatarColors = ['#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <ConfirmModal open={showDeleteModal} title="Delete User" danger
        message={`Are you sure you want to delete "${deleteTarget?.username}"? This action cannot be undone.`}
        onConfirm={handleDeleteUser} onCancel={() => { setShowDeleteModal(false); setDeleteTarget(null); }} />

      <ConfirmModal open={bulkRoleModal} title="Change Bulk Role"
        message={`Change ${selectedIds.size} selected user(s) to role: ${bulkRole}?`}
        onConfirm={handleBulkRoleChange} onCancel={() => setBulkRoleModal(false)} />

      <div style={cardStyle}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ margin: 0, color: TEXT_DARK, fontSize: 16 }}>Users ({filteredUsers.length})</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {selectedIds.size > 0 && (
              <>
                <button onClick={() => setBulkRoleModal(true)} style={{ ...btnGhost, ...btnSmall }}>
                  <Shield size={13} /> Change Role ({selectedIds.size})
                </button>
                <button onClick={() => { if (window.confirm(`Delete ${selectedIds.size} selected user(s)?`)) { selectedIds.forEach(id => api(`/api/admin/users/${id}`, { method: 'DELETE' })); setSelectedIds(new Set()); fetchUsers(); showToast('Users deleted', 'success'); } }} style={{ ...btnDanger, ...btnSmall }}>
                  <Trash2 size={13} /> Delete Selected ({selectedIds.size})
                </button>
              </>
            )}
            <button onClick={() => exportToCSV(users, 'users.csv', [
              { key: 'userId', header: 'ID' }, { key: 'username', header: 'Username' },
              { key: 'email', header: 'Email' }, { key: 'role', header: 'Role' },
              { key: 'createdAt', header: 'Created At' },
            ])} style={{ ...btnPrimary, ...btnSmall }} disabled={users.length === 0}>
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 14, position: 'relative', maxWidth: 360 }}>
          <Search size={14} color={MUTED} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            style={{ ...inputStyle, paddingLeft: 34 }}
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1,2,3,4,5,6].map(i => <SkeletonRow key={i} />)}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: MUTED, fontSize: 13 }}>
            <Users size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p>No users found</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: TEXT_MEDIUM, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <th style={{ padding: '8px 10px', borderBottom: `1px solid ${CARD_BORDER}`, width: 36 }}>
                      <input type="checkbox" checked={selectedIds.size === pageUsers.length && pageUsers.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer' }} />
                    </th>
                    <th style={{ padding: '8px 10px', borderBottom: `1px solid ${CARD_BORDER}` }}>User</th>
                    <th style={{ padding: '8px 10px', borderBottom: `1px solid ${CARD_BORDER}` }}>Email</th>
                    <th style={{ padding: '8px 10px', borderBottom: `1px solid ${CARD_BORDER}` }}>Role</th>
                    <th style={{ padding: '8px 10px', borderBottom: `1px solid ${CARD_BORDER}` }}>Created</th>
                    <th style={{ padding: '8px 10px', borderBottom: `1px solid ${CARD_BORDER}`, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageUsers.map(u => {
                    const isEditing = editingId === u.userId;
                    const color = avatarColors[u.userId % avatarColors.length];
                    return (
                      <tr key={u.userId} style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
                        <td style={{ padding: '10px' }}>
                          <input type="checkbox" checked={selectedIds.has(u.userId)} onChange={() => toggleSelect(u.userId)} style={{ cursor: 'pointer' }} />
                        </td>
                        <td style={{ padding: '10px' }}>
                          {isEditing ? (
                            <input style={{ ...inputStyle, fontSize: 12, padding: '6px 8px' }} value={editForm.username} onChange={e => setEditForm(prev => ({ ...prev, username: e.target.value }))} />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 34, height: 34, borderRadius: '50%', background: color,
                                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 700, flexShrink: 0,
                              }}>{getInitials(u.username)}</div>
                              <span style={{ fontWeight: 600, color: TEXT_DARK, fontSize: 13 }}>{u.username}</span>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px' }}>
                          {isEditing ? (
                            <input style={{ ...inputStyle, fontSize: 12, padding: '6px 8px' }} value={editForm.email} onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))} />
                          ) : (
                            <span style={{ color: TEXT_MEDIUM, fontSize: 12 }}>{u.email}</span>
                          )}
                        </td>
                        <td style={{ padding: '10px' }}>
                          {isEditing ? (
                            <select style={{ ...inputStyle, fontSize: 12, padding: '6px 8px', width: 110 }} value={editForm.role} onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value }))}>
                              <option value="CUSTOMER">CUSTOMER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          ) : (
                            <span style={{
                              padding: '3px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                              background: u.role === 'ADMIN' ? '#fdeee2' : '#eef2f0',
                              color: u.role === 'ADMIN' ? PRIMARY : '#2f6b4f',
                              textTransform: 'uppercase', letterSpacing: '0.05em',
                            }}>{u.role}</span>
                          )}
                        </td>
                        <td style={{ padding: '10px', color: TEXT_MEDIUM, fontSize: 12 }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button onClick={() => saveEdit(u.userId)} style={{ ...btnPrimary, ...btnSmall }}><Check size={12} /> Save</button>
                              <button onClick={cancelEdit} style={{ ...btnGhost, ...btnSmall }}>Cancel</button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button onClick={() => startEdit(u)} style={{ ...btnGhost, ...btnSmall }}><Edit3 size={12} /> Edit</button>
                              <button onClick={() => { setDeleteTarget(u); setShowDeleteModal(true); }} style={{ ...btnDanger, ...btnSmall }}><Trash2 size={12} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 20 }}>
                <button onClick={() => setCurrentPage(safePage - 1)} disabled={safePage === 1} style={{ ...btnGhost, ...btnSmall, opacity: safePage === 1 ? 0.4 : 1 }}>
                  <ChevronLeft size={14} /> Prev
                </button>
                {pageNumbers.map((n, i) => n === '…' ? (
                  <span key={`e${i}`} style={{ fontSize: 12, color: MUTED, padding: '0 4px' }}>…</span>
                ) : (
                  <button key={n} onClick={() => setCurrentPage(n)} style={{
                    ...btnSmall, border: 'none', width: 32, height: 32, borderRadius: 8, justifyContent: 'center',
                    background: n === safePage ? PRIMARY : '#fff', color: n === safePage ? '#fff' : TEXT_DARK,
                    boxShadow: n === safePage ? '0 2px 6px rgba(155,69,0,0.2)' : `0 1px 3px rgba(0,0,0,0.06)`,
                    fontWeight: 700, fontSize: 12,
                  }}>{n}</button>
                ))}
                <button onClick={() => setCurrentPage(safePage + 1)} disabled={safePage === totalPages} style={{ ...btnGhost, ...btnSmall, opacity: safePage === totalPages ? 0.4 : 1 }}>
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
