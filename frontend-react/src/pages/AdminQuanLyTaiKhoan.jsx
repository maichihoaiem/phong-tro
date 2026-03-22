import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "/api/auth/users";

function AdminQuanLyTaiKhoan() {
	const [activeTab, setActiveTab] = useState('accounts'); // 'accounts' | 'reports'
	const [users, setUsers] = useState([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(null);

	// Reports State
	const [reports, setReports] = useState([]);
	const [reportFilter, setReportFilter] = useState('Tất cả');
	const [selectedReport, setSelectedReport] = useState(null);
	const [handleLoading, setHandleLoading] = useState(false);
	const [aiAnalysis, setAiAnalysis] = useState({});
	const [aiLoading, setAiLoading] = useState({});

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
			const allUsers = res.data.data || [];
			const filtered = allUsers.filter(u => u.TenVaiTro === "Chủ trọ" || u.TenVaiTro === "Người thuê");
			setUsers(filtered);
		} catch (err) {
			showToast("Lỗi tải danh sách tài khoản!", "error");
		}
		setLoading(false);
	};

	const fetchReports = async () => {
		try {
			setLoading(true);
			const res = await axios.get('/api/bao-cao/all', { withCredentials: true });
			if (res.data.success) {
				setReports(res.data.data);
			}
		} catch (err) {
			console.error('Lỗi lấy danh sách báo cáo:', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (activeTab === 'accounts') fetchUsers();
		else fetchReports();
	}, [activeTab]);

	const handleSearch = (e) => {
		e.preventDefault();
		fetchUsers(search);
	};

	const handleAIAnalyze = async (report) => {
		setAiLoading(prev => ({ ...prev, [report.ID_BaoCao]: true }));
		try {
			const res = await axios.post('/api/ai/analyze-report', {
				reason: report.LyDo,
				description: report.MoTa,
				imageUrl: report.HinhAnh,
				roomTitle: report.TenPhong,
				hostName: report.TenChuTro
			});
			if (res.data.success) {
				setAiAnalysis(prev => ({ ...prev, [report.ID_BaoCao]: res.data.aiData }));
			}
		} catch (err) {
			console.error('AI Analysis Error:', err);
			showToast('AI đang bận, vui lòng thử lại sau.', 'error');
		} finally {
			setAiLoading(prev => ({ ...prev, [report.ID_BaoCao]: false }));
		}
	};

	const handleReportAction = async (idBaoCao, action) => {
		if (!window.confirm(`Bạn có chắc chắn muốn ${action === 'approve' ? 'Duyệt phạt' : 'Bỏ qua'} báo cáo này?`)) return;

		setHandleLoading(true);
		try {
			const res = await axios.post('/api/bao-cao/handle', { idBaoCao, action }, { withCredentials: true });
			if (res.data.success) {
				showToast(res.data.message);
				fetchReports();
				setSelectedReport(null);
			}
		} catch (err) {
			showToast('Lỗi khi xử lý: ' + (err.response?.data?.message || err.message), 'error');
		} finally {
			setHandleLoading(false);
		}
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
	const filteredReports = reports.filter(r => reportFilter === 'Tất cả' || r.TrangThai === reportFilter);

	const getInitials = (name) => {
		if (!name) return "?";
		const parts = name.trim().split(" ");
		return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name[0].toUpperCase();
	};

	const formatDate = (d) => {
		if (!d) return "—";
		return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: '2-digit', minute: '2-digit' });
	};

	// Card component for accounts
	const UserCard = ({ user, colorClass, gradientFrom, gradientTo, shadowColor }) => (
		<div
			className={`bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
			style={{ borderLeft: `4px solid ${user.TrangThai === 'locked' || (user.TrangThai && user.TrangThai.toLowerCase().includes('khóa')) ? '#EF4444' : gradientFrom}` }}
		>
			<div className="flex items-start gap-4">
				<div
					className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-lg"
					style={{
						background: user.TrangThai === 'locked' || (user.TrangThai && user.TrangThai.toLowerCase().includes('khóa'))
							? 'linear-gradient(135deg, #EF4444, #DC2626)'
							: 'linear-gradient(135deg, #4F46E5, #3B82F6)',
						boxShadow: user.TrangThai === 'locked' || (user.TrangThai && user.TrangThai.toLowerCase().includes('khóa'))
							? '0 4px 14px rgba(239,68,68,0.3)'
							: '0 4px 14px rgba(79,70,229,0.25)'
					}}
				>
					{user.TrangThai === 'locked' || (user.TrangThai && user.TrangThai.toLowerCase().includes('khóa')) ? <i className="fas fa-lock text-xs"></i> : getInitials(user.HoTen)}
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-0.5">
						<h4 className="font-bold text-gray-800 text-sm truncate">{user.HoTen}</h4>
						<span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${user.TrangThai === 'locked' || (user.TrangThai && user.TrangThai.toLowerCase().includes('khóa'))
							? 'bg-red-50 text-red-600 border border-red-100'
							: 'bg-emerald-50 text-emerald-600 border border-emerald-100'
							}`}>
							{user.TrangThai === 'locked' || (user.TrangThai && user.TrangThai.toLowerCase().includes('khóa')) ? '🔒 Đã khóa' : '✅ Hoạt động'}
						</span>
						{user.SoLanBiBaoCao > 0 && (
							<span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600 border border-orange-200">
								<i className="fas fa-exclamation-triangle mr-1"></i>
								{user.SoLanBiBaoCao} Vi phạm
							</span>
						)}
					</div>
					<p className="text-xs text-gray-400 truncate"><i className="fas fa-envelope mr-1"></i>{user.Email}</p>
				</div>
			</div>

			<div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
				<button
					onClick={() => setViewUser(user)}
					className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-500 hover:text-white transition-all duration-200"
				>
					<i className="fas fa-eye text-[10px]"></i> Xem
				</button>
				{(user.TrangThai === 'locked' || (user.TrangThai && user.TrangThai.toLowerCase().includes('khóa'))) ? (
					<button
						onClick={() => handleUnlock(user)}
						disabled={actionLoading === user.ID_TaiKhoan}
						className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all duration-200 disabled:opacity-50"
					>
						{actionLoading === user.ID_TaiKhoan
							? <><i className="fas fa-spinner fa-spin"></i> Đang xử lý</>
							: <><i className="fas fa-unlock text-[10px]"></i> Mở khóa</>
						}
					</button>
				) : (
					<button
						onClick={() => { setLockUser(user); setLockNote(""); setLockError(""); }}
						className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-500 hover:text-white transition-all duration-200"
					>
						<i className="fas fa-lock text-[10px]"></i> Khóa
					</button>
				)}
			</div>
		</div>
	);

	if (loading && users.length === 0 && reports.length === 0) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<i className="fas fa-spinner fa-spin text-blue-600 text-4xl mb-4 block"></i>
					<p className="text-gray-400 font-medium">Đang tải...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-7xl px-4 py-10">
			{/* Toast Notification */}
			{toast && (
				<div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-3 animate-fade-up ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
					}`} style={{ minWidth: 'max-content' }}>
					<i className={`fas ${toast.type === 'error' ? 'fa-times-circle' : 'fa-check-circle'} text-lg`}></i>
					{toast.msg}
				</div>
			)}

			{/* Header with Tabs */}
			<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
				<div>
					<h1 className="text-3xl font-extrabold text-gray-900 mb-2 flex items-center gap-2">
						<i className="fas fa-shield-halved" style={{ color: '#4F46E5' }}></i>
						Quản lý <span style={{ color: '#4F46E5' }}>Tài Khoản & Vi Phạm</span>
					</h1>
					<p className="text-gray-400 font-medium italic">Giám sát người dùng và xử lý báo cáo vi phạm</p>
				</div>

				{/* Tab Switcher */}
				<div className="flex items-center gap-2 p-1 bg-white rounded-2xl shadow-sm border border-gray-100">
					<button
						onClick={() => setActiveTab('accounts')}
						className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'accounts' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
					>
						<i className="fas fa-users-cog"></i> Tài khoản
					</button>
					<button
						onClick={() => setActiveTab('reports')}
						className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
					>
						<i className="fas fa-flag"></i> Báo cáo
						{reports.filter(r => r.TrangThai === 'Chờ duyệt').length > 0 && (
							<span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full border border-white">
								{reports.filter(r => r.TrangThai === 'Chờ duyệt').length}
							</span>
						)}
					</button>
				</div>
			</div>

			{activeTab === 'accounts' ? (
				<>
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
									className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm"
								/>
							</div>
							<button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"><i className="fas fa-search"></i> Tìm</button>
						</div>
					</form>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Chủ trọ Column */}
						<div>
							<div className="flex items-center gap-3 mb-5 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
								<div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg"><i className="fas fa-building"></i></div>
								<div>
									<h3 className="font-black text-gray-800 text-lg">Chủ trọ</h3>
									<p className="text-xs text-gray-400 font-medium">{chuTro.length} tài khoản</p>
								</div>
							</div>
							<div className="space-y-3">
								{chuTro.map(u => <UserCard key={u.ID_TaiKhoan} user={u} gradientFrom="#4F46E5" />)}
							</div>
						</div>
						{/* Người thuê Column */}
						<div>
							<div className="flex items-center gap-3 mb-5 p-4 rounded-2xl bg-sky-50/50 border border-sky-100/50">
								<div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-lg"><i className="fas fa-user-friends"></i></div>
								<div>
									<h3 className="font-black text-gray-800 text-lg">Người thuê</h3>
									<p className="text-xs text-gray-400 font-medium">{nguoiThue.length} tài khoản</p>
								</div>
							</div>
							<div className="space-y-3">
								{nguoiThue.map(u => <UserCard key={u.ID_TaiKhoan} user={u} gradientFrom="#0EA5E9" />)}
							</div>
						</div>
					</div>
				</>
			) : (
				<>
					{/* Reports Content */}
					<div className="flex items-center gap-2 mb-8 p-1 bg-white rounded-2xl shadow-sm border border-gray-100 w-max overflow-x-auto max-w-full">
						{['Tất cả', 'Chờ duyệt', 'Đã xử lý', 'Đã bỏ qua'].map(status => (
							<button
								key={status}
								onClick={() => setReportFilter(status)}
								className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${reportFilter === status ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
							>
								{status}
							</button>
						))}
					</div>

					{filteredReports.length === 0 ? (
						<div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-gray-100 italic text-gray-400">Không có báo cáo nào ở trạng thái này.</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredReports.map(report => (
								<div key={report.ID_BaoCao} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
									<div className="flex justify-between items-start mb-4">
										<span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${report.TrangThai === 'Chờ duyệt' ? 'bg-orange-100 text-orange-600' : report.TrangThai.includes('Phạt') ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
											{report.TrangThai}
										</span>
										<span className="text-[10px] text-gray-400 font-medium">{formatDate(report.NgayTao)}</span>
									</div>
									<div className="mb-4">
										<h3 className="font-black text-gray-800 text-sm mb-1 line-clamp-1">{report.LyDo}</h3>
										<p className="text-xs text-gray-400 line-clamp-2 italic">"{report.MoTa || 'Không có mô tả'}"</p>
									</div>
									<div className="space-y-2 pt-3 border-t border-gray-50 mb-4">
										<div className="flex items-center gap-2">
											<div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-[10px]"><i className="fas fa-home"></i></div>
											<p className="text-xs font-bold text-gray-700 truncate">{report.TenPhong}</p>
										</div>
										<div className="flex items-center gap-2">
											<div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 text-[10px]"><i className="fas fa-user-tie"></i></div>
											<p className="text-xs font-bold text-gray-700 truncate">{report.TenChuTro}</p>
										</div>
									</div>
									{report.HinhAnh && (
										<div className="mb-4 rounded-xl overflow-hidden h-24 bg-gray-100 border border-gray-50 cursor-pointer" onClick={() => setSelectedReport(report)}>
											<img src={report.HinhAnh} className="w-full h-full object-cover" alt="Bằng chứng" />
										</div>
									)}
									{/* AI Suggestion */}
									{report.TrangThai === 'Chờ duyệt' && (
										<div className="mb-4">
											{!aiAnalysis[report.ID_BaoCao] ? (
												<button
													onClick={() => handleAIAnalyze(report)}
													disabled={aiLoading[report.ID_BaoCao]}
													className="w-full py-2 rounded-xl bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition flex items-center justify-center gap-2 border border-indigo-100"
												>
													{aiLoading[report.ID_BaoCao] ? <><i className="fas fa-spinner fa-spin"></i> Đang phân tích...</> : <><i className="fas fa-robot"></i> AI Gợi ý</>}
												</button>
											) : (
												<div className={`p-3 rounded-xl border ${aiAnalysis[report.ID_BaoCao].decision === 'DUYỆT PHẠT' ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-200'}`}>
													<p className="text-[10px] font-black text-gray-800 mb-1">AI Đề xuất: <span className={aiAnalysis[report.ID_BaoCao].decision === 'DUYỆT PHẠT' ? 'text-red-600' : 'text-gray-600'}>{aiAnalysis[report.ID_BaoCao].decision}</span></p>
													<p className="text-[9px] text-gray-500 italic line-clamp-2">"{aiAnalysis[report.ID_BaoCao].reasoning}"</p>
												</div>
											)}
										</div>
									)}
									{report.TrangThai === 'Chờ duyệt' && (
										<div className="flex gap-2 mt-4">
											<button onClick={() => handleReportAction(report.ID_BaoCao, 'reject')} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-500 text-[10px] font-black uppercase hover:bg-gray-200 transition">Bỏ qua</button>
											<button onClick={() => handleReportAction(report.ID_BaoCao, 'approve')} className="flex-1 py-3 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase hover:bg-red-700 transition shadow-lg shadow-red-100">Duyệt Phạt</button>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</>
			)}

			{/* ======= MODALS (SAME AS BEFORE + IMAGE PREVIEW) ======= */}
			{selectedReport && (
				<div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedReport(null)}>
					<div className="max-w-xl w-full bg-white rounded-3xl overflow-hidden relative shadow-2xl" onClick={e => e.stopPropagation()}>
						<img src={selectedReport.HinhAnh} className="w-full h-96 object-contain bg-black" />
						<div className="p-6">
							<h4 className="font-bold text-lg mb-2">{selectedReport.LyDo}</h4>
							<p className="text-sm text-gray-500 italic">"{selectedReport.MoTa}"</p>
						</div>
						<button onClick={() => setSelectedReport(null)} className="absolute top-4 right-4 text-white text-xl"><i className="fas fa-times"></i></button>
					</div>
				</div>
			)}
			
			{/* View User Modal logic... (Keeping your existing modal structure but updated styles) */}
			{viewUser && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setViewUser(null)}>
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
						<div className="relative px-8 pt-8 pb-12 text-center text-white" style={{ background: (viewUser.TrangThai === 'locked' || (viewUser.TrangThai && viewUser.TrangThai.toLowerCase().includes('khóa'))) ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'linear-gradient(135deg, #4F46E5, #3B82F6)' }}>
							<button onClick={() => setViewUser(null)} className="absolute top-4 right-4 text-white"><i className="fas fa-times"></i></button>
							<div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3 text-xl font-black">{getInitials(viewUser.HoTen)}</div>
							<h3 className="text-xl font-black">{viewUser.HoTen}</h3>
							<span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold bg-white/20 uppercase">{viewUser.TenVaiTro}</span>
						</div>
						<div className="px-8 py-6 -mt-4">
							<div className="bg-gray-50 rounded-2xl p-5 space-y-3">
								<p className="text-sm"><strong>Email:</strong> {viewUser.Email}</p>
								<p className="text-sm"><strong>Số điện thoại:</strong> {viewUser.SoDienThoai || "—"}</p>
								<p className="text-sm"><strong>Ngày tạo:</strong> {formatDate(viewUser.NgayTao)}</p>
								<p className="text-sm"><strong>Trạng thái:</strong> {(viewUser.TrangThai === 'locked' || (viewUser.TrangThai && viewUser.TrangThai.toLowerCase().includes('khóa'))) ? '🔒 Đã khóa' : '✅ Hoạt động'}</p>
							</div>
						</div>
						<div className="px-8 pb-6 flex gap-3">
							<button onClick={() => setViewUser(null)} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-sm">Đóng</button>
						</div>
					</div>
				</div>
			)}

			{/* Lock User Modal logic... */}
			{lockUser && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setLockUser(null)}>
					<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
						<div className="bg-gradient-to-r from-red-500 to-rose-600 px-8 py-6 text-center text-white">
							<h3 className="text-xl font-black">Khóa tài khoản</h3>
							<p className="text-red-100 text-xs mt-1">{lockUser.HoTen}</p>
						</div>
						<div className="p-8">
							<textarea className="w-full border border-gray-200 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-red-300" rows={4} placeholder="Nhập lý do khóa..." value={lockNote} onChange={(e) => setLockNote(e.target.value)} />
							{lockError && <p className="text-red-600 text-xs mt-2">{lockError}</p>}
							<div className="flex gap-3 mt-6">
								<button onClick={() => setLockUser(null)} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold">Hủy</button>
								<button onClick={submitLock} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">Xác nhận</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default AdminQuanLyTaiKhoan;
