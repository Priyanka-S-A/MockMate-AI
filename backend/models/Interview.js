import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  aiModelAnswer: { type: String, default: '' },
  userAnswerText: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'answered', 'skipped', 'draft'],
    default: 'pending',
  },
  evaluation: {
    score: { type: Number, default: 0 },
    technicalAccuracy: { type: String, default: '' },
    completeness: { type: String, default: '' },
    missingPoints: { type: [String], default: [] },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    suggestions: { type: String, default: '' },
  },
  orderIndex: { type: Number, default: 0 },
});

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['standard', 'resume', 'company'],
    default: 'standard',
  },
  domain: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate',
  },
  companyName: { type: String, default: '' },
  totalQuestions: { type: Number, default: 5 },
  timeLimit: { type: Number, default: 0 }, // 0 = untimed
  timeTaken: { type: Number, default: 0 }, // in seconds
  status: {
    type: String,
    enum: ['ongoing', 'completed'],
    default: 'ongoing',
  },
  questions: [questionSchema],
  scores: {
    overall: { type: Number, default: 0 },
    technicalKnowledge: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
  },
  summary: {
    strongAreas: { type: [String], default: [] },
    weakAreas: { type: [String], default: [] },
    aiSuggestions: { type: String, default: '' },
    learningRoadmap: { type: String, default: '' },
  },
  createdAt: { type: Date, default: Date.now },
});

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
