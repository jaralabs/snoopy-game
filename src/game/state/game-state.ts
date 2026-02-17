import type { GameState, RewardTier } from "../types";

const REGISTRY_KEY = "gameState";

export const defaultGameState = (): GameState => ({
  score: 0,
  heartsCollected: 0,
  rewardTier: "low"
});

export const getRewardTier = (score: number): RewardTier => {
  if (score >= 42) {
    return "high";
  }
  if (score >= 24) {
    return "mid";
  }
  return "low";
};

export const writeGameState = (scene: Phaser.Scene, partial: Partial<GameState>): GameState => {
  const current = readGameState(scene);
  const merged: GameState = { ...current, ...partial };
  merged.rewardTier = getRewardTier(merged.score);
  scene.registry.set(REGISTRY_KEY, merged);
  return merged;
};

export const readGameState = (scene: Phaser.Scene): GameState => {
  const existing = scene.registry.get(REGISTRY_KEY) as GameState | undefined;
  if (existing) {
    return existing;
  }
  const initial = defaultGameState();
  scene.registry.set(REGISTRY_KEY, initial);
  return initial;
};
