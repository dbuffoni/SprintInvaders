// Import required constants
import { 
  INCOMING_CALL_FALL_SPEED,
  INCOMING_CALL_SIZE,
  INCOMING_CALL_COLOR,
  INCOMING_CALL_EVIL_COLOR,
  INCOMING_CALL_GOOD_COLOR,
  INCOMING_CALL_EXPLOSION_RADIUS,
  INCOMING_CALL_EXPLOSION_DURATION,
  INCOMING_CALL_EXPLOSION_PARTICLES,
  PLAYABLE_HEIGHT,
  CHARACTER_PROPORTIONS
} from '../constants.js';
import { getCharacter, getAllCharacterTypes } from '../characters.js';

class IncomingCall {
  constructor(scene, x, y, characterType = null) {
    this.scene = scene;
    
    // Store the character type or randomly select one if not provided
    this.characterType = characterType || this.getRandomCharacterType();
    
    // Get the character instance
    this.character = getCharacter(this.characterType);
    
    // Determine color based on character's good/evil alignment
    this.callColor = this.character.isEvil ? INCOMING_CALL_EVIL_COLOR : INCOMING_CALL_GOOD_COLOR;
    
    // Calculate explosion radius
    this.explosionRadius = INCOMING_CALL_EXPLOSION_RADIUS;
    
    // Create unique texture name for this character type
    const textureName = `incomingCall_${this.characterType}`;
    
    // Check if we've already created this texture
    if (!scene.textures.exists(textureName)) {
      // Create the incoming call sprite using a simple bomb shape
      const graphics = scene.add.graphics();
      
      // Draw bomb shape (circle with short fuse)
      graphics.fillStyle(this.callColor, 1);
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
      graphics.generateTexture(textureName, INCOMING_CALL_SIZE * 2, INCOMING_CALL_SIZE * 2);
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
  
  // Get a random character type based on the available types
  getRandomCharacterType() {
    const types = getAllCharacterTypes();
    const evilTypes = types.filter(type => getCharacter(type).isEvil);
    const goodTypes = types.filter(type => !getCharacter(type).isEvil);
    
    // Use CHARACTER_PROPORTIONS to determine if we should use an evil or good character
    const random = Math.random();
    if (random < CHARACTER_PROPORTIONS.EVIL && evilTypes.length > 0) {
      // Select a random evil character
      const randomIndex = Math.floor(Math.random() * evilTypes.length);
      return evilTypes[randomIndex];
    } else if (goodTypes.length > 0) {
      // Select a random good character
      const randomIndex = Math.floor(Math.random() * goodTypes.length);
      return goodTypes[randomIndex];
    } else {
      // Fallback to old method if no characters match the criteria
      const randomIndex = Math.floor(Math.random() * types.length);
      return types[randomIndex];
    }
  }
  
  update() {
    // If sprite is still active
    if (this.sprite && this.sprite.active) {
      // Ensure it's always moving downward
      this.sprite.body.setVelocity(0, INCOMING_CALL_FALL_SPEED);
      
      // Check if it reached the bottom of the playable area
      if (this.sprite.y >= PLAYABLE_HEIGHT - 20) {
        // Different behavior based on alignment
        if (this.character.isEvil) {
          // Evil calls explode on reaching bottom
          this.explode();
        } else {
          // Good calls just disappear with shrinking effect
          this.disappearShrinking();
        }
      }
      
      // If it has fallen below the screen, destroy it without exploding
      if (this.sprite.y > this.scene.cameras.main.height) {
        this.destroy();
      }
    }
  }
  
  // Method for good calls to disappear with a shrinking effect
  disappearShrinking() {
    // Create a minimal particle effect
    const particles = this.scene.add.particles(this.callColor);
    
    const emitter = particles.createEmitter({
      speed: { min: 10, max: 30 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.2, end: 0 },
      lifespan: INCOMING_CALL_EXPLOSION_DURATION / 2,
      blendMode: 'ADD',
      frequency: 0,
      quantity: Math.floor(INCOMING_CALL_EXPLOSION_PARTICLES / 4)
    });
    
    // Emit minimal particles
    emitter.explode(Math.floor(INCOMING_CALL_EXPLOSION_PARTICLES / 4), this.sprite.x, this.sprite.y);
    
    // Create shrinking animation
    this.scene.tweens.add({
      targets: this.sprite,
      scale: 0,
      alpha: 0,
      duration: INCOMING_CALL_EXPLOSION_DURATION / 2,
      onComplete: () => {
        // Destroy particles after their lifespan
        this.scene.time.delayedCall(INCOMING_CALL_EXPLOSION_DURATION / 2, () => {
          particles.destroy();
        });
        
        // Destroy the sprite
        this.destroy();
      }
    });
  }
  
  // Method for handling player collision
  handlePlayerCollision() {
    // Different behavior based on alignment
    if (this.character.isEvil) {
      // Evil calls explode on contact with player
      this.explode();
    } else {
      // Good calls are absorbed by player
      // Set flag to indicate this was from player collision
      this.calledFromPlayerCollision = true;
      this.absorb();
    }
  }
  
  // Method for good calls being absorbed by the player
  absorb() {
    // Create particles for absorption effect
    const particles = this.scene.add.particles(this.callColor);
    
    const emitter = particles.createEmitter({
      speed: { min: 20, max: 50 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.3, end: 0 },
      lifespan: INCOMING_CALL_EXPLOSION_DURATION / 2,
      blendMode: 'ADD',
      frequency: 0,
      quantity: Math.floor(INCOMING_CALL_EXPLOSION_PARTICLES / 2)
    });
    
    // Calculate player center position
    const player = this.scene.player;
    const playerCenterX = player.sprite.x + player.sprite.width / 2;
    const playerCenterY = player.sprite.y + player.sprite.height / 2;
    
    // Emit particles towards the player
    emitter.explode(Math.floor(INCOMING_CALL_EXPLOSION_PARTICLES / 2), this.sprite.x, this.sprite.y);
    
    // Create visual indication of absorption
    const absorbCircle = this.scene.add.circle(
      this.sprite.x, 
      this.sprite.y,
      this.explosionRadius / 2,
      this.callColor,
      0.3
    );
    
    // Animate the circle to shrink toward the player
    this.scene.tweens.add({
      targets: absorbCircle,
      x: playerCenterX,
      y: playerCenterY,
      alpha: 0,
      scale: 0.1,
      duration: INCOMING_CALL_EXPLOSION_DURATION / 2,
      onComplete: () => {
        absorbCircle.destroy();
        
        // Destroy particles after their lifespan
        this.scene.time.delayedCall(INCOMING_CALL_EXPLOSION_DURATION / 2, () => {
          particles.destroy();
        });
      }
    });
    
    console.log(`Good call from ${this.character.name} absorbed by player`);
    
    // Still trigger the call as before - ONLY when the player touches the call, not when shot down
    if (this.calledFromPlayerCollision) {
      this.triggerCall();
    }
    
    // Destroy the sprite
    this.destroy();
  }
  
  // Method for when good calls are shot down by player bullets
  shotDown() {
    // Create a simple particle effect for destruction
    const particles = this.scene.add.particles(this.callColor);
    
    const emitter = particles.createEmitter({
      speed: { min: 30, max: 80 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.2, end: 0 },
      lifespan: INCOMING_CALL_EXPLOSION_DURATION / 3,
      blendMode: 'ADD',
      frequency: 0,
      quantity: Math.floor(INCOMING_CALL_EXPLOSION_PARTICLES / 3)
    });
    
    // Emit particles at the position (burst outward)
    emitter.explode(Math.floor(INCOMING_CALL_EXPLOSION_PARTICLES / 3), this.sprite.x, this.sprite.y);
    
    console.log(`Good call from ${this.character.name} shot down by player`);
    
    // Quick fade out animation
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scale: 0.5,
      duration: INCOMING_CALL_EXPLOSION_DURATION / 4,
      onComplete: () => {
        // Destroy particles after their lifespan
        this.scene.time.delayedCall(INCOMING_CALL_EXPLOSION_DURATION / 3, () => {
          particles.destroy();
        });
        
        // Destroy the sprite
        this.destroy();
      }
    });
  }
  
  explode() {
    // Create particle explosion - use the character's color
    const particles = this.scene.add.particles(this.callColor);
    
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
      this.callColor,
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
      console.log(`Incoming call successfully triggered - activating ${this.characterType} character`);
      
      // Check if IncomingCallDialog has a visual state mismatch and fix it if needed
      const scrumBoard = this.scene.scrumBoard;
      const isVisuallyActive = scrumBoard.mainContainer && 
                             scrumBoard.mainContainer.visible && 
                             scrumBoard.mainContainer.y < scrumBoard.scene.cameras.main.height;
      
      if (scrumBoard.active && !isVisuallyActive) {
        console.log('IncomingCallDialog state mismatch detected in triggerCall - forcing reset');
        scrumBoard.forceDeactivate();
      }
      
      // Use the character that was already determined when creating this call
      this.scene.scrumBoard.activate(this.character);
      
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