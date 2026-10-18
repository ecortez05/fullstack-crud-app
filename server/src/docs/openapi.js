// OpenAPI spec served at /api/docs

const postBody = {
  type: "object",
  required: ["title", "body"],
  properties: {
    title: { type: "string", maxLength: 120 },
    body: { type: "string", maxLength: 5000 },
    tags: { type: "array", items: { type: "string" }, maxItems: 10 },
  },
};

const secured = [{ bearerAuth: [] }];
const idParam = { name: "id", in: "path", required: true, schema: { type: "string" } };
const err = (description) => ({
  description,
  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
});

module.exports = {
  openapi: "3.0.3",
  info: {
    title: "CRUD App API",
    version: "1.0.0",
    description: "Users register, log in, and manage their own posts. Send the token as `Authorization: Bearer <token>`.",
  },
  servers: [{ url: "/api" }],
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
    schemas: {
      Error: { type: "object", properties: { message: { type: "string" } } },
      Post: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          body: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          author: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AuthResult: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: {
            type: "object",
            properties: { id: { type: "string" }, name: { type: "string" }, email: { type: "string" } },
          },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Create an account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResult" } } } },
          400: err("Validation failed"),
          409: err("Email already in use"),
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: { email: { type: "string" }, password: { type: "string" } },
              },
            },
          },
        },
        responses: {
          200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResult" } } } },
          401: err("Wrong email or password"),
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Current user",
        security: secured,
        responses: { 200: { description: "OK" }, 401: err("Not logged in") },
      },
    },
    "/posts": {
      get: {
        tags: ["Posts"],
        summary: "List your posts",
        security: secured,
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "tag", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "A page of posts" }, 401: err("Not logged in") },
      },
      post: {
        tags: ["Posts"],
        summary: "Create a post",
        security: secured,
        requestBody: { required: true, content: { "application/json": { schema: postBody } } },
        responses: {
          201: { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Post" } } } },
          400: err("Validation failed"),
          401: err("Not logged in"),
        },
      },
    },
    "/posts/{id}": {
      get: {
        tags: ["Posts"],
        summary: "Get one post",
        security: secured,
        parameters: [idParam],
        responses: { 200: { description: "OK" }, 404: err("Not found") },
      },
      put: {
        tags: ["Posts"],
        summary: "Update a post",
        security: secured,
        parameters: [idParam],
        requestBody: { required: true, content: { "application/json": { schema: postBody } } },
        responses: { 200: { description: "Updated" }, 400: err("Validation failed"), 404: err("Not found") },
      },
      delete: {
        tags: ["Posts"],
        summary: "Delete a post",
        security: secured,
        parameters: [idParam],
        responses: { 204: { description: "Deleted" }, 404: err("Not found") },
      },
    },
  },
};
