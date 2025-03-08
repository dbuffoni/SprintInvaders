# Scope Invaders

A Space Invaders-style game with a Scrum/Agile theme, built with Phaser.js.

## Game Description

In Scope Invaders, you play as a developer trying to manage scope creep in your project. Shoot down scope blocks before they reach the bottom of the screen or collide with your player.

## Controls

- **Left/Right Arrow Keys**: Move the player
- **Space**: Shoot
- **Up/Down Arrow Keys**: Navigate messages in the scrum board
- **R**: Restart the game (when game over)

## Block Types

- **S (Small)**: Green blocks, require 1 hit to destroy
- **M (Medium)**: Yellow blocks, require 2 hits to destroy
- **L (Large)**: Red blocks, require 3 hits to destroy
- **XXL**: Purple blocks, require 10 hits to destroy (added by the Business Analyst)

## Game Mechanics

- Each destroyed block gives you 10 points
- You have 3 coffee cups (lives) - you lose one when a block reaches the bottom
- The game ends when you run out of coffee cups or a block collides with your player
- After clearing a Sprint, a new Sprint starts with increased difficulty

## Technical Details

This game is built with:
- HTML5
- CSS3
- JavaScript
- Phaser 3.55.2

## Setup

Simply open the `index.html` file in a modern web browser to play the game. 