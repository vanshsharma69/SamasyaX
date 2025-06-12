const User = require("../models/User")
const Project = require("../models/Project")
const Issue = require("../models/Issue")

const getStats = async (req, res) => {
  try {
    let projectFilter = {}
    let issueFilter = {}

    // Role-based filtering
    if (req.user.role === "Developer") {
      projectFilter = { assignedUsers: req.user._id }
      const projects = await Project.find(projectFilter).select("_id")
      const projectIds = projects.map((p) => p._id)
      if (projectIds.length > 0) {
        issueFilter = { project: { $in: projectIds } }
      } else {
        return res.json({
          totalProjects: 0,
          totalIssues: 0,
          openIssues: 0,
          inProgressIssues: 0,
          doneIssues: 0,
          totalUsers: 0,
          recentActivity: [],
        })
      }
    } else if (req.user.role === "Client") {
      projectFilter = { assignedUsers: req.user._id }
      const projects = await Project.find(projectFilter).select("_id")
      const projectIds = projects.map((p) => p._id)
      if (projectIds.length > 0) {
        const adminUsers = await User.find({ role: "Admin" }).select("_id")
        issueFilter = {
          project: { $in: projectIds },
          $or: [{ reporter: req.user._id }, { reporter: { $in: adminUsers } }],
        }
      } else {
        return res.json({
          totalProjects: 0,
          totalIssues: 0,
          openIssues: 0,
          inProgressIssues: 0,
          doneIssues: 0,
          totalUsers: 0,
          recentActivity: [],
        })
      }
    }

    const totalProjects = await Project.countDocuments(projectFilter)
    const totalUsers = await User.countDocuments()

    const totalIssues = await Issue.countDocuments(issueFilter)
    const openIssues = await Issue.countDocuments({ ...issueFilter, status: "todo" })
    const inProgressIssues = await Issue.countDocuments({ ...issueFilter, status: "in-progress" })
    const doneIssues = await Issue.countDocuments({ ...issueFilter, status: "done" })

    res.json({
      totalProjects,
      totalIssues,
      openIssues,
      inProgressIssues,
      doneIssues,
      totalUsers: req.user.role === "Admin" ? totalUsers : 0,
      recentActivity: [],
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = { getStats }
