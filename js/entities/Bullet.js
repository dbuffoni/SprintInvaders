// Import constants
import { BULLET_WIDTH, BULLET_HEIGHT, BULLET_COLOR, BULLET_SPEED } from '../constants.js';

class Bullet {
  constructor(scene, x, y) {
    this.scene = scene;
    
    // Create bullet texture if it doesn't exist
    if (!scene.textures.exists('bullet')) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(BULLET_COLOR, 1);
      graphics.fillRect(0, 0, BULLET_WIDTH, BULLET_HEIGHT);
      graphics.generateTexture('bullet', BULLET_WIDTH, BULLET_HEIGHT);
      graphics.destroy();
    }
    
    // Create the bullet sprite
    this.sprite = scene.bullets.create(x, y, 'bullet');
    this.sprite.setOrigin(0, 0);
    this.sprite.setVelocityY(-BULLET_SPEED);
  }
  
  destroy() {
    this.sprite.destroy();
  }
  
  static createBulletGroup(scene) {
    return scene.physics.add.group();
  }
}

export default Bullet; 