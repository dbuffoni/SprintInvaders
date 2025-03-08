// Game configuration constants
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 740; // Increased to accommodate the scrum board
const PLAYABLE_HEIGHT = 640; // Original canvas height, now just the playable area
const SCRUM_BOARD_HEIGHT = 100; // Height of the scrum board area
const BACKGROUND_COLOR = 0x141414; // Phaser uses hex color format

// Block dimensions
const BLOCK_WIDTH = 50; // Default block width (matches ScopeBlock's default width)
const BLOCK_HEIGHT = 30; // Default block height (matches ScopeBlock's default height)

// Grid configuration for scope blocks
const ROWS = 5;
const COLS = 7;
const START_X = 50;
const START_Y = 50;
const H_SPACING = 70; // Horizontal spacing
const V_SPACING = 40; // Vertical spacing
const DROP_AMOUNT = 20; // Vertical drop when reversing

// Block categories
const CATEGORIES = ['S', 'M', 'L']; 
// XXL is a special category only added by the Business Analyst

// Game states
const GAME_STATES = {
  PLAYING: "playing",
  OVER: "over",
  MEETING: "meeting"
}; 

// Phaser colors for blocks (hex format)
const BLOCK_COLORS = {
  'S': 0x00FF00, // Green
  'M': 0xFFFF00, // Yellow
  'L': 0xFF0000, // Red
  'XXL': 0x800080, // Purple
};

// Phaser scene keys
const SCENES = {
  BOOT: 'BootScene',
  GAME: 'GameScene',
  GAME_OVER: 'GameOverScene'
}; 