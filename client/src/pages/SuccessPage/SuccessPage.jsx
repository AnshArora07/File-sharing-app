import React, { useState, useEffect } from 'react';
import { Copy, Mail, Check, Share2, FileText, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';  
import './SuccessPage.css';

const SuccessPage = () => {
  const [fileData] = useState({
    id: 'abc123-def456-ghi789',
    filename: 'presentation.pdf',
    downloadLink: 'https://yourapp.com/download/abc123-def456-ghi789',
    uploadTime: new Date(),
    expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    fileSize: '2.4 MB',
    downloadCount: 0
  });

  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  const navigate = useNavigate(); 

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const expiry = new Date(fileData.expiryTime);
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [fileData.expiryTime]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fileData.downloadLink);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = fileData.downloadLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // ✅ Redirect to download page after copying
    navigate(`/file/${fileData.id}`);
  };

  const sendEmail = async () => {
    if (!recipientEmail) return;
    setTimeout(() => {
      setEmailSent(true);
      setRecipientEmail('');
      setTimeout(() => setEmailSent(false), 3000);
    }, 500);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Download ${fileData.filename}`,
          text: `Download this file: ${fileData.filename}`,
          url: fileData.downloadLink
        });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="success-wrapper">
      {/* Floating background icons */}
      <FileText className="bg-icon icon1" size={60} />
      <Clock className="bg-icon icon2" size={70} />
      <Share2 className="bg-icon icon3" size={50} />
      <Copy className="bg-icon icon4" size={65} />

      {/* Main Card */}
      <div className="success-card">
        <h2 className="title">File Uploaded Successfully 🎉</h2>
        <p className="file-info">
          <FileText size={18} /> {fileData.filename} ({fileData.fileSize})
        </p>
        <p className="expiry">
          <Clock size={16} /> Expires in: {timeLeft}
        </p>

        <div className="button-group">
          <button onClick={copyToClipboard} className="btn primary">
            {copied ? <Check size={16} /> : <Copy size={16} />} Copy Link
          </button>

          <button onClick={shareLink} className="btn secondary">
            <Share2 size={16} /> Share
          </button>
        </div>

        <div className="email-section">
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="Enter email to send link"
            className="email-input"
          />
          <button onClick={sendEmail} className="btn warning">
            <Mail size={16} /> Send Email
          </button>
          {emailSent && (
            <p className="success-msg">✅ Email sent successfully!</p>
          )}
        </div>

        {/* ✅ Back Button */}
        <div className="back-btn-container">
          <button onClick={() => navigate('/')} className="btn back">
            <ArrowLeft size={16} /> Back to Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
