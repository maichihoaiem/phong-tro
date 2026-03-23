import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

function AdminHoanTien() {
	const [refunds, setRefunds] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filter, setFilter] = useState('all');
	const [actionLoading, setActionLoading] = useState(null);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			const res = await axios.get('/api/dat-phong/admin-refunds', { withCredentials: true });
			if (res.data.success) {
				setRefunds(res.data.data);
			}
		} catch (err) {
			setError('Lỗi khi tải dữ liệu dành cho Admin. Vui lòng kiểm tra quyền hạn.');
		} finally {
			setLoading(false);
		}
	};

	const handleConfirmRefunded = async (idDatPhong) => {
		if (!window.confirm("Xác nhận bạn đã chuyển khoản hoàn tiền cho khách thuê? Giao dịch này sẽ được đóng lại.")) return;

		setActionLoading(idDatPhong);
		try {
			// Re-using the same endpoint, but we can change the logic inside it if needed
			const res = await axios.put(`/api/dat-phong/${idDatPhong}/resolve-dispute`, {}, { withCredentials: true });
			if (res.data.success) {
				alert("Đã xác nhận hoàn tiền thành công!");
				loadData();
				window.dispatchEvent(new Event('ozic:notifications-refresh'));
			}
		} catch (err) {
			alert("Lỗi khi xác nhận hoàn tiền");
		} finally {
			setActionLoading(null);
		}
	};

	const [showQR, setShowQR] = useState(null); // idDatPhong

	const getVietQRUrl = (bankId, stk, amount, maGD, name) => {
		const description = `HOAN TIEN ${maGD}`.replace(/\s+/g, '%20');
		const encodedName = (name || '').replace(/\s+/g, '%20');
		return `https://img.vietqr.io/image/${bankId}-${stk}-compact2.png?amount=${amount}&addInfo=${description}&accountName=${encodedName}`;
	};

	// Tính toán số lượng cho từng tab bằng useMemo
	const counts = useMemo(() => {
		return {
			all: refunds.length,
			'Chờ hoàn tiền': refunds.filter(r => (r.TrangThaiThanhToan || '').trim() === 'Chờ hoàn tiền (Đã có STK)').length,
			'Đã hoàn tiền': refunds.filter(r => (r.TrangThaiThanhToan || '').trim() === 'Đã hoàn tiền').length,
		};
	}, [refunds]);

	const filteredData = useMemo(() => {
		let data = [...refunds];
		if (filter !== 'all') {
			const targetStatus = filter === 'Chờ hoàn tiền' ? 'Chờ hoàn tiền (Đã có STK)' : filter;
			data = data.filter(r => (r.TrangThaiThanhToan || '').trim() === (targetStatus || '').trim());
		}
		// Đảm bảo sắp xếp mới nhất lên đầu (Dựa trên ID_DatPhong)
		return data.sort((a, b) => b.ID_DatPhong - a.ID_DatPhong);
	}, [refunds, filter]);

	// Debug Log để kiểm tra nếu "Tất cả" vẫn bị lỗi
	useEffect(() => {
		if (filter === 'all') {
			console.log("DEBUG: Tab Tất cả - Total refunds:", refunds.length, "Filtered count:", filteredData.length);
		}
	}, [filter, refunds, filteredData]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<i className="fas fa-spinner fa-spin text-indigo-600 text-4xl"></i>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-6xl px-4 pt-16 pb-10">
			{/* Modal QR */}
			{showQR && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowQR(null)}>
					<div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl animate-fade-up" onClick={e => e.stopPropagation()}>
						<div className="flex justify-between items-center mb-6">
							<h3 className="font-black text-xl text-gray-800">Mã QR Hoàn tiền</h3>
							<button onClick={() => setShowQR(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
								<i className="fas fa-times text-gray-500"></i>
							</button>
						</div>
                        
						{refunds.find(r => r.ID_DatPhong === showQR) && (() => {
							const r = refunds.find(req => req.ID_DatPhong === showQR);
							return (
								<div className="text-center">
									<div className="bg-gray-50 p-4 rounded-2xl mb-4">
										<img 
											src={getVietQRUrl(r.NganHang_NguoiThue, r.STK_NguoiThue, r.SoTien, r.MaGiaoDich, r.ChuTK_NguoiThue)} 
											alt="VietQR" 
											className="w-full h-auto rounded-lg shadow-sm border border-white"
										/>
									</div>
									<p className="text-2xl font-black text-blue-600 mb-1">{new Intl.NumberFormat('vi-VN').format(r.SoTien)} đ</p>
									<p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{r.NganHang_NguoiThue} - {r.STK_NguoiThue}</p>
									<p className="text-xs text-gray-400 mt-4 italic">Quét mã bằng ứng dụng ngân hàng để hoàn tiền nhanh nhất.</p>
								</div>
							);
						})()}
					</div>
				</div>
			)}

			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
				<div>
					<h1 className="text-3xl font-extrabold text-gray-900 mb-2 flex items-center gap-2">
						<i className="fas fa-shield-alt" style={{ color: '#4F46E5' }}></i>
						Quản lý <span style={{ color: '#4F46E5' }}>Hoàn Tiền Tự Động</span>
					</h1>
					<p className="text-gray-500 font-medium italic">Xử lý các khoản cọc cần hoàn trả do Chủ trọ từ chối</p>
				</div>
				<div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex-wrap gap-2">
					{[
						{ key: 'all', label: 'Tất cả' },
						{ key: 'Chờ hoàn tiền', label: 'Chờ hoàn tiền' },
						{ key: 'Đã hoàn tiền', label: 'Đã hoàn tiền' }
					].map((f) => (
						<button
							key={f.key}
							onClick={() => setFilter(f.key)}
							className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filter === f.key ? (f.key === 'Đã hoàn tiền' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200') : 'text-gray-500 hover:bg-gray-50'}`}
						>
							{f.label}
							<span className={`px-2 py-0.5 rounded-lg text-[10px] ${filter === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
								{counts[f.key] || 0}
							</span>
						</button>
					))}
				</div>
			</div>

			{error && (
				<div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-center gap-4 mb-8">
					<i className="fas fa-shield-virus text-2xl"></i>
					<p className="font-bold">{error}</p>
				</div>
			)}

			{filteredData.length === 0 ? (
				<div className="bg-white rounded-3xl p-20 text-center shadow-xl shadow-gray-100 border border-gray-50">
					<div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
						<i className="fas fa-check-double text-4xl text-indigo-300"></i>
					</div>
					<h3 className="text-2xl font-bold text-gray-800 mb-2">Không có yêu cầu hoàn tiền nào</h3>
					<p className="text-gray-500 max-w-md mx-auto">Tất cả các khoản cọc đều đã được xử lý ổn thỏa.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
					{filteredData.map(req => (
						<div key={req.ID_DatPhong} className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-50 overflow-hidden hover:scale-[1.02] transition-transform flex flex-col">
							<div className={`p-1 text-center text-[10px] font-black uppercase tracking-widest ${
								req.TrangThaiThanhToan === 'Chờ hoàn tiền (Đã có STK)' ? 'bg-yellow-400 text-white' : 
								'bg-emerald-600 text-white'
								}`}>
								{req.TrangThaiThanhToan === 'Chờ hoàn tiền (Đã có STK)' ? 'Chờ hoàn tiền' : req.TrangThaiThanhToan}
							</div>

							<div className="p-5 flex-grow">
								<div className="flex justify-between items-start mb-4">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-base shadow-md shadow-indigo-200">
											<i className="fas fa-file-invoice-dollar"></i>
										</div>
										<div>
											<h4 className="font-black text-gray-800 text-base leading-tight">{req.TieuDe}</h4>
											<p className="text-indigo-600 font-mono text-xs font-bold">#{req.MaGiaoDich}</p>
										</div>
									</div>
									<div className="text-right">
										<p className="font-black text-gray-900 line-through opacity-30 text-[10px]">{new Intl.NumberFormat('vi-VN').format(req.SoTien || 0)} đ</p>
										<p className="text-lg font-black text-red-600">-{new Intl.NumberFormat('vi-VN').format(req.SoTien || 0)} đ</p>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-3 mb-4">
									<div className="bg-blue-50/50 p-3 rounded-xl border border-blue-50">
										<p className="text-[9px] font-black text-blue-400 uppercase tracking-tighter mb-1">Người thuê</p>
										<p className="font-bold text-gray-800 text-xs">{req.TenNguoiThue}</p>
										<p className="text-gray-500 text-[10px]">{req.SDT_NguoiThue}</p>
									</div>
									<div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-50">
										<p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter mb-1">Chủ trọ</p>
										<p className="font-bold text-gray-800 text-xs">{req.TenChuTro}</p>
										<p className="text-gray-500 text-[10px]">{req.SDT_ChuTro}</p>
									</div>
								</div>

								<div className="mt-3 p-3 bg-gray-50 rounded-xl mb-0 text-center">
									<h5 className="text-xs font-bold text-gray-700 mb-1">Thông tin Ngân hàng của Khách thuê</h5>
									<p className="text-[10px] text-gray-500 mb-2">Vui lòng chuyển khoản lại {new Intl.NumberFormat('vi-VN').format(req.SoTien || 0)} đ vào tài khoản này:</p>
									<div className="flex flex-col items-center gap-0.5">
										<div className="relative inline-flex items-center group">
											<p className="text-base font-mono font-black text-blue-600">STK: {req.STK_NguoiThue}</p>
											<button 
												onClick={() => {
													navigator.clipboard.writeText(req.STK_NguoiThue);
													alert("Đã sao chép số tài khoản: " + req.STK_NguoiThue);
												}}
												className="absolute -right-7 text-gray-400 hover:text-blue-600 transition p-1 opacity-0 group-hover:opacity-100"
												title="Sao chép STK"
											>
												<i className="far fa-copy text-xs"></i>
											</button>
										</div>
										<p className="text-xs font-bold uppercase text-gray-800 border-t border-gray-200/50 pt-1 mt-1 w-full text-center">Chủ TK: {req.ChuTK_NguoiThue || req.chutk_nguoithue}</p>
										<p className="text-[11px] text-gray-600 italic">Ngân hàng: {req.NganHang_NguoiThue || req.nganhang_nguoithue}</p>
									</div>
								</div>
							</div>

							<div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
								{req.TrangThaiThanhToan === 'Chờ hoàn tiền (Đã có STK)' && (
									<>
										<button
											onClick={() => setShowQR(req.ID_DatPhong)}
											className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-100 font-bold py-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-sm text-xs"
										>
											<i className="fas fa-qrcode text-[10px]"></i> Hiện mã QR
										</button>
										<button
											onClick={() => handleConfirmRefunded(req.ID_DatPhong)}
											disabled={actionLoading === req.ID_DatPhong}
											className="flex-[1.5] flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold py-2.5 rounded-xl hover:bg-emerald-600 hover:text-white transition-all duration-200 shadow-sm disabled:opacity-50 text-xs"
										>
											{actionLoading === req.ID_DatPhong ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-double text-[10px]"></i>}
											{actionLoading === req.ID_DatPhong ? 'Đang xử lý...' : 'Xác nhận Đã hoàn tiền'}
										</button>
									</>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default AdminHoanTien;
// ...existing code from AdminRefundPage.jsx will be inserted here
