import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import fileRoutes from "./src/routes/fileRoutes.js";
import cors from "cors"; // ✅ import cors

dotenv.config();
connectDB();

const app = express();


// ✅ Enable CORS (default allows all origins)
app.use(cors());

app.use(express.json());
app.use("/uploads", express.static("uploads")); // serve uploaded files

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Routes
app.use("/files", fileRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
