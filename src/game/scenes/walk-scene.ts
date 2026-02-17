import { PLAYER_JUMP_SPEED, PLAYER_SPEED } from "../constants";
import { MobileControls } from "../controls/mobile-controls";
import { readGameState, writeGameState } from "../state/game-state";
import type { MessageTrigger } from "../types";

const WALK_BACKGROUNDS = [
  "walk_camp_entrance",
  "walk_camp_cabins",
  "walk_camp_lake",
  "walk_camp_lake"
] as const;

export class WalkScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private walkHearts!: Phaser.Physics.Arcade.Group;
  private walkHeartsText!: Phaser.GameObjects.Text;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly messages: MessageTrigger[] = [
    { id: "m1", x: 340, text: "Snoopy confirma: hablar contigo siempre suma puntos.", shown: false },
    { id: "m2", x: 1160, text: "Advertencia: esta conversacion mejora el humor.", shown: false },
    { id: "m3", x: 2060, text: "Si hoy estuvo pesado, Snoopy activa modo chill.", shown: false },
    { id: "m4", x: 2860, text: "Snoopy aprueba este momento.", shown: false }
  ];
  private messageText!: Phaser.GameObjects.Text;
  private messageHideEvent?: Phaser.Time.TimerEvent;
  private mobileControls!: MobileControls;
  private transitioning = false;
  private worldWidth = 0;
  private zoneWidth = 900;
  private startX = 100;

  constructor() {
    super("WalkScene");
  }

  create(data?: { startX?: number }): void {
    this.transitioning = false;
    this.startX = data?.startX ?? 100;
    this.messages.forEach((message) => {
      message.shown = false;
    });

    const zoneWidth = this.zoneWidth;
    const worldWidth = zoneWidth * WALK_BACKGROUNDS.length;
    this.worldWidth = worldWidth;
    const groundY = this.scale.height - 70;

    this.physics.world.setBounds(0, 0, worldWidth, this.scale.height);
    this.cameras.main.setBounds(0, 0, worldWidth, this.scale.height);

    WALK_BACKGROUNDS.forEach((key, index) => {
      const x = index * zoneWidth + zoneWidth / 2;
      const bg = this.add.image(x, this.scale.height / 2, key);
      bg.setScale(zoneWidth / bg.width, this.scale.height / bg.height);
      bg.setDepth(-20);
    });

    const ground = this.add.rectangle(worldWidth / 2, groundY + 22, worldWidth, 44, 0x334155, 0.01);
    this.physics.add.existing(ground, true);

    this.player = this.physics.add.sprite(this.startX, groundY - 40, "snoopy_idle_1");
    this.player.setCollideWorldBounds(true);
    this.player.setScale(1.5);
    this.player.play("snoopy_idle");
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setSize(18, 30, true);

    this.physics.add.collider(this.player, ground as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody);

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    const state = readGameState(this);
    let runningScore = state.score;
    let runningHearts = state.heartsCollected;
    this.walkHeartsText = this.add
      .text(this.scale.width - 36, 34, `Corazones: ${runningHearts}`, {
        color: "#f8fafc",
        fontFamily: "Arial",
        fontSize: "28px",
        fontStyle: "bold"
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(101);
    this.walkHeartsText.setStroke("#020617", 5);

    this.walkHearts = this.physics.add.group({
      allowGravity: false
    });
    this.createWalkHearts(groundY);
    this.physics.add.overlap(this.player, this.walkHearts, (_player, heart) => {
      heart.destroy();
      runningScore += 1;
      runningHearts += 1;
      const next = writeGameState(this, {
        score: runningScore,
        heartsCollected: runningHearts
      });
      this.walkHeartsText.setText(`Corazones: ${next.heartsCollected}`);
      runningScore = next.score;
      runningHearts = next.heartsCollected;
    });

    this.cursors = this.input.keyboard?.createCursorKeys() ?? ({} as Phaser.Types.Input.Keyboard.CursorKeys);
    this.mobileControls = new MobileControls(this);
    this.mobileControls.create();

    const finishZone = this.add.zone(worldWidth - 120, groundY - 70, 260, 220);
    this.physics.add.existing(finishZone, true);
    this.physics.add.overlap(
      this.player,
      finishZone as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody,
      () => {
        if (this.transitioning) {
          return;
        }
        this.startHeartSceneTransition();
      },
      undefined,
      this
    );

    this.messageText = this.add
      .text(0, 44, "", {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: "28px",
        fontStyle: "bold",
        backgroundColor: "rgba(15,23,42,0.82)",
        padding: { left: 22, right: 22, top: 12, bottom: 12 }
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(false);
    this.messageText.setStroke("#020617", 5);
    this.messageText.setPosition(this.scale.width / 2, 88);
  }

  update(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const mobile = this.mobileControls.inputState;
    const moveLeft = Boolean(this.cursors.left?.isDown) || mobile.left;
    const moveRight = Boolean(this.cursors.right?.isDown) || mobile.right;
    const jumpPressed =
      (this.cursors.up ? Phaser.Input.Keyboard.JustDown(this.cursors.up) : false) || mobile.action;

    if (moveLeft) {
      this.player.setVelocityX(-PLAYER_SPEED);
      this.player.setFlipX(true);
      if (body.blocked.down) {
        this.player.anims.stop();
        this.player.setTexture("snoopy_walk_1");
      }
    } else if (moveRight) {
      this.player.setVelocityX(PLAYER_SPEED);
      this.player.setFlipX(false);
      if (body.blocked.down) {
        this.player.anims.stop();
        this.player.setTexture("snoopy_walk_1");
      }
    } else {
      this.player.setVelocityX(0);
      if (body.blocked.down) {
        this.player.play("snoopy_idle", true);
      }
    }

    if (jumpPressed && body.blocked.down) {
      this.player.setVelocityY(-PLAYER_JUMP_SPEED);
      this.player.play("snoopy_jump", true);
    }

    this.messages.forEach((trigger) => {
      if (!trigger.shown && this.player.x >= trigger.x) {
        trigger.shown = true;
        this.showMessage(trigger.text);
      }
    });

    if (!this.transitioning && this.player.x >= this.worldWidth - 180) {
      this.startHeartSceneTransition();
    }
  }

  private showMessage(text: string): void {
    this.messageText.setText(text);
    this.messageText.setVisible(true);
    if (this.messageHideEvent) {
      this.messageHideEvent.destroy();
    }
    this.messageHideEvent = this.time.delayedCall(2200, () => {
      this.messageText.setVisible(false);
    });
  }

  private startHeartSceneTransition(): void {
    this.transitioning = true;
    this.player.setVelocityX(0);
    this.player.setVelocityY(0);
    this.cameras.main.fadeOut(420, 0, 0, 0);
    this.time.delayedCall(460, () => {
      this.scene.start("HeartGameScene", { startX: 130 });
    });
  }

  private createWalkHearts(groundY: number): void {
    const heartXs = [520, 820, 1140, 1480, 1760, 2080, 2380, 2650, 2930, 3210];
    heartXs.forEach((x, idx) => {
      const heart = this.walkHearts.create(x, groundY - Phaser.Math.Between(42, 120), "ui_heart") as Phaser.Physics.Arcade.Image;
      heart.setScale(1.2);
      heart.setDepth(7);
      this.tweens.add({
        targets: heart,
        y: heart.y - Phaser.Math.Between(12, 22),
        duration: Phaser.Math.Between(900, 1300),
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
        delay: idx * 75
      });
    });
  }

}
