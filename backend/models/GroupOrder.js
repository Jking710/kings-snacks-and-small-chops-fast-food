import mongoose from "mongoose";

const groupMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      default: "",
    },

    items: [
      {
        id: {
          type: Number,
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        img: {
          type: String,
          default: "",
        },
      },
    ],
  },
  { _id: false }
);

const groupOrderSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },

    groupCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: {
      type: [groupMemberSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["active", "ordered", "cancelled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const GroupOrder =
  mongoose.models.GroupOrder ||
  mongoose.model("GroupOrder", groupOrderSchema);

export default GroupOrder;