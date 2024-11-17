const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '五子棋游戏 API',
      version: '1.0.0',
      description: '五子棋游戏的后端 API 文档'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '开发服务器'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs; 