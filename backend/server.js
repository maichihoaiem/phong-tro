// =============================================
// Server chinh - Entry Point
// =============================================
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const { connectDB } = require("./db");

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
    secret: "phongtro_secret_key_2024",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 ngay
}));

// Serve static files tu frontend
app.use(express.static(path.join(__dirname, "../frontend")));
// Serve folder anh (Dung chung 1 thu muc uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer Configuration (Dùng cho Cloudinary)
const multer = require("multer");
const cloudinary = require('cloudinary').v2;

const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'phong-tro',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

// Upload API
app.post("/api/upload", upload.array("images", 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: "Khong co file nao!" });
        }
        // Cloudinary tra ve 'path' hoac 'secure_url'
        const urls = req.files.map(f => f.path || f.secure_url);
        console.log("Uploaded Cloudinary URLs:", urls);
        res.json({ success: true, urls });

    } catch (error) {
        console.error("Lỗi upload Cloudinary:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});


// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/phong-tro", require("./routes/phongTroRoutes"));
app.use("/api/location", require("./routes/locationRoutes"));
app.use("/api/dat-phong", require("./routes/datPhongRoutes"));
app.use("/api/yeu-thich", require("./routes/yeuThichRoutes"));
app.use("/api/wallet", require("./routes/walletRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));

// Ket noi DB va start server
connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Kết nối server thành công tại cổng ${PORT}`);
    });
}).catch((err) => {

    console.error("Khong the khoi dong server:", err.message);
});