const express = require("express")
const { body, validationResult } = require("express-validator")
const Tour = require("../models/Tour")
const auth = require("../middleware/auth")
const { v4: uuidv4 } = require("uuid")

const router = express.Router()

// Get all tours for authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const tours = await Tour.find({ creator: req.user._id }).sort({ createdAt: -1 }).populate("creator", "name email")
    res.json(tours)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get public tour by shareId
router.get("/share/:shareId", async (req, res) => {
  try {
    const tour = await Tour.findOne({ shareId: req.params.shareId }).populate("creator", "name")

    if (!tour) {
      return res.status(404).json({ message: "Tour not found" })
    }

    // Increment views
    tour.views += 1
    await tour.save()

    res.json(tour)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get tour by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const tour = await Tour.findOne({
      _id: req.params.id,
      creator: req.user._id,
    }).populate("creator", "name email")

    if (!tour) {
      return res.status(404).json({ message: "Tour not found" })
    }

    res.json(tour)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create tour
router.post(
  "/",
  [
    auth,
    body("title").trim().isLength({ min: 1 }).withMessage("Title is required"),
    body("steps").isArray().withMessage("Steps must be an array"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { title, description, steps, visibility } = req.body

      const tour = new Tour({
        title,
        description,
        creator: req.user._id,
        steps: steps.map((step, index) => ({
          ...step,
          id: step.id || uuidv4(),
          order: index,
        })),
        visibility: visibility || "private",
        shareId: uuidv4(),
      })

      await tour.save()
      await tour.populate("creator", "name email")

      res.status(201).json(tour)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update tour
router.put(
  "/:id",
  [auth, body("title").trim().isLength({ min: 1 }).withMessage("Title is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { title, description, steps, visibility } = req.body

      const tour = await Tour.findOne({
        _id: req.params.id,
        creator: req.user._id,
      })

      if (!tour) {
        return res.status(404).json({ message: "Tour not found" })
      }

      tour.title = title
      tour.description = description
      tour.visibility = visibility
      tour.steps = steps.map((step, index) => ({
        ...step,
        id: step.id || uuidv4(),
        order: index,
      }))

      await tour.save()
      await tour.populate("creator", "name email")

      res.json(tour)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete tour
router.delete("/:id", auth, async (req, res) => {
  try {
    const tour = await Tour.findOneAndDelete({
      _id: req.params.id,
      creator: req.user._id,
    })

    if (!tour) {
      return res.status(404).json({ message: "Tour not found" })
    }

    res.json({ message: "Tour deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
