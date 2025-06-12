const express = require("express")
const {
  getUsers,
  assignProjects,
  updateRole,
  toggleStatus,
  changePassword,
  exportUserData,
} = require("../controllers/userController")
const { authenticateToken, requireAdmin } = require("../middleware/auth")

const router = express.Router()

router.get("/", authenticateToken, requireAdmin, getUsers)
router.put("/:id/assign-projects", authenticateToken, requireAdmin, assignProjects)
router.put("/:id/update-role", authenticateToken, requireAdmin, updateRole)
router.put("/:id/toggle-status", authenticateToken, requireAdmin, toggleStatus)
router.put("/change-password", authenticateToken, changePassword)
router.get("/export/user-data", authenticateToken, exportUserData)

module.exports = router
