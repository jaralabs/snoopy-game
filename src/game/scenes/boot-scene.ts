import type { AnimationKey } from "../assets/asset-keys";
import { IMAGE_ASSET_PATHS } from "../assets/asset-keys";
import { defaultGameState, writeGameState } from "../state/game-state";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload(): void {
    const base = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
    Object.entries(IMAGE_ASSET_PATHS).forEach(([key, path]) => {
      this.load.image(key, path);
    });
    this.load.image("snoopy_sprite_sheet", `${base}assets/snoopy-sprite-sheet.png`);
  }

  create(): void {
    this.createGeneratedTextures();
    this.createAnimations();
    this.registry.set("gameState", defaultGameState());
    writeGameState(this, { score: 0, heartsCollected: 0 });
    this.showIntroAndStart();
  }

  private createGeneratedTextures(): void {
    const heart = this.make.graphics({ x: 0, y: 0 });
    heart.fillStyle(0xff6b9a, 1);
    heart.fillCircle(8, 7, 6);
    heart.fillCircle(16, 7, 6);
    heart.fillTriangle(2, 10, 14, 23, 22, 10);
    heart.generateTexture("ui_heart", 24, 24);
    heart.destroy();

    const makeButton = (key: "ui_btn_left" | "ui_btn_right" | "ui_btn_action", color: number): void => {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x0b1220, 0.82);
      g.fillCircle(46, 46, 42);
      g.fillStyle(0x1e293b, 0.95);
      g.fillCircle(46, 46, 36);
      g.lineStyle(4, color, 1);
      g.strokeCircle(46, 46, 40);
      g.lineStyle(2, 0xffffff, 0.12);
      g.strokeCircle(46, 46, 31);
      g.fillStyle(color, 1);
      if (key === "ui_btn_left") {
        g.fillTriangle(34, 46, 54, 34, 54, 58);
      } else if (key === "ui_btn_right") {
        g.fillTriangle(58, 46, 38, 34, 38, 58);
      } else {
        g.fillTriangle(46, 30, 60, 50, 32, 50);
        g.fillRect(42, 50, 8, 14);
      }
      g.generateTexture(key, 92, 92);
      g.destroy();
    };

    makeButton("ui_btn_left", 0x60a5fa);
    makeButton("ui_btn_right", 0x60a5fa);
    makeButton("ui_btn_action", 0xf59e0b);

    this.createSnoopyTexturesFromGrid();
  }

  private createAnimations(): void {
    const ensureAnim = (key: AnimationKey, frames: string[], frameRate = 8): void => {
      if (this.anims.exists(key)) {
        return;
      }
      this.anims.create({
        key,
        frames: frames.map((frameKey) => ({ key: frameKey })),
        frameRate,
        repeat: -1
      });
    };

    ensureAnim("snoopy_idle", ["snoopy_idle_1", "snoopy_idle_2"], 4);
    ensureAnim("snoopy_walk", ["snoopy_walk_1", "snoopy_walk_2", "snoopy_walk_3"], 5);
    ensureAnim("snoopy_run", ["snoopy_run_1", "snoopy_run_2", "snoopy_run_3", "snoopy_run_4", "snoopy_run_5"], 12);
    ensureAnim("snoopy_jump", ["snoopy_jump_1", "snoopy_jump_2"], 3);
    ensureAnim("snoopy_celebrate", ["snoopy_celebrate_1", "snoopy_celebrate_2"], 5);
  }

  private showIntroAndStart(): void {
    const bg = this.add.image(this.scale.width / 2, this.scale.height / 2, "walk_camp_main");
    bg.setScale(this.scale.width / bg.width, this.scale.height / bg.height);

    const overlay = this.add
      .rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, 0.45)
      .setAlpha(0);
    const panel = this.add
      .rectangle(this.scale.width / 2, this.scale.height / 2 - 10, 700, 170, 0x020617, 0.78)
      .setStrokeStyle(2, 0x94a3b8, 0.95)
      .setAlpha(0);
    const intro = this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 20, "Valentina\nSnoopy quería animarte el día.", {
        color: "#f8fafc",
        fontFamily: "Arial",
        fontSize: "36px",
        align: "center"
      })
      .setOrigin(0.5)
      .setAlpha(0);
    intro.setStroke("#020617", 6);

    const introHearts = this.createIntroHearts(this.scale.width / 2, this.scale.height / 2 + 8);

    this.tweens.add({
      targets: [overlay, panel, intro, ...introHearts],
      alpha: 1,
      duration: 650,
      ease: "Sine.easeOut"
    });

    this.time.delayedCall(3600, () => {
      this.tweens.add({
        targets: [panel, intro, overlay, ...introHearts],
        alpha: 0,
        duration: 700,
        ease: "Sine.easeIn"
      });
      this.cameras.main.fadeOut(650, 0, 0, 0);
      this.time.delayedCall(700, () => {
        this.scene.start("WalkScene");
      });
    });
  }

  private createSnoopyTexturesFromGrid(): void {
    const source = this.textures.get("snoopy_sprite_sheet").getSourceImage() as CanvasImageSource;
    const cell = (key: string, col: number, rowY: number, dx = -3, dy = -6, dw = 128, dh = 130) => ({
      key,
      x: 52 + col * 145 + dx,
      y: rowY + dy,
      w: dw,
      h: dh
    });
    const defs = [
      cell("snoopy_idle_1", 0, 42),
      cell("snoopy_idle_2", 1, 42, -4, -6, 132, 130),
      cell("snoopy_walk_1", 2, 42),
      cell("snoopy_walk_2", 3, 42),
      cell("snoopy_walk_3", 4, 42),
      cell("snoopy_walk_4", 5, 42),
      cell("snoopy_walk_5", 6, 42),
      cell("snoopy_run_1", 0, 188),
      cell("snoopy_run_2", 1, 188),
      cell("snoopy_run_3", 2, 188),
      cell("snoopy_run_4", 3, 188),
      cell("snoopy_run_5", 4, 188),
      cell("snoopy_jump_1", 0, 334, -4, -18, 132, 142),
      cell("snoopy_jump_2", 1, 334, -4, -18, 132, 142),
      cell("snoopy_celebrate_1", 4, 548, -2, -2, 124, 124),
      cell("snoopy_celebrate_2", 5, 548, -2, -2, 124, 124)
    ];

    defs.forEach((frame) => {
      const texture = this.textures.createCanvas(frame.key, 64, 64);
      if (!texture) {
        return;
      }
      const ctx = texture.context;
      const rawCanvas = document.createElement("canvas");
      rawCanvas.width = 64;
      rawCanvas.height = 64;
      const rawCtx = rawCanvas.getContext("2d");
      if (!rawCtx) {
        return;
      }

      rawCtx.clearRect(0, 0, 64, 64);
      rawCtx.imageSmoothingEnabled = false;
      rawCtx.drawImage(source, frame.x, frame.y, frame.w, frame.h, 0, 0, 64, 64);

      const img = rawCtx.getImageData(0, 0, 64, 64);
      const p = img.data;
      this.clearMagentaBackground(p);
      rawCtx.putImageData(img, 0, 0);

      let minY = 64;
      let maxY = -1;
      for (let y = 0; y < 64; y += 1) {
        for (let x = 0; x < 64; x += 1) {
          const i = (y * 64 + x) * 4;
          const a = p[i + 3];
          if (a < 20) {
            continue;
          }
          if (y < minY) {
            minY = y;
          }
          if (y > maxY) {
            maxY = y;
          }
        }
      }

      const footY = maxY >= minY ? maxY : 56;
      const targetFootY = 57;
      const offsetX = 0;
      const offsetY = Math.max(0, Math.round(targetFootY - footY));

      ctx.clearRect(0, 0, 64, 64);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(rawCanvas, offsetX, offsetY);
      texture.refresh();
    });
  }

  private createIntroHearts(centerX: number, centerY: number): Phaser.GameObjects.Image[] {
    const hearts: Phaser.GameObjects.Image[] = [];
    const positions = [
      { x: -250, y: -74 },
      { x: -190, y: -118 },
      { x: -118, y: -90 },
      { x: 128, y: -92 },
      { x: 200, y: -126 },
      { x: 260, y: -72 }
    ];

    positions.forEach((p, i) => {
      const heart = this.add.image(centerX + p.x, centerY + p.y, "ui_heart");
      heart.setScale(Phaser.Math.FloatBetween(1.1, 1.6));
      heart.setAlpha(0);
      this.tweens.add({
        targets: heart,
        y: heart.y - Phaser.Math.Between(10, 22),
        x: heart.x + Phaser.Math.Between(-5, 5),
        duration: Phaser.Math.Between(850, 1300),
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
        delay: i * 95
      });
      hearts.push(heart);
    });

    return hearts;
  }

  private clearMagentaBackground(pixels: Uint8ClampedArray): void {
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      if (a < 20) {
        continue;
      }
      if (r >= 230 && g <= 35 && b >= 230) {
        pixels[i + 3] = 0;
      }
    }
  }
}
