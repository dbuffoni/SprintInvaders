class ScrumBoard {
  constructor() {
    this.active = false;
    this.character = null;
    this.message = "";
    this.effectTimer = 0;
    this.currentEffect = null;
    this.dialogueTree = null;
    this.dialoguePosition = 0;
    this.messageIndex = 0; // Track which message we're on
    this.messageTimer = 0; // Timer for random message appearances
    this.messageInterval = Math.floor(random(600, 1200)); // Random interval between 10-20 seconds (60fps)
    this.messageComplete = false; // Flag to track if current message has completed its effect
    this.countdownSeconds = 0; // Initialize countdown display
    this.pendingXXLBlock = false; // Flag to indicate that we need to create the XXL block
  }
  
  activate(character) {
    // Only activate if not already active
    if (this.active) return;
    
    this.active = true;
    this.character = character;
    
    // Use sequential messages instead of random
    this.message = character.messages[this.messageIndex];
    this.currentEffect = character.effects[this.messageIndex];
    this.effectTimer = 0;
    this.messageComplete = false;
    
    // Apply the effect
    this.applyEffect();
  }
  
  applyEffect() {
    switch(this.currentEffect) {
      case 'addXXLBlock':
        // Don't create the XXL block immediately
        // The block will be created when the player presses UP/DOWN ARROW or after countdown
        this.pendingXXLBlock = true;
        // Set a 4-second countdown timer (4 seconds × 60 frames per second)
        this.effectTimer = 4 * 60;
        this.countdownSeconds = 4; // Initialize countdown display
        break;
      case 'lockWeapon':
        // Lock the player's weapon for 8 seconds
        playerCanShoot = false;
        this.effectTimer = 8 * 60; // 8 seconds at 60 frames per second
        this.countdownSeconds = 8; // Initialize countdown display
        break;
      case 'meetingMode':
        // Enter meeting mode with dialogue tree
        this.dialogueTree = [
          "Can everyone introduce themselves?",
          "Let's revisit our project goals...",
          "I think we need another meeting to resolve this."
        ];
        this.dialoguePosition = 0;
        gameState = GAME_STATES.MEETING;
        // Note: meetingMode doesn't set messageComplete immediately
        // It will be set when advanceDialogue reaches the end of dialogueTree
        break;
    }
  }
  
  update() {
    // Handle effect timer for timed effects
    if (this.active && this.effectTimer > 0) {
      this.effectTimer--;
      
      // Update countdown display based on current effect
      if (this.currentEffect === 'lockWeapon' || this.currentEffect === 'addXXLBlock') {
        this.countdownSeconds = Math.ceil(this.effectTimer / 60);
      }
      
      // Handle timer expiration for different effects
      if (this.effectTimer === 0) {
        if (this.currentEffect === 'lockWeapon') {
          // When weapon lock timer expires, unlock weapon
          playerCanShoot = true;
          this.messageComplete = true;
        } else if (this.currentEffect === 'addXXLBlock' && this.pendingXXLBlock) {
          // When addXXLBlock timer expires, automatically create the block
          this.createXXLBlock();
          this.messageComplete = true;
        }
      }
    }
    
    // For addXXLBlock, we don't automatically mark it as complete
    // Instead, we wait for player to press UP/DOWN ARROW or for the timer to expire
    
    // Handle random message appearances during gameplay, but only if not in a wave transition
    if (gameState === GAME_STATES.PLAYING && !this.active && waveDelay === 0) {
      this.messageTimer++;
      if (this.messageTimer >= this.messageInterval) {
        this.activate(getCharacter('businessAnalyst'));
        this.messageTimer = 0;
        this.messageInterval = Math.floor(random(200, 800)); // New random interval
      }
    }
    
    // Auto-deactivate the message after a delay if it's complete
    // This ensures each message is shown on its own
    if (this.active && this.messageComplete && this.currentEffect !== 'meetingMode') {
      this.deactivate();
    }
  }
  
  deactivate() {
    // Move to the next message in sequence
    this.messageIndex = (this.messageIndex + 1) % this.character.messages.length;
    this.active = false;
    this.messageComplete = false;
  }
  
  advanceDialogue() {
    if (gameState !== GAME_STATES.MEETING) return;
    
    this.dialoguePosition++;
    if (this.dialoguePosition >= this.dialogueTree.length) {
      // Meeting over
      gameState = GAME_STATES.PLAYING;
      
      // Ensure player can shoot when meeting ends
      playerCanShoot = true;
      
      // Mark message as complete
      this.messageComplete = true;
    }
  }
  
  // Move to the next message/effect
  nextMessage() {
    if (gameState === GAME_STATES.MEETING) return;
    
    // If we have a pending XXL block, create it now
    if (this.pendingXXLBlock) {
      this.createXXLBlock();
    }
    
    // Mark current message as complete to trigger deactivation
    this.messageComplete = true;
    
    // Reset weapon lock if we're skipping to the next message
    if (this.currentEffect === 'lockWeapon') {
      playerCanShoot = true;
    }
  }
  
  // Helper function to draw wrapped text
  drawWrappedText(message, x, y, maxWidth, lineHeight) {
    const words = message.split(' ');
    let line = '';
    let posY = y;
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const testWidth = textWidth(testLine);
      
      if (testWidth > maxWidth && i > 0) {
        text(line, x, posY);
        line = words[i] + ' ';
        posY += lineHeight;
      } else {
        line = testLine;
      }
    }
    
    text(line, x, posY);
    return posY + lineHeight; // Return the y position after the last line
  }
  
  show() {
    // Always draw the scrum board background
    fill(50, 50, 70, 200); // Semi-transparent background
    rect(0, PLAYABLE_HEIGHT, CANVAS_WIDTH, SCRUM_BOARD_HEIGHT);
    
    // Draw the character and message
    fill(255);
    textSize(16);
    textAlign(LEFT, TOP);
    
    const maxTextWidth = CANVAS_WIDTH - 40; // 20px padding on each side
    const lineHeight = 24; // Line height for wrapped text
    
    if (gameState === GAME_STATES.MEETING) {
      // Draw wrapped text for meeting dialogue
      const message = `${this.character.name}: ${this.dialogueTree[this.dialoguePosition]}`;
      this.drawWrappedText(message, 20, PLAYABLE_HEIGHT + 20, maxTextWidth, lineHeight);
      text("Press UP/DOWN ARROW to continue...", CANVAS_WIDTH - 250, PLAYABLE_HEIGHT + 70);
    } else if (this.active) {
      // Draw wrapped text for character message
      const message = `${this.character.name}: ${this.message}`;
      const lastY = this.drawWrappedText(message, 20, PLAYABLE_HEIGHT + 20, maxTextWidth, lineHeight);
      
      // Show effect info
      if (this.currentEffect === 'lockWeapon' && this.effectTimer > 0) {
        text(`Weapon locked for ${this.countdownSeconds} seconds`, 20, lastY + 10);
      } else if (this.currentEffect === 'addXXLBlock' && this.effectTimer > 0) {
        text(`New block arrives in ${this.countdownSeconds} seconds`, 20, lastY + 10);
      }
      
      // Show prompt to continue for all BA messages
      text("Press UP/DOWN ARROW to continue...", CANVAS_WIDTH - 250, PLAYABLE_HEIGHT + 70);
    } else {
      // Show a default message when no character is active
      text("Scrum Board", 20, PLAYABLE_HEIGHT + 20);
      text("Sprint in progress...", 20, PLAYABLE_HEIGHT + 50);
    }
  }
  
  // Helper method to create an XXL block
  createXXLBlock() {
    // Add an XXL scope block centered horizontally and just below the existing blocks
    const centerX = CANVAS_WIDTH / 2 - BLOCK_WIDTH / 2;
    
    // Make sure we have at least one block
    if (scopeBlocks.length > 0) {
      const bottomBlock = scopeBlocks.reduce((lowest, block) => 
        block.y > lowest.y ? block : lowest, scopeBlocks[0]);
      const y = bottomBlock.y + V_SPACING;
      
      // Create the XXL block that will move with the other scope blocks
      const xxlBlock = new ScopeBlock(centerX, y, 'XXL');
      scopeBlocks.push(xxlBlock);
    } else {
      // If no blocks exist, create one near the top
      const y = START_Y + V_SPACING;
      const xxlBlock = new ScopeBlock(centerX, y, 'XXL');
      scopeBlocks.push(xxlBlock);
    }
    
    this.pendingXXLBlock = false;
  }
} 