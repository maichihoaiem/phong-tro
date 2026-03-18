import React, { useState } from 'react';

const FeatureCard = ({ icon, title, desc, color }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="premium-card"
            style={{
                padding: '40px 30px',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: isHovered ? 'linear-gradient(to bottom, var(--surface), var(--surface-alt))' : 'var(--surface)'
            }}
        >
            <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: `${color}12`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                transition: 'all 0.4s ease',
                transform: isHovered ? 'rotate(10deg) scale(1.1)' : 'none',
                boxShadow: isHovered ? `0 10px 20px ${color}20` : 'none'
            }}>
                <i className={icon} style={{ fontSize: '1.4rem', color: color }}></i>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px', letterSpacing: '-0.3px' }}>{title}</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.6', margin: 0, fontWeight: 500 }}>{desc}</p>
        </div>
    );
};

function FeaturesSection() {
    const features = [
        {
            icon: "fas fa-user-shield",
            title: "Xác thực 100%",
            desc: "Mọi tin đăng đều được đội ngũ chuyên gia kiểm duyệt gắt gao, đảm bảo thông tin chính xác và an toàn.",
            color: "#2563EB"
        },
        {
            icon: "fas fa-rocket",
            title: "Trải nghiệm mượt mà",
            desc: "Tìm phòng chỉ trong vài giây với bộ lọc thông minh và giao diện tối ưu hóa cho từng thiết bị.",
            color: "#0EA5E9"
        },
        {
            icon: "fas fa-gem",
            title: "Đặc quyền riêng biệt",
            desc: "Nhận ngay các ưu đãi độc quyền và hỗ trợ 24/7 từ hệ thống đối tác uy tín của chúng tôi.",
            color: "#8B5CF6"
        }
    ];

    return (
        <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }} className="fade-up">
                <span style={{ 
                    color: '#2563EB', 
                    fontWeight: 800, 
                    fontSize: '0.68rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px',
                    marginBottom: '4px',
                    display: 'block'
                }}>Ưu Điểm Vượt Trội</span>
                <h2 style={{ 
                    fontSize: '1.3rem', 
                    fontWeight: 900, 
                    color: '#0F172A', 
                    marginBottom: '0px', 
                    letterSpacing: '-0.3px',
                    lineHeight: 1.2
                }}>
                    Tại sao bạn nên chọn <span style={{ color: '#2563EB' }}>OZIC HOUSE?</span>
                </h2>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                gap: '40px' 
            }}>
                {features.map((f, i) => (
                    <div key={i} className="fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                        <FeatureCard {...f} />
                    </div>
                ))}
            </div>
        </section>
    );
}

export default FeaturesSection;
