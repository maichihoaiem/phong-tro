// =============================================
// Controller: YeuThich
// =============================================
const YeuThichModel = require("../models/YeuThichModel");

const yeuThichController = {
    // Them yeu thich
    async add(req, res) {
        try {
            const result = await YeuThichModel.add(req.session.user.ID_TaiKhoan, req.body.idPhong);
            if (result.existed) {
                return res.json({ success: true, message: "Phong da co trong yeu thich!" });
            }
            res.json({ success: true, message: "Da them vao yeu thich!" });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Xoa yeu thich
    async remove(req, res) {
        try {
            await YeuThichModel.remove(req.session.user.ID_TaiKhoan, req.params.idPhong);
            res.json({ success: true, message: "Da xoa khoi yeu thich!" });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Lay danh sach yeu thich
    async getMyFavorites(req, res) {
        try {
            const data = await YeuThichModel.getByUser(req.session.user.ID_TaiKhoan);
            res.json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Kiem tra phong co trong yeu thich khong
    async check(req, res) {
        try {
            const isFavorite = await YeuThichModel.check(req.session.user.ID_TaiKhoan, req.params.idPhong);
            res.json({ success: true, isFavorite });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
};

module.exports = yeuThichController;
