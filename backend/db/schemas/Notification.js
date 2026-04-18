import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["ANSWER", "UPVOTE"],
    required: true
  },
  doubt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doubt",
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);