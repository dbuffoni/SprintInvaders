// Game state variables
let player;
let bullets = [];
let scopeBlocks = [];
let coffeeCups = 3; // Player lives
let score = 0;
let gameState = "playing";
let groupDirection = 1; // 1 for right, -1 for left
let groupSpeed = 1; // Horizontal speed of blocks
let justDropped = false; // Prevents multiple drops

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  initGame();
}

function initGame() {
  player = new Player();
  bullets = [];
  scopeBlocks = [];
  
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
  gameState = "playing";
  groupDirection = 1;
  justDropped = false;
}

function draw() {
  background(BACKGROUND_COLOR);

  if (gameState === "playing") {
    // Update and display player
    player.show();
    player.move();

    // Handle bullets
    updateBullets();
    
    // Move scope blocks as a group
    updateScopeBlocks();

    // Draw UI
    drawUI();
  } else if (gameState === "over") {
    displayGameOver();
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
      gameState = "over";
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
        gameState = "over";
      }
    }
  }
}

function displayGameOver() {
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(255, 0, 0);
  text("Game Over", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  textSize(16);
  fill(255);
  text("Press R to restart", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
}

function keyPressed() {
  if (key === " " && gameState === "playing") {
    bullets.push(new Bullet(player.x + player.width / 2, player.y));
  }
  if (gameState === "over" && key === 'r') {
    initGame();
  }
} 