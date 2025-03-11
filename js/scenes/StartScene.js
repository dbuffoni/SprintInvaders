// Import constants
import { CANVAS_WIDTH, CANVAS_HEIGHT, SCENES } from '../constants.js';

class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.START });
    this.secretMode = false;
    this.userInput = '';
    this.secretModeText = null;
    this.inputText = null;
    
    // This will be used to store the message index for developer mode
    this.overrideMessageIndex = null;
  }

  create() {
    // Add title text
    const titleText = this.add.text(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 3,
      'Space Invaders: Code or Explode',
      {
        font: '32px Arial',
        fill: '#ffffff',
        align: 'center'
      }
    );
    titleText.setOrigin(0.5, 0.5);
    
    // Add start prompt
    const startText = this.add.text(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 + 50,
      'Press SPACEBAR to Start',
      {
        font: '24px Arial',
        fill: '#ffffff'
      }
    );
    startText.setOrigin(0.5, 0.5);
    
    // Create invisible text for secret mode
    this.secretModeText = this.add.text(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 150,
      'SECRET DEV MODE ACTIVE\nEnter message index:',
      {
        font: '18px Arial',
        fill: '#ff0000'
      }
    );
    this.secretModeText.setOrigin(0.5, 0.5);
    this.secretModeText.setVisible(false);
    
    // Create text for user input in secret mode
    this.inputText = this.add.text(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 100,
      '',
      {
        font: '24px Arial',
        fill: '#ff0000'
      }
    );
    this.inputText.setOrigin(0.5, 0.5);
    this.inputText.setVisible(false);
    
    // Handle keyboard inputs
    this.input.keyboard.on('keydown', this.handleKeyDown, this);
  }
  
  handleKeyDown(event) {
    // Normal mode - spacebar starts the game
    if (!this.secretMode && event.code === 'Space' && 
        !event.ctrlKey && !event.shiftKey) {
      this.startGame();
    }
    
    // Secret mode activation - Ctrl+Shift+Spacebar
    else if (!this.secretMode && event.code === 'Space' && 
             event.ctrlKey && event.shiftKey) {
      this.activateSecretMode();
    }
    
    // Secret mode input handling
    else if (this.secretMode) {
      // Number inputs (0-9)
      if (event.key >= '0' && event.key <= '9') {
        this.userInput += event.key;
        this.inputText.setText(this.userInput);
      }
      // Enter to confirm input
      else if (event.code === 'Enter' && this.userInput.length > 0) {
        this.overrideMessageIndex = parseInt(this.userInput);
        this.startGame();
      }
      // Backspace to delete last character
      else if (event.code === 'Backspace' && this.userInput.length > 0) {
        this.userInput = this.userInput.slice(0, -1);
        this.inputText.setText(this.userInput);
      }
      // Escape to exit secret mode
      else if (event.code === 'Escape') {
        this.deactivateSecretMode();
      }
    }
  }
  
  activateSecretMode() {
    this.secretMode = true;
    this.userInput = '';
    this.secretModeText.setVisible(true);
    this.inputText.setVisible(true);
  }
  
  deactivateSecretMode() {
    this.secretMode = false;
    this.userInput = '';
    this.secretModeText.setVisible(false);
    this.inputText.setVisible(false);
  }
  
  startGame() {
    // Pass the override index to the game scene if in secret mode
    if (this.overrideMessageIndex !== null) {
      this.scene.start(SCENES.GAME, { overrideMessageIndex: this.overrideMessageIndex });
    } else {
      this.scene.start(SCENES.GAME);
    }
  }
}

export default StartScene; 