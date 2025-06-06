import { User } from "../models";

// Helper function for month names
export function getMonthName(monthNumber: number) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[monthNumber - 1];
}

export const getAllUserWithUserEnrollMentIncourse = async () => {
  // 1. Aggregate users per month
  const stats = await User.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalUsers: { $sum: 1 },
        enrolledUsers: {
          $sum: {
            $cond: [{ $gt: [{ $size: "$enrolledCourses" }, 0] }, 1, 0],
          },
        },
      },
    },
  ]);

  const currentYear = new Date().getFullYear();

  // 2. Prepare months data from 1 to 12 with default 0s
  const monthlyStats: {
    month: string;
    totalUsers: number;
    enrolledUsers: number;
  }[] = [];

  for (let m = 1; m <= 12; m++) {
    const found = stats.find(
      (s) => s._id.month === m && s._id.year === currentYear
    );

    monthlyStats.push({
      month: getMonthName(m),
      totalUsers: found ? found.totalUsers : 0,
      enrolledUsers: found ? found.enrolledUsers : 0,
    });
  }

  // 3. Combine every two months
  const twoMonthsStats = [];
  for (let i = 0; i < 12; i += 2) {
    const firstMonth = monthlyStats[i];
    const secondMonth = monthlyStats[i + 1] || {
      totalUsers: 0,
      enrolledUsers: 0,
    };

    twoMonthsStats.push({
      period: firstMonth.month, // name of the first month
      totalUsers: firstMonth.totalUsers + secondMonth.totalUsers,
      enrolledUsers: firstMonth.enrolledUsers + secondMonth.enrolledUsers,
    });
  }

  return twoMonthsStats;
};

export const getAllUsersAndUsersWithRoadmaps = async () => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalUsers: { $sum: 1 },
        usersWithRoadmaps: {
          $sum: {
            $cond: [{ $ifNull: ["$roadmap", false] }, 1, 0],
          },
        },
      },
    },
  ]);

  const currentYear = new Date().getFullYear();

  const monthlyStats: {
    month: string;
    totalUsers: number;
    usersWithRoadmaps: number;
  }[] = [];

  for (let m = 1; m <= 12; m++) {
    const found = stats.find(
      (s) => s._id.month === m && s._id.year === currentYear
    );

    monthlyStats.push({
      month: getMonthName(m),
      totalUsers: found ? found.totalUsers : 0,
      usersWithRoadmaps: found ? found.usersWithRoadmaps : 0,
    });
  }

  const twoMonthsStats = [];
  for (let i = 0; i < 12; i += 2) {
    const firstMonth = monthlyStats[i];
    const secondMonth = monthlyStats[i + 1] || {
      totalUsers: 0,
      usersWithRoadmaps: 0,
    };

    twoMonthsStats.push({
      period: firstMonth.month,
      totalUsers: firstMonth.totalUsers + secondMonth.totalUsers,
      usersWithRoadmaps:
        firstMonth.usersWithRoadmaps + secondMonth.usersWithRoadmaps,
    });
  }

  return twoMonthsStats;
};
