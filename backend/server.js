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
import groupOrderRoutes from "./routes/groupOrderRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

console.log("🔥 SERVER FILE:", import.meta.url);
console.log("🔥 PAYMENT ROUTES IMPORTED");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─────────────────────────────────────────────────────────────
// DNS SERVERS
// ─────────────────────────────────────────────────────────────

dns.setServers(["8.8.8.8", "1.1.1.1"]);

// ─────────────────────────────────────────────────────────────
// LOAD ENVIRONMENT VARIABLES
// ─────────────────────────────────────────────────────────────

dotenv.config({
  path: path.join(__dirname, ".env"),
});

dotenv.config({
  path: path.join(__dirname, "config.env"),
});

// ─────────────────────────────────────────────────────────────
// CONFIG FILE PARSER
// ─────────────────────────────────────────────────────────────

function parseConfigEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

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
      const key = keyValueMatch[1]
        .trim()
        .replace(/\s+/g, "_")
        .toUpperCase();

      config[key] = keyValueMatch[2].trim();
    }
  }

  return config;
}

// ─────────────────────────────────────────────────────────────
// MONGODB URI
// ─────────────────────────────────────────────────────────────

function buildMongoUri() {
  const configEnv = parseConfigEnvFile(
    path.join(__dirname, "config.env"),
  );

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
    uri = configEnv.ATLAS_URL
      .replace(/<db_username>/g, username)
      .replace(/<password>/g, password);
  }

  return uri;
}

// ─────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────

const app = express();

// Render runs behind a proxy.
// This also helps production cookie handling.
app.set("trust proxy", 1);

// ─────────────────────────────────────────────────────────────
// STARTUP INFORMATION
// ─────────────────────────────────────────────────────────────

try {
  console.log(
    "Startup info:",
    "cwd=",
    process.cwd(),
    "__dirname=",
    __dirname,
    "pid=",
    process.pid,
  );
} catch (error) {
  console.error(
    "Could not print startup information:",
    error.message,
  );
}

// ─────────────────────────────────────────────────────────────
// SERVER PROCESS HEADER
// ─────────────────────────────────────────────────────────────

app.use((req, res, next) => {
  try {
    res.setHeader("X-SERVER-PID", String(process.pid));
  } catch (error) {
    console.error(
      "Could not set server PID header:",
      error.message,
    );
  }

  next();
});

// ─────────────────────────────────────────────────────────────
// REQUEST LOGGER
// ─────────────────────────────────────────────────────────────

app.use((req, res, next) => {
  try {
    console.log(
      ">>> Incoming request",
      req.method,
      req.path,
    );

    console.log(
      ">>> Origin:",
      req.headers.origin,
    );

    console.log(
      ">>> Headers:",
      Object.keys(req.headers).join(", "),
    );
  } catch (error) {
    console.error(
      "Request logging error:",
      error.message,
    );
  }

  next();
});

// ─────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────

const productionFrontendUrl =
  "https://kings-snacks-and-small-chops-fast-f-ruby.vercel.app";

const allowedOrigins = [
  // Production Vercel frontend
  productionFrontendUrl,

  // Environment variables
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,

  // Local development
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:5177",
].filter(Boolean);

console.log("🌍 Allowed CORS origins:");
console.log(allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without an Origin header.
      // This includes some server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      // Allow configured origins.
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error(
        `❌ CORS blocked for origin: ${origin}`,
      );

      return callback(
        new Error(`CORS blocked for origin: ${origin}`),
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],

    optionsSuccessStatus: 204,
  }),
);

// ─────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────

