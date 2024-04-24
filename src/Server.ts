import fastify, { FastifyInstance } from "fastify";
import type { FastifyCookieOptions } from "@fastify/cookie";
import { envs, logger, swaggerConfig, swaggerUIConfig } from "@configs";
import { customErrorHandler } from "@handlers";
import { apiRoute } from "./routes/api";

export function createServer(config: ServerConfig): FastifyInstance {
  const app = fastify({
    logger: envs.isTest ? undefined : logger,
    disableRequestLogging: !envs.isDev,
  });

  app.register(import("@fastify/sensible"));
  app.register(import("@fastify/helmet"));
  app.register(import("@fastify/cors"), {
    origin: envs.CORS_WHITE_LIST,
    credentials: true,
  });

  app.register(import("@fastify/cookie"), {
    secret: envs.COOKIE_SECRET, // for cookies signature
    hook: "onRequest",
  } as FastifyCookieOptions);

  app.register(import("@fastify/multipart"));

  // Swagger on production will be turned off in the future
  if (
    envs.NODE_ENV === "development" ||
    envs.NODE_ENV === "staging" ||
    envs.NODE_ENV === "production"
  ) {
    app.register(import("@fastify/swagger"), swaggerConfig);
    app.register(import("@fastify/swagger-ui"), swaggerUIConfig);
  }

  app.setErrorHandler(customErrorHandler);

  app.register(apiRoute, { prefix: "/api" });

  const start = async () => {
    await app.listen({
      host: config.host,
      port: config.port,
    });
    await app.ready();
    if (envs.NODE_ENV !== "test") {
      app.swagger({ yaml: true });
      logger.info(
        `Swagger documentation is on http://${config.host}:${config.port}/docs`
      );
    }
    process.on("SIGINT", () => {
      app.log.info("Exited program");
      process.exit(0);
    });
  };

  const shutdown = () => app.close();

  return {
    ...app,
    start,
    shutdown,
  };
}
