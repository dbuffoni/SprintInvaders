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
      'meetingMode'
    ];
    
    // Meeting mode questions and options
    this.meetingQuestions = [
      {
        question: "How long will it take to add a blockchain feature to the login page?",
        options: [
          { text: "Two days, it's just a quick hash thing, right?", correct: true , message: "Thank you but, you know what, we can leave without it." },
          { text: "Six months, we need to rewrite everything in Rust.", correct: false, message: "Let's schedule a six-month kickoff to discuss the timeline." }
        ]
      },
      {
        question: "Can you estimate how many hours to make the app 'intuitive'?",
        options: [
          { text: "Four hours, I'll slap some buttons on it.", correct: true , message: "Thank you but, you know what, we can leave without it."},
          { text: "Define 'intuitive' in a 10-page spec, then we'll talk.", correct: false, message: "Fair point! I'll write that spec—expect it in 2027." }
        ]
      },
      {
        question: "How fast can you fix the bug we found in prod last night?",
        options: [
          { text: "Ten minutes, it's probably just a typo.", correct: true , message: "Thank you but, you know what, we can leave without it."},
          { text: "Depends—did anyone log it, or are we guessing?", correct: false, message: "No ticket, no clue—let's move on before someone notices!" }
        ]
      },
      {
        question: "How long to make the button vaporize when you hover over it?",
        options: [
          { text: "One hour, CSS is my jam.", correct: true , message: "Thank you but, you know what, we can leave without it."},
          { text: "A month, I'll build a vaporization engine from scratch.", correct: false, message: "Genius! I'll pitch 'VaporeEngine Pro' to the CEO—let's brainstorm names now!" }
        ]
      },
      {
        question: "What's your ETA for integrating the AI chatbot the Salesperson promised?",
        options: [
          { text: "Next sprint, I'll just copy-paste ChatGPT to it.", correct: true , message: "Thank you but, you know what, we can leave without it."},
          { text: "When Sales learns to code it themselves.", correct: false, message: "Ha! I'd pay to see that! Ops..." }
        ]
      },
      {
        question: "How many story points for rewriting the app in quantum computer code?",
        options: [
          { text: "Five points, it's basically JavaScript, right?", correct: true, message: "Thank you but, you know what, we can leave without it." },
          { text: "Infinity points, because it looks complex", correct: false, message: "let's watch a tutorial together right now! " }
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