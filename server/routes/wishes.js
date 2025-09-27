const express = require("express");
const Wish = require("../models/Wish");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// Get all wishes for user
router.get("/", verifyToken, async (req, res) => {
  try {
    const wishes = await Wish.find({ user: req.userId });
    res.json(wishes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new wish
router.post("/", verifyToken, async (req, res) => {
  try {
    const newWish = new Wish({ title: req.body.title, user: req.userId });
    const savedWish = await newWish.save();
    res.json(savedWish);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update wish
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updatedWish = await Wish.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title: req.body.title },
      { new: true }
    );
    res.json(updatedWish);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete wish
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Wish.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ message: "Wish deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complete wish
router.patch("/:id/complete", verifyToken, async (req, res) => {
  try {
    const wish = await Wish.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { completed: true },
      { new: true }
    );
    res.json(wish);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
