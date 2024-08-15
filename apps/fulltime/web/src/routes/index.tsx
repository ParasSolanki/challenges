import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { bannerQuries } from "~/common/keys";
import { ErrorComponent } from "~/components/error-component";
import * as React from "react";

export const Route = createFileRoute("/")({
  wrapInSuspense: true,
  component: HomePage,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(bannerQuries.all());
  },
  pendingComponent: () => {
    return "loading...";
  },
  errorComponent: () => {
    return <ErrorComponent message="Something went wrong" />;
  },
});

function HomePage() {
  const { data } = useSuspenseQuery(bannerQuries.all());

  const banner = data.data.banners[0] ?? undefined;

  return (
    <section className="mx-auto flex h-full max-w-5xl flex-col justify-center px-4">
      {banner && (
        <div className="flex flex-1 flex-col justify-center space-y-6">
          <h1 className="text-balance text-center text-5xl font-bold tracking-tight">
            {banner.name}
          </h1>
          <p className="text-balance text-center text-muted-foreground">
            {banner.description}
          </p>

          <Countdown time={banner.expiresAt} />
        </div>
      )}
    </section>
  );
}

const HOUR_IN_DAY = 24;
const SECONDS_IN_DAY = 24 * 60 * 60;
const SECONDS_IN_HOUR = 60 * 60;

function Countdown({ time }: { time: number }) {
  const [now, setNow] = React.useState(new Date().getTime());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date().getTime());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const hasOver = time - now <= 0;

  let diff = Math.abs(time - now) / 1000;

  const days = Math.floor(diff / SECONDS_IN_DAY);
  diff -= days * SECONDS_IN_DAY;

  const hours = Math.floor(diff / SECONDS_IN_HOUR) % HOUR_IN_DAY;
  diff -= hours * SECONDS_IN_HOUR;

  const minutes = Math.floor(diff / 60) % 60;
  diff -= minutes * 60;

  const seconds = Math.floor(diff % 60);

  return (
    <>
      {hasOver && (
        <p className="text-center text-xl text-primary">Countdown over</p>
      )}
      {!hasOver && (
        <div className="flex">
          {days > 0 && (
            <div className="flex-1 text-center">
              <h3 className="text-3xl font-bold lg:text-5xl">{days}</h3>
              <p className="text-muted-foreground">Days</p>
            </div>
          )}
          <div className="flex-1 text-center">
            <h3 className="text-3xl font-bold lg:text-5xl">{hours}</h3>
            <p className="text-muted-foreground">Hours</p>
          </div>
          <div className="flex-1 text-center">
            <h3 className="text-3xl font-bold lg:text-5xl">{minutes}</h3>
            <p className="text-muted-foreground">Minutes</p>
          </div>
          <div className="flex-1 text-center">
            <h3 className="text-3xl font-bold lg:text-5xl">{seconds}</h3>
            <p className="text-muted-foreground">Seconds</p>
          </div>
        </div>
      )}
    </>
  );
}
