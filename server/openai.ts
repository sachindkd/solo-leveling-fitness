 // Predefined workout templates based on user stats and job class
// This file replaces the OpenAI implementation with predefined templates

// Template workouts by job
const WORKOUT_TEMPLATES = {
  "Novice Hunter": {
    "strength": {
      title: "Novice Strength Builder",
      description: "Basic strength training for beginners",
      exercises: [
        { name: "Push-ups", sets: 3, reps: "10" },
        { name: "Bodyweight Squats", sets: 3, reps: "15" },
        { name: "Planks", sets: 3, reps: "30s" }
      ]
    },
    "stamina": {
      title: "Novice Endurance Training",
      description: "Basic stamina building for beginners",
      exercises: [
        { name: "Jumping Jacks", sets: 3, reps: "30s" },
        { name: "High Knees", sets: 3, reps: "30s" },
        { name: "Jogging in Place", sets: 3, reps: "1m" }
      ]
    },
    "speed": {
      title: "Novice Speed Training",
      description: "Basic speed development for beginners",
      exercises: [
        { name: "Burpees", sets: 3, reps: "10" },
        { name: "Mountain Climbers", sets: 3, reps: "15 each leg" },
        { name: "Jump Rope", sets: 3, reps: "30s" }
      ]
    },
    "endurance": {
      title: "Novice Endurance Builder",
      description: "Basic endurance training for beginners",
      exercises: [
        { name: "Wall Sit", sets: 3, reps: "30s" },
        { name: "Bicycle Crunches", sets: 3, reps: "15 each side" },
        { name: "Plank Shoulder Taps", sets: 3, reps: "10 each arm" }
      ]
    }
  },
  "Assassin": {
    "strength": {
      title: "Assassin's Strength Circuit",
      description: "Focused strength training for Assassin-class hunters",
      exercises: [
        { name: "Pull-ups", sets: 3, reps: "8" },
        { name: "Push-ups with Clap", sets: 3, reps: "12" },
        { name: "Pistol Squats", sets: 2, reps: "5 each leg" }
      ]
    },
    "stamina": {
      title: "Assassin's Stamina Builder",
      description: "Specialized stamina training for Assassin-class hunters",
      exercises: [
        { name: "Box Jumps", sets: 4, reps: "12" },
        { name: "Burpees", sets: 3, reps: "15" },
        { name: "Jump Rope - Double Unders", sets: 3, reps: "30s" }
      ]
    },
    "speed": {
      title: "Shadow Step Training",
      description: "Advanced speed drills for Assassin-class hunters",
      exercises: [
        { name: "High-Knee Sprints", sets: 5, reps: "20s" },
        { name: "Lateral Jumps", sets: 4, reps: "10 each side" },
        { name: "Agility Ladder Drills", sets: 3, reps: "30s" }
      ]
    },
    "endurance": {
      title: "Assassin's Endurance Protocol",
      description: "Endurance training designed for Assassin-class hunters",
      exercises: [
        { name: "Wall Climb", sets: 3, reps: "45s" },
        { name: "Hanging Leg Raises", sets: 3, reps: "12" },
        { name: "Side Plank with Rotation", sets: 3, reps: "10 each side" }
      ]
    }
  },
  "Berserker": {
    "strength": {
      title: "Berserker's Rage Circuit",
      description: "Extreme strength training for Berserker-class hunters",
      exercises: [
        { name: "Deadlifts", sets: 5, reps: "5" },
        { name: "Weighted Push-ups", sets: 4, reps: "8" },
        { name: "Kettlebell Swings", sets: 3, reps: "15" }
      ]
    },
    "stamina": {
      title: "Berserker Stamina Challenge",
      description: "High-intensity stamina training for Berserker-class hunters",
      exercises: [
        { name: "Battle Ropes", sets: 3, reps: "30s" },
        { name: "Sledgehammer Strikes", sets: 3, reps: "15 each side" },
        { name: "Tire Flips", sets: 3, reps: "8" }
      ]
    },
    "speed": {
      title: "Berserker Speed Drills",
      description: "Power-focused speed training for Berserker-class hunters",
      exercises: [
        { name: "Box Jumps", sets: 4, reps: "8" },
        { name: "Medicine Ball Slams", sets: 3, reps: "12" },
        { name: "Explosive Push-ups", sets: 3, reps: "10" }
      ]
    },
    "endurance": {
      title: "Berserker Endurance Protocol",
      description: "Brutal endurance training for Berserker-class hunters",
      exercises: [
        { name: "Farmer's Carry", sets: 3, reps: "40s" },
        { name: "Weighted Planks", sets: 3, reps: "45s" },
        { name: "Sandbag Carries", sets: 3, reps: "30s" }
      ]
    }
  },
  "Mage": {
    "strength": {
      title: "Mage's Core Strengthening",
      description: "Core-focused strength training for Mage-class hunters",
      exercises: [
        { name: "Stability Ball Crunches", sets: 3, reps: "15" },
        { name: "Medicine Ball Russian Twists", sets: 3, reps: "12 each side" },
        { name: "Plank with Leg Lift", sets: 3, reps: "8 each leg" }
      ]
    },
    "stamina": {
      title: "Mage's Energy Flow Circuit",
      description: "Flow-based stamina training for Mage-class hunters",
      exercises: [
        { name: "Sun Salutations", sets: 3, reps: "5 complete flows" },
        { name: "Deep Breathing Squats", sets: 3, reps: "12" },
        { name: "Flow Burpees", sets: 3, reps: "10" }
      ]
    },
    "speed": {
      title: "Mage's Quick Cast Training",
      description: "Reaction-based speed training for Mage-class hunters",
      exercises: [
        { name: "Agility Ladder Drills", sets: 4, reps: "30s" },
        { name: "Reaction Ball Drills", sets: 3, reps: "45s" },
        { name: "Direction Change Sprints", sets: 4, reps: "15s" }
      ]
    },
    "endurance": {
      title: "Mage's Mana Extension",
      description: "Mental and physical endurance training for Mage-class hunters",
      exercises: [
        { name: "Breathing Planks", sets: 3, reps: "60s" },
        { name: "Wall Sits with Arm Extension", sets: 3, reps: "45s" },
        { name: "Meditation Squat Holds", sets: 3, reps: "60s" }
      ]
    }
  },
  "Tank": {
    "strength": {
      title: "Tank's Fortress Builder",
      description: "Heavy strength training for Tank-class hunters",
      exercises: [
        { name: "Goblet Squats", sets: 4, reps: "10" },
        { name: "Dumbbell Rows", sets: 3, reps: "12 each arm" },
        { name: "Weighted Lunges", sets: 3, reps: "10 each leg" }
      ]
    },
    "stamina": {
      title: "Tank's Resilience Circuit",
      description: "Stamina training for Tank-class hunters",
      exercises: [
        { name: "Weighted Step-ups", sets: 3, reps: "12 each leg" },
        { name: "Rucksack Walks", sets: 3, reps: "2 minutes" },
        { name: "Wall Ball Shots", sets: 3, reps: "15" }
      ]
    },
    "speed": {
      title: "Tank's Defensive Movement",
      description: "Agility-focused speed training for Tank-class hunters",
      exercises: [
        { name: "Lateral Shuffles", sets: 4, reps: "20s each direction" },
        { name: "Defensive Slides", sets: 3, reps: "30s" },
        { name: "Quick Direction Changes", sets: 4, reps: "15s" }
      ]
    },
    "endurance": {
      title: "Tank's Unbreakable Protocol",
      description: "Extreme endurance training for Tank-class hunters",
      exercises: [
        { name: "Weighted Vest Walk", sets: 2, reps: "5 minutes" },
        { name: "Farmer's Carry", sets: 3, reps: "60s" },
        { name: "Weighted Plank", sets: 3, reps: "60s" }
      ]
    }
  },
  "Warlock": {
    "strength": {
      title: "Warlock's Dark Power",
      description: "Mysterious strength training for Warlock-class hunters",
      exercises: [
        { name: "Weighted Pull-ups", sets: 4, reps: "8" },
        { name: "Skull Crushers", sets: 3, reps: "12" },
        { name: "Dragon Flags", sets: 3, reps: "6" }
      ]
    },
    "stamina": {
      title: "Warlock's Mana Circuit",
      description: "Dark energy stamina training for Warlock-class hunters",
      exercises: [
        { name: "Shadow Boxing", sets: 3, reps: "45s" },
        { name: "Tabata Protocol", sets: 4, reps: "20s work/10s rest" },
        { name: "Circuit Training", sets: 2, reps: "3 minutes" }
      ]
    },
    "speed": {
      title: "Warlock's Shadow Step",
      description: "Supernatural speed training for Warlock-class hunters",
      exercises: [
        { name: "Shadow Sprints", sets: 5, reps: "15s" },
        { name: "Bounding Leaps", sets: 4, reps: "8 each leg" },
        { name: "Explosive Transitions", sets: 3, reps: "10" }
      ]
    },
    "endurance": {
      title: "Warlock's Eternal Darkness",
      description: "Soul-draining endurance training for Warlock-class hunters",
      exercises: [
        { name: "Weighted Wall Sits", sets: 3, reps: "90s" },
        { name: "L-Sit Progression", sets: 3, reps: "30s" },
        { name: "Hollow Body Holds", sets: 3, reps: "60s" }
      ]
    }
  },
  "Shadow Monarch": {
    "strength": {
      title: "Monarch's Domain",
      description: "Ultimate strength training for Shadow Monarch-class hunters",
      exercises: [
        { name: "Weighted Muscle-ups", sets: 4, reps: "6" },
        { name: "Heavy Deadlifts", sets: 5, reps: "5" },
        { name: "One-Arm Push-up Progression", sets: 3, reps: "5 each arm" }
      ]
    },
    "stamina": {
      title: "Arise Protocol",
      description: "Ultimate stamina building for Shadow Monarch-class hunters",
      exercises: [
        { name: "Hurricane Training", sets: 3, reps: "2 minutes" },
        { name: "CrossFit WOD", sets: 1, reps: "10 minute AMRAP" },
        { name: "VO2 Max Training", sets: 4, reps: "4 minute cycles" }
      ]
    },
    "speed": {
      title: "Shadow Rush",
      description: "Supernatural speed development for Shadow Monarch-class hunters",
      exercises: [
        { name: "Flying Sprints", sets: 6, reps: "20s" },
        { name: "Depth Jumps", sets: 4, reps: "8" },
        { name: "Olympic Lifts", sets: 4, reps: "5" }
      ]
    },
    "endurance": {
      title: "Eternal Monarch",
      description: "God-tier endurance training for Shadow Monarch-class hunters",
      exercises: [
        { name: "Iron Crucible", sets: 3, reps: "2 minutes" },
        { name: "Mace 360s", sets: 3, reps: "20 each direction" },
        { name: "Loaded Carries Complex", sets: 2, reps: "5 minutes" }
      ]
    }
  }
};

