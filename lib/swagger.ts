// utils/swagger.ts
import { OpenAPIV3 } from "openapi-types";
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Next.js 14 API Documentation",
      version: "1.0.0",
      description: "API documentation for Next.js 14 project",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
    ],
  },
  apis: ["./app/api/**/*.ts"], // Adjust this path if needed
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
