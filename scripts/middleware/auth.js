const jwt = require("jsonwebtoken")
const User = require("../models/User")

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Access token required" })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.userId)
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid token or user inactive" })
    }
    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" })
  }
}

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Admin access required" })
  }
  next()
}

module.exports = { authenticateToken, requireAdmin }
