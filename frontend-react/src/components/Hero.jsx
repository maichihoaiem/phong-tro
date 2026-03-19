import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Hero({ onSearch }) {
    const [keyword, setKeyword] = useState('');
    const [loaiPhong, setLoaiPhong] = useState('');
    const [loaiPhongList, setLoaiPhongList] = useState([]);

    useEffect(() => {
        const fetchLoaiPhong = async () => {
            try {
                const res = await axios.get('/api/phong-tro/danh-muc/loai-phong');
                if (res.data.success) setLoaiPhongList(res.data.data);
            } catch (err) { console.error("Error fetching loai phong:", err); }
        };
        fetchLoaiPhong();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch({ keyword, loaiPhong });
    };

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const selectedLoai = loaiPhongList.find(lp => lp.ID_LoaiPhong === loaiPhong);

    return (
        <section style={{
            position: 'relative',
            height: '500px',
            display: 'flex',
            alignItems: 'center',
            backgroundImage: 'linear-gradient(135deg, rgba(15, 28, 63, 0.82) 0%, rgba(37, 99, 235, 0.4) 100%), url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            padding: '0 20px',
            overflow: 'visible' // Đổi để dropdown không bị cắt
        }}>
            {/* Vòng tròn trang trí */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                right: '-5%',
                width: '500px',
                height: '500px',
                background: 'rgba(59, 130, 246, 0.2)',
                filter: 'blur(120px)',
                borderRadius: '50%',
                zIndex: 0
            }}></div>

            <div className="container" style={{ 
                zIndex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: '40px',
                width: '100%'
            }}>
                {/* Phần Text bên trái */}
                <div style={{ flex: '1', textAlign: 'left' }} className="fade-up">
                    <h1 style={{
                        fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                        fontWeight: 900,
                        marginBottom: '16px',
                        lineHeight: 1.1,
                        letterSpacing: '-1px',
                        textShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        Tìm Kiếm <span style={{ color: '#60A5FA' }}>Phòng Trọ</span><br />
                        Đẳng Cấp & Tiện Nghi
                    </h1>
                    <p style={{
                        fontSize: '1.1rem',
                        marginBottom: '24px',
                        opacity: 0.95,
                        fontWeight: 500,
                        maxWidth: '520px',
                        lineHeight: 1.6
                    }}>
                        Hệ thống quản lý và tìm kiếm phòng trọ hàng đầu. Trải nghiệm không gian sống lý tưởng cùng OZIC HOUSE.
                    </p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fas fa-check-circle" style={{ color: '#60A5FA' }}></i>
                            <span style={{ fontWeight: 600 }}>Cập nhật mỗi ngày</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fas fa-check-circle" style={{ color: '#60A5FA' }}></i>
                            <span style={{ fontWeight: 600 }}>Tin đăng chính xác 100%</span>
                        </div>
                    </div>
                </div>

                {/* Khung tìm kiếm bên phải */}
                <div className="glass-effect fade-up" style={{
                    flex: '0 0 380px',
                    padding: '30px',
                    borderRadius: '28px',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 30px 60px rgba(15, 28, 63, 0.15)',
                    textAlign: 'left',
                    background: 'rgba(255, 255, 255, 0.95)' // Slightly more opaque for contrast
                }}>
                    <h3 style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: 800, 
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#0F1C3F'
                    }}>
                        <i className="fas fa-search-location" style={{ color: '#2563EB' }}></i>
                        Tìm kiếm ngay
                    </h3>
                    
                    <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <label style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', display: 'block', color: '#334155' }}>
                                Tiêu đề
                            </label>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                background: '#F8FAFF', 
                                borderRadius: '16px',
                                padding: '0 18px',
                                border: '1px solid #E2E8F0',
                                height: '54px'
                            }}>
                                <i className="fas fa-tag" style={{ color: '#3B82F6', marginRight: '14px' }}></i>
                                <input
                                    type="text"
                                    placeholder="Nhập tiêu đề tìm kiếm..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    style={{
                                        border: 'none',
                                        outline: 'none',
                                        width: '100%',
                                        fontSize: '0.95rem',
                                        color: '#0F1C3F',
                                        background: 'transparent',
                                        fontWeight: 600
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', display: 'block', color: '#334155' }}>
                                Loại hình phòng
                            </label>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                background: '#F8FAFF', 
                                borderRadius: '16px',
                                padding: '0 18px',
                                border: '1px solid #E2E8F0',
                                position: 'relative',
                                cursor: 'pointer',
                                height: '54px'
                            }} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                <i className="fas fa-home" style={{ color: '#3B82F6', marginRight: '14px' }}></i>
                                <div style={{
                                    fontSize: '0.95rem',
                                    color: '#0F1C3F',
                                    fontWeight: 600,
                                    flex: 1,
                                    userSelect: 'none'
                                }}>
                                    {selectedLoai ? selectedLoai.TenLoai : "Tất cả các loại"}
                                </div>
                                <i className="fas fa-chevron-down" style={{
                                    color: '#94A3B8',
                                    fontSize: '0.8rem',
                                    transition: 'transform 0.3s ease',
                                    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)'
                                }}></i>

                                {/* Custom Dropdown List */}
                                {isDropdownOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 8px)',
                                        left: 0,
                                        right: 0,
                                        background: 'white',
                                        borderRadius: '16px',
                                        boxShadow: '0 10px 25px rgba(15, 28, 63, 0.15)',
                                        border: '1px solid #E2E8F0',
                                        zIndex: 1000,
                                        overflow: 'hidden',
                                        padding: '8px',
                                        animation: 'slideUp 0.3s ease'
                                    }}>
                                        <div 
                                            className="dropdown-item"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setLoaiPhong('');
                                                setIsDropdownOpen(false);
                                            }}
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '10px',
                                                fontSize: '0.95rem',
                                                color: loaiPhong === '' ? '#2563EB' : '#475569',
                                                fontWeight: loaiPhong === '' ? 700 : 500,
                                                background: loaiPhong === '' ? '#F1F5F9' : 'transparent',
                                                transition: 'all 0.2s',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Tất cả các loại
                                        </div>
                                        {loaiPhongList.map((lp) => (
                                            <div 
                                                key={lp.ID_LoaiPhong}
                                                className="dropdown-item"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setLoaiPhong(lp.ID_LoaiPhong);
                                                    setIsDropdownOpen(false);
                                                }}
                                                style={{
                                                    padding: '12px 16px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.95rem',
                                                    color: loaiPhong === lp.ID_LoaiPhong ? '#2563EB' : '#475569',
                                                    fontWeight: loaiPhong === lp.ID_LoaiPhong ? 700 : 500,
                                                    background: loaiPhong === lp.ID_LoaiPhong ? '#F1F5F9' : 'transparent',
                                                    transition: 'all 0.2s',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {lp.TenLoai}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button type="submit" className="btn-premium btn-premium-primary" style={{
                            borderRadius: '16px',
                            padding: '18px',
                            fontSize: '1.1rem',
                            marginTop: '8px',
                            width: '100%'
                        }}>
                            Tìm kiếm ngay <i className="fas fa-arrow-right" style={{ marginLeft: '10px' }}></i>
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
                input::placeholder { color: #94A3B8; }
                .dropdown-item:hover {
                    background-color: #F8FAFF !important;
                    color: #2563EB !important;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @media (max-width: 992px) {
                    .container { flex-direction: column !important; text-align: center !important; }
                    div[style*="textAlign: left"] { text-align: center !important; }
                    div[style*="maxWidth: 550px"] { margin: 0 auto 32px !important; }
                    div[style*="flex: 0 0 420px"] { flex: 1 !important; width: 100% !important; max-width: 500px !important; }
                    div[style*="gap: 16px"] { justify-content: center !important; }
                    section { height: auto !important; padding: 100px 20px !important; }
                }
            `}</style>
        </section>
    );
}

export default Hero;
