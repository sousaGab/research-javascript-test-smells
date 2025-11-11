import Fastify from "fastify";
// Controllers
import analyzeController from "../controllers/analyze.controller.js";

const analyzeRoutes = async (fastify = Fastify()) => {
  fastify.get(
    "/",
    {
      schema: {
        description: "get api detect smell types",
        tags: ["analyze"],
      },
    },
    analyzeController.fetch
  );
  fastify.post(
    "/",
    {
      schema: {
        description: "post repository url",
        tags: ["analyze"],
        body: {
          type: "object",
          properties: {
            repository: {
              type: "string",
              description: "URL of the repository",
            },
            hasTestSmell: {
              type: "boolean",
              description: "Boolean indicating the presence of a smell",
            },
          },
        },
        required: ["repository"],
      },
    },
    analyzeController.store
  );
  fastify.post(
    "/export-csv",
    {
      schema: {
        description: "post repository url and get csv as result",
        tags: ["analyze"],
        body: {
          type: "object",
          properties: {
            repository: {
              type: "string",
              description: "URL of the repository",
            },
          },
        },
        required: ["repository"],
      },
    },
    analyzeController.getCSV
  );
  fastify.post(
    "/count",
    {
      schema: {
        description: "post repository url and get the number of test files",
        tags: ["analyze"],
        body: {
          type: "object",
          properties: {
            repository: {
              type: "string",
              description: "URL of the repository",
            },
          },
        },
        required: ["repository"],
      },
    },
    analyzeController.countTestFiles
  );
  fastify.post(
    "/export-csv-local",
    {
      schema: {
        description: "get local files and get csv as result",
        tags: ["analyze"],
        body: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "directory of the project",
            },
          },
        },
        required: ["directory"],
      },
    },
    analyzeController.getCSVLocal
  );
};

export default analyzeRoutes;
