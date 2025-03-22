// Import required constants
import { 
  UFO_WIDTH,
  UFO_HEIGHT,
  UFO_COLOR,
  UFO_MIN_SPEED,
  UFO_MAX_SPEED,
  UFO_ACCELERATION,
  UFO_MAX_DIRECTION_CHANGES,
  UFO_HEALTH,
  UFO_DROP_CHANCE,
  CANVAS_WIDTH,
  PLAYABLE_HEIGHT,
  UFO_SCREEN_TIME,
  CHARACTER_PROPORTIONS,
  CHARACTER_TYPES,
  UFO_CHARACTER_DROP_RATES
} from '../constants.js';
import { getCharacter } from '../characters.js';

class UFO {
  constructor(scene, startFromLeft = Math.random() > 0.5) {
    this.scene = scene;
    this.health = UFO_HEALTH;
    this.directionChanges = 0;
    this.maxDirectionChanges = UFO_MAX_DIRECTION_CHANGES;
    this.crossCount = 0; // Track how many times the UFO has crossed the screen
    this.maxCrosses = 2 + Math.floor(Math.random() * 2); // Random between 2-3 crosses
    this.startFromLeft = startFromLeft;
    this.targetPlayer = false; // Flag to occasionally target the player
    this.canLeaveScreen = false; // Flag indicating whether UFO can leave the screen
    
    // Get a random character for this UFO based on good/evil proportions
    const rand = Math.random();
    if (rand < CHARACTER_PROPORTIONS.EVIL) {
      // Randomly choose between evil characters
      const evilCharacters = CHARACTER_TYPES.EVIL;
      const randomEvilIndex = Math.floor(Math.random() * evilCharacters.length);
      this.characterType = evilCharacters[randomEvilIndex];
      this.character = getCharacter(this.characterType);
    } else {
      // Randomly choose between good characters
      const goodCharacters = CHARACTER_TYPES.GOOD;
      const randomGoodIndex = Math.floor(Math.random() * goodCharacters.length);
      this.characterType = goodCharacters[randomGoodIndex];
      this.character = getCharacter(this.characterType);
    }
    
    // Determine starting position
    const x = startFromLeft ? -UFO_WIDTH : CANVAS_WIDTH + UFO_WIDTH;
    const y = Math.random() * (PLAYABLE_HEIGHT / 2) + 50; // Random Y position in top half
    
    // Create the UFO sprite
    this.createUFOSprite(x, y);
    
    // Set initial horizontal velocity
    this.setHorizontalVelocity();
    
    // Add timed direction changes
    this.setupDirectionChanges();
    
    // Flash effect for the UFO
    this.createFlashEffect();
    
    // Health display
    this.createHealthDisplay();

    // Setup more frequent target checking
    this.playerTargetTimer = this.scene.time.addEvent({
      delay: 1500,
      callback: this.considerTargetingPlayer,
      callbackScope: this,
      repeat: -1 // Repeat indefinitely
    });
    
    // Set up timer for the UFO to stay in screen
    this.screenTimeTimer = this.scene.time.delayedCall(UFO_SCREEN_TIME, () => {
      this.canLeaveScreen = true;
      console.log('UFO screen time expired, now allowed to leave');
      
      // When time expires, force UFO to head toward exit
      if (this.sprite && this.sprite.active) {
        // Determine closest exit direction
        const distanceToLeft = this.sprite.x;
        const distanceToRight = CANVAS_WIDTH - this.sprite.x;
        
        if (distanceToLeft < distanceToRight) {
          // Closer to left edge, head left
          this.horizontalDirection = -1;
        } else {
          // Closer to right edge, head right
          this.horizontalDirection = 1;
        }
        // Apply the new direction with a higher speed to ensure it leaves
        this.speed = UFO_MAX_SPEED;
        this.sprite.body.setVelocityX(this.speed * this.horizontalDirection);
      }
    });
  }
  
