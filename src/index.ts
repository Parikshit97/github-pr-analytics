import express from 'express';
import dotenv from 'dotenv';
import prRoutes from './routes/prRoutes.js';
import developerRoutes from './routes/developerRoutes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

import session from 'express-session';
import passport from 'passport';
import './config/passport.js';

dotenv.config();

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const port = process.env.PORT || 3000;

app.use('/repos/:owner/:repo/prs', prRoutes);
app.use('/repos/:owner/:repo/dev', developerRoutes);

// Swagger docs
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
