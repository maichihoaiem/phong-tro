import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function CallToAction() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <section className="cta-container">
            <div className="bg-gradient-to-br from-[#0F1C3F] to-[#2563EB] rounded-[30px] p-8 lg:p-[60px_40px] text-center text-white relative overflow-hidden shadow-2xl">
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

                <div style={{ position: 'relative', zIndex: 1 }} className="flex flex-col items-center">
                    <h2 className="text-xl lg:text-[2rem] font-extrabold mb-3 lg:mb-4">
                        Bạn có phòng muốn cho thuê?
                    </h2>
                    <p className="text-xs lg:text-[1.05rem] opacity-90 mb-6 lg:mb-8 max-w-[700px] leading-relaxed lg:leading-[1.6]">
                        Tham gia cộng đồng Ozic House để tiếp cận hàng ngàn khách thuê tiềm năng mỗi tháng. Đăng tin hoàn toàn miễn phí!
                    </p>
                    <div className="cta-buttons-wrapper">
                        <Link 
                            to="/dang-ky"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className="bg-white text-[#0F1C3F] px-6 lg:px-[40px] py-3 lg:py-[16px] rounded-xl lg:rounded-[14px] font-extrabold text-sm lg:text-[1.1rem] decoration-none transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
                            style={{
                                transform: isHovered ? 'translateY(-4px)' : 'none',
                            }}
                        >
                            Bắt đầu ngay
                        </Link>
                        <Link 
                            to="/blog"
                            className="bg-white/10 text-white px-6 lg:px-[40px] py-3 lg:py-[16px] rounded-xl lg:rounded-[14px] font-bold text-sm lg:text-[1.1rem] decoration-none border border-white/20 transition-all duration-300 hover:bg-white/20 active:scale-95"
                        >
                            Tìm hiểu thêm
                        </Link>
                    </div>
                </div>
            </div>
            <style>{`
                .cta-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 40px 20px 60px;
                }
                .cta-buttons-wrapper {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    flex-wrap: wrap;
                }
                @media (max-width: 768px) {
                    .cta-container {
                        padding: 20px 12px !important;
                    }
                    .cta-buttons-wrapper {
                        gap: 12px;
                    }
                }
            `}</style>
        </section>
    );
}

export default CallToAction;
