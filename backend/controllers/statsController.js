import Interview from '../models/Interview.js';

// @desc    Get dashboard stats for the current user
// @route   GET /api/stats/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const allCompleted = await Interview.find({ userId, status: 'completed' });

    const totalInterviews = allCompleted.length;
    const avgScore = totalInterviews > 0
      ? Math.round(allCompleted.reduce((sum, iv) => sum + iv.scores.overall, 0) / totalInterviews)
      : 0;
    const bestScore = totalInterviews > 0
      ? Math.max(...allCompleted.map((iv) => iv.scores.overall))
      : 0;

    // Interviews this week (Monday 00:00:00 to Sunday 23:59:59)
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - distanceToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const thisWeek = allCompleted.filter((iv) => {
      const ivDate = new Date(iv.createdAt);
      return ivDate >= startOfWeek && ivDate <= endOfWeek;
    }).length;

    // Domain distribution
    const domainMap = {};
    allCompleted.forEach((iv) => {
      domainMap[iv.domain] = (domainMap[iv.domain] || 0) + 1;
    });

    // Score history (last 10)
    const scoreHistory = allCompleted
      .slice(-10)
      .map((iv) => ({
        date: iv.createdAt,
        score: iv.scores.overall,
        domain: iv.domain,
      }));

    // Difficulty distribution
    const difficultyMap = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    allCompleted.forEach((iv) => {
      if (difficultyMap[iv.difficulty] !== undefined) {
        difficultyMap[iv.difficulty]++;
      }
    });

    // Weak areas aggregation (collect from all summaries)
    const weakAreaCount = {};
    allCompleted.forEach((iv) => {
      (iv.summary.weakAreas || []).forEach((area) => {
        weakAreaCount[area] = (weakAreaCount[area] || 0) + 1;
      });
    });
    const topWeakAreas = Object.entries(weakAreaCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([area]) => area);

    // Weekly practice (last 7 days)
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      const count = allCompleted.filter(
        (iv) => new Date(iv.createdAt) >= day && new Date(iv.createdAt) < nextDay
      ).length;
      weeklyActivity.push({
        day: day.toLocaleDateString('en-US', { weekday: 'short' }),
        count,
      });
    }

    // Recent 5 interviews
    const recentInterviews = allCompleted
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((iv) => ({
        _id: iv._id,
        domain: iv.domain,
        difficulty: iv.difficulty,
        score: iv.scores.overall,
        totalQuestions: iv.totalQuestions,
        createdAt: iv.createdAt,
        type: iv.type || 'standard',
        companyName: iv.companyName || '',
      }));

    const completedInterviewDates = Array.from(
      new Set(
        allCompleted.map((iv) => {
          const dateObj = new Date(iv.createdAt);
          return dateObj.toISOString().split('T')[0];
        })
      )
    ).sort();

    res.json({
      totalInterviews,
      avgScore,
      bestScore,
      thisWeek,
      domainDistribution: domainMap,
      difficultyDistribution: difficultyMap,
      scoreHistory,
      topWeakAreas,
      weeklyActivity,
      recentInterviews,
      gamification: {
        completedInterviewsCount: totalInterviews,
        completedInterviewDates,
        points: req.user.gamification?.points || 0,
        badges: req.user.gamification?.badges || [],
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get score trend over time
// @route   GET /api/stats/score-trend
// @access  Private
export const getScoreTrend = async (req, res) => {
  try {
    const userId = req.user._id;
    const interviews = await Interview.find({ userId, status: 'completed' })
      .sort({ createdAt: 1 })
      .limit(20)
      .select('scores domain difficulty createdAt');

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
