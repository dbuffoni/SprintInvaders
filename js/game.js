// Game state variables
let player;
let bullets = [];
let scopeBlocks = [];
let coffeeCups = 3; // Player lives
let score = 0;
let gameState = GAME_STATES.PLAYING;
let groupDirection = 1; // 1 for right, -1 for left
let groupSpeed = 1; // Horizontal speed of blocks
let justDropped = false; // Prevents multiple drops
let scrumBoard; // Scrum board for character dialogues
let playerCanShoot = true; // Flag to control if player can shoot
let waveCount = 0; // Count of waves completed
let waveDelay = 0; // Counter for delay between waves

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  initGame();
}

function initGame() {
  player = new Player();
  bullets = [];
  scopeBlocks = [];
  scrumBoard = new ScrumBoard();
  playerCanShoot = true;
  waveCount = 0;
  
  // Initialize scope blocks with random categories
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let x = START_X + c * H_SPACING;
      let y = START_Y + r * V_SPACING;
      let category = random(CATEGORIES);
      scopeBlocks.push(new ScopeBlock(x, y, category));
    }
  }
  
  coffeeCups = 3;
  score = 0;
  gameState = GAME_STATES.PLAYING;
  groupDirection = 1;
  justDropped = false;
}

function draw() {
  background(BACKGROUND_COLOR);

  // Draw a line to separate the game area from the scrum board
  stroke(100);
  line(0, PLAYABLE_HEIGHT, CANVAS_WIDTH, PLAYABLE_HEIGHT);
  noStroke();

  if (gameState === GAME_STATES.PLAYING) {
    // Update and display player
    player.show();
    player.move();

    // Handle bullets
    updateBullets();
    
    // Move scope blocks as a group
    updateScopeBlocks();

    // Draw UI
    drawUI();
    
    // Update and show scrum board
    scrumBoard.update();
    scrumBoard.show();
    
    // Check if wave is cleared to introduce Business Analyst
    checkWaveCleared();
  } else if (gameState === GAME_STATES.MEETING) {
    // Still show the game elements during meeting
    player.show();
    for (let block of scopeBlocks) {
      block.show();
    }
    for (let bullet of bullets) {
      bullet.show();
    }
    drawUI();
    
    // Update and show scrum board with meeting dialogue
    scrumBoard.update();
    scrumBoard.show();
  } else if (gameState === GAME_STATES.OVER) {
    displayGameOver();
    
    // Still show the scrum board in game over state
    scrumBoard.show();
  }
}

// Check if wave is cleared and introduce Business Analyst
function checkWaveCleared() {
  if (scopeBlocks.length === 0) {
    if (waveDelay === 0) {
      waveCount++;
      
      // Start the delay counter
      waveDelay = 300; // 5 seconds at 60fps
      
      // Wait to activate BusinessAnalyst until any current message is complete
      if (!scrumBoard.active) {
        // Let the next naturally scheduled BusinessAnalyst appearance happen
        // We don't force it here to avoid message overlapping
        // The random timer in ScrumBoard.update() will handle this
      }
    } else {
      waveDelay--;
      if (waveDelay === 0) {
        startNewWave();
      }
    }
  }
}

// Start a new wave with more blocks
function startNewWave() {
  // Only start a new wave if we're still playing
  if (gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.MEETING) {
    // Add more scope blocks for the next wave
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let x = START_X + c * H_SPACING;
        let y = START_Y + r * V_SPACING;
        let category = random(CATEGORIES);
        scopeBlocks.push(new ScopeBlock(x, y, category));
      }
    }
    
    // Increase difficulty
    groupSpeed = min(groupSpeed + 0.2, 3);
  }
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].show();
    bullets[i].move();
    if (bullets[i].offscreen()) {
      bullets.splice(i, 1);
      continue;
    }
    // Check bullet collisions with scope blocks
    for (let j = scopeBlocks.length - 1; j >= 0; j--) {
      if (bullets[i] && bullets[i].hits(scopeBlocks[j])) {
        if (scopeBlocks[j].hit()) {
          scopeBlocks.splice(j, 1);
          score += 10;
        }
        bullets.splice(i, 1);
        break;
      }
    }
  }
}

function updateScopeBlocks() {
  let atEdge = false;
  for (let block of scopeBlocks) {
    block.show();
    block.move(groupSpeed * groupDirection, 0);
    if (block.x <= 10 || block.x + block.w >= CANVAS_WIDTH - 10) {
      atEdge = true;
    }
  }

  // Reverse direction and drop if at edge
  if (atEdge && !justDropped) {
    groupDirection *= -1;
    for (let block of scopeBlocks) {
      block.move(0, DROP_AMOUNT);
    }
    justDropped = true;
  } else if (!atEdge) {
    justDropped = false;
  }

  // Check for collisions between player and scope blocks
  checkPlayerCollisions();

  // Check if blocks reach the bottom
  checkBlocksReachBottom();
}

function checkPlayerCollisions() {
  for (let block of scopeBlocks) {
    if (
      block.x < player.x + player.width &&
      block.x + block.w > player.x &&
      block.y < player.y + player.height &&
      block.y + block.h > player.y
    ) {
      gameState = GAME_STATES.OVER;
      break;
    }
  }
}

function checkBlocksReachBottom() {
  for (let i = scopeBlocks.length - 1; i >= 0; i--) {
    if (scopeBlocks[i].reachesBottom()) {
      coffeeCups--;
      scopeBlocks.splice(i, 1);
      if (coffeeCups <= 0) {
        gameState = GAME_STATES.OVER;
      }
    }
  }
}

function displayGameOver() {
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(255, 0, 0);
  text("Game Over", CANVAS_WIDTH / 2, PLAYABLE_HEIGHT / 2);
  textSize(16);
  fill(255);
  text("Press R to restart", CANVAS_WIDTH / 2, PLAYABLE_HEIGHT / 2 + 40);
}

function keyPressed() {
  if (key === " ") {
    if (gameState === GAME_STATES.PLAYING && playerCanShoot) {
      bullets.push(new Bullet(player.x + player.width / 2, player.y));
    }
  }
  
  // Use UP_ARROW or DOWN_ARROW to advance messages
  if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
    if (gameState === GAME_STATES.PLAYING) {
      // If the scrum board is active but not in meeting mode, advance to next message
      if (scrumBoard.active && gameState !== GAME_STATES.MEETING) {
        scrumBoard.nextMessage();
      }
    } else if (gameState === GAME_STATES.MEETING) {
      scrumBoard.advanceDialogue();
    }
  }
  
  if (gameState === GAME_STATES.OVER && key === 'r') {
    initGame();
  }
} 