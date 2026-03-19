const { Resend } = require("resend");

// Khởi tạo Resend an toàn
let resend;
try {
    if (process.env.RESEND_API_KEY) {
        resend = new Resend(process.env.RESEND_API_KEY);
    }
} catch (e) {
    console.error("❌ [Email Config] Lỗi khởi tạo Resend:", e.message);
}

console.log("📧 [Email Config] RESEND_API_KEY:", process.env.RESEND_API_KEY ? "✅ ĐÃ CÓ" : "❌ CHƯA CÓ");

/**
 * Gửi email qua Resend API với tên miền ozichouse.click
 * @param {string} to Email người nhận
 * @param {string} subject Tiêu đề email
 * @param {string} html Nội dung email
 */
const sendEmail = async (to, subject, html) => {
    try {
        if (!process.env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is missing in environment variables.");
        }
        
        if (!resend) {
            resend = new Resend(process.env.RESEND_API_KEY);
        }

        console.log(`📩 [Resend] Đang gửi email tới: ${to}...`);

        const { data, error } = await resend.emails.send({
            from: "OZIC HOUSE <no-reply@ozichouse.click>",
            to: [to],
            subject: subject,
            html: html,
        });

        if (error) {
            throw error;
        }

        console.log("✅ [Resend] Email gửi thành công! ID:", data.id);
        return data;
    } catch (error) {
        console.error("❌ [Resend] Lỗi khi gửi email:", error.message || error);
        throw error;
    }
};

module.exports = { sendEmail };
