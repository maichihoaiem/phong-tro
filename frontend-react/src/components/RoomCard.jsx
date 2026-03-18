import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RoomCard = ({ room }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    // Dinh dang gia
    const formatPrice = (price) => {
        if (!price) return 'Liên hệ';
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ/tháng';
    };

    // Hàm xử lý đường dẫn ảnh
    const getImageUrl = (anhPath) => {
        if (!anhPath) return 'https://via.placeholder.com/400x300?text=OZIC+HOUSE';
        if (anhPath.startsWith('http')) return anhPath;
        if (anhPath.startsWith('/uploads/')) return `${anhPath}`;

        // Lấy tên file từ đường dẫn lưu trong DB (đôi khi là đường dẫn tuyệt đối hoặc có ngoặc kép)
        const fileName = anhPath.split(/[\\/]/).pop().replace(/^"|"$/g, '');
        return `/uploads/${fileName}`;
    };

    // Hàm lấy màu cho loại phòng (Vibrant solid colors)
    const getRoomTypeColor = (typeName) => {
        const type = typeName?.toLowerCase() || '';
        if (type.includes('phòng trọ')) return { color: '#2563EB' }; // Blue
        if (type.includes('căn hộ') || type.includes('mini house')) return { color: '#8B5CF6' }; // Purple
        if (type.includes('nhà nguyên căn')) return { color: '#10B981' }; // Emerald
        if (type.includes('chung cư')) return { color: '#F59E0B' };  // Orange
        if (type.includes('ở ghép')) return { color: '#F43F5E' };    // Rose
        return { color: '#64748B' }; // Default Gray
    };

    const typeColor = getRoomTypeColor(room.TenLoaiPhong);

    return (
        <div 
            onClick={() => navigate(`/phong-tro/${room.ID_Phong}`)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="premium-card"
            style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                borderTop: `3px solid ${typeColor.color}` // Thu nhỏ dải màu một chút
            }}
        >
            {/* Image Section */}
            <div style={{ 
                position: 'relative', 
                paddingTop: '68%', 
                overflow: 'hidden',
                borderTopLeftRadius: '21px', // Khớp với dải màu nhỏ phía trên
                borderTopRightRadius: '21px',
                transform: 'translateZ(0)',
                WebkitMaskImage: '-webkit-radial-gradient(white, black)'
            }}>
                <img 
                    src={getImageUrl(room.AnhDaiDien)} 
                    alt={room.TieuDe}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.8s cubic-bezier(0.2, 0, 0.2, 1)',
                        transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                        willChange: 'transform'
                    }}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=OZIC+HOUSE';
                    }}
                />
                
                {/* Overlay gradient cho ảnh */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)',
                    opacity: isHovered ? 1 : 0.6,
                    transition: 'opacity 0.3s ease'
                }}></div>

                {/* Badge Loai Phong - Smalle size */}
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: typeColor.color,
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    boxShadow: `0 4px 10px ${typeColor.color}40`,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'white', display: 'inline-block' }}></span>
                    {room.TenLoaiPhong || 'Phòng trọ'}
                </div>

                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#2563EB',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    backdropFilter: 'blur(4px)',
                    zIndex: 2,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                    <i className="fas fa-shield-alt" style={{ marginRight: '4px' }}></i> Xác thực
                </div>
            </div>

            {/* Content Section */}
            <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: '#0F1C3F',
                    marginBottom: '4px',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: '3.1em',
                    transition: 'color 0.3s ease'
                }}>
                    {room.TieuDe}
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', color: '#64748B', gap: '8px', fontSize: '0.85rem', marginBottom: '8px' }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-50)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <i className="fas fa-map-marker-alt" style={{ color: '#3B82F6', fontSize: '0.75rem' }}></i>
                    </div>
                    <span style={{ 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: 500
                    }}>
                        {room.TenQuanHuyen}, {room.TenTinhThanh}
                    </span>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: '#2563EB', letterSpacing: '-0.5px' }}>
                            {room.Gia ? new Intl.NumberFormat('vi-VN').format(room.Gia) + 'đ' : 'Liên hệ'}
                        </span>
                        {room.Gia && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8' }}>
                                / tháng
                            </span>
                        )}
                    </div>
                    
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        background: 'var(--surface-alt)', 
                        padding: '6px 10px',
                        borderRadius: '8px',
                        color: '#475569',
                        fontSize: '0.8rem',
                        fontWeight: 700
                    }}>
                        <i className="fas fa-expand-arrows-alt" style={{ color: '#3B82F6' }}></i>
                        <span>{room.DienTich} m²</span>
                    </div>
                </div>

                {/* Hàng hiển thị thêm giá điện nước */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fas fa-bolt" style={{ color: '#F59E0B' }}></i>
                        <span>{room.GiaDien ? new Intl.NumberFormat('vi-VN').format(room.GiaDien) + 'đ' : 'Miễn phí'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fas fa-tint" style={{ color: '#0EA5E9' }}></i>
                        <span>{room.GiaNuoc ? new Intl.NumberFormat('vi-VN').format(room.GiaNuoc) + 'đ' : 'Miễn phí'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomCard;
