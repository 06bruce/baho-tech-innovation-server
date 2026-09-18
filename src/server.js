import { env, validateEnvironment } from "./config/env.js";
import { createApp } from "./app.js";
import { disconnectDatabase, initializeDatabase } from "./database/connection.js";

// Validate environment configuration first
validateEnvironment();

// Create Express app
const app = createApp();

const baseUrl = env.serverUrl || (env.host ? `http://${env.host}:${env.port}` : `http://localhost:${env.port}`);

async function startServer() {
  // Connect to MongoDB, build indexes, and ensure the admin seed
  await initializeDatabase();

  // Start listening
  const server = env.host
    ? app.listen(env.port, env.host, onListening)
    : app.listen(env.port, onListening);

  function onListening() {
    console.log(`✅ Baho Tech API running on ${baseUrl}`);
    console.log(`\n📡 Available Endpoints:`);
    console.log(`   Health Check: ${baseUrl}/api/health`);
    console.log(`   Authentication: ${baseUrl}/api/auth`);
    console.log(`   Users: ${baseUrl}/api/users`);
    console.log(`   Admin: ${baseUrl}/api/admin`);
    console.log(`   Disability: ${baseUrl}/api/disability`);
    console.log(`   AI Assistant: ${baseUrl}/api/ai-assistant`);
    console.log(`   More at: ${baseUrl}/api/*\n`);
    console.log(`🔗 Frontend: ${env.clientOrigin}`);
    console.log(`⏰ Refresh token TTL: ${env.refreshTokenTtlDays} days\n`);
  }

  server.on("error", (error) => {
    console.error("❌ Failed to start Baho Tech API:", error);
    process.exit(1);
  });

  // Graceful shutdown
  function shutdown(signal) {
    console.log(`\n${signal} received: closing HTTP server`);
    server.close(async () => {
      console.log("✅ HTTP server closed");
      await disconnectDatabase();
      process.exit(0);
    });
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});