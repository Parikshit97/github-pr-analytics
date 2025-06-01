import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './swagger.js';

import prRoutes from './routes/prRoutes.js';
import developerRoutes from './routes/developerRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/repos/:owner/:repo/prs', prRoutes);
app.use('/repos/:owner/:repo/dev', developerRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
