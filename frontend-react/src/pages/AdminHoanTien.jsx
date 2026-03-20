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
			'Chờ hoàn tiền (Đã có STK)': refunds.filter(r => (r.TrangThaiThanhToan || '').trim() === 'Chờ hoàn tiền (Đã có STK)').length,
			'Chờ hoàn tiền (Chưa có STK)': refunds.filter(r => (r.TrangThaiThanhToan || '').trim() === 'Chờ hoàn tiền (Chưa có STK)').length,
			'Đã hoàn tiền': refunds.filter(r => (r.TrangThaiThanhToan || '').trim() === 'Đã hoàn tiền').length,
		};
	}, [refunds]);

	const filteredData = useMemo(() => {
		let data = [...refunds];
		if (filter !== 'all') {
			data = data.filter(r => (r.TrangThaiThanhToan || '').trim() === (filter || '').trim());
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
				<i className="fas fa-spinner fa-spin text-purple-600 text-4xl"></i>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-7xl px-4 py-10">
			{/* Modal QR */}
			{showQR && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowQR(null)}>
					<div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-fade-up" onClick={e => e.stopPropagation()}>
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

			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
				<div>
					<h1 className="text-3xl font-extrabold text-gray-900 mb-2 flex items-center gap-2">
						<i className="fas fa-shield-alt" style={{ color: '#7C3AED' }}></i>
						Quản lý <span style={{ color: '#7C3AED' }}>Hoàn Tiền Tự Động</span>
					</h1>
					<p className="text-gray-500 font-medium italic">Xử lý các khoản cọc cần hoàn trả do Chủ trọ từ chối</p>
				</div>
				<div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex-wrap gap-2">
					{[
						{ key: 'all', label: 'Tất cả' },
						{ key: 'Chờ hoàn tiền (Đã có STK)', label: 'Chờ hoàn tiền' },
						{ key: 'Chờ hoàn tiền (Chưa có STK)', label: 'Chưa có STK' },
						{ key: 'Đã hoàn tiền', label: 'Đã hoàn tiền' }
					].map((f) => (
						<button
							key={f.key}
							onClick={() => setFilter(f.key)}
							className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filter === f.key ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-gray-500 hover:bg-gray-50'}`}
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
					<div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
						<i className="fas fa-check-double text-4xl text-purple-300"></i>
					</div>
					<h3 className="text-2xl font-bold text-gray-800 mb-2">Không có yêu cầu hoàn tiền nào</h3>
					<p className="text-gray-500 max-w-md mx-auto">Tất cả các khoản cọc đều đã được xử lý ổn thỏa.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{filteredData.map(req => (
						<div key={req.ID_DatPhong} className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-50 overflow-hidden hover:scale-[1.01] transition-transform flex flex-col">
							<div className={`p-1 text-center text-[10px] font-black uppercase tracking-widest ${
								req.TrangThaiThanhToan === 'Chờ hoàn tiền (Đã có STK)' ? 'bg-yellow-400 text-white' : 
								req.TrangThaiThanhToan === 'Chờ hoàn tiền (Chưa có STK)' ? 'bg-orange-500 text-white' :
								'bg-purple-600 text-white'
								}`}>
								{req.TrangThaiThanhToan}
							</div>

							<div className="p-8 flex-grow">
								<div className="flex justify-between items-start mb-6">
									<div className="flex items-center gap-4">
										<div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-purple-200">
											<i className="fas fa-file-invoice-dollar"></i>
										</div>
										<div>
											<h4 className="font-black text-gray-800 text-lg leading-tight">{req.TieuDe}</h4>
											<p className="text-purple-600 font-mono text-sm font-bold">#{req.MaGiaoDich}</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-2xl font-black text-gray-900 line-through opacity-30 text-[12px]">{new Intl.NumberFormat('vi-VN').format(req.SoTien || 0)} đ</p>
										<p className="text-xl font-black text-red-600">-{new Intl.NumberFormat('vi-VN').format(req.SoTien || 0)} đ</p>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4 mb-6">
									<div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-50">
										<p className="text-[10px] font-black text-blue-400 uppercase tracking-tighter mb-1">Người thuê</p>
										<p className="font-bold text-gray-800 text-sm">{req.TenNguoiThue}</p>
										<p className="text-gray-500 text-xs">{req.SDT_NguoiThue}</p>
									</div>
									<div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-50">
										<p className="text-[10px] font-black text-purple-400 uppercase tracking-tighter mb-1">Chủ trọ</p>
										<p className="font-bold text-gray-800 text-sm">{req.TenChuTro}</p>
										<p className="text-gray-500 text-xs">{req.SDT_ChuTro}</p>
									</div>
								</div>

								<div className="mt-4 p-4 bg-gray-50 rounded-xl mb-4 text-center">
									<h5 className="text-sm font-bold text-gray-700 mb-2">Thông tin Ngân hàng của Khách thuê</h5>
									<p className="text-xs text-gray-500 mb-2">Vui lòng chuyển khoản lại {new Intl.NumberFormat('vi-VN').format(req.SoTien || 0)} đ vào tài khoản này:</p>
									<div className="flex flex-col items-center gap-0.5">
										<div className="relative inline-flex items-center group">
											<p className="text-lg font-mono font-black text-blue-600">STK: {req.STK_NguoiThue}</p>
											<button 
												onClick={() => {
													navigator.clipboard.writeText(req.STK_NguoiThue);
													alert("Đã sao chép số tài khoản: " + req.STK_NguoiThue);
												}}
												className="absolute -right-8 text-gray-400 hover:text-blue-600 transition p-1 opacity-0 group-hover:opacity-100"
												title="Sao chép STK"
											>
												<i className="far fa-copy"></i>
											</button>
										</div>
										<p className="text-sm font-bold uppercase text-gray-800">Chủ TK: {req.ChuTK_NguoiThue || req.chutk_nguoithue}</p>
										<p className="text-sm text-gray-600 italic">Ngân hàng: {req.NganHang_NguoiThue || req.nganhang_nguoithue}</p>
									</div>
								</div>
							</div>

							<div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-3">
								{req.TrangThaiThanhToan === 'Chờ hoàn tiền (Đã có STK)' && (
									<>
										<button
											onClick={() => setShowQR(req.ID_DatPhong)}
											className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
										>
											<i className="fas fa-qrcode"></i> Hiện mã QR
										</button>
										<button
											onClick={() => handleConfirmRefunded(req.ID_DatPhong)}
											disabled={actionLoading === req.ID_DatPhong}
											className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-100"
										>
											{actionLoading === req.ID_DatPhong ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-double"></i>}
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
