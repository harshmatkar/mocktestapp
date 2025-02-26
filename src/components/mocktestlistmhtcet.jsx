import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase"; // Adjust the import based on your Firebase config file
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { useUser } from "./UserContext";

const MockTestscet = () => {
  const [testsCompleted, setTestsCompleted] = useState({});
  const [countdown, setCountdown] = useState(0);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testAttempts, setTestAttempts] = useState({});
  const navigate = useNavigate();
  const countdownRef = useRef(null);
  const { userId } = useUser();

  const mockTests = Array.from({ length: 30 }, (_, i) => ({
    name: `Mock Test ${i + 1}`,
    subject: "MHT CET",
    difficulty: i < 10 ? "Easy" : i < 20 ? "Medium" : "Hard",
    id: i + 1,
    isLive: i < 10, // Only first 3 tests are live
  }));

  // Function to fetch test attempts from Firestore
  useEffect(() => {
    const fetchTestAttempts = async () => {
      if (!userId) return;

      const userDocRef = doc(db, "mhtcetattempts", userId);
      try {
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setTestAttempts(userDocSnap.data().testAttempts || {});
        }
      } catch (error) {
        console.error("Error fetching test attempts:", error.message);
      }
    };

    fetchTestAttempts();
  }, [userId]);

  const handleStartTest = async (testName, testId) => {
    console.log("User ID:", userId);
    if (!userId) {
      alert("Please log in to attempt a test.");
      return;
    }

    setSelectedTest({ name: testName, id: testId });
    setCountdown(10);

    countdownRef.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(countdownRef.current);
          setTestsCompleted((prevState) => ({
            ...prevState,
            [testId]: true,
          }));
          setSelectedTest(null);
          navigate(`/instructionscet/${testId}`);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    const userDocRef = doc(db, "mhtcetattempts", userId);
    const testIdString = String(testId);

    try {
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        await updateDoc(userDocRef, {
          [`testAttempts.${testIdString}`]: increment(1),
        });
      } else {
        await setDoc(userDocRef, {
          userId,
          testAttempts: { [testIdString]: 1 },
        });
        console.log("Document created successfully");
      }
    } catch (error) {
      console.error("Error updating test attempts:", error.message);
    }

    setTestAttempts((prevAttempts) => ({
      ...prevAttempts,
      [testIdString]: (prevAttempts[testIdString] || 0) + 1,
    }));
  };

  const handleCancelCountdown = async() => {
    console.log("Canceling countdown...");
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    if (selectedTest && userId) {
      const testIdString = String(selectedTest.id);
      const userDocRef = doc(db, "mhtcetattempts", userId);
      try {
        await updateDoc(userDocRef, {
          [`testAttempts.${testIdString}`]: increment(-1),
        });
        // Also update the local state to reflect the decrement
        setTestAttempts((prevAttempts) => ({
          ...prevAttempts,
          [testIdString]: Math.max(0, (prevAttempts[testIdString] || 1) - 1),
        }));
      } catch (error) {
        console.error("Error decrementing test attempts:", error.message);
      }
    }

    setSelectedTest(null);
    setCountdown(0);
    navigate("/mocktestlistmhtcet");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Available Mock Tests
        </h2>

        <h3 className="text-1xl text-center mb-6 text-gray-800 dark:text-red-500">
          Once you go on test environment it will be considered as 1 attempt, for each test user has 1 attempt.
        </h3>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4 text-left text-gray-700 dark:text-gray-200">Test Name</th>
                  <th className="p-4 text-left text-gray-700 dark:text-gray-200">Exam</th>
                  <th className="p-4 text-left text-gray-700 dark:text-gray-200">Score</th>
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
                    <td className="p-4 dark:text-white">
                      {testAttempts[test.id] || 0}
                    </td>
                    <td className="p-4 text-right">
                      {test.isLive ? (
                        <button
                          onClick={() => handleStartTest(test.name, test.id)}
                          disabled={testAttempts[String(test.id)] >= 1}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                            ${
                              testAttempts[String(test.id)] >= 1
                                ? "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600 text-white"
                            }`}
                        >
                          {testAttempts[String(test.id)] >= 1 ? "Completed" : "Start Test"}
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

        {selectedTest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-xl font-bold mb-4 dark:text-white">Test Starting Soon</h3>
              <p className="mb-4 dark:text-gray-300">Test: {selectedTest?.name}</p>
              <p className="text-3xl font-bold text-center text-blue-500 dark:text-blue-400">
                {countdown} seconds
              </p>
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

export default MockTestscet;
