import Order from "../models/Order.js";
import Notification from "../models/Notification.js";

const getOrderStatusNotification = (status, order) => {
  const orderCode =
    order.orderCode || `KS-${order._id.toString().slice(-6).toUpperCase()}`;

  switch (status) {
    case "preparing":
      return {
        title: "Your order is being prepared 👨‍🍳",
        message: `Your order ${orderCode} is now being prepared.`,
      };

    case "out_for_delivery":
      return {
        title: "Your order is out for delivery 🚚",
        message: `Your order ${orderCode} is out for delivery.`,
      };

    case "delivered":
      return {
        title: "Your order has been delivered 🎉",
        message: `Your order ${orderCode} has been delivered. Enjoy your meal!`,
      };

    case "completed":
      return {
        title: "Order completed 🎉",
        message: `Your order ${orderCode} has been completed successfully.`,
      };

    case "cancelled":
      return {
        title: "Order cancelled",
        message: `Your order ${orderCode} has been cancelled.`,
      };

    default:
      return null;
  }
};

/*
============================================================
CREATE ORDER
============================================================
*/

export const createOrder = async (req, res) => {
  try {
    const {
      items,
      subtotal,
      deliveryFee,
      totalAmount,
      deliveryAddress,
      phone,
    } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required",
      });
    }

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

    const orderCode = `KNG-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

    const order = await Order.create({
      user: req.user._id,
      orderCode,
      items,

      subtotal,
      deliveryFee,
      totalAmount,

      deliveryAddress: deliveryAddress.trim(),

      phone: phone.trim(),

      paymentMethod: "korapay",

      paymentStatus: "pending",

      orderStatus: "pending",

      deliveryConfirmed: false,

      deliveryStatus: "pending",

      deliveryConfirmedAt: null,
    });

    try {
      await Notification.create({
        user: req.user._id,
        type: "order",
        title: "Order placed successfully 🎉",
        message: `Your order ${
          order.orderCode ||
          `KS-${order._id.toString().slice(-6).toUpperCase()}`
        } has been received and is being processed.`,
        link: `/order-history`,
        metadata: {
          orderId: order._id,
          orderCode:
            order.orderCode ||
            `KS-${order._id.toString().slice(-6).toUpperCase()}`,
          totalAmount: order.totalAmount,
        },
        isRead: false,
      });
    } catch (notificationError) {
      console.error("Order notification error:", notificationError);
    }

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

/*
============================================================
GET MY ORDERS
============================================================
*/

export const getMyOrders = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required",
      });
    }

    const orders = await Order.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    const updatedOrders = orders.map((order) => {
      const orderObject = order.toObject();

      /*
      --------------------------------------------------------
      SUPPORT OLD ORDERS
      --------------------------------------------------------
      */

      if (typeof orderObject.deliveryConfirmed !== "boolean") {
        orderObject.deliveryConfirmed = false;
      }

      if (!orderObject.deliveryStatus) {
        orderObject.deliveryStatus = "pending";
      }

      /*
      --------------------------------------------------------
      SUPPORT OLD ORDERS WITHOUT ORDER CODE
      --------------------------------------------------------
      */

      if (!orderObject.orderCode) {
        orderObject.orderCode = `KS-${orderObject._id
          .toString()
          .slice(-6)
          .toUpperCase()}`;
      }

      orderObject.deliveryConfirmationCompleted =
        orderObject.deliveryConfirmed === true;

      return orderObject;
    });

    return res.status(200).json({
      success: true,
      orders: updatedOrders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

/*
============================================================
GET SINGLE ORDER
============================================================
*/

export const getOrderById = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const orderObject = order.toObject();

    /*
    --------------------------------------------------------
    SUPPORT OLD ORDERS
    --------------------------------------------------------
    */

    if (typeof orderObject.deliveryConfirmed !== "boolean") {
      orderObject.deliveryConfirmed = false;
    }

    if (!orderObject.deliveryStatus) {
      orderObject.deliveryStatus = "pending";
    }

    if (!orderObject.orderCode) {
      orderObject.orderCode = `KS-${orderObject._id
        .toString()
        .slice(-6)
        .toUpperCase()}`;
    }

    orderObject.deliveryConfirmationCompleted =
      orderObject.deliveryConfirmed === true;

    return res.status(200).json({
      success: true,
      order: orderObject,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

/*
============================================================
CONFIRM DELIVERY
============================================================
*/

export const confirmDelivery = async (req, res) => {
  try {
    console.log("🔥 CONFIRM DELIVERY CONTROLLER HIT");

    console.log("Order ID:", req.params.id);

    console.log("Request body:", req.body);

    console.log("User:", req.user?._id);

    /*
    --------------------------------------------------------
    AUTHENTICATION
    --------------------------------------------------------
    */

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required",
      });
    }

    /*
    --------------------------------------------------------
    GET DELIVERY ANSWER
    --------------------------------------------------------
    */

    const { delivered } = req.body;

    if (typeof delivered !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery confirmation",
      });
    }

    /*
    --------------------------------------------------------
    FIND ORDER
    --------------------------------------------------------
    */

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /*
    --------------------------------------------------------
    PREVENT DUPLICATE CONFIRMATION
    --------------------------------------------------------
    */

    if (order.deliveryConfirmed === true) {
      return res.status(400).json({
        success: false,
        message: "Delivery has already been confirmed",
      });
    }

    /*
    --------------------------------------------------------
    MAKE SURE ORDER CODE EXISTS
    --------------------------------------------------------
    */

    if (!order.orderCode) {
      const randomPart = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      order.orderCode = `KS-${Date.now()}-${randomPart}`;
    }

    /*
    --------------------------------------------------------
    RECORD CONFIRMATION
    --------------------------------------------------------
    */

    order.deliveryConfirmed = true;

    order.deliveryConfirmedAt = new Date();

    /*
    --------------------------------------------------------
    YES, DELIVERED
    --------------------------------------------------------
    */

    if (delivered === true) {
      order.deliveryStatus = "delivered";

      order.orderStatus = "completed";
    }

    /*
    --------------------------------------------------------
    NO, NOT DELIVERED
    --------------------------------------------------------
    */

    if (delivered === false) {
      order.deliveryStatus = "not_delivered";

      order.orderStatus = "failed";
    }

    /*
    --------------------------------------------------------
    SAVE
    --------------------------------------------------------
    */

    await order.save();

    const previousStatus = order._doc.orderStatus; // Get the previous status before saving

    if (previousStatus !== order.orderStatus) {
      const notificationData = getOrderStatusNotification(
        order.orderStatus,
        order,
      );

      if (notificationData) {
        try {
          await Notification.create({
            user: order.user,
            type: "delivery",
            title: notificationData.title,
            message: notificationData.message,
            link: `/order-history`,
            metadata: {
              orderId: order._id,
              orderCode: order.orderCode,
              orderStatus: order.orderStatus,
            },
            isRead: false,
          });
        } catch (notificationError) {
          console.error("Order status notification error:", notificationError);
        }
      }
    }

    console.log("✅ Delivery confirmation saved");

    console.log("Order:", order._id);

    console.log("Order code:", order.orderCode);

    console.log("Delivery confirmed:", order.deliveryConfirmed);

    console.log("Delivery status:", order.deliveryStatus);

    console.log("Order status:", order.orderStatus);

    /*
    --------------------------------------------------------
    RESPONSE
    --------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      message:
        delivered === true
          ? "Delivery confirmed successfully"
          : "Delivery marked as not delivered",

      order: {
        _id: order._id,

        orderCode: order.orderCode,

        deliveryConfirmed: order.deliveryConfirmed,

        deliveryConfirmationCompleted: true,

        deliveryStatus: order.deliveryStatus,

        orderStatus: order.orderStatus,

        deliveryConfirmedAt: order.deliveryConfirmedAt,
      },
    });
  } catch (error) {
    console.error("Confirm delivery error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to confirm delivery",
    });
  }
};
