import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content:{
    type: String,
    required: true
  },
  upvotes:[{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User"
  }]
}, { timestamps: true });

const doubtSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answers: [answerSchema],
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, { timestamps: true });

const Doubt = mongoose.model("Doubt", doubtSchema);

export default Doubt;