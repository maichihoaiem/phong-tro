import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

const ValueCard = ({ icon, title, desc, delay }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="p-6 md:p-10 rounded-[32px] border border-slate-100 transition-all duration-500 opacity-0"
            style={{
                backgroundColor: 'white',
                boxShadow: isHovered ? '0 30px 60px -12px rgba(15, 28, 63, 0.12)' : '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
                transform: isHovered ? 'translateY(-10px) scale(1.02)' : 'none',
                textAlign: 'left',
                animation: `fadeUp 0.8s ease forwards ${delay}s`,
            }}
        >
            <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '18px',
                background: isHovered ? 'linear-gradient(135deg, #2563EB, #60A5FA)' : '#F8FAFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '28px',
                transition: 'all 0.4s ease'
            }}>
                <i className={icon} style={{ fontSize: '1.5rem', color: isHovered ? 'white' : '#2563EB' }}></i>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F1C3F', marginBottom: '16px' }}>{title}</h3>
            <p style={{ color: '#64748B', lineHeight: '1.7', fontSize: '1rem', margin: 0 }}>{desc}</p>
        </div>
    );
};

function Introduction() {
    return (
        <div style={{ backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
            <Helmet>
                <title>Giới thiệu - OZIC HOUSE Premium</title>
                <meta name="description" content="Khám phá kỷ nguyên mới của thuê trọ cùng OZIC HOUSE." />
            </Helmet>

            {/* ARTISTIC HERO */}
            <section className="min-h-[50vh] md:min-h-[60vh] flex items-center px-6 py-10 md:py-20 max-w-[1240px] mx-auto relative content-section-intro">
                <div style={{ flex: '1', zIndex: 1 }}>
                    <span style={{ 
                        color: '#2563EB', 
                        fontWeight: 800, 
                        fontSize: '0.9rem', 
                        textTransform: 'uppercase', 
                        letterSpacing: '3px',
                        marginBottom: '24px',
                        display: 'block'
                    }}>Sáng tạo không gian sống</span>
                    <h1 style={{ 
                        fontSize: 'clamp(2.2rem, 5vw, 4rem)', 
                        fontWeight: 900, 
                        color: '#0F1C3F', 
                        lineHeight: 1.2, 
                        letterSpacing: '-2px',
                        marginBottom: '32px'
                    }}>
                        Mở ra kỷ nguyên<br />
                        <span style={{ color: '#2563EB' }}>OZIC HOUSE.</span>
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#64748B', maxWidth: '500px', lineHeight: 1.6, marginBottom: '40px' }}>
                        Chúng tôi không chỉ số hóa việc tìm phòng, chúng tôi định nghĩa lại sự an tâm cho mỗi hành trình ổn định cuộc sống.
                    </p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <Link to="/tim-phong" className="btn-premium btn-premium-primary" style={{ padding: '18px 40px', borderRadius: '100px' }}>
                            Khám phá ngay
                        </Link>
                    </div>
                </div>

                {/* Hero Minimalist Image Composition */}
                <div style={{ flex: '0.8', position: 'relative', height: '600px' }} className="hidden lg:block">
                    <div style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        width: '80%',
                        height: '100%',
                        borderRadius: '40px',
                        overflow: 'hidden',
                        boxShadow: '0 50px 100px -20px rgba(15, 28, 63, 0.2)'
                    }}>
                        <img 
                            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?fit=crop&w=800&q=80" 
                            alt="Interior" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <div style={{
                        position: 'absolute',
                        bottom: '-40px',
                        left: '0',
                        width: '50%',
                        height: '60%',
                        borderRadius: '30px',
                        border: '12px solid white',
                        overflow: 'hidden',
                        boxShadow: '0 30px 60px -12px rgba(15, 28, 63, 0.15)'
                    }}>
                        <img 
                            src="https://images.unsplash.com/photo-1513694203232-719a280e022f?fit=crop&w=600&q=80" 
                            alt="Interior Detail" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                </div>
            </section>

            {/* STAGGERED NARRATIVE: MISSION */}
            <section className="py-12 md:py-24 px-6 bg-slate-50">
                <div className="max-w-[1100px] mx-auto flex flex-col gap-12 md:gap-24">
                    
                    {/* Mission */}
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '60px' }}>
                        <div style={{ flex: '1', minWidth: '320px' }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F1C3F', marginBottom: '24px', letterSpacing: '-1px', lineHeight: 1.3 }}>
                                Sứ mệnh minh bạch <br />hóa thị trường
                            </h2>
                            <p style={{ fontSize: '1rem', color: '#64748B', lineHeight: 1.8, marginBottom: '20px' }}>
                                OZIC HOUSE ra đời để phá bỏ những hoài nghi truyền thống. Mỗi bức ảnh, mỗi thông tin giá cả đều được đội ngũ của chúng tôi xác thực đa tầng. Chúng tôi tin rằng, một không gian sống tốt bắt đầu từ một thông tin chuẩn xác.
                            </p>
                        </div>
                        <div style={{ flex: '1', minWidth: '320px', height: '400px', borderRadius: '40px', overflow: 'hidden', transform: 'rotate(2deg)' }}>
                            <img src="https://images.unsplash.com/photo-1554995207-c18c203602cb?fit=crop&w=800&q=80" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Mission" />
                        </div>
                    </div>

                    {/* Vision */}
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap-reverse', gap: '60px' }}>
                        <div style={{ flex: '1', minWidth: '320px', height: '400px', borderRadius: '40px', overflow: 'hidden', transform: 'rotate(-2deg)' }}>
                            <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?fit=crop&w=800&q=80" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Vision" />
                        </div>
                        <div style={{ flex: '1', minWidth: '320px' }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F1C3F', marginBottom: '24px', letterSpacing: '-1px', lineHeight: 1.3 }}>
                                Tầm nhìn dẫn đầu <br />kỷ nguyên số
                            </h2>
                            <p style={{ fontSize: '1rem', color: '#64748B', lineHeight: 1.8, marginBottom: '20px' }}>
                                Không dừng lại ở việc kết nối, OZIC hướng tới một hệ sinh thái quản lý nhà trọ thông minh, nơi mọi giao dịch và hỗ trợ được xử lý nhanh chóng chỉ qua nền tảng số. Chúng tôi kiến tạo tiêu chuẩn mới cho bất động sản cho thuê Việt Nam.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* OZIC IN NUMBERS */}
            <section className="py-12 md:py-16 px-6 text-center">
                <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
                        {[
                            { val: '25K+', label: 'Phòng đã xác thực' },
                            { val: '10K+', label: 'Chủ trọ tin dùng' },
                            { val: '50K+', label: 'Giao dịch thành công' },
                            { val: '4.9', label: 'Xếp hạng hài lòng' }
                        ].map((stat, i) => (
                            <div key={i}>
                                <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#2563EB', marginBottom: '8px', letterSpacing: '-1px' }}>{stat.val}</div>
                                <div style={{ fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CORE VALUES */}
            <section className="py-12 md:py-24 px-6 bg-white">
                <div style={{ maxWidth: '1240px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F1C3F', marginBottom: '40px', letterSpacing: '-1px' }}>Giá trị chúng tôi theo đuổi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        <ValueCard 
                            icon="fas fa-heart" 
                            title="Tận tâm phụng sự" 
                            desc="Mỗi khách hàng là một người bạn. Chúng tôi đồng hành cùng bạn từ khi tìm kiếm đến khi ổn định cuộc sống mới."
                            delay={0}
                        />
                        <ValueCard 
                            icon="fas fa-microchip" 
                            title="Đột phá công nghệ" 
                            desc="Ứng dụng AI và Big Data để loại bỏ tin rác, hiển thị gợi ý phòng trọ thông minh và phù hợp nhất."
                            delay={0.2}
                        />
                        <ValueCard 
                            icon="fas fa-check-double" 
                            title="Tuyệt đối minh bạch" 
                            desc="Chính sách giá, tình trạng phòng và hợp đồng pháp lý luôn rõ ràng. Nói không với bất kỳ chi phí ẩn nào."
                            delay={0.4}
                        />
                    </div>
                </div>
            </section>

            {/* CTA SECTION - PREMIUM GLASSBAR */}
            <section className="px-6 py-10 md:py-16">
                <div className="max-w-[1100px] mx-auto bg-gradient-to-br from-[#0F1C3F] to-[#1E3A8A] rounded-[32px] md:rounded-[40px] px-6 py-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20">
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: '16px', letterSpacing: '-1px' }}>
                            Sẵn sàng bắt đầu kỷ nguyên sống mới?
                        </h2>
                        <p style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '32px', maxWidth: '550px', margin: '0 auto 32px' }}>
                            Cùng Ozic House kiến tạo cộng đồng văn minh và an tâm hơn cho tất cả mọi người.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/dang-ky" className="btn-premium" style={{ backgroundColor: 'white', color: '#0F1C3F', padding: '14px 35px', borderRadius: '100px', fontWeight: 800, fontSize: '0.95rem' }}>
                                Đăng ký ngay
                            </Link>
                            <Link to="/tim-phong" className="btn-premium" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '14px 35px', borderRadius: '100px', fontWeight: 700, fontSize: '0.95rem' }}>
                                Khám phòng ngay
                            </Link>
                        </div>
                    </div>
                    {/* Decorative blobs */}
                    <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', filter: 'blur(80px)' }}></div>
                    <div style={{ position: 'absolute', bottom: '-150px', right: '-150px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.15)', filter: 'blur(100px)' }}></div>
                </div>
            </section>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .btn-premium {
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-decoration: none;
                }
                .btn-premium:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
}

export default Introduction;
