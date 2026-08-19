import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token = null;

    // ─────────────────────────────────────────────────────────
    // 1. CHECK AUTHORIZATION HEADER
    // ─────────────────────────────────────────────────────────

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
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
      console.error("❌ Authentication failed: no token received");

      console.error("Origin:", req.headers.origin || "No origin");

      console.error(
        "Cookie received:",
        req.cookies?.token ? "YES" : "NO",
      );

      console.error(
        "Authorization header:",
        req.headers.authorization ? "YES" : "NO",
      );

      return res.status(401).json({
        message: "Not authenticated. Please sign in.",
      });
    }

    // ─────────────────────────────────────────────────────────
    // 4. VERIFY JWT
    // ─────────────────────────────────────────────────────────

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    // ─────────────────────────────────────────────────────────
    // 5. FIND USER
    // ─────────────────────────────────────────────────────────

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User account no longer exists.",
      });
    }

    // ─────────────────────────────────────────────────────────
    // 6. ATTACH USER TO REQUEST
    // ─────────────────────────────────────────────────────────

    req.user = user;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Your session has expired. Please sign in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    return res.status(401).json({
      message: "Authentication failed. Please sign in again.",
    });
  }
};

export default protect;