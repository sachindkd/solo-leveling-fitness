import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertQuestSchema, 
  insertWorkoutSchema, 
  insertShopItemSchema, 
  insertEventSchema, 
  insertUserQuestSchema,
  insertUserItemSchema,
  StatType
} from "@shared/schema";
import { generateWorkoutSuggestion, generateQuestSuggestion } from "./openai";
import { add } from "date-fns";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

// Middleware to check if user is admin
const isAdmin = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user?.isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Admin access required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // User related routes
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only allow admin or the user themselves to access their data
      if (!req.user!.isAdmin && req.user!.id !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  app.patch("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const updates = req.body;
      const userId = parseInt(req.params.id);
      
      // Don't allow password updates through this endpoint
      if (updates.password) {
        delete updates.password;
      }
      
      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error updating user" });
    }
  });

  // Quest related routes
  app.get("/api/quests", isAuthenticated, async (req, res) => {
    try {
      const quests = await storage.getAllQuests();
      res.json(quests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching quests" });
    }
  });

  app.get("/api/quests/active", isAuthenticated, async (req, res) => {
    try {
      const activeQuests = await storage.getActiveQuests();
      res.json(activeQuests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching active quests" });
    }
  });

  app.get("/api/quests/:id", isAuthenticated, async (req, res) => {
    try {
      const quest = await storage.getQuest(parseInt(req.params.id));
      if (!quest) {
        return res.status(404).json({ message: "Quest not found" });
      }
      res.json(quest);
    } catch (error) {
      res.status(500).json({ message: "Error fetching quest" });
    }
  });

  app.post("/api/quests", isAdmin, async (req, res) => {
    try {
      const questData = insertQuestSchema.parse(req.body);
      const newQuest = await storage.createQuest(questData);
      res.status(201).json(newQuest);
    } catch (error) {
      res.status(400).json({ message: "Invalid quest data" });
    }
  });

  app.patch("/api/quests/:id", isAdmin, async (req, res) => {
    try {
      const questId = parseInt(req.params.id);
      const updates = req.body;
      const updatedQuest = await storage.updateQuest(questId, updates);
      if (!updatedQuest) {
        return res.status(404).json({ message: "Quest not found" });
      }
      res.json(updatedQuest);
    } catch (error) {
      res.status(500).json({ message: "Error updating quest" });
    }
  });

  app.delete("/api/quests/:id", isAdmin, async (req, res) => {
    try {
      const questId = parseInt(req.params.id);
      const success = await storage.deleteQuest(questId);
      if (!success) {
        return res.status(404).json({ message: "Quest not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting quest" });
    }
  });

  // User quest related routes
  app.get("/api/user-quests", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const userQuests = await storage.getUserQuests(userId);
      res.json(userQuests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user quests" });
    }
  });

  app.get("/api/user-quests/active", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const activeUserQuests = await storage.getUserActiveQuests(userId);
      
      // Fetch the full quest details for each user quest
      const detailedQuests = await Promise.all(
        activeUserQuests.map(async (userQuest) => {
          const quest = await storage.getQuest(userQuest.questId);
          return {
            ...userQuest,
            quest
          };
        })
      );
      
      res.json(detailedQuests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching active user quests" });
    }
  });

  app.get("/api/user-quests/completed", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const completedUserQuests = await storage.getUserCompletedQuests(userId);
      
      // Fetch the full quest details for each user quest
      const detailedQuests = await Promise.all(
        completedUserQuests.map(async (userQuest) => {
          const quest = await storage.getQuest(userQuest.questId);
          return {
            ...userQuest,
            quest
          };
        })
      );
      
      res.json(detailedQuests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching completed user quests" });
    }
  });

  app.post("/api/user-quests", isAuthenticated, async (req, res) => {
    try {
      const userQuestData = insertUserQuestSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      // Check if the user already has this quest
      const existingUserQuest = await storage.getUserQuest(userQuestData.userId, userQuestData.questId);
      if (existingUserQuest) {
        return res.status(400).json({ message: "Quest already accepted" });
      }
      
      // Check if the quest exists
      const quest = await storage.getQuest(userQuestData.questId);
      if (!quest) {
        return res.status(404).json({ message: "Quest not found" });
      }
      
      const newUserQuest = await storage.createUserQuest(userQuestData);
      res.status(201).json(newUserQuest);
    } catch (error) {
      res.status(400).json({ message: "Invalid user quest data" });
    }
  });

  app.patch("/api/user-quests/:id", isAuthenticated, async (req, res) => {
    try {
      const userQuestId = parseInt(req.params.id);
      const updates = req.body;
      
      // Get the user quest
      const userQuest = await storage.userQuests.get(userQuestId);
      if (!userQuest) {
        return res.status(404).json({ message: "User quest not found" });
      }
      
      // Ensure the user can only update their own quests
      if (userQuest.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedUserQuest = await storage.updateUserQuest(userQuestId, updates);
      
      // If quest is completed, reward the user
      if (updates.completed && !userQuest.completed) {
        const quest = await storage.getQuest(userQuest.questId);
        if (quest) {
          // Award XP and coins
          await storage.levelUpUser(userQuest.userId, quest.xpReward);
          await storage.updateUserCoins(userQuest.userId, quest.coinReward);
          
          // Increase the related stat
          await storage.increaseUserStat(
            userQuest.userId, 
            quest.targetStat as StatType, 
            Math.ceil(quest.requiredAmount / 10)
          );
        }
      }
      
      res.json(updatedUserQuest);
    } catch (error) {
      res.status(500).json({ message: "Error updating user quest" });
    }
  });

  app.post("/api/user-quests/:id/progress", isAuthenticated, async (req, res) => {
    try {
      const userQuestId = parseInt(req.params.id);
      const { amount = 1 } = req.body;
      
      // Get the user quest
      const userQuest = await storage.userQuests.get(userQuestId);
      if (!userQuest) {
        return res.status(404).json({ message: "User quest not found" });
      }
      
      // Ensure the user can only update their own quests
      if (userQuest.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Get the quest to check requirements
      const quest = await storage.getQuest(userQuest.questId);
      if (!quest) {
        return res.status(404).json({ message: "Quest not found" });
      }
      
      // Calculate new progress
      const newProgress = Math.min(userQuest.progress + amount, quest.requiredAmount);
      const completed = newProgress >= quest.requiredAmount;
      
      // Update the user quest
      const updatedUserQuest = await storage.updateUserQuest(userQuestId, {
        progress: newProgress,
        completed
      });
      
      // If quest is now completed, reward the user
      if (completed && !userQuest.completed) {
        // Award XP and coins
        await storage.levelUpUser(userQuest.userId, quest.xpReward);
        await storage.updateUserCoins(userQuest.userId, quest.coinReward);
        
        // Increase the related stat
        await storage.increaseUserStat(
          userQuest.userId, 
          quest.targetStat as StatType, 
          Math.ceil(quest.requiredAmount / 10)
        );
      }
      
      res.json(updatedUserQuest);
    } catch (error) {
      res.status(500).json({ message: "Error updating quest progress" });
    }
  });

  // Workout related routes
  app.get("/api/workouts", isAuthenticated, async (req, res) => {
    try {
      const workouts = await storage.getAllWorkouts();
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching workouts" });
    }
  });

  app.get("/api/workouts/recommended", isAuthenticated, async (req, res) => {
    try {
      // Get workouts matching user's rank and job
      const { rank, job, stats } = req.user!;
      
      // Try to find a matching workout first
      let recommendedWorkouts = await storage.getWorkoutsByRank(rank);
      recommendedWorkouts = recommendedWorkouts.filter(w => w.targetJob === job);
      
      if (recommendedWorkouts.length > 0) {
        // Return a random workout from the matches
        const randomIndex = Math.floor(Math.random() * recommendedWorkouts.length);
        return res.json(recommendedWorkouts[randomIndex]);
      }
      
      // If no matching workout, generate one with OpenAI
      const aiWorkout = await generateWorkoutSuggestion(stats, rank, job);
      
      // Save the generated workout for future use
      const newWorkout = await storage.createWorkout({
        ...aiWorkout,
        targetRank: rank,
        targetJob: job
      });
      
      res.json(newWorkout);
    } catch (error) {
      res.status(500).json({ message: "Error generating recommended workout" });
    }
  });

  app.get("/api/workouts/by-rank/:rank", isAuthenticated, async (req, res) => {
    try {
      const workouts = await storage.getWorkoutsByRank(req.params.rank);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching workouts by rank" });
    }
  });

  app.get("/api/workouts/by-job/:job", isAuthenticated, async (req, res) => {
    try {
      const workouts = await storage.getWorkoutsByJob(req.params.job);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching workouts by job" });
    }
  });

  app.get("/api/workouts/:id", isAuthenticated, async (req, res) => {
    try {
      const workout = await storage.getWorkout(parseInt(req.params.id));
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.json(workout);
    } catch (error) {
      res.status(500).json({ message: "Error fetching workout" });
    }
  });

  app.post("/api/workouts", isAdmin, async (req, res) => {
    try {
      const workoutData = insertWorkoutSchema.parse(req.body);
      const newWorkout = await storage.createWorkout(workoutData);
      res.status(201).json(newWorkout);
    } catch (error) {
      res.status(400).json({ message: "Invalid workout data" });
    }
  });

  app.patch("/api/workouts/:id", isAdmin, async (req, res) => {
    try {
      const workoutId = parseInt(req.params.id);
      const updates = req.body;
      const updatedWorkout = await storage.updateWorkout(workoutId, updates);
      if (!updatedWorkout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.json(updatedWorkout);
    } catch (error) {
      res.status(500).json({ message: "Error updating workout" });
    }
  });

  app.delete("/api/workouts/:id", isAdmin, async (req, res) => {
    try {
      const workoutId = parseInt(req.params.id);
      const success = await storage.deleteWorkout(workoutId);
      if (!success) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting workout" });
    }
  });

  // Shop related routes
  app.get("/api/shop-items", isAuthenticated, async (req, res) => {
    try {
      const shopItems = await storage.getAllShopItems();
      res.json(shopItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching shop items" });
    }
  });

  app.get("/api/shop-items/:id", isAuthenticated, async (req, res) => {
    try {
      const shopItem = await storage.getShopItem(parseInt(req.params.id));
      if (!shopItem) {
        return res.status(404).json({ message: "Shop item not found" });
      }
      res.json(shopItem);
    } catch (error) {
      res.status(500).json({ message: "Error fetching shop item" });
    }
  });

  app.post("/api/shop-items", isAdmin, async (req, res) => {
    try {
      const shopItemData = insertShopItemSchema.parse(req.body);
      const newShopItem = await storage.createShopItem(shopItemData);
      res.status(201).json(newShopItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid shop item data" });
    }
  });

  app.patch("/api/shop-items/:id", isAdmin, async (req, res) => {
    try {
      const shopItemId = parseInt(req.params.id);
      const updates = req.body;
      const updatedShopItem = await storage.updateShopItem(shopItemId, updates);
      if (!updatedShopItem) {
        return res.status(404).json({ message: "Shop item not found" });
      }
      res.json(updatedShopItem);
    } catch (error) {
      res.status(500).json({ message: "Error updating shop item" });
    }
  });

  app.delete("/api/shop-items/:id", isAdmin, async (req, res) => {
    try {
      const shopItemId = parseInt(req.params.id);
      const success = await storage.deleteShopItem(shopItemId);
      if (!success) {
        return res.status(404).json({ message: "Shop item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting shop item" });
    }
  });

  // User item related routes
  app.get("/api/user-items", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const userItems = await storage.getUserItems(userId);
      
      // Get full item details
      const detailedItems = await Promise.all(
        userItems.map(async (userItem) => {
          const item = await storage.getShopItem(userItem.itemId);
          return {
            ...userItem,
            item
          };
        })
      );
      
      res.json(detailedItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user items" });
    }
  });

  app.post("/api/shop-items/:id/purchase", isAuthenticated, async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const userId = req.user!.id;
      const { quantity = 1 } = req.body;
      
      // Get the shop item
      const shopItem = await storage.getShopItem(itemId);
      if (!shopItem) {
        return res.status(404).json({ message: "Shop item not found" });
      }
      
      // Check if user has enough coins
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const totalCost = shopItem.price * quantity;
      if (user.coins < totalCost) {
        return res.status(400).json({ message: "Not enough coins" });
      }
      
      // Check if user already has this item
      const existingUserItem = await storage.getUserItem(userId, itemId);
      
      let userItem;
      if (existingUserItem) {
        // Update quantity
        userItem = await storage.updateUserItem(existingUserItem.id, {
          quantity: existingUserItem.quantity + quantity
        });
      } else {
        // Create new user item
        userItem = await storage.createUserItem({
          userId,
          itemId,
          quantity
        });
      }
      
      // Deduct coins from user
      await storage.updateUserCoins(userId, -totalCost);
      
      // Return updated user item with shop item details
      res.status(201).json({
        ...userItem,
        item: shopItem
      });
    } catch (error) {
      res.status(500).json({ message: "Error purchasing item" });
    }
  });

  // Event related routes
  app.get("/api/events", isAuthenticated, async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Error fetching events" });
    }
  });

  app.get("/api/events/active", isAuthenticated, async (req, res) => {
    try {
      const activeEvents = await storage.getActiveEvents();
      res.json(activeEvents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching active events" });
    }
  });

  app.get("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const event = await storage.getEvent(parseInt(req.params.id));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Error fetching event" });
    }
  });

  app.post("/api/events", isAdmin, async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const newEvent = await storage.createEvent(eventData);
      res.status(201).json(newEvent);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  app.patch("/api/events/:id", isAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const updates = req.body;
      const updatedEvent = await storage.updateEvent(eventId, updates);
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(updatedEvent);
    } catch (error) {
      res.status(500).json({ message: "Error updating event" });
    }
  });

  app.delete("/api/events/:id", isAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const success = await storage.deleteEvent(eventId);
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting event" });
    }
  });

  // Leveling and stats related routes
  app.post("/api/training/:stat", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const stat = req.params.stat as StatType;
      const { amount = 1 } = req.body;
      
      // Validate stat
      if (!["strength", "stamina", "speed", "endurance"].includes(stat)) {
        return res.status(400).json({ message: "Invalid stat type" });
      }
      
      // Increase the stat
      const updatedUser = await storage.increaseUserStat(userId, stat, amount);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Award XP based on amount and user's rank
      const rankIndex = ["E", "D", "C", "B", "A", "S", "SS"].indexOf(updatedUser.rank);
      const xpMultiplier = rankIndex + 1;
      const xpGained = amount * 10 * xpMultiplier;
      
      // Level up the user
      const leveledUser = await storage.levelUpUser(userId, xpGained);
      
      // Check active quests for this stat type and update progress
      const userQuests = await storage.getUserActiveQuests(userId);
      const relevantQuests = [];
      
      for (const userQuest of userQuests) {
        const quest = await storage.getQuest(userQuest.questId);
        if (quest && quest.targetStat === stat) {
          await storage.updateUserQuest(userQuest.id, {
            progress: Math.min(userQuest.progress + amount, quest.requiredAmount),
            completed: userQuest.progress + amount >= quest.requiredAmount
          });
          
          // If quest is now completed, add rewards
          if (userQuest.progress + amount >= quest.requiredAmount && !userQuest.completed) {
            await storage.levelUpUser(userId, quest.xpReward);
            await storage.updateUserCoins(userId, quest.coinReward);
          }
          
          relevantQuests.push(userQuest);
        }
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = leveledUser!;
      
      res.json({
        user: userWithoutPassword,
        statIncreased: stat,
        amountIncreased: amount,
        xpGained,
        updatedQuests: relevantQuests.length > 0 ? relevantQuests : undefined
      });
    } catch (error) {
      res.status(500).json({ message: "Error during training" });
    }
  });

  app.post("/api/rank-up", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get current rank index
      const ranks = ["E", "D", "C", "B", "A", "S", "SS"];
      const currentRankIndex = ranks.indexOf(user.rank);
      
      // Check if user can rank up
      if (currentRankIndex >= ranks.length - 1) {
        return res.status(400).json({ message: "Already at maximum rank" });
      }
      
      // Check if user meets requirements
      const requiredLevel = (currentRankIndex + 2) * 5; // E->D = level 10, D->C = level 15, etc.
      if (user.level < requiredLevel) {
        return res.status(400).json({ 
          message: `Level ${requiredLevel} required to rank up to ${ranks[currentRankIndex + 1]}-Rank` 
        });
      }
      
      // Check if all stats meet minimum requirements (25 per rank)
      const minStatValue = (currentRankIndex + 1) * 25;
      const statRequirements = {};
      let statsMeetRequirements = true;
      
      for (const stat of ["strength", "stamina", "speed", "endurance"]) {
        statRequirements[stat] = minStatValue;
        if (user.stats[stat] < minStatValue) {
          statsMeetRequirements = false;
        }
      }
      
      if (!statsMeetRequirements) {
        return res.status(400).json({ 
          message: "Stats too low for rank-up", 
          requirements: statRequirements 
        });
      }
      
      // Perform rank up
      const newRank = ranks[currentRankIndex + 1];
      const updatedUser = await storage.changeUserRank(userId, newRank);
      
      // Update job based on new rank
      const jobs = ["Novice Hunter", "Assassin", "Berserker", "Mage", "Tank", "Warlock", "Shadow Monarch"];
      const newJob = jobs[currentRankIndex + 1];
      await storage.changeUserJob(userId, newJob);
      
      // Add coins reward for ranking up
      const coinsReward = (currentRankIndex + 2) * 500;
      await storage.updateUserCoins(userId, coinsReward);
      
      // Get final updated user
      const finalUser = await storage.getUser(userId);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = finalUser!;
      
      res.json({
        user: userWithoutPassword,
        previousRank: user.rank,
        newRank,
        newJob,
        coinsRewarded: coinsReward
      });
    } catch (error) {
      res.status(500).json({ message: "Error during rank-up" });
    }
  });

  // AI quest generation
  app.post("/api/quests/generate", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Generate quest with AI
      const questData = await generateQuestSuggestion(user.stats, user.rank);
      
      // Set expiration date based on type
      const now = new Date();
      let expiresAt;
      if (questData.type === "daily") {
        expiresAt = add(now, { days: 1 });
      } else {
        expiresAt = add(now, { weeks: 1 });
      }
      
      // Create the quest
      const newQuest = await storage.createQuest({
        ...questData,
        expiresAt
      });
      
      // Assign quest to user
      const userQuest = await storage.createUserQuest({
        userId,
        questId: newQuest.id,
        progress: 0,
        completed: false
      });
      
      res.status(201).json({
        quest: newQuest,
        userQuest
      });
    } catch (error) {
      res.status(500).json({ message: "Error generating quest" });
    }
  });

  // Leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Calculate total XP (level * 500 + xp)
      const usersWithTotalXp = users.map(user => {
        const totalXp = ((user.level - 1) * 500) + user.xp;
        const { password, ...userWithoutPassword } = user;
        return {
          ...userWithoutPassword,
          totalXp
        };
      });
      
      // Sort by total XP
      const sortedUsers = usersWithTotalXp.sort((a, b) => b.totalXp - a.totalXp);
      
      res.json(sortedUsers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
