import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/Order.js";

// ============================================================
// KORA API
// ============================================================

const KORA_API_URL =
  "https://api.korapay.com/merchant/api/v1";

// ============================================================
// URL CONFIGURATION
// ============================================================

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  process.env.CLIENT_URL ||
  "https://kings-snacks-and-small-chops-fast-f-ruby.vercel.app";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://kings-snacks-and-small-chops-fast-food-4.onrender.com";

// ============================================================
// CLEAN URL
// ============================================================

const cleanUrl = (url) => {
  return String(url || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/+$/, "");
};

// ============================================================
// FINAL FRONTEND URL
// ============================================================

const FRONTEND_BASE_URL = cleanUrl(FRONTEND_URL);
const BACKEND_BASE_URL = cleanUrl(BACKEND_URL);

// ============================================================
// CREATE FRONTEND REDIRECT URL
// ============================================================

const createFrontendUrl = (params = {}) => {
  const url = new URL(
    `${FRONTEND_BASE_URL}/order-history`
  );

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};

// ============================================================
// SEND FRONTEND REDIRECT
// ============================================================
//
// We do not use res.redirect() here.
//
// Render + Kora callback can sometimes produce
// ERR_INVALID_REDIRECT when Express sends the redirect
// response directly.
//
// Instead, we return a normal HTML response.
// The browser then moves to the Vercel page.
//
// ============================================================

const sendFrontendRedirect = (res, destination) => {
  const safeDestination = String(destination)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  console.log("🚀 FRONTEND DESTINATION:");
  console.log(destination);

  res.status(200);

  res.setHeader(
    "Content-Type",
    "text/html; charset=utf-8"
  );

  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate"
  );

  return res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <meta
    http-equiv="refresh"
    content="0;url=${safeDestination}"
  />
  <title>Payment Complete</title>
</head>
<body>
  <p>Payment processed successfully.</p>

  <script>
    window.location.replace(${JSON.stringify(destination)});
  </script>
