# Sprint Invaders

A Space Invaders-style game with a Scrum/Agile theme, built with Phaser.js. Navigate the challenges of software development as you battle scope creep and unexpected feature requests!

## Game Description

In Sprint Invaders, you play as the developer DEV-1 trying to manage scope creep in your agile software project. Your mission is to shoot down scope blocks before they reach the bottom reaching the end of the sprint. As you progress through sprints, you'll face increasing difficulties, unexpected "one more feature" requests, and interruptions from incoming calls.

The game simulates the chaotic reality of software development with its sprints, meetings, and ever-changing requirements. Can you deliver your project successfully without getting overwhelmed by scope creep?

## Controls

- **Left/Right Arrow Keys**: Move the player horizontally
- **Space**: Shoot at scope blocks
- **Up/Down Arrow Keys**: Navigate messages and options in the scrum board
- **R**: Restart the game (when game over)

## Block Types

- **S (Small)**: Green blocks, require 1 hit to destroy - represent small tasks
- **M (Medium)**: Yellow blocks, require 2 hits to destroy - represent medium tasks
- **L (Large)**: Red blocks, require 3 hits to destroy - represent large tasks
- **XXL**: Purple blocks, require 10 hits to destroy - represent those dreaded "one more feature" requests added by the Business Analyst

## Game Mechanics

### Basic Gameplay
- Each destroyed block gives you 10 points
- Destroying incoming calls rewards you with 20 points
- You start with 3 coffee cups (lives)
- You lose a coffee cup when a block reaches the bottom of the screen
- The game ends when you run out of coffee cups or a block collides with your player

### Sprint System
- After clearing all blocks in a sprint, a new sprint starts with increased difficulty
- Each new sprint increases the speed of the blocks
- The incoming call frequency increases with each sprint
- Sprint progress is shown at the top of the screen

### Special Features
- **Dependencies**: Some blocks have dependencies, requiring you to destroy blocks in a specific order
- **Incoming Calls**: Random interruptions that descend from scope blocks - shoot them down before they reach you!
- **Scrum Meetings**: Periodic meetings that interrupt gameplay but can provide rewards or penalties
- **Feature Creep**: Business Analysts may add XXL blocks during gameplay, increasing scope

## Characters

The game includes interactions with various characters from a typical development team:
- **Product Owner**: Manages the product backlog and priorities
- **Scrum Master**: Facilitates the development process
- **Business Analyst**: May add new requirements (XXL blocks)
- **QA Engineer**: Identifies issues that need addressing
- **UX Designer**: Provides input on user experience
- **DevOps Engineer**: Handles deployment considerations

## Technical Details

This game is built with:
- **HTML5**: Structure of the web application
- **CSS3**: Styling and animations
- **JavaScript (ES6+)**: Core game logic and mechanics
- **Phaser 3.55.2**: Game framework providing rendering, animation, physics, and input handling
- **ES Modules**: For code organization and modularity

### Project Structure
```
sprint-invaders/
├── assets/          # Game assets (images, audio)
├── js/              # JavaScript source code
│   ├── constants.js # Game constants and configuration
│   ├── entities/    # Game entity classes (Player, Bullet, ScopeBlock, etc.)
│   ├── scenes/      # Phaser scene classes (Game, Start, GameOver)
│   ├── characters.js # Character dialogues and interactions
│   └── game.js      # Main game initialization
├── index.html       # Main HTML file
├── style.css        # CSS styles
└── README.md        # This file
```

## Setup and Installation

### Local Development
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/sprint-invaders.git
   cd sprint-invaders
   ```

2. If you have Node.js installed, you can use a simple HTTP server:
   ```
   npm install
   npx http-server -p 8080
   ```

3. Or simply open the `index.html` file in a modern web browser to play the game.

### Playing the Game
1. Navigate to `http://localhost:8080` in your browser (if using http-server)
2. Use the arrow keys to move and space to shoot
3. Progress through sprints by destroying all blocks
4. Respond to incoming calls and meetings as they occur

## Testing
The game includes testing using Playwright:
```
npm test
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is open source and available under the [MIT License](LICENSE). 