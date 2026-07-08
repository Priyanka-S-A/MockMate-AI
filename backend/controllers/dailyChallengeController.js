import DailyChallenge from '../models/DailyChallenge.js';
import DailyChallengeAttempt from '../models/DailyChallengeAttempt.js';
import User from '../models/User.js';
import { generateDailyChallenge } from '../utils/aiService.js';

// @desc    Get today's daily challenge
// @route   GET /api/daily-challenge
// @access  Private
export const getDailyChallenge = async (req, res) => {
  try {
    const challengeDate = new Date().toISOString().split('T')[0];

    // Find if the challenge for today exists
    let challenge = await DailyChallenge.findOne({ challengeDate });

    if (!challenge) {
      // Generate new challenge
      const generated = await generateDailyChallenge(challengeDate);
      challenge = await DailyChallenge.create({
        challengeDate,
        domain: generated.domain,
        question: generated.question,
        options: generated.options,
        correctAnswer: generated.correctAnswer,
        explanation: generated.explanation,
      });
    }

    // Check if the user has already attempted it
    const attempt = await DailyChallengeAttempt.findOne({
      userId: req.user._id,
      challengeDate,
    });

    if (attempt) {
      // If completed, return full challenge details including correct answer and explanation
      return res.json({
        challenge: {
          challengeDate: challenge.challengeDate,
          domain: challenge.domain,
          question: challenge.question,
          options: challenge.options,
          correctAnswer: challenge.correctAnswer,
          explanation: challenge.explanation,
        },
        attempt,
      });
    }

    // Otherwise, hide correctAnswer and explanation to prevent cheating
    return res.json({
      challenge: {
        challengeDate: challenge.challengeDate,
        domain: challenge.domain,
        question: challenge.question,
        options: challenge.options,
      },
      attempt: null,
    });
  } catch (error) {
    console.error('getDailyChallenge error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit answer to today's daily challenge
// @route   POST /api/daily-challenge/submit
// @access  Private
export const submitDailyChallenge = async (req, res) => {
  const { userAnswer } = req.body;

  if (!userAnswer) {
    return res.status(400).json({ message: 'User answer is required.' });
  }

  try {
    const challengeDate = new Date().toISOString().split('T')[0];

    // Check if the challenge exists
    const challenge = await DailyChallenge.findOne({ challengeDate });
    if (!challenge) {
      return res.status(404).json({ message: 'Daily challenge for today not found.' });
    }

    // Check if user already attempted today
    const existingAttempt = await DailyChallengeAttempt.findOne({
      userId: req.user._id,
      challengeDate,
    });
    if (existingAttempt) {
      return res.status(400).json({ message: "Today's challenge is already completed." });
    }

    // Evaluate answer
    const isCorrect = challenge.correctAnswer.trim().toLowerCase() === userAnswer.trim().toLowerCase();
    const score = isCorrect ? 1 : 0;
    const xpAwarded = isCorrect ? 25 : 0; // Award 25 XP for correct answer, 0 for incorrect

    // Save attempt in MongoDB
    const attempt = await DailyChallengeAttempt.create({
      userId: req.user._id,
      challengeDate,
      question: challenge.question,
      correctAnswer: challenge.correctAnswer,
      userAnswer,
      completed: true,
      score,
      explanation: challenge.explanation,
      xpAwarded,
    });

    // Update user's XP/Points if correct
    if (xpAwarded > 0) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'gamification.points': xpAwarded },
      });
    }

    res.status(201).json({
      success: isCorrect,
      correctAnswer: challenge.correctAnswer,
      explanation: challenge.explanation,
      xpAwarded,
      attempt,
    });
  } catch (error) {
    console.error('submitDailyChallenge error:', error);
    res.status(500).json({ message: error.message });
  }
};
