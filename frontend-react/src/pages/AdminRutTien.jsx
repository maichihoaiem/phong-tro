import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VIETQR_BANKS = [
	'VCB', 'ICB', 'BIDV', 'VBA', 'MB', 'TCB', 'ACB', 'VPB', 'TPB', 'STB',
	'HDB', 'VIB', 'SHB', 'OCB', 'MSB', 'LPB', 'ABB', 'VCCB', 'SCB', 'EIB'
];

function AdminRutTien() {
	const [withdrawals, setWithdrawals] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [processingId, setProcessingId] = useState(null);
	const [rejectNote, setRejectNote] = useState('');
	const [showRejectModal, setShowRejectModal] = useState(false);
	const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
	const [qrModalData, setQrModalData] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		loadWithdrawals();
	}, []);

	const loadWithdrawals = async () => {
		try {
			const res = await axios.get('/api/wallet/admin/withdrawals', { withCredentials: true });
			if (res.data.success) {
				setWithdrawals(res.data.data);
			}
		} catch (err) {
			console.error(err);
			if (err.response && err.response.status === 403) {
				navigate('/');
			} else {
				setError('Không thể tải danh sách rút tiền.');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleApprove = async (id) => {
		if (!window.confirm('Bạn xác nhận ĐÃ CHUYỂN TIỀN cho chủ trọ này? Hành động này không thể hoàn tác.')) return;
        
		setProcessingId(id);
		try {
			const res = await axios.put(`/api/wallet/admin/withdrawals/${id}`, {
				trangThai: 'Đã duyệt'
			}, { withCredentials: true });
            
			if (res.data.success) {
				alert('Đã duyệt yêu cầu thành công!');
				loadWithdrawals();
				window.dispatchEvent(new Event('ozic:notifications-refresh'));
			}
		} catch (err) {
			alert(err.response?.data?.message || 'Có lỗi xảy ra khi duyệt yêu cầu.');
		} finally {
			setProcessingId(null);
		}
	};

	const copyTransferNote = async (note) => {
		if (!note) return;
		await navigator.clipboard.writeText(note);
		alert('Đã copy nội dung chuyển khoản: ' + note);
	};

	const normalizeText = (value = '') =>
		String(value)
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/đ/g, 'd')
			.replace(/Đ/g, 'D')
			.toLowerCase()
			.trim();

	const detectBankId = (bankName = '') => {
		const normalized = normalizeText(bankName);
		if (!normalized) return null;

		const map = [
			{ id: 'VCB', keys: ['vietcombank', 'vcb', 'ngoai thuong'] },
			{ id: 'ICB', keys: ['vietinbank', 'vietin', 'icb', 'cong thuong'] },
			{ id: 'BIDV', keys: ['bidv'] },
			{ id: 'VBA', keys: ['agribank', 'vba', 'nong nghiep'] },
			{ id: 'MB', keys: ['mbbank', 'mb bank', 'mb', 'quan doi'] },
			{ id: 'TCB', keys: ['techcombank', 'tcb'] },
			{ id: 'ACB', keys: ['acb'] },
			{ id: 'VPB', keys: ['vpbank', 'vpb'] },
			{ id: 'TPB', keys: ['tpbank', 'tpb', 'tien phong'] },
			{ id: 'STB', keys: ['sacombank', 'stb'] },
			{ id: 'HDB', keys: ['hdbank', 'hdb'] },
			{ id: 'VIB', keys: ['vib'] },
			{ id: 'SHB', keys: ['shb'] },
			{ id: 'OCB', keys: ['ocb', 'phuong dong'] },
			{ id: 'MSB', keys: ['msb', 'maritime'] },
			{ id: 'LPB', keys: ['lienvietpostbank', 'lien viet', 'lpb'] },
			{ id: 'ABB', keys: ['abbank', 'an binh', 'abb'] },
			{ id: 'VCCB', keys: ['vietcapitalbank', 'ban viet', 'vccb'] },
			{ id: 'SCB', keys: ['scb'] },
			{ id: 'EIB', keys: ['eximbank', 'eib'] }
		];

		for (const bank of map) {
			if (bank.keys.some(key => normalized.includes(key))) return bank.id;
		}

		const upperRaw = String(bankName || '').trim().toUpperCase();
		if (VIETQR_BANKS.includes(upperRaw)) return upperRaw;

		return null;
	};

	const getQrData = (withdrawal) => {
		if (withdrawal?.VietQrUrl) {
			return {
				qrUrl: withdrawal.VietQrUrl,
				note: withdrawal.VietQrTransferNote || `RUTTIEN ${withdrawal.ID_RutTien}`
			};
		}

		const bankId = detectBankId(withdrawal?.TenNganHang);
		const accountNumber = String(withdrawal?.SoTaiKhoan || '').replace(/\s+/g, '');
		const amount = Number(withdrawal?.SoTien || 0);
		if (!bankId || !accountNumber || !amount) {
			return { qrUrl: null, note: null };
		}

		const note = `RUTTIEN ${withdrawal.ID_RutTien}`;
		const encodedNote = encodeURIComponent(note);
		const encodedName = encodeURIComponent(withdrawal?.ChuTaiKhoan || '');
		const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodedNote}&accountName=${encodedName}`;

		return { qrUrl, note };
	};

	const openQrModal = (withdrawal) => {
		const qrData = getQrData(withdrawal);
		if (!qrData.qrUrl) {
			alert('Không tạo được QR tự động cho yêu cầu này. Vui lòng kiểm tra lại tên ngân hàng.');
			return;
		}

		setQrModalData({
			...withdrawal,
			qrUrl: qrData.qrUrl,
			note: qrData.note
		});
	};

	const openRejectModal = (withdrawal) => {
		setSelectedWithdrawal(withdrawal);
		setRejectNote('');
		setShowRejectModal(true);
	};

	const handleReject = async () => {
		if (!rejectNote.trim()) {
			alert('Vui lòng nhập lý do từ chối để chủ trọ biết.');
			return;
		}

		setProcessingId(selectedWithdrawal.ID_RutTien);
		try {
			const res = await axios.put(`/api/wallet/admin/withdrawals/${selectedWithdrawal.ID_RutTien}`, {
				trangThai: 'Từ chối',
				ghiChuAdmin: rejectNote
			}, { withCredentials: true });
            
			if (res.data.success) {
				alert('Đã từ chối yêu cầu và hoàn tiền lại cho chủ trọ!');
				setShowRejectModal(false);
				loadWithdrawals();
				window.dispatchEvent(new Event('ozic:notifications-refresh'));
			}
		} catch (err) {
			alert(err.response?.data?.message || 'Có lỗi xảy ra khi từ chối yêu cầu.');
		} finally {
			setProcessingId(null);
		}
	};

	if (loading) return <div className="text-center py-20"><i className="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div>;
	if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

	return (
		<div className="container mx-auto max-w-6xl px-4 py-8">
			<h1 className="text-3xl font-extrabold text-gray-800 mb-2 flex items-center gap-2">
				<i className="fas fa-money-check-alt" style={{ color: '#0891B2' }}></i>
				Quản lý <span style={{ color: '#0891B2' }}>Yêu Cầu Rút Tiền</span>
			</h1>
			<p className="text-gray-500 mb-8">Kiểm duyệt và chuyển khoản cho các chủ trọ yêu cầu thanh toán</p>

			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr style={{ background: '#ECFEFF' }} className="text-cyan-700 text-sm border-b border-cyan-100">
								<th className="p-4 font-semibold">Mã YC</th>
								<th className="p-4 font-semibold">Ngày tạo</th>
								<th className="p-4 font-semibold">Chủ trọ</th>
								<th className="p-4 font-semibold">Số tiền</th>
								<th className="p-4 font-semibold">Thông tin Ngân hàng</th>
								<th className="p-4 font-semibold">Trạng thái</th>
								<th className="p-4 font-semibold text-center">Thao tác</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{withdrawals.length === 0 ? (
								<tr>
									<td colSpan="7" className="p-8 text-center text-gray-500">Chưa có yêu cầu rút tiền nào.</td>
								</tr>
							) : withdrawals.map(w => {
								const qrData = getQrData(w);

								return (
								<tr key={w.ID_RutTien} className="hover:bg-gray-50 transition-colors">
									<td className="p-4 text-sm font-medium text-gray-900">#{w.ID_RutTien}</td>
									<td className="p-4 text-sm text-gray-500">
										{new Date(w.NgayYeuCau).toLocaleString('vi-VN')}
									</td>
									<td className="p-4">
										<p className="text-sm font-bold text-gray-800">{w.TenChuTro}</p>
										<p className="text-xs text-gray-500">ID: {w.ID_TaiKhoan}</p>
									</td>
									<td className="p-4">
										<span className="text-base font-bold text-red-600">
											{new Intl.NumberFormat('vi-VN').format(w.SoTien)} đ
										</span>
									</td>
									<td className="p-4">
										<p className="text-sm font-bold text-blue-800">{w.TenNganHang}</p>
										<div className="flex items-center gap-2">
											<p className="text-sm font-mono text-gray-700">{w.SoTaiKhoan}</p>
											<button 
												onClick={() => {
													navigator.clipboard.writeText(w.SoTaiKhoan);
													alert('Đã copy số tài khoản: ' + w.SoTaiKhoan);
												}}
												className="text-gray-400 hover:text-blue-600 transition p-1"
												title="Copy số tài khoản"
											>
												<i className="far fa-copy"></i>
											</button>
										</div>
										<p className="text-xs text-gray-500">{w.ChuTaiKhoan}</p>
										{qrData.qrUrl ? (
											<div className="mt-2">
												<button
													onClick={() => openQrModal(w)}
													className="text-xs font-semibold text-blue-700 hover:text-blue-800"
												>
													<i className="fas fa-qrcode mr-1"></i> Hiện mã QR
												</button>
											</div>
										) : (
											<p className="mt-2 text-[11px] text-amber-600">Không tạo được QR tự động, vui lòng kiểm tra tên ngân hàng.</p>
										)}
									</td>
									<td className="p-4">
										{w.TrangThai === 'Chờ duyệt' && <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Chờ duyệt</span>}
										{w.TrangThai === 'Đã duyệt' && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Đã duyệt</span>}
										{w.TrangThai === 'Từ chối' && (
											<div>
												<span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Từ chối</span>
												{w.GhiChuAdmin && <p className="text-xs text-red-500 mt-1 italic">LBN: {w.GhiChuAdmin}</p>}
											</div>
										)}
									</td>
									<td className="p-4 text-center">
										{w.TrangThai === 'Chờ duyệt' && (
											<div className="flex justify-center gap-2">
												<button 
													onClick={() => handleApprove(w.ID_RutTien)}
													disabled={processingId === w.ID_RutTien}
													className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 disabled:opacity-50"
												>
													<i className="fas fa-check text-[10px]"></i> Duyệt
												</button>
												<button 
													onClick={() => openRejectModal(w)}
													disabled={processingId === w.ID_RutTien}
													className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 disabled:opacity-50"
												>
													<i className="fas fa-times text-[10px]"></i> Từ chối
												</button>
											</div>
										)}
										{w.TrangThai !== 'Chờ duyệt' && (
											<span className="text-xs text-gray-400">Đã xử lý lúc {new Date(w.NgayXuLy).toLocaleString('vi-VN')}</span>
										)}
									</td>
								</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

			{qrModalData && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
					<div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-5 md:p-6 relative">
						<button
							onClick={() => setQrModalData(null)}
							className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
							title="Đóng"
						>
							<i className="fas fa-times text-xl"></i>
						</button>

						<h3 className="text-2xl font-extrabold text-gray-800 text-center mb-2">Chuyển khoản rút tiền</h3>
						<p className="text-gray-500 text-center mb-6">Vui lòng quét mã QR bên dưới để chuyển khoản cho chủ trọ.</p>

						<div className="mx-auto w-full max-w-[280px] p-3 rounded-2xl border border-gray-200 bg-gray-50">
							<div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
								<img
									src={qrModalData.qrUrl}
									alt={`VietQR rut tien #${qrModalData.ID_RutTien}`}
									className="w-full h-auto object-contain rounded-lg"
								/>
							</div>
						</div>

						<div className="mt-5 space-y-1 text-center text-sm text-gray-600">
							<p><strong>Mã YC:</strong> #{qrModalData.ID_RutTien}</p>
							<p><strong>Người nhận:</strong> {qrModalData.ChuTaiKhoan}</p>
							<p><strong>Số tiền:</strong> {new Intl.NumberFormat('vi-VN').format(qrModalData.SoTien)} đ</p>
						</div>

						<div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
							<button
								onClick={() => copyTransferNote(qrModalData.note)}
								className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
							>
								<i className="far fa-copy mr-2"></i>Copy nội dung CK
							</button>
							<button
								onClick={() => setQrModalData(null)}
								className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
							>
								Đóng
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Modal Từ Chối */}
			{showRejectModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
						<div className="bg-red-600 px-6 py-4 flex justify-between items-center">
							<h3 className="text-white font-bold text-lg flex items-center gap-2">
								<i className="fas fa-exclamation-triangle"></i> Từ chối yêu cầu
							</h3>
							<button onClick={() => setShowRejectModal(false)} className="text-red-200 hover:text-white transition">
								<i className="fas fa-times text-xl"></i>
							</button>
						</div>
						<div className="p-6">
							<p className="text-gray-600 text-sm mb-4">
								Bạn đang từ chối yêu cầu rút <strong>{new Intl.NumberFormat('vi-VN').format(selectedWithdrawal?.SoTien)} đ</strong> của chủ trọ <strong>{selectedWithdrawal?.TenChuTro}</strong>. Số tiền này sẽ được <strong>hoàn lại vào ví</strong> của chủ trọ.
							</p>
							<div className="mb-4">
								<label className="block text-sm font-semibold text-gray-700 mb-2">Lý do từ chối (Bắt buộc)</label>
								<textarea
									value={rejectNote}
									onChange={(e) => setRejectNote(e.target.value)}
									className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm resize-none"
									rows="3"
									placeholder="Ví dụ: Sai thông tin ngân hàng, Vietcombank đang bảo trì..."
								></textarea>
							</div>
							<div className="flex gap-3 justify-end mt-6">
								<button
									onClick={() => setShowRejectModal(false)}
									className="px-5 py-2.5 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-semibold text-sm transition"
								>
									Hủy bỏ
								</button>
								<button
									onClick={handleReject}
									disabled={processingId !== null}
									className="px-5 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 font-semibold text-sm transition flex items-center gap-2"
								>
									{processingId !== null ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-times"></i>}
									Xác nhận Từ chối
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default AdminRutTien;
// ...existing code from admin/AdminWalletManagement.jsx will be inserted here