  createUFOSprite(x, y) {
    // Create graphics for UFO shape
    const graphics = this.scene.add.graphics();
    
    // Draw UFO shape
    graphics.fillStyle(UFO_COLOR, 1);
    
    // UFO body (ellipse)
    graphics.fillEllipse(UFO_WIDTH/2, UFO_HEIGHT/2, UFO_WIDTH, UFO_HEIGHT/2);
    
    // UFO dome (semi-circle)
    graphics.fillCircle(UFO_WIDTH/2, UFO_HEIGHT/3, UFO_WIDTH/4);
    
    // UFO lights
    graphics.fillStyle(0xFFFF00, 1); // Yellow
    graphics.fillCircle(UFO_WIDTH/4, UFO_HEIGHT/2, 5);
    graphics.fillCircle(UFO_WIDTH/2, UFO_HEIGHT/2, 5);
    graphics.fillCircle(3*UFO_WIDTH/4, UFO_HEIGHT/2, 5);
    
    // Generate texture and create sprite
    graphics.generateTexture('ufo', UFO_WIDTH, UFO_HEIGHT);
    graphics.destroy();
    
    // Create the sprite
    this.sprite = this.scene.physics.add.sprite(x, y, 'ufo');
    
    // Set a high depth value to ensure UFO is always in foreground compared to scope blocks
    this.sprite.setDepth(1000);
    
    // Enable physics for the sprite
    this.scene.physics.world.enable(this.sprite);
    
    // Configure physics body
    this.sprite.body.setCollideWorldBounds(false);
    this.sprite.body.setBounce(0);
    this.sprite.body.setAllowGravity(false);
    
    // Store reference to this instance on the sprite for collision detection
    this.sprite.ufoInstance = this;
  }
  
  setHorizontalVelocity() {
    // Calculate random speed between min and max
    this.speed = Math.random() * (UFO_MAX_SPEED - UFO_MIN_SPEED) + UFO_MIN_SPEED;
    
    // Set horizontal direction based on starting position or current state
    if (this.crossCount === 0) {
      // Initial direction - always moving into the screen
      this.horizontalDirection = this.startFromLeft ? 1 : -1;
    } else {
      // Reverse direction when crossing
      this.horizontalDirection *= -1;
    }
    
    // Apply velocity
    this.sprite.body.setVelocityX(this.speed * this.horizontalDirection);
    
    // Random vertical velocity component
    const verticalSpeed = (Math.random() - 0.5) * UFO_MAX_SPEED / 2;
    this.sprite.body.setVelocityY(verticalSpeed);
  }
  
  setupDirectionChanges() {
    // Calculate time between direction changes
    // Duration should allow UFO to traverse screen with all direction changes
    const totalDistance = CANVAS_WIDTH + UFO_WIDTH * 2;
    const avgSpeed = (UFO_MIN_SPEED + UFO_MAX_SPEED) / 2;
    const estimatedTravelTime = totalDistance / avgSpeed * 1000; // Convert to milliseconds
    
    // Shorter time between changes for more dynamic movement
    const timeBetweenChanges = estimatedTravelTime / (this.maxDirectionChanges + 2);
    
    // Set up timer for direction changes
    this.directionChangeTimer = this.scene.time.addEvent({
      delay: timeBetweenChanges,
      callback: this.changeDirection,
      callbackScope: this,
      repeat: this.maxDirectionChanges + 1 // More direction changes
    });
  }
  
