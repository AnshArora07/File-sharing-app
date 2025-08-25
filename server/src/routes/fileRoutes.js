// server/routes/fileRoutes.js
import express from "express";
const router = express.Router();

// Test route (you can replace this later with real upload/download logic)
router.get("/", (req, res) => {
  res.json({ message: "File routes are live 🚀" });
});

export default router;
