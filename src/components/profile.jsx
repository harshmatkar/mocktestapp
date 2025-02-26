import React, { useState, useEffect } from 'react';
import { useUser } from "./UserContext";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { ArrowLeft, Star, Calendar } from 'lucide-react';

const Profile = () => {
  const { userId, name } = useUser();
  const [mockTests, setMockTests] = useState([]);
  const [stats, setStats] = useState({ totalSolved: 0, streak: 0, ranking: 0 });
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchMockTests = async () => {
      const q = query(collection(db, "testResults"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const tests = querySnapshot.docs.map(doc => doc.data());
      setMockTests(tests);

      setStats({
        totalSolved: tests.length,
        streak: Math.floor(tests.length / 2),
        ranking: Math.floor(Math.random() * 100000)
      });
    };
    fetchMockTests();
  }, [userId]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen p-4 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="max-w-xl mx-auto space-y-4">
        <h1 className="text-3xl font-semibold text-red-500">** In progress **</h1>
        <div className="flex justify-between items-center">
          <button onClick={() => window.history.back()} className="p-2 text-sm"> <ArrowLeft /> Back </button>
          <button onClick={toggleDarkMode} className="p-2"> {darkMode ? 'Light Mode' : 'Dark Mode'} </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xl font-bold">{name?.charAt(0) || 'U'}</div>
          <h2 className="text-lg font-semibold">{name}</h2>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <Star className="mx-auto text-yellow-500" />
            <p className="text-sm">Ranking</p>
            <p className="font-bold">#{stats.ranking}</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <Calendar className="mx-auto text-blue-500" />
            <p className="text-sm">Streak</p>
            <p className="font-bold">{stats.streak} days</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-sm">Total Solved</p>
            <p className="font-bold">{stats.totalSolved}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Solved Problems</h3>
          <BarChart width={300} height={200} data={mockTests}>
            <XAxis dataKey="difficulty" stroke={darkMode ? '#fff' : '#000'} />
            <YAxis stroke={darkMode ? '#fff' : '#000'} />
            <Tooltip />
            <Bar dataKey="score" fill="#4f46e5" />
          </BarChart>
        </div>
      </div>
    </div>
  );
};

export default Profile;
