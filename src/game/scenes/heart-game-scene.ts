import { PLAYER_JUMP_SPEED, PLAYER_SPEED } from "../constants";
import { MobileControls } from "../controls/mobile-controls";
import { readGameState, writeGameState } from "../state/game-state";

const HEART_BACKGROUND = "walk_camp_lake" as const;

export class HeartGameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private hearts!: Phaser.Physics.Arcade.Group;
  private score = 0;
  private heartsGoal = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private goalText!: Phaser.GameObjects.Text;
  private spawnEvent?: Phaser.Time.TimerEvent;
  private ended = false;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private mobileControls!: MobileControls;
  private startX = 130;

  constructor() {
    super("HeartGameScene");
  }

  create(data?: { startX?: number }): void {
    const current = readGameState(this);
    this.score = current.heartsCollected;
    this.heartsGoal = this.score + 36;
    this.ended = false;
    this.startX = data?.startX ?? 130;

    this.addHeartGameBackground();

    const groundY = this.scale.height - 76;
    const ground = this.add.rectangle(this.scale.width / 2, groundY + 16, this.scale.width, 40, 0x1f2937, 0.02);
    this.physics.add.existing(ground, true);

    this.player = this.physics.add.sprite(this.startX, groundY - 40, "snoopy_idle_1");
    this.player.setScale(1.5);
    this.player.setCollideWorldBounds(true);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setSize(18, 30, true);
    this.player.setVelocity(0, 0);
    this.player.play("snoopy_idle");
    this.player.setPosition(this.startX, groundY - 42);
    this.physics.add.collider(this.player, ground as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody);

    this.hearts = this.physics.add.group({
      allowGravity: false,
      maxSize: 14
    });

    this.physics.add.overlap(this.player, this.hearts, (_a, b) => {
      b.destroy();
      this.score += 1;
      this.scoreText.setText(`Corazones: ${this.score}`);
      const left = Math.max(0, this.heartsGoal - this.score);
      this.goalText.setText(`Meta: ${this.heartsGoal}  |  Faltan: ${left}`);
      if (this.score >= this.heartsGoal) {
        this.endMiniGame();
      }
    });

    this.scoreText = this.add
      .text(34, 34, `Corazones: ${this.score}`, {
        color: "#f8fafc",
        fontFamily: "Arial",
        fontSize: "24px",
        fontStyle: "bold"
      })
      .setScrollFactor(0);
    this.scoreText.setStroke("#0f172a", 4);

    this.goalText = this.add
      .text(this.scale.width - 34, 34, `Meta: ${this.heartsGoal}  |  Faltan: ${Math.max(0, this.heartsGoal - this.score)}`, {
        color: "#f8fafc",
        fontFamily: "Arial",
        fontSize: "24px",
        fontStyle: "bold"
      })
      .setOrigin(1, 0)
      .setScrollFactor(0);
    this.goalText.setStroke("#0f172a", 4);

    this.cursors = this.input.keyboard?.createCursorKeys() ?? ({} as Phaser.Types.Input.Keyboard.CursorKeys);
    this.mobileControls = new MobileControls(this);
    this.mobileControls.create();

    this.spawnEvent = this.time.addEvent({
      delay: 850,
      loop: true,
      callback: () => this.spawnHeart()
    });
  }

  update(_time: number, _delta: number): void {
    if (this.ended) {
      return;
    }
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const moveLeft = Boolean(this.cursors.left?.isDown) || this.mobileControls.inputState.left;
    const moveRight = Boolean(this.cursors.right?.isDown) || this.mobileControls.inputState.right;
    const jumpPressed =
      (this.cursors.up ? Phaser.Input.Keyboard.JustDown(this.cursors.up) : false) ||
      (this.cursors.space ? Phaser.Input.Keyboard.JustDown(this.cursors.space) : false) ||
      this.mobileControls.inputState.action;

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
      this.player.setVelocityY(-PLAYER_JUMP_SPEED - 110);
      this.player.play("snoopy_jump", true);
    }

  }

  private spawnHeart(): void {
    if (this.hearts.countActive(true) >= 12) {
      return;
    }

    const x = this.scale.width + Phaser.Math.Between(20, 120);
    const y = Phaser.Math.Between(this.scale.height - 210, this.scale.height - 120);
    const heart = this.hearts.create(x, y, "ui_heart") as Phaser.Physics.Arcade.Image;
    heart.setVelocityX(-Phaser.Math.Between(90, 145));
    heart.setVelocityY(Phaser.Math.Between(-10, 10));
    heart.setScale(1.4);
    heart.setDepth(6);

    this.time.delayedCall(7000, () => {
      if (heart.active) {
        heart.destroy();
      }
    });
  }

  private endMiniGame(): void {
    if (this.ended) {
      return;
    }
    this.ended = true;
    if (this.spawnEvent) {
      this.spawnEvent.remove();
      this.spawnEvent = undefined;
    }
    writeGameState(this, {
      score: this.score,
      heartsCollected: this.score
    });
    this.scene.start("ResultScene");
  }

  private addHeartGameBackground(): void {
    const bg = this.add.image(this.scale.width / 2, this.scale.height / 2, HEART_BACKGROUND);
    bg.setDepth(-2);
    bg.setScale(this.scale.width / bg.width, this.scale.height / bg.height);
  }
}
