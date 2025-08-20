import React from "react";
import "./DownloadPage.css";

const DownloadPage = () => {
  // Static data for now (replace with API later)
  const file = {
    filename: "project-report.zip",
    size: "5 MB",
    expiresIn: "23 hours",
    isExpired: false,
  };

  return (
    <div className="download-container">
      <div className="download-card">
        <h1 className="title">Download Your File</h1>

        {!file.isExpired ? (
          <>
            <div className="file-info">
              <p className="filename">📂 {file.filename}</p>
              <p className="filesize">Size: {file.size}</p>
              <p className="expiry">⏳ Expires in: {file.expiresIn}</p>
            </div>

            <button className="download-btn">⬇ Download File</button>
          </>
        ) : (
          <p className="expired-msg">❌ This link has expired</p>
        )}
      </div>
    </div>
  );
};

export default DownloadPage;
