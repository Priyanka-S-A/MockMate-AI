import mongoose from 'mongoose';

const dailyChallengeSchema = new mongoose.Schema({
  challengeDate: {
    type: String,
    required: true,
    unique: true, // "YYYY-MM-DD"
    index: true,
  },
  domain: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [opts => opts.length >= 2, 'Options must have at least 2 choices'],
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const DailyChallenge = mongoose.model('DailyChallenge', dailyChallengeSchema);
export default DailyChallenge;
