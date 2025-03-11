// Import scenes and constants
import BootScene from './scenes/BootScene.js';
import StartScene from './scenes/StartScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

// Phaser game configuration
const config = {
  type: Phaser.AUTO,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    StartScene,
    GameScene,
    GameOverScene
  ]
};

// Initialize the game
const game = new Phaser.Game(config); 