import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RoomCard from '../components/RoomCard';

function SearchPage({ user }) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [filters, setFilters] = useState({
        keyword: searchParams.get('keyword') || '',
        loaiPhong: searchParams.get('loaiPhong') || '',
        tinhThanh: [],
        giaMin: searchParams.get('giaMin') || '',
        giaMax: searchParams.get('giaMax') || ''
    });

    const [loaiPhongList, setLoaiPhongList] = useState([]);
    const [tinhThanhList, setTinhThanhList] = useState([]);
    const [showTinhThanh, setShowTinhThanh] = useState(false);
    const dropdownRef = useRef(null);
    const mainRef = useRef(null);

    useEffect(() => {
        loadLoaiPhong();
        loadTinhThanh();
        searchRooms();
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowTinhThanh(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const loadLoaiPhong = async () => {
        try {
            const res = await axios.get('/api/phong-tro/danh-muc/loai-phong');
            if (res.data.success) setLoaiPhongList(res.data.data);
        } catch (err) { }
    };

    const loadTinhThanh = async () => {
        try {
            const res = await axios.get('/api/location/tinh-thanh');
            if (res.data && res.data.success) setTinhThanhList(res.data.data);
        } catch (err) { }
    };

    const toggleTinhThanh = (name) => {
        setFilters(prev => {
            const selected = [...prev.tinhThanh];
            const idx = selected.indexOf(name);
            if (idx > -1) selected.splice(idx, 1); else selected.push(name);
            return { ...prev, tinhThanh: selected };
        });
    };

    const getSelectedTinhThanhText = () => {
        if (filters.tinhThanh.length === 0) return 'Tất cả tỉnh thành';
        const names = tinhThanhList.filter(tt => filters.tinhThanh.includes(tt.name)).map(tt => tt.name);
        if (names.length <= 2) return names.join(', ');
        return `${names[0]}, ${names[1]} +${names.length - 2}`;
    };

    const searchRooms = async (page = 1, overrideFilters = null) => {
        setLoading(true);
        const currentFilters = overrideFilters || filters;
        try {
            const params = { page, limit: 12 };
            if (currentFilters.keyword) params.keyword = currentFilters.keyword;
            if (currentFilters.loaiPhong) params.loaiPhong = currentFilters.loaiPhong;
            if (currentFilters.tinhThanh.length > 0) params.tinhThanh = currentFilters.tinhThanh.join(',');
            if (currentFilters.giaMin) params.giaMin = currentFilters.giaMin;
            if (currentFilters.giaMax) params.giaMax = currentFilters.giaMax;
            const res = await axios.get('/api/phong-tro', { params });
            if (res.data.success) {
                setRooms(res.data.data);
                setTotalPages(res.data.totalPages);
                setCurrentPage(res.data.page);
                setTotal(res.data.total);
                
                // Scroll to top of results container
                if (mainRef.current) {
                    mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        } catch (err) { } finally { setLoading(false); }
    };

    const handleSearch = (e) => { e.preventDefault(); searchRooms(1); setSidebarOpen(false); };
    const handleFilterChange = (name, value) => setFilters({ ...filters, [name]: value });

    const activeFiltersCount = [
        filters.keyword, filters.loaiPhong,
        filters.tinhThanh.length > 0,
        filters.giaMin, filters.giaMax,
    ].filter(Boolean).length;

    /* ----- Input style helper ----- */
    const inputSt = {
        width: '100%', padding: '10px 14px', background: 'var(--surface-alt)',
        border: '1.5px solid #DBEAFE', borderRadius: 11, outline: 'none',
        fontFamily: 'inherit', fontSize: '0.85rem', color: '#0F1C3F',
        transition: 'all 0.2s',
    };

    /* ----- Sidebar filter panel content ----- */
    const filterSidebarContent = (
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>
            <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                paddingRight: '4px',
                paddingBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20
            }} className="custom-scrollbar">
                {/* Keyword */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 8 }}>
                        Từ khóa tìm kiếm
                    </label>
                    <div style={{ position: 'relative' }}>
                        <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: '0.78rem' }}></i>
                        <input type="text" value={filters.keyword}
                            onChange={e => handleFilterChange('keyword', e.target.value)}
                            placeholder="Tiêu đề, địa chỉ..."
                            style={{ ...inputSt, paddingLeft: 36 }}
                            onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.15)'; }}
                            onBlur={e => { e.target.style.borderColor = '#DBEAFE'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>
                </div>

                {/* Tỉnh thành */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 8 }}>
                        Tỉnh / Thành phố
                    </label>
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <button type="button" onClick={() => setShowTinhThanh(!showTinhThanh)} style={{
                            width: '100%', ...inputSt, display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', cursor: 'pointer',
                            background: showTinhThanh ? 'var(--primary-50)' : 'var(--surface-alt)',
                            borderColor: showTinhThanh ? 'var(--primary)' : 'var(--border-strong)',
                        }}>
                            <span style={{ color: filters.tinhThanh.length === 0 ? '#9CA3AF' : '#0F1C3F', fontSize: '0.85rem', fontWeight: 600 }}>
                                {getSelectedTinhThanhText()}
                            </span>
                            <i className="fas fa-chevron-down" style={{ color: '#9CA3AF', fontSize: '0.65rem', transform: showTinhThanh ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s' }}></i>
                        </button>
                        {showTinhThanh && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100,
                                background: 'white', border: '1px solid #DBEAFE', borderRadius: 14,
                                boxShadow: '0 8px 32px rgba(37,99,235,0.15)', overflow: 'hidden',
                                animation: 'slide-up 0.15s ease-out',
                            }}>
                                <div style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5FB' }}>
                                    <input type="text" placeholder="Tìm tỉnh thành..." style={{ width: '100%', padding: '7px 12px', background: 'var(--surface-alt)', border: '1px solid #E2EAF4', borderRadius: 9, fontSize: '0.82rem', outline: 'none', fontFamily: 'inherit' }}
                                        onChange={e => {
                                            const v = e.target.value.toLowerCase();
                                            dropdownRef.current.querySelectorAll('.prov-item').forEach(el => {
                                                el.style.display = el.textContent.toLowerCase().includes(v) ? 'flex' : 'none';
                                            });
                                        }}
                                    />
                                </div>
                                {filters.tinhThanh.length > 0 && (
                                    <div style={{ padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5FB' }}>
                                        <span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 700 }}>Đã chọn: {filters.tinhThanh.length}</span>
                                        <button type="button" onClick={() => setFilters(p => ({ ...p, tinhThanh: [] }))} style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                                            Bỏ chọn hết
                                        </button>
                                    </div>
                                )}
                                <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                                    {tinhThanhList.map((tt, idx) => (
                                        <label key={tt.code || idx} className="prov-item" style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '9px 14px', cursor: 'pointer',
                                            background: filters.tinhThanh.includes(tt.name) ? '#EFF6FF' : 'transparent',
                                            transition: 'background 0.15s',
                                        }}
                                            onMouseEnter={e => { if (!filters.tinhThanh.includes(tt.name)) e.currentTarget.style.background = '#F8FAFF'; }}
                                            onMouseLeave={e => { if (!filters.tinhThanh.includes(tt.name)) e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <div style={{
                                                width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                                                border: `2px solid ${filters.tinhThanh.includes(tt.name) ? '#2563EB' : '#CBD5E1'}`,
                                                background: filters.tinhThanh.includes(tt.name) ? '#2563EB' : 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {filters.tinhThanh.includes(tt.name) && <i className="fas fa-check" style={{ color: 'white', fontSize: '0.55rem' }}></i>}
                                            </div>
                                            <input type="checkbox" checked={filters.tinhThanh.includes(tt.name)} onChange={() => toggleTinhThanh(tt.name)} style={{ display: 'none' }} />
                                            <span style={{ fontSize: '0.83rem', fontWeight: 600, color: filters.tinhThanh.includes(tt.name) ? '#2563EB' : '#374151' }}>{tt.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Loại phòng */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 8 }}>
                        Loại phòng
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {[{ value: '', label: 'Tất cả' }, ...loaiPhongList.map(lp => ({ value: String(lp.ID_LoaiPhong), label: lp.TenLoai }))].map(opt => (
                            <label key={opt.value} style={{
                                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                                borderRadius: 10, cursor: 'pointer',
                                background: filters.loaiPhong === opt.value ? 'var(--primary-50)' : 'var(--surface-alt)',
                                border: `1.5px solid ${filters.loaiPhong === opt.value ? 'var(--primary)' : 'var(--border-strong)'}`,
                                transition: 'all 0.18s',
                            }}>
                                <div style={{
                                    width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                                    border: `2px solid ${filters.loaiPhong === opt.value ? '#2563EB' : '#CBD5E1'}`,
                                    background: filters.loaiPhong === opt.value ? '#2563EB' : 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {filters.loaiPhong === opt.value && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'white' }}></div>}
                                </div>
                                <input type="radio" name="loaiPhong" value={opt.value} checked={filters.loaiPhong === opt.value}
                                    onChange={() => {
                                        const newFilters = { ...filters, loaiPhong: opt.value };
                                        setFilters(newFilters);
                                        searchRooms(1, newFilters);
                                    }} style={{ display: 'none' }} />
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: filters.loaiPhong === opt.value ? '#2563EB' : '#374151' }}>
                                    {opt.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Giá */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 8 }}>
                        Khoảng giá (VNĐ)
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input type="number" value={filters.giaMin} onChange={e => handleFilterChange('giaMin', e.target.value)} placeholder="Từ" style={{ ...inputSt, flex: 1, textAlign: 'center' }}
                            onFocus={e => { e.target.style.borderColor = 'var(--primary)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; }} />
                        <span style={{ alignSelf: 'center', color: '#9CA3AF', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>–</span>
                        <input type="number" value={filters.giaMax} onChange={e => handleFilterChange('giaMax', e.target.value)} placeholder="Đến" style={{ ...inputSt, flex: 1, textAlign: 'center' }}
                            onFocus={e => { e.target.style.borderColor = 'var(--primary)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; }} />
                    </div>
                    {/* Price shortcuts */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                        {[
                            { label: '< 2 triệu', min: '', max: '2000000' },
                            { label: '2–4 triệu', min: '2000000', max: '4000000' },
                            { label: '4–7 triệu', min: '4000000', max: '7000000' },
                            { label: '> 7 triệu', min: '7000000', max: '' },
                        ].map((p, i) => {
                            const active = filters.giaMin === p.min && filters.giaMax === p.max;
                            return (
                                <button key={i} type="button"
                                    onClick={() => setFilters(prev => ({ ...prev, giaMin: p.min, giaMax: p.max }))}
                                    style={{
                                        padding: '4px 10px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                                        background: active ? '#2563EB' : '#F0F4F8',
                                        color: active ? 'white' : '#6B7280', border: 'none', transition: 'all 0.18s',
                                    }}>
                                    {p.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ 
                    display: 'flex', 
                    gap: 8, 
                    paddingTop: '30px', 
                    paddingBottom: '10px'
                }}>
                    <button type="submit" style={{
                        flex: 1, padding: '12px', borderRadius: 10,
                        background: '#2563EB',
                        color: 'white', border: 'none', fontFamily: 'inherit',
                        fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={e => e.target.style.background = '#1D4ED8'}
                    onMouseLeave={e => e.target.style.background = '#2563EB'}
                    >
                        <i className="fas fa-search"></i> Tìm kiếm
                    </button>
                    <button type="button"
                        onClick={() => { 
                            const defaultFilters = { keyword: '', loaiPhong: '', tinhThanh: [], giaMin: '', giaMax: '' };
                            setFilters(defaultFilters); 
                            searchRooms(1, defaultFilters);
                        }}
                        style={{ padding: '12px 14px', borderRadius: 10, background: 'white', color: '#64748B', border: '1px solid var(--border-strong)', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                        <i className="fas fa-undo"></i>
                    </button>
                </div>
            </div>
        </form>
    );

    return (
        <div style={{ 
            backgroundColor: 'var(--bg)', 
            height: 'calc(100vh - 70px)', // Fill viewport minus header
            overflow: 'hidden' // Root shouldn't scroll
        }}>
            <div style={{ maxWidth: 1240, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Page header - Fixed */}
                <div style={{ 
                    padding: '16px 24px 12px', 
                    borderBottom: '1px solid #F1F5F9',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F1C3F', letterSpacing: '-0.5px', marginBottom: 2 }}>
                                Tìm Kiếm Phòng Trọ
                            </h1>
                            {total > 0 && !loading && (
                                <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                                    Tìm thấy <strong style={{ color: '#2563EB' }}>{total}</strong> kết quả phù hợp
                                </p>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {user?.ID_VaiTro === 2 && (
                                <button 
                                    onClick={() => navigate('/dang-phong')}
                                    style={{
                                        background: '#2563EB',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 18px',
                                        borderRadius: '12px',
                                        fontWeight: 800,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: '0 4px 15px rgba(37, 99, 235, 0.25)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.35)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.25)'; }}
                                >
                                    <i className="fas fa-plus"></i> Đăng phòng mới
                                </button>
                            )}

                            {/* Mobile: filter toggle button */}
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
                                display: 'none', alignItems: 'center', gap: 8,
                                padding: '10px 20px', borderRadius: 10,
                                background: '#FFFFFF', border: '1px solid #DBEAFE',
                                color: '#2563EB', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                            }} className="filter-toggle">
                                <i className="fas fa-filter"></i> Lọc {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area - Two Independent Columns */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '300px 1fr', 
                    gap: 0, 
                    flex: 1, 
                    overflow: 'hidden' 
                }} className="search-layout">
                    
                    {/* Sidebar Column - Non-scrollable container, internal scroll handled by FilterSidebar */}
                    <aside style={{
                        background: 'var(--surface-alt)',
                        borderRight: '1px solid #F1F5F9',
                        padding: '20px 24px',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }} className="search-sidebar">
                        <h2 style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F1C3F', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            <i className="fas fa-filter" style={{ color: '#2563EB', fontSize: '0.85rem' }}></i> Bộ lọc
                        </h2>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            {filterSidebarContent}
                        </div>
                    </aside>

                    {/* Results Column - Scrollable */}
                    <main 
                        ref={mainRef}
                        style={{
                            padding: '16px 32px 80px',
                            overflowY: 'auto',
                            height: '100%',
                            backgroundColor: 'var(--bg)'
                        }} className="custom-scrollbar results-main">
                        {/* Mobile filter panel integration if needed */}
                        {sidebarOpen && (
                            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E2EAF4', marginBottom: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} className="mobile-filter-panel">
                                {filterSidebarContent}
                            </div>
                        )}

                        <div style={{ position: 'relative', minHeight: '400px' }}>
                            {/* Loading Overlay - only shows when loading and we already have rooms */}
                            {loading && rooms.length > 0 && (
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                    zIndex: 10, background: 'rgba(255,255,255,0.4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backdropFilter: 'blur(2px)',
                                    borderRadius: '24px',
                                    animation: 'slide-up 0.2s ease-out'
                                }}>
                                    <div style={{
                                        background: 'white', padding: '12px 24px', borderRadius: '99px',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                        display: 'flex', alignItems: 'center', gap: '12px'
                                    }}>
                                        <i className="fas fa-circle-notch fa-spin" style={{ color: '#2563EB' }}></i>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>Đang cập nhật...</span>
                                    </div>
                                </div>
                            )}

                            {loading && rooms.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                                    <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', color: '#2563EB', marginBottom: '16px' }}></i>
                                    <p style={{ color: '#64748B', fontWeight: 500 }}>Đang tìm kiếm phòng...</p>
                                </div>
                            ) : rooms.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '100px 0', background: 'var(--surface-alt)', borderRadius: '32px', border: '2px dashed #E2E8F0' }}>
                                    <i className="fas fa-search-minus" style={{ fontSize: '3rem', color: '#CBD5E1', marginBottom: '20px' }}></i>
                                    <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#475569', marginBottom: '8px' }}>Không tìm thấy phòng</h3>
                                    <p style={{ color: '#94A3B8' }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                                </div>
                            ) : (
                                <div style={{ 
                                    opacity: loading ? 0.6 : 1, 
                                    transition: 'opacity 0.2s ease',
                                    pointerEvents: loading ? 'none' : 'auto'
                                }}>
                                    {/* Result Stats */}
                                    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                                            Hiển thị <strong>{rooms.length}</strong> trong tổng số <strong>{total}</strong> phòng
                                        </span>
                                    </div>

                                    {/* Grid */}
                                    <div className="search-rooms-grid">
                                        {rooms.map(room => <RoomCard key={room.ID_Phong} room={room} />)}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 48 }}>
                                            <button onClick={() => searchRooms(currentPage - 1)} disabled={currentPage === 1}
                                                style={{ width: 40, height: 40, borderRadius: 12, border: '1.5px solid #DBEAFE', background: 'white', color: '#2563EB', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1, fontSize: '0.82rem' }}>
                                                <i className="fas fa-chevron-left"></i>
                                            </button>

                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button key={page} onClick={() => searchRooms(page)} style={{
                                                    width: 40, height: 40, borderRadius: 12, border: `1.5px solid ${page === currentPage ? '#2563EB' : '#E2EAF4'}`,
                                                    background: page === currentPage ? '#2563EB' : 'white',
                                                    color: page === currentPage ? 'white' : '#374151',
                                                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.18s',
                                                }}>
                                                    {page}
                                                </button>
                                            ))}

                                            <button onClick={() => searchRooms(currentPage + 1)} disabled={currentPage === totalPages}
                                                style={{ width: 40, height: 40, borderRadius: 12, border: '1.5px solid #DBEAFE', background: 'white', color: '#2563EB', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1, fontSize: '0.82rem' }}>
                                                <i className="fas fa-chevron-right"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            <style>{`
                .search-rooms-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                }

                @media (max-width: 992px) {
                    .search-layout { grid-template-columns: 1fr !important; }
                    .search-sidebar { display: none !important; }
                    .filter-toggle { display: flex !important; }
                    .results-main { padding: 16px 8px 60px !important; } /* reduced padding closer to edge */
                    .search-rooms-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
                }
                @media (max-width: 640px) {
                    .search-rooms-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
                }
                @media (min-width: 993px) {
                    .filter-toggle { display: none !important; }
                    .mobile-filter-panel { display: none !important; }
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #CBD5E1;
                }

                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

export default SearchPage;
