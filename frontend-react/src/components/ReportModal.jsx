import React, { useState, useRef } from 'react';

function ReportModal({ isOpen, onClose, onSubmit, loading }) {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const reasons = [
        "Thông tin sai sự thật",
        "Lừa đảo / Gian lận",
        "Phòng đã cho thuê",
        "Hình ảnh không đúng thực tế",
        "Giá không đúng như đăng tải",
        "Lý do khác"
    ];

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClearImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFormSubmit = () => {
        onSubmit({ reason, description, image });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-fade-up max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-2xl font-black text-gray-800">Báo cáo bài đăng</h3>
                        <p className="text-gray-400 text-sm font-medium mt-1 italic">Vui lòng cung cấp bằng chứng chính xác</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Lý do báo cáo</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {reasons.map((r, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setReason(r)}
                                    className={`text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ${
                                        reason === r 
                                        ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold' 
                                        : 'border-gray-50 bg-gray-50 text-gray-600 hover:border-orange-200'
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả chi tiết (không bắt buộc)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Nhập thêm chi tiết về vi phạm..."
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-50 focus:border-orange-200 focus:bg-white outline-none transition-all h-24 text-sm resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Hình ảnh bằng chứng (nếu có)</label>
                        {!imagePreview ? (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-all"
                            >
                                <i className="fas fa-camera text-2xl mb-2"></i>
                                <span className="text-xs font-medium">Bấm để tải ảnh lên</span>
                            </div>
                        ) : (
                            <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-gray-100">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <button 
                                    onClick={handleClearImage}
                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition"
                                >
                                    <i className="fas fa-trash-alt text-xs"></i>
                                </button>
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleFormSubmit}
                        disabled={!reason || loading}
                        className="flex-2 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-black hover:shadow-lg transition-all disabled:opacity-50 min-w-[140px]"
                    >
                        {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-paper-plane mr-2"></i>}
                        Gửi báo cáo
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ReportModal;
