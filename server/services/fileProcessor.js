const fs = require('fs');
const path = require('path');
const os = require('os');
const { pathToFileURL } = require('url');

/**
 * Download a remote URL to a temp file. Returns the temp file path.
 * Caller must delete it when done.
 */
async function downloadToTemp(url, ext) {
  const tmpPath = path.join(os.tmpdir(), `lola_${Date.now()}${ext || ''}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(tmpPath, Buffer.from(buffer));
  console.log(`[fileProcessor] Downloaded to temp: ${tmpPath} (${buffer.byteLength} bytes)`);
  return tmpPath;
}

async function extractPdfText(filePath) {
  try {
    // pdfjs-dist v5 is ESM-only; use dynamic import() from CommonJS
    const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    // Point to the bundled worker so pdfjs can spawn it in Node.js
    const workerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');
    GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

    const buffer = fs.readFileSync(filePath);
    const data = new Uint8Array(buffer);

    const loadingTask = getDocument({
      data,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
      disableAutoFetch: true,
      disableStream: true,
    });
    const doc = await loadingTask.promise;

    let fullText = '';
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    const text = fullText.trim().slice(0, 32000);
    console.log(`[fileProcessor] PDF extracted: ${text.length} chars from ${filePath} (${doc.numPages} pages)`);
    return text;
  } catch (err) {
    console.error('[fileProcessor] PDF parse error:', err.message, 'Path:', filePath);
    return '';
  }
}

function getPublicUrl(filePath) {
  // Convert absolute path to relative URL served by /uploads static route
  const uploadsIndex = filePath.indexOf('uploads');
  if (uploadsIndex === -1) return '';
  return '/' + filePath.slice(uploadsIndex).replace(/\\/g, '/');
}

module.exports = { extractPdfText, downloadToTemp, getPublicUrl };
