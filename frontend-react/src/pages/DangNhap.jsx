import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function DangNhap({ onLogin }) {
	const navigate = useNavigate();
	const [form, setForm] = useState({ email: '', matKhau: '' });
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [focusedField, setFocusedField] = useState(null);
	const [lockedInfo, setLockedInfo] = useState(null); // { message, reason }

	const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

	const handleSubmit = async (e) => {
		e.preventDefault(); setError('');
		if (!form.email || !form.matKhau) { setError('Vui lòng nhập đầy đủ email và mật khẩu!'); return; }
		setLoading(true);
		try {
			const res = await axios.post('/api/auth/login', form, { withCredentials: true });
			if (res.data.success) { if (onLogin) onLogin(res.data.user); navigate('/'); }
		} catch (err) {
			if (err.response?.status === 403) {
				setLockedInfo({
					message: err.response?.data?.message || 'Tài khoản đã bị khóa!',
					reason: err.response?.data?.reason || ''
				});
			} else {
				setError(err.response?.data?.message || 'Đăng nhập thất bại!');
			}
		}
		finally { setLoading(false); }
	};

	const inputStyle = (name) => ({
		width: '100%', padding: '13px 16px 13px 42px',
		background: focusedField === name ? 'var(--primary-50)' : 'var(--surface-alt)',
		border: `1.5px solid ${focusedField === name ? '#2563EB' : '#DBEAFE'}`,
		borderRadius: 12, outline: 'none', fontFamily: 'inherit',
		fontSize: '0.9rem', color: '#0F1C3F', transition: 'all 0.2s',
		boxShadow: focusedField === name ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none',
	});

	return (
		<div style={{ minHeight: '80vh', display: 'flex', overflow: 'hidden' }}>
			{/* Left side decoration */}
			<div style={{
				flex: '0 0 45%', display: 'none',
				background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #0EA5E9 100%)',
				position: 'relative', overflow: 'hidden',
			}} className="login-left">
				<div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }}></div>
				<div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
				<div style={{ position: 'relative', padding: '80px 48px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
					<div style={{ marginBottom: 40 }}>
						<div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.4rem', marginBottom: 28 }}>
							<i className="fas fa-home"></i>
						</div>
						<h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', lineHeight: 1.2, marginBottom: 14, letterSpacing: '-0.5px' }}>
							Tìm phòng<br />lý tưởng ngay
						</h1>
						<p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', lineHeight: 1.7 }}>
							Hàng ngàn phòng trọ đã kiểm duyệt đang chờ bạn khám phá.
						</p>
					</div>
					{[{ num: '2.4K+', label: 'Phòng đăng ký' }, { num: '50K+', label: 'Người dùng' }, { num: '98%', label: 'Hài lòng' }].map((s, i) => (
						<div key={i} style={{ padding: '14px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.12)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>{s.label}</span>
							<span style={{ fontWeight: 900, color: 'white', fontSize: '1.2rem' }}>{s.num}</span>
						</div>
					))}
				</div>
			</div>

			{/* Right: Form */}
			<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 1.5rem', background: 'var(--bg)' }}>
				<div style={{ width: '100%', maxWidth: 420 }}>
					{/* Logo */}
					<Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 32 }}>
						<div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 15, boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
							<i className="fas fa-home"></i>
						</div>
						<span style={{ fontWeight: 900, fontSize: '1.1rem' }}><span style={{ color: '#0F1C3F' }}>OZIC </span><span style={{ color: '#2563EB' }}>HOUSE</span></span>
					</Link>

					<h1 style={{ fontWeight: 900, fontSize: '1.65rem', marginBottom: 6, letterSpacing: '-0.4px', color: '#0F1C3F' }}>Chào mừng trở lại 👋</h1>
					<p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginBottom: 28 }}>Đăng nhập để tiếp tục sử dụng dịch vụ</p>

					{/* Card */}
					<div style={{ background: 'white', borderRadius: 22, padding: '32px', border: '1px solid #E2EAF4', boxShadow: '0 8px 32px rgba(37,99,235,0.08)' }}>
						{error && (
							<div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', marginBottom: 20, borderRadius: 11, background: '#FFF2F2', border: '1px solid #FCA5A5', color: '#DC2626', fontSize: '0.83rem', fontWeight: 600 }}>
								<i className="fas fa-exclamation-circle"></i>{error}
							</div>
						)}

						<form onSubmit={handleSubmit}>
							{/* Email */}
							<div style={{ marginBottom: 16 }}>
								<label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#374151', marginBottom: 8 }}>Email</label>
								<div style={{ position: 'relative' }}>
									<i className="fas fa-envelope" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focusedField === 'email' ? '#2563EB' : '#9CA3AF', fontSize: '0.82rem', transition: 'color 0.2s' }}></i>
									<input type="email" name="email" value={form.email} onChange={handleChange} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} placeholder="your@email.com" style={inputStyle('email')} />
								</div>
							</div>

							{/* Password */}
							<div style={{ marginBottom: 24 }}>
								<label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#374151', marginBottom: 8 }}>Mật khẩu</label>
								<div style={{ position: 'relative' }}>
									<i className="fas fa-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focusedField === 'matKhau' ? '#2563EB' : '#9CA3AF', fontSize: '0.82rem', transition: 'color 0.2s' }}></i>
									<input type={showPassword ? 'text' : 'password'} name="matKhau" value={form.matKhau} onChange={handleChange} onFocus={() => setFocusedField('matKhau')} onBlur={() => setFocusedField(null)} placeholder="••••••••" style={{ ...inputStyle('matKhau'), paddingRight: 46 }} />
									<button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '0.85rem', padding: 4 }}>
										<i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
									</button>
								</div>
							</div>

							<button type="submit" disabled={loading} style={{
								width: '100%', padding: '14px',
								background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
								color: 'white', border: 'none', borderRadius: 12,
								fontFamily: 'inherit', fontWeight: 800, fontSize: '0.95rem',
								cursor: loading ? 'wait' : 'pointer', transition: 'all 0.22s',
								display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
								opacity: loading ? 0.75 : 1, boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
							}}>
								{loading ? <><i className="fas fa-spinner spin"></i> Đang xử lý...</> : <><i className="fas fa-sign-in-alt"></i> Đăng nhập</>}
							</button>
						</form>
					</div>

					<div style={{ textAlign: 'center', marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
						<Link to="/quen-mat-khau" style={{ color: '#9CA3AF', fontSize: '0.83rem', fontWeight: 600, textDecoration: 'none' }} onMouseEnter={e => e.target.style.color = '#2563EB'} onMouseLeave={e => e.target.style.color = '#9CA3AF'}>Quên mật khẩu?</Link>
						<p style={{ fontSize: '0.83rem', color: '#9CA3AF' }}>
							Chưa có tài khoản?{' '}
							<Link to="/dang-ky" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>Đăng ký ngay</Link>
						</p>
					</div>
				</div>
			</div>

			{/* Modal: Tài khoản bị khóa */}
			{lockedInfo && (
				<div style={{
					position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
					zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
				}} onClick={() => setLockedInfo(null)}>
					<div style={{
						background: 'white', borderRadius: 24, width: '100%', maxWidth: 420,
						boxShadow: '0 25px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
						animation: 'fade-up 0.3s cubic-bezier(0.16,1,0.3,1)'
					}} onClick={e => e.stopPropagation()}>
						{/* Header */}
						<div style={{
							background: 'linear-gradient(135deg, #EF4444, #DC2626)',
							padding: '32px 32px 40px', textAlign: 'center', color: 'white'
						}}>
							<div style={{
								width: 64, height: 64, borderRadius: 18,
								background: 'rgba(255,255,255,0.2)', display: 'flex',
								alignItems: 'center', justifyContent: 'center',
								margin: '0 auto 12px', fontSize: '1.6rem',
								border: '2px solid rgba(255,255,255,0.3)',
								backdropFilter: 'blur(4px)'
							}}>
								<i className="fas fa-lock"></i>
							</div>
							<h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: 4 }}>Tài khoản đã bị khóa</h3>
							<p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>Bạn không thể đăng nhập vào lúc này</p>
						</div>

						{/* Body */}
						<div style={{ padding: '24px 32px 32px', marginTop: -16 }}>
							{/* Lý do khóa */}
							{lockedInfo.reason && (
								<div style={{
									background: '#FEF2F2', border: '1px solid #FECACA',
									borderRadius: 16, padding: '16px 20px', marginBottom: 20
								}}>
									<p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
										<i className="fas fa-exclamation-triangle" style={{ marginRight: 6 }}></i>Lý do khóa
									</p>
									<p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#991B1B', lineHeight: 1.6 }}>
										{lockedInfo.reason}
									</p>
								</div>
							)}

							{/* Contact Info */}
							<div style={{
								background: '#F0F9FF', border: '1px solid #BAE6FD',
								borderRadius: 16, padding: '20px', textAlign: 'center'
							}}>
								<p style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500, marginBottom: 12, lineHeight: 1.7 }}>
									Muốn biết thêm thông tin, xin liên hệ:
								</p>
								<a href="mailto:ozic2664@gmail.com" style={{
									display: 'inline-flex', alignItems: 'center', gap: 8,
									background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
									color: 'white', padding: '12px 24px', borderRadius: 14,
									fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none',
									boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
									transition: 'all 0.2s'
								}}>
									<i className="fas fa-envelope"></i> ozic2664@gmail.com
								</a>
							</div>

							{/* Close Button */}
							<button
								onClick={() => setLockedInfo(null)}
								style={{
									width: '100%', padding: '14px', marginTop: 20,
									background: '#F1F5F9', border: 'none', borderRadius: 14,
									fontWeight: 700, fontSize: '0.9rem', color: '#64748B',
									cursor: 'pointer', fontFamily: 'inherit',
									transition: 'all 0.2s'
								}}
								onMouseEnter={e => e.target.style.background = '#E2E8F0'}
								onMouseLeave={e => e.target.style.background = '#F1F5F9'}
							>
								Đã hiểu
							</button>
						</div>
					</div>
				</div>
			)}

			<style>{`
				@media (min-width: 900px) { .login-left { display: flex !important; } }
			`}</style>
		</div>
	);
}

export default DangNhap;
// ...existing code from LoginPage.jsx will be inserted here
