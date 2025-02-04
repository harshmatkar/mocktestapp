import React, { useState, useEffect } from 'react';

const TestResults = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulated Firebase fetch - replace with actual Firebase query
    const fetchResults = async () => {
      try {
        // Mock data - replace with your Firebase fetch logic
        const mockData = {
          userId: "user123",
          testId: "test456",
          correctAnswers: 15,
          wrongAnswers: 5,
          unattemptedAnswers: 5
        };
        
        setResult(mockData);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch results");
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

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

  const totalQuestions = result.correctAnswers + result.wrongAnswers + result.unattemptedAnswers;
  const score = ((result.correctAnswers / totalQuestions) * 100).toFixed(1);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Test Results</h1>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-medium">User ID:</span>
            <span>{result.userId}</span>
          </div>
          
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-medium">Test ID:</span>
            <span>{result.testId}</span>
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
                  {result.wrongAnswers}
                </p>
                <p className="text-sm text-gray-600">Wrong Answers</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {result.unattemptedAnswers}
                </p>
                <p className="text-sm text-gray-600">Unattempted</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {score}%
                </p>
                <p className="text-sm text-gray-600">Overall Score</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResults;