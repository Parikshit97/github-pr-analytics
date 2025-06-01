// swagger.ts
import dotenv from 'dotenv';
dotenv.config(); // Load .env before using process.env

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
      url: process.env.BASE_URL ||  'http://localhost:3000',
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