  createFlashEffect() {
    // Create a flashing effect
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.7,
      duration: 300,
      yoyo: true,
      repeat: -1
    });
  }
  
  createHealthDisplay() {
    // Create a text to display health
    this.healthText = this.scene.add.text(
      0, 
      -15, 
      this.health.toString(),
      { 
        font: '16px Arial',
        fill: '#FFFFFF'
      }
    );
    
    // Add the text as a child of the sprite so it moves with it
    this.sprite.setDataEnabled();
    this.sprite.setData('healthText', this.healthText);
    this.sprite.setData('ufoInstance', this);
    
    // Update the position of the health text
    this.updateHealthTextPosition();
  }
  
  update() {
    if (this.sprite && this.sprite.active) {
      // Check if IncomingCallDialog is active - if so, force UFO to leave
      if (this.scene.scrumBoard && this.scene.scrumBoard.active) {
        console.log('IncomingCallDialog active - forcing UFO to leave screen');
        this.canLeaveScreen = true;
        
        // Determine closest exit direction
        const distanceToLeft = this.sprite.x;
        const distanceToRight = CANVAS_WIDTH - this.sprite.x;
        
        if (distanceToLeft < distanceToRight) {
          // Closer to left edge, head left
          this.horizontalDirection = -1;
        } else {
          // Closer to right edge, head right
          this.horizontalDirection = 1;
        }
        // Apply the new direction with a higher speed to ensure it leaves quickly
        this.speed = UFO_MAX_SPEED * 2;
        this.sprite.body.setVelocityX(this.speed * this.horizontalDirection);
        
        // Also disable dropping calls
        return;
      }
      
      // Check if any effects are active - if so, force UFO to leave
      if (this.scene.scrumBoard && (
          this.scene.scrumBoard.weaponLockActive || 
          this.scene.scrumBoard.bulletLimitActive || 
          this.scene.scrumBoard.gameSpeedActive ||
          this.scene.scrumBoard.unstableAimActive)) {
        console.log('Game effects active - forcing UFO to leave screen');
        this.canLeaveScreen = true;
        
        // Determine closest exit direction
        const distanceToLeft = this.sprite.x;
        const distanceToRight = CANVAS_WIDTH - this.sprite.x;
        
        if (distanceToLeft < distanceToRight) {
          // Closer to left edge, head left
          this.horizontalDirection = -1;
        } else {
          // Closer to right edge, head right
          this.horizontalDirection = 1;
        }
        // Apply the new direction with a higher speed to ensure it leaves quickly
        this.speed = UFO_MAX_SPEED * 2;
        this.sprite.body.setVelocityX(this.speed * this.horizontalDirection);
        
        // Also disable dropping calls
        return;
      }
      
      // Check if UFO can leave the screen
      if (this.canLeaveScreen) {
        // Allow the UFO to leave the screen when time expires
        if ((this.horizontalDirection > 0 && this.sprite.x > CANVAS_WIDTH + UFO_WIDTH) || 
            (this.horizontalDirection < 0 && this.sprite.x < -UFO_WIDTH)) {
          this.destroy();
          return;
        }
      } else {
        // During active phase, keep UFO within horizontal screen bounds
        if (this.sprite.x > CANVAS_WIDTH - UFO_WIDTH/2) {
          this.sprite.x = CANVAS_WIDTH - UFO_WIDTH/2;
          // Count this as a screen cross and reverse direction
          this.crossCount++;
          this.horizontalDirection = -1;
          this.sprite.body.setVelocityX(this.speed * this.horizontalDirection);
        } else if (this.sprite.x < UFO_WIDTH/2) {
          this.sprite.x = UFO_WIDTH/2;
          // Count this as a screen cross and reverse direction
          this.crossCount++;
          this.horizontalDirection = 1;
          this.sprite.body.setVelocityX(this.speed * this.horizontalDirection);
        }
      }
      
      // Keep UFO within vertical bounds
      if (this.sprite.y < 30) {
        this.sprite.y = 30;
        this.sprite.body.setVelocityY(Math.abs(this.sprite.body.velocity.y));
      } else if (this.sprite.y > PLAYABLE_HEIGHT / 2) {
        this.sprite.y = PLAYABLE_HEIGHT / 2;
        this.sprite.body.setVelocityY(-Math.abs(this.sprite.body.velocity.y));
      }
      
      // Random speed changes
      if (Math.random() < 0.02) {
        this.adjustSpeed();
      }
      
      // Move toward player occasionally
      if (this.targetPlayer && this.scene.player) {
        this.moveTowardPlayer();
      }
      
      // Random chance to drop an incoming call based on character type
      const dropChance = this.character && this.character.isEvil ? 
        UFO_CHARACTER_DROP_RATES.EVIL : UFO_CHARACTER_DROP_RATES.GOOD;
      
      if (Math.random() < dropChance) {
        this.dropIncomingCall();
      }
      
      // Update health text position
      this.updateHealthTextPosition();
    }
  }
  
  changeDirection() {
    // Skip direction changes if trying to leave screen
    if (this.canLeaveScreen) return;
    
    // Skip if sprite inactive
    if (!this.sprite || !this.sprite.active) return;
    
    // Change horizontal direction randomly with a bias toward continuing
    if (Math.random() < 0.3) { // 30% chance to reverse
      this.horizontalDirection *= -1;
      this.sprite.body.setVelocityX(this.speed * this.horizontalDirection);
    }
    
    // Change vertical velocity
    const verticalVelocity = (Math.random() - 0.5) * UFO_MAX_SPEED / 2;
    this.sprite.body.setVelocityY(verticalVelocity);
    
    // Adjust speed
    this.adjustSpeed();
    
    // Random chance to drop an incoming call
    // Use different drop rates based on character type
    const dropChance = this.character && this.character.isEvil ? 
      UFO_CHARACTER_DROP_RATES.EVIL : UFO_CHARACTER_DROP_RATES.GOOD;
    
    if (Math.random() < dropChance) {
      this.dropIncomingCall();
    }
    
    // Count the direction change
    this.directionChanges++;
  }
  
  adjustSpeed() {
    if (!this.sprite || !this.sprite.active) return;
    
    // Randomly increase or decrease speed
    const acceleration = (Math.random() - 0.5) * 2 * UFO_ACCELERATION;
    this.speed = Math.min(UFO_MAX_SPEED, Math.max(UFO_MIN_SPEED, this.speed + acceleration));
    
    // Apply the new speed
    this.sprite.body.setVelocityX(this.speed * this.horizontalDirection);
  }
  
  considerTargetingPlayer() {
    if (!this.sprite || !this.sprite.active || !this.scene.player) return;
    
    // 30% chance to start targeting player
    this.targetPlayer = Math.random() < 0.3;
  }
  
  moveTowardPlayer() {
    if (!this.sprite || !this.sprite.active || !this.scene.player) return;
    
    const player = this.scene.player;
    
    // Calculate angle to player
    const angleToPlayer = Phaser.Math.Angle.Between(
      this.sprite.x, 
      this.sprite.y, 
      player.sprite.x, 
      player.sprite.y
    );
    
    // Apply a slight velocity adjustment toward player
    const targetingStrength = 0.2; // How strongly to target the player
    
    // Calculate velocity components toward player
    const targetVelX = Math.cos(angleToPlayer) * this.speed * targetingStrength;
    const targetVelY = Math.sin(angleToPlayer) * this.speed * targetingStrength;
    
    // Blend current velocity with target velocity
    this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.9 + targetVelX * 0.1);
    this.sprite.body.setVelocityY(this.sprite.body.velocity.y * 0.9 + targetVelY * 0.1);
  }
  
  dropIncomingCall() {
    if (!this.scene || !this.sprite || !this.sprite.active) return;
    
    // Check if the IncomingCallDialog is active and skip dropping calls if it is
    if (this.scene.scrumBoard && this.scene.scrumBoard.active) {
      console.log('Skipping incoming call drop - IncomingCallDialog is active');
      return;
    }
    
    // Check if any effects are active and skip dropping calls if they are
    if (this.scene.scrumBoard) {
      if (this.scene.scrumBoard.weaponLockActive || 
          this.scene.scrumBoard.bulletLimitActive || 
          this.scene.scrumBoard.gameSpeedActive ||
          this.scene.scrumBoard.unstableAimActive) {
        console.log('Skipping incoming call drop - effects are active');
        return;
      }
    }
    
    // Use the stored character type from when this UFO was created
    // This ensures the UFO consistently uses the same character
    
    // Create incoming call at UFO position with this UFO's character type
    this.scene.createIncomingCall(this.sprite.x, this.sprite.y + UFO_HEIGHT/2, this.characterType);
  }
  
  hit() {
    // Decrease health
    this.health--;
    
    // Update health display
    if (this.healthText) {
      this.healthText.setText(this.health.toString());
    }
    
    // Flash red when hit
    this.scene.tweens.add({
      targets: this.sprite,
      tint: 0xFF0000,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        if (this.sprite && this.sprite.active) {
          this.sprite.clearTint();
        }
      }
    });
    
    // Check if destroyed
    if (this.health <= 0) {
      this.explode();
      return true;
    }
    
    return false;
  }
  
  explode() {
    // Create particle explosion
    const particles = this.scene.add.particles(UFO_COLOR);
    
    const emitter = particles.createEmitter({
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      lifespan: 1000,
      blendMode: 'ADD',
      frequency: 0,
      quantity: 50
    });
    
    // Emit particles at UFO position
    emitter.explode(50, this.sprite.x, this.sprite.y);
    
    // Increase score
    if (this.scene) {
      this.scene.score += 100;
      this.scene.scoreText.setText(`Score: ${this.scene.score}`);
      
      // Add score text at explosion
      const scoreText = this.scene.add.text(
        this.sprite.x,
        this.sprite.y,
        '+100',
        {
          font: '20px Arial',
          fill: '#FFFFFF'
        }
      );
      scoreText.setOrigin(0.5);
      
      // Animate score text
      this.scene.tweens.add({
        targets: scoreText,
        y: this.sprite.y - 50,
        alpha: 0,
        duration: 1000,
        onComplete: () => scoreText.destroy()
      });
    }
    
    // Destroy UFO
    this.destroy();
    
    // Destroy particles after their lifespan
    this.scene.time.delayedCall(1000, () => {
      particles.destroy();
    });
  }
  
  updateHealthTextPosition() {
    if (this.healthText && this.sprite && this.sprite.active) {
      this.healthText.x = this.sprite.x - this.healthText.width / 2;
      this.healthText.y = this.sprite.y - 30;
    }
  }
  
  destroy() {
    // Clean up timers
    if (this.playerTargetTimer) {
      this.playerTargetTimer.remove();
      this.playerTargetTimer = null;
    }
    
    if (this.screenTimeTimer && this.screenTimeTimer.remove) {
      this.screenTimeTimer.remove();
      this.screenTimeTimer = null;
    }
    
    // Clean up health text
    if (this.healthText) {
      this.healthText.destroy();
      this.healthText = null;
    }
    
    // Clean up direction change timer
    if (this.directionChangeTimer) {
      this.directionChangeTimer.remove();
      this.directionChangeTimer = null;
    }
    
    // Destroy sprite
    if (this.sprite && this.sprite.active) {
      this.sprite.destroy();
    }
  }
  
  static createUFOGroup(scene) {
    // Create a physics group for UFOs
    const group = scene.physics.add.group({
      allowGravity: false,
      collideWorldBounds: false
    });
    
    return group;
  }
}

export default UFO; 