import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  FileText,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./SuccessPage.css";

const SuccessPage = () => {
  const { state } = useLocation(); // data from navigate (if coming from upload)
  const { uuid } = useParams(); // ✅ correctly gets uuid from /success/:uuid
  const navigate = useNavigate();

  const [fileData, setFileData] = useState(state?.file || null);
  const [loading, setLoading] = useState(!state?.file);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  // 🔹 Fetch from backend if file data not in state
  useEffect(() => {
    if (fileData || !uuid) return;

    const fetchFile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/files/${uuid}`);
        if (!res.ok) throw new Error("File not found ❌");
        const data = await res.json();
        setFileData(data.file);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [uuid, fileData]);

  // 🔹 Countdown until expiry
  useEffect(() => {
    if (!fileData) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const expiry = new Date(fileData.expiry_time);
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [fileData]);

  // 🔹 Copy download link
  const copyToClipboard = async () => {
    if (!fileData) return;
    const link = `http://localhost:5000/files/download/${fileData.uuid}`;

    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // UI states
  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error)
    return (
      <div className="success-wrapper">
        <h2>{error}</h2>
        <button onClick={() => navigate("/")}>Back to Upload</button>
      </div>
    );
  if (!fileData) {
    console.log("file na mili re baba");
    return (
      <div className="success-wrapper">
        <h2>No file data found ❌</h2>
        <button onClick={() => navigate("/")}>Back to Upload</button>
      </div>
    );
  }

  return (
    <div className="success-wrapper">
      <div className="success-card">
        <h2 className="title">File Uploaded Successfully 🎉</h2>

        <p className="file-info flex items-center gap-2">
          <FileText size={18} /> {fileData.filename}
        </p>
        <p className="expiry flex items-center gap-2">
          <Clock size={16} /> Expires in: {timeLeft}
        </p>

        <div className="button-group">
          <button onClick={copyToClipboard} className="btn primary">
            {copied ? <Check size={16} /> : <Copy size={16} />} Copy Link
          </button>
          <a
            href={`http://localhost:5000/files/download/${fileData.uuid}`}
            className="btn download"
          >
            Download
          </a>
          <button onClick={() => navigate("/")} className="btn back">
            <ArrowLeft size={16} /> Back to Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
