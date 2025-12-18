const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
    expiresIn: '7d',
  });
};

const authController = {
  // Register new user
  async register(req, res) {
    try {
      const { name, email, password, phone } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create user
      const user = new User({
        name,
        email,
        password,
        phone,
        role: 'user', // Default role
      });

      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(403).json({ error: 'Account is not active' });
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get current user
  async getMe(req, res) {
    try {
      res.json({
        success: true,
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
          role: req.user.role,
        },
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update profile
  async updateProfile(req, res) {
    try {
      const { name, phone } = req.body;
      
      const user = await User.findByIdAndUpdate(
        req.userId,
        { name, phone },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.userId);
      
      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

module.exports = authController;
