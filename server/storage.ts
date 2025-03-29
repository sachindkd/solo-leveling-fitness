import {
  User,
  InsertUser,
  Quest,
  InsertQuest,
  UserQuest,
  InsertUserQuest,
  Workout,
  InsertWorkout,
  ShopItem,
  InsertShopItem,
  UserItem,
  InsertUserItem,
  Event,
  InsertEvent,
  StatType,
  RANKS,
  JOBS,
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  increaseUserStat(id: number, statType: StatType, amount: number): Promise<User | undefined>;
  levelUpUser(id: number, xpAmount: number): Promise<User | undefined>;
  changeUserRank(id: number, newRank: string): Promise<User | undefined>;
  changeUserJob(id: number, newJob: string): Promise<User | undefined>;
  updateUserCoins(id: number, amount: number): Promise<User | undefined>;

  // Quest methods
  getQuest(id: number): Promise<Quest | undefined>;
  createQuest(quest: InsertQuest): Promise<Quest>;
  updateQuest(id: number, updates: Partial<Quest>): Promise<Quest | undefined>;
  deleteQuest(id: number): Promise<boolean>;
  getAllQuests(): Promise<Quest[]>;
  getActiveQuests(): Promise<Quest[]>;

  // UserQuest methods
  getUserQuest(userId: number, questId: number): Promise<UserQuest | undefined>;
  createUserQuest(userQuest: InsertUserQuest): Promise<UserQuest>;
  updateUserQuest(id: number, updates: Partial<UserQuest>): Promise<UserQuest | undefined>;
  getUserQuests(userId: number): Promise<UserQuest[]>;
  getUserCompletedQuests(userId: number): Promise<UserQuest[]>;
  getUserActiveQuests(userId: number): Promise<UserQuest[]>;

  // Workout methods
  getWorkout(id: number): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  updateWorkout(id: number, updates: Partial<Workout>): Promise<Workout | undefined>;
  deleteWorkout(id: number): Promise<boolean>;
  getAllWorkouts(): Promise<Workout[]>;
  getWorkoutsByRank(rank: string): Promise<Workout[]>;
  getWorkoutsByJob(job: string): Promise<Workout[]>;

  // Shop methods
  getShopItem(id: number): Promise<ShopItem | undefined>;
  createShopItem(item: InsertShopItem): Promise<ShopItem>;
  updateShopItem(id: number, updates: Partial<ShopItem>): Promise<ShopItem | undefined>;
  deleteShopItem(id: number): Promise<boolean>;
  getAllShopItems(): Promise<ShopItem[]>;

  // UserItem methods
  getUserItem(userId: number, itemId: number): Promise<UserItem | undefined>;
  createUserItem(userItem: InsertUserItem): Promise<UserItem>;
  updateUserItem(id: number, updates: Partial<UserItem>): Promise<UserItem | undefined>;
  getUserItems(userId: number): Promise<UserItem[]>;

  // Event methods
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, updates: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  getAllEvents(): Promise<Event[]>;
  getActiveEvents(): Promise<Event[]>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quests: Map<number, Quest>;
  private userQuests: Map<number, UserQuest>;
  private workouts: Map<number, Workout>;
  private shopItems: Map<number, ShopItem>;
  private userItems: Map<number, UserItem>;
  private events: Map<number, Event>;
  
  sessionStore: session.SessionStore;
  
  // ID counters
  private userIdCounter: number;
  private questIdCounter: number;
  private userQuestIdCounter: number;
  private workoutIdCounter: number;
  private shopItemIdCounter: number;
  private userItemIdCounter: number;
  private eventIdCounter: number;

  constructor() {
    this.users = new Map();
    this.quests = new Map();
    this.userQuests = new Map();
    this.workouts = new Map();
    this.shopItems = new Map();
    this.userItems = new Map();
    this.events = new Map();
    
    this.userIdCounter = 1;
    this.questIdCounter = 1;
    this.userQuestIdCounter = 1;
    this.workoutIdCounter = 1;
    this.shopItemIdCounter = 1;
    this.userItemIdCounter = 1;
    this.eventIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize with some example data
    // Call the async function without awaiting
    this.seedData().catch(error => {
      console.error("Error seeding data:", error);
    });
  }

  private async seedData() {
    // Create admin user with plaintext password for simplicity
    const adminUser = await this.createUser({
      username: "admin",
      password: "sachin",
      isAdmin: true,
    });
    
    // Create a demo user account
    const demoUser = await this.createUser({
      username: "demo",
      password: "demo123",
      isAdmin: false,
    });
    
    // Create initial workouts
    this.createWorkout({
      title: "Novice Strength Training",
      description: "Basic strength training for beginners",
      exercises: [
        { name: "Push-ups", sets: 3, reps: "10" },
        { name: "Squats", sets: 3, reps: "15" },
        { name: "Planks", sets: 3, reps: "30s" }
      ],
      targetStat: "strength",
      targetRank: "E",
      targetJob: "Novice Hunter"
    });
    
    this.createWorkout({
      title: "Berserker Strength Routine",
      description: "Designed for B-Rank hunters to maximize strength gains",
      exercises: [
        { name: "Bench Press", sets: 4, reps: "8" },
        { name: "Barbell Squat", sets: 4, reps: "10" },
        { name: "Deadlift", sets: 3, reps: "6" },
        { name: "Pull-ups", sets: 3, reps: "Max" }
      ],
      targetStat: "strength",
      targetRank: "B",
      targetJob: "Berserker"
    });
    
    // Create shop items
    this.createShopItem({
      name: "XP Booster",
      description: "Double XP for a day",
      price: 500,
      type: "booster",
      effectValue: 2
    });
    
    this.createShopItem({
      name: "Cosmic Avatar",
      description: "Exclusive cosmic-themed avatar",
      price: 1000,
      type: "cosmetic",
      effectValue: 0
    });
    
    // Create events
    this.createEvent({
      title: "Rank Up Challenge",
      description: "Complete special tasks to advance to A-Rank",
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      type: "rankup"
    });
    
    this.createEvent({
      title: "Double XP Weekend",
      description: "All workouts earn 2× XP for the weekend",
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      type: "doublexp"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = {
      id,
      ...insertUser,
      rank: "E",
      job: "Novice Hunter",
      level: 1,
      xp: 0,
      coins: 100,
      stats: { strength: 10, stamina: 10, speed: 10, endurance: 10 },
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async increaseUserStat(id: number, statType: StatType, amount: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedStats = { ...user.stats };
    updatedStats[statType] = Math.min(100, updatedStats[statType] + amount);

    return this.updateUser(id, { stats: updatedStats });
  }

  async levelUpUser(id: number, xpAmount: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const currentXp = user.xp + xpAmount;
    let currentLevel = user.level;
    let remainingXp = currentXp;

    // Calculate level based on XP (500 * level for next level)
    const xpForNextLevel = 500 * currentLevel;
    if (remainingXp >= xpForNextLevel) {
      currentLevel++;
      remainingXp -= xpForNextLevel;
    }

    return this.updateUser(id, { level: currentLevel, xp: remainingXp });
  }

  async changeUserRank(id: number, newRank: string): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    // Validate rank
    if (!RANKS.includes(newRank as any)) {
      throw new Error("Invalid rank");
    }

    return this.updateUser(id, { rank: newRank });
  }

  async changeUserJob(id: number, newJob: string): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    // Validate job
    if (!JOBS.includes(newJob as any)) {
      throw new Error("Invalid job");
    }

    return this.updateUser(id, { job: newJob });
  }

  async updateUserCoins(id: number, amount: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const newCoins = Math.max(0, user.coins + amount);
    return this.updateUser(id, { coins: newCoins });
  }

  // Quest methods
  async getQuest(id: number): Promise<Quest | undefined> {
    return this.quests.get(id);
  }

  async createQuest(quest: InsertQuest): Promise<Quest> {
    const id = this.questIdCounter++;
    const now = new Date();
    const newQuest: Quest = {
      id,
      ...quest,
      createdAt: now
    };
    this.quests.set(id, newQuest);
    return newQuest;
  }

  async updateQuest(id: number, updates: Partial<Quest>): Promise<Quest | undefined> {
    const quest = await this.getQuest(id);
    if (!quest) return undefined;

    const updatedQuest = { ...quest, ...updates };
    this.quests.set(id, updatedQuest);
    return updatedQuest;
  }

  async deleteQuest(id: number): Promise<boolean> {
    return this.quests.delete(id);
  }

  async getAllQuests(): Promise<Quest[]> {
    return Array.from(this.quests.values());
  }

  async getActiveQuests(): Promise<Quest[]> {
    const now = new Date();
    return Array.from(this.quests.values()).filter(
      (quest) => new Date(quest.expiresAt) > now
    );
  }

  // UserQuest methods
  async getUserQuest(userId: number, questId: number): Promise<UserQuest | undefined> {
    return Array.from(this.userQuests.values()).find(
      (uq) => uq.userId === userId && uq.questId === questId
    );
  }

  async createUserQuest(userQuest: InsertUserQuest): Promise<UserQuest> {
    const id = this.userQuestIdCounter++;
    const now = new Date();
    const newUserQuest: UserQuest = {
      id,
      ...userQuest,
      createdAt: now
    };
    this.userQuests.set(id, newUserQuest);
    return newUserQuest;
  }

  async updateUserQuest(id: number, updates: Partial<UserQuest>): Promise<UserQuest | undefined> {
    const userQuest = this.userQuests.get(id);
    if (!userQuest) return undefined;

    const updatedUserQuest = { ...userQuest, ...updates };
    this.userQuests.set(id, updatedUserQuest);
    return updatedUserQuest;
  }

  async getUserQuests(userId: number): Promise<UserQuest[]> {
    return Array.from(this.userQuests.values()).filter(
      (uq) => uq.userId === userId
    );
  }

  async getUserCompletedQuests(userId: number): Promise<UserQuest[]> {
    return Array.from(this.userQuests.values()).filter(
      (uq) => uq.userId === userId && uq.completed === true
    );
  }

  async getUserActiveQuests(userId: number): Promise<UserQuest[]> {
    return Array.from(this.userQuests.values()).filter(
      (uq) => uq.userId === userId && uq.completed === false
    );
  }

  // Workout methods
  async getWorkout(id: number): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const id = this.workoutIdCounter++;
    const now = new Date();
    const newWorkout: Workout = {
      id,
      ...workout,
      createdAt: now
    };
    this.workouts.set(id, newWorkout);
    return newWorkout;
  }

  async updateWorkout(id: number, updates: Partial<Workout>): Promise<Workout | undefined> {
    const workout = await this.getWorkout(id);
    if (!workout) return undefined;

    const updatedWorkout = { ...workout, ...updates };
    this.workouts.set(id, updatedWorkout);
    return updatedWorkout;
  }

  async deleteWorkout(id: number): Promise<boolean> {
    return this.workouts.delete(id);
  }

  async getAllWorkouts(): Promise<Workout[]> {
    return Array.from(this.workouts.values());
  }

  async getWorkoutsByRank(rank: string): Promise<Workout[]> {
    return Array.from(this.workouts.values()).filter(
      (workout) => workout.targetRank === rank
    );
  }

  async getWorkoutsByJob(job: string): Promise<Workout[]> {
    return Array.from(this.workouts.values()).filter(
      (workout) => workout.targetJob === job
    );
  }

  // ShopItem methods
  async getShopItem(id: number): Promise<ShopItem | undefined> {
    return this.shopItems.get(id);
  }

  async createShopItem(item: InsertShopItem): Promise<ShopItem> {
    const id = this.shopItemIdCounter++;
    const now = new Date();
    const newItem: ShopItem = {
      id,
      ...item,
      createdAt: now
    };
    this.shopItems.set(id, newItem);
    return newItem;
  }

  async updateShopItem(id: number, updates: Partial<ShopItem>): Promise<ShopItem | undefined> {
    const item = await this.getShopItem(id);
    if (!item) return undefined;

    const updatedItem = { ...item, ...updates };
    this.shopItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteShopItem(id: number): Promise<boolean> {
    return this.shopItems.delete(id);
  }

  async getAllShopItems(): Promise<ShopItem[]> {
    return Array.from(this.shopItems.values());
  }

  // UserItem methods
  async getUserItem(userId: number, itemId: number): Promise<UserItem | undefined> {
    return Array.from(this.userItems.values()).find(
      (ui) => ui.userId === userId && ui.itemId === itemId
    );
  }

  async createUserItem(userItem: InsertUserItem): Promise<UserItem> {
    const id = this.userItemIdCounter++;
    const now = new Date();
    const newUserItem: UserItem = {
      id,
      ...userItem,
      createdAt: now
    };
    this.userItems.set(id, newUserItem);
    return newUserItem;
  }

  async updateUserItem(id: number, updates: Partial<UserItem>): Promise<UserItem | undefined> {
    const userItem = this.userItems.get(id);
    if (!userItem) return undefined;

    const updatedUserItem = { ...userItem, ...updates };
    this.userItems.set(id, updatedUserItem);
    return updatedUserItem;
  }

  async getUserItems(userId: number): Promise<UserItem[]> {
    return Array.from(this.userItems.values()).filter(
      (ui) => ui.userId === userId
    );
  }

  // Event methods
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const now = new Date();
    const newEvent: Event = {
      id,
      ...event,
      createdAt: now
    };
    this.events.set(id, newEvent);
    return newEvent;
  }

  async updateEvent(id: number, updates: Partial<Event>): Promise<Event | undefined> {
    const event = await this.getEvent(id);
    if (!event) return undefined;

    const updatedEvent = { ...event, ...updates };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getActiveEvents(): Promise<Event[]> {
    const now = new Date();
    return Array.from(this.events.values()).filter(
      (event) => new Date(event.startDate) <= now && new Date(event.endDate) >= now
    );
  }
}

export const storage = new MemStorage();
