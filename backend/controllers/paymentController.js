import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/Order.js";

// ============================================================
// KORA API
// ============================================================

const KORA_API_URL =
  "https://api.korapay.com/merchant/api/v1";

// ============================================================
// APPLICATION URLS
// ============================================================

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  process.env.CLIENT_URL ||
  "https://kings-snacks-and-small-chops-fast-f-ruby.vercel.app";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://kings-snacks-and-small-chops-fast-food-4.onrender.com";

// ============================================================
// HELPER: FRONTEND REDIRECT
// ============================================================

const redirectToFrontend = (res, params = {}) => {
  const url = new URL(
    "/order-history",
    FRONTEND_URL
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

  const redirectUrl = url.toString();

  console.log("🚀 REDIRECTING CUSTOMER TO:");
  console.log(redirectUrl);

  return res.redirect(302, redirectUrl);
};

// ============================================================
// HELPER: GENERATE ORDER CODE
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
// HELPER: GET KORA SECRET
// ============================================================

const getKoraSecretKey = () => {
  const secret = process.env.KORA_SECRET_KEY;

  if (!secret) {
    console.error(
      "❌ KORA_SECRET_KEY is missing"
    );

    return null;
  }

  return secret.trim();
};

// ============================================================
// INITIALIZE KORA PAYMENT
// ============================================================

export const initializeKoraPayment = async (
  req,
  res
) => {
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

    // ========================================================
    // AUTHENTICATION
    // ========================================================

    if (
      !req.user ||
      !req.user._id
    ) {
      console.error(
        "❌ User authentication missing"
      );

      return res.status(401).json({
        success: false,
        message:
          "User authentication is required",
      });
    }

    // ========================================================
    // GET REQUEST DATA
    // ========================================================

    const {
      items,
      subtotal,
      deliveryFee,
      totalAmount,
      deliveryAddress,
      phone,
    } = req.body;

    // ========================================================
    // VALIDATE ITEMS
    // ========================================================

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    // ========================================================
    // VALIDATE ADDRESS
    // ========================================================

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

    // ========================================================
    // VALIDATE PHONE
    // ========================================================

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

    // ========================================================
    // VALIDATE AMOUNTS
    // ========================================================

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

    // ========================================================
    // KORA SECRET
    // ========================================================

    const secretKey =
      getKoraSecretKey();

    if (!secretKey) {
      return res.status(500).json({
        success: false,
        message:
          "Kora payment configuration is missing",
      });
    }

    console.log(
      "✅ Kora secret key found"
    );

    // ========================================================
    // CONVERT CART ITEMS
    // ========================================================

    const orderItems = items.map(
      (item) => {
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
      }
    );

    console.log(
      "📦 Converted order items:",
      orderItems
    );

    // ========================================================
    // GENERATE REFERENCES
    // ========================================================

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

    // ========================================================
    // CREATE ORDER
    // ========================================================

    console.log(
      "🔥 Creating order in MongoDB..."
    );

    const order =
      await Order.create({
        user: req.user._id,

        orderCode,

        items: orderItems,

        subtotal,

        deliveryFee,

        totalAmount,

        deliveryAddress:
          deliveryAddress.trim(),

        phone: phone.trim(),

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

    // ========================================================
    // KORA URLS
    // ========================================================

    const redirectUrl =
      `${BACKEND_URL}/api/payments/kora/callback`;

    const notificationUrl =
      `${BACKEND_URL}/api/payments/kora/webhook`;

    console.log(
      "🌐 Frontend URL:",
      FRONTEND_URL
    );

    console.log(
      "🌐 Backend URL:",
      BACKEND_URL
    );

    console.log(
      "🔗 Redirect URL:",
      redirectUrl
    );

    console.log(
      "🔗 Notification URL:",
      notificationUrl
    );

    // ========================================================
    // KORA PAYLOAD
    // ========================================================

    const customerName =
      `${req.user.firstName || ""} ${
        req.user.lastName || ""
      }`.trim();

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
          customerName ||
          "Kings Snacks Customer",

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

    // ========================================================
    // SEND TO KORA
    // ========================================================

    const response =
      await fetch(
        `${KORA_API_URL}/charges/initialize`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${secretKey}`,

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

    // ========================================================
    // READ KORA RESPONSE
    // ========================================================

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

    // ========================================================
    // KORA INITIALIZATION ERROR
    // ========================================================

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

    // ========================================================
    // CHECK CHECKOUT URL
    // ========================================================

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

    // ========================================================
    // SUCCESS
    // ========================================================

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

export const verifyKoraPayment =
  async (req, res) => {
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

      // ======================================================
      // VALIDATE REFERENCE
      // ======================================================

      if (!reference) {
        return res.status(400).json({
          success: false,
          paid: false,
          message:
            "Payment reference is required",
        });
      }

      // ======================================================
      // SECRET
      // ======================================================

      const secretKey =
        getKoraSecretKey();

      if (!secretKey) {
        return res.status(500).json({
          success: false,
          paid: false,
          message:
            "Kora payment configuration is missing",
        });
      }

      // ======================================================
      // FIND ORDER
      // ======================================================

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

      // ======================================================
      // ASK KORA FOR PAYMENT STATUS
      // ======================================================

      const response =
        await fetch(
          `${KORA_API_URL}/charges/${encodeURIComponent(
            reference
          )}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${secretKey}`,

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

      const normalizedStatus =
        String(
          payment?.status || ""
        ).toLowerCase();

      console.log(
        "🔥 Kora payment status:",
        payment?.status
      );

      // ======================================================
      // PAYMENT NOT SUCCESSFUL
      // ======================================================

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

      // ======================================================
      // CHECK AMOUNT
      // ======================================================

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
        "💰 Paid amount:",
        paidAmount
      );

      console.log(
        "💰 Expected amount:",
        expectedAmount
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

      // ======================================================
      // MARK ORDER AS PAID
      // ======================================================

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

      // ======================================================
      // RESPONSE
      // ======================================================

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
// KORA WEBHOOK
// ============================================================
//
// Kora signs ONLY req.body.data.
// It does NOT sign the complete request body.
//
// Signature:
// HMAC SHA256(JSON.stringify(req.body.data), KORA_SECRET_KEY)
//
// Kora documentation:
// x-korapay-signature
//
// ============================================================

export const handleKoraWebhook =
  async (req, res) => {
    try {
      console.log(
        "🔥 KORA WEBHOOK RECEIVED"
      );

      console.log(
        "🔥 Webhook event:",
        req.body?.event
      );

      console.log(
        "🔥 Webhook body:",
        req.body
      );

      // ======================================================
      // SECRET
      // ======================================================

      const secretKey =
        getKoraSecretKey();

      if (!secretKey) {
        console.error(
          "❌ KORA_SECRET_KEY is missing"
        );

        return res.status(200).json({
          received: true,
          processed: false,
        });
      }

      // ======================================================
      // GET SIGNATURE
      // ======================================================

      const receivedSignature =
        req.headers[
          "x-korapay-signature"
        ];

      if (!receivedSignature) {
        console.error(
          "❌ Kora webhook signature missing"
        );

        return res.status(200).json({
          received: true,
          processed: false,
        });
      }

      // ======================================================
      // CHECK DATA
      // ======================================================

      if (
        !req.body ||
        !req.body.data
      ) {
        console.error(
          "❌ Kora webhook data missing"
        );

        return res.status(200).json({
          received: true,
          processed: false,
        });
      }

      // ======================================================
      // GENERATE EXPECTED SIGNATURE
      // ======================================================
      //
      // IMPORTANT:
      // Kora signs ONLY req.body.data.
      //
      // Do not use JSON.stringify(req.body)
      //
      // ======================================================

      const dataString =
        JSON.stringify(
          req.body.data
        );

      const expectedSignature =
        crypto
          .createHmac(
            "sha256",
            secretKey
          )
          .update(
            dataString
          )
          .digest("hex");

      console.log(
        "🔥 Received signature:",
        receivedSignature
      );

      console.log(
        "🔥 Expected signature:",
        expectedSignature
      );

      // ======================================================
      // SAFE SIGNATURE COMPARISON
      // ======================================================

      const receivedBuffer =
        Buffer.from(
          String(
            receivedSignature
          ).trim(),
          "utf8"
        );

      const expectedBuffer =
        Buffer.from(
          expectedSignature,
          "utf8"
        );

      if (
        receivedBuffer.length !==
        expectedBuffer.length
      ) {
        console.error(
          "❌ Invalid Kora webhook signature"
        );

        return res.status(200).json({
          received: true,
          processed: false,
        });
      }

      const signatureValid =
        crypto.timingSafeEqual(
          receivedBuffer,
          expectedBuffer
        );

      if (!signatureValid) {
        console.error(
          "❌ Invalid Kora webhook signature"
        );

        return res.status(200).json({
          received: true,
          processed: false,
        });
      }

      console.log(
        "✅ Kora webhook signature verified"
      );

      // ======================================================
      // EVENT
      // ======================================================

      const event =
        req.body.event;

      console.log(
        "🔥 Kora webhook event:",
        event
      );

      // ======================================================
      // IGNORE UNKNOWN EVENTS
      // ======================================================

      if (
        event !==
          "charge.success" &&
        event !==
          "charge.failed"
      ) {
        console.log(
          "ℹ️ Unsupported Kora event:",
          event
        );

        return res.status(200).json({
          received: true,
          processed: false,
        });
      }

      // ======================================================
      // PAYMENT DATA
      // ======================================================

      const payment =
        req.body.data;

      const reference =
        payment?.reference ||
        payment?.payment_reference;

      console.log(
        "🔥 Payment reference:",
        reference
      );

      if (!reference) {
        console.error(
          "❌ Payment reference missing"
        );

        return res.status(200).json({
          received: true,
          processed: false,
        });
      }

      // ======================================================
      // FIND ORDER
      // ======================================================

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

        return res.status(200).json({
          received: true,
          processed: false,
        });
      }

      console.log(
        "✅ Webhook order found:",
        order.orderCode
      );

      // ======================================================
      // FAILED PAYMENT
      // ======================================================

      if (
        event ===
          "charge.failed" ||
        String(
          payment?.status || ""
        ).toLowerCase() ===
          "failed"
      ) {
        order.paymentStatus =
          "failed";

        order.orderStatus =
          "failed";

        await order.save();

        console.log(
          `❌ Order ${order.orderCode} marked as FAILED`
        );

        return res.status(200).json({
          received: true,
          processed: true,
        });
      }

      // ======================================================
      // SUCCESS STATUS
      // ======================================================

      const paymentStatus =
        String(
          payment?.status || ""
        ).toLowerCase();

      if (
        event !==
          "charge.success" ||
        paymentStatus !==
          "success"
      ) {
        console.log(
          "⏳ Webhook payment is not successful"
        );

        return res.status(200).json({
          received: true,
          processed: false,
        });
      }

      // ======================================================
      // CHECK PAYMENT AMOUNT
      // ======================================================

      const expectedAmount =
        Number(
          order.totalAmount
        );

      const receivedAmount =
        Number(
          payment?.amount
        );

      console.log(
        "💰 Expected amount:",
        expectedAmount
      );

      console.log(
        "💰 Received amount:",
        receivedAmount
      );

      if (
        !Number.isFinite(
          receivedAmount
        ) ||
        receivedAmount !==
          expectedAmount
      ) {
        console.error(
          "❌ Webhook payment amount mismatch"
        );

        return res.status(200).json({
          received: true,
          processed: false,
        });
      }

      // ======================================================
      // MARK ORDER AS PAID
      // ======================================================

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

        console.log(
          "📦 Order status:",
          order.orderStatus
        );
      } else {
        console.log(
          `ℹ️ Order ${order.orderCode} is already PAID`
        );
      }

      // ======================================================
      // ACKNOWLEDGE KORA
      // ======================================================

      return res.status(200).json({
        received: true,
        processed: true,
      });
    } catch (error) {
      console.error(
        "❌ Kora webhook error:",
        error
      );

      // Always acknowledge Kora.
      // This prevents unnecessary retries.
      return res.status(200).json({
        received: true,
        processed: false,
      });
    }
  };

// ============================================================
// KORA CALLBACK
// ============================================================
//
// Kora sends the customer here after checkout.
//
// This route MUST NOT use protect middleware.
//
// The customer should end up at:
// Vercel /order-history
//
// ============================================================

export const handleKoraCallback =
  async (req, res) => {
    try {
      console.log(
        "🔥🔥 KORA CALLBACK RECEIVED 🔥🔥"
      );

      console.log(
        "🔥 Callback URL:",
        `${BACKEND_URL}/api/payments/kora/callback`
      );

      console.log(
        "🔥 Frontend URL:",
        FRONTEND_URL
      );

      console.log(
        "🔥 Callback query:",
        req.query
      );

      // ======================================================
      // GET REFERENCE
      // ======================================================

      const reference =
        req.query?.reference ||
        req.query?.trxref ||
        req.query?.payment_reference;

      console.log(
        "🔥 Extracted Kora reference:",
        reference
      );

      // ======================================================
      // NO REFERENCE
      // ======================================================

      if (!reference) {
        console.error(
          "❌ Kora callback reference missing"
        );

        return redirectToFrontend(
          res,
          {
            payment:
              "failed",

            reason:
              "missing_reference",
          }
        );
      }

      // ======================================================
      // FIND ORDER
      // ======================================================

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

        return redirectToFrontend(
          res,
          {
            payment:
              "failed",

            reason:
              "order_not_found",

            reference,
          }
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

      // ======================================================
      // WEBHOOK ALREADY CONFIRMED PAYMENT
      // ======================================================

      if (
        order.paymentStatus ===
        "paid"
      ) {
        console.log(
          "✅ Webhook already marked order as PAID"
        );

        return redirectToFrontend(
          res,
          {
            payment:
              "success",

            orderId:
              order._id,

            orderCode:
              order.orderCode,
          }
        );
      }

      // ======================================================
      // SECRET KEY
      // ======================================================

      const secretKey =
        getKoraSecretKey();

      if (!secretKey) {
        console.error(
          "❌ KORA_SECRET_KEY is missing"
        );

        return redirectToFrontend(
          res,
          {
            payment:
              "failed",

            reason:
              "configuration",

            orderId:
              order._id,
          }
        );
      }

      // ======================================================
      // VERIFY DIRECTLY WITH KORA
      // ======================================================

      console.log(
        "🔍 Order is not marked as paid"
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
                `Bearer ${secretKey}`,

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

      // ======================================================
      // PARSE RESPONSE
      // ======================================================

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

        return redirectToFrontend(
          res,
          {
            payment:
              "failed",

            reason:
              "invalid_kora_response",

            orderId:
              order._id,
          }
        );
      }

      // ======================================================
      // KORA VERIFICATION ERROR
      // ======================================================

      if (
        !response.ok ||
        !data.status
      ) {
        console.error(
          "❌ Kora callback verification failed:",
          data
        );

        return redirectToFrontend(
          res,
          {
            payment:
              "failed",

            reason:
              "verification_failed",

            orderId:
              order._id,
          }
        );
      }

      // ======================================================
      // PAYMENT DATA
      // ======================================================

      const payment =
        data?.data;

      const normalizedStatus =
        String(
          payment?.status || ""
        ).toLowerCase();

      console.log(
        "🔥 Callback payment status:",
        payment?.status
      );

      console.log(
        "🔥 Callback payment reference:",
        payment?.payment_reference
      );

      // ======================================================
      // PAYMENT NOT SUCCESSFUL
      // ======================================================

      if (
        normalizedStatus !==
        "success"
      ) {
        console.log(
          "⏳ Callback payment is not successful:",
          payment?.status
        );

        return redirectToFrontend(
          res,
          {
            payment:
              "pending",

            orderId:
              order._id,

            orderCode:
              order.orderCode,
          }
        );
      }

      // ======================================================
      // CHECK AMOUNT
      // ======================================================

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

        return redirectToFrontend(
          res,
          {
            payment:
              "failed",

            reason:
              "amount_mismatch",

            orderId:
              order._id,

            orderCode:
              order.orderCode,
          }
        );
      }

      // ======================================================
      // MARK ORDER AS PAID
      // ======================================================

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

      // ======================================================
      // REDIRECT TO ORDER HISTORY
      // ======================================================

      return redirectToFrontend(
        res,
        {
          payment:
            "success",

          orderId:
            order._id,

          orderCode:
            order.orderCode,
        }
      );
    } catch (error) {
      console.error(
        "❌ Kora callback error:",
        error
      );

      return redirectToFrontend(
        res,
        {
          payment:
            "failed",

          reason:
            "callback_error",
        }
      );
    }
  };