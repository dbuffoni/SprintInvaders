// Game configuration constants
export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 670; // Reduced height to include just playable area + header line
export const PLAYABLE_HEIGHT = 640; // Original canvas height, now just the playable area
export const INCOMING_CALL_DIALOG_HEIGHT = 252; // Increased by 40% from 180 to provide more space for text
export const BACKGROUND_COLOR = 0x141414; // Phaser uses hex color format
export const HEADER_HEIGHT = 30; // Height of the incoming call dialog header line

// Game states
export const GAME_STATES = {
  PLAYING: "playing",
  OVER: "over",
  MEETING: "meeting",
  MEETING_CONCLUSION: "meeting_conclusion",
  PAUSED: "paused"
}; 

// Phaser scene keys
export const SCENES = {
  BOOT: 'BootScene',
  START: 'StartScene',
  GAME: 'GameScene',
  GAME_OVER: 'GameOverScene'
}; 

// Block dimensions and grid configuration 
export const BLOCK_WIDTH = 50; // Default block width (matches ScopeBlock's default width)
export const BLOCK_HEIGHT = 30; // Default block height (matches ScopeBlock's default height)
export const ROWS = 5;
export const COLS = 7;
export const START_X = 50;
export const START_Y = 50;
export const H_SPACING = 70; // Horizontal spacing
export const V_SPACING = 40; // Vertical spacing
export const DROP_AMOUNT = 20; // Vertical drop when reversing

// Block categories and properties
export const CATEGORIES = ['S', 'M', 'L']; 
// XXL is a special category only added by the Business Analyst
// IC is a special category for Incoming Call, which triggers character actions

// Block size proportions (probability of each type appearing)
export const BLOCK_PROPORTIONS = {
  'S': 0.3,  // 30% chance of Small blocks
  'M': 0.4,  // 40% chance of Medium blocks
  'L': 0.3   // 30% chance of Large blocks
};

// Phaser colors for blocks (hex format) - Darker colors for better text readability
export const BLOCK_COLORS = {
  'S': 0x008800, // Darker Green
  'M': 0xCCCC00, // Darker Yellow
  'L': 0xCC0000, // Darker Red
  'XXL': 0x660066, // Darker Purple
};

// Block dependency constants
export const MAX_DEPENDENCIES = 2; // Maximum number of dependencies a block can have
export const DEPENDENCY_CHANCE = 0.5; // Chance that a block will have a dependency when created
export const INVULNERABLE_ALPHA = 0.7; // Alpha value for invulnerable blocks
export const INVULNERABLE_COLOR = 0x808080; // Gray color for invulnerable blocks

// Bullet constants
export const BULLET_WIDTH = 5;
export const BULLET_HEIGHT = 10;
export const BULLET_COLOR = 0xFFFF00; // Yellow
export const BULLET_SPEED = 350;

// Player constants
export const PLAYER_WIDTH = 30;
export const PLAYER_HEIGHT = 20;
export const PLAYER_COLOR = 0x00FFFF; // Cyan

// Incoming Call constants
export const INCOMING_CALL_FALL_SPEED = 100; // Speed at which incoming calls fall
export const INCOMING_CALL_SIZE = 15; // Size of the incoming call bomb shape
export const INCOMING_CALL_COLOR = 0x1E90FF; // Default color for incoming calls (used as fallback)
export const INCOMING_CALL_EVIL_COLOR = 0xFF4500; // Evil character calls (OrangeRed)
export const INCOMING_CALL_GOOD_COLOR = 0x32CD32; // Good character calls (LimeGreen)
export const INCOMING_CALL_EXPLOSION_RADIUS = 100; // Explosion radius when call hits bottom (increased from 60)
export const INCOMING_CALL_EXPLOSION_DURATION = 800; // Duration of explosion animation in milliseconds
export const INCOMING_CALL_EXPLOSION_PARTICLES = 30; // Number of particles in explosion
export const INCOMING_CALL_INITIAL_RATE = 1000; // Initial rate of incoming calls in milliseconds (5 seconds)
export const INCOMING_CALL_RATE_DECREASE = 500; // Decrease in rate per sprint (milliseconds)
export const INCOMING_CALL_CHANCE = 0.005; // Probability of an exposed block generating a call (each frame) 

// UFO constants
export const UFO_WIDTH = 80;
export const UFO_HEIGHT = 40;
export const UFO_COLOR = 0xADD8E6; // Light blue color
export const UFO_MIN_SPEED = 60; // Slightly faster minimum speed
export const UFO_MAX_SPEED = 220; // Slightly faster maximum speed
export const UFO_ACCELERATION = 40; // Increased acceleration for more dynamic changes
export const UFO_MAX_DIRECTION_CHANGES = 5; // Increased number of direction changes
export const UFO_HEALTH = 10;
export const UFO_APPEARANCES_PER_SPRINT = 3;
export const UFO_DROP_CHANCE = 0.015; // Increased chance to drop incoming calls
export const UFO_SPAWN_DELAY = 5000; // Milliseconds between UFO spawns
export const UFO_SCREEN_TIME = 12000; // Milliseconds the UFO stays inside the screen before leaving 

// Character proportions for incoming calls
export const CHARACTER_PROPORTIONS = {
  EVIL: 0.9, // 50% chance for evil character call
  GOOD: 0.1  // 50% chance for good character call
}; 

// Simple Bug constants
export const SIMPLE_BUG_SIZE = 6; // Size of the bug triangle
export const SIMPLE_BUG_COLOR = 0xFF0000; // Red color for the bug
export const SIMPLE_BUG_EXPLOSION_RADIUS = 40; // Explosion radius when bug hits player
export const SIMPLE_BUG_EXPLOSION_DURATION = 500; // Duration of explosion animation in milliseconds
export const SIMPLE_BUG_EXPLOSION_PARTICLES = 20; // Number of particles in explosion
export const SIMPLE_BUG_MIN_SPEED = 75; // Minimum fall speed
export const SIMPLE_BUG_MAX_SPEED = 150; // Maximum fall speed
export const SIMPLE_BUG_GENERATION_CHANCE = {
  'S': 0.001, // Chance per frame for small blocks to generate a bug
  'M': 0.003,  // Medium blocks generate bugs more frequently
  'L': 0.006,  // Large blocks generate bugs most frequently
  'XXL': 0.01 // XXL blocks have the highest chance
};
export const SIMPLE_BUG_CHANCE_INCREASE_PER_SPRINT = 0.0002; // Increase in bug generation chance per sprint 