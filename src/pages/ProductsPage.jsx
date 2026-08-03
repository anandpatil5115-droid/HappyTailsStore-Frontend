import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';

const PRIMARY = '#9b4500';
const PRIMARY_LIGHT = '#ff914d';
const CREAM = '#fcf9f4';
const BROWN = '#564339';
const MUTED = '#dcc1b4';
const API_BASE = 'http://localhost:8080';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Pet Parent';

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    fetchCategories();
    fetchProducts();
    fetchCart();
  }, [token, navigate]);

  useEffect(() => {
    if (!selectedProduct) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProduct]);

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
      }
    } catch (err) {
      // ignore
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`, {
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
        ? `${API_BASE}/api/products/category/${categoryId}`
        : `${API_BASE}/api/products`;
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

  const addToCart = async (productId, e) => {
    e.stopPropagation();
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

  const buyNow = async (productId, e) => {
    e.stopPropagation();
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
        navigate('/checkout');
      }
    } catch (err) {
      showToast('Failed to add to cart');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('authToken');
    navigate('/login', { replace: true });
  };

  return (
    <div className="products-page" style={{ minHeight: '100vh', backgroundColor: CREAM, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <nav className="products-navbar" style={{ backgroundColor: PRIMARY, color: '#fff', padding: '12px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div 
          onClick={() => navigate('/products')}
          style={{ 
            fontSize: '22px', 
            fontFamily: "'Quicksand', sans-serif", 
            fontWeight: '700',
            letterSpacing: '-0.02em',
            cursor: 'pointer'
          }}
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

          <button 
            onClick={logout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#fff',
              color: PRIMARY,
              border: 'none',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            Logout
          </button>
        </div>
      </nav>

      {toast && (
        <div style={{
          position: 'fixed',
          top: 70,
          right: 32,
          backgroundColor: '#4caf50',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: 12,
          fontSize: 14,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 200
        }}>
          {toast}
        </div>
      )}

      <div className="products-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        <h1 style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: 28,
          fontWeight: 700,
          color: PRIMARY,
          marginBottom: 24,
          letterSpacing: '-0.01em',
          textAlign: 'center'
        }}>
          Product Catalog
        </h1>

        {categories.length > 0 && (
          <div className="category-filters" style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 32
          }}>
            <button
              onClick={() => handleCategorySelect(null)}
              style={{
                padding: '10px 20px',
                borderRadius: 24,
                border: 'none',
                background: selectedCategory === null ? PRIMARY : '#fff',
                color: selectedCategory === null ? '#fff' : BROWN,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: selectedCategory === null ? '0 4px 8px rgba(155,69,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => {
                if (selectedCategory !== null) e.target.style.background = PRIMARY;
                e.target.style.color = '#fff';
              }}
              onMouseOut={(e) => {
                if (selectedCategory !== null) e.target.style.background = '#fff';
                e.target.style.color = BROWN;
              }}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.categoryId}
                onClick={() => handleCategorySelect(cat.categoryId)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 24,
                  border: 'none',
                  background: selectedCategory === cat.categoryId ? PRIMARY : '#fff',
                  color: selectedCategory === cat.categoryId ? '#fff' : BROWN,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedCategory === cat.categoryId ? '0 4px 8px rgba(155,69,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseOver={(e) => {
                  if (selectedCategory !== cat.categoryId) {
                    e.target.style.background = PRIMARY_LIGHT;
                    e.target.style.color = '#fff';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedCategory !== cat.categoryId) {
                    e.target.style.background = '#fff';
                    e.target.style.color = BROWN;
                  }
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24,
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} style={{
                borderRadius: 16,
                background: '#fff',
                height: 380,
                animation: 'fadeInUp 0.5s ease forwards',
                animationDelay: `${i * 0.05}s`,
                opacity: 0,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", color: BROWN }}>
            <p style={{ fontSize: 18, marginBottom: 8 }}>No products found</p>
            <p style={{ fontSize: 14, color: MUTED }}>Try selecting a different category</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {products.map((product) => (
              <div 
                key={product.productId} 
                onClick={() => setSelectedProduct(product)}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
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
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 14
                  }}>
                    🐾 Product Image
                  </div>
                )}
                <div style={{
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1
                }}>
                  <h3 style={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontSize: 18,
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
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flex: 1
                  }}>
                    {product.description || ''}
                  </p>
                   <div style={{
                     display: 'flex',
                     flexDirection: 'column',
                     gap: 8
                   }}>
                     <div style={{
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'space-between'
                     }}>
                       <span style={{
                         fontFamily: "'Plus Jakarta Sans', sans-serif",
                         fontSize: 20,
                         fontWeight: 700,
                         color: PRIMARY,
                       }}>
                          ₹{product.price != null ? product.price.toFixed(2) : '—'}
                       </span>
                       <span style={{
                         fontSize: 11,
                         fontWeight: 600,
                         padding: '6px 12px',
                         borderRadius: 20,
                         background: product.stock != null && product.stock > 0 ? '#e8f5e9' : '#fce4e4',
                         color: product.stock != null && product.stock > 0 ? '#2e7d32' : '#c62828',
                         letterSpacing: '0.02em',
                         fontFamily: "'Plus Jakarta Sans', sans-serif"
                       }}>
                         {product.stock != null && product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                       </span>
                     </div>

                     {product.stock != null && product.stock > 0 ? (
                       <div style={{
                         display: 'flex',
                         gap: 8,
                         marginTop: 12
                       }}>
                         <button
                           onClick={(e) => addToCart(product.productId, e)}
                           style={{
                             flex: 1,
                             padding: '8px 12px',
                             border: `2px solid ${PRIMARY}`,
                             background: 'transparent',
                             color: PRIMARY,
                             borderRadius: 20,
                             fontSize: 12,
                             fontWeight: 600,
                             fontFamily: "'Plus Jakarta Sans', sans-serif",
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
                         <button
                           onClick={(e) => buyNow(product.productId, e)}
                           style={{
                             flex: 1,
                             padding: '8px 12px',
                             border: 'none',
                             background: PRIMARY,
                             color: '#fff',
                             borderRadius: 20,
                             fontSize: 12,
                             fontWeight: 600,
                             fontFamily: "'Plus Jakarta Sans', sans-serif",
                             cursor: 'pointer',
                             transition: 'all 0.2s ease'
                           }}
                           onMouseOver={(e) => {
                             e.target.style.background = PRIMARY_LIGHT;
                             e.target.style.transform = 'translateY(-1px)';
                           }}
                           onMouseOut={(e) => {
                             e.target.style.background = PRIMARY;
                             e.target.style.transform = 'translateY(0)';
                           }}
                         >
                           Buy Now
                         </button>
                       </div>
                     ) : (
                       <button
                         disabled
                         style={{
                           width: '100%',
                           padding: '8px 12px',
                           border: 'none',
                           background: '#f5f0eb',
                           color: '#999',
                           borderRadius: 20,
                           fontSize: 12,
                           fontWeight: 600,
                           fontFamily: "'Plus Jakarta Sans', sans-serif",
                           cursor: 'not-allowed',
                           marginTop: 12
                         }}
                       >
                         Out of Stock
                       </button>
                     )}
                    </div>
                    </div>
                  </div>
                ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedProduct(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(28, 28, 25, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
            padding: 24
          }}
        >
          <div
            className="modal-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(20px) saturate(150%)',
              WebkitBackdropFilter: 'blur(20px) saturate(150%)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 24,
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              maxWidth: 720,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              animation: 'modalPop 0.25s ease forwards'
            }}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(155,69,0,0.08)',
                color: PRIMARY,
                fontSize: 18,
                lineHeight: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                zIndex: 2
              }}
              onMouseOver={(e) => {
                e.target.style.background = PRIMARY;
                e.target.style.color = '#fff';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(155,69,0,0.08)';
                e.target.style.color = PRIMARY;
              }}
            >
              ✕
            </button>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24
            }}>
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <img
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: 400,
                    objectFit: 'contain',
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    backgroundColor: '#f8f5f2'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: 280,
                  background: '#f8f5f2',
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: MUTED,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 14
                }}>
                  🐾 Product Image
                </div>
              )}

              <div style={{ padding: '0 28px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                  <h2 style={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontSize: 26,
                    fontWeight: 700,
                    color: PRIMARY,
                    margin: 0,
                    lineHeight: 1.3
                  }}>
                    {selectedProduct.name}
                  </h2>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '6px 14px',
                    borderRadius: 20,
                    background: selectedProduct.stock != null && selectedProduct.stock > 0 ? '#e8f5e9' : '#fce4e4',
                    color: selectedProduct.stock != null && selectedProduct.stock > 0 ? '#2e7d32' : '#c62828',
                    letterSpacing: '0.02em',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    whiteSpace: 'nowrap'
                  }}>
                    {selectedProduct.stock != null && selectedProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 14,
                  color: BROWN,
                  lineHeight: 1.7,
                  margin: 0,
                  marginBottom: 16
                }}>
                  {selectedProduct.description || 'No description available.'}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                  marginBottom: 20
                }}>
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 28,
                    fontWeight: 700,
                    color: PRIMARY
                  }}>
                    ₹{selectedProduct.price != null ? selectedProduct.price.toFixed(2) : '—'}
                  </span>
                  {selectedProduct.stock != null && (
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 13,
                      color: MUTED
                    }}>
                      {selectedProduct.stock} available
                    </span>
                  )}
                </div>

                {selectedProduct.stock != null && selectedProduct.stock > 0 ? (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={(e) => addToCart(selectedProduct.productId, e)}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: `2px solid ${PRIMARY}`,
                        background: 'transparent',
                        color: PRIMARY,
                        borderRadius: 24,
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
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
                    <button
                      onClick={(e) => buyNow(selectedProduct.productId, e)}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: 'none',
                        background: PRIMARY,
                        color: '#fff',
                        borderRadius: 24,
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = PRIMARY_LIGHT;
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = PRIMARY;
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      Buy Now
                    </button>
                  </div>
                ) : (
                  <button
                    disabled
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: '#f5f0eb',
                      color: '#999',
                      borderRadius: 24,
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      cursor: 'not-allowed'
                    }}
                  >
                    Out of Stock
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 1200px) {
          .products-container { max-width: 100%; padding: 24px; }
        }

        @media (max-width: 768px) {
          .products-container { padding: 16px; }
          h1 { font-size: 24px !important; }
          .category-filters { justify-content: flex-start; overflow-x: auto; padding-bottom: 8px; }
        }

        .category-filters button { white-space: nowrap; }
      `}</style>
    </div>
  );
}