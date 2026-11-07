import { PROFILE_IMAGES, type ProfileImage } from "@/features/media/profile-images";

const STAGE_IMAGES = [
  PROFILE_IMAGES.facade,
  PROFILE_IMAGES.plant,
  PROFILE_IMAGES.team,
  PROFILE_IMAGES.kafd,
  PROFILE_IMAGES.engineerSkyline,
  PROFILE_IMAGES.blueprint,
  PROFILE_IMAGES.cad,
  PROFILE_IMAGES.riyadhDay,
] as const satisfies readonly ProfileImage[];

export function mapWorkStageImages(index: number): ProfileImage {
  return STAGE_IMAGES[index % STAGE_IMAGES.length];
}
