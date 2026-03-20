import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Hero({ onSearch }) {
    const [keyword, setKeyword] = useState('');
    const [loaiPhong, setLoaiPhong] = useState('');
    const [loaiPhongList, setLoaiPhongList] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
        if (e) e.preventDefault();
        onSearch({ keyword, loaiPhong });
    };

    const selectedLoai = loaiPhongList.find(lp => lp.ID_LoaiPhong === loaiPhong);

    return (
        <section style={{
            position: 'relative',
            height: 'auto',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            backgroundImage: 'linear-gradient(135deg, rgba(15, 28, 63, 0.82) 0%, rgba(37, 99, 235, 0.4) 100%), url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            padding: '60px 20px',
            overflow: 'visible'
        }} className="hero-section">
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
                flexWrap: 'wrap',
                gap: '40px',
                width: '100%'
            }}>
                {/* Phần Text bên trái */}
                <div className="hero-text fade-up" style={{ flex: '1', minWidth: '300px' }}>
                    <h1 className="text-3xl md:text-5xl lg:text-5xl font-black mb-4 leading-[1.25] tracking-tight">
                        Tìm Kiếm <span style={{ color: '#60A5FA' }}>Phòng Trọ</span><br />
                        Đẳng Cấp & Tiện Nghi
                    </h1>
                    <p className="text-sm md:text-lg mb-6 opacity-90 font-medium max-w-[520px] leading-relaxed">
                        Hệ thống quản lý và tìm kiếm phòng trọ hàng đầu. Trải nghiệm không gian sống lý tưởng cùng OZIC HOUSE.
                    </p>
                    <div className="flex flex-wrap gap-4 mb-8 lg:mb-0">
                        <div className="flex items-center gap-2">
                            <i className="fas fa-check-circle text-blue-400"></i>
                            <span className="font-semibold text-sm">Cập nhật mỗi ngày</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="fas fa-check-circle text-blue-400"></i>
                            <span className="font-semibold text-sm">Tin đăng chính xác 100%</span>
                        </div>
                    </div>
                </div>

                {/* Khung tìm kiếm (Desktop) */}
                <div className="hidden lg:block hero-form glass-effect fade-up" style={{
                    flex: '0 0 380px',
                    padding: '30px',
                    borderRadius: '28px',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 30px 60px rgba(15, 28, 63, 0.15)',
                    background: 'rgba(255, 255, 255, 0.95)'
                }}>
                    <h3 className="text-xl font-extrabold mb-5 flex items-center gap-2 text-[#0F1C3F]">
                        <i className="fas fa-search-location text-blue-600"></i>
                        Tìm kiếm ngay
                    </h3>
                    
                    <form onSubmit={handleSearch} className="flex flex-col gap-6">
                        <div>
                            <label className="text-sm font-bold mb-2 block text-slate-700">Tiêu đề</label>
                            <div className="flex items-center bg-[#F8FAFF] rounded-2xl px-4 border border-slate-200 h-[54px]">
                                <i className="fas fa-tag text-blue-500 mr-3"></i>
                                <input
                                    type="text"
                                    placeholder="Nhập tiêu đề tìm kiếm..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="border-none outline-none w-full text-[0.95rem] text-[#0F1C3F] bg-transparent font-semibold"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold mb-2 block text-slate-700">Loại hình phòng</label>
                            <div className="flex items-center bg-[#F8FAFF] rounded-2xl px-4 border border-slate-200 relative cursor-pointer h-[54px]" 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                <i className="fas fa-home text-blue-500 mr-3"></i>
                                <div className="text-[0.95rem] text-[#0F1C3F] font-semibold flex-1 truncate">
                                    {selectedLoai ? selectedLoai.TenLoai : "Tất cả các loại"}
                                </div>
                                <i className={`fas fa-chevron-down text-slate-400 text-xs transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}></i>

                                {isDropdownOpen && (
                                    <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[1000] overflow-hidden p-2">
                                        <div 
                                            className={`px-4 py-3 rounded-xl text-sm transition-colors cursor-pointer ${loaiPhong === '' ? 'bg-slate-100 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                            onClick={(e) => { e.stopPropagation(); setLoaiPhong(''); setIsDropdownOpen(false); }}
                                        >Tất cả các loại</div>
                                        {loaiPhongList.map((lp) => (
                                            <div 
                                                key={lp.ID_LoaiPhong}
                                                className={`px-4 py-3 rounded-xl text-sm transition-colors cursor-pointer ${loaiPhong === lp.ID_LoaiPhong ? 'bg-slate-100 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                                onClick={(e) => { e.stopPropagation(); setLoaiPhong(lp.ID_LoaiPhong); setIsDropdownOpen(false); }}
                                            >{lp.TenLoai}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button type="submit" className="btn-premium btn-premium-primary rounded-2xl py-4.5 text-lg font-bold mt-2 shadow-lg hover:shadow-xl transition-all">
                            Tìm kiếm ngay <i className="fas fa-arrow-right ml-2"></i>
                        </button>
                    </form>
                </div>

                <div className="lg:hidden w-full fade-up mt-[-10px]">
                    <form onSubmit={handleSearch} className="flex flex-col gap-3">
                        <div className="flex bg-white rounded-2xl p-1 shadow-2xl border border-white/50">
                            <div className="flex-1 flex items-center px-3 border-r border-gray-100">
                                <i className="fas fa-search text-blue-500 mr-2 text-sm"></i>
                                <input
                                    type="text"
                                    placeholder="Tìm tên phòng..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="w-full border-none outline-none text-sm font-semibold text-gray-800 bg-transparent placeholder-gray-400"
                                />
                            </div>
                            
                            <div className="relative flex items-center px-2 cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                <i className="fas fa-home text-gray-400 mr-1.5 text-xs"></i>
                                <span className="text-xs font-bold text-gray-600 truncate max-w-[70px]">
                                    {selectedLoai ? selectedLoai.TenLoai : "Loại hình"}
                                </span>
                                <i className="fas fa-chevron-down text-[10px] text-gray-300 ml-1"></i>

                                {isDropdownOpen && (
                                    <div className="absolute top-[calc(100%+12px)] right-0 w-[180px] bg-white rounded-xl shadow-2xl border border-gray-100 z-[2000] p-1.5 overflow-hidden">
                                        <div 
                                            className="px-3 py-2.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                            onClick={(e) => { e.stopPropagation(); setLoaiPhong(''); setIsDropdownOpen(false); }}
                                        >Tất cả các loại</div>
                                        {loaiPhongList.map((lp) => (
                                            <div 
                                                key={lp.ID_LoaiPhong}
                                                className="px-3 py-2.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                                onClick={(e) => { e.stopPropagation(); setLoaiPhong(lp.ID_LoaiPhong); setIsDropdownOpen(false); }}
                                            >{lp.TenLoai}</div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                                <i className="fas fa-arrow-right text-xs"></i>
                            </button>
                        </div>
                        <div className="flex justify-center gap-4 text-[10px] text-white/90 font-bold">
                            <span><i className="fas fa-check text-blue-400 mr-1"></i>Chính chủ</span>
                            <span><i className="fas fa-check text-blue-400 mr-1"></i>Giá rẻ</span>
                            <span><i className="fas fa-check text-blue-400 mr-1"></i>An toàn</span>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                .hero-section {
                    height: 500px !important;
                }
                @media (max-width: 992px) {
                    .hero-section {
                        height: auto !important;
                        min-height: 220px !important;
                        padding: 16px 16px 10px !important;
                    }
                    .hero-text h1 {
                        font-size: 1.8rem !important;
                        text-align: center;
                    }
                    .hero-text p {
                        font-size: 0.9rem !important;
                        text-align: center;
                        margin-left: auto;
                        margin-right: auto;
                    }
                    .hero-text .flex {
                        justify-content: center;
                    }
                }
            `}</style>
        </section>
    );
}

export default Hero;
