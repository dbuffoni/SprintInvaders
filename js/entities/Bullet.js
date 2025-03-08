class Bullet {
  constructor(scene, x, y) {
    this.scene = scene;
    
    // Create bullet texture if it doesn't exist
    if (!scene.textures.exists('bullet')) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(0xFFFF00, 1); // Yellow
      graphics.fillRect(0, 0, 5, 10);
      graphics.generateTexture('bullet', 5, 10);
      graphics.destroy();
    }
    
    // Create the bullet sprite
    this.sprite = scene.bullets.create(x, y, 'bullet');
    this.sprite.setOrigin(0, 0);
    this.sprite.setVelocityY(-350); // Adjust speed as needed
  }
  
  destroy() {
    this.sprite.destroy();
  }
  
  static createBulletGroup(scene) {
    return scene.physics.add.group();
  }
}

export default Bullet; 