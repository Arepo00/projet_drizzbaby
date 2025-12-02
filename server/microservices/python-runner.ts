import { promisify } from "util";
import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import type { InsertFinding } from "@shared/schema";
import type { MicroserviceDefinition } from "@shared/microservices";

const execFileAsync = promisify(execFile);

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const pythonDir = path.resolve(currentDir, "../python_microservices");

export interface PythonMicroserviceResult {
  findings: Omit<InsertFinding, "scanId">[];
}

export async function runPythonMicroservice(
  microservice: MicroserviceDefinition,
  apkPath: string,
): Promise<PythonMicroserviceResult> {
  const scriptPath = path.join(pythonDir, microservice.script);

  try {
    const { stdout } = await execFileAsync("python3", [scriptPath, apkPath], {
      maxBuffer: 10 * 1024 * 1024,
    });
    const parsed = JSON.parse(stdout) as PythonMicroserviceResult;
    const findings = Array.isArray(parsed.findings)
      ? parsed.findings.map((finding) => ({
          ...finding,
          microservice: finding.microservice ?? microservice.id,
        }))
      : [];

    return { findings };
  } catch (error) {
    console.error(`Python microservice ${microservice.id} failed:`, error);
    return { findings: [] };
  }
}
