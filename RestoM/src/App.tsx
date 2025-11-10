import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import OrderTrackingPopup from './components/OrderTrackingPopup'
import Category from './pages/customer/Category'
import Menu from './pages/customer/Menu'
import Cart from './pages/customer/Cart'
import Payment from './pages/customer/Payment'
import Checkout from './pages/customer/Checkout'
import OrderTracking from './pages/customer/OrderTracking'
import Profile from './pages/customer/Profile'
import HelpSupport from './pages/customer/HelpSupport'
import TermsConditions from './pages/customer/TermsConditions'
import PrivacyPolicy from './pages/customer/PrivacyPolicy'
import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import MenuManagement from './pages/admin/MenuManagement'
import SalesAnalytics from './pages/admin/SalesAnalytics'
import Reports from './pages/admin/Reports'
import { CartProvider } from './context/CartContext'
import WelcomePage from './components/WelcomePage.jsx'
 
 
function App() {
  return (
    <CartProvider>
      <Router>
        <AppContent />
      </Router>
    </CartProvider>
  )
}
 
function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isWelcomePage = location.pathname === '/';
 
  return (
    <div className="App">
      {!isAdminRoute && !isWelcomePage && <Navbar />}
      {!isAdminRoute && !isWelcomePage && <OrderTrackingPopup />}
      <main>
        <Routes>
 
            <Route path="/" element={<WelcomePage />} />

            <Route path="/Category" element={<Category />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-tracking" element={<OrderTracking />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/help-support" element={<HelpSupport />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/menu" element={<MenuManagement />} />
            <Route path="/admin/analytics" element={<SalesAnalytics />} />
            <Route path="/admin/reports" element={<Reports />} />
           
        </Routes>
      </main>
      {!isAdminRoute && !isWelcomePage && <Footer />}
    </div>
  )
}
 
export default App