app.use(
  express.json({
    limit: "10mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

// ─────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);

app.use("/api/orders", orderRoutes);

app.use("/contact", contactRoutes);

app.use("/api/group-orders", groupOrderRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/notifications", notificationRoutes);

// ─────────────────────────────────────────────────────────────
// AUTH ROUTES DEBUG
// ─────────────────────────────────────────────────────────────

try {
  if (authRoutes && Array.isArray(authRoutes.stack)) {
    console.log(
      "authRoutes.stack found:",
      authRoutes.stack.map((layer) => {
        if (
          layer &&
          layer.route &&
          layer.route.path
        ) {
          return {
            path: layer.route.path,
            methods: Object.keys(
              layer.route.methods || {},
            ),
          };
        }

        return {
          name: layer && layer.name,
        };
      }),
    );
  } else {
    console.log(
      "authRoutes.stack is not an array or not present",
    );
  }
} catch (error) {
  console.warn(
    "Could not inspect authRoutes.stack:",
    error.message,
  );
}

// ─────────────────────────────────────────────────────────────
// MOUNTED ROUTES DEBUG
// ─────────────────────────────────────────────────────────────

try {
  console.log("Mounted routes:");

  if (
    app._router &&
    Array.isArray(app._router.stack)
  ) {
    app._router.stack.forEach((layer) => {
      if (
        layer.route &&
        layer.route.path
      ) {
        const methods = Object.keys(
          layer.route.methods,
        ).join(",");

        console.log(
          `${methods} ${layer.route.path}`,
        );
      } else if (
        layer.name === "router" &&
        layer.handle &&
        layer.handle.stack
      ) {
        layer.handle.stack.forEach(
          (routeLayer) => {
            if (
              routeLayer.route &&
              routeLayer.route.path
            ) {
              const methods = Object.keys(
                routeLayer.route.methods,
              ).join(",");

              console.log(
                `${methods} ${routeLayer.route.path}`,
              );
            }
          },
        );
      }
    });
  }
} catch (error) {
  console.warn(
    "Could not enumerate routes:",
    error.message,
  );
}

// ─────────────────────────────────────────────────────────────
// DEBUG ROUTE
// ─────────────────────────────────────────────────────────────

app.get("/__routes", (req, res) => {
  try {
    const routes = [];

    if (
      app &&
      app._router &&
      Array.isArray(app._router.stack)
    ) {
      app._router.stack.forEach((layer) => {
        try {
          if (
            layer &&
            layer.route &&
            layer.route.path
          ) {
            const methods = Object.keys(
              layer.route.methods || {},
            ).join(",");

            routes.push({
              path: layer.route.path,
              methods,
            });

            return;
          }

          if (
            layer &&
            layer.name === "router" &&
            layer.handle &&
            Array.isArray(layer.handle.stack)
          ) {
            layer.handle.stack.forEach(
              (routeLayer) => {
                if (
                  routeLayer &&
                  routeLayer.route &&
                  routeLayer.route.path
                ) {
                  const methods = Object.keys(
                    routeLayer.route.methods || {},
                  ).join(",");

                  routes.push({
                    path: routeLayer.route.path,
                    methods,
                  });
                }
              },
            );

            return;
          }

          if (layer && layer.name) {
            routes.push({
              path: `<${layer.name}>`,
            });
          }
        } catch (error) {
          console.error(
            "Route inspection error:",
            error.message,
          );
        }
      });
    }

    res.json({
      routes,
    });
  } catch (error) {
    res.status(500).json({
      error: "Could not list routes",
    });
  }
});

// ─────────────────────────────────────────────────────────────
// MONGODB CONFIG
// ─────────────────────────────────────────────────────────────

const MONGO_URI = buildMongoUri();

const PORT = Number(
  process.env.PORT || 5000,
);

// ─────────────────────────────────────────────────────────────
// PRODUCT MODEL
// ─────────────────────────────────────────────────────────────

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    description: String,
  },
  {
    timestamps: true,
  },
);

const Product =
  mongoose.models.Product ||
  mongoose.model(
    "Product",
    ProductSchema,
  );

// ─────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Express server is running",
  });
});

// ─────────────────────────────────────────────────────────────
// GET PRODUCTS
// ─────────────────────────────────────────────────────────────

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    res.json(products);
  } catch (error) {
    console.error(
      "Unable to load products:",
      error.message,
    );

    res.status(500).json({
      error: "Unable to load products",
    });
  }
});

// ─────────────────────────────────────────────────────────────
// CREATE PRODUCT
// ─────────────────────────────────────────────────────────────

app.post("/api/products", async (req, res) => {
  try {
    const product = await Product.create(
      req.body,
    );

    res.status(201).json(product);
  } catch (error) {
    console.error(
      "Product creation error:",
      error.message,
    );

    res.status(400).json({
      error: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────
// DIRECT PAYMENT TEST
// ─────────────────────────────────────────────────────────────

app.post(
  "/api/payments-direct-test",
  (req, res) => {
    console.log(
      "🔥🔥🔥 DIRECT PAYMENT TEST HIT 🔥🔥🔥",
    );

    return res.json({
      success: true,
      message: "Direct payment test works",
    });
  },
);

// ─────────────────────────────────────────────────────────────
// 404 HANDLER
// ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// ─────────────────────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────────────────────

app.use(
  (err, req, res, next) => {
    try {
      console.error(
        "Unhandled error at",
        req.method,
        req.path,
      );

      if (err && err.stack) {
        console.error(err.stack);
      } else {
        console.error(err);
      }
    } catch (logError) {
      console.error(
        "Error while logging error:",
        logError.message,
      );
    }

    res.status(500).json({
      message:
        err && err.message
          ? err.message
          : "Something went wrong. Please try again.",
    });
  },
);

// ─────────────────────────────────────────────────────────────
// DATABASE + SERVER START
// ─────────────────────────────────────────────────────────────

async function startServer() {
  try {
    if (!MONGO_URI) {
      console.error(
        "✖ MongoDB connection string is missing.",
      );

      console.error(
        "Add MONGO_URI to your backend .env file.",
      );

      return;
    }

    console.log(
      "Connecting to MongoDB...",
    );

    await mongoose.connect(
      MONGO_URI,
      {
        autoIndex: true,
        serverSelectionTimeoutMS: 10000,
      },
    );

    console.log(
      "✔ Connected to MongoDB",
    );

    app.listen(
      PORT,
      () => {
        console.log(
          `✔ Server running on port ${PORT}`,
        );

        console.log(
          `✔ Production backend: https://kings-snacks-and-small-chops-fast-food-4.onrender.com`,
        );

        console.log(
          `✔ Health check: https://kings-snacks-and-small-chops-fast-food-4.onrender.com/api/health`,
        );

        console.log(
          `✔ Production frontend: ${productionFrontendUrl}`,
        );
      },
    );
  } catch (error) {
    console.error(
      "✖ Server startup failed:",
    );

    console.error(error.message);
  }
}

// ─────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────

startServer();