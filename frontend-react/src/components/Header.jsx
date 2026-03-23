import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function Header({ user, onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [rejectedBookingCount, setRejectedBookingCount] = useState(0);
    const [newRequestsCount, setNewRequestsCount] = useState(0);
    const [pendingRefundsCount, setPendingRefundsCount] = useState(0);
    const [pendingWithdrawalsCount, setPendingWithdrawalsCount] = useState(0);
    const [pendingRoomPostsCount, setPendingRoomPostsCount] = useState(0);
    const [pendingReportsCount, setPendingReportsCount] = useState(0);

    const checkNotifications = async () => {
        if (!user) {
            setRejectedBookingCount(0);
            setNewRequestsCount(0);
            setPendingRefundsCount(0);
            setPendingWithdrawalsCount(0);
            setPendingRoomPostsCount(0);
            setPendingReportsCount(0);
            return;
        }
        try {
            if (user.ID_VaiTro === 3) {
                const res = await axios.get('/api/dat-phong/my-bookings', { withCredentials: true });
                if (res.data.success) {
                    setRejectedBookingCount(res.data.data.filter(b => b.TrangThai === 'Từ chối' && b.TrangThaiThanhToan === 'Chờ hoàn tiền (Chưa có STK)').length);
                }
            }
            if (user.ID_VaiTro === 2) {
                const res = await axios.get('/api/dat-phong/requests', { withCredentials: true });
                if (res.data.success) {
                    setNewRequestsCount(res.data.data.filter(b => {
                        const s = (b.TrangThai || '').trim();
                        return s === 'Chờ xác nhận' || s === 'Chờ duyệt' || s === 'Chờ thanh toán' || s === '';
                    }).length);
                }
            }
            if (user.ID_VaiTro === 1) {
                const resRefund = await axios.get('/api/dat-phong/admin-refunds', { withCredentials: true });
                if (resRefund.data.success) setPendingRefundsCount(resRefund.data.data.filter(b => b.TrangThaiThanhToan === 'Chờ hoàn tiền (Đã có STK)').length);
                
                const resWithdraw = await axios.get('/api/wallet/admin/withdrawals', { withCredentials: true });
                if (resWithdraw.data.success) setPendingWithdrawalsCount(resWithdraw.data.data.filter(w => w.TrangThai === 'Chờ duyệt').length);
                
                const resRoomPosts = await axios.get('/api/admin/room-posts', { withCredentials: true });
                if (resRoomPosts.data.success) setPendingRoomPostsCount(resRoomPosts.data.data.filter(p => p.TrangThai === 'Chờ duyệt').length);
                
                const resReports = await axios.get('/api/bao-cao/all', { withCredentials: true });
                if (resReports.data.success) setPendingReportsCount(resReports.data.data.filter(r => r.TrangThai === 'Chờ duyệt').length);
            }
        } catch (err) { }
    };

    useEffect(() => {
        checkNotifications();
        const onRefreshNotifications = () => checkNotifications();
        window.addEventListener('ozic:notifications-refresh', onRefreshNotifications);
        const interval = setInterval(checkNotifications, 45000);
        return () => {
            clearInterval(interval);
            window.removeEventListener('ozic:notifications-refresh', onRefreshNotifications);
        };
    }, [user, location.pathname]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => { setIsMobileMenuOpen(false); setShowDropdown(false); }, [location]);

    const handleLogout = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?")) return;
        if (onLogout) await onLogout();
        setShowDropdown(false);
        navigate('/');
    };

    const navLinks = [
        { name: 'Trang chủ', path: '/', icon: 'fa-home' },
        { name: 'Tìm phòng', path: '/tim-phong', icon: 'fa-search' },
        { name: 'Giới thiệu', path: '/gioi-thieu', icon: 'fa-info-circle' },
        { name: 'Blog', path: '/blog', icon: 'fa-book-open' },
    ];

    const isActive = (path) => location.pathname === path;

    /* --- Inline style helpers --- */
    const navLinkStyle = (active) => ({
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 13px', borderRadius: 10,
        fontSize: '0.83rem', fontWeight: 600,
        color: active ? '#4F46E5' : '#4B5563',
        background: active ? '#F5F3FF' : 'transparent',
        textDecoration: 'none', transition: 'all 0.18s',
        position: 'relative',
    });

    const dropdownLinkStyle = {
        display: 'flex', alignItems: 'center', gap: 11,
        padding: '9px 14px', borderRadius: 10,
        color: '#374151', fontSize: '0.83rem', fontWeight: 600,
        textDecoration: 'none', transition: 'all 0.15s',
    };

    const NotificationBadge = ({ count }) => {
        if (!count || count <= 0) return null;
        return (
            <span className="notif-badge">
                {count > 9 ? '9+' : count}
            </span>
        );
    };

    return (
        <header style={{
            position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000,
            background: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'saturate(180%) blur(15px)',
            borderBottom: scrolled ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid transparent',
            boxShadow: scrolled ? '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)' : 'none',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            height: scrolled ? 52 : 60,
            display: 'flex',
            alignItems: 'center'
        }} className="header-main">
            <div className="header-container" style={{ height: '100%', transition: 'all 0.4s ease' }}>

                {/* Logo */}
                <Link to="/" className="header-logo group">
                    <div className="logo-icon-wrapper">
                        <div className="logo-icon">
                            <i className="fas fa-home"></i>
                        </div>
                        <div className="logo-glow"></div>
                    </div>
                    <span className="logo-text">
                        OZIC<span style={{ color: '#4F46E5', marginLeft: '1px' }}>HOUSE</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex" style={{ alignItems: 'center', gap: '4px' }}>
                    {navLinks
                        .filter(link => {
                            if (user && user.ID_VaiTro === 1) return link.name === 'Trang chủ';
                            return true;
                        })
                        .map(link => (
                                <Link key={link.path} to={link.path}
                                    className={`nav-link-modern ${isActive(link.path) ? 'active' : ''}`}
                                >
                                    <div className="nav-icon-wrapper">
                                        <i className={`fas ${link.icon}`}></i>
                                    </div>
                                    <span>{link.name}</span>
                                    {isActive(link.path) && <div className="active-line"></div>}
                                </Link>
                        ))}

                    {/* Admin links */}
                    {user && user.ID_VaiTro === 1 && (
                        <>
                            <div className="nav-divider"></div>
                            {[
                                { to: '/admin/hoan-tien', label: 'Hoàn tiền', icon: 'fa-shield-alt', count: pendingRefundsCount, color: '#7C3AED' },
                                { to: '/admin/rut-tien', label: 'Rút tiền', icon: 'fa-money-check-alt', count: pendingWithdrawalsCount, color: '#0891B2' },
                                { to: '/admin/quan-ly-bai-dang', label: 'Bài đăng', icon: 'fa-list-check', count: pendingRoomPostsCount, color: '#D97706' },
                                { to: '/admin/quan-ly-tai-khoan', label: 'Tài khoản', icon: 'fa-users-cog', count: pendingReportsCount, color: '#EF4444' },
                                { to: '/admin/thong-ke', label: 'Thống kê', icon: 'fa-chart-bar', dot: false, color: '#2563EB' },
                                { to: '/admin/vi-chu-tro', label: 'Ví Chủ trọ', icon: 'fa-piggy-bank', dot: false, color: '#059669' },
                            ].map(item => (
                                <Link key={item.to} to={item.to} className={`nav-link-modern admin-link ${isActive(item.to) ? 'active' : ''}`}
                                    style={{ '--active-color': item.color }}
                                >
                                    <div className="nav-icon-wrapper">
                                        <i className={`fas ${item.icon}`}></i>
                                    </div>
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <span>{item.label}</span>
                                        <NotificationBadge count={item.count} />
                                    </div>
                                    {isActive(item.to) && <div className="active-line"></div>}
                                </Link>
                            ))}
                        </>
                    )}

                    {/* Chủ trọ & Người thuê links similar logic... */}
                    {(user && (user.ID_VaiTro === 2 || user.ID_VaiTro === 3)) && <div className="nav-divider"></div>}

                    {user && user.ID_VaiTro === 2 && (
                        <>
                            <Link to="/quan-ly-phong" className={`nav-link-modern host-link ${isActive('/quan-ly-phong') ? 'active' : ''}`}>
                                <div className="nav-icon-wrapper">
                                    <i className="fas fa-tasks"></i>
                                </div>
                                <span>Quản lý</span>
                                {isActive('/quan-ly-phong') && <div className="active-line"></div>}
                            </Link>
                            <Link to="/yeu-cau-dat-phong" className={`nav-link-modern host-link warning ${isActive('/yeu-cau-dat-phong') ? 'active' : ''}`}>
                                <div className="nav-icon-wrapper">
                                    <i className="fas fa-bell"></i>
                                </div>
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <span>Yêu cầu</span>
                                    <NotificationBadge count={newRequestsCount} />
                                </div>
                                {isActive('/yeu-cau-dat-phong') && <div className="active-line"></div>}
                            </Link>
                            <Link to="/vi-tien" className={`nav-link-modern host-link success ${isActive('/vi-tien') ? 'active' : ''}`}>
                                <div className="nav-icon-wrapper">
                                    <i className="fas fa-wallet"></i>
                                </div>
                                <span>Ví tiền</span>
                                {isActive('/vi-tien') && <div className="active-line"></div>}
                            </Link>
                        </>
                    )}

                    {user && user.ID_VaiTro === 3 && (
                        <>
                            <Link to="/dat-phong" className={`nav-link-modern tenant-link ${isActive('/dat-phong') ? 'active' : ''}`}>
                                <div className="nav-icon-wrapper">
                                    <i className="fas fa-history"></i>
                                </div>
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <span>Lịch sử</span>
                                    <NotificationBadge count={rejectedBookingCount} />
                                </div>
                                {isActive('/dat-phong') && <div className="active-line"></div>}
                            </Link>
                            <Link to="/yeu-thich" className={`nav-link-modern tenant-link danger ${isActive('/yeu-thich') ? 'active' : ''}`}>
                                <i className="fas fa-heart"></i> <span>Yêu thích</span>
                                {isActive('/yeu-thich') && <div className="active-line"></div>}
                            </Link>
                        </>
                    )}
                </nav>

                {/* Right: Auth / User */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                    {user ? (
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setShowDropdown(!showDropdown)} className="user-profile-btn">
                                <div className="user-avatar">
                                    {user.HoTen.charAt(0).toUpperCase()}
                                </div>
                                <div className="user-info-text hidden sm:block">
                                    <span className="user-name">{user.HoTen}</span>
                                    <span className="user-role">{user.TenVaiTro}</span>
                                </div>
                                <i className={`fas fa-chevron-down caret-icon ${showDropdown ? 'rotate-180' : ''}`}></i>
                            </button>

                            {showDropdown && (
                                <div className="dropdown-panel">
                                    <div className="dropdown-header">
                                        <div className="user-avatar large">
                                            {user.HoTen.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ overflow: 'hidden' }}>
                                            <p className="full-name">{user.HoTen}</p>
                                            <p className="user-email">{user.Email}</p>
                                        </div>
                                    </div>

                                    <div className="dropdown-content">
                                        {[
                                            { to: '/tai-khoan', icon: 'fa-user-circle', label: 'Tài khoản của tôi' },
                                            { to: '/yeu-thich', icon: 'fa-heart', label: 'Phòng yêu thích' },
                                            { to: '/dat-phong', icon: 'fa-history', label: 'Lịch sử đặt phòng' },
                                            user.ID_VaiTro !== 1 && { to: '/vi-tien', icon: 'fa-wallet', label: 'Ví tiền Ozic' },
                                        ].filter(Boolean).map(item => (
                                            <Link key={item.to} to={item.to} className="dropdown-item">
                                                <i className={`fas ${item.icon}`}></i>
                                                {item.label}
                                            </Link>
                                        ))}

                                        <div className="dropdown-divider"></div>
                                        <button onClick={handleLogout} className="dropdown-item logout-btn">
                                            <i className="fas fa-sign-out-alt"></i>
                                            Đăng xuất hệ thống
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Link to="/dang-nhap" className="login-btn-modern">
                                Đăng nhập
                            </Link>
                            <Link to="/dang-ky" className="register-btn-modern">
                                <span className="hidden sm:inline">Bắt đầu ngay</span>
                                <span className="sm:hidden">Đăng ký</span>
                                <i className="fas fa-arrow-right"></i>
                            </Link>
                        </div>
                    )}

                    {/* Mobile toggle */}
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="mobile-toggle-btn">
                        <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="lg:hidden mobile-dropdown">
                    <div className="mobile-links">
                        {navLinks.map(link => (
                            <Link key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)}
                                className={`mobile-link ${isActive(link.path) ? 'active' : ''}`}
                            >
                                <div className="link-icon-bg">
                                    <i className={`fas ${link.icon}`}></i>
                                </div>
                                <span>{link.name}</span>
                                {isActive(link.path) && <i className="fas fa-check active-check"></i>}
                            </Link>
                        ))}

                        {user && <div className="mobile-divider"></div>}

                        {/* Admin links on mobile */}
                        {user && user.ID_VaiTro === 1 && (
                            <div className="mobile-admin-section">
                                <p className="section-title">Quản trị hệ thống</p>
                                {[
                                    { to: '/admin/hoan-tien', label: 'Hoàn tiền', icon: 'fa-shield-alt', color: '#7C3AED' },
                                    { to: '/admin/rut-tien', label: 'Rút tiền', icon: 'fa-money-check-alt', color: '#0891B2' },
                                    { to: '/admin/quan-ly-bai-dang', label: 'Bài đăng', icon: 'fa-list-check', color: '#D97706' },
                                    { to: '/admin/quan-ly-tai-khoan', label: 'Tài khoản', icon: 'fa-users-cog', color: '#EF4444' },
                                    { to: '/admin/thong-ke', label: 'Thống kê', icon: 'fa-chart-bar', color: '#2563EB' },
                                ].map(item => (
                                    <Link key={item.to} to={item.to} onClick={() => setIsMobileMenuOpen(false)}
                                        className="mobile-link admin-link" style={{ '--link-color': item.color }}>
                                        <i className={`fas ${item.icon}`}></i> {item.label}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Chủ trọ & Người thuê links on mobile */}
                        {user && user.ID_VaiTro === 2 && (
                            <>
                                <Link to="/quan-ly-phong" onClick={() => setIsMobileMenuOpen(false)} className="mobile-link host-link">
                                    <i className="fas fa-tasks"></i> Quản lý phòng
                                </Link>
                                <Link to="/yeu-cau-dat-phong" onClick={() => setIsMobileMenuOpen(false)} className="mobile-link host-link warning">
                                    <i className="fas fa-bell"></i> Yêu cầu đặt phòng
                                </Link>
                                <Link to="/vi-tien" onClick={() => setIsMobileMenuOpen(false)} className="mobile-link host-link success">
                                    <i className="fas fa-wallet"></i> Ví tiền của tôi
                                </Link>
                            </>
                        )}

                        {user && user.ID_VaiTro === 3 && (
                            <>
                                <Link to="/dat-phong" onClick={() => setIsMobileMenuOpen(false)} className="mobile-link tenant-link">
                                    <i className="fas fa-history"></i> Lịch sử đặt phòng
                                </Link>
                                <Link to="/yeu-thich" onClick={() => setIsMobileMenuOpen(false)} className="mobile-link tenant-link danger">
                                    <i className="fas fa-heart"></i> Phòng yêu thích
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .header-container {
                    max-width: 1400px;
                    width: 100%;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 1.5rem;
                }
                @media (max-width: 480px) {
                    .header-container { padding: 0 0.75rem; }
                }

                /* LOGO STYLES */
                .header-logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    text-decoration: none;
                    perspective: 1000px;
                }
                .logo-icon-wrapper {
                    position: relative;
                    width: 36px;
                    height: 36px;
                }
                .logo-icon {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #4F46E5, #3B82F6);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.1rem;
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
                    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .logo-glow {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: #4F46E5;
                    border-radius: 12px;
                    filter: blur(12px);
                    opacity: 0;
                    transition: all 0.4s ease;
                }
                .header-logo:hover .logo-icon {
                    transform: rotateY(180deg) scale(1.05);
                }
                .header-logo:hover .logo-glow {
                    opacity: 0.4;
                }
                .logo-text {
                    font-weight: 900;
                    font-size: 1.25rem;
                    color: #1E293B;
                    letter-spacing: -1px;
                    transition: all 0.3s ease;
                }

                /* DESKTOP NAV */
                .desktop-nav {
                    display: none;
                    align-items: center;
                    gap: 4px;
                }
                @media (min-width: 1024px) {
                    .desktop-nav { display: flex; }
                    .mobile-toggle-btn { display: none !important; }
                }

                /* NAV LINK STYLES */
                .nav-link-modern {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    border-radius: 10px;
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: #475569;
                    text-decoration: none;
                    transition: all 0.3s ease;
                }
                .nav-link-modern i {
                    font-size: 0.85rem;
                    opacity: 0.7;
                    transition: transform 0.3s ease;
                }
                .nav-link-modern:hover {
                    color: #4F46E5;
                    background: rgba(79, 70, 229, 0.06);
                }
                .nav-link-modern:hover i {
                    transform: translateY(-2px);
                    opacity: 1;
                }
                .nav-link-modern.active {
                    color: #4F46E5;
                    background: rgba(79, 70, 229, 0.08);
                }
                .active-line {
                    position: absolute;
                    bottom: 2px;
                    left: 15%;
                    right: 15%;
                    height: 3px;
                    background: #4F46E5;
                    border-radius: 10px;
                    animation: lineFadeIn 0.3s ease-out;
                }
                @keyframes lineFadeIn {
                    from { opacity: 0; transform: scaleX(0); }
                    to { opacity: 1; transform: scaleX(1); }
                }

                .nav-icon-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .notif-badge {
                    position: absolute;
                    top: -8px;
                    right: -10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 17px;
                    height: 17px;
                    padding: 0 4px;
                    background: linear-gradient(135deg, #FF4D4D, #EF4444);
                    border-radius: 20px;
                    border: 1.5px solid white;
                    color: white;
                    font-size: 0.6rem;
                    font-weight: 900;
                    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
                    animation: badgePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    z-index: 20;
                }

                @keyframes badgePulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    50% { transform: scale(1.15); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }

                .nav-divider {
                    width: 1px;
                    height: 20px;
                    background: rgba(226, 232, 240, 0.8);
                    margin: 0 10px;
                }

                /* BUTTONS */
                .login-btn-modern {
                    color: #475569;
                    font-weight: 700;
                    font-size: 0.9rem;
                    text-decoration: none;
                    padding: 10px 18px;
                    transition: all 0.3s ease;
                }
                .login-btn-modern:hover {
                    color: #2563EB;
                }
                .register-btn-modern {
                    background: linear-gradient(135deg, #4F46E5, #3B82F6);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 0.8rem;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .register-btn-modern:hover {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 15px 30px -8px rgba(79, 70, 229, 0.5);
                }
                .register-btn-modern i {
                    transition: transform 0.3s ease;
                }
                .register-btn-modern:hover i {
                    transform: translateX(4px);
                }
                @media (max-width: 400px) {
                    .register-btn-modern { padding: 8px 12px; font-size: 0.75rem; gap: 6px; }
                    .login-btn-modern { padding: 8px 10px; font-size: 0.8rem; }
                }

                /* USER PROFILE */
                .user-profile-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 4px 14px 4px 4px;
                    background: white;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    border-radius: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .user-profile-btn:hover {
                    border-color: #4F46E5;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                }
                .user-avatar {
                    width: 32px; height: 32px;
                    background: linear-gradient(135deg, #4F46E5, #3B82F6);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 800;
                    font-size: 0.9rem;
                }
                .user-avatar.large { width: 48px; height: 48px; border-radius: 16px; font-size: 1.2rem; }
                .user-info-text { display: flex; flex-direction: column; text-align: left; }
                .user-name { font-weight: 800; font-size: 0.88rem; color: #1E293B; line-height: 1.2; }
                .user-role { font-size: 0.72rem; color: #64748B; font-weight: 500; }
                .caret-icon { font-size: 0.7rem; color: #94A3B8; transition: transform 0.3s ease; }
                .rotate-180 { transform: rotate(180deg); }

                @media (max-width: 768px) {
                    .user-info-text, .caret-icon { display: none; }
                    .user-profile-btn { padding: 4px; border-radius: 12px; gap: 0; }
                }

                /* DROPDOWN */
                .dropdown-panel {
                    position: absolute; right: 0; top: calc(100% + 12px);
                    width: 280px; background: white;
                    border-radius: 20px;
                    padding: 10px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    animation: dropdownFade 0.3s cubic-bezier(0.23, 1, 0.32, 1);
                    z-index: 1001;
                }
                @keyframes dropdownFade {
                    from { transform: translateY(15px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                .dropdown-header {
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    border-bottom: 1px solid #F1F5F9;
                    margin-bottom: 8px;
                }
                .full-name { font-weight: 800; color: #1E293B; font-size: 1rem; margin-bottom: 2px; }
                .user-email { color: #64748B; font-size: 0.75rem; }
                .dropdown-item {
                    display: flex; align-items: center; gap: 12px;
                    padding: 12px 16px; border-radius: 12px;
                    color: #475569; font-weight: 600; font-size: 0.9rem;
                    text-decoration: none; transition: all 0.2s ease;
                }
                .dropdown-item:hover { background: #F8FAFC; color: #4F46E5; }
                .dropdown-item i { width: 18px; font-size: 0.95rem; opacity: 0.6; }
                .dropdown-divider { height: 1px; background: #F1F5F9; margin: 8px; }
                .logout-btn { width: 100%; border: none; background: none; color: #EF4444; text-align: left; cursor: pointer; }
                .logout-btn:hover { background: #FEF2F2; color: #DC2626; }

                /* MOBILE MENU */
                /* MOBILE MENU DROPDOWN */
                .mobile-toggle-btn {
                    width: 40px; height: 40px;
                    background: #F8FAFC; border: 1px solid #E2EAF4;
                    border-radius: 10px; color: #1E293B;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                }
                .mobile-dropdown {
                    position: absolute; top: 100%; left: 0; width: 100%;
                    background: rgba(255, 255, 255, 1);
                    border-top: 1px solid #F1F5F9;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
                    padding: 10px;
                    animation: slide-up 0.25s ease-out;
                    max-height: calc(100vh - 80px);
                    overflow-y: auto;
                    z-index: 1000;
                }
                .mobile-links { display: flex; flex-direction: column; gap: 4px; }
                .mobile-link {
                    display: flex; align-items: center; gap: 14px;
                    padding: 12px 14px; border-radius: 12px;
                    text-decoration: none; color: #475569;
                    font-weight: 700; font-size: 0.92rem;
                    transition: all 0.2s ease;
                }
                .mobile-link.active { background: #EFF6FF; color: #2563EB; }
                .link-icon-bg {
                    width: 34px; height: 34px; border-radius: 10px;
                    background: #F8FAFC; display: flex; align-items: center;
                    justify-content: center; color: #64748B; font-size: 0.85rem;
                }
                .mobile-link.active .link-icon-bg { background: white; color: #2563EB; }
                .active-check { margin-left: auto; font-size: 0.75rem; color: #2563EB; }
                .mobile-divider { height: 1px; background: #F1F5F9; margin: 10px 14px; }
                
                .mobile-admin-section { padding: 6px 0; }
                .section-title { font-size: 0.72rem; color: #94A3B8; font-weight: 800; text-transform: uppercase; margin: 10px 14px 6px; letter-spacing: 0.5px; }
                
                @keyframes slide-up {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </header>
    );
}

export default Header;
