const mongoose = require("mongoose")

const stepSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["image", "video"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  annotation: {
    text: String,
    position: {
      x: Number,
      y: Number,
    },
  },
  transition: {
    type: String,
    enum: ["fade", "slide", "zoom"],
    default: "fade",
  },
  duration: {
    type: Number,
    default: 3000,
  },
  order: {
    type: Number,
    required: true,
  },
})

const tourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    steps: [stepSchema],
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    shareId: {
      type: String,
      unique: true,
      required: true,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Tour", tourSchema)
