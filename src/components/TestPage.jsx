import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import questionsData from "../assets/questions.json";
import "katex/dist/katex.min.css";
import { ArrowForward, ArrowBack } from "@mui/icons-material"; 
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { useUser } from './UserContext';
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  Select,
  MenuItem,
  FormControl as MUIFormControl,
} from "@mui/material";

import logo from "../assets/nta-logo.png";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { auth, db } from '../firebaseConfig';

//--------------------------------------------------------------------- This are imports

// MathJax configuration for MathJax v3 via better-react-mathjax
const mathJaxConfig = {
  loader: { load: ["[tex]/html"] },
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    packages: { "[+]": ["html"] } // Load the html package to help with line breaks etc.
  },
  options: {
    skipHtmlTags: ["script", "noscript", "style", "textarea", "pre"]
  }
};

const TestPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedQuestions, setMarkedQuestions] = useState({});
  const [remainingTime, setRemainingTime] = useState(3600); // initial time in seconds
  const [language, setLanguage] = useState("english");
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState([]); // initial value set to empty
  const [open, setOpen] = useState(true); 
  const [integerAnswers, setIntegerAnswers] = useState({});  // initial value set to empty
  const [submissionError, setSubmissionError] = useState(null);
  const { testId } = useParams();  // To extract test id
  const { userId } = useUser();
  const [isPalletOpen, setIsPalletOpen] = useState(true);  // Renamed from 'open' for clarity

  //-------------------------------------------------------------------- Initial useEffect for loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [testId]);

  //-------------------------------------------------------------------- Filter questions based on testId
  useEffect(() => {
    if (testId) {
      const filteredQuestions = questionsData.filter(
        (question) => question.testId === parseInt(testId, 10)
      );
      setQuestions(filteredQuestions);
    }
  }, [testId]);
  
  //-------------------------------------------------------------------- Timer setup (180 minutes)
  useEffect(() => {
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
  }, [testId]);

  useEffect(() => {
    if (window.MathJax) {
      // Delay slightly to ensure DOM updates complete
      setTimeout(() => MathJax.typesetPromise(), 100);
    }
  }, [currentQuestionIndex]);

  //-------------------------------------------------------------------- Ensure MathJax processes new content when component updates
  //-------------------------------------------------------------------- Format seconds into HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  //-------------------------------------------------------------------- Identify integer-only questions based on index
  const isIntegerQuestion = (index) => {
    const questionNum = index + 1;
    return (
      (questionNum >= 21 && questionNum <= 25) ||
      (questionNum >= 46 && questionNum <= 50) ||
      (questionNum >= 71 && questionNum <= 75)
    );
  };

  //-------------------------------------------------------------------- Component to render integer-answer questions with a numpad
  const QuestionAnswerSection = ({ question, index }) => {
    const [localValue, setLocalValue] = useState(selectedAnswers[question.id]?.toString() || '');

    // Sync local state when question changes
    useEffect(() => {
      setLocalValue(selectedAnswers[question.id]?.toString() || '');
    }, [question.id]);

    const handleNumpadInput = (num) => {
      let newValue;
      if (num === '±') {
        newValue = localValue.startsWith('-') 
          ? localValue.slice(1) 
          : `-${localValue}`;
      } else {
        newValue = localValue + num.toString();
      }

      // Validate numerical constraints
      if (Math.abs(parseInt(newValue) || 0) <= 99999) {
        setLocalValue(newValue);
        handleOptionSelect(question.id, newValue, true);
      }
    };

    const handleBackspace = () => {
      const newValue = localValue.slice(0, -1);
      setLocalValue(newValue);
      handleOptionSelect(question.id, newValue, true);
    };

    const handleClear = () => {
      setLocalValue('');
      handleOptionSelect(question.id, '', true);
    };

    return (
      <Box sx={{ mt: 3, display: 'flex', alignItems: 'flex-start' }}>
        <TextField
          type="number"
          value={localValue}
          InputProps={{
            inputProps: { 
              min: -99999, 
              max: 99999,
              step: 1,
              pattern: "\\d*",
              readOnly: true // Using numpad, so keep it read-only
            },
            endAdornment: (
              <InputAdornment position="end">
                <Typography variant="caption" color="textSecondary">
                  Integer only
                </Typography>
              </InputAdornment>
            )
          }}
          sx={{ width: '200px' }}
        />
        <Numpad
          onInput={handleNumpadInput}
          onBackspace={handleBackspace}
          onClear={handleClear}
        />
      </Box>
    );
  };

  //-------------------------------------------------------------------- Numpad component
  const Numpad = ({ onInput, onBackspace, onClear }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, ml: 2, width: '200px' }}>
      {[7, 8, 9, 4, 5, 6, 1, 2, 3, '±', 0].map((num) => (
        <Button key={num} variant="outlined" onClick={() => onInput(num)} sx={{ minWidth: 0 }}>
          {num}
        </Button>
      ))}

      <Button
        variant="outlined"
        color="error"
        onClick={onBackspace}
        sx={{ gridColumn: '1 / 3' }}
      >
        ⌫
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={onClear}
      >
        C
      </Button>
    </Box>
  );

  //-------------------------------------------------------------------- Option select handler
  const handleOptionSelect = (questionId, value, isInteger = false) => {
    if (isInteger) {
      const numValue = value === '' ? '' : parseInt(value);
      
      setIntegerAnswers(prev => ({
        ...prev,
        [questionId]: numValue
      }));
      
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: value.toString()
      }));
    } else {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: value
      }));
    }
  };

  //-------------------------------------------------------------------- Save and Next button handler
  const handleSaveAndNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!selectedAnswers[currentQuestion?.id]) {
      alert("Please select an option before proceeding.");
      return;
    }
    if (currentQuestion.id) {
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: selectedAnswers[currentQuestion.id],
      }));

      // Add to submitted answers
      setSubmittedAnswers((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          userAnswer: selectedAnswers[currentQuestion.id],
        },
      ]);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  //-------------------------------------------------------------------- Mark for Review handler
  const handleMarkForReview = () => {
    const currentQuestion = questions[currentQuestionIndex];
    setMarkedQuestions((prev) => ({
      ...prev,
      [currentQuestion.id]: true,
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      alert("You have reached the last question.");
    }
  };

  //-------------------------------------------------------------------- Next button handler
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Update visited questions for the next question
      if (!visitedQuestions.includes(currentQuestionIndex + 1)) {
        setVisitedQuestions([...visitedQuestions, currentQuestionIndex]);
      }
      // Move to next question
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      alert("You have reached the last question.");
    }
  };

  //-------------------------------------------------------------------- Clear Response handler
  const handleClearResponse = () => {
    const currentQuestion = questions[currentQuestionIndex];
    setSelectedAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion.id];
      return newAnswers;
    });
  };

  //-------------------------------------------------------------------- Subject navigation handler
  const handleSubjectClick = (subject) => {
    const firstQuestionIndex = questions.findIndex((q) => q.subject === subject);
    if (firstQuestionIndex !== -1) {
      setCurrentQuestionIndex(firstQuestionIndex);
    } else {
      console.log(`No questions available for ${subject}`);
    }
  };

  //-------------------------------------------------------------------- Submit Confirmation handler
  const handleSubmitConfirmation = async () => {  
    if (!userId) {
      console.error("Error: User ID is missing!");
      return;
    }
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(selectedAnswers).length;
    const correctAnswers = questions.filter(
      (q) => selectedAnswers[q.id] === q.correctAnswer
    ).length;

    const wrongQuestions = questions.filter(q => 
      selectedAnswers[q.id] && 
      selectedAnswers[q.id] !== q.correctAnswer
    ).map(q => {
      // Validate all required fields
      if (!q.id || !q.question || !q.correctAnswer) {
        console.error('Invalid question format:', q);
        return null;
      }
      return {
        questionId: String(q.id),
        questionText: q.question,
        userAnswer: selectedAnswers[q.id],
        correctAnswer: q.correctAnswer
      };
    }).filter(q => q !== null); // Remove null entries

    try {
      // Save test results to backend
      const docRef = await addDoc(collection(db, "testResults"), {
        userId: userId,
        testId: testId,
        marksObtained: correctAnswers,
        totalMarks: totalQuestions,
        wrongQuestions: wrongQuestions,
        timestamp: new Date(),
        durationUsed: 3600 - remainingTime,
        selectedAnswers: selectedAnswers,
        submittedAnswers: submittedAnswers,
        markedQuestions: Object.keys(markedQuestions),
      });

      console.log("Document written with ID: ", docRef.id);
      navigate(`/results/${testId}`);
    } catch (error) {
      console.error('Error adding document: ', error);
      setSubmissionError('Failed to save results. Please try again.');
    }

    const resultData = {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      unansweredQuestions: totalQuestions - answeredQuestions,
      markedQuestions: Object.keys(markedQuestions).length,
      submittedAnswers,
    };
    setTestResults(resultData);
  };

  //-------------------------------------------------------------------- Visited questions and status handling
  const [visitedQuestions, setVisitedQuestions] = useState([0]);

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
    const isMarkedForReview = markedQuestions[question.id];
  
    if (isAnswered && isMarkedForReview) return "purple-dot";
    if (!isAnswered && isMarkedForReview) return "purple";
    if (isAnswered) return "green";
    if (isVisited && !isAnswered) return "red";
    return "gray";
  };

  //-------------------------------------------------------------------- Loading states
  if (loading) {
    return (
      <Typography variant="h6" align="center">
        Loading questions...
      </Typography>
    );
  }

  if (questions.length === 0) {
    return (
      <Typography variant="h6" align="center">
        No questions found for this test.
      </Typography>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    // Wrap everything with MathJaxContext using our config
    <MathJaxContext config={mathJaxConfig}>
      <>
        {/* Header */}
        <AppBar position="static" color="white" elevation={1}>
          <Toolbar
            sx={{
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              py: 1,
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", height: { xs: 60, sm: 80 } }}>
              <img
                src={logo}
                alt="NTA Logo"
                style={{ height: '100%', marginRight: 10 }}
              />
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                RATIONAL TESTING AGENCY
                <br />
                <span
                  style={{
                    backgroundColor: "green",
                    color: "white",
                    fontStyle: "italic",
                    fontSize: '0.8rem'
                  }}
                >
                  Excellence in assessment.
                </span>
              </Typography>
            </Box>

            <Box sx={{ textAlign: { xs: 'center', sm: 'right' }, mt: { xs: 1, sm: 0 } }}>
              <Typography variant="subtitle1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Candidate: Harsh Matkar
              </Typography>
              <Typography variant="subtitle2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Exam: JEE ADVANCE
              </Typography>
              <Typography
                variant="body2"
                color={remainingTime <= 600 ? "error" : "textSecondary"}
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                Time Remaining: {formatTime(remainingTime)}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Subheader */}
        <Box
          sx={{
            p: 2,
            backgroundColor: "orange",
            display: "flex",
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography sx={{ fontWeight: "bold", color: "white", fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            JEE MAIN
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#1e6ead", borderRadius: 0, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              onClick={() => handleSubjectClick("Physics")}
            >
              Physics
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#1e6ead", borderRadius: 0, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              onClick={() => handleSubjectClick("Chemistry")}
            >
              Chemistry
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#1e6ead", borderRadius: 0, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              onClick={() => handleSubjectClick("Mathematics")}
            >
              Mathematics
            </Button>
          </Box>

          <MUIFormControl
            variant="outlined"
            sx={{
              width: { xs: '100%', sm: '300px' },
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                height: '40px',
              },
            }}
          >
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              label="Paper Language"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              <MenuItem value="english" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                English
              </MenuItem>
              <MenuItem value="hindi" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Hindi
              </MenuItem>
              <MenuItem value="marathi" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Marathi
              </MenuItem>
            </Select>
          </MUIFormControl>
        </Box>

        {/* Main Content */}
        <Grid container spacing={2} sx={{ p: 2 }}>
          {/* Left Section - Question Area */}
          <Grid item xs={12} md={9}>
            <Paper elevation={3} sx={{ p: 2, position: 'relative' }}>
              {/* Question Header */}
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Question {currentQuestionIndex + 1}
              </Typography>

              {/* Question Content */}
              <Box
                sx={{
                  mb: 3,
                  backgroundColor: "#fff",
                  p: 2,
                  borderRadius: 1,
                  minHeight: "70px",
                  maxHeight: { xs: '40vh', sm: '30vh' },
                  overflowY: "auto",
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  whiteSpace: "pre-wrap" // This ensures newlines in JSON are rendered properly
                }}
              >
                <MathJax dynamic key = {currentQuestionIndex}>
                  <div dangerouslySetInnerHTML={{ __html: `${currentQuestion.question}` }} />
                </MathJax>
                {currentQuestion.image && (
                  <Box
                    component="img"
                    src={currentQuestion.image}
                    alt="Question related image"
                    sx={{ mt: 2, maxWidth: "100%", maxHeight: "20vh", objectFit: "contain" }}
                  />
                )}
              </Box>

              {/* Options or Integer Input */}
              {!isIntegerQuestion(currentQuestionIndex) ? (
                <FormControl component="fieldset" sx={{ width: "100%" }}>
                  <RadioGroup
                    value={selectedAnswers[currentQuestion.id] || ""}
                    onChange={(e) => handleOptionSelect(currentQuestion.id, e.target.value)}
                  >
                    {currentQuestion.options.map((option, i) => (
                      <FormControlLabel
                        key={i}
                        value={option}
                        control={<Radio sx={{ "&.Mui-checked": { color: "#18b111" } }} />}
                        label={
                          <Box sx={{ p: 1, "&:hover": { backgroundColor: "#f8f8f8" } }}>
                            <MathJax dynamic key={`${currentQuestionIndex}-${i}`}>
                              {option.includes("\\")
                                ? `\\(${option}\\)`
                                : `\\text{${option}}`}
                            </MathJax>
                          </Box>
                        }
                        sx={{ margin: "8px 0", width: "100%" }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              ) : (
                <QuestionAnswerSection question={currentQuestion} index={currentQuestionIndex} />
              )}

              {/* Navigation Buttons */}
              <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t lg:static lg:shadow-none lg:border-t-0">
                  <div className="container mx-auto p-4 flex flex-wrap gap-2 justify-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={handleSaveAndNext}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Save & Next
                      </button>
                      <button
                        onClick={handleMarkForReview}
                        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                      >
                        Mark for Review
                      </button>
                      <button
                        onClick={handleClearResponse}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                        Clear
                      </button>
                      <button
                        onClick={handleNext}
                        className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-red-600 w-20"
                        >
                        Next
                      </button>
                    </div>
                    <button
                      onClick={handleSubmitConfirmation}
                      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                    >
                      SUBMIT
                    </button>
                  </div>
                </div>

            </Paper>
          </Grid>

          {/* Right Section - Question Navigation */}
          <Grid item xs={12} md={3}>
            {/* Question Navigation Buttons */}
            <Box
              sx={{
                height: { xs: 'auto', sm: '480px' },
                overflowY: "auto",
                backgroundColor: "white",
                p: 1,
                borderRadius: 1,
              }}
            >
             
             <button
                  onClick={() => setIsPalletOpen(!isPalletOpen)}
                  className="p-2 mb-4 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                >
                  {isPalletOpen ? (
                    <ChevronRight className="w-5 h-5" />
                  ) : (
                    <ChevronLeft className="w-5 h-5" />
                  )}
                </button>

                {isPalletOpen && (
                  <div className="space-y-4">
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { color: "bg-red-500", text: "Not Answered" },
                        { color: "bg-gray-400", text: "Not Visited" },
                        { color: "bg-green-500", text: "Answered" },
                        { color: "bg-purple-500", text: "Marked" },
                        { color: "bg-purple-500", text: "Ans & Marked", dot: true },
                      ].map((status, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${status.color} relative`}>
                            {status.dot && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-yellow-300 rounded-full" />
                            )}
                          </div>
                          <span className="text-xs">{status.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Question buttons */}
                    <div className="grid grid-cols-7 gap-1">
                      {questions.map((_, index) => {
                        const status = getQuestionStatus(index);
                        const baseStyles = "w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors";
                        const statusStyles = {
                          gray: "bg-gray-400 text-white",
                          green: "bg-green-500 text-white",
                          purple: "bg-purple-500 text-white",
                          red: "bg-red-500 text-white",
                          "purple-dot": "bg-purple-500 text-white relative"
                        };

                        return (
                          <button
                            key={index}
                            onClick={() => handleQuestionView(index)}
                            className={`${baseStyles} ${statusStyles[status]} ${
                              currentQuestionIndex === index ? "ring-2 ring-black" : ""
                            }`}
                          >
                            {index + 1}
                            {status === "purple-dot" && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-yellow-300 rounded-full" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              
            
            </Box>
          </Grid>
        </Grid>
      </>
    </MathJaxContext>
  );
};

export default TestPage;
