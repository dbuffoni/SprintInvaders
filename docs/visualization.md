| Location | Context | Notification Text | Source File |
|----------|---------|------------------|------------|
| Header Area | Default state | "Sprint in progress" | js/entities/IncomingCallDialog.js |
| Header Area | UFO appearance | "Someone is trying to reach you out..." | js/entities/IncomingCallDialog.js |
| Header Area | Incoming call | "Incoming call" | js/entities/IncomingCallDialog.js |
| Header Area | Effect active | "[Character name]'s effect active" | js/entities/IncomingCallDialog.js |
| Header Area | Sprint change | "Sprint [number] starting..." | js/scenes/GameScene.js |
| Header Area | Game over | "Game over" | js/scenes/GameOverScene.js |
| Dialog Content | Dialog content | Character name (displayed at top of dialog) | js/entities/IncomingCallDialog.js |
| Dialog Content | Dialog content | Message text (varies by character) | js/characters.js |
| Dialog Content | Effect information | Effect description text (varies by effect) | js/entities/IncomingCallDialog.js |
| Dialog Content | Meeting mode | "A)" followed by first option text | js/entities/IncomingCallDialog.js |
| Dialog Content | Meeting mode | "B)" followed by second option text | js/entities/IncomingCallDialog.js |
| Dialog Prompts | Navigation prompt | "Press UP/DOWN to continue" | js/entities/IncomingCallDialog.js |
| Dialog Prompts | Confirmation prompt | "Press UP/DOWN again to confirm selection" | js/entities/IncomingCallDialog.js |
| Dialog Prompts | Reload prompt | "Press R to reload - [time] seconds remaining" (during bullet limit effect) | js/entities/IncomingCallDialog.js |
| Playable Area | Call trigger | "INCOMING CALL FROM [CHARACTER NAME]!" | js/entities/IncomingCall.js |
| Playable Area | Default message | "Sprint in progress..." | js/entities/IncomingCallDialog.js |
| Playable Area | Score display | "Score: [number]" | js/scenes/GameScene.js |
| Playable Area | Lives display | "[number] ☕" (coffee cup emoji representing lives) | js/scenes/GameScene.js |
| Playable Area | Sprint display | "Sprint: [number]" | js/scenes/GameScene.js |
| Status Effects | Weapon lock | "Weapon locked - [time] seconds remaining" | js/entities/IncomingCallDialog.js |
| Status Effects | Bullet limit | "Bullet limit: [number] - [time] seconds remaining" | js/entities/IncomingCallDialog.js |
| Status Effects | Game speed | "Game speed: 2x - [time] seconds remaining" | js/entities/IncomingCallDialog.js |
| Status Effects | Unstable aim | "Unstable aim - [time] seconds remaining" | js/entities/IncomingCallDialog.js |
| Block Indicators | Dependencies | "!" (exclamation mark on dependent blocks) | js/entities/ScopeBlock.js |
| Block Indicators | Category | "S" (Small), "M" (Medium), "L" (Large), "XXL" (Extra Large) | js/entities/ScopeBlock.js |
| Block Indicators | Health | Numeric value shown inside block representing remaining health | js/entities/ScopeBlock.js |