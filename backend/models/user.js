import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please enter a valid email address",
      ],
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    // ─────────────────────────────────────────────
    // PASSWORD RESET OTP
    // ─────────────────────────────────────────────

    resetPasswordOTP: {
      type: String,
      default: undefined,
      select: false,
    },

    resetPasswordOTPExpiry: {
      type: Date,
      default: undefined,
      select: false,
    },

    // ─────────────────────────────────────────────
    // PASSWORD RESET TOKEN
    // ─────────────────────────────────────────────

    resetPasswordToken: {
      type: String,
      default: undefined,
      select: false,
    },

    resetPasswordTokenExpiry: {
      type: Date,
      default: undefined,
      select: false,
    },
  },

  {
    timestamps: true,
  },
);


// ─────────────────────────────────────────────
// HASH PASSWORD BEFORE SAVING
// ─────────────────────────────────────────────

UserSchema.pre("save", async function () {
  // Google users don't have a password
  if (!this.password) {
    return;
  }

  // Don't hash password again if it hasn't changed
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(12);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );
});


// ─────────────────────────────────────────────
// COMPARE PASSWORD
// ─────────────────────────────────────────────

UserSchema.methods.comparePassword = async function (
  candidatePassword
) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(
    candidatePassword,
    this.password
  );
};


// ─────────────────────────────────────────────
// SAFE USER OBJECT
// ─────────────────────────────────────────────

UserSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    phone: this.phone,
    profilePicture: this.profilePicture,
    authProvider: this.authProvider,
    createdAt: this.createdAt,
  };
};


const User =
  mongoose.models.User ||
  mongoose.model("User", UserSchema);

export default User;