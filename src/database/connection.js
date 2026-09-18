import mongoose from "mongoose";
import { env } from "../config/env.js";
import { deleteExpiredSessions } from "../modules/auth/auth.repository.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { ensureAdminUser } from "./seed.js";

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  mongoose.set("strictQuery", true);
  mongoose.set("bufferCommands", true);

  mongoose.connection.on("error", (error) => {
    console.error("❌ MongoDB connection error:", error.message);
  });

  mongoose.connection.on("disconnected", () => {
    if (!isShuttingDown) {
      console.warn("⚠️ MongoDB connection lost");
    }
  });

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  isShuttingDown = false;
  console.log("✅ MongoDB connected");
  return mongoose.connection;
}

let isShuttingDown = false;

export async function disconnectDatabase() {
  if (mongoose.connection.readyState === 0) return;
  isShuttingDown = true;
  await mongoose.disconnect();
  console.log("✅ MongoDB disconnected");
}

export async function initializeDatabase() {
  await connectDatabase();

  // Await index creation so uniqueness (email) is enforced before serving traffic.
  await Promise.all([User.init(), Message.init()]);

  await deleteExpiredSessions();

  await ensureAdminUser();
  console.log("✅ Database seeding verified");
}