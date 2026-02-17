export type AssetKey =
  | "walk_camp_entrance"
  | "walk_camp_main"
  | "walk_camp_cabins"
  | "walk_camp_lake"
  | "walk_camp_cabin_interior_1"
  | "heart_schroeder_5"
  | "ui_heart"
  | "ui_btn_left"
  | "ui_btn_right"
  | "ui_btn_action";

export type AnimationKey =
  | "snoopy_idle"
  | "snoopy_walk"
  | "snoopy_run"
  | "snoopy_jump"
  | "snoopy_celebrate";

const BASE_URL = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const withBase = (path: string): string => `${BASE_URL}${path.replace(/^\/+/, "")}`;

export const IMAGE_ASSET_PATHS: Record<Exclude<AssetKey, "ui_heart" | "ui_btn_left" | "ui_btn_right" | "ui_btn_action">, string> = {
  walk_camp_entrance: withBase("assets/background-camp-entrance.png"),
  walk_camp_main: withBase("assets/background-camp.png"),
  walk_camp_cabins: withBase("assets/background-camp-cabins.png"),
  walk_camp_lake: withBase("assets/background-camp-lake.png"),
  walk_camp_cabin_interior_1: withBase("assets/background-camp-cabin-interior-1.png"),
  heart_schroeder_5: withBase("assets/background-schroeder-stage-5.png")
};
