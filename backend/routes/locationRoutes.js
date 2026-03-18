// =============================================
// Routes: Location (Tinh/Quan/Phuong)
// =============================================
const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");

router.get("/tinh-thanh", locationController.getTinhThanh);
router.get("/quan-huyen/:idTinhThanh", locationController.getQuanHuyen);
router.get("/phuong-xa/:idQuanHuyen", locationController.getPhuongXa);

module.exports = router;
