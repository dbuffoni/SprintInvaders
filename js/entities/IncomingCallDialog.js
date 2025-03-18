// Import constants and functions
import { CANVAS_WIDTH, PLAYABLE_HEIGHT, INCOMING_CALL_DIALOG_HEIGHT, GAME_STATES, BLOCK_WIDTH, START_Y, HEADER_HEIGHT } from '../constants.js';
import { getCharacter } from '../characters.js';
import ScopeBlock from './ScopeBlock.js';

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
    
    // Title box blinking properties
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.blinkDuration = 120; // 3 seconds at 60fps
    this.blinkInterval = 10; // Blink every quarter second at 60fps
    
    // Header text states
    this.headerTexts = {
      DEFAULT: "Sprint in progress",
      UFO: "Someone is trying to reach you out...",
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
    
    // Create UI elements for the incoming call dialog
    this.createBoardUI();
    
    // Initially show only the header
    this.showHeaderOnly();
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
    
    // Set the header text back to default if not active
    if (!this.active) {
      this.titleText.setText(this.headerTexts.DEFAULT);
      // Always reset color to default when showing default text
      this.titleBox.fillColor = 0x4b6584;
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
      const titleBoxColor = this.character.isEvil ? 0xC70039 : 0x2E8B57; // Crimson for evil, SeaGreen for good
      this.titleBox.fillColor = titleBoxColor;
    } else {
      this.titleBox.fillColor = 0x4b6584; // Default color
    }
  }
  
  // Set the header to UFO mode
  setUFOHeader() {
    if (!this.active) {
      this.titleText.setText(this.headerTexts.UFO);
      // Set an attention color for the UFO warning before starting to blink
      this.startBlinking();
    }
  }
  
  // Reset the header to default mode
  resetHeader() {
    if (!this.active) {
      this.stopBlinking();
      this.titleText.setText(this.headerTexts.DEFAULT);
      // Explicitly reset the color to default when resetting the header
      this.titleBox.fillColor = 0x4b6584;
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
    const titleBoxColor = character.isEvil ? 0xC70039 : 0x2E8B57; // Crimson for evil, SeaGreen for good
    this.titleBox.fillColor = titleBoxColor;
    
    // Store the current game state and set it to PAUSED
    this.previousGameState = this.scene.gameState;
    this.scene.gameState = GAME_STATES.PAUSED;
    console.log('Game state changed to PAUSED due to incoming call');
    
    // Pause the incoming call timer when the board is activated
    if (this.scene.incomingCallTimer && !this.scene.incomingCallTimer.paused) {
      this.scene.incomingCallTimer.paused = true;
      console.log('Paused incoming call timer');
    }
    
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
    
    // Show only the header instead of hiding the entire UI
    this.showHeaderOnly();
    
    // Stop any blinking
    this.stopBlinking();
    
    // Reset title text to default
    this.titleText.setText(this.headerTexts.DEFAULT);
    // Explicitly set the default color
    this.titleBox.fillColor = 0x4b6584;
    
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
        // Toggle between normal color and attention color
        if (this.titleBox.fillColor === 0x4b6584) {
          this.titleBox.fillColor = 0xe74c3c; // Attention color (red)
        } else {
          this.titleBox.fillColor = 0x4b6584; // Default color
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
        
        // Create a visual timer display to show when weapon will be unlocked
        const timerDisplay = this.scene.add.text(
          this.scene.cameras.main.width / 2,
          50,
          'WEAPON LOCKED: ' + lockDuration + 's',
          {
            font: '20px Arial',
            fill: '#FF0000',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
          }
        );
        timerDisplay.setOrigin(0.5, 0);
        timerDisplay.setDepth(1000);
        
        // Define an update function for the timer
        let countdown = lockDuration;
        const updateTimer = () => {
          countdown--;
          timerDisplay.setText('WEAPON LOCKED: ' + countdown + 's');
          
          // Check if countdown has reached zero
          if (countdown <= 0) {
            // Unlock the weapon
            this.scene.playerCanShoot = true;
            this.weaponLockActive = false;
            
            // Display an unlocked message briefly
            timerDisplay.setText('WEAPON UNLOCKED!');
            timerDisplay.setFill('#00FF00');
            
            // Remove the timer display after a brief delay
            this.scene.time.delayedCall(1000, () => {
              timerDisplay.destroy();
            });
          } else {
            // Continue the countdown
            this.scene.time.delayedCall(1000, updateTimer);
          }
        };
        
        // Start the countdown immediately
        updateTimer();
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
  
  // Method to apply the current effect - keep this method for compatibility
  applyEffect() {
    // This method is kept for compatibility but should now call applyEffectAfterClose
    console.log(`Calling applyEffect() has been deprecated - use applyEffectAfterClose() instead`);
    if (this.currentEffect) {
      this.applyEffectAfterClose(this.currentEffect);
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
    
    // Apply meeting rewards based on selected option when ending the meeting
    if (this.selectedMeetingOption) {
      if (this.selectedMeetingOption.correct) {
        // Correct answer: 80% chance to add 3 M Scope Blocks
        if (Math.random() < 0.8) {
          if (this.scene && this.scene.createBlocks) {
            console.log('Applying reward: Creating 3 M blocks for correct answer');
            this.scene.createBlocks('M', 3);
          }
        }
      } else {
        // Incorrect answer: 20% chance to add 3 XXL Scope Blocks
        if (Math.random() < 0.2) {
          if (this.scene && this.scene.createBlocks) {
            console.log('Applying penalty: Creating 3 XXL blocks for incorrect answer');
            this.scene.createBlocks('XXL', 3);
          }
        }
      }
      // Clear the selected option
      this.selectedMeetingOption = null;
    }
    
    this.scene.gameState = GAME_STATES.PLAYING;
    this.deactivate();
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
    this.titleBox.fillColor = 0x4b6584;
  }
  
  // Other methods like update(), deactivate(), etc. with the same logic but renamed references
  
  // Set a custom blinking header with specified message and duration
  setCustomBlinkingHeader(message, duration = 3000, color = 0xFF0000) {
    if (!this.active) {
      this.titleText.setText(message);
      // Set custom blinking parameters
      this.blinkDuration = duration / 16; // Convert to frames (assuming 60fps with 16ms per frame)
      this.blinkInterval = 10; // Blink every 10 frames
      this.customBlinkColor = color;
      this.startBlinking();
      
      // Set a timer to reset the header after duration
      this.scene.time.delayedCall(duration, () => {
        this.resetHeader();
      });
    }
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
        // Toggle between normal color and attention color
        if (this.titleBox.fillColor === 0x4b6584) {
          // Use custom color if defined, otherwise use default attention color
          this.titleBox.fillColor = this.customBlinkColor || 0xe74c3c; // Attention color
        } else {
          this.titleBox.fillColor = 0x4b6584; // Default color
        }
      }
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
    
    // Reset title text to default
    this.titleText.setText(this.headerTexts.DEFAULT);
    // Explicitly set the default color
    this.titleBox.fillColor = 0x4b6584;
    
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