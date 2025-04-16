import React, { useState, useEffect } from 'react';
import { useUser } from "./UserContext";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { ArrowLeft } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';

const Profile = () => {
  const { userId } = useUser();
  const [darkMode, setDarkMode] = useState(true);
  const [username, setUsername] = useState('Student');
  const [user] = useAuthState(auth);
  const [useremail, setuseremail] = useState('');
  
  const [testResults, setTestResults] = useState({
    jeeMains: [],
    mhtCet: [],
    jeeAdv: []
  });

  useEffect(() => {
    if (user?.displayName) {
      setUsername(user.displayName);
      setuseremail(user.email);
    } else if (user?.email) {
      setUsername(user.email.split('@')[0]);
    }
  }, [user]);

  useEffect(() => {
    if (!userId) return;
    
    const fetchMockTests = async () => {
      const q = query(collection(db, "testResults"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const tests = querySnapshot.docs.map(doc => doc.data());
      
      const categorizedTests = {
        jeeMains: tests.filter(test => test.examType === 'JEE Mains'),
        mhtCet: tests.filter(test => test.examType === 'MHT CET'),
        jeeAdv: tests.filter(test => test.examType === 'JEE Advanced')
      };

      setTestResults(categorizedTests);
    };
    
    fetchMockTests();
  }, [userId]);

  const getHighestScore = (tests) => tests.length ? Math.max(...tests.map(test => test.score)) : 0;
  const getExpectedPercentile = (score) => (score / 100) * 90;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen p-4 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <button onClick={() => window.history.back()} className="p-2 text-sm"> <ArrowLeft /> Back </button>
          <button onClick={toggleDarkMode} className="p-2"> {darkMode ? 'Light Mode' : 'Dark Mode'} </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg space-y-2">
          <h2 className="text-lg font-semibold">{username}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{useremail}</p>
        </div>

        {Object.entries(testResults).map(([exam, tests]) => (
          <div key={exam} className="bg-white dark:bg-gray-800 p-4 rounded-lg space-y-2">
            <h3 className="text-lg font-semibold capitalize">{exam.replace(/jeeMains/, 'JEE Mains').replace(/mhtCet/, 'MHT CET').replace(/jeeAdv/, 'JEE Advanced')}</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-sm">Total Tests Given</p>
                <p className="font-bold">{tests.length}</p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-sm">Highest Score</p>
                <p className="font-bold">{getHighestScore(tests)}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-sm">Expected Percentile</p>
              <p className="font-bold">{getExpectedPercentile(getHighestScore(tests)).toFixed(2)}%</p>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Test Performance</h3>
              <BarChart width={300} height={200} data={tests}>
                <XAxis dataKey="difficulty" stroke={darkMode ? '#fff' : '#000'} />
                <YAxis stroke={darkMode ? '#fff' : '#000'} />
                <Tooltip />
                <Bar dataKey="score" fill="#4f46e5" />
              </BarChart>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;