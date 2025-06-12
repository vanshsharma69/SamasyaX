const mongoose = require("mongoose")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://01vanshsharma:dA6tHcRIn9VrteNR@cluster0.myajx1j.mongodb.net/buglogger?retryWrites=true&w=majority"

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("Connected to MongoDB successfully!")
    console.log("Database URL:", MONGODB_URI)
    console.log("Database Name: buglogger")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  }
}

module.exports = connectDB
