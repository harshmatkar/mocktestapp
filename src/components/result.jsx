import React from 'react';
import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useParams } from "react-router-dom";
import { useUser } from './UserContext.jsx';
import { useNavigate } from 'react-router-dom';


const CircularProgress = ({ size, radius, strokeWidth, progress, color, children }) => {
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-gray-700"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`${color} transition-all duration-500 ease-out`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};




const TestResults = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { testId } = useParams();
  const { userId } = useUser();
  const navigate = useNavigate();
  console.log("User ID from useUser:", userId);
  
  useEffect(() => {
    const fetchResult = async () => {
      if (!userId) return;

      console.log("Fetching result for testId:", testId);
      console.log("Fetching result for userId:", userId);

      try {
        const q = query(
          collection(db, "testResults"),
          where("testId", "==", testId),
          where("userId", "==", userId),
          orderBy("timestamp", "desc"),
          limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log("No documents found for the query.");
          setError("No result found for this test.");
        } else {
          const data = querySnapshot.docs[0].data();
          console.log("Fetched result:", data);
          setResult(data);
        }
      } catch (error) {
        console.error("Error fetching result:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [testId, userId]);

  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", () => {
      navigate("/dashboard"); // Redirect back to dashboard if back is pressed
    });
  
    return () => {
      window.removeEventListener("popstate", () => {});
    };
  }, []);
  

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 flex items-center justify-center">Error: {error}</div>;
  if (!result) return <div className="min-h-screen bg-gray-900 flex items-center justify-center">No test results found for this test.</div>;

  const percentage = ((result.marksObtained * 4 / 300) * 100).toFixed(1);
  const testDate = new Date(result.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  

  const handleWrongQuestion = () => {
    console.log("clicked");
      navigate("/notebook");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-gray-800/50 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Test Performance Summary
          </h1>
          <p className="text-gray-400">Test taken on {testDate}</p>
        </div>

        {/* Main Score Section */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          <CircularProgress
            size={220}
            radius={70}
            strokeWidth={10}
            progress={percentage}
            color="stroke-indigo-500"
          >
            <div className="text-center">
                <span className="text-5xl text-green-400">{result.marksObtained * 4 - result.wrongQuestions.length}</span>
                <span className="mx-2 text-5xl text-gray-100">/</span>
                <span className="text-5xl  text-gray-400">{300}</span>
            </div>
          </CircularProgress>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div className="bg-gray-700/50 p-4 rounded-xl">
              <div className="text-blue-400 text-sm mb-1">Test ID</div>
              <div className="text-2xl font-bold text-white">#{result.testId}</div>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-xl">
              <div className="text-purple-400 text-sm mb-1">Total Questions</div>
              <div className="text-2xl font-bold text-white">{75}</div>
            </div>
            <div className="col-span-2 bg-gradient-to-r from-indigo-500 to-blue-500 p-4 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-indigo-100">Correct Answers</div>
                  <div className="text-2xl font-bold text-white">{result.marksObtained}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-indigo-100">Wrong Answers</div>
                  <div className="text-2xl font-bold text-white">{result.wrongQuestions.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-gray-700/50 p-6 rounded-xl space-y-4">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {/* Test Version Block */}
    <div className="p-4 bg-gray-600/30 rounded-lg">
      <div className="text-gray-400 text-sm">Test Version</div>
      <div className="text-white font-semibold">2025 Standard</div>
    </div>

    {/* Button Block */}
    <div className="p-4 bg-gray-600/30 rounded-lg flex justify-center sm:justify-start">
      <button
        onClick={handleWrongQuestion}
        className="w-full sm:w-auto max-w-[200px] bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300 text-sm sm:text-base"
      >
        Wrong Questions
      </button>
    </div>
  </div>
</div>

      </div>
    </div>
  );
};

export default TestResults;