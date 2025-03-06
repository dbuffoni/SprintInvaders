function drawUI() {
  fill(255);
  textSize(16);
  textAlign(LEFT);
  text(`Lives: ${coffeeCups}`, 10, 20);
  text(`Score: ${score}`, 10, 40);
} 