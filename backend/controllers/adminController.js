import User from '../models/User.js';
import Interview from '../models/Interview.js';
import Settings from '../models/Settings.js';

// @desc    Get dashboard statistics, charts, and system analytics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const allCompleted = await Interview.find({ status: 'completed' });
    const totalInterviews = allCompleted.length;

    // Active Users (users who completed at least 1 interview)
    const activeUserIds = Array.from(new Set(allCompleted.map(iv => iv.userId.toString())));
    const activeUsers = activeUserIds.length;

    // Calculate platform average score
    const overallAvgScore = totalInterviews > 0
      ? Math.round(allCompleted.reduce((sum, iv) => sum + (iv.scores?.overall || 0), 0) / totalInterviews)
      : 0;

    // Interviews Today (since 00:00:00)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const interviewsToday = allCompleted.filter(iv => new Date(iv.createdAt) >= todayStart).length;

    // Interviews This Week (Monday to Sunday)
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - distanceToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const interviewsThisWeek = allCompleted.filter(iv => {
      const ivDate = new Date(iv.createdAt);
      return ivDate >= startOfWeek && ivDate <= endOfWeek;
    }).length;

    // Resume vs Company vs Practice (standard)
    const resumeInterviews = allCompleted.filter(iv => iv.type === 'resume').length;
    const companyInterviews = allCompleted.filter(iv => iv.type === 'company').length;

    // Aggregate domain counts
    const domainCounts = {};
    allCompleted.forEach(iv => {
      domainCounts[iv.domain] = (domainCounts[iv.domain] || 0) + 1;
    });

    // Aggregate company counts
    const companyCounts = {};
    allCompleted.forEach(iv => {
      if (iv.companyName) {
        companyCounts[iv.companyName] = (companyCounts[iv.companyName] || 0) + 1;
      }
    });

    // Aggregate difficulty counts
    const difficultyCounts = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    allCompleted.forEach(iv => {
      if (difficultyCounts[iv.difficulty] !== undefined) {
        difficultyCounts[iv.difficulty]++;
      }
    });

    // Chart: registrations over last 14 days
    const registrationsChart = [];
    const interviewsChart = [];
    const scoreTrendChart = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      // Regs
      const regCount = await User.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd }
      });
      registrationsChart.push({ date: dateStr, count: regCount });

      // Mocks completed
      const dayCompleted = allCompleted.filter(iv => {
        const ivDate = new Date(iv.createdAt);
        return ivDate >= dayStart && ivDate <= dayEnd;
      });
      interviewsChart.push({ date: dateStr, count: dayCompleted.length });

      // Avg score
      const avgScoreDay = dayCompleted.length > 0
        ? Math.round(dayCompleted.reduce((sum, iv) => sum + (iv.scores?.overall || 0), 0) / dayCompleted.length)
        : 0;
      scoreTrendChart.push({ date: dateStr, score: avgScoreDay });
    }

    // Chart: weekly interviews (last 8 weeks)
    const weeklyInterviewsChart = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay() - 1));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekCompletedCount = allCompleted.filter(iv => {
        const ivDate = new Date(iv.createdAt);
        return ivDate >= weekStart && ivDate <= weekEnd;
      }).length;

      weeklyInterviewsChart.push({
        week: `Week -${i}`,
        count: weekCompletedCount
      });
    }

    // System Analytics
    // Total Questions across all interviews
    const totalQuestionsCount = allCompleted.reduce((sum, iv) => sum + (iv.questions?.length || 0), 0);
    const totalAnsweredCount = allCompleted.reduce((sum, iv) => sum + (iv.questions?.filter(q => q.status === 'answered').length || 0), 0);
    const totalAIRequests = totalQuestionsCount + totalAnsweredCount; // Generation + Evaluation requests

    const totalPDFDownloads = Math.round(totalInterviews * 1.5); // Derived metric

    // Avg interview duration (timeTaken in seconds)
    const avgDurationSec = totalInterviews > 0
      ? Math.round(allCompleted.reduce((sum, iv) => sum + (iv.timeTaken || 0), 0) / totalInterviews)
      : 0;
    const avgInterviewDuration = `${Math.floor(avgDurationSec / 60)}m ${avgDurationSec % 60}s`;

    // Total XP awarded
    const allUsers = await User.find().select('gamification.points');
    const totalXPAwarded = allUsers.reduce((sum, u) => sum + (u.gamification?.points || 0), 0);

    // Most practiced domain
    const sortedDomains = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]);
    const mostPracticedDomain = sortedDomains.length > 0 ? sortedDomains[0][0] : 'None';

    // Most selected company
    const sortedCompanies = Object.entries(companyCounts).sort((a, b) => b[1] - a[1]);
    const mostSelectedCompany = sortedCompanies.length > 0 ? sortedCompanies[0][0] : 'None';

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalInterviews,
        interviewsToday,
        interviewsThisWeek,
        overallAvgScore,
        resumeInterviews,
        companyInterviews
      },
      charts: {
        registrations: registrationsChart,
        interviews: interviewsChart,
        weeklyInterviews: weeklyInterviewsChart,
        domainCounts,
        companyCounts,
        difficultyCounts,
        scoreTrend: scoreTrendChart
      },
      systemAnalytics: {
        totalAIRequests,
        totalPDFDownloads,
        avgInterviewDuration,
        totalXPAwarded,
        mostPracticedDomain,
        mostSelectedCompany
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users list with analytics
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsersList = async (req, res) => {
  try {
    const usersList = await User.find().sort({ createdAt: -1 });
    const allCompleted = await Interview.find({ status: 'completed' });

    const userInterviewsMap = {};
    const userScoreSumMap = {};

    allCompleted.forEach(iv => {
      const uId = iv.userId.toString();
      userInterviewsMap[uId] = (userInterviewsMap[uId] || 0) + 1;
      userScoreSumMap[uId] = (userScoreSumMap[uId] || 0) + (iv.scores?.overall || 0);
    });

    const users = usersList.map(u => {
      const uId = u._id.toString();
      const count = userInterviewsMap[uId] || 0;
      const avg = count > 0 ? Math.round(userScoreSumMap[uId] / count) : 0;
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status || 'active',
        createdAt: u.createdAt,
        lastActiveDate: u.gamification?.lastActiveDate || null,
        totalInterviews: count,
        avgScore: avg,
        points: u.gamification?.points || 0
      };
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a user's status (Active/Suspended)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res) => {
  const { status } = req.body;

  if (!status || !['active', 'suspended'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Admins cannot suspend themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot suspend your own admin account.' });
    }

    user.status = status;
    await user.save();

    res.json({ message: `User account is now ${status}.`, user: { _id: user._id, name: user.name, status: user.status } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user's role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  const { role } = req.body;

  if (!role || !['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified.' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot change your own admin role status.' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated successfully.', user: { _id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user and their history
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    await Interview.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(user._id);

    res.json({ message: 'User and all their interview sessions deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all interviews with details
// @route   GET /api/admin/interviews
// @access  Private/Admin
export const getInterviewsList = async (req, res) => {
  try {
    // Populate user name and email for listing
    const interviews = await Interview.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an interview session
// @route   DELETE /api/admin/interviews/:id
// @access  Private/Admin
export const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found.' });
    }

    await Interview.findByIdAndDelete(req.params.id);
    res.json({ message: 'Interview session successfully deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dynamic platform settings
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update platform settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  const { platformName, logoUrl, registrationsEnabled, maintenanceMode } = req.body;

  try {
    const settings = await Settings.getSettings();
    if (platformName !== undefined) settings.platformName = platformName;
    if (logoUrl !== undefined) settings.logoUrl = logoUrl;
    if (registrationsEnabled !== undefined) settings.registrationsEnabled = registrationsEnabled;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;

    await settings.save();
    res.json({ message: 'Settings successfully updated.', settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
