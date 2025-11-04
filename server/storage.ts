import {
  type Scan,
  type InsertScan,
  type Finding,
  type InsertFinding,
  type ScanStatus,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Scan methods
  createScan(scan: InsertScan): Promise<Scan>;
  getScan(id: string): Promise<Scan | undefined>;
  getAllScans(): Promise<Scan[]>;
  updateScanStatus(
    id: string,
    status: ScanStatus,
    duration?: string,
    overallScore?: string
  ): Promise<Scan | undefined>;

  // Finding methods
  createFinding(finding: InsertFinding): Promise<Finding>;
  getFindingsByScanId(scanId: string): Promise<Finding[]>;
}

export class MemStorage implements IStorage {
  private scans: Map<string, Scan>;
  private findings: Map<string, Finding>;

  constructor() {
    this.scans = new Map();
    this.findings = new Map();
  }

  // Scan methods
  async createScan(insertScan: InsertScan): Promise<Scan> {
    const id = randomUUID();
    const scan: Scan = {
      ...insertScan,
      id,
      scanDate: new Date(),
      duration: null,
      overallScore: null,
    };
    this.scans.set(id, scan);
    return scan;
  }

  async getScan(id: string): Promise<Scan | undefined> {
    return this.scans.get(id);
  }

  async getAllScans(): Promise<Scan[]> {
    return Array.from(this.scans.values()).sort(
      (a, b) => b.scanDate.getTime() - a.scanDate.getTime()
    );
  }

  async updateScanStatus(
    id: string,
    status: ScanStatus,
    duration?: string,
    overallScore?: string
  ): Promise<Scan | undefined> {
    const scan = this.scans.get(id);
    if (!scan) return undefined;

    const updatedScan: Scan = {
      ...scan,
      status,
      duration: duration || scan.duration,
      overallScore: overallScore || scan.overallScore,
    };
    this.scans.set(id, updatedScan);
    return updatedScan;
  }

  // Finding methods
  async createFinding(insertFinding: InsertFinding): Promise<Finding> {
    const id = randomUUID();
    const finding: Finding = {
      ...insertFinding,
      id,
      cwe: insertFinding.cwe || null,
      affectedFiles: insertFinding.affectedFiles || null,
      fixSuggestion: insertFinding.fixSuggestion || null,
      codeSnippet: insertFinding.codeSnippet || null,
    };
    this.findings.set(id, finding);
    return finding;
  }

  async getFindingsByScanId(scanId: string): Promise<Finding[]> {
    return Array.from(this.findings.values()).filter(
      (finding) => finding.scanId === scanId
    );
  }
}

export const storage = new MemStorage();
