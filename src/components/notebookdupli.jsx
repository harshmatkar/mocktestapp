import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useUser } from "./UserContext.jsx";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import questionsData from "../assets/questions.json";

// MathJax configuration
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
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch questions and merge with Firestore statuses
  const fetchQuestions = async () => {
    if (!selectedTest || !userId) {
      console.warn("Either no test selected or userId is missing.");
      return;
    }
    setIsLoading(true);
    try {
      // Convert test string (e.g., "test1") to a number
      const testId = parseInt(selectedTest.replace(/test/gi, ""), 10);
      console.log("Processed testId (number):", testId, typeof testId);

      // 1. Filter questions from the JSON file based on the testId
      const testQuestions = questionsData.filter(q => q.testId === testId);
      console.log("Questions from JSON:", testQuestions);
      console.log("All JSON testIds:", [...new Set(questionsData.map(q => q.testId))]);

      // 2. Query Firestore for testResults with matching testId and userId.
      // Adjust the query depending on how testId is stored in Firestore.
      const qRef = query(
        collection(db, "testResults"),
        where("testId", "==", testId), // if Firestore stores testId as a number
        // where("testId", "==", String(testId)), // uncomment if stored as a string
        where("userId", "==", userId)
      );
      console.log("Firestore query:", qRef);

      const querySnapshot = await getDocs(qRef);
      console.log(
        "Firestore documents found:",
        querySnapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }))
      );

      // 3. Aggregate all question statuses from the fetched Firestore documents.
      const allStatuses = querySnapshot.docs.flatMap(doc => doc.data().questionStatuses || []);
      console.log("Aggregated statuses:", allStatuses);

      // 4. Merge each test question with its status (defaulting to "unattempted" if none is found)
      const questionsWithStatus = testQuestions.map(question => {
        const statusEntry = allStatuses.find(s =>
          s.questionId.toString() === question.id.toString()
        );
        return {
          ...question,
          status: statusEntry ? statusEntry.status.toLowerCase() : "unattempted",
          _debug: {
            jsonIdType: typeof question.id,
            firestoreIdType: statusEntry ? typeof statusEntry.questionId : "none"
          }
        };
      });
      console.log("Final questions with debug info:", questionsWithStatus);
      setQuestions(questionsWithStatus);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch questions whenever the selected test or userId changes.
  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTest, userId]);

  // Helper function to get a color class based on question status.
  const getStatusColor = (status) => {
    switch (status) {
      case "correct":
        return "bg-green-100 text-green-800";
      case "wrong":
        return "bg-red-100 text-red-800";
      case "marked":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter questions based on the selected status.
  const filteredQuestions = questions.filter(question => {
    if (selectedStatus === "all") return true;
    if (selectedStatus === "correct") return question.status === "correct";
    if (selectedStatus === "wrong") return question.status === "wrong";
    if (selectedStatus === "unattempted") return question.status === "unattempted";
    return true;
  });

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Dropdowns for selecting test and filtering by status */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Test:</label>
            <select
              className="w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status:</label>
            <select
              className="w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
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

        {/* Loading Spinner */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}

        {/* Message for no questions found */}
        {!isLoading && questions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No questions found for the selected test.
          </div>
        )}

        {/* Message for no questions matching the status filter */}
        {!isLoading && filteredQuestions.length === 0 && questions.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            No questions match the selected status.
          </div>
        )}

        {/* Render Questions */}
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <div key={question.id} className="border rounded-lg shadow-sm bg-white overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(question.status)}`}>
                  {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                </span>
              </div>

              <div className="p-4">
                <MathJax>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: question.question }}
                  />
                </MathJax>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MathJaxContext>
  );
};

export default NotebookPage;
