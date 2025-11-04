import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertScanSchema, insertFindingSchema } from "@shared/schema";
import { scanAPK } from "./microservices/apk-scanner";
import { scanSecrets } from "./microservices/secret-hunter";
import { scanCrypto } from "./microservices/crypto-check";

// Setup multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === ".apk") {
      cb(null, true);
    } else {
      cb(new Error("Only APK files are allowed"));
    }
  },
});

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all scans
  app.get("/api/scans", async (req, res) => {
    try {
      const scans = await storage.getAllScans();
      res.json(scans);
    } catch (error) {
      console.error("Error fetching scans:", error);
      res.status(500).json({ error: "Failed to fetch scans" });
    }
  });

  // Get a specific scan
  app.get("/api/scans/:id", async (req, res) => {
    try {
      const scan = await storage.getScan(req.params.id);
      if (!scan) {
        return res.status(404).json({ error: "Scan not found" });
      }
      res.json(scan);
    } catch (error) {
      console.error("Error fetching scan:", error);
      res.status(500).json({ error: "Failed to fetch scan" });
    }
  });

  // Get findings for a scan
  app.get("/api/scans/:id/findings", async (req, res) => {
    try {
      const findings = await storage.getFindingsByScanId(req.params.id);
      res.json(findings);
    } catch (error) {
      console.error("Error fetching findings:", error);
      res.status(500).json({ error: "Failed to fetch findings" });
    }
  });

  // Upload and scan APK
  app.post("/api/scans/upload", upload.single("apk"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No APK file uploaded" });
      }

      const { originalname, path: filePath } = req.file;

      // Create initial scan record
      const scanData = {
        appName: req.body.appName || originalname.replace(".apk", ""),
        packageName: req.body.packageName || "unknown",
        version: req.body.version || "1.0.0",
        fileName: originalname,
        filePath,
        status: "pending" as const,
      };

      const validatedData = insertScanSchema.parse(scanData);
      const scan = await storage.createScan(validatedData);

      res.json({ scanId: scan.id, message: "Scan created successfully" });
    } catch (error) {
      console.error("Error creating scan:", error);
      res.status(500).json({ error: "Failed to create scan" });
    }
  });

  // Start scan processing
  app.post("/api/scans/:id/start", async (req, res) => {
    try {
      const scan = await storage.getScan(req.params.id);
      if (!scan) {
        return res.status(404).json({ error: "Scan not found" });
      }

      if (scan.status !== "pending") {
        return res.status(400).json({ error: "Scan already started" });
      }

      // Update status to running
      await storage.updateScanStatus(scan.id, "running");

      // Process scan asynchronously
      processScan(scan.id, scan.filePath).catch((error) => {
        console.error("Error processing scan:", error);
        storage.updateScanStatus(scan.id, "failed");
      });

      res.json({ message: "Scan started successfully" });
    } catch (error) {
      console.error("Error starting scan:", error);
      res.status(500).json({ error: "Failed to start scan" });
    }
  });

  // Get scan report (scan + findings)
  app.get("/api/scans/:id/report", async (req, res) => {
    try {
      const scan = await storage.getScan(req.params.id);
      if (!scan) {
        return res.status(404).json({ error: "Scan not found" });
      }

      const findings = await storage.getFindingsByScanId(scan.id);

      // Group findings by microservice
      const microservices = [
        { id: "apk-scanner", name: "APKScanner" },
        { id: "secret-hunter", name: "SecretHunter" },
        { id: "crypto-check", name: "CryptoCheck" },
      ];

      const report = {
        ...scan,
        microservices: microservices.map((ms) => ({
          ...ms,
          findings: findings.filter((f) => f.microservice === ms.id),
        })),
      };

      res.json(report);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Process scan in background
async function processScan(scanId: string, filePath: string) {
  const startTime = Date.now();

  try {
    // Run all microservices
    const [apkResults, secretResults, cryptoResults] = await Promise.all([
      scanAPK(filePath),
      scanSecrets(filePath),
      scanCrypto(filePath),
    ]);

    // Save all findings
    const allFindings = [
      ...apkResults.findings,
      ...secretResults.findings,
      ...cryptoResults.findings,
    ];

    for (const finding of allFindings) {
      const validatedFinding = insertFindingSchema.parse({
        ...finding,
        scanId,
      });
      await storage.createFinding(validatedFinding);
    }

    // Calculate duration and score
    const duration = `${Math.floor((Date.now() - startTime) / 1000)}s`;
    const criticalCount = allFindings.filter((f) => f.severity === "critical").length;
    const highCount = allFindings.filter((f) => f.severity === "high").length;

    let overallScore = "A";
    if (criticalCount > 0) {
      overallScore = criticalCount > 2 ? "F" : "D";
    } else if (highCount > 0) {
      overallScore = highCount > 3 ? "D" : "C";
    } else if (allFindings.length > 5) {
      overallScore = "B";
    }

    // Update scan status
    await storage.updateScanStatus(scanId, "complete", duration, overallScore);

    console.log(`Scan ${scanId} completed with ${allFindings.length} findings`);
  } catch (error) {
    console.error(`Scan ${scanId} failed:`, error);
    await storage.updateScanStatus(scanId, "failed");
  }
}
