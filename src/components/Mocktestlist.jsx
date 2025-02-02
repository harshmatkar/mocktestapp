import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

const MockTests = () => {
  const [testsCompleted, setTestsCompleted] = useState({});
  const [countdown, setCountdown] = useState(0);
  const [selectedTest, setSelectedTest] = useState(null);
  const navigate = useNavigate();

  const mockTests = Array.from({ length: 30 }, (_, i) => ({
    name: `Mock Test ${i + 1}`,
    subject: "JEE MAIN",
    difficulty: i < 10 ? "Easy" : i < 20 ? "Medium" : "Hard",
    id: i + 1,
    isLive: i < 3
  }));

  const handleStartTest = (testName, testId) => {
    setSelectedTest({ name: testName, id: testId });
    setCountdown(10);

    const countdownInterval = setInterval(() => {
      setCountdown(prevCountdown => {
        if (prevCountdown <= 1) {
          clearInterval(countdownInterval);
          setTestsCompleted(prevState => ({
            ...prevState,
            [testId]: true
          }));
          setSelectedTest(null);
          navigate(`/instructions/${testId}`);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
  };

  const handleCancelCountdown = () => {
    setSelectedTest(null);
    setCountdown(0);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-500 dark:text-green-400";
      case "Medium":
        return "text-yellow-500 dark:text-yellow-400";
      case "Hard":
        return "text-red-500 dark:text-red-400";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  return (
    // Added bg-white and dark:bg-gray-900 to main container
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Available Mock Tests
        </h2>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4 text-left text-gray-700 dark:text-gray-200">Test Name</th>
                  <th className="p-4 text-left text-gray-700 dark:text-gray-200">Exam</th>
                  <th className="p-4 text-left text-gray-700 dark:text-gray-200">Difficulty</th>
                  <th className="p-4 text-right text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockTests.map((test) => (
                  <tr 
                    key={test.id} 
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="p-4 dark:text-white">{test.name}</td>
                    <td className="p-4 dark:text-white">{test.subject}</td>
                    <td className="p-4">
                      <span className={`font-medium ${getDifficultyColor(test.difficulty)}`}>
                        {test.difficulty}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {test.isLive ? (
                        <button
                          onClick={() => handleStartTest(test.name, test.id)}
                          disabled={testsCompleted[test.id]}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                            ${testsCompleted[test.id] 
                              ? 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                        >
                          {testsCompleted[test.id] ? "Completed" : "Start Test"}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        >
                          Coming Soon
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Total Tests</h3>
              <p className="text-3xl font-bold text-blue-500 dark:text-blue-400">{mockTests.length}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Available Tests</h3>
              <p className="text-3xl font-bold text-blue-500 dark:text-blue-400">3</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Difficulty Levels</h3>
              <p className="text-3xl font-bold text-blue-500 dark:text-blue-400">3</p>
            </div>
          </div>
        </div>

        {selectedTest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-xl font-bold mb-4 dark:text-white">Test Starting Soon</h3>
              <p className="mb-4 dark:text-gray-300">Test: {selectedTest?.name}</p>
              <p className="text-3xl font-bold text-center text-blue-500 dark:text-blue-400">{countdown} seconds</p>
              <button
                onClick={handleCancelCountdown}
                className="mt-4 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockTests;