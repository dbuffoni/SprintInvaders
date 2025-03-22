// Base Character class
import { CHARACTER_PROPORTIONS, CHARACTER_TYPES } from './constants.js';

export class Character {
  constructor({name, messages, effects, isEvil}) {
    this.name = name;
    this.messages = messages;
    this.effects = effects;
    this.isEvil = isEvil; // Whether the character is evil or good
    
    // Default meeting mode questions and options
    this.meetingQuestions = [];
  }
}

// Cache for character instances to avoid repeated creation
const characterCache = {
  businessAnalyst: null,
  stageur: null,
  manager: null
};

// Create a BusinessAnalyst character directly without importing
function createBusinessAnalyst() {
  if (!characterCache.businessAnalyst) {
    characterCache.businessAnalyst = new Character({
      name: "BUSINESS ANALYST",
      messages: [
        "We need to add just one more tiny feature!",
        "I need to validate this with the stakeholders. Can you hold on a second?",
        "Let's schedule a meeting to discuss this further."
      ],
      effects: [
        'addXXLBlock',
        'lockWeapon',
        'meeting'
      ],
      isEvil: true // Business Analyst is evil
    });

    // Add meeting questions
    characterCache.businessAnalyst.meetingQuestions = [
      {
        question: "How long will it take to add a blockchain feature to the login page?",
        options: [
          { 
            text: "Two days, it's just a quick hash thing, right?", 
            correct: true, 
            message: "Thank you! Good point. (80% chance of adding 3 M Blocks)" 
          },
          { 
            text: "Six months, we need to rewrite everything in Rust.", 
            correct: false, 
            message: "Let's schedule a six-month kickoff to discuss the timeline. (20% chance of adding 3 XXL Blocks)" 
          }
        ]
      },
      {
        question: "Can you estimate how many hours to make the app 'intuitive'?",
        options: [
          { 
            text: "Four hours, I'll slap some buttons on it.", 
            correct: true, 
            message: "Thank you! We'll go with your idea. (80% chance of adding 3 M Blocks)"
          },
          { 
            text: "Define 'intuitive' in a 10-page spec, then we'll talk.", 
            correct: false, 
            message: "Fair point! I'll write that spec—expect it in 2027. (20% chance of adding 3 XXL Blocks)" 
          }
        ]
      },
      {
        question: "How fast can you fix the bug we found in prod last night?",
        options: [
          { 
            text: "Ten minutes, it's probably just a typo.", 
            correct: true, 
            message: "Thank you! I knew it was an easy fix. (80% chance of adding 3 M Blocks)"
          },
          { 
            text: "Depends—did anyone log it, or are we guessing?", 
            correct: false, 
            message: "No ticket, no clue—let's move on before someone notices! (20% chance of adding 3 XXL Blocks)" 
          }
        ]
      },
      {
        question: "How long to make the button vaporize when you hover over it?",
        options: [
          { 
            text: "One hour, CSS is my jam.", 
            correct: true, 
            message: "Perfect! Just what I wanted to hear. (80% chance of adding 3 M Blocks)" 
          },
          { 
            text: "A month, I'll build a vaporization engine from scratch.", 
            correct: false, 
            message: "Genius! I'll pitch 'GlowEngine Pro' to the CEO—let's brainstorm names now! (20% chance of adding 3 XXL Blocks)" 
          }
        ]
      },
      {
        question: "What's your ETA for integrating the AI chatbot the Salesperson promised?",
        options: [
          { 
            text: "Next sprint, I'll just copy-paste ChatGPT to it.", 
            correct: true, 
            message: "That's the right attitude! Quick and easy. (80% chance of adding 3 M Blocks)" 
          },
          { 
            text: "When Sales learns to code it themselves.", 
            correct: false, 
            message: "Ha! I'd pay to see that! Ops... ears everywhere. (20% chance of adding 3 XXL Blocks)" 
          }
        ]
      },
      {
        question: "How many story points for rewriting the app in quantum computer code?",
        options: [
          { 
            text: "Five points, it's basically JavaScript, right?", 
            correct: true, 
            message: "You're absolutely right! Should be easy. (80% chance of adding 3 M Blocks)" 
          },
          { 
            text: "Infinity points", 
            correct: false, 
            message: "Let's watch a quantum computing tutorial together right now! (20% chance of adding 3 XXL Blocks)" 
          }
        ]
      }
    ];
  }
  
  return characterCache.businessAnalyst;
}

// Create a Stageur character directly without importing
function createStageur() {
  if (!characterCache.stageur) {
    characterCache.stageur = new Character({
      name: "STAGEUR",
      messages: [
        "I made you a coffee! ☕",
        "I've been learning about design patterns. Need any help?",
        "I think I found a bug in the code. Want me to explain it?"
      ],
      effects: [
        'addCoffee',
        'cleanCode',
        'fixBugs'
      ],
      isEvil: false // Stageur is good
    });
    
    // Meeting mode questions
    characterCache.stageur.meetingQuestions = [
      {
        question: "I found this tutorial on efficient code algorithms. Can I present it to the team?",
        options: [
          { 
            text: "Sure, that sounds helpful!", 
            correct: true, 
            message: "Great! I'll prepare a short demo. (Removes 2 blocks from the field)" 
          },
          { 
            text: "No time for that now, maybe later.", 
            correct: false, 
            message: "I understand, we're busy. I'll just share the link in chat. (Nothing happens)" 
          }
        ]
      },
      {
        question: "Would you prefer if I refactor this module or work on the new feature?",
        options: [
          { 
            text: "Refactor first, it'll help with the new feature.", 
            correct: true, 
            message: "Exactly what I was thinking! (Removes 2 blocks from the field)" 
          },
          { 
            text: "New feature first, refactor later.", 
            correct: false, 
            message: "Sure thing, features are the priority. (Nothing happens)" 
          }
        ]
      },
      {
        question: "I noticed our test coverage is low. Should I write more tests?",
        options: [
          { 
            text: "Yes, good tests save time in the long run.", 
            correct: true, 
            message: "I agree! I'll set up some test automation too. (Removes 2 blocks from the field)" 
          },
          { 
            text: "We can worry about tests after the deadline.", 
            correct: false, 
            message: "I understand. I'll focus on features for now. (Nothing happens)" 
          }
        ]
      }
    ];
  }
  
  return characterCache.stageur;
}

// Create a Manager character directly without importing
function createManager() {
  if (!characterCache.manager) {
    characterCache.manager = new Character({
      name: "MANAGER",
      messages: [
        "We need to speed things up, the CEO is watching!",
        "Too many distractions, you should focus on strategic objectives!",
        "Budget cuts. Use a 56k modem to commit your code!"
      ],
      effects: [
        'speedupGame',
        'unstableAim',
        'limitBullets'
      ],
      isEvil: true // Manager is evil
    });

    // Add meeting questions
    characterCache.manager.meetingQuestions = [
      {
        question: "How quickly can we deliver if we pull an all-nighter?",
        options: [
          { 
            text: "By tomorrow morning, absolutely!", 
            correct: true, 
            message: "I knew I could count on you! (80% chance of adding 3 M Blocks)" 
          },
          { 
            text: "Quality work takes time, we should stick to the schedule.", 
            correct: false, 
            message: "Interesting perspective. Let's discuss it in our 6AM meeting tomorrow. (20% chance of adding 3 XXL Blocks)" 
          }
        ]
      },
      {
        question: "Can we cut testing to meet the deadline?",
        options: [
          { 
            text: "Sure, what could possibly go wrong?", 
            correct: true, 
            message: "That's the spirit! We'll fix bugs in production. (80% chance of adding 3 M Blocks)" 
          },
          { 
            text: "Skipping tests will create more work in the long run.", 
            correct: false, 
            message: "Let me introduce you to our new motto: 'Move Fast and Break Things.' (20% chance of adding 3 XXL Blocks)" 
          }
        ]
      },
      {
        question: "Do we really need documentation for this feature?",
        options: [
          { 
            text: "Nope, the code is self-documenting!", 
            correct: true, 
            message: "Exactly! Save time where we can. (80% chance of adding 3 M Blocks)" 
          },
          { 
            text: "Yes, it will help with maintenance and onboarding.", 
            correct: false, 
            message: "I'll add 'write extensive documentation' to your tasks for this weekend. (20% chance of adding 3 XXL Blocks)" 
          }
        ]
      }
    ];
  }
  
  return characterCache.manager;
}

// Factory function to get characters
export function getCharacter(type) {
  switch(type) {
    case 'businessAnalyst':
      return createBusinessAnalyst();
    case 'stageur':
      return createStageur();
    case 'manager':
      return createManager();
    default:
      // Randomly choose a character based on good/evil proportions
      const rand = Math.random();
      if (rand < CHARACTER_PROPORTIONS.EVIL) {
        // Randomly choose between evil characters
        const evilCharacters = CHARACTER_TYPES.EVIL;
        const randomEvilIndex = Math.floor(Math.random() * evilCharacters.length);
        return getCharacter(evilCharacters[randomEvilIndex]);
      } else {
        // Randomly choose between good characters
        const goodCharacters = CHARACTER_TYPES.GOOD;
        const randomGoodIndex = Math.floor(Math.random() * goodCharacters.length);
        return getCharacter(goodCharacters[randomGoodIndex]);
      }
  }
}

// Function to get all available character types
export function getAllCharacterTypes() {
  return ['businessAnalyst', 'stageur', 'manager'];
} 