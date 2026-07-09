import DailyChallenge from '../models/DailyChallenge.js';
import DailyChallengeAttempt from '../models/DailyChallengeAttempt.js';
import User from '../models/User.js';
import { generateDailyChallenge } from '../utils/aiService.js';

// @desc    Get today's daily challenge
// @route   GET /api/daily-challenge
// @access  Private
export const getDailyChallenge = async (req, res) => {
  try {
    // Build today's date string in the server's UTC timezone → "YYYY-MM-DD"
    const today = new Date();
    const challengeDate = [
      today.getUTCFullYear(),
      String(today.getUTCMonth() + 1).padStart(2, '0'),
      String(today.getUTCDate()).padStart(2, '0'),
    ].join('-');

    // Sanity guard — never proceed with a null/empty date
    if (!challengeDate || !/^\d{4}-\d{2}-\d{2}$/.test(challengeDate)) {
      console.error('[DailyChallenge] Invalid challengeDate computed:', challengeDate);
      return res.status(500).json({ message: 'Internal error: could not determine today\'s date.' });
    }

    // Try to find an existing challenge for today first
    let challenge = await DailyChallenge.findOne({ challengeDate });

    if (!challenge) {
      // Generate with Gemini (or offline fallback)
      const generated = await generateDailyChallenge(challengeDate);

      // Validate the AI response contains all required fields
      const { domain, question, options, correctAnswer, explanation } = generated;
      if (!domain || !question || !Array.isArray(options) || options.length < 2 || !correctAnswer || !explanation) {
        console.error('[DailyChallenge] AI response missing required fields:', generated);
        return res.status(500).json({ message: 'Failed to generate a valid daily challenge. Please try again.' });
      }

      // Upsert: if a concurrent request already inserted the challenge, return it instead of failing
      challenge = await DailyChallenge.findOneAndUpdate(
        { challengeDate },                          // filter — match exact date
        {
          $setOnInsert: {                           // only write on INSERT, never overwrite
            challengeDate,
            domain,
            question,
            options,
            correctAnswer,
            explanation,
          },
        },
        {
          upsert: true,                             // insert if not found
          new: true,                                // return the resulting document
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(`[DailyChallenge] Created challenge for ${challengeDate} (domain: ${challenge.domain})`);
    } else {
      console.log(`[DailyChallenge] Returning existing challenge for ${challengeDate}`);
    }

    // Check if the user has already attempted today's challenge
    const attempt = await DailyChallengeAttempt.findOne({
      userId: req.user._id,
      challengeDate,
    });

    if (attempt) {
      // User has completed it — return full details including answer + explanation
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

    // Not yet attempted — hide the answer to prevent cheating
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
