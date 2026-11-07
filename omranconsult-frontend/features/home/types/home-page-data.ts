import type { getHomePageData } from "@/features/home/services/get-home-page-data";

export type HomePageData = Awaited<ReturnType<typeof getHomePageData>>;
