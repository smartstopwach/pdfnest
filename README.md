# PDFNest

PDFNest is an original, privacy-first PDF toolkit inspired by the usability patterns of modern document utilities. It is **not** a copy of iLovePDF and does not use its name, logo, copy, or proprietary assets.

## Current build

- Responsive homepage and tool catalog
- Search-friendly hash routes for every listed tool
- Local browser processing for merge, split/extract, rotate, watermark, page numbers, crop, annotate, JPG/PNG to PDF, PDF to JPG, PDF to Word, PDF to PowerPoint, PDF to Excel, simple office/HTML-to-PDF, forms, compare, repair/resave, OCR, summaries, Markdown, and text extraction
- Drag-and-drop file queue with size/type display, multi-file compare support, unlimited app-level batch selection, and robust error fallback
- Lazy-loaded document adapters so heavier conversions do not slow the home screen
- No upload server: supported operations keep files in the browser; practical capacity depends on the browser/device memory
- Clear capability messaging for integrations that need true PDF encryption, password removal, permanent redaction, or provider-backed translation

## Run it

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal. Production build:

```bash
npm run build
npm run preview
```

## Deploy on GitHub Pages

Every push to `main` runs the included GitHub Actions workflow and publishes the Vite build to `https://smartstopwach.github.io/pdfnest/`. The Vite base path switches automatically for the project site.

## Roadmap for the full feature set

1. Add a small API service with sandboxed workers for DOCX/PPTX/XLSX conversion, true compression, PDF/A, repair, and password encryption.
2. Add PDF.js page thumbnails and a canvas editor for visual reorder, redaction, crop, signatures, and form fields.
3. Add local Tesseract workers for OCR, and opt-in provider adapters for translation and summarization.
4. Add a job queue, object storage with auto-expiration, audit logs, and end-to-end tests.

The UI is deliberately structured around adapters so those capabilities can be added without rewriting the homepage or workbench.
