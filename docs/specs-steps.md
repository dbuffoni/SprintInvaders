# Sprint Invaders: Code or Explode - Development Plan

## Step 1: Project Setup & Basic Game Loop
**Goal:** Initialize a workspace with JavaScript files for modular development and set up the main game loop. 
### Context:
*Sprint Invaders: Code or Explode* is a retro pixel-art space shooter like *space invaders* with an ironic take on agile development. The player controls **Dev-1**, a coder piloting a laptop-shaped ship, shooting "code commits" to destroy descending Scope Blocks (Jira tickets). The game will feature multiple sprints (levels) with increasing difficulty, introducing various enemies such as Scope Creep, Product Owners, and Bugs.

This step focuses on setting up the basic structure of the game, ensuring modularity, and implementing the foundational game loop with smooth player movement.

### Recommended JavaScript Framework:
Use **PixiJS.js** to implement the game and keep the code concise.  Use **Applitools** as testing framework to ensure that the game work basing on visual changes. Perform the implementation in steps and at each step ensure to have the new features tested and also perform non-regression testing on previous step features.

### Prompt 1:
"Create a JavaScript workspace for a retro pixel-art game called *Sprint Invaders: Code or Explode*. Use separate files for modularity:
- `index.html` for the canvas setup.
- `game.js` to handle the main game loop.
- `player.js` to define the player object.
- `enemy.js` to define basic enemies.
- `input.js` for handling keyboard controls.

Create a directory assets for sprites and background. Create your own assets.

The game should display a simple player-controlled ship (a laptop-shaped pixel sprite) and allow movement using the arrow keys. Implement a **requestAnimationFrame** loop in `game.js` to handle rendering and updates, ensuring smooth frame-by-frame movement. The player should not move beyond screen boundaries."

Create an initial splash screen in the style of 80' games.

Once programmed develop test with Applitools, test it and debug it automatically.
Let then the user test it and the ask the user if he wants to proceed.


---

## Step 2: Shooting Mechanism
**Goal:** Enable the player to shoot projectiles ("code commits").

### Prompt 2:
"Modify `player.js` to allow shooting with the spacebar. Create a new file, `projectile.js`, to define projectiles:
- The player fires a 'code commit' (pixel arrow) when pressing spacebar.
- Projectiles move upwards and disappear when leaving the screen.
- Store active projectiles in an array for rendering and collision detection."

---

Once programmed develop test with Applitools, test it and debug it automatically.
Let then the user test it and the ask the user if he wants to proceed.

## Step 3: Basic Enemies - Scope Blocks
**Goal:** Introduce Scope Blocks that descend toward the player.

### Prompt 3:
"Modify `enemy.js` to create 'Scope Blocks' as basic enemies:
- Represent them as descending pixelated Jira tickets.
- Spawn in rows and move downward like *Space Invaders*.
- If they reach the bottom, deduct a life from the player."

---

Once programmed develop test with Applitools, test it and debug it automatically.
Let then the user test it and the ask the user if he wants to proceed.

## Step 4: Advanced Enemies - Scope Creep & Product Owners
**Goal:** Introduce interactive enemies that modify gameplay.

### Prompt 4:
"Expand `enemy.js` to include:
- **Scope Creep:** Grows bigger and requires more shots to destroy.
- **Product Owner:** Fires 'requirement rays' that turn Scope Blocks into Scope Creep.
Ensure interactions happen correctly when these enemies appear."

---

Once programmed develop test with Applitools, test it and debug it automatically.
Let then the user test it and the ask the user if he wants to proceed.

## Step 5: Bugs and Service Managers
**Goal:** Add disruptive elements that interfere with shooting and movement.

### Prompt 5:
"Modify `enemy.js` to add:
- **Bugs:** Small erratic enemies that make aiming harder.
- **Service Managers:** Drop 'urgent tickets' that block shots.
Update collision logic in `game.js` to reflect these interactions."

---

Once programmed develop test with Applitools, test it and debug it automatically.
Let then the user test it and the ask the user if he wants to proceed.

## Step 6: Power-Ups
**Goal:** Introduce power-ups to help the player.

### Prompt 6:
"Create `powerups.js` to define:
- **Scrum Master Shield:** Temporarily blocks enemies.
- **Coffee Overdrive:** Increases fire rate for 10 seconds.
- **Refactor Bomb:** Clears all Bugs and shrinks Scope Creep.
Ensure power-ups drop randomly from defeated advanced enemies."

---

Once programmed develop test with Applitools, test it and debug it automatically.
Let then the user test it and the ask the user if he wants to proceed.

## Step 7: Level Progression & Sprint Mechanics
**Goal:** Implement structured levels with increasing difficulty.

### Prompt 7:
"Modify `game.js` to create a level system:
- **5 sprints**, each increasing in enemy count and complexity.
- A UI element at the bottom displays sarcastic Scrum Board dialogue.
- Ensure transitions between levels after clearing all Scope Blocks."

---

Once programmed develop test with Applitools, test it and debug it automatically.
Let then the user test it and the ask the user if he wants to proceed.

## Step 8: Final Boss & Polishing
**Goal:** Implement the final boss and refine visuals.

### Prompt 8:
"Create `boss.js` to introduce the final boss: 'The Client'.
- A giant eye that fires 'pivot rays' spawning random enemies.
- Spawns in the final level after a countdown.
- Add animations and sound effects to enhance gameplay experience."

---

Once programmed develop test with Applitools, test it and debug it automatically.
Let then the user test it and the ask the user if he wants to proceed.

