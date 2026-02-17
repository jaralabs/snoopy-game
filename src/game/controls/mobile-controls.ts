interface MobileControlState {
  left: boolean;
  right: boolean;
  action: boolean;
}

interface ButtonSpec {
  key: "ui_btn_left" | "ui_btn_right" | "ui_btn_action";
  x: number;
  y: number;
  onDown: () => void;
  onUp: () => void;
}

export class MobileControls {
  private readonly state: MobileControlState = { left: false, right: false, action: false };

  constructor(private readonly scene: Phaser.Scene) {}

  get inputState(): MobileControlState {
    return this.state;
  }

  create(): void {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const bottom = height - 78;
    const specs: ButtonSpec[] = [
      {
        key: "ui_btn_left",
        x: 90,
        y: bottom,
        onDown: () => {
          this.state.left = true;
        },
        onUp: () => {
          this.state.left = false;
        }
      },
      {
        key: "ui_btn_right",
        x: 192,
        y: bottom,
        onDown: () => {
          this.state.right = true;
        },
        onUp: () => {
          this.state.right = false;
        }
      },
      {
        key: "ui_btn_action",
        x: width - 90,
        y: bottom,
        onDown: () => {
          this.state.action = true;
        },
        onUp: () => {
          this.state.action = false;
        }
      }
    ];

    specs.forEach((spec) => {
      const btn = this.scene.add
        .image(spec.x, spec.y, spec.key)
        .setScrollFactor(0)
        .setDepth(120)
        .setScale(0.92)
        .setAlpha(0.9);
      btn.setInteractive({ useHandCursor: true });

      const upVisual = (): void => {
        btn.setScale(0.92);
        btn.setAlpha(0.9);
        btn.clearTint();
      };

      btn.on("pointerdown", () => {
        spec.onDown();
        btn.setScale(0.84);
        btn.setAlpha(1);
        btn.setTint(0xdbeafe);
      });
      btn.on("pointerup", () => {
        spec.onUp();
        upVisual();
      });
      btn.on("pointerout", () => {
        spec.onUp();
        upVisual();
      });
      btn.on("pointerupoutside", () => {
        spec.onUp();
        upVisual();
      });
    });
  }
}
