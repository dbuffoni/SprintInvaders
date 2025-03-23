// Import constants and functions
import { CANVAS_WIDTH, PLAYABLE_HEIGHT, INCOMING_CALL_DIALOG_HEIGHT, GAME_STATES, BLOCK_WIDTH, BLOCK_HEIGHT, START_Y, HEADER_HEIGHT, BLOCK_COLORS, BULLET_SPEED, SCENES } from '../constants.js';
import { getCharacter } from '../characters.js';
import ScopeBlock from './ScopeBlock.js';

// Define color constants for consistent usage throughout the class
const COLORS = {
  DEFAULT: 0x4b6584,         // Default header background
  ATTENTION: 0xe74c3c,       // Red attention color
  SUCCESS: 0x004d00,         // Green success color
  WARNING: 0xFF9900,         // Orange warning color
  DANGER: 0xFF0000,          // Red danger color
  EVIL_CHARACTER: 0xC70039,  // Crimson for evil characters
  GOOD_CHARACTER: 0x2E8B57   // SeaGreen for good characters
};

class IncomingCallDialog {
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
    this.messageTimer = 0; // Kept for compatibility but not used for random activation anymore
    this.messageInterval = 0; // Set to 0 since we don't use random intervals anymore
    this.messageComplete = false; // Flag to track if current message has completed its effect
    this.countdownSeconds = 0; // Initialize countdown display
    this.pendingXXLBlock = false; // Flag to indicate that we need to create the XXL block
    this._blockBeingCreated = false; // Flag to prevent multiple XXL blocks being created simultaneously
    this.isStatusMessageActive = false; // Flag to track if a status message is currently active
    
    // Title box blinking properties
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.blinkDuration = 120; // 3 seconds at 60fps
    this.blinkInterval = 10; // Blink every quarter second at 60fps
    this.defaultColor = COLORS.DEFAULT;   // Default color for non-blinking state
    this.blinkColor = COLORS.ATTENTION;   // Color to blink to
    
    // Header text states
    this.headerTexts = {
      DEFAULT: "Sprint in progress",
      UFO: "[Character] is trying to reach you out...",
      CALL: "Incoming call"
    };
    
    // Meeting mode properties
    this.meetingQuestions = []; // Will store random selected questions
    this.currentQuestionIndex = 0;
    this.selectedOptionIndex = 0; // 0 for first option, 1 for second option
    this.answerMessageTimer = 0; // Timer for showing answer messages (3 seconds)
    this.showingAnswerMessage = false;
    this.waitingForKeyPress = false; // New flag to wait for key press to dismiss message
    this.waitingForMeetingStart = false; // New flag to wait for meeting start
    
    // Define a constant at the top of the file for the continuation message
    this.CONTINUE_MESSAGE = "Press UP/DOWN to continue";
    this.CONFIRM_MESSAGE = "Press UP/DOWN again to confirm selection";
    
    // Store weapon lock details
    this.weaponLockDuration = 8; // 8 seconds
    this.weaponLockActive = false;
    
    // Store bullet limit details
    this.bulletLimitActive = false;
    this.bulletLimitAmount = 5; // Player can shoot only 5 bullets before reloading
    this.bulletLimitDuration = 20; // 20 seconds total effect duration
    this.bulletLimitReloadTime = 3; // 3 seconds to reload
    
    // Store game speed details
    this.gameSpeedActive = false;
    this.gameSpeedFactor = 2.0; // 2x speed
    this.gameSpeedDuration = 15; // 15 seconds
    
    // Store unstable aim details
    this.unstableAimActive = false;
    this.unstableAimDuration = 10; // 10 seconds
    
    // Create UI elements for the incoming call dialog
    this.createBoardUI();
    
