class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME_OVER });
  }

  init(data) {
    this.score = data.score || 0;
  }

  create() {
    // Create game over text
    this.add.text(
      CANVAS_WIDTH / 2,
      PLAYABLE_HEIGHT / 4,
      'Game Over',
      {
        font: '32px Arial',
        fill: '#FF0000'
      }
    ).setOrigin(0.5);

    // Display score
    this.add.text(
      CANVAS_WIDTH / 2,
      PLAYABLE_HEIGHT / 4 + 50,
      `Final Score: ${this.score}`,
      {
        font: '24px Arial',
        fill: '#FFFFFF'
      }
    ).setOrigin(0.5);

    // Restart instructions
    this.add.text(
      CANVAS_WIDTH / 2,
      PLAYABLE_HEIGHT / 2 + 100,
      'Press R to restart',
      {
        font: '16px Arial',
        fill: '#FFFFFF'
      }
    ).setOrigin(0.5);

    // Setup input handler for restarting
    this.input.keyboard.on('keydown-R', () => {
      this.scene.stop();
      this.scene.get(SCENES.GAME).scene.restart();
    });
  }
} 