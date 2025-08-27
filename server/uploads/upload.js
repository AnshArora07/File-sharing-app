import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import File from "../models/File.js";

const router = express.Router();

// Multer config → uploads folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// POST /api/files/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { sender_email, receiver_email } = req.body;
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h expiry

    const fileDoc = await File.create({
      uuid: uuidv4(),
      filename: req.file.filename,
      path: req.file.path,
      expiry_time: expiryTime,
      sender_email,
      receiver_email,
    });

    res.status(201).json({
      message: "File uploaded successfully",
      file: fileDoc,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while uploading file" });
  }
});

export default router;
