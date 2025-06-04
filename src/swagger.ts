// swagger.ts
import config from 'config';

// Server
const BASE_URL = config.get<string>('server.baseUrl');

import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'GitHub PR Analytics API',
    version: '1.0.0',
    description: 'API to get GitHub Pull Request analytics',
  },
  servers: [
    {
      url: BASE_URL,
      description: 'Local server',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'], // Path to your route files
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
