import { createRoute, z } from "@hono/zod-openapi";
import { createApp } from "../pkg/create-app";
import {
  badRequestErrorResponse,
  forbiddenErrorResponse,
  internalServerErrorResponse,
  tooManyRequestsErrorResponse,
  requestTimeoutErrorResponse,
  notFoundErrorResponse,
} from "../pkg/errors/response.js";
import { internalServerError, notFoundError } from "../pkg/errors/http";
import { desc, eq, schema } from "../pkg/db";
import {
  bannerPayloadSchema,
  getBannersResponseSchema,
  bannerResponseSchema,
} from "../schema/banner.js";

const getBannersRoute = createRoute({
  path: "/",
  method: "get",
  tags: ["Banners"],
  responses: {
    200: {
      description: "Banner response",
      content: {
        "application/json": {
          schema: getBannersResponseSchema,
        },
      },
    },
    ...badRequestErrorResponse,
    ...forbiddenErrorResponse,
    ...requestTimeoutErrorResponse,
    ...tooManyRequestsErrorResponse,
    ...internalServerErrorResponse,
  },
});

const createBannerRoute = createRoute({
  path: "/",
  method: "post",
  tags: ["Banners"],
  request: {
    body: {
      description: "Create banner request payload",
      content: {
        "application/json": {
          schema: bannerPayloadSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Banner response",
      content: {
        "application/json": {
          schema: bannerResponseSchema,
        },
      },
    },
    ...badRequestErrorResponse,
    ...forbiddenErrorResponse,
    ...requestTimeoutErrorResponse,
    ...tooManyRequestsErrorResponse,
    ...internalServerErrorResponse,
  },
});

const getBannerRoute = createRoute({
  path: "/{id}",
  method: "get",
  tags: ["Banners"],
  request: {
    params: z.object({
      id: z
        .string({ required_error: "Banner id is required" })
        .ulid({ message: "Banner id should be valid UlId" }),
    }),
  },
  responses: {
    200: {
      description: "Get banner response",
      content: {
        "application/json": {
          schema: bannerResponseSchema,
        },
      },
    },
    ...badRequestErrorResponse,
    ...forbiddenErrorResponse,
    ...requestTimeoutErrorResponse,
    ...notFoundErrorResponse,
    ...tooManyRequestsErrorResponse,
    ...internalServerErrorResponse,
  },
});

const updateBannerRoute = createRoute({
  path: "/{id}",
  method: "post",
  tags: ["Banners"],
  request: {
    params: z.object({
      id: z
        .string({ required_error: "Banner id is required" })
        .ulid({ message: "Banner id should be valid UlId" }),
    }),
    body: {
      description: "Update banner request payload",
      content: {
        "application/json": {
          schema: bannerPayloadSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Updated banner response",
      content: {
        "application/json": {
          schema: bannerResponseSchema,
        },
      },
    },
    ...badRequestErrorResponse,
    ...forbiddenErrorResponse,
    ...requestTimeoutErrorResponse,
    ...notFoundErrorResponse,
    ...tooManyRequestsErrorResponse,
    ...internalServerErrorResponse,
  },
});

export const route = createApp()
  .openapi(getBannersRoute, async (c) => {
    const db = c.get("db");
    const logger = c.get("logger");

    try {
      const banners = await db
        .select()
        .from(schema.fullTimeBannerTable)
        .where(eq(schema.fullTimeBannerTable.isActive, true))
        .orderBy(desc(schema.fullTimeBannerTable.createdAt))
        .limit(1);

      return c.json(
        {
          ok: true,
          code: "OK" as const,
          data: {
            banners,
          },
        },
        200
      );
    } catch (e) {
      console.error(e);
      logger.error("Something went wrong while creating banner", {
        error: e,
      });
      return internalServerError(c);
    }
  })
  .openapi(getBannerRoute, async (c) => {
    const bannerId = c.req.valid("param").id;
    const db = c.get("db");
    const logger = c.get("logger");

    try {
      const [banner] = await db
        .select()
        .from(schema.fullTimeBannerTable)
        .where(eq(schema.fullTimeBannerTable.id, bannerId))
        .limit(1);

      return c.json(
        {
          ok: true,
          code: "OK" as const,
          data: {
            banner,
          },
        },
        200
      );
    } catch (e) {
      console.error(e);
      logger.error("Something went wrong while fetching banner", {
        error: e,
      });
      return internalServerError(c);
    }
  })
  .openapi(createBannerRoute, async (c) => {
    const payload = c.req.valid("json");

    const db = c.get("db");
    const logger = c.get("logger");

    try {
      const banner = await db.transaction(async (tx) => {
        const result = await tx
          .insert(schema.fullTimeBannerTable)
          .values({
            name: payload.name,
            description: payload.description,
            isActive: payload.isActive,
            expiresAt: payload.expiresAt.getTime() / 1000,
          })
          .$returningId();
        const bannerId = result[0].id;

        const [banner] = await tx
          .select()
          .from(schema.fullTimeBannerTable)
          .where(eq(schema.fullTimeBannerTable.id, bannerId));

        return banner;
      });

      return c.json(
        {
          ok: true,
          code: "OK" as const,
          data: {
            banner,
          },
        },
        201
      );
    } catch (e) {
      console.error(e);
      logger.error("Something went wrong while creating banner", {
        error: e,
      });
      return internalServerError(c);
    }
  })
  .openapi(updateBannerRoute, async (c) => {
    const bannerId = c.req.valid("param").id;
    const payload = c.req.valid("json");
    const db = c.get("db");
    const logger = c.get("logger");

    try {
      const [banner] = await db
        .select({
          id: schema.fullTimeBannerTable.id,
        })
        .from(schema.fullTimeBannerTable)
        .where(eq(schema.fullTimeBannerTable.id, bannerId));

      if (!banner) {
        return notFoundError(c, "Banner does not exists");
      }
    } catch (e) {
      console.error(e);
      logger.error("Something went wrong while creating banner", {
        error: e,
      });
      return internalServerError(c);
    }

    try {
      const banner = await db.transaction(async (tx) => {
        await tx
          .update(schema.fullTimeBannerTable)
          .set({
            name: payload.name,
            description: payload.description,
            isActive: payload.isActive,
            expiresAt: payload.expiresAt.getTime(),
          })
          .where(eq(schema.fullTimeBannerTable.id, bannerId));

        const [banner] = await tx
          .select()
          .from(schema.fullTimeBannerTable)
          .where(eq(schema.fullTimeBannerTable.id, bannerId));

        return banner;
      });

      return c.json(
        {
          ok: true,
          code: "OK" as const,
          data: {
            banner,
          },
        },
        200
      );
    } catch (e) {
      console.error(e);
      logger.error("Something went wrong while creating banner", {
        error: e,
      });
      return internalServerError(c);
    }
  });
