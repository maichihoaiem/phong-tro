const { query } = require("../db");

const LichSuViModel = {
    async create(idTaiKhoan, soTien, loaiGiaoDich, noiDung) {
        await query(
            `INSERT INTO LichSuVi (ID_TaiKhoan, SoTien, LoaiGiaoDich, NoiDung)
             VALUES (${idTaiKhoan}, ${soTien}, N'${loaiGiaoDich}', N'${noiDung}')`
        );
    },

    async getByUserId(userId) {
        return await query(
            `SELECT * FROM LichSuVi WHERE ID_TaiKhoan = ${userId} ORDER BY NgayGiaoDich DESC`
        );
    }
};

module.exports = LichSuViModel;
