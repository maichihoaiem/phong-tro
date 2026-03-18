const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { requireLogin, requireRole } = require("../middleware/auth");

// Chỉ Admin (ID_VaiTro = 1) mới được truy cập
router.get("/stats/revenue", requireLogin, requireRole(1), adminController.getRevenueStats);
router.get("/room-posts", requireLogin, requireRole(1), adminController.getRoomPosts);
router.put("/room-posts/:id/moderate", requireLogin, requireRole(1), adminController.moderateRoomPost);

module.exports = router;
