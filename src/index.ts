import express from 'express';
import session from 'express-session';
import passport from 'passport';
import './config/passport.js';

import prRoutes from './routes/prRoutes.js';
import developerRoutes from './routes/developerRoutes.js';
import authRoutes from './routes/auth.js';
import { ensureAuthenticated, ensureSessionAuthenticated } from './middleware/auth.js';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

import config from 'config';

const PORT = config.get<number>('server.port');


const SESSION_SECRET = config.get<string>('session.secret');
if (process.env.NODE_ENV === 'production' && (!process.env.SESSION_SECRET || !process.env.GITHUB_CLIENT_SECRET || !process.env.GITHUB_CLIENT_ID)) {
  throw new Error('Production requires SESSION_SECRET, GITHUB_CLIENT_ID, and GITHUB_CLIENT_SECRET.');
}
const app = express();

app.get('/health', (_req, res) => { res.json({ status: 'ok' }); });

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


app.get('/', ensureSessionAuthenticated, (req, res) => {
  res.send('GitHub PR Analytics');
});

app.use('/docs', ensureSessionAuthenticated, swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use(authRoutes);

app.use('/repos/:owner/:repo/prs', ensureAuthenticated, prRoutes);
app.use('/repos/:owner/:repo/dev', ensureAuthenticated, developerRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
