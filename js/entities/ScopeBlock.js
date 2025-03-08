// Import constants
import { BLOCK_COLORS, PLAYABLE_HEIGHT } from '../constants.js';

class ScopeBlock {
  constructor(scene, x, y, category) {
    this.scene = scene;
    this.category = category;
    
    // Determine block properties based on category
    const width = category === 'XXL' ? 80 : 50;
    const height = category === 'XXL' ? 40 : 30;
    // Store hits temporarily in a local variable instead of setting this.hitsRemaining directly
    const hits = category === 'S' ? 1 : 
                 category === 'M' ? 2 : 
                 category === 'L' ? 3 : 10; // XXL takes 10 hits
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
  }
  
  get x() {
    return this.sprite.x;
  }
  
  set x(value) {
    this.sprite.x = value;
    this.textLabel.x = value + this.width / 2;
  }
  
  get y() {
    return this.sprite.y;
  }
  
  set y(value) {
    this.sprite.y = value;
    this.textLabel.y = value + this.height / 2;
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
  
  hit() {
    // Decrease hits remaining
    this.hitsRemaining--;
    
    // Return true if block should be destroyed
    return this.hitsRemaining <= 0;
  }
  
  destroy() {
    // Remove the block's text label
    this.textLabel.destroy();
    
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
}

export default ScopeBlock; 