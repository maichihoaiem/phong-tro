// =============================================
// Controller: Auth (Dang ky, Dang nhap)
// =============================================
const TaiKhoanModel = require("../models/TaiKhoanModel");
const { sendEmail } = require("../utils/emailService");

// Bộ nhớ tạm lưu OTP: { email: { otp, expires } }
const otpStore = new Map();

const authController = {
    // Khóa/mở tài khoản (Admin)
    async lockOrUnlockUser(req, res) {
        try {
            const { id } = req.params;
            const { action, note } = req.body; // action: 'lock' hoặc 'unlock', note: lý do
            if (!id || !action || (action === 'lock' && !note)) {
                return res.status(400).json({ success: false, message: "Thiếu thông tin!" });
            }
            const user = await TaiKhoanModel.getById(id);
            if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản!" });
            if (user.TenVaiTro === 'Admin') return res.status(403).json({ success: false, message: "Không thể khóa/mở tài khoản Admin!" });

            let status = action === 'lock' ? 'locked' : 'active';
            await TaiKhoanModel.updateStatusAndNote(id, status, action === 'lock' ? note : null);

            // Gửi email khi khóa tài khoản
            if (action === 'lock') {
                const subject = "Tài khoản của bạn đã bị khóa";
                const html = `
                    <div style='font-family:sans-serif;max-width:500px;margin:0 auto;border:1px solid #eee;padding:20px;border-radius:10px;'>
                        <h2 style='color:#d32f2f;text-align:center;'>Tài khoản bị khóa</h2>
                        <p>Xin chào <b>${user.HoTen}</b>,</p>
                        <p>Tài khoản của bạn trên hệ thống <b>OZIC HOUSE</b> đã bị <b>khóa</b> bởi quản trị viên.</p>
                        <p><b>Lý do khóa:</b></p>
                        <div style='background:#f8d7da;padding:12px;border-radius:6px;color:#721c24;'>${note}</div>
                        <p>Nếu bạn cần hỗ trợ, vui lòng liên hệ quản trị viên.</p>
                        <hr style='border:none;border-top:1px solid #eee;margin:20px 0;'>
                        <p style='font-size:12px;color:#9CA3AF;text-align:center;'>OZIC HOUSE - Hệ thống quản lý phòng trọ</p>
                    </div>
                `;
                try {
                    await sendEmail(user.Email, subject, html);
                } catch (e) {
                    console.error("Lỗi gửi email khóa tài khoản:", e);
                }
            }

            res.json({ success: true, message: action === 'lock' ? 'Đã khóa tài khoản!' : 'Đã mở khóa tài khoản!' });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Quên mật khẩu - Gửi OTP
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ success: false, message: "Vui lòng nhập email!" });

            const user = await TaiKhoanModel.findByEmail(email);
            if (!user) return res.status(404).json({ success: false, message: "Email không tồn tại trong hệ thống!" });

            // Tạo OTP 6 chữ số
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = Date.now() + 5 * 60 * 1000; // Hết hạn sau 5 phút

            otpStore.set(email, { otp, expires });

            // Gửi email
            const mailOptions = {
                from: `"OZIC HOUSE" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Mã xác thực OTP để đặt lại mật khẩu",
                html: `
                    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #2563EB; text-align: center;">OZIC HOUSE</h2>
                        <p>Chào bạn,</p>
                        <p>Bạn đang yêu cầu đặt lại mật khẩu. Mã OTP của bạn là:</p>
                        <div style="background: #F3F4F6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1D4ED8; border-radius: 8px;">
                            ${otp}
                        </div>
                        <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">Mã này sẽ hết hạn sau <b>5 phút</b>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #9CA3AF; text-align: center;">Ozic House - Hệ thống quản lý phòng trọ cao cấp</p>
                    </div>
                `
            };

            await sendEmail(email, "Mã xác thực OTP để đặt lại mật khẩu", mailOptions.html);
            res.json({ success: true, message: "Mã OTP đã được gửi vào Gmail của bạn!" });
        } catch (err) {
            console.error("Lỗi gửi OTP:", err);
            res.status(500).json({ success: false, message: "Lỗi khi gửi email!", error: err.message });
        }
    },

    // Xác thực OTP
    async verifyOTP(req, res) {
        const { email, otp } = req.body;
        const record = otpStore.get(email);

        if (!record || record.otp !== otp || Date.now() > record.expires) {
            return res.status(400).json({ success: false, message: "Mã OTP không đúng hoặc đã hết hạn!" });
        }

        res.json({ success: true, message: "Xác thực thành công!" });
    },

    // Đặt lại mật khẩu mới
    async resetPassword(req, res) {
        try {
            const { email, otp, matKhauMoi } = req.body;
            const record = otpStore.get(email);

            if (!record || record.otp !== otp || Date.now() > record.expires) {
                return res.status(400).json({ success: false, message: "Mã OTP không hợp lệ!" });
            }

            if (!matKhauMoi || matKhauMoi.length < 6) {
                return res.status(400).json({ success: false, message: "Mật khẩu mới phải từ 6 ký tự!" });
            }

            const user = await TaiKhoanModel.findByEmail(email);
            await TaiKhoanModel.changePassword(user.ID_TaiKhoan, matKhauMoi);

            // Xóa OTP khỏi memory
            otpStore.delete(email);

            res.json({ success: true, message: "Đặt lại mật khẩu thành công!" });
        } catch (err) {
            res.status(500).json({ success: false, message: "Lỗi đặt lại mật khẩu!" });
        }
    },

    // Dang ky tai khoan
    async register(req, res) {
        try {
            const { hoTen, email, matKhau, soDienThoai, vaiTro } = req.body;

            // Validate
            if (!hoTen || !email || !matKhau) {
                return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin!" });
            }

            // Kiểm tra email đã tồn tại
            const existing = await TaiKhoanModel.findByEmail(email);
            if (existing) {
                return res.status(400).json({ success: false, message: "Email đã được sử dụng!" });
            }

            // Tạo tài khoản (vaiTro: 2 = Chủ trọ, 3 = Người thuê, mặc định là 3)
            const idVaiTro = vaiTro === "chutro" ? 2 : 3;
            const user = await TaiKhoanModel.create(hoTen, email, matKhau, soDienThoai || '', idVaiTro);

            // Lưu session
            req.session.user = {
                ID_TaiKhoan: user.ID_TaiKhoan,
                HoTen: user.HoTen,
                Email: user.Email,
                ID_VaiTro: user.ID_VaiTro,
                TenVaiTro: user.TenVaiTro
            };

            res.json({ success: true, message: "Đăng ký thành công!", user: req.session.user });
        } catch (err) {
            res.status(500).json({ success: false, message: "Lỗi hệ thống!", error: err.message });
        }
    },

    // Dang nhap
    async login(req, res) {
        try {
            const { email, matKhau } = req.body;

            if (!email || !matKhau) {
                return res.status(400).json({ success: false, message: "Vui lòng nhập email và mật khẩu!" });
            }

            const user = await TaiKhoanModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({ success: false, message: "Email không tồn tại!" });
            }

            if (user.TrangThai === 'locked') {
                return res.status(403).json({ success: false, message: "Tài khoản của bạn đã bị khóa!", reason: user.GhiChuKhoa || "Tài khoản bị khóa bởi quản trị viên." });
            }

            if (user.MatKhau !== matKhau) {
                return res.status(401).json({ success: false, message: "Mật khẩu không đúng!" });
            }

            // Lưu session
            req.session.user = {
                ID_TaiKhoan: user.ID_TaiKhoan,
                HoTen: user.HoTen,
                Email: user.Email,
                ID_VaiTro: user.ID_VaiTro,
                TenVaiTro: user.TenVaiTro
            };

            res.json({ success: true, message: "Đăng nhập thành công!", user: req.session.user });
        } catch (err) {
            res.status(500).json({ success: false, message: "Lỗi hệ thống!", error: err.message });
        }
    },

    // Đăng xuất
    async logout(req, res) {
        req.session.destroy();
        res.json({ success: true, message: "Đã đăng xuất!" });
    },

    // Lấy thông tin người dùng hiện tại
    async getMe(req, res) {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "Chưa đăng nhập!" });
        }
        res.json({ success: true, user: req.session.user });
    },

    // Lay tat ca tai khoan (Admin)
    async getAllUsers(req, res) {
        try {
            const { name } = req.query;
            const users = await TaiKhoanModel.getAll(name);
            res.json({ success: true, data: users });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Cap nhat thong tin ca nhan
    async updateProfile(req, res) {
        try {
            const { hoTen } = req.body;
            if (!hoTen) {
                return res.status(400).json({ success: false, message: "Họ tên không được để trống!" });
            }

            // Nếu không phải Admin hoặc Chủ trọ, xóa các trường ngân hàng để tránh bị hack/ghi đè
            if (req.session.user.TenVaiTro !== 'Admin' && req.session.user.TenVaiTro !== 'Chủ trọ') {
                delete req.body.soTaiKhoan;
                delete req.body.tenNganHang;
                delete req.body.chuTaiKhoan;
            }

            const updated = await TaiKhoanModel.updateProfile(
                req.session.user.ID_TaiKhoan, req.body
            );
            console.log("Updated Profile Result:", updated);
            // Cập nhật session
            req.session.user.HoTen = updated.HoTen;
            res.json({
                success: true, message: "Cập nhật thành công!", user: {
                    ID_TaiKhoan: updated.ID_TaiKhoan,
                    HoTen: updated.HoTen,
                    Email: updated.Email,
                    SoDienThoai: updated.SoDienThoai,
                    SoTaiKhoan: updated.SoTaiKhoan,
                    TenNganHang: updated.TenNganHang,
                    ChuTaiKhoan: updated.ChuTaiKhoan,
                    TenVaiTro: updated.TenVaiTro,
                    NgayTao: updated.NgayTao
                }
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Đổi mật khẩu
    async changePassword(req, res) {
        try {
            const { matKhauCu, matKhauMoi } = req.body;
            if (!matKhauCu || !matKhauMoi) {
                return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ mật khẩu!" });
            }
            if (matKhauMoi.length < 6) {
                return res.status(400).json({ success: false, message: "Mật khẩu mới phải có ít nhất 6 ký tự!" });
            }
            // Kiểm tra mật khẩu cũ
            const user = await TaiKhoanModel.findByEmail(req.session.user.Email);
            if (user.MatKhau !== matKhauCu) {
                return res.status(400).json({ success: false, message: "Mật khẩu cũ không đúng!" });
            }
            await TaiKhoanModel.changePassword(req.session.user.ID_TaiKhoan, matKhauMoi);
            res.json({ success: true, message: "Đổi mật khẩu thành công!" });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Lấy thông tin chi tiết tài khoản
    async getProfile(req, res) {
        try {
            const user = await TaiKhoanModel.getById(req.session.user.ID_TaiKhoan);
            if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản!" });
            res.json({ success: true, data: user });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
};

module.exports = authController;
