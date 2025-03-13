// Game configuration constants
export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 670; // Reduced height to include just playable area + header line
export const PLAYABLE_HEIGHT = 640; // Original canvas height, now just the playable area
export const INCOMING_CALL_DIALOG_HEIGHT = 252; // Increased by 40% from 180 to provide more space for text
export const BACKGROUND_COLOR = 0x141414; // Phaser uses hex color format
export const HEADER_HEIGHT = 30; // Height of the incoming call dialog header line

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
// IC is a special category for Incoming Call, which triggers character actions

// Game states
export const GAME_STATES = {
  PLAYING: "playing",
  OVER: "over",
  MEETING: "meeting",
  MEETING_CONCLUSION: "meeting_conclusion",
  PAUSED: "paused"
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

// Block dependency constants
export const MAX_DEPENDENCIES = 2; // Maximum number of dependencies a block can have
export const DEPENDENCY_CHANCE = 0.4; // Chance that a block will have a dependency when created
export const INVULNERABLE_ALPHA = 0.7; // Alpha value for invulnerable blocks
export const INVULNERABLE_COLOR = 0x808080; // Gray color for invulnerable blocks

// Incoming Call constants
export const INCOMING_CALL_FALL_SPEED = 100; // Speed at which incoming calls fall
export const INCOMING_CALL_SIZE = 15; // Size of the incoming call bomb shape
export const INCOMING_CALL_COLOR = 0x1E90FF; // Dodger Blue color for incoming calls
export const INCOMING_CALL_EXPLOSION_RADIUS = 75; // Explosion radius when call hits bottom (increased from 60)
export const INCOMING_CALL_EXPLOSION_DURATION = 800; // Duration of explosion animation in milliseconds
export const INCOMING_CALL_EXPLOSION_PARTICLES = 30; // Number of particles in explosion
export const INCOMING_CALL_INITIAL_RATE = 1000; // Initial rate of incoming calls in milliseconds (5 seconds)
export const INCOMING_CALL_RATE_DECREASE = 500; // Decrease in rate per sprint (milliseconds)
export const INCOMING_CALL_CHANCE = 0.005; // Probability of an exposed block generating a call (each frame) 