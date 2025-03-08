// Import constants
import { CANVAS_WIDTH, CANVAS_HEIGHT, SCENES } from '../constants.js';

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload() {
    // Create loading text
    const loadingText = this.add.text(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2, 
      'Loading...', 
      { 
        font: '20px Arial', 
        fill: '#ffffff' 
      }
    );
    loadingText.setOrigin(0.5, 0.5);
    
    // Here we would load assets, but we're using simple shapes for now
    // If you add images later, you can load them here like:
    // this.load.image('player', 'assets/player.png');
  }

  create() {
    this.scene.start(SCENES.GAME);
  }
}

export default BootScene; 