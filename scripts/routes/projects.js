const express = require("express")
const { getProjects, createProject, deleteProject } = require("../controllers/projectController")
const { authenticateToken, requireAdmin } = require("../middleware/auth")

const router = express.Router()

router.get("/", authenticateToken, getProjects)
router.post("/", authenticateToken, requireAdmin, createProject)
router.delete("/:id", authenticateToken, requireAdmin, deleteProject)

module.exports = router
