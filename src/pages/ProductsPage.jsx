import React, { useState, useEffect } from 'react';
import AuthLayout from '../components/AuthLayout';
import {useNavigate} from 'react-router-dom';

const PRIMARY = '#9b4500';
const PRIMARY_LIGHT = '#ff914d';
const CREAM = '#fcf9f4';
const BROWN = '#564339';
const MUTED = '#dcc1b4';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    fetchCategories();
    fetchProducts();
  }, [token, navigate]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { navigate('/login', { replace: true }); return; }
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const fetchProducts = async (categoryId) => {
    setLoading(true);
    setError(null);
    try {
      const url = categoryId
        ? `http://localhost:8080/api/products/category/${categoryId}`
        : 'http://localhost:8080/api/products';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { navigate('/login', { replace: true }); return; }
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId === selectedCategory ? null : catId);
    fetchProducts(catId === selectedCategory ? null : catId);
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
  };

  const cardImageStyle = {
    width: '100%',
    height: 200,
    objectFit: 'cover',
  };

  const cardBodyStyle = {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  };

  const cardNameStyle = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    color: '#1c1c19',
    margin: 0,
  };

  const cardDescStyle = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 12,
    color: '#564339',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    margin: 0,
  };

  const cardFooterStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  };

  const priceStyle = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 16,
    fontWeight: 700,
    color: PRIMARY,
  };

  const pillStyle = (inStock) => ({
    fontSize: 10,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 20,
    background: inStock ? '#e8f5e9' : '#fce4e4',
    color: inStock ? '#2e7d32' : '#c62828',
    letterSpacing: '0.02em',
  });

  return (
    <AuthLayout>
      <div style={{ padding: '24px 0', maxWidth: '100%', width: '100%' }}>
        <h2 style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: 22,
          fontWeight: 700,
          color: '#1c1c19',
          marginBottom: 16,
          letterSpacing: '-0.01em',
        }}>
          Our Products
        </h2>

        {categories.length > 0 && (
          <div style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 24,
          }}>
            <button
              onClick={() => handleCategorySelect(null)}
              style={{
                padding: '8px 16px',
                borderRadius: 24,
                border: 'none',
                background: selectedCategory === null ? PRIMARY : '#f5f0eb',
                color: selectedCategory === null ? '#fff' : BROWN,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.categoryId}
                onClick={() => handleCategorySelect(cat.categoryId)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 24,
                  border: 'none',
                  background: selectedCategory === cat.categoryId ? PRIMARY : '#f5f0eb',
                  color: selectedCategory === cat.categoryId ? '#fff' : BROWN,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat.categoryName}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div style={{ padding: 32, textAlign: 'center', color: '#dc2626', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 20,
          }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{
                borderRadius: 16,
                background: '#f0ece6',
                height: 320,
                animation: 'fadeInUp 0.5s ease forwards',
                animationDelay: `${i * 0.05}s`,
                opacity: 0,
              }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", color: BROWN }}>
            <p style={{ fontSize: 16, marginBottom: 8 }}>No products found</p>
            <p style={{ fontSize: 12, color: MUTED }}>Try selecting a different category</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 20,
          }}>
            {products.map((product) => (
              <div key={product.productId} style={cardStyle}>
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.name} style={cardImageStyle} />
                ) : (
                  <div style={{ ...cardImageStyle, background: '#f0ece6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14 }}>
                    No Image
                  </div>
                )}
                <div style={cardBodyStyle}>
                  <h3 style={cardNameStyle}>{product.name}</h3>
                  <p style={cardDescStyle}>{product.description || ''}</p>
                  <div style={cardFooterStyle}>
                    <span style={priceStyle}>${product.price != null ? product.price.toFixed(2) : '—'}</span>
                    <span style={pillStyle(product.stock != null && product.stock > 0)}>
                      {product.stock != null && product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </AuthLayout>
  );
}