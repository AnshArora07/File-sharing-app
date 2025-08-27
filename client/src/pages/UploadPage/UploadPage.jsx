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
      return <Image className="file-icon file-icon-green" />;
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return <Archive className="file-icon file-icon-purple" />;
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) {
      return <FileText className="file-icon file-icon-blue" />;
    }
    return <File className="file-icon file-icon-gray" />;
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

  const handleDropZoneClick = () => {
    if (!selectedFile) {
      fileInputRef.current?.click();
    }
  };

  const handleDropZoneKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !selectedFile) {
      e.preventDefault();
      fileInputRef.current?.click();
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
          const loaded = progressEvent?.loaded ?? 0;
          const total = progressEvent?.total ?? 0;
          const percent = total > 0 ? Math.round((loaded * 100) / total) : (loaded > 0 ? 100 : 0);
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
              onClick={handleDropZoneClick}
              onKeyDown={handleDropZoneKeyDown}
              role="button"
              tabIndex={0}
              aria-label={selectedFile ? 'File selected' : 'Click to select a file or drag and drop'}
            >
              {selectedFile ? (
                <div className="file-info">
                  <div className="file-details">
                    {getFileIcon(selectedFile.name)}
                    <div className="file-meta">
                      <p className="file-name">{selectedFile.name}</p>
                      <p className="file-size">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    {selectedFile.type?.startsWith('image/') && (
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Selected preview"
                        className="file-thumb"
                      />
                    )}
                    <button onClick={removeFile} className="remove-btn">
                      <X />
                    </button>
                  </div>

                  {isUploading && (
                    <div className="progress">
                      <div className="progress-bar-container" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(uploadProgress)} role="progressbar">
                        <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <p className="progress-text">Uploading... {Math.round(uploadProgress)}%</p>
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
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
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
              <h3><Clock/> Link Expiry</h3>
              <div className="expiry-buttons">
                {[1, 6, 12, 24].map((hours) => (
                  <button
                    key={hours}
                    className={expiryHours === hours ? 'active' : ''}
                    onClick={() => setExpiryHours(hours)}
                    aria-pressed={expiryHours === hours}
                  >
                    {hours === 1 ? '1 Hour' : `${hours} Hours`}
                  </button>
                ))}
              </div>
            </div>

            {/* Terms + Upload */}
            <div className="terms terms-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <span className="terms-text">I agree that my file will be automatically deleted after expiry.</span>
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
          <div className="card-body">
            <h3 className="section-title">
              <Shield style={{ width: '1.25rem', height: '1.25rem', color: '#10b981' }} />
              <span>Why Choose Our File Sharing?</span>
            </h3>
            
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">
                  <Shield style={{ width: '1.5rem', height: '1.5rem', color: '#10b981' }} />
                </div>
                <h4>Secure & Private</h4>
                <p>Your files are encrypted and automatically deleted after expiry</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <Clock style={{ width: '1.5rem', height: '1.5rem', color: '#3b82f6' }} />
                </div>
                <h4>Time-Limited</h4>
                <p>Links expire automatically to keep your data safe</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <Check style={{ width: '1.5rem', height: '1.5rem', color: '#8b5cf6' }} />
                </div>
                <h4>No Registration</h4>
                <p>Start sharing immediately without creating an account</p>
              </div>
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
