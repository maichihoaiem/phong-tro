const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

// Route chat với AI
router.post("/chat", aiController.chat);
router.post("/analyze-report", aiController.analyzeReport);

module.exports = router;
