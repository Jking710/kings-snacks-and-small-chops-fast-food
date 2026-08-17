import crypto from "crypto";
import Order from "../models/Order.js";
import mongoose from "mongoose";

const KORA_API_URL = "https://api.korapay.com/merchant/api/v1";

// ============================================================
// GENERATE UNIQUE ORDER CODE
// ============================================================

const generateOrderCode = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `KNG-${year}${month}${day}-${randomPart}`;
};

// ============================================================
// INITIALIZE KORA PAYMENT
// ============================================================

export const initializeKoraPayment = async (req, res) => {
  try {
    console.log("🔥 KORA INITIALIZE CONTROLLER HIT");
    console.log("👤 User:", req.user?._id);
    console.log("📦 Request body:", req.body);

    const {
      items,
      subtotal,
      deliveryFee,
      totalAmount,
      deliveryAddress,
      phone,
    } = req.body;

    // ==========================================================
    // AUTHENTICATION
    // ==========================================================

    if (!req.user || !req.user._id) {
      console.error("❌ User authentication missing");

      return res.status(401).json({
        success: false,
        message: "User authentication is required",
      });
    }

    // ==========================================================
    // VALIDATION
    // ==========================================================

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    if (!deliveryAddress || !deliveryAddress.trim()) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    if (
      typeof subtotal !== "number" ||
      typeof deliveryFee !== "number" ||
      typeof totalAmount !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    console.log("✅ Order validation passed");

    // ==========================================================
    // KORA SECRET KEY
    // ==========================================================

    if (!process.env.KORA_SECRET_KEY) {
      console.error("❌ KORA_SECRET_KEY is missing");

      return res.status(500).json({
        success: false,
        message: "Kora payment configuration is missing",
      });
    }

    console.log("✅ Kora secret key found");

    // ==========================================================
    // CONVERT CART ITEMS TO ORDER ITEMS
    // ==========================================================

    const orderItems = items.map((item) => ({
      productId: new mongoose.Types.ObjectId(),
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      image: item.img || item.image || "",
    }));

    console.log("📦 Converted order items:", orderItems);

    // ==========================================================
    // GENERATE REFERENCES
    // ==========================================================

    const reference = `KS-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

    const orderCode = `KS-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;

    console.log("🔥 Transaction reference:", reference);
    console.log("🔥 Order code:", orderCode);

    // ==========================================================
    // CREATE ORDER
    // ==========================================================

    console.log("🔥 Creating order in MongoDB...");

    const order = await Order.create({
      user: req.user._id,

      orderCode,

      items: orderItems,

      subtotal,
      deliveryFee,
      totalAmount,

      deliveryAddress: deliveryAddress.trim(),
      phone: phone.trim(),

      paymentMethod: "bank_transfer",
      paymentStatus: "pending",
      orderStatus: "pending",

      transactionReference: reference,
    });

    console.log("✅ Order created:", order._id);
    console.log("🧾 Order code:", order.orderCode);

    // ==========================================================
    // KORA URLS
    // ==========================================================

    const redirectUrl = `${process.env.FRONTEND_URL}/payment/callback`;

    const notificationUrl = `${process.env.BACKEND_URL}/api/payments/kora/webhook`;

    console.log("🔗 Redirect URL:", redirectUrl);
    console.log("🔗 Notification URL:", notificationUrl);

    // ==========================================================
    // KORA PAYLOAD
    // ==========================================================

    const koraPayload = {
      amount: totalAmount,
      currency: "NGN",
      reference,

      redirect_url: redirectUrl,

      notification_url: notificationUrl,

      narration: `Kings Snacks Order ${orderCode}`,

      channels: ["bank_transfer"],

      default_channel: "bank_transfer",

      merchant_bears_cost: true,

      customer: {
        name: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
      },

      metadata: {
        orderId: order._id.toString(),
        orderCode,
      },
    };

    console.log("📤 Sending payment request to Kora...");

    // ==========================================================
    // CALL KORA
    // ==========================================================

    const response = await fetch(`${KORA_API_URL}/charges/initialize`, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${process.env.KORA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify(koraPayload),
    });

    console.log("🔥 Kora HTTP status:", response.status);

    // ==========================================================
    // READ RAW RESPONSE
    // ==========================================================

    const responseText = await response.text();

    console.log("🔥 Raw Kora response:", responseText);

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ Kora returned invalid JSON:", parseError);

      await Order.findByIdAndDelete(order._id);

      return res.status(502).json({
        success: false,
        message: "Kora returned an invalid response",
      });
    }

    console.log("🔥 Parsed Kora response:", data);

    // ==========================================================
    // KORA ERROR
    // ==========================================================

    if (!response.ok || !data.status) {
      console.error("❌ Kora payment initialization failed:", data);

      await Order.findByIdAndDelete(order._id);

      return res.status(400).json({
        success: false,
        message:
          data.message || data.error || "Unable to initialize Kora payment",
      });
    }

    // ==========================================================
    // CHECK CHECKOUT URL
    // ==========================================================

    const checkoutUrl = data?.data?.checkout_url;

    if (!checkoutUrl) {
      console.error("❌ Kora did not return checkout_url:", data);

      await Order.findByIdAndDelete(order._id);

      return res.status(502).json({
        success: false,
        message: "Kora did not return a checkout link",
      });
    }

    // ==========================================================
    // SUCCESS
    // ==========================================================

    console.log("✅ Kora payment initialized successfully");

    console.log("🔗 Checkout URL:", checkoutUrl);

    return res.status(200).json({
      success: true,

      message: "Payment initialized successfully",

      orderId: order._id,

      orderCode: order.orderCode,

      reference,

      checkoutUrl,
    });
  } catch (error) {
    console.error("🔥 Kora payment initialization error:");

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to initialize payment",
    });
  }
};

