import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function FavoritesPage() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const res = await axios.get('/api/yeu-thich', { withCredentials: true });
            if (res.data.success) setFavorites(res.data.data);
        } catch (err) {
            console.error('Loi load yeu thich:', err);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (idPhong) => {
        try {
            await axios.delete(`/api/yeu-thich/${idPhong}`, { withCredentials: true });
            setFavorites(favorites.filter(f => f.ID_Phong !== idPhong));
        } catch (err) {
            console.error('Loi xoa yeu thich:', err);
        }
    };

    const getImageUrl = (anhPath) => {
        if (!anhPath) return null;
        if (anhPath.startsWith('http')) return anhPath;
        if (anhPath.startsWith('/uploads/')) return `${anhPath}`;
        const fileName = anhPath.split(/[\\/]/).pop().replace(/^"|"$/g, '');
        return `/images/${fileName}`;
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
                <i className="fas fa-heart text-red-500"></i> Phòng yêu thích
                <span className="text-sm font-normal text-gray-400 ml-2">({favorites.length} phòng)</span>
            </h1>

            {favorites.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <i className="fas fa-heart text-gray-200 text-6xl mb-4"></i>
                    <h2 className="text-xl font-bold text-gray-500 mb-2">Chưa có phòng yêu thích</h2>
                    <p className="text-gray-400 text-sm mb-6">Hãy bấm vào biểu tượng trái tim để lưu phòng bạn thích!</p>
                    <Link to="/tim-phong" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition text-sm inline-flex items-center gap-2">
                        <i className="fas fa-search"></i> Tìm phòng ngay
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {favorites.map(room => (
                        <div key={room.ID_Phong} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex">
                            {/* Ảnh */}
                            <div className="w-48 h-36 flex-shrink-0 bg-gray-100">
                                {room.AnhPhong ? (
                                    <img
                                        src={getImageUrl(room.AnhPhong)}
                                        className="w-full h-full object-cover"
                                        alt={room.TieuDe}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-blue-50">
                                        <i className="fas fa-camera text-3xl"></i>
                                    </div>
                                )}
                            </div>

                            {/* Thông tin */}
                            <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                    <Link to={`/phong-tro/${room.ID_Phong}`} className="font-bold text-gray-800 hover:text-blue-600 transition text-sm sm:text-base line-clamp-2">
                                        {room.TieuDe}
                                    </Link>
                                    <p className="text-gray-500 text-[11px] sm:text-sm mt-1 flex items-center gap-1">
                                        <i className="fas fa-map-marker-alt text-red-400"></i>
                                        {room.DiaChiChiTiet}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-2 sm:gap-4">
                                        <span className="text-blue-600 font-bold text-sm sm:text-base whitespace-nowrap">{new Intl.NumberFormat('vi-VN').format(room.Gia)} đ/tháng</span>
                                        <span className="text-gray-400 text-[11px] sm:text-sm whitespace-nowrap">{room.DienTich} m²</span>
                                    </div>
                                    <button
                                        onClick={() => removeFavorite(room.ID_Phong)}
                                        className="text-red-400 hover:text-red-600 hover:bg-red-50 px-2 sm:px-3 py-1.5 rounded-lg transition text-[11px] sm:text-sm font-medium flex items-center gap-1 whitespace-nowrap"
                                    >
                                        <i className="fas fa-trash-alt"></i> <span className="hidden xs:inline">Bỏ yêu thích</span><span className="xs:hidden">Bỏ</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FavoritesPage;
