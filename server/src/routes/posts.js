const express = require("express");
const { body, query } = require("express-validator");

const Post = require("../models/Post");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();
router.use(requireAuth);

const postRules = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 120 }).withMessage("Title is too long"),
  body("body").trim().notEmpty().withMessage("Body is required").isLength({ max: 5000 }).withMessage("Body is too long"),
  body("tags").optional().isArray({ max: 10 }).withMessage("Tags must be a list of up to 10"),
  body("tags.*").optional().isString().trim().isLength({ max: 30 }),
];

// list the current user's posts, newest first
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const filter = { author: req.userId };

      if (req.query.search) filter.$text = { $search: String(req.query.search) };
      if (req.query.tag) filter.tags = String(req.query.tag).toLowerCase();

      const [posts, total] = await Promise.all([
        Post.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Post.countDocuments(filter),
      ]);

      res.json({ posts, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
      next(err);
    }
  }
);

router.post("/", postRules, validate, async (req, res, next) => {
  try {
    const { title, body: text, tags } = req.body;
    const post = await Post.create({ title, body: text, tags, author: req.userId });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, author: req.userId });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", postRules, validate, async (req, res, next) => {
  try {
    const { title, body: text, tags } = req.body;
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, author: req.userId },
      { title, body: text, tags: tags || [] },
      { new: true, runValidators: true }
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.userId });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
