import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Upload, X, FileText, Image, Archive, File, Clock, Shield, Check } from 'lucide-react';
import axios from "axios";
import './UploadPage.css';

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [expiryHours, setExpiryHours] = useState(24);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const navigate = useNavigate();

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      return <Image className="icon green" />;
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return <Archive className="icon purple" />;
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) {
      return <FileText className="icon blue" />;
    }
    return <File className="icon gray" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (file) => {
    if (file && file.size <= 100 * 1024 * 1024) {
      setSelectedFile(file);
    } else {
      alert('File size must be less than 100MB');
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    if (!dropZoneRef.current?.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ✅ Corrected handleUpload
  const handleUpload = async () => {
    if (!selectedFile || !agreedToTerms) return;
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("expiryHours", expiryHours);

      const response = await axios.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      // ✅ backend returns { file: { uuid: "..." } }
      const { file } = response.data;

      setUploadProgress(100);
      setTimeout(() => {
        navigate(`/success/${file.uuid}`); // redirect with uuid
      }, 500);

    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const isUploadDisabled = !selectedFile || !agreedToTerms || isUploading;

  return (
    <div className="upload-page">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="header-icon">
            <Upload className="icon blue" />
          </div>
          <h1>Share Files Instantly</h1>
          <p>Upload any file and get a shareable link that expires automatically</p>
        </div>

        {/* Upload Form */}
        <div className="card">
          <div className="card-body">
            {/* Drop Zone */}
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`drop-zone ${isDragging ? 'dragging' : selectedFile ? 'selected' : ''}`}
            >
              {selectedFile ? (
                <div className="file-info">
                  <div className="file-details">
                    {getFileIcon(selectedFile.name)}
                    <div>
                      <p className="file-name">{selectedFile.name}</p>
                      <p className="file-size">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <button onClick={removeFile} className="remove-btn">
                      <X />
                    </button>
                  </div>

                  {isUploading && (
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
                      <p>Uploading... {Math.round(uploadProgress)}%</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="drop-placeholder">
                  <Upload className="icon gray" />
                  <p>Drop your file here or click to browse</p>
                  <span>Support for any file type • Max size: 100MB</span>
                  <div className="choose-file-btn">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-primary">
                      Choose File
                    </button>
                  </div>
                </div>
              )}
              <input ref={fileInputRef} type="file" onChange={handleFileInputChange} className="hidden" />
            </div>

            {/* Expiry */}
            <div className="expiry">
              <h3><Clock /> Link Expiry</h3>
              <div className="expiry-buttons">
                {[1, 6, 12, 24].map((hours) => (
                  <button
                    key={hours}
                    className={expiryHours === hours ? 'active' : ''}
                    onClick={() => setExpiryHours(hours)}
                  >
                    {hours === 1 ? '1 Hour' : `${hours} Hours`}
                  </button>
                ))}
              </div>
            </div>

            {/* Terms + Upload */}
            <div className="terms">
              <label>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                I agree that my file will be automatically deleted after expiry.
              </label>
              <button
                onClick={handleUpload}   
                disabled={isUploadDisabled}
                className="btn-upload">
                {isUploading ? 'Uploading...' : 'Upload & Get Link'}
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="card">
          <div className="card-body features">
            <h3><Shield /> Why Choose Us?</h3>
            <div className="features-grid">
              <div><Shield /> <p>Secure & Private</p></div>
              <div><Clock /> <p>Time-Limited</p></div>
              <div><Check /> <p>No Registration</p></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="footer">By using this service, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </div>
  );
};

export default UploadPage;
