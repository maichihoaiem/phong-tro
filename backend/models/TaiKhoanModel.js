// =============================================
// Model: TaiKhoan
// Cot: ID_TaiKhoan, HoTen, Email, MatKhau, SoDienThoai, AnhDaiDien, ID_VaiTro, TrangThai, NgayTao
// =============================================
const { getRequest, sql } = require("../db");

const TaiKhoanModel = {
    // Cập nhật trạng thái và ghi chú khóa tài khoản
    async updateStatusAndNote(id, status, note) {
        const request = await getRequest();
        await request
            .input("id", sql.Int, id)
            .input("status", sql.NVarChar, status)
            .input("note", sql.NVarChar, note)
            .query("UPDATE TaiKhoan SET TrangThai = @status, GhiChuKhoa = @note WHERE ID_TaiKhoan = @id");
    },

    // Tìm tài khoản theo email
    async findByEmail(email) {
        const request = await getRequest();
        const result = await request
            .input("email", sql.NVarChar, email)
            .query(`
                SELECT tk.*, vt.TenVaiTro 
                FROM TaiKhoan tk 
                JOIN VaiTro vt ON tk.ID_VaiTro = vt.ID_VaiTro 
                WHERE tk.Email = @email
            `);
        return result.recordset.length > 0 ? result.recordset[0] : null;
    },

    // Tạo tài khoản mới
    async create(hoTen, email, matKhau, soDienThoai, idVaiTro) {
        const request = await getRequest();
        await request
            .input("hoTen", sql.NVarChar, hoTen)
            .input("email", sql.NVarChar, email)
            .input("matKhau", sql.NVarChar, matKhau)
            .input("soDienThoai", sql.NVarChar, soDienThoai)
            .input("idVaiTro", sql.Int, idVaiTro)
            .query(`
                INSERT INTO TaiKhoan (HoTen, Email, MatKhau, SoDienThoai, ID_VaiTro) 
                VALUES (@hoTen, @email, @matKhau, @soDienThoai, @idVaiTro)
            `);
        return await TaiKhoanModel.findByEmail(email);
    },

    // Lấy tất cả tài khoản (Admin)
    async getAll(name) {
        const request = await getRequest();
        let queryStr = `
            SELECT tk.ID_TaiKhoan, tk.HoTen, tk.Email, tk.SoDienThoai, tk.NgayTao, tk.TrangThai, vt.TenVaiTro 
            FROM TaiKhoan tk 
            JOIN VaiTro vt ON tk.ID_VaiTro = vt.ID_VaiTro
        `;
        
        if (name) {
            request.input("name", sql.NVarChar, `%${name}%`);
            queryStr += ` WHERE tk.HoTen LIKE @name`;
        }
        
        queryStr += ` ORDER BY tk.NgayTao DESC`;
        const result = await request.query(queryStr);
        return result.recordset;
    },

    // Lấy tài khoản theo ID
    async getById(id) {
        const request = await getRequest();
        const result = await request
            .input("id", sql.Int, id)
            .query(`
                SELECT tk.ID_TaiKhoan, tk.HoTen, tk.Email, tk.SoDienThoai, tk.AnhDaiDien, tk.NgayTao, 
                       tk.SoTaiKhoan, tk.TenNganHang, tk.ChuTaiKhoan, tk.SoDu, vt.TenVaiTro 
                FROM TaiKhoan tk 
                JOIN VaiTro vt ON tk.ID_VaiTro = vt.ID_VaiTro 
                WHERE tk.ID_TaiKhoan = @id
            `);
        return result.recordset.length > 0 ? result.recordset[0] : null;
    },

    // Cập nhật số dư (Wallet)
    async updateBalance(id, amount) {
        const request = await getRequest();
        await request
            .input("id", sql.Int, id)
            .input("amount", sql.Decimal(18, 2), amount)
            .query("UPDATE TaiKhoan SET SoDu = ISNULL(SoDu, 0) + @amount WHERE ID_TaiKhoan = @id");
        return await TaiKhoanModel.getById(id);
    },

    // Cập nhật thông tin cá nhân
    async updateProfile(id, data) {
        const { hoTen, soDienThoai, soTaiKhoan, tenNganHang, chuTaiKhoan } = data;
        const request = await getRequest();
        await request
            .input("id", sql.Int, id)
            .input("hoTen", sql.NVarChar, hoTen)
            .input("soDienThoai", sql.NVarChar, soDienThoai)
            .input("soTaiKhoan", sql.NVarChar, soTaiKhoan || "")
            .input("tenNganHang", sql.NVarChar, tenNganHang || "")
            .input("chuTaiKhoan", sql.NVarChar, chuTaiKhoan || "")
            .query(`
                UPDATE TaiKhoan 
                SET HoTen = @hoTen, 
                    SoDienThoai = @soDienThoai,
                    SoTaiKhoan = @soTaiKhoan,
                    TenNganHang = @tenNganHang,
                    ChuTaiKhoan = @chuTaiKhoan
                WHERE ID_TaiKhoan = @id
            `);
        return await TaiKhoanModel.getById(id);
    },

    // Đổi mật khẩu
    async changePassword(id, newPassword) {
        const request = await getRequest();
        await request
            .input("id", sql.Int, id)
            .input("newPassword", sql.NVarChar, newPassword)
            .query("UPDATE TaiKhoan SET MatKhau = @newPassword WHERE ID_TaiKhoan = @id");
    },

    // Lấy tài khoản Admin
    async getAdminAccount() {
        const request = await getRequest();
        const result = await request.query(`
            SELECT TOP 1 tk.SoTaiKhoan, tk.TenNganHang, tk.ChuTaiKhoan 
            FROM TaiKhoan tk 
            JOIN VaiTro vt ON tk.ID_VaiTro = vt.ID_VaiTro 
            WHERE vt.TenVaiTro = N'Admin' OR vt.ID_VaiTro = 1
        `);
        return result.recordset.length > 0 ? result.recordset[0] : null;
    }
};

module.exports = TaiKhoanModel;
