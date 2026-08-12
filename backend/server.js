import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Load dotenv files if present. .env is conventional; config.env is supported too.
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

  if (uri && uri.includes("<db_username>") && username) {
    uri = uri.replace(/<db_username>/g, username);
  }
  if (uri && uri.includes("<password>") && password) {
    uri = uri.replace(/<password>/g, password);
  }

  if (uri && uri.includes("<db_password>") && password) {
    uri = uri.replace(/<db_password>/g, password);
  }

  if (!uri && username && password && configEnv.ATLAS_URL) {
    uri = configEnv.ATLAS_URL.replace(/<db_username>/g, username).replace(
      /<password>/g,
      password,
    );
  }

  return uri;
}

const app = express();
app.use(express.json());

const MONGO_URI = buildMongoUri();
const PORT = Number(process.env.PORT || 5000);

async function connectDatabase() {
  if (!MONGO_URI) {
    console.error(
      "MongoDB connection string is missing. Add MONGO_URI or ATLAS_URL to .env or config.env.",
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
    console.error("✖ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

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

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
  });
});
