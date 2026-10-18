const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");

const User = require("../models/User");
const validate = require("../middleware/validate");
const requireAuth = require("../middleware/auth");

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 60 }),
    body("email").isEmail().withMessage("Enter a valid email").normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      if (await User.findOne({ email })) {
        return res.status(409).json({ message: "That email is already in use" });
      }
      const hash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hash });
      res.status(201).json({ token: signToken(user), user: publicUser(user) });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email }).select("+password");
      const ok = user && (await bcrypt.compare(req.body.password, user.password));
      if (!ok) return res.status(401).json({ message: "Wrong email or password" });
      res.json({ token: signToken(user), user: publicUser(user) });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: "Account no longer exists" });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
