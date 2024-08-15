import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import nProgress from "nprogress";
import { env } from "./env";
import { useTheme } from "./hooks/use-theme";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient();

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
});

router.subscribe("onBeforeLoad", () => {
  nProgress.start();
});

router.subscribe("onResolved", () => {
  nProgress.done();
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

console.log(env.VITE_PUBLIC_KEY);

export function App() {
  useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
      <ReactQueryDevtools position="right" />
      
    </QueryClientProvider>
  );
}

function AppRoutes() {
  return <RouterProvider router={router} context={{ queryClient }} />;
}
