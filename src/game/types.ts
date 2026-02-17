export type SceneKey = "BootScene" | "WalkScene" | "HeartGameScene" | "ResultScene";

export type RewardTier = "low" | "mid" | "high";

export interface GameState {
  score: number;
  heartsCollected: number;
  rewardTier: RewardTier;
}

export interface MessageTrigger {
  id: string;
  x: number;
  text: string;
  shown: boolean;
}

export interface HeartSpawnConfig {
  minIntervalMs: number;
  maxIntervalMs: number;
  maxOnScreen: number;
  speedX: number;
}
