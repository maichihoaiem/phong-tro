// =============================================
// Model: TaiKhoan
// Cot: ID_TaiKhoan, HoTen, Email, MatKhau, SoDienThoai, AnhDaiDien, ID_VaiTro, TrangThai, NgayTao
// =============================================
const { getRequest, sql } = require("../db");
const { sendEmail } = require("../utils/emailService");

const TaiKhoanModel = {
    // Cập nhật trạng thái và ghi chú khóa tài khoản
    async updateStatusAndNote(id, status, note) {
        const request = await getRequest();
        let query = "UPDATE TaiKhoan SET TrangThai = @status, GhiChuKhoa = @note";
        if (status === 'active') {
            query += ", SoLanBiBaoCao = 0";
        }
        query += " WHERE ID_TaiKhoan = @id";

        await request
            .input("id", sql.Int, id)
            .input("status", sql.NVarChar, status)
            .input("note", sql.NVarChar, note)
            .query(query);
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
            SELECT tk.ID_TaiKhoan, tk.HoTen, tk.Email, tk.SoDienThoai, tk.NgayTao, tk.TrangThai, 
                   tk.SoLanBiBaoCao, vt.TenVaiTro 
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
    },

    // Tăng số lần bị báo cáo và tự động khóa nếu >= 3
    async incrementReportCount(id, reason) {
        const idInt = parseInt(id);
        const request = await getRequest();
        
        // 1. Tăng số lần báo cáo
        await request
            .input("id", sql.Int, idInt)
            .query("UPDATE TaiKhoan SET SoLanBiBaoCao = ISNULL(SoLanBiBaoCao, 0) + 1 WHERE ID_TaiKhoan = @id");
        
        // 2. Kiểm tra để khóa tài khoản
        const result = await request
            .input("id_check", sql.Int, idInt)
            .query("SELECT SoLanBiBaoCao FROM TaiKhoan WHERE ID_TaiKhoan = @id_check");
        
        const count = result.recordset[0].SoLanBiBaoCao;
        
        if (count >= 3) {
            const user = await TaiKhoanModel.getById(idInt);
            const lockNote = `Tài khoản bị báo cáo quá nhiều lần từ nhiều người.`;
            
            await request
                .input("id_lock", sql.Int, idInt)
                .input("note", sql.NVarChar, lockNote)
                .query("UPDATE TaiKhoan SET TrangThai = N'đã khóa', GhiChuKhoa = @note WHERE ID_TaiKhoan = @id_lock");

            // Gửi email thông báo cho chủ trọ
            const subject = "THÔNG BÁO: Tài khoản của bạn đã bị khóa tự động";
            const html = `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #fecaca;border-radius:15px;overflow:hidden;">
                    <div style="background:#ef4444;padding:20px;text-align:center;">
                        <h1 style="color:white;margin:0;font-size:24px;">Tài Khoản Bị Khóa</h1>
                    </div>
                    <div style="padding:30px;background:white;">
                        <p>Xin chào <b>${user.HoTen}</b>,</p>
                        <p>Hệ thống <b>OZIC HOUSE</b> thông báo tài khoản của bạn đã bị <b>khóa tự động</b>.</p>
                        <div style="background:#fff1f2;border-left:4px solid #ef4444;padding:15px;margin:20px 0;border-radius:8px;">
                            <p style="margin:0;font-weight:bold;color:#b91c1c;">Lý do:</p>
                            <p style="margin:5px 0 0 0;color:#7f1d1d;">${lockNote}</p>
                        </div>
                        <p>Tài khoản của bạn đã bị báo cáo quá nhiều lần từ nhiều người dùng khác nhau và đã được hệ thống xác nhận vi phạm chính sách cộng đồng.</p>
                        <p>Theo quy định, tài khoản sẽ bị đình chỉ hoạt động cho đến khi có quyết định mới từ Ban quản trị.</p>
                        <p>Mọi thắc mắc vui lòng liên hệ bộ phận hỗ trợ của chúng tôi.</p>
                        <div style="margin-top:30px;text-align:center;">
                            <a href="mailto:support@ozichouse.click" style="background:#4b5563;color:white;padding:12px 25px;text-decoration:none;border-radius:10px;font-weight:bold;">Liên hệ hỗ trợ</a>
                        </div>
                    </div>
                    <div style="background:#f9fafb;padding:15px;text-align:center;color:#9ca3af;font-size:12px;">
                        © 2026 OZIC HOUSE - Hệ sinh thái quản lý phòng trọ chuyên nghiệp
                    </div>
                </div>
            `;
            try {
                await sendEmail(user.Email, subject, html);
            } catch (err) {
                console.error("Lỗi gửi email khóa tự động:", err);
            }

            return true; // Đã khóa
        }
        return false; // Chưa khóa
    }
};

module.exports = TaiKhoanModel;
