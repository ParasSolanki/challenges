import { queryOptions } from "@tanstack/react-query";
import { client } from "~/utils/api";

export const bannerKeys = {
  all: ["banners"] as const,
  details: (id: string) => [...bannerKeys.all, "details", { id }] as const,
};

export const bannerQuries = {
  all: () => {
    return queryOptions({
      queryKey: bannerKeys.all,
      queryFn: async () => {
        const response = await client.api.banners.$get();

        if (!response.ok)
          throw new Error("Something went wrong whilie fetching banners");

        return await response.json();
      },
    });
  },
  details: (id: string) => {
    return queryOptions({
      queryKey: bannerKeys.details(id),
      queryFn: async () => {
        const response = await client.api.banners[":id"].$get({
          param: { id },
        });

        if (!response.ok)
          throw new Error("Something went wrong whilie fetching banner");

        return await response.json();
      },
    });
  },
};
