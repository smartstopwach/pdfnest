import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  annotatePdf,
  compressPdf,
  cropPdf,
  downloadBlob,
  extensionForTool,
  formatBytes,
  getTextFromPdf,
  imageFilesToPdf,
  mergePdfs,
  numberPdf,
  rotatePdf,
  selectPages,
  watermarkPdf,
} from './lib/pdfTools';

const categories = ['All', 'Organize', 'Optimize', 'Convert', 'Edit', 'Security', 'Intelligence'];

const tools = [
  { id: 'merge-pdf', title: 'Merge PDF', description: 'Join documents in the order you want, with one clean download.', category: 'Organize', icon: '＋', accept: '.pdf', supported: true, action: 'merge' },
  { id: 'split-pdf', title: 'Split PDF', description: 'Extract a range of pages or make a focused new document.', category: 'Organize', icon: '⇆', accept: '.pdf', supported: true, action: 'split' },
  { id: 'compress-pdf', title: 'Compress PDF', description: 'Reduce document weight while keeping the content crisp.', category: 'Optimize', icon: '⌁', accept: '.pdf', supported: true, action: 'compress' },
  { id: 'pdf-to-word', title: 'PDF to Word', description: 'Turn PDF content into an editable Word document.', category: 'Convert', icon: 'W', accept: '.pdf', badge: 'beta', action: 'unsupported' },
  { id: 'pdf-to-powerpoint', title: 'PDF to PowerPoint', description: 'Transform pages into a presentation-ready deck.', category: 'Convert', icon: 'P', accept: '.pdf', action: 'unsupported' },
  { id: 'pdf-to-excel', title: 'PDF to Excel', description: 'Pull tables from documents into a spreadsheet.', category: 'Convert', icon: 'X', accept: '.pdf', action: 'unsupported' },
  { id: 'word-to-pdf', title: 'Word to PDF', description: 'Create a shareable PDF from a DOC or DOCX file.', category: 'Convert', icon: 'W', accept: '.doc,.docx', action: 'unsupported' },
  { id: 'powerpoint-to-pdf', title: 'PowerPoint to PDF', description: 'Export slides into a portable PDF document.', category: 'Convert', icon: 'P', accept: '.ppt,.pptx', action: 'unsupported' },
  { id: 'excel-to-pdf', title: 'Excel to PDF', description: 'Make spreadsheets easy to view and send.', category: 'Convert', icon: 'X', accept: '.xls,.xlsx', action: 'unsupported' },
  { id: 'edit-pdf', title: 'Edit PDF', description: 'Add a note to your first page without leaving the browser.', category: 'Edit', icon: '✎', accept: '.pdf', supported: true, action: 'annotate' },
  { id: 'pdf-to-jpg', title: 'PDF to JPG', description: 'Export pages as sharp images for quick sharing.', category: 'Convert', icon: '▧', accept: '.pdf', action: 'unsupported' },
  { id: 'jpg-to-pdf', title: 'JPG to PDF', description: 'Bundle images into a neat, print-ready PDF.', category: 'Convert', icon: '▤', accept: '.jpg,.jpeg,.png', supported: true, action: 'images' },
  { id: 'sign-pdf', title: 'Sign PDF', description: 'Add a simple typed signature line to your document.', category: 'Edit', icon: '✓', accept: '.pdf', supported: true, action: 'sign' },
  { id: 'watermark-pdf', title: 'Watermark', description: 'Stamp every page with a subtle, custom text mark.', category: 'Edit', icon: '◇', accept: '.pdf', supported: true, action: 'watermark' },
  { id: 'rotate-pdf', title: 'Rotate PDF', description: 'Turn every page to the angle your document needs.', category: 'Organize', icon: '↻', accept: '.pdf', supported: true, action: 'rotate' },
  { id: 'html-to-pdf', title: 'HTML to PDF', description: 'Prepare a webpage or HTML file for offline sharing.', category: 'Convert', icon: '</>', accept: '.html,.htm', action: 'unsupported' },
  { id: 'unlock-pdf', title: 'Unlock PDF', description: 'Open password-protected files that you are authorized to use.', category: 'Security', icon: '⌑', accept: '.pdf', action: 'unsupported' },
  { id: 'protect-pdf', title: 'Protect PDF', description: 'Add encryption and a password before you share.', category: 'Security', icon: '⊙', accept: '.pdf', action: 'unsupported' },
  { id: 'organize-pdf', title: 'Organize PDF', description: 'Reorder pages into a new document using a simple page list.', category: 'Organize', icon: '☷', accept: '.pdf', supported: true, action: 'organize' },
  { id: 'pdf-to-pdfa', title: 'PDF to PDF/A', description: 'Convert a document for long-term archival workflows.', category: 'Optimize', icon: 'A', accept: '.pdf', action: 'unsupported' },
  { id: 'repair-pdf', title: 'Repair PDF', description: 'Attempt recovery of a damaged or partially readable file.', category: 'Optimize', icon: '⚒', accept: '.pdf', action: 'unsupported' },
  { id: 'page-numbers', title: 'Page numbers', description: 'Add clear, consistent numbering to every page.', category: 'Edit', icon: '#', accept: '.pdf', supported: true, action: 'numbers' },
  { id: 'scan-pdf', title: 'Scan to PDF', description: 'A mobile capture flow for turning scans into documents.', category: 'Convert', icon: '⌗', accept: 'image/*', action: 'unsupported' },
  { id: 'ocr-pdf', title: 'OCR PDF', description: 'Make scanned pages searchable and selectable.', category: 'Intelligence', icon: '⌕', accept: '.pdf', badge: 'beta', action: 'unsupported' },
  { id: 'compare-pdf', title: 'Compare PDF', description: 'Spot meaningful changes between two document versions.', category: 'Intelligence', icon: '⇄', accept: '.pdf', action: 'unsupported' },
  { id: 'redact-pdf', title: 'Redact PDF', description: 'Permanently cover sensitive details before sharing.', category: 'Security', icon: '▬', accept: '.pdf', action: 'unsupported' },
  { id: 'crop-pdf', title: 'Crop PDF', description: 'Trim page margins consistently across your document.', category: 'Edit', icon: '⌗', accept: '.pdf', supported: true, action: 'crop' },
  { id: 'pdf-forms', title: 'PDF Forms', description: 'Build an accessible fillable form from a blank PDF.', category: 'Edit', icon: '▣', badge: 'new', accept: '.pdf', action: 'unsupported' },
  { id: 'summarize-pdf', title: 'AI Summarizer', description: 'Create a quick outline of text-based PDF content.', category: 'Intelligence', icon: '✦', badge: 'new', accept: '.pdf', action: 'unsupported' },
  { id: 'translate-pdf', title: 'Translate PDF', description: 'Prepare document content for a translation workflow.', category: 'Intelligence', icon: '文', badge: 'new', accept: '.pdf', action: 'unsupported' },
  { id: 'pdf-to-markdown', title: 'PDF to Markdown', description: 'Extract text for notes, docs, and AI-ready workflows.', category: 'Intelligence', icon: 'M', badge: 'new', accept: '.pdf', action: 'markdown' },
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
  return <button className="brand" onClick={onClick} aria-label="Go to PDFNest home"><span className="brand-mark">P</span><span>PDFNest</span></button>;
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
    <span className="tool-icon" aria-hidden="true">{tool.icon}</span>
    <h3>{tool.title}{tool.badge && <span className="badge">{tool.badge}</span>}</h3>
    <p>{tool.description}</p>
    <span className="arrow" aria-hidden="true">↗</span>
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
          <div className="hero-actions"><button className="primary-button" onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}>Browse PDF tools <span aria-hidden="true">↗</span></button><span className="hero-note">No account required · files stay local</span></div>
        </div>
        <div className="orbit-card back" aria-hidden="true"><div className="mini-icon">↻</div><strong>Rotate pages</strong><span>Fix the little things, fast.</span></div>
        <div className="orbit-card" aria-hidden="true"><div className="mini-icon">P</div><strong>PDF ready</strong><span>Everything in its right place.</span></div>
      </section>

      <section className="section" id="tools">
        <div className="section-heading"><div><span className="eyebrow">The toolkit</span><h2>One home for every PDF job.</h2></div><p>Start with a focused tool, or browse the full library. Every workbench uses the same familiar flow.</p></div>
        <div className="filter-bar" aria-label="Filter PDF tools">{categories.map((category) => <button key={category} className={`filter ${filter === category ? 'active' : ''}`} onClick={() => setFilter(category)}>{category}</button>)}<label className="search-wrap"><span className="sr-only">Search tools</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools" /></label></div>
        <div className="tool-grid">{visibleTools.map((tool) => <ToolCard key={tool.id} tool={tool} onOpen={onOpen} />)}</div>
        {!visibleTools.length && <div className="empty-state">No tools match that search yet. Try “merge”, “convert”, or “sign”.</div>}
      </section>

      <section className="trust-strip"><div className="trust-copy"><span className="eyebrow">Designed for real work</span><h2>Your documents, your control.</h2><p>PDFNest is built as a privacy-first foundation: the tools that work locally never need an upload or an account.</p></div><div className="trust-pills"><div className="trust-pill"><b>⌂</b><span>Browser-first<br />processing</span></div><div className="trust-pill"><b>↯</b><span>Fast, focused<br />workflows</span></div><div className="trust-pill"><b>✦</b><span>Open roadmap<br />for integrations</span></div></div></section>
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
  const [options, setOptions] = useState({ range: '1-3', angle: '90', watermark: 'CONFIDENTIAL', opacity: '0.22', position: 'bottom-center', margin: '24', note: 'Reviewed with PDFNest', signer: 'Signed with PDFNest' });
  const inputRef = useRef(null);

  useEffect(() => {
    if (tool.action !== 'images') {
      setPreviewUrls([]);
      return undefined;
    }
    const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPreviewUrls(next);
    return () => next.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [files, tool.action]);

  const addFiles = (incoming) => {
    const incomingFiles = [...incoming];
    const accepted = incomingFiles.filter((file) => {
      if (tool.accept === 'image/*') return file.type.startsWith('image/');
      const extensions = tool.accept.split(',').map((value) => value.trim().replace('.', ''));
      return extensions.some((extension) => file.name.toLowerCase().endsWith(`.${extension}`));
    });
    if (accepted.length < incomingFiles.length) setStatus({ type: 'error', text: `Please add a supported file type: ${tool.accept.replaceAll('.', '').toUpperCase()}.` });
    setFiles((current) => [...current, ...accepted].slice(0, tool.action === 'merge' || tool.action === 'images' ? 20 : 2));
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

  const runTool = async () => {
    if (!files.length) return;
    setStatus({ type: 'working', text: 'Working locally in your browser…' });
    try {
      let bytes;
      let filename;
      if (tool.action === 'merge') { bytes = await mergePdfs(files); filename = 'pdfnest-merged.pdf'; }
      else if (tool.action === 'split') { bytes = await selectPages(files[0], options.range); filename = 'pdfnest-pages.pdf'; }
      else if (tool.action === 'organize') { bytes = await selectPages(files[0], options.range || '1'); filename = 'pdfnest-organized.pdf'; }
      else if (tool.action === 'rotate') { bytes = await rotatePdf(files[0], options.angle); filename = 'pdfnest-rotated.pdf'; }
      else if (tool.action === 'compress') { bytes = await compressPdf(files[0]); filename = 'pdfnest-compressed.pdf'; }
      else if (tool.action === 'watermark') { bytes = await watermarkPdf(files[0], options.watermark, options.opacity); filename = 'pdfnest-watermarked.pdf'; }
      else if (tool.action === 'numbers') { bytes = await numberPdf(files[0], options.position); filename = 'pdfnest-numbered.pdf'; }
      else if (tool.action === 'crop') { bytes = await cropPdf(files[0], options.margin); filename = 'pdfnest-cropped.pdf'; }
      else if (tool.action === 'annotate') { bytes = await annotatePdf(files[0], options.note); filename = 'pdfnest-edited.pdf'; }
      else if (tool.action === 'sign') { bytes = await annotatePdf(files[0], options.signer); filename = 'pdfnest-signed.pdf'; }
      else if (tool.action === 'images') { bytes = await imageFilesToPdf(files); filename = 'pdfnest-images.pdf'; }
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
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), filename);
      setStatus({ type: 'success', text: 'Done — your new file was downloaded locally.' });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', text: 'That file could not be processed. Try an unencrypted PDF or another file.' });
    }
  };

  const showOption = (key, label, type = 'text', extra = {}) => <label className="option-label">{label}<input type={type} value={options[key]} onChange={(event) => setOption(key, event.target.value)} {...extra} /></label>;
  const multiFileTool = tool.action === 'merge' || tool.action === 'images';

  return <main className="tool-page"><div className="tool-breadcrumb"><button onClick={onBack}>All tools</button><span> / {tool.category} / {tool.title}</span></div><div className="tool-layout"><section><div className="tool-intro"><span className="eyebrow">{tool.category} tool</span><h1>{tool.title}</h1><p>{tool.description} Add your file below and PDFNest will keep the supported operation on this device.</p></div><div className="tool-workbench"><div className={`dropzone ${dragging ? 'dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }}><div><div className="drop-icon">↑</div><h3>Drop your file{multiFileTool ? 's' : ''} here</h3><p>or choose from your device · max 20 files</p><input ref={inputRef} className="file-input" type="file" multiple={multiFileTool} accept={tool.accept} onChange={(event) => addFiles(event.target.files)} /><button className="upload-button" onClick={() => inputRef.current?.click()}>Choose file{multiFileTool ? 's' : ''}</button></div></div>
      {tool.action === 'images' && files.length > 0 && <div className="preview-heading"><div><strong>Arrange your images</strong><span>Drag cards to change the PDF order.</span></div><span className="preview-count">{files.length} {files.length === 1 ? 'image' : 'images'}</span></div>}
      {tool.action === 'images' && files.length > 0 && <div className="image-preview-grid" aria-label="Image preview and order">{previewUrls.map(({ file, url }, index) => <div className={`preview-card ${dragIndex === index ? 'dragging' : ''}`} key={`${file.name}-${index}`} draggable onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => reorderFiles(dragIndex, index)}><div className="preview-media"><img src={url} alt={`Preview of ${file.name}`} /><span className="preview-order">{index + 1}</span></div><div className="preview-card-footer"><div className="preview-name" title={file.name}>{file.name}</div><div className="preview-meta">{formatBytes(file.size)}</div><div className="preview-actions"><button disabled={index === 0} aria-label={`Move ${file.name} earlier`} onClick={() => moveFile(index, -1)}>↑</button><button disabled={index === files.length - 1} aria-label={`Move ${file.name} later`} onClick={() => moveFile(index, 1)}>↓</button><button className="preview-remove" aria-label={`Remove ${file.name}`} onClick={() => removeFile(index)}>×</button></div></div></div>)}</div>}
      {files.length > 0 && tool.action !== 'images' && <div className="file-list">{files.map((file, index) => <div className="file-row" key={`${file.name}-${index}`} draggable={multiFileTool} onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => reorderFiles(dragIndex, index)}><span className="file-type">{file.name.split('.').pop().toUpperCase().slice(0, 4)}</span><div className="file-meta"><div className="file-name">{file.name}</div><div className="file-size">{formatBytes(file.size)}</div></div>{multiFileTool && <div className="file-reorder"><button disabled={index === 0} aria-label={`Move ${file.name} earlier`} onClick={() => moveFile(index, -1)}>↑</button><button disabled={index === files.length - 1} aria-label={`Move ${file.name} later`} onClick={() => moveFile(index, 1)}>↓</button></div>}<button className="remove-file" aria-label={`Remove ${file.name}`} onClick={() => removeFile(index)}>×</button></div>)}</div>}
      {['split', 'organize'].includes(tool.action) && <div className="option-grid">{showOption('range', tool.action === 'split' ? 'Pages to extract' : 'Page order', 'text', { placeholder: '1-3, 5' })}</div>}
      {tool.action === 'rotate' && <div className="option-grid">{showOption('angle', 'Rotation', 'number', { min: 90, max: 270, step: 90 })}</div>}
      {tool.action === 'watermark' && <div className="option-grid">{showOption('watermark', 'Watermark text')}{showOption('opacity', 'Opacity', 'number', { min: 0.05, max: 1, step: 0.05 })}</div>}
      {tool.action === 'numbers' && <div className="option-grid"><label className="option-label">Position<select value={options.position} onChange={(event) => setOption('position', event.target.value)}><option value="bottom-center">Bottom center</option><option value="bottom-left">Bottom left</option><option value="bottom-right">Bottom right</option><option value="top-center">Top center</option></select></label></div>}
      {tool.action === 'crop' && <div className="option-grid">{showOption('margin', 'Margin to trim', 'number', { min: 1, max: 200 })}</div>}
      {tool.action === 'annotate' && <div className="option-grid">{showOption('note', 'Note to add')}</div>}
      {tool.action === 'sign' && <div className="option-grid">{showOption('signer', 'Signature line')}</div>}
      <div className="run-row"><small>{tool.supported || tool.action === 'markdown' ? 'Runs locally · nothing is uploaded' : 'UI ready · processing adapter planned'}</small><button className="run-button" disabled={!files.length || status?.type === 'working'} onClick={runTool}>{status?.type === 'working' ? 'Working…' : tool.supported || tool.action === 'markdown' ? 'Process file' : 'Prepare tool'}</button></div>{status && status.type !== 'working' && <div className={`status-message ${status.type === 'error' ? 'error' : ''}`}>{status.text}</div>}</div></section><aside className="tool-aside"><h3>Good to know</h3><ul><li><b>01</b><span>Files are kept in memory for supported local tools.</span></li><li><b>02</b><span>{multiFileTool ? 'Drag cards or use the arrow buttons to set the exact order.' : 'You can remove the queued file before processing.'}</span></li><li><b>03</b><span>Outputs are downloaded directly to your device.</span></li></ul>{!tool.supported && tool.action !== 'markdown' && <div className="capability-note">This tool is part of the full PDFNest catalog. Its heavier adapter is intentionally separate from the browser-only foundation.</div>}{tool.action === 'markdown' && <div className="capability-note">Text extraction works best when the source PDF already contains selectable text.</div>}</aside></div></main>;
}
export default function App() {
  const route = useRoute();
  const onNavigate = (path) => navigate(path);
  const toolId = route.startsWith('tool/') ? route.replace('tool/', '') : null;
  const tool = toolId ? toolMap[toolId] : null;
  useEffect(() => { document.title = tool ? `${tool.title} · PDFNest` : route === 'about' ? 'How PDFNest works · PDFNest' : 'PDFNest — Make PDFs feel lighter'; }, [route, tool]);
  return <div className="app-shell"><Header onNavigate={onNavigate} />{route === 'about' ? <About /> : tool ? <ToolPage tool={tool} onBack={() => onNavigate('home')} /> : <Home onOpen={(id) => onNavigate(`tool/${id}`)} />}</div>;
}
