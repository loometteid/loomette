import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const DEFAULT_FILE_KEY = "vvAmLnGOxwY7DmFLoyKmOT";
const SNAPSHOTS_DIR = path.resolve(process.cwd(), "figma/snapshots");
const FRAMES_INDEX_PATH = path.join(SNAPSHOTS_DIR, "figma-frames-index.json");

function getFigmaToken() {
  if (process.env.FIGMA_PERSONAL_ACCESS_TOKEN) {
    return process.env.FIGMA_PERSONAL_ACCESS_TOKEN;
  }
  // Try reading from user mcp_config.json if available
  const home = process.env.USERPROFILE || process.env.HOME || "";
  const mcpConfigPath = path.join(home, ".gemini", "config", "mcp_config.json");
  if (fs.existsSync(mcpConfigPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(mcpConfigPath, "utf8"));
      const figmaArgs = cfg.mcpServers?.figma?.args || [];
      const keyArg = figmaArgs.find((a) => a.startsWith("--figma-api-key="));
      if (keyArg) {
        return keyArg.replace("--figma-api-key=", "").trim();
      }
    } catch {
      // fallback
    }
  }
  return null;
}

function fetchFigma(apiPath, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.figma.com",
      path: apiPath,
      method: "GET",
      headers: {
        "X-Figma-Token": token,
        "User-Agent": "loomette-snapshot-puller/1.0",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: json,
          });
        } catch {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data,
          });
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

function sanitizeName(name) {
  return name.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
}

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes("--status") || args.includes("--check");
  const fileKey =
    args.find((a) => a.startsWith("--fileKey="))?.split("=")[1] ||
    DEFAULT_FILE_KEY;
  const token = getFigmaToken();

  console.log("=== Figma Snapshot Puller ===");
  console.log(`File Key: ${fileKey}`);

  if (!token) {
    console.error(
      "Error: No Figma Personal Access Token found in environment or MCP config.",
    );
    process.exit(1);
  }

  // 1. Check rate limit status with a lightweight probe
  console.log("Checking Figma API rate-limit status...");
  const probe = await fetchFigma(
    `/v1/files/${fileKey}/nodes?ids=0:1`,
    token,
  );

  if (probe.statusCode === 429) {
    const retryAfter = probe.headers["retry-after"] || "unknown";
    const hours =
      retryAfter !== "unknown"
        ? (Number(retryAfter) / 3600).toFixed(1)
        : "unknown";
    console.warn("\n⚠️  Figma API Rate Limit is currently active (HTTP 429)!");
    console.warn(`   Tier: ${probe.headers["x-figma-plan-tier"] || "starter"}`);
    console.warn(`   Retry-After: ${retryAfter} seconds (~${hours} hours)`);
    console.warn(`   Upgrade link: ${probe.headers["x-figma-upgrade-link"] || "https://www.figma.com/files?api_paywall=true"}`);
    console.log("\n💡 Cached snapshots are safe in figma/snapshots/.");
    console.log("   Local vector SVGs and PNGs in figma/profile/ are ready for visual implementation.");
    if (checkOnly) process.exit(0);
    process.exit(2);
  }

  if (probe.statusCode !== 200) {
    console.error(
      `Figma API returned error status ${probe.statusCode}:`,
      probe.data,
    );
    process.exit(1);
  }

  console.log("✓ Figma API is available (not rate limited)!");
  if (checkOnly) process.exit(0);

  // 2. Load frames index
  if (!fs.existsSync(FRAMES_INDEX_PATH)) {
    console.error(`Frame index file not found at ${FRAMES_INDEX_PATH}`);
    process.exit(1);
  }

  const index = JSON.parse(fs.readFileSync(FRAMES_INDEX_PATH, "utf8"));
  const hifi = index.find((p) => p.name === "High Fidelity");
  if (!hifi || !hifi.frames) {
    console.error("High Fidelity page not found in frames index.");
    process.exit(1);
  }

  const targetFrames = hifi.frames.filter((f) => f.type === "FRAME");
  console.log(`Found ${targetFrames.length} frames to check in High Fidelity canvas.`);

  // 3. Process frames with delay to avoid bursting
  let pulled = 0;
  let skipped = 0;

  for (const frame of targetFrames) {
    const safeName = sanitizeName(frame.name);
    const safeNodeId = frame.id.replace(":", "-");
    const filename = `${safeName}-${safeNodeId}.json`;
    const targetPath = path.join(SNAPSHOTS_DIR, filename);

    if (fs.existsSync(targetPath)) {
      skipped++;
      continue;
    }

    console.log(`Pulling frame: "${frame.name}" (ID: ${frame.id})...`);
    const res = await fetchFigma(
      `/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(frame.id)}`,
      token,
    );

    if (res.statusCode === 429) {
      console.warn(`\nHit rate limit while pulling ${frame.name}. Stopping batch.`);
      console.warn(`Retry-After: ${res.headers["retry-after"]}s`);
      break;
    }

    if (res.statusCode === 200 && res.data) {
      fs.writeFileSync(targetPath, JSON.stringify(res.data, null, 2), "utf8");
      pulled++;
      console.log(`✓ Saved ${filename}`);
    } else {
      console.warn(`Failed to pull ${frame.id}: HTTP ${res.statusCode}`);
    }

    // Rate limiting gentle pause (500ms) between requests
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\nBatch summary: ${pulled} pulled, ${skipped} already cached.`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
