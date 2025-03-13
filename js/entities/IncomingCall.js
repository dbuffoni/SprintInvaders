// Import required constants
import { 
  INCOMING_CALL_FALL_SPEED,
  INCOMING_CALL_SIZE,
  INCOMING_CALL_COLOR,
  INCOMING_CALL_EXPLOSION_RADIUS,
  INCOMING_CALL_EXPLOSION_DURATION,
  INCOMING_CALL_EXPLOSION_PARTICLES,
  PLAYABLE_HEIGHT
} from '../constants.js';
import { getCharacter } from '../characters.js';

class IncomingCall {
  constructor(scene, x, y) {
    this.scene = scene;
    
    // Calculate explosion radius
    this.explosionRadius = INCOMING_CALL_EXPLOSION_RADIUS;
    
    // Create the incoming call sprite using a simple bomb shape
    const graphics = scene.add.graphics();
    
    // Draw bomb shape (circle with short fuse)
    graphics.fillStyle(INCOMING_CALL_COLOR, 1);
    graphics.fillCircle(INCOMING_CALL_SIZE, INCOMING_CALL_SIZE, INCOMING_CALL_SIZE);
    
    // Add a fuse to make it look like a bomb
    graphics.lineStyle(2, 0xFFFFFF, 1);
    graphics.beginPath();
    graphics.moveTo(INCOMING_CALL_SIZE, 0);
    graphics.lineTo(INCOMING_CALL_SIZE, INCOMING_CALL_SIZE/2);
    graphics.strokePath();
    
    // Add a small circle at the top for the fuse
    graphics.fillStyle(0xFF0000, 1);
    graphics.fillCircle(INCOMING_CALL_SIZE, 0, 2);
    
    // Generate the texture
    graphics.generateTexture('incomingCall', INCOMING_CALL_SIZE * 2, INCOMING_CALL_SIZE * 2);
    graphics.destroy();
    
    // Create the sprite
    this.sprite = scene.physics.add.sprite(x, y, 'incomingCall');
    this.sprite.setOrigin(0.5, 0.5);
    
    // Enable physics for the sprite
    scene.physics.world.enable(this.sprite);
    
    // Configure the physics body
    this.sprite.body.setCollideWorldBounds(false);
    this.sprite.body.setBounce(0);
    this.sprite.body.setAllowGravity(false);
    
    // Set vertical velocity for falling straight down
    this.sprite.body.setVelocity(0, INCOMING_CALL_FALL_SPEED);
    
    // Store reference to this instance on the sprite for collision detection
    this.sprite.incomingCallInstance = this;
    
    // Create a flashing effect to make it more noticeable
    scene.tweens.add({
      targets: this.sprite,
      alpha: 0.6,
      duration: 300,
      yoyo: true,
      repeat: -1
    });
  }
  
  update() {
    // If sprite is still active
    if (this.sprite && this.sprite.active) {
      // Ensure it's always moving downward
      this.sprite.body.setVelocity(0, INCOMING_CALL_FALL_SPEED);
      
      // Check if it reached the bottom of the playable area
      if (this.sprite.y >= PLAYABLE_HEIGHT - 20) {
        this.explode();
      }
      
      // If it has fallen below the screen, destroy it without exploding
      if (this.sprite.y > this.scene.cameras.main.height) {
        this.destroy();
      }
    }
  }
  
  explode() {
    // Create particle explosion
    const particles = this.scene.add.particles(INCOMING_CALL_COLOR);
    
    const emitter = particles.createEmitter({
      speed: { min: 50, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      lifespan: INCOMING_CALL_EXPLOSION_DURATION,
      blendMode: 'ADD',
      frequency: 0,
      quantity: INCOMING_CALL_EXPLOSION_PARTICLES
    });
    
    // Emit particles at the position
    emitter.explode(INCOMING_CALL_EXPLOSION_PARTICLES, this.sprite.x, this.sprite.y);
    
    // Create visual representation of explosion radius (circle flash)
    const explosionCircle = this.scene.add.circle(
      this.sprite.x, 
      this.sprite.y,
      this.explosionRadius,
      INCOMING_CALL_COLOR,
      0.3
    );
    
    // Check if the player is within explosion radius
    const player = this.scene.player;
    
    // Calculate player center position (player uses a top-left origin (0,0))
    const playerCenterX = player.sprite.x + player.sprite.width / 2;
    const playerCenterY = player.sprite.y + player.sprite.height / 2;
    
    // Calculate distance from explosion to player center
    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      playerCenterX, playerCenterY
    );
    
    // Debug logging to help diagnose issues
    console.log(`Explosion at (${this.sprite.x}, ${this.sprite.y}), Player at (${playerCenterX}, ${playerCenterY}), Distance: ${distanceToPlayer}, Radius: ${this.explosionRadius}`);
    
    // Check if any part of the player is within explosion radius
    // Adding a small buffer to make collision detection more forgiving
    if (distanceToPlayer <= this.explosionRadius + 5) {
      console.log("Player hit by incoming call explosion!");
      // Trigger incoming call if player is caught in explosion
      this.triggerCall();
    }
    
    // Fade out and destroy the explosion circle
    this.scene.tweens.add({
      targets: explosionCircle,
      alpha: 0,
      duration: INCOMING_CALL_EXPLOSION_DURATION,
      onComplete: () => {
        explosionCircle.destroy();
        
        // Destroy particles after their lifespan
        this.scene.time.delayedCall(INCOMING_CALL_EXPLOSION_DURATION, () => {
          particles.destroy();
        });
      }
    });
    
    // Destroy the sprite
    this.destroy();
  }
  
  triggerCall() {
    // Notify the scene to handle the incoming call
    if (this.scene && this.scene.scrumBoard) {
      // Log collision detection success
      console.log('Incoming call successfully triggered - activating business analyst character');
      
      // Check if IncomingCallDialog has a visual state mismatch and fix it if needed
      const scrumBoard = this.scene.scrumBoard;
      const isVisuallyActive = scrumBoard.mainContainer && 
                             scrumBoard.mainContainer.visible && 
                             scrumBoard.mainContainer.y < scrumBoard.scene.cameras.main.height;
      
      if (scrumBoard.active && !isVisuallyActive) {
        console.log('IncomingCallDialog state mismatch detected in triggerCall - forcing reset');
        scrumBoard.forceDeactivate();
      }
      
      // Get the business analyst character and activate it
      const character = getCharacter('businessAnalyst');
      this.scene.scrumBoard.activate(character);
      
      // Add visual indicator that a call was triggered
      const callTriggeredText = this.scene.add.text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2,
        "INCOMING CALL TRIGGERED!",
        {
          font: '24px Arial',
          fill: '#FF0000',
          stroke: '#000000',
          strokeThickness: 4
        }
      );
      callTriggeredText.setOrigin(0.5, 0.5);
      callTriggeredText.setDepth(1000);
      
      // Fade out and destroy the text after a short duration
      this.scene.tweens.add({
        targets: callTriggeredText,
        alpha: 0,
        y: this.scene.cameras.main.height / 2 - 50,
        duration: 1000,
        onComplete: () => callTriggeredText.destroy()
      });
    }
  }
  
  destroy() {
    if (this.sprite && this.sprite.active) {
      this.sprite.destroy();
    }
  }
  
  static createIncomingCallGroup(scene) {
    // Create a physics group
    const group = scene.physics.add.group({
      allowGravity: false,
      collideWorldBounds: false
    });
    
    return group;
  }
}

export default IncomingCall; 