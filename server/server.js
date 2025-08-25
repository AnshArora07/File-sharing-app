// server/server.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import fileRoutes from "./src/routes/fileRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

// Routes
app.use("/files", fileRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
