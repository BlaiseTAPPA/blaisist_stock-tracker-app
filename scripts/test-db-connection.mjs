// Checks that MONGODB_URI is reachable: `npm run test:db`.
// Reads MONGODB_URI from .env.local, then .env, or from the shell, like the app.

import { config } from "dotenv";
import mongoose from "mongoose";

config({ path: [".env.local", ".env"], quiet: true });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI must be set (in .env.local, .env or the shell).");
  process.exit(1);
}

const testConnection = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    console.log("✅ MongoDB connection successful.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message || error);
    process.exit(1);
  }
};

testConnection();
