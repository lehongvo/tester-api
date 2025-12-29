import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend (allow all local network IPs)
  app.enableCors({
    origin: true, // Allow all origins for local development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe());
  
  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Student Management API')
    .setDescription(`
# Student Management System API Documentation

## Authentication

This API uses JWT (JSON Web Token) for authentication.

### How to use:

1. **Login** - Call \`POST /auth/login\` with username and password
2. **Get Access Token** - Response will include \`access_token\` field
3. **Use Token** - Include token in Authorization header for protected endpoints:
   \`\`\`
   Authorization: Bearer {access_token}
   \`\`\`
4. **Token Expiry** - Token expires after 24 hours, you need to login again

### Example:
\`\`\`
POST /auth/login
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin"
  }
}
\`\`\`

### Using the token:
\`\`\`
GET /students
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

## Default Credentials
- Username: \`admin\`
- Password: \`admin123\`
    `)
    .setVersion('1.0')
    .setContact('API Support', '', 'support@example.com')
    .addTag('auth', '🔐 Authentication - Login and Logout endpoints')
    .addTag('students', '👥 Students - CRUD operations for student management')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: `
**JWT Access Token Authentication**

1. Login using \`POST /auth/login\` to get your access token
2. Copy the \`access_token\` from the response
3. Click the "Authorize" button above (🔒 icon)
4. Paste your token in the "Value" field
5. Click "Authorize" then "Close"
6. Now all protected endpoints will use this token automatically

**Token Format:**
\`\`\`
Bearer {your_access_token_here}
\`\`\`

**Example:**
\`\`\`
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoxLCJpYXQiOjE3NjcwMjU0ODcsImV4cCI6MTc2NzExMTg4N30.Y7-HnXpqHdZ4ek0B90q4Lab4SOxJCTigem0FJa7lPKY
\`\`\`

**Note:** Token expires after 24 hours. You need to login again to get a new token.
        `,
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api`);
}
bootstrap();

