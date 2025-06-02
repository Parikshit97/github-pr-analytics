import express from 'express';
import passport from 'passport';

const router = express.Router();

// Start GitHub login
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub OAuth callback
router.get('/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/auth/github/failure',
    successRedirect: '/doc', // After successful login
  })
);

// Optional failure route
router.get('/auth/github/failure', (req, res) => {
  res.status(401).send('GitHub authentication failed');
});

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

export default router;
