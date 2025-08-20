import { Link, useParams } from "react-router-dom";
import "./SuccessPage.css";

export default function SuccessPage() {
  // For now just read :id if route navigation uses it
  const { id } = useParams();
  const fileId = id || "sample-id-123";

  return (
    <div className="page success-page">
      <h1>Success Page (placeholder)</h1>
      <p>After upload, this page will show the shareable link.</p>
      <p>Sample link: <code>/file/{fileId}</code></p>
      <div style={{ marginTop: 12 }}>
        <Link to={`/file/${fileId}`}>Open Download Page for {fileId}</Link>
      </div>
    </div>
  );
}
