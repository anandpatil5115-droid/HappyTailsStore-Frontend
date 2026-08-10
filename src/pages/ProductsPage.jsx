import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
const CARD_BORDER = '#e5e5e5';
const CARD_BORDER_LIGHT = '#f0ece6';

const PAGE_SIZE = 12;
const LOW_STOCK_THRESHOLD = 10;

const PLACEHOLDER_IMG =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="#f8f5f2"/><text x="300" y="290" font-size="90" text-anchor="middle">🐾</text><text x="300" y="350" font-size="22" fill="#dcc1b4" text-anchor="middle" font-family="sans-serif">HappyTailsStore</text></svg>`
  );

// Badge logic for stock states.
const badgeFor = (product) => {
  if (product.stock != null && product.stock <= 0) return { label: 'Out of Stock', color: '#c62828', bg: '#fce4e4' };
  if (product.stock != null && product.stock < LOW_STOCK_THRESHOLD) return { label: 'Low Stock', color: '#b45309', bg: '#fef3c7' };
  return null;
};

const StarsDisplay = ({ value, size = 14 }) => {
  const filled = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return (
    <span style={{ color: '#f59e0b', fontSize: size, letterSpacing: '1px', lineHeight: 1, whiteSpace: 'nowrap' }}>
      {'★'.repeat(filled)}
      <span style={{ color: '#e5e5e5' }}>{'★'.repeat(5 - filled)}</span>
    </span>
  );
};

// Reviews section shown inside the product detail modal.
const ReviewsSection = ({ product, token }) => {
  const [reviews, setReviews] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadedPage, setLoadedPage] = useState(0);
  const [last, setLast] = useState(true);

  const productId = product?.productId;

  useEffect(() => {
    if (!productId) return;
    setReviews([]);
    setTotalElements(0);
    setLoadedPage(0);
    setLast(true);
    fetchReviews(0);
  }, [productId]);

  const fetchReviews = async (page) => {
    setLoadingReviews(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/products/${productId}/reviews?page=${page}&size=5`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setReviews((prev) => (page === 0 ? data.content : [...prev, ...data.content]));
        setTotalElements(data.totalElements);
        setLoadedPage(data.page);
        setLast(data.last);
      }
    } catch (err) { /* ignore */ }
    finally {
      setLoadingReviews(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #f0ece6' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <h3 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 19, fontWeight: 700, color: PRIMARY, margin: 0 }}>
          Customer Reviews
        </h3>
        {totalElements > 0 && (
          <span style={{ fontSize: 12, color: MUTED, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {totalElements} review{totalElements !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loadingReviews && reviews.length === 0 ? (
        <div style={{ padding: '18px 0', fontSize: 13, color: MUTED, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Loading reviews…
        </div>
      ) : reviews.length === 0 ? (
        <div style={{ padding: '24px 18px', textAlign: 'center', background: CREAM, borderRadius: 14 }}>
          <p style={{ fontSize: 15, color: BROWN, margin: 0, marginBottom: 6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            🐾 No reviews yet — be the first to share your experience!
          </p>
          <p style={{ fontSize: 12.5, color: MUTED, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Buyers can rate this product from their Order History page.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ display: 'flex', gap: 12, padding: 14, background: '#fcf9f4', borderRadius: 14, border: '1px solid #f0ece6' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #9b4500, #ff914d)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 15, fontFamily: "'Quicksand', sans-serif", flexShrink: 0,
                }}>
                  {(r.userName || 'U').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: BROWN, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {r.userName}
                    </span>
                    {r.verifiedPurchase && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#2e7d32', background: '#e8f5e9',
                        padding: '2px 8px', borderRadius: 10, letterSpacing: '0.03em',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}>
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 6px' }}>
                    <StarsDisplay value={r.rating} />
                    <span style={{ fontSize: 11, color: MUTED, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {formatDate(r.createdAt)}
                    </span>
                  </div>
                  {r.comment && (
                    <p style={{
                      fontSize: 13, color: BROWN, lineHeight: 1.6, margin: 0,
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                      {r.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {!last && (
            <button
              onClick={() => fetchReviews(loadedPage + 1)}
              disabled={loadingReviews}
              style={{
                marginTop: 16, padding: '9px 20px', border: `1.5px solid ${PRIMARY}`, background: 'transparent',
                color: PRIMARY, borderRadius: 20, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                opacity: loadingReviews ? 0.6 : 1,
              }}
            >
              {loadingReviews ? 'Loading…' : 'Load more reviews'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('price-low-high');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [priceMax, setPriceMax] = useState(2000);
  const [wishlist, setWishlist] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [recentCache, setRecentCache] = useState([]);
  const [cartBounce, setCartBounce] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const gridRef = useRef(null);
  const navigate = useNavigate();

  const token = getStoredToken();
  const { username: authUsername, role, logout: authLogout } = useAuth();
  const username = authUsername || 'Pet Parent';
  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    fetchCategories();
    fetchProducts();
    fetchCart();
    loadWishlist();
    loadRecentlyViewed();
    fetchRecentCache();
  }, [token, navigate]);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!showProfile) return;
    const close = () => setShowProfile(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [showProfile]);

  useEffect(() => {
    if (!selectedProduct) return;
    trackRecentlyViewed(selectedProduct.productId);
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedProduct(null);
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
    setCurrentPage(1);
    try {
      const url = categoryId
        ? `${API_BASE}/api/products/category/${categoryId}`
        : `${API_BASE}/api/products`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { navigate('/login', { replace: true }); return; }
      const data = await res.json();
      setAllProducts(data || []);

      if (data && data.length > 0) {
        const maxPrice = Math.max(...data.map(p => Number(p.price) || 0));
        const roundedMax = Math.ceil(maxPrice / 100) * 100;
        setPriceMax(roundedMax || 2000);
        setPriceRange([0, roundedMax || 2000]);
      }
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

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Deduplicate by name (fixes duplicate '4 in 1 Dog Accessories Set') and
  // keep first occurrence only.
  const dedupedProducts = useMemo(() => {
    const seen = new Set();
    return allProducts.filter((p) => {
      const key = (p.name || '').trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...dedupedProducts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (selectedCategory) {
      result = result.filter(p => p.categoryId === selectedCategory);
    }

    result = result.filter(p => {
      const price = Number(p.price) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    switch (sortOption) {
      case 'price-low-high':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high-low':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name-a-z':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-z-a':
        result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
    }

    return result;
  }, [dedupedProducts, searchQuery, selectedCategory, sortOption, priceRange]);

  // Featured / bestseller picks for the carousel (stable: in-stock, by id).
  const featuredProducts = useMemo(() => {
    return [...dedupedProducts]
      .filter(p => p.stock != null && p.stock > 0)
      .sort((a, b) => (a.productId || 0) - (b.productId || 0))
      .slice(0, 8);
  }, [dedupedProducts]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageProducts = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, safePage]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== null ||
    priceRange[1] < priceMax;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setPriceRange([0, priceMax]);
    setSortOption('price-low-high');
    setCurrentPage(1);
    fetchProducts();
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    if (gridRef.current) gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const loadWishlist = () => {
    const stored = localStorage.getItem('wishlist');
    if (stored) {
      try { setWishlist(JSON.parse(stored)); } catch { setWishlist([]); }
    }
  };

  const toggleWishlist = (productId) => {
    const inList = wishlist.includes(productId);
    const newWishlist = inList
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    showToast(inList ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const loadRecentlyViewed = () => {
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      try { setRecentlyViewed(JSON.parse(stored)); } catch { setRecentlyViewed([]); }
    }
  };

  const trackRecentlyViewed = (productId) => {
    const existing = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    let updated = existing.filter(id => id !== productId);
    updated.unshift(productId);
    if (updated.length > 6) updated = updated.slice(0, 6);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    setRecentlyViewed(updated);
  };

  const recentlyViewedProducts = useMemo(() => {
    const ids = recentlyViewed.slice(0, 6);
    return recentCache.filter(p => ids.includes(p.productId));
  }, [recentlyViewed, recentCache]);

  const fetchRecentCache = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecentCache(data || []);
      }
    } catch (err) { /* ignore */ }
  };

  const addToCart = async (productId, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE}/api/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.ok) {
        fetchCart();
        setCartBounce(true);
        setTimeout(() => setCartBounce(false), 600);
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

  const logout = async () => {
    await authLogout();
    navigate('/login', { replace: true });
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const SkeletonCard = () => (
    <div style={{
      borderRadius: 16,
      background: '#fff',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      overflow: 'hidden',
    }}>
      <div style={{
        height: 240,
        background: 'linear-gradient(90deg, #f0ece6 25%, #f8f5f2 50%, #f0ece6 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
      }} />
      <div style={{ padding: 20 }}>
        <div style={{
          width: '70%', height: 16, borderRadius: 6, marginBottom: 12,
          background: 'linear-gradient(90deg, #f0ece6 25%, #f8f5f2 50%, #f0ece6 75%)',
          backgroundSize: '200% 100%',
          animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
        }} />
        <div style={{
          width: '40%', height: 12, borderRadius: 6, marginBottom: 16,
          background: 'linear-gradient(90deg, #f0ece6 25%, #f8f5f2 50%, #f0ece6 75%)',
          backgroundSize: '200% 100%',
          animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
        }} />
        <div style={{ width: '50%', height: 22, borderRadius: 6, marginBottom: 14, background: '#f5f0eb' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, height: 36, borderRadius: 20, background: '#f5f0eb' }} />
          <div style={{ flex: 1, height: 36, borderRadius: 20, background: '#f0ece6' }} />
        </div>
      </div>
    </div>
  );

  const SkeletonLoaders = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: EASE }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 28,
      }}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </motion.div>
  );

  const handleImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = PLACEHOLDER_IMG;
  };

  // Reusable product card (used in main grid, featured, recently viewed).
  const ProductCard = ({ product, compact = false }) => {
    const isWishlisted = wishlist.includes(product.productId);
    const badge = badgeFor(product);
    const isFeatured = featuredProducts.some(f => f.productId === product.productId);

    return (
      <motion.div
        variants={staggerItem}
        onClick={() => setSelectedProduct(product)}
        whileHover={{ y: -4, boxShadow: '0 12px 34px rgba(0,0,0,0.14)' }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2, ease: EASE }}
        style={{
          background: '#fff',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transformOrigin: 'center',
        }}
      >
        {/* Image area */}
        <div className="product-card-hover" style={{
          position: 'relative',
          aspectRatio: '4 / 3',
          backgroundColor: '#fff',
          overflow: 'hidden',
        }}>
          <motion.img
            src={product.images && product.images[0] ? product.images[0] : PLACEHOLDER_IMG}
            alt={product.name}
            onError={handleImgError}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2, ease: EASE }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: 16,
              backgroundColor: '#fff',
            }}
          />

          {/* Badges */}
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 2 }}>
            {isFeatured && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 12,
                background: 'linear-gradient(135deg, #9b4500, #ff914d)', color: '#fff',
                letterSpacing: '0.04em', fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: '0 2px 6px rgba(155,69,0,0.3)',
              }}>
                ★ Bestseller
              </span>
            )}
            {badge && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 12,
                background: badge.bg, color: badge.color, letterSpacing: '0.04em',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {badge.label}
              </span>
            )}
          </div>

          {/* Wishlist heart */}
          <motion.button
            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.productId); }}
            whileTap={{ scale: 0.85 }}
            style={{
              position: 'absolute', top: 10, right: 10, width: 36, height: 36, zIndex: 3,
              borderRadius: '50%', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
            }}
            aria-label="Toggle wishlist"
          >
            <motion.span
              key={isWishlisted ? 'loved' : 'plain'}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              style={{ fontSize: 18, lineHeight: 1, display: 'inline-flex' }}
            >
              {isWishlisted ? '❤️' : '🤍'}
            </motion.span>
          </motion.button>

          {/* Quick View */}
          <motion.button
            className="quick-view-btn"
            onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            style={{
              position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
              padding: '8px 16px', zIndex: 3, border: 'none', borderRadius: 20,
              background: 'rgba(86,67,57,0.92)', color: '#fff', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            }}
          >
            <span style={{ fontSize: 14 }}>🔍</span> Quick View
          </motion.button>
          {/* hover toggles opacity of quick view */}
        </div>

        {/* Body */}
        <div style={{ padding: compact ? 14 : 18, display: 'flex', flexDirection: 'column', flex: 1 }}>
          <h3 style={{
            fontFamily: "'Quicksand', sans-serif", fontSize: compact ? 15 : 17, fontWeight: 600,
            color: PRIMARY, margin: 0, marginBottom: 6, lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {product.name}
          </h3>

          {/* Star rating + review count (real data from rating-summary) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            {(product.reviewCount || 0) > 0 ? (
              <>
                <span style={{ color: '#f59e0b', fontSize: 13, letterSpacing: '1px' }}>
                  {'★'.repeat(Math.max(1, Math.round(Number(product.averageRating) || 0)))}
                </span>
                <span style={{ fontSize: 11, color: BROWN, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                  {Number(product.averageRating || 0).toFixed(1)}
                </span>
                <span style={{ fontSize: 11, color: MUTED, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  ({product.reviewCount})
                </span>
              </>
            ) : (
              <span style={{ fontSize: 11, color: MUTED, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                No reviews yet
              </span>
            )}
          </div>

          {!compact && (
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12.5, color: BROWN,
              lineHeight: 1.5, margin: 0, marginBottom: 14,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {product.description || ''}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 19, fontWeight: 700, color: PRIMARY }}>
              ₹{product.price != null ? Number(product.price).toFixed(2) : '—'}
            </span>
            <span style={{
              fontSize: 10.5, fontWeight: 600, padding: '4px 10px', borderRadius: 12,
              background: product.stock != null && product.stock > 0 ? '#e8f5e9' : '#fce4e4',
              color: product.stock != null && product.stock > 0 ? '#2e7d32' : '#c62828',
              fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'nowrap',
            }}>
              {product.stock != null && product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {product.stock != null && product.stock > 0 ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <motion.button
                onClick={(e) => addToCart(product.productId, e)}
                whileTap={{ scale: 0.94 }}
                style={{
                  flex: 1, padding: '9px 10px', border: `1.5px solid ${PRIMARY}`, background: 'transparent',
                  color: PRIMARY, borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.target.style.background = 'rgba(155,69,0,0.06)'; }}
                onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
              >
                Add to Cart
              </motion.button>
              <motion.button
                onClick={(e) => buyNow(product.productId, e)}
                whileTap={{ scale: 0.94 }}
                style={{
                  flex: 1, padding: '9px 10px', border: 'none', background: PRIMARY, color: '#fff',
                  borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.target.style.background = '#b55610'; }}
                onMouseLeave={(e) => { e.target.style.background = PRIMARY; }}
              >
                Buy Now
              </motion.button>
            </div>
          ) : (
            <button disabled style={{
              width: '100%', marginTop: 12, padding: '9px 10px', border: 'none', background: '#f5f0eb',
              color: '#999', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'not-allowed',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              Out of Stock
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  // Page numbers to show (with ellipsis for many pages)
  const pageNumbers = useMemo(() => {
    const nums = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - safePage) <= 1) nums.push(i);
    }
    const withEllipsis = [];
    let prev = 0;
    nums.forEach((n) => {
      if (n - prev > 1) withEllipsis.push('…');
      withEllipsis.push(n);
      prev = n;
    });
    return withEllipsis;
  }, [totalPages, safePage]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 40, flexWrap: 'wrap' }}>
        <button
          onClick={() => goToPage(safePage - 1)}
          disabled={safePage === 1}
          style={{
            padding: '8px 16px', borderRadius: 20, border: `1px solid ${CARD_BORDER}`,
            background: '#fff', color: PRIMARY, cursor: safePage === 1 ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
            opacity: safePage === 1 ? 0.4 : 1, transition: 'all 0.2s ease',
          }}
        >
          ‹ Prev
        </button>

        {pageNumbers.map((n, i) =>
          n === '…' ? (
            <span key={`e${i}`} style={{ fontSize: 13, color: MUTED, padding: '0 4px' }}>…</span>
          ) : (
            <button
              key={n}
              onClick={() => goToPage(n)}
              style={{
                width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: n === safePage ? PRIMARY : '#fff', color: n === safePage ? '#fff' : BROWN,
                fontSize: 13, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: n === safePage ? '0 4px 10px rgba(155,69,0,0.3)' : '0 2px 6px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease',
              }}
            >
              {n}
            </button>
          )
        )}

        <button
          onClick={() => goToPage(safePage + 1)}
          disabled={safePage === totalPages}
          style={{
            padding: '8px 16px', borderRadius: 20, border: `1px solid ${CARD_BORDER}`,
            background: '#fff', color: PRIMARY, cursor: safePage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
            opacity: safePage === totalPages ? 0.4 : 1, transition: 'all 0.2s ease',
          }}
        >
          Next ›
        </button>
      </div>
    );
  };

  return (
    <div className="products-page" style={{ minHeight: '100vh', backgroundColor: CREAM, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @keyframes modalPop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes skeleton-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .quick-view-btn { opacity: 0; transition: opacity 0.2s ease; }
        .product-card-hover:hover .quick-view-btn { opacity: 1; }
        @media (max-width: 1200px) { .products-container { max-width: 100%; padding: 24px; } }
        @media (max-width: 768px) { .products-container { padding: 16px; } h1 { font-size: 24px !important; } .category-filters { justify-content: flex-start; overflow-x: auto; padding-bottom: 8px; } }
        .category-filters button { white-space: nowrap; }
      `}</style>

      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <nav style={{
        backgroundColor: PRIMARY, color: '#fff', padding: '10px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <div
          onClick={() => navigate('/products')}
          style={{
            fontSize: '21px', fontFamily: "'Quicksand', sans-serif", fontWeight: '700',
            letterSpacing: '-0.02em', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          HappyTailsStore 🐾
        </div>

        {/* Center search */}
        <div style={{ flex: 1, maxWidth: 460, minWidth: 160, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search products…"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{
              width: '100%', padding: '9px 36px 9px 14px', fontSize: 13, color: BROWN,
              border: 'none', borderRadius: 20, background: 'rgba(255,255,255,0.96)',
              outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            }}
          />
          <span style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            color: MUTED, fontSize: 14, pointerEvents: 'none',
          }}>🔍</span>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.button
            onClick={() => navigate('/cart')}
            whileTap={{ scale: 0.96 }}
            animate={cartBounce ? { scale: [1, 1.25, 0.95, 1] } : { scale: 1 }}
            transition={cartBounce ? { duration: 0.5, ease: EASE } : { duration: 0.2 }}
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
              backgroundColor: wishlist.length > 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.16)',
              color: '#fff', border: 'none', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 17,
            }}
            aria-label="Wishlist"
          >
            ♡
            {wishlist.length > 0 && (
              <span style={{
                backgroundColor: '#ff4444', color: '#fff', fontSize: 10, fontWeight: 700,
                borderRadius: '50%', minWidth: 18, height: 18, display: 'flex',
                alignItems: 'center', justifyContent: 'center', padding: '0 3px',
                position: 'absolute', top: -3, right: -3,
              }}>
                {wishlist.length}
              </span>
            )}
          </motion.button>

          {/* Account dropdown */}
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
                  <button onClick={() => navigate('/orders')} style={dropdownItemStyle}>📦 My Orders</button>
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
              fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 200,
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="products-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '28px 32px 64px' }}>
        {/* Breadcrumbs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: MUTED, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 16 }}>
          <Link to="/products" style={{ color: PRIMARY, textDecoration: 'none', fontWeight: 600 }}>Home</Link>
          <span>›</span>
          <span style={{ color: BROWN, fontWeight: 600 }}>Products</span>
        </nav>

        <h1 style={{
          fontFamily: "'Quicksand', sans-serif", fontSize: 28, fontWeight: 700, color: PRIMARY,
          marginBottom: 8, letterSpacing: '-0.01em', textAlign: 'center',
        }}>
          Product Catalog
        </h1>
        <p style={{ textAlign: 'center', fontSize: 13, color: MUTED, margin: '0 auto 24px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Curated treats, toys &amp; accessories for your furry friends
        </p>

        {/* Featured / Bestsellers carousel */}
        {!loading && featuredProducts.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 20, fontWeight: 700, color: PRIMARY, margin: 0 }}>
                ★ Featured Bestsellers
              </h2>
              <span style={{ fontSize: 12, color: MUTED, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Scroll for more →</span>
            </div>
            <div style={{
              display: 'flex', gap: 20, overflowX: 'auto', padding: '4px 4px 16px', scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
            }}>
              {featuredProducts.map((product) => (
                <div key={product.productId} style={{ flex: '0 0 260px', scrollSnapAlign: 'start' }}>
                  <ProductCard product={product} compact />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filter panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          style={{
            background: '#fff', borderRadius: 18, padding: '20px 22px', marginBottom: 32,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: `1px solid ${CARD_BORDER_LIGHT}`,
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-end', justifyContent: 'space-between' }}>
            {/* Sort */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: MUTED, textTransform: 'uppercase', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Sort by</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                style={{
                  padding: '9px 14px', fontSize: 13, color: BROWN, border: `1px solid ${CARD_BORDER}`,
                  borderRadius: 12, background: CREAM, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: 'pointer',
                }}
              >
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="name-a-z">Name: A-Z</option>
                <option value="name-z-a">Name: Z-A</option>
              </select>
            </div>

            {/* Price slider with clear labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: '1 1 280px', minWidth: 240 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: MUTED, textTransform: 'uppercase', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Price Range</span>
                <span style={{
                  fontSize: 12.5, fontWeight: 700, color: PRIMARY, fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: 'rgba(255,145,77,0.12)', padding: '3px 10px', borderRadius: 10,
                }}>
                  ₹{priceRange[0].toLocaleString('en-IN')} — ₹{priceRange[1].toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={priceMax}
                value={priceRange[1]}
                onChange={(e) => { setPriceRange([0, Number(e.target.value)]); setCurrentPage(1); }}
                style={{ width: '100%', accentColor: PRIMARY, cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: MUTED, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <span>₹0</span>
                <span>₹{priceMax.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <motion.button
                onClick={clearFilters}
                whileTap={{ scale: 0.96 }}
                style={{
                  padding: '9px 16px', borderRadius: 12, border: `1px solid ${PRIMARY}`, background: 'transparent',
                  color: PRIMARY, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                ✕ Clear Filters
              </motion.button>
            )}
          </div>

          {/* Category pills */}
          {categories.length > 0 && (
            <div className="category-filters" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18, paddingTop: 16, borderTop: `1px solid ${CARD_BORDER_LIGHT}` }}>
              <button
                onClick={() => handleCategorySelect(null)}
                style={{
                  padding: '8px 16px', borderRadius: 20, border: 'none',
                  background: selectedCategory === null ? PRIMARY : '#fff',
                  color: selectedCategory === null ? '#fff' : BROWN,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  boxShadow: selectedCategory === null ? '0 4px 8px rgba(155,69,0,0.3)' : '0 2px 4px rgba(0,0,0,0.08)',
                }}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.categoryId}
                  onClick={() => handleCategorySelect(cat.categoryId)}
                  style={{
                    padding: '8px 16px', borderRadius: 20, border: 'none',
                    background: selectedCategory === cat.categoryId ? PRIMARY : '#fff',
                    color: selectedCategory === cat.categoryId ? '#fff' : BROWN,
                    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    boxShadow: selectedCategory === cat.categoryId ? '0 4px 8px rgba(155,69,0,0.3)' : '0 2px 4px rgba(0,0,0,0.08)',
                  }}
                >
                  {cat.categoryName}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Result count */}
        {!loading && !error && (
          <div style={{ marginBottom: 20, fontSize: 13, color: BROWN, fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, color: PRIMARY }}>
              Showing {filteredProducts.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filteredProducts.length)} of {filteredProducts.length}
            </span>
            <span style={{ color: MUTED }}>products</span>
            {searchQuery.trim() && <span style={{ color: PRIMARY }}>(search: “{searchQuery}”)</span>}
          </div>
        )}

        {error && (
          <div style={{ padding: 32, textAlign: 'center', color: '#dc2626', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{error}</div>
        )}

        {/* Grid */}
        <div ref={gridRef}>
          {loading ? (
            <SkeletonLoaders />
          ) : filteredProducts.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", color: BROWN }}>
              <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.3 }}>🐾</div>
              <p style={{ fontSize: 18, marginBottom: 8 }}>No products found</p>
              <p style={{ fontSize: 14, color: MUTED, marginBottom: 20 }}>Try adjusting your search or filter criteria</p>
              <button onClick={clearFilters} style={{
                padding: '10px 22px', border: 'none', borderRadius: 20, background: PRIMARY, color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <motion.div
              key={`page-${safePage}`}
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 28,
              }}
            >
              {pageProducts.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </motion.div>
          )}
        </div>

        {renderPagination()}

        {/* Recently Viewed */}
        {recentlyViewedProducts.length > 0 && (
          <section style={{ marginTop: 56 }}>
            <h2 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 22, fontWeight: 700, color: PRIMARY, marginBottom: 20 }}>
              Recently Viewed
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 28 }}>
              {recentlyViewedProducts.map((product) => (
                <ProductCard key={product.productId} product={product} compact />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Back to top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            onClick={scrollTop}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              position: 'fixed', bottom: 28, right: 28, width: 48, height: 48, borderRadius: '50%',
              background: 'linear-gradient(135deg, #9b4500, #ff914d)', color: '#fff', border: 'none',
              cursor: 'pointer', zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, boxShadow: '0 6px 20px rgba(155,69,0,0.4)',
            }}
            aria-label="Back to top"
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── Product Modal (Quick View / Detail) ───────────────── */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setSelectedProduct(null)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(28, 28, 25, 0.4)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', zIndex: 300, padding: 24, backdropFilter: 'blur(2px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="modal-panel"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px) saturate(150%)',
                WebkitBackdropFilter: 'blur(20px) saturate(150%)', border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', maxWidth: 720, width: '100%',
                maxHeight: '90vh', overflowY: 'auto', position: 'relative',
              }}
            >
              <button
                onClick={() => setSelectedProduct(null)}
                aria-label="Close"
                style={{
                  position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%',
                  border: 'none', background: 'rgba(155,69,0,0.08)', color: PRIMARY, fontSize: 18,
                  lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease', zIndex: 2,
                }}
              >
                ✕
              </button>

              <div style={{ padding: '16px 28px 0', fontSize: 12, color: MUTED, fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                <Link to="/products" style={{ color: PRIMARY, textDecoration: 'none', fontWeight: 600 }}>Home</Link>
                <span>›</span>
                <span>Products</span>
                <span>›</span>
                <span style={{ color: BROWN, fontWeight: 600 }}>{selectedProduct.name}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {selectedProduct.images && selectedProduct.images[0] ? (
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    onError={handleImgError}
                    style={{
                      width: '100%', height: 'auto', maxHeight: 400, objectFit: 'contain',
                      borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#fff', padding: 8,
                    }}
                  />
                ) : (
                  <img src={PLACEHOLDER_IMG} alt={selectedProduct.name} style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderTopLeftRadius: 24, borderTopRightRadius: 24 }} />
                )}

                <div style={{ padding: '0 28px 28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                    <h2 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 26, fontWeight: 700, color: PRIMARY, margin: 0, lineHeight: 1.3 }}>
                      {selectedProduct.name}
                    </h2>
                    <span style={{
                      fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 20,
                      background: selectedProduct.stock != null && selectedProduct.stock > 0 ? '#e8f5e9' : '#fce4e4',
                      color: selectedProduct.stock != null && selectedProduct.stock > 0 ? '#2e7d32' : '#c62828',
                      fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'nowrap',
                    }}>
                      {selectedProduct.stock != null && selectedProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    {(selectedProduct.reviewCount || 0) > 0 ? (
                      <>
                        <span style={{ color: '#f59e0b', fontSize: 15, letterSpacing: '2px' }}>
                          {'★'.repeat(Math.max(1, Math.round(Number(selectedProduct.averageRating) || 0)))}
                        </span>
                        <span style={{ fontSize: 12, color: BROWN, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                          {Number(selectedProduct.averageRating || 0).toFixed(1)}
                        </span>
                        <span style={{ fontSize: 12, color: MUTED, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          ({selectedProduct.reviewCount} review{selectedProduct.reviewCount !== 1 ? 's' : ''})
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: 12, color: MUTED, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        No reviews yet
                      </span>
                    )}
                  </div>

                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: BROWN, lineHeight: 1.7, margin: 0, marginBottom: 16 }}>
                    {selectedProduct.description || 'No description available.'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 700, color: PRIMARY }}>
                      ₹{selectedProduct.price != null ? Number(selectedProduct.price).toFixed(2) : '—'}
                    </span>
                    {selectedProduct.stock != null && (
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: MUTED }}>
                        {selectedProduct.stock} available
                      </span>
                    )}
                  </div>

                  {selectedProduct.stock != null && selectedProduct.stock > 0 ? (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        onClick={(e) => addToCart(selectedProduct.productId, e)}
                        style={{
                          flex: 1, padding: '12px 16px', border: `2px solid ${PRIMARY}`, background: 'transparent',
                          color: PRIMARY, borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                          fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => { e.target.style.background = 'rgba(155,69,0,0.06)'; }}
                        onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={(e) => buyNow(selectedProduct.productId, e)}
                        style={{
                          flex: 1, padding: '12px 16px', border: 'none', background: PRIMARY, color: '#fff',
                          borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                          fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => { e.target.style.background = '#b55610'; }}
                        onMouseLeave={(e) => { e.target.style.background = PRIMARY; }}
                      >
                        Buy Now
                      </button>
                    </div>
                  ) : (
                    <button disabled style={{
                      width: '100%', padding: '12px 16px', border: 'none', background: '#f5f0eb', color: '#999',
                      borderRadius: 24, fontSize: 14, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: 'not-allowed',
                    }}>
                      Out of Stock
                    </button>
                  )}

                  <ReviewsSection product={selectedProduct} token={token} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const dropdownItemStyle = {
  background: 'none', border: 'none', color: PRIMARY, cursor: 'pointer', fontSize: 13, fontWeight: 600,
  fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: 'left', padding: '9px 10px', margin: 0,
  width: '100%', borderRadius: 8, transition: 'background 0.15s ease',
};