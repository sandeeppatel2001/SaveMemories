const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../mongodb/models/user");
const { redis } = require("../services/queueService");
const logger = require("../config/logger");
const auth = require("../middleware/auth");

// Rate limiting configuration
const rateLimit = require("express-rate-limit");
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
});

// Login route
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // Find user
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(201).json({
        error: true,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(201).json({
        error: true,
        message: "Invalid credentials",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Store session in Redis with token as key
    await redis.setex(
      `session:${token}`,
      86400, // 24 hours
      JSON.stringify({
        id: user._id,
        username: user.username,
        mobile: user.mobile,
      })
    );
    console.log("user", user);
    res.json({
      error: false,
      token,
      user: {
        id: user._id,
        username: user.username,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({
      error: true,
      message: "Error logging in",
    });
  }
});

// Signup route
router.post("/signup", authLimiter, async (req, res) => {
  try {
    const { username, mobile, password } = req.body;
    console.log(req.body);

    const existingUser = await User.findOne({
      $or: [{ mobile }],
    });

    if (existingUser) {
      return res.status(201).json({
        error: true,
        message: "User already exists",
      });
    }

    const user = new User({
      username,
      mobile,
      password,
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    await user.save();
    // Store session in Redis with token as key
    await redis.setex(
      `session:${token}`,
      86400,
      JSON.stringify({
        id: user._id,
        username: user.username,
        mobile: user.mobile,
      })
    );

    res.status(200).json({
      error: false,
      token,
      user: {
        id: user._id,
        username: user.username,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    logger.error("Signup error:", error);
    res.status(500).json({
      error: true,
      message: "Error creating user",
    });
  }
});

// Logout route
router.post("/logout", auth, async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    await redis.del(`session:${token}`);
    res.json({ error: false, message: "Logged out successfully" });
  } catch (error) {
    logger.error("Logout error:", error);
    res.status(500).json({ error: true, message: "Error logging out" });
  }
});

module.exports = router;
