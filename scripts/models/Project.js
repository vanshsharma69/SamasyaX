const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, enum: ["active", "inactive", "completed"], default: "active" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Project", projectSchema)
