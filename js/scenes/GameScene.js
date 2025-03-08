// Import entity classes
import Player from '../entities/Player.js';
import Bullet from '../entities/Bullet.js';
import ScopeBlock from '../entities/ScopeBlock.js';
import ScrumBoard from '../entities/ScrumBoard.js';

// Import constants
import { 
  CANVAS_WIDTH, 
  PLAYABLE_HEIGHT, 
  BACKGROUND_COLOR, 
  ROWS, 
  COLS, 
  START_X, 
  START_Y, 
  H_SPACING, 
  V_SPACING, 
  DROP_AMOUNT, 
  GAME_STATES, 
  SCENES,
  CATEGORIES 
} from '../constants.js';

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME });
  }

  init() {
    // Initialize game variables
    this.player = null;
    this.bullets = null;
    this.scopeBlocks = null;
    this.coffeeCups = 3;
    this.score = 0;
    this.gameState = GAME_STATES.PLAYING;
    this.groupDirection = 1; // 1 for right, -1 for left
    this.groupSpeed = 1; // Horizontal speed of blocks
    this.justDropped = false; // Prevents multiple drops
    this.sprintCount = 1; // Start with sprint 1
    this.sprintDelay = 0;
    this.playerCanShoot = true;
    this.keys = null;
    this.scopeBlockInstances = []; // Store references to ScopeBlock instances
  }

  create() {
    // Set background color
    this.cameras.main.setBackgroundColor(BACKGROUND_COLOR);

    // Create input keys
    this.keys = {
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      enter: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      r: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
    };

    // Create a dividing line between game area and scrum board
    const line = this.add.line(
      0, 
      PLAYABLE_HEIGHT, 
      0, 
      0, 
      CANVAS_WIDTH, 
      0, 
      0x646464
    );
    line.setOrigin(0, 0);

    // Create bullet group - must be before player creation
    this.bullets = Bullet.createBulletGroup(this);
    
    // Create scope block group - must be before createScopeBlocks
    this.scopeBlocks = ScopeBlock.createBlockGroup(this);

    // Create player
    this.createPlayer();

    // Create scope blocks
    this.createScopeBlocks();

    // Create scrum board
    this.createScrumBoard();

    // Create UI
    this.createUI();
    
    // Setup collisions
    this.setupCollisions();
    
    // Setup input handlers
    this.setupInputHandlers();
    
    // Show initial sprint notification
    this.showSprintNotification();
  }

  update() {
    if (this.gameState === GAME_STATES.PLAYING) {
      // Update player
      this.updatePlayer();
      
      // Update scope blocks
      this.updateScopeBlocks();
      
      // Check if sprint is cleared
      this.checkSprintCleared();
      
      // Update scrum board
      this.updateScrumBoard();
    } else if (this.gameState === GAME_STATES.MEETING) {
      // Update scrum board during meeting
      this.updateScrumBoard();
    }
  }
  
  createPlayer() {
    this.player = new Player(
      this, 
      CANVAS_WIDTH / 2, 
      PLAYABLE_HEIGHT - 40
    );
  }
  
  createScopeBlocks() {
    // Clear existing scopeBlockInstances array
    this.scopeBlockInstances = [];
    
    // Initialize scope blocks with random categories
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let x = START_X + c * H_SPACING;
        let y = START_Y + r * V_SPACING;
        let category = Phaser.Utils.Array.GetRandom(CATEGORIES);
        
        // Create the scope block and add it to our array
        const scopeBlock = new ScopeBlock(this, x, y, category);
        this.scopeBlockInstances.push(scopeBlock);
      }
    }
    
    // Set up collisions for the blocks
    this.setupBlockCollisions();
  }
  
  createBullet(x, y) {
    return new Bullet(this, x, y);
  }
  
  createScrumBoard() {
    // Initialize the ScrumBoard with the current scene
    this.scrumBoard = new ScrumBoard(this);
  }
  
  createUI() {
    // Create score text
    this.scoreText = this.add.text(
      10, 
      10, 
      'Score: 0', 
      { 
        font: '16px Arial', 
        fill: '#ffffff' 
      }
    );
    
    // Create sprint indicator text
    this.sprintText = this.add.text(
      CANVAS_WIDTH / 2,
      10,
      'Sprint: 1',
      {
        font: '16px Arial',
        fill: '#ffffff'
      }
    );
    this.sprintText.setOrigin(0.5, 0);
    
    // Create coffee cups (lives) display
    this.updateCoffeeCupsDisplay();
  }
  
  updateCoffeeCupsDisplay() {
    // Remove existing cups display if any
    if (this.coffeeCupsDisplay) {
      this.coffeeCupsDisplay.forEach(cup => cup.destroy());
    }
    
    // Create new coffee cups display
    this.coffeeCupsDisplay = [];
    for (let i = 0; i < this.coffeeCups; i++) {
      // Create coffee cup icon
      if (!this.textures.exists('coffee_cup')) {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x8B4513, 1); // Brown
        graphics.fillRect(0, 0, 20, 25);
        graphics.generateTexture('coffee_cup', 20, 25);
        graphics.destroy();
      }
      
      const cup = this.add.image(
        CANVAS_WIDTH - 30 - (i * 25), 
        20, 
        'coffee_cup'
      );
      this.coffeeCupsDisplay.push(cup);
    }
  }
  
  setupCollisions() {
    // Initial setup of collisions
    this.setupBlockCollisions();
  }
  
  setupBlockCollisions() {
    // Remove any existing colliders to prevent duplicates
    if (this.bulletBlockCollider) {
      this.bulletBlockCollider.destroy();
    }
    if (this.playerBlockCollider) {
      this.playerBlockCollider.destroy();
    }
    
    // Setup new collision between bullets and blocks
    this.bulletBlockCollider = this.physics.add.collider(
      this.bullets, 
      this.scopeBlocks, 
      this.handleBulletBlockCollision, 
      null, 
      this
    );
    
    // Setup new collision between player and blocks
    this.playerBlockCollider = this.physics.add.collider(
      this.player.sprite, 
      this.scopeBlocks, 
      this.handlePlayerBlockCollision, 
      null, 
      this
    );
  }
  
  setupInputHandlers() {
    // Space key for shooting
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.gameState === GAME_STATES.PLAYING && this.playerCanShoot) {
        this.shoot();
      }
    });
    
    // Up key for selecting first option (A) in meeting mode or navigating messages
    this.input.keyboard.on('keydown-UP', () => {
      if (this.gameState === GAME_STATES.PLAYING && this.scrumBoard.active) {
        // In playing mode, UP advances messages
        this.scrumBoard.nextMessage();
      } else if (this.gameState === GAME_STATES.MEETING) {
        // In meeting mode, UP selects first option (A)
        this.scrumBoard.advanceDialogue('UP');
      }
    });
    
    // Down key for selecting second option (B) in meeting mode or navigating messages
    this.input.keyboard.on('keydown-DOWN', () => {
      if (this.gameState === GAME_STATES.PLAYING && this.scrumBoard.active) {
        // In playing mode, DOWN advances messages
        this.scrumBoard.nextMessage();
      } else if (this.gameState === GAME_STATES.MEETING) {
        // In meeting mode, DOWN selects second option (B)
        this.scrumBoard.advanceDialogue('DOWN');
      }
    });
    
    // Enter key handler removed as it's no longer needed for selection
    
    // R key to restart game
    this.input.keyboard.on('keydown-R', () => {
      if (this.gameState === GAME_STATES.OVER) {
        this.initGame();
      }
    });
  }
  
  updatePlayer() {
    // Use the Player class's update method
    // Only allow player movement during meeting mode, but not shooting
    if (this.gameState === GAME_STATES.MEETING) {
      // Allow movement but not shooting during meeting
      this.player.update(this.keys, false);
    } else {
      this.player.update(this.keys);
    }
  }
  
  updateScopeBlocks() {
    // This function has been moved to ScopeBlock.js
    // Now we just call the static method from ScopeBlock
    ScopeBlock.updateBlocks(
      this.scopeBlockInstances,
      this.groupSpeed,
      this.groupDirection,
      this.justDropped,
      (newDirection) => { this.groupDirection = newDirection; },
      (justDropped) => { this.justDropped = justDropped; },
      this.handleBlockReachBottom.bind(this)
    );
  }
  
  handleBulletBlockCollision(bullet, block) {
    // Find the ScopeBlock instance that corresponds to this Phaser sprite
    const blockInstance = this.scopeBlockInstances.find(
      instance => instance.sprite === block
    );
    
    if (blockInstance) {
      // Hit the block and check if it should be destroyed
      if (blockInstance.hit()) {
        // Remove from the array
        this.scopeBlockInstances = this.scopeBlockInstances.filter(
          instance => instance !== blockInstance
        );
        
        // Destroy the block
        blockInstance.destroy();
        
        // Update score
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
      }
    }
    
    // Remove the bullet
    bullet.destroy();
  }
  
  handlePlayerBlockCollision(player, block) {
    // Game over when player collides with a block
    this.gameState = GAME_STATES.OVER;
    this.scene.launch(SCENES.GAME_OVER, { score: this.score });
    this.scene.pause();
  }
  
  handleBlockReachBottom(block) {
    // Remove from the array
    this.scopeBlockInstances = this.scopeBlockInstances.filter(
      instance => instance !== block
    );
    
    // Destroy the block
    block.destroy();
    
    // Decrease coffee cups (lives)
    this.coffeeCups--;
    this.updateCoffeeCupsDisplay();
    
    // Check for game over
    if (this.coffeeCups <= 0) {
      this.gameState = GAME_STATES.OVER;
      this.scene.launch(SCENES.GAME_OVER, { score: this.score });
      this.scene.pause();
    }
  }
  
  shoot() {
    // Create bullet at player position
    this.createBullet(this.player.x + this.player.width / 2, this.player.y);
  }
  
  checkSprintCleared() {
    if (this.scopeBlockInstances.length === 0) {
      if (this.sprintDelay === 0) {
        // Start the delay counter
        this.sprintDelay = 300; // 5 seconds at 60fps
      } else {
        this.sprintDelay--;
        if (this.sprintDelay === 0) {
          this.startNewSprint();
        }
      }
    }
  }
  
  startNewSprint() {
    // Only start a new sprint if we're still playing
    if (this.gameState === GAME_STATES.PLAYING || this.gameState === GAME_STATES.MEETING) {
      // Increment sprint count
      this.sprintCount++;
      
      // Update sprint indicator
      this.sprintText.setText(`Sprint: ${this.sprintCount}`);
      
      // Show sprint notification
      this.showSprintNotification();
      
      // Add more scope blocks for the next sprint
      this.createScopeBlocks();
      
      // Increase difficulty
      this.groupSpeed = Math.min(this.groupSpeed + 0.2, 3);
    }
  }
  
  showSprintNotification() {
    // Create a sprint notification text
    const sprintNotification = this.add.text(
      CANVAS_WIDTH / 2,
      PLAYABLE_HEIGHT * 2 / 3,
      `Starting Sprint ${this.sprintCount}!`,
      {
        font: '28px Arial',
        fontStyle: 'bold',
        fill: '#ffffff'
      }
    );
    sprintNotification.setOrigin(0.5);
    
    // Add a pulsing effect
    this.tweens.add({
      targets: sprintNotification,
      scale: { from: 0.5, to: 1.5 },
      alpha: { from: 1, to: 0 },
      ease: 'Power2',
      duration: 2000,
      onComplete: () => {
        sprintNotification.destroy();
      }
    });
  }
  
  updateScrumBoard() {
    // Call the scrumBoard's update method to handle its logic
    this.scrumBoard.update();
  }
  
  initGame() {
    // Reset game state and restart scene
    this.scene.restart();
  }
} 

export default GameScene; 