import mongoose from "mongoose";

const { Schema, model } = mongoose;

const deadlineSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 500 },
    dueDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    group: { type: Schema.Types.ObjectId, ref: "Group", required: true },
  },
  { timestamps: true }
);

deadlineSchema.index({ group: 1, dueDate: 1 });

const Deadline = model("Deadline", deadlineSchema);
export default Deadline;