    // Initially show only the header
    this.showHeaderOnly();
  }
  
  // Centralized method for showing status messages for all effects
  showStatusMessage(options) {
    const {
      mainMessage, // Main status message text
      timerMessage, // Timer message format (will have seconds replaced)
      duration = 0, // Duration in seconds for the effect (0 for no timer) 
      completionMessage, // Message to show when timer completes
      headerColor = COLORS.DANGER, // Default color for header during effect 
      completionColor = COLORS.SUCCESS, // Color for the header when effect completes
      onUpdate, // Callback to run each second
      onComplete // Callback to run when timer completes
    } = options;
    
    // Store the original header text to restore later
    const originalHeaderText = this.titleText.text;
    const originalHeaderColor = this.titleBox.fillColor;
    
    // Set main message in the header
    if (mainMessage) {
      // Set the header text and start blinking
      this.titleText.setText(mainMessage);
      this.defaultColor = originalHeaderColor;
      this.blinkColor = headerColor;
      this.blinkDuration = (duration > 0) ? (duration * 60) : 240; // 4 seconds at 60fps if no duration
      this.blinkInterval = 10; // Blink every 10 frames
      this.startBlinking();
    }
    
    // Only create a timer display if we have a duration and timerMessage
    let timerText = null;
    if (duration > 0 && timerMessage) {
      // Create a timer text at the bottom of the screen
      timerText = this.scene.add.text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height - 50,
        timerMessage.replace('{duration}', duration),
        {
          font: '18px Arial',
          fill: '#FFFF00',
          stroke: '#000000',
          strokeThickness: 2,
          align: 'center'
        }
      );
      timerText.setOrigin(0.5, 0.5);
      timerText.setDepth(1000);
      
      // Setup countdown
      let timeRemaining = duration;
      
      const updateTimer = () => {
        timeRemaining--;
        
        // Update timer text
        if (timerText && timerText.active) {
          timerText.setText(timerMessage.replace('{duration}', timeRemaining));
        }
        
        // Run custom update logic if provided
        if (onUpdate) {
          onUpdate(timeRemaining);
        }
        
        if (timeRemaining <= 0) {
          // Show completion message in header if provided
          if (completionMessage) {
            this.stopBlinking();
            this.titleText.setText(completionMessage);
            this.titleBox.fillColor = completionColor;
            
            // Set a timer to reset the header after a delay
            this.scene.time.delayedCall(1500, () => {
              // Restore original header text and color
              this.titleText.setText(originalHeaderText);
              this.titleBox.fillColor = originalHeaderColor;
            });
          } else {
            // No completion message, just restore the original header
            this.titleText.setText(originalHeaderText);
            this.stopBlinking();
            this.titleBox.fillColor = originalHeaderColor;
          }
          
          // Destroy timer text
          if (timerText && timerText.active) {
            timerText.destroy();
          }
          
          // Run completion callback if provided
          if (onComplete) {
            onComplete();
          }
        } else {
          // Continue countdown
          this.scene.time.delayedCall(1000, updateTimer);
        }
      };
      
      // Start the timer
      this.scene.time.delayedCall(1000, updateTimer);
    } else if (mainMessage && !timerMessage) {
      // If we have only a main message without a timer, 
      // restore the header after a delay
      this.scene.time.delayedCall(3000, () => {
        this.titleText.setText(originalHeaderText);
        this.stopBlinking();
        this.titleBox.fillColor = originalHeaderColor;
      });
    }
    
    // Add a property to track this status message is active
    // This will help prevent other parts of the code from resetting the header
    this.isStatusMessageActive = true;
    
    // If there's a timer, clear the status message flag when timer completes
    if (duration > 0) {
      this.scene.time.delayedCall(duration * 1000 + 1500, () => {
        this.isStatusMessageActive = false;
      });
    } else {
      // For messages without a timer, clear after 3 seconds
      this.scene.time.delayedCall(3000, () => {
        this.isStatusMessageActive = false;
      });
    }
    
    // Return a simple object that can be used to reference the timer text
    return { timerText };
  }
  
  createBoardUI() {
    // Calculate position for the board at bottom of screen
    const boardY = PLAYABLE_HEIGHT;
    
    // Create a container for all incoming call dialog elements, including the header
    this.mainContainer = this.scene.add.container(0, PLAYABLE_HEIGHT);
    this.mainContainer.setDepth(1000);
    
    // Create background for the entire incoming call dialog (header + content)
    this.fullBackground = this.scene.add.rectangle(
      CANVAS_WIDTH / 2,
      0,
      CANVAS_WIDTH,
      INCOMING_CALL_DIALOG_HEIGHT,
      0x323246,
      0.9
    );
    this.fullBackground.setOrigin(0.5, 0);
    
    // Create a separate header background on top of the main background
    this.titleBox = this.scene.add.rectangle(
      0,
      0,
      CANVAS_WIDTH,
      HEADER_HEIGHT,
      0x4b6584, // Different color for the title box
      1
    );
    this.titleBox.setOrigin(0, 0);
    
    // Create title text centered in the title box with the default text
    this.titleText = this.scene.add.text(
      CANVAS_WIDTH / 2,
      HEADER_HEIGHT / 2,
      this.headerTexts.DEFAULT,
      {
        font: '18px Arial',
        fill: '#ffffff',
        fontWeight: 'bold'
      }
    );
    this.titleText.setOrigin(0.5, 0.5);
    
    // Calculate the top position for content
    const contentTop = HEADER_HEIGHT + 20; // Start content below header with some padding
    
    // Create text for the character name
    this.characterText = this.scene.add.text(
      20, 
      contentTop, 
      "", 
      { 
        font: '16px Arial', 
        fill: '#ffffff',
        fontWeight: 'bold'
      }
    );
    
    // Create text for the message
    this.messageText = this.scene.add.text(
      20, 
      contentTop + 35, 
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
      contentTop + 100, 
      "", 
      { 
        font: '14px Arial', 
        fill: '#ffffff'
      }
    );
    
    // Create text for the prompt
    this.promptText = this.scene.add.text(
      20, 
      INCOMING_CALL_DIALOG_HEIGHT - 30, 
      "", 
      { 
        font: '14px Arial', 
        fill: '#ffffff'
      }
    );
    this.promptText.setOrigin(0, 0.5); // Align left
    
    // Create option texts (initially hidden)
    this.optionAText = this.scene.add.text(
      40, 
      contentTop + 60, 
      "A)", 
      { 
        font: '14px Arial', 
        fill: '#ffffff',
        wordWrap: { width: CANVAS_WIDTH - 80 }
      }
    );
    this.optionAText.setVisible(false);
    
    this.optionBText = this.scene.add.text(
      40, 
      contentTop + 85, 
      "B)", 
      { 
        font: '14px Arial', 
        fill: '#ffffff',
        wordWrap: { width: CANVAS_WIDTH - 80 }
      }
    );
    this.optionBText.setVisible(false);
    
    // Create selection indicator (arrow)
    this.selectionIndicator = this.scene.add.text(
      25, 
      contentTop + 60, 
      "➤", 
      { 
        font: '14px Arial', 
        fill: '#ffff00'
      }
    );
    this.selectionIndicator.setVisible(false);
    
    // Add all UI elements to the container
    this.mainContainer.add([
      this.fullBackground,
      this.titleBox,
      this.titleText,
      this.characterText,
      this.messageText,
      this.effectText,
      this.promptText,
      this.optionAText,
      this.optionBText,
      this.selectionIndicator
    ]);
  }
  
  // Show only the header part of the dialog
  showHeaderOnly() {
    // Make sure the container is visible
    this.mainContainer.setVisible(true);
    
    // Only show the header elements, hide the full background
    this.titleBox.setVisible(true);
    this.titleText.setVisible(true);
    this.fullBackground.setVisible(false);
    
    // Set the header text back to default if not active and no status message is showing
    if (!this.active && !this.isStatusMessageActive) {
      this.titleText.setText(this.headerTexts.DEFAULT);
      // Always reset color to default when showing default text
      this.titleBox.fillColor = COLORS.DEFAULT;
    }
    
    // Hide content elements
    this.characterText.setVisible(false);
    this.messageText.setVisible(false);
    this.effectText.setVisible(false);
    this.promptText.setVisible(false);
    this.optionAText.setVisible(false);
    this.optionBText.setVisible(false);
    this.selectionIndicator.setVisible(false);
    
    // Position the container at the top of the screen with only the header showing
    this.mainContainer.setY(PLAYABLE_HEIGHT);
  }
  
  // Show the entire dialog with all content
  show() {
    // Make everything visible
    this.mainContainer.setVisible(true);
    this.titleBox.setVisible(true);
    this.titleText.setVisible(true);
    this.fullBackground.setVisible(true);
    this.characterText.setVisible(true);
    this.messageText.setVisible(true);
    this.promptText.setVisible(true);
    
    // Option texts are controlled separately
    
    // Move the container to show the full dialog
    this.mainContainer.setY(PLAYABLE_HEIGHT - INCOMING_CALL_DIALOG_HEIGHT + HEADER_HEIGHT);
  }
  
  // Hide the entire dialog
  hide() {
    // Hide the container
    this.mainContainer.setVisible(false);
  }
  
  // Start blinking animation for the title box
  startBlinking() {
    this.isBlinking = true;
    this.blinkTimer = 0;
  }
  
  // Stop blinking animation
  stopBlinking() {
    this.isBlinking = false;
    
    // Reset to the character's color if a character is active, otherwise use default
    if (this.character) {
      const titleBoxColor = this.character.isEvil ? COLORS.EVIL_CHARACTER : COLORS.GOOD_CHARACTER;
      this.titleBox.fillColor = titleBoxColor;
    } else {
      this.titleBox.fillColor = COLORS.DEFAULT;
    }
  }
  
  // Make all active incoming calls disappear with a shrinking effect
  shrinkAllActiveCalls() {
    // Check if scene and incomingCalls array exists
    if (this.scene && this.scene.incomingCalls && this.scene.incomingCalls.length > 0) {
      console.log(`Shrinking ${this.scene.incomingCalls.length} active incoming calls`);
      
      // Create a copy of the array to avoid modification during iteration
      const activeCalls = [...this.scene.incomingCalls];
      
      // Apply shrinking effect to each call
      activeCalls.forEach(call => {
        if (call && call.sprite && call.sprite.active) {
          // Create shrinking animation
          this.scene.tweens.add({
            targets: call.sprite,
            scale: 0,
            alpha: 0,
            duration: 500, // Half second shrink
            ease: 'Power2',
            onComplete: () => {
              // Remove the call
              call.destroy();
            }
          });
        }
      });
      
      // Clear the incomingCalls array since we're destroying all of them
      this.scene.incomingCalls = [];
    }
  }
  
  // Set the header to UFO mode
  setUFOHeader() {
    if (!this.active) {
      // Use default message if no UFO character is set
      let ufoCharacterName = "Someone";
      
      // Check if there's an active UFO with a character
      if (this.scene.ufos && this.scene.ufos.length > 0) {
        const ufo = this.scene.ufos[0];
        if (ufo && ufo.character) {
          ufoCharacterName = ufo.character.name;
        }
      }
      
      // Replace placeholder with character name
      const ufoMessage = this.headerTexts.UFO.replace("[Character]", ufoCharacterName);
      this.titleText.setText(ufoMessage);
      
      // Set an attention color for the UFO warning before starting to blink
      this.startBlinking();
    }
  }
  
  // Reset the header to default mode
  resetHeader() {
    // Only reset the header if there's no active status message
    if (!this.active && !this.isStatusMessageActive) {
      this.stopBlinking();
      this.titleText.setText(this.headerTexts.DEFAULT);
      // Explicitly reset the color to default when resetting the header
      this.titleBox.fillColor = COLORS.DEFAULT;
    }
  }
  
  activate(character) {
    // Check if the board is visually active (not just the flag)
    const isVisuallyActive = this.mainContainer && this.mainContainer.visible && 
                            this.mainContainer.y < PLAYABLE_HEIGHT;
    
    console.log(`IncomingCallDialog activation requested. active flag: ${this.active}, visually active: ${isVisuallyActive}`);
    
    // If the board is flagged as active but not visually active, there might be a state mismatch
    if (this.active && !isVisuallyActive) {
      console.log('Detected IncomingCallDialog state mismatch. Forcing deactivation first.');
      this.forceDeactivate();
    }
    
    // Only activate if not already active
    if (this.active) {
      console.log('IncomingCallDialog activation failed: already active');
      return;
    }
    
    console.log(`Activating IncomingCallDialog with character: ${character.name}`);
    this.active = true;
    this.character = character;
    
    // Set the title text to CALL
    this.titleText.setText(this.headerTexts.CALL);
    
    // Change the title box color based on whether the character is good or evil
    const titleBoxColor = character.isEvil ? COLORS.EVIL_CHARACTER : COLORS.GOOD_CHARACTER;
    this.titleBox.fillColor = titleBoxColor;
    
    // Store the current game state and set it to PAUSED
    this.previousGameState = this.scene.gameState;
    
    // Stop block physics movement by saving current velocities and setting them to zero
    // This prevents blocks from having unexpected movement when dialog opens
    if (this.scene.scopeBlockInstances && this.scene.scopeBlockInstances.length > 0) {
      this.scene.scopeBlockInstances.forEach(block => {
        if (block && block.sprite && block.sprite.body) {
          // Save current velocity for restoration later
          block.sprite._savedVelocityX = block.sprite.body.velocity.x;
          block.sprite._savedVelocityY = block.sprite.body.velocity.y;
          // Set velocity to zero
          block.sprite.body.velocity.x = 0;
          block.sprite.body.velocity.y = 0;
          // Also prevent any bouncing or odd physics interactions
          block.sprite.body.bounce.set(0);
        }
        
        // Also handle broken pieces
        if (block.broken) {
          if (block.leftPiece && block.leftPiece.body) {
            block.leftPiece._savedVelocityX = block.leftPiece.body.velocity.x;
            block.leftPiece._savedVelocityY = block.leftPiece.body.velocity.y;
            block.leftPiece.body.velocity.x = 0;
            block.leftPiece.body.velocity.y = 0;
            block.leftPiece.body.bounce.set(0);
          }
          if (block.rightPiece && block.rightPiece.body) {
            block.rightPiece._savedVelocityX = block.rightPiece.body.velocity.x;
            block.rightPiece._savedVelocityY = block.rightPiece.body.velocity.y;
            block.rightPiece.body.velocity.x = 0;
            block.rightPiece.body.velocity.y = 0;
            block.rightPiece.body.bounce.set(0);
          }
        }
      });
    }
    
    // Now set the game state to PAUSED
    this.scene.gameState = GAME_STATES.PAUSED;
    console.log('Game state changed to PAUSED due to incoming call');
    
    // Remove all bugs from the playable area
    if (this.scene.bugs && this.scene.bugs.length > 0) {
      console.log(`Removing ${this.scene.bugs.length} bugs due to dialogue opening`);
      
      // Loop through bugs array and destroy each bug
      for (let i = this.scene.bugs.length - 1; i >= 0; i--) {
        const bug = this.scene.bugs[i];
        if (bug && bug.sprite) {
          // Just destroy the bug without showing explosion effect
          bug.sprite.destroy();
        }
      }
      
      // Clear the bugs array
      this.scene.bugs = [];
    }
    
    // Pause the incoming call timer when the board is activated
    if (this.scene.incomingCallTimer && !this.scene.incomingCallTimer.paused) {
      this.scene.incomingCallTimer.paused = true;
      console.log('Paused incoming call timer');
    }
    
    // Make all active incoming calls disappear with a shrinking effect
    this.shrinkAllActiveCalls();
    
    // Log that incoming calls won't be generated while board is active
    console.log('IncomingCallDialog activated, incoming calls will not be generated');
    
    // Check if we have an override message index from secret developer mode
    const overrideIndex = this.scene.registry.get('overrideMessageIndex');
    
    // Randomize message selection instead of sequential
    let randomIndex;
    if (overrideIndex !== undefined && overrideIndex >= 0 && overrideIndex < character.messages.length) {
      randomIndex = overrideIndex;
      console.log(`Dev Mode: Using override message index ${overrideIndex}`);
    } else {
      randomIndex = Phaser.Math.Between(0, character.messages.length - 1);
      console.log(`Randomly selected message index: ${randomIndex}`);
    }
    
    this.messageIndex = randomIndex;
    this.message = character.messages[this.messageIndex];
    this.currentEffect = character.effects[this.messageIndex];
    console.log(`Selected message: "${this.message}" with effect: ${this.currentEffect}`);
    
    this.effectTimer = 0;
    this.messageComplete = false;
    
    // Update the display
    this.characterText.setText(character.name);
    this.messageText.setText(this.message);
    
    // Reset option visibility
    this.optionAText.setVisible(false);
    this.optionBText.setVisible(false);
    this.selectionIndicator.setVisible(false);
    
    // Handle meeting setup if this is a meeting effect
    if (this.currentEffect === 'meeting') {
      // Setup meeting mode
      this.setupMeetingMode();
      
      // Show meeting start prompt
      this.promptText.setText(this.CONTINUE_MESSAGE);
      this.waitingForMeetingStart = true;
    } else {
      // For non-meeting effects, show the normal continue prompt
      this.promptText.setText(this.CONTINUE_MESSAGE);
      
      // REMOVED: No longer apply effects immediately during activation
      // All effects will now be applied only when the dialog closes
    }
    
    // Start blinking animation for title (attention grabbing)
    this.startBlinking();
    
    // Show the UI
    this.show();
    
    return true;
  }
  
  // ... rest of the methods would continue here with IncomingCallDialog instead of ScrumBoard
  
  // Other methods like update(), deactivate(), etc. with the same logic but renamed references
  
  // Force deactivate method that's referenced in the code
  forceDeactivate() {
    console.log('Force deactivating IncomingCallDialog to reset its state');
    
    // Reset all state variables
    this.active = false;
    this.character = null;
    this.message = "";
    this.effectTimer = 0;
    this.currentEffect = null;
    this.dialogueTree = null;
    this.dialoguePosition = 0;
    this.messageComplete = false;
    this.waitingForKeyPress = false;
    this.waitingForMeetingStart = false;
    this.meetingQuestions = [];
    this.currentQuestionIndex = 0;
    this.selectedOptionIndex = 0;
    this.showingAnswerMessage = false;
    this.weaponLockActive = false;
    this._blockBeingCreated = false; // Reset block creation flag
    
    // Don't reset status message flag here, as that could interrupt active effects
    // Status messages should expire on their own based on their timers
    
    // Restore block velocities if they were saved
    if (this.scene.scopeBlockInstances && this.scene.scopeBlockInstances.length > 0) {
      this.scene.scopeBlockInstances.forEach(block => {
        if (block && block.sprite && block.sprite.body) {
          // Only restore if there are saved velocities
          if (block.sprite._savedVelocityX !== undefined) {
            block.sprite.body.velocity.x = block.sprite._savedVelocityX;
            block.sprite._savedVelocityX = undefined;
          }
          if (block.sprite._savedVelocityY !== undefined) {
            block.sprite.body.velocity.y = block.sprite._savedVelocityY;
            block.sprite._savedVelocityY = undefined;
          }
        }
        
        // Also handle broken pieces
        if (block.broken) {
          if (block.leftPiece && block.leftPiece.body) {
            if (block.leftPiece._savedVelocityX !== undefined) {
              block.leftPiece.body.velocity.x = block.leftPiece._savedVelocityX;
              block.leftPiece._savedVelocityX = undefined;
            }
            if (block.leftPiece._savedVelocityY !== undefined) {
              block.leftPiece.body.velocity.y = block.leftPiece._savedVelocityY;
              block.leftPiece._savedVelocityY = undefined;
            }
          }
          if (block.rightPiece && block.rightPiece.body) {
            if (block.rightPiece._savedVelocityX !== undefined) {
              block.rightPiece.body.velocity.x = block.rightPiece._savedVelocityX;
              block.rightPiece._savedVelocityX = undefined;
            }
            if (block.rightPiece._savedVelocityY !== undefined) {
              block.rightPiece.body.velocity.y = block.rightPiece._savedVelocityY;
              block.rightPiece._savedVelocityY = undefined;
            }
          }
        }
      });
    }
    
    // Show only the header instead of hiding the entire UI
    this.showHeaderOnly();
    
    // Stop any blinking
    this.stopBlinking();
    
    // Reset title text to default only if no status message is active
    if (!this.isStatusMessageActive) {
      this.titleText.setText(this.headerTexts.DEFAULT);
      // Explicitly set the default color
      this.titleBox.fillColor = COLORS.DEFAULT;
    }
    
    // Restore the previous game state if it exists, otherwise set it to PLAYING
    if (this.previousGameState) {
      this.scene.gameState = this.previousGameState;
      console.log(`Game state restored to ${this.previousGameState}`);
    } else {
      this.scene.gameState = GAME_STATES.PLAYING;
      console.log('Game state set back to PLAYING');
    }
    
    // Resume the incoming call timer if it exists and is paused
    if (this.scene.incomingCallTimer && this.scene.incomingCallTimer.paused) {
      this.scene.incomingCallTimer.paused = false;
      console.log('Resumed incoming call timer');
    }
    
    console.log('IncomingCallDialog force deactivated, incoming calls will now be generated again');
  }
  
  // Basic update method to handle the dialog's logic
  update() {
    // If the dialog is active, update it
    if (this.active) {
      // Check if visually active
      const isVisuallyActive = this.mainContainer && 
                            this.mainContainer.visible && 
                            this.mainContainer.y < PLAYABLE_HEIGHT;
      
      // If there's a state mismatch (active but not visually active), force deactivate
      if (!isVisuallyActive) {
        console.log('Detected IncomingCallDialog state mismatch in update loop. Forcing deactivation.');
        this.forceDeactivate();
        return;
      }
      
      // Update effects
      this.updateEffects();
      
      // Update blinking animation
      this.updateBlinking();
    }
  }
  
  // Update any active effects
  updateEffects() {
    // Implement specific effect updates here
    // This would be a placeholder until we know what effects need to be updated
  }
  
  // Update the blinking animation for the title
  updateBlinking() {
    if (this.isBlinking) {
      this.blinkTimer++;
      
      if (this.blinkTimer >= this.blinkDuration) {
        // Stop blinking after duration
        this.stopBlinking();
        return;
      }
      
      // Blink every blinkInterval frames
      if (this.blinkTimer % this.blinkInterval === 0) {
        // Toggle between default and blink colors
        if (this.titleBox.fillColor === this.defaultColor) {
          this.titleBox.fillColor = this.blinkColor;
        } else {
          this.titleBox.fillColor = this.defaultColor;
        }
      }
    }
  }
  
  // Method to handle advancing to the next message
  nextMessage() {
    console.log('Advancing to next message');
    
    // Check if there is an effect to apply and it hasn't been applied yet
    if (this.currentEffect && !this.messageComplete) {
      console.log(`Closing dialogue before applying effect '${this.currentEffect}'`);
      
      // Store the current effect and character for later use
      const effectToApply = this.currentEffect;
      const effectCharacter = this.character;
      
      // Mark message as complete before deactivating
      this.messageComplete = true;
      
      // First deactivate the dialog (but keep a reference to the scene)
      const gameScene = this.scene;
      this.deactivate();
      
      // After dialog is closed, apply the effect with a short delay
      gameScene.time.delayedCall(100, () => {
        // Apply the effect
        console.log(`Applying effect: ${effectToApply}`);
        this.applyEffectAfterClose(effectToApply);
        
        // For 'lockWeapon' effect, emit dialogClosed event to start countdown
        if (effectToApply === 'lockWeapon') {
          gameScene.events.emit('dialogClosed');
          console.log('Dialog closed event emitted for weapon lock countdown');
        }
        
        // Reset the header after a short duration
        gameScene.time.delayedCall(2000, () => {
          this.resetHeader();
        });
      });
    } else {
      // No effect to apply or already applied, just deactivate
      this.deactivate();
    }
  }
  
  // New method to apply effects after the dialog is closed
  applyEffectAfterClose(effectName) {
    // Handle different effect types
    switch (effectName) {
      case 'meeting':
        // Meeting effect is handled separately through setupMeetingMode
        console.log('Meeting effect will be handled through meeting mode setup');
        break;
        
      case 'lockWeapon':
        // Implement weapon lock effect
        this.scene.playerCanShoot = false;
        this.weaponLockActive = true;
        const lockDuration = this.weaponLockDuration;
        console.log('Weapon locked for ' + lockDuration + ' seconds');
        
        // Use the centralized status message display
        this.showStatusMessage({
          mainMessage: 'DON\'T KNOW WHAT TO DO: ' + lockDuration + 's',
          timerMessage: 'COMMIT LOCKED: {duration}s',
          duration: lockDuration,
          completionMessage: 'COMMIT UNLOCKED!',
          headerColor: COLORS.WARNING, // Orange color for speed effect
          completionColor: COLORS.SUCCESS, // Green color for completion
          onComplete: () => {
            // Unlock the weapon
            this.scene.playerCanShoot = true;
            this.weaponLockActive = false;
          }
        });
        break;
        
      case 'addXXLBlock':
        // Create the XXL block immediately to avoid timing issues
        console.log('Creating XXL block after dialog closed');
        // Add a short-term flag to prevent double calls during the same dialog interaction
        if (this.scene && this.scene.createBlock && !this._blockBeingCreated) {
          this._blockBeingCreated = true;
          this.scene.createBlocks('XXL',1);
          
          // Clear the flag after a short delay
          this.scene.time.delayedCall(500, () => {
            this._blockBeingCreated = false;
          });
        }
        break;
        
      // New effects for the Manager character
      case 'speedupGame':
        // Speed up the game for a limited time
        if (this.scene) {
          console.log('Speeding up the game');
          
          // Store original speed
          const originalSpeed = this.scene.groupSpeed;
          
          // Speed up the game
          this.gameSpeedActive = true;
          this.scene.groupSpeed *= this.gameSpeedFactor;
          
          // Use the centralized status message display
          this.showStatusMessage({
            mainMessage: `CEO'S EYES ON YOU!`,
            timerMessage: '{duration}s',
            duration: this.gameSpeedDuration,
            completionMessage: 'CEO FORGOT YOUR NAME!',
            headerColor: COLORS.WARNING, // Orange color for speed effect
            completionColor: COLORS.SUCCESS, // Green color for completion
            onComplete: () => {
              // Restore original speed
              this.scene.groupSpeed = originalSpeed;
              this.gameSpeedActive = false;
            }
          });
        }
        break;
        
      case 'unstableAim':
        // Replace with new effect: randomize bullet trajectory
        if (this.scene) {
          console.log('Activating randomized bullet trajectory effect');
          
          try {
            // Store the original shoot function
            if (!this.scene._originalShoot) {
              this.scene._originalShoot = this.scene.shoot;
            }
            
            // Define the effect duration
            const effectDuration = this.unstableAimDuration; // Use the property from class
            
            // Set the effect as active
            this.unstableAimActive = true;
            
            // Override the shoot function with one that randomizes trajectory
            this.scene.shoot = () => {
              if (this.scene.playerCanShoot && !this.scene.reloading) {
                // Get a bullet from the bullet pool or create a new one
                const bullet = this.scene.bullets.get();
                if (bullet) {
                  // Generate a random angle between -30 and 30 degrees
                  const randomAngle = Phaser.Math.Between(-30, 30);
                  
                  // Need to explicitly create a bullet texture
                  if (!this.scene.textures.exists('bullet')) {
                    const graphics = this.scene.add.graphics();
                    graphics.fillStyle(0xFFFF00, 1); // BULLET_COLOR from constants
                    graphics.fillRect(0, 0, 5, 10); // BULLET_WIDTH, BULLET_HEIGHT from constants
                    graphics.generateTexture('bullet', 5, 10);
                    graphics.destroy();
                  }
                  
                  // Properly set up the bullet
                  bullet.setActive(true);
                  bullet.setVisible(true);
                  bullet.setTexture('bullet');
                  
                  // Position the bullet at the player's position
                  bullet.setPosition(this.scene.player.x + 15, this.scene.player.y - 20);
                  
                  // Convert to radians and adjust the angle for upward movement
                  const angleRadians = Phaser.Math.DegToRad(270 + randomAngle);
                  
                  // Set the bullet velocity based on the random angle
                  // Using trigonometry to calculate x and y components
                  const speed = 400; // Standard bullet speed
                  bullet.setVelocity(
                    Math.cos(angleRadians) * speed,
                    Math.sin(angleRadians) * speed
                  );
                  
                  // Update bullet count if bullet limit is active
                  if (this.bulletLimitActive) {
                    this.scene.bulletCount--;
                    if (this.scene.ammoDisplay) {
                      this.scene.ammoDisplay.setText(`AMMO: ${this.scene.bulletCount}/${this.bulletLimitAmount}`);
                    }
                    
                    // Check if we're out of ammo
                    if (this.scene.bulletCount === 0 && this.startReload) {
                      this.startReload();
                    }
                  }
                }
              }
            };
            
            // Use the centralized status message display
            this.showStatusMessage({
              mainMessage: 'FOCUS THE MINDSET!',
              timerMessage: '{duration}s',
              duration: effectDuration,
              completionMessage: 'MINDSET STABILIZED!',
              headerColor: COLORS.DANGER, // Darker red for focus warning
              completionColor: COLORS.SUCCESS, // Green color for completion
              onComplete: () => {
                // Restore original shoot function
                if (this.scene && this.scene._originalShoot) {
                  this.scene.shoot = this.scene._originalShoot;
                  this.scene._originalShoot = null;
                }
                
                // Set the effect as inactive
                this.unstableAimActive = false;
              }
            });
          } catch (error) {
            console.error('Error in randomized trajectory effect:', error);
            // Try to restore original shoot function if there was an error
            if (this.scene && this.scene._originalShoot) {
              this.scene.shoot = this.scene._originalShoot;
              this.scene._originalShoot = null;
            }
            // Make sure to reset the flag even in case of error
            this.unstableAimActive = false;
          }
        }
        break;
      
      case 'limitBullets':
        // Completely refactored limitBullets effect with new features
        if (this.scene) {
          console.log('Activating refactored limitBullets effect');
          
          // Define constants for the new effect
          const EFFECT_DURATION = 15; // 15 seconds as requested
          const BULLET_SLOWDOWN_FACTOR = 0.2; // Bullets are 60% of normal speed
          const RETURNING_BULLET_CHANCE = 0.3; // 30% chance to return
          const RETURN_DELAY_MIN = 0.5; // Min seconds before a bullet returns
          const RETURN_DELAY_MAX = 2; // Max seconds before a bullet returns
          
          // Set flag to prevent incoming calls during this effect
          this.bulletLimitActive = true;
          
          // Use centralized status message for main notification
          this.showStatusMessage({
            mainMessage: `CONNECTION SLOWING DOWN!`,
            timerMessage: `{duration}s`,
            duration: EFFECT_DURATION,
            completionMessage: 'CONNECTION RESTORED!',
            headerColor: COLORS.WARNING, // Orange/amber color for warning
            completionColor: COLORS.SUCCESS, // Green for completion
          });
          
          // Store original functions we'll need to restore later
          const originalShootFunction = this.scene.shoot;
          const originalCreateBulletFunction = this.scene.createBullet;
          const originalBulletSpeed = BULLET_SPEED;
          
          // Override the createBullet function to make slower bullets
          this.scene.createBullet = (x, y) => {
            // Create a bullet using the original function
            const bullet = originalCreateBulletFunction.call(this.scene, x, y);
            
            // Slow down the bullet
            if (bullet && bullet.sprite && bullet.sprite.body) {
              // Get current velocity and slow it down
              const currentVelY = bullet.sprite.body.velocity.y;
              bullet.sprite.setVelocityY(currentVelY * BULLET_SLOWDOWN_FACTOR);
              
              // Chance to turn this bullet into a returning bullet
              if (Math.random() < RETURNING_BULLET_CHANCE) {
                // Calculate random delay before return
                const returnDelay = Phaser.Math.Between(
                  RETURN_DELAY_MIN * 1000, 
                  RETURN_DELAY_MAX * 1000
                );
                
                // Add a timer to make this bullet return after delay
                this.scene.time.delayedCall(returnDelay, () => {
                  // Make sure bullet still exists
                  if (bullet && bullet.sprite && bullet.sprite.active) {
                    console.log('Activating returning bullet!');
                    // Change bullet color to red to indicate danger
                    bullet.sprite.setTint(COLORS.DANGER);
                    
                    // Instead of directing toward player, use a randomized downward trajectory
                    // More limited angle range: only +/- 30 degrees from straight down
                    const randomAngle = Math.PI / 2 + Phaser.Math.FloatBetween(-Math.PI/6, Math.PI/6);
                    console.log(`Bullet returning with angle: ${randomAngle} (${randomAngle * 180 / Math.PI} degrees)`);
                    
                    // Set velocity based on angle (with some randomness in speed)
                    // Slower speed for easier dodging (60-80% of normal speed)
                    const returnSpeed = originalBulletSpeed * Phaser.Math.FloatBetween(0.6, 0.8);
                    // Log velocity values for debugging
                    console.log(`Setting return velocity: angle=${randomAngle}, speed=${returnSpeed}`);
                    bullet.sprite.setVelocity(
                      Math.cos(randomAngle) * returnSpeed,
                      Math.sin(randomAngle) * returnSpeed
                    );
                    
                    // Ensure bullet physics body is enabled
                    if (bullet.sprite.body) {
                      bullet.sprite.body.enable = true;
                    }
                    
                    // Make the returning bullet collide with the player
                    if (!bullet.isReturning) {
                      bullet.isReturning = true;
                      
                      // Add this bullet to a special group for collision with player
                      // (if the group doesn't exist, create it)
                      if (!this.scene.returningBullets) {
                        this.scene.returningBullets = this.scene.physics.add.group();
                        
                        // Set up collision with player
                        this.scene.physics.add.collider(
                          this.scene.player.sprite,
                          this.scene.returningBullets,
                          (playerSprite, bulletSprite) => {
                            // Player hit by returning bullet
                            console.log('Player hit by returning bullet!');
                            
                            // Create explosion effect like SimpleBug
                            const particles = this.scene.add.particles(COLORS.DANGER);
                            
                            const emitter = particles.createEmitter({
                              speed: { min: 30, max: 80 },
                              angle: { min: 0, max: 360 },
                              scale: { start: 0.4, end: 0 },
                              lifespan: 500, // 500ms explosion duration
                              blendMode: 'ADD',
                              frequency: 0,
                              quantity: 20 // Number of particles
                            });
                            
                            // Emit particles at the bullet's position
                            emitter.explode(20, bulletSprite.x, bulletSprite.y);
                            
                            // Create visual indication of explosion
                            const explosionCircle = this.scene.add.circle(
                              bulletSprite.x, 
                              bulletSprite.y,
                              40, // Explosion radius
                              COLORS.DANGER,
                              0.3
                            );
                            
                            // Animate the circle to expand and fade
                            this.scene.tweens.add({
                              targets: explosionCircle,
                              alpha: 0,
                              scale: 1.5,
                              duration: 500,
                              onComplete: () => {
                                explosionCircle.destroy();
                                
                                // Destroy particles after their lifespan
                                this.scene.time.delayedCall(500, () => {
                                  particles.destroy();
                                });
                              }
                            });
                            
                            // Deduct one coffee cup from the player
                            if (this.scene.player.takeDamage) {
                              // Use the player's takeDamage method
                              this.scene.player.takeDamage();
                            } else if (this.scene.coffeeCups > 0) {
                              // Fallback to manual implementation
                              this.scene.coffeeCups--;
                              this.scene.updateCoffeeCupsDisplay();
                              
                              // Check for game over
                              if (this.scene.coffeeCups <= 0) {
                                this.scene.gameState = GAME_STATES.OVER;
                                this.scene.scene.launch(SCENES.GAME_OVER, { score: this.scene.score });
                                this.scene.scene.pause();
                              }
                            }
                            
                            // Destroy the bullet
                            bulletSprite.destroy();
                          }
                        );
                      }
                      
                      // Add to the returning bullets group
                      this.scene.returningBullets.add(bullet.sprite);
                      
                      // Add to our tracking array for continuous updates
                      if (!this.scene.returningBulletTrackers) {
                        this.scene.returningBulletTrackers = [];
                      }
                      this.scene.returningBulletTrackers.push({
                        sprite: bullet.sprite,
                        createdAt: this.scene.time.now
                      });
                      console.log(`Added bullet to returning trackers. Total: ${this.scene.returningBulletTrackers.length}`);
                      
                      // Remove from regular bullets group to prevent hitting enemies
                      if (bullet.sprite && this.scene.bullets && this.scene.bullets.contains(bullet.sprite)) {
                        this.scene.bullets.remove(bullet.sprite);
                      }
                      
                      // Add a delayed check to verify the bullet is actually moving
                      this.scene.time.delayedCall(500, () => {
                        if (bullet && bullet.sprite && bullet.sprite.active && bullet.sprite.body) {
                          const vx = bullet.sprite.body.velocity.x;
                          const vy = bullet.sprite.body.velocity.y;
                          console.log(`Bullet velocity check after 500ms: vx=${vx}, vy=${vy}`);
                          
                          // If bullet velocity is too low, force it to move again
                          if (Math.abs(vx) < 10 && Math.abs(vy) < 10) {
                            console.log("Bullet not moving! Forcing velocity again with direct approach.");
                            
                            // Force a new downward trajectory with constrained angle
                            const forcedAngle = Math.PI / 2 + Phaser.Math.FloatBetween(-Math.PI/6, Math.PI/6);
                            const forcedSpeed = returnSpeed * 1.2; // Slightly faster but still manageable
                            
                            bullet.sprite.body.setVelocity(
                              Math.cos(forcedAngle) * forcedSpeed,
                              Math.sin(forcedAngle) * forcedSpeed
                            );
                            console.log(`Forced new velocity with angle ${forcedAngle * 180 / Math.PI} degrees`);
                          }
                        }
                      });
                    }
                  }
                });
              }
            }
            
            return bullet;
          };
          
          // Block incoming calls during this effect by temporarily overriding
          // the createIncomingCall function to do nothing
          this.originalCreateIncomingCall = this.scene.createIncomingCall;
          this.scene.createIncomingCall = (x, y, characterType) => {
            console.log('Blocking incoming call during limitBullets effect');
            return null;
          };
          
          // Create a tracking object for returning bullets
          this.scene.returningBulletTrackers = [];
          
          // Setup a periodic update function to keep the bullets moving toward the player
          const updateReturningBullets = () => {
            if (this.scene && this.scene.returningBulletTrackers) {
              // Process each returning bullet
              for (let i = this.scene.returningBulletTrackers.length - 1; i >= 0; i--) {
                const tracker = this.scene.returningBulletTrackers[i];
                
                if (tracker && tracker.sprite && tracker.sprite.active && tracker.sprite.body) {
                  // Check if bullet has reached the bottom of the screen
                  if (tracker.sprite.y > this.scene.cameras.main.height) {
                    // Destroy the bullet when it goes off-screen at the bottom
                    tracker.sprite.destroy();
                    // Remove from tracker array
                    this.scene.returningBulletTrackers.splice(i, 1);
                    console.log("Bullet reached bottom border and was destroyed");
                  }
                  // Randomly change direction occasionally (10% chance per update)
                  else if (Math.random() < 0.05) {
                    // Apply a small random angle adjustment
                    // Smaller angle adjustment (+/- 15 degrees instead of +/- 17 degrees)
                    const randomAngle = Phaser.Math.FloatBetween(-0.25, 0.25);
                    // Slower speed for random direction changes
                    const speed = originalBulletSpeed * 0.6;
                    const currentVelX = tracker.sprite.body.velocity.x;
                    const currentVelY = tracker.sprite.body.velocity.y;
                    
                    // Calculate current angle
                    const currentAngle = Math.atan2(currentVelY, currentVelX);
                    
                    // Apply random adjustment to angle while keeping it within +/- 30 degrees of down
                    let newAngle = currentAngle + randomAngle;
                    
                    // Enforce angle limits: must stay between 60 and 120 degrees (down ±30°)
                    const minAllowedAngle = Math.PI / 3; // 60 degrees
                    const maxAllowedAngle = 2 * Math.PI / 3; // 120 degrees
                    
                    // If outside allowed range, clamp it
                    if (newAngle < minAllowedAngle) {
                      newAngle = minAllowedAngle;
                    } else if (newAngle > maxAllowedAngle) {
                      newAngle = maxAllowedAngle;
                    }
                    
                    // Set new velocity based on adjusted angle
                    tracker.sprite.body.setVelocity(
                      Math.cos(newAngle) * speed,
                      Math.sin(newAngle) * speed
                    );
                    console.log(`Bullet path randomized. New angle: ${newAngle}`);
                  }
                } else {
                  // Remove invalid trackers
                  this.scene.returningBulletTrackers.splice(i, 1);
                }
              }
            }
            
            // Continue updating if effect is still active
            if (this.bulletLimitActive) {
              this.scene.time.delayedCall(500, updateReturningBullets);
            }
          };
          
          // Start the update loop
          updateReturningBullets();
          
          // Use a delayed call to restore original functions when effect ends
          this.scene.time.delayedCall(EFFECT_DURATION * 1000, () => {
            // Remove bullet limit flag
            this.bulletLimitActive = false;
            
            // Restore original functions
            this.scene.shoot = originalShootFunction;
            this.scene.createBullet = originalCreateBulletFunction;
            
            // Restore original createIncomingCall function
            if (this.originalCreateIncomingCall) {
              this.scene.createIncomingCall = this.originalCreateIncomingCall;
              this.originalCreateIncomingCall = null;
            }
            
            // Clean up returning bullets group if it exists
            if (this.scene.returningBullets) {
              // Clear existing physics colliders with the group
              this.scene.physics.world.colliders.getActive()
                .filter(collider => 
                  collider.object1 === this.scene.returningBullets || 
                  collider.object2 === this.scene.returningBullets
                )
                .forEach(collider => collider.destroy());
                
              // Destroy any remaining bullets in the group
              this.scene.returningBullets.clear(true, true);
            }
            
            // Clear tracking array
            if (this.scene.returningBulletTrackers) {
              console.log(`Clearing ${this.scene.returningBulletTrackers.length} tracked returning bullets`);
              this.scene.returningBulletTrackers = [];
            }
          });
        }
        break;
        
      // New effects for the Stageur character
      case 'addCoffee':
        // Add a coffee cup (extra life)
        if (this.scene) {
          console.log('Adding coffee cup (extra life)');
          this.scene.coffeeCups = Math.min(this.scene.coffeeCups + 1, 5); // Max 5 coffee cups
          this.scene.updateCoffeeCupsDisplay();
          
          // Show a visual notification
          const coffeeText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            100,
            '☕ COFFEE ADDED! ☕',
            {
              font: '22px Arial',
              fill: '#00FF00',
              stroke: '#000000',
              strokeThickness: 3,
              align: 'center'
            }
          );
          coffeeText.setOrigin(0.5, 0.5);
          coffeeText.setDepth(1000);
          
          // Fade out and destroy the text after a short duration
          this.scene.tweens.add({
            targets: coffeeText,
            alpha: 0,
            y: 50,
            duration: 2000,
            onComplete: () => coffeeText.destroy()
          });
        }
        break;
      
      case 'cleanCode':
        // Remove some small blocks from the board
        if (this.scene) {
          console.log('Cleaning code - removing some small (S) blocks');
          
          // Find all small blocks
          const smallBlocks = this.scene.scopeBlockInstances.filter(block => 
            block && block.active && block.category === 'S' && !block.hasActiveDependencies());
          
          // Remove up to 3 small blocks if available
          const blocksToRemove = Math.min(smallBlocks.length, 3);
          for (let i = 0; i < blocksToRemove; i++) {
            if (smallBlocks[i]) {
              smallBlocks[i].destroy();
            }
          }
          
          // Show a visual notification
          const cleanText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            100,
            `CODE CLEANED! REMOVED ${blocksToRemove} BLOCKS`,
            {
              font: '22px Arial',
              fill: '#00FF00',
              stroke: '#000000',
              strokeThickness: 3,
              align: 'center'
            }
          );
          cleanText.setOrigin(0.5, 0.5);
          cleanText.setDepth(1000);
          
          // Fade out and destroy the text after a short duration
          this.scene.tweens.add({
            targets: cleanText,
            alpha: 0,
            y: 50,
            duration: 2000,
            onComplete: () => cleanText.destroy()
          });
        }
        break;
      
      case 'fixBugs':
        // Remove a random medium or large block
        if (this.scene) {
          console.log('Fixing bugs - removing one medium or large block');
          
          // Find all medium and large blocks
          const buggyBlocks = this.scene.scopeBlockInstances.filter(block => 
            block && block.active && (block.category === 'M' || block.category === 'L') && !block.hasActiveDependencies());
          
          // Remove one block if available
          if (buggyBlocks.length > 0) {
            // Select a random block to remove
            const randomIndex = Math.floor(Math.random() * buggyBlocks.length);
            const targetBlock = buggyBlocks[randomIndex];
            
            if (targetBlock) {
              targetBlock.destroy();
              
              // Show a visual notification
              const bugFixText = this.scene.add.text(
                this.scene.cameras.main.width / 2,
                100,
                `BUG FIXED! REMOVED ${targetBlock.category} BLOCK`,
                {
                  font: '22px Arial',
                  fill: '#00FF00',
                  stroke: '#000000',
                  strokeThickness: 3,
                  align: 'center'
                }
              );
              bugFixText.setOrigin(0.5, 0.5);
              bugFixText.setDepth(1000);
              
              // Fade out and destroy the text after a short duration
              this.scene.tweens.add({
                targets: bugFixText,
                alpha: 0,
                y: 50,
                duration: 2000,
                onComplete: () => bugFixText.destroy()
              });
            }
          }
        }
        break;
        
      default:
        console.log(`Unknown effect: ${effectName}`);
        break;
    }
  }
  
  // Method to handle dialogue advancement
  advanceDialogue(keyPressed) {
    console.log(`Advancing dialogue with key: ${keyPressed}`);
    
    // If waiting for meeting to start, initiate the meeting
    if (this.waitingForMeetingStart) {
      console.log('Starting meeting mode');
      this.waitingForMeetingStart = false;
      this.scene.gameState = GAME_STATES.MEETING;
      
      // Display the first question if available
      if (this.meetingQuestions.length > 0) {
        this.displayCurrentQuestion();
      } else {
        console.error('No meeting questions available, ending meeting');
        this.endMeeting();
      }
      return;
    }
    
    // If showing an answer message, continue to next question or end meeting
    if (this.showingAnswerMessage) {
      this.showingAnswerMessage = false;
      this.answerMessageTimer = 0;
      
      // End the meeting (since we now only have 1 question)
      this.endMeeting();
      return;
    }
    
    // Handle option selection - directly select based on key press
    if (this.scene.gameState === GAME_STATES.MEETING) {
      let selectedOption;
      const currentQuestion = this.meetingQuestions[this.currentQuestionIndex];
      
      // Select option directly based on which key was pressed
      if (keyPressed === 'UP') {
        selectedOption = currentQuestion.options[0];
        this.selectedOptionIndex = 0;
      } else if (keyPressed === 'DOWN') {
        selectedOption = currentQuestion.options[1];
        this.selectedOptionIndex = 1;
      } else {
        // If any other key was pressed, ignore it
        return;
      }
      
      // Display the answer message
      this.messageText.setText(selectedOption.message);
      this.showingAnswerMessage = true;
      this.optionAText.setVisible(false);
      this.optionBText.setVisible(false);
      this.promptText.setText("Press UP/DOWN to continue");
      
      // Store the selected option for later application
      this.selectedMeetingOption = selectedOption;
      
      // No longer apply rewards immediately - they'll be applied when the dialog closes
    }
  }
  
  // Helper method to display the current question
  displayCurrentQuestion() {
    const currentQuestion = this.meetingQuestions[this.currentQuestionIndex];
    this.messageText.setText(currentQuestion.question);
    
    // Display options with button indicators instead of selection toggle
    this.optionAText.setText("Press UP: " + currentQuestion.options[0].text);
    this.optionAText.setVisible(true);
    
    this.optionBText.setText("Press DOWN: " + currentQuestion.options[1].text);
    this.optionBText.setVisible(true);
    
    // Remove selection indicator/toggle
    this.selectionIndicator.setVisible(false);
    
    // Update prompt to indicate direct selection with keys
    this.promptText.setText("Press UP or DOWN to select an option");
  }
  
  // Helper method to update the selection indicator position - No longer needed but kept for compatibility
  updateSelectionIndicator() {
    // This function is now a no-op since we removed the selection toggle
    // Kept for compatibility with existing code calling this method
  }
  
  // Helper method to end the meeting
  endMeeting() {
    console.log('Meeting ended, returning to playing state');
    
    // Store selected option before deactivating
    const selectedOption = this.selectedMeetingOption;
    this.selectedMeetingOption = null;
    
    // Store reference to scene before deactivating
    const gameScene = this.scene;
    
    // Change game state and deactivate dialog first
    this.scene.gameState = GAME_STATES.PLAYING;
    this.deactivate();
    
    // Apply meeting rewards based on selected option after dialog is closed
    if (selectedOption) {
      gameScene.time.delayedCall(100, () => {
        if (selectedOption.correct) {
          // Correct answer: 80% chance to add 3 M Scope Blocks
          if (Math.random() < 0.8) {
            if (gameScene && gameScene.createBlocks) {
              console.log('Applying reward: Creating 3 M blocks for correct answer');
              gameScene.createBlocks('M', 3);
            }
          }
        } else {
          // Incorrect answer: 20% chance to add 3 XXL Scope Blocks
          if (Math.random() < 0.2) {
            if (gameScene && gameScene.createBlocks) {
              console.log('Applying penalty: Creating 3 XXL blocks for incorrect answer');
              gameScene.createBlocks('XXL', 3);
            }
          }
        }
      });
    }
  }
  
  // Method to set up meeting mode
  setupMeetingMode() {
    console.log('Setting up meeting mode');
    
    // Get meeting questions from the character
    if (this.character && this.character.meetingQuestions) {
      // Shuffle the questions and pick 1 (changed from 3)
      const shuffledQuestions = Phaser.Utils.Array.Shuffle([...this.character.meetingQuestions]);
      this.meetingQuestions = shuffledQuestions.slice(0, 1); // Only pick 1 question
      this.currentQuestionIndex = 0;
      this.selectedOptionIndex = 0;
      
      console.log(`Selected ${this.meetingQuestions.length} question for meeting mode`);
    } else {
      console.error('Character has no meeting questions defined');
      // Fallback to empty array
      this.meetingQuestions = [];
    }
  }
  
  // Method to reset for a new sprint
  resetForNewSprint() {
    console.log('IncomingCallDialog reset for new sprint, incoming calls should be generated normally');
    // Reset any sprint-specific state
    this.forceDeactivate();
    
    // Ensure header text is reset to default
    this.titleText.setText(this.headerTexts.DEFAULT);
    this.stopBlinking();
    // Ensure color is reset to default
    this.titleBox.fillColor = COLORS.DEFAULT;
  }
  
  // Other methods like update(), deactivate(), etc. with the same logic but renamed references
  
  // Set a custom blinking header with specified message and duration
  setCustomBlinkingHeader(message, duration = 3000, color = COLORS.DANGER) {
    if (!this.active) {
      this.titleText.setText(message);
      // Set custom blinking parameters
      this.blinkDuration = duration / 16; // Convert to frames (assuming 60fps with 16ms per frame)
      this.blinkInterval = 10; // Blink every 10 frames
      this.defaultColor = COLORS.DEFAULT;
      this.blinkColor = color;
      this.startBlinking();
      
      // Set a timer to reset the header after duration
      this.scene.time.delayedCall(duration, () => {
        this.resetHeader();
      });
    }
  }
  
  // Method to deactivate the dialog normally
  deactivate() {
    console.log('Deactivating IncomingCallDialog normally');
    
    // Similar to forceDeactivate but might have some different behavior
    this.active = false;
    
    // Show only the header instead of hiding the entire UI
    this.showHeaderOnly();
    
    // Stop any blinking
    this.stopBlinking();
    
    // Reset title text to default only if no status message is active
    if (!this.isStatusMessageActive) {
      this.titleText.setText(this.headerTexts.DEFAULT);
      // Explicitly set the default color
      this.titleBox.fillColor = COLORS.DEFAULT;
    }
    
    // Restore the previous game state if it exists, otherwise set it to PLAYING
    if (this.previousGameState) {
      this.scene.gameState = this.previousGameState;
      console.log(`Game state restored to ${this.previousGameState}`);
    } else {
      this.scene.gameState = GAME_STATES.PLAYING;
      console.log('Game state set back to PLAYING');
    }
    
    // Restore block velocities if they were saved
    if (this.scene.scopeBlockInstances && this.scene.scopeBlockInstances.length > 0) {
      this.scene.scopeBlockInstances.forEach(block => {
        if (block && block.sprite && block.sprite.body) {
          // Only restore if there are saved velocities
          if (block.sprite._savedVelocityX !== undefined) {
            block.sprite.body.velocity.x = block.sprite._savedVelocityX;
            block.sprite._savedVelocityX = undefined;
          }
          if (block.sprite._savedVelocityY !== undefined) {
            block.sprite.body.velocity.y = block.sprite._savedVelocityY;
            block.sprite._savedVelocityY = undefined;
          }
        }
        
        // Also handle broken pieces
        if (block.broken) {
          if (block.leftPiece && block.leftPiece.body) {
            if (block.leftPiece._savedVelocityX !== undefined) {
              block.leftPiece.body.velocity.x = block.leftPiece._savedVelocityX;
              block.leftPiece._savedVelocityX = undefined;
            }
            if (block.leftPiece._savedVelocityY !== undefined) {
              block.leftPiece.body.velocity.y = block.leftPiece._savedVelocityY;
              block.leftPiece._savedVelocityY = undefined;
            }
          }
          if (block.rightPiece && block.rightPiece.body) {
            if (block.rightPiece._savedVelocityX !== undefined) {
              block.rightPiece.body.velocity.x = block.rightPiece._savedVelocityX;
              block.rightPiece._savedVelocityX = undefined;
            }
            if (block.rightPiece._savedVelocityY !== undefined) {
              block.rightPiece.body.velocity.y = block.rightPiece._savedVelocityY;
              block.rightPiece._savedVelocityY = undefined;
            }
          }
        }
      });
    }
    
    // Resume the incoming call timer if it exists and is paused
    if (this.scene.incomingCallTimer && this.scene.incomingCallTimer.paused) {
      this.scene.incomingCallTimer.paused = false;
      console.log('Resumed incoming call timer');
    }
    
    // If weapon lock effect was active, ensure the countdown is properly synchronized
    if (this.currentEffect === 'lockWeapon' && this.weaponLockActive) {
      this.scene.events.emit('dialogClosed');
      console.log('Emitted dialogClosed event during deactivation for weapon lock');
    }
    
    console.log('IncomingCallDialog deactivated, incoming calls will now be generated again');
  }
  
  // The last line should be:
  // export default IncomingCallDialog;
}

export default IncomingCallDialog; 