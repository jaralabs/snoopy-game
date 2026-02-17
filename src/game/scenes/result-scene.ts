import { readGameState, writeGameState } from "../state/game-state";

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  create(): void {
    const bg = this.add.image(this.scale.width / 2, this.scale.height / 2, "walk_camp_cabin_interior_1");
    bg.setScale(this.scale.width / bg.width, this.scale.height / bg.height);

    const state = readGameState(this);
    const unlockedRewards = this.getUnlockedRewards(state.heartsCollected);
    const displayHeight = this.scale.displaySize.height;
    const compact = displayHeight <= 430;
    const rewardMessage =
      state.rewardTier === "high"
        ? "Nivel top desbloqueado."
      : state.rewardTier === "mid"
          ? "Nivel medio desbloqueado."
          : "Nivel base desbloqueado.";

    const panelW = compact ? 760 : 700;
    const panelH = compact ? 332 : 420;
    const panelX = this.scale.width / 2;
    const panelY = this.scale.height / 2;
    const panelBottom = panelY + panelH / 2;

    const panel = this.add.rectangle(panelX, panelY, panelW, panelH, 0x020617, 0.82);
    panel.setStrokeStyle(3, 0x93c5fd, 0.95);

    const buttonsY = panelBottom - (compact ? 30 : 40);
    const cardsGap = compact ? 28 : 36;
    const cardsStartY = buttonsY - cardsGap * unlockedRewards.length - (compact ? 16 : 18);
    const instructionY = cardsStartY - (compact ? 28 : 40);
    const rewardY = instructionY - (compact ? 24 : 34);
    const scoreY = rewardY - (compact ? 34 : 44);
    const titleY = scoreY - (compact ? 40 : 58);

    this.add
      .text(panelX, titleY, "Canje de premios", {
        color: "#f8fafc",
        fontFamily: "Arial",
        fontSize: compact ? "26px" : "32px",
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setStroke("#0f172a", 5);

    if (!compact) {
      this.createFloatingHearts(panelX, titleY - 34);
    }

    this.add
      .text(panelX, scoreY, `Corazones atrapados: ${state.heartsCollected}`, {
        color: "#f8fafc",
        fontFamily: "Arial",
        fontSize: compact ? "30px" : "38px",
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setStroke("#0f172a", 6);

    this.add
      .text(panelX, rewardY, rewardMessage, {
        color: "#fde68a",
        fontFamily: "Arial",
        fontSize: compact ? "18px" : "22px",
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setStroke("#1f2937", 5);

    this.add
      .text(panelX, instructionY, "Escoge 1 premio desbloqueado con tus corazones:", {
        color: "#bfdbfe",
        fontFamily: "Arial",
        fontSize: compact ? "15px" : "18px",
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setStroke("#0f172a", 4);

    let selectedReward = unlockedRewards[0];

    const cards: Array<{ bg: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text; label: string }> = [];
    unlockedRewards.forEach((label, index) => {
      const y = cardsStartY + index * cardsGap;
      const bg = this.add
        .rectangle(panelX, y, compact ? 640 : 600, compact ? 24 : 30, 0x1e293b, 0.88)
        .setStrokeStyle(2, 0x334155, 1)
        .setInteractive({ useHandCursor: true });
      const text = this.add
        .text(panelX, y, label, {
          color: "#e2e8f0",
          fontFamily: "Arial",
          fontSize: compact ? "13px" : "15px"
        })
        .setOrigin(0.5);
      cards.push({ bg, text, label });
    });

    const paintCards = (): void => {
      cards.forEach((card) => {
        const selected = card.label === selectedReward;
        card.bg.setFillStyle(selected ? 0x1d4ed8 : 0x1e293b, selected ? 0.95 : 0.88);
        card.bg.setStrokeStyle(2, selected ? 0xfde68a : 0x334155, 1);
        card.text.setColor(selected ? "#fef08a" : "#e2e8f0");
      });
    };

    cards.forEach((card) => {
      card.bg.on("pointerdown", () => {
        selectedReward = card.label;
        paintCards();
      });
    });
    paintCards();

    const replay = this.makeButton(panelX - (compact ? 108 : 120), buttonsY, "Repetir", compact);
    replay.on("pointerdown", () => {
      this.scene.start("WalkScene", { startX: 100 });
    });

    const exit = this.makeButton(panelX + (compact ? 108 : 120), buttonsY, "Salir", compact);
    exit.on("pointerdown", () => {
      writeGameState(this, { score: 0, heartsCollected: 0 });
      this.scene.start("WalkScene", { startX: 100 });
    });
  }

  private getUnlockedRewards(hearts: number): string[] {
    const catalog = [
      { min: 0, label: "1 cumplido premium escrito solo para ti" },
      { min: 14, label: "Mírate al espejo y sonríe" },
      { min: 24, label: "Pregúntame algo que siempre hayas querido saber" },
      { min: 34, label: "Algo que quieras hacer, yo te ayudo" },
      { min: 46, label: "Tú eliges plan y yo me apunto" },
      { min: 60, label: "Detalle sorpresa" }
    ];
    const unlocked = catalog.filter((item) => hearts >= item.min).map((item) => item.label);
    return unlocked.slice(-3);
  }

  private makeButton(x: number, y: number, label: string, compact: boolean): Phaser.GameObjects.Container {
    const w = compact ? 170 : 190;
    const h = compact ? 50 : 58;
    const bg = this.add.rectangle(0, 0, w, h, 0x1e293b, 0.95).setStrokeStyle(2, 0x93c5fd, 1);
    const text = this.add
      .text(0, 0, label, {
        color: "#e2e8f0",
        fontFamily: "Arial",
        fontSize: compact ? "22px" : "26px"
      })
      .setOrigin(0.5);

    const container = this.add.container(x, y, [bg, text]).setSize(w, h);
    container.setInteractive({ useHandCursor: true });
    container.on("pointerover", () => {
      bg.setFillStyle(0x334155, 0.98);
      bg.setStrokeStyle(2, 0xfde68a, 1);
    });
    container.on("pointerout", () => {
      bg.setFillStyle(0x1e293b, 0.95);
      bg.setStrokeStyle(2, 0x93c5fd, 1);
    });
    return container;
  }

  private createFloatingHearts(centerX: number, centerY: number): void {
    const total = 9;
    for (let i = 0; i < total; i += 1) {
      const spreadX = Phaser.Math.Between(-130, 130);
      const startX = centerX + spreadX;
      const startY = centerY + Phaser.Math.Between(-16, 18);
      const heart = this.add.image(startX, startY, "ui_heart");
      heart.setScale(Phaser.Math.FloatBetween(1.15, 1.7));
      heart.setAlpha(Phaser.Math.FloatBetween(0.7, 1));
      heart.setAngle(Phaser.Math.Between(-16, 16));

      this.tweens.add({
        targets: heart,
        y: startY - Phaser.Math.Between(16, 36),
        x: startX + Phaser.Math.Between(-8, 8),
        alpha: Phaser.Math.FloatBetween(0.45, 1),
        duration: Phaser.Math.Between(900, 1400),
        yoyo: true,
        repeat: -1,
        delay: i * 80,
        ease: "Sine.easeInOut"
      });
    }
  }
}
