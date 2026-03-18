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

// Multer config for file uploads
const multer = require("multer");
const fs = require("fs");
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

// Upload API
app.post("/api/upload", upload.array("images", 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, error: "Khong co file nao!" });
    }
    const urls = req.files.map(f => `/uploads/${f.filename}`);
    res.json({ success: true, urls });
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
    app.listen(5000, () => {
        console.log("Kết nối server thành công");
    });
}).catch((err) => {
    console.error("Khong the khoi dong server:", err.message);
});