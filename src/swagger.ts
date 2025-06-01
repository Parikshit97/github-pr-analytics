// swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GitHub PR Analytics API',
      version: '1.0.0',
      description: 'API to get GitHub Pull Request analytics',
    },
    servers: [
      { url: 'http://localhost:3000' }
    ],
    paths: {
      '/repos/{owner}/{repo}/prs/open': {
        get: {
          summary: 'Get open PRs',
          parameters: [
            { name: 'owner', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'repo', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'List of open PRs',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        author: { type: 'string', nullable: true },
                        created_at: { type: 'string', format: 'date-time' },
                        status: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/repos/{owner}/{repo}/prs/timing': {
        get: {
          summary: 'Get PR timing metrics',
          parameters: [
            { name: 'owner', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'repo', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'PR timing metrics',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      open_durations_ms: { type: 'array', items: { type: 'number' } },
                      average_closed_duration_ms: { type: 'number' },
                      longest_open_pr: {
                        type: 'object',
                        nullable: true,
                        properties: {
                          title: { type: 'string' },
                          author: { type: 'string', nullable: true },
                          created_at: { type: 'string', format: 'date-time' },
                          duration_open_ms: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      // Add your other routes here similarly...
    }
  },
  apis: [] // you can add path to your files with swagger annotations if you want
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
