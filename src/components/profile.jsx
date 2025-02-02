import React, { useState, useEffect } from 'react';
import { useUser } from "./UserContext";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Award, Star, Clock, Target, Calendar, ArrowLeft } from 'lucide-react';

const Profile = () => {
  const { userId, email, name } = useUser();
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
    totalSolved: 0,
    streak: 0,
    ranking: 0
  });
  const [darkMode, setDarkMode] = useState(true); // Default dark mode is true

  useEffect(() => {
    const fetchMockTests = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const q = query(collection(db, "testResults"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const tests = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMockTests(tests);

        // Calculate statistics
        const mockStats = {
          easy: tests.filter(t => t.difficulty === 'easy').length,
          medium: tests.filter(t => t.difficulty === 'medium').length,
          hard: tests.filter(t => t.difficulty === 'hard').length,
          totalSolved: tests.length,
          streak: calculateStreak(tests),
          ranking: Math.floor(Math.random() * 100000) // Mock ranking for demo
        };
        setStats(mockStats);
      } catch (error) {
        console.error("Error fetching test results: ", error);
      }
      setLoading(false);
    };

    fetchMockTests();
  }, [userId]);

  const calculateStreak = (tests) => {
    return tests.length > 0 ? Math.floor(tests.length / 2) : 0;
  };

  const chartData = [
    { name: 'Easy', solved: stats.easy, total: 50 },
    { name: 'Medium', solved: stats.medium, total: 30 },
    { name: 'Hard', solved: stats.hard, total: 20 }
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Apply dark mode to the entire document
    document.documentElement.classList.toggle('dark');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-7xl mx-auto p-6 space-y-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        {/* Back Button and Dark Mode Toggle Row */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-sm font-medium p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="text-gray-600 dark:text-white" />
            <span>Back</span>
          </button>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* Username at the Top */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-600 dark:text-white">
              {name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{name}</h2>
            <p className="text-gray-600 dark:text-gray-300">{email}</p>
            <p className="text-gray-500 dark:text-gray-400">Rank {stats.ranking}</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <Target className="text-green-500" />
              <span className="text-gray-600 dark:text-gray-300">Total Solved</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalSolved}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <Star className="text-yellow-500" />
              <span className="text-gray-600 dark:text-gray-300">Ranking</span>
            </div>
            <p className="text-2xl font-bold">#{stats.ranking}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="text-blue-500" />
              <span className="text-gray-600 dark:text-gray-300">Streak</span>
            </div>
            <p className="text-2xl font-bold">{stats.streak} days</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <Award className="text-purple-500" />
              <span className="text-gray-600 dark:text-gray-300">Completion Rate</span>
            </div>
            <p className="text-2xl font-bold">
              {((stats.totalSolved / 100) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Solved Problems Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Solved Problems</h3>
          <div className="h-64">
            <BarChart width={800} height={250} data={chartData} className="mx-auto">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke={darkMode ? '#fff' : '#374151'} />
              <YAxis stroke={darkMode ? '#fff' : '#374151'} />
              <Tooltip />
              <Bar dataKey="solved" fill="#4f46e5" />
            </BarChart>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4 p-6">Recent Submissions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Difficulty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {mockTests.slice(0, 5).map((test) => (
                  <tr key={test.id}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      Test #{test.testId}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        test.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                        test.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                        'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                      }`}>
                        {test.difficulty || 'medium'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-green-500">Accepted</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                      {new Date().toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
  