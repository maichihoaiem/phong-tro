import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function StatCard({ icon, label, val, color, bgColor }) {
	return (
		<div style={{
			background: 'white',
			padding: '24px',
			borderRadius: '24px',
			border: '1px solid #F1F5F9',
			boxShadow: '0 4px 20px -5px rgba(15, 28, 63, 0.05)',
			display: 'flex',
			alignItems: 'center',
			gap: '20px',
			transition: 'transform 0.3s ease',
		}} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
		   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
			<div style={{
				width: '60px',
				height: '60px',
				borderRadius: '18px',
				backgroundColor: bgColor,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: '1.5rem',
				color: color
			}}>
				<i className={icon}></i>
			</div>
			<div>
				<p style={{ margin: 0, fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>{label}</p>
				<p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#0F1C3F' }}>{val}</p>
			</div>
		</div>
	);
}

function LandlordDashboard() {
	const [rooms, setRooms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [balance, setBalance] = useState(0);
	const navigate = useNavigate();

	useEffect(() => {
		loadMyRooms();
		loadWallet();
	}, []);

	const loadWallet = async () => {
		try {
			const res = await axios.get('/api/wallet/my-wallet', { withCredentials: true });
			if (res.data.success) {
				setBalance(res.data.data.balance);
			}
		} catch (err) {
			console.error('Lỗi khi tải thông tin ví');
		}
	};

	const loadMyRooms = async () => {
		try {
			const res = await axios.get('/api/phong-tro/chu-tro/danh-sach', { withCredentials: true });
			if (res.data.success) {
				setRooms(res.data.data);
			}
		} catch (err) {
			setError('Không thể tải danh sách phòng. Vui lòng đăng nhập lại.');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id, tieuDe) => {
		if (!window.confirm(`Bạn có chắc muốn xóa phòng "${tieuDe}"?`)) return;
		try {
			await axios.delete(`/api/phong-tro/${id}`, { withCredentials: true });
			setRooms(rooms.filter(r => r.ID_Phong !== id));
		} catch (err) {
			alert('Lỗi khi xóa phòng!');
		}
	};

	const handleRestoreStatus = async (id, tieuDe) => {
		if (!window.confirm(`Bạn có chắc muốn mở lại phòng "${tieuDe}" (chuyển về trạng thái Còn trống)?`)) return;
		try {
			await axios.put(`/api/phong-tro/${id}/restore-status`, {}, { withCredentials: true });
			setRooms(rooms.map(r => r.ID_Phong === id ? { ...r, TrangThai: 'Còn trống' } : r));
			alert('Đã mở lại phòng thành công!');
		} catch (err) {
			alert('Lỗi khi mở lại phòng!');
		}
	};

	const getImageUrl = (anhPath) => {
		if (!anhPath) return null;
		if (anhPath.startsWith('http')) return anhPath;
		if (anhPath.startsWith('/uploads/')) return `${anhPath}`;
		const fileName = anhPath.split(/[\\/]/).pop().replace(/^"|"$/g, '');
		return `/uploads/${fileName}`;
	};

	const approvedRooms = rooms.filter((room) => {
		const status = (room.TrangThai || '').trim().toLowerCase();
		return status === '' || status === 'còn trống' || status === 'đang trống' || status === 'đã cọc' || status === 'đã cho thuê' || status === 'đã ẩn';
	});

	const stats = {
		total: approvedRooms.length,
		available: rooms.filter(r => {
			const s = (r.TrangThai || '').trim().toLowerCase();
			return s === 'còn trống' || s === 'đang trống' || s === '';
		}).length,
		rented: rooms.filter(r => (r.TrangThai || '').trim().toLowerCase() === 'đã cho thuê').length,
		deposited: rooms.filter(r => (r.TrangThai || '').trim().toLowerCase() === 'đã cọc').length,
		views: rooms.reduce((sum, r) => sum + (r.LuotXem || 0), 0)
	};

	if (loading) {
		return (
			<div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#2563EB' }}></i>
			</div>
		);
	}

	if (error) {
		return (
			<div style={{ backgroundColor: '#F8FAFF', minHeight: '100vh', padding: '100px 24px', textAlign: 'center' }}>
				<div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: 'white', padding: '48px', borderRadius: '32px', boxShadow: '0 10px 40px -10px rgba(15, 28, 63, 0.05)' }}>
					<div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#EF4444', fontSize: '2rem' }}>
						<i className="fas fa-exclamation-triangle"></i>
					</div>
					<h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F1C3F', marginBottom: '12px' }}>Đã xảy ra lỗi</h2>
					<p style={{ color: '#64748B', marginBottom: '32px', lineHeight: 1.6 }}>{error}</p>
					<Link to="/dang-nhap" style={{ backgroundColor: '#2563EB', color: 'white', padding: '12px 32px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>Đăng nhập lại</Link>
				</div>
			</div>
		);
	}

	return (
		<div style={{ backgroundColor: '#F8FAFF', minHeight: '100vh', padding: '40px 24px' }}>
			<div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                
				{/* HEAD & TOP INFO */}
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '24px' }}>
					<div>
						<h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F1C3F', margin: '0 0 8px 0', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
							<i className="fas fa-tasks" style={{ color: '#2563EB' }}></i>
							Quản lý <span style={{ color: '#2563EB' }}>Phòng</span>
						</h1>
						<p style={{ color: '#64748B', fontWeight: 500, margin: 0 }}>Chào mừng bạn quay lại! Dưới đây là tình hình kinh doanh của bạn hôm nay.</p>
					</div>
					<div style={{ display: 'flex', gap: '16px' }}>
						<Link to="/vi-tien" style={{
							background: 'white',
							padding: '12px 24px',
							borderRadius: '16px',
							display: 'flex',
							alignItems: 'center',
							gap: '12px',
							textDecoration: 'none',
							border: '1px solid #E2E8F0',
							transition: 'all 0.3s'
						}} onMouseEnter={e => e.currentTarget.style.borderColor = '#2563EB'}
						   onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}>
							<div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
								<i className="fas fa-wallet"></i>
							</div>
							<div>
								<p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Ví của bạn</p>
								<p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F1C3F' }}>{new Intl.NumberFormat('vi-VN').format(balance)} đ</p>
							</div>
						</Link>
						<Link to="/dang-phong" style={{
							background: '#2563EB',
							color: 'white',
							padding: '14px 28px',
							borderRadius: '16px',
							fontWeight: 800,
							display: 'flex',
							alignItems: 'center',
							gap: '10px',
							textDecoration: 'none',
							boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
							transition: 'transform 0.3s'
						}} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
						   onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
							<i className="fas fa-plus"></i> Đăng phòng mới
						</Link>
					</div>
				</div>

				{/* STATS GRID */}
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '48px' }}>
					<StatCard icon="fas fa-home" label="Tổng số phòng" val={stats.total} color="#2563EB" bgColor="#EFF6FF" />
					<StatCard icon="fas fa-check-circle" label="Phòng đang trống" val={stats.available} color="#10B981" bgColor="#ECFDF5" />
					<StatCard icon="fas fa-clock" label="Sắp thuê (Đã cọc)" val={stats.deposited} color="#8B5CF6" bgColor="#F5F3FF" />
					<StatCard icon="fas fa-user-check" label="Đã cho thuê" val={stats.rented} color="#F59E0B" bgColor="#FFFBEB" />
					<StatCard icon="fas fa-eye" label="Tổng lượt xem" val={stats.views} color="#64748B" bgColor="#F8FAFF" />
				</div>

				{/* MANAGEMENT AREA - 2 COLUMNS LAYOUT */}
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px' }}>
                    
					{/* LEFT COLUMN: AVAILABLE ROOMS */}
					<div style={{ background: 'white', borderRadius: '32px', padding: '24px', boxShadow: '0 10px 40px -10px rgba(15, 28, 63, 0.05)', border: '1px solid #F1F5F9' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #F8FAFF' }}>
							<div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
								<i className="fas fa-check-circle"></i>
							</div>
							<h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F1C3F', margin: 0 }}>Phòng còn trống</h2>
							<span style={{ marginLeft: 'auto', backgroundColor: '#ECFDF5', color: '#059669', padding: '4px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 800 }}>{stats.available}</span>
						</div>

						<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
							{rooms.filter(r => {
								const status = (r.TrangThai || '').trim().toLowerCase();
								return status === 'còn trống' || status === 'đang trống' || status === '' || status === 'đã cọc';
							}).length === 0 ? (
								<div style={{ padding: '40px 0', textAlign: 'center', color: '#94A3B8' }}>Không có phòng còn trống</div>
							) : (
								rooms.filter(r => {
									const status = (r.TrangThai || '').trim().toLowerCase();
									return status === 'còn trống' || status === 'đang trống' || status === '' || status === 'đã cọc';
								}).map(room => (
									<RoomCard key={room.ID_Phong} room={room} handleRestoreStatus={handleRestoreStatus} handleDelete={handleDelete} getImageUrl={getImageUrl} />
								))
							)}
						</div>
					</div>

					{/* RIGHT COLUMN: RENTED ROOMS */}
					<div style={{ background: 'white', borderRadius: '32px', padding: '24px', boxShadow: '0 10px 40px -10px rgba(15, 28, 63, 0.05)', border: '1px solid #F1F5F9' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #F8FAFF' }}>
							<div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
								<i className="fas fa-user-check"></i>
							</div>
							<h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F1C3F', margin: 0 }}>Phòng đã thuê</h2>
							<span style={{ marginLeft: 'auto', backgroundColor: '#FFFBEB', color: '#D97706', padding: '4px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 800 }}>{stats.rented}</span>
						</div>

						<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
							{rooms.filter(r => (r.TrangThai?.toLowerCase() || '') === 'đã cho thuê').length === 0 ? (
								<div style={{ padding: '40px 0', textAlign: 'center', color: '#94A3B8' }}>Chưa có phòng đã thuê</div>
							) : (
								rooms.filter(r => (r.TrangThai?.toLowerCase() || '') === 'đã cho thuê').map(room => (
									<RoomCard key={room.ID_Phong} room={room} handleRestoreStatus={handleRestoreStatus} handleDelete={handleDelete} getImageUrl={getImageUrl} />
								))
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function RoomCard({ room, handleRestoreStatus, handleDelete, getImageUrl }) {
	// Hàm lấy màu cho loại phòng đồng bộ với trang tìm kiếm
	const getRoomTypeColor = (typeName) => {
		const type = typeName?.toLowerCase() || '';
		if (type.includes('phòng trọ')) return { color: '#2563EB', bg: '#EFF6FF' };
		if (type.includes('căn hộ') || type.includes('mini house')) return { color: '#8B5CF6', bg: '#F5F3FF' };
		if (type.includes('nhà nguyên căn')) return { color: '#10B981', bg: '#ECFDF5' };
		if (type.includes('chung cư')) return { color: '#F59E0B', bg: '#FFFBEB' };
		if (type.includes('ở ghép')) return { color: '#F43F5E', bg: '#FFF1F2' };
		return { color: '#64748B', bg: '#F8FAFF' };
	};

	const typeColor = getRoomTypeColor(room.TenLoaiPhong || room.TenLoai);

	return (
		<div style={{
			border: '1px solid #F1F5F9',
			borderRadius: '20px',
			overflow: 'hidden',
			backgroundColor: 'white',
			transition: 'all 0.3s',
			display: 'flex'
		}} onMouseEnter={e => {
			e.currentTarget.style.borderColor = '#2563EB';
			e.currentTarget.style.boxShadow = '0 15px 30px -10px rgba(15, 28, 63, 0.08)';
		}} onMouseLeave={e => {
			e.currentTarget.style.borderColor = '#F1F5F9';
			e.currentTarget.style.boxShadow = 'none';
		}}>
			{/* Ảnh thu nhỏ */}
			<div style={{ width: '180px', minHeight: '140px', position: 'relative', flexShrink: 0 }}>
				<img 
					src={getImageUrl(room.AnhDaiDien) || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?fit=crop&w=400&q=80"} 
					style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
					alt={room.TieuDe} 
				/>
			</div>

			{/* Nội dung bên phải */}
			<div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
				<div>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
						<span style={{ 
							fontSize: '0.7rem', 
							fontWeight: 700, 
							color: typeColor.color, 
							backgroundColor: typeColor.bg, 
							padding: '2px 8px', 
							borderRadius: '6px',
							textTransform: 'uppercase',
							letterSpacing: '0.3px'
						}}>
							{room.TenLoaiPhong || room.TenLoai || 'Phòng cho thuê'}
						</span>
						{(room.TrangThai || '').toLowerCase() === 'đã cọc' && (
							<span style={{ 
								fontSize: '0.7rem', 
								fontWeight: 800, 
								color: '#7C3AED', 
								backgroundColor: '#F5F3FF', 
								padding: '2px 8px', 
								borderRadius: '6px',
								textTransform: 'uppercase',
								border: '1px solid #DDD6FE',
								marginLeft: '8px'
							}}>
								<i className="fas fa-clock mr-1"></i> Đã cọc (Chờ duyệt)
							</span>
						)}
					</div>
					<h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, color: '#0F1C3F', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{room.TieuDe}</h4>
					{(room.TrangThai || '').toLowerCase() === 'đã cọc' && (
						<Link to="/yeu-cau-dat-phong" style={{ 
							display: 'inline-block',
							fontSize: '0.75rem',
							fontWeight: 700,
							color: '#7C3AED',
							textDecoration: 'none',
							marginBottom: '8px',
							backgroundColor: '#F5F3FF',
							padding: '4px 10px',
							borderRadius: '8px',
							border: '1px solid #DDD6FE'
						}}>
							 Đi tới Duyệt cọc →
						</Link>
					)}
					<div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
						<span style={{ color: '#2563EB', fontWeight: 900, fontSize: '1.2rem' }}>{new Intl.NumberFormat('vi-VN').format(room.Gia)} đ</span>
						<span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8' }}>/ tháng</span>
					</div>
				</div>

				{/* Thanh hành động */}
				<div className="flex flex-nowrap whitespace-nowrap gap-2 border-t border-gray-50 pt-3 mt-auto">
					{(room.TrangThai?.toLowerCase() || '') === 'đã cho thuê' ? (
						<button 
							onClick={() => handleRestoreStatus(room.ID_Phong, room.TieuDe)} 
							className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all duration-200 cursor-pointer"
							title="Khôi phục trạng thái trống"
						>
							<i className="fas fa-undo text-[10px]"></i> Mở lại
						</button>
					) : (
						<Link 
							to={`/sua-phong/${room.ID_Phong}`} 
							className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white transition-all duration-200 text-decoration-none"
						>
							<i className="fas fa-edit text-[10px]"></i> Sửa
						</Link>
					)}
					<Link 
						to={`/phong-tro/${room.ID_Phong}`} 
						className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-600 hover:text-white transition-all duration-200 text-decoration-none"
					>
						<i className="fas fa-eye text-[10px]"></i> Xem
					</Link>
					<button 
						onClick={() => handleDelete(room.ID_Phong, room.TieuDe)} 
						className="w-9 h-8 flex items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white transition-all duration-200 cursor-pointer"
					>
						<i className="fas fa-trash text-[10px]"></i>
					</button>
				</div>
			</div>
		</div>
	);
}

export default LandlordDashboard;
// ...existing code from LandlordDashboard.jsx will be inserted here
