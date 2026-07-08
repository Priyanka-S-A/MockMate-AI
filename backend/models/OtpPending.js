import mongoose from 'mongoose';

const otpPendingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  otpExpiry: {
    type: Date,
    required: true,
  },
  lastSentAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: 300 }, // Auto delete after 5 minutes (300 seconds)
  },
});

const OtpPending = mongoose.model('OtpPending', otpPendingSchema);
export default OtpPending;
