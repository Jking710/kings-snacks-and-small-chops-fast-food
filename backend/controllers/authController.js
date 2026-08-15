import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─────────────────────────────────────────────────────────────
// Generate JWT
// ─────────────────────────────────────────────────────────────

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ─────────────────────────────────────────────────────────────
// Send token + user response
// ─────────────────────────────────────────────────────────────

const sendTokenResponse = (res, user, statusCode = 200) => {
  const token = generateToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(statusCode).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
};

// ─────────────────────────────────────────────────────────────
// REGISTER WITH EMAIL + PASSWORD
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────

export const register = async (req, res) => {
  console.log("authController.register invoked");

  try {
    fs.appendFileSync(
      path.join(__dirname, "register_hits.log"),
      `HIT ${new Date().toISOString()} - ${
        req.body?.email || "no-email"
      }\n`
    );
  } catch (error) {
    console.error(
      "Failed to write register_hits.log:",
      error.message
    );
  }

  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
    } = req.body;

    console.log("register payload:", {
      firstName,
      lastName,
      email,
      phone,
      password: password ? "***" : null,
    });

    // ─────────────────────────────────────────────
    // Basic validation
    // ─────────────────────────────────────────────

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters.",
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: "Please enter a valid email.",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    // ─────────────────────────────────────────────
    // CHECK EXISTING EMAIL
    // ─────────────────────────────────────────────

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          "This email has already been registered. Please sign in instead.",
      });
    }

    // ─────────────────────────────────────────────
    // CREATE LOCAL ACCOUNT
    // ─────────────────────────────────────────────

    console.log("creating user in DB...");

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phone: phone || "",
      password,
      authProvider: "local",
    });

    console.log("user created:", user._id);

    return sendTokenResponse(
      res,
      user,
      201
    );
  } catch (error) {
    console.error(
      "Register error:",
      error.stack || error
    );

    try {
      fs.appendFileSync(
        path.join(
          __dirname,
          "register_error.log"
        ),
        `--- ${new Date().toISOString()} ---\n${
          error.stack || error
        }\n\n`
      );
    } catch (fsError) {
      console.error(
        "Failed to write register_error.log:",
        fsError.message
      );
    }

    // MongoDB duplicate key protection
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "This email has already been registered. Please sign in instead.",
      });
    }

    return res.status(500).json({
      message:
        error.message ||
        "Registration failed. Please try again.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// LOGIN WITH EMAIL + PASSWORD
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    // Google-only account
    if (
      user.authProvider === "google" &&
      !user.password
    ) {
      return res.status(401).json({
        message:
          "This account uses Google Sign-In. Please continue with Google.",
      });
    }

    const isMatch =
      await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    return sendTokenResponse(
      res,
      user
    );
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      message:
        "Login failed. Please try again.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GOOGLE LOGIN / REGISTRATION
// POST /api/auth/google
// ─────────────────────────────────────────────────────────────

export const googleAuth = async (req, res) => {
  try {
    const {
      credential,
      isRegistration = false,
    } = req.body;

    if (!credential) {
      return res.status(400).json({
        message:
          "Google credential is missing.",
      });
    }

    // ─────────────────────────────────────────────
    // Verify Google credential
    // ─────────────────────────────────────────────

    const ticket =
      await googleClient.verifyIdToken({
        idToken: credential,
        audience:
          process.env.GOOGLE_CLIENT_ID,
      });

    const payload =
      ticket.getPayload();

    const {
      sub: googleId,
      email,
      given_name: firstName,
      family_name: lastName,
      picture: profilePicture,
    } = payload;

    if (!email) {
      return res.status(400).json({
        message:
          "Could not retrieve email from Google.",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    // ─────────────────────────────────────────────
    // GOOGLE REGISTRATION
    // ─────────────────────────────────────────────
    //
    // IMPORTANT:
    //
    // If the user is registering with Google,
    // DO NOT reuse, link, or modify an existing
    // account.
    //
    // If either the Google ID OR email already
    // exists, registration must be rejected.
    // ─────────────────────────────────────────────

    if (isRegistration) {
      const existingGoogleUser =
        await User.findOne({
          googleId,
        });

      if (existingGoogleUser) {
        return res.status(409).json({
          message:
            "This email has already been registered. Please sign in instead.",
        });
      }

      const existingEmailUser =
        await User.findOne({
          email: normalizedEmail,
        });

      if (existingEmailUser) {
        return res.status(409).json({
          message:
            "This email has already been registered. Please sign in instead.",
        });
      }

      // No existing account.
      // Create a completely new Google account.

      const user = await User.create({
        firstName:
          firstName || "User",

        lastName:
          lastName || "",

        email:
          normalizedEmail,

        googleId,

        profilePicture:
          profilePicture || "",

        authProvider:
          "google",
      });

      console.log(
        "Google user created:",
        user._id
      );

      return sendTokenResponse(
        res,
        user,
        201
      );
    }

    // ─────────────────────────────────────────────
    // GOOGLE LOGIN
    // ─────────────────────────────────────────────

    // First look for Google ID
    let user = await User.findOne({
      googleId,
    });

    if (user) {
      return sendTokenResponse(
        res,
        user
      );
    }

    // ─────────────────────────────────────────────
    // Look for account by email
    // ─────────────────────────────────────────────

    user = await User.findOne({
      email: normalizedEmail,
    });

    if (user) {
      // Existing local account.
      //
      // Since this is LOGIN and not REGISTRATION,
      // we can link the Google account.

      user.googleId = googleId;

      if (
        !user.profilePicture &&
        profilePicture
      ) {
        user.profilePicture =
          profilePicture;
      }

      await user.save();

      return sendTokenResponse(
        res,
        user
      );
    }

    // ─────────────────────────────────────────────
    // No account found
    // ─────────────────────────────────────────────

    return res.status(404).json({
      message:
        "No account was found with this Google account. Please create an account first.",
    });
  } catch (error) {
    console.error(
      "Google auth error:",
      error.stack || error
    );

    return res.status(401).json({
      message:
        error.message ||
        "Google authentication failed. Please try again.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GET CURRENT USER
// GET /api/auth/me
// ─────────────────────────────────────────────────────────────

export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message:
          "Not authenticated.",
      });
    }

    return res.status(200).json({
      success: true,
      user: req.user.toSafeObject(),
    });
  } catch (error) {
    console.error(
      "GetMe error:",
      error
    );

    return res.status(500).json({
      message:
        "Could not fetch user.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE PHONE NUMBER
// PUT /api/auth/phone
// ─────────────────────────────────────────────────────────────

export const updatePhone = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        message: "Phone number is required.",
      });
    }

    const cleanedPhone = phone.trim();

    // Basic phone number validation
    if (!/^[0-9+\-\s()]{7,20}$/.test(cleanedPhone)) {
      return res.status(400).json({
        message: "Please enter a valid phone number.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    user.phone = cleanedPhone;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Phone number updated successfully.",
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("Update phone error:", error);

    return res.status(500).json({
      message: "Could not update phone number. Please try again.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// LOGOUT
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────

export const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      sameSite: "lax",
      secure:
        process.env.NODE_ENV ===
        "production",
    });

    return res.status(200).json({
      success: true,
      message:
        "Logged out successfully.",
    });
  } catch (error) {
    console.error(
      "Logout error:",
      error
    );

    return res.status(500).json({
      message:
        "Logout failed.",
    });
  }
};