import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MathJax, MathJaxContext } from "better-react-mathjax";
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
  const [questions, setQuestions] = useState([]);
  const { testIdcet } = useParams();
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedQuestions, setMarkedQuestions] = useState({});
  const [remainingTime, setRemainingTime] = useState(3600);
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [visitedQuestions, setVisitedQuestions] = useState([0]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [testIdcet]);

  useEffect(() => {
    if (testIdcet) {
      const filteredQuestions = questionsData.filter(
        (question) => question.testIdcet === parseInt(testIdcet, 10)
      );
      setQuestions(filteredQuestions);
    }
  }, [testIdcet]);

  const filteredQuestions = questions.filter((q) => {
    if (selectedSubject === "Physics") return q.id >= 1 && q.id <= 50;
    if (selectedSubject === "Chemistry") return q.id >= 51 && q.id <= 100;
    if (selectedSubject === "Mathematics") return q.id >= 101 && q.id <= 150;
    return false;
  });

  useEffect(() => {
    setRemainingTime(180 * 60);
    const timer = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          handleSubmit();
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
    const currentQuestion = questions[currentQuestionIndex];
    if (!selectedAnswers[currentQuestion?.id]) {
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

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleMarkForReview = () => {
    const currentQuestion = questions[currentQuestionIndex];
    setMarkedQuestions((prev) => ({
      ...prev,
      [currentQuestion.id]: true,
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleClearResponse = () => {
    const currentQuestion = questions[currentQuestionIndex];
    setSelectedAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion.id];
      return newAnswers;
    });
  };

  const handleSubmitConfirmation = () => {
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(selectedAnswers).length;
    const correctAnswers = questions.filter(
      (q) => selectedAnswers[q.id] === q.correctAnswer
    ).length;

    const resultData = {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      unansweredQuestions: totalQuestions - answeredQuestions,
      markedQuestions: Object.keys(markedQuestions).length,
      submittedAnswers,
    };

    if (window.confirm("Are you sure you want to submit your answers?")) {
      navigate("/result", { state: resultData });
    }
  };

  const handleQuestionView = (index) => {
    setCurrentQuestionIndex(index);
    if (!visitedQuestions.includes(index)) {
      setVisitedQuestions([...visitedQuestions, index]);
    }
  };

  const getQuestionStatus = (index) => {
    const question = questions[index];
    const isAnswered = selectedAnswers[question.id];
    const isVisited = visitedQuestions.includes(index);
    const isMarked = markedQuestions[question.id];

    if (isAnswered && isMarked) return "purple-dot";
    if (!isAnswered && isMarked) return "purple";
    if (isAnswered) return "green";
    if (isVisited) return "red";
    return "gray";
  };

  if (loading) {
    return <Typography variant="h6">Loading questions...</Typography>;
  }

  if (!questions.length) {
    return <Typography variant="h6">No questions found for this test.</Typography>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <MathJaxContext>
      <AppBar position="static" sx={{ bgcolor: "#113671" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6">MHT-CET TEST</Typography>
          <Typography variant="body2" color="white">
            Time Remaining: {formatTime(remainingTime)}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, bgcolor: "#e9eaec", display: "flex", gap: 2 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          {["Physics", "Chemistry", "Mathematics"].map((subject) => (
            <Button
              key={subject}
              variant="contained"
              sx={{
                bgcolor: "white",
                color: "green",
                border: "1px solid green",
                "&:hover": { bgcolor: "#f0f0f0" },
                marginLeft :{xs:"-3.5px"},
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
          <Paper elevation={3} sx={{ p: 2, height: "100%", overflowY: "auto" }}>
            <Typography variant="h6" gutterBottom>
              Question {currentQuestionIndex + 1} of 150
            </Typography>

            <Box sx={{ mb: 3 }}>
              <MathJax>
                <div dangerouslySetInnerHTML={{ __html: currentQuestion.question }} />
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
                onChange={(e) => handleOptionSelect(currentQuestion.id, e.target.value)}
              >
                {currentQuestion.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio sx={{ "&.Mui-checked": { color: "#18b111" } }} />}
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

            <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" , width: { xs: "100%", sm: "auto" }, marginTop:{md:"180px"}}}>
              <Button
                variant="contained"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                sx={{ bgcolor: "#18b111" , width: { xs: "45%", sm: "auto" } }}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveAndNext}
                sx={{ bgcolor: "#18b111" , width: { xs: "45%", sm: "auto" } }}
              >
                Save & Next
              </Button>
              <Button
                variant="contained"
                onClick={handleMarkForReview}
                sx={{ bgcolor: "#f5913c" , width: { xs: "45%", sm: "auto" } }}
              >
                Mark for Review
              </Button>
              <Button
                variant="contained"
                onClick={handleClearResponse}
                sx={{ bgcolor: "#dc3545" , width: { xs: "45%", sm: "auto" } }}
              >
                Clear Response
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmitConfirmation}
                sx={{ bgcolor: "#28a745" , width: { xs: "95%", sm: "auto" } }}
              >
                SUBMIT
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {Object.keys(selectedAnswers).length}/50 Answered
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 1 }}>
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
                <Box key={item.color} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: item.color, borderRadius: "50%" }} />
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