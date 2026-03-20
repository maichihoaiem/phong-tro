import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import RoomCard from '../components/RoomCard';
import BlogPreview from '../components/BlogPreview';

function RoomDetailPage({ user }) {
    const { id } = useParams();
    const [room, setRoom] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null); // The hien ảnh lớn dang duoc chon
    const [loading, setLoading] = useState(true);
    const [isFavorited, setIsFavorited] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingNote, setBookingNote] = useState('');
    const [loaiDat, setLoaiDat] = useState('Coc'); // 'Coc' | 'Full'
    const [qrData, setQrData] = useState(null); // { maGiaoDich, soTien, qrUrl, idDatPhong }
    const [bookingStatus, setBookingStatus] = useState(null); // 'success' | 'error' | 'pending_payment'
    const [bookingLoading, setBookingLoading] = useState(false);
    const [relatedRooms, setRelatedRooms] = useState([]);

    useEffect(() => {
        loadRoomDetail();
        if (user) checkFavorite();
    }, [id, user]);

    // Polling de check trang thai thanh toan tu dong
    useEffect(() => {
        let interval;
        if (bookingStatus === 'pending_payment' && qrData) {
            interval = setInterval(async () => {
                try {
                    const res = await axios.get(`/api/dat-phong/my-bookings`, { withCredentials: true });
                    if (res.data.success) {
                        const currentBooking = res.data.data.find(b => String(b.ID_DatPhong) === String(qrData.idDatPhong));
                        console.log("Polling Status for", qrData.idDatPhong, ":", currentBooking?.TrangThaiThanhToan);
                        if (currentBooking && (currentBooking.TrangThaiThanhToan || '').trim() === 'Đã thanh toán') {
                            setBookingStatus('success');
                            clearInterval(interval);
                        }
                    }
                } catch (err) {
                    console.error('Loi khi poll trang thai:', err);
                }
            }, 3000); // Check moi 3 giay
        }
        return () => clearInterval(interval);
    }, [bookingStatus, qrData]);

    const loadRoomDetail = async () => {
        try {
            const res = await axios.get(`/api/phong-tro/${id}`);
            if (res.data.success) {
                const roomData = res.data.data;
                setRoom(roomData);
                if (roomData.hinhAnh && roomData.hinhAnh.length > 0) {
                    setSelectedImage(roomData.hinhAnh[0].DuongDanAnh);
                }

                // Fetch related rooms by ID_TinhThanh (Chung Tỉnh Thành)
                if (roomData.ID_TinhThanh) {
                    try {
                        const relatedRes = await axios.get(`/api/phong-tro?tinhThanh=${roomData.ID_TinhThanh}&limit=4`);
                        if (relatedRes.data.success) {
                            // Loai bo phong hien tai ra khoi danh sach goi y
                            const filtered = relatedRes.data.data.filter(r => r.ID_Phong !== parseInt(id)).slice(0, 3);
                            setRelatedRooms(filtered);
                        }
                    } catch (e) { console.error('Loi load phong lien quan:', e) }
                }
            }
        } catch (err) {
            console.error('Loi load chi tiet phong:', err);
        } finally {
            setLoading(false);
        }
    };

    const checkFavorite = async () => {
        try {
            const res = await axios.get(`/api/yeu-thich/check/${id}`, { withCredentials: true });
            setIsFavorited(res.data.isFavorited);
        } catch (err) { }
    };

    const toggleFavorite = async () => {
        if (!user) {
            alert('Vui lòng đăng nhập để lưu yêu thích!');
            return;
        }
        try {
            if (isFavorited) {
                await axios.delete(`/api/yeu-thich/${id}`, { withCredentials: true });
            } else {
                await axios.post('/api/yeu-thich', { idPhong: id }, { withCredentials: true });
            }
            setIsFavorited(!isFavorited);
        } catch (err) {
            console.error('Loi toggle yeu thich:', err);
        }
    };

    const handleBooking = async () => {
        if (!user) {
            alert('Vui lòng đăng nhập để đặt phòng!');
            return;
        }
        setBookingLoading(true);
        try {
            const res = await axios.post('/api/dat-phong', {
                idPhong: parseInt(id),
                ghiChu: bookingNote,
                loaiDat: loaiDat
            }, { withCredentials: true });

            console.log('API Dat Phong Response:', res.data);

            if (res.data.success) {
                setQrData(res.data.data);
                setBookingStatus('pending_payment');
            }
        } catch (err) {
            console.error('Loi dat phong:', err);
            setBookingStatus('error');
            const msg = err.response?.data?.message || 'Có lỗi xảy ra khi đặt phòng.';
            alert(`Lỗi: ${msg}`);
        } finally {
            setBookingLoading(false);
        }
    };

    const handleSimulatePayment = async () => {
        if (!qrData) return;
        try {
            await axios.post('/api/dat-phong/simulate-payment', {
                maGiaoDich: qrData.maGiaoDich
            });
            // Cap nhat thanh cong ngay lap tuc cho UX tot hon
            setBookingStatus('success');
        } catch (err) {
            alert('Lỗi giả lập thanh toán');
        }
    };

    const getImageUrl = (anhPath) => {
        if (!anhPath) return 'https://placehold.co/600x400/eeeeee/999999?text=No+Image';
        if (anhPath.startsWith('http')) return anhPath;
        if (anhPath.startsWith('/uploads/')) return `${anhPath}`;

        // Luon lay tu thu muc uploads
        const fileName = anhPath.split(/[\\/]/).pop().replace(/^"|"$/g, '');
        return `/uploads/${fileName}`;
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <i className="fas fa-exclamation-triangle text-yellow-500 text-5xl mb-4"></i>
                    <h2 className="text-xl font-bold text-gray-700">Không tìm thấy phòng</h2>
                    <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">← Quay về trang chủ</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col font-sans">
            <div className="container mx-auto max-w-5xl px-4 pt-8 pb-2 flex-grow">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link to="/" className="hover:text-blue-600 transition">Trang chủ</Link>
                    <i className="fas fa-chevron-right text-xs"></i>
                    <Link to="/tim-phong" className="hover:text-blue-600 transition">Tìm phòng</Link>
                    <i className="fas fa-chevron-right text-xs"></i>
                    <span className="text-gray-800 font-medium truncate max-w-xs">{room.TieuDe}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cột trái: Ảnh + Thông tin */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Ảnh phòng */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                            <div className="h-[450px] bg-gray-100 relative">
                                {selectedImage ? (
                                    <img
                                        src={getImageUrl(selectedImage)}
                                        className="w-full h-full object-cover"
                                        alt={room.TieuDe}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-blue-50">
                                        <i className="fas fa-camera text-5xl"></i>
                                    </div>
                                )}
                                <span className="absolute top-4 left-4 bg-blue-600 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                                    {room.TenLoaiPhong || room.TenLoai || 'Phòng trọ'}
                                </span>
                            </div>

                            {/* Gallery nhỏ */}
                            {room.hinhAnh && room.hinhAnh.length > 1 && (
                                <div className="flex gap-2 p-3 overflow-x-auto">
                                    {room.hinhAnh.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={getImageUrl(img.DuongDanAnh)}
                                            onClick={() => setSelectedImage(img.DuongDanAnh)}
                                            className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer transition flex-shrink-0 ${selectedImage === img.DuongDanAnh ? 'border-blue-500' : 'border-gray-200 hover:border-blue-400'}`}
                                            alt={`Ảnh ${idx + 1}`}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tiêu đề + giá */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h1 className="text-2xl font-bold text-gray-800 mb-3">{room.TieuDe}</h1>
                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                                <i className="fas fa-map-marker-alt text-red-400"></i>
                                <span>{room.DiaChiChiTiet}, {room.TenPhuongXa}, {room.TenQuanHuyen}, {room.TenTinhThanh}</span>
                            </div>

                            <div className="flex flex-wrap gap-4 mb-4">
                                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
                                    <i className="fas fa-money-bill-wave text-blue-600"></i>
                                    <span className="font-bold text-blue-600 text-lg">{new Intl.NumberFormat('vi-VN').format(room.Gia)} đ/tháng</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl text-sm">
                                    <i className="fas fa-vector-square text-blue-400"></i>
                                    <span>{room.DienTich} m²</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl text-sm">
                                    <i className="fas fa-eye text-green-400"></i>
                                    <span>{room.LuotXem || 0} lượt xem</span>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin chủ trọ (Mobile Only) */}
                        <div className="lg:hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <i className="fas fa-user-tie text-blue-500"></i> Thông tin chủ trọ
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <i className="fas fa-user text-blue-500"></i>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{room.TenChuTro}</p>
                                        <p className="text-gray-400 text-xs">Chủ trọ</p>
                                    </div>
                                </div>
                                {room.SDTChuTro && (
                                    <a href={`tel:${room.SDTChuTro}`} className="flex items-center gap-3 bg-green-50 px-4 py-3 rounded-xl hover:bg-green-100 transition">
                                        <i className="fas fa-phone text-green-500"></i>
                                        <span className="text-green-700 font-medium">{room.SDTChuTro}</span>
                                    </a>
                                )}
                                {room.EmailChuTro && (
                                    <a href={`mailto:${room.EmailChuTro}`} className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl hover:bg-blue-100 transition">
                                        <i className="fas fa-envelope text-blue-500"></i>
                                        <span className="text-blue-700 font-medium text-sm truncate">{room.EmailChuTro}</span>
                                    </a>
                                )}
                                {room.SDTChuTro && (
                                    <a
                                        href={`https://zalo.me/${room.SDTChuTro}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 bg-[#0068ff] text-white px-4 py-3 rounded-xl hover:bg-[#0052cc] transition shadow-md group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                                        <i className="fas fa-comment-dots animate-bounce"></i>
                                        <span className="font-bold">Chat Zalo ngay</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Hành động (Mobile Only) */}
                        <div className="lg:hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                            <div className="text-center mb-5">
                                <div className="text-3xl font-bold text-blue-600 mb-1">
                                    {new Intl.NumberFormat('vi-VN').format(room.Gia)} đ
                                </div>
                                <p className="text-gray-400 text-sm">/ tháng</p>
                            </div>

                            {user && user.ID_TaiKhoan === room.ID_TaiKhoan ? (
                                <div className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-medium text-center border-2 border-gray-200 mb-3 px-4 text-sm">
                                    <i className="fas fa-info-circle mr-2"></i> Bạn là chủ của phòng trọ này
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowBookingModal(true)}
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg mb-3 flex items-center justify-center gap-2"
                                >
                                    <i className="fas fa-calendar-check"></i> Đặt phòng ngay
                                </button>
                            )}

                            <button
                                onClick={toggleFavorite}
                                className={`w-full py-3 rounded-xl font-semibold transition border-2 flex items-center justify-center gap-2 ${isFavorited
                                    ? 'bg-red-50 border-red-300 text-red-500 hover:bg-red-100'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500'
                                    }`}
                            >
                                <i className={`fas fa-heart ${isFavorited ? 'text-red-500' : ''}`}></i>
                                {isFavorited ? 'Đã yêu thích' : 'Lưu yêu thích'}
                            </button>
                        </div>

                        {/* Chi phí dịch vụ */}
                        {(room.GiaDien != null || room.GiaNuoc != null) && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 italic">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 not-italic">
                                    <i className="fas fa-receipt text-orange-500"></i> Chi phí dịch vụ
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {room.GiaDien != null && room.GiaDien !== '' && (
                                        <div className="flex items-center justify-between p-4 bg-yellow-50/50 rounded-xl border border-yellow-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                                                    <i className="fas fa-bolt"></i>
                                                </div>
                                                <span className="font-semibold text-gray-700">Tiền điện</span>
                                            </div>
                                            <span className="font-bold text-yellow-700">
                                                {!isNaN(parseFloat(room.GiaDien))
                                                    ? `${new Intl.NumberFormat('vi-VN').format(room.GiaDien)} đ/kWh`
                                                    : room.GiaDien}
                                            </span>
                                        </div>
                                    )}
                                    {room.GiaNuoc != null && room.GiaNuoc !== '' && (
                                        <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                                    <i className="fas fa-tint"></i>
                                                </div>
                                                <span className="font-semibold text-gray-700">Tiền nước</span>
                                            </div>
                                            <span className="font-bold text-blue-700">
                                                {!isNaN(parseFloat(room.GiaNuoc))
                                                    ? `${new Intl.NumberFormat('vi-VN').format(room.GiaNuoc)} đ/khối`
                                                    : room.GiaNuoc}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Mô tả */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <i className="fas fa-align-left text-blue-500"></i> Mô tả chi tiết
                            </h2>
                            <div className="text-gray-600 leading-relaxed whitespace-pre-wrap break-words">{room.MoTa || 'Chưa có mô tả.'}</div>
                        </div>

                        {/* Tiện ích */}
                        {room.tienIch && room.tienIch.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <i className="fas fa-check-circle text-green-500"></i> Tiện ích
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {room.tienIch.map((ti, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg text-sm text-green-700">
                                            <i className="fas fa-check text-green-500"></i>
                                            {ti.TenTienIch}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bản đồ vị trí */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <i className="fas fa-map-marked-alt text-blue-500"></i> Vị trí chính xác
                            </h2>
                            <div className="h-[250px] lg:h-[400px] rounded-xl overflow-hidden border border-gray-100 -mx-1">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    scrolling="no"
                                    marginHeight="0"
                                    marginWidth="0"
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                                        `${room.DiaChiChiTiet}, ${room.TenPhuongXa}, ${room.TenQuanHuyen}, ${room.TenTinhThanh}`
                                    )}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                                    title="Vị trí phòng trọ"
                                    className="filter grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
                                ></iframe>
                            </div>
                            <div className="mt-4 flex items-start gap-2 text-gray-500 text-sm">
                                <i className="fas fa-info-circle mt-0.5 text-blue-400"></i>
                                <p>Bản đồ hiển thị vị trí tương đối dựa trên địa chỉ được cung cấp. Liên hệ chủ trọ để được dẫn xem phòng trực tiếp.</p>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải: Sidebar */}
                    <div className="space-y-6 h-full">
                        {/* Thông tin chủ trọ (Desktop Only) */}
                        <div className="hidden lg:block bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <i className="fas fa-user-tie text-blue-500"></i> Thông tin chủ trọ
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <i className="fas fa-user text-blue-500"></i>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{room.TenChuTro}</p>
                                        <p className="text-gray-400 text-xs">Chủ trọ</p>
                                    </div>
                                </div>
                                {room.SDTChuTro && (
                                    <a href={`tel:${room.SDTChuTro}`} className="flex items-center gap-3 bg-green-50 px-4 py-3 rounded-xl hover:bg-green-100 transition">
                                        <i className="fas fa-phone text-green-500"></i>
                                        <span className="text-green-700 font-medium">{room.SDTChuTro}</span>
                                    </a>
                                )}
                                {room.EmailChuTro && (
                                    <a href={`mailto:${room.EmailChuTro}`} className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl hover:bg-blue-100 transition">
                                        <i className="fas fa-envelope text-blue-500"></i>
                                        <span className="text-blue-700 font-medium text-sm truncate">{room.EmailChuTro}</span>
                                    </a>
                                )}
                                {room.SDTChuTro && (
                                    <a
                                        href={`https://zalo.me/${room.SDTChuTro}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 bg-[#0068ff] text-white px-4 py-3 rounded-xl hover:bg-[#0052cc] transition shadow-md group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                                        <i className="fas fa-comment-dots animate-bounce"></i>
                                        <span className="font-bold">Chat Zalo ngay</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Hành động (Desktop Only) */}
                        <div className="hidden lg:block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24 z-10">
                            <div className="text-center mb-5">
                                <div className="text-3xl font-bold text-blue-600 mb-1">
                                    {new Intl.NumberFormat('vi-VN').format(room.Gia)} đ
                                </div>
                                <p className="text-gray-400 text-sm">/ tháng</p>
                            </div>

                            {user && user.ID_TaiKhoan === room.ID_TaiKhoan ? (
                                <div className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-medium text-center border-2 border-gray-200 mb-3 px-4">
                                    <i className="fas fa-info-circle mr-2"></i> Bạn là chủ của phòng trọ này
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowBookingModal(true)}
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg mb-3 flex items-center justify-center gap-2"
                                >
                                    <i className="fas fa-calendar-check"></i> Đặt phòng ngay
                                </button>
                            )}

                            <button
                                onClick={toggleFavorite}
                                className={`w-full py-3 rounded-xl font-semibold transition border-2 flex items-center justify-center gap-2 ${isFavorited
                                    ? 'bg-red-50 border-red-300 text-red-500 hover:bg-red-100'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500'
                                    }`}
                            >
                                <i className={`fas fa-heart ${isFavorited ? 'text-red-500' : ''}`}></i>
                                {isFavorited ? 'Đã yêu thích' : 'Lưu yêu thích'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal Đặt phòng */}
                {showBookingModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 py-6 overflow-y-auto">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl my-auto">
                            {bookingStatus === 'success' ? (
                                <div className="text-center py-4">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="fas fa-check text-green-500 text-3xl"></i>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h3>
                                    <p className="text-gray-500 mb-6">Bạn đã đặt cọc phòng thành công. Chủ trọ sẽ liên hệ với bạn sớm nhất có thể.</p>
                                    <button
                                        onClick={() => { setShowBookingModal(false); setBookingStatus(null); setQrData(null); }}
                                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                                    >
                                        Tuyệt vời
                                    </button>
                                </div>
                            ) : bookingStatus === 'pending_payment' ? (
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Thanh toán {loaiDat === 'Coc' ? 'đặt cọc' : 'toàn bộ'}</h3>
                                    <p className="text-gray-500 text-sm mb-4">Vui lòng quét mã QR bên dưới để hoàn tất.</p>

                                    <div className="bg-gray-50 p-4 rounded-2xl mb-4 inline-block mx-auto border border-gray-100">
                                        {qrData && <img src={qrData.qrUrl} alt="QR Thanh Toan" className="w-64 h-64 mx-auto rounded-lg shadow-md" />}
                                    </div>

                                    <div className="text-left bg-blue-50 p-4 rounded-xl mb-6">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-600 text-sm">Số tiền:</span>
                                            <span className="font-bold text-blue-700">{new Intl.NumberFormat('vi-VN').format(qrData?.soTien || 0)} đ</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">Nội dung:</span>
                                            <span className="font-bold text-blue-700">{qrData?.maGiaoDich || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {/* Nut gia lap cho DEV */}
                                        <button
                                            onClick={handleSimulatePayment}
                                            className="text-xs text-blue-500 hover:underline mb-2"
                                        >
                                            (Giả lập: Đã nhận được tiền)
                                        </button>

                                        <button
                                            onClick={() => { setShowBookingModal(false); setBookingStatus(null); setQrData(null); }}
                                            className="w-full py-3 rounded-xl border-2 border-red-200 bg-red-50 text-red-600 font-bold hover:bg-red-100 transition shadow-sm"
                                        >
                                            Hủy giao dịch
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">Xác nhận đặt phòng</h3>
                                    <p className="text-gray-400 text-sm mb-5">{room.TieuDe}</p>

                                    {bookingStatus === 'error' && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
                                            <i className="fas fa-exclamation-circle mr-2"></i>Có lỗi xảy ra. Vui lòng thử lại!
                                        </div>
                                    )}

                                    <div className="space-y-4 mb-6">
                                        <label className="block text-gray-700 text-sm font-semibold mb-2">Số tiền đặt cọc (10%)</label>
                                        <div className="bg-blue-50 border-2 border-blue-600 rounded-xl p-4 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">Cọc giữ phòng</p>
                                                <p className="text-gray-500 text-xs mt-1">Sẽ khấu trừ vào tiền phòng</p>
                                            </div>
                                            <p className="text-blue-600 font-black text-lg">{new Intl.NumberFormat('vi-VN').format(room.Gia * 0.1)} đ</p>
                                        </div>
                                    </div>

                                    <label className="block text-gray-700 text-sm font-semibold mb-2">Ghi chú (tùy chọn)</label>
                                    <textarea
                                        value={bookingNote}
                                        onChange={(e) => setBookingNote(e.target.value)}
                                        placeholder="Ví dụ: Tôi muốn xem phòng trước khi thuê..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-gray-50 resize-none"
                                        rows={3}
                                    />

                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={() => { setShowBookingModal(false); setBookingStatus(null); }}
                                            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleBooking}
                                            disabled={bookingLoading}
                                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg disabled:opacity-60"
                                        >
                                            {bookingLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Tiếp tục'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Phòng cùng khu vực */}
                {relatedRooms.length > 0 && (
                    <div className="mt-8 border-t border-gray-100 pt-8">
                        <div className="flex justify-between items-end mb-6">
                            <div className="w-full">
                                <h2 className="text-base lg:text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis">
                                    <i className="fas fa-map-marker-alt text-red-500 flex-shrink-0"></i>
                                    Phòng tương tự ở {room.TenTinhThanh}
                                </h2>
                                <p className="text-xs lg:text-base text-gray-500">Gợi ý các phòng trống khác tại khu vực này.</p>
                            </div>
                        </div>
                        <div className="mobile-horizontal-scroller gap-3 lg:gap-6">
                            {relatedRooms.map((r, idx) => (
                                <div key={r.ID_Phong || idx} className="mobile-scroller-item-half">
                                    <RoomCard room={r} />
                                </div>
                            ))}
                            {/* Nút Xem thêm trên Mobile */}
                            <div className="lg:hidden mobile-scroller-item-half h-full">
                                <Link to="/tim-phong" className="see-more-card">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2 text-blue-600">
                                        <i className="fas fa-plus"></i>
                                    </div>
                                    <span className="font-bold text-xs uppercase letter-spacing-[1px]">Xem thêm</span>
                                    <p className="text-[10px] text-gray-400 mt-1">Nhiều phòng khác</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Blog Section at the bottom */}
            <BlogPreview />
        </div>
    );
}

export default RoomDetailPage;
