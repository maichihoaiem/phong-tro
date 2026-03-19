import React, { useState, useEffect } from 'react'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios'
import Header from './components/Header'
import Footer from './components/Footer'
import TrangChu from './pages/TrangChu'
import DangNhap from './pages/DangNhap'
import DangKy from './pages/DangKy'
import ChiTietPhong from './pages/ChiTietPhong'
import TimPhong from './pages/TimPhong'
import YeuThich from './pages/YeuThich'
import LichSuDatPhong from './pages/LichSuDatPhong'
import TaiKhoan from './pages/TaiKhoan'
import GioiThieu from './pages/GioiThieu'
import Blog from './pages/Blog'
import ChiTietBlog from './pages/ChiTietBlog'
import QuanLyPhong from './pages/QuanLyPhong'
import DangPhong from './pages/DangPhong'
import SuaPhong from './pages/SuaPhong'
import YeuCauDatPhong from './pages/YeuCauDatPhong'
import QuenMatKhau from './pages/QuenMatKhau'
import ViTien from './pages/ViTien'
import AdminHoanTien from './pages/AdminHoanTien'
import AdminRutTien from './pages/AdminRutTien'
import AdminViChuTro from './pages/AdminViChuTro'
import AdminThongKe from './pages/AdminThongKe'
import AdminQuanLyBaiDang from './pages/AdminQuanLyBaiDang'
import AdminQuanLyTaiKhoan from './pages/AdminQuanLyTaiKhoan'
import ScrollToTop from './components/ScrollToTop'
import AIChatbot from './components/AIChatbot'

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kiem tra trang thai dang nhap khi load trang
  useEffect(() => {
    axios.get('/api/auth/me', { withCredentials: true })
      .then(res => {
        if (res.data.success) {
          setUser(res.data.user);
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', animation: 'spin 1s linear infinite',
          }}>
            <i className="fas fa-home" style={{ color: 'white', fontSize: '1.2rem' }}></i>
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', fontWeight: 600 }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflowX: 'hidden' }}>

        <Header user={user} onLogout={handleLogout} />

        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<TrangChu />} />
            <Route path="/dang-nhap" element={<DangNhap onLogin={handleLogin} />} />
            <Route path="/dang-ky" element={<DangKy onLogin={handleLogin} />} />
            <Route path="/phong-tro/:id" element={<ChiTietPhong user={user} />} />
            <Route path="/tim-phong" element={<TimPhong user={user} />} />
            <Route path="/yeu-thich" element={<YeuThich />} />
            <Route path="/dat-phong" element={<LichSuDatPhong />} />
            <Route path="/tai-khoan" element={<TaiKhoan user={user} onUpdateUser={handleUpdateUser} />} />
            <Route path="/gioi-thieu" element={<GioiThieu />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<ChiTietBlog />} />
            <Route path="/quan-ly-phong" element={<QuanLyPhong />} />
            <Route path="/dang-phong" element={<DangPhong user={user} />} />
            <Route path="/sua-phong/:id" element={<SuaPhong user={user} />} />
            <Route path="/yeu-cau-dat-phong" element={<YeuCauDatPhong />} />
            <Route path="/quen-mat-khau" element={<QuenMatKhau />} />
            <Route path="/admin/hoan-tien" element={<AdminHoanTien />} />
            <Route path="/admin/rut-tien" element={<AdminRutTien />} />
            <Route path="/admin/vi-chu-tro" element={<AdminViChuTro />} />
            <Route path="/admin/thong-ke" element={<AdminThongKe />} />
            <Route path="/admin/quan-ly-bai-dang" element={<AdminQuanLyBaiDang />} />
            <Route path="/admin/quan-ly-tai-khoan" element={<AdminQuanLyTaiKhoan />} />
            <Route path="/vi-tien" element={<ViTien />} />
          </Routes>
        </div>

        {/* Nút quay lại đầu trang */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed', bottom: 24, right: 24,
            width: 46, height: 46,
            background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
            zIndex: 50, transition: 'all 0.22s', fontSize: '0.85rem',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(37,99,235,0.55)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.4)'; }}
        >
          <i className="fas fa-arrow-up"></i>
        </div>

        <Footer />
        {user?.ID_VaiTro !== 1 && <AIChatbot />}
      </div>
    </BrowserRouter>
  )
}

export default App
