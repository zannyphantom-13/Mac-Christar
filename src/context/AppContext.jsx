import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null means not logged in
  const [authLoading, setAuthLoading] = useState(true);
  
  // Toast State
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  // For demo, initialize with 2 items in cart and 3 in wishlist to match initial UI loosely
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch additional user metadata (like isAdmin) from Firestore
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Safeguard: Give admin access to owner emails if the database flag is missing
            const isOwner = firebaseUser.email === 'hassan@email.com' || firebaseUser.email?.includes('admin');
            setUser({ uid: firebaseUser.uid, ...firebaseUser, ...data, isAdmin: data.isAdmin === true || isOwner });
          } else {
            const isOwner = firebaseUser.email === 'hassan@email.com' || firebaseUser.email?.includes('admin');
            setUser({ uid: firebaseUser.uid, ...firebaseUser, isAdmin: isOwner });
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore", error);
          setUser({ uid: firebaseUser.uid, ...firebaseUser });
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  // Cart Functions
  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + qty } : item);
      }
      return [...prev, { ...product, qty }];
    });
    showToast(`${product.name || 'Item'} added to cart!`);
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 1)), 0);
  const cartCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  // Wishlist Functions
  const toggleWishlist = (product) => {
    setWishlist(prev => {
      if (prev.find(item => item.id === product.id)) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  const isInWishlist = (id) => {
    return wishlist.some(item => item.id === id);
  };

  const contextValue = {
    user,
    authLoading,
    logout,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
    wishlist,
    toggleWishlist,
    removeFromWishlist,
    isInWishlist,
    showToast
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      {/* Global Toast UI */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          background: toast.type === 'error' ? 'rgba(255,61,0,0.95)' : 'rgba(0,230,118,0.95)',
          color: toast.type === 'error' ? '#fff' : '#000',
          padding: '14px 24px',
          borderRadius: 'var(--radius-md)',
          fontWeight: 700,
          fontSize: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(8px)',
          animation: 'slideUpFade 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
        }}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          {toast.msg}
        </div>
      )}
    </AppContext.Provider>
  );
};
