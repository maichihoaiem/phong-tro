import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function CallToAction() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <section style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            padding: '40px 20px 60px' 
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #0F1C3F 0%, #2563EB 100%)',
                borderRadius: '30px',
                padding: '60px 40px',
                textAlign: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(15, 28, 63, 0.25)'
            }}>
                {/* Decorative Elements */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    left: '-50px',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.03)'
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '-100px',
                    right: '-20px',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.03)'
                }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>
                        Bạn có phòng muốn cho thuê?
                    </h2>
                    <p style={{ fontSize: '1.05rem', opacity: 0.9, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
                        Tham gia cộng đồng Ozic House để tiếp cận hàng ngàn khách thuê tiềm năng mỗi tháng. Đăng tin hoàn toàn miễn phí!
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <Link 
                            to="/dang-ky"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            style={{
                                backgroundColor: 'white',
                                color: '#0F1C3F',
                                padding: '16px 40px',
                                borderRadius: '14px',
                                fontWeight: 800,
                                fontSize: '1.1rem',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease',
                                transform: isHovered ? 'translateY(-4px)' : 'none',
                                boxShadow: isHovered ? '0 10px 20px rgba(0,0,0,0.15)' : 'none'
                            }}
                        >
                            Bắt đầu ngay
                        </Link>
                        <Link 
                            to="/blog"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                padding: '16px 40px',
                                borderRadius: '14px',
                                fontWeight: 700,
                                fontSize: '1.1rem',
                                textDecoration: 'none',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                        >
                            Tìm hiểu thêm
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CallToAction;
