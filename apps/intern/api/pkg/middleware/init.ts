import { createMiddleware } from "hono/factory";
import { ConsoleLogger } from "../logger";
import { env } from "../../../env";

export function init() {
  return createMiddleware(async (c, next) => {
    const requestId = crypto.randomUUID();

    c.set("requestId", requestId);
    c.header("X-Request-Id", requestId);

    const logger = new ConsoleLogger({
      environment: env.ENVIRONMENT,
      requestId,
    });

    c.set("logger", logger);

    const start = performance.now();
    const pathname = new URL(c.req.url).pathname;
    const message = `${c.req.method} ${pathname}`;

    logger.info(message);

    await next();

    const status = (c.res.status / 100) | 0;
    const executionDuration = performance.now() - start;

    if (status >= 4) {
      logger.error(message, { executionDuration });
    } else {
      logger.info(message, { executionDuration });
    }
  });
}

type InitVariables = {
  requestId: string;
  logger: ConsoleLogger;
};

declare module "hono" {
  interface ContextVariableMap extends InitVariables {}
}
