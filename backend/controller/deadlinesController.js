import Deadline from "../db/schemas/Deadline.js";
import Group from "../db/schemas/Group.js";

// Helper: verify the user is a member of a group
const isMember = async (groupId, userId) => {
  const group = await Group.findById(groupId).select("members");
  if (!group) return false;
  return group.members.some((m) => m.toString() === userId);
};

// POST /api/deadlines — create a deadline
export const createDeadline = async (req, res) => {
  try {
    const { title, description, dueDate, group } = req.body;

    if (!title || title.trim().length < 2) {
      return res
        .status(400)
        .json({ success: false, message: "Title must be at least 2 characters." });
    }
    if (!dueDate || isNaN(new Date(dueDate))) {
      return res.status(400).json({ success: false, message: "Valid due date is required." });
    }
    if (!group) {
      return res.status(400).json({ success: false, message: "Group is required." });
    }

    const member = await isMember(group, req.userId);
    if (!member) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const deadline = await Deadline.create({
      title: title.trim(),
      description: description?.trim() || "",
      dueDate: new Date(dueDate),
      group,
      createdBy: req.userId,
    });

    await deadline.populate("createdBy", "name rollNo avatarURL");
    res.status(201).json({ success: true, data: deadline });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/deadlines/group/:groupId — get all deadlines for a group
export const getGroupDeadlines = async (req, res) => {
  try {
    const { groupId } = req.params;

    const member = await isMember(groupId, req.userId);
    if (!member) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const deadlines = await Deadline.find({ group: groupId })
      .populate("createdBy", "name rollNo avatarURL")
      .sort({ dueDate: 1 });

    res.json({ success: true, data: deadlines });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/deadlines/:id/complete — toggle completed state (any group member)
export const toggleComplete = async (req, res) => {
  try {
    const deadline = await Deadline.findById(req.params.id).populate("group", "members");
    if (!deadline) {
      return res.status(404).json({ success: false, message: "Deadline not found." });
    }

    const member = deadline.group.members.some((m) => m.toString() === req.userId);
    if (!member) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    deadline.completed = !deadline.completed;
    await deadline.save();

    res.json({ success: true, data: deadline });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/deadlines/:id — edit a deadline (creator only)
export const updateDeadline = async (req, res) => {
  try {
    const deadline = await Deadline.findById(req.params.id);
    if (!deadline) {
      return res.status(404).json({ success: false, message: "Deadline not found." });
    }

    // Only the creator may edit
    if (deadline.createdBy.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Only the creator can edit this deadline." });
    }

    const { title, description, dueDate } = req.body;

    // Validate and apply whitelisted fields only
    if (title !== undefined) {
      if (!title || title.trim().length < 2) {
        return res.status(400).json({ success: false, message: "Title must be at least 2 characters." });
      }
      deadline.title = title.trim();
    }

    if (description !== undefined) {
      deadline.description = description.trim();
    }

    if (dueDate !== undefined) {
      if (isNaN(new Date(dueDate))) {
        return res.status(400).json({ success: false, message: "Valid due date is required." });
      }
      deadline.dueDate = new Date(dueDate);
    }

    await deadline.save();
    await deadline.populate("createdBy", "name rollNo avatarURL");

    res.json({ success: true, data: deadline });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/deadlines/:id — delete a deadline (creator only)
export const deleteDeadline = async (req, res) => {
  try {
    const deadline = await Deadline.findById(req.params.id);
    if (!deadline) {
      return res.status(404).json({ success: false, message: "Deadline not found." });
    }

    // Only the creator may delete
    if (deadline.createdBy.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Only the creator can delete this deadline." });
    }

    await Deadline.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: { message: "Deadline deleted." } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/deadlines/my — all deadlines across all groups the user belongs to
export const getMyDeadlines = async (req, res) => {
  try {
    const userGroups = await Group.find({ members: req.userId }).select("_id name");
    const groupIds = userGroups.map((g) => g._id);

    const deadlines = await Deadline.find({ group: { $in: groupIds } })
      .populate("createdBy", "name rollNo avatarURL")
      .populate("group", "name")
      .sort({ dueDate: 1 });

    res.json({ success: true, data: deadlines });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
