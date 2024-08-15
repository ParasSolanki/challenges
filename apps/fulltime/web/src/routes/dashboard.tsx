import { cn } from "@challenges/ui/cn";
import { Button } from "@challenges/ui/components/button.tsx";
import { Checkbox } from "@challenges/ui/components/checkbox.tsx";
import { Input } from "@challenges/ui/components/input.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@challenges/ui/components/popover.tsx";
import { ScrollArea } from "@challenges/ui/components/scroll-area.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@challenges/ui/components/select.tsx";
import { Textarea } from "@challenges/ui/components/textarea.tsx";
import { Calendar as CalendarIcon, Loader2 } from "@challenges/ui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { bannerKeys, bannerQuries } from "~/common/keys";
import { ErrorComponent } from "~/components/error-component";
import { Calendar } from "~/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { client } from "~/utils/api";
import { format } from "date-fns";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  bannerBodySchema,
  getBannersResponseSchema,
} from "../../../api/schema/banner";

const banners = getBannersResponseSchema.shape.data.pick({
  banners: true,
}).shape.banners;

type Banner = z.output<typeof banners>[number];

export const Route = createFileRoute("/dashboard")({
  wrapInSuspense: true,
  component: DashboardPage,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(
      bannerQuries.details("01J56C8NAS5XKBD0V85KGMNA74"),
    );
  },
  pendingComponent: () => {
    return "loading...";
  },
  errorComponent: () => {
    return <ErrorComponent message="Something went wrong" />;
  },
});

function DashboardPage() {
  const { data } = useSuspenseQuery(
    bannerQuries.details("01J56C8NAS5XKBD0V85KGMNA74"),
  );
  const banner = data.data.banner ?? undefined;
  return (
    <section className="space-y-6">
      <h1 className="text-5xl font-bold tracking-tight">Banner</h1>

      {banner && <BannerForm banner={banner} />}
    </section>
  );
}

function BannerForm({ banner }: { banner: Banner }) {
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = React.useState(false);
  const [expirationDateTime, setExpirationDateTime] = React.useState(
    new Date(banner.expiresAt),
  );
  const [expirationTime, setExpirationTime] = React.useState(() => {
    const date = new Date(banner.expiresAt);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
  });
  const form = useForm({
    resolver: zodResolver(bannerBodySchema),
    values: {
      name: banner.name,
      description: banner.description ?? "",
      expiresAt: new Date(banner.expiresAt),
      isActive: banner.isActive,
    },
  });

  const { isPending, mutate } = useMutation({
    mutationKey: ["banners", "edit", { id: banner.id }],
    mutationFn: async (values: z.output<typeof bannerBodySchema>) => {
      const response = await client.api.banners[":id"].$post({
        param: { id: banner.id },
        json: {
          ...values,
          expiresAt: values.expiresAt.getTime(),
          description: values.description ?? null,
        },
      });

      if (!response.ok) throw new Error("Something went wrong");

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.all });
      toast.success("Banner updated successfully");
    },
    onError: async () => {
      toast.error("Something went wrong while updating banner");
    },
  });

  return (
    <Form {...form}>
      <form
        className="max-w-3xl"
        onSubmit={form.handleSubmit((values) => mutate(values))}
      >
        <fieldset
          className="space-y-4"
          aria-disabled={isPending}
          disabled={isPending}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiresAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expiration</FormLabel>
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          `${format(field.value, "PPP")}, ${expirationTime}`
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="flex w-auto items-start p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      selected={expirationDateTime || field.value}
                      onSelect={(selectedDate) => {
                        const [hours, minutes] = expirationTime?.split(":")!;
                        selectedDate?.setHours(
                          parseInt(hours),
                          parseInt(minutes),
                        );
                        setExpirationDateTime(selectedDate!);
                        field.onChange(selectedDate);
                      }}
                      onDayClick={() => setIsOpen(false)}
                      fromYear={2000}
                      toYear={new Date().getFullYear()}
                      disabled={(date) =>
                        Number(date) < Date.now() - 1000 * 60 * 60 * 24 ||
                        Number(date) > Date.now() + 1000 * 60 * 60 * 24 * 30
                      }
                    />
                    <Select
                      defaultValue={expirationTime!}
                      onValueChange={(e) => {
                        setExpirationTime(e);
                        if (expirationDateTime) {
                          const [hours, minutes] = e.split(":");
                          const newDate = new Date(
                            expirationDateTime.getTime(),
                          );
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          setExpirationDateTime(newDate);
                          field.onChange(newDate);
                        }
                      }}
                      open={true}
                    >
                      <SelectTrigger className="my-4 mr-2 w-[120px] font-normal focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="fixed left-0 top-2 mr-2 border-none shadow-none">
                        <ScrollArea className="h-[15rem]">
                          {Array.from({ length: 96 }).map((_, i) => {
                            const hour = Math.floor(i / 4)
                              .toString()
                              .padStart(2, "0");
                            const minute = ((i % 4) * 15)
                              .toString()
                              .padStart(2, "0");
                            return (
                              <SelectItem key={i} value={`${hour}:${minute}`}>
                                {hour}:{minute}
                              </SelectItem>
                            );
                          })}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </PopoverContent>
                </Popover>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Active</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" aria-disabled={isPending} disabled={isPending}>
            {isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            )}
            Save
          </Button>
        </fieldset>
      </form>
    </Form>
  );
}
