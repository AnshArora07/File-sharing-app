import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: true,
  },
  filename: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  upload_time: {
    type: Date,
    default: Date.now,
  },
  expiry_time: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h expiry
  },
  sender_email: String,
  receiver_email: String,
  download_count: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("File", fileSchema);
