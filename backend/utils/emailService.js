const nodemailer = require("nodemailer");
const { Resend } = require("resend");

// Khởi tạo Resend an toàn
let resend;
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
}

// Khởi tạo Nodemailer (Sử dụng Gmail app pass từ .env)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

console.log("📧 [Email Config] RESEND_API_KEY:", process.env.RESEND_API_KEY ? "✅ ĐÃ CÓ" : "❌ CHƯA CÓ (Dùng Nodemailer)");
console.log("📧 [Email Config] GMAIL_CONFIG:", (process.env.EMAIL_USER && process.env.EMAIL_PASS) ? "✅ ĐÃ CÓ" : "❌ CHƯA CÓ");

/**
 * Gửi email (Tự động chọn Resend nếu có, fallback về Nodemailer/Gmail)
 */
const sendEmail = async (to, subject, html) => {
    try {
        if (process.env.RESEND_API_KEY) {
            console.log(`📩 [Resend] Đang gửi email tới: ${to}...`);
            const { data, error } = await resend.emails.send({
                from: "OZIC HOUSE <no-reply@ozichouse.click>",
                to: [to],
                subject: subject,
                html: html,
            });
            if (error) throw error;
            console.log("✅ [Resend] Email gửi thành công! ID:", data.id);
            return data;
        } else {
            console.log(`📩 [Nodemailer] Đang gửi email tới: ${to}...`);
            const mailOptions = {
                from: `"OZIC HOUSE" <${process.env.EMAIL_USER}>`,
                to: to,
                subject: subject,
                html: html
            };
            const info = await transporter.sendMail(mailOptions);
            console.log("✅ [Nodemailer] Email gửi thành công! MessageId:", info.messageId);
            return info;
        }
    } catch (error) {
        console.error("❌ [Email Service] Lỗi khi gửi email:", error.message || error);
        throw error;
    }
};

module.exports = { sendEmail };
