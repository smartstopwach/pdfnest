import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  addFormField,
  annotatePdf,
  comparePdfText,
  compressPdf,
  cropPdf,
  downloadBlob,
  formatBytes,
  getTextFromPdf,
  imageFilesToPdf,
  loadPdfJs,
  mergePdfs,
  numberPdf,
  ocrPdf,
  pdfToDocx,
  pdfToJpgZip,
  pdfToPptx,
  pdfToXlsx,
  readOfficeText,
  reorderPdf,
  rotatePdf,
  selectPages,
  summarizeText,
  textToPdf,
  watermarkPdf,
} from './lib/pdfTools';

const categories = ['All', 'Organize', 'Optimize', 'Convert', 'Edit', 'Security', 'Intelligence'];

function Icon({ name = 'file', size = 20, strokeWidth = 1.8 }) {
  const shapes = {
    file: <><path d="M6 2.75h7l4 4v14.5H6a2 2 0 0 1-2-2v-14a2 2 0 0 1 2-2Z" /><path d="M13 2.75v4h4M8 12h6M8 16h6" /></>,
    merge: <><rect x="4" y="3" width="11" height="15" rx="2" /><path d="M9 18v2a1 1 0 0 0 1 1h7a2 2 0 0 0 2-2V8M8 10h7M11.5 7v6M8.5 10h6" /></>,
    split: <><path d="M6 3h7l4 4v5" /><path d="M13 3v4h4M6 3v18M4 18h4M10 18h7M14 15l3 3-3 3" /></>,
    compress: <><path d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5M8 8 3 3M16 8l5-5M8 16l-5 5M16 16l5 5" /></>,
    word: <><path d="M6 2.75h7l4 4v14.5H6a2 2 0 0 1-2-2v-14a2 2 0 0 1 2-2Z" /><path d="M13 2.75v4h4M8 12l1.5 4 1.5-6 1.5 6 1.5-4" /></>,
    presentation: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M12 17v4M8 21h8M7 9h10M12 4v13" /></>,
    spreadsheet: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M4 9h16M4 15h16M10 3v18M15 3v18" /></>,
    edit: <><path d="m4 17-.8 4 4-.8L18.5 9.9a2.8 2.8 0 0 0-4-4L4 17Z" /><path d="m13 7 4 4" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8" cy="9" r="1.5" /><path d="m4 17 5-5 3 3 2-2 6 6" /></>,
    imagePdf: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m4 17 5-5 3 3 2-2 6 6M16 7h3M16 10h3" /></>,
    signature: <><path d="M3 18c3.5 0 4.5-9 7-9 2.5 0-.5 7 2 7 2 0 3-4 4.5-4 1.5 0 0 3 2.5 3 1 0 2-1 3-2" /><path d="M3 21h18" /></>,
    watermark: <><circle cx="12" cy="12" r="8" /><path d="M9 9h6M9 12h6M9 15h6M5.5 5.5l13 13" /></>,
    rotate: <><path d="M4 11a8 8 0 1 1 2.3 5.7" /><path d="M4 5v6h6" /></>,
    code: <><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 3l-4 18" /></>,
    unlock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 7.7-1.5M12 14v3" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
    organize: <><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></>,
    archive: <><path d="M4 7h16v13H4zM3 4h18v3H3zM9 12h6" /></>,
    repair: <><path d="m14.5 6.5 3 3M4 20l6.5-6.5M13 4a5 5 0 0 0 6 6l-3 3-6-6 3-3ZM4 20l-1-1 3-3 1 1-3 3Z" /></>,
    numbers: <><path d="M8 3 6 21M16 3l-2 18M3 9h18M2 15h18" /></>,
    scan: <><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3M7 12h10" /></>,
    ocr: <><path d="M4 5V3h3M20 5V3h-3M4 19v2h3M20 19v2h-3M7 9h10M7 13h10M7 17h6" /></>,
    compare: <><path d="M9 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4M15 5h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4M9 12h6M12 9l3 3-3 3" /></>,
    redact: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 12h18M8 9h8M8 16h4" /></>,
    crop: <><path d="M8 3v13a2 2 0 0 0 2 2h11M3 8h13a2 2 0 0 1 2 2v11" /></>,
    form: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h1M12 8h4M8 13h1M12 13h4M8 18h1M12 18h4" /></>,
    sparkles: <><path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3ZM19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" /></>,
    translate: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9M8 7h6" /></>,
    markdown: <><path d="M4 5h16v14H4zM7 15v-5l2.5 3 2.5-3v5M15 10h2M16 9v6" /></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5M5 20h14" /></>,
    arrowUpRight: <><path d="M7 17 17 7M8 7h9v9" /></>,
    chevronUp: <path d="m6 14 6-6 6 6" />,
    chevronDown: <path d="m6 10 6 6 6-6" />,
    close: <path d="m7 7 10 10M17 7 7 17" />,
    bolt: <><path d="m13 2-9 11h7l-1 9 9-11h-7l1-9Z" /></>,
  };
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name] || shapes.file}</svg>;
}

