const { Resend } = require("resend");

// Khởi tạo Resend với API Key từ biến môi trường
const resend = new Resend(process.env.RESEND_API_KEY);

// Kiểm tra biến môi trường
console.log("📧 [Email Config] RESEND_API_KEY:", process.env.RESEND_API_KEY ? "✅ ĐÃ CÓ" : "❌ CHƯA CÓ");

/**
 * Gửi email dùng chung qua Resend API (vượt qua firewall của Render)
 * @param {string} to Email người nhận
 * @param {string} subject Tiêu đề email
 * @param {string} html Nội dung email (dạng HTML)
 */
const sendEmail = async (to, subject, html) => {
    try {
        console.log(`📩 [Resend] Đang gửi email tới: ${to}...`);
        
        const { data, error } = await resend.emails.send({
            from: "OZIC HOUSE <onboarding@resend.dev>", // Tên miền mặc định của Resend
            to: to,
            subject: subject,
            html: html,
        });

        if (error) {
            console.error("❌ [Resend] Lỗi API:", error.message);
            throw error;
        }

        console.log("✅ [Resend] Email gửi thành công! ID:", data.id);
        return data;
    } catch (error) {
        console.error("❌ [Resend] Lỗi hệ thống khi gửi email:");
        console.error("  - Thông báo:", error.message);
        throw error;
    }
};

module.exports = { sendEmail };
