import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import File from "../models/file.js";

const router = express.Router();

// connection
router.get("/test", (req, res) => {
  res.json({ message: "Frontend ↔ Backend connected ✅" });
});

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

// POST /api/files/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { sender_email, receiver_email } = req.body;

    // Save file info to MongoDB
    const fileDoc = await File.create({
      uuid: uuidv4(),
      filename: req.file.originalname,  // store original file name
      path: req.file.path,
      expiry_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      sender_email,
      receiver_email
    });

    res.status(201).json({
      message: "File uploaded successfully",
      file: fileDoc
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Server error while uploading file" });
  }
});

export default router;