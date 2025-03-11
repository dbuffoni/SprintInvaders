// Game configuration constants
export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 892; // Increased to accommodate the 40% larger scrum board (640 + 252)
export const PLAYABLE_HEIGHT = 640; // Original canvas height, now just the playable area
export const SCRUM_BOARD_HEIGHT = 252; // Increased by 40% from 180 to provide more space for text
export const BACKGROUND_COLOR = 0x141414; // Phaser uses hex color format

// Block dimensions
export const BLOCK_WIDTH = 50; // Default block width (matches ScopeBlock's default width)
export const BLOCK_HEIGHT = 30; // Default block height (matches ScopeBlock's default height)

// Grid configuration for scope blocks
export const ROWS = 5;
export const COLS = 7;
export const START_X = 50;
export const START_Y = 50;
export const H_SPACING = 70; // Horizontal spacing
export const V_SPACING = 40; // Vertical spacing
export const DROP_AMOUNT = 20; // Vertical drop when reversing

// Block categories
export const CATEGORIES = ['S', 'M', 'L']; 
// XXL is a special category only added by the Business Analyst

// Game states
export const GAME_STATES = {
  PLAYING: "playing",
  OVER: "over",
  MEETING: "meeting",
  MEETING_CONCLUSION: "meeting_conclusion"
}; 

// Phaser colors for blocks (hex format)
export const BLOCK_COLORS = {
  'S': 0x00FF00, // Green
  'M': 0xFFFF00, // Yellow
  'L': 0xFF0000, // Red
  'XXL': 0x800080, // Purple
};

// Phaser scene keys
export const SCENES = {
  BOOT: 'BootScene',
  START: 'StartScene',
  GAME: 'GameScene',
  GAME_OVER: 'GameOverScene'
}; 