// ============================================================
// KORA WEBHOOK
// ============================================================

export const handleKoraWebhook = async (req, res) => {
  try {
    console.log("🔥 Kora webhook received");

    const signature = req.headers["x-korapay-signature"];

    const webhookSecret = process.env.KORA_SECRET_KEY;

    if (!signature || !webhookSecret) {
      console.error("❌ Missing webhook signature or secret");

      return res.status(200).json({
        success: false,
        message: "Invalid webhook request",
      });
    }

    // ==========================================================
    // VERIFY SIGNATURE
    // ==========================================================

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body.data))
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("❌ Invalid Kora webhook signature");

      return res.status(200).json({
        success: false,
        message: "Invalid signature",
      });
    }

    const { event, data } = req.body;

    console.log("🔥 Kora webhook event:", event);

    // ==========================================================
    // IGNORE OTHER EVENTS
    // ==========================================================

    if (event !== "charge.success") {
      return res.status(200).json({
        success: true,
        message: "Webhook received",
      });
    }

    // ==========================================================
    // GET REFERENCE
    // ==========================================================

    const reference = data?.payment_reference || data?.reference;

    if (!reference) {
      console.error("❌ Transaction reference missing");

      return res.status(200).json({
        success: false,
        message: "Transaction reference missing",
      });
    }

    console.log("🔥 Payment reference:", reference);

    // ==========================================================
    // FIND ORDER
    // ==========================================================

    const order = await Order.findOne({
      transactionReference: reference,
    });

    if (!order) {
      console.error("❌ Order not found:", reference);

      return res.status(200).json({
        success: false,
        message: "Order not found",
      });
    }

    // ==========================================================
    // PREVENT DUPLICATES
    // ==========================================================

    if (order.paymentStatus === "paid") {
      console.log("ℹ️ Payment already processed");

      return res.status(200).json({
        success: true,
        message: "Payment already processed",
      });
    }

    // ==========================================================
    // CHECK PAYMENT AMOUNT
    // ==========================================================

    const paidAmount = Number(data.amount);

    console.log("Expected amount:", order.totalAmount);

    console.log("Received amount:", paidAmount);

    if (paidAmount !== order.totalAmount) {
      console.error("❌ Payment amount mismatch");

      return res.status(200).json({
        success: false,
        message: "Payment amount mismatch",
      });
    }

    // ==========================================================
    // MARK PAYMENT AS PAID
    // ==========================================================

    order.paymentStatus = "paid";

    order.paymentReference = data?.payment_reference || reference;

    order.paidAt = new Date();

    // IMPORTANT:
    // The payment is successful,
    // but delivery is still pending.

    order.orderStatus = "pending";

    await order.save();

    console.log(`✅ Order ${order.orderCode} marked as PAID`);

    console.log(`📦 Order status: ${order.orderStatus}`);

    return res.status(200).json({
      success: true,
      message: "Payment confirmed",
    });
  } catch (error) {
    console.error("❌ Kora webhook error:", error);

    return res.status(200).json({
      success: false,
      message: "Webhook received",
    });
  }
};
