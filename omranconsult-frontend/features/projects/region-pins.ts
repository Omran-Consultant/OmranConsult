export type RegionPin = {
  readonly x: number;
  readonly y: number;
};

export const REGION_PINS: Record<string, RegionPin> = {
  riyadh: { x: 0.556, y: 0.469 },
  "eastern-province": { x: 0.727, y: 0.516 },
  makkah: { x: 0.285, y: 0.595 },
  madinah: { x: 0.18, y: 0.357 },
  "al-qassim": { x: 0.468, y: 0.275 },
  tabuk: { x: 0.106, y: 0.198 },
  "northern-region": { x: 0.261, y: 0.055 },
  "al-baha": { x: 0.289, y: 0.689 },
  asir: { x: 0.334, y: 0.778 },
  jazan: { x: 0.331, y: 0.872 },
  najran: { x: 0.47, y: 0.883 },
};
