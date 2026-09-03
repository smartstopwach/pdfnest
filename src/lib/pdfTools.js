import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';

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

export const extensionForTool = (toolId) => {
  if (toolId === 'pdf-to-markdown') return 'md';
  if (toolId === 'pdf-to-jpg') return 'zip';
  if (toolId === 'pdf-to-word') return 'docx';
  if (toolId === 'pdf-to-excel') return 'xlsx';
  if (toolId === 'pdf-to-powerpoint') return 'pptx';
  return 'pdf';
};
