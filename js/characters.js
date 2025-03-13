class BusinessAnalyst {
  constructor() {
    this.name = "BUSINESS ANALYST";
    this.messages = [
      "We need to add just one more tiny feature!",
      "I need to validate this with the stakeholders. Can you hold on a second?",
      "Let's schedule a meeting to discuss this further."
    ];
    this.effects = [
      'addXXLBlock',
      'lockWeapon',
      'meeting'
    ];
    
    // Meeting mode questions and options
    this.meetingQuestions = [
      {
        question: "How long will it take to add a blockchain feature to the login page?",
        options: [
          { 
            text: "Two days, it's just a quick hash thing, right?", 
            correct: false, 
            message: "Thank you! Good point. (20% chance of adding 3 XXL Blocks)" 
          },
          { 
            text: "Six months, we need to rewrite everything in Rust.", 
            correct: true, 
            message: "Let's schedule a six-month kickoff to discuss the timeline. (80% chance of adding 3 M Blocks)" 
          }
        ]
      },
      {
        question: "Can you estimate how many hours to make the app 'intuitive'?",
        options: [
          { 
            text: "Four hours, I'll slap some buttons on it.", 
            correct: false, 
            message: "Thank you! We'll go with your idea. (20% chance of adding 3 XXL Blocks)"
          },
          { 
            text: "Define 'intuitive' in a 10-page spec, then we'll talk.", 
            correct: true, 
            message: "Fair point! I'll write that spec—expect it in 2027. (80% chance of adding 3 M Blocks)" 
          }
        ]
      },
      {
        question: "How fast can you fix the bug we found in prod last night?",
        options: [
          { 
            text: "Ten minutes, it's probably just a typo.", 
            correct: false, 
            message: "Thank you! I knew it was an easy fix. (20% chance of adding 3 XXL Blocks)"
          },
          { 
            text: "Depends—did anyone log it, or are we guessing?", 
            correct: true, 
            message: "No ticket, no clue—let's move on before someone notices! (80% chance of adding 3 M Blocks)" 
          }
        ]
      },
      {
        question: "How long to make the button vaporize when you hover over it?",
        options: [
          { 
            text: "One hour, CSS is my jam.", 
            correct: false, 
            message: "Perfect! Just what I wanted to hear. (20% chance of adding 3 XXL Blocks)" 
          },
          { 
            text: "A month, I'll build a vaporization engine from scratch.", 
            correct: true, 
            message: "Genius! I'll pitch 'GlowEngine Pro' to the CEO—let's brainstorm names now! (80% chance of adding 3 M Blocks)" 
          }
        ]
      },
      {
        question: "What's your ETA for integrating the AI chatbot the Salesperson promised?",
        options: [
          { 
            text: "Next sprint, I'll just copy-paste ChatGPT to it.", 
            correct: false, 
            message: "That's the right attitude! Quick and easy. (20% chance of adding 3 XXL Blocks)" 
          },
          { 
            text: "When Sales learns to code it themselves.", 
            correct: true, 
            message: "Ha! I'd pay to see that! Ops... ears everywhere. (80% chance of adding 3 M Blocks)" 
          }
        ]
      },
      {
        question: "How many story points for rewriting the app in quantum computer code?",
        options: [
          { 
            text: "Five points, it's basically JavaScript, right?", 
            correct: true, 
            message: "You're absolutely right! Should be easy. (20% chance of adding 3 XXL Blocks)" 
          },
          { 
            text: "Infinity points, because .... whaaat?", 
            correct: false, 
            message: "Let's watch a quantum computing tutorial together right now! (80% chance of adding 3 M Blocks)" 
          }
        ]
      }
    ];
  }
}

// Factory function to get characters
export function getCharacter(type) {
  switch(type) {
    case 'businessAnalyst':
      return new BusinessAnalyst();
    // Add more characters here in the future
    default:
      return new BusinessAnalyst();
  }
} 