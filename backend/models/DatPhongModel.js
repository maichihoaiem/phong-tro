// =============================================
// Model: DatPhong
// Cot: ID_DatPhong, ID_Phong, ID_TaiKhoan, NgayThue, GhiChu, TrangThai, NgayDat
// =============================================
const { query } = require("../db");

const DatPhongModel = {
    // Dat phong (Nguoi thue)
    async create(idTaiKhoan, idPhong, ghiChu, loaiDat, soTien, maGiaoDich) {
        const result = await query(`
            INSERT INTO DatPhong (ID_TaiKhoan, ID_Phong, GhiChu, LoaiDat, SoTien, MaGiaoDich, TrangThaiThanhToan, TrangThai) 
            OUTPUT INSERTED.ID_DatPhong
            VALUES (${idTaiKhoan}, ${idPhong}, N'${ghiChu || ''}', N'${loaiDat}', ${soTien}, '${maGiaoDich}', N'Chưa thanh toán', N'Chờ thanh toán')
        `);
        return result[0].ID_DatPhong;
    },

    // Lay danh sach dat phong cua nguoi thue
    async getByUser(idTaiKhoan) {
        return await query(`
            SELECT dp.*, pt.TieuDe, pt.Gia, pt.DiaChiChiTiet,
                   (SELECT TOP 1 DuongDanAnh FROM HinhAnhPhong WHERE ID_Phong = pt.ID_Phong) AS AnhPhong
            FROM DatPhong dp
            JOIN PhongTro pt ON dp.ID_Phong = pt.ID_Phong
            WHERE dp.ID_TaiKhoan = ${idTaiKhoan}
            ORDER BY dp.NgayDat DESC
        `);
    },

    // Lay danh sach dat phong cho chu tro duyet (Kem thong tin ngan hang nguoi thue neu can hoan tien)
    async getByOwner(idTaiKhoan) {
        return await query(`
            SELECT dp.*, pt.TieuDe, pt.Gia, 
                   tk.HoTen AS TenNguoiThue, tk.SoDienThoai AS SDTNguoiThue, tk.Email AS EmailNguoiThue,
                   tk.SoTaiKhoan AS STK_NguoiThue, tk.TenNganHang AS NganHang_NguoiThue, tk.ChuTaiKhoan AS ChuTK_NguoiThue
            FROM DatPhong dp
            JOIN PhongTro pt ON dp.ID_Phong = pt.ID_Phong
            JOIN TaiKhoan tk ON dp.ID_TaiKhoan = tk.ID_TaiKhoan
            WHERE pt.ID_TaiKhoan = ${idTaiKhoan}
            AND dp.TrangThaiThanhToan != N'Chưa thanh toán'
            ORDER BY dp.NgayDat DESC
        `);
    },

    // Cap nhat trang thai (Chu tro duyet)
    async updateStatus(idDatPhong, trangThai) {
        await query(`UPDATE DatPhong SET TrangThai = N'${trangThai}' WHERE ID_DatPhong = ${idDatPhong}`);
    },

    // Cap nhat trang thai thanh toan
    async updatePaymentStatus(idDatPhong, ttThanhToan, trangThaiChung = null) {
        let sql = `UPDATE DatPhong SET TrangThaiThanhToan = N'${ttThanhToan}'`;
        if (trangThaiChung) {
            sql += `, TrangThai = N'${trangThaiChung}'`;
        }
        sql += ` WHERE ID_DatPhong = ${idDatPhong}`;
        await query(sql);
    },

    // Tim theo ID
    async getById(id) {
        const res = await query(`SELECT * FROM DatPhong WHERE ID_DatPhong = ${id}`);
        return res[0];
    },

    // Tim theo MaGiaoDich
    async getByMaGiaoDich(maGiaoDich) {
        const res = await query(`SELECT * FROM DatPhong WHERE MaGiaoDich = '${maGiaoDich}'`);
        return res[0];
    },

    // Lay tat ca (Admin)
    async getAll() {
        return await query(`
            SELECT dp.*, pt.TieuDe, tk.HoTen AS TenNguoiThue
            FROM DatPhong dp
            JOIN PhongTro pt ON dp.ID_Phong = pt.ID_Phong
            JOIN TaiKhoan tk ON dp.ID_TaiKhoan = tk.ID_TaiKhoan
            ORDER BY dp.NgayDat DESC
        `);
    },

    // Tu dong tu choi cac yeu cau khac cua cung 1 phong
    async rejectOtherBookings(idPhong, excludeIdDatPhong) {
        await query(`
            UPDATE DatPhong 
            SET TrangThai = N'Từ chối', TrangThaiThanhToan = N'Chờ hoàn tiền (Chưa có STK)'
            WHERE ID_Phong = ${idPhong} 
            AND ID_DatPhong != ${excludeIdDatPhong}
            AND TrangThai IN (N'Chờ duyệt', N'Chờ thanh toán', N'Chờ xác nhận')
        `);
    },

    // Lay tat ca ca yeu cau dang cho hoan tien (Admin)
    async getAdminRefunds() {
        return await query(`
            SELECT dp.*, pt.TieuDe, 
                   tk_tenant.HoTen AS TenNguoiThue, tk_tenant.SoDienThoai AS SDT_NguoiThue,
                   tk_owner.HoTen AS TenChuTro, tk_owner.SoDienThoai AS SDT_ChuTro
            FROM DatPhong dp
            JOIN PhongTro pt ON dp.ID_Phong = pt.ID_Phong
            JOIN TaiKhoan tk_tenant ON dp.ID_TaiKhoan = tk_tenant.ID_TaiKhoan
            JOIN TaiKhoan tk_owner ON pt.ID_TaiKhoan = tk_owner.ID_TaiKhoan
            WHERE dp.TrangThaiThanhToan IN (N'Chờ hoàn tiền (Đã có STK)', N'Chờ hoàn tiền (Chưa có STK)', N'Đã hoàn tiền')
            ORDER BY dp.ID_DatPhong DESC
        `);
    },

    // Cap nhat thong tin STK hoan tien (Nguoi thue)
    async updateRefundInfo(idDatPhong, stk, nganHang, chuTk) {
        await query(`
            UPDATE DatPhong 
            SET STK_NguoiThue = N'${stk}',
                NganHang_NguoiThue = N'${nganHang}',
                ChuTK_NguoiThue = N'${chuTk}',
                TrangThaiThanhToan = N'Chờ hoàn tiền (Đã có STK)'
            WHERE ID_DatPhong = ${idDatPhong}
        `);
    },

    // Admin xac nhan da hoan tien cho khach
    async resolveDispute(idDatPhong) {
        await query(`
            UPDATE DatPhong 
            SET TrangThaiThanhToan = N'Đã hoàn tiền',
                NgayHoanTien = GETDATE()
            WHERE ID_DatPhong = ${idDatPhong}
        `);
    }
};

module.exports = DatPhongModel;