// Quest templates based on stat focus
const QUEST_TEMPLATES = {
  "strength": [
    {
      title: "Power Within",
      description: "Complete strength exercises to unlock your hidden potential",
      type: "daily",
      requiredAmount: 5
    },
    {
      title: "Mighty Hunter",
      description: "Demonstrate your strength through intense training",
      type: "daily",
      requiredAmount: 8
    },
    {
      title: "Surge of Power",
      description: "Push your strength to new limits with focused exercises",
      type: "daily",
      requiredAmount: 10
    }
  ],
  "stamina": [
    {
      title: "Endless Energy",
      description: "Build your stamina through persistent training",
      type: "daily",
      requiredAmount: 6
    },
    {
      title: "Breathing Control",
      description: "Master your stamina through controlled breathing exercises",
      type: "daily",
      requiredAmount: 8
    },
    {
      title: "Mana Extension",
      description: "Expand your energy reserves through challenging stamina drills",
      type: "daily",
      requiredAmount: 12
    }
  ],
  "speed": [
    {
      title: "Lightning Reflexes",
      description: "Sharpen your speed with quick, explosive movements",
      type: "daily",
      requiredAmount: 5
    },
    {
      title: "Shadow Step",
      description: "Move like a shadow with these speed-enhancing exercises",
      type: "daily",
      requiredAmount: 8
    },
    {
      title: "Time Warp",
      description: "Train to move so fast that time seems to slow down around you",
      type: "daily",
      requiredAmount: 15
    }
  ],
  "endurance": [
    {
      title: "Unbreakable",
      description: "Build your endurance to withstand any challenge",
      type: "daily",
      requiredAmount: 7
    },
    {
      title: "Last Hunter Standing",
      description: "Outlast your opponents by building superior endurance",
      type: "daily",
      requiredAmount: 10
    },
    {
      title: "Eternal Guardian",
      description: "Train your body to overcome any endurance challenge",
      type: "daily",
      requiredAmount: 12
    }
  ],
  "weekly": [
    {
      title: "Gate Clearing",
      description: "A dangerous gate has appeared! Complete a full week of training to close it",
      type: "weekly",
      requiredAmount: 25
    },
    {
      title: "Hunter Association Challenge",
      description: "The Hunter Association has issued a special training challenge",
      type: "weekly",
      requiredAmount: 30
    },
    {
      title: "Dungeon Break",
      description: "A dungeon break has occurred! Train intensely to handle the crisis",
      type: "weekly",
      requiredAmount: 35
    }
  ]
};

