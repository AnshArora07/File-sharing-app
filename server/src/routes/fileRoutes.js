import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import File from "../models/file.js";
import fs from "fs";
import archiver from "archiver";
import path from "path";

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

// Function to zip uploaded file
const zipFile = (filePath, originalName) => {
  return new Promise((resolve, reject) => {
    const zipName = `${originalName}.zip`;
    const zipPath = path.join("uploads", zipName);

    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      // remove original uploaded file
      fs.unlinkSync(filePath);
      resolve({ zipName, zipPath });
    });

    archive.on("error", (err) => reject(err));

    archive.pipe(output);
    archive.file(filePath, { name: originalName }); // keep original name inside zip
    archive.finalize();
  });
};

// POST /api/files/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { sender_email, receiver_email } = req.body;

    // Zip the file
    const { zipName, zipPath } = await zipFile(req.file.path, req.file.originalname);

    // Save file info to MongoDB
    const fileDoc = await File.create({
      uuid: uuidv4(),
      filename: zipName,    // now storing .zip file name
      path: zipPath,        // path to .zip file
      expiry_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      sender_email,
      receiver_email
    });

    res.status(201).json({
      message: "File uploaded & zipped successfully",
      file: fileDoc
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Server error while uploading file" });
  }
});

export default router;
