import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function StatCard({ icon, label, val, color, bgColor }) {
	return (
		<div className="bg-white rounded-2xl md:rounded-[24px] border border-slate-100 p-4 md:p-6 shadow-sm flex items-center gap-3 md:gap-5 transition-transform hover:-translate-y-1">
			<div className="w-10 h-10 md:w-[60px] md:h-[60px] rounded-xl md:rounded-[18px] flex items-center justify-center text-lg md:text-[1.5rem]" 
				 style={{ backgroundColor: bgColor, color: color }}>
				<i className={icon}></i>
			</div>
			<div>
				<p className="m-0 text-[10px] md:text-[0.9rem] text-slate-500 font-semibold uppercase md:capitalize">{label}</p>
				<p className="m-0 text-xl md:text-[1.8rem] font-black text-slate-900">{val}</p>
			</div>
		</div>
	);
}

function LandlordDashboard() {
	const [rooms, setRooms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [balance, setBalance] = useState(0);
	const [activeTab, setActiveTab] = useState('available'); // 'available' or 'rented'
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
		<div className="bg-[#F8FAFF] min-h-screen px-4 py-6 md:p-10">
			<div className="max-w-[1400px] mx-auto">
                
				{/* HEAD & TOP INFO */}
				<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 md:mb-10 gap-6">
					<div>
						<h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
							<i className="fas fa-tasks text-blue-600"></i>
							Quản lý <span className="text-blue-600">Phòng</span>
						</h1>
						<p className="text-slate-500 font-medium text-sm md:text-base">Chào mừng bạn quay lại! Dưới đây là tình hình kinh doanh của bạn hôm nay.</p>
					</div>
					<div className="flex flex-wrap gap-3 w-full lg:w-auto">
						<Link to="/vi-tien" className="flex-1 lg:flex-none bg-white p-3 md:px-6 md:py-3 rounded-2xl flex items-center gap-3 border border-slate-100 hover:border-blue-600 transition-all text-decoration-none shadow-sm">
							<div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
								<i className="fas fa-wallet"></i>
							</div>
							<div>
								<p className="m-0 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ví của bạn</p>
								<p className="m-0 text-base md:text-lg font-black text-slate-900">{new Intl.NumberFormat('vi-VN').format(balance)} đ</p>
							</div>
						</Link>
						<Link to="/dang-phong" className="flex-1 lg:flex-none bg-blue-600 text-white p-3 md:px-7 md:py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:-translate-y-1 transition-all text-decoration-none">
							<i className="fas fa-plus"></i> <span className="text-sm md:text-base">Đăng phòng</span>
						</Link>
					</div>
				</div>

				{/* STATS GRID */}
				<div className="grid grid-cols-6 lg:grid-cols-5 gap-2 md:gap-5 mb-10 md:mb-12">
					<div className="col-span-2 lg:col-span-1">
						<StatCard icon="fas fa-home" label="Tổng phòng" val={stats.total} color="#2563EB" bgColor="#EFF6FF" />
					</div>
					<div className="col-span-2 lg:col-span-1">
						<StatCard icon="fas fa-check-circle" label="Còn trống" val={stats.available} color="#10B981" bgColor="#ECFDF5" />
					</div>
					<div className="col-span-2 lg:col-span-1">
						<StatCard icon="fas fa-clock" label="Đã cọc" val={stats.deposited} color="#8B5CF6" bgColor="#F5F3FF" />
					</div>
					<div className="col-span-3 lg:col-span-1">
						<StatCard icon="fas fa-user-check" label="Đã thuê" val={stats.rented} color="#F59E0B" bgColor="#FFFBEB" />
					</div>
					<div className="col-span-3 lg:col-span-1">
						<StatCard icon="fas fa-eye" label="Lượt xem" val={stats.views} color="#64748B" bgColor="#F8FAFF" />
					</div>
				</div>

				{/* TABS (All devices) */}
				<div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 max-w-md shadow-sm">
					<button 
						onClick={() => setActiveTab('available')}
						className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'available' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
					>
						Phòng còn trống ({stats.available + stats.deposited})
					</button>
					<button 
						onClick={() => setActiveTab('rented')}
						className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'rented' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
					>
						Đã cho thuê ({stats.rented})
					</button>
				</div>

				{/* MANAGEMENT AREA - TAB VIEW */}
				<div className="w-full">
                    
					{/* LEFT COLUMN: AVAILABLE ROOMS */}
					<div className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 ${activeTab !== 'available' ? 'hidden' : ''}`}>
						<div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
							<div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
								<i className="fas fa-check-circle"></i>
							</div>
							<h2 className="text-xl font-black text-slate-800 m-0">Phòng còn trống</h2>
							<span className="ml-auto bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-black">{stats.available + stats.deposited}</span>
						</div>

						<div className="flex flex-col gap-5">
							{rooms.filter(r => {
								const status = (r.TrangThai || '').trim().toLowerCase();
								return status === 'còn trống' || status === 'đang trống' || status === '' || status === 'đã cọc';
							}).length === 0 ? (
								<div className="py-10 text-center text-slate-400 font-medium italic">Không có phòng còn trống</div>
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
					<div className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 ${activeTab !== 'rented' ? 'hidden' : ''}`}>
						<div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
							<div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
								<i className="fas fa-user-check"></i>
							</div>
							<h2 className="text-xl font-black text-slate-800 m-0">Phòng đã thuê</h2>
							<span className="ml-auto bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-black">{stats.rented}</span>
						</div>

						<div className="flex flex-col gap-5">
							{rooms.filter(r => (r.TrangThai?.toLowerCase() || '') === 'đã cho thuê').length === 0 ? (
								<div className="py-10 text-center text-slate-400 font-medium italic">Chưa có phòng đã thuê</div>
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
		<div className="bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all hover:border-blue-600 hover:shadow-xl hover:shadow-blue-50/50 flex flex-col sm:flex-row">
			{/* Ảnh thu nhỏ */}
			<div className="w-full sm:w-[350px] h-52 sm:h-[200px] relative flex-shrink-0">
				<img 
					src={getImageUrl(room.AnhDaiDien) || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?fit=crop&w=400&q=80"} 
					className="w-full h-full object-cover"
					alt={room.TieuDe} 
				/>
			</div>

			{/* Nội dung bên phải */}
			<div className="p-4 flex-grow flex flex-col justify-between">
				<div>
					<div className="flex justify-between items-start mb-1.5 gap-2">
						<span className="text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider"
							  style={{ color: typeColor.color, backgroundColor: typeColor.bg }}>
							{room.TenLoaiPhong || room.TenLoai || 'Phòng cho thuê'}
						</span>
						{(room.TrangThai || '').toLowerCase() === 'đã cọc' && (
							<span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg uppercase border border-purple-100 flex items-center gap-1">
								<i className="fas fa-clock"></i> Cọc
							</span>
						)}
					</div>
					<h4 className="m-0 mb-2 text-sm md:text-base font-black text-slate-900 leading-snug line-clamp-2">{room.TieuDe}</h4>
					{(room.TrangThai || '').toLowerCase() === 'đã cọc' && (
						<Link to="/yeu-cau-dat-phong" className="inline-block text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 hover:bg-purple-600 hover:text-white transition-all mb-2 text-decoration-none">
							 Duyệt cọc →
						</Link>
					)}
					<div className="flex items-baseline gap-1">
						<span className="text-blue-600 font-black text-lg">{new Intl.NumberFormat('vi-VN').format(room.Gia)} đ</span>
						<span className="text-[10px] font-bold text-slate-400">/ tháng</span>
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
						className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all duration-200 text-decoration-none"
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
