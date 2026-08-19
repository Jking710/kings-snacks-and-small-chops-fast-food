import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/Order.js";

// ============================================================
// KORA API
// ============================================================

const KORA_API_URL =
  "https://api.korapay.com/merchant/api/v1";

// ============================================================
// GENERATE UNIQUE ORDER CODE
// ============================================================

const generateOrderCode = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const randomPart = crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase();

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

    if (
      !deliveryAddress ||
      typeof deliveryAddress !== "string" ||
      !deliveryAddress.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    if (
      !phone ||
      typeof phone !== "string" ||
      !phone.trim()
    ) {
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
    //
    // Your frontend currently sends numeric IDs such as:
    //
    // id: 1
    // id: 2
    //
    // Order.js requires productId to be a MongoDB ObjectId.
    //
    // Since these frontend IDs are not MongoDB ObjectIds,
    // generate an ObjectId for the order item.
    //
    // The original frontend ID is not changed or used as
    // the MongoDB ObjectId.
    // ==========================================================

    const orderItems = items.map((item) => {
      const productId = new mongoose.Types.ObjectId();

      return {
        productId,

        name: String(item.name || "").trim(),

        price: Number(item.price),

        quantity: Number(item.quantity),

        image: item.img || item.image || "",
      };
    });

    console.log("📦 Converted order items:", orderItems);

    // ==========================================================
    // GENERATE REFERENCES
    // ==========================================================

    const reference = `KS-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

    const orderCode = generateOrderCode();

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

      paymentMethod: "korapay",
      paymentStatus: "pending",
      orderStatus: "pending",

      transactionReference: reference,
    });

    console.log("✅ Order created:", order._id);
    console.log("🧾 Order code:", order.orderCode);

    // ==========================================================
    // KORA URLS
    // ==========================================================

    const frontendUrl =
      process.env.FRONTEND_URL ||
      process.env.CLIENT_URL ||
      "http://localhost:5173";

    const backendUrl =
      process.env.BACKEND_URL ||
      `http://localhost:${process.env.PORT || 5000}`;

    const redirectUrl =
      `${frontendUrl}/payment/callback`;

    const notificationUrl =
      `${backendUrl}/api/payments/kora/webhook`;

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

    const response = await fetch(
      `${KORA_API_URL}/charges/initialize`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${process.env.KORA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify(koraPayload),
      },
    );

    console.log(
      "🔥 Kora HTTP status:",
      response.status,
    );

    // ==========================================================
    // READ RESPONSE
    // ==========================================================

    const responseText =
      await response.text();

    console.log(
      "🔥 Raw Kora response:",
      responseText,
    );

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error(
        "❌ Kora returned invalid JSON:",
        error,
      );

      await Order.findByIdAndDelete(order._id);

      return res.status(502).json({
        success: false,
        message:
          "Kora returned an invalid response",
      });
    }

    console.log(
      "🔥 Parsed Kora response:",
      data,
    );

    // ==========================================================
    // KORA ERROR
    // ==========================================================

    if (!response.ok || !data.status) {
      console.error(
        "❌ Kora payment initialization failed:",
        data,
      );

      await Order.findByIdAndDelete(order._id);

      return res.status(400).json({
        success: false,
        message:
          data.message ||
          data.error ||
          "Unable to initialize Kora payment",
      });
    }

    // ==========================================================
    // CHECK CHECKOUT URL
    // ==========================================================

    const checkoutUrl =
      data?.data?.checkout_url;

    if (!checkoutUrl) {
      console.error(
        "❌ Kora did not return checkout_url:",
        data,
      );

      await Order.findByIdAndDelete(order._id);

      return res.status(502).json({
        success: false,
        message:
          "Kora did not return a checkout link",
      });
    }

    // ==========================================================
    // SUCCESS
    // ==========================================================

    console.log(
      "✅ Kora payment initialized successfully",
    );

    console.log(
      "🔗 Checkout URL:",
      checkoutUrl,
    );

    return res.status(200).json({
      success: true,

      message:
        "Payment initialized successfully",

      orderId: order._id,

      orderCode: order.orderCode,

      reference,

      checkoutUrl,
    });
  } catch (error) {
    console.error(
      "🔥 Kora payment initialization error:",
    );

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to initialize payment",
    });
  }
};

