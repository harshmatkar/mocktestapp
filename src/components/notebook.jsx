import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useUser } from "./UserContext.jsx";
import { MathJax, MathJaxContext } from "better-react-mathjax";

const mathJaxConfig = {
  loader: { load: ["[tex]/html"] },
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    packages: { "[+]": ["html"] },
  },
  chtml: {
    scale: 1,
    linebreaks: { automatic: true },
  },
  options: {
    skipHtmlTags: ["script", "noscript", "style", "textarea", "pre"],
  },
};

const NotebookPage = () => {
  const { userId } = useUser();
  const [selectedTest, setSelectedTest] = useState("");
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [solutions, setSolutions] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  // We no longer need containerRef since MathJaxContext will handle re-typesetting.
  // const containerRef = useRef(null);

  // Fetch wrong questions from Firestore.
  const fetchWrongQuestions = async () => {
    if (!selectedTest || !userId) return;
    setIsLoading(true);
    try {
      const testIdValue = selectedTest.replace("test", "");
      const q = query(
        collection(db, "testResults"),
        where("testId", "==", testIdValue),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setWrongQuestions([]);
      } else {
        querySnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          setWrongQuestions(data.wrongQuestions || []);
        });
      }
    } catch (error) {
      console.error("Error fetching wrong questions:", error);
      setWrongQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch solutions from solution.json (assumed to be in public folder)
  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        const res = await fetch("/solution.json");
        if (!res.ok) throw new Error("Failed to load solution.json");
        const data = await res.json();
        setSolutions(data);
      } catch (error) {
        console.error("Error fetching solutions:", error);
      }
    };
    fetchSolutions();
  }, []);

  // Refetch questions when test or user changes.
  useEffect(() => {
    fetchWrongQuestions();
  }, [selectedTest, userId]);

  // Simple rendering function for math expressions.
  // If no math delimiters are found, wrap the text in \text{}
  const renderMathExpression = (text) => {
    if (!text) return "";
  
    // Split the content into segments that are either LaTeX (inside $...$) or text
    const segments = text.split(/(\$.*?\$)/g);
  
    return segments.map((segment) => {
      if (segment.startsWith('$') && segment.endsWith('$')) {
        // LaTeX content: remove $ delimiters and wrap in \(...\)
        const mathContent = segment.slice(1, -1);
        return `\\(${mathContent}\\)`;
      } else {
        // Text content: replace newlines with <br/> and escape HTML
        return segment
          .replace(/\n/g, '<br/>')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      }
    }).join('');
  };

  // Toggle the solution view for a question.
  const toggleSolution = (qid) => {
    setExpandedQuestions((prev) => ({ ...prev, [qid]: !prev[qid] }));
  };

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="container mx-auto p-4">
        {/* Test selector */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-800">
            Select Test:
          </label>
          <select
            value={selectedTest}
            onChange={(e) => {
              setSelectedTest(e.target.value);
              setExpandedQuestions({});
            }}
            className="p-2 border rounded w-64"
          >
            <option value="">Choose a test</option>
            {Array.from({ length: 30 }, (_, i) => (
              <option key={i + 1} value={`test${i + 1}`}>
                Test {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Loading state */}
        {isLoading && <p>Loading...</p>}

        {/* Questions container */}
        {selectedTest && !isLoading && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">
              Review Areas - Test {selectedTest.replace("test", "")}
            </h2>
            {wrongQuestions.length > 0 ? (
              wrongQuestions.map((question, index) => {
                const qid = question.id || index;
                return (
                  <div
                    key={qid}
                    className="border p-4 rounded mb-2 bg-white text-left"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">
                          Question {index + 1}:
                        </p>
                        {/* Wrap math content inside the MathJax component.
                            The inline style whiteSpace "pre-wrap" helps preserve line breaks. */}
                        <MathJax>
                          <div
                            className="text-gray-800 break-words"
                            style={{ whiteSpace: "pre-wrap" }}
                            dangerouslySetInnerHTML={{
                              __html: renderMathExpression(
                                question.questionText
                              ),
                            }}
                          />
                        </MathJax>
                      </div>
                      <button
                        onClick={() => toggleSolution(qid)}
                        className="ml-2 px-2 py-1 border rounded text-sm"
                      >
                        {expandedQuestions[qid]
                          ? "Hide Solution"
                          : "Show Solution"}
                      </button>
                    </div>
                    <div className="mt-2">
                      <p className="text-green-700">
                        <strong>Correct Answer: </strong>
                        <MathJax>
                          <span
                            className="break-words"
                            style={{ whiteSpace: "pre-wrap" }}
                            dangerouslySetInnerHTML={{
                              __html: renderMathExpression(
                                question.correctAnswer
                              ),
                            }}
                          />
                        </MathJax>
                      </p>
                      {question.userAnswer && (
                        <p className="text-yellow-600 mt-1">
                          <strong>Your Answer: </strong>
                          <MathJax>
                            <span
                              className="break-words"
                              style={{ whiteSpace: "pre-wrap" }}
                              dangerouslySetInnerHTML={{
                                __html: renderMathExpression(
                                  question.userAnswer
                                ),
                              }}
                            />
                          </MathJax>
                        </p>
                      )}
                    </div>
                    {expandedQuestions[qid] && (
                      <div className="mt-3 p-3 border-t overflow-x-auto">
                        {solutions[qid] ? (
                          <MathJax>
                            <div
                              className="break-words"
                              style={{ whiteSpace: "pre-wrap" }}
                              dangerouslySetInnerHTML={{
                                __html: renderMathExpression(solutions[qid]),
                              }}
                            />
                          </MathJax>
                        ) : (
                          <p className="text-gray-600">
                            No solution uploaded for this question.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-700">
                No review questions found for this test.
              </p>
            )}
          </div>
        )}
      </div>
    </MathJaxContext>
  );
};

export default NotebookPage;
