const axios = require("axios");

// Kiểm tra biến môi trường
console.log("📧 [Email Config] BREVO_API_KEY:", process.env.BREVO_API_KEY ? "✅ ĐÃ CÓ" : "❌ CHƯA CÓ");

/**
 * Gửi email dùng chung qua Brevo HTTP API (Vượt qua firewall Render)
 * @param {string} to Email người nhận
 * @param {string} subject Tiêu đề email
 * @param {string} html Nội dung email (dạng HTML)
 */
const sendEmail = async (to, subject, html) => {
    try {
        if (!process.env.BREVO_API_KEY) {
            throw new Error("BREVO_API_KEY is missing in environment variables.");
        }

        console.log(`📩 [Brevo] Đang gửi email tới: ${to}...`);

        const data = {
            sender: { name: "OZIC HOUSE", email: "ozic2464@gmail.com" }, // Email đã đăng ký Brevo
            to: [{ email: to }],
            subject: subject,
            htmlContent: html
        };

        const response = await axios.post("https://api.brevo.com/v3/smtp/email", data, {
            headers: {
                "api-key": process.env.BREVO_API_KEY,
                "Content-Type": "application/json"
            }
        });

        console.log("✅ [Brevo] Email gửi thành công! Message ID:", response.data.messageId);
        return response.data;
    } catch (error) {
        console.error("❌ [Brevo] Lỗi khi gửi email:");
        if (error.response) {
            console.error("  - Chi tiết lỗi:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("  - Thông báo:", error.message);
        }
        throw error;
    }
};

module.exports = { sendEmail };
