import { env } from "~/env";
import { hc } from "hono/client";
import type { AppType } from "../../../api/app";

export const client = hc<AppType>(env.VITE_PUBLIC_API_URL);
