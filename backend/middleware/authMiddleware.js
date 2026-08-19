import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token = null;

    // ─────────────────────────────────────────────────────────
    // 1. CHECK AUTHORIZATION HEADER
    // ─────────────────────────────────────────────────────────

    const authHeader = req.headers.authorization;

    if (
      authHeader &&
      typeof authHeader === "string" &&
      authHeader.startsWith("Bearer ")
    ) {
      token = authHeader.substring(7).trim();
    }

    // ─────────────────────────────────────────────────────────
    // 2. CHECK HTTP-ONLY COOKIE
    // ─────────────────────────────────────────────────────────

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // ─────────────────────────────────────────────────────────
    // 3. NO TOKEN
    // ─────────────────────────────────────────────────────────

    if (!token) {
      console.error("❌ AUTH FAILED: No token received");
      console.error("Request:", req.method, req.originalUrl);
      console.error("Origin:", req.headers.origin || "No origin");
      console.error(
        "Authorization:",
        req.headers.authorization ? "PRESENT" : "MISSING",
      );
      console.error(
        "Cookie:",
        req.cookies?.token ? "PRESENT" : "MISSING",
      );

      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please sign in.",
      });
    }

    // ─────────────────────────────────────────────────────────
    // 4. VERIFY JWT
    // ─────────────────────────────────────────────────────────

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing from environment variables.");

      return res.status(500).json({
        success: false,
        message: "Authentication configuration error.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error("❌ JWT verification failed:", error.message);

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Your session has expired. Please sign in again.",
        });
      }

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid authentication token.",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Authentication token could not be verified.",
      });
    }

    // ─────────────────────────────────────────────────────────
    // 5. CHECK USER ID
    // ─────────────────────────────────────────────────────────

    if (!decoded || !decoded.id) {
      console.error("❌ JWT does not contain a user ID.");

      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    // ─────────────────────────────────────────────────────────
    // 6. FIND USER
    // ─────────────────────────────────────────────────────────

    const user = await User.findById(decoded.id);

    if (!user) {
      console.error(
        "❌ Authentication failed: user not found:",
        decoded.id,
      );

      return res.status(401).json({
        success: false,
        message: "User account no longer exists.",
      });
    }

    // ─────────────────────────────────────────────────────────
    // 7. ATTACH USER TO REQUEST
    // ─────────────────────────────────────────────────────────

    req.user = user;

    console.log(
      `✅ AUTH SUCCESS: ${user.email} → ${req.method} ${req.originalUrl}`,
    );

    next();
  } catch (error) {
    console.error(
      "❌ Authentication middleware error:",
      error.stack || error,
    );

    return res.status(401).json({
      success: false,
      message: "Authentication failed. Please sign in again.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// DEFAULT EXPORT
// ─────────────────────────────────────────────────────────────

export default protect;