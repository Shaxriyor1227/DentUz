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
      { url: process.env.VITE_API_URL || 'http://localhost:5000', description: 'API server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error description' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Clinics', description: 'Clinic management and onboarding' },
      { name: 'Patients', description: 'Patient management' },
      { name: 'Appointments', description: 'Calendar & scheduling' },
      { name: 'Finance', description: 'Invoices & stats' },
      { name: 'Payments', description: 'Payments and transactions' },
      { name: 'Services', description: 'Price list and services' },
      { name: 'TreatmentPlans', description: 'Treatment plans' },
      { name: 'MedicalRecords', description: 'EHR and medical records' },
      { name: 'LabOrders', description: 'Dental lab orders' },
      { name: 'Inventory', description: 'Clinic inventory' },
      { name: 'Odontogram', description: 'Dental chart' },
      { name: 'Notifications', description: 'Notifications and reminders' },
      { name: 'Team', description: 'Staff management' },
      { name: 'Users', description: 'User management' },
      { name: 'SuperAdmin', description: 'DentUz SaaS Platforma Egasi (SuperAdmin) boshqaruv paneli' },
    ],
  },
  apis: [
    path.join(__dirname, '../routes/*.js').replace(/\\/g, '/'),
  ],
};

const swaggerSpec = swaggerJsDoc(options);

const basicAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="DentUz Swagger API Docs"');
    return res.status(401).send('Avtorizatsiya talab qilinadi.');
  }

  const base64Credentials = authHeader.split(' ')[1];
  const [username, password] = Buffer.from(base64Credentials, 'base64').toString('utf8').split(':');
  const validUser = process.env.SWAGGER_USER || 'admin';
  const validPass = process.env.SWAGGER_PASS || 'dentuz2026';

  if (username === validUser && password === validPass) {
    return next();
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="DentUz Swagger API Docs"');
  return res.status(401).send('Login yoki parol noto\'g\'ri.');
};

const setupSwagger = (app) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const enableSwagger = process.env.ENABLE_SWAGGER === 'true';

  // In production, Swagger is disabled by default unless explicitly enabled via ENABLE_SWAGGER=true
  if (isProduction && !enableSwagger) {
    app.use(['/api/docs', '/api-docs'], (req, res) => {
      res.status(404).json({
        success: false,
        message: 'API hujjatlari production muhitida xavfsizlik maqsadida o\'chirilgan (ENABLE_SWAGGER=true bilan yoqish mumkin)',
      });
    });
    return;
  }

  // If in production with ENABLE_SWAGGER=true, enforce HTTP Basic Authentication
  const middlewares = [];
  if (isProduction && enableSwagger) {
    middlewares.push(basicAuthMiddleware);
  }

  app.use('/api-docs', ...middlewares, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/api/docs', ...middlewares, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = { setupSwagger, swaggerSpec, basicAuthMiddleware };
