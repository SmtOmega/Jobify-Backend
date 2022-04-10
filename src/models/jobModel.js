const mongoose = require("mongoose");

const jobSchema = mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, "Please provide a company"],
      maxlength: 50,
    },
    position: {
      type: String,
      required: [true, "Please provide a position"],
      maxlength: 100,
    },
    jobLocation: {
      type: String,
      default: "my city",
      required: [true, "Please provide a city"]
    },
    status: {
      type: String,
      enum: ["interview", "declined", "pending"],
      default: "pending",
    },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "internship", "remote"],
      default: "full-time",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "please provide an owner"],
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);



const Job = mongoose.model('Job', jobSchema)

module.exports = Job
