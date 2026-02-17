import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./constants";
import { BootScene } from "./scenes/boot-scene";
import { HeartGameScene } from "./scenes/heart-game-scene";
import { ResultScene } from "./scenes/result-scene";
import { WalkScene } from "./scenes/walk-scene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: "game-host",
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  backgroundColor: "#020617",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 860 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, WalkScene, HeartGameScene, ResultScene]
};
