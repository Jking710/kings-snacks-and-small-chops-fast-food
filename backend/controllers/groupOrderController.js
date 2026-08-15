import crypto from "crypto";
import GroupOrder from "../models/GroupOrder.js";

function generateGroupCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

function calculateMemberTotal(member) {
  return member.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}

function calculateGroupTotal(group) {
  return group.members.reduce(
    (total, member) => total + calculateMemberTotal(member),
    0
  );
}

// CREATE GROUP
export const createGroup = async (req, res) => {
  try {
    const { groupName } = req.body;

    if (!groupName || !groupName.trim()) {
      return res.status(400).json({
        message: "Group name is required.",
      });
    }

    let groupCode;
    let existingGroup;

    do {
      groupCode = generateGroupCode();

      existingGroup = await GroupOrder.findOne({
        groupCode,
      });
    } while (existingGroup);

    const group = await GroupOrder.create({
      groupName: groupName.trim(),
      groupCode,
      creator: req.user._id,
      members: [
        {
          user: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName || "",
          items: [],
        },
      ],
    });

    const populatedGroup = await GroupOrder.findById(group._id)
      .populate("creator", "firstName lastName email profilePicture")
      .populate("members.user", "firstName lastName email profilePicture");

    return res.status(201).json({
      message: "Group created successfully.",
      group: populatedGroup,
    });
  } catch (error) {
    console.error("Create group error:", error);

    return res.status(500).json({
      message: "Unable to create group.",
    });
  }
};

// JOIN GROUP
export const joinGroup = async (req, res) => {
  try {
    const { groupCode } = req.body;

    if (!groupCode) {
      return res.status(400).json({
        message: "Group code is required.",
      });
    }

    const group = await GroupOrder.findOne({
      groupCode: groupCode.trim().toUpperCase(),
      status: "active",
    });

    if (!group) {
      return res.status(404).json({
        message: "Group not found or the group is no longer active.",
      });
    }

    const alreadyMember = group.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      const populatedGroup = await GroupOrder.findById(group._id)
        .populate("creator", "firstName lastName email profilePicture")
        .populate(
          "members.user",
          "firstName lastName email profilePicture"
        );

      return res.json({
        message: "You are already a member of this group.",
        group: populatedGroup,
      });
    }

    group.members.push({
      user: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName || "",
      items: [],
    });

    await group.save();

    const populatedGroup = await GroupOrder.findById(group._id)
      .populate("creator", "firstName lastName email profilePicture")
      .populate("members.user", "firstName lastName email profilePicture");

    return res.json({
      message: "You joined the group successfully.",
      group: populatedGroup,
    });
  } catch (error) {
    console.error("Join group error:", error);

    return res.status(500).json({
      message: "Unable to join group.",
    });
  }
};

// GET GROUP
export const getGroup = async (req, res) => {
  try {
    const { groupCode } = req.params;

    const group = await GroupOrder.findOne({
      groupCode: groupCode.toUpperCase(),
    })
      .populate("creator", "firstName lastName email profilePicture")
      .populate("members.user", "firstName lastName email profilePicture");

    if (!group) {
      return res.status(404).json({
        message: "Group not found.",
      });
    }

    const isMember = group.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You must join this group first.",
      });
    }

    return res.json({
      group,
      total: calculateGroupTotal(group),
    });
  } catch (error) {
    console.error("Get group error:", error);

    return res.status(500).json({
      message: "Unable to load group.",
    });
  }
};

// ADD ITEM TO GROUP
export const addGroupItem = async (req, res) => {
  try {
    const { groupCode } = req.params;
    const { id, name, price, quantity = 1, img = "" } = req.body;

    if (!id || !name || price === undefined) {
      return res.status(400).json({
        message: "Snack information is incomplete.",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1.",
      });
    }

    const group = await GroupOrder.findOne({
      groupCode: groupCode.toUpperCase(),
      status: "active",
    });

    if (!group) {
      return res.status(404).json({
        message: "Group not found.",
      });
    }

    const member = group.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({
        message: "You are not a member of this group.",
      });
    }

    const existingItem = member.items.find(
      (item) => item.id === Number(id)
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      member.items.push({
        id: Number(id),
        name,
        price: Number(price),
        quantity: Number(quantity),
        img,
      });
    }

    await group.save();

    const populatedGroup = await GroupOrder.findById(group._id)
      .populate("creator", "firstName lastName email profilePicture")
      .populate("members.user", "firstName lastName email profilePicture");

    return res.json({
      message: "Snack added to group order.",
      group: populatedGroup,
      total: calculateGroupTotal(populatedGroup),
    });
  } catch (error) {
    console.error("Add group item error:", error);

    return res.status(500).json({
      message: "Unable to add snack.",
    });
  }
};