const tools = [
  { id: 'merge-pdf', title: 'Merge PDF', description: 'Join documents in the order you want, with one clean download.', category: 'Organize', icon: 'merge', accept: '.pdf', supported: true, action: 'merge' },
  { id: 'split-pdf', title: 'Split PDF', description: 'Extract a range of pages or make a focused new document.', category: 'Organize', icon: 'split', accept: '.pdf', supported: true, action: 'split' },
  { id: 'compress-pdf', title: 'Compress PDF', description: 'Reduce document weight while keeping the content crisp.', category: 'Optimize', icon: 'compress', accept: '.pdf', supported: true, action: 'compress' },
  { id: 'pdf-to-word', title: 'PDF to Word', description: 'Turn PDF content into an editable Word document.', category: 'Convert', icon: 'word', accept: '.pdf', badge: 'beta', supported: true, action: 'pdfWord' },
  { id: 'pdf-to-powerpoint', title: 'PDF to PowerPoint', description: 'Transform pages into a presentation-ready deck.', category: 'Convert', icon: 'presentation', accept: '.pdf', supported: true, action: 'pdfPpt' },
  { id: 'pdf-to-excel', title: 'PDF to Excel', description: 'Pull tables from documents into a spreadsheet.', category: 'Convert', icon: 'spreadsheet', accept: '.pdf', supported: true, action: 'pdfExcel' },
  { id: 'word-to-pdf', title: 'Word to PDF', description: 'Create a shareable PDF from a DOC or DOCX file.', category: 'Convert', icon: 'word', accept: '.doc,.docx,.txt', supported: true, action: 'officeToPdf' },
  { id: 'powerpoint-to-pdf', title: 'PowerPoint to PDF', description: 'Export slides into a portable PDF document.', category: 'Convert', icon: 'presentation', accept: '.ppt,.pptx', supported: true, action: 'officeToPdf' },
  { id: 'excel-to-pdf', title: 'Excel to PDF', description: 'Make spreadsheets easy to view and send.', category: 'Convert', icon: 'spreadsheet', accept: '.xls,.xlsx,.csv', supported: true, action: 'officeToPdf' },
  { id: 'edit-pdf', title: 'Edit PDF', description: 'Add a note to your first page without leaving the browser.', category: 'Edit', icon: 'edit', accept: '.pdf', supported: true, action: 'annotate' },
  { id: 'pdf-to-jpg', title: 'PDF to JPG', description: 'Export pages as sharp images for quick sharing.', category: 'Convert', icon: 'imagePdf', accept: '.pdf', supported: true, action: 'pdfJpg' },
  { id: 'jpg-to-pdf', title: 'JPG to PDF', description: 'Bundle images into a neat, print-ready PDF.', category: 'Convert', icon: 'image', accept: '.jpg,.jpeg,.png', supported: true, action: 'images' },
  { id: 'sign-pdf', title: 'Sign PDF', description: 'Add a simple typed signature line to your document.', category: 'Edit', icon: 'signature', accept: '.pdf', supported: true, action: 'sign' },
  { id: 'watermark-pdf', title: 'Watermark', description: 'Stamp every page with a subtle, custom text mark.', category: 'Edit', icon: 'watermark', accept: '.pdf', supported: true, action: 'watermark' },
  { id: 'rotate-pdf', title: 'Rotate PDF', description: 'Turn every page to the angle your document needs.', category: 'Organize', icon: 'rotate', accept: '.pdf', supported: true, action: 'rotate' },
  { id: 'html-to-pdf', title: 'HTML to PDF', description: 'Prepare a webpage or HTML file for offline sharing.', category: 'Convert', icon: 'code', accept: '.html,.htm,.txt', supported: true, action: 'officeToPdf' },
  { id: 'unlock-pdf', title: 'Unlock PDF', description: 'Open password-protected files that you are authorized to use.', category: 'Security', icon: 'unlock', accept: '.pdf', action: 'unsupported' },
  { id: 'protect-pdf', title: 'Protect PDF', description: 'Add encryption and a password before you share.', category: 'Security', icon: 'lock', accept: '.pdf', action: 'unsupported' },
  { id: 'organize-pdf', title: 'Organize PDF', description: 'Reorder pages into a new document using a simple page list.', category: 'Organize', icon: 'organize', accept: '.pdf', supported: true, action: 'organize' },
  { id: 'pdf-to-pdfa', title: 'PDF to PDF/A', description: 'Convert a document for long-term archival workflows.', category: 'Optimize', icon: 'archive', accept: '.pdf', supported: true, action: 'resave' },
  { id: 'repair-pdf', title: 'Repair PDF', description: 'Attempt recovery of a damaged or partially readable file.', category: 'Optimize', icon: 'repair', accept: '.pdf', supported: true, action: 'resave' },
  { id: 'page-numbers', title: 'Page numbers', description: 'Add clear, consistent numbering to every page.', category: 'Edit', icon: 'numbers', accept: '.pdf', supported: true, action: 'numbers' },
  { id: 'scan-pdf', title: 'Scan to PDF', description: 'A mobile capture flow for turning scans into documents.', category: 'Convert', icon: 'scan', accept: 'image/*', supported: true, action: 'images' },
  { id: 'ocr-pdf', title: 'OCR PDF', description: 'Make scanned pages searchable and selectable.', category: 'Intelligence', icon: 'ocr', accept: '.pdf', badge: 'beta', supported: true, action: 'ocr' },
  { id: 'compare-pdf', title: 'Compare PDF', description: 'Spot meaningful changes between two document versions.', category: 'Intelligence', icon: 'compare', accept: '.pdf', supported: true, action: 'compare' },
  { id: 'redact-pdf', title: 'Redact PDF', description: 'Permanently cover sensitive details before sharing.', category: 'Security', icon: 'redact', accept: '.pdf', action: 'unsupported' },
  { id: 'crop-pdf', title: 'Crop PDF', description: 'Trim page margins consistently across your document.', category: 'Edit', icon: 'scan', accept: '.pdf', supported: true, action: 'crop' },
  { id: 'pdf-forms', title: 'PDF Forms', description: 'Build an accessible fillable form from a blank PDF.', category: 'Edit', icon: 'form', badge: 'new', accept: '.pdf', supported: true, action: 'forms' },
  { id: 'summarize-pdf', title: 'AI Summarizer', description: 'Create a quick outline of text-based PDF content.', category: 'Intelligence', icon: 'sparkles', badge: 'new', accept: '.pdf', supported: true, action: 'summarize' },
  { id: 'translate-pdf', title: 'Translate PDF', description: 'Prepare document content for a translation workflow.', category: 'Intelligence', icon: 'translate', badge: 'new', accept: '.pdf', action: 'unsupported' },
  { id: 'pdf-to-markdown', title: 'PDF to Markdown', description: 'Extract text for notes, docs, and AI-ready workflows.', category: 'Intelligence', icon: 'markdown', badge: 'new', accept: '.pdf', action: 'markdown' },
];

