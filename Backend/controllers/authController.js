const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authController = {
  // Register new user
  async register(req, res) {
    try {
      const { fullName, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      // Create new user
      const newUser = new User({
        fullName,
        email,
        password,
      });

      await newUser.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser._id, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);

      // Handle validation errors
      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors,
        });
      }

      // Handle duplicate email error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  // Get user profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  // Get all users (for testing)
  async getAllUsers(req, res) {
    try {
      const users = await User.find({}).select("-password");
      res.json({
        success: true,
        count: users.length,
        users,
      });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
};

module.exports = authController;
