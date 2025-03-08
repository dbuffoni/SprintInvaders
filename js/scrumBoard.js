class ScrumBoard {
  constructor(scene) {
    this.scene = scene;
    this.active = false;
    this.character = null;
    this.message = "";
    this.effectTimer = 0;
    this.currentEffect = null;
    this.dialogueTree = null;
    this.dialoguePosition = 0;
    this.messageIndex = 0; // Track which message we're on
    this.messageTimer = 0; // Timer for random message appearances
    this.messageInterval = Phaser.Math.Between(600, 1200); // Random interval between 10-20 seconds (60fps)
    this.messageComplete = false; // Flag to track if current message has completed its effect
    this.countdownSeconds = 0; // Initialize countdown display
    this.pendingXXLBlock = false; // Flag to indicate that we need to create the XXL block
    
    // Create UI elements for the scrum board
    this.createBoardUI();
  }
  
  createBoardUI() {
    // Create a background rectangle for the scrum board
    this.background = this.scene.add.rectangle(
      0, 
      PLAYABLE_HEIGHT, 
      CANVAS_WIDTH, 
      SCRUM_BOARD_HEIGHT, 
      0x323246, 
      0.8
    );
    this.background.setOrigin(0, 0);
    
    // Create text for the character name
    this.characterText = this.scene.add.text(
      20, 
      PLAYABLE_HEIGHT + 20, 
      "Scrum Board", 
      { 
        font: '16px Arial', 
        fill: '#ffffff',
        fontWeight: 'bold'
      }
    );
    
    // Create text for the message
    this.messageText = this.scene.add.text(
      20, 
      PLAYABLE_HEIGHT + 50, 
      "Sprint in progress...", 
      { 
        font: '16px Arial', 
        fill: '#ffffff',
        wordWrap: { width: CANVAS_WIDTH - 40 }
      }
    );
    
    // Create text for effect info
    this.effectText = this.scene.add.text(
      20, 
      PLAYABLE_HEIGHT + 75, 
      "", 
      { 
        font: '14px Arial', 
        fill: '#ffffff'
      }
    );
    
    // Create text for the prompt
    this.promptText = this.scene.add.text(
      CANVAS_WIDTH - 250, 
      PLAYABLE_HEIGHT + 70, 
      "", 
      { 
        font: '14px Arial', 
        fill: '#ffffff'
      }
    );
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
    
    // Update the UI
    this.characterText.setText(this.character.name + ":");
    this.messageText.setText(this.message);
    this.promptText.setText("Press UP/DOWN ARROW to continue...");
    
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
        this.effectText.setText(`New block arrives in ${this.countdownSeconds} seconds`);
        break;
      case 'lockWeapon':
        // Lock the player's weapon for 8 seconds
        this.scene.playerCanShoot = false;
        this.effectTimer = 8 * 60; // 8 seconds at 60 fps
        this.countdownSeconds = 8; // Initialize countdown display
        this.effectText.setText(`Weapon locked for ${this.countdownSeconds} seconds`);
        break;
      case 'meetingMode':
        // Enter meeting mode with dialogue tree
        this.dialogueTree = [
          "Can everyone introduce themselves?",
          "Let's revisit our project goals...",
          "I think we need another meeting to resolve this."
        ];
        this.dialoguePosition = 0;
        this.scene.gameState = GAME_STATES.MEETING;
        this.messageText.setText(this.dialogueTree[this.dialoguePosition]);
        this.effectText.setText("");
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
        
        if (this.currentEffect === 'lockWeapon') {
          this.effectText.setText(`Weapon locked for ${this.countdownSeconds} seconds`);
        } else if (this.currentEffect === 'addXXLBlock') {
          this.effectText.setText(`New block arrives in ${this.countdownSeconds} seconds`);
        }
      }
      
      // Handle timer expiration for different effects
      if (this.effectTimer === 0) {
        if (this.currentEffect === 'lockWeapon') {
          // When weapon lock timer expires, unlock weapon
          this.scene.playerCanShoot = true;
          this.effectText.setText("");
          this.messageComplete = true;
        } else if (this.currentEffect === 'addXXLBlock' && this.pendingXXLBlock) {
          // When addXXLBlock timer expires, automatically create the block
          this.createXXLBlock();
          this.effectText.setText("");
          this.messageComplete = true;
        }
      }
    }
    
    // Handle random message appearances during gameplay, but only if not in a wave transition
    if (this.scene.gameState === GAME_STATES.PLAYING && !this.active && this.scene.waveDelay === 0) {
      this.messageTimer++;
      if (this.messageTimer >= this.messageInterval) {
        this.activate(getCharacter('businessAnalyst'));
        this.messageTimer = 0;
        this.messageInterval = Phaser.Math.Between(200, 800); // New random interval
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
    
    // Reset UI elements
    this.characterText.setText("Scrum Board");
    this.messageText.setText("Sprint in progress...");
    this.effectText.setText("");
    this.promptText.setText("");
  }
  
  advanceDialogue() {
    if (this.scene.gameState !== GAME_STATES.MEETING) return;
    
    this.dialoguePosition++;
    if (this.dialoguePosition >= this.dialogueTree.length) {
      // Meeting over
      this.scene.gameState = GAME_STATES.PLAYING;
      
      // Ensure player can shoot when meeting ends
      this.scene.playerCanShoot = true;
      
      // Mark message as complete
      this.messageComplete = true;
    } else {
      // Update the message text to the next dialogue
      this.messageText.setText(this.dialogueTree[this.dialoguePosition]);
    }
  }
  
  // Move to the next message/effect
  nextMessage() {
    if (this.scene.gameState === GAME_STATES.MEETING) return;
    
    // If we have a pending XXL block, create it now
    if (this.pendingXXLBlock) {
      this.createXXLBlock();
    }
    
    // Mark current message as complete to trigger deactivation
    this.messageComplete = true;
    
    // Reset weapon lock if we're skipping to the next message
    if (this.currentEffect === 'lockWeapon') {
      this.scene.playerCanShoot = true;
      this.effectText.setText("");
    }
  }
  
  // This method is kept for compatibility, but doesn't do anything in Phaser
  // since the UI is always visible
  show() {
    // No need to do anything here as UI elements are always visible
  }
  
  // Helper method to create an XXL block
  createXXLBlock() {
    // Add an XXL scope block centered horizontally and just below the existing blocks
    const centerX = CANVAS_WIDTH / 2 - BLOCK_WIDTH / 2;
    
    // Make sure we have at least one block
    if (this.scene.scopeBlocks.getChildren().length > 0) {
      // Find the lowest block
      let bottomY = 0;
      this.scene.scopeBlocks.getChildren().forEach(block => {
        if (block.y > bottomY) {
          bottomY = block.y;
        }
      });
      
      const y = bottomY + V_SPACING;
      
      // Create the XXL block
      this.scene.createScopeBlock(centerX, y, 'XXL');
    } else {
      // If no blocks exist, create one near the top
      const y = START_Y + V_SPACING;
      this.scene.createScopeBlock(centerX, y, 'XXL');
    }
    
    this.pendingXXLBlock = false;
  }
} 