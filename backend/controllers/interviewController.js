import mongoose from 'mongoose';
import Interview from '../models/Interview.js';
import User from '../models/User.js';
import {
  generateInterviewQuestion,
  evaluateAnswer,
  generateInterviewSummary,
  generateResumeInterviewQuestion,
} from '../utils/aiService.js';
import { generatePDFReport } from '../utils/pdfGenerator.js';
import pdfParse from 'pdf-parse';

// ─── Create a new interview session ─────────────────────────────────────────
// @route  POST /api/interviews
// @access Private
export const createInterview = async (req, res) => {
  const { domain, difficulty, totalQuestions, timeLimit, type, companyName } = req.body;

  if (!domain || !difficulty) {
    return res.status(400).json({ message: 'Domain and difficulty are required.' });
  }

  try {
    // Generate the very first question immediately
    const firstQuestion = await generateInterviewQuestion({
      domain,
      difficulty,
      previousQuestions: [],
      companyName: companyName || null,
    });

    const interview = await Interview.create({
      userId: req.user._id,
      domain,
      difficulty,
      totalQuestions: totalQuestions || 5,
      timeLimit: timeLimit || 0,
      type: type || 'standard',
      companyName: companyName || '',
      status: 'ongoing',
      questions: [
        {
          questionText: firstQuestion,
          orderIndex: 0,
          status: 'pending',
        },
      ],
    });

    res.status(201).json({
      _id: interview._id,
      domain: interview.domain,
      difficulty: interview.difficulty,
      totalQuestions: interview.totalQuestions,
      timeLimit: interview.timeLimit,
      type: interview.type,
      companyName: interview.companyName,
      status: interview.status,
      currentQuestionIndex: 0,
      currentQuestion: {
        _id: interview.questions[0]._id,
        questionText: firstQuestion,
        orderIndex: 0,
        status: 'pending',
      },
      questionsAnswered: 0,
    });
  } catch (error) {
    console.error('createInterview error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── Get interview session by ID ─────────────────────────────────────────────
// @route  GET /api/interviews/:id
// @access Private
export const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) return res.status(404).json({ message: 'Interview not found.' });
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Submit answer and get evaluation ────────────────────────────────────────
// @route  POST /api/interviews/:id/answer
// @access Private
export const submitAnswer = async (req, res) => {
  const { questionId, userAnswer, isDraft } = req.body;

  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found.' });
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    if (interview.status === 'completed') {
      return res.status(400).json({ message: 'This interview session is already completed.' });
    }

    const question = interview.questions.id(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found.' });

    if (isDraft) {
      // Save draft without evaluating
      question.userAnswerText = userAnswer || '';
      question.status = 'draft';
      await interview.save();
      return res.json({ message: 'Draft saved.', status: 'draft' });
    }

    // Full submit — get AI evaluation
    question.userAnswerText = userAnswer || '';
    question.status = 'answered';

    const evaluation = await evaluateAnswer({
      question: question.questionText,
      userAnswer: userAnswer || '',
      domain: interview.domain,
      difficulty: interview.difficulty,
    });

    question.evaluation = {
      score: evaluation.score ?? 0,
      technicalAccuracy: evaluation.technicalAccuracy ?? '',
      completeness: evaluation.completeness ?? '',
      missingPoints: evaluation.missingPoints ?? [],
      strengths: evaluation.strengths ?? [],
      weaknesses: evaluation.weaknesses ?? [],
      suggestions: evaluation.suggestions ?? '',
    };
    question.aiModelAnswer = evaluation.idealAnswer ?? '';

    await interview.save();

    res.json({
      evaluation: {
        ...question.evaluation,
        idealAnswer: evaluation.idealAnswer ?? '',
      },
      questionId,
    });
  } catch (error) {
    console.error('submitAnswer error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── Skip a question ─────────────────────────────────────────────────────────
// @route  POST /api/interviews/:id/skip
// @access Private
export const skipQuestion = async (req, res) => {
  const { questionId } = req.body;
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found.' });
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const question = interview.questions.id(questionId);
    if (question) {
      question.status = 'skipped';
      await interview.save();
    }
    res.json({ message: 'Question skipped.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get next question ────────────────────────────────────────────────────────
// @route  POST /api/interviews/:id/next-question
// @access Private
export const getNextQuestion = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found.' });
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    if (interview.status === 'completed') {
      return res.status(400).json({ message: 'Interview already completed.' });
    }

    // Check if we've reached the question limit
    if (interview.questions.length >= interview.totalQuestions) {
      return res.json({ done: true, message: 'All questions have been presented.' });
    }

    // Collect all previous questions to avoid repetition
    const previousQuestions = interview.questions.map((q) => q.questionText);

    const newQuestionText = await generateInterviewQuestion({
      domain: interview.domain,
      difficulty: interview.difficulty,
      previousQuestions,
      companyName: interview.companyName || null,
    });

    const newOrderIndex = interview.questions.length;
    interview.questions.push({
      questionText: newQuestionText,
      orderIndex: newOrderIndex,
      status: 'pending',
    });

    await interview.save();

    const newQuestion = interview.questions[newOrderIndex];

    res.json({
      done: false,
      currentQuestion: {
        _id: newQuestion._id,
        questionText: newQuestion.questionText,
        orderIndex: newOrderIndex,
        status: 'pending',
      },
      currentQuestionIndex: newOrderIndex,
      totalGenerated: interview.questions.length,
    });
  } catch (error) {
    console.error('getNextQuestion error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── Complete the interview & generate summary ────────────────────────────────
// @route  POST /api/interviews/:id/complete
// @access Private
export const completeInterview = async (req, res) => {
  const { timeTaken } = req.body;
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found.' });
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    // Calculate scores
    const answered = interview.questions.filter((q) => q.status === 'answered');
    const totalScore = answered.reduce((sum, q) => sum + (q.evaluation?.score ?? 0), 0);
    const maxPossible = answered.length * 10;
    const overallScore = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;

    // Generate AI summary
    const summaryData = await generateInterviewSummary({
      domain: interview.domain,
      difficulty: interview.difficulty,
      questions: interview.questions,
      overallScore,
    });

    interview.status = 'completed';
    interview.timeTaken = timeTaken || 0;
    interview.scores = {
      overall: overallScore,
      technicalKnowledge: Math.min(overallScore + 5, 100),
      communicationScore: Math.max(overallScore - 8, 0),
      accuracy: answered.length > 0 ? Math.round((answered.length / interview.questions.length) * 100) : 0,
    };
    interview.summary = {
      strongAreas: summaryData.strongAreas ?? [],
      weakAreas: summaryData.weakAreas ?? [],
      learningRoadmap: summaryData.learningRoadmap ?? '',
    };

    await interview.save();

    // ── Award XP points ──────────────────────────────────────────────────────
    const pointsEarned = answered.length * 10 + (overallScore >= 80 ? 50 : overallScore >= 60 ? 20 : 0);
    const badgesToAdd = [];
    if (overallScore >= 80) badgesToAdd.push('High Scorer');

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $inc: { 'gamification.points': pointsEarned },
        $set: {
          'gamification.lastActiveDate': new Date(),
        },
        $addToSet: { 'gamification.badges': { $each: badgesToAdd } },
      },
      { new: true }
    );

    // Calculate completedInterviewsCount and completedInterviewDates dynamically from the database
    const completedInterviews = await Interview.find({
      userId: req.user._id,
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
      _id: interview._id,
      status: 'completed',
      scores: interview.scores,
      summary: interview.summary,
      totalQuestions: interview.questions.length,
      answeredCount: answered.length,
      pointsEarned,
      gamification: {
        ...(updatedUser.gamification?.toObject ? updatedUser.gamification.toObject() : updatedUser.gamification),
        completedInterviewsCount,
        completedInterviewDates,
      },
    });
  } catch (error) {
    console.error('completeInterview error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── Get all interviews for current user ─────────────────────────────────────
// @route  GET /api/interviews
// @access Private
export const getUserInterviews = async (req, res) => {
  try {
    const { domain, page = 1, limit = 10 } = req.query;
    const filter = { userId: req.user._id, status: 'completed' };
    if (domain) filter.domain = domain;

    const total = await Interview.countDocuments(filter);
    const interviews = await Interview.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-questions.evaluation.missingPoints -questions.aiModelAnswer');

    res.json({ interviews, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download Interview PDF Report
// @route   GET /api/interviews/:id/pdf
// @access  Private
export const downloadInterviewPDF = async (req, res) => {
  const interviewId = req.params.id;
  try {
    console.log(`[PDF Generator] Starting PDF generation for interview ID: ${interviewId}`);

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      console.warn(`[PDF Generator] Invalid interview ID format: ${interviewId}`);
      return res.status(400).json({ message: 'Invalid interview ID format.' });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      console.warn(`[PDF Generator] Interview not found in database: ${interviewId}`);
      return res.status(404).json({ message: 'Interview not found.' });
    }

    if (interview.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      console.warn(`[PDF Generator] Unauthorized download attempt of interview ${interviewId} by user ${req.user._id}`);
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const pdfBuffer = await generatePDFReport(interview);

    // Sanitize domain name to prevent spaces or special characters from splitting Content-Disposition header
    const rawDomain = interview.domain || 'Mock_Interview';
    const safeDomain = rawDomain.replace(/[^a-zA-Z0-9-_]/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Interview_Report_${safeDomain}_${interviewId}.pdf"`
    );

    res.send(pdfBuffer);
    console.log(`[PDF Generator] Successfully generated and sent PDF for interview ID: ${interviewId}`);
  } catch (error) {
    console.error(`[PDF Generator Error] Failed to generate PDF for interview: ${interviewId}. Reason:`, error);
    if (!res.headersSent) {
      res.status(500).json({ message: `Failed to generate PDF report: ${error.message}` });
    }
  }
};

// @desc    Create a new resume-based interview session
// @route   POST /api/interviews/resume
// @access  Private
export const createResumeInterview = async (req, res) => {
  const domain = req.body.domain || 'Resume-Based';
  const { difficulty, totalQuestions, timeLimit } = req.body;

  if (!difficulty) {
    return res.status(400).json({ message: 'Difficulty is required.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a PDF resume file.' });
  }

  try {
    // Parse PDF
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text || '';

    if (resumeText.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from the uploaded PDF resume. Make sure it is not a scanned image.' });
    }

    // Generate first question using resume text
    const firstQuestion = await generateResumeInterviewQuestion({
      domain,
      difficulty,
      resumeText,
      previousQuestions: []
    });

    const interview = await Interview.create({
      userId: req.user._id,
      domain,
      difficulty,
      totalQuestions: totalQuestions || 5,
      timeLimit: timeLimit || 0,
      type: 'resume',
      companyName: req.file.originalname, // Store uploaded resume file name here
      status: 'ongoing',
      questions: [
        {
          questionText: firstQuestion,
          orderIndex: 0,
          status: 'pending'
        }
      ]
    });

    res.status(201).json({
      _id: interview._id,
      domain: interview.domain,
      difficulty: interview.difficulty,
      totalQuestions: interview.totalQuestions,
      timeLimit: interview.timeLimit,
      type: interview.type,
      companyName: interview.companyName,
      status: interview.status,
      currentQuestionIndex: 0,
      currentQuestion: {
        _id: interview.questions[0]._id,
        questionText: firstQuestion,
        orderIndex: 0,
        status: 'pending'
      },
      questionsAnswered: 0
    });
  } catch (error) {
    console.error('createResumeInterview error:', error);
    res.status(500).json({ message: error.message });
  }
};

