import app from "./src/app.js";
import dotenv from "dotenv";
import connectDB from "./src/config/database.js";
dotenv.config();

// initialize
const PORT = process.env.PORT || 5501;
const environment = process.env.NODE_ENV;

let server;

// handling uncaughtException
process.on("uncaughtException", err => {
  console.log(`ERROR : ${err.message}`);
  console.log("Shutting down the server due to uncaught Exception");

  if (server) {
    server.close(() => {
      console.log("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});


// Connect to MongoDb database
connectDB()
  .then(() => {
    // Start the server
    server = app.listen(PORT, () => {
      console.log(
        `🚀 Server running at http://localhost:${PORT} in ${environment} mode.`,
      );

      if (environment === "DEVELOPMENT") {
        console.log("🔧 Debug mode ON - extra logging enabled");
        console.log(`📁 Environment: ${environment}`);
        console.log(`🔌 Port: ${PORT}`);
      } else if (environment === "PRODUCTION") {
        console.log("⚡ Production optimizations enabled");
        console.log(`📁 Environment: ${environment}`);
        console.log(`🔌 Port: ${PORT}`);
      }
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB connection failed: ", err);
    process.exit(1);
  });


process.on("unhandledRejection", err => {
  console.log(`ERROR : ${err.message}`);
  console.log("Shutting down the server due to unhandled Promise Rejection");

  if (server) {
    server.close(() => {
      console.log("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
