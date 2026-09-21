const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DentUz API with Swagger',
      version: '1.0.0',
      description: 'DentUz Dental Clinic Management System — REST API documentation',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Patients', description: 'Patient management' },
      { name: 'Appointments', description: 'Calendar & scheduling' },
      { name: 'Finance', description: 'Invoices & stats' },
      { name: 'Odontogram', description: 'Dental chart' },
      { name: 'Team', description: 'Staff management' },
      { name: 'Users', description: 'User management' },
    ],
  },
  apis: [
    './routes/*.js',
    path.join(__dirname, '../routes/*.js').replace(/\\/g, '/'),
  ],
};

const swaggerSpec = swaggerJsDoc(options);

const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = { setupSwagger, swaggerSpec };
