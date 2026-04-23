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
    rollNo: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      unique: true,
      sparse: true, // allow null for faculty
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
    department: {
      type: String, // for faculty
    },
    designation: {
      type: String, // e.g. "Professor", "Assistant Professor"
    },
    bio: {
      type: String,
      default: "",
    },
    avatarURL: {
      type: String,
      default: "",
    },
    profileImage: {
      data: Buffer,
      contentType: String,
    },
    // ROLE SYSTEM
    role: {
      type: String,
      enum: ["student", "faculty"],
      default: "student",
      index: true,
    },
    // MODERATION
    bannedUntil: {
      type: Date,
      default: null,
    },
    banReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;