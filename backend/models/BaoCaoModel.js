const { getRequest, sql } = require("../db");

const BaoCaoModel = {
    // Gửi báo cáo mới
    async create(data) {
        const { idNguoiBaoCao, idPhong, idChuTro, lyDo, moTa, hinhAnh } = data;
        const request = await getRequest();
        const result = await request
            .input("idNguoiBaoCao", sql.Int, idNguoiBaoCao)
            .input("idPhong", sql.Int, idPhong)
            .input("idChuTro", sql.Int, idChuTro)
            .input("lyDo", sql.NVarChar, lyDo)
            .input("moTa", sql.NVarChar, moTa || "")
            .input("hinhAnh", sql.NVarChar, hinhAnh || "")
            .query(`
                INSERT INTO BaoCao (ID_NguoiBaoCao, ID_Phong, ID_ChuTro, LyDo, MoTa, HinhAnh) 
                VALUES (@idNguoiBaoCao, @idPhong, @idChuTro, @lyDo, @moTa, @hinhAnh);
                SELECT SCOPE_IDENTITY() AS ID_BaoCao;
            `);
        return result.recordset[0].ID_BaoCao;
    },

    // Kiểm tra người dùng đã báo cáo phòng này chưa
    async checkExists(idNguoiBaoCao, idPhong) {
        const request = await getRequest();
        const result = await request
            .input("idNguoiBaoCao", sql.Int, idNguoiBaoCao)
            .input("idPhong", sql.Int, idPhong)
            .query("SELECT COUNT(*) as count FROM BaoCao WHERE ID_NguoiBaoCao = @idNguoiBaoCao AND ID_Phong = @idPhong");
        return result.recordset[0].count > 0;
    },

    // Lấy danh sách báo cáo (Admin)
    async getAll() {
        const request = await getRequest();
        const result = await request.query(`
            SELECT bc.*, 
                   tk1.HoTen AS TenNguoiBaoCao, 
                   tk2.HoTen AS TenChuTro,
                   p.TieuDe AS TenPhong,
                   p.Gia,
                   p.DienTich,
                   p.DiaChiChiTiet,
                   (SELECT TOP 1 DuongDanAnh FROM HinhAnhPhong WHERE ID_Phong = p.ID_Phong) AS AnhPhong
            FROM BaoCao bc
            LEFT JOIN TaiKhoan tk1 ON bc.ID_NguoiBaoCao = tk1.ID_TaiKhoan
            LEFT JOIN TaiKhoan tk2 ON bc.ID_ChuTro = tk2.ID_TaiKhoan
            LEFT JOIN PhongTro p ON bc.ID_Phong = p.ID_Phong
            ORDER BY bc.NgayTao DESC
        `);
        return result.recordset;
    },

    // Cập nhật trạng thái báo cáo
    async updateStatus(id, status) {
        const request = await getRequest();
        await request
            .input("id", sql.Int, id)
            .input("status", sql.NVarChar, status)
            .query("UPDATE BaoCao SET TrangThai = @status WHERE ID_BaoCao = @id");
    },

    // Lấy thông tin báo cáo theo ID
    async getById(id) {
        const request = await getRequest();
        const result = await request
            .input("id", sql.Int, id)
            .query("SELECT * FROM BaoCao WHERE ID_BaoCao = @id");
        return result.recordset.length > 0 ? result.recordset[0] : null;
    }
};

module.exports = BaoCaoModel;
