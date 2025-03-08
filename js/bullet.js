// Bullet class has been replaced by Phaser implementation in GameScene.createBullet
// This file is kept for reference but is no longer used

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = -7;
  }

  show() {
    fill(255, 255, 0); // Yellow
    rect(this.x, this.y, 5, 10);
  }

  move() {
    this.y += this.speed;
  }

  offscreen() {
    return this.y < 0;
  }

  hits(block) {
    return (
      this.x > block.x &&
      this.x < block.x + block.w &&
      this.y > block.y &&
      this.y < block.y + block.h
    );
  }
} 