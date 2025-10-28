import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import File from "../models/File.js";
import fs from "fs";
import archiver from "archiver";
import path from "path";

const router = express.Router();

// Multer config → uploads folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Function to zip a file
const zipFile = (filePath, fileName) => {
  return new Promise((resolve, reject) => {
    const zipName = `${fileName}.zip`;
    const zipPath = path.join("uploads", zipName);

    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      // Delete original uploaded file after zipping
      fs.unlinkSync(filePath);
      resolve(zipPath);
    });

    archive.on("error", (err) => reject(err));

    archive.pipe(output);
    archive.file(filePath, { name: fileName }); // inside zip, keep original name
    archive.finalize();
  });
};

// POST /api/files/upload → upload & zip
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { sender_email, receiver_email } = req.body;
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h expiry

    // Zip the uploaded file
    const zippedPath = await zipFile(req.file.path, req.file.originalname);
    const zippedFileName = path.basename(zippedPath);

    const fileDoc = await File.create({
      uuid: uuidv4(),
      filename: zippedFileName,
      path: zippedPath,
      expiry_time: expiryTime,
      sender_email,
      receiver_email,
    });

    res.status(201).json({
      message: "File uploaded & zipped successfully",
      file: fileDoc,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while uploading file" });
  }
});

// ✅ GET /api/files/:uuid → fetch file info
router.get("/:uuid", async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });
    if (!file) return res.status(404).json({ error: "File not found" });

    res.json({ file });
  } catch (err) {
    console.error("Fetch file error:", err);
    res.status(500).json({ error: "Server error while fetching file" });
  }
});

// ✅ GET /api/files/download/:uuid → download file
router.get("/download/:uuid", async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });
    if (!file) return res.status(404).json({ error: "File not found" });

    const filePath = path.resolve(file.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on server" });
    }

    res.download(filePath, file.filename); // send as attachment
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Server error while downloading file" });
 }
});

export default router;
