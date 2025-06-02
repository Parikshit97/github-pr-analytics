import passport from 'passport';
import express from 'express';
const router = express.Router();

router.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }));

router.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to /docs
    res.redirect('/docs');
  }
);

export default router;
