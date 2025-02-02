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
  IconButton,
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

  const legendItems = [
    { color: 'gray', text: 'Not Visited' },
    { color: 'red', text: 'Not Answered' },
    { color: 'green', text: 'Answered' },
    { color: 'purple', text: 'Marked' },
    { color: 'purple', text: 'Answered & Marked', dot: true },
  ];
  
  const statusColors = {
    gray: { main: '#f5f5f5', dark: '#e0e0e0' }, // Light gray
    green: { main: '#4caf50', dark: '#388e3c' }, // Keep green
    purple: { main: '#9c27b0', dark: '#7b1fa2' },
    red: { main: '#f44336', dark: '#d32f2f' },
    'purple-dot': { main: '#9c27b0', dark: '#7b1fa2' }
  };
  
  

  //-------------------------------------------------------------------- Initial useEffect for loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [testId]);

  useEffect(() => {
      if (window.MathJax) {
        // Delay slightly to ensure DOM updates complete
        setTimeout(() => window.MathJax.typesetPromise(), 100);
      }
    }, [currentQuestionIndex]);

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
    <MathJaxContext config={mathJaxConfig}>
      <>
        {/* Header - Modified for mobile */}
        <AppBar position="static" color="white" elevation={1} sx={{ py: { xs: 1, sm: 0 } }}>
          <Toolbar sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'flex-start',
            gap: { xs: 1, sm: 0 },
            py: { xs: 1, sm: 0 }
          }}>
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              height: { xs: 40, sm: 80 },
              flexShrink: 0
            }}>
              <img
                src={logo}
                alt="NTA Logo"
                style={{ height: '100%', marginRight: 8 }}
              />
              <Typography variant="h6" sx={{ 
                fontWeight: "bold", 
                fontSize: { xs: '0.9rem', sm: '1.25rem' },
                lineHeight: 1.2
              }}>
                RATIONAL TESTING AGENCY
                <br />
                <span style={{
                  backgroundColor: "green",
                  color: "white",
                  fontStyle: "italic",
                  fontSize: { xs: '0.6rem', sm: '0.8rem' }
                }}>
                  Excellence in assessment.
                </span>
              </Typography>
            </Box>

            <Box sx={{ 
              textAlign: { xs: 'left', sm: 'right' },
              flexGrow: 1,
              ml: { xs: 0, sm: 2 }
            }}>
              <Typography variant="subtitle1" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                Candidate: Harsh Matkar
              </Typography>
              <Typography variant="subtitle2" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                Exam: JEE ADVANCE
              </Typography>
              <Typography
                variant="body2"
                color={remainingTime <= 600 ? "error" : "textSecondary"}
                sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
              >
                Time Remaining: {formatTime(remainingTime)}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Subheader - Modified for mobile */}
        <Box sx={{
          p: { xs: 1, sm: 2 },
          backgroundColor: "orange",
          display: "flex",
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 1,
        }}>
          <Typography sx={{ 
            fontWeight: "bold", 
            color: "white", 
            fontSize: { xs: '1.2rem', sm: '2rem' },
            textAlign: 'center'
          }}>
            JEE MAIN
          </Typography>

          <Box sx={{ 
            display: "flex", 
            gap: 1, 
            flexWrap: 'wrap', 
            justifyContent: 'center',
            order: { xs: 2, sm: 0 }
          }}>
            {/* Subject buttons */}
            {["Physics", "Chemistry", "Mathematics"].map((subject) => (
              <Button
                key={subject}
                variant="contained"
                sx={{ 
                  backgroundColor: "#1e6ead",
                  borderRadius: 0,
                  fontSize: { xs: '0.6rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 },
                  py: { xs: 0.5, sm: 1 }
                }}
                onClick={() => handleSubjectClick(subject)}
              >
                {subject}
              </Button>
            ))}
          </Box>

          <MUIFormControl
            variant="outlined"
            sx={{
              width: { xs: '100%', sm: '300px' },
              order: { xs: 1, sm: 0 },
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                height: '40px',
              },
            }}
          >
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
            >
              <MenuItem value="english" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                English
              </MenuItem>
              <MenuItem value="hindi" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                Hindi
              </MenuItem>
              <MenuItem value="marathi" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                Marathi
              </MenuItem>
            </Select>
          </MUIFormControl>
        </Box>

        {/* Main Content - Modified grid layout */}
        <Grid container spacing={2} sx={{ p: { xs: 1, sm: 2 }, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
          {/* Left Section - Question Area */}
          <Grid item xs={12} md={9} sx={{ 
  order: { xs: 2, sm: 0 },
  position: 'relative',
  pb: { md: 8 } // Add padding for fixed navigation
}}>
          <Paper elevation={3} sx={{ 
    p: { xs: 1, sm: 2 },
    position: 'relative',
    mb: { xs: 2, md: 0 } 
  }}>
              {/* Question Content */}
              <Box sx={{
                mb: 2,
                p: 1,
                minHeight: "40vh",
                maxHeight: { xs: '50vh', sm: '60vh' },
                overflowY: "auto",
                fontSize: { xs: '0.9rem', sm: '1rem' },
                '& .MathJax': { fontSize: '0.9rem !important' } // Scale down equations
              }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  Question {currentQuestionIndex + 1}
                </Typography>
                <MathJax dynamic key={currentQuestionIndex}>
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
              </Box>

              <Box sx={{ 
      display: { xs: 'none', md: 'block' }, // Only show on desktop
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      bgcolor: 'background.paper',
      borderTop: '1px solid',
      borderColor: 'divider',
      py: 1,
      px: 2,
      boxShadow: 3
    }}>
      <Box sx={{
        display: 'flex',
        gap: 2,
        justifyContent: 'center',
        maxWidth: 1200,
        margin: '0 auto',
        '& button': {
          width: '140px',
          fontSize: '0.9rem',
          py: 1.5,
          borderRadius: '4px',
          boxShadow: 1,
          '&:hover': {
            boxShadow: 3,
            transform: 'translateY(-1px)'
          }
        }
      }}>
        <Button onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} 
                disabled={currentQuestionIndex === 0}
                variant="contained" 
                color="primary">
          Previous
        </Button>
        <Button onClick={handleSaveAndNext} 
                variant="contained" 
                color="primary">
          Save & Next
        </Button>
        <Button onClick={handleMarkForReview}
            variant="contained"
            color="secondary">
      Mark Review
    </Button>

    <Button onClick={handleClearResponse}
            variant="contained"
            color="error">
      Clear
    </Button>
        <Button onClick={handleSubmitConfirmation} 
                variant="contained" 
                color="success">
          Submit Test
        </Button>
      </Box>
    </Box>
    <Box sx={{ 
      display: { xs: 'block', md: 'none' }, // Only show on mobile
      position: 'sticky',
      bottom: 0,
      bgcolor: 'background.paper',
      py: 1,
      borderTop: '1px solid',
      borderColor: 'divider'
    }}>
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        justifyContent: 'center',
        '& button': {
          flex: '1 1 45%',
          fontSize: '0.7rem',
          py: 0.5,
          px: 1,
          minWidth: 'unset',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }
      }}>
        <Button onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                variant="contained"
                color="primary"
                size="small">
          Previous
        </Button>
        <Button onClick={handleSaveAndNext}
                variant="contained"
                color="primary"
                size="small">
          Save & Next
        </Button>
        <Button onClick={handleMarkForReview}
                variant="contained"
                color="secondary"
                size="small">
          Review
        </Button>
        <Button onClick={handleClearResponse}
                variant="contained"
                color="error"
                size="small">
          Clear
        </Button>
        <Button onClick={handleSubmitConfirmation}
                variant="contained"
                color="success"
                size="small"
                sx={{ flex: '1 1 100%' }}>
          Submit Test
        </Button>
      </Box>
    </Box>
            </Paper>
          </Grid>

          {/* Right Section - Question Navigation */}
          <Grid item xs={12} md={3} sx={{ order: { xs: 1, sm: 0 } }}>
            <Paper elevation={3} sx={{ p: 1, height: { xs: 'auto', sm: '70vh' }, overflowY: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton onClick={() => setIsPalletOpen(!isPalletOpen)} size="small">
                  {isPalletOpen ? <ChevronRight /> : <ChevronLeft />}
                </IconButton>
              </Box>

              {isPalletOpen && (
                <>
                  {/* Legend - Modified for mobile */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: 1, 
                    mb: 2,
                    fontSize: '0.7rem'
                  }}>
                    {legendItems.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: item.color,
                          position: 'relative'
                        }}>
                          {item.dot && (
                            <Box sx={{
                              position: 'absolute',
                              bottom: -2,
                              right: -2,
                              width: 8,
                              height: 8,
                              bgcolor: 'warning.main',
                              borderRadius: '50%'
                            }} />
                          )}
                        </Box>
                        <Typography variant="caption">{item.text}</Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Question buttons - Modified grid for mobile */}
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 1,
                    '@media (min-width: 400px)': {
                      gridTemplateColumns: 'repeat(7, 1fr)'
                    }
                  }}>
                    {questions.map((_, index) => {
                      const status = getQuestionStatus(index);
                      return (
                        <Button
  key={index}
  onClick={() => handleQuestionView(index)}
  variant="contained"
  sx={{
    minWidth: 32,
    height: 32,
    p: 0,
    fontSize: '0.75rem',
    bgcolor: theme => {
      if (currentQuestionIndex === index) return '#f0f0f0'; // Current question
      return `${statusColors[status]?.main || '#f5f5f5'}` // Default light gray
    },
    color: theme => {
      if (currentQuestionIndex === index) return 'black';
      return status === 'gray' ? 'black' : 'white'
    },
    border: theme => currentQuestionIndex === index ? '2px solid #1976d2' : 'none',
    '&:hover': { 
      bgcolor: `${statusColors[status]?.dark || '#e0e0e0'}`,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
    },
    transition: 'all 0.2s ease',
  }}
>
                          {index + 1}
                          {status === 'purple-dot' && (
                            <Box sx={{
                              position: 'absolute',
                              bottom: 2,
                              right: 2,
                              width: 6,
                              height: 6,
                              bgcolor: 'warning.main',
                              borderRadius: '50%'
                            }} />
                          )}
                        </Button>
                      );
                    })}
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </>
    </MathJaxContext>
  );
};

export default TestPage;
