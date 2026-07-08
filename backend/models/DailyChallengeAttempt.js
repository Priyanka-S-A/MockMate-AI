import mongoose from 'mongoose';

const dailyChallengeAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  challengeDate: {
    type: String,
    required: true,
    index: true,
  },
  question: {
    type: String,
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  userAnswer: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: true,
  },
  score: {
    type: Number,
    required: true, // 1 for correct, 0 for incorrect
  },
  explanation: {
    type: String,
    required: true,
  },
  xpAwarded: {
    type: Number,
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

// A user can only have one attempt per challengeDate
dailyChallengeAttemptSchema.index({ userId: 1, challengeDate: 1 }, { unique: true });

const DailyChallengeAttempt = mongoose.model('DailyChallengeAttempt', dailyChallengeAttemptSchema);
export default DailyChallengeAttempt;
