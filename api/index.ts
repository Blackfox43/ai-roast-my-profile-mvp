import express from "express";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import postgres from "postgres";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const MAX_INPUT_LENGTH = 1000;
const RECENT_LIMIT = 6;
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 8);
const ROAST_MODEL = process.env.ROAST_MODEL || "gemini-3.5-flash";
const DB_FILE = process.env.DB_FILE || (process.env.VERCEL ? "/tmp/roasts.local.json" : path.join(process.cwd(), "roasts.local.json"));
const DATABASE_URL = process.env.DATABASE_URL;

const ALLOWED_STYLES = new Set([
  "corporate",
  "influencer",
  "chronically_online",
  "crypto_bro",
  "main_character",
]);

type RoastStyle =
  | "corporate"
  | "influencer"
  | "chronically_online"
  | "crypto_bro"
  | "main_character";

interface RoastResult {
  summary5Words: string;
  personaBreakdown: string;
  biggestRedFlag: string;
  closingLine: string;
  roastScore: number;
}

interface RoastRecord {
  id: string;
  rawInput: string;
  roastStyle: RoastStyle;
  result: RoastResult;
  createdAt: string;
  shareCount: number;
  publicOptIn: boolean;
  deleteTokenHash?: string;
}

interface PublicRoastRecord extends Omit<RoastRecord, "deleteTokenHash"> {}

interface CreateRoastResult {
  record: PublicRoastRecord;
  deleteToken: string;
}

const styleDescriptions: Record<RoastStyle, string> = {
  corporate:
    "Corporate LinkedIn Buzzword — targets professional jargon, alignment, synergy, hustle culture, and corporate cringe.",
  influencer:
    "Aesthetic Influencer — roasts curated perfection, vague gratitude captions, follower-chasing, and fake soft-life branding.",
  chronically_online:
    "Chronically Online User — mocks internet slang, micro-drama, echo chambers, hot takes, and keyboard-warrior behavior.",
  crypto_bro:
    "Web3 Crypto Enthusiast — mocks blockchain hype, NFTs, artificial scarcity, HODL mindset, and financial guru energy.",
  main_character:
    "Main Character Syndrome — roasts grand self-narratives, everyday drama treated like cinema, and attention-seeking bios.",
};

function publicRecord(record: RoastRecord): PublicRoastRecord {
  const { deleteTokenHash, ...safeRecord } = record;
  return safeRecord;
}

function createShareId(): string {
  return crypto.randomBytes(12).toString("base64url");
}

function createDeleteToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function redactSensitiveInfo(input: string): string {
  return input
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email hidden]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[phone hidden]")
    .replace(/https?:\/\/\S+/gi, "[link hidden]")
    .replace(/\s+/g, " ")
    .trim();
}

function validateCreateRequest(body: any): { rawInput: string; roastStyle: RoastStyle; publicOptIn: boolean } {
  const rawInput = typeof body?.rawInput === "string" ? body.rawInput.trim() : "";
  const roastStyle = typeof body?.roastStyle === "string" ? body.roastStyle : "";
  const publicOptIn = Boolean(body?.publicOptIn);

  if (!rawInput) {
    throw Object.assign(new Error("Profile information or bio is required."), { statusCode: 400 });
  }

  if (rawInput.length > MAX_INPUT_LENGTH) {
    throw Object.assign(new Error(`Bio must be ${MAX_INPUT_LENGTH} characters or less.`), { statusCode: 400 });
  }

  if (!ALLOWED_STYLES.has(roastStyle)) {
    throw Object.assign(new Error("Please choose a valid roast flavor."), { statusCode: 400 });
  }

  const redactedInput = redactSensitiveInfo(rawInput);
  if (redactedInput.length < 8) {
    throw Object.assign(new Error("Please paste a little more profile text so the roast has something to analyze."), {
      statusCode: 400,
    });
  }

  return { rawInput: redactedInput, roastStyle: roastStyle as RoastStyle, publicOptIn };
}

