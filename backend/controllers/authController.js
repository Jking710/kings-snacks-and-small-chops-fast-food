import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parsePhoneNumberFromString } from "libphonenumber-js";

import User from "../models/User.js";
import Notification from "../models/Notification.js";

// ─────────────────────────────────────────────────────────────
// FILE PATHS
// ─────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─────────────────────────────────────────────────────────────
// GOOGLE CLIENT
// ─────────────────────────────────────────────────────────────

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// ─────────────────────────────────────────────────────────────
// GENERATE JWT
// ─────────────────────────────────────────────────────────────

const generateToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ─────────────────────────────────────────────────────────────
// SEND TOKEN RESPONSE
// ─────────────────────────────────────────────────────────────

const sendTokenResponse = (
  res,
  user,
  statusCode = 200
) => {
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
// CREATE NOTIFICATION SAFELY
// ─────────────────────────────────────────────────────────────
//
// Notification errors must NEVER break login or registration.
// The notification is a secondary operation.
// ─────────────────────────────────────────────────────────────

const createNotificationSafely = async ({
  user,
  type,
  title,
  message,
  link = "",
  metadata = {},
}) => {
  try {
    if (!user) {
      console.error(
        "Notification skipped: user is missing."
      );

      return null;
    }

    const notification = await Notification.create({
      user: user._id || user,

      type,

      title,

      message,

      link,

      metadata,

      isRead: false,
    });

    console.log(
      `Notification created successfully for user ${user._id || user}`
    );

    return notification;
  } catch (error) {
    console.error(
      "Notification creation failed:",
      error.stack || error
    );

    // Do NOT throw the error.
    // Login and registration must continue.
    return null;
  }
};

// ─────────────────────────────────────────────────────────────
// LOGIN NOTIFICATION
// ─────────────────────────────────────────────────────────────

const createLoginNotification = (
  user,
  loginMethod = "email"
) => {
  return createNotificationSafely({
    user,

    type: "login",

    title:
      loginMethod === "google"
        ? "Google login successful"
        : "New login detected",

    message:
      loginMethod === "google"
        ? "You successfully signed in with Google."
        : "You successfully signed in to your Kings Chops account.",

    link: "/profile",

    metadata: {
      loginMethod,
    },
  });
};

// ─────────────────────────────────────────────────────────────
// WELCOME NOTIFICATION
// ─────────────────────────────────────────────────────────────

const createWelcomeNotification = (
  user
) => {
  return createNotificationSafely({
    user,

    type: "welcome",

    title: "Welcome to Kings Chops",

    message: `Welcome ${user.firstName}. Your Kings Chops account is ready.`,

    link: "/menu",

    metadata: {
      registrationMethod:
        user.authProvider || "local",
    },
  });
};

// ─────────────────────────────────────────────────────────────
// PHONE VALIDATION
// ─────────────────────────────────────────────────────────────

const validatePhoneForCountry = (
  phone,
  countryCode
) => {
  if (!phone || !phone.trim()) {
    return {
      valid: false,
      message: "Phone number is required.",
    };
  }

  if (!countryCode || !countryCode.trim()) {
    return {
      valid: false,
      message: "Country is required.",
    };
  }

  try {
    const normalizedCountryCode =
      countryCode.trim().toUpperCase();

    const number =
      parsePhoneNumberFromString(
        phone.trim(),
        normalizedCountryCode
      );

    if (!number) {
      return {
        valid: false,
        message:
          "The phone number could not be verified.",
      };
    }

    if (!number.isValid()) {
      return {
        valid: false,
        message:
          "Please enter a valid phone number.",
      };
    }

    if (
      number.country !==
      normalizedCountryCode
    ) {
      return {
        valid: false,
        message:
          "Your phone number does not match your selected country.",
      };
    }

    return {
      valid: true,
      phone: number.number,
      countryCode: number.country,
    };
  } catch {
    return {
      valid: false,
      message:
        "Your phone number does not match your selected country.",
    };
  }
};

// ─────────────────────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────────────────────

export const register = async (
  req,
  res
) => {
  console.log(
    "authController.register invoked"
  );

  try {
    try {
      fs.appendFileSync(
        path.join(
          __dirname,
          "register_hits.log"
        ),
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

    const {
      firstName,
      lastName,
      email,
      phone,
      countryCode,
      country,
      state,
      capital,
      address,
      password,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "First name, last name, email and password are required.",
      });
    }

    if (!address?.trim()) {
      return res.status(400).json({
        message:
          "Delivery address is required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters.",
      });
    }

    const emailRegex =
      /^\S+@\S+\.\S+$/;

    if (
      !emailRegex.test(email.trim())
    ) {
      return res.status(400).json({
        message:
          "Please enter a valid email.",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          "This email has already been registered. Please sign in instead.",
      });
    }

    let formattedPhone = "";

    let normalizedCountryCode =
      countryCode || "";

    let normalizedCountry =
      country || "";

    if (phone?.trim()) {
      if (!countryCode) {
        return res.status(400).json({
          message:
            "Select your country before entering your phone number.",
        });
      }

      const phoneResult =
        validatePhoneForCountry(
          phone,
          countryCode
        );

      if (!phoneResult.valid) {
        return res.status(400).json({
          message:
            phoneResult.message,
        });
      }

      formattedPhone =
        phoneResult.phone;

      normalizedCountryCode =
        phoneResult.countryCode;

      normalizedCountry =
        country?.trim() || "";
    }

    const user = await User.create({
      firstName: firstName.trim(),

      lastName: lastName.trim(),

      email: normalizedEmail,

      phone: formattedPhone,

      country: normalizedCountry,

      countryCode:
        normalizedCountryCode,

      state: state?.trim() || "",

      capital: capital?.trim() || "",

      address: address.trim(),

      password,

      authProvider: "local",
    });

    console.log(
      "User created:",
      user._id
    );

    // Notification failure does not affect registration.
    await createWelcomeNotification(
      user
    );

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
// LOGIN
// ─────────────────────────────────────────────────────────────

export const login = async (
  req,
  res
) => {
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
      await user.comparePassword(
        password
      );

    if (!isMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    // Create notification.
    // The helper catches notification errors.
    await createLoginNotification(
      user,
      "email"
    );

    // Login response is sent regardless of
    // notification creation status.
    return sendTokenResponse(
      res,
      user
    );
  } catch (error) {
    console.error(
      "Login error:",
      error.stack || error
    );

    return res.status(500).json({
      message:
        "Login failed. Please try again.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GOOGLE AUTH
// ─────────────────────────────────────────────────────────────

export const googleAuth = async (
  req,
  res
) => {
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

        authProvider: "google",
      });

      await createWelcomeNotification(
        user
      );

      return sendTokenResponse(
        res,
        user,
        201
      );
    }

    let user = await User.findOne({
      googleId,
    });

    if (user) {
      await createLoginNotification(
        user,
        "google"
      );

      return sendTokenResponse(
        res,
        user
      );
    }

    user = await User.findOne({
      email: normalizedEmail,
    });

    if (user) {
      user.googleId = googleId;

      if (
        !user.profilePicture &&
        profilePicture
      ) {
        user.profilePicture =
          profilePicture;
      }

      await user.save();

      await createLoginNotification(
        user,
        "google"
      );

      return sendTokenResponse(
        res,
        user
      );
    }

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
// ─────────────────────────────────────────────────────────────

export const getMe = async (
  req,
  res
) => {
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
// UPDATE PROFILE
// ─────────────────────────────────────────────────────────────

export const updateProfile = async (
  req,
  res
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message:
          "Not authenticated.",
      });
    }

    const user =
      await User.findById(
        req.user._id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found.",
      });
    }

    const {
      field,
      value,
      countryCode,
    } = req.body;

    const allowedFields = [
      "firstName",
      "lastName",
      "phone",
      "country",
      "countryCode",
      "state",
      "capital",
      "address",
    ];

    if (!field) {
      return res.status(400).json({
        message:
          "Profile field is required.",
      });
    }

    if (
      !allowedFields.includes(field)
    ) {
      return res.status(400).json({
        message:
          "This profile field cannot be edited.",
      });
    }

    if (
      typeof value !== "string"
    ) {
      return res.status(400).json({
        message:
          "Invalid profile value.",
      });
    }

    const cleanedValue =
      value.trim();

    if (field === "firstName") {
      if (!cleanedValue) {
        return res.status(400).json({
          message:
            "First name is required.",
        });
      }

      user.firstName =
        cleanedValue;
    } else if (
      field === "lastName"
    ) {
      if (!cleanedValue) {
        return res.status(400).json({
          message:
            "Last name is required.",
        });
      }

      user.lastName =
        cleanedValue;
    } else if (
      field === "phone"
    ) {
      const selectedCountry =
        (
          countryCode ||
          user.countryCode ||
          ""
        )
          .trim()
          .toUpperCase();

      if (!selectedCountry) {
        return res.status(400).json({
          message:
            "Select your country before saving your phone number.",
        });
      }

      const result =
        validatePhoneForCountry(
          cleanedValue,
          selectedCountry
        );

      if (!result.valid) {
        return res.status(400).json({
          message:
            result.message,
        });
      }

      user.phone =
        result.phone;

      user.countryCode =
        result.countryCode;

      const displayName =
        new Intl.DisplayNames(
          ["en"],
          {
            type: "region",
          }
        );

      user.country =
        displayName.of(
          result.countryCode
        ) ||
        result.countryCode;
    } else if (
      field === "countryCode"
    ) {
      const newCountryCode =
        cleanedValue.toUpperCase();

      if (
        !/^[A-Z]{2}$/.test(
          newCountryCode
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid country selected.",
        });
      }

      if (!user.phone) {
        return res.status(400).json({
          message:
            "Enter and save your phone number before saving your country.",
        });
      }

      const result =
        validatePhoneForCountry(
          user.phone,
          newCountryCode
        );

      if (!result.valid) {
        return res.status(400).json({
          message:
            "Your phone number does not match the selected country.",
        });
      }

      user.countryCode =
        newCountryCode;

      const displayName =
        new Intl.DisplayNames(
          ["en"],
          {
            type: "region",
          }
        );

      user.country =
        displayName.of(
          newCountryCode
        ) ||
        newCountryCode;
    } else if (
      field === "country"
    ) {
      if (!user.phone) {
        return res.status(400).json({
          message:
            "Enter and save your phone number before saving your country.",
        });
      }

      if (!user.countryCode) {
        return res.status(400).json({
          message:
            "Your country code is missing. Save your phone number first.",
        });
      }

      const displayName =
        new Intl.DisplayNames(
          ["en"],
          {
            type: "region",
          }
        );

      const expectedCountry =
        displayName.of(
          user.countryCode
        );

      if (
        expectedCountry &&
        expectedCountry.toLowerCase() !==
          cleanedValue.toLowerCase()
      ) {
        return res.status(400).json({
          message:
            "The country name does not match your phone number.",
        });
      }

      user.country =
        cleanedValue;
    } else if (
      field === "state"
    ) {
      if (!user.phone) {
        return res.status(400).json({
          message:
            "Enter and save your phone number before saving your location.",
        });
      }

      if (!user.country) {
        return res.status(400).json({
          message:
            "Save your country before saving your state.",
        });
      }

      if (!cleanedValue) {
        return res.status(400).json({
          message:
            "Enter your state.",
        });
      }

      user.state =
        cleanedValue;
    } else if (
      field === "capital"
    ) {
      if (!user.phone) {
        return res.status(400).json({
          message:
            "Enter and save your phone number before saving your location.",
        });
      }

      if (!user.country) {
        return res.status(400).json({
          message:
            "Save your country before saving your capital.",
        });
      }

      if (!cleanedValue) {
        return res.status(400).json({
          message:
            "Enter your capital.",
        });
      }

      user.capital =
        cleanedValue;
    } else if (
      field === "address"
    ) {
      if (!cleanedValue) {
        return res.status(400).json({
          message:
            "Enter your delivery address.",
        });
      }

      if (
        cleanedValue.length > 300
      ) {
        return res.status(400).json({
          message:
            "Address cannot exceed 300 characters.",
        });
      }

      user.address =
        cleanedValue;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `${field} updated successfully.`,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error.stack || error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Could not update your profile. Please try again.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE PHONE
// ─────────────────────────────────────────────────────────────

export const updatePhone = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.user._id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found.",
      });
    }

    const {
      phone,
      countryCode,
    } = req.body;

    const result =
      validatePhoneForCountry(
        phone,
        countryCode ||
          user.countryCode
      );

    if (!result.valid) {
      return res.status(400).json({
        message:
          result.message,
      });
    }

    user.phone =
      result.phone;

    user.countryCode =
      result.countryCode;

    const displayName =
      new Intl.DisplayNames(
        ["en"],
        {
          type: "region",
        }
      );

    user.country =
      displayName.of(
        result.countryCode
      ) ||
      result.countryCode;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Phone number updated successfully.",
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error(
      "Update phone error:",
      error.stack || error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Could not update phone number. Please try again.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────

export const logout = async (
  req,
  res
) => {
  try {
    res.cookie(
      "token",
      "",
      {
        httpOnly: true,
        expires: new Date(0),
        sameSite: "lax",
        secure:
          process.env.NODE_ENV ===
          "production",
      }
    );

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