import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    image: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const OrderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    paymentMethod: {
      type: String,
      enum: [
        "bank_transfer",
        "card",
        "cash",
        "korapay",
      ],
      default: "korapay",
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
      ],
      default: "pending",
    },

    paymentReference: {
      type: String,
      default: "",
      trim: true,
    },

    transactionReference: {
      type: String,
      default: "",
      trim: true,
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "completed",
        "failed",
        "cancelled",
      ],
      default: "pending",
    },

    deliveryConfirmed: {
      type: Boolean,
      default: false,
    },

    deliveryStatus: {
      type: String,
      enum: [
        "pending",
        "delivered",
        "not_delivered",
      ],
      default: "pending",
    },

    deliveryConfirmedAt: {
      type: Date,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


/*
============================================================
GENERATE ORDER CODE
============================================================
*/

OrderSchema.pre("validate", function () {
  if (!this.orderCode) {
    const randomPart = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    this.orderCode = `KS-${Date.now()}-${randomPart}`;
  }
});


const Order = mongoose.model(
  "Order",
  OrderSchema
);

export default Order;