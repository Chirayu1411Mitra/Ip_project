import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      minlength: 6,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "faculty"],
      default: "student",
    },
    rollNo: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
    },
    branch: {
      type: String,
    },
    bio: {
      type: String,
      default: "",
    },
    avatarURL: {
      type: String,
      default: "",
    },
    bannedUntil: {
      type: Date,
      default: null,
    },
    banReason: {
      type: String,
      default: "",
    },
    department: {
      type: String,
    },
    designation: {
      type: String,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
