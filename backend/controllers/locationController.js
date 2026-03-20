// =============================================
// Controller: Location
// =============================================
const LocationModel = require("../models/LocationModel");

const locationController = {
    // Lay tat ca tinh thanh
    async getTinhThanh(req, res) {
        try {
            const axios = require('axios');
            const response = await axios.get('https://provinces.open-api.vn/api/p/', { timeout: 5000 });
            res.json({ success: true, data: response.data });
        } catch (err) {
            console.error('Loi khi goi provinces API (Tinh Thanh):', err.message);
            res.json({ success: true, data: [], message: 'Khong the tai danh sach tinh thanh tu server vung.' });
        }
    },

    // Lay quan huyen theo tinh thanh
    async getQuanHuyen(req, res) {
        try {
            const idTinhThanh = req.params.idTinhThanh;
            const axios = require('axios');
            const response = await axios.get(`https://provinces.open-api.vn/api/p/${idTinhThanh}?depth=2`, { timeout: 5000 });
            res.json({ success: true, data: response.data.districts });
        } catch (err) {
            console.error('Loi khi goi provinces API (Quan Huyen):', err.message);
            res.json({ success: true, data: [], message: 'Khong thể tải danh sách quan huyen.' });
        }
    },

    // Lay phuong xa theo quan huyen
    async getPhuongXa(req, res) {
        try {
            const idQuanHuyen = req.params.idQuanHuyen;
            const axios = require('axios');
            const response = await axios.get(`https://provinces.open-api.vn/api/d/${idQuanHuyen}?depth=2`, { timeout: 5000 });
            res.json({ success: true, data: response.data.wards });
        } catch (err) {
            console.error('Loi khi goi provinces API (Phuong Xa):', err.message);
            res.json({ success: true, data: [], message: 'Khong thể tải danh sách phuong xa.' });
        }
    }
};

module.exports = locationController;
