import { Link } from "react-router-dom";
import "./UploadPage.css";

export default function UploadPage() {
  return (
    <div className="page upload-page">
      <h1>Upload Page (placeholder)</h1>
      <p>This is the Upload page placeholder. Teammate will implement the upload form here.</p>
      <p>For quick navigation tests:</p>
      <div className="links">
        <Link to="/success/abc123">Go to Success (test)</Link>
        <br />
        <Link to="/file/abc123">Go to Download (test)</Link>
      </div>
    </div>
  );
}
