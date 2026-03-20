// =============================================
// Controller: Location (ĐỌC DỮ LIỆU LOCAL - KHÔNG PHỤ THUỘC API BÊN NGOÀI)
// =============================================
const path = require('path');
const fs = require('fs');

// Đọc file dữ liệu tĩnh 1 lần khi khởi động server
let provincesData = [];
try {
    const rawData = fs.readFileSync(path.join(__dirname, '..', 'data', 'vietnam-provinces.json'), 'utf8');
    provincesData = JSON.parse(rawData);
    console.log(`[Location] Đã tải ${provincesData.length} tỉnh/thành từ file local.`);
} catch (err) {
    console.error('[Location] Lỗi đọc file vietnam-provinces.json:', err.message);
}

const locationController = {
    // Lấy tất cả tỉnh thành
    async getTinhThanh(req, res) {
        try {
            const result = provincesData.map(p => ({
                code: p.Id,
                name: p.Name
            }));
            res.json({ success: true, data: result });
        } catch (err) {
            console.error('Lỗi getTinhThanh:', err.message);
            res.json({ success: true, data: [] });
        }
    },

    // Lấy quận huyện theo tỉnh thành
    async getQuanHuyen(req, res) {
        try {
            const idTinhThanh = req.params.idTinhThanh;
            const province = provincesData.find(p => p.Id === idTinhThanh);
            if (!province) {
                return res.json({ success: true, data: [] });
            }
            const result = province.Districts.map(d => ({
                code: d.Id,
                name: d.Name
            }));
            res.json({ success: true, data: result });
        } catch (err) {
            console.error('Lỗi getQuanHuyen:', err.message);
            res.json({ success: true, data: [] });
        }
    },

    // Lấy phường xã theo quận huyện
    async getPhuongXa(req, res) {
        try {
            const idQuanHuyen = req.params.idQuanHuyen;
            let wards = [];
            for (const province of provincesData) {
                const district = province.Districts.find(d => d.Id === idQuanHuyen);
                if (district) {
                    wards = district.Wards.map(w => ({
                        code: w.Id,
                        name: w.Name
                    }));
                    break;
                }
            }
            res.json({ success: true, data: wards });
        } catch (err) {
            console.error('Lỗi getPhuongXa:', err.message);
            res.json({ success: true, data: [] });
        }
    }
};

module.exports = locationController;
