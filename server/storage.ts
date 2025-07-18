import { users, botLogs, botStatus, creatures, apiTests, type User, type InsertUser, type BotLog, type InsertBotLog, type BotStatus, type InsertBotStatus, type Creature, type InsertCreature, type ApiTest, type InsertApiTest } from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Bot logs
  getBotLogs(limit?: number): Promise<BotLog[]>;
  createBotLog(log: InsertBotLog): Promise<BotLog>;
  
  // Bot status
  getBotStatus(): Promise<BotStatus | undefined>;
  updateBotStatus(status: InsertBotStatus): Promise<BotStatus>;
  
  // Creatures
  getCreatures(limit?: number): Promise<Creature[]>;
  getBoostedCreatures(): Promise<Creature[]>;
  createCreature(creature: InsertCreature): Promise<Creature>;
  updateCreature(id: number, creature: Partial<InsertCreature>): Promise<Creature | undefined>;
  
  // API tests
  getApiTests(limit?: number): Promise<ApiTest[]>;
  createApiTest(test: InsertApiTest): Promise<ApiTest>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private botLogs: Map<number, BotLog>;
  private botStatus: BotStatus | undefined;
  private creatures: Map<number, Creature>;
  private apiTests: Map<number, ApiTest>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.botLogs = new Map();
    this.botStatus = {
      id: 1,
      isOnline: true,
      lastUpdate: new Date(),
      uptime: 0,
      apiStatus: "healthy",
      apiResponseTime: 142,
      postsToday: 3,
      lastCreaturePost: "Ice Witch",
      lastBossPost: "Ferumbras",
    };
    this.creatures = new Map();
    this.apiTests = new Map();
    this.currentId = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample bot logs
    const sampleLogs = [
      {
        id: 1,
        timestamp: new Date(),
        level: "INFO",
        message: "Posted boosted creature update",
        component: "scheduler",
        details: "Ice Witch",
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        level: "INFO",
        message: "Posted boosted boss update",
        component: "scheduler",
        details: "Ferumbras",
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        level: "INFO",
        message: "Manual update triggered",
        component: "commands",
        details: "User command",
      },
    ];
    
    sampleLogs.forEach(log => this.botLogs.set(log.id, log));
    
    // Sample creatures
    const sampleCreatures = [
      {
        id: 1,
        name: "Ice Witch",
        race: "Ice Witch",
        hitpoints: 650,
        experience: 580,
        imageUrl: "",
        description: "Magical creature vulnerable to fire",
        level: null,
        armor: null,
        speed: null,
        isBoosted: true,
        lastSeen: new Date(),
      },
      {
        id: 2,
        name: "Ferumbras",
        race: "Ferumbras",
        hitpoints: 35000,
        experience: 12000,
        imageUrl: "",
        description: "Powerful demon lord",
        level: null,
        armor: null,
        speed: null,
        isBoosted: true,
        lastSeen: new Date(),
      },
    ];
    
    sampleCreatures.forEach(creature => this.creatures.set(creature.id, creature));
    
    // Sample API tests
    const sampleTests = [
      {
        id: 1,
        endpoint: "/v4/creatures",
        status: "success",
        responseTime: 120,
        timestamp: new Date(),
        error: null,
      },
      {
        id: 2,
        endpoint: "/v4/boostablebosses",
        status: "success",
        responseTime: 98,
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        error: null,
      },
    ];
    
    sampleTests.forEach(test => this.apiTests.set(test.id, test));
    
    this.currentId = 10;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getBotLogs(limit = 50): Promise<BotLog[]> {
    return Array.from(this.botLogs.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createBotLog(insertLog: InsertBotLog): Promise<BotLog> {
    const id = this.currentId++;
    const log: BotLog = { 
      ...insertLog, 
      id,
      timestamp: new Date(),
    };
    this.botLogs.set(id, log);
    return log;
  }

  async getBotStatus(): Promise<BotStatus | undefined> {
    return this.botStatus;
  }

  async updateBotStatus(status: InsertBotStatus): Promise<BotStatus> {
    if (!this.botStatus) {
      this.botStatus = {
        id: 1,
        lastUpdate: new Date(),
        ...status,
      };
    } else {
      this.botStatus = {
        ...this.botStatus,
        ...status,
        lastUpdate: new Date(),
      };
    }
    return this.botStatus;
  }

  async getCreatures(limit = 50): Promise<Creature[]> {
    return Array.from(this.creatures.values())
      .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime())
      .slice(0, limit);
  }

  async getBoostedCreatures(): Promise<Creature[]> {
    return Array.from(this.creatures.values())
      .filter(creature => creature.isBoosted)
      .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());
  }

  async createCreature(insertCreature: InsertCreature): Promise<Creature> {
    const id = this.currentId++;
    const creature: Creature = { 
      ...insertCreature, 
      id,
      lastSeen: new Date(),
    };
    this.creatures.set(id, creature);
    return creature;
  }

  async updateCreature(id: number, updates: Partial<InsertCreature>): Promise<Creature | undefined> {
    const creature = this.creatures.get(id);
    if (!creature) return undefined;
    
    const updatedCreature = { ...creature, ...updates };
    this.creatures.set(id, updatedCreature);
    return updatedCreature;
  }

  async getApiTests(limit = 50): Promise<ApiTest[]> {
    return Array.from(this.apiTests.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createApiTest(insertTest: InsertApiTest): Promise<ApiTest> {
    const id = this.currentId++;
    const test: ApiTest = { 
      ...insertTest, 
      id,
      timestamp: new Date(),
    };
    this.apiTests.set(id, test);
    return test;
  }
}

export const storage = new MemStorage();
