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

export const IMAGE_ASSET_PATHS: Record<Exclude<AssetKey, "ui_heart" | "ui_btn_left" | "ui_btn_right" | "ui_btn_action">, string> = {
  walk_camp_entrance: "/assets/background-camp-entrance.png",
  walk_camp_main: "/assets/background-camp.png",
  walk_camp_cabins: "/assets/background-camp-cabins.png",
  walk_camp_lake: "/assets/background-camp-lake.png",
  walk_camp_cabin_interior_1: "/assets/background-camp-cabin-interior-1.png",
  heart_schroeder_5: "/assets/background-schroeder-stage-5.png"
};
