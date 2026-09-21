'use strict';

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DentUz API',
      version: '1.0.0',
      description: 'DentUz Dental Clinic Management System — REST API documentation',
      contact: { name: 'DentUz Dev Team', email: 'dev@dentuz.uz' },
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
    ],
  },
  apis: ['./routes/*.js', './controller/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
