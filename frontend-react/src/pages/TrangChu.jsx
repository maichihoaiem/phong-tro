import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import RoomCard from '../components/RoomCard';
import FeaturesSection from '../components/FeaturesSection';
import BlogPreview from '../components/BlogPreview';
import CallToAction from '../components/CallToAction';

function HomePage() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchActive, setSearchActive] = useState(false);
    const [total, setTotal] = useState(0);

    useEffect(() => { loadDefaultRooms(); }, []);

    const loadDefaultRooms = () => {
        setLoading(true);
        setSearchActive(false);
        axios.get('/api/phong-tro?limit=6')
            .then(res => {
                if (res.data.success) {
                    setRooms(res.data.data);
                    setTotal(res.data.total || res.data.data.length);
                } else {
                    setError('Không thể lấy dữ liệu phòng.');
                }
                setLoading(false);
            })
            .catch(() => {
                setError('Không thể kết nối máy chủ API.');
                setLoading(false);
            });
    };

    const handleSearch = ({ keyword, loaiPhong }) => {
        if (!keyword && !loaiPhong) { loadDefaultRooms(); return; }
        setLoading(true);
        setSearchActive(true);
        setError(null);
        const params = { limit: 6 };
        if (keyword) params.keyword = keyword;
        if (loaiPhong) params.loaiPhong = loaiPhong;

        axios.get('/api/phong-tro', { params })
            .then(res => {
                if (res.data.success) {
                    setRooms(res.data.data);
                    setTotal(res.data.total || res.data.data.length);
                } else {
                    setError('Không tìm thấy kết quả phù hợp.');
                }
                setLoading(false);
            })
            .catch(() => {
                setError('Lỗi kết nối khi tìm kiếm.');
                setLoading(false);
            });
    };

    return (
        <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden' }}>
            <Hero onSearch={handleSearch} />

            {/* Room Listing Section */}
            <main className="main-content" style={{ maxWidth: '1240px', margin: '0 auto', padding: '20px 24px 60px' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '32px',
                }} className="fade-up">
                    <div style={{ maxWidth: '600px' }}>
                        <span style={{
                            color: '#2563EB',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            marginBottom: '8px',
                            display: 'block'
                        }}>Lựa Chọn Hàng Đầu</span>
                        <h3 className="text-base lg:text-[1.75rem] font-extrabold text-[#0F1C3F] mb-3 tracking-tight leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                            {searchActive ? 'Kết Quả Tìm Kiếm' : 'Mini House & Phòng Trọ Mới Nhất'}
                        </h3>
                        <p className="hidden lg:block" style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.5, maxWidth: '500px' }}>
                            {searchActive
                                ? `Chúng tôi đã tìm thấy ${total} không gian phù hợp với tiêu chí của bạn.`
                                : 'Khám phá bộ sưu tập những không gian sống đẳng cấp, tiện nghi vừa được ra mắt.'}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '120px 0' }}>
                        <div className="spin" style={{ marginBottom: '20px' }}>
                            <i className="fas fa-circle-notch" style={{ fontSize: '3rem', color: '#2563EB' }}></i>
                        </div>
                        <p style={{ color: '#64748B', fontWeight: 600, fontSize: '1.1rem' }}>Đang khởi tạo danh sách phòng...</p>
                    </div>
                ) : error ? (
                    <div style={{
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FEE2E2',
                        padding: '50px 30px',
                        borderRadius: '24px',
                        textAlign: 'center',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }} className="fade-up">
                        <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: '#EF4444', marginBottom: '20px' }}></i>
                        <h3 style={{ color: '#991B1B', marginBottom: '10px', fontSize: '1.5rem', fontWeight: 800 }}>Rất tiếc!</h3>
                        <p style={{ color: '#B91C1C', fontWeight: 500, marginBottom: '24px' }}>{error}</p>
                        <button
                            onClick={loadDefaultRooms}
                            className="btn-premium btn-premium-primary"
                        >
                            <i className="fas fa-sync-alt" style={{ marginRight: '8px' }}></i> Thử lại ngay
                        </button>
                    </div>
                ) : rooms.length > 0 ? (
                    <div>
                        <div className="home-rooms-grid mobile-horizontal-scroller">
                            {rooms.map((room, index) => (
                                <div key={room.ID_Phong} className="fade-up mobile-scroller-item-half" style={{ animationDelay: `${(index % 3) * 0.1}s` }}>
                                    <RoomCard room={room} />
                                </div>
                            ))}
                    </div>

                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '100px 40px',
                        background: 'var(--surface-alt)',
                        borderRadius: '32px',
                        border: '2px dashed #E2E8F0',
                        maxWidth: '800px',
                        margin: '0 auto'
                    }} className="fade-up">
                        <div style={{
                            width: '100px',
                            height: '100px',
                            background: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            boxShadow: 'var(--shadow)'
                        }}>
                            <i className="fas fa-search-location" style={{ fontSize: '2.5rem', color: '#CBD5E1' }}></i>
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#475569', marginBottom: '12px' }}>
                            Không tìm thấy không gian phù hợp
                        </h3>
                        <p style={{ color: '#94A3B8', maxWidth: '450px', margin: '0 auto' }}>Chúng tôi không tìm thấy phòng nào khớp với yêu cầu của bạn. Hãy thử làm mới bộ lọc hoặc sử dụng từ khóa khác.</p>
                        <button
                            onClick={loadDefaultRooms}
                            className="btn-premium btn-premium-outline"
                            style={{ marginTop: '32px' }}
                        >
                            Quay lại trang chính
                        </button>
                    </div>
                )}
            </main>

            {/* Other Sections with improved spacing */}
            <div style={{ backgroundColor: 'var(--surface-alt)', borderTop: '1px solid #F1F5F9' }}>
                <FeaturesSection />
            </div>

            <div style={{ padding: '40px 0' }}>
                <CallToAction />
            </div>

            <div style={{ backgroundColor: 'var(--surface-alt)', borderTop: '1px solid #F1F5F9', paddingBottom: '100px' }}>
                <BlogPreview />
            </div>

            <style>{`
                .home-rooms-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 360px));
                    gap: 32px;
                    justify-content: center;
                }
                @media (max-width: 992px) {
                    .home-rooms-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
                }
                @media (max-width: 640px) {
                    .home-rooms-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
                }
            `}</style>
        </div>
    );
}

export default HomePage;
