import Group from "../db/schemas/Group.js";

// POST /api/groups — create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim().length < 2) {
      return res
        .status(400)
        .json({ success: false, message: "Group name must be at least 2 characters." });
    }

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim() || "",
      createdBy: req.userId,
      members: [req.userId],
    });

    const populated = await group.populate("createdBy", "name rollNo avatarURL");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/groups/:id/join — join an existing group
export const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found." });
    }

    const alreadyMember = group.members.some(
      (m) => m.toString() === req.userId
    );
    if (alreadyMember) {
      return res
        .status(409)
        .json({ success: false, message: "You are already a member of this group." });
    }

    group.members.push(req.userId);
    await group.save();

    res.json({ success: true, data: { message: "Joined group successfully." } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/groups/my — get all groups the current user belongs to
export const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.userId })
      .select("name description createdBy members createdAt")
      .populate("createdBy", "name rollNo avatarURL")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/groups/:id — get full group data (members + latest messages)
export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "name rollNo avatarURL")
      .populate("createdBy", "name rollNo avatarURL")
      .populate("messages.sender", "name rollNo avatarURL");

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found." });
    }

    // Authorization: user must be a member
    const isMember = group.members.some((m) => m._id.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    res.json({ success: true, data: group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/groups — list all groups (for discovery / join screen)
export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .select("name description createdBy members createdAt")
      .populate("createdBy", "name rollNo avatarURL")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/groups/:id/members — admin adds a user by userId
export const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required." });
    }

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found." });
    }

    // Only group creator can add members
    if (group.createdBy.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Only the group creator can add members." });
    }

    const alreadyMember = group.members.some((m) => m.toString() === userId);
    if (alreadyMember) {
      return res.status(409).json({ success: false, message: "User is already a member." });
    }

    group.members.push(userId);
    await group.save();

    const updated = await Group.findById(group._id)
      .populate("members", "name rollNo avatarURL branch semester");

    res.json({ success: true, data: updated.members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/groups/:id/members/:userId — remove a member
export const removeMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found." });
    }

    const isCreator = group.createdBy.toString() === req.userId;
    const isSelf = req.params.userId === req.userId;

    if (!isCreator && !isSelf) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    group.members = group.members.filter((m) => m.toString() !== req.params.userId);
    await group.save();

    res.json({ success: true, data: { message: "Member removed." } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
