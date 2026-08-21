import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/Order.js";

// ============================================================
// KORA API
// ============================================================

const KORA_API_URL =
  "https://api.korapay.com/merchant/api/v1";

// ============================================================
// PRODUCTION URLS
// ============================================================

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  process.env.CLIENT_URL ||
  "https://kings-snacks-and-small-chops-fast-f-ruby.vercel.app";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://kings-snacks-and-small-chops-fast-food-4.onrender.com";

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

    if (!Array.isArray(items) || items.length === 0) {
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

    // ==========================================================
    // CONVERT CART ITEMS
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
    // KORA CALLBACK URL
    // ==========================================================

    const redirectUrl =
      `${BACKEND_URL}/api/payments/kora/callback`;

    const notificationUrl =
      `${BACKEND_URL}/api/payments/kora/webhook`;

    console.log("🌐 Frontend URL:", FRONTEND_URL);
    console.log("🌐 Backend URL:", BACKEND_URL);
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
          Authorization:
            `Bearer ${process.env.KORA_SECRET_KEY}`,

          "Content-Type": "application/json",
        },

        body: JSON.stringify(koraPayload),
      }
    );

    console.log("🔥 Kora HTTP status:", response.status);

    // ==========================================================
    // READ RESPONSE
    // ==========================================================

    const responseText = await response.text();

    console.log("🔥 Raw Kora response:", responseText);

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error(
        "❌ Kora returned invalid JSON:",
        error
      );

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
      console.error(
        "❌ Kora payment initialization failed:",
        data
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
        data
      );

      await Order.findByIdAndDelete(order._id);

      return res.status(502).json({
        success: false,
        message: "Kora did not return a checkout link",
      });
    }

    // ==========================================================
    // SUCCESS
    // ==========================================================

    console.log(
      "✅ Kora payment initialized successfully"
    );

    console.log(
      "🔗 Checkout URL:",
      checkoutUrl
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
      "🔥 Kora payment initialization error:"
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

    if (!reference) {
      return res.status(400).json({
        success: false,
        paid: false,
        message: "Payment reference is required",
      });
    }

    if (!process.env.KORA_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        paid: false,
        message: "Kora payment configuration is missing",
      });
    }

    const order = await Order.findOne({
      transactionReference: reference,
    });

    if (!order) {
      console.error(
        "❌ Order not found:",
        reference
      );

      return res.status(404).json({
        success: false,
        paid: false,
        message: "Order not found",
      });
    }

    console.log(
      "✅ Order found:",
      order.orderCode
    );

    const response = await fetch(
      `${KORA_API_URL}/charges/${encodeURIComponent(reference)}`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${process.env.KORA_SECRET_KEY}`,

          "Content-Type":
            "application/json",
        },
      }
    );

    const responseText =
      await response.text();

    console.log(
      "🔥 Kora verification status:",
      response.status
    );

    console.log(
      "🔥 Kora verification response:",
      responseText
    );

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      return res.status(502).json({
        success: false,
        paid: false,
        message:
          "Invalid response from Kora",
      });
    }

    if (!response.ok || !data.status) {
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
      payment?.status
    );

    const normalizedStatus =
      String(payment?.status || "").toLowerCase();

    if (normalizedStatus !== "success") {
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

    const paidAmount =
      Number(
        payment?.amount_paid ??
        payment?.amount
      );

    const expectedAmount =
      Number(order.totalAmount);

    if (paidAmount !== expectedAmount) {
      console.error(
        "❌ Payment amount mismatch"
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

      order.orderStatus = "pending";

      await order.save();

      console.log(
        `✅ Order ${order.orderCode} marked as PAID`
      );
    }

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
      error
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


export const handleKoraCallback = async (req, res) => {
  try {
    console.log("🔥🔥 KORA CALLBACK RECEIVED 🔥🔥");

    console.log("🔥 Callback URL:", `${BACKEND_URL}/api/payments/kora/callback`);

    console.log("🔥 Callback query:", req.query);

    console.log("🔥 Callback body:", req.body);

    // ==========================================================
    // GET REFERENCE
    // ==========================================================

    const reference =
      req.query?.reference ||
      req.query?.trxref ||
      req.query?.payment_reference;

    console.log("🔥 Extracted Kora reference:", reference);

    // ==========================================================
    // MISSING REFERENCE
    // ==========================================================

    if (!reference) {
      console.error("❌ Kora callback reference missing");

      const redirectUrl =
        `${FRONTEND_URL}/order-history?payment=failed&reason=missing_reference`;

      console.log("🚀 Redirecting to:", redirectUrl);

      return res.redirect(302, redirectUrl);
    }

    // ==========================================================
    // CHECK KORA SECRET
    // ==========================================================

    if (!process.env.KORA_SECRET_KEY) {
      console.error("❌ KORA_SECRET_KEY is missing");

      const redirectUrl =
        `${FRONTEND_URL}/order-history?payment=failed&reason=configuration`;

      console.log("🚀 Redirecting to:", redirectUrl);

      return res.redirect(302, redirectUrl);
    }

    // ==========================================================
    // FIND ORDER
    // ==========================================================

    const order = await Order.findOne({
      transactionReference: reference,
    });

    if (!order) {
      console.error(
        "❌ Callback order not found:",
        reference,
      );

      const redirectUrl =
        `${FRONTEND_URL}/order-history?payment=failed&reason=order_not_found`;

      console.log("🚀 Redirecting to:", redirectUrl);

      return res.redirect(302, redirectUrl);
    }

    console.log(
      "✅ Callback order found:",
      order.orderCode,
    );

    console.log(
      "💳 Current payment status:",
      order.paymentStatus,
    );

  
    if (order.paymentStatus === "paid") {
      console.log(
        "ℹ️ Webhook already marked order as PAID",
      );

      const redirectUrl =
        `${FRONTEND_URL}/order-history?payment=success&orderId=${order._id}&orderCode=${encodeURIComponent(
          order.orderCode,
        )}`;

      console.log(
        "🚀🚀 REDIRECTING CUSTOMER TO:",
      );

      console.log(
        redirectUrl,
      );

      return res.redirect(302, redirectUrl);
    }

    // ==========================================================
    // VERIFY PAYMENT WITH KORA
    // ==========================================================

    console.log(
      "🔍 Order is not marked as paid yet.",
    );

    console.log(
      "🔍 Verifying transaction directly with Kora...",
    );

    const response = await fetch(
      `${KORA_API_URL}/charges/${encodeURIComponent(
        reference,
      )}`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${process.env.KORA_SECRET_KEY}`,

          "Content-Type":
            "application/json",
        },
      },
    );

    const responseText =
      await response.text();

    console.log(
      "🔥 Callback Kora HTTP status:",
      response.status,
    );

    console.log(
      "🔥 Callback Kora response:",
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
        "❌ Invalid JSON returned by Kora",
      );

      const redirectUrl =
        `${FRONTEND_URL}/order-history?payment=failed&reason=invalid_kora_response`;

      console.log(
        "🚀 Redirecting to:",
        redirectUrl,
      );

      return res.redirect(302, redirectUrl);
    }

    // ==========================================================
    // KORA VERIFICATION FAILED
    // ==========================================================

    if (!response.ok || !data.status) {
      console.error(
        "❌ Kora callback verification failed:",
        data,
      );

      const redirectUrl =
        `${FRONTEND_URL}/order-history?payment=failed&reference=${encodeURIComponent(
          reference,
        )}`;

      console.log(
        "🚀 Redirecting to:",
        redirectUrl,
      );

      return res.redirect(302, redirectUrl);
    }

    // ==========================================================
    // PAYMENT DATA
    // ==========================================================

    const payment = data?.data;

    console.log(
      "🔥 Callback payment status:",
      payment?.status,
    );

    console.log(
      "🔥 Callback payment reference:",
      payment?.payment_reference,
    );

    // ==========================================================
    // PAYMENT NOT SUCCESSFUL
    // ==========================================================

    if (payment?.status !== "success") {
      console.log(
        "⏳ Callback payment is not successful:",
        payment?.status,
      );

      const redirectUrl =
        `${FRONTEND_URL}/order-history?payment=pending&orderId=${order._id}`;

      console.log(
        "🚀 Redirecting to:",
        redirectUrl,
      );

      return res.redirect(302, redirectUrl);
    }

    // ==========================================================
    // CHECK PAYMENT AMOUNT
    // ==========================================================

    const paidAmount = Number(
      payment?.amount_paid ??
      payment?.amount,
    );

    const expectedAmount =
      Number(order.totalAmount);

    console.log(
      "💰 Callback paid amount:",
      paidAmount,
    );

    console.log(
      "💰 Callback expected amount:",
      expectedAmount,
    );

    if (
      paidAmount !== expectedAmount
    ) {
      console.error(
        "❌ Callback payment amount mismatch",
      );

      const redirectUrl =
        `${FRONTEND_URL}/order-history?payment=failed&orderId=${order._id}&reason=amount_mismatch`;

      console.log(
        "🚀 Redirecting to:",
        redirectUrl,
      );

      return res.redirect(302, redirectUrl);
    }

    // ==========================================================
    // MARK ORDER AS PAID
    // ==========================================================

    order.paymentStatus = "paid";

    order.paymentReference =
      payment?.payment_reference ||
      reference;

    order.paidAt = new Date();

    order.orderStatus = "pending";

    await order.save();

    console.log(
      `✅ Callback marked order ${order.orderCode} as PAID`,
    );

    // ==========================================================
    // REDIRECT
    // ==========================================================

    const redirectUrl =
      `${FRONTEND_URL}/order-history?payment=success&orderId=${order._id}&orderCode=${encodeURIComponent(
        order.orderCode,
      )}`;

    console.log(
      "🚀🚀 REDIRECTING CUSTOMER TO:",
    );

    console.log(
      redirectUrl,
    );

    return res.redirect(302, redirectUrl);

  } catch (error) {
    console.error(
      "❌ Kora callback error:",
      error,
    );

    const redirectUrl =
      `${FRONTEND_URL}/order-history?payment=failed&reason=callback_error`;

    console.log(
      "🚀 Redirecting to:",
      redirectUrl,
    );

    return res.redirect(302, redirectUrl);
  }
};