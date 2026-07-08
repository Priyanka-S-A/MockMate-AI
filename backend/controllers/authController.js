import User from '../models/User.js';
import Interview from '../models/Interview.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

import Settings from '../models/Settings.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const settings = await Settings.getSettings();
    if (!settings.registrationsEnabled) {
      return res.status(403).json({ message: 'Registrations are currently disabled by the administrator.' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        gamification: {
          ...(user.gamification?.toObject ? user.gamification.toObject() : user.gamification),
          completedInterviewsCount: 0,
          completedInterviewDates: [],
        },
        subscriptionStatus: user.subscriptionStatus,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.comparePassword(password))) {
      if (user.status === 'suspended') {
        return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
      }
      const completedInterviews = await Interview.find({
        userId: user._id,
        status: 'completed',
      });
      const completedInterviewsCount = completedInterviews.length;
      const completedInterviewDates = Array.from(
        new Set(
          completedInterviews.map((iv) => {
            const dateObj = new Date(iv.createdAt);
            return dateObj.toISOString().split('T')[0];
          })
        )
      ).sort();
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        gamification: {
          ...(user.gamification?.toObject ? user.gamification.toObject() : user.gamification),
          completedInterviewsCount,
          completedInterviewDates,
        },
        subscriptionStatus: user.subscriptionStatus,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const completedInterviews = await Interview.find({
        userId: user._id,
        status: 'completed',
      });
      const completedInterviewsCount = completedInterviews.length;
      const completedInterviewDates = Array.from(
        new Set(
          completedInterviews.map((iv) => {
            const dateObj = new Date(iv.createdAt);
            return dateObj.toISOString().split('T')[0];
          })
        )
      ).sort();
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        gamification: {
          ...(user.gamification?.toObject ? user.gamification.toObject() : user.gamification),
          completedInterviewsCount,
          completedInterviewDates,
        },
        subscriptionStatus: user.subscriptionStatus,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      if (req.body.password) {
        user.password = req.body.password;
      }
      if (req.body.profile) {
        user.profile.bio = req.body.profile.bio ?? user.profile.bio;
        user.profile.skills = req.body.profile.skills ?? user.profile.skills;
        user.profile.targetJob = req.body.profile.targetJob ?? user.profile.targetJob;
        user.profile.avatar = req.body.profile.avatar ?? user.profile.avatar;
      }

      const updatedUser = await user.save();

      const completedInterviews = await Interview.find({
        userId: updatedUser._id,
        status: 'completed',
      });
      const completedInterviewsCount = completedInterviews.length;
      const completedInterviewDates = Array.from(
        new Set(
          completedInterviews.map((iv) => {
            const dateObj = new Date(iv.createdAt);
            return dateObj.toISOString().split('T')[0];
          })
        )
      ).sort();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profile: updatedUser.profile,
        gamification: {
          ...(updatedUser.gamification?.toObject ? updatedUser.gamification.toObject() : updatedUser.gamification),
          completedInterviewsCount,
          completedInterviewDates,
        },
        subscriptionStatus: updatedUser.subscriptionStatus,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password (stub)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Return a mock success response explaining reset flow
    res.json({
      message: 'Password reset link has been dispatched to your email address (Mocked service).',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
