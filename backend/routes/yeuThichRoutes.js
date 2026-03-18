// =============================================
// Routes: YeuThich
// =============================================
const express = require("express");
const router = express.Router();
const yeuThichController = require("../controllers/yeuThichController");
const { requireLogin } = require("../middleware/auth");

router.post("/", requireLogin, yeuThichController.add);
router.delete("/:idPhong", requireLogin, yeuThichController.remove);
router.get("/", requireLogin, yeuThichController.getMyFavorites);
router.get("/check/:idPhong", requireLogin, yeuThichController.check);

module.exports = router;
