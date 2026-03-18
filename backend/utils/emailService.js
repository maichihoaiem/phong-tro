const { Resend } = require("resend");

// Khởi tạo Resend một cách an toàn
let resend;
try {
    if (process.env.RESEND_API_KEY) {
        resend = new Resend(process.env.RESEND_API_KEY);
        console.log("📧 [Email Config] Khởi tạo Resend thành công.");
    } else {
        console.warn("⚠️ [Email Config] Cảnh báo: RESEND_API_KEY chưa được thiết lập!");
    }
} catch (e) {
    console.error("❌ [Email Config] Lỗi khi khởi tạo Resend:", e.message);
}

/**
 * Gửi email dùng chung qua Resend API (vượt qua firewall của Render)
 * @param {string} to Email người nhận
 * @param {string} subject Tiêu đề email
 * @param {string} html Nội dung email (dạng HTML)
 */
const sendEmail = async (to, subject, html) => {
    try {
        if (!resend) {
            // Thử khởi tạo lại nếu lúc đầu chưa có key (trong trường hợp dotenv load chậm)
            if (process.env.RESEND_API_KEY) {
                resend = new Resend(process.env.RESEND_API_KEY);
            } else {
                throw new Error("RESEND_API_KEY is missing. Please set it in environment variables.");
            }
        }

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
