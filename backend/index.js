import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connection from "./config/db.js";
import apiRoutes from "./routes/api.js";
import limiter from "./middleware/rateLimiter.js";

dotenv.config(); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter);
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 5000;

connection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on PORT: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
    // Start server anyway for news endpoint
    app.listen(PORT, () => {
      console.log(`Server is running on PORT: ${PORT} (without MongoDB)`);
    });
  });

app.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error("Server error:", error);
  }
});