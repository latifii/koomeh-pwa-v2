import type { StaticImageData } from "next/image";

import femaleAvatar from "@/assets/images/avatar/avatar-female.webp";
import maleAvatar from "@/assets/images/avatar/avatar-male.webp";

export type Gender = "male" | "female";

/** Default agent portraits, used until real photos come from the API. */
export const defaultAvatars: Record<Gender, StaticImageData> = {
  male: maleAvatar,
  female: femaleAvatar,
};
