const { connectDB, query } = require("./db");

async function test() {
    try {
        console.log("Đang kiểm tra kết nối...");
        await connectDB();
        
        console.log("Đang chạy truy vấn thử...");
        const result = await query("SELECT TOP 1 * FROM TaiKhoan");
        console.log("Kết quả truy vấn:", result);
        
        console.log("✅ Kiểm tra hoàn tất, kết nối hoạt động tốt!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Lỗi kiểm tra:", err.message);
        process.exit(1);
    }
}

test();
