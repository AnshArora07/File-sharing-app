import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadPage from "../pages/UploadPage/UploadPage";
import SuccessPage from "../pages/SuccessPage/SuccessPage";
import DownloadPage from "../pages/DownloadPage/DownloadPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/success/:id" element={<SuccessPage />} />
        <Route path="/file/:id" element={<DownloadPage />} />
      </Routes>
    </BrowserRouter>
  );
}
