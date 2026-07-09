import User from '../models/User.js';
import Interview from '../models/Interview.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

import Settings from '../models/Settings.js';
import { OAuth2Client } from 'google-auth-library';
import OtpPending from '../models/OtpPending.js';
import { sendOtpEmail } from '../utils/emailService.js';
import bcrypt from 'bcryptjs';


// @desc    Initiate registration by sending email OTP
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all fields.' });
  }

  try {
    const settings = await Settings.getSettings();
    if (!settings.registrationsEnabled) {
      return res.status(403).json({ message: 'Registrations are currently disabled by the administrator.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store temporarily in OtpPending (delete existing pending for this email first)
    await OtpPending.deleteMany({ email: email.toLowerCase() });
    await OtpPending.create({
      name,
      email: email.toLowerCase(),
      password, // Mongoose User model pre-save hook will hash it later upon verification
      otpHash,
      otpExpiry,
      lastSentAt: new Date(),
    });

    // Respond immediately — email dispatches in the background so the
    // OTP verification page opens right away even if SMTP is unreachable.
    res.status(200).json({ message: 'Verification OTP sent to your email.' });

    // Fire-and-forget: errors are caught internally by sendOtpEmail and
    // logged to the console (visible in Render logs) without blocking the response.
    sendOtpEmail(email, otp, 'registration').catch((err) =>
      console.error('[register] Background email dispatch error:', err.message)
    );
  } catch (error) {
    console.error('Register Request Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend registration OTP
// @route   POST /api/auth/register-resend
// @access  Public
export const resendRegisterOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email address is required.' });
  }

  try {
    const record = await OtpPending.findOne({ email: email.toLowerCase() });
    if (!record) {
      return res.status(404).json({ message: 'Registration session expired or not found. Please register again.' });
    }

    // 60 seconds resend cooldown check
    const timeElapsed = (Date.now() - new Date(record.lastSentAt).getTime()) / 1000;
    if (timeElapsed < 60) {
      return res.status(429).json({ message: `Please wait ${Math.ceil(60 - timeElapsed)} seconds before requesting a new OTP.` });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    record.otpHash = await bcrypt.hash(otp, salt);
    record.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    record.lastSentAt = new Date();
    await record.save();

    // Respond immediately then send email in the background.
    res.status(200).json({ message: 'Verification OTP has been resent.' });

    sendOtpEmail(email, otp, 'registration').catch((err) =>
      console.error('[resendRegisterOtp] Background email dispatch error:', err.message)
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and finalize registration
// @route   POST /api/auth/register-verify
// @access  Public
export const verifyOtpRegister = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and verification OTP are required.' });
  }

  try {
    const record = await OtpPending.findOne({ email: email.toLowerCase() });
    if (!record) {
      return res.status(400).json({ message: 'OTP session expired or invalid. Please sign up again.' });
    }

    // Expiry check
    if (new Date(record.otpExpiry).getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // OTP verification
    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    // Check one final time if account was created concurrently
    const userExists = await User.findOne({ email: record.email });
    if (userExists) {
      await OtpPending.deleteMany({ email: record.email });
      return res.status(400).json({ message: 'User account already registered.' });
    }

    // Create the permanent user account
    const user = await User.create({
      name: record.name,
      email: record.email,
      password: record.password, // Mongoose hashes it automatically in User schema pre-save hook
      role: 'user', // assign user role
      authProviders: ['local'],
      emailVerified: true,
      authenticationMethod: 'email',
    });

    // Delete temp registration
    await OtpPending.deleteOne({ _id: record._id });

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
      // Auto migrate existing user emailVerified status
      if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();
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

// @desc    Initiate password recovery by sending recovery OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email address is required.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate recovery OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    user.otpHash = await bcrypt.hash(otp, salt);
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    // Respond immediately then dispatch the password-reset email in the background.
    res.json({
      message: 'Password recovery OTP has been sent to your email address.',
    });

    sendOtpEmail(email, otp, 'password_reset').catch((err) =>
      console.error('[forgotPassword] Background email dispatch error:', err.message)
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify forgot password OTP
// @route   POST /api/auth/forgot-password-verify
// @access  Public
export const verifyForgotPasswordOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Expiry check
    if (!user.otpExpiry || new Date(user.otpExpiry).getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Comparison check
    const isMatch = await bcrypt.compare(otp, user.otpHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    res.json({
      message: 'OTP verified successfully. You may now reset your password.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password using recovery OTP
// @route   POST /api/auth/forgot-password-reset
// @access  Public
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Expiry check
    if (!user.otpExpiry || new Date(user.otpExpiry).getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired.' });
    }

    // OTP verification
    const isMatch = await bcrypt.compare(otp, user.otpHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid recovery verification code.' });
    }

    // Update password
    user.password = newPassword; // hashed automatically by User model pre-save hook
    user.otpHash = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({
      message: 'Password has been reset successfully. You may now log in.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login or Register with Google
// @route   POST /api/auth/google
// @access  Public
export const googleLoginOrRegister = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'Google ID Token is required.' });
  }

  const clientID = process.env.GOOGLE_CLIENT_ID;
  if (!clientID) {
    return res.status(500).json({ message: 'Google client ID is not configured on the server.' });
  }

  try {
    const client = new OAuth2Client(clientID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientID,
    });
    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({ message: 'Invalid ID Token.' });
    }

    const { name, email, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ message: 'Google email is not verified.' });
    }

    // 1. Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists. Merge authentication method if they don't have 'google' already
      let modified = false;
      if (!user.authProviders.includes('google')) {
        user.authProviders.push('google');
        modified = true;
      }
      if (!user.emailVerified) {
        user.emailVerified = true;
        modified = true;
      }
      if (picture && !user.profile.avatar) {
        user.profile.avatar = picture;
        modified = true;
      }
      
      if (modified) {
        await user.save();
      }
    } else {
      // Check if registration is enabled in Settings
      const settings = await Settings.getSettings();
      if (!settings.registrationsEnabled) {
        return res.status(403).json({ message: 'Registrations are currently disabled by the administrator.' });
      }

      // Create new user with authProviders: ['google']
      user = await User.create({
        name,
        email,
        role: 'user', // strictly assign user role
        authProviders: ['google'],
        emailVerified: true,
        profile: {
          bio: '',
          skills: [],
          targetJob: '',
          avatar: picture || '',
        },
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }

    // Retrieve stats identical to normal login
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
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    res.status(400).json({ message: 'Google Authentication failed: ' + error.message });
  }
};

