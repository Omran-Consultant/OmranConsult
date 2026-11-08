import { Container } from "@/core/ui/container";
import { Skeleton } from "@/core/ui/skeleton";

/** Placeholder for a route that awaits data and has no section skeleton. */
export function RouteLoading() {
  return (
    <main aria-busy="true" className="flex flex-1 flex-col">
      <Container className="flex flex-col gap-6 py-24">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-14 w-full max-w-2xl" />
        <Skeleton className="h-6 w-full max-w-lg" />
        <Skeleton className="mt-6 h-64 w-full" />
      </Container>
    </main>
  );
}
