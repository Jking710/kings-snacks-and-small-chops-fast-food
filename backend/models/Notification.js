import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "welcome",
        "login",
        "order",
        "cart",
        "payment",
        "delivery",
        "general",
      ],
      default: "general",
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    link: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// INDEXES
// ============================================================

NotificationSchema.index({
  user: 1,
  createdAt: -1,
});

NotificationSchema.index({
  user: 1,
  isRead: 1,
});

// ============================================================
// MODEL
// ============================================================

// Prevent OverwriteModelError during nodemon restarts
const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);

export default Notification;