function normalizeResult(result: any): RoastResult {
  return {
    summary5Words: String(result?.summary5Words || "Mysterious Profile Energy Detected").slice(0, 140),
    personaBreakdown: String(result?.personaBreakdown || result?.psychologicalDiagnosis || "The profile has a lot of confidence for something asking the internet for validation.").slice(0, 1200),
    biggestRedFlag: String(result?.biggestRedFlag || "The bio is trying very hard to be unforgettable and accidentally became evidence.").slice(0, 800),
    closingLine: String(result?.closingLine || result?.devastatingClosingLine || "This profile does not need a roast; it needs a quiet rebrand.").slice(0, 400),
    roastScore: Math.max(1, Math.min(100, Number(result?.roastScore) || 80)),
  };
}

function normalizeRecord(record: any): RoastRecord {
  return {
    id: String(record.id),
    rawInput: String(record.rawInput || ""),
    roastStyle: (ALLOWED_STYLES.has(record.roastStyle) ? record.roastStyle : "corporate") as RoastStyle,
    result: normalizeResult(record.result),
    createdAt: String(record.createdAt || new Date().toISOString()),
    shareCount: Number(record.shareCount || 0),
    publicOptIn: Boolean(record.publicOptIn),
    deleteTokenHash: record.deleteTokenHash ? String(record.deleteTokenHash) : undefined,
  };
}

async function generateRoast(rawInput: string, roastStyle: RoastStyle): Promise<RoastResult> {
  if (process.env.MOCK_AI === "true") {
    return {
      summary5Words: "Premium Delusion With Wi-Fi",
      personaBreakdown: `This profile is giving ${roastStyle.replaceAll("_", " ")} energy with the confidence of a TED Talk and the substance of a loading screen. It wants to be iconic so badly it's giving laptop-screen-in-the-dark energy.`,
      biggestRedFlag: "The bio is trying to sound effortless while clearly doing cardio in the mirror for attention.",
      closingLine: "This profile does not need a glow-up; it needs a software update and a quiet afternoon.",
      roastScore: 88,
    };
  }

  const ai = getGenAI();
  const selectedStyleDesc = styleDescriptions[roastStyle];

  const systemInstruction = `You are AI Roast My Profile, a sharp satirical internet profile critic. Your job is to roast the user's profile text in the style below: ${selectedStyleDesc}

Safety and product rules:
- Keep it satirical, witty, and punchy. Do not produce real harassment, threats, hate speech, explicit slurs, or attacks on protected traits.
- Do not claim to diagnose mental health, medical conditions, trauma, or personality disorders. Use "persona", "vibe", and "internet behavior" language instead.
- Do not reveal, amplify, or infer private personal details. If private info appears, ignore it.
- Avoid sexual content and avoid targeting minors.
- Output clean JSON that follows the schema exactly.`;

  const response = await ai.models.generateContent({
    model: ROAST_MODEL,
    contents: `Profile text to roast, with private details already redacted: "${rawInput}"`,
    config: {
      systemInstruction,
      temperature: 0.95,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary5Words: {
            type: Type.STRING,
            description: "A funny summary of their vibe in exactly five words.",
          },
          personaBreakdown: {
            type: Type.STRING,
            description: "A hilarious 2-3 sentence persona/vibe breakdown. Do not use medical diagnosis wording.",
          },
          biggestRedFlag: {
            type: Type.STRING,
            description: "The biggest warning sign about their online persona based on the bio.",
          },
          closingLine: {
            type: Type.STRING,
            description: "A single memorable closing roast line.",
          },
          roastScore: {
            type: Type.INTEGER,
            description: "Roast intensity score, an integer from 70 to 100.",
          },
        },
        required: ["summary5Words", "personaBreakdown", "biggestRedFlag", "closingLine", "roastScore"],
      },
    },
  });

  const outputText = response.text;
  if (!outputText) {
    throw new Error("Empty response returned from Gemini.");
  }

  return normalizeResult(JSON.parse(outputText.trim()));
}

