const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Item = require('../models/Item');
const { scrapeUrl } = require('../services/scraper');
const { extractPdfText, getPublicUrl } = require('../services/fileProcessor');
const { enqueueAiProcessing } = require('../services/aiQueue');

// GET /items  — list with filters
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 24, listId, tag, type, q, favorite, archived } = req.query;
    const filter = { userId: req.userId };

    if (listId) filter.listIds = { $in: [listId] };
    if (tag) filter.tags = tag;
    if (type) filter.type = type;
    if (favorite === 'true') filter.isFavorite = true;
    if (archived === 'true') filter.isArchived = true;
    else filter.isArchived = { $ne: true };

    if (q) {
      filter.$text = { $search: q };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Item.find(filter)
        .select('-rawContent -embedding')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Item.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /items/preview?url=... — quick title/favicon fetch (no AI)
router.get('/preview', authMiddleware, async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url required' });
  try {
    const meta = await scrapeUrl(url);
    res.json({ title: meta.title || '', favicon: meta.favicon || '', previewImage: meta.previewImage || '' });
  } catch {
    res.json({ title: '', favicon: '', previewImage: '' });
  }
});

// GET /items/tags — aggregated tag cloud
router.get('/tags', authMiddleware, async (req, res) => {
  try {
    const tags = await Item.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(req.userId) } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 100 },
      { $project: { name: '$_id', count: 1, _id: 0 } },
    ]);
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /items/search — semantic/fulltext search
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q = '', mode = 'fulltext', limit = 12 } = req.query;
    if (!q) return res.json({ results: [] });

    const filter = { userId: req.userId, isArchived: { $ne: true }, $text: { $search: q } };
    const items = await Item.find(filter)
      .select('-rawContent -embedding')
      .limit(Number(limit));

    res.json({ results: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /items/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, userId: req.userId }).select('-embedding');
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /items — create link or note
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, url, content, listIds } = req.body;

    if (type === 'link') {
      if (!url) return res.status(400).json({ error: 'URL required' });
      const meta = await scrapeUrl(url);
      const item = await Item.create({
        userId: req.userId,
        type: 'link',
        url,
        title: meta.title || url,
        favicon: meta.favicon,
        previewImage: meta.previewImage,
        rawContent: meta.rawContent,
        aiStatus: 'pending',
        listIds: Array.isArray(listIds) ? listIds : [],
      });
      enqueueAiProcessing(item._id, req.userId);
      return res.status(201).json(item);
    }

    if (type === 'note') {
      const item = await Item.create({
        userId: req.userId,
        type: 'note',
        title: content?.slice(0, 60) || 'Note',
        rawContent: content || '',
        aiStatus: 'pending',
        listIds: Array.isArray(listIds) ? listIds : [],
      });
      enqueueAiProcessing(item._id, req.userId);
      return res.status(201).json(item);
    }

    res.status(400).json({ error: 'Invalid type. Use file upload for images/pdfs.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /items/upload — file upload (image or pdf)
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const isPdf = req.file.mimetype === 'application/pdf';
    const filePath = req.file.path;
    const publicUrl = getPublicUrl(filePath);

    let rawContent = '';
    if (isPdf) rawContent = await extractPdfText(filePath);

    let listIds = [];
    if (req.body.listIds) {
      try {
        listIds = JSON.parse(req.body.listIds);
      } catch (e) {
        // fallback if listIds parsing fails
      }
    }

    // Upload to UploadThing is handled client-side.
    // fileUrl is passed in req.body if client already uploaded via UploadThing.
    const item = await Item.create({
      userId: req.userId,
      type: isPdf ? 'pdf' : 'image',
      filePath,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      rawContent,
      previewImage: isPdf ? '' : publicUrl,
      fileUrl: publicUrl,
      title: req.file.originalname,
      aiStatus: 'pending',
      listIds: Array.isArray(listIds) ? listIds : [],
    });

    enqueueAiProcessing(item._id, req.userId);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /items/upload-ut — create item from an already-uploaded UploadThing URL
router.post('/upload-ut', authMiddleware, async (req, res) => {
  try {
    const { fileUrl, fileName, fileSize, mimeType, listIds } = req.body;
    if (!fileUrl) return res.status(400).json({ error: 'fileUrl required' });

    const isPdf = mimeType === 'application/pdf';
    const item = await Item.create({
      userId: req.userId,
      type: isPdf ? 'pdf' : 'image',
      fileName: fileName || 'upload',
      fileSize: fileSize || 0,
      mimeType: mimeType || 'application/octet-stream',
      fileUrl,
      previewImage: isPdf ? '' : fileUrl,
      title: fileName || 'Uploaded file',
      aiStatus: 'pending',
      listIds: Array.isArray(listIds) ? listIds : [],
    });

    enqueueAiProcessing(item._id, req.userId);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /items/:id
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const allowed = ['title', 'tags', 'userNotes', 'isFavorite', 'isArchived', 'listIds', 'category', 'summary', 'keyPoints'];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updates,
      { new: true }
    ).select('-embedding');
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /items/:id/reprocess — re-queue AI processing for a failed item
router.post('/:id/reprocess', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { aiStatus: 'pending', aiError: null },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    enqueueAiProcessing(item._id, req.userId);
    res.json({ message: 'Reprocessing started', item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /items/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
