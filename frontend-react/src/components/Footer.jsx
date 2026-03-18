import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    const year = new Date().getFullYear();

    const cols = [
        {
            title: 'Dịch vụ',
            links: [
                { label: 'Tìm phòng trọ', to: '/tim-phong' },
                { label: 'Đăng phòng cho thuê', to: '/dang-phong' },
                { label: 'Blog & Kinh nghiệm', to: '/blog' },
                { label: 'Giới thiệu', to: '/gioi-thieu' },
            ],
        },
        {
            title: 'Mạng xã hội',
            links: [
                { label: 'Facebook', href: 'https://www.facebook.com/share/1HxQXX1YyU/?mibextid=wwXIfr' },
                { label: 'Zalo', href: 'https://zalo.me/0706863369' },
                { label: 'TikTok', href: 'https://www.tiktok.com/@zic0904?_r=1&_t=ZS-94g8j0P4eJh' },
                { label: 'Mail', href: 'mailto:ozic2464@gmail.com' },
            ],
        },
    ];

    return (
        <footer style={{ background: '#0F1C3F', marginTop: 12, color: 'white' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 20px 40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '50px', marginBottom: '60px' }}>
                    {/* Brand */}
                    <div>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: '24px' }}>
                            <div style={{ width: 34, height: 34, borderRadius: '6px', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14 }}>
                                <i className="fas fa-home"></i>
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'white', letterSpacing: '-0.3px' }}>
                                OZIC<span style={{ color: '#60A5FA' }}>HOUSE</span>
                            </span>
                        </Link>
                        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 300, marginBottom: 20 }}>
                            Nền tảng tìm kiếm và quản lý phòng trọ hàng đầu Việt Nam. Kết nối người thuê và chủ trọ minh bạch, nhanh chóng.
                        </p>
                    </div>

                    {/* Link columns */}
                    {cols.map((col, i) => (
                        <div key={i}>
                            <h4 style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
                                {col.title}
                            </h4>
                            <ul style={{ listStyle: 'none' }}>
                                {col.links.map((lk, j) => (
                                    <li key={j} style={{ marginBottom: 10 }}>
                                        {lk.to ? (
                                            <Link to={lk.to} style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                                            >
                                                {lk.label}
                                            </Link>
                                        ) : (
                                            <a href={lk.href || '#'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.83rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                                            >
                                                {lk.label === 'Facebook' && <i className="fab fa-facebook-f" style={{ color: '#60A5FA', width: 14 }}></i>}
                                                {lk.label === 'Zalo' && <i className="fas fa-comment-dots" style={{ color: '#60A5FA', width: 14 }}></i>}
                                                {lk.label === 'TikTok' && <i className="fab fa-tiktok" style={{ color: '#60A5FA', width: 14 }}></i>}
                                                {lk.label === 'Mail' && <i className="fas fa-envelope" style={{ color: '#60A5FA', width: 14 }}></i>}
                                                {lk.label}
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Contact bar */}
                <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {[
                        { icon: 'fa-phone', text: '0706863369' },
                        { icon: 'fa-envelope', text: 'ozic2464@gmail.com' },
                        { icon: 'fa-map-marker-alt', text: 'Long Hòa, Bình Thủy, Cần Thơ, Việt Nam' },
                    ].map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                            <i className={`fas ${c.icon}`} style={{ color: '#3B82F6', fontSize: '0.72rem' }}></i>
                            {c.text}
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div style={{ padding: '20px 0', textAlign: 'center', fontSize: '0.76rem', color: 'rgba(255,255,255,0.25)' }}>
                    © {year} OZIC HOUSE. Tất cả quyền được bảo lưu.
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .footer-cols { grid-template-columns: 1fr !important; gap: 28px !important; }
                }
            `}</style>
        </footer>
    );
}

export default Footer;
