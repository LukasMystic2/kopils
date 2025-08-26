import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import ProductsPage from './pages/ProductsPage';
import AboutPage from './pages/AboutPage';
import NewsPage from './pages/NewsPage';
import OrderPage from './pages/OrderPage';
import LoginPage from './pages/LoginPage';
import GoogleTranslate from './components/GoogleTranslate';
import NewsArticlePage from './pages/NewsArticlePage';
import Notification from './components/Notification';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import ChatWidget from './components/ChatWidget';
import MyOrdersPage from './pages/MyOrdersPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage'; // 1. Import the new 404 page

const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  const [userInfo, setUserInfo] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);
  const [notification, setNotification] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
    const adminToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    if (adminToken) {
      setAdminInfo(parseJwt(adminToken));
    }
    setAuthLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    const storedUserInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  };

  const handleAdminLoginSuccess = () => {
    const adminToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    if (adminToken) {
      setAdminInfo(parseJwt(adminToken));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('userInfo');
    setUserInfo(null);
    showNotification("You have been logged out.");
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminToken');
    setAdminInfo(null);
    showNotification("Admin has been logged out.");
    navigate('/admin/login');
  };
  
  const handleProfileUpdate = (newUserInfo) => {
      setUserInfo(newUserInfo);
      const storage = localStorage.getItem('userInfo') ? localStorage : sessionStorage;
      storage.setItem('userInfo', JSON.stringify(newUserInfo));
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  return (
    <SocketProvider userInfo={userInfo} adminInfo={adminInfo}>
      <CartProvider>
        <div className="bg-gray-900 min-h-screen font-sans flex flex-col">
          <Notification message={notification?.message} type={notification?.type} onClose={() => setNotification(null)} />
          {!isAdminRoute && <Header userInfo={userInfo} onLogout={handleLogout} />}
          
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:slug" element={<NewsArticlePage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/login" element={<LoginPage userInfo={userInfo} onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/resetpassword/:token" element={<ResetPasswordPage showNotification={showNotification} />} />
              
              <Route path="/order" element={<ProtectedRoute userInfo={userInfo}><OrderPage userInfo={userInfo} showNotification={showNotification} /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute userInfo={userInfo}><ProfilePage userInfo={userInfo} showNotification={showNotification} onLogout={handleLogout} onUpdate={handleProfileUpdate} /></ProtectedRoute>} />
              <Route path="/my-orders" element={<ProtectedRoute userInfo={userInfo}><MyOrdersPage userInfo={userInfo} showNotification={showNotification} /></ProtectedRoute>} />

              <Route path="/admin/login" element={<AdminLoginPage onLoginSuccess={handleAdminLoginSuccess} />} />
              <Route 
                path="/admin/*" // 2. Add a wildcard to the admin route to catch sub-routes
                element={
                  <AdminRoute isAdmin={!!adminInfo} authLoading={authLoading}>
                    <AdminPage adminInfo={adminInfo} onLogout={handleAdminLogout} />
                  </AdminRoute>
                } 
              />
              {/* 3. Add the catch-all route for 404 at the very end */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          
          {!isAdminRoute && <Footer />}
          {!isAdminRoute && <GoogleTranslate />}
          {!isAdminRoute && <ChatWidget userInfo={userInfo} />}
        </div>
      </CartProvider>
    </SocketProvider>
  );
}

export default App;