// Generate personalized workout suggestions based on user stats and job class
export async function generateWorkoutSuggestion(
  userStats: Record<string, number>,
  userRank: string,
  userJob: string
): Promise<{
  title: string;
  description: string;
  exercises: { name: string; sets: number; reps: string }[];
  targetStat: string;
}> {
  try {
    // Find the highest stat to focus on
    const highestStat = Object.entries(userStats).reduce(
      (highest, [stat, value]) => 
        value > highest.value ? { name: stat, value } : highest,
      { name: "", value: 0 }
    );

    // Get template based on job and highest stat
    const template = WORKOUT_TEMPLATES[userJob as keyof typeof WORKOUT_TEMPLATES]?.[highestStat.name as keyof (typeof WORKOUT_TEMPLATES)[keyof typeof WORKOUT_TEMPLATES]];
    
    if (template) {
      return {
        ...template,
        targetStat: highestStat.name
      };
    }
    
    // Fallback if job or stat not found in templates
    return {
      title: `${userJob} ${highestStat.name.charAt(0).toUpperCase() + highestStat.name.slice(1)} Training`,
      description: `Personalized workout for ${userRank}-Rank ${userJob} focused on ${highestStat.name}`,
      exercises: [
        { name: "Push-ups", sets: 3, reps: "10" },
        { name: "Squats", sets: 3, reps: "15" },
        { name: "Planks", sets: 3, reps: "30s" }
      ],
      targetStat: highestStat.name
    };
  } catch (error) {
    console.error("Error generating workout suggestion:", error);
    
    // Return fallback workout if something fails
    return {
      title: "Basic Training Routine",
      description: "A general workout to improve overall fitness",
      exercises: [
        { name: "Push-ups", sets: 3, reps: "10" },
        { name: "Squats", sets: 3, reps: "15" },
        { name: "Planks", sets: 3, reps: "30s" }
      ],
      targetStat: "strength"
    };
  }
}

