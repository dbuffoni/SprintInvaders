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
    
    // Load the soundtrack
    this.load.audio('soundtrack', 'assets/Code or Explode.mp3');
    
    // Load sound effects
    this.load.audio('fire_sound', 'assets/fire.mp3');
    this.load.audio('explosion_sound', 'assets/explosion1.mp3');
    this.load.audio('wall_hit_sound', 'assets/wall.mp3');
    this.load.audio('player_hit_sound', 'assets/explosion2.mp3');
    this.load.audio('ufo_sound', 'assets/ufo.mp3');
    
    // Load game assets
    this.load.image('coffee_cup', 'assets/coffee.png');
    
    // Here we would load assets, but we're using simple shapes for now
    // If you add images later, you can load them here like:
    // this.load.image('player', 'assets/player.png');
  }

  create() {
    this.scene.start(SCENES.START);
  }
}

export default BootScene; 