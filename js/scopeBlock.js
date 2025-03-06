class ScopeBlock {
  constructor(x, y, category) {
    this.x = x;
    this.y = y;
    this.category = category;
    this.w = 50; // Same width for all
    this.h = 30; // Same height for all
    this.hitsRemaining = category === 'S' ? 1 : category === 'M' ? 2 : 3;
  }

  show() {
    // Color based on category
    if (this.category === 'S') fill(0, 255, 0); // Green
    else if (this.category === 'M') fill(255, 255, 0); // Yellow
    else if (this.category === 'L') fill(255, 0, 0); // Red
    rect(this.x, this.y, this.w, this.h);
    fill(255);
    textSize(12);
    textAlign(CENTER, CENTER);
    text(this.category, this.x + this.w / 2, this.y + this.h / 2);
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
    return this.y + this.h > CANVAS_HEIGHT;
  }
} 