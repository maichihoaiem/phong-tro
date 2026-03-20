import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function PostRoomPage({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        tieuDe: '',
        moTa: '',
        gia: '',
        dienTich: '',
        diaChiChiTiet: '',
        idLoaiPhong: '',
        idPhuongXa: '',
        giaDien: '',
        giaNuoc: '',
        tienIch: []
    });

    // Ảnh: lưu preview + file object
    const [imageFiles, setImageFiles] = useState([]);       // File[] - để upload
    const [imagePreviews, setImagePreviews] = useState([]);  // string[] - để preview
    const [existingImages, setExistingImages] = useState([]); // string[] - ảnh cũ khi edit

    const [tinhThanhList, setTinhThanhList] = useState([]);
    const [selectedTinhThanh, setSelectedTinhThanh] = useState('');
    const [quanHuyenList, setQuanHuyenList] = useState([]);
    const [selectedQuanHuyen, setSelectedQuanHuyen] = useState('');
    const [phuongXaList, setPhuongXaList] = useState([]);
    const [selectedPhuongXa, setSelectedPhuongXa] = useState('');

    const [loaiPhongList, setLoaiPhongList] = useState([]);
    const [tienIchList, setTienIchList] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadFormData();
    }, []);

    const loadFormData = async () => {
        try {
            const [loaiRes, tienIchRes, tinhThanhRes] = await Promise.all([
                axios.get('/api/phong-tro/danh-muc/loai-phong'),
                axios.get('/api/phong-tro/danh-muc/tien-ich'),
                axios.get('/api/location/tinh-thanh')
            ]);
            if (loaiRes.data.success) setLoaiPhongList(loaiRes.data.data);
            if (tienIchRes.data.success) setTienIchList(tienIchRes.data.data);

            const fetchedTinhThanh = tinhThanhRes.data.data || [];
            if (fetchedTinhThanh.length > 0) setTinhThanhList(fetchedTinhThanh);

            if (isEditMode) {
                const roomRes = await axios.get(`/api/phong-tro/${id}`, { withCredentials: true });
                if (!roomRes.data.success) {
                    setError(roomRes.data.message || 'Không tìm thấy phòng hoặc bạn không có quyền chỉnh sửa.');
                    setLoadingData(false);
                    return;
                }
                if (roomRes.data.success) {
                    const room = roomRes.data.data;
                    setFormData({
                        tieuDe: room.TieuDe || '',
                        moTa: room.MoTa || '',
                        gia: room.Gia || '',
                        dienTich: room.DienTich || '',
                        diaChiChiTiet: room.DiaChiChiTiet || '',
                        idLoaiPhong: room.ID_LoaiPhong || '',
                        idPhuongXa: room.ID_PhuongXa || '',
                        giaDien: room.GiaDien || '',
                        giaNuoc: room.GiaNuoc || '',
                        tienIch: room.tienIch ? room.tienIch.map(t => t.ID_TienIch) : []
                    });

                    // Thử tìm code của Tỉnh, Huyện, Xã dựa trên tên (từ Database trả về)
                    const normalizeName = (name) => {
                        if (!name) return '';
                        return name.toLowerCase()
                            .replace(/thành phố |tỉnh |quận |huyện |thị xã |phường |xã |tt\. |tt |tp\. |tp /g, '')
                            .trim();
                    };

                    if (room.TenTinhThanh && fetchedTinhThanh.length > 0) {
                        const normalizedRoomTT = normalizeName(room.TenTinhThanh);
                        const tt = fetchedTinhThanh.find(t => 
                            normalizeName(t.name) === normalizedRoomTT || 
                            t.name.includes(room.TenTinhThanh) || 
                            room.TenTinhThanh.includes(t.name)
                        );

                        if (tt) {
                            setSelectedTinhThanh(tt.code);
                            // Load huyện
                            const qhRes = await axios.get(`/api/location/quan-huyen/${tt.code}`);
                            const fetchedQuanHuyen = qhRes.data?.data || [];
                            setQuanHuyenList(fetchedQuanHuyen);

                            if (room.TenQuanHuyen) {
                                const normalizedRoomQH = normalizeName(room.TenQuanHuyen);
                                const qh = fetchedQuanHuyen.find(q => 
                                    normalizeName(q.name) === normalizedRoomQH || 
                                    q.name.includes(room.TenQuanHuyen) || 
                                    room.TenQuanHuyen.includes(q.name)
                                );

                                if (qh) {
                                    setSelectedQuanHuyen(qh.code);
                                    // Load xã
                                    const pxRes = await axios.get(`/api/location/phuong-xa/${qh.code}`);
                                    const fetchedPhuongXa = pxRes.data?.data || [];
                                    setPhuongXaList(fetchedPhuongXa);

                                    if (room.TenPhuongXa) {
                                        const normalizedRoomPX = normalizeName(room.TenPhuongXa);
                                        const px = fetchedPhuongXa.find(x => 
                                            normalizeName(x.name) === normalizedRoomPX || 
                                            x.name.includes(room.TenPhuongXa) || 
                                            room.TenPhuongXa.includes(x.name)
                                        );
                                        if (px) setSelectedPhuongXa(px.code);
                                    }
                                }
                            }
                        }
                    }

                    if (room.hinhAnh && room.hinhAnh.length > 0) {
                        setExistingImages(room.hinhAnh.map(img => img.DuongDanAnh));
                    }
                }
            }
        } catch (err) {
            setError('Không thể tải dữ liệu. Vui lòng thử lại.');
        } finally {
            setLoadingData(false);
        }
    };

    // Khi chọn Tỉnh Thành -> Load Quận Huyện
    useEffect(() => {
        if (selectedTinhThanh && !loadingData) {
            axios.get(`/api/location/quan-huyen/${selectedTinhThanh}`)
                .then(res => {
                    if (res.data && res.data.success) {
                        setQuanHuyenList(res.data.data);
                        // Chỉ clear nếu không phải đang trong quá trình load dữ liệu edit ban đầu
                        if (!isEditMode || (isEditMode && selectedQuanHuyen === '')) {
                            setSelectedQuanHuyen('');
                            setPhuongXaList([]);
                            setSelectedPhuongXa('');
                        }
                    }
                })
                .catch(() => { });
        }
    }, [selectedTinhThanh]);

    // Khi chọn Quận Huyện -> Load Phường Xã
    useEffect(() => {
        if (selectedQuanHuyen && !loadingData) {
            axios.get(`/api/location/phuong-xa/${selectedQuanHuyen}`)
                .then(res => {
                    if (res.data && res.data.success) {
                        setPhuongXaList(res.data.data);
                        // Chỉ clear nếu không phải đang trong quá trình load dữ liệu edit ban đầu
                        if (!isEditMode || (isEditMode && selectedPhuongXa === '')) {
                            setSelectedPhuongXa('');
                        }
                    }
                })
                .catch(() => { });
        }
    }, [selectedQuanHuyen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleTienIch = (idTienIch) => {
        setFormData(prev => ({
            ...prev,
            tienIch: prev.tienIch.includes(idTienIch)
                ? prev.tienIch.filter(id => id !== idTienIch)
                : [...prev.tienIch, idTienIch]
        }));
    };

    // --- Chọn ảnh từ máy ---
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const totalAllowed = 5 - existingImages.length - imageFiles.length;
        const newFiles = files.slice(0, totalAllowed);

        if (newFiles.length === 0) {
            alert('Bạn đã đạt giới hạn 5 ảnh.');
            return;
        }

        // Tạo preview URLs
        const newPreviews = newFiles.map(f => URL.createObjectURL(f));

        setImageFiles(prev => [...prev, ...newFiles]);
        setImagePreviews(prev => [...prev, ...newPreviews]);

        // Reset input để cho phép chọn lại cùng file
        e.target.value = '';
    };

    const removeNewImage = (index) => {
        URL.revokeObjectURL(imagePreviews[index]);
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const totalImages = existingImages.length + imageFiles.length;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.tieuDe || !formData.gia || !formData.dienTich || !formData.idLoaiPhong) {
            setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
            setLoading(false);
            return;
        }

        if (totalImages === 0) {
            setError('Vui lòng chọn ít nhất 1 ảnh phòng trọ.');
            setLoading(false);
            return;
        }

        if (!selectedTinhThanh || !selectedQuanHuyen || !selectedPhuongXa) {
            setError('Vui lòng chọn đầy đủ cấp Tỉnh/Thành phố, Quận/Huyện, Phường/Xã.');
            setLoading(false);
            return;
        }

        try {
            // Upload ảnh mới lên server (nếu có)
            let uploadedUrls = [];
            if (imageFiles.length > 0) {
                const formDataUpload = new FormData();
                imageFiles.forEach(file => formDataUpload.append('images', file));
                const uploadRes = await axios.post('/api/upload', formDataUpload, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (uploadRes.data.success) {
                    uploadedUrls = uploadRes.data.urls;
                }
            }

            // Gộp ảnh cũ + ảnh mới
            const allImages = [...existingImages, ...uploadedUrls];

            const ttName = tinhThanhList.find(t => t.code == selectedTinhThanh)?.name || '';
            const qhName = quanHuyenList.find(q => q.code == selectedQuanHuyen)?.name || '';
            const pxName = phuongXaList.find(p => p.code == selectedPhuongXa)?.name || '';

            const payload = {
                tieuDe: formData.tieuDe,
                moTa: formData.moTa,
                gia: parseFloat(formData.gia),
                dienTich: parseFloat(formData.dienTich),
                diaChiChiTiet: formData.diaChiChiTiet,
                idLoaiPhong: parseInt(formData.idLoaiPhong),
                tenTinhThanh: ttName,
                tenQuanHuyen: qhName,
                tenPhuongXa: pxName,
                tienIch: formData.tienIch,
                hinhAnh: allImages,
                giaDien: formData.giaDien,
                giaNuoc: formData.giaNuoc
            };

            if (isEditMode) {
                await axios.put(`/api/phong-tro/${id}`, payload, { withCredentials: true });
            } else {
                await axios.post('/api/phong-tro', payload, { withCredentials: true });
            }

            setSuccess(true);
            setTimeout(() => navigate('/quan-ly-phong'), 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const getImageDisplayUrl = (imgPath) => {
        if (!imgPath) return '';
        if (imgPath.startsWith('http')) return imgPath;
        return `${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
    };

    if (loadingData) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <i className="fas fa-spinner fa-spin text-blue-600 text-3xl"></i>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 pt-4 mb-20">
            {/* Header */}
            <div className="mb-4">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-blue-600 transition mb-2 flex items-center gap-2 text-sm">
                    <i className="fas fa-arrow-left"></i> Quay lại
                </button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-extrabold text-gray-800">
                            {isEditMode ? 'Chỉnh sửa phòng trọ' : 'Đăng phòng trọ mới'}
                        </h1>
                        <p className="text-gray-400 text-xs mt-0.5">
                            {isEditMode ? 'Cập nhật thông tin phòng trọ của bạn' : 'Điền đầy đủ thông tin để đăng phòng trọ'}
                        </p>
                    </div>
                    {user?.ID_VaiTro === 2 && isEditMode && (
                        <button 
                            onClick={() => navigate('/dang-phong')}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md flex items-center gap-2 text-sm"
                        >
                            <i className="fas fa-plus"></i> Đăng phòng mới
                        </button>
                    )}
                </div>
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg mb-4 flex items-center gap-3 text-sm">
                    <i className="fas fa-check-circle"></i>
                    <span className="font-medium">{isEditMode ? 'Cập nhật thành công!' : 'Đăng phòng thành công!'} Đang chuyển hướng...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 flex items-center gap-3 text-sm">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* === Thông tin cơ bản === */}
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <i className="fas fa-info-circle text-blue-500"></i> Thông tin cơ bản
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề phòng <span className="text-red-500">*</span></label>
                            <input type="text" name="tieuDe" value={formData.tieuDe} onChange={handleChange}
                                placeholder="VD: Phòng trọ sạch sẽ, gần trường ĐH Cần Thơ"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Loại phòng <span className="text-red-500">*</span></label>
                            <select name="idLoaiPhong" value={formData.idLoaiPhong} onChange={handleChange}
                                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-base md:text-sm transition-all" required>
                                <option value="">-- Chọn loại phòng --</option>
                                {loaiPhongList.map(lp => (
                                    <option key={lp.ID_LoaiPhong} value={lp.ID_LoaiPhong}>{lp.TenLoai}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1 h-5">Giá thuê (đ/tháng) <span className="text-red-500">*</span></label>
                                <input type="number" name="gia" value={formData.gia} onChange={handleChange}
                                    placeholder="VD: 2000000"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-sm" required min="0" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1 h-5">Diện tích (m²) <span className="text-red-500">*</span></label>
                                <input type="number" name="dienTich" value={formData.dienTich} onChange={handleChange}
                                    placeholder="VD: 25"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-sm" required min="0" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1 h-5">Tiền điện (đ/kWh)</label>
                                <input type="text" name="giaDien" value={formData.giaDien} onChange={handleChange}
                                    placeholder="VD: 3500 hoặc miễn phí"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1 h-5">Tiền nước (đ/m³)</label>
                                <input type="text" name="giaNuoc" value={formData.giaNuoc} onChange={handleChange}
                                    placeholder="VD: 20000 hoặc miễn phí"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả chi tiết</label>
                            <textarea name="moTa" value={formData.moTa} onChange={handleChange}
                                placeholder="Mô tả về phòng trọ, tiện ích xung quanh, lưu ý..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-sm resize-none" rows={5} />
                        </div>
                    </div>
                </div>

                {/* === Hình ảnh phòng === */}
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <h2 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
                        <i className="fas fa-camera text-purple-500"></i> Hình ảnh phòng <span className="text-red-500">*</span>
                    </h2>
                    <p className="text-gray-400 text-xs mb-3">Chọn từ 1 đến 5 ảnh. Ảnh đầu tiên làm ảnh đại diện.</p>

                    {/* Ảnh đã có (edit mode) */}
                    {existingImages.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-500 mb-2">Ảnh hiện tại:</p>
                            <div className="flex flex-wrap gap-3">
                                {existingImages.map((img, idx) => (
                                    <div key={`existing-${idx}`} className="relative group">
                                        <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200">
                                            <img src={getImageDisplayUrl(img)} alt="" className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = ''; e.target.className = 'w-full h-full bg-gray-100'; }} />
                                        </div>
                                        {idx === 0 && <span className="absolute -top-2 -left-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">Đại diện</span>}
                                        <button type="button" onClick={() => removeExistingImage(idx)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ảnh mới đã chọn */}
                    {imagePreviews.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-500 mb-2">{isEditMode ? 'Ảnh mới thêm:' : 'Ảnh đã chọn:'}</p>
                            <div className="flex flex-wrap gap-3">
                                {imagePreviews.map((preview, idx) => (
                                    <div key={`new-${idx}`} className="relative group">
                                        <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-green-300">
                                            <img src={preview} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        {existingImages.length === 0 && idx === 0 && <span className="absolute -top-2 -left-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">Đại diện</span>}
                                        <button type="button" onClick={() => removeNewImage(idx)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Nút chọn ảnh */}
                    {totalImages < 5 && (
                        <label className="cursor-pointer block">
                            <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                            <div className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition flex items-center justify-center gap-3 text-sm font-medium">
                                <i className="fas fa-cloud-upload-alt text-xl"></i>
                                <span>Chọn ảnh từ máy tính ({totalImages}/5)</span>
                            </div>
                        </label>
                    )}
                    {totalImages >= 5 && (
                        <p className="text-center text-green-600 text-sm font-medium mt-2">
                            <i className="fas fa-check-circle mr-1"></i> Đã đạt tối đa 5 ảnh
                        </p>
                    )}
                </div>

                {/* === Địa chỉ (Chỉ chọn Tỉnh Thành) === */}
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <i className="fas fa-map-marker-alt text-red-500"></i> Địa chỉ
                    </h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
                                <select value={selectedTinhThanh} onChange={(e) => { setSelectedTinhThanh(e.target.value); setQuanHuyenList([]); setPhuongXaList([]); }}
                                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-base md:text-sm transition-all" required>
                                    <option value="">-- Chọn --</option>
                                    {tinhThanhList.map(tt => (
                                        <option key={tt.code} value={tt.code}>{tt.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Quận / Huyện <span className="text-red-500">*</span></label>
                                <select value={selectedQuanHuyen} onChange={(e) => { setSelectedQuanHuyen(e.target.value); setPhuongXaList([]); }} disabled={!selectedTinhThanh}
                                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-base md:text-sm disabled:opacity-50 transition-all" required>
                                    <option value="">-- Chọn --</option>
                                    {quanHuyenList.map(qh => (
                                        <option key={qh.code} value={qh.code}>{qh.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Phường / Xã <span className="text-red-500">*</span></label>
                                <select value={selectedPhuongXa} onChange={(e) => setSelectedPhuongXa(e.target.value)} disabled={!selectedQuanHuyen}
                                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-base md:text-sm disabled:opacity-50 transition-all" required>
                                    <option value="">-- Chọn --</option>
                                    {phuongXaList.map(px => (
                                        <option key={px.code} value={px.code}>{px.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ chi tiết (số nhà, đường, phường...)</label>
                            <input type="text" name="diaChiChiTiet" value={formData.diaChiChiTiet} onChange={handleChange}
                                placeholder="VD: Số 10, Đường 3/2, Phường Xuân Khánh"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-sm" />
                        </div>
                    </div>
                </div>

                {/* === Tiện ích === */}
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <i className="fas fa-check-circle text-green-500"></i> Tiện ích
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {tienIchList.map(ti => (
                            <button key={ti.ID_TienIch} type="button" onClick={() => toggleTienIch(ti.ID_TienIch)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition border-2 w-fit ${formData.tienIch.includes(ti.ID_TienIch)
                                    ? 'border-green-400 bg-green-50 text-green-700'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                                    }`}>
                                <i className={`fas ${formData.tienIch.includes(ti.ID_TienIch) ? 'fa-check-circle text-green-500' : 'fa-circle text-gray-300'}`}></i>
                                {ti.TenTienIch}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <button type="button" onClick={() => navigate(-1)}
                        className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition text-center text-sm">
                        Hủy bỏ
                    </button>
                    <button type="submit" disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                        {loading ? (
                            <><i className="fas fa-spinner fa-spin"></i> Đang xử lý...</>
                        ) : (
                            <><i className={`fas ${isEditMode ? 'fa-save' : 'fa-paper-plane'}`}></i> {isEditMode ? 'Lưu thay đổi' : 'Đăng phòng'}</>
                        )}
                    </button>
                </div>
            </form><div className="h-24"></div>
        </div>
    );
}

export default PostRoomPage;