// ============================================================
// VERIFY KORA PAYMENT
// ============================================================

export const verifyKoraPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    console.log("🔥 VERIFY KORA PAYMENT");
    console.log("🔥 Reference:", reference);

    // ==========================================================
    // VALIDATE REFERENCE
    // ==========================================================

    if (!reference) {
      return res.status(400).json({
        success: false,
        paid: false,
        message: "Payment reference is required",
      });
    }

    // ==========================================================
    // CHECK SECRET KEY
    // ==========================================================

    if (!process.env.KORA_SECRET_KEY) {
      console.error(
        "❌ KORA_SECRET_KEY is missing",
      );

      return res.status(500).json({
        success: false,
        paid: false,
        message:
          "Kora payment configuration is missing",
      });
    }

    // ==========================================================
    // FIND ORDER
    // ==========================================================

    const order = await Order.findOne({
      transactionReference: reference,
    });

    if (!order) {
      console.error(
        "❌ Order not found:",
        reference,
      );

      return res.status(404).json({
        success: false,
        paid: false,
        message: "Order not found",
      });
    }

    console.log(
      "✅ Order found:",
      order.orderCode,
    );

    // ==========================================================
    // QUERY KORA
    // ==========================================================

    const response = await fetch(
      `${KORA_API_URL}/charges/${encodeURIComponent(
        reference,
      )}`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${process.env.KORA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const responseText =
      await response.text();

    console.log(
      "🔥 Kora verification status:",
      response.status,
    );

    console.log(
      "🔥 Kora verification response:",
      responseText,
    );

    // ==========================================================
    // PARSE RESPONSE
    // ==========================================================

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error(
        "❌ Invalid JSON from Kora",
      );

      return res.status(502).json({
        success: false,
        paid: false,
        message:
          "Invalid response from Kora",
      });
    }

    // ==========================================================
    // KORA RESPONSE ERROR
    // ==========================================================

    if (!response.ok || !data.status) {
      console.error(
        "❌ Kora verification failed:",
        data,
      );

      return res.status(400).json({
        success: false,
        paid: false,
        message:
          data.message ||
          "Unable to verify payment with Kora",
      });
    }

    const payment = data.data;

    console.log(
      "🔥 Kora payment status:",
      payment?.status,
    );

    console.log(
      "🔥 Kora payment amount:",
      payment?.amount,
    );

    console.log(
      "🔥 Expected amount:",
      order.totalAmount,
    );

    // ==========================================================
    // CHECK PAYMENT STATUS
    // ==========================================================

    if (payment?.status !== "success") {
      console.log(
        "⏳ Payment is not successful yet",
      );

      return res.status(200).json({
        success: false,
        paid: false,

        status:
          payment?.status ||
          "pending",

        orderId: order._id,

        orderCode: order.orderCode,

        message:
          "Payment has not been confirmed",
      });
    }

    // ==========================================================
    // CHECK PAYMENT AMOUNT
    // ==========================================================

    const paidAmount = Number(
      payment?.amount_paid ??
        payment?.amount,
    );

    console.log(
      "💰 Paid amount:",
      paidAmount,
    );

    console.log(
      "💰 Expected amount:",
      Number(order.totalAmount),
    );

    if (
      paidAmount !==
      Number(order.totalAmount)
    ) {
      console.error(
        "❌ Payment amount mismatch",
      );

      return res.status(400).json({
        success: false,
        paid: false,
        message:
          "Payment amount does not match the order",
      });
    }

    // ==========================================================
    // MARK ORDER AS PAID
    // ==========================================================

    if (order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";

      order.paymentReference =
        payment?.payment_reference ||
        reference;

      order.paidAt = new Date();

      // Payment is complete.
      // Delivery is still pending.
      order.orderStatus = "pending";

      await order.save();

      console.log(
        `✅ Order ${order.orderCode} marked as PAID`,
      );
    } else {
      console.log(
        "ℹ️ Order is already marked as PAID",
      );
    }

    // ==========================================================
    // SUCCESS
    // ==========================================================

    return res.status(200).json({
      success: true,

      paid: true,

      status: "success",

      orderId: order._id,

      orderCode: order.orderCode,

      message:
        "Payment verified successfully",
    });
  } catch (error) {
    console.error(
      "❌ Kora verification error:",
      error,
    );

    return res.status(500).json({
      success: false,
      paid: false,
      message:
        error.message ||
        "Payment verification failed",
    });
  }
};

