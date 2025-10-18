import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import config from './config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wishzy API Documentation',
      version: '1.0.0',
      description: 'API documentation for Wishzy - Online Learning Platform',
      contact: {
        name: 'Wishzy Team',
        email: 'support@wishzy.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
      {
        url: 'https://api.wishzy.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token in cookie',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            msg: {
              type: 'string',
              description: 'Error message',
            },
            statusCode: {
              type: 'integer',
              description: 'HTTP status code',
            },
          },
        },
        Course: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Course ID',
            },
            courseName: {
              type: 'string',
              description: 'Course name',
            },
            price: {
              type: 'number',
              description: 'Course price',
            },
            thumbnail: {
              type: 'string',
              description: 'Course thumbnail URL',
            },
            description: {
              type: 'string',
              description: 'Course description',
            },
            status: {
              type: 'boolean',
              description: 'Course status (active/inactive)',
            },
            level: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced'],
              description: 'Course difficulty level',
            },
            numberOfStudents: {
              type: 'integer',
              description: 'Number of enrolled students',
            },
            totalDuration: {
              type: 'number',
              description: 'Total course duration in hours',
            },
            rating: {
              type: 'number',
              description: 'Average course rating',
            },
            sale: {
              type: 'number',
              description: 'Sale discount percentage',
            },
            slug: {
              type: 'string',
              description: 'Course URL slug',
            },
            requirements: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Course requirements',
            },
            subject: {
              type: 'object',
              description: 'Subject information',
            },
            createdBy: {
              type: 'object',
              description: 'Instructor information',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'integer',
              description: 'Current page number',
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages',
            },
            pageSizes: {
              type: 'integer',
              description: 'Items per page',
            },
            totalItems: {
              type: 'integer',
              description: 'Total number of items',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
      {
        cookieAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Application) => {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Wishzy API Documentation',
  }));

  // JSON endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`📚 Swagger documentation available at http://localhost:${config.port}/api-docs`);
};
