const Project = require("../models/Project")
const Issue = require("../models/Issue")
const User = require("../models/User")
const path = require("path")
const fs = require("fs")

const getProjects = async (req, res) => {
  try {
    let filter = {}

    // Role-based filtering
    if (req.user.role === "Developer" || req.user.role === "Client") {
      filter = { assignedUsers: req.user._id }
    }

    const projects = await Project.find(filter).populate("creator", "email").populate("assignedUsers", "email").lean()

    // Add issue counts to each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        let issueFilter = { project: project._id }

        // For clients, only count issues they can see
        if (req.user.role === "Client") {
          const adminUsers = await User.find({ role: "Admin" }).select("_id")
          issueFilter = {
            project: project._id,
            $or: [{ reporter: req.user._id }, { reporter: { $in: adminUsers } }],
          }
        }

        const issueCount = await Issue.countDocuments(issueFilter)
        const openIssues = await Issue.countDocuments({ ...issueFilter, status: "todo" })

        return {
          ...project,
          issueCount,
          openIssues,
        }
      }),
    )

    res.json(projectsWithCounts)
  } catch (error) {
    console.error("Get projects error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body

    const project = new Project({
      name,
      description,
      creator: req.user._id,
      assignedUsers: [req.user._id], // Creator is automatically assigned
    })

    await project.save()
    await project.populate("creator", "email")
    await project.populate("assignedUsers", "email")

    res.status(201).json(project)
  } catch (error) {
    console.error("Create project error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params

    const project = await Project.findById(id)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    // Delete all issues associated with this project first
    const issues = await Issue.find({ project: id })

    // Delete associated image files
    for (const issue of issues) {
      if (issue.bugImage) {
        const imagePath = path.join(__dirname, "..", issue.bugImage)
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath)
        }
      }
    }

    await Issue.deleteMany({ project: id })

    // Remove project from all users' assignedProjects
    await User.updateMany({ assignedProjects: id }, { $pull: { assignedProjects: id } })

    await Project.findByIdAndDelete(id)

    res.json({
      message: "Project and all associated issues deleted successfully",
      deletedProject: project.name,
    })
  } catch (error) {
    console.error("Delete project error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = { getProjects, createProject, deleteProject }
