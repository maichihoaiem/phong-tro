import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminViChuTro() {
	const [landlords, setLandlords] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		loadLandlords();
	}, []);

	const loadLandlords = async () => {
		try {
			const res = await axios.get('/api/wallet/admin/landlords-wallets', { withCredentials: true });
			if (res.data.success) {
				setLandlords(res.data.data);
			}
		} catch (err) {
			console.error(err);
			if (err.response && err.response.status === 403) {
				navigate('/');
			} else {
				setError('Không thể tải danh sách ví chủ trọ.');
			}
		} finally {
			setLoading(false);
		}
	};

	if (loading) return <div className="text-center py-20"><i className="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div>;
	if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

	const totalHeld = landlords.reduce((sum, l) => sum + (l.SoDu || 0), 0);

	return (
		<div className="container mx-auto max-w-6xl px-4 py-8">
			<h1 className="text-3xl font-extrabold text-gray-800 mb-2 flex items-center gap-2">
				<i className="fas fa-piggy-bank" style={{ color: '#4F46E5' }}></i>
				Quản lý <span style={{ color: '#4F46E5' }}>Ví Chủ Trọ</span>
			</h1>
			<p className="text-gray-500 mb-8">Danh sách tất cả cọc của chủ trọ đang được hệ thống giữ hộ</p>

			<div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 shadow-lg flex items-center gap-4 text-white mb-8">
				<div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
					<i className="fas fa-piggy-bank text-3xl text-white"></i>
				</div>
				<div>
					<p className="text-indigo-100 text-sm font-semibold uppercase">Tổng số dư đang giữ hộ</p>
					<p className="text-4xl font-bold">{new Intl.NumberFormat('vi-VN').format(totalHeld)} đ</p>
				</div>
			</div>

			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr style={{ background: '#F5F3FF' }} className="text-indigo-700 text-sm border-b border-indigo-100">
								<th className="p-4 font-semibold">ID</th>
								<th className="p-4 font-semibold">Tên Chủ Trọ</th>
								<th className="p-4 font-semibold">SĐT / Email</th>
								<th className="p-4 font-semibold text-right">Số Dư (VNĐ)</th>
								<th className="p-4 font-semibold">Thông tin Ngân hàng</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{landlords.length === 0 ? (
								<tr>
									<td colSpan="5" className="p-8 text-center text-gray-500">Hệ thống chưa có chủ trọ nào.</td>
								</tr>
							) : landlords.map(l => (
								<tr key={l.ID_TaiKhoan} className="hover:bg-gray-50 transition-colors">
									<td className="p-4 text-sm font-medium text-gray-900">#{l.ID_TaiKhoan}</td>
									<td className="p-4">
										<p className="text-sm font-bold text-gray-800">{l.HoTen}</p>
									</td>
									<td className="p-4">
										<p className="text-sm text-gray-700">{l.SoDienThoai}</p>
										<p className="text-xs text-gray-500">{l.Email}</p>
									</td>
									<td className="p-4 text-right">
										<span className="text-base font-bold text-indigo-600">
											{new Intl.NumberFormat('vi-VN').format(l.SoDu)} đ
										</span>
									</td>
									<td className="p-4">
										{l.SoTaiKhoan ? (
											<div>
												<p className="text-sm font-bold text-blue-800">{l.TenNganHang}</p>
												<p className="text-sm font-mono text-gray-700">{l.SoTaiKhoan}</p>
												<p className="text-xs text-gray-500">{l.ChuTaiKhoan}</p>
											</div>
										) : (
											<span className="text-xs text-gray-400 italic">Chưa cập nhật</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

export default AdminViChuTro;
// ...existing code from admin/AdminUsersWallets.jsx will be inserted here
