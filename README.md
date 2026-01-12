# 📄 PDFTools – Free PDF & Image Tools (SaaS)

<p align="center">
  <img src="https://pdf-tools-saas-amyc.vercel.app/logo.svg" alt="PDFTools Logo" width="90" />
</p>

<p align="center">
  <b>Fast • Secure • Browser-Based PDF & Image Tools</b><br/>
  Convert, compress, merge & extract files with maximum privacy.
</p>

<p align="center">
  🔗 <a href="https://pdf-tools-saas-amyc.vercel.app">Live Website</a>
</p>

---

## ✨ What is PDFTools?

**PDFTools** is a modern **SaaS web application** that provides powerful **PDF and image utilities**
with a strong focus on **privacy, speed, and simplicity**.

Most tools work **100% in the browser**, and heavy operations are handled securely by the backend.

✔ No login  
✔ No tracking  
✔ No unnecessary uploads  
✔ Clean UI, fast processing  

---

## 🧰 Available Tools

### 📑 PDF Tools
- ✅ Image to PDF  
- ✅ PDF to Image  
- ✅ Merge PDF  
- ✅ PDF Compressor (Low / Medium / High)  
- ✅ PDF Page Extractor (custom page ranges)

### 🖼️ Image Tools
- ✅ Image Compressor (JPG / PNG / WEBP)  
- ✅ JPG → PNG  
- ✅ PNG → JPG  
- ✅ JPG → WEBP  
- ✅ PNG → WEBP  
- ✅ WEBP → JPG  
- ✅ WEBP → PNG  

---

## 🔐 Privacy First Architecture

- ✔ Browser-based processing for most tools
- ✔ Backend used only when required (Image → PDF, Merge PDF)
- ✔ No file storage
- ✔ Temporary files auto-deleted
- ✔ No analytics or tracking

Your files remain **safe, private, and under your control**.

---

## ⚡ Tech Stack

### 🌐 Frontend
- **React + TypeScript**
- **Vite**
- **Tailwind CSS**
- **pdf-lib**
- **Canvas API**
- **Client-side compression**

### ⚙️ Backend
- **Node.js**
- **Express 5**
- **TypeScript**
- **Multer** (file uploads)
- **pdf-lib**
- **Sharp**
- **Archiver**
- **Rate limiting & CORS**

---

## 🗂 Project Structure

```text
pdf-tools-saas/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── utils/
│   │   └── main.tsx
│   └── index.html
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   └── package.json
│
└── README.md
