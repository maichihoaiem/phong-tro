import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/forgot-password', { email });
            if (res.data.success) {
                setMessage({ type: 'success', text: res.data.message });
                setStep(2);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại sau!' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/verify-otp', { email, otp });
            if (res.data.success) {
                setMessage({ type: 'success', text: 'Xác thực mã OTP thành công!' });
                setStep(3);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn!' });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Mật khẩu xác nhận không trùng khớp!' });
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/reset-password', { email, otp, matKhauMoi: newPassword });
            if (res.data.success) {
                alert('Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.');
                navigate('/dang-nhap');
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Đặt lại mật khẩu thất bại!' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-20 flex justify-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 text-2xl shadow-sm">
                        <i className={step === 1 ? "fas fa-envelope-open-text" : step === 2 ? "fas fa-key" : "fas fa-user-shield"}></i>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">Quên mật khẩu?</h2>
                    <p className="text-gray-500 text-sm mt-2">
                        {step === 1 && "Nhập email của bạn để nhận mã xác thực OTP."}
                        {step === 2 && `Chúng tôi đã gửi mã xác thực đến ${email}`}
                        {step === 3 && "Thiết lập mật khẩu mới cho tài khoản của bạn."}
                    </p>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-xl text-sm font-bold mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                        {message.text}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email tài khoản</label>
                            <div className="relative">
                                <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                                <input 
                                    type="email" required
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                                    placeholder="your-email@example.com"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <button 
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <i className="fas fa-spinner fa-spin"></i> : "Gửi mã xác thực"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyEmail} className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mã OTP (6 chữ số)</label>
                            <div className="relative">
                                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                                <input 
                                    type="text" required maxLength="6"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-black text-center text-xl tracking-[10px]"
                                    placeholder="000000"
                                    value={otp} onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                        </div>
                        <button 
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <i className="fas fa-spinner fa-spin"></i> : "Xác nhận mã"}
                        </button>
                        <p className="text-center text-xs text-gray-400">
                            Không nhận được mã? <button type="button" onClick={() => setStep(1)} className="text-blue-600 font-bold hover:underline">Gửi lại</button>
                        </p>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mật khẩu mới</label>
                            <div className="relative">
                                <i className="fas fa-shield-alt absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                                <input 
                                    type="password" required minLength="6"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                                    placeholder="••••••••"
                                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Xác nhận mật khẩu</label>
                            <div className="relative">
                                <i className="fas fa-check-double absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                                <input 
                                    type="password" required
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                                    placeholder="••••••••"
                                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <button 
                            disabled={loading}
                            className="w-full bg-green-600 text-white font-black py-4 rounded-2xl hover:bg-green-700 transition shadow-lg shadow-green-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <i className="fas fa-spinner fa-spin"></i> : "Đổi mật khẩu & Đăng nhập"}
                        </button>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                    <Link to="/dang-nhap" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition flex items-center justify-center gap-2">
                        <i className="fas fa-arrow-left text-xs"></i> Quay lại Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