// Lazy-loaded GenAI instance
let aiInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw Object.assign(new Error("GEMINI_API_KEY environment variable is required."), { statusCode: 500 });
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

interface Store {
  init(): Promise<void>;
  create(record: RoastRecord): Promise<void>;
  get(id: string): Promise<RoastRecord | null>;
  listRecentPublic(limit: number): Promise<RoastRecord[]>;
  incrementShareCount(id: string): Promise<number | null>;
  deleteWithToken(id: string, deleteToken: string): Promise<boolean>;
  mode: "postgres" | "json";
}

class JsonStore implements Store {
  mode = "json" as const;

  async init() {
    try {
      await fs.access(DB_FILE);
    } catch {
      await fs.writeFile(DB_FILE, JSON.stringify({}, null, 2), "utf-8");
    }
  }

  private async readDb(): Promise<Record<string, RoastRecord>> {
    await this.init();
    const raw = await fs.readFile(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw || "{}");
    const normalized: Record<string, RoastRecord> = {};
    for (const [id, value] of Object.entries(parsed)) {
      normalized[id] = normalizeRecord(value);
    }
    return normalized;
  }

  private async writeDb(db: Record<string, RoastRecord>) {
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  }

  async create(record: RoastRecord) {
    const db = await this.readDb();
    db[record.id] = record;
    await this.writeDb(db);
  }

  async get(id: string) {
    const db = await this.readDb();
    return db[id] || null;
  }

  async listRecentPublic(limit: number) {
    const db = await this.readDb();
    return Object.values(db)
      .filter((record) => record.publicOptIn)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async incrementShareCount(id: string) {
    const db = await this.readDb();
    const record = db[id];
    if (!record) return null;
    record.shareCount = (record.shareCount || 0) + 1;
    db[id] = record;
    await this.writeDb(db);
    return record.shareCount;
  }

  async deleteWithToken(id: string, deleteToken: string) {
    const db = await this.readDb();
    const record = db[id];
    if (!record || !record.deleteTokenHash || record.deleteTokenHash !== hashToken(deleteToken)) return false;
    delete db[id];
    await this.writeDb(db);
    return true;
  }
}

class PostgresStore implements Store {
  mode = "postgres" as const;
  private sql = postgres(DATABASE_URL!, {
    max: 1,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  private initialized = false;

  async init() {
    if (this.initialized) return;
    await this.sql`
      CREATE TABLE IF NOT EXISTS roasts (
        id TEXT PRIMARY KEY,
        raw_input TEXT NOT NULL,
        roast_style TEXT NOT NULL,
        result JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        share_count INTEGER NOT NULL DEFAULT 0,
        public_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
        delete_token_hash TEXT
      )
    `;
    await this.sql`CREATE INDEX IF NOT EXISTS roasts_public_created_at_idx ON roasts (public_opt_in, created_at DESC)`;
    this.initialized = true;
  }

  private fromRow(row: any): RoastRecord {
    return normalizeRecord({
      id: row.id,
      rawInput: row.raw_input,
      roastStyle: row.roast_style,
      result: row.result,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
      shareCount: row.share_count,
      publicOptIn: row.public_opt_in,
      deleteTokenHash: row.delete_token_hash,
    });
  }

  async create(record: RoastRecord) {
    await this.init();
    await this.sql`
      INSERT INTO roasts (id, raw_input, roast_style, result, created_at, share_count, public_opt_in, delete_token_hash)
      VALUES (
        ${record.id},
        ${record.rawInput},
        ${record.roastStyle},
        ${this.sql.json(record.result as any)},
        ${record.createdAt},
        ${record.shareCount},
        ${record.publicOptIn},
        ${record.deleteTokenHash || null}
      )
    `;
  }

  async get(id: string) {
    await this.init();
    const rows = await this.sql`SELECT * FROM roasts WHERE id = ${id} LIMIT 1`;
    return rows[0] ? this.fromRow(rows[0]) : null;
  }

  async listRecentPublic(limit: number) {
    await this.init();
    const rows = await this.sql`
      SELECT * FROM roasts
      WHERE public_opt_in = TRUE
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows.map((row: any) => this.fromRow(row));
  }

  async incrementShareCount(id: string) {
    await this.init();
    const rows = await this.sql`
      UPDATE roasts
      SET share_count = share_count + 1
      WHERE id = ${id}
      RETURNING share_count
    `;
    return rows[0]?.share_count ?? null;
  }

  async deleteWithToken(id: string, deleteToken: string) {
    await this.init();
    const rows = await this.sql`
      DELETE FROM roasts
      WHERE id = ${id} AND delete_token_hash = ${hashToken(deleteToken)}
      RETURNING id
    `;
    return rows.length > 0;
  }
}

const store: Store = DATABASE_URL ? new PostgresStore() : new JsonStore();

// Basic security headers for an MVP. Use a full CSP before heavy ad/script integrations.
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use(express.json({ limit: "16kb" }));

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const now = Date.now();
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  const bucket = rateBuckets.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (bucket.resetAt <= now) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  bucket.count += 1;
  rateBuckets.set(ip, bucket);

  if (bucket.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: "Too many roasts from this connection. Let the server cool down and try again soon." });
  }

  next();
}

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    await store.init();
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development", storage: store.mode });
  } catch (error: any) {
    res.status(500).json({ status: "error", error: error.message || "Storage initialization failed." });
  }
});

// Create a new roast
app.post("/api/roast", rateLimit, async (req, res) => {
  try {
    const { rawInput, roastStyle, publicOptIn } = validateCreateRequest(req.body);
    const result = await generateRoast(rawInput, roastStyle);
    const id = createShareId();
    const deleteToken = createDeleteToken();

    const newRecord: RoastRecord = {
      id,
      rawInput,
      roastStyle,
      result,
      createdAt: new Date().toISOString(),
      shareCount: 0,
      publicOptIn,
      deleteTokenHash: hashToken(deleteToken),
    };

    await store.create(newRecord);
    const response: CreateRoastResult = { record: publicRecord(newRecord), deleteToken };
    res.status(201).json(response);
  } catch (error: any) {
    const statusCode = Number(error?.statusCode || 500);
    console.error("Roast error:", error);
    res.status(statusCode).json({
      error: statusCode >= 500 ? "Failed to fuel the roaster." : error.message,
      details: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
});

// Fetch public recent roasts only
app.get("/api/roasts", async (_req, res) => {
  try {
    const records = await store.listRecentPublic(RECENT_LIMIT);
    res.json({ roasts: records.map(publicRecord) });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch recent public roasts." });
  }
});

// Fetch a specific roast by ID
app.get("/api/roast/:id", async (req, res) => {
  try {
    const record = await store.get(req.params.id);
    if (!record) {
      return res.status(404).json({ error: "Roast not found. It might have been deleted or expired." });
    }

    res.json({ record: publicRecord(record) });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load roast record." });
  }
});

// Increment share count of a roast
app.post("/api/roast/:id/share", async (req, res) => {
  try {
    const shareCount = await store.incrementShareCount(req.params.id);
    if (shareCount === null) {
      return res.status(404).json({ error: "Roast not found." });
    }
    res.json({ success: true, shareCount });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update share count." });
  }
});

// Delete a roast using the one-time owner token returned at creation time.
app.delete("/api/roast/:id", async (req, res) => {
  try {
    const deleteToken = typeof req.body?.deleteToken === "string" ? req.body.deleteToken : "";
    if (!deleteToken) {
      return res.status(400).json({ error: "Delete token is required." });
    }
    const deleted = await store.deleteWithToken(req.params.id, deleteToken);
    if (!deleted) {
      return res.status(403).json({ error: "Could not delete this roast. The delete key is missing or invalid." });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete roast." });
  }
});

export default app;
