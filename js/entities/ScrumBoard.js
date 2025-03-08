// Import constants and functions
import { CANVAS_WIDTH, PLAYABLE_HEIGHT, SCRUM_BOARD_HEIGHT, GAME_STATES, BLOCK_WIDTH, START_Y } from '../constants.js';
import { getCharacter } from '../characters.js';
import ScopeBlock from './ScopeBlock.js';

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
    
    // Title box blinking properties
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.blinkDuration = 180; // 3 seconds at 60fps
    this.blinkInterval = 15; // Blink every quarter second at 60fps
    
    // Meeting mode properties
    this.meetingQuestions = []; // Will store random selected questions
    this.currentQuestionIndex = 0;
    this.selectedOptionIndex = 0; // 0 for first option, 1 for second option
    this.answerMessageTimer = 0; // Timer for showing answer messages (3 seconds)
    this.showingAnswerMessage = false;
    
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
    
    // Create title box with a different background color
    this.titleBox = this.scene.add.rectangle(
      0,
      PLAYABLE_HEIGHT,
      CANVAS_WIDTH,
      30,
      0x4b6584, // Different color for the title box
      1
    );
    this.titleBox.setOrigin(0, 0);
    
    // Create title text centered in the title box
    this.titleText = this.scene.add.text(
      CANVAS_WIDTH / 2,
      PLAYABLE_HEIGHT + 15,
      "SCRUM BOARD",
      {
        font: '18px Arial',
        fill: '#ffffff',
        fontWeight: 'bold'
      }
    );
    this.titleText.setOrigin(0.5, 0.5);
    
    // Create text for the character name - Adjust position to be below title box
    this.characterText = this.scene.add.text(
      20, 
      PLAYABLE_HEIGHT + 45, 
      "", 
      { 
        font: '16px Arial', 
        fill: '#ffffff',
        fontWeight: 'bold'
      }
    );
    
    // Create text for the message - Adjusted position for more space
    this.messageText = this.scene.add.text(
      20, 
      PLAYABLE_HEIGHT + 75, 
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
      PLAYABLE_HEIGHT + 100, 
      "", 
      { 
        font: '14px Arial', 
        fill: '#ffffff'
      }
    );
    
    // Create text for the prompt - Adjusted position
    this.promptText = this.scene.add.text(
      CANVAS_WIDTH - 250, 
      PLAYABLE_HEIGHT + 150, 
      "", 
      { 
        font: '14px Arial', 
        fill: '#ffffff'
      }
    );
    
    // Create option texts (initially hidden) - Adjusted positions
    this.optionAText = this.scene.add.text(
      40, 
      PLAYABLE_HEIGHT + 100, 
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
      PLAYABLE_HEIGHT + 130, 
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
      PLAYABLE_HEIGHT + 100, 
      "➤", 
      { 
        font: '14px Arial', 
        fill: '#ffff00'
      }
    );
    this.selectionIndicator.setVisible(false);
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
        // Enter meeting mode with selection of 3 random questions
        this.setupMeetingMode();
        this.scene.gameState = GAME_STATES.MEETING;
        this.effectText.setText("");
        // Note: meetingMode doesn't set messageComplete immediately
        // It will be set when the meeting is completed
        break;
    }
  }
  
  setupMeetingMode() {
    // Disable shooting during meeting
    this.scene.playerCanShoot = false;
    
    // Select 3 random questions from the business analyst's question pool
    // First, make a copy of all questions to avoid modifying the original
    const allQuestions = [...this.character.meetingQuestions];
    this.meetingQuestions = [];
    
    // Select 3 random questions
    for (let i = 0; i < 3 && allQuestions.length > 0; i++) {
      const randomIndex = Phaser.Math.Between(0, allQuestions.length - 1);
      this.meetingQuestions.push(allQuestions.splice(randomIndex, 1)[0]);
    }
    
    // Set the current question index
    this.currentQuestionIndex = 0;
    this.selectedOptionIndex = 0;
    this.answerMessageTimer = 0;
    this.showingAnswerMessage = false;
    
    // Display the first question
    this.displayCurrentQuestion();
  }
  
  displayCurrentQuestion() {
    const currentQuestion = this.meetingQuestions[this.currentQuestionIndex];
    
    // Hide standard message elements
    this.messageText.setVisible(false);
    
    // Update question and options
    this.messageText.setText(currentQuestion.question);
    this.messageText.setVisible(true);
    
    // Reset text styles to default
    this.optionAText.setStyle({ font: '14px Arial', fill: '#ffffff', wordWrap: { width: CANVAS_WIDTH - 80 } });
    this.optionBText.setStyle({ font: '14px Arial', fill: '#ffffff', wordWrap: { width: CANVAS_WIDTH - 80 } });
    
    // Show options - change A) and B) to UP and DOWN
    this.optionAText.setText(`Press UP for: ${currentQuestion.options[0].text}`);
    this.optionBText.setText(`Press DOWN for: ${currentQuestion.options[1].text}`);
    this.optionAText.setVisible(true);
    this.optionBText.setVisible(true);
    
    // Reset and position the selection indicator - initially hidden
    this.selectedOptionIndex = -1; // No selection initially
    this.selectionIndicator.setVisible(false);
    
    // Update prompt text
    this.promptText.setText("Press UP or DOWN to select your answer");
  }
  
  updateSelectionIndicator() {
    // Reset both options to default style
    this.optionAText.setStyle({ font: '14px Arial', fill: '#ffffff', wordWrap: { width: CANVAS_WIDTH - 80 } });
    this.optionBText.setStyle({ font: '14px Arial', fill: '#ffffff', wordWrap: { width: CANVAS_WIDTH - 80 } });
    
    // Highlight the selected option
    if (this.selectedOptionIndex === 0) {
      // First option (UP) selected
      this.optionAText.setStyle({ font: '14px Arial', fill: '#ffff00', wordWrap: { width: CANVAS_WIDTH - 80 } });
      
      // Position the indicator next to the first option
      this.selectionIndicator.setY(PLAYABLE_HEIGHT + 100);
      this.selectionIndicator.setVisible(true);
    } else if (this.selectedOptionIndex === 1) {
      // Second option (DOWN) selected
      this.optionBText.setStyle({ font: '14px Arial', fill: '#ffff00', wordWrap: { width: CANVAS_WIDTH - 80 } });
      
      // Position the indicator next to the second option
      this.selectionIndicator.setY(PLAYABLE_HEIGHT + 130);
      this.selectionIndicator.setVisible(true);
    }
  }
  
  advanceDialogue(keyType) {
    if (this.scene.gameState !== GAME_STATES.MEETING) return;
    
    if (this.currentEffect === 'meetingMode') {
      if (this.showingAnswerMessage) return;
      
      // Set the option index directly based on which key was pressed
      // UP = option A (index 0), DOWN = option B (index 1)
      this.selectedOptionIndex = (keyType === 'UP') ? 0 : 1;
      this.updateSelectionIndicator();
      
      // Add a small delay before automatically selecting the option
      this.scene.time.delayedCall(200, () => {
        this.selectOption();
      });
    }
  }
  
  selectOption() {
    if (this.showingAnswerMessage) return;
    
    const currentQuestion = this.meetingQuestions[this.currentQuestionIndex];
    const selectedOption = currentQuestion.options[this.selectedOptionIndex];
    
    // Hide the selection indicator immediately to provide feedback
    this.selectionIndicator.setVisible(false);
    
    if (selectedOption.correct) {
      // Correct answer - move to next question
      this.currentQuestionIndex++;
      
      if (this.currentQuestionIndex >= this.meetingQuestions.length) {
        // Meeting completed successfully
        this.completeMeeting(true);
      } else {
        // Show next question
        this.displayCurrentQuestion();
      }
    } else {
      // Wrong answer - show message for 3 seconds
      this.showAnswerMessage(selectedOption.message);
    }
  }
  
  showAnswerMessage(message) {
    this.showingAnswerMessage = true;
    this.answerMessageTimer = 3 * 60; // 3 seconds at 60fps
    
    // Hide options and selection indicator
    this.optionAText.setVisible(false);
    this.optionBText.setVisible(false);
    this.selectionIndicator.setVisible(false);
    
    // Show the answer message
    this.messageText.setText(message);
    this.promptText.setText("");
  }
  
  completeMeeting(success) {
    // Hide meeting-specific UI
    this.optionAText.setVisible(false);
    this.optionBText.setVisible(false);
    this.selectionIndicator.setVisible(false);
    
    // Show completion message
    this.messageText.setText(success ? 
      "Great job! Meeting concluded successfully." : 
      "Meeting ended with unresolved issues.");
    
    // End meeting after a short delay
    this.effectTimer = 2 * 60; // 2 seconds at 60fps
    this.scene.time.delayedCall(2000, () => {
      // Exit meeting mode
      this.scene.gameState = GAME_STATES.PLAYING;
      this.scene.playerCanShoot = true;
      this.messageComplete = true;
    });
  }
  
  update() {
    // Handle blinking title box when there's an incoming message
    if (this.isBlinking) {
      this.blinkTimer++;
      
      // Toggle visibility of title box background every blinkInterval frames
      if (this.blinkTimer % this.blinkInterval === 0) {
        // Toggle between blinking colors
        this.titleBox.fillColor = this.titleBox.fillColor === 0x4b6584 ? 0xe74c3c : 0x4b6584;
      }
      
      // Stop blinking after blinkDuration
      if (this.blinkTimer >= this.blinkDuration) {
        this.isBlinking = false;
        this.blinkTimer = 0;
        // Reset to normal color
        this.titleBox.fillColor = 0x4b6584;
      }
    }
    
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
    
    // Handle answer message timer
    if (this.showingAnswerMessage && this.answerMessageTimer > 0) {
      this.answerMessageTimer--;
      
      if (this.answerMessageTimer === 0) {
        this.showingAnswerMessage = false;
        // Retry the question (display it again)
        this.displayCurrentQuestion();
      }
    }
    
    // Handle random message appearances during gameplay, but only if not in a sprint transition
    if (this.scene.gameState === GAME_STATES.PLAYING && !this.active && this.scene.sprintDelay === 0) {
      this.messageTimer++;
      if (this.messageTimer >= this.messageInterval) {
        // Start blinking when a new message appears
        this.isBlinking = true;
        this.blinkTimer = 0;
        
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
    this.characterText.setText("");
    this.messageText.setText("Sprint in progress...");
    this.effectText.setText("");
    this.promptText.setText("");
    
    // Hide meeting-specific UI elements
    this.optionAText.setVisible(false);
    this.optionBText.setVisible(false);
    this.selectionIndicator.setVisible(false);
  }
  
  // Move to the next message/effect
  nextMessage() {
    if (this.scene.gameState === GAME_STATES.MEETING) {
      // For consistency, we'll leave this here but we don't need to do anything 
      // since selection now happens with UP/DOWN key handlers
      return;
    }
    
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
    // Find the lowest block to place the XXL block below it
    let lowestY = 0;
    
    // Use the scopeBlockInstances array from the scene
    this.scene.scopeBlockInstances.forEach(block => {
      if (block.y + block.height > lowestY) {
        lowestY = block.y + block.height;
      }
    });
    
    // If no blocks found, place it at the top
    if (lowestY === 0) {
      lowestY = START_Y;
    } else {
      lowestY += 20; // Add some spacing
    }
    
    // Create the XXL block
    const centerX = CANVAS_WIDTH / 2 - 40; // Half of XXL width (80/2)
    const xxlBlock = new ScopeBlock(this.scene, centerX, lowestY, 'XXL');
    this.scene.scopeBlockInstances.push(xxlBlock);
    
    // Reset the pending flag
    this.pendingXXLBlock = false;
  }
}

export default ScrumBoard; 