// UPDATE ITEM QUANTITY
export const updateGroupItem = async (req, res) => {
  try {
    const { groupCode, itemId } = req.params;
    const { quantity } = req.body;

    const group = await GroupOrder.findOne({
      groupCode: groupCode.toUpperCase(),
      status: "active",
    });

    if (!group) {
      return res.status(404).json({
        message: "Group not found.",
      });
    }

    const member = group.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({
        message: "You are not a member of this group.",
      });
    }

    const item = member.items.find(
      (item) => item.id === Number(itemId)
    );

    if (!item) {
      return res.status(404).json({
        message: "Snack not found in your group order.",
      });
    }

    if (quantity < 1) {
      member.items = member.items.filter(
        (item) => item.id !== Number(itemId)
      );
    } else {
      item.quantity = Number(quantity);
    }

    await group.save();

    const populatedGroup = await GroupOrder.findById(group._id)
      .populate("creator", "firstName lastName email profilePicture")
      .populate("members.user", "firstName lastName email profilePicture");

    return res.json({
      message: "Group order updated.",
      group: populatedGroup,
      total: calculateGroupTotal(populatedGroup),
    });
  } catch (error) {
    console.error("Update group item error:", error);

    return res.status(500).json({
      message: "Unable to update group order.",
    });
  }
};

// REMOVE ITEM
export const removeGroupItem = async (req, res) => {
  try {
    const { groupCode, itemId } = req.params;

    const group = await GroupOrder.findOne({
      groupCode: groupCode.toUpperCase(),
      status: "active",
    });

    if (!group) {
      return res.status(404).json({
        message: "Group not found.",
      });
    }

    const member = group.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({
        message: "You are not a member of this group.",
      });
    }

    member.items = member.items.filter(
      (item) => item.id !== Number(itemId)
    );

    await group.save();

    const populatedGroup = await GroupOrder.findById(group._id)
      .populate("creator", "firstName lastName email profilePicture")
      .populate("members.user", "firstName lastName email profilePicture");

    return res.json({
      message: "Snack removed from group order.",
      group: populatedGroup,
      total: calculateGroupTotal(populatedGroup),
    });
  } catch (error) {
    console.error("Remove group item error:", error);

    return res.status(500).json({
      message: "Unable to remove snack.",
    });
  }
};

// LEAVE GROUP
export const leaveGroup = async (req, res) => {
  try {
    const { groupCode } = req.params;

    const group = await GroupOrder.findOne({
      groupCode: groupCode.toUpperCase(),
      status: "active",
    });

    if (!group) {
      return res.status(404).json({
        message: "Group not found.",
      });
    }

    if (group.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message:
          "The group creator cannot leave the group. Cancel the group instead.",
      });
    }

    group.members = group.members.filter(
      (member) => member.user.toString() !== req.user._id.toString()
    );

    await group.save();

    return res.json({
      message: "You left the group successfully.",
    });
  } catch (error) {
    console.error("Leave group error:", error);

    return res.status(500).json({
      message: "Unable to leave group.",
    });
  }
};

// CANCEL GROUP
export const cancelGroup = async (req, res) => {
  try {
    const { groupCode } = req.params;

    const group = await GroupOrder.findOne({
      groupCode: groupCode.toUpperCase(),
    });

    if (!group) {
      return res.status(404).json({
        message: "Group not found.",
      });
    }

    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the group creator can cancel the group.",
      });
    }

    group.status = "cancelled";

    await group.save();

    return res.json({
      message: "Group cancelled successfully.",
    });
  } catch (error) {
    console.error("Cancel group error:", error);

    return res.status(500).json({
      message: "Unable to cancel group.",
    });
  }
};