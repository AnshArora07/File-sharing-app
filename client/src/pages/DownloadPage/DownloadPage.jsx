import { useParams } from "react-router-dom";
import "./DownloadPage.css";

export default function DownloadPage() {
  const { id } = useParams();
  // placeholder UI until you integrate API
  return (
    <div className="page download-page">
      <h1>Download Page</h1>
      <div className="file-card">
        <div className="file-meta">
          <div className="file-name">File name: <strong>example.pdf</strong></div>
          <div className="file-size">Size: 200 KB</div>
          <div className="expires">
            Expires in: <strong>--:--:--</strong> {/* placeholder countdown */}
          </div>
          <div className="download-count">Downloads: 0</div>
        </div>
        <div className="actions">
          <button className="btn btn-download" disabled>
            Download
          </button>
          <div className="hint">Link ID: <code>{id}</code></div>
        </div>
      </div>

      <p className="note">This is a placeholder UI — you will wire up API calls to fetch metadata and trigger download.</p>
    </div>
  );
}
