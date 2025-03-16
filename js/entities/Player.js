// Import constants
import { CANVAS_WIDTH, SCENES, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_COLOR } from '../constants.js';

class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    
    // Create the player sprite
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setSize(PLAYER_WIDTH, PLAYER_HEIGHT);
    this.sprite.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
    this.sprite.setOrigin(0, 0);
    this.sprite.setImmovable(true);
    
    // Create player texture if it doesn't exist
    if (!scene.textures.exists('player')) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(PLAYER_COLOR, 1);
      graphics.fillRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
      graphics.generateTexture('player', PLAYER_WIDTH, PLAYER_HEIGHT);
      graphics.destroy();
    }
    
    // Set invulnerability flag and timer
    this.isInvulnerable = false;
    this.invulnerabilityTimer = null;
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
  
  // Method for taking damage from bugs
  takeDamage() {
    // If player is already invulnerable, do nothing
    if (this.isInvulnerable) {
      return;
    }
    
    // Reduce coffee cups in the game scene
    if (this.scene.coffeeCups > 0) {
      this.scene.coffeeCups--;
      this.scene.updateCoffeeCupsDisplay();
      
      // Make player briefly invulnerable and flash to show invulnerability
      this.isInvulnerable = true;
      
      // Flash effect
      const flashTween = this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0.3,
        duration: 100,
        ease: 'Linear',
        yoyo: true,
        repeat: 5,
        onComplete: () => {
          this.sprite.alpha = 1;
        }
      });
      
      // Set invulnerability timer
      this.invulnerabilityTimer = this.scene.time.delayedCall(1500, () => {
        this.isInvulnerable = false;
      });
      
      // If it was the last coffee cup, end the game
      if (this.scene.coffeeCups <= 0) {
        this.scene.scene.start(SCENES.GAME_OVER, { score: this.scene.score });
      }
    }
  }
}

export default Player; 