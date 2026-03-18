import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "/api/auth/users";

function AdminQuanLyTaiKhoan() {
	const [users, setUsers] = useState([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(null);

	// Modals
	const [viewUser, setViewUser] = useState(null);
	const [lockUser, setLockUser] = useState(null);
	const [lockNote, setLockNote] = useState("");
	const [lockError, setLockError] = useState("");

	// Toast
	const [toast, setToast] = useState(null);

	const showToast = (msg, type = "success") => {
		setToast({ msg, type });
		setTimeout(() => setToast(null), 3000);
	};

	const fetchUsers = async (name = "") => {
		setLoading(true);
		try {
			const res = await axios.get(`${API_URL}${name ? `?name=${encodeURIComponent(name)}` : ""}`, { withCredentials: true });
			setUsers(res.data.data || []);
		} catch (err) {
			showToast("Lỗi tải danh sách tài khoản!", "error");
		}
		setLoading(false);
	};

	useEffect(() => { fetchUsers(); }, []);

	const handleSearch = (e) => {
		e.preventDefault();
		fetchUsers(search);
	};

	// Khóa tài khoản
	const submitLock = async () => {
		if (!lockNote.trim()) {
			setLockError("Vui lòng nhập lý do khóa!");
			return;
		}
		setActionLoading(lockUser.ID_TaiKhoan);
		setLockError("");
		try {
			await axios.put(`${API_URL}/${lockUser.ID_TaiKhoan}/lock`, { action: "lock", note: lockNote }, { withCredentials: true });
			showToast(`Đã khóa tài khoản "${lockUser.HoTen}" và gửi email thông báo!`);
			setLockUser(null);
			setLockNote("");
			fetchUsers(search);
		} catch (err) {
			setLockError("Lỗi khóa tài khoản!");
		}
		setActionLoading(null);
	};

	// Mở khóa tài khoản
	const handleUnlock = async (user) => {
		if (!window.confirm(`Xác nhận mở khóa tài khoản "${user.HoTen}"?`)) return;
		setActionLoading(user.ID_TaiKhoan);
		try {
			await axios.put(`${API_URL}/${user.ID_TaiKhoan}/lock`, { action: "unlock" }, { withCredentials: true });
			showToast(`Đã mở khóa tài khoản "${user.HoTen}"!`);
			fetchUsers(search);
		} catch (err) {
			showToast("Lỗi mở khóa tài khoản!", "error");
		}
		setActionLoading(null);
	};

	const chuTro = users.filter((u) => u.TenVaiTro === "Chủ trọ");
	const nguoiThue = users.filter((u) => u.TenVaiTro === "Người thuê");

	const getInitials = (name) => {
		if (!name) return "?";
		const parts = name.trim().split(" ");
		return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name[0].toUpperCase();
	};

	const formatDate = (d) => {
		if (!d) return "—";
		return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
	};

	// Card component
	const UserCard = ({ user, colorClass, gradientFrom, gradientTo, shadowColor }) => (
		<div
			className={`bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
			style={{ borderLeft: `4px solid ${user.TrangThai === 'locked' ? '#EF4444' : gradientFrom}` }}
		>
			<div className="flex items-start gap-4">
				{/* Avatar */}
				<div
					className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-lg"
					style={{
						background: user.TrangThai === 'locked'
							? 'linear-gradient(135deg, #EF4444, #DC2626)'
							: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
						boxShadow: user.TrangThai === 'locked'
							? '0 4px 14px rgba(239,68,68,0.3)'
							: `0 4px 14px ${shadowColor}`
					}}
				>
					{user.TrangThai === 'locked' ? <i className="fas fa-lock text-xs"></i> : getInitials(user.HoTen)}
				</div>

				{/* Info */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-0.5">
						<h4 className="font-bold text-gray-800 text-sm truncate">{user.HoTen}</h4>
						<span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${user.TrangThai === 'locked'
								? 'bg-red-50 text-red-600 border border-red-100'
								: 'bg-emerald-50 text-emerald-600 border border-emerald-100'
							}`}>
							{user.TrangThai === 'locked' ? '🔒 Đã khóa' : '✅ Hoạt động'}
						</span>
					</div>
					<p className="text-xs text-gray-400 truncate"><i className="fas fa-envelope mr-1"></i>{user.Email}</p>
					<p className="text-xs text-gray-400 mt-0.5"><i className="fas fa-calendar mr-1"></i>{formatDate(user.NgayTao)}</p>
				</div>
			</div>

			{/* Buttons */}
			<div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
				<button
					onClick={() => setViewUser(user)}
					className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
				>
					<i className="fas fa-eye"></i> Xem thông tin
				</button>
				{user.TrangThai === 'locked' ? (
					<button
						onClick={() => handleUnlock(user)}
						disabled={actionLoading === user.ID_TaiKhoan}
						className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all disabled:opacity-50"
					>
						{actionLoading === user.ID_TaiKhoan
							? <><i className="fas fa-spinner fa-spin"></i> Đang xử lý</>
							: <><i className="fas fa-unlock"></i> Mở khóa</>
						}
					</button>
				) : (
					<button
						onClick={() => { setLockUser(user); setLockNote(""); setLockError(""); }}
						className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-all"
					>
						<i className="fas fa-lock"></i> Khóa
					</button>
				)}
			</div>
		</div>
	);

	// Column component
	const UserColumn = ({ title, icon, users, gradientFrom, gradientTo, shadowColor, colorClass, bgLight }) => (
		<div>
			{/* Column Header */}
			<div className={`flex items-center gap-3 mb-5 p-4 rounded-2xl ${bgLight}`}>
				<div
					className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
					style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`, boxShadow: `0 4px 14px ${shadowColor}` }}
				>
					<i className={`fas ${icon}`}></i>
				</div>
				<div>
					<h3 className="font-black text-gray-800 text-lg">{title}</h3>
					<p className="text-xs text-gray-400 font-medium">{users.length} tài khoản</p>
				</div>
			</div>

			{/* User Cards */}
			<div className="space-y-3">
				{users.length === 0 ? (
					<div className="text-center py-12 text-gray-300">
						<i className={`fas ${icon} text-4xl mb-3 block`}></i>
						<p className="font-medium">Không có tài khoản nào</p>
					</div>
				) : (
					users.map(user => (
						<UserCard
							key={user.ID_TaiKhoan}
							user={user}
							colorClass={colorClass}
							gradientFrom={gradientFrom}
							gradientTo={gradientTo}
							shadowColor={shadowColor}
						/>
					))
				)}
			</div>
		</div>
	);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<i className="fas fa-spinner fa-spin text-blue-600 text-4xl mb-4 block"></i>
					<p className="text-gray-400 font-medium">Đang tải danh sách...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-7xl px-4 py-10">
			{/* Toast */}
			{toast && (
				<div className={`fixed top-6 right-6 z-[200] px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-3 animate-fade-up ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
					}`}>
					<i className={`fas ${toast.type === 'error' ? 'fa-times-circle' : 'fa-check-circle'} text-lg`}></i>
					{toast.msg}
				</div>
			)}

			{/* Header */}
			<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
				<div>
					<h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-2">
						Quản lý <span className="text-blue-600">Tài khoản</span>
					</h1>
					<p className="text-gray-400 font-medium">Quản lý tất cả tài khoản trên hệ thống OZIC HOUSE</p>
				</div>

				{/* Stats */}
				<div className="flex gap-3">
					<div className="bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-sm">
						<p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Tổng</p>
						<p className="text-2xl font-black text-gray-800">{users.length}</p>
					</div>
					<div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-3">
						<p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Chủ trọ</p>
						<p className="text-2xl font-black text-indigo-600">{chuTro.length}</p>
					</div>
					<div className="bg-cyan-50 border border-cyan-100 rounded-2xl px-5 py-3">
						<p className="text-[10px] font-black text-cyan-300 uppercase tracking-widest">Người thuê</p>
						<p className="text-2xl font-black text-cyan-600">{nguoiThue.length}</p>
					</div>
				</div>
			</div>

			{/* Search Bar */}
			<form onSubmit={handleSearch} className="mb-8">
				<div className="flex gap-3 max-w-lg">
					<div className="relative flex-1">
						<i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
						<input
							type="text"
							placeholder="Tìm kiếm theo tên..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
						/>
					</div>
					<button
						type="submit"
						className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
					>
						<i className="fas fa-search"></i> Tìm
					</button>
					{search && (
						<button
							type="button"
							onClick={() => { setSearch(""); fetchUsers(); }}
							className="px-4 py-3 bg-gray-100 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all"
						>
							<i className="fas fa-times"></i>
						</button>
					)}
				</div>
			</form>

			{/* 2 Columns */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<UserColumn
					title="Chủ trọ"
					icon="fa-building"
					users={chuTro}
					gradientFrom="#6366F1"
					gradientTo="#818CF8"
					shadowColor="rgba(99,102,241,0.3)"
					colorClass="indigo"
					bgLight="bg-indigo-50/50 border border-indigo-100/50"
				/>
				<UserColumn
					title="Người thuê"
					icon="fa-user-friends"
					users={nguoiThue}
					gradientFrom="#06B6D4"
					gradientTo="#22D3EE"
					shadowColor="rgba(6,182,212,0.3)"
					colorClass="cyan"
					bgLight="bg-cyan-50/50 border border-cyan-100/50"
				/>
			</div>

			{/* ======= MODAL: Xem thông tin nhanh ======= */}
			{viewUser && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setViewUser(null)}>
					<div
						className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
						onClick={e => e.stopPropagation()}
						style={{ animation: 'fade-up 0.3s cubic-bezier(0.16,1,0.3,1)' }}
					>
						{/* Header */}
						<div
							className="relative px-8 pt-8 pb-12 text-center text-white"
							style={{
								background: viewUser.TrangThai === 'locked'
									? 'linear-gradient(135deg, #EF4444, #DC2626)'
									: viewUser.TenVaiTro === 'Chủ trọ'
										? 'linear-gradient(135deg, #6366F1, #818CF8)'
										: 'linear-gradient(135deg, #06B6D4, #22D3EE)'
							}}
						>
							<button
								onClick={() => setViewUser(null)}
								className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition text-white"
							>
								<i className="fas fa-times text-sm"></i>
							</button>
							<div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3 text-2xl font-black backdrop-blur-sm border border-white/30">
								{viewUser.TrangThai === 'locked' ? <i className="fas fa-lock"></i> : getInitials(viewUser.HoTen)}
							</div>
							<h3 className="text-xl font-black">{viewUser.HoTen}</h3>
							<span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm">
								{viewUser.TenVaiTro}
							</span>
						</div>

						{/* Body */}
						<div className="px-8 py-6 -mt-4">
							<div className="bg-gray-50 rounded-2xl p-5 space-y-4">
								{[
									{ icon: "fa-envelope", label: "Email", value: viewUser.Email },
									{ icon: "fa-phone", label: "Số điện thoại", value: viewUser.SoDienThoai || "Chưa cập nhật" },
									{ icon: "fa-calendar", label: "Ngày tạo", value: formatDate(viewUser.NgayTao) },
									{ icon: "fa-shield-alt", label: "Trạng thái", value: viewUser.TrangThai === 'locked' ? '🔒 Đã khóa' : '✅ Hoạt động', highlight: true },
								].map((item, i) => (
									<div key={i} className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
											<i className={`fas ${item.icon} text-xs text-gray-400`}></i>
										</div>
										<div className="flex-1">
											<p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{item.label}</p>
											<p className={`text-sm font-semibold ${item.highlight ? (viewUser.TrangThai === 'locked' ? 'text-red-600' : 'text-emerald-600') : 'text-gray-700'}`}>
												{item.value}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Footer */}
						<div className="px-8 pb-6 flex gap-3">
							{viewUser.TrangThai === 'locked' ? (
								<button
									onClick={() => { handleUnlock(viewUser); setViewUser(null); }}
									className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
								>
									<i className="fas fa-unlock"></i> Mở khóa
								</button>
							) : (
								<button
									onClick={() => { setViewUser(null); setLockUser(viewUser); setLockNote(""); setLockError(""); }}
									className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-lg shadow-red-200"
								>
									<i className="fas fa-lock"></i> Khóa tài khoản
								</button>
							)}
							<button
								onClick={() => setViewUser(null)}
								className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
							>
								Đóng
							</button>
						</div>
					</div>
				</div>
			)}

			{/* ======= MODAL: Khóa tài khoản ======= */}
			{lockUser && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setLockUser(null)}>
					<div
						className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
						onClick={e => e.stopPropagation()}
						style={{ animation: 'fade-up 0.3s cubic-bezier(0.16,1,0.3,1)' }}
					>
						{/* Warning Header */}
						<div className="bg-gradient-to-r from-red-500 to-rose-600 px-8 py-6 text-center text-white">
							<div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/30">
								<i className="fas fa-lock text-2xl"></i>
							</div>
							<h3 className="text-xl font-black">Khóa tài khoản</h3>
							<p className="text-red-100 text-sm mt-1">{lockUser.HoTen} — {lockUser.Email}</p>
						</div>

						<div className="p-8">
							{/* Warning */}
							<div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl mb-5">
								<i className="fas fa-exclamation-triangle text-amber-500 mt-0.5"></i>
								<div>
									<p className="text-xs font-bold text-amber-700">Lưu ý quan trọng</p>
									<p className="text-xs text-amber-600 mt-1">Người dùng sẽ không thể đăng nhập sau khi bị khóa. Một email thông báo kèm lý do khóa sẽ được gửi đến họ.</p>
								</div>
							</div>

							{/* Reason Input */}
							<label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
								<i className="fas fa-pen mr-1"></i> Lý do khóa tài khoản
							</label>
							<textarea
								className="w-full border border-gray-200 rounded-xl p-4 text-sm font-medium resize-none focus:outline-none focus:border-red-300 focus:ring-4 focus:ring-red-50 transition-all"
								rows={4}
								placeholder="Nhập lý do khóa tài khoản... (VD: Vi phạm chính sách cộng đồng, đăng tin giả mạo...)"
								value={lockNote}
								onChange={(e) => { setLockNote(e.target.value); setLockError(""); }}
								autoFocus
							/>

							{lockError && (
								<div className="flex items-center gap-2 mt-3 text-red-600 text-xs font-bold">
									<i className="fas fa-exclamation-circle"></i> {lockError}
								</div>
							)}

							{/* Actions */}
							<div className="flex gap-3 mt-6">
								<button
									onClick={() => setLockUser(null)}
									className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
								>
									Hủy bỏ
								</button>
								<button
									onClick={submitLock}
									disabled={actionLoading === lockUser.ID_TaiKhoan}
									className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-lg shadow-red-200 disabled:opacity-50"
								>
									{actionLoading === lockUser.ID_TaiKhoan
										? <><i className="fas fa-spinner fa-spin"></i> Đang khóa...</>
										: <><i className="fas fa-lock"></i> Xác nhận khóa</>
									}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default AdminQuanLyTaiKhoan;
