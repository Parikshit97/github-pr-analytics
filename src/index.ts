import express from 'express';
import dotenvFlow from 'dotenv-flow';
import session from 'express-session';
import passport from 'passport';
import './config/passport.js';

import prRoutes from './routes/prRoutes.js';
import developerRoutes from './routes/developerRoutes.js';
import authRoutes from './routes/auth.js';
import { ensureAuthenticated, ensureSessionAuthenticated } from './middleware/auth.js';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

dotenvFlow.config();

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const port = process.env.PORT || 3000;

// 👇 Redirect root to login if not authenticated
app.get('/', ensureSessionAuthenticated, (req, res) => {
  res.send(`Welcome, 'GitHub User'}!`);
});

app.use('/docs', ensureSessionAuthenticated, swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// 👇 Mount authentication routes
app.use(authRoutes);

// 👇 Protected API routes
app.use('/repos/:owner/:repo/prs', ensureAuthenticated, prRoutes);
app.use('/repos/:owner/:repo/dev', ensureAuthenticated, developerRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
