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
    this.waveCount = 1; // Start with wave 1
    this.waveDelay = 0;
    this.playerCanShoot = true;
    this.keys = null;
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

    // Create player
    this.createPlayer();

    // Create bullet group
    this.bullets = this.physics.add.group();

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
    
    // Show initial wave notification
    this.showWaveNotification();
  }

  update() {
    if (this.gameState === GAME_STATES.PLAYING) {
      // Update player
      this.updatePlayer();
      
      // Update scope blocks
      this.updateScopeBlocks();
      
      // Check if wave is cleared
      this.checkWaveCleared();
      
      // Update scrum board
      this.updateScrumBoard();
    } else if (this.gameState === GAME_STATES.MEETING) {
      // Update scrum board during meeting
      this.updateScrumBoard();
    }
  }
  
  createPlayer() {
    this.player = this.physics.add.sprite(CANVAS_WIDTH / 2, PLAYABLE_HEIGHT - 40, 'player');
    this.player.setSize(30, 20);
    this.player.setDisplaySize(30, 20);
    this.player.setOrigin(0, 0);
    this.player.setImmovable(true);
    
    // Since we're not using an image, draw a rectangle on the sprite
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00FFFF, 1); // Cyan
    graphics.fillRect(0, 0, 30, 20);
    graphics.generateTexture('player', 30, 20);
    graphics.destroy();
  }
  
  createScopeBlocks() {
    // If scopeBlocks doesn't exist, create it
    if (!this.scopeBlocks) {
      this.scopeBlocks = this.physics.add.group();
    }
    
    // Initialize scope blocks with random categories
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let x = START_X + c * H_SPACING;
        let y = START_Y + r * V_SPACING;
        let category = Phaser.Utils.Array.GetRandom(CATEGORIES);
        this.createScopeBlock(x, y, category);
      }
    }
    
    // Set up collisions for the blocks
    this.setupBlockCollisions();
  }
  
  createScopeBlock(x, y, category) {
    // Determine block properties based on category
    const width = category === 'XXL' ? 80 : 50;
    const height = category === 'XXL' ? 40 : 30;
    const hitsRemaining = category === 'S' ? 1 : 
                         category === 'M' ? 2 : 
                         category === 'L' ? 3 : 10; // XXL takes 10 hits
    const color = BLOCK_COLORS[category];
    
    // Create a texture for this block type if it doesn't exist
    const textureKey = `block_${category}`;
    if (!this.textures.exists(textureKey)) {
      const graphics = this.add.graphics();
      graphics.fillStyle(color, 1);
      graphics.fillRect(0, 0, width, height);
      graphics.generateTexture(textureKey, width, height);
      graphics.destroy();
    }
    
    // Create the block sprite
    const block = this.scopeBlocks.create(x, y, textureKey);
    block.setOrigin(0, 0);
    block.category = category;
    block.hitsRemaining = hitsRemaining;
    block.setImmovable(true);
    
    // Add text label
    let label = category === 'XXL' ? 
      `${category} (${hitsRemaining})` : category;
    
    const text = this.add.text(
      x + width / 2,
      y + height / 2,
      label,
      { 
        font: '12px Arial', 
        fill: '#ffffff',
        align: 'center'
      }
    );
    text.setOrigin(0.5, 0.5);
    
    // Store reference to text on the block
    block.textLabel = text;
    
    return block;
  }
  
  createBullet(x, y) {
    // Create bullet texture if it doesn't exist
    if (!this.textures.exists('bullet')) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xFFFF00, 1); // Yellow
      graphics.fillRect(0, 0, 5, 10);
      graphics.generateTexture('bullet', 5, 10);
      graphics.destroy();
    }
    
    const bullet = this.bullets.create(x, y, 'bullet');
    bullet.setOrigin(0, 0);
    bullet.setVelocityY(-350); // Adjust speed as needed
    
    return bullet;
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
    
    // Create wave indicator text
    this.waveText = this.add.text(
      CANVAS_WIDTH / 2,
      10,
      'Wave: 1',
      {
        font: '16px Arial',
        fill: '#ffffff'
      }
    );
    this.waveText.setOrigin(0.5, 0);
    
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
      this.player, 
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
    
    // Up/Down keys for navigating messages
    this.input.keyboard.on('keydown-UP', () => {
      if (this.gameState === GAME_STATES.PLAYING) {
        if (this.scrumBoard.active && this.gameState !== GAME_STATES.MEETING) {
          this.scrumBoard.nextMessage();
        }
      } else if (this.gameState === GAME_STATES.MEETING) {
        this.scrumBoard.advanceDialogue();
      }
    });
    
    this.input.keyboard.on('keydown-DOWN', () => {
      if (this.gameState === GAME_STATES.PLAYING) {
        if (this.scrumBoard.active && this.gameState !== GAME_STATES.MEETING) {
          this.scrumBoard.nextMessage();
        }
      } else if (this.gameState === GAME_STATES.MEETING) {
        this.scrumBoard.advanceDialogue();
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
    // Handle player movement
    if (this.keys.left.isDown && this.player.x > 0) {
      this.player.x -= 5;
    }
    if (this.keys.right.isDown && this.player.x < CANVAS_WIDTH - this.player.width) {
      this.player.x += 5;
    }
  }
  
  updateScopeBlocks() {
    let atEdge = false;
    
    // Move all blocks in the group direction
    this.scopeBlocks.getChildren().forEach(block => {
      block.x += this.groupSpeed * this.groupDirection;
      
      // Update text label position
      block.textLabel.x = block.x + block.width / 2;
      
      // Check if any block is at edge
      if (block.x <= 10 || block.x + block.width >= CANVAS_WIDTH - 10) {
        atEdge = true;
      }
      
      // Check if block reaches bottom
      if (block.y + block.height > PLAYABLE_HEIGHT) {
        this.handleBlockReachBottom(block);
      }
    });
    
    // Reverse direction and drop if at edge
    if (atEdge && !this.justDropped) {
      this.groupDirection *= -1;
      this.scopeBlocks.getChildren().forEach(block => {
        block.y += DROP_AMOUNT;
        block.textLabel.y += DROP_AMOUNT;
      });
      this.justDropped = true;
    } else if (!atEdge) {
      this.justDropped = false;
    }
  }
  
  handleBulletBlockCollision(bullet, block) {
    // Remove the bullet
    bullet.destroy();
    
    // Decrease hits remaining on block
    block.hitsRemaining--;
    
    // Update XXL block label if needed
    if (block.category === 'XXL') {
      block.textLabel.setText(`${block.category} (${block.hitsRemaining})`);
    }
    
    // Check if block should be destroyed
    if (block.hitsRemaining <= 0) {
      // Remove the block's text label
      block.textLabel.destroy();
      
      // Remove the block
      block.destroy();
      
      // Update score
      this.score += 10;
      this.scoreText.setText(`Score: ${this.score}`);
    }
  }
  
  handlePlayerBlockCollision(player, block) {
    // Game over when player collides with a block
    this.gameState = GAME_STATES.OVER;
    this.scene.launch(SCENES.GAME_OVER, { score: this.score });
    this.scene.pause();
  }
  
  handleBlockReachBottom(block) {
    // Remove the block and its label
    block.textLabel.destroy();
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
  
  checkWaveCleared() {
    if (this.scopeBlocks.getChildren().length === 0) {
      if (this.waveDelay === 0) {
        // Start the delay counter
        this.waveDelay = 300; // 5 seconds at 60fps
      } else {
        this.waveDelay--;
        if (this.waveDelay === 0) {
          this.startNewWave();
        }
      }
    }
  }
  
  startNewWave() {
    // Only start a new wave if we're still playing
    if (this.gameState === GAME_STATES.PLAYING || this.gameState === GAME_STATES.MEETING) {
      // Increment wave count
      this.waveCount++;
      
      // Update wave indicator
      this.waveText.setText(`Wave: ${this.waveCount}`);
      
      // Show wave notification
      this.showWaveNotification();
      
      // Add more scope blocks for the next wave
      this.createScopeBlocks();
      
      // Increase difficulty
      this.groupSpeed = Math.min(this.groupSpeed + 0.2, 3);
    }
  }
  
  showWaveNotification() {
    // Create a wave notification text
    const waveNotification = this.add.text(
      CANVAS_WIDTH / 2,
      PLAYABLE_HEIGHT * 2 / 3,
      `Starting Wave ${this.waveCount}!`,
      {
        font: '28px Arial',
        fontStyle: 'bold',
        fill: '#ffffff'
      }
    );
    waveNotification.setOrigin(0.5);
    
    // Ensure text is always in foreground
    waveNotification.setDepth(1000);
    
    // Add a pulsing effect
    this.tweens.add({
      targets: waveNotification,
      scale: { from: 0.5, to: 1.5 },
      alpha: { from: 1, to: 0 },
      ease: 'Power2',
      duration: 5000,
      onComplete: () => {
        waveNotification.destroy();
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