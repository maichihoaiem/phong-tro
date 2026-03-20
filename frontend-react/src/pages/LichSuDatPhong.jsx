import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { VIETQR_BANKS } from '../data/banks';

function BookingHistoryPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBookings();
    }, []);

    const [refundForms, setRefundForms] = useState({}); // { idDatPhong: { stk, nganHang, chuTk } }

    const loadBookings = async () => {
        try {
            const res = await axios.get('/api/dat-phong/my-bookings', { withCredentials: true });
            if (res.data.success) {
                console.log("MY BOOKINGS DATA:", res.data.data);
                if (res.data.data.length > 0) {
                    console.log("KEYS FOR FIRST BOOKING:", Object.keys(res.data.data[0]));
                }
                setBookings(res.data.data);
                // Reset refund forms
                const initialForms = {};
                res.data.data.forEach(b => {
                    const id = b.ID_DatPhong || b.id_datphong || b.ID_DATPHONG;
                    if ((b.TrangThaiThanhToan || '').includes('Chờ hoàn tiền') && !b.STK_NguoiThue) {
                        initialForms[id] = { stk: '', nganHang: '', chuTk: '' };
                    }
                });
                setRefundForms(initialForms);
            }
        } catch (err) {
            console.error('Loi load dat phong:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProvideRefundInfo = async (idDatPhong) => {
        console.log("SUBMITTING REFUND FOR ID:", idDatPhong);
        const form = refundForms[idDatPhong];
        if (!form || !form.stk?.trim() || !form.nganHang?.trim() || !form.chuTk?.trim()) {
            alert("Vui lòng nhập đầy đủ thông tin ngân hàng!");
            return;
        }

        try {
            const res = await axios.put(`/api/dat-phong/${idDatPhong}/refund-info`, form, { withCredentials: true });
            if (res.data.success) {
                alert(res.data.message);
                loadBookings();
                window.dispatchEvent(new Event('ozic:notifications-refresh'));
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
            alert("Lỗi khi gửi thông tin: " + errorMsg);
            console.error("DEBUG REFUND ERROR:", err.response?.data);
        }
    };


    const getStatusBadge = (status, paymentStatus) => {
        let statusEl;
        const s = (status || 'Chờ duyệt').trim();
        if (s === 'Đã duyệt' || s === 'Đã đặt' || s === 'Da duyet') {
            statusEl = <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold"><i className="fas fa-check-circle mr-1"></i>Đã duyệt</span>;
        } else if (s === 'Từ chối' || s === 'Tu choi') {
            statusEl = <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold"><i className="fas fa-times-circle mr-1"></i>Từ chối</span>;
        } else {
            statusEl = <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold"><i className="fas fa-clock mr-1"></i>Chờ duyệt</span>;
        }

        let paymentEl;
        const ps = (paymentStatus || '').trim();
        if (ps === 'Đã thanh toán') {
            paymentEl = <span className="ml-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold"><i className="fas fa-dollar-sign mr-1"></i>Đã thanh toán</span>;
        } else if (ps.includes('Chờ hoàn tiền')) {
            paymentEl = <span className="ml-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold"><i className="fas fa-undo mr-1"></i>Chờ hoàn tiền</span>;
        } else if (ps === 'Đã hoàn tiền') {
            paymentEl = <span className="ml-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold"><i className="fas fa-check-circle mr-1"></i>Đã hoàn tiền</span>;
        } else {
            paymentEl = <span className="ml-2 bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-semibold">Chưa thanh toán</span>;
        }

        return <div className="flex gap-1">{statusEl}{paymentEl}</div>;
    };

    const getImageUrl = (anhPath) => {
        if (!anhPath) return null;
        if (anhPath.startsWith('http')) return anhPath;
        if (anhPath.startsWith('/uploads/')) return `${anhPath}`;
        const fileName = anhPath.split(/[\\/]/).pop().replace(/^"|"$/g, '');
        return `/uploads/${fileName}`;
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <i className="fas fa-spinner fa-spin text-blue-600 text-3xl"></i>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-5xl px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <i className="fas fa-calendar-check text-blue-500"></i> Lịch sử đặt phòng
                <span className="text-sm font-normal text-gray-400 ml-2">({bookings.length} yêu cầu)</span>
            </h1>

            {bookings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <i className="fas fa-calendar text-gray-200 text-6xl mb-4"></i>
                    <h2 className="text-xl font-bold text-gray-500 mb-2">Chưa có lịch sử đặt phòng</h2>
                    <p className="text-gray-400 text-sm mb-6">Hãy tìm và đặt phòng phù hợp với bạn!</p>
                    <Link to="/tim-phong" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition text-sm inline-flex items-center gap-2">
                        <i className="fas fa-search"></i> Tìm phòng ngay
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map(booking => (
                        <div key={booking.ID_DatPhong} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                            <div className="flex flex-col sm:flex-row">
                                {/* Ảnh */}
                                <div className="w-full sm:w-48 h-48 sm:h-40 flex-shrink-0 bg-gray-100">
                                    {booking.AnhPhong ? (
                                        <img
                                            src={getImageUrl(booking.AnhPhong)}
                                            className="w-full h-full object-cover"
                                            alt={booking.TieuDe}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-blue-50">
                                            <i className="fas fa-camera text-2xl"></i>
                                        </div>
                                    )}
                                </div>

                                {/* Thông tin */}
                                <div className="flex-1 p-5">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-2">
                                        <div>
                                            <Link to={`/phong-tro/${booking.ID_Phong || booking.id_phong}`} className="font-bold text-lg text-gray-800 hover:text-blue-600 transition">
                                                {booking.TieuDe || booking.tieude}
                                            </Link>
                                            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                                                <i className="fas fa-map-marker-alt text-red-400"></i>
                                                {booking.DiaChiChiTiet || booking.diachichitiet || "Chưa cập nhật địa chỉ"}
                                            </p>
                                        </div>
                                        {getStatusBadge(booking.TrangThai || booking.trangthai, booking.TrangThaiThanhToan || booking.trangthaithanhtoan)}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">Hình thức & Số tiền</p>
                                            <p className="text-sm font-semibold text-gray-700">
                                                {(booking.LoaiDat || booking.loaidat) === 'Coc' ? 'Đặt cọc' : 'Trả góp/Đủ'}: {new Intl.NumberFormat('vi-VN').format(booking.SoTien || booking.sotien || 0)} đ
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">Mã giao dịch</p>
                                            <p className="text-sm font-mono text-blue-600 font-bold">{booking.MaGiaoDich || booking.magiaodich}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-3 text-xs text-gray-400 border-t border-gray-50 pt-3">
                                        <span><i className="fas fa-calendar-alt mr-1"></i>Ngày đặt: {new Date(booking.NgayDat || booking.ngaydat).toLocaleDateString('vi-VN')}</span>

                                        <div className="flex flex-col gap-2 w-full">
                                            {((booking.TrangThaiThanhToan || booking.trangthaithanhtoan || '').includes('Chờ hoàn tiền') && !(booking.STK_NguoiThue || booking.stk_nguoithue)) && (
                                                <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-2">
                                                    <p className="text-red-600 font-bold text-sm mb-3">
                                                        <i className="fas fa-exclamation-triangle mr-1"></i> Đơn bị từ chối. Vui lòng nhập STK để nhận lại tiền cọc:
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        <select
                                                            className="px-3 py-4 border rounded-xl text-base md:text-sm bg-white transition-all w-full"
                                                            required
                                                            value={refundForms[booking.ID_DatPhong || booking.id_datphong]?.nganHang || ''}
                                                            onChange={(e) => setRefundForms({ ...refundForms, [booking.ID_DatPhong || booking.id_datphong]: { ...refundForms[booking.ID_DatPhong || booking.id_datphong], nganHang: e.target.value } })}
                                                        >
                                                            <option value="">Chọn ngân hàng</option>
                                                            {VIETQR_BANKS.map(bank => (
                                                                <option key={bank.id} value={bank.id}>{bank.name} ({bank.id})</option>
                                                            ))}
                                                        </select>
                                                        <input
                                                            type="text" placeholder="Số tài khoản"
                                                            className="px-3 py-2 border rounded-lg text-sm"
                                                            required
                                                            value={refundForms[booking.ID_DatPhong || booking.id_datphong]?.stk || ''}
                                                            onChange={(e) => setRefundForms({ ...refundForms, [booking.ID_DatPhong || booking.id_datphong]: { ...refundForms[booking.ID_DatPhong || booking.id_datphong], stk: e.target.value } })}
                                                        />
                                                        <input
                                                            type="text" placeholder="Tên chủ tài khoản"
                                                            className="px-3 py-2 border rounded-lg text-sm"
                                                            required
                                                            value={refundForms[booking.ID_DatPhong || booking.id_datphong]?.chuTk || ''}
                                                            onChange={(e) => setRefundForms({ ...refundForms, [booking.ID_DatPhong || booking.id_datphong]: { ...refundForms[booking.ID_DatPhong || booking.id_datphong], chuTk: e.target.value.toUpperCase() } })}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleProvideRefundInfo(booking.ID_DatPhong || booking.id_datphong)}
                                                        className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition w-full md:w-auto"
                                                    >
                                                        Gửi thông tin hoàn tiền
                                                    </button>
                                                </div>
                                            )}
                                            {booking.TrangThaiThanhToan === 'Chờ hoàn tiền (Đã có STK)' && (
                                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mt-2">
                                                    <p className="text-purple-600 font-bold text-sm">
                                                        <i className="fas fa-clock mr-1"></i> Đã gửi thông tin. Admin sẽ hoàn tiền trong 1-2 ngày làm việc.
                                                    </p>
                                                    <div className="mt-2 text-xs text-purple-400">
                                                        Thông tin nhận: {booking.NganHang_NguoiThue} - {booking.STK_NguoiThue} ({booking.ChuTK_NguoiThue})
                                                    </div>
                                                </div>
                                            )}
                                            {booking.TrangThaiThanhToan === 'Đã hoàn tiền' && (
                                                <div className="bg-green-50 p-3 rounded-xl border border-green-100 mt-2">
                                                    <span className="text-green-600 font-bold text-xs">
                                                        <i className="fas fa-check-circle mr-1"></i> Đã hoàn trả tiền cọc về tài khoản của bạn.
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {booking.GhiChu && (
                                        <div className="mt-2 text-xs text-gray-400 italic">
                                            <i className="fas fa-comment-alt mr-1"></i> Ghi chú: {booking.GhiChu}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default BookingHistoryPage;