</body>
</html>
  `);
};

// ============================================================
// GENERATE UNIQUE ORDER CODE
// ============================================================

const generateOrderCode = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

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
    console.log(
      "🔥 KORA INITIALIZE CONTROLLER HIT"
    );

    console.log(
      "👤 User:",
      req.user?._id
    );

    console.log(
      "📦 Request body:",
      req.body
    );

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
      console.error(
        "❌ User authentication missing"
      );

      return res.status(401).json({
        success: false,
        message:
          "User authentication is required",
      });
    }

    // ==========================================================
    // VALIDATION
    // ==========================================================

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
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
        message:
          "Delivery address is required",
      });
    }

    if (
      !phone ||
      typeof phone !== "string" ||
      !phone.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number is required",
      });
    }

    if (
      typeof subtotal !== "number" ||
      typeof deliveryFee !== "number" ||
      typeof totalAmount !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order amount",
      });
    }

    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment amount",
      });
    }

    console.log(
      "✅ Order validation passed"
    );

    // ==========================================================
    // KORA SECRET KEY
    // ==========================================================

    if (!process.env.KORA_SECRET_KEY) {
      console.error(
        "❌ KORA_SECRET_KEY is missing"
      );

      return res.status(500).json({
        success: false,
        message:
          "Kora payment configuration is missing",
      });
    }

    console.log(
      "✅ Kora secret key found"
    );

    // ==========================================================
    // CONVERT CART ITEMS
    // ==========================================================

    const orderItems = items.map((item) => {
      const productId =
        new mongoose.Types.ObjectId();

      return {
        productId,

        name: String(
          item.name || ""
        ).trim(),

        price: Number(
          item.price
        ),

        quantity: Number(
          item.quantity
        ),

        image:
          item.img ||
          item.image ||
          "",
      };
    });

    console.log(
      "📦 Converted order items:",
      orderItems
    );

    // ==========================================================
    // GENERATE REFERENCES
    // ==========================================================

    const reference =
      `KS-${Date.now()}-${crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase()}`;

    const orderCode =
      generateOrderCode();

    console.log(
      "🔥 Transaction reference:",
      reference
    );

    console.log(
      "🔥 Order code:",
      orderCode
    );

    // ==========================================================
    // CREATE ORDER
    // ==========================================================

    console.log(
      "🔥 Creating order in MongoDB..."
    );

    const order = await Order.create({
      user: req.user._id,

      orderCode,

      items: orderItems,

      subtotal,

      deliveryFee,

      totalAmount,

      deliveryAddress:
        deliveryAddress.trim(),

      phone:
        phone.trim(),

      paymentMethod:
        "korapay",

      paymentStatus:
        "pending",

      orderStatus:
        "pending",

      transactionReference:
        reference,
    });

    console.log(
      "✅ Order created:",
      order._id
    );

    console.log(
      "🧾 Order code:",
      order.orderCode
    );

    // ==========================================================
    // KORA CALLBACK URL
    // ==========================================================

    const redirectUrl =
      `${BACKEND_BASE_URL}/api/payments/kora/callback`;

    const notificationUrl =
      `${BACKEND_BASE_URL}/api/payments/kora/webhook`;

    console.log(
      "🌐 Frontend URL:",
      FRONTEND_BASE_URL
    );

    console.log(
      "🌐 Backend URL:",
      BACKEND_BASE_URL
    );

    console.log(
      "🔗 Redirect URL:",
      redirectUrl
    );

    console.log(
      "🔗 Notification URL:",
      notificationUrl
    );

    // ==========================================================
    // KORA PAYLOAD
    // ==========================================================

    const koraPayload = {
      amount: totalAmount,

      currency: "NGN",

      reference,

      redirect_url:
        redirectUrl,

      notification_url:
        notificationUrl,

      narration:
        `Kings Snacks Order ${orderCode}`,

      channels: [
        "bank_transfer",
      ],

      default_channel:
        "bank_transfer",

      merchant_bears_cost:
        true,

      customer: {
        name:
          `${req.user.firstName || ""} ${
            req.user.lastName || ""
          }`.trim(),

        email:
          req.user.email,
      },

      metadata: {
        orderId:
          order._id.toString(),

        orderCode,
      },
    };

    console.log(
      "📤 Sending payment request to Kora..."
    );

    // ==========================================================
    // CALL KORA
    // ==========================================================

    const response =
      await fetch(
        `${KORA_API_URL}/charges/initialize`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${process.env.KORA_SECRET_KEY}`,

            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              koraPayload
            ),
        }
      );

    console.log(
      "🔥 Kora HTTP status:",
      response.status
    );

    // ==========================================================
    // READ RESPONSE
    // ==========================================================

    const responseText =
      await response.text();

    console.log(
      "🔥 Raw Kora response:",
      responseText
    );

    let data;

    try {
      data =
        JSON.parse(
          responseText
        );
    } catch (error) {
      console.error(
        "❌ Kora returned invalid JSON:",
        error
      );

      await Order.findByIdAndDelete(
        order._id
      );

      return res.status(502).json({
        success: false,
        message:
          "Kora returned an invalid response",
      });
    }

    console.log(
      "🔥 Parsed Kora response:",
      data
    );

    // ==========================================================
    // KORA ERROR
    // ==========================================================

    if (
      !response.ok ||
      !data.status
    ) {
      console.error(
        "❌ Kora payment initialization failed:",
        data
      );

      await Order.findByIdAndDelete(
        order._id
      );

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

      await Order.findByIdAndDelete(
        order._id
      );

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

      orderId:
        order._id,

      orderCode:
        order.orderCode,

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

export const verifyKoraPayment = async (
  req,
  res
) => {
  try {
    const {
      reference,
    } = req.params;

    console.log(
      "🔥 VERIFY KORA PAYMENT"
    );

    console.log(
      "🔥 Reference:",
      reference
    );

    if (!reference) {
      return res.status(400).json({
        success: false,
        paid: false,
        message:
          "Payment reference is required",
      });
    }

    if (!process.env.KORA_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        paid: false,
        message:
          "Kora payment configuration is missing",
      });
    }

    const order =
      await Order.findOne({
        transactionReference:
          reference,
      });

    if (!order) {
      console.error(
        "❌ Order not found:",
        reference
      );

      return res.status(404).json({
        success: false,
        paid: false,
        message:
          "Order not found",
      });
    }

    console.log(
      "✅ Order found:",
      order.orderCode
    );

    const response =
      await fetch(
        `${KORA_API_URL}/charges/${encodeURIComponent(
          reference
        )}`,
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
      data =
        JSON.parse(
          responseText
        );
    } catch (error) {
      return res.status(502).json({
        success: false,
        paid: false,
        message:
          "Invalid response from Kora",
      });
    }

    if (
      !response.ok ||
      !data.status
    ) {
      return res.status(400).json({
        success: false,
        paid: false,
        message:
          data.message ||
          "Unable to verify payment with Kora",
      });
    }

    const payment =
      data.data;

    console.log(
      "🔥 Kora payment status:",
      payment?.status
    );

    const normalizedStatus =
      String(
        payment?.status || ""
      ).toLowerCase();

    if (
      normalizedStatus !==
      "success"
    ) {
      return res.status(200).json({
        success: false,

        paid: false,

        status:
          payment?.status ||
          "pending",

        orderId:
          order._id,

        orderCode:
          order.orderCode,

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
      Number(
        order.totalAmount
      );

    if (
      paidAmount !==
      expectedAmount
    ) {
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

    if (
      order.paymentStatus !==
      "paid"
    ) {
      order.paymentStatus =
        "paid";

      order.paymentReference =
        payment?.payment_reference ||
        reference;

      order.paidAt =
        new Date();

      order.orderStatus =
        "pending";

      await order.save();

      console.log(
        `✅ Order ${order.orderCode} marked as PAID`
      );
    }

    return res.status(200).json({
      success: true,

      paid: true,

      status: "success",

      orderId:
        order._id,

      orderCode:
        order.orderCode,

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

// ============================================================
// KORA CALLBACK
// ============================================================

export const handleKoraCallback = async (
  req,
  res
) => {
  try {
    console.log(
      "🔥🔥 KORA CALLBACK RECEIVED 🔥🔥"
    );

    console.log(
      "🔥 Callback URL:",
      `${BACKEND_BASE_URL}/api/payments/kora/callback`
    );

    console.log(
      "🔥 Callback query:",
      req.query
    );

    console.log(
      "🔥 Callback body:",
      req.body
    );

    // ==========================================================
    // GET REFERENCE
    // ==========================================================

    const reference =
      req.query?.reference ||
      req.query?.trxref ||
      req.query?.payment_reference;

    console.log(
      "🔥 Extracted Kora reference:",
      reference
    );

    // ==========================================================
    // MISSING REFERENCE
    // ==========================================================

    if (!reference) {
      console.error(
        "❌ Kora callback reference missing"
      );

      const destination =
        createFrontendUrl({
          payment: "failed",
          reason:
            "missing_reference",
        });

      return sendFrontendRedirect(
        res,
        destination
      );
    }

    // ==========================================================
    // CHECK SECRET KEY
    // ==========================================================

    if (!process.env.KORA_SECRET_KEY) {
      console.error(
        "❌ KORA_SECRET_KEY is missing"
      );

      const destination =
        createFrontendUrl({
          payment: "failed",
          reason:
            "configuration",
        });

      return sendFrontendRedirect(
        res,
        destination
      );
    }

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
        "❌ Callback order not found:",
        reference
      );

      const destination =
        createFrontendUrl({
          payment: "failed",
          reason:
            "order_not_found",
        });

      return sendFrontendRedirect(
        res,
        destination
      );
    }

    console.log(
      "✅ Callback order found:",
      order.orderCode
    );

    console.log(
      "💳 Current payment status:",
      order.paymentStatus
    );

    // ==========================================================
    // WEBHOOK ALREADY MARKED PAYMENT AS PAID
    // ==========================================================

    if (
      order.paymentStatus ===
      "paid"
    ) {
      console.log(
        "ℹ️ Webhook already marked order as PAID"
      );

      const destination =
        createFrontendUrl({
          payment: "success",

          orderId:
            order._id,

          orderCode:
            order.orderCode,
        });

      console.log(
        "🚀 Sending customer to:",
        destination
      );

      return sendFrontendRedirect(
        res,
        destination
      );
    }

    // ==========================================================
    // VERIFY PAYMENT DIRECTLY WITH KORA
    // ==========================================================

    console.log(
      "🔍 Order is not marked as paid yet."
    );

    console.log(
      "🔍 Verifying transaction directly with Kora..."
    );

    const response =
      await fetch(
        `${KORA_API_URL}/charges/${encodeURIComponent(
          reference
        )}`,
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
      "🔥 Callback Kora HTTP status:",
      response.status
    );

    console.log(
      "🔥 Callback Kora response:",
      responseText
    );

    // ==========================================================
    // PARSE RESPONSE
    // ==========================================================

    let data;

    try {
      data =
        JSON.parse(
          responseText
        );
    } catch (error) {
      console.error(
        "❌ Invalid JSON returned by Kora"
      );

      const destination =
        createFrontendUrl({
          payment: "failed",

          orderId:
            order._id,

          reason:
            "invalid_kora_response",
        });

      return sendFrontendRedirect(
        res,
        destination
      );
    }

    // ==========================================================
    // KORA VERIFICATION FAILED
    // ==========================================================

    if (
      !response.ok ||
      !data.status
    ) {
      console.error(
        "❌ Kora callback verification failed:",
        data
      );

      const destination =
        createFrontendUrl({
          payment: "failed",

          orderId:
            order._id,

          reference,
        });

      return sendFrontendRedirect(
        res,
        destination
      );
    }

    // ==========================================================
    // PAYMENT DATA
    // ==========================================================

    const payment =
      data?.data;

    console.log(
      "🔥 Callback payment status:",
      payment?.status
    );

    console.log(
      "🔥 Callback payment reference:",
      payment?.payment_reference
    );

    // ==========================================================
    // PAYMENT NOT SUCCESSFUL
    // ==========================================================

    const normalizedPaymentStatus =
      String(
        payment?.status || ""
      ).toLowerCase();

    if (
      normalizedPaymentStatus !==
      "success"
    ) {
      console.log(
        "⏳ Callback payment is not successful:",
        payment?.status
      );

      const destination =
        createFrontendUrl({
          payment: "pending",

          orderId:
            order._id,

          orderCode:
            order.orderCode,
        });

      return sendFrontendRedirect(
        res,
        destination
      );
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
      Number(
        order.totalAmount
      );

    console.log(
      "💰 Callback paid amount:",
      paidAmount
    );

    console.log(
      "💰 Callback expected amount:",
      expectedAmount
    );

    if (
      paidAmount !==
      expectedAmount
    ) {
      console.error(
        "❌ Callback payment amount mismatch"
      );

      const destination =
        createFrontendUrl({
          payment: "failed",

          orderId:
            order._id,

          orderCode:
            order.orderCode,

          reason:
            "amount_mismatch",
        });

      return sendFrontendRedirect(
        res,
        destination
      );
    }

    // ==========================================================
    // MARK ORDER AS PAID
    // ==========================================================

    order.paymentStatus =
      "paid";

    order.paymentReference =
      payment?.payment_reference ||
      reference;

    order.paidAt =
      new Date();

    order.orderStatus =
      "pending";

    await order.save();

    console.log(
      `✅ Callback marked order ${order.orderCode} as PAID`
    );

    // ==========================================================
    // SEND CUSTOMER TO ORDER HISTORY
    // ==========================================================

    const destination =
      createFrontendUrl({
        payment: "success",

        orderId:
          order._id,

        orderCode:
          order.orderCode,
      });

    console.log(
      "🚀🚀 CUSTOMER REDIRECT DESTINATION:"
    );

    console.log(
      destination
    );

    return sendFrontendRedirect(
      res,
      destination
    );

  } catch (error) {
    console.error(
      "❌ Kora callback error:",
      error
    );

    try {
      const destination =
        createFrontendUrl({
          payment: "failed",

          reason:
            "callback_error",
        });

      return sendFrontendRedirect(
        res,
        destination
      );

    } catch (redirectError) {
      console.error(
        "❌ Could not create frontend destination:",
        redirectError
      );

      return res.status(500).send(
        "Payment callback failed."
      );
    }
  }
};

// ============================================================
// KORA WEBHOOK
// ============================================================

export const handleKoraWebhook = async (
  req,
  res
) => {
  try {
    console.log(
      "🔥 Kora webhook received"
    );

    // ==========================================================
    // CHECK KORA SIGNATURE
    // ==========================================================

    const signature =
      req.headers[
        "x-korapay-signature"
      ];

    if (!signature) {
      console.error(
        "❌ Kora webhook signature missing"
      );

      return res.status(401).json({
        success: false,
        message:
          "Webhook signature missing",
      });
    }

    if (!process.env.KORA_SECRET_KEY) {
      console.error(
        "❌ KORA_SECRET_KEY is missing"
      );

      return res.status(500).json({
        success: false,
        message:
          "Kora payment configuration is missing",
      });
    }

    const payload =
      JSON.stringify(req.body);

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.KORA_SECRET_KEY
        )
        .update(payload)
        .digest("hex");

    const receivedBuffer =
      Buffer.from(
        String(signature),
        "utf8"
      );

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "utf8"
      );

    let signatureValid =
      false;

    if (
      receivedBuffer.length ===
      expectedBuffer.length
    ) {
      signatureValid =
        crypto.timingSafeEqual(
          receivedBuffer,
          expectedBuffer
        );
    }

    if (!signatureValid) {
      console.error(
        "❌ Invalid Kora webhook signature"
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid webhook signature",
      });
    }

    console.log(
      "✅ Kora webhook signature verified"
    );

    // ==========================================================
    // GET WEBHOOK DATA
    // ==========================================================

    const event =
      req.body?.event ||
      req.body?.type;

    const webhookData =
      req.body?.data ||
      {};

    const reference =
      webhookData?.reference ||
      webhookData?.transaction_reference ||
      webhookData?.payment_reference;

    console.log(
      "🔥 Kora webhook event:",
      event
    );

    console.log(
      "🔥 Payment reference:",
      reference
    );

    // ==========================================================
    // MISSING REFERENCE
    // ==========================================================

    if (!reference) {
      console.error(
        "❌ Webhook payment reference missing"
      );

      return res.status(400).json({
        success: false,
        message:
          "Payment reference missing",
      });
    }

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
        "❌ Webhook order not found:",
        reference
      );

      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    console.log(
      "✅ Webhook order found:",
      order.orderCode
    );

    // ==========================================================
    // GET PAYMENT STATUS
    // ==========================================================

    const paymentStatus =
      String(
        webhookData?.status ||
        ""
      ).toLowerCase();

    const webhookAmount =
      Number(
        webhookData?.amount_paid ??
        webhookData?.amount
      );

    const expectedAmount =
      Number(
        order.totalAmount
      );

    console.log(
      "💰 Expected amount:",
      expectedAmount
    );

    console.log(
      "💰 Received amount:",
      webhookAmount
    );

    // ==========================================================
    // ONLY PROCESS SUCCESS
    // ==========================================================

    if (
      event !== "charge.success" &&
      paymentStatus !== "success"
    ) {
      console.log(
        "⏳ Webhook payment is not successful:",
        paymentStatus
      );

      return res.status(200).json({
        success: true,
        message:
          "Webhook received",
      });
    }

    // ==========================================================
    // CHECK AMOUNT
    // ==========================================================

    if (
      webhookAmount !==
      expectedAmount
    ) {
      console.error(
        "❌ Webhook payment amount mismatch"
      );

      return res.status(400).json({
        success: false,
        message:
          "Payment amount does not match order",
      });
    }

    // ==========================================================
    // MARK ORDER AS PAID
    // ==========================================================

    if (
      order.paymentStatus !==
      "paid"
    ) {
      order.paymentStatus =
        "paid";

      order.paymentReference =
        webhookData?.payment_reference ||
        reference;

      order.paidAt =
        new Date();

      order.orderStatus =
        "pending";

      await order.save();

      console.log(
        `✅ Order ${order.orderCode} marked as PAID`
      );

      console.log(
        "📦 Order status:",
        order.orderStatus
      );
    } else {
      console.log(
        `ℹ️ Order ${order.orderCode} is already PAID`
      );
    }

    // ==========================================================
    // ACKNOWLEDGE WEBHOOK
    // ==========================================================

    return res.status(200).json({
      success: true,
      message:
        "Webhook processed successfully",
    });

  } catch (error) {
    console.error(
      "❌ Kora webhook error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Webhook processing failed",
    });
  }
};