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
    GameScene,
    GameOverScene
  ]
};

// Initialize the game
const game = new Phaser.Game(config); 