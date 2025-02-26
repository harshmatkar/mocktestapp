import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, query, where, getDocs , orderBy, limit} from "firebase/firestore";
import { db } from "../firebase";
import { useUser } from "./UserContext";
import { format } from "date-fns"; // For timestamp formatting

const TestResults = () => {
  const { userId } = useUser();
  const { testIdcet } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !testIdcet) {
      setError("Invalid user or test ID");
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        console.log("Fetching latest results for userId:", userId, "testIdcet:", testIdcet);
    
        const resultsCollection = collection(db, "testResultcet");
        const q = query(
          resultsCollection,
          where("userId", "==", String(userId)),
          where("testIdcet", "==", String(testIdcet)),
          orderBy("timestamp", "desc"), // Order by latest
          limit(1) // Get only the latest result
        );
    
        const querySnapshot = await getDocs(q);
        console.log("Query snapshot docs:", querySnapshot.docs);
    
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          console.log("Fetched latest document data:", docData);
          setResult({
            ...docData,
            timestamp: docData.timestamp?.toDate(),
          });
        } else {
          setError("No results found for this test.");
        }
      } catch (err) {
        console.error("Failed to fetch results:", err);
        setError("Failed to fetch results");
      }
      setLoading(false);
    };
    

    fetchResults();
  }, [userId, testIdcet]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">No result data available.</p>
      </div>
    );
  }

  // Calculate derived values
  const wrongAnswers = result.answeredQuestions - result.correctAnswers;
  const score = result.totalQuestions
    ? ((result.correctAnswers / result.totalQuestions) * 100).toFixed(1)
    : 0;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Test Results</h1>

        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-medium">Test Date:</span>
            <span>
              {result.timestamp ? 
                format(result.timestamp, "dd MMM yyyy HH:mm") : 
                "N/A"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {result.correctAnswers}
                </p>
                <p className="text-sm text-gray-600">Correct Answers</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {wrongAnswers}
                </p>
                <p className="text-sm text-gray-600">Wrong Answers</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {result.unansweredQuestions}
                </p>
                <p className="text-sm text-gray-600">Unanswered</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {score}%
                </p>
                <p className="text-sm text-gray-600">Score</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {result.totalQuestions}
                </p>
                <p className="text-sm text-gray-600">Total Questions</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-600">
                  {result.answeredQuestions}
                </p>
                <p className="text-sm text-gray-600">Attempted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResults;