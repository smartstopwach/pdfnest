import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

export const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
};

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const readAsArrayBuffer = (file) => file.arrayBuffer();

const normalizeRanges = (value, pageCount) => {
  const pages = [];
  const tokens = String(value || '').split(',').map((part) => part.trim()).filter(Boolean);
  for (const token of tokens) {
    if (token.includes('-')) {
      let [start, end] = token.split('-').map((n) => Number.parseInt(n, 10));
      if (!Number.isFinite(start)) continue;
      if (!Number.isFinite(end)) end = start;
      start = Math.max(1, Math.min(pageCount, start));
      end = Math.max(1, Math.min(pageCount, end));
      const step = start <= end ? 1 : -1;
      for (let page = start; step > 0 ? page <= end : page >= end; page += step) pages.push(page - 1);
    } else {
      const page = Number.parseInt(token, 10);
      if (Number.isFinite(page) && page >= 1 && page <= pageCount) pages.push(page - 1);
    }
  }
  return [...new Set(pages)];
};

export const mergePdfs = async (files) => {
  const output = await PDFDocument.create();
  for (const file of files) {
    const source = await PDFDocument.load(await readAsArrayBuffer(file), { ignoreEncryption: true });
    const pages = await output.copyPages(source, source.getPageIndices());
    pages.forEach((page) => output.addPage(page));
  }
  return output.save({ useObjectStreams: true });
};

export const selectPages = async (file, ranges, reverse = false) => {
  const source = await PDFDocument.load(await readAsArrayBuffer(file), { ignoreEncryption: true });
  let indices = normalizeRanges(ranges, source.getPageCount());
  if (!indices.length) indices = source.getPageIndices();
  if (reverse) indices.reverse();
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, indices);
  pages.forEach((page) => output.addPage(page));
  return output.save({ useObjectStreams: true });
};

export const compressPdf = async (file) => {
  const document = await PDFDocument.load(await readAsArrayBuffer(file), { ignoreEncryption: true });
  return document.save({ useObjectStreams: true, addDefaultPage: false });
};

export const reorderPdf = async (file, indices) => {
  const source = await PDFDocument.load(await readAsArrayBuffer(file), { ignoreEncryption: true });
  const order = Array.isArray(indices) && indices.length ? indices : source.getPageIndices();
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, order);
  pages.forEach((page) => output.addPage(page));
  return output.save({ useObjectStreams: true });
};

export const rotatePdf = async (file, angle) => {
  const document = await PDFDocument.load(await readAsArrayBuffer(file), { ignoreEncryption: true });
  document.getPages().forEach((page) => page.setRotation(degrees((page.getRotation().angle + Number(angle)) % 360)));
  return document.save({ useObjectStreams: true });
};

export const watermarkPdf = async (file, text, opacity = 0.22) => {
  const document = await PDFDocument.load(await readAsArrayBuffer(file), { ignoreEncryption: true });
  const font = await document.embedFont(StandardFonts.HelveticaBold);
  document.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const size = Math.max(22, Math.min(62, width / Math.max(text.length, 8) * 1.9));
    page.drawText(text || 'PDFNest', {
      x: width * 0.14,
      y: height * 0.43,
      size,
      font,
      color: rgb(0.12, 0.37, 0.31),
      opacity: Number(opacity),
      rotate: degrees(35),
    });
  });
  return document.save({ useObjectStreams: true });
};

export const numberPdf = async (file, position = 'bottom-center') => {
  const document = await PDFDocument.load(await readAsArrayBuffer(file), { ignoreEncryption: true });
  const font = await document.embedFont(StandardFonts.Helvetica);
  document.getPages().forEach((page, index) => {
    const { width, height } = page.getSize();
    const label = `${index + 1}`;
    const textWidth = font.widthOfTextAtSize(label, 10);
    const x = position.includes('left') ? 28 : position.includes('right') ? width - textWidth - 28 : (width - textWidth) / 2;
    const y = position.includes('top') ? height - 24 : 18;
    page.drawText(label, { x, y, size: 10, font, color: rgb(0.2, 0.25, 0.27) });
  });
  return document.save({ useObjectStreams: true });
};

export const imageFilesToPdf = async (files) => {
  const document = await PDFDocument.create();
  for (const file of files) {
    const bytes = await readAsArrayBuffer(file);
    const image = file.type === 'image/png' ? await document.embedPng(bytes) : await document.embedJpg(bytes);
    const scale = Math.min(1, 560 / image.width, 760 / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    const page = document.addPage([width + 72, height + 72]);
    page.drawImage(image, { x: 36, y: 36, width, height });
  }
  return document.save({ useObjectStreams: true });
};

export const cropPdf = async (file, margin = 24) => {
  const document = await PDFDocument.load(await readAsArrayBuffer(file), { ignoreEncryption: true });
  document.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const safeMargin = Math.min(Number(margin) || 24, Math.min(width, height) / 3);
    page.setCropBox(safeMargin, safeMargin, width - safeMargin * 2, height - safeMargin * 2);
  });
  return document.save({ useObjectStreams: true });
};

export const annotatePdf = async (file, text) => {
  const document = await PDFDocument.load(await readAsArrayBuffer(file), { ignoreEncryption: true });
  const font = await document.embedFont(StandardFonts.Helvetica);
  const page = document.getPages()[0];
  const { height } = page.getSize();
  page.drawText(text || 'Your note', { x: 40, y: height - 60, size: 16, font, color: rgb(0.12, 0.37, 0.31) });
  return document.save({ useObjectStreams: true });
};

export const getTextFromPdf = async (file, pdfjs) => {
  const pdf = await pdfjs.getDocument({ data: await readAsArrayBuffer(file) }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += `${content.items.map((item) => item.str).join(' ')}\n\n`;
  }
  return text.trim();
};

export const loadPdfJs = async () => {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  return pdfjs;
};

export const pdfToJpgZip = async (file, pdfjs, quality = 0.92) => {
  const { default: JSZip } = await import('jszip');
  const pdf = await pdfjs.getDocument({ data: await readAsArrayBuffer(file) }).promise;
  const zip = new JSZip();
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', Number(quality)));
    zip.file(`page-${String(pageNumber).padStart(3, '0')}.jpg`, blob);
  }
  return zip.generateAsync({ type: 'blob' });
};

const wrapText = (text, maxChars = 92) => {
  const lines = [];
  String(text || '').split(/\r?\n/).forEach((paragraph) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) { lines.push(''); return; }
    let line = '';
    words.forEach((word) => {
      if ((line + ' ' + word).trim().length > maxChars && line) { lines.push(line); line = word; }
      else line = `${line} ${word}`.trim();
    });
    lines.push(line);
  });
  return lines;
};

export const textToPdf = async (text, heading = 'PDFNest document') => {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const lines = wrapText(text);
  let page = document.addPage([595, 842]);
  let y = 795;
  page.drawText(heading, { x: 42, y, size: 18, font: bold, color: rgb(0.12, 0.37, 0.31) });
  y -= 35;
  for (const line of lines) {
    if (y < 48) { page = document.addPage([595, 842]); y = 795; }
    page.drawText(line, { x: 42, y, size: 10.5, font, color: rgb(0.15, 0.18, 0.18) });
    y -= line ? 16 : 10;
  }
  return document.save({ useObjectStreams: true });
};

export const readOfficeText = async (file) => {
  const extension = file.name.toLowerCase().split('.').pop();
  if (extension === 'docx' || extension === 'doc') {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ arrayBuffer: await readAsArrayBuffer(file) });
    return result.value;
  }
  if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(await readAsArrayBuffer(file), { type: 'array' });
    return workbook.SheetNames.map((name) => `## ${name}\n\n${XLSX.utils.sheet_to_csv(workbook.Sheets[name])}`).join('\n\n');
  }
  if (extension === 'pptx' || extension === 'ppt') {
    const { default: JSZip } = await import('jszip');
    const zip = await JSZip.loadAsync(await readAsArrayBuffer(file));
    const slideNames = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
    const slides = [];
    for (const name of slideNames) {
      const xml = await zip.files[name].async('text');
      const words = [...xml.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/g)].map((match) => match[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
      slides.push(`## ${name.match(/\d+/)[0]}\n\n${words.join(' ')}`);
    }
    return slides.join('\n\n');
  }
  const raw = await file.text();
  if (extension === 'html' || extension === 'htm') return raw.replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  return raw;
};

export const pdfToDocx = async (text) => {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
  const children = wrapText(text, 110).map((line) => new Paragraph({ children: [new TextRun(line)] }));
  children.unshift(new Paragraph({ text: 'PDFNest document', heading: HeadingLevel.TITLE }));
  const document = new Document({ sections: [{ children }] });
  return Packer.toBlob(document);
};

export const pdfToXlsx = async (text) => {
  const XLSX = await import('xlsx');
  const rows = String(text || '').split(/\r?\n/).filter(Boolean).map((line) => [line]);
  const sheet = XLSX.utils.aoa_to_sheet(rows.length ? rows : [['No selectable text found']]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Extracted text');
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
};

export const pdfToPptx = async (text) => {
  const module = await import('pptxgenjs');
  const PptxGenJS = module.default || module;
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  const lines = wrapText(text, 88);
  const chunks = [];
  for (let i = 0; i < lines.length; i += 20) chunks.push(lines.slice(i, i + 20).join('\n'));
  (chunks.length ? chunks : ['No selectable text found']).forEach((chunk, index) => {
    const slide = pptx.addSlide();
    slide.background = { color: 'F7F6F2' };
    slide.addText(index === 0 ? 'PDFNest document' : `PDFNest document · ${index + 1}`, { x: 0.65, y: 0.55, w: 11.5, h: 0.45, fontFace: 'Aptos Display', fontSize: 25, bold: true, color: '186B5C' });
    slide.addText(chunk, { x: 0.7, y: 1.35, w: 11.5, h: 5.4, fontFace: 'Aptos', fontSize: 14, color: '20302F', breakLine: false, margin: 0.05, valign: 'top' });
  });
  return pptx.write({ outputType: 'blob' });
};

export const comparePdfText = async (leftText, rightText) => {
  const left = String(leftText || '').split(/\r?\n/);
  const right = String(rightText || '').split(/\r?\n/);
  const rows = [`# PDF comparison`, '', `Left document: ${left.length} lines`, `Right document: ${right.length} lines`, ''];
  const max = Math.max(left.length, right.length);
  for (let index = 0; index < max; index += 1) {
    if (left[index] === right[index]) rows.push(`  ${left[index] || ''}`);
    else { if (left[index]) rows.push(`- ${left[index]}`); if (right[index]) rows.push(`+ ${right[index]}`); }
  }
  return rows.join('\n');
};

export const ocrPdf = async (file, pdfjs, onProgress) => {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng', 1, { logger: (message) => onProgress?.(message) });
  const pdf = await pdfjs.getDocument({ data: await readAsArrayBuffer(file) }).promise;
  let text = '';
  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.45 });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      const result = await worker.recognize(canvas);
      text += `Page ${pageNumber}\n\n${result.data.text.trim()}\n\n`;
    }
  } finally {
    await worker.terminate();
  }
  return text.trim();
};

export const summarizeText = (text) => {
  const sentences = String(text || '').replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+/g) || [];
  const summary = sentences.slice(0, 5).map((sentence) => sentence.trim()).join(' ');
  return `# Local document summary\n\n${summary || 'No selectable text was found in this file.'}\n\n> This is a local extractive summary. No document was uploaded.`;
};

export const addFormField = async (file, label = 'Your response') => {
  const document = await PDFDocument.load(await readAsArrayBuffer(file), { ignoreEncryption: true });
  const page = document.getPages()[0];
  const form = document.getForm();
  const field = form.createTextField(`pdfnest_field_${Date.now()}`);
  field.setText(label);
  field.addToPage(page, { x: 42, y: 50, width: Math.min(330, page.getWidth() - 84), height: 28, borderWidth: 1, backgroundColor: rgb(0.95, 0.98, 0.96) });
  return document.save({ useObjectStreams: true });
};

export const extensionForTool = (toolId) => {
  if (toolId === 'pdf-to-markdown') return 'md';
  if (toolId === 'pdf-to-jpg') return 'zip';
  if (toolId === 'pdf-to-word') return 'docx';
  if (toolId === 'pdf-to-excel') return 'xlsx';
  if (toolId === 'pdf-to-powerpoint') return 'pptx';
  return 'pdf';
};
