// Import constants
import { CANVAS_WIDTH } from '../constants.js';

class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    
    // Create the player sprite
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setSize(30, 20);
    this.sprite.setDisplaySize(30, 20);
    this.sprite.setOrigin(0, 0);
    this.sprite.setImmovable(true);
    
    // Create player texture if it doesn't exist
    if (!scene.textures.exists('player')) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(0x00FFFF, 1); // Cyan
      graphics.fillRect(0, 0, 30, 20);
      graphics.generateTexture('player', 30, 20);
      graphics.destroy();
    }
  }
  
  get x() {
    return this.sprite.x;
  }
  
  set x(value) {
    this.sprite.x = value;
  }
  
  get y() {
    return this.sprite.y;
  }
  
  get width() {
    return this.sprite.width;
  }
  
  get height() {
    return this.sprite.height;
  }
  
  update(keys, canShoot = true) {
    // Handle player movement
    if (keys.left.isDown && this.sprite.x > 0) {
      this.sprite.x -= 5;
    }
    if (keys.right.isDown && this.sprite.x < CANVAS_WIDTH - this.sprite.width) {
      this.sprite.x += 5;
    }
    
    // The canShoot parameter is used by the GameScene to control whether
    // the player can shoot during certain game states like meetings
  }
}

export default Player; 