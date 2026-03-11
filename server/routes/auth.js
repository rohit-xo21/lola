const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const { generateToken, authMiddleware } = require('../middleware/auth');
const router = express.Router();

// ──── Google OAuth (only sign-in method) ────────────────────────────────
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  accessType: 'online',
}));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const token = generateToken(req.user._id);
    const clientUrl = process.env.CLIENT_URL || 'https://lola-two.vercel.app';
    res.redirect(`${clientUrl}/oauth/callback?token=${token}`);
  }
);

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(publicUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/logout', (req, res) => res.json({ message: 'Logged out' }));

function publicUser(user) {
  return {
    _id: user._id,
    displayName: user.displayName,
    avatar: user.avatar,
    email: user.email,
    hasGroqKey: !!(user.settings?.groqApiKey),
    settings: {
      groqModel: user.settings?.groqModel,
      ollamaBaseUrl: user.settings?.ollamaBaseUrl,
      ollamaModel: user.settings?.ollamaModel,
      preferredView: user.settings?.preferredView,
    },
  };
}

module.exports = router;
