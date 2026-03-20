import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { VIETQR_BANKS } from '../data/banks';

function ViTien() {
	const [walletData, setWalletData] = useState({ balance: 0, history: [], withdrawals: [] });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showWithdrawModal, setShowWithdrawModal] = useState(false);
	const [withdrawLoading, setWithdrawLoading] = useState(false);
	const [showAllHistory, setShowAllHistory] = useState(false);
	const [showAllWithdrawals, setShowAllWithdrawals] = useState(false);
	const [activeSection, setActiveSection] = useState('history'); // 'history' or 'withdrawals'
	const [withdrawForm, setWithdrawForm] = useState({ soTien: '', tenNganHang: '', soTaiKhoan: '', chuTaiKhoan: '' });
	const [isChangingAccount, setIsChangingAccount] = useState(false);

	useEffect(() => { loadWalletData(); }, []);

	const loadWalletData = async () => {
		try {
			setLoading(true);
			const res = await axios.get('/api/wallet/my-wallet', { withCredentials: true });
			if (res.data.success) {
				setWalletData(res.data.data);
			}
		} catch (err) {
			setError('Không thể tải thông tin ví. Vui lòng kiểm tra lại kết nối.');
		} finally {
			setLoading(false);
		}
	};

	const handleWithdraw = async (e) => {
		e.preventDefault();
		if (withdrawForm.soTien > walletData.balance) {
			alert('Số dư không đủ!');
			return;
		}
		try {
			setWithdrawLoading(true);
			const res = await axios.post('/api/wallet/withdraw', withdrawForm, { withCredentials: true });
			if (res.data.success) {
				alert('Yêu cầu rút tiền đã được gửi thành công!');
				setShowWithdrawModal(false);
				loadWalletData();
			}
		} catch (err) {
			alert(err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu rút tiền.');
		} finally {
			setWithdrawLoading(false);
		}
	};

	const sortedWithdrawals = [...(walletData.withdrawals || [])].sort(
		(a, b) => new Date(b.NgayYeuCau) - new Date(a.NgayYeuCau)
	);
	const sortedHistory = [...(walletData.history || [])].sort(
		(a, b) => new Date(b.NgayGiaoDich) - new Date(a.NgayGiaoDich)
	);
	const displayedHistory = showAllHistory ? sortedHistory : sortedHistory.slice(0, 10);
	const displayedWithdrawals = showAllWithdrawals ? sortedWithdrawals : sortedWithdrawals.slice(0, 10);

	if (loading) return <div className="text-center py-20"><i className="fas fa-spinner fa-spin text-3xl text-blue-600"></i></div>;

	return (
		<div className="bg-[#F8FAFF] min-h-screen px-4 pt-10 pb-8">
			<div className="container mx-auto max-w-5xl">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
					<div>
						<h1 className="text-xl md:text-3xl font-extrabold text-gray-800 flex items-center gap-2 whitespace-nowrap">
							<i className="fas fa-wallet" style={{ color: '#2563EB' }}></i>
							Quản lý <span style={{ color: '#2563EB' }}>Ví Tiền Chủ Trọ</span>
						</h1>
						<p className="text-sm md:text-base text-gray-500">Quản lý doanh thu và rút tiền cọc</p>
					</div>
					<Link to="/quan-ly-phong" className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 transition whitespace-nowrap">
						<i className="fas fa-arrow-left"></i> Quay lại quản lý
					</Link>
				</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div className="md:col-span-1">
					<div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl mb-6">
						<p className="text-blue-100 text-sm mb-2 opacity-80">Số dư khả dụng</p>
						<h2 className="text-4xl font-extrabold mb-8">
							{new Intl.NumberFormat('vi-VN').format(walletData.balance)} đ
						</h2>
						<button
							onClick={() => {
								setWithdrawForm({
									...withdrawForm,
									tenNganHang: walletData.tenNganHang || '',
									soTaiKhoan: walletData.soTaiKhoan || '',
									chuTaiKhoan: walletData.chuTaiKhoan || ''
								});
								setIsChangingAccount(false);
								setShowWithdrawModal(true);
							}}
							className="w-full bg-white text-blue-700 py-3 rounded-2xl font-bold hover:bg-blue-50 transition shadow-lg"
						>
							Rút tiền về ngân hàng
						</button>
					</div>
					<div className="hidden md:block bg-blue-50 border border-blue-100 rounded-2xl p-6">
						<h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
							<i className="fas fa-info-circle text-blue-500"></i> Thông tin mô hình
						</h3>
						<p className="text-blue-600 text-sm leading-relaxed">
							Tiền cọc của khách thuê sẽ được Admin giữ hộ và cộng vào ví này ngay khi khách chuyển khoản thành công qua SePay.
						</p>
					</div>
				</div>
				<div className="md:col-span-2 space-y-6">
					{/* Tabs */}
					<div className="flex bg-gray-100 p-1.5 rounded-2xl mb-6 max-w-sm shadow-sm">
						<button 
							onClick={() => setActiveSection('history')}
							className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${activeSection === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
						>
							Biến động ví
						</button>
						<button 
							onClick={() => setActiveSection('withdrawals')}
							className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${activeSection === 'withdrawals' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
						>
							Lịch sử rút tiền
						</button>
					</div>

					<div className={`bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden ${activeSection !== 'history' ? 'hidden' : ''}`}>
						<div className="p-6 border-b border-gray-50 flex justify-between items-center">
							<h3 className="font-bold text-gray-800 flex items-center gap-2">
								<i className="fas fa-exchange-alt text-blue-500"></i> Biến động ví
							</h3>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full text-left">
								<thead style={{ background: '#EFF6FF' }} className="text-blue-600 text-xs uppercase">
									<tr>
										<th className="px-6 py-4">Ngày</th>
										<th className="px-6 py-4">Nội dung</th>
										<th className="px-6 py-4 text-right">Số tiền</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-50 text-sm">
									{sortedHistory.length === 0 ? (
										<tr><td colSpan="3" className="px-6 py-8 text-center text-gray-400 italic">Chưa có giao dịch nào</td></tr>
									) : (
										displayedHistory.map(item => (
											<tr key={item.ID_LichSu} className="hover:bg-gray-50 transition">
												<td className="px-3 md:px-6 py-4 text-gray-500 whitespace-nowrap text-xs md:text-sm">
													{new Date(item.NgayGiaoDich).toLocaleDateString('vi-VN')}
												</td>
												<td className="px-3 md:px-6 py-4 font-medium text-gray-700 text-[10px] md:text-sm">{item.NoiDung}</td>
												<td className={`px-3 md:px-6 py-4 text-right font-bold whitespace-nowrap text-xs md:text-sm ${item.LoaiGiaoDich === 'Cộng' ? 'text-green-600' : 'text-red-500'}`}>
													{item.LoaiGiaoDich === 'Cộng' ? '+' : '-'} {new Intl.NumberFormat('vi-VN').format(item.SoTien)} đ
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
						{sortedHistory.length > 10 && (
							<div className="px-6 py-4 border-t border-gray-50 text-center">
								<button
									onClick={() => setShowAllHistory((prev) => !prev)}
									className="text-sm font-semibold text-blue-600 hover:text-blue-700"
								>
									{showAllHistory ? 'Ẩn bớt' : `Xem thêm (${sortedHistory.length - 10} giao dịch)`}
								</button>
							</div>
						)}
					</div>
					<div className={`bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden ${activeSection !== 'withdrawals' ? 'hidden' : ''}`}>
						<div className="p-6 border-b border-gray-50 flex justify-between items-center">
							<h3 className="font-bold text-gray-800 flex items-center gap-2">
								<i className="fas fa-history text-purple-500"></i> Lịch sử rút tiền
							</h3>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full text-left">
								<thead style={{ background: '#F5F3FF' }} className="text-purple-600 text-xs uppercase">
									<tr>
										<th className="px-6 py-4">Ngày</th>
										<th className="px-6 py-4">Ngân hàng</th>
										<th className="px-6 py-4">Số tiền</th>
										<th className="px-6 py-4 text-center">Trạng thái</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-50 text-sm">
									{sortedWithdrawals.length === 0 ? (
										<tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400 italic">Chưa có yêu cầu nào</td></tr>
									) : (
										displayedWithdrawals.map(item => (
											<tr key={item.ID_RutTien} className="hover:bg-gray-50 transition">
												<td className="px-6 py-4 text-gray-500 whitespace-nowrap">
													{new Date(item.NgayYeuCau).toLocaleDateString('vi-VN')}
												</td>
												<td className="px-6 py-4">
													<p className="font-medium text-gray-700">{item.TenNganHang}</p>
													<p className="text-xs text-gray-400">{item.SoTaiKhoan}</p>
												</td>
												<td className="px-6 py-4 font-bold text-gray-800">
													{new Intl.NumberFormat('vi-VN').format(item.SoTien)} đ
												</td>
												<td className="px-6 py-4 text-center">
													<span className={`px-3 py-1 rounded-full text-xs font-bold ${item.TrangThai === 'Đã duyệt' ? 'bg-green-100 text-green-700' : item.TrangThai === 'Từ chối' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
														{item.TrangThai}
													</span>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
						{sortedWithdrawals.length > 10 && (
							<div className="px-6 py-4 border-t border-gray-50 text-center">
								<button
									onClick={() => setShowAllWithdrawals((prev) => !prev)}
									className="text-sm font-semibold text-blue-600 hover:text-blue-700"
								>
									{showAllWithdrawals ? 'Ẩn bớt' : `Xem thêm (${sortedWithdrawals.length - 10} giao dịch)`}
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
			{showWithdrawModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
					<div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl scale-in-center">
						<div className="flex justify-between items-center mb-6">
							<h3 className="text-xl font-bold text-gray-800">Yêu cầu rút tiền</h3>
							<button onClick={() => setShowWithdrawModal(false)} className="text-gray-400 hover:text-gray-600">
								<i className="fas fa-times text-xl"></i>
							</button>
						</div>
						<form onSubmit={handleWithdraw} className="space-y-4">
							<div>
								<label className="block text-xs font-bold text-gray-500 mb-2">Số tiền muốn rút</label>
								<input type="number" name="soTien" value={withdrawForm.soTien} onChange={e => setWithdrawForm({ ...withdrawForm, soTien: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" min="10000" required />
							</div>

							{!isChangingAccount && walletData.soTaiKhoan ? (
								<div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 relative group">
									<div className="flex justify-between items-start mb-2">
										<p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Tài khoản thụ hưởng</p>
										<button 
											type="button"
											onClick={() => setIsChangingAccount(true)}
											className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors bg-white px-2 py-1 rounded-lg shadow-sm border border-blue-100"
										>
											Đổi tài khoản khác
										</button>
									</div>
									<div className="space-y-1">
										<p className="text-sm font-bold text-gray-800">{walletData.tenNganHang}</p>
										<p className="text-lg font-mono font-bold text-blue-700 tracking-tight">{walletData.soTaiKhoan}</p>
										<p className="text-xs font-medium text-gray-500 uppercase">{walletData.chuTaiKhoan}</p>
									</div>
								</div>
							) : (
								<>
									<div>
										<label className="block text-xs font-bold text-gray-500 mb-2">Tên ngân hàng</label>
										<input type="text" name="tenNganHang" list="vietqr-bank-list" value={withdrawForm.tenNganHang} onChange={e => setWithdrawForm({ ...withdrawForm, tenNganHang: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" required />
										<datalist id="vietqr-bank-list">
											{VIETQR_BANKS.map((bank) => (
												<option key={bank.id} value={bank.name} />
											))}
										</datalist>
									</div>
									<div>
										<label className="block text-xs font-bold text-gray-500 mb-2">Số tài khoản</label>
										<input type="text" name="soTaiKhoan" value={withdrawForm.soTaiKhoan} onChange={e => setWithdrawForm({ ...withdrawForm, soTaiKhoan: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" required />
									</div>
									<div>
										<label className="block text-xs font-bold text-gray-500 mb-2">Chủ tài khoản</label>
										<input type="text" name="chuTaiKhoan" value={withdrawForm.chuTaiKhoan} onChange={e => setWithdrawForm({ ...withdrawForm, chuTaiKhoan: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" required />
									</div>
									{walletData.soTaiKhoan && (
										<button 
											type="button" 
											onClick={() => {
												setIsChangingAccount(false);
												setWithdrawForm({
													...withdrawForm,
													tenNganHang: walletData.tenNganHang,
													soTaiKhoan: walletData.soTaiKhoan,
													chuTaiKhoan: walletData.chuTaiKhoan
												});
											}}
											className="text-xs text-blue-600 font-bold hover:underline"
										>
											Quay lại tài khoản đã lưu
										</button>
									)}
								</>
							)}

							<div className="flex gap-3 pt-2">
								<button type="button" onClick={() => setShowWithdrawModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition text-sm">
									Hủy
								</button>
								<button type="submit" disabled={withdrawLoading} className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-200">
									{withdrawLoading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-check-circle"></i> Xác nhận rút</>}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
			</div>
		</div>
	);
}

export default ViTien;
// ...existing code from WalletPage.jsx will be inserted here
