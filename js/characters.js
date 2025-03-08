class BusinessAnalyst {
  constructor() {
    this.name = "Business Analyst";
    this.messages = [
      "I've analyzed the requirements, and we need to add just one more feature!",
      "I need to validate this with the stakeholders. Can you hold on a second?",
      "Let's schedule a meeting to discuss this further."
    ];
    this.effects = [
      'addXXLBlock',
      'lockWeapon',
      'meetingMode'
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