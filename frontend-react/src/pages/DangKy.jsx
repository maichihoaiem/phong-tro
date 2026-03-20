import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function DangKy({ onLogin }) {
	const navigate = useNavigate();
	const [form, setForm] = useState({ hoTen: '', email: '', matKhau: '', xacNhanMatKhau: '', soDienThoai: '', vaiTro: 'nguoithue' });
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [focusedField, setFocusedField] = useState(null);

	const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

	const handleSubmit = async (e) => {
		e.preventDefault(); setError('');
		if (!form.hoTen?.trim() || !form.email?.trim() || !form.matKhau?.trim() || !form.soDienThoai?.trim()) { 
			setError('Vui lòng nhập đầy đủ tất cả các thông tin yêu cầu!'); 
			return; 
		}
		if (form.matKhau.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự!'); return; }
		if (form.matKhau !== form.xacNhanMatKhau) { setError('Mật khẩu xác nhận không khớp!'); return; }
		setLoading(true);
		try {
			const res = await axios.post('/api/auth/register', { hoTen: form.hoTen, email: form.email, matKhau: form.matKhau, soDienThoai: form.soDienThoai, vaiTro: form.vaiTro }, { withCredentials: true });
			if (res.data.success) { if (onLogin) onLogin(res.data.user); navigate('/'); }
		} catch (err) { setError(err.response?.data?.message || 'Đăng ký thất bại!'); }
		finally { setLoading(false); }
	};

	const inputStyle = (name) => ({
		width: '100%', padding: '11px 16px 11px 40px',
		background: focusedField === name ? 'var(--primary-50)' : 'var(--surface-alt)',
		border: `1.5px solid ${focusedField === name ? '#2563EB' : '#DBEAFE'}`,
		borderRadius: 11, outline: 'none', fontFamily: 'inherit',
		fontSize: '0.88rem', color: '#0F1C3F', transition: 'all 0.2s',
		boxShadow: focusedField === name ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none',
	});

	const fields = [
		{ name: 'hoTen', type: 'text', label: 'Họ và tên *', icon: 'fa-user', placeholder: 'Nhập họ và tên' },
		{ name: 'email', type: 'email', label: 'Email *', icon: 'fa-envelope', placeholder: 'your@email.com' },
		{ name: 'soDienThoai', type: 'tel', label: 'Số điện thoại *', icon: 'fa-phone', placeholder: 'Nhập số điện thoại' },
	];

	return (
		<div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 1.5rem', background: 'var(--bg)' }}>
			<div style={{ width: '100%', maxWidth: 920, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, background: 'white', borderRadius: 26, overflow: 'hidden', border: '1px solid #E2EAF4', boxShadow: '0 16px 60px rgba(37,99,235,0.1)' }} className="register-grid">
				{/* Left illustration panel */}
				<div style={{
					background: 'linear-gradient(160deg, #1D4ED8 0%, #2563EB 50%, #0EA5E9 100%)',
					padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
					position: 'relative', overflow: 'hidden',
				}}>
					<div style={{ position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }}></div>
					<div style={{ position: 'absolute', bottom: -60, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }}></div>

					<div style={{ position: 'relative' }}>
						<Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 40 }}>
							<div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14 }}>
								<i className="fas fa-home"></i>
							</div>
							<span style={{ fontWeight: 900, color: 'white', fontSize: '1rem' }}>OZIC HOUSE</span>
						</Link>

						<h2 style={{ fontWeight: 900, fontSize: '1.7rem', color: 'white', lineHeight: 1.2, marginBottom: 14, letterSpacing: '-0.4px' }}>
							Bắt đầu hành trình<br />tìm phòng lý tưởng
						</h2>
						<p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', lineHeight: 1.7 }}>
							Tạo tài khoản miễn phí và trải nghiệm nền tảng tìm phòng thông minh nhất.
						</p>
					</div>

					<div style={{ position: 'relative' }}>
						{[{ icon: 'fa-check-circle', label: 'Đăng ký miễn phí' }, { icon: 'fa-shield-alt', label: 'Thông tin bảo mật 100%' }, { icon: 'fa-bolt', label: 'Tìm kiếm nhanh chóng' }].map((item, i) => (
							<div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
								<div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
									<i className={`fas ${item.icon}`} style={{ color: 'white', fontSize: '0.7rem' }}></i>
								</div>
								<span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.83rem', fontWeight: 600 }}>{item.label}</span>
							</div>
						))}
					</div>
				</div>

				{/* Right form */}
				<div style={{ padding: '40px 40px', overflowY: 'auto' }}>
					<h1 style={{ fontWeight: 900, fontSize: '1.45rem', marginBottom: 4, letterSpacing: '-0.3px', color: '#0F1C3F' }}>Tạo tài khoản</h1>
					<p style={{ fontSize: '0.82rem', color: '#9CA3AF', marginBottom: 22 }}>Chỉ mất 2 phút để hoàn thành!</p>

					{error && (
						<div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', marginBottom: 18, borderRadius: 11, background: '#FFF2F2', border: '1px solid #FCA5A5', color: '#DC2626', fontSize: '0.82rem', fontWeight: 600 }}>
							<i className="fas fa-exclamation-circle" style={{ flexShrink: 0 }}></i>{error}
						</div>
					)}

					<form onSubmit={handleSubmit}>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
							{fields.map(f => (
								<div key={f.name}>
									<label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#374151', marginBottom: 7 }}>{f.label}</label>
									<div style={{ position: 'relative' }}>
										<i className={`fas ${f.icon}`} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: focusedField === f.name ? '#2563EB' : '#9CA3AF', fontSize: '0.78rem', transition: 'color 0.2s' }}></i>
										<input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder}
											onFocus={() => setFocusedField(f.name)} onBlur={() => setFocusedField(null)}
											required
											style={inputStyle(f.name)} />
									</div>
								</div>
							))}

							{/* Password fields */}
							{[{ name: 'matKhau', label: 'Mật khẩu *', placeholder: 'Tối thiểu 6 ký tự' }, { name: 'xacNhanMatKhau', label: 'Xác nhận mật khẩu *', placeholder: 'Nhập lại mật khẩu' }].map(f => (
								<div key={f.name}>
									<label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#374151', marginBottom: 7 }}>{f.label}</label>
									<div style={{ position: 'relative' }}>
										<i className="fas fa-lock" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: focusedField === f.name ? '#2563EB' : '#9CA3AF', fontSize: '0.78rem', transition: 'color 0.2s' }}></i>
										<input type={showPassword ? 'text' : 'password'} name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder}
											onFocus={() => setFocusedField(f.name)} onBlur={() => setFocusedField(null)}
											required
											style={{ ...inputStyle(f.name), paddingRight: 40 }} />
										{f.name === 'matKhau' && (
											<button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '0.8rem', padding: 3 }}>
												<i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
											</button>
										)}
									</div>
								</div>
							))}

							{/* Role */}
							<div>
								<label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#374151', marginBottom: 10 }}>Bạn là?</label>
								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
									{[{ val: 'nguoithue', icon: 'fa-user', label: 'Người thuê' }, { val: 'chutro', icon: 'fa-home', label: 'Chủ trọ' }].map(opt => (
										<label key={opt.val} style={{
											display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
											padding: '11px', borderRadius: 11, cursor: 'pointer',
											border: `1.5px solid ${form.vaiTro === opt.val ? '#2563EB' : '#E2EAF4'}`,
											background: form.vaiTro === opt.val ? '#EFF6FF' : '#F8FAFF',
											color: form.vaiTro === opt.val ? '#2563EB' : '#6B7280',
											fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s',
										}}>
											<input type="radio" name="vaiTro" value={opt.val} checked={form.vaiTro === opt.val} onChange={handleChange} style={{ display: 'none' }} />
											<i className={`fas ${opt.icon}`} style={{ fontSize: '0.78rem' }}></i> {opt.label}
										</label>
									))}
								</div>
							</div>
						</div>

						<button type="submit" disabled={loading} style={{
							width: '100%', padding: '13px', marginTop: 20,
							background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
							color: 'white', border: 'none', borderRadius: 12,
							fontFamily: 'inherit', fontWeight: 800, fontSize: '0.93rem',
							cursor: loading ? 'wait' : 'pointer', transition: 'all 0.22s',
							display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
							opacity: loading ? 0.7 : 1, boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
						}}>
							{loading ? <><i className="fas fa-spinner spin"></i> Đang xử lý...</> : <><i className="fas fa-user-plus"></i> Tạo tài khoản</>}
						</button>
					</form>

					<p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.8rem', color: '#9CA3AF' }}>
						Đã có tài khoản?{' '}
						<Link to="/dang-nhap" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>Đăng nhập</Link>
					</p>
				</div>
			</div>

			<style>{`
				@media (max-width: 700px) {
					.register-grid { grid-template-columns: 1fr !important; }
					.register-grid > div:first-child { display: none !important; }
				}
			`}</style>
		</div>
	);
}

export default DangKy;
// ...existing code from RegisterPage.jsx will be inserted here
