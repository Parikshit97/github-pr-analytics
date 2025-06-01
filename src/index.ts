import express from 'express';
import dotenv from 'dotenv';
import prRoutes from './routes/prRoutes.js';
import developerRoutes from './routes/developerRoutes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use('/repos/:owner/:repo/prs', prRoutes);
app.use('/repos/:owner/:repo/dev', developerRoutes);

// Swagger docs
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
