// Import constants
import { BLOCK_COLORS, PLAYABLE_HEIGHT, INVULNERABLE_ALPHA, INVULNERABLE_COLOR } from '../constants.js';
import { getCharacter } from '../characters.js';

class ScopeBlock {
  constructor(scene, x, y, category) {
    this.scene = scene;
    this.category = category;
    
    // Determine block properties based on category
    const width = 50; // All blocks have the same width now
    const height = 30; // All blocks have the same height now
    // Store hits temporarily in a local variable instead of setting this.hitsRemaining directly
    const hits = category === 'S' ? 1 : 
                 category === 'M' ? 2 : 
                 category === 'L' ? 3 : 
                 10; // XXL takes 10 hits
    const color = BLOCK_COLORS[category];
    
    // Create a texture for this block type if it doesn't exist
    const textureKey = `block_${category}`;
    if (!scene.textures.exists(textureKey)) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(color, 1);
      graphics.fillRect(0, 0, width, height);
      
      graphics.generateTexture(textureKey, width, height);
      graphics.destroy();
    }
    
    // Create left piece texture for this block type
    const leftPieceTextureKey = `block_${category}_left`;
    if (!scene.textures.exists(leftPieceTextureKey)) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(color, 1);
      graphics.fillRect(0, 0, width/2 - 2, height);
      
      // Add some jagged edges for effect
      graphics.fillStyle(color, 1);
      for (let i = 0; i < height; i += 5) {
        if (i % 2 === 0) {
          graphics.fillRect(width/2 - 2, i, 2, 3);
        }
      }
      
