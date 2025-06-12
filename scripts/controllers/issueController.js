const Issue = require("../models/Issue")
const Project = require("../models/Project")
const User = require("../models/User")
const path = require("path")
const fs = require("fs")

const getAllIssues = async (req, res) => {
  try {
    let filter = {}

    // Role-based filtering
    if (req.user.role === "Developer") {
      const userProjects = await Project.find({ assignedUsers: req.user._id }).select("_id")
      const projectIds = userProjects.map((p) => p._id)
      filter = { project: { $in: projectIds } }
    } else if (req.user.role === "Client") {
      const userProjects = await Project.find({ assignedUsers: req.user._id }).select("_id")
      const projectIds = userProjects.map((p) => p._id)
      const adminUsers = await User.find({ role: "Admin" }).select("_id")

      filter = {
        project: { $in: projectIds },
        $or: [{ reporter: req.user._id }, { reporter: { $in: adminUsers } }],
      }
    }

    const issues = await Issue.find(filter)
      .populate("project", "name")
      .populate("assignedTo", "email")
      .populate("reporter", "email")
      .sort({ createdAt: -1 })

    res.json(issues)
  } catch (error) {
    console.error("Get issues error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const getIssuesByProject = async (req, res) => {
  try {
    const { projectId } = req.params

    // Check if user has access to this project
    if (req.user.role === "Developer" || req.user.role === "Client") {
      const project = await Project.findOne({
        _id: projectId,
        assignedUsers: req.user._id,
      })
      if (!project) {
        return res.status(403).json({ message: "Access denied to this project" })
      }
    }

    let filter = { project: projectId }

    // For clients, only show issues they created or admin created
    if (req.user.role === "Client") {
      const adminUsers = await User.find({ role: "Admin" }).select("_id")
      filter = {
        project: projectId,
        $or: [{ reporter: req.user._id }, { reporter: { $in: adminUsers } }],
      }
    }

    const issues = await Issue.find(filter)
      .populate("project", "name")
      .populate("assignedTo", "email")
      .populate("reporter", "email")
      .sort({ createdAt: -1 })

    res.json(issues)
  } catch (error) {
    console.error("Get issues error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const createIssue = async (req, res) => {
  try {
    const { title, description, priority, status, project, expectedOutcome, currentOutcome } = req.body

    // Check if user has access to this project
    if (req.user.role === "Developer" || req.user.role === "Client") {
      const projectDoc = await Project.findOne({
        _id: project,
        assignedUsers: req.user._id,
      })
      if (!projectDoc) {
        return res.status(403).json({ message: "Access denied to this project" })
      }
    }

    const issue = new Issue({
      title,
      description,
      priority,
      status,
      project,
      expectedOutcome,
      currentOutcome,
      reporter: req.user._id,
      bugImage: req.file ? `/uploads/${req.file.filename}` : undefined,
    })

    await issue.save()
    await issue.populate("project", "name")
    await issue.populate("assignedTo", "email")
    await issue.populate("reporter", "email")

    res.status(201).json(issue)
  } catch (error) {
    console.error("Create issue error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const updateIssue = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, priority, status, expectedOutcome, currentOutcome } = req.body

    const issue = await Issue.findById(id)
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" })
    }

    // Check permissions - Clients can only edit their own issues
    if (req.user.role === "Client" && issue.reporter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Clients can only edit their own issues" })
    }

    // Check if user has access to this project
    if (req.user.role === "Developer") {
      const project = await Project.findOne({
        _id: issue.project,
        assignedUsers: req.user._id,
      })
      if (!project) {
        return res.status(403).json({ message: "Access denied to this project" })
      }
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      id,
      { title, description, priority, status, expectedOutcome, currentOutcome },
      { new: true },
    )
      .populate("project", "name")
      .populate("assignedTo", "email")
      .populate("reporter", "email")

    res.json(updatedIssue)
  } catch (error) {
    console.error("Update issue error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params

    const issue = await Issue.findById(id)
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" })
    }

    // Delete associated image file if exists
    if (issue.bugImage) {
      const imagePath = path.join(__dirname, "..", issue.bugImage)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    await Issue.findByIdAndDelete(id)
    res.json({ message: "Issue deleted successfully" })
  } catch (error) {
    console.error("Delete issue error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  getAllIssues,
  getIssuesByProject,
  createIssue,
  updateIssue,
  deleteIssue,
}
