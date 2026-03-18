const { query } = require("../db");

const RutTienModel = {
    async create(idTaiKhoan, soTien, bankInfo) {
        const { tenNganHang, soTaiKhoan, chuTaiKhoan } = bankInfo;
        await query(
            `INSERT INTO RutTien (ID_TaiKhoan, SoTien, TenNganHang, SoTaiKhoan, ChuTaiKhoan)
             VALUES (${idTaiKhoan}, ${soTien}, N'${tenNganHang}', N'${soTaiKhoan}', N'${chuTaiKhoan}')`
        );
    },

    async getByUserId(userId) {
        return await query(
            `SELECT * FROM RutTien WHERE ID_TaiKhoan = ${userId} ORDER BY NgayYeuCau DESC`
        );
    },

    async getAll() {
        return await query(
            `SELECT rt.*, tk.HoTen as TenChuTro 
             FROM RutTien rt
             JOIN TaiKhoan tk ON rt.ID_TaiKhoan = tk.ID_TaiKhoan
             ORDER BY rt.NgayYeuCau DESC`
        );
    },

    async updateStatus(id, trangThai, ghiChuAdmin = '') {
        await query(
            `UPDATE RutTien 
             SET TrangThai = N'${trangThai}', GhiChuAdmin = N'${ghiChuAdmin}', NgayXuLy = GETDATE()
             WHERE ID_RutTien = ${id}`
        );
    }
};

module.exports = RutTienModel;
