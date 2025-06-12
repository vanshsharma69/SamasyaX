const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin", "Developer", "Client"], default: "Client" },
    assignedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    preferences: {
      theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
      notifications: { type: Boolean, default: true },
      emailUpdates: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("User", userSchema)
