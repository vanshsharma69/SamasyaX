const express = require("express")
const {
  getAllIssues,
  getIssuesByProject,
  createIssue,
  updateIssue,
  deleteIssue,
} = require("../controllers/issueController")
const { authenticateToken, requireAdmin } = require("../middleware/auth")
const { upload } = require("../config/upload")

const router = express.Router()

router.get("/", authenticateToken, getAllIssues)
router.get("/:projectId", authenticateToken, getIssuesByProject)
router.post("/", authenticateToken, upload.single("bugImage"), createIssue)
router.put("/:id", authenticateToken, updateIssue)
router.delete("/:id", authenticateToken, requireAdmin, deleteIssue)

module.exports = router
