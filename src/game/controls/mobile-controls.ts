interface MobileControlState {
  left: boolean;
  right: boolean;
  action: boolean;
}

interface ButtonSpec {
  key: "ui_btn_left" | "ui_btn_right" | "ui_btn_action";
  x: number;
  y: number;
  stateKey: keyof MobileControlState;
}

export class MobileControls {
  private readonly state: MobileControlState = { left: false, right: false, action: false };

  constructor(private readonly scene: Phaser.Scene) {}

  get inputState(): MobileControlState {
    return this.state;
  }

  create(): void {
    this.scene.input.addPointer(4);
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const isShortLandscape = height <= 460 && width > height;
    const edgeX = isShortLandscape ? 118 : 104;
    const bottom = isShortLandscape ? height - 108 : height - 96;
    const gap = isShortLandscape ? 118 : 110;
    const specs: ButtonSpec[] = [
      {
        key: "ui_btn_left",
        x: edgeX,
        y: bottom,
        stateKey: "left"
      },
      {
        key: "ui_btn_right",
        x: edgeX + gap,
        y: bottom,
        stateKey: "right"
      },
      {
        key: "ui_btn_action",
        x: width - edgeX,
        y: bottom,
        stateKey: "action"
      }
    ];

    specs.forEach((spec) => {
      const activePointers = new Set<number>();
      const btn = this.scene.add
        .image(spec.x, spec.y, spec.key)
        .setScrollFactor(0)
        .setDepth(120)
        .setScale(0.95)
        .setAlpha(0.9);
      btn.setInteractive({ useHandCursor: true });

      const syncState = (): void => {
        this.state[spec.stateKey] = activePointers.size > 0;
      };

      const upVisual = (): void => {
        if (activePointers.size > 0) {
          return;
        }
        btn.setScale(0.95);
        btn.setAlpha(0.9);
        btn.clearTint();
      };

      const releasePointer = (pointer: Phaser.Input.Pointer): void => {
        activePointers.delete(pointer.id);
        syncState();
        upVisual();
      };

      btn.on("pointerdown", (pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
        activePointers.add(pointer.id);
        syncState();
        btn.setScale(0.84);
        btn.setAlpha(1);
        btn.setTint(0xdbeafe);
        event.stopPropagation();
      });
      btn.on("pointerup", (pointer: Phaser.Input.Pointer) => {
        releasePointer(pointer);
      });
      btn.on("pointerupoutside", (pointer: Phaser.Input.Pointer) => {
        releasePointer(pointer);
      });
      btn.on("pointerout", (pointer: Phaser.Input.Pointer) => {
        releasePointer(pointer);
      });
    });
  }
}