const toolMap = Object.fromEntries(tools.map((tool) => [tool.id, tool]));

function useRoute() {
  const getRoute = () => window.location.hash.replace(/^#\/?/, '') || 'home';
  const [route, setRoute] = useState(getRoute);
  useEffect(() => {
    const sync = () => setRoute(getRoute());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  return route;
}

function navigate(path) {
  window.location.hash = path;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function Brand({ onClick }) {
  return <button className="brand" onClick={onClick} aria-label="Go to PDFNest home"><span className="brand-mark"><Icon name="file" size={18} strokeWidth={2} /></span><span>PDFNest</span></button>;
}

function Header({ onNavigate }) {
  return <header className="navbar">
    <Brand onClick={() => onNavigate('home')} />
    <nav className="nav-links" aria-label="Main navigation">
      <a className="nav-link" href="#home#tools" onClick={(event) => { event.preventDefault(); onNavigate('home'); setTimeout(() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' }), 20); }}>Tools</a>
      <a className="nav-link" href="#about" onClick={(event) => { event.preventDefault(); onNavigate('about'); }}>How it works</a>
      <a className="nav-link" href="#about" onClick={(event) => { event.preventDefault(); onNavigate('about'); }}>Privacy</a>
    </nav>
    <div className="nav-actions"><a href="#about" className="login" onClick={(event) => { event.preventDefault(); onNavigate('about'); }}>About</a><button className="primary-button" onClick={() => onNavigate('home')}>Try it free</button></div>
  </header>;
}

function ToolCard({ tool, onOpen }) {
  return <button className="tool-card" onClick={() => onOpen(tool.id)}>
    <span className="tool-icon"><Icon name={tool.icon} size={20} /></span>
    <h3>{tool.title}{tool.badge && <span className="badge">{tool.badge}</span>}</h3>
    <p>{tool.description}</p>
    <span className="arrow"><Icon name="arrowUpRight" size={19} /></span>
  </button>;
}

function Home({ onOpen }) {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const visibleTools = useMemo(() => tools.filter((tool) => {
    const matchesFilter = filter === 'All' || tool.category === filter;
    const matchesSearch = `${tool.title} ${tool.description}`.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesSearch;
  }), [filter, query]);

  return <>
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">A calmer way to handle documents</span>
          <h1>Make PDFs feel lighter.</h1>
          <p>Merge, convert, organize, and polish your files in one focused workspace. Simple by default, private by design, and free to use.</p>
          <div className="hero-actions"><button className="primary-button" onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}>Browse PDF tools <Icon name="arrowUpRight" size={15} /></button><span className="hero-note">No account required · files stay local</span></div>
        </div>
        <div className="orbit-card back" aria-hidden="true"><div className="mini-icon"><Icon name="rotate" size={20} /></div><strong>Rotate pages</strong><span>Fix the little things, fast.</span></div>
        <div className="orbit-card" aria-hidden="true"><div className="mini-icon"><Icon name="file" size={20} /></div><strong>PDF ready</strong><span>Everything in its right place.</span></div>
      </section>

      <section className="section" id="tools">
        <div className="section-heading"><div><span className="eyebrow">The toolkit</span><h2>One home for every PDF job.</h2></div><p>Start with a focused tool, or browse the full library. Every workbench uses the same familiar flow.</p></div>
        <div className="filter-bar" aria-label="Filter PDF tools">{categories.map((category) => <button key={category} className={`filter ${filter === category ? 'active' : ''}`} onClick={() => setFilter(category)}>{category}</button>)}<label className="search-wrap"><span className="sr-only">Search tools</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools" /></label></div>
        <div className="tool-grid">{visibleTools.map((tool) => <ToolCard key={tool.id} tool={tool} onOpen={onOpen} />)}</div>
        {!visibleTools.length && <div className="empty-state">No tools match that search yet. Try “merge”, “convert”, or “sign”.</div>}
      </section>

      <section className="trust-strip"><div className="trust-copy"><span className="eyebrow">Designed for real work</span><h2>Your documents, your control.</h2><p>PDFNest is built as a privacy-first foundation: the tools that work locally never need an upload or an account.</p></div><div className="trust-pills"><div className="trust-pill"><b><Icon name="file" size={16} /></b><span>Browser-first<br />processing</span></div><div className="trust-pill"><b><Icon name="bolt" size={16} /></b><span>Fast, focused<br />workflows</span></div><div className="trust-pill"><b><Icon name="sparkles" size={16} /></b><span>Open roadmap<br />for integrations</span></div></div></section>
    </main>
    <Footer />
  </>;
}

function Footer() {
  return <footer className="footer"><span>© 2026 PDFNest. Built for documents, not distractions.</span><div className="footer-links"><a href="#about">Privacy</a><a href="#about">Roadmap</a><a href="#about">Help</a></div></footer>;
}

function About() {
  return <main className="about-section"><span className="eyebrow">How PDFNest works</span><h1>Useful tools.<br />Clear boundaries.</h1><div className="about-grid"><article className="about-card"><h3>Local by default</h3><p>PDFNest keeps supported transformations in the browser. Files are read into memory, processed, and downloaded without an upload server. This makes small, everyday jobs fast and private.</p><ul><li>Drag and drop files into any workbench.</li><li>Remove queued files before processing.</li><li>Download results directly to your device.</li></ul></article><article className="about-card"><h3>A foundation for the full suite</h3><p>The product is organized around adapters: local PDF operations are available now, while heavyweight conversions, OCR, encryption, and AI tools are clearly marked for their dedicated workers and provider settings.</p><ul><li>Original visual identity and copy.</li><li>No third-party brand assets.</li><li>Small, testable tool adapters.</li></ul></article></div></main>;
}

function ToolPage({ tool, onBack }) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [status, setStatus] = useState(null);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [pagePreviews, setPagePreviews] = useState([]);
  const [pageOrder, setPageOrder] = useState([]);
  const [pageDragIndex, setPageDragIndex] = useState(null);
  const [options, setOptions] = useState({ range: '1-3', angle: '90', watermark: 'CONFIDENTIAL', opacity: '0.22', position: 'bottom-center', margin: '24', note: 'Reviewed with PDFNest', signer: 'Signed with PDFNest' });
  const inputRef = useRef(null);
  const batchTool = tool.action === 'merge' || tool.action === 'images';
  const multiFileTool = batchTool || tool.action === 'compare';

  useEffect(() => {
    if (tool.action !== 'images') {
      setPreviewUrls([]);
      return undefined;
    }
    const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPreviewUrls(next);
    return () => next.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [files, tool.action]);

  useEffect(() => {
    let cancelled = false;
    if (tool.action !== 'organize' || !files[0]) {
      setPagePreviews([]);
      setPageOrder([]);
      return undefined;
    }
    setStatus({ type: 'working', text: 'Preparing page previews locally…' });
    (async () => {
      const pdfjs = await loadPdfJs();
      const pdf = await pdfjs.getDocument({ data: await files[0].arrayBuffer() }).promise;
      const previews = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 0.42 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        previews.push({ pageNumber, url: canvas.toDataURL('image/jpeg', 0.78) });
        if (cancelled) return;
      }
      if (!cancelled) {
        setPagePreviews(previews);
        setPageOrder(previews.map(({ pageNumber }) => pageNumber - 1));
        setStatus(null);
      }
    })().catch((error) => {
      console.error(error);
      if (!cancelled) setStatus({ type: 'error', text: 'Page previews could not be created. You can still use the page order field.' });
    });
    return () => { cancelled = true; };
  }, [files, tool.action]);

  const addFiles = (incoming) => {
    const incomingFiles = [...incoming];
    const accepted = incomingFiles.filter((file) => {
      if (tool.accept === 'image/*') return file.type.startsWith('image/');
      const extensions = tool.accept.split(',').map((value) => value.trim().replace('.', ''));
      return extensions.some((extension) => file.name.toLowerCase().endsWith(`.${extension}`));
    });
    if (accepted.length < incomingFiles.length) setStatus({ type: 'error', text: `Please add a supported file type: ${tool.accept.replaceAll('.', '').toUpperCase()}.` });
    setFiles((current) => [...current, ...accepted].slice(0, batchTool ? 20 : multiFileTool ? 2 : 1));
    setStatus(null);
  };

  const setOption = (key, value) => setOptions((current) => ({ ...current, [key]: value }));
  const reorderFiles = (from, to) => {
    if (from === null || from === to || to === null) return;
    setFiles((current) => {
      const reordered = [...current];
      const [moved] = reordered.splice(from, 1);
      reordered.splice(to, 0, moved);
      return reordered;
    });
    setDragIndex(null);
  };
  const moveFile = (index, offset) => {
    const destination = Math.max(0, Math.min(files.length - 1, index + offset));
    reorderFiles(index, destination);
  };
  const removeFile = (index) => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  const reorderPages = (from, to) => {
    if (from === null || from === to || to === null) return;
    setPageOrder((current) => { const reordered = [...current]; const [moved] = reordered.splice(from, 1); reordered.splice(to, 0, moved); return reordered; });
    setPageDragIndex(null);
  };

  const readyToRun = files.length > 0 && (tool.action !== 'compare' || files.length === 2);

  const runTool = async () => {
    if (!readyToRun) return;
    setStatus({ type: 'working', text: 'Working locally in your browser…' });
    try {
      let bytes;
      let filename;
      let mime = 'application/pdf';
      if (tool.action === 'merge') { bytes = await mergePdfs(files); filename = 'pdfnest-merged.pdf'; }
      else if (tool.action === 'split') { bytes = await selectPages(files[0], options.range); filename = 'pdfnest-pages.pdf'; }
      else if (tool.action === 'organize') { bytes = await reorderPdf(files[0], pageOrder); filename = 'pdfnest-organized.pdf'; }
      else if (tool.action === 'rotate') { bytes = await rotatePdf(files[0], options.angle); filename = 'pdfnest-rotated.pdf'; }
      else if (tool.action === 'compress') { bytes = await compressPdf(files[0]); filename = 'pdfnest-compressed.pdf'; }
      else if (tool.action === 'watermark') { bytes = await watermarkPdf(files[0], options.watermark, options.opacity); filename = 'pdfnest-watermarked.pdf'; }
      else if (tool.action === 'numbers') { bytes = await numberPdf(files[0], options.position); filename = 'pdfnest-numbered.pdf'; }
      else if (tool.action === 'crop') { bytes = await cropPdf(files[0], options.margin); filename = 'pdfnest-cropped.pdf'; }
      else if (tool.action === 'annotate') { bytes = await annotatePdf(files[0], options.note); filename = 'pdfnest-edited.pdf'; }
      else if (tool.action === 'sign') { bytes = await annotatePdf(files[0], options.signer); filename = 'pdfnest-signed.pdf'; }
      else if (tool.action === 'images') { bytes = await imageFilesToPdf(files); filename = 'pdfnest-images.pdf'; }
      else if (tool.action === 'pdfJpg') { const pdfjs = await loadPdfJs(); bytes = await pdfToJpgZip(files[0], pdfjs); filename = 'pdfnest-pages.zip'; mime = 'application/zip'; }
      else if (tool.action === 'pdfWord') { const pdfjs = await loadPdfJs(); const text = await getTextFromPdf(files[0], pdfjs); bytes = await pdfToDocx(text); filename = 'pdfnest-document.docx'; mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; }
      else if (tool.action === 'pdfExcel') { const pdfjs = await loadPdfJs(); const text = await getTextFromPdf(files[0], pdfjs); bytes = await pdfToXlsx(text); filename = 'pdfnest-document.xlsx'; mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; }
      else if (tool.action === 'pdfPpt') { const pdfjs = await loadPdfJs(); const text = await getTextFromPdf(files[0], pdfjs); bytes = await pdfToPptx(text); filename = 'pdfnest-document.pptx'; mime = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'; }
      else if (tool.action === 'officeToPdf') { bytes = await textToPdf(await readOfficeText(files[0]), tool.title); filename = 'pdfnest-converted.pdf'; }
      else if (tool.action === 'resave') { bytes = await compressPdf(files[0]); filename = 'pdfnest-repaired.pdf'; }
      else if (tool.action === 'compare') { const pdfjs = await loadPdfJs(); const left = await getTextFromPdf(files[0], pdfjs); const right = await getTextFromPdf(files[1], pdfjs); const report = await comparePdfText(left, right); downloadBlob(new Blob([report], { type: 'text/markdown' }), 'pdfnest-comparison.md'); setStatus({ type: 'success', text: 'Comparison report downloaded locally.' }); return; }
      else if (tool.action === 'ocr') { const pdfjs = await loadPdfJs(); const text = await ocrPdf(files[0], pdfjs, (message) => { if (message.progress) setStatus({ type: 'working', text: `${message.status || 'Reading page'} · ${Math.round(message.progress * 100)}%` }); }); downloadBlob(new Blob([text || '_No text was detected._'], { type: 'text/plain' }), 'pdfnest-ocr.txt'); setStatus({ type: 'success', text: 'OCR text downloaded locally. The document stayed on this device.' }); return; }
      else if (tool.action === 'summarize') { const pdfjs = await loadPdfJs(); const summary = summarizeText(await getTextFromPdf(files[0], pdfjs)); downloadBlob(new Blob([summary], { type: 'text/markdown' }), 'pdfnest-summary.md'); setStatus({ type: 'success', text: 'Local summary downloaded. No document was uploaded.' }); return; }
      else if (tool.action === 'forms') { bytes = await addFormField(files[0], 'Fill this field'); filename = 'pdfnest-fillable-form.pdf'; }
      else if (tool.action === 'markdown') {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        const markdown = `# Extracted document\n\n${await getTextFromPdf(files[0], pdfjs) || '_No selectable text was found in this file._'}\n`;
        downloadBlob(new Blob([markdown], { type: 'text/markdown' }), 'pdfnest-document.md');
        setStatus({ type: 'success', text: 'Markdown downloaded. Your file stayed on this device.' });
        return;
      } else {
        setStatus({ type: 'info', text: 'This workbench is mapped and ready for its processing adapter. The heavier converter stays separate so the local-first tools remain fast and private.' });
        return;
      }
      downloadBlob(new Blob([bytes], { type: mime }), filename);
      setStatus({ type: 'success', text: 'Done — your new file was downloaded locally.' });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', text: 'That file could not be processed. Try an unencrypted PDF or another file.' });
    }
  };

  const showOption = (key, label, type = 'text', extra = {}) => <label className="option-label">{label}<input type={type} value={options[key]} onChange={(event) => setOption(key, event.target.value)} {...extra} /></label>;
  return <main className="tool-page"><div className="tool-breadcrumb"><button onClick={onBack}>All tools</button><span> / {tool.category} / {tool.title}</span></div><div className="tool-layout"><section><div className="tool-intro"><span className="eyebrow">{tool.category} tool</span><h1>{tool.title}</h1><p>{tool.description} Add your file below and PDFNest will keep the supported operation on this device.</p></div><div className="tool-workbench"><div className={`dropzone ${dragging ? 'dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }}><div><div className="drop-icon"><Icon name="upload" size={24} /></div><h3>Drop your file{multiFileTool ? 's' : ''} here</h3><p>or choose from your device · max 20 files</p><input ref={inputRef} className="file-input" type="file" multiple={multiFileTool} accept={tool.accept} onChange={(event) => addFiles(event.target.files)} /><button className="upload-button" onClick={() => inputRef.current?.click()}><Icon name={tool.action === 'images' ? 'image' : 'file'} size={15} />Choose file{multiFileTool ? 's' : ''}</button></div></div>
      {tool.action === 'images' && files.length > 0 && <div className="preview-heading"><div><strong>Arrange your images</strong><span>Drag cards to change the PDF order.</span></div><span className="preview-count">{files.length} {files.length === 1 ? 'image' : 'images'}</span></div>}
      {tool.action === 'images' && files.length > 0 && <div className="image-preview-grid" aria-label="Image preview and order">{previewUrls.map(({ file, url }, index) => <div className={`preview-card ${dragIndex === index ? 'dragging' : ''}`} key={`${file.name}-${index}`} draggable onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => reorderFiles(dragIndex, index)}><div className="preview-media"><img src={url} alt={`Preview of ${file.name}`} /><span className="preview-order">{index + 1}</span></div><div className="preview-card-footer"><div className="preview-name" title={file.name}>{file.name}</div><div className="preview-meta">{formatBytes(file.size)}</div><div className="preview-actions"><button disabled={index === 0} aria-label={`Move ${file.name} earlier`} onClick={() => moveFile(index, -1)}><Icon name="chevronUp" size={14} /></button><button disabled={index === files.length - 1} aria-label={`Move ${file.name} later`} onClick={() => moveFile(index, 1)}><Icon name="chevronDown" size={14} /></button><button className="preview-remove" aria-label={`Remove ${file.name}`} onClick={() => removeFile(index)}><Icon name="close" size={14} /></button></div></div></div>)}</div>}
      {files.length > 0 && tool.action !== 'images' && <div className="file-list">{files.map((file, index) => <div className="file-row" key={`${file.name}-${index}`} draggable={multiFileTool} onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => reorderFiles(dragIndex, index)}><span className="file-type"><Icon name={file.type.startsWith('image/') ? 'image' : 'file'} size={16} /></span><div className="file-meta"><div className="file-name">{file.name}</div><div className="file-size">{formatBytes(file.size)}</div></div>{multiFileTool && <div className="file-reorder"><button disabled={index === 0} aria-label={`Move ${file.name} earlier`} onClick={() => moveFile(index, -1)}><Icon name="chevronUp" size={14} /></button><button disabled={index === files.length - 1} aria-label={`Move ${file.name} later`} onClick={() => moveFile(index, 1)}><Icon name="chevronDown" size={14} /></button></div>}<button className="remove-file" aria-label={`Remove ${file.name}`} onClick={() => removeFile(index)}><Icon name="close" size={14} /></button></div>)}</div>}
      {tool.action === 'organize' && pagePreviews.length > 0 && <div className="page-preview-heading"><div><strong>Arrange your pages</strong><span>Drag a page card to change the PDF order.</span></div><span className="preview-count">{pagePreviews.length} {pagePreviews.length === 1 ? 'page' : 'pages'}</span></div>}
      {tool.action === 'organize' && pagePreviews.length > 0 && <div className="page-preview-grid" aria-label="PDF page preview and order">{pageOrder.map((pageIndex, index) => { const preview = pagePreviews[pageIndex]; return <div className={`page-preview-card ${pageDragIndex === index ? 'dragging' : ''}`} key={preview.pageNumber} draggable onDragStart={() => setPageDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => reorderPages(pageDragIndex, index)}><div className="page-preview-media"><img src={preview.url} alt={`Preview of page ${preview.pageNumber}`} /><span className="preview-order">{index + 1}</span></div><div className="page-preview-footer"><span>Original page {preview.pageNumber}</span><div className="preview-actions"><button disabled={index === 0} aria-label="Move page earlier" onClick={() => reorderPages(index, index - 1)}><Icon name="chevronUp" size={14} /></button><button disabled={index === pageOrder.length - 1} aria-label="Move page later" onClick={() => reorderPages(index, index + 1)}><Icon name="chevronDown" size={14} /></button></div></div></div>; })}</div>}
      {tool.action === 'split' && <div className="option-grid">{showOption('range', 'Pages to extract', 'text', { placeholder: '1-3, 5' })}</div>}
      {tool.action === 'rotate' && <div className="option-grid">{showOption('angle', 'Rotation', 'number', { min: 90, max: 270, step: 90 })}</div>}
      {tool.action === 'watermark' && <div className="option-grid">{showOption('watermark', 'Watermark text')}{showOption('opacity', 'Opacity', 'number', { min: 0.05, max: 1, step: 0.05 })}</div>}
      {tool.action === 'numbers' && <div className="option-grid"><label className="option-label">Position<select value={options.position} onChange={(event) => setOption('position', event.target.value)}><option value="bottom-center">Bottom center</option><option value="bottom-left">Bottom left</option><option value="bottom-right">Bottom right</option><option value="top-center">Top center</option></select></label></div>}
      {tool.action === 'crop' && <div className="option-grid">{showOption('margin', 'Margin to trim', 'number', { min: 1, max: 200 })}</div>}
      {tool.action === 'annotate' && <div className="option-grid">{showOption('note', 'Note to add')}</div>}
      {tool.action === 'sign' && <div className="option-grid">{showOption('signer', 'Signature line')}</div>}
      <div className="run-row"><small>{tool.action === 'compare' && files.length < 2 ? 'Add two PDFs to compare' : tool.supported || tool.action === 'markdown' ? 'Runs locally · nothing is uploaded' : 'UI ready · processing adapter planned'}</small><button className="run-button" disabled={!readyToRun || status?.type === 'working'} onClick={runTool}>{status?.type === 'working' ? 'Working…' : <><Icon name="arrowUpRight" size={15} />{tool.supported || tool.action === 'markdown' ? 'Process file' : 'Prepare tool'}</>}</button></div>{status && status.type !== 'working' && <div className={`status-message ${status.type === 'error' ? 'error' : ''}`}>{status.text}</div>}</div></section><aside className="tool-aside"><h3>Good to know</h3><ul><li><b>01</b><span>Files are kept in memory for supported local tools.</span></li><li><b>02</b><span>{multiFileTool ? 'Drag cards or use the arrow buttons to set the exact order.' : 'You can remove the queued file before processing.'}</span></li><li><b>03</b><span>Outputs are downloaded directly to your device.</span></li></ul>{!tool.supported && tool.action !== 'markdown' && <div className="capability-note">This tool is part of the full PDFNest catalog. Its heavier adapter is intentionally separate from the browser-only foundation.</div>}{tool.action === 'markdown' && <div className="capability-note">Text extraction works best when the source PDF already contains selectable text.</div>}</aside></div></main>;
}
class AppErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error) { console.error('PDFNest runtime error', error); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return <main className="error-screen"><span className="eyebrow">PDFNest</span><h1>We hit a small snag.</h1><p>Refresh the page and try again. Your files are not uploaded by PDFNest.</p><button className="primary-button" onClick={() => window.location.reload()}>Refresh PDFNest</button></main>;
  }
}

function AppContent() {
  const route = useRoute();
  const onNavigate = (path) => navigate(path);
  const toolId = route.startsWith('tool/') ? route.replace('tool/', '') : null;
  const tool = toolId ? toolMap[toolId] : null;
  useEffect(() => { document.title = tool ? `${tool.title} · PDFNest` : route === 'about' ? 'How PDFNest works · PDFNest' : 'PDFNest — Make PDFs feel lighter'; }, [route, tool]);
  return <div className="app-shell"><Header onNavigate={onNavigate} />{route === 'about' ? <About /> : tool ? <ToolPage tool={tool} onBack={() => onNavigate('home')} /> : <Home onOpen={(id) => onNavigate(`tool/${id}`)} />}</div>;
}

export default function App() {
  return <AppErrorBoundary><AppContent /></AppErrorBoundary>;
}
