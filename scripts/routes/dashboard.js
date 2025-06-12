const express = require("express")
const { getStats } = require("../controllers/dashboardController")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

router.get("/stats", authenticateToken, getStats)

module.exports = router
