import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key" });

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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an AI fitness trainer in a Solo Leveling inspired fitness RPG. Generate a personalized workout routine based on the user's stats, rank, and job class. Focus on the user's highest stat for best results.",
        },
        {
          role: "user",
          content: `Create a workout routine for a ${userRank}-Rank ${userJob} with the following stats: Strength: ${userStats.strength}, Stamina: ${userStats.stamina}, Speed: ${userStats.speed}, Endurance: ${userStats.endurance}. Their highest stat is ${highestStat.name} at ${highestStat.value}.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Parse the response into the required format
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Default fallback if the AI response doesn't match expected format
    const defaultWorkout = {
      title: `${userJob} ${highestStat.name.charAt(0).toUpperCase() + highestStat.name.slice(1)} Training`,
      description: `Personalized workout for ${userRank}-Rank ${userJob} focused on ${highestStat.name}`,
      exercises: [
        { name: "Push-ups", sets: 3, reps: "10" },
        { name: "Squats", sets: 3, reps: "15" },
        { name: "Planks", sets: 3, reps: "30s" }
      ],
      targetStat: highestStat.name
    };
    
    // Ensure the response has all required fields
    return {
      title: result.title || defaultWorkout.title,
      description: result.description || defaultWorkout.description,
      exercises: result.exercises || defaultWorkout.exercises,
      targetStat: result.targetStat || defaultWorkout.targetStat
    };
  } catch (error) {
    console.error("Error generating workout suggestion:", error);
    
    // Return fallback workout if AI fails
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an AI quest generator in a Solo Leveling inspired fitness RPG. Generate a personalized quest based on the user's stats and rank. Focus on improving their lowest stat.",
        },
        {
          role: "user",
          content: `Create a quest for a ${userRank}-Rank hunter with the following stats: Strength: ${userStats.strength}, Stamina: ${userStats.stamina}, Speed: ${userStats.speed}, Endurance: ${userStats.endurance}. Their lowest stat is ${lowestStat.name} at ${lowestStat.value}.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Parse the response into the required format
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Default fallback if the AI response doesn't match expected format
    const defaultQuest = {
      title: `Improve Your ${lowestStat.name.charAt(0).toUpperCase() + lowestStat.name.slice(1)}`,
      description: `Complete exercises to boost your ${lowestStat.name}`,
      type: "daily",
      xpReward: 50,
      coinReward: 100,
      targetStat: lowestStat.name,
      requiredAmount: 5
    };
    
    // Calculate rewards based on rank
    const rankMultiplier = ["E", "D", "C", "B", "A", "S", "SS"].indexOf(userRank) + 1;
    const baseXP = 50;
    const baseCoins = 100;
    
    // Ensure the response has all required fields
    return {
      title: result.title || defaultQuest.title,
      description: result.description || defaultQuest.description,
      type: result.type || defaultQuest.type,
      xpReward: result.xpReward || baseXP * rankMultiplier,
      coinReward: result.coinReward || baseCoins * rankMultiplier,
      targetStat: result.targetStat || defaultQuest.targetStat,
      requiredAmount: result.requiredAmount || defaultQuest.requiredAmount
    };
  } catch (error) {
    console.error("Error generating quest suggestion:", error);
    
    // Return fallback quest if AI fails
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
