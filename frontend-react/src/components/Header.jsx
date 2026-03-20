import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function Header({ user, onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hasRejectedBooking, setHasRejectedBooking] = useState(false);
    const [hasNewRequests, setHasNewRequests] = useState(false);
    const [hasPendingRefunds, setHasPendingRefunds] = useState(false);
    const [hasPendingWithdrawals, setHasPendingWithdrawals] = useState(false);
    const [hasPendingRoomPosts, setHasPendingRoomPosts] = useState(false);

    const checkNotifications = async () => {
        if (!user) {
            setHasRejectedBooking(false);
            setHasNewRequests(false);
            setHasPendingRefunds(false);
            setHasPendingWithdrawals(false);
            setHasPendingRoomPosts(false);
            return;
        }
        try {
            if (user.ID_VaiTro === 3) {
                const res = await axios.get('/api/dat-phong/my-bookings', { withCredentials: true });
                if (res.data.success) setHasRejectedBooking(res.data.data.some(b => b.TrangThai === 'Từ chối' && b.TrangThaiThanhToan === 'Chờ hoàn tiền (Chưa có STK)'));
            }
            if (user.ID_VaiTro === 2) {
                const res = await axios.get('/api/dat-phong/requests', { withCredentials: true });
                if (res.data.success) setHasNewRequests(res.data.data.some(b => {
                    const s = (b.TrangThai || '').trim();
                    return s === 'Chờ xác nhận' || s === 'Chờ duyệt' || s === 'Chờ thanh toán' || s === '';
                }));
            }
            if (user.ID_VaiTro === 1) {
                const resRefund = await axios.get('/api/dat-phong/admin-refunds', { withCredentials: true });
                if (resRefund.data.success) setHasPendingRefunds(resRefund.data.data.some(b => b.TrangThaiThanhToan === 'Chờ hoàn tiền (Đã có STK)'));
                const resWithdraw = await axios.get('/api/wallet/admin/withdrawals', { withCredentials: true });
                if (resWithdraw.data.success) setHasPendingWithdrawals(resWithdraw.data.data.some(w => w.TrangThai === 'Chờ duyệt'));
                const resRoomPosts = await axios.get('/api/admin/room-posts', { withCredentials: true });
                if (resRoomPosts.data.success) setHasPendingRoomPosts(resRoomPosts.data.data.some(p => p.TrangThai === 'Chờ duyệt'));
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

    return (
        <header style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: '#ffffff',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #F1F5F9',
            boxShadow: scrolled ? '0 10px 15px -3px rgba(0, 0, 0, 0.04)' : 'none',
            transition: 'all 0.3s ease',
        }} className="header-main">
            <div className="header-container">

                {/* Logo */}
                <Link to="/" className="header-logo">
                    <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #4F46E5, #3B82F6)' }}>
                        <i className="fas fa-home"></i>
                    </div>
                    <span className="logo-text">
                        OZIC<span style={{ color: '#4F46E5' }}>HOUSE</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex" style={{ alignItems: 'center', gap: 2 }}>
                    {navLinks
                        .filter(link => {
                            if (user && user.ID_VaiTro === 1) return link.name === 'Trang chủ';
                            return true;
                        })
                        .map(link => (
                            <Link key={link.path} to={link.path}
                                style={navLinkStyle(isActive(link.path))}
                                onMouseEnter={e => { if (!isActive(link.path)) { e.currentTarget.style.color = '#4F46E5'; e.currentTarget.style.background = '#F5F3FF'; } }}
                                onMouseLeave={e => { if (!isActive(link.path)) { e.currentTarget.style.color = '#4B5563'; e.currentTarget.style.background = 'transparent'; } }}
                            >
                                <i className={`fas ${link.icon}`} style={{ fontSize: '0.75rem', opacity: 0.8 }}></i>
                                {link.name}
                            </Link>
                        ))}

                    {/* Admin links */}
                    {user && user.ID_VaiTro === 1 && (
                        <>
                            <div style={{ width: 1, height: 18, background: '#F1F5F9', margin: '0 8px' }}></div>
                            {[
                                { to: '/admin/hoan-tien', label: 'Hoàn tiền', icon: 'fa-shield-alt', dot: hasPendingRefunds, color: '#7C3AED' },
                                { to: '/admin/rut-tien', label: 'Rút tiền', icon: 'fa-money-check-alt', dot: hasPendingWithdrawals, color: '#0891B2' },
                                { to: '/admin/quan-ly-bai-dang', label: 'Bài đăng', icon: 'fa-list-check', dot: hasPendingRoomPosts, color: '#D97706' },
                                { to: '/admin/quan-ly-tai-khoan', label: 'Tài khoản', icon: 'fa-users', dot: false, color: '#EF4444' },
                                { to: '/admin/thong-ke', label: 'Thống kê', icon: 'fa-chart-bar', dot: false, color: '#2563EB' },
                                { to: '/admin/vi-chu-tro', label: 'Ví Chủ trọ', icon: 'fa-piggy-bank', dot: false, color: '#059669' },
                            ].map(item => (
                                <Link key={item.to} to={item.to} style={{
                                    position: 'relative', display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '7px 11px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 700,
                                    color: isActive(item.to) ? item.color : '#64748B',
                                    background: isActive(item.to) ? '#F5F3FF' : 'transparent',
                                    textDecoration: 'none', transition: 'all 0.18s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.color = item.color; e.currentTarget.style.background = '#F5F3FF'; }}
                                    onMouseLeave={e => { if (!isActive(item.to)) { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'transparent'; } }}
                                >
                                    <i className={`fas ${item.icon}`} style={{ fontSize: '0.72rem' }}></i>
                                    {item.label}
                                    {item.dot && <span className="notif-dot" style={{ top: 4, right: 4 }}></span>}
                                </Link>
                            ))}
                        </>
                    )}

                    {/* Chủ trọ links */}
                    {user && user.ID_VaiTro === 2 && (
                        <>
                            <div style={{ width: 1, height: 18, background: '#E2EAF4', margin: '0 8px' }}></div>
                            <Link to="/quan-ly-phong" style={{ ...navLinkStyle(isActive('/quan-ly-phong')), color: isActive('/quan-ly-phong') ? '#2563EB' : '#6B7280' }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; }}
                                onMouseLeave={e => { if (!isActive('/quan-ly-phong')) { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = 'transparent'; } }}
                            >
                                <i className="fas fa-tasks" style={{ fontSize: '0.75rem' }}></i> Quản lý
                            </Link>
                            <Link to="/yeu-cau-dat-phong" style={{ ...navLinkStyle(isActive('/yeu-cau-dat-phong')), color: isActive('/yeu-cau-dat-phong') ? '#D97706' : '#6B7280', position: 'relative' }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#D97706'; e.currentTarget.style.background = '#FFFBEB'; }}
                                onMouseLeave={e => { if (!isActive('/yeu-cau-dat-phong')) { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = 'transparent'; } }}
                            >
                                <i className="fas fa-bell" style={{ fontSize: '0.75rem' }}></i> Yêu cầu
                                {hasNewRequests && <span className="notif-dot" style={{ top: 4, right: 4 }}></span>}
                            </Link>
                            <Link to="/vi-tien" style={{ ...navLinkStyle(isActive('/vi-tien')), color: isActive('/vi-tien') ? '#059669' : '#6B7280' }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#059669'; e.currentTarget.style.background = '#ECFDF5'; }}
                                onMouseLeave={e => { if (!isActive('/vi-tien')) { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = 'transparent'; } }}
                            >
                                <i className="fas fa-wallet" style={{ fontSize: '0.75rem' }}></i> Ví tiền
                            </Link>
                        </>
                    )}

                    {/* Người thuê links */}
                    {user && user.ID_VaiTro === 3 && (
                        <>
                            <div style={{ width: 1, height: 18, background: '#E2EAF4', margin: '0 8px' }}></div>
                            <Link to="/dat-phong" style={{ ...navLinkStyle(isActive('/dat-phong')), position: 'relative' }}
                                onMouseEnter={e => { if (!isActive('/dat-phong')) { e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; } }}
                                onMouseLeave={e => { if (!isActive('/dat-phong')) { e.currentTarget.style.color = '#4B5563'; e.currentTarget.style.background = 'transparent'; } }}
                            >
                                <i className="fas fa-history" style={{ fontSize: '0.75rem' }}></i> Lịch sử
                                {hasRejectedBooking && <span className="notif-dot" style={{ top: 4, right: 4 }}></span>}
                            </Link>
                            <Link to="/yeu-thich" style={{ ...navLinkStyle(isActive('/yeu-thich')), color: isActive('/yeu-thich') ? '#DC2626' : '#4B5563' }}
                                onMouseEnter={e => { if (!isActive('/yeu-thich')) { e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.background = '#FFF2F2'; } }}
                                onMouseLeave={e => { if (!isActive('/yeu-thich')) { e.currentTarget.style.color = '#4B5563'; e.currentTarget.style.background = 'transparent'; } }}
                            >
                                <i className="fas fa-heart" style={{ fontSize: '0.75rem' }}></i> Yêu thích
                            </Link>
                        </>
                    )}
                </nav>

                {/* Right: Auth / User */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {user ? (
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setShowDropdown(!showDropdown)} style={{
                                display: 'flex', alignItems: 'center', gap: 9,
                                padding: '5px 12px 5px 5px',
                                background: '#F8FAFF', border: '1.5px solid #DBEAFE',
                                borderRadius: 999, cursor: 'pointer', transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#93C5FD'; e.currentTarget.style.background = '#EFF6FF'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#DBEAFE'; e.currentTarget.style.background = '#F8FAFF'; }}
                            >
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontWeight: 800, fontSize: 13,
                                }}>
                                    {user.HoTen.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1E293B' }} className="hidden sm:block">
                                    {user.HoTen}
                                </span>
                                <i className="fas fa-chevron-down" style={{ color: '#9CA3AF', fontSize: '0.6rem' }}></i>
                            </button>

                            {showDropdown && (
                                <div style={{
                                    position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                                    width: 256, background: '#FFFFFF',
                                    border: '1px solid #E2EAF4', borderRadius: 18,
                                    padding: '8px', zIndex: 200,
                                    boxShadow: '0 20px 60px rgba(37,99,235,0.12), 0 4px 24px rgba(0,0,0,0.07)',
                                    animation: 'slide-up 0.18s ease-out',
                                }}>
                                    {/* User info */}
                                    <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid #F1F5FB', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontWeight: 800, fontSize: 15, flexShrink: 0,
                                        }}>
                                            {user.HoTen.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ overflow: 'hidden' }}>
                                            <p style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F1C3F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.HoTen}</p>
                                            <p style={{ fontSize: '0.73rem', color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.Email}</p>
                                        </div>
                                    </div>

                                    {[
                                        { to: '/tai-khoan', icon: 'fa-user-circle', label: 'Tài khoản của tôi' },
                                        { to: '/yeu-thich', icon: 'fa-heart', label: 'Phòng yêu thích' },
                                        { to: '/dat-phong', icon: 'fa-history', label: 'Lịch sử đặt phòng' },
                                    ].map(item => (
                                        <Link key={item.to} to={item.to} style={dropdownLinkStyle}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.color = '#2563EB'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151'; }}
                                        >
                                            <i className={`fas ${item.icon}`} style={{ opacity: 0.65, width: 16, textAlign: 'center', color: '#6B7280' }}></i>
                                            {item.label}
                                        </Link>
                                    ))}

                                    {user.ID_VaiTro === 2 && (
                                        <>
                                            <div style={{ height: 1, background: '#F1F5FB', margin: '6px 0' }}></div>
                                            {[
                                                { to: '/quan-ly-phong', icon: 'fa-tasks', label: 'Quản lý phòng' },
                                                { to: '/vi-tien', icon: 'fa-wallet', label: 'Ví tiền' },
                                                { to: '/yeu-cau-dat-phong', icon: 'fa-clipboard-list', label: 'Yêu cầu đặt phòng' },
                                            ].map(item => (
                                                <Link key={item.to} to={item.to} style={{ ...dropdownLinkStyle, color: '#2563EB', fontWeight: 700 }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                                >
                                                    <i className={`fas ${item.icon}`} style={{ opacity: 0.7, width: 16, textAlign: 'center' }}></i>
                                                    {item.label}
                                                </Link>
                                            ))}
                                        </>
                                    )}

                                    <div style={{ height: 1, background: '#F1F5FB', margin: '6px 0' }}></div>
                                    <button onClick={handleLogout} style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: 11,
                                        padding: '9px 14px', borderRadius: 10, color: '#DC2626',
                                        fontSize: '0.83rem', fontWeight: 700,
                                        background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#FFF2F2'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <i className="fas fa-sign-out-alt" style={{ opacity: 0.8, width: 16, textAlign: 'center' }}></i>
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Link to="/dang-nhap" style={{ padding: '8px 12px', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', borderRadius: 10, textDecoration: 'none', transition: 'color 0.18s' }}
                                className="whitespace-nowrap"
                                onMouseEnter={e => e.currentTarget.style.color = '#2563EB'}
                                onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
                            >
                                Đăng nhập
                            </Link>
                            <Link to="/dang-ky" style={{
                                padding: '8px 14px', fontSize: '0.78rem', fontWeight: 800,
                                background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
                                color: 'white', borderRadius: 10, textDecoration: 'none',
                                transition: 'all 0.22s', display: 'inline-block',
                                boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
                            }}
                                className="whitespace-nowrap"
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.45)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.35)'; }}
                            >
                                Đăng ký
                            </Link>
                        </div>
                    )}

                {/* Mobile toggle */}
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden" style={{
                    padding: '8px 10px', background: '#F0F4F8', border: '1px solid #E2EAF4',
                    borderRadius: 10, color: '#6B7280', cursor: 'pointer', fontSize: '1rem',
                }}>
                    <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div style={{ background: '#FFFFFF', borderTop: '1px solid #E2EAF4', padding: '12px 16px', animation: 'slide-up 0.2s ease-out' }} className="md:hidden">
                    {navLinks
                        .filter(link => { if (user && user.ID_VaiTro === 1) return link.name === 'Trang chủ'; return true; })
                        .map(link => (
                            <Link key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)}
                                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, marginBottom: 2, fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none', color: isActive(link.path) ? '#2563EB' : '#374151', background: isActive(link.path) ? '#EFF6FF' : 'transparent' }}>
                                <i className={`fas ${link.icon}`} style={{ width: 18, textAlign: 'center', fontSize: '0.82rem', color: isActive(link.path) ? '#2563EB' : '#9CA3AF' }}></i>
                                {link.name}
                            </Link>
                        ))}

                    {user && user.ID_VaiTro === 1 && (
                        <>
                            <div style={{ height: 1, background: '#F1F5FB', margin: '8px 0' }}></div>
                            {[
                                { to: '/admin/hoan-tien', label: 'Quản lý hoàn tiền', dot: hasPendingRefunds },
                                { to: '/admin/rut-tien', label: 'Duyệt rút tiền', dot: hasPendingWithdrawals },
                                { to: '/admin/quan-ly-bai-dang', label: 'Quản lý bài đăng', dot: hasPendingRoomPosts },
                                { to: '/admin/quan-ly-tai-khoan', label: 'Quản lý tài khoản', dot: false },
                                { to: '/admin/thong-ke', label: 'Thống kê doanh thu', dot: false },
                                { to: '/admin/vi-chu-tro', label: 'Quản lý Ví Chủ trọ', dot: false },
                            ].map(item => (
                                <Link key={item.to} to={item.to} onClick={() => setIsMobileMenuOpen(false)}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', borderRadius: 12, marginBottom: 2, fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none', color: '#374151' }}>
                                    {item.label}
                                    {item.dot && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }}></span>}
                                </Link>
                            ))}
                        </>
                    )}
                    {user && user.ID_VaiTro === 2 && (
                        <>
                            <div style={{ height: 1, background: '#F1F5FB', margin: '8px 0' }}></div>
                            <Link to="/quan-ly-phong" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'block', padding: '11px 14px', borderRadius: 12, marginBottom: 2, fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none', color: '#2563EB' }}>Quản lý phòng</Link>
                            <Link to="/yeu-cau-dat-phong" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', borderRadius: 12, marginBottom: 2, fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none', color: '#D97706' }}>
                                Yêu cầu đặt phòng
                                {hasNewRequests && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }}></span>}
                            </Link>
                            <Link to="/vi-tien" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'block', padding: '11px 14px', borderRadius: 12, fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none', color: '#059669' }}>Ví tiền của tôi</Link>
                        </>
                    )}
                    {user && user.ID_VaiTro === 3 && (
                        <>
                            <div style={{ height: 1, background: '#F1F5FB', margin: '8px 0' }}></div>
                            <Link to="/dat-phong" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', borderRadius: 12, marginBottom: 2, fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none', color: '#374151' }}>
                                Lịch sử đặt phòng
                                {hasRejectedBooking && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }}></span>}
                            </Link>
                            <Link to="/yeu-thich" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'block', padding: '11px 14px', borderRadius: 12, fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none', color: '#374151' }}>Phòng yêu thích</Link>
                        </>
                    )}
                </div>
            )}
            <style>{`
                .header-main {
                    margin-bottom: 20px;
                }
                .header-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 1.5rem;
                }
                .header-logo {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    text-decoration: none;
                    flex-shrink: 0;
                }
                .logo-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    background: #2563EB;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 16px;
                }
                .logo-text {
                    font-weight: 800;
                    font-size: 1.25rem;
                    color: #0F1C3F;
                    letter-spacing: -0.5px;
                }
                @media (max-width: 768px) {
                    .header-main {
                        margin-bottom: 4px;
                    }
                    .header-container {
                        height: 56px;
                        padding: 0 1rem;
                    }
                    .header-logo {
                        gap: 6px;
                    }
                    .logo-icon {
                        width: 28px;
                        height: 28px;
                        font-size: 12px;
                        border-radius: 6px;
                    }
                    .logo-text {
                        font-size: 1.05rem;
                    }
                }
                @keyframes slide-up {
                    from { transform: translateY(10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .notif-dot {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background: #EF4444;
                    border-radius: 50%;
                    border: 2px solid #FFFFFF;
                }
            `}</style>
        </header>
    );
}

export default Header;
