import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBotLogSchema, insertBotStatusSchema, insertCreatureSchema, insertApiTestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Bot status endpoint
  app.get("/api/bot/status", async (req, res) => {
    try {
      const status = await storage.getBotStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get bot status" });
    }
  });

  // Update bot status
  app.post("/api/bot/status", async (req, res) => {
    try {
      const validatedData = insertBotStatusSchema.parse(req.body);
      const status = await storage.updateBotStatus(validatedData);
      res.json(status);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update bot status" });
      }
    }
  });

  // Bot logs endpoint
  app.get("/api/bot/logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getBotLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get bot logs" });
    }
  });

  // Create bot log
  app.post("/api/bot/logs", async (req, res) => {
    try {
      const validatedData = insertBotLogSchema.parse(req.body);
      const log = await storage.createBotLog(validatedData);
      res.json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create bot log" });
      }
    }
  });

  // Creatures endpoint
  app.get("/api/creatures", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const creatures = await storage.getCreatures(limit);
      res.json(creatures);
    } catch (error) {
      res.status(500).json({ error: "Failed to get creatures" });
    }
  });

  // Boosted creatures endpoint
  app.get("/api/creatures/boosted", async (req, res) => {
    try {
      const creatures = await storage.getBoostedCreatures();
      res.json(creatures);
    } catch (error) {
      res.status(500).json({ error: "Failed to get boosted creatures" });
    }
  });

  // Create creature
  app.post("/api/creatures", async (req, res) => {
    try {
      const validatedData = insertCreatureSchema.parse(req.body);
      const creature = await storage.createCreature(validatedData);
      res.json(creature);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create creature" });
      }
    }
  });

  // API tests endpoint
  app.get("/api/tests", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const tests = await storage.getApiTests(limit);
      res.json(tests);
    } catch (error) {
      res.status(500).json({ error: "Failed to get API tests" });
    }
  });

  // Create API test
  app.post("/api/tests", async (req, res) => {
    try {
      const validatedData = insertApiTestSchema.parse(req.body);
      const test = await storage.createApiTest(validatedData);
      res.json(test);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create API test" });
      }
    }
  });

  // Test TibiaData API endpoint
  app.post("/api/test/creature", async (req, res) => {
    try {
      const { creature } = req.body;
      if (!creature) {
        return res.status(400).json({ error: "Creature name is required" });
      }

      const startTime = Date.now();
      
      // Mock API test - in real implementation this would call TibiaData API
      const responseTime = Math.floor(Math.random() * 200) + 50;
      
      await new Promise(resolve => setTimeout(resolve, responseTime));
      
      const result = {
        endpoint: `/v4/creature/${creature}`,
        status: "success",
        responseTime,
        timestamp: new Date().toISOString(),
        data: {
          name: creature,
          race: creature,
          hitpoints: Math.floor(Math.random() * 1000) + 100,
          experience: Math.floor(Math.random() * 500) + 50,
        }
      };

      // Log the test
      await storage.createApiTest({
        endpoint: result.endpoint,
        status: result.status,
        responseTime: result.responseTime,
        error: null,
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to test creature API" });
    }
  });

  // Test boss API endpoint
  app.post("/api/test/boss", async (req, res) => {
    try {
      const { boss } = req.body;
      if (!boss) {
        return res.status(400).json({ error: "Boss name is required" });
      }

      const startTime = Date.now();
      
      // Mock API test - in real implementation this would call TibiaData API
      const responseTime = Math.floor(Math.random() * 200) + 50;
      
      await new Promise(resolve => setTimeout(resolve, responseTime));
      
      const result = {
        endpoint: `/v4/creature/${boss}`,
        status: "success",
        responseTime,
        timestamp: new Date().toISOString(),
        data: {
          name: boss,
          race: boss,
          hitpoints: Math.floor(Math.random() * 50000) + 10000,
          experience: Math.floor(Math.random() * 10000) + 5000,
        }
      };

      // Log the test
      await storage.createApiTest({
        endpoint: result.endpoint,
        status: result.status,
        responseTime: result.responseTime,
        error: null,
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to test boss API" });
    }
  });

  // Force update endpoint
  app.post("/api/bot/update", async (req, res) => {
    try {
      // In real implementation, this would trigger the bot update
      // For now, just create a log entry
      await storage.createBotLog({
        level: "INFO",
        message: "Manual update triggered from dashboard",
        component: "web_dashboard",
        details: "Force update requested",
      });

      res.json({ success: true, message: "Update triggered successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to trigger update" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
