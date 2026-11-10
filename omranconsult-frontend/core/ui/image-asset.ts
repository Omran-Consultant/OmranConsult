/** A resolved image (alt already in the active locale). */
export type ImageAsset = {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly srcSet?: string;
};
