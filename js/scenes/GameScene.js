// Import entity classes
import Player from '../entities/Player.js';
import Bullet from '../entities/Bullet.js';
import ScopeBlock from '../entities/ScopeBlock.js';
import IncomingCallDialog from '../entities/IncomingCallDialog.js';
import IncomingCall from '../entities/IncomingCall.js';
import UFO from '../entities/UFO.js';
import SimpleBug from '../entities/SimpleBug.js';

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
  CATEGORIES,
  MAX_DEPENDENCIES,
  DEPENDENCY_CHANCE,
  HEADER_HEIGHT,
  INCOMING_CALL_INITIAL_RATE,
  INCOMING_CALL_RATE_DECREASE,
  INCOMING_CALL_CHANCE,
  BLOCK_WIDTH,
  UFO_APPEARANCES_PER_SPRINT,
  UFO_SPAWN_DELAY,
  BLOCK_PROPORTIONS
} from '../constants.js';

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME });
  }

  init(data) {
    // Initialize game variables
    this.player = null;
    this.bullets = null;
    this.scopeBlocks = null;
    this.incomingCalls = []; // To store active incoming calls
    this.ufos = []; // To store active UFOs
    this.bugs = []; // To store active simple bugs
    this.coffeeCups = 3;
    this.score = 0;
    this.gameState = GAME_STATES.PAUSED; // Start paused until the notification completes
    this.groupDirection = 1; // 1 for right, -1 for left
    this.groupSpeed = 1; // Horizontal speed of blocks
    this.justDropped = false; // Prevents multiple drops
    this.sprintCount = 1; // Start with sprint 1
    this.sprintDelay = 0;
    this.playerCanShoot = true;
    this.keys = null;
    this.scopeBlockInstances = []; // Store references to ScopeBlock instances
    this.ufoCount = 0; // Count of UFOs spawned in current sprint
    this.ufoTimer = null; // Timer for spawning UFOs
    this.xxlBlockCreated = false; // Flag to track if an XXL block has been created in the current sprint
    this.ufosToSpawn = UFO_APPEARANCES_PER_SPRINT; // Track remaining UFOs to spawn
    
    // Check if we have an override message index from the StartScene
    if (data && data.overrideMessageIndex !== undefined) {
      // Store it in the registry so other entities can access it
      this.registry.set('overrideMessageIndex', data.overrideMessageIndex);
      console.log(`GameScene: Developer mode active with message index ${data.overrideMessageIndex}`);
    }
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

    // Create bullet group - must be before player creation
    this.bullets = Bullet.createBulletGroup(this);
    
    // Create scope block group - must be before createScopeBlocks
    this.scopeBlocks = ScopeBlock.createBlockGroup(this);
    
    // Create incoming call group
    this.incomingCallGroup = IncomingCall.createIncomingCallGroup(this);
    
    // Create UFO group
    this.ufoGroup = UFO.createUFOGroup(this);
    
    // Create simple bug group
    this.bugGroup = SimpleBug.createBugGroup(this);

    // Create player
    this.createPlayer();

    // Create scope blocks
    this.createScopeBlocks();
    
    // Set up collisions for the blocks
    this.setupCollisions();

    // Create scrum board
    this.createScrumBoard();

    // Create UI
    this.createUI();
    
    // Setup input handlers
    this.setupInputHandlers();
    
    // Set up UFO spawning
    this.setupUFOSpawning();
    
    // Show initial sprint notification
    this.showSprintNotification();
  }

  update() {
    // Check game state
    if (this.gameState !== GAME_STATES.PLAYING) {
      // If not in playing state, update the scrum board
      if (this.gameState === GAME_STATES.MEETING) {
        this.updateScrumBoard();
      } else if (this.gameState === GAME_STATES.PAUSED) {
        // When paused due to character message, only update the scrum board
        this.updateScrumBoard();
        
        // Still allow player movement when paused
        this.updatePlayer();
      }
      return;
    }
    
    // Update the player's position and handle input
    this.updatePlayer();
    
    // Update scope blocks
    this.updateScopeBlocks();
    
    // Update UFOs
    this.updateUFOs();
    
    // Update incoming calls
    this.updateIncomingCalls();
    
    // Update simple bugs
    this.updateBugs();
    
    // Check if sprint is cleared
    this.checkSprintCleared();
  }
  
  createPlayer() {
    this.player = new Player(
      this, 
      CANVAS_WIDTH / 2, 
      PLAYABLE_HEIGHT - 40
    );
  }
  
  createScopeBlocks() {
    // Create blocks in the grid pattern
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        // Calculate block position
        const x = START_X + col * H_SPACING;
        const y = START_Y + row * V_SPACING;
        
        // Randomly determine block category based on BLOCK_PROPORTIONS
        // Generate a random number between 0 and 1
        const random = Math.random();
        
        // Select category based on proportions
        let category;
        if (random < BLOCK_PROPORTIONS['S']) {
          category = 'S';
        } else if (random < BLOCK_PROPORTIONS['S'] + BLOCK_PROPORTIONS['M']) {
          category = 'M';
        } else {
          category = 'L';
        }
        
        // Create the scope block
        const scopeBlock = new ScopeBlock(this, x, y, category);
        this.scopeBlockInstances.push(scopeBlock);
      }
    }
    
    // Setup dependencies between blocks
    ScopeBlock.setupDependencies(
      this.scopeBlockInstances, 
      MAX_DEPENDENCIES, 
      DEPENDENCY_CHANCE
    );
  }
  
  createBullet(x, y) {
    return new Bullet(this, x, y);
  }
  
  createScrumBoard() {
    // Initialize the IncomingCallDialog with the current scene
    this.scrumBoard = new IncomingCallDialog(this);
    
    // Ensure header is set to default state at game start
    this.scrumBoard.showHeaderOnly();
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
    
    // Add collision between bullets and incoming calls
    this.physics.add.collider(
      this.bullets,
      this.incomingCallGroup,
      this.handleBulletIncomingCallCollision,
      null,
      this
    );
    
    // Add collision between bullets and UFOs
    this.physics.add.collider(
      this.bullets,
      this.ufoGroup,
      this.handleBulletUFOCollision,
      null,
      this
    );
    
    // Add collision between player and incoming calls
    this.physics.add.collider(
      this.player.sprite,
      this.incomingCallGroup,
      this.handlePlayerIncomingCallCollision,
      null,
      this
    );
    
    // Add collision between player and simple bugs
    this.physics.add.collider(
      this.player.sprite,
      this.bugGroup,
      this.handlePlayerBugCollision,
      null,
      this
    );
    
    // Note: We deliberately DO NOT add a collider between bullets and bugs,
    // as per requirements, bullets should not collide with Simple Bugs
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
      console.log('UP key pressed, game state:', this.gameState, 'IncomingCallDialog active:', this.scrumBoard.active);
      
      if ((this.gameState === GAME_STATES.PLAYING || this.gameState === GAME_STATES.PAUSED) && this.scrumBoard.active) {
        // In playing mode or paused mode with active scrumBoard
        if (this.scrumBoard.waitingForMeetingStart) {
          // Start meeting if we're in meeting announcement mode
          this.scrumBoard.advanceDialogue('UP');
        } else {
          // Allow advancing messages for all effects including lockWeapon and addXXLBlock
          console.log('Advancing message with UP key');
          this.scrumBoard.nextMessage();
          
          // Add a backup timer in case the message doesn't dismiss
          this.time.delayedCall(1000, () => {
            if (this.scrumBoard.active) {
              console.log('Backup timer: Dialog still active, forcing deactivation');
              this.scrumBoard.forceDeactivate();
            }
          });
        }
      } else if (this.gameState === GAME_STATES.MEETING || this.gameState === GAME_STATES.MEETING_CONCLUSION) {
        // In meeting mode or meeting conclusion, handle dialogue advancement
        this.scrumBoard.advanceDialogue('UP');
      }
      
      // Check for state mismatch after key press
      if (this.scrumBoard.active && this.gameState === GAME_STATES.PLAYING) {
        // If the scrum board is still active but the game is in PLAYING state,
        // this might be a state mismatch
        const isVisuallyActive = this.scrumBoard.mainContainer && 
                                this.scrumBoard.mainContainer.visible && 
                                this.scrumBoard.mainContainer.y < PLAYABLE_HEIGHT;
        
        if (!isVisuallyActive) {
          console.log('State mismatch detected after UP key press, forcing deactivation');
          this.scrumBoard.forceDeactivate();
        }
      }
    });
    
    // Down key for selecting second option (B) in meeting mode or navigating messages
    this.input.keyboard.on('keydown-DOWN', () => {
      console.log('DOWN key pressed, game state:', this.gameState, 'IncomingCallDialog active:', this.scrumBoard.active);
      
      if ((this.gameState === GAME_STATES.PLAYING || this.gameState === GAME_STATES.PAUSED) && this.scrumBoard.active) {
        // In playing mode or paused mode with active scrumBoard
        if (this.scrumBoard.waitingForMeetingStart) {
          // Start meeting if we're in meeting announcement mode
          this.scrumBoard.advanceDialogue('DOWN');
        } else {
          // Allow advancing messages for all effects including lockWeapon and addXXLBlock
          console.log('Advancing message with DOWN key');
          this.scrumBoard.nextMessage();
          
          // Add a backup timer in case the message doesn't dismiss
          this.time.delayedCall(1000, () => {
            if (this.scrumBoard.active) {
              console.log('Backup timer: Dialog still active, forcing deactivation');
              this.scrumBoard.forceDeactivate();
            }
          });
        }
      } else if (this.gameState === GAME_STATES.MEETING || this.gameState === GAME_STATES.MEETING_CONCLUSION) {
        // In meeting mode or meeting conclusion, handle dialogue advancement
        this.scrumBoard.advanceDialogue('DOWN');
      }
      
      // Check for state mismatch after key press
      if (this.scrumBoard.active && this.gameState === GAME_STATES.PLAYING) {
        // If the scrum board is still active but the game is in PLAYING state,
        // this might be a state mismatch
        const isVisuallyActive = this.scrumBoard.mainContainer && 
                                this.scrumBoard.mainContainer.visible && 
                                this.scrumBoard.mainContainer.y < PLAYABLE_HEIGHT;
        
        if (!isVisuallyActive) {
          console.log('State mismatch detected after DOWN key press, forcing deactivation');
          this.scrumBoard.forceDeactivate();
        }
      }
    });
    
    // R key to restart game
    this.input.keyboard.on('keydown-R', () => {
      if (this.gameState === GAME_STATES.OVER) {
        this.initGame();
      }
    });
  }
  
  updatePlayer() {
    // Use the Player class's update method
    // Only allow player movement during meeting mode or paused mode, but not shooting
    if (this.gameState === GAME_STATES.MEETING || this.gameState === GAME_STATES.PAUSED) {
      // Allow movement but not shooting during meeting or when paused
      this.player.update(this.keys, false);
    } else {
      this.player.update(this.keys);
    }
  }
  
  updateScopeBlocks() {
    ScopeBlock.updateBlocks(
      this.scopeBlockInstances,
      this.groupSpeed,
      this.groupDirection,
      this.justDropped,
      (direction) => this.groupDirection = direction,
      (dropped) => this.justDropped = dropped,
      this.handleBlockReachBottom.bind(this)
    );
  }
  
  updateIncomingCalls() {
    // Update all active incoming calls
    for (let i = this.incomingCalls.length - 1; i >= 0; i--) {
      const call = this.incomingCalls[i];
      if (call && call.sprite && call.sprite.active) {
        call.update();
      } else {
        // Remove inactive or undefined calls from the array
        this.incomingCalls.splice(i, 1);
      }
    }
  }
  
  setupUFOSpawning() {
    // Reset UFO count for the new sprint
    this.ufoCount = 0;
    this.ufosToSpawn = UFO_APPEARANCES_PER_SPRINT; // Track remaining UFOs to spawn
    
    // Clear any existing timer
    if (this.ufoTimer) {
      this.ufoTimer.remove();
      this.ufoTimer = null;
    }
    
    // Calculate delay based on sprint number
    this.ufoSpawnDelay = Math.max(UFO_SPAWN_DELAY - (this.sprintCount - 1) * 500, 2000);
    
    // Schedule the first UFO spawn
    this.scheduleNextUFO();
    
    console.log(`UFO spawning set up: ${UFO_APPEARANCES_PER_SPRINT} UFOs will appear this sprint with ${this.ufoSpawnDelay}ms delay between them`);
  }
  
  scheduleNextUFO() {
    // Only schedule if there are more UFOs to spawn
    if (this.ufosToSpawn <= 0) return;
    
    // Use the proper spawn delay between UFOs
    this.ufoTimer = this.time.delayedCall(this.ufoSpawnDelay, () => {
      this.checkAndSpawnUFO();
    }, [], this);
  }
  
  checkAndSpawnUFO() {
    // Skip if game is not in playing state
    if (this.gameState !== GAME_STATES.PLAYING) {
      // If not playing, reschedule for later
      this.scheduleNextUFO();
      return;
    }
    
    // Skip if the IncomingCallDialog is active
    if (this.scrumBoard && this.scrumBoard.active) {
      console.log('UFO spawn check skipped - IncomingCallDialog is active');
      this.scheduleNextUFO(); // Reschedule for later
      return;
    }
    
    // If we've spawned all UFOs for this sprint, stop checking
    if (this.ufosToSpawn <= 0) {
      return;
    }
    
    // Only spawn if there's no active UFO
    if (this.ufos.length === 0) {
      this.spawnUFO();
    } else {
      // If there's an active UFO, we'll check again later
      this.scheduleNextUFO();
    }
  }
  
  spawnUFO() {
    // Skip spawning if game is not in playing state
    if (this.gameState !== GAME_STATES.PLAYING) {
      return;
    }
    
    // Check if the IncomingCallDialog is active and skip spawning if it is
    if (this.scrumBoard && this.scrumBoard.active) {
      console.log('UFO spawn prevented - IncomingCallDialog is active');
      this.scheduleNextUFO(); // Reschedule for later
      return;
    }
    
    // Double-check that there's no active UFO
    if (this.ufos.length > 0) {
      console.log('UFO spawn prevented - another UFO is already active');
      return;
    }
    
    // Create new UFO
    console.log('Spawning UFO...');
    const startFromLeft = Math.random() > 0.5;
    const ufo = new UFO(this, startFromLeft);
    
    // Add to tracking arrays
    this.ufos.push(ufo);
    this.ufoGroup.add(ufo.sprite);
    
    // Increment UFO count and decrement remaining UFOs to spawn
    this.ufoCount++;
    this.ufosToSpawn--;
    
    // Change header text to UFO warning
    if (this.scrumBoard) {
      this.scrumBoard.setUFOHeader();
    }
  }
  
  updateUFOs() {
    // Track if we had UFOs before update
    const hadUFOs = this.ufos.length > 0;
    
    // Update all active UFOs
    for (let i = this.ufos.length - 1; i >= 0; i--) {
      const ufo = this.ufos[i];
      if (ufo && ufo.sprite && ufo.sprite.active) {
        ufo.update();
      } else {
        // Remove inactive or undefined UFOs from the array
        this.ufos.splice(i, 1);
        
        // Schedule the next UFO when the current one is destroyed
        this.scheduleNextUFO();
      }
    }
    
    // If we had UFOs before but none now, reset header
    if (hadUFOs && this.ufos.length === 0 && this.scrumBoard && !this.scrumBoard.active) {
      this.scrumBoard.resetHeader();
    }
  }
  
  handleBulletUFOCollision(bullet, ufoSprite) {
    // Get the UFO instance from the sprite
    const ufo = ufoSprite.ufoInstance;
    if (ufo) {
      // Try to hit the UFO and check if it's destroyed
      ufo.hit();
      
      // Destroy the bullet
      bullet.destroy();
    }
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
    // Increment sprint count
    this.sprintCount++;
    
    // Update sprint display
    this.sprintText.setText(`Sprint: ${this.sprintCount}`);
    
    // Use the new method to properly reset the scrum board
    this.scrumBoard.resetForNewSprint();
    
    // Reset header to default state after a new sprint
    this.scrumBoard.resetHeader();
    
    // Create new scope blocks based on the current sprint
    this.createScopeBlocks();
    
    // Reset group movement variables
    this.groupDirection = 1;
    this.groupSpeed = Math.min(this.groupSpeed + 0.2, 3.0); // Cap at 3.0
    this.justDropped = false;
    
    // Reset UFO count and set up spawning for new sprint
    this.ufoCount = 0;
    this.setupUFOSpawning();
    
    // Show a notification for new sprint
    this.showSprintNotification();
  }
  
  showSprintNotification() {
    // Pause the game during the notification
    this.gameState = GAME_STATES.PAUSED;
    
    // Create a sprint notification text
    const sprintNotification = this.add.text(
      CANVAS_WIDTH / 2,
      PLAYABLE_HEIGHT * 2 / 3,
      `Starting Sprint ${this.sprintCount}\n\nGet ready Dev-1`,
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
      ease: 'Power2',
      duration: 3000,
      onComplete: () => {
        // When animation completes, destroy the notification and resume the game
        sprintNotification.destroy();
        this.gameState = GAME_STATES.PLAYING;
      }
    });
  }
  
  updateScrumBoard() {
    // Call the IncomingCallDialog's update method to handle its logic
    this.scrumBoard.update();
  }
  
  initGame() {
    // Reset game state and restart scene
    this.scene.restart();
  }
  
  handleBulletIncomingCallCollision(bullet, callSprite) {
    // Get the incoming call instance from the sprite
    const call = callSprite.incomingCallInstance;
    if (call) {
      // Different behavior based on alignment
      if (call.character.isEvil) {
        // Evil calls explode when shot
        call.explode();
      } else {
        // Good calls use the shotDown method without absorption effect
        call.shotDown();
      }
      
      // Destroy the bullet
      bullet.destroy();
      
      // Increase score
      this.score += 20;
      this.scoreText.setText(`Score: ${this.score}`);
    }
  }
  
  handlePlayerIncomingCallCollision(player, callSprite) {
    // Get the incoming call instance from the sprite
    const call = callSprite.incomingCallInstance;
    if (call) {
      // Use the call's handler which checks isEvil and behaves accordingly
      call.handlePlayerCollision();
    }
  }
  
  createIncomingCall(x, y, characterType = null) {
    const incomingCall = new IncomingCall(this, x, y, characterType);
    this.incomingCalls.push(incomingCall);
    
    // Add the call sprite to the incomingCallGroup for collision detection
    if (this.incomingCallGroup) {
      this.incomingCallGroup.add(incomingCall.sprite);
    }
    
    return incomingCall;
  }
  
  createBlock(category = 'XXL') {
    console.log(`Creating ${category} block in GameScene`);
    
    // Create the block at a temporary position (0,0)
    // We'll position it properly using the disposeBlock method
    const block = new ScopeBlock(this, 0, 0, category);
    this.scopeBlockInstances.push(block);
    
    // Use the new disposal method to position the block
    this.disposeBlock(block);
    
    return block;
  }
  
  // New method to dispose blocks - works for all categories
  disposeBlock(block) {
    console.log(`Disposing block of category ${block.category}`);
    
    // Get all active blocks to analyze existing rows
    const activeBlocks = this.scopeBlockInstances.filter(b => 
      b.sprite && b.sprite.active && b !== block
    );
    
    // Find all unique rows (y positions) of existing blocks
    const existingRows = [...new Set(activeBlocks.map(b => b.sprite.y))].sort((a, b) => a - b);
    
    // Set a minimum gap between blocks for proper spacing
    const minBlockGap = 20; // minimum space between blocks
    
    // Try to find space in existing rows
    let placementFound = false;
    let targetY, targetX;
    
    // Check each existing row for available space
    for (const rowY of existingRows) {
      // Get all blocks in this row
      const blocksInRow = activeBlocks.filter(b => b.sprite.y === rowY);
      
      // Sort blocks by x position to find gaps
      blocksInRow.sort((a, b) => a.sprite.x - b.sprite.x);
      
      // Check for space at the beginning of the row
      if (blocksInRow.length > 0 && blocksInRow[0].sprite.x >= BLOCK_WIDTH + minBlockGap) {
        targetX = minBlockGap;
        targetY = rowY;
        placementFound = true;
        break;
      }
      
      // Check for space at the end of the row
      if (blocksInRow.length > 0) {
        const lastBlock = blocksInRow[blocksInRow.length - 1];
        const rightEdge = lastBlock.sprite.x + lastBlock.width;
        if (CANVAS_WIDTH - rightEdge >= BLOCK_WIDTH + minBlockGap) {
          targetX = rightEdge + minBlockGap;
          targetY = rowY;
          placementFound = true;
          break;
        }
      }
      
      // Check for gaps between blocks
      for (let i = 0; i < blocksInRow.length - 1; i++) {
        const rightEdge = blocksInRow[i].sprite.x + blocksInRow[i].width;
        const gap = blocksInRow[i + 1].sprite.x - rightEdge;
        
        if (gap >= BLOCK_WIDTH + (minBlockGap * 2)) {
          targetX = rightEdge + minBlockGap;
          targetY = rowY;
          placementFound = true;
          break;
        }
      }
      
      if (placementFound) break;
    }
    
    // If no space found in existing rows, create a new row below the lowest block
    if (!placementFound) {
      // Find the lowest block
      let lowestY = existingRows.length > 0 ? Math.max(...existingRows) : START_Y;
      
      // Position the block below the lowest row with proper spacing
      targetY = lowestY + V_SPACING;
      
      // Center the block horizontally with some randomness
      const middleX = CANVAS_WIDTH / 2 - BLOCK_WIDTH / 2;
      const randomOffsetX = Math.floor(Math.random() * 80) - 40; // Random offset between -40 and +40 pixels
      targetX = Math.max(minBlockGap, Math.min(CANVAS_WIDTH - BLOCK_WIDTH - minBlockGap, middleX + randomOffsetX));
    }
    
    // Update block position
    block.x = targetX;
    block.y = targetY;
    
    return block;
  }
  
  // Method to create multiple blocks
  createBlocks(category = 'XXL', count = 1) {
    console.log(`Creating ${count} ${category} blocks in GameScene`);
    
    const blocksCreated = [];
    
    // Create the requested number of blocks by calling createBlock multiple times
    for (let i = 0; i < count; i++) {
      const block = this.createBlock(category);
      blocksCreated.push(block);
    }
    
    // Single configuration for notification
    const singleHeaderText = "⚠️ NEW FEATURE ADDED! ⚠️";
    const headerText = `⚠️ ${count} FEATURES ADDED! ⚠️`;
    const headerColor = 0xFF0000;
    
    // Show notification in header based on number of blocks created
    if (this.scrumBoard) {
      if (count === 1) {
        // Single block notification
        this.scrumBoard.setCustomBlinkingHeader(singleHeaderText, 3000, headerColor);
        console.log("⚠️ NEW FEATURE ADDED! ⚠️");
      } else if (count > 1) {
        // Multiple blocks notification
        this.scrumBoard.setCustomBlinkingHeader(headerText, 3000, headerColor);
        console.log(`⚠️ ${count} FEATURES ADDED! ⚠️`);
      }
    }
    
    return blocksCreated;
  }
  
  updateBugs() {
    // Update all active bugs
    for (let i = this.bugs.length - 1; i >= 0; i--) {
      const bug = this.bugs[i];
      if (bug && bug.sprite && bug.sprite.active) {
        bug.update();
      } else {
        // Remove inactive or undefined bugs from the array
        this.bugs.splice(i, 1);
      }
    }
  }
  
  handlePlayerBugCollision(player, bugSprite) {
    // Get the bug instance from the sprite
    const bug = bugSprite.simpleBugInstance;
    if (bug) {
      // Trigger the bug explosion effect
      bug.explode();
    }
  }
  
  createSimpleBug(x, y) {
    const bug = new SimpleBug(this, x, y);
    this.bugs.push(bug);
    
    // Add the bug sprite to the bugGroup for collision detection
    if (this.bugGroup) {
      this.bugGroup.add(bug.sprite);
    }
    
    return bug;
  }
}

export default GameScene; 