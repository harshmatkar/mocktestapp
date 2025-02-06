import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useUser } from "./UserContext.jsx";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import questionsData from "../assets/questionsCET.json";

const mathJaxConfig = {
  loader: { load: ["[tex]/html"] },
  tex: {
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    displayMath: [["$$", "$$"], ["\\[", "\\]"]],
    processEscapes: true,
    packages: { "[+]": ["html"] },
  },
};

const MHTCETNotebookPage = () => {
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
        collection(db, "resultTestcet"),
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
          const userAnswer = userAnswerEntry ? userAnswerEntry.userAnswer : "Not Attempted";
          const correctAnswer = question.correctAnswer || "Not Provided";

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

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <div className="container mx-auto p-4 max-w-4xl">
          <h1 className="text-2xl font-bold text-center mb-4">MHT-CET Notebook</h1>
          <NotebookFilters
            selectedTest={selectedTest}
            setSelectedTest={setSelectedTest}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
          />
          <NotebookContent 
            isLoading={isLoading} 
            testAttempted={testAttempted} 
            questions={questions} 
            expandedQuestions={expandedQuestions} 
            setExpandedQuestions={setExpandedQuestions} 
            selectedStatus={selectedStatus}
          />
        </div>
      </div>
    </MathJaxContext>
  );
};

export default MHTCETNotebookPage;
