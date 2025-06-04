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


const GITHUB_CLIENT_SECRET = config.get<string>('github.clientSecret');
const app = express();

app.use(session({
  secret: GITHUB_CLIENT_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


app.get('/', ensureSessionAuthenticated, (req, res) => {
  res.send(`Welcome, 'GitHub User'}!`);
});

app.use('/docs', ensureSessionAuthenticated, swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use(authRoutes);

app.use('/repos/:owner/:repo/prs', ensureAuthenticated, prRoutes);
app.use('/repos/:owner/:repo/dev', ensureAuthenticated, developerRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
