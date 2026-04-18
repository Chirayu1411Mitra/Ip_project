import Notification from "../db/schemas/Notification.js";

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipient: req.userId
        })
            .sort({ createdAt: -1 }) // latest first
            .populate("sender", "name email") // optional but useful
            .populate("doubt", "question");

        res.status(200).json(notifications);

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.userId, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ message: "All notifications marked as read" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};