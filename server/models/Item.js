const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['link', 'image', 'pdf', 'note'], required: true },

    // Raw input
    url: String,
    filePath: String,
    fileName: String,
    fileSize: Number,
    mimeType: String,
    rawContent: String, // extracted article text (truncated)

    // Fetched metadata
    favicon: String,
    previewImage: String,
    fileUrl: String,

    // AI-generated
    aiStatus: { type: String, enum: ['pending', 'processing', 'done', 'failed'], default: 'pending' },
    aiError: String,
    title: { type: String, default: 'Untitled' },
    summary: String,
    keyPoints: [String],
    tags: { type: [String], default: [], index: true },
    category: {
      type: String,
      enum: ['article', 'tutorial', 'video', 'recipe', 'paper', 'tool', 'inspiration', 'other'],
      default: 'other',
    },
    readingTimeMinutes: Number,

    // Embedding for semantic search (384-dim stored as array)
    embedding: [Number],

    // User edits
    userNotes: String,
    isFavorite: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    listIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'List' }],
  },
  { timestamps: true }
);

// Full-text search index
ItemSchema.index(
  { title: 'text', summary: 'text', rawContent: 'text', tags: 'text', userNotes: 'text' },
  { weights: { title: 10, tags: 8, summary: 5, rawContent: 1, userNotes: 3 } }
);

module.exports = mongoose.model('Item', ItemSchema);
