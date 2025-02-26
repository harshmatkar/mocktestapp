import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useUser } from "./UserContext"; // Import your UserContext
import questionsData from "../assets/questionscet.json";
import "katex/dist/katex.min.css";
import {
  Button,
  Paper,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Box,
  AppBar,
  Toolbar,
  Grid,
} from "@mui/material";

const TestPage = () => {
  const navigate = useNavigate();
  const { testIdcet } = useParams();
  const { userId } = useUser();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedQuestions, setMarkedQuestions] = useState({});
  const [remainingTime, setRemainingTime] = useState(3600);
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [visitedQuestions, setVisitedQuestions] = useState([]);

  // Check if the user already has a transaction.
  useEffect(() => {
    const checkExistingTransaction = async () => {
      console.log("userId:", userId);
      if (!userId) {
        console.log("No userId provided, skipping transaction check.");
        return;
      }
      console.log("Checking transactions for userId:", userId);

      const transactionsRef = collection(db, "transactions");
      const q = query(
        transactionsRef,
        where("userId", "==", userId),
        where("testTitle", "==", "MHT CET Mock Tests")
      );

      try {
        const querySnapshot = await getDocs(q);
        console.log(
          "Transaction query completed. Number of results:",
          querySnapshot.size
        );

        if (!querySnapshot.empty) {
          console.log("Existing transaction found, navigating to /dashboard");
          // Optionally, you can navigate if a transaction exists:
          // navigate("/dashboard");
        } else {
          console.log("No existing transactions found for this user.");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking existing transactions:", error);
      }
    };

    checkExistingTransaction();
  }, [userId, navigate]);

  // Simulate a short loading delay.
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [testIdcet]);

  // Load the full questions list for the test.
  useEffect(() => {
    if (testIdcet) {
      const filteredByTest = questionsData.filter(
        (question) => question.testIdcet === parseInt(testIdcet, 10)
      );
      setQuestions(filteredByTest);
    }
  }, [testIdcet]);

  // Create a filtered list of questions based on the selected subject.
  const filteredQuestions = questions.filter((q) => {
    if (selectedSubject === "Physics") return q.id >= 1 && q.id <= 50;
    if (selectedSubject === "Chemistry") return q.id >= 51 && q.id <= 100;
    if (selectedSubject === "Maths" || selectedSubject === "Mathematics")
      return q.id >= 101 && q.id <= 150;
    return false;
  });

  // When the subject changes, reset the current question and visited list.
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setVisitedQuestions([0]);
  }, [selectedSubject]);

  // Set up the countdown timer.
  useEffect(() => {
    // For example, each subject test is 180 minutes.
    setRemainingTime(180 * 60);
    const timer = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          handleSubmitConfirmation();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testIdcet]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOptionSelect = (questionId, value) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSaveAndNext = () => {
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    if (!selectedAnswers[currentQuestion.id]) {
      alert("Please select an option before proceeding.");
      return;
    }

    setSubmittedAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        userAnswer: selectedAnswers[currentQuestion.id],
      },
    ]);

    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleMarkForReview = () => {
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    setMarkedQuestions((prev) => ({
      ...prev,
      [currentQuestion.id]: true,
    }));

    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleClearResponse = () => {
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    setSelectedAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion.id];
      return newAnswers;
    });
  };

  const handleSubmitConfirmation = async () => {
    console.log("handleSubmitConfirmation called");
    console.log("testIdcet:", testIdcet);
    console.log("User ID:", userId);

    if (!userId) {
      alert("You need to be logged in to save results!");
      console.warn("User not logged in - Cannot save results");
      return;
    }

    // Calculate results based only on the filtered (subject) questions.
    const totalQuestions = filteredQuestions.length;
    const answeredQuestions = filteredQuestions.filter((q) => selectedAnswers[q.id])
      .length;
    const correctAnswers = filteredQuestions.filter(
      (q) => selectedAnswers[q.id] === q.correct
    ).length;

    const resultData = {
      testIdcet,
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      unansweredQuestions: totalQuestions - answeredQuestions,
      markedQuestions: Object.keys(markedQuestions).length,
      submittedAnswers,
      userId,
      timestamp: Timestamp.now(),
      subject: selectedSubject,
    };

    if (window.confirm("Are you sure you want to submit your answers?")) {
      try {
        const docRef = await addDoc(
          collection(db, "testResultcet"),
          resultData
        );
        console.log("Result stored successfully with ID: ", docRef.id);
        navigate(`/resultcet/${testIdcet}`);
      } catch (error) {
        console.error("Error storing result: ", error);
        alert(`Failed to save your test result: ${error.message}`);
      }
    } else {
      console.log("User cancelled submission.");
    }
  };

  const handleQuestionView = (index) => {
    setCurrentQuestionIndex(index);
    if (!visitedQuestions.includes(index)) {
      setVisitedQuestions([...visitedQuestions, index]);
    }
  };

  const getQuestionStatus = (index) => {
    const question = filteredQuestions[index];
    const isAnswered = selectedAnswers[question.id];
    const isVisited = visitedQuestions.includes(index);
    const isMarked = markedQuestions[question.id];

    if (isAnswered && isMarked) return "green";
    if (!isAnswered && isMarked) return "purple";
    if (isAnswered) return "green";
    if (isVisited) return "red";
    return "gray";
  };

  if (loading) {
    return <Typography variant="h6">Loading questions...</Typography>;
  }

  if (!filteredQuestions.length) {
    return (
      <Typography variant="h6">
        No questions found for this test and subject.
      </Typography>
    );
  }

  // Use the filteredQuestions array consistently.
  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const answeredCount = filteredQuestions.filter((q) => selectedAnswers[q.id])
    .length;

  return (
    <MathJaxContext>
      <AppBar position="static" sx={{ bgcolor: "#113671" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6">
            MHT-CET TEST - {selectedSubject}
          </Typography>
          <Typography variant="body2" color="white">
            Time Remaining: {formatTime(remainingTime)}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          p: 2,
          bgcolor: "#e9eaec",
          display: "flex",
          gap: 2,
          overflowX: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {["Physics", "Chemistry", "Maths"].map((subject) => (
            <Button
              key={subject}
              variant="contained"
              sx={{
                bgcolor:
                  selectedSubject === subject ? "#18b111" : "white",
                color: selectedSubject === subject ? "white" : "green",
                border: "1px solid green",
                "&:hover": { bgcolor: "#f0f0f0" },
              }}
              onClick={() => setSelectedSubject(subject)}
            >
              {subject}
            </Button>
          ))}
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ p: 2, height: "calc(100vh - 160px)" }}>
        <Grid item xs={12} md={9}>
          <Paper
            elevation={3}
            sx={{ p: 2, height: "100%", overflowY: "auto" }}
          >
            <Typography variant="h6" gutterBottom>
              Question {currentQuestion.id} of {filteredQuestions.length}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <MathJax>
                <div
                  dangerouslySetInnerHTML={{
                    __html: currentQuestion.question,
                  }}
                />
              </MathJax>
              {currentQuestion.image && (
                <img
                  src={currentQuestion.image}
                  alt="Question visual"
                  style={{ maxWidth: "100%" }}
                />
              )}
            </Box>

            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={selectedAnswers[currentQuestion.id] || ""}
                onChange={(e) =>
                  handleOptionSelect(currentQuestion.id, e.target.value)
                }
              >
                {currentQuestion.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={
                      <Radio
                        sx={{
                          "&.Mui-checked": { color: "#18b111" },
                        }}
                      />
                    }
                    label={
                      <Box sx={{ p: 1 }}>
                        <MathJax dynamic>{option}</MathJax>
                      </Box>
                    }
                    sx={{ my: 1 }}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Box
  sx={{
    mt: 3,
    display: "flex",
    gap: 2,
    marginLeft:{sm:3, xs:0},
    flexWrap: "wrap",
    width: { xs: "100%", sm: "auto" },
    position: { xs: "static", sm: "fixed" }, // Fixed only for sm and above
    bottom: { sm: 0 }, // Stick to bottom for sm devices
    left: { sm: 0 }, // Align to left
    width: { sm: "72%" }, // Full width for sm screens
    bgcolor: "white", // Optional: Background to avoid overlap issues
    p: 2, // Padding for better UI
    zIndex: 1000, // Ensures it stays above other elements
    boxShadow: { sm: "0 -2px 10px rgba(0,0,0,0.1)" }, // Optional shadow for better separation
  }}
>
  <Button
    variant="contained"
    disabled={currentQuestionIndex === 0}
    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
    sx={{
      bgcolor: "#18b111",
      width: { xs: "45%", sm: "auto" },
    }}
  >
    Previous
  </Button>
  <Button
    variant="contained"
    onClick={handleSaveAndNext}
    sx={{
      bgcolor: "#18b111",
      width: { xs: "45%", sm: "auto" },
    }}
  >
    Save
  </Button>
  <Button
    variant="contained"
    onClick={handleMarkForReview}
    sx={{
      bgcolor: "#f5913c",
      width: { xs: "45%", sm: "auto" },
    }}
  >
    Review
  </Button>
  <Button
    variant="contained"
    onClick={handleClearResponse}
    sx={{
      bgcolor: "#dc3545",
      width: { xs: "45%", sm: "auto" },
    }}
  >
    Clear
  </Button>
  <Button
    variant="contained"
    onClick={handleSubmitConfirmation}
    sx={{
      bgcolor: "#28a745",
      width: { xs: "95%", sm: "auto" },
    }}
  >
    SUBMIT
  </Button>
</Box>

          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {answeredCount}/{filteredQuestions.length} Answered
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: 1,
                }}
              >
                {filteredQuestions.map((question, index) => (
                  <Button
                    key={question.id}
                    variant="outlined"
                    size="small"
                    onClick={() => handleQuestionView(index)}
                    sx={{
                      minWidth: 32,
                      minHeight: 32,
                      bgcolor: {
                        green: "#82c47d",
                        red: "#ffebee",
                        purple: "#d380d0",
                        gray: "#eeeeee",
                      }[getQuestionStatus(index)],
                      borderColor: "#ddd",
                    }}
                  >
                    {question.id}
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ borderTop: 1, borderColor: "divider", pt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Legend:
              </Typography>
              {[
                { color: "#eeeeee", label: "Not visited" },
                { color: "#ffebee", label: "Not answered" },
                { color: "#e8f5e9", label: "Answered" },
                { color: "#f3e5f5", label: "Marked" },
              ].map((item) => (
                <Box
                  key={item.color}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: item.color,
                      borderRadius: "50%",
                    }}
                  />
                  <Typography variant="body2">{item.label}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </MathJaxContext>
  );
};

export default TestPage;
