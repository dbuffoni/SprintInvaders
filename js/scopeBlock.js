class ScopeBlock {
  constructor(x, y, category) {
    this.x = x;
    this.y = y;
    this.category = category;
    this.w = category === 'XXL' ? 80 : 50; // Wider for XXL
    this.h = category === 'XXL' ? 40 : 30; // Taller for XXL
    this.hitsRemaining = category === 'S' ? 1 : 
                         category === 'M' ? 2 : 
                         category === 'L' ? 3 : 10; // XXL takes 10 hits
  }

  show() {
    // Color based on category
    if (this.category === 'S') fill(0, 255, 0); // Green
    else if (this.category === 'M') fill(255, 255, 0); // Yellow
    else if (this.category === 'L') fill(255, 0, 0); // Red
    else if (this.category === 'XXL') fill(128, 0, 128); // Purple for XXL
    rect(this.x, this.y, this.w, this.h);
    fill(255);
    textSize(12);
    textAlign(CENTER, CENTER);
    
    // For XXL blocks, show hits remaining
    if (this.category === 'XXL') {
      text(`${this.category} (${this.hitsRemaining})`, this.x + this.w / 2, this.y + this.h / 2);
    } else {
      text(this.category, this.x + this.w / 2, this.y + this.h / 2);
    }
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  hit() {
    this.hitsRemaining--;
    return this.hitsRemaining <= 0;
  }

  reachesBottom() {
    return this.y + this.h > PLAYABLE_HEIGHT;
  }
} 