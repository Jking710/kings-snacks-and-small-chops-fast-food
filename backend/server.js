import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import dns from "dns";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Auth routes
import authRoutes from "./routes/authRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "config.env") });

function parseConfigEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        line &&
        !line.startsWith("#") &&
        !line.endsWith("{") &&
        !line.endsWith("}"),
    );
  const config = {};
  for (const line of lines) {
    const envMatch = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (envMatch) {
      config[envMatch[1].trim()] = envMatch[2].trim();
      continue;
    }
    const keyValueMatch = line.match(/^([A-Za-z0-9 _-]+)[:=]\s*(.*)$/);
    if (keyValueMatch) {
      const key = keyValueMatch[1].trim().replace(/\s+/g, "_").toUpperCase();
      config[key] = keyValueMatch[2].trim();
    }
  }
  return config;
}

function buildMongoUri() {
  const configEnv = parseConfigEnvFile(path.join(__dirname, "config.env"));
  let uri =
    process.env.MONGO_URI ||
    process.env.ATLAS_URL ||
    configEnv.MONGO_URI ||
    configEnv.ATLAS_URL;
  const username =
    process.env.MONGO_USERNAME ||
    configEnv.USERNAME ||
    configEnv.MONGO_USERNAME;
  const password =
    process.env.MONGO_PASSWORD ||
    configEnv.PASSWORD ||
    configEnv.MONGO_PASSWORD;
  if (uri && uri.includes("<db_username>") && username)
    uri = uri.replace(/<db_username>/g, username);
  if (uri && uri.includes("<password>") && password)
    uri = uri.replace(/<password>/g, password);
  if (uri && uri.includes("<db_password>") && password)
    uri = uri.replace(/<db_password>/g, password);
  if (!uri && username && password && configEnv.ATLAS_URL)
    uri = configEnv.ATLAS_URL.replace(/<db_username>/g, username).replace(
      /<password>/g,
      password,
    );
  return uri;
}

const app = express();

// Debug: print process working dir and pid to ensure file writes go to expected location
try {
  console.log("Startup info: cwd=", process.cwd(), "__dirname=", __dirname, "pid=", process.pid);
} catch (e) {}

// Add a header to every response identifying the server process (helpful when multiple instances may be running)
app.use((req, res, next) => {
  try {
    res.setHeader("X-SERVER-PID", String(process.pid));
  } catch (e) {}
  next();
});

// Simple request logger to aid CORS/preflight debugging
app.use((req, res, next) => {
  try {
    console.log(">>> Incoming request", req.method, req.path);
    console.log(">>> Origin:", req.headers.origin);
    console.log(">>> Headers:", Object.keys(req.headers).join(", "));
  } catch (e) {
    // ignore logging errors
  }
  next();
});

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow requests from your React dev server
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:5177",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      // In development, allow any origin so local dev servers (127.0.0.1, localhost, etc.) work
      if (process.env.NODE_ENV !== "production") return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true, // Required to allow cookies to be sent cross-origin
  }),
);

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse HttpOnly cookies

// ─── Routes ───────────────────────────────────────────────────────────────────
// Auth routes
app.use("/api/auth", authRoutes);

// Inspect router internal stack for debugging
try {
  if (authRoutes && Array.isArray(authRoutes.stack)) {
    console.log("authRoutes.stack found:", authRoutes.stack.map((layer) => {
      if (layer && layer.route && layer.route.path) {
        return { path: layer.route.path, methods: Object.keys(layer.route.methods || {}) };
      }
      return { name: layer && layer.name };
    }));
  } else {
    console.log("authRoutes.stack is not an array or not present");
  }
} catch (err) {
  console.warn("Could not inspect authRoutes.stack:", err && err.message);
}

// Log mounted routes for debugging
try {
  console.log("Mounted routes:");
  app._router.stack.forEach((layer) => {
    if (layer.route && layer.route.path) {
      const methods = Object.keys(layer.route.methods).join(",");
      console.log(`${methods} ${layer.route.path}`);
    } else if (layer.name === "router" && layer.handle && layer.handle.stack) {
      layer.handle.stack.forEach((l) => {
        if (l.route && l.route.path) {
          const methods = Object.keys(l.route.methods).join(",");
          console.log(`${methods} ${l.route.path}`);
        }
      });
    }
  });
} catch (err) {
  console.warn("Could not enumerate routes:", err && err.message);
}

// DEBUG: list registered routes (temporary)
app.get("/__routes", (req, res) => {
  try {
    const routes = [];
    if (app && app._router && Array.isArray(app._router.stack)) {
      app._router.stack.forEach((layer) => {
        try {
          if (layer && layer.route && layer.route.path) {
            const methods = Object.keys(layer.route.methods || {}).join(",");
            routes.push({ path: layer.route.path, methods });
            return;
          }
          if (
            layer &&
            layer.name === "router" &&
            layer.handle &&
            Array.isArray(layer.handle.stack)
          ) {
            layer.handle.stack.forEach((l) => {
              if (l && l.route && l.route.path) {
                const methods = Object.keys(l.route.methods || {}).join(",");
                routes.push({ path: l.route.path, methods });
              }
            });
            return;
          }
          // fallback: print layer name or regexp
          if (layer && layer.name) routes.push({ path: `<${layer.name}>` });
        } catch (e) {
          // ignore individual layer errors
        }
      });
    }
    res.json({ routes });
  } catch (err) {
    res.status(500).json({ error: "Could not list routes" });
  }
});

// Existing product routes (preserved exactly)
const MONGO_URI = buildMongoUri();
const PORT = Number(process.env.PORT || 5000);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
  },
  { timestamps: true },
);

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Express server is running" });
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ error: "Unable to load products" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  try {
    console.error("Unhandled error at", req.method, req.path);
    if (err && err.stack) console.error(err.stack);
    else console.error(err);
  } catch (logErr) {
    console.error("Error while logging error:", logErr && logErr.message);
  }
  res
    .status(500)
    .json({
      message:
        err && err.message
          ? err.message
          : "Something went wrong. Please try again.",
    });
});

// ─── DB + Server start ────────────────────────────────────────────────────────
async function connectDatabase() {
  if (!MONGO_URI) {
    console.error(
      "MongoDB connection string is missing. Add MONGO_URI to .env",
    );
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGO_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✔ Connected to MongoDB");
  } catch (error) {
    console.error("✖ Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
}

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`✔ Server running on http://localhost:${PORT}`);
  });
});
