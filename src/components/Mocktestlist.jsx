import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment
} from "firebase/firestore";
import { useUser } from "./UserContext";

const MockTests = () => {
  const [testsCompleted, setTestsCompleted] = useState({});
  const [countdown, setCountdown] = useState(0);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testAttempts, setTestAttempts] = useState(null);
  const [scores, setScores] = useState({});
  const navigate = useNavigate();
  const countdownRef = useRef(null);
  const db = getFirestore();
  const { userId } = useUser();

  useEffect(() => {
    const fetchUserScores = async () => {
      if (!userId) return;
  
      const q = query(collection(db, "testResults"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
  
      let userScores = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const marksObtained = data.marksObtained || 0;
        const wrongQuestions = data.wrongQuestions?.length || 0; // Ensure wrongQuestions is an array
  
        const calculatedScore = (marksObtained * 4) - wrongQuestions;
        userScores[data.testId] = calculatedScore;
      });
  
      setScores(userScores);
    };
  
    fetchUserScores();
  }, [userId, db]);
  

  const mockTests = Array.from({ length: 10 }, (_, i) => ({
    name: `Mock Test ${i + 1}`,
    subject: "JEE MAIN",
    id: i + 1,
    isLive: i < 5,
    score: scores[i + 1] !== undefined ? scores[i + 1] : "N/A", // Proper score handling
  }));
  


  useEffect(() => {
    if (!userId) return;
    
    const fetchAttempts = async () => {
      setTestAttempts(null); // Indicate loading
      const userDocRef = doc(db, "userTestAttempts", userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setTestAttempts(userDocSnap.data().testAttempts || {});
      } else {
        setTestAttempts({}); // Ensure no flicker
      }
    };
  
    fetchAttempts();
  }, [userId, db]);
  
  

  const handleStartTest = async (testName, testId) => {
    console.log("User ID:", userId);
    
    if (!userId) {
      alert("Please log in to attempt a test.");
      return;
    }

    setSelectedTest({ name: testName, id: testId });
    setCountdown(10);

    // Store countdown completion flag
    localStorage.setItem("countdownCompleted", "false");
    localStorage.setItem("instructionsVisited", "false");

    // Start Countdown
    countdownRef.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(countdownRef.current);
          setTestsCompleted((prevState) => ({
            ...prevState,
            [testId]: true,
          }));
          setSelectedTest(null);

          // Set flag before navigation
          localStorage.setItem("countdownCompleted", "true");
          navigate(`/instructions/${testId}`);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    // Firestore Operations
    const userDocRef = doc(db, "userTestAttempts", userId);
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

    // Update State Locally
    setTestAttempts((prevAttempts) => ({
      ...prevAttempts,
      [testIdString]: (prevAttempts[testIdString] || 0) + 1,
    }));
};

// Cleanup Countdown on Component Unmount
useEffect(() => {
  return () => {
    clearInterval(countdownRef.current);
  };
}, []);

  const handleCancelCountdown = async () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
  
    // Decrement the test attempt count in Firestore if a test was selected
    if (selectedTest && userId) {
      const testIdString = String(selectedTest.id);
      const userDocRef = doc(db, "userTestAttempts", userId);
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
    navigate("/mocktestslist");
  };
  


  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <h2 className="text-4xl font-bold text-center mb-6 text-gray-800 dark:text-cyan-600">
           Mockitupp
        </h2>

        <h3 className="text-1xl text-center mb-6 text-gray-800 dark:text-red-500">Once you go on test environment it will be considered as 1 attempt , for each test user have 1 attempts</h3>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4 text-left text-gray-700 dark:text-gray-200">
                    Test Name
                  </th>
                  <th className="p-4 text-left text-gray-700 dark:text-gray-200">
                    Exam
                  </th>
                  <th className="p-4 text-left text-gray-700 dark:text-gray-200">
                    Scores
                  </th>
                  <th className="p-4 text-right text-gray-700 dark:text-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockTests.map((test) => (
                  <tr
                    key={test.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="p-2 dark:text-white">{test.name}</td>
                    <td className="p- dark:text-white">{test.subject}</td>
                    <td className="p-4 dark:text-white">
                      {/* Changed from difficulty to score */}
                      <span className="font-medium">
                        {test.score}/300
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {test.isLive ? (
                        <button
                        disabled={testAttempts === null || testAttempts[test.id] > 0}
                        onClick={() => handleStartTest(test.name, test.id)}
                        className={`py-2 px-4 rounded-lg transition-all duration-300 text-white ${
                          testAttempts === null
                            ? "bg-gray-400 cursor-wait"
                            : testAttempts[test.id] > 0
                            ? "bg-blue-500 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {testAttempts === null
                          ? "Checking..."
                          : testAttempts[test.id] > 1
                          ? "Completed"
                          : "Start Test"}
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
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center animate-fade-in">
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 w-full max-w-sm mx-4 transform scale-105 transition-all duration-300">
      <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white text-center">
        Get Ready! 🚀
      </h3>
      <p className="text-center text-lg text-gray-700 dark:text-gray-300 mb-2">
        Your test <span className="font-semibold">{selectedTest?.name}</span> is starting in:
      </p>
      <p className="text-4xl font-extrabold text-center text-blue-600 dark:text-blue-400 animate-pulse">
        {countdown} sec
      </p>
      <button
        onClick={handleCancelCountdown}
        className="mt-5 w-full px-4 py-2 bg-red-500 text-white text-lg font-medium rounded-lg shadow-md hover:bg-red-600 transition-all duration-200"
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
