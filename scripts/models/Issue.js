const mongoose = require("mongoose")

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expectedOutcome: { type: String, required: true },
    currentOutcome: { type: String, required: true },
    bugImage: { type: String },
    tags: [{ type: String }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
)

module.exports = mongoose.model("Issue", issueSchema)
