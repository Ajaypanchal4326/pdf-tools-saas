// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FAQPage from "./pages/FAQPage"; 
import AboutPage from "./pages/About"; 


import Home from "./pages/Home";
import ImageToPdf from "./pages/ImageToPdf";
import PdfToImage from "./pages/PdfToImage";
import MergePdf from "./pages/MergePdf";
import PdfCompressor from "./pages/PdfCompressor";
import PDFPageExtractor from "./pages/PDFPageExtractor";

// Image Format Converter Pages
import JpgToPng from "./pages/JpgToPng";
import JpgToWebp from "./pages/JpgToWebp";
import PngToJpg from "./pages/PngToJpg";
import PngToWebp from "./pages/PngToWebp";
import WebpToJpg from "./pages/WebpToJpg";
import WebpToPng from "./pages/WebpToPng";
import ImageCompressor from "./pages/ImageCompressor";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            {/* Home */}
            <Route path="/" element={<Home />} />
            {/* FAQ */}
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* PDF Tools */}
            <Route path="/image-to-pdf" element={<ImageToPdf />} />
            <Route path="/pdf-to-image" element={<PdfToImage />} />
            <Route path="/merge-pdf" element={<MergePdf />} />
            <Route path="/compress-pdf" element={<PdfCompressor />} />
            <Route path="/pdf-extractor" element={<PDFPageExtractor />} />

            {/* Image Tools */}
            <Route path="/image-compressor" element={<ImageCompressor />} />
            <Route path="/jpg-to-png" element={<JpgToPng />} />
            <Route path="/jpg-to-webp" element={<JpgToWebp />} />
            <Route path="/png-to-jpg" element={<PngToJpg />} />
            <Route path="/png-to-webp" element={<PngToWebp />} />
            <Route path="/webp-to-jpg" element={<WebpToJpg />} />
            <Route path="/webp-to-png" element={<WebpToPng />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
