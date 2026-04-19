import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Artist Portfolio API",
            version: "1.0.0",
            description: "API for managing artist portfolio",
        },
        servers: [
            {
                url: "http://localhost:3001",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "user_session",
                },
            },
        },
    },
    apis: ["./app/api/**/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;