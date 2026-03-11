const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const List = require('../models/List');
const Item = require('../models/Item');

// GET /lists
router.get('/', authMiddleware, async (req, res) => {
  try {
    const lists = await List.find({ userId: req.userId }).sort({ createdAt: -1 });
    // Attach item count
    const withCounts = await Promise.all(
      lists.map(async (list) => {
        const count = await Item.countDocuments({ userId: req.userId, listIds: list._id });
        return { ...list.toObject(), itemCount: count };
      })
    );
    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /lists
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const list = await List.create({ userId: req.userId, name, description, color, icon });
    res.status(201).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /lists/:id
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    const list = await List.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, description, color, icon },
      { new: true }
    );
    if (!list) return res.status(404).json({ error: 'Not found' });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /lists/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const list = await List.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!list) return res.status(404).json({ error: 'Not found' });
    // Remove list from all items
    await Item.updateMany({ userId: req.userId }, { $pull: { listIds: list._id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /lists/:id/items  — add item to list
router.post('/:id/items', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.body;
    await Item.findOneAndUpdate({ _id: itemId, userId: req.userId }, { $addToSet: { listIds: req.params.id } });
    res.json({ message: 'Added to list' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /lists/:id/items/:itemId — remove item from list
router.delete('/:id/items/:itemId', authMiddleware, async (req, res) => {
  try {
    await Item.findOneAndUpdate(
      { _id: req.params.itemId, userId: req.userId },
      { $pull: { listIds: req.params.id } }
    );
    res.json({ message: 'Removed from list' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