// ============================================================
// KORA WEBHOOK
// ============================================================

export const handleKoraWebhook = async (
  req,
  res,
) => {
  try {
    console.log(
      "🔥 Kora webhook received",
    );

    // ==========================================================
    // GET SIGNATURE
    // ==========================================================

    const signature =
      req.headers[
        "x-korapay-signature"
      ];

    const webhookSecret =
      process.env.KORA_SECRET_KEY;

    if (
      !signature ||
      !webhookSecret
    ) {
      console.error(
        "❌ Missing webhook signature or secret",
      );

      return res.status(200).json({
        success: false,
        message:
          "Invalid webhook request",
      });
    }

    // ==========================================================
    // VERIFY SIGNATURE
    // ==========================================================

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          webhookSecret,
        )
        .update(
          JSON.stringify(
            req.body.data,
          ),
        )
        .digest("hex");

    if (
      signature !==
      expectedSignature
    ) {
      console.error(
        "❌ Invalid Kora webhook signature",
      );

      return res.status(200).json({
        success: false,
        message:
          "Invalid signature",
      });
    }

    console.log(
      "✅ Kora webhook signature verified",
    );

    // ==========================================================
    // GET WEBHOOK DATA
    // ==========================================================

    const { event, data } =
      req.body;

    console.log(
      "🔥 Kora webhook event:",
      event,
    );

    // ==========================================================
    // IGNORE OTHER EVENTS
    // ==========================================================

    if (
      event !==
      "charge.success"
    ) {
      console.log(
        "ℹ️ Ignoring webhook event:",
        event,
      );

      return res.status(200).json({
        success: true,
        message:
          "Webhook received",
      });
    }

    // ==========================================================
    // GET REFERENCE
    // ==========================================================

    const reference =
      data?.payment_reference ||
      data?.reference;

    if (!reference) {
      console.error(
        "❌ Transaction reference missing",
      );

      return res.status(200).json({
        success: false,
        message:
          "Transaction reference missing",
      });
    }

    console.log(
      "🔥 Payment reference:",
      reference,
    );

    // ==========================================================
    // FIND ORDER
    // ==========================================================

    const order =
      await Order.findOne({
        transactionReference:
          reference,
      });

    if (!order) {
      console.error(
        "❌ Order not found:",
        reference,
      );

      return res.status(200).json({
        success: false,
        message:
          "Order not found",
      });
    }

    console.log(
      "✅ Webhook order found:",
      order.orderCode,
    );

    // ==========================================================
    // PREVENT DUPLICATE PROCESSING
    // ==========================================================

    if (
      order.paymentStatus ===
      "paid"
    ) {
      console.log(
        "ℹ️ Payment already processed",
      );

      return res.status(200).json({
        success: true,
        message:
          "Payment already processed",
      });
    }

    // ==========================================================
    // CHECK PAYMENT AMOUNT
    // ==========================================================

    const paidAmount = Number(
      data?.amount,
    );

    console.log(
      "💰 Expected amount:",
      order.totalAmount,
    );

    console.log(
      "💰 Received amount:",
      paidAmount,
    );

    if (
      paidAmount !==
      Number(order.totalAmount)
    ) {
      console.error(
        "❌ Payment amount mismatch",
      );

      return res.status(200).json({
        success: false,
        message:
          "Payment amount mismatch",
      });
    }

    // ==========================================================
    // MARK ORDER AS PAID
    // ==========================================================

    order.paymentStatus =
      "paid";

    order.paymentReference =
      data?.payment_reference ||
      reference;

    order.paidAt =
      new Date();

    // Payment succeeded.
    // Delivery remains pending.
    order.orderStatus =
      "pending";

    await order.save();

    console.log(
      `✅ Order ${order.orderCode} marked as PAID`,
    );

    console.log(
      `📦 Order status: ${order.orderStatus}`,
    );

    // ==========================================================
    // SUCCESS
    // ==========================================================

    return res.status(200).json({
      success: true,
      message:
        "Payment confirmed",
    });
  } catch (error) {
    console.error(
      "❌ Kora webhook error:",
      error,
    );

    return res.status(200).json({
      success: false,
      message:
        "Webhook received",
    });
  }
};