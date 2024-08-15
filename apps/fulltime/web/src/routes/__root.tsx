import { Button } from "@challenges/ui/components/button.tsx";
import { Moon, Sun } from "@challenges/ui/icons";
import { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { useTheme } from "~/hooks/use-theme";
import * as React from "react";

const TanStackRouterDevtools = false
  ? () => null // Render nothing in production
  : React.lazy(() =>
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    );

type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Root,
});

function Root() {
  const [theme, setTheme] = useTheme();
  return (
    <>
      <main className="flex h-screen flex-col">
        <div className="bg-grid absolute inset-0"></div>

        <header className="container mx-auto flex items-center justify-between px-4 py-4">
          <nav>
            <Link
              to="/"
              className="text-right hover:underline hover:underline-offset-4 focus-visible:text-muted-foreground"
              activeProps={{ className: "hidden" }}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="text-right hover:underline hover:underline-offset-4 focus-visible:text-muted-foreground"
              activeProps={{ className: "hidden" }}
            >
              Dashboard
            </Link>
          </nav>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            title={
              theme === "light"
                ? "Switch to Dark theme"
                : "Switch to Light theme"
            }
            aria-label={
              theme === "light"
                ? "Switch to Dark theme"
                : "Switch to Light theme"
            }
          >
            {theme === "light" && <Moon className="size-4" aria-hidden />}
            {theme === "dark" && <Sun className="size-4" aria-hidden />}
          </Button>
        </header>
        <div className="flex-1 px-4">
          <Outlet />
        </div>
      </main>
      <React.Suspense>
        <TanStackRouterDevtools position="bottom-left" />
      </React.Suspense>
    </>
  );
}
