const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');

// GET /settings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({
      groqApiKey: user.settings?.groqApiKey ? '***' : '',  // never expose key
      hasGroqKey: !!(user.settings?.groqApiKey),
      groqModel: user.settings?.groqModel || 'llama-3.3-70b-versatile',
      ollamaBaseUrl: user.settings?.ollamaBaseUrl || '',
      ollamaModel: user.settings?.ollamaModel || '',
      preferredView: user.settings?.preferredView || 'grid',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /settings
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { groqApiKey, groqModel, ollamaBaseUrl, ollamaModel, preferredView } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Not found' });

    if (groqApiKey !== undefined && groqApiKey !== '***') user.settings.groqApiKey = groqApiKey;
    if (groqModel) user.settings.groqModel = groqModel;
    if (ollamaBaseUrl !== undefined) user.settings.ollamaBaseUrl = ollamaBaseUrl;
    if (ollamaModel !== undefined) user.settings.ollamaModel = ollamaModel;
    if (preferredView) user.settings.preferredView = preferredView;

    user.markModified('settings');
    await user.save();
    res.json({ message: 'Settings saved', hasGroqKey: !!(user.settings.groqApiKey) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
