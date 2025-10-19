const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Check if Google OAuth is configured
const isGoogleConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

// @desc    Google OAuth login
// @route   GET /api/auth/google
// @access  Public
router.get('/google', (req, res, next) => {
  if (!isGoogleConfigured) {
    return res.status(503).json({ 
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file.' 
    });
  }
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get('/google/callback', (req, res, next) => {
  if (!isGoogleConfigured) {
    return res.redirect('http://localhost:3000/login?error=oauth_not_configured');
  }
  
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false 
  }, (err, user) => {
    if (err || !user) {
      console.error('OAuth callback error:', err);
      return res.redirect('http://localhost:3000/login?error=auth_failed');
    }
    
    try {
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Redirect to frontend with token
      res.redirect(`http://localhost:3000/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Token generation error:', error);
      res.redirect('http://localhost:3000/login?error=auth_failed');
    }
  })(req, res, next);
});

// @desc    Check auth status
// @route   GET /api/auth/status
// @access  Public
router.get('/status', (req, res) => {
  res.json({
    isAuthenticated: req.isAuthenticated(),
    user: req.user || null
  });
});

module.exports = router;
