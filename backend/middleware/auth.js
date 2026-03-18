// =============================================
// Middleware xac thuc & phan quyen
// =============================================

// Kiem tra da dang nhap chua
function requireLogin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: "Bạn cần đăng nhập!" });
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
