// =============================================
// Model: YeuThich
// Cot: ID_TaiKhoan, ID_Phong (khoa chinh kep, khong co ID_YeuThich)
// =============================================
const { query } = require("../db");

const YeuThichModel = {
    // Them yeu thich
    async add(idTaiKhoan, idPhong) {
        // Kiem tra da yeu thich chua
        const existing = await query(
            `SELECT * FROM YeuThich WHERE ID_TaiKhoan = ${idTaiKhoan} AND ID_Phong = ${idPhong}`
        );
        if (existing.length > 0) return { existed: true };

        await query(
            `INSERT INTO YeuThich (ID_TaiKhoan, ID_Phong) VALUES (${idTaiKhoan}, ${idPhong})`
        );
        return { existed: false };
    },

    // Xoa yeu thich
    async remove(idTaiKhoan, idPhong) {
        await query(
            `DELETE FROM YeuThich WHERE ID_TaiKhoan = ${idTaiKhoan} AND ID_Phong = ${idPhong}`
        );
    },

    // Lay danh sach yeu thich cua nguoi dung
    async getByUser(idTaiKhoan) {
        return await query(`
            SELECT pt.ID_Phong, pt.TieuDe, pt.Gia, pt.DienTich, pt.DiaChiChiTiet,
                   (SELECT TOP 1 DuongDanAnh FROM HinhAnhPhong WHERE ID_Phong = pt.ID_Phong) AS AnhPhong
            FROM YeuThich yt
            JOIN PhongTro pt ON yt.ID_Phong = pt.ID_Phong
            WHERE yt.ID_TaiKhoan = ${idTaiKhoan}
        `);
    },

    // Kiem tra phong co trong yeu thich khong
    async check(idTaiKhoan, idPhong) {
        const result = await query(
            `SELECT * FROM YeuThich WHERE ID_TaiKhoan = ${idTaiKhoan} AND ID_Phong = ${idPhong}`
        );
        return result.length > 0;
    }
};

module.exports = YeuThichModel;
