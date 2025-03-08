// Player class has been replaced by Phaser implementation in GameScene.createPlayer
// This file is kept for reference but is no longer used

class Player {
  constructor() {
    this.x = CANVAS_WIDTH / 2;
    this.y = PLAYABLE_HEIGHT - 40;
    this.width = 30;
    this.height = 20;
    this.speed = 5;
  }

  show() {
    fill(0, 255, 255); // Cyan
    rect(this.x, this.y, this.width, this.height);
  }

  move() {
    if (keyIsDown(LEFT_ARROW) && this.x > 0) {
      this.x -= this.speed;
    }
    if (keyIsDown(RIGHT_ARROW) && this.x < CANVAS_WIDTH - this.width) {
      this.x += this.speed;
    }
  }
} 