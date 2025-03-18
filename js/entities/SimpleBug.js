// Import required constants
import { 
  SIMPLE_BUG_SIZE,
  SIMPLE_BUG_COLOR,
  SIMPLE_BUG_MIN_SPEED,
  SIMPLE_BUG_MAX_SPEED,
  SIMPLE_BUG_EXPLOSION_RADIUS,
  SIMPLE_BUG_EXPLOSION_DURATION,
  SIMPLE_BUG_EXPLOSION_PARTICLES,
  PLAYABLE_HEIGHT,
  GAME_STATES,
  SCENES
} from '../constants.js';

class SimpleBug {
  constructor(scene, x, y) {
    this.scene = scene;
    
    // Create texture if it doesn't exist
    const textureName = 'simple_bug';
    if (!scene.textures.exists(textureName)) {
      // Create the simple bug sprite as a triangle pointing down
      const graphics = scene.add.graphics();
      
      // Draw triangle pointing down
      graphics.fillStyle(SIMPLE_BUG_COLOR, 1);
      graphics.beginPath();
      graphics.moveTo(0, 0);  // Top-left
      graphics.lineTo(SIMPLE_BUG_SIZE * 2, 0);  // Top-right
      graphics.lineTo(SIMPLE_BUG_SIZE, SIMPLE_BUG_SIZE * 2);  // Bottom-center
      graphics.closePath();
      graphics.fillPath();
      
      // Generate the texture
      graphics.generateTexture(textureName, SIMPLE_BUG_SIZE * 2, SIMPLE_BUG_SIZE * 2);
      graphics.destroy();
    }
    
    // Create the sprite with the appropriate texture
    this.sprite = scene.physics.add.sprite(x, y, textureName);
    this.sprite.setOrigin(0.5, 0.5);
    
    // Enable physics for the sprite
    scene.physics.world.enable(this.sprite);
    
    // Configure the physics body
    this.sprite.body.setCollideWorldBounds(false);
    this.sprite.body.setBounce(0);
    this.sprite.body.setAllowGravity(false);
    
    // Generate random speed within defined range
    this.speed = Phaser.Math.Between(SIMPLE_BUG_MIN_SPEED, SIMPLE_BUG_MAX_SPEED);
    
    // Set vertical velocity for falling straight down
    this.sprite.body.setVelocity(0, this.speed);
    
    // Store reference to this instance on the sprite for collision detection
    this.sprite.simpleBugInstance = this;
    
    // Create a subtle pulsing effect
    scene.tweens.add({
      targets: this.sprite,
      alpha: 0.7,
      duration: 200,
      yoyo: true,
      repeat: -1
    });
  }
  
  update() {
    // If sprite is still active
    if (this.sprite && this.sprite.active) {
      // Ensure it's always moving downward at its designated speed
      this.sprite.body.setVelocity(0, this.speed);
      
      // If it has fallen below the screen, destroy it
      if (this.sprite.y > this.scene.cameras.main.height) {
        this.destroy();
      }
    }
  }
  
  explode() {
    // Create particles for explosion effect
    const particles = this.scene.add.particles(SIMPLE_BUG_COLOR);
    
    const emitter = particles.createEmitter({
      speed: { min: 30, max: 80 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.4, end: 0 },
      lifespan: SIMPLE_BUG_EXPLOSION_DURATION,
      blendMode: 'ADD',
      frequency: 0,
      quantity: SIMPLE_BUG_EXPLOSION_PARTICLES
    });
    
    // Emit particles at the bug's position
    emitter.explode(SIMPLE_BUG_EXPLOSION_PARTICLES, this.sprite.x, this.sprite.y);
    
    // Create visual indication of explosion
    const explosionCircle = this.scene.add.circle(
      this.sprite.x, 
      this.sprite.y,
      SIMPLE_BUG_EXPLOSION_RADIUS,
      SIMPLE_BUG_COLOR,
      0.3
    );
    
    // Animate the circle to expand and fade
    this.scene.tweens.add({
      targets: explosionCircle,
      alpha: 0,
      scale: 1.5,
      duration: SIMPLE_BUG_EXPLOSION_DURATION,
      onComplete: () => {
        explosionCircle.destroy();
        
        // Destroy particles after their lifespan
        this.scene.time.delayedCall(SIMPLE_BUG_EXPLOSION_DURATION, () => {
          particles.destroy();
        });
      }
    });
    
    // Deduct one coffee cup from the player
    if (this.scene.coffeeCups > 0) {
      this.scene.coffeeCups--;
      this.scene.updateCoffeeCupsDisplay();
      
      // Check for game over
      if (this.scene.coffeeCups <= 0) {
        this.scene.gameState = GAME_STATES.OVER;
        this.scene.scene.launch(SCENES.GAME_OVER, { score: this.scene.score });
        this.scene.scene.pause();
      }
    }
    
    // Destroy the bug
    this.destroy();
  }
  
  destroy() {
    if (this.sprite && this.sprite.active) {
      this.sprite.destroy();
    }
  }
  
  static createBugGroup(scene) {
    return scene.physics.add.group();
  }
}

export default SimpleBug; 