import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createGroup,
  joinGroup,
  getGroup,
  addGroupItem,
  updateGroupItem,
  removeGroupItem,
  leaveGroup,
  cancelGroup,
} from "../controllers/groupOrderController.js";

const router = express.Router();

// All group-order routes require authentication
router.use(authMiddleware);

// Create a new group
router.post("/create", createGroup);

// Join an existing group
router.post("/join", joinGroup);

// Get group information
router.get("/:groupCode", getGroup);

// Add snack to group
router.post("/:groupCode/items", addGroupItem);

// Update snack quantity
router.patch("/:groupCode/items/:itemId", updateGroupItem);

// Remove snack
router.delete("/:groupCode/items/:itemId", removeGroupItem);

// Leave group
router.delete("/:groupCode/leave", leaveGroup);

// Cancel group
router.patch("/:groupCode/cancel", cancelGroup);

export default router;