const bcrypt = require("bcryptjs")
const User = require("../models/User")
const Project = require("../models/Project")
const Issue = require("../models/Issue")

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").populate("assignedProjects", "name _id").sort({ createdAt: -1 })

    console.log("Users with populated projects:", JSON.stringify(users, null, 2))
    res.json(users)
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const assignProjects = async (req, res) => {
  try {
    const { id } = req.params
    const { projectIds } = req.body

    const user = await User.findByIdAndUpdate(id, { assignedProjects: projectIds }, { new: true })
      .select("-password")
      .populate("assignedProjects", "name _id")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update projects to include this user in assignedUsers
    await Project.updateMany({ _id: { $in: projectIds } }, { $addToSet: { assignedUsers: id } })

    // Remove user from projects not in the new list
    await Project.updateMany({ _id: { $nin: projectIds } }, { $pull: { assignedUsers: id } })

    res.json(user)
  } catch (error) {
    console.error("Assign projects error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const updateRole = async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    if (!["Admin", "Developer", "Client"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" })
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Update role error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    const user = await User.findByIdAndUpdate(id, { isActive }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Toggle user status error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user._id)
    const isMatch = await bcrypt.compare(currentPassword, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await User.findByIdAndUpdate(req.user._id, { password: hashedPassword })

    res.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const exportUserData = async (req, res) => {
  try {
    let projectFilter = {}

    if (req.user.role === "Developer" || req.user.role === "Client") {
      projectFilter = { assignedUsers: req.user._id }
    }

    const projects = await Project.find(projectFilter).populate("creator assignedUsers", "email")
    const projectIds = projects.map((p) => p._id)

    let issueFilter = { project: { $in: projectIds } }

    // For clients, only export issues they can see
    if (req.user.role === "Client") {
      const adminUsers = await User.find({ role: "Admin" }).select("_id")
      issueFilter = {
        project: { $in: projectIds },
        $or: [{ reporter: req.user._id }, { reporter: { $in: adminUsers } }],
      }
    }

    const issues = await Issue.find(issueFilter).populate("project assignedTo reporter", "name email")

    const userData = {
      user: {
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
      projects,
      issues,
      exportDate: new Date().toISOString(),
    }

    res.setHeader("Content-Type", "application/json")
    res.setHeader("Content-Disposition", "attachment; filename=bug-logger-data.json")
    res.json(userData)
  } catch (error) {
    console.error("Export data error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  getUsers,
  assignProjects,
  updateRole,
  toggleStatus,
  changePassword,
  exportUserData,
}
