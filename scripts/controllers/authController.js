const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

const register = async (req, res) => {
  try {
    const { email, password, role: requestedRole } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userCount = await User.countDocuments();
    let role = "Client";
    if (userCount === 0 && requestedRole === "SuperAdmin") {
      role = "SuperAdmin";
    } else if (userCount === 0) {
      role = "Admin";
    }

    const user = new User({
      email,
      password: hashedPassword,
      role,
      lastLogin: new Date(),
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "24h" });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        assignedProjects: user.assignedProjects,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};


const login = async (req, res) => {
  try {
    console.log("Login attempt:", req.body.email)
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user || !user.isActive) {
      return res.status(400).json({ message: "Invalid credentials or account inactive" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "24h" })

    console.log("Login successful:", user.email)
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        assignedProjects: user.assignedProjects,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = { register, login }
