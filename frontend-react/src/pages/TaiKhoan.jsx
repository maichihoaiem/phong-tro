import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BANK_LIST = [
	{ code: 'MB', bin: '970422', name: 'MB Bank' },
	{ code: 'VCB', bin: '970436', name: 'Vietcombank' },
	{ code: 'ICB', bin: '970415', name: 'VietinBank' },
	{ code: 'BIDV', bin: '970418', name: 'BIDV' },
	{ code: 'TCB', bin: '970407', name: 'Techcombank' },
	{ code: 'ACB', bin: '970416', name: 'ACB' },
	{ code: 'VPB', bin: '970432', name: 'VPBank' },
	{ code: 'TPB', bin: '970423', name: 'TPBank' },
	{ code: 'STB', bin: '970403', name: 'Sacombank' },
	{ code: 'HDB', bin: '970437', name: 'HDBank' },
	{ code: 'VBA', bin: '970405', name: 'Agribank' },
	{ code: 'VIB', bin: '970441', name: 'VIB' },
];

function TaiKhoan({ user, onUpdateUser }) {
	const navigate = useNavigate();
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('info');
	const [infoForm, setInfoForm] = useState({ hoTen: '', soDienThoai: '', soTaiKhoan: '', tenNganHang: '', chuTaiKhoan: '' });
	const [infoMsg, setInfoMsg] = useState({ type: '', text: '' });
	const [infoLoading, setInfoLoading] = useState(false);
	const [pwForm, setPwForm] = useState({ matKhauCu: '', matKhauMoi: '', xacNhan: '' });
	const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
	const [pwLoading, setPwLoading] = useState(false);
	const [showPw, setShowPw] = useState(false);

	useEffect(() => {
		if (!user) {
			navigate('/dang-nhap');
			return;
		}
		loadProfile();
	}, [user]);

	const loadProfile = async () => {
		try {
			const res = await axios.get('/api/auth/profile', { withCredentials: true });
			if (res.data.success) {
				setProfile(res.data.data);
				setInfoForm({
					hoTen: res.data.data.HoTen || '',
					soDienThoai: res.data.data.SoDienThoai || '',
					soTaiKhoan: res.data.data.SoTaiKhoan || '',
					tenNganHang: res.data.data.TenNganHang || '',
					chuTaiKhoan: res.data.data.ChuTaiKhoan || ''
				});
			}
		} catch (err) {
			console.error('Loi load profile:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateInfo = async (e) => {
		e.preventDefault();
		setInfoMsg({ type: '', text: '' });
		if (!infoForm.hoTen.trim()) {
			setInfoMsg({ type: 'error', text: 'Họ tên không được để trống!' });
			return;
		}
		setInfoLoading(true);
		try {
			const res = await axios.put('/api/auth/profile', infoForm, { withCredentials: true });
			if (res.data.success) {
				setInfoMsg({ type: 'success', text: 'Cập nhật thông tin thành công!' });
				const u = res.data.user;
				setProfile({ ...profile, HoTen: u.HoTen, SoDienThoai: u.SoDienThoai, SoTaiKhoan: u.SoTaiKhoan, TenNganHang: u.TenNganHang, ChuTaiKhoan: u.ChuTaiKhoan });
				setInfoForm({ hoTen: u.HoTen || '', soDienThoai: u.SoDienThoai || '', soTaiKhoan: u.SoTaiKhoan || '', tenNganHang: u.TenNganHang || '', chuTaiKhoan: u.ChuTaiKhoan || '' });
				if (onUpdateUser) onUpdateUser({ ...user, HoTen: u.HoTen });
			}
		} catch (err) {
			setInfoMsg({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra!' });
		} finally {
			setInfoLoading(false);
		}
	};

	const handleChangePassword = async (e) => {
		e.preventDefault();
		setPwMsg({ type: '', text: '' });
		if (!pwForm.matKhauCu || !pwForm.matKhauMoi) {
			setPwMsg({ type: 'error', text: 'Vui lòng nhập đầy đủ mật khẩu!' });
			return;
		}
		if (pwForm.matKhauMoi.length < 6) {
			setPwMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
			return;
		}
		if (pwForm.matKhauMoi !== pwForm.xacNhan) {
			setPwMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
			return;
		}
		setPwLoading(true);
		try {
			const res = await axios.put('/api/auth/change-password', {
				matKhauCu: pwForm.matKhauCu,
				matKhauMoi: pwForm.matKhauMoi
			}, { withCredentials: true });
			if (res.data.success) {
				setPwMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
				setPwForm({ matKhauCu: '', matKhauMoi: '', xacNhan: '' });
			}
		} catch (err) {
			setPwMsg({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra!' });
		} finally {
			setPwLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-[60vh] flex items-center justify-center">
				<i className="fas fa-spinner fa-spin text-blue-600 text-3xl"></i>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
				<i className="fas fa-user-cog text-blue-500"></i> Tài khoản của tôi
			</h1>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-1">
					<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
						<div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
							<i className="fas fa-user text-white text-3xl"></i>
						</div>
						<h2 className="text-lg font-bold text-gray-800">{profile?.HoTen}</h2>
						<p className="text-gray-400 text-sm mt-1">{profile?.Email}</p>
						<span className="inline-block mt-3 text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-semibold">
							{profile?.TenVaiTro}
						</span>
						<div className="mt-6 border-t border-gray-100 pt-4 space-y-3 text-left">
							<div className="flex items-center gap-3 text-sm text-gray-500">
								<i className="fas fa-phone text-blue-400 w-4"></i>
								<span>{profile?.SoDienThoai || 'Chưa cập nhật'}</span>
							</div>
							<div className="flex items-center gap-3 text-sm text-gray-500">
								<i className="fas fa-calendar text-blue-400 w-4"></i>
								<span>Tham gia: {profile?.NgayTao ? new Date(profile.NgayTao).toLocaleDateString('vi-VN') : 'N/A'}</span>
							</div>
						</div>
					</div>
				</div>
				<div className="lg:col-span-2">
					<div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
						<button
							onClick={() => setActiveTab('info')}
							className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'info'
								? 'bg-white text-blue-600 shadow-sm'
								: 'text-gray-500 hover:text-gray-700'
								}`}
						>
							<i className="fas fa-user-edit mr-2"></i>Thông tin cá nhân
						</button>
						<button
							onClick={() => setActiveTab('password')}
							className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'password'
								? 'bg-white text-blue-600 shadow-sm'
								: 'text-gray-500 hover:text-gray-700'
								}`}
						>
							<i className="fas fa-key mr-2"></i>Đổi mật khẩu
						</button>
					</div>
					{activeTab === 'info' && (
						<form onSubmit={handleUpdateInfo} className="space-y-6">
							<div>
								<label className="block text-xs font-bold text-gray-500 mb-2">Họ và tên</label>
								<input type="text" name="hoTen" value={infoForm.hoTen} onChange={e => setInfoForm({ ...infoForm, hoTen: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" />
							</div>
							<div>
								<label className="block text-xs font-bold text-gray-500 mb-2">Số điện thoại</label>
								<input type="text" name="soDienThoai" value={infoForm.soDienThoai} onChange={e => setInfoForm({ ...infoForm, soDienThoai: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" />
							</div>
							<div>
								<label className="block text-xs font-bold text-gray-500 mb-2">Số tài khoản</label>
								<input type="text" name="soTaiKhoan" value={infoForm.soTaiKhoan} onChange={e => setInfoForm({ ...infoForm, soTaiKhoan: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" />
							</div>
							<div>
								<label className="block text-xs font-bold text-gray-500 mb-2">Tên ngân hàng</label>
								<input type="text" name="tenNganHang" value={infoForm.tenNganHang} onChange={e => setInfoForm({ ...infoForm, tenNganHang: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" />
							</div>
							<div>
								<label className="block text-xs font-bold text-gray-500 mb-2">Chủ tài khoản</label>
								<input type="text" name="chuTaiKhoan" value={infoForm.chuTaiKhoan} onChange={e => setInfoForm({ ...infoForm, chuTaiKhoan: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" />
							</div>
							{infoMsg.text && (
								<div className={`p-3 rounded-xl text-sm font-bold ${infoMsg.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>{infoMsg.text}</div>
							)}
							<button type="submit" disabled={infoLoading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
								{infoLoading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-save"></i> Lưu thay đổi</>}
							</button>
						</form>
					)}
					{activeTab === 'password' && (
						<form onSubmit={handleChangePassword} className="space-y-6">
							<div>
								<label className="block text-xs font-bold text-gray-500 mb-2">Mật khẩu cũ</label>
								<input type={showPw ? 'text' : 'password'} name="matKhauCu" value={pwForm.matKhauCu} onChange={e => setPwForm({ ...pwForm, matKhauCu: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" />
							</div>
							<div>
								<label className="block text-xs font-bold text-gray-500 mb-2">Mật khẩu mới</label>
								<input type={showPw ? 'text' : 'password'} name="matKhauMoi" value={pwForm.matKhauMoi} onChange={e => setPwForm({ ...pwForm, matKhauMoi: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" />
							</div>
							<div>
								<label className="block text-xs font-bold text-gray-500 mb-2">Xác nhận mật khẩu</label>
								<input type={showPw ? 'text' : 'password'} name="xacNhan" value={pwForm.xacNhan} onChange={e => setPwForm({ ...pwForm, xacNhan: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" />
							</div>
							<div className="flex items-center gap-2">
								<input type="checkbox" checked={showPw} onChange={() => setShowPw(!showPw)} id="showPw" />
								<label htmlFor="showPw" className="text-xs text-gray-500">Hiện mật khẩu</label>
							</div>
							{pwMsg.text && (
								<div className={`p-3 rounded-xl text-sm font-bold ${pwMsg.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>{pwMsg.text}</div>
							)}
							<button type="submit" disabled={pwLoading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
								{pwLoading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-key"></i> Đổi mật khẩu</>}
							</button>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}

export default TaiKhoan;
// ...existing code from ProfilePage.jsx will be inserted here