// Generate personalized quest suggestions
export async function generateQuestSuggestion(
  userStats: Record<string, number>,
  userRank: string
): Promise<{
  title: string;
  description: string;
  type: string;
  xpReward: number;
  coinReward: number;
  targetStat: string;
  requiredAmount: number;
}> {
  try {
    // Find the lowest stat to improve
    const lowestStat = Object.entries(userStats).reduce(
      (lowest, [stat, value]) => 
        value < lowest.value ? { name: stat, value } : lowest,
      { name: "", value: 100 }
    );
    
    // Calculate rewards based on rank
    const rankMultiplier = ["E", "D", "C", "B", "A", "S", "SS"].indexOf(userRank) + 1;
    const baseXP = 50;
    const baseCoins = 100;
    
    // Random selection: 20% chance of weekly quest, 80% chance of daily quest
    const isWeeklyQuest = Math.random() < 0.2;
    
    // Select quest template
    let questTemplate;
    if (isWeeklyQuest) {
      // Pick a random weekly quest template
      const randomIndex = Math.floor(Math.random() * QUEST_TEMPLATES.weekly.length);
      questTemplate = { ...QUEST_TEMPLATES.weekly[randomIndex] }; // Create a copy of the template
    } else {
      // Pick a random template for the lowest stat
      const statTemplates = QUEST_TEMPLATES[lowestStat.name as keyof typeof QUEST_TEMPLATES];
      if (Array.isArray(statTemplates)) {
        const randomIndex = Math.floor(Math.random() * statTemplates.length);
        questTemplate = { ...statTemplates[randomIndex] }; // Create a copy of the template
      }
    }
    
    // Use template or fallback
    if (questTemplate) {
      return {
        title: questTemplate.title,
        description: questTemplate.description,
        type: questTemplate.type,
        xpReward: baseXP * rankMultiplier * (questTemplate.type === "weekly" ? 2 : 1),
        coinReward: baseCoins * rankMultiplier * (questTemplate.type === "weekly" ? 2 : 1),
        targetStat: lowestStat.name,
        requiredAmount: questTemplate.requiredAmount
      };
    }
    
    // Fallback quest
    return {
      title: `Improve Your ${lowestStat.name.charAt(0).toUpperCase() + lowestStat.name.slice(1)}`,
      description: `Complete exercises to boost your ${lowestStat.name}`,
      type: "daily",
      xpReward: baseXP * rankMultiplier,
      coinReward: baseCoins * rankMultiplier,
      targetStat: lowestStat.name,
      requiredAmount: 5
    };
  } catch (error) {
    console.error("Error generating quest suggestion:", error);
    
    // Return fallback quest if something fails
    return {
      title: "Basic Training Quest",
      description: "Complete a basic workout routine",
      type: "daily",
      xpReward: 50,
      coinReward: 100,
      targetStat: "strength",
      requiredAmount: 5
    };
  }
}
