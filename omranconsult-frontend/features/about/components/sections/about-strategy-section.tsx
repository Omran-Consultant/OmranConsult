import { HomeStrategySection } from "@/features/home/components/sections/home-strategy-section";

type AboutStrategySectionProps = {
  readonly strategyBlock: unknown;
  readonly sectionHeading?: string;
};

export function AboutStrategySection({ sectionHeading, strategyBlock }: AboutStrategySectionProps) {
  return <HomeStrategySection sectionHeading={sectionHeading} strategyBlock={strategyBlock} />;
}
