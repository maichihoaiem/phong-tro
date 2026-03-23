import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function BookingRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all' | 'Chờ duyệt' | 'Đã duyệt' | 'Đã từ chối'
    const [actionLoading, setActionLoading] = useState(null); // ID đang xử lý

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const res = await axios.get('/api/dat-phong/requests', { withCredentials: true });
            if (res.data.success) {
                setRequests(res.data.data);
            }
        } catch (err) {
            setError('Không thể tải yêu cầu đặt phòng. Vui lòng đăng nhập lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (idDatPhong, trangThai) => {
        setActionLoading(idDatPhong);
        try {
            await axios.put(`/api/dat-phong/${idDatPhong}/status`, { trangThai }, { withCredentials: true });
            // Cập nhật lại state
            setRequests(prev =>
                prev.map(r => r.ID_DatPhong === idDatPhong ? { ...r, TrangThai: trangThai } : r)
            );
            window.dispatchEvent(new Event('ozic:notifications-refresh'));
        } catch (err) {
            alert('Lỗi khi cập nhật trạng thái!');
        } finally {
            setActionLoading(null);
        }
    };


    const filteredRequests = filter === 'all'
        ? requests
        : requests.filter(r => {
            if (filter === 'Đã duyệt') return r.TrangThai === 'Đã duyệt' || r.TrangThai === 'Đã đặt';
            if (filter === 'Đã từ chối') return r.TrangThai === 'Đã từ chối' || r.TrangThai === 'Từ chối';
            if (filter === 'Chờ duyệt') return r.TrangThai === 'Chờ duyệt' || !r.TrangThai || r.TrangThai === 'Chờ thanh toán' || r.TrangThai === 'Chờ xác nhận';
            return r.TrangThai === filter;
        });

    const getStatusBadge = (status, paymentStatus) => {
        let statusEl;
        switch (status) {
            case 'Đã duyệt':
            case 'Đã đặt':
                statusEl = <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold"><i className="fas fa-check mr-1"></i>Đã duyệt</span>;
                break;
            case 'Đã từ chối':
            case 'Từ chối':
                statusEl = <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold"><i className="fas fa-times mr-1"></i>Đã từ chối</span>;
                break;
            default:
                statusEl = <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[10px] font-bold"><i className="fas fa-clock mr-1"></i>Chờ duyệt</span>;
        }

        let paymentEl;
        if (paymentStatus === 'Đã thanh toán') {
            paymentEl = <span className="ml-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold"><i className="fas fa-dollar-sign mr-1"></i>Đã thanh toán</span>;
        } else if (paymentStatus === 'Chờ hoàn tiền') {
            paymentEl = <span className="ml-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-bold"><i className="fas fa-undo mr-1"></i>Chờ hoàn tiền</span>;
        } else if (paymentStatus === 'Đang khiếu nại') {
            paymentEl = <span className="ml-1 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse"><i className="fas fa-exclamation-triangle mr-1"></i>Đang khiếu nại</span>;
        } else if (paymentStatus === 'Đã hoàn tiền') {
            paymentEl = <span className="ml-1 bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold"><i className="fas fa-check-circle mr-1"></i>Đã hoàn tiền</span>;
        } else {
            paymentEl = <span className="ml-1 bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-bold">Chưa thanh toán</span>;
        }

        return <div className="flex flex-nowrap gap-1 whitespace-nowrap">{statusEl}{paymentEl}</div>;
    };

    const pendingCount = requests.filter(r => r.TrangThai === 'Chờ thanh toán' || r.TrangThai === 'Chờ duyệt' || r.TrangThai === 'Chờ xác nhận' || !r.TrangThai).length;

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <i className="fas fa-spinner fa-spin text-blue-600 text-3xl"></i>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto max-w-6xl px-4 py-12">
                <div className="bg-red-50 text-red-600 p-8 rounded-2xl text-center border border-red-100">
                    <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
                    <p>{error}</p>
                    <Link to="/dang-nhap" className="mt-4 inline-block text-blue-600 hover:underline">Đăng nhập lại</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#F8FAFF] min-h-screen px-4 pt-6 pb-8">
            <div className="container mx-auto max-w-6xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h1 className="text-xl md:text-3xl font-extrabold text-gray-800 mb-2 flex items-center gap-2 whitespace-nowrap">
                        <i className="fas fa-bell text-indigo-600"></i>
                        Quản lý <span className="text-indigo-600">Yêu Cầu Đặt Phòng</span>
                    </h1>
                    <p className="text-gray-500">
                        Duyệt hoặc từ chối các yêu cầu đặt phòng từ người thuê
                        {pendingCount > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse-slow">{pendingCount} chờ duyệt</span>
                        )}
                    </p>
                </div>
                <Link to="/quan-ly-phong" className="mt-4 md:mt-0 text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 transition">
                    <i className="fas fa-arrow-left"></i> Về quản lý phòng
                </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide flex-nowrap">
                {[
                    { key: 'all', label: 'Tất cả', count: requests.length },
                    { key: 'Chờ duyệt', label: 'Chờ duyệt', count: requests.filter(r => r.TrangThai === 'Chờ duyệt' || !r.TrangThai || r.TrangThai === 'Chờ thanh toán' || r.TrangThai === 'Chờ xác nhận').length },
                    { key: 'Đã duyệt', label: 'Đã duyệt', count: requests.filter(r => r.TrangThai === 'Đã duyệt' || r.TrangThai === 'Đã đặt').length },
                    { key: 'Đã từ chối', label: 'Đã từ chối', count: requests.filter(r => r.TrangThai === 'Đã từ chối' || r.TrangThai === 'Từ chối').length }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-2 py-1.5 md:px-5 md:py-2.5 rounded-xl text-[10px] md:text-sm font-bold transition border-2 whitespace-nowrap ${filter === tab.key
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                            }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-inbox text-3xl text-yellow-300"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Không có yêu cầu nào</h3>
                    <p className="text-gray-500">Hiện tại chưa có yêu cầu đặt phòng nào {filter !== 'all' ? `ở trạng thái "${filter}"` : ''}.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map(req => (
                        <div key={req.ID_DatPhong} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                {/* Thông tin */}
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <i className="fas fa-user text-blue-500"></i>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{req.TenNguoiThue || 'Người thuê'}</p>
                                            <p className="text-gray-400 text-xs">
                                                {req.NgayDat ? new Date(req.NgayDat).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="ml-auto">{getStatusBadge(req.TrangThai || 'Chờ duyệt', req.TrangThaiThanhToan)}</div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4 mb-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                            <p className="text-sm text-gray-600">
                                                <i className="fas fa-door-open text-blue-400 mr-2 w-4"></i>
                                                <strong>Phòng:</strong> {req.TieuDe}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <i className="fas fa-receipt text-blue-400 mr-2 w-4"></i>
                                                <strong>Loại:</strong> {req.LoaiDat === 'Coc' ? 'Đặt cọc' : 'Thanh toán đủ'}
                                            </p>
                                             <p className="text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                 <i className="fas fa-money-bill text-green-400 mr-2 w-4"></i>
                                                 <strong>Số tiền:</strong> {new Intl.NumberFormat('vi-VN').format(req.SoTien || 0)} đ
                                             </p>
                                            <p className="text-sm text-gray-600">
                                                <i className="fas fa-hashtag text-gray-400 mr-2 w-4"></i>
                                                <strong>Mã giao dịch:</strong> <span className="font-mono bg-blue-50 text-blue-700 px-1 py-0.5 rounded">{req.MaGiaoDich}</span>
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-4 mt-2 border-t border-gray-100 pt-2">
                                            {req.SDTNguoiThue && (
                                                <p className="text-sm text-gray-600">
                                                    <i className="fas fa-phone text-green-400 mr-2 w-4"></i>
                                                    <strong>SĐT:</strong> {req.SDTNguoiThue}
                                                </p>
                                            )}
                                            {req.EmailNguoiThue && (
                                                <p className="text-sm text-gray-600">
                                                    <i className="fas fa-envelope text-blue-400 mr-2 w-4"></i>
                                                    <strong>Email:</strong> {req.EmailNguoiThue}
                                                </p>
                                            )}
                                        </div>
                                    {req.GhiChu && (
                                        <div className="mt-4 p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-400">
                                            <p className="text-xs text-yellow-600 font-bold uppercase mb-1">
                                                <i className="fas fa-comment-alt mr-1"></i> Ghi chú từ khách:
                                            </p>
                                            <p className="text-sm text-gray-700 italic">"{req.GhiChu}"</p>
                                        </div>
                                    )}
                                    </div>

                                    {(req.TrangThaiThanhToan === 'Chờ hoàn tiền' || req.TrangThaiThanhToan === 'Đang khiếu nại') && (
                                        <div className="mt-4 p-4 bg-purple-50 rounded-2xl border-2 border-purple-100 border-dashed">
                                            <h5 className="text-sm font-black text-purple-700 mb-3 uppercase flex items-center gap-2">
                                                <i className="fas fa-university"></i> Thông tin nhận tiền của khách
                                            </h5>
                                            {req.STK_NguoiThue ? (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="bg-white p-3 rounded-xl shadow-sm">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Ngân hàng</p>
                                                        <p className="text-sm font-bold text-gray-800">{req.NganHang_NguoiThue}</p>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-xl shadow-sm">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Số tài khoản</p>
                                                        <p className="text-sm font-mono font-bold text-blue-600">{req.STK_NguoiThue}</p>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-xl shadow-sm">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Chủ tài khoản</p>
                                                        <p className="text-sm font-bold text-gray-800 uppercase">{req.ChuTK_NguoiThue}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-2">
                                                    <p className="text-sm text-red-500 font-bold italic">Khách thuê chưa cập nhật thông tin ngân hàng!</p>
                                                    <p className="text-xs text-gray-500">Hãy liên hệ trực tiếp qua SĐT/Email để lấy thông tin.</p>
                                                </div>
                                            )}

                                            <div className="mt-4 pt-4 border-t border-purple-100 text-center">
                                                <p className="text-sm text-gray-700 font-bold mb-1">Đã chuyển yêu cầu hoàn tiền cho Admin xử lý</p>
                                                <p className="text-xs text-gray-500">Người thuê sẽ nhận lại tiền cọc từ hệ thống. Bạn không cần làm gì thêm.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            {(req.TrangThai === 'Chờ xác nhận' || req.TrangThai === 'Chờ thanh toán' || !req.TrangThai) && (
                                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                    <button
                                        onClick={() => handleUpdateStatus(req.ID_DatPhong, 'Đã đặt')}
                                        disabled={actionLoading === req.ID_DatPhong || (req.TrangThaiThanhToan || '').trim() !== 'Đã thanh toán'}
                                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-bold hover:bg-blue-600 hover:text-white transition-all duration-200 disabled:opacity-50 text-sm shadow-sm"
                                    >
                                        {actionLoading === req.ID_DatPhong ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check text-[10px]"></i>}
                                        {(req.TrangThaiThanhToan || '').trim() !== 'Đã thanh toán' ? 'Chờ khách chuyển khoản cọc...' : 'ĐỒNG Ý (Nhận cọc & Cho thuê)'}
                                    </button>
                                    <button
                                        onClick={() => {
                                             if(window.confirm('Bạn có chắc muốn Từ chối? Khách sẽ được Admin hoàn lại tiền và phòng vẫn "Còn trống".')) {
                                                 handleUpdateStatus(req.ID_DatPhong, 'Từ chối')
                                             }
                                        }}
                                        disabled={actionLoading === req.ID_DatPhong}
                                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-rose-50 text-rose-600 border border-rose-100 font-bold hover:bg-rose-600 hover:text-white transition-all duration-200 disabled:opacity-50 text-sm shadow-sm"
                                    >
                                        {actionLoading === req.ID_DatPhong ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-times text-[10px]"></i>}
                                        TỪ CHỐI (Không cho thuê)
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
}

export default BookingRequestsPage;
