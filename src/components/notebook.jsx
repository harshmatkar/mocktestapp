import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useUser } from "./UserContext.jsx";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import questionsData from "../assets/questions.json";

const mathJaxConfig = {
  loader: { load: ["[tex]/html"] },
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    packages: { "[+]": ["html"] },
  },
};

const NotebookPage = () => {
  const { userId } = useUser();
  const [selectedTest, setSelectedTest] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [questions, setQuestions] = useState([]);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [testAttempted, setTestAttempted] = useState(false);

  const fetchQuestions = async () => {
    if (!selectedTest || !userId) return;
    setIsLoading(true);
    setTestAttempted(false);

    try {
      const testId = parseInt(selectedTest.replace(/test/gi, ""), 10);
      const q = query(
        collection(db, "testResults"),
        where("testId", "==", String(testId)),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setTestAttempted(true);
        const testQuestions = questionsData.filter(q => q.testId === testId);
        const allStatuses = querySnapshot.docs.flatMap(
          doc => doc.data().questionStatuses || []
        );
        const submittedAnswers = querySnapshot.docs[0].data().submittedAnswers || [];

        const questionsWithStatus = testQuestions.map(question => {
          const statusEntry = allStatuses.find(s =>
            s.questionId.toString() === question.id.toString()
          );

          const normalizedStatus = statusEntry?.status?.toLowerCase().trim() || "unattempted";
          const statusMapping = {
            "correct solved": "correct",
            "wrong solved": "wrong",
            "not visited": "unattempted"
          };

          const userAnswerEntry = submittedAnswers.find(
            answer => answer.questionId === question.id
          );
          const userAnswer = userAnswerEntry ? userAnswerEntry.userAnswer : "Not Attempted"; // User's answer
          const correctAnswer = question.correctAnswer || "Not Provided"; // Correct answer

          return {
            ...question,
            status: statusMapping[normalizedStatus] || normalizedStatus,
            userAnswer,
            correctAnswer,
          };
        });

        setQuestions(questionsWithStatus);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedTest, userId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'correct': return 'bg-green-900 text-green-100';
      case 'wrong': return 'bg-red-900 text-red-100';
      case 'marked': return 'bg-yellow-900 text-yellow-100';
      default: return 'bg-gray-700 text-gray-100';
    }
  };

  const filteredQuestions = questions.filter(question => {
    switch (selectedStatus) {
      case 'all': return true;
      case 'correct': return question.status === 'correct';
      case 'wrong': return question.status === 'wrong';
      case 'unattempted': return question.status === 'unattempted';
      default: return true;
    }
  });

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Test:</label>
              <select
                className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-gray-100 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedTest}
                onChange={e => setSelectedTest(e.target.value)}
              >
                <option value="">Choose a test</option>
                {Array.from({ length: 30 }, (_, i) => (
                  <option key={i + 1} value={`test${i + 1}`}>Test {i + 1}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Status:</label>
              <select
                className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-gray-100 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Questions</option>
                <option value="correct">Correct Solved</option>
                <option value="wrong">Wrong Solved</option>
                <option value="unattempted">Not Visited</option>
              </select>
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          )}

          {!isLoading && !testAttempted && (
            <div className="text-center py-8 text-gray-400">
              You haven't attempted this test yet.
            </div>
          )}

          {!isLoading && testAttempted && questions.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No questions found for the selected test.
            </div>
          )}

          {!isLoading && filteredQuestions.length === 0 && questions.length > 0 && (
            <div className="text-center py-8 text-gray-400">
              No questions match the selected status.
            </div>
          )}

          <div className="space-y-4">
            {filteredQuestions.map((question, i) => (
              <div
                key={question.id}
                className="border border-gray-700 rounded-lg bg-gray-800 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-700 bg-gray-800 flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(question.status)}`}>
                    {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                  </span>
                  <button
                    onClick={() => setExpandedQuestions(prev => ({
                      ...prev,
                      [question.id]: !prev[question.id]
                    }))}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    {expandedQuestions[question.id] ? 'Hide Solution' : 'Show Solution'}
                  </button>
                </div>

                <div className="p-4">
                  <MathJax dynamic key={`question-${i}`}>
                    <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: question.question }} />
                  </MathJax>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-300">Your Answer:</p>
                  <MathJax dynamic key={`user-answer-${i}`}>
                    <div className="text-sm text-gray-400">
                      {question.userAnswer.includes("\\") 
                        ? `\\(${question.userAnswer}\\)` 
                        : `\\text{${question.userAnswer}}`}
                    </div>
                  </MathJax>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-300">Correct Answer:</p>
                  <MathJax dynamic key={`correct-answer-${i}`}>
                    <div className="text-sm text-gray-400">
                      {question.correctAnswer.includes("\\") 
                        ? `\\(${question.correctAnswer}\\)` 
                        : `\\text{${question.correctAnswer}}`}
                    </div>
                  </MathJax>
                </div>

                {expandedQuestions[question.id] && (
                  <div className="p-4 bg-gray-800 border-t border-gray-700">
                    <div className="text-sm font-medium text-gray-300 mb-2">Solution:</div>
                    <MathJax dynamic key={`solution-${i}`}>
                      <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: question.solutionText }} />
                    </MathJax>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </MathJaxContext>
  );
};

export default NotebookPage;
