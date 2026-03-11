const Item = require('../models/Item');
const User = require('../models/User');
const { processLink, processNote, processImage } = require('./groq');
const { extractPdfText, downloadToTemp } = require('./fileProcessor');
const fs = require('fs');

// Simple concurrency-limited queue (CommonJS compatible, no external deps)
class SimpleQueue {
  constructor(concurrency = 2) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }
  add(fn) {
    this.queue.push(fn);
    this._run();
  }
  _run() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const fn = this.queue.shift();
      this.running++;
      Promise.resolve(fn()).finally(() => { this.running--; this._run(); });
    }
  }
}

const queue = new SimpleQueue(2);

async function enqueueAiProcessing(itemId, userId) {
  queue.add(() => processItem(itemId, userId));
}

async function processItem(itemId, userId) {
  let item;
  try {
    item = await Item.findById(itemId);
    if (!item) {
      console.warn('[aiQueue] Item not found:', itemId);
      return;
    }

    const user = await User.findById(userId);
    const apiKey = user?.settings?.groqApiKey;
    const model = user?.settings?.groqModel || 'llama-3.3-70b-versatile';

    if (!apiKey) {
      console.warn('[aiQueue] No Groq API key for user:', userId);
      await Item.findByIdAndUpdate(itemId, { aiStatus: 'failed', aiError: 'No Groq API key set' });
      return;
    }

    console.log(`[aiQueue] Processing item ${itemId} (type=${item.type}, rawContent.length=${item.rawContent?.length || 0})`);
    await Item.findByIdAndUpdate(itemId, { aiStatus: 'processing' });

    let result = {};

    if (item.type === 'link') {
      result = await processLink({ apiKey, model, content: item.rawContent, title: item.title });
    } else if (item.type === 'note') {
      result = await processNote({ apiKey, model, content: item.rawContent || '' });
    } else if (item.type === 'image') {
      result = await processImage({ apiKey, model, filename: item.fileName || 'image' });
    } else if (item.type === 'pdf') {
      let pdfText = item.rawContent || '';

      if (!pdfText) {
        let tmpFile = null;
        try {
          // Local multer upload
          if (item.filePath) {
            pdfText = await extractPdfText(item.filePath).catch(() => '');
          }
          // UploadThing URL — download to temp then extract
          else if (item.fileUrl) {
            console.log(`[aiQueue] Downloading PDF from UploadThing for ${itemId}`);
            tmpFile = await downloadToTemp(item.fileUrl, '.pdf');
            pdfText = await extractPdfText(tmpFile).catch(() => '');
          }
        } finally {
          if (tmpFile) { try { fs.unlinkSync(tmpFile); } catch {} }
        }
        if (pdfText) {
          await Item.findByIdAndUpdate(itemId, { rawContent: pdfText });
          console.log(`[aiQueue] Extracted ${pdfText.length} chars from PDF, saved to rawContent`);
        }
      }

      if (pdfText) {
        result = await processLink({ apiKey, model, content: pdfText, title: item.fileName || 'PDF' });
      } else {
        // Scanned/image-only PDF with no embedded text
        result = await processImage({ apiKey, model, filename: item.fileName || 'document.pdf' });
      }
    }

    await Item.findByIdAndUpdate(itemId, {
      aiStatus: 'done',
      title: result.title || item.title,
      summary: result.summary || '',
      keyPoints: result.key_points || [],
      tags: result.tags || [],
      category: result.category || 'other',
      readingTimeMinutes: result.reading_time_minutes || null,
    });
    console.log(`[aiQueue] Completed processing item ${itemId}`);
  } catch (err) {
    console.error('[aiQueue] Error processing item', itemId, ':', err.message);
    if (item) {
      await Item.findByIdAndUpdate(itemId, { aiStatus: 'failed', aiError: err.message }).catch(() => {});
    }
  }
}

module.exports = { enqueueAiProcessing };
