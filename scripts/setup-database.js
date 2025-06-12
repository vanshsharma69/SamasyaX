const connectDB = require("../config/database")

async function setupDatabase() {
  try {
    await connectDB()

    const mongoose = require("mongoose")

    // Test the connection
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log(
      "Available collections:",
      collections.map((c) => c.name),
    )

    console.log("\nDatabase setup complete!")
    console.log("You can now start the server with: node server.js")
  } catch (error) {
    console.error("Database setup failed:", error.message)
    console.log("\nTroubleshooting:")
    console.log("1. Make sure MongoDB is installed and running")
    console.log("2. Check if MongoDB service is started")
    console.log("3. Verify the connection string is correct")
  } finally {
    const mongoose = require("mongoose")
    await mongoose.connection.close()
  }
}

setupDatabase()
