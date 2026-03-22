// =============================================
// Middleware xac thuc & phan quyen
// =============================================
const TaiKhoanModel = require("../models/TaiKhoanModel");

// Kiem tra da dang nhap chua
async function requireLogin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: "Bạn cần đăng nhập!" });
    }

    // Kiểm tra trạng thái tài khoản TRỰC TIẾP từ DB để đảm bảo tính thời gian thực (Strict Lock)
    try {
        const user = await TaiKhoanModel.getById(req.session.user.ID_TaiKhoan);
        if (!user || user.TrangThai === 'locked' || (user.TrangThai && user.TrangThai.includes('khóa'))) {
            req.session.destroy(); // Hủy session nếu bị khóa
            return res.status(403).json({ 
                success: false, 
                message: "Tài khoản của bạn vừa bị khóa do vi phạm chính sách!",
                reason: user?.GhiChuKhoa || "Vui lòng liên hệ Admin."
            });
        }
    } catch (err) {
        console.error("[Middleware Auth] Error:", err);
    }

    next();
}

// Kiem tra vai tro (Admin = 1, Chu tro = 2, Nguoi thue = 3)
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: "Bạn cần đăng nhập!" });
        }

        console.log(`[Auth] Checking role for user: ${req.session.user.Email}`);
        console.log(`[Auth] Full User Session:`, JSON.stringify(req.session.user, null, 2));
        console.log(`[Auth] Required roles: ${roles}`);

        if (!roles.some(r => r == req.session.user.ID_VaiTro)) {
            console.log(`[Auth] Access DENIED for role ${req.session.user.ID_VaiTro}`);
            return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập!" });
        }

        console.log(`[Auth] Access GRANTED`);
        next();
    };
}

module.exports = { requireLogin, requireRole };