      graphics.generateTexture(leftPieceTextureKey, width/2, height);
      graphics.destroy();
    }
    
    // Create right piece texture for this block type
    const rightPieceTextureKey = `block_${category}_right`;
    if (!scene.textures.exists(rightPieceTextureKey)) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(color, 1);
      graphics.fillRect(2, 0, width/2 - 2, height);
      
      // Add some jagged edges for effect
      graphics.fillStyle(color, 1);
      for (let i = 0; i < height; i += 5) {
        if (i % 2 !== 0) {
          graphics.fillRect(0, i, 2, 3);
        }
      }
      
      graphics.generateTexture(rightPieceTextureKey, width/2, height);
      graphics.destroy();
    }
    
    // Create invulnerable left piece texture
    const invulnerableLeftPieceTextureKey = `invulnerable_${category}_left`;
    if (!scene.textures.exists(invulnerableLeftPieceTextureKey)) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(INVULNERABLE_COLOR, 1);
      graphics.fillRect(0, 0, width/2 - 2, height);
      
      // Add some jagged edges for effect
      graphics.fillStyle(INVULNERABLE_COLOR, 1);
      for (let i = 0; i < height; i += 5) {
        if (i % 2 === 0) {
          graphics.fillRect(width/2 - 2, i, 2, 3);
        }
      }
      
      graphics.generateTexture(invulnerableLeftPieceTextureKey, width/2, height);
      graphics.destroy();
    }
    
    // Create invulnerable right piece texture
    const invulnerableRightPieceTextureKey = `invulnerable_${category}_right`;
    if (!scene.textures.exists(invulnerableRightPieceTextureKey)) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(INVULNERABLE_COLOR, 1);
      graphics.fillRect(2, 0, width/2 - 2, height);
      
      // Add some jagged edges for effect
      graphics.fillStyle(INVULNERABLE_COLOR, 1);
      for (let i = 0; i < height; i += 5) {
        if (i % 2 !== 0) {
          graphics.fillRect(0, i, 2, 3);
        }
      }
      
      graphics.generateTexture(invulnerableRightPieceTextureKey, width/2, height);
      graphics.destroy();
    }
    
    // Create the block sprite
    this.sprite = scene.scopeBlocks.create(x, y, textureKey);
    this.sprite.setOrigin(0, 0);
    this.sprite.category = category;
    this.sprite.hitsRemaining = hits; // Set hits directly on the sprite
    this.sprite.setImmovable(true);
    
    // Add text label
    let label = category === 'XXL' ? 
      `${category} (${hits})` : category;
    
    this.textLabel = scene.add.text(
      x + width / 2,
      y + height / 2,
      label,
      { 
        font: '12px Arial', 
        fill: '#ffffff',
        align: 'center'
      }
    );
    this.textLabel.setOrigin(0.5, 0.5);
    
    // Store reference to text on the block
    this.sprite.textLabel = this.textLabel;
    
    // Initialize dependencies
    this.dependencies = [];
    
    // Initialize broken status
    this.broken = false;
    
    // Initialize broken pieces (will be created when block breaks)
    this.leftPiece = null;
    this.rightPiece = null;
    
    // Store reference to this ScopeBlock instance on the sprite
    this.sprite.scopeBlockInstance = this;
  }
  
  get x() {
    return this.sprite.x;
  }
  
  set x(value) {
    this.sprite.x = value;
    this.textLabel.x = value + this.width / 2;
    this.updatePiecesPosition();
  }
  
  get y() {
    return this.sprite.y;
  }
  
  set y(value) {
    this.sprite.y = value;
    this.textLabel.y = value + this.height / 2;
    this.updatePiecesPosition();
  }
  
  get width() {
    return this.sprite.width;
  }
  
  get height() {
    return this.sprite.height;
  }
  
  get hitsRemaining() {
    return this.sprite.hitsRemaining;
  }
  
  set hitsRemaining(value) {
    this.sprite.hitsRemaining = value;
    
    // Update XXL block label if needed
    if (this.category === 'XXL') {
      this.textLabel.setText(`${this.category} (${value})`);
    }
  }
  
  // Helper to get a numeric value for block size based on category
  get sizeValue() {
    return this.category === 'S' ? 1 : 
           this.category === 'M' ? 2 : 
           this.category === 'L' ? 3 : 
           4; // XXL is 4
  }
  
  // Add a dependency to this block
  addDependency(block) {
    if (block && !this.dependencies.includes(block)) {
      this.dependencies.push(block);
      this.updateInvulnerableStatus();
    }
  }
  
  // Remove a dependency from this block
  removeDependency(block) {
    if (block && this.dependencies.includes(block)) {
      this.dependencies = this.dependencies.filter(dep => dep !== block);
      this.updateInvulnerableStatus();
    }
  }
  
  // Check if the block is invulnerable (has active dependencies)
  isInvulnerable() {
    return this.dependencies.length > 0 && 
           this.dependencies.some(dep => dep.sprite && dep.sprite.active);
  }
  
  // Update the visual appearance based on invulnerability status
  updateInvulnerableStatus() {
    const isInvulnerable = this.isInvulnerable();
    
    if (this.broken) {
      // If broken, update the pieces instead of the main sprite
      if (this.leftPiece && this.rightPiece) {
        if (isInvulnerable) {
          this.leftPiece.setTexture(`invulnerable_${this.category}_left`);
          this.rightPiece.setTexture(`invulnerable_${this.category}_right`);
          this.leftPiece.setAlpha(INVULNERABLE_ALPHA);
          this.rightPiece.setAlpha(INVULNERABLE_ALPHA);
        } else {
          this.leftPiece.setTexture(`block_${this.category}_left`);
          this.rightPiece.setTexture(`block_${this.category}_right`);
          this.leftPiece.setAlpha(1);
          this.rightPiece.setAlpha(1);
        }
      }
      return;
    }
    
    // Original block is not broken
    if (isInvulnerable) {
      // Store original texture key if not already stored
      if (!this.sprite.originalTextureKey) {
        this.sprite.originalTextureKey = this.sprite.texture.key;
      }
      
      // Create invulnerable texture for this block if it doesn't exist
      const invulnerableTextureKey = `invulnerable_${this.category}`;
      if (!this.scene.textures.exists(invulnerableTextureKey)) {
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(INVULNERABLE_COLOR, 1);
        graphics.fillRect(0, 0, this.width, this.height);
        graphics.generateTexture(invulnerableTextureKey, this.width, this.height);
        graphics.destroy();
      }
      
      // Use the invulnerable texture
      this.sprite.setTexture(invulnerableTextureKey);
      
      // Also apply alpha for extra visual effect
      this.sprite.setAlpha(INVULNERABLE_ALPHA);
    } else {
      // Restore original texture if we have one stored
      if (this.sprite.originalTextureKey) {
        this.sprite.setTexture(this.sprite.originalTextureKey);
      }
      
      // Reset alpha
      this.sprite.setAlpha(1);
    }
  }
  
  hit() {
    // If block is invulnerable, it won't take damage but will still show broken effect
    if (this.isInvulnerable()) {
      // Play invulnerable hit animation
      this.playInvulnerableHitAnimation();
      
      // Set to broken state visually, without reducing hits
      if (!this.broken) {
        this.setBrokenState();
      }
      
      return false; // Block shouldn't be destroyed
    }
    
    // Play normal hit animation - always play this on hit
    this.playNormalHitAnimation();
    
    // Decrease hits remaining
    this.hitsRemaining--;
    
    // Add special successful hit blinking effect
    this.playSuccessfulHitEffect();
    
    // Set to broken state if not already broken and not going to be destroyed
    if (!this.broken && this.hitsRemaining > 0) {
      this.setBrokenState();
    }
    
    // Return true if block should be destroyed
    return this.hitsRemaining <= 0;
  }
  
  // Set block to broken state
  setBrokenState() {
    if (this.broken) return; // Already broken
    
    this.broken = true;
    
    // Create the two broken pieces
    const isInvulnerable = this.isInvulnerable();
    const leftTextureKey = isInvulnerable ? 
      `invulnerable_${this.category}_left` : `block_${this.category}_left`;
    const rightTextureKey = isInvulnerable ? 
      `invulnerable_${this.category}_right` : `block_${this.category}_right`;
    
    // Get the original sprite position
    const centerX = this.sprite.x + this.width / 2;
    const centerY = this.sprite.y + this.height / 2;
    
    // Create left piece slightly to the left and rotated
    this.leftPiece = this.scene.physics.add.sprite(
      centerX - this.width / 4, 
      centerY, 
      leftTextureKey
    );
    this.leftPiece.setOrigin(0.5, 0.5); // Origin at center for rotation
    
    // Create right piece slightly to the right and rotated
    this.rightPiece = this.scene.physics.add.sprite(
      centerX + this.width / 4, 
      centerY, 
      rightTextureKey
    );
    this.rightPiece.setOrigin(0.5, 0.5); // Origin at center for rotation
    
    // Set alpha if invulnerable
    if (isInvulnerable) {
      this.leftPiece.setAlpha(INVULNERABLE_ALPHA);
      this.rightPiece.setAlpha(INVULNERABLE_ALPHA);
    }
    
    // Hide the original sprite (keep it for physics and logic)
    this.sprite.setVisible(false);
    
    // Apply rotation animation effect with REVERSED directions
    this.scene.tweens.add({
      targets: this.leftPiece,
      angle: 10, // Changed from -10 to 10
      duration: 200,
      ease: 'Power2',
    });
    
    this.scene.tweens.add({
      targets: this.rightPiece,
      angle: -10, // Changed from 10 to -10
      duration: 200,
      ease: 'Power2',
    });
    
    // Add blinking effect
    const originalTint = this.leftPiece.tint;
    
    // Flash sequence: red, white, normal
    this.leftPiece.setTint(0xff0000);
    this.rightPiece.setTint(0xff0000);
    
    this.scene.time.delayedCall(80, () => {
      this.leftPiece.setTint(0xffffff);
      this.rightPiece.setTint(0xffffff);
      
      this.scene.time.delayedCall(80, () => {
        this.leftPiece.setTint(originalTint);
        this.rightPiece.setTint(originalTint);
      });
    });
  }
  
  // Update pieces position to follow the main sprite
  updatePiecesPosition() {
    if (this.broken && this.leftPiece && this.rightPiece) {
      const centerX = this.sprite.x + this.width / 2;
      const centerY = this.sprite.y + this.height / 2;
      
      this.leftPiece.x = centerX - this.width / 4;
      this.leftPiece.y = centerY;
      
      this.rightPiece.x = centerX + this.width / 4;
      this.rightPiece.y = centerY;
    }
  }
  
  // Animation for when an invulnerable block is hit
  playInvulnerableHitAnimation() {
    // Flash the block/pieces without causing alignment issues
    if (this.broken) {
      // Flash the pieces
      if (this.leftPiece && this.rightPiece) {
        const originalAlpha = this.leftPiece.alpha;
        
        // Flash brighter
        this.scene.tweens.add({
          targets: [this.leftPiece, this.rightPiece],
          alpha: 1,
          duration: 50,
          yoyo: true,
          repeat: 2,
          onComplete: () => {
            this.leftPiece.setAlpha(originalAlpha);
            this.rightPiece.setAlpha(originalAlpha);
          }
        });
      }
    } else {
      // Flash the original sprite
      const originalAlpha = this.sprite.alpha;
      
      // Flash brighter
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 1,
        duration: 50,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          this.sprite.setAlpha(originalAlpha);
        }
      });
    }
  }
  
  // Animation for when a normal block is hit
  playNormalHitAnimation() {
    if (this.broken) {
      // Flash the pieces
      if (this.leftPiece && this.rightPiece) {
        const originalTint = this.leftPiece.tint;
        
        // Flash red
        this.leftPiece.setTint(0xff0000);
        this.rightPiece.setTint(0xff0000);
        
        // Then to white
        this.scene.time.delayedCall(80, () => {
          this.leftPiece.setTint(0xffffff);
          this.rightPiece.setTint(0xffffff);
          
          // Finally back to normal
          this.scene.time.delayedCall(80, () => {
            this.leftPiece.setTint(originalTint);
            this.rightPiece.setTint(originalTint);
          });
        });
      }
    } else {
      // Flash the original sprite
      const originalTint = this.sprite.tint;
      
      // Flash red
      this.sprite.setTint(0xff0000);
      
      // Then to white
      this.scene.time.delayedCall(80, () => {
        this.sprite.setTint(0xffffff);
        
        // Back to red
        this.scene.time.delayedCall(80, () => {
          this.sprite.setTint(0xff0000);
          
          // Finally back to normal
          this.scene.time.delayedCall(80, () => {
            this.sprite.setTint(originalTint);
          });
        });
      });
    }
  }
  
  // Special effect for successful (non-invulnerable) hits
  playSuccessfulHitEffect() {
    // Apply to either the main sprite or the broken pieces
    if (this.broken) {
      if (this.leftPiece && this.rightPiece) {
        // Store original scales
        const originalScaleX = this.leftPiece.scaleX;
        const originalScaleY = this.leftPiece.scaleY;
        
        // Create a sequence of scale changes for a "pulse" effect
        this.scene.tweens.add({
          targets: [this.leftPiece, this.rightPiece],
          scaleX: originalScaleX * 1.2,
          scaleY: originalScaleY * 1.2,
          duration: 100,
          yoyo: true,
          repeat: 1,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            // Ensure original scale is restored
            this.leftPiece.setScale(originalScaleX, originalScaleY);
            this.rightPiece.setScale(originalScaleX, originalScaleY);
          }
        });
        
        // Add an intense bright flash
        const originalTint = this.leftPiece.tint;
        
        // Bright yellow flash
        this.leftPiece.setTint(0xffff00);
        this.rightPiece.setTint(0xffff00);
        
        // Then to bright cyan
        this.scene.time.delayedCall(100, () => {
          this.leftPiece.setTint(0x00ffff);
          this.rightPiece.setTint(0x00ffff);
          
          // Back to normal
          this.scene.time.delayedCall(100, () => {
            this.leftPiece.setTint(originalTint);
            this.rightPiece.setTint(originalTint);
          });
        });
      }
    } else {
      // For intact blocks
      const originalScale = this.sprite.scale;
      
      // Pulse animation
      this.scene.tweens.add({
        targets: this.sprite,
        scaleX: originalScale * 1.2,
        scaleY: originalScale * 1.2,
        duration: 100,
        yoyo: true,
        repeat: 1,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          // Ensure original scale is restored
          this.sprite.setScale(originalScale);
        }
      });
      
      // Add a distinct color flash sequence different from the normal hit animation
      const originalTint = this.sprite.tint;
      
      // Bright yellow flash
      this.sprite.setTint(0xffff00);
      
      // Then to bright cyan
      this.scene.time.delayedCall(100, () => {
        this.sprite.setTint(0x00ffff);
        
        // Back to normal
        this.scene.time.delayedCall(100, () => {
          this.sprite.setTint(originalTint);
        });
      });
    }
  }
  
  destroy() {
    // Remove this block from all other blocks' dependencies
    if (this.scene.scopeBlockInstances) {
      this.scene.scopeBlockInstances.forEach(block => {
        if (block.dependencies.includes(this)) {
          block.removeDependency(this);
        }
      });
    }
    
    // Remove the block's text label
    this.textLabel.destroy();
    
    // Remove the pieces if they exist
    if (this.leftPiece) this.leftPiece.destroy();
    if (this.rightPiece) this.rightPiece.destroy();
    
    // Remove the block
    this.sprite.destroy();
  }
  
  static createBlockGroup(scene) {
    return scene.physics.add.group();
  }
  
  static updateBlocks(
    blocks,
    groupSpeed,
    groupDirection,
    justDropped,
    setGroupDirection,
    setJustDropped,
    handleBlockReachBottom
  ) {
    // Skip if no blocks
    if (blocks.length === 0) return;
    
    // Check if any block has reached the edge
    let reachedEdge = false;
    const gameWidth = blocks[0].scene.game.config.width;
    
    blocks.forEach(block => {
      // Check if block reached left or right edge
      if (
        (block.x <= 0 && groupDirection === -1) ||
        (block.x + block.width >= gameWidth && groupDirection === 1)
      ) {
        reachedEdge = true;
      }
      
      // Move block horizontally
      block.x += groupSpeed * groupDirection;
      
      // Update invulnerability status
      block.updateInvulnerableStatus();
    });
    
    // If a block reached the edge, change direction and drop blocks
    if (reachedEdge && !justDropped) {
      // Change direction
      setGroupDirection(-groupDirection);
      
      // Drop blocks
      blocks.forEach(block => {
        block.y += 20; // Drop by 20 pixels
        
        // Check if block reached the bottom of playable area
        if (block.y + block.height >= PLAYABLE_HEIGHT - 20) { // 20px buffer from bottom of playable area
          handleBlockReachBottom(block);
        }
      });
      
      // Set justDropped to true to prevent multiple drops
      setJustDropped(true);
    } else if (!reachedEdge) {
      // Reset justDropped when blocks are no longer at the edge
      setJustDropped(false);
    }
  }
  
  // Setup dependencies between blocks
  static setupDependencies(blocks, maxDependencies, dependencyChance) {
    // First, group blocks by their y-position (rows)
    const rowMap = new Map();
    
    blocks.forEach(block => {
      // Clear existing dependencies
      block.dependencies = [];
      
      // Group by y-position (with some tolerance for alignment variations)
      const roundedY = Math.round(block.y / 5) * 5; // Round to nearest 5 pixels
      if (!rowMap.has(roundedY)) {
        rowMap.set(roundedY, []);
      }
      rowMap.get(roundedY).push(block);
    });
    
    // For each row, create directional dependency chains
    rowMap.forEach(rowBlocks => {
      if (rowBlocks.length <= 1) {
        return; // Skip rows with only one block
      }
      
      // Sort blocks from left to right
      rowBlocks.sort((a, b) => a.x - b.x);
      
      // Randomly decide the primary dependency direction for this row
      // true = left-to-right, false = right-to-left
      const leftToRight = Math.random() < 0.5;
      
      // For each block, initialize its dependency direction property
      // 'none' = no dependencies, 'leftDep' = depends on blocks to its left, 'rightDep' = depends on blocks to its right
      rowBlocks.forEach(block => {
        block.dependencyDirection = 'none';
      });
      
      // Process blocks in order (either left-to-right or right-to-left)
      const blocksToProcess = leftToRight ? [...rowBlocks] : [...rowBlocks].reverse();
      
      blocksToProcess.forEach((block, index) => {
        // Skip first block (it has no blocks before it in the chosen direction)
        // And skip based on random chance
        if (index === 0 || Math.random() > dependencyChance) {
          return;
        }
        
        // Find adjacent blocks in the chosen direction
        let adjacentBlocks = [];
        
        if (leftToRight) {
          // Looking for adjacent blocks to the left
          adjacentBlocks = rowBlocks.filter(otherBlock => {
            // Check if block is directly to the left
            const isAdjacent = (otherBlock.x + otherBlock.width <= block.x) && 
                              (otherBlock.x + otherBlock.width + 20 >= block.x);
            
            return isAdjacent && otherBlock !== block;
          });
        } else {
          // Looking for adjacent blocks to the right
          adjacentBlocks = rowBlocks.filter(otherBlock => {
            // Check if block is directly to the right
            const isAdjacent = (block.x + block.width <= otherBlock.x) && 
                              (block.x + block.width + 20 >= otherBlock.x);
            
            return isAdjacent && otherBlock !== block;
          });
        }
        
        // Filter for blocks that maintain our directional chain rule
        const validDeps = adjacentBlocks.filter(dep => {
          // If we're going left-to-right:
          if (leftToRight) {
            // Only blocks with 'none' or 'leftDep' direction can be valid dependencies
            return dep.dependencyDirection !== 'rightDep';
          } else {
            // Only blocks with 'none' or 'rightDep' direction can be valid dependencies
            return dep.dependencyDirection !== 'leftDep';
          }
        });
        
        // If we found valid dependencies, select up to maxDependencies randomly
        if (validDeps.length > 0) {
          const shuffled = Phaser.Utils.Array.Shuffle([...validDeps]);
          const selectedDeps = shuffled.slice(0, Math.min(maxDependencies, shuffled.length));
          
          // Add dependencies and set direction
          if (selectedDeps.length > 0) {
            block.dependencyDirection = leftToRight ? 'leftDep' : 'rightDep';
            selectedDeps.forEach(dep => block.addDependency(dep));
          }
        }
        
        // Update visual appearance based on dependencies
        block.updateInvulnerableStatus();
      });
      
      // Clean up temporary property
      rowBlocks.forEach(block => {
        delete block.dependencyDirection;
      });
    });
  }
}

export default ScopeBlock; 