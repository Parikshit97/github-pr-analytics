import express from "express";
import passport from "passport";

const router = express.Router();

// Redirect to GitHub for login
router.get('/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));

// GitHub redirects here after auth
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful auth
    res.redirect('/profile');
  }
);

// Protected route
router.get('/profile', (req, res) : any => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  res.json(req.user);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

export default router;
