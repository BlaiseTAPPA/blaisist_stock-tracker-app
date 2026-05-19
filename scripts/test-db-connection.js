require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI must be set before running this script.\nEither add it to a .env file or export it in the shell.");
  process.exit(1);
}

const testConnection = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    console.log("✅ MongoDB connection successful.");
    await conn.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message || error);
    process.exit(1);
  }
};

testConnection();
