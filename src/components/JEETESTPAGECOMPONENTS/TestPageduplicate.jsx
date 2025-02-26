import React, { useEffect, useState , useCallback} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import questionsData from "../../assets/questions.json";
import "katex/dist/katex.min.css";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { useUser } from '../UserContext';
import { ChevronLeft, ChevronRight , Menu} from "lucide-react";
import Header from "./Header";
import Subheader from "./Subheader";
import Cookies from 'js-cookie';
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { ArrowLeft, ArrowRight } from 'lucide-react';
import PreventNavigation from "./PreventNavigation";

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
  SwipeableDrawer,
  FormControl as MUIFormControl,
  Drawer,
} from "@mui/material";

import logo from "./nta-logo.png";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query,where, getDocs } from "firebase/firestore";
import { auth, db } from '../../firebaseConfig';
import { getAuth } from "firebase/auth";

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
  const [remainingTime, setRemainingTime] = useState(10800); // initial time in seconds
  const [language, setLanguage] = useState("english");
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState([]); // initial value set to empty
  const [open, setOpen] = useState(true); 
  const [integerAnswers, setIntegerAnswers] = useState({});  // initial value set to empty
  const [submissionError, setSubmissionError] = useState(null);
  const { testId } = useParams();  // To extract test id
  const { userId } = useUser();
  const {username} = useUser();
  const [isPalletOpen, setIsPalletOpen] = useState(true);  // Renamed from 'open' for clarity
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isVerifyingAccess, setIsVerifyingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const countdownCompleted = localStorage.getItem("countdownCompleted");
    const instructionsVisited = localStorage.getItem("instructionsVisited");
  
    if (countdownCompleted !== "true" || instructionsVisited !== "true") {
      navigate("/"); // Redirect if steps were skipped
    } else if (parseInt(testId, 10) > 5) {
      navigate("/dashboard"); // Redirect to dashboard if testId > 6
    } console.log("countdownCompleted:", countdownCompleted);
  console.log("instructionsVisited:", instructionsVisited);
  console.log("testId:", testId);
  }, [navigate, testId]);

  useEffect(() => {
    const savedState = localStorage.getItem(`testState-${testId}`);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (!isInitialized) { // Prevent resetting once initialized
          setSelectedAnswers(parsedState.selectedAnswers || {});
          setMarkedQuestions(parsedState.markedQuestions || {});
          setCurrentQuestionIndex(parsedState.currentIndex || 0);
          setRemainingTime(parsedState.timeRemaining || 3600);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Error parsing saved state:", error);
      }
    } else {
      setIsInitialized(true); // Ensure flag is set even if no saved state
    }
  }, [testId, isInitialized]); // ✅ Adding `isInitialized` prevents unnecessary resets

 

  

// Save state continuously
useEffect(() => {
  // Load saved state only once
  const storageKey = `testState-${userId}-${testId}`;
  const savedState = localStorage.getItem(storageKey);

  if (savedState) {
    const {
      selectedAnswers: savedAnswers,
      markedQuestions: savedMarked,
      currentIndex,
      timeRemaining
    } = JSON.parse(savedState);
    
    setSelectedAnswers(savedAnswers || {});
    setMarkedQuestions(savedMarked || {});
    setCurrentQuestionIndex(currentIndex || 0);
    setRemainingTime(timeRemaining || 3600);
  }
  setIsInitialized(true);
}, [testId, userId, isInitialized]);

// Separate effect to save changes after initialization
useEffect(() => {
  if (!isInitialized) return;

  const stateToSave = {
    selectedAnswers,
    markedQuestions,
    currentIndex: currentQuestionIndex,
    timeRemaining: remainingTime
  };
  
  const storageKey = `testState-${userId}-${testId}`;
  localStorage.setItem(storageKey, JSON.stringify(stateToSave));

},  [selectedAnswers, markedQuestions, currentQuestionIndex, remainingTime, testId, userId]);

  

  // useEffect(() => {
  //   const checkExistingTransaction = async () => {
  //     console.log("userId:", userId); 
  //     if (!userId) {
  //       console.log("No userId provided, skipping transaction check.");
  //       return;
  //     }
  //     console.log("userId:", userId);
  
  //     console.log("Checking transactions for userId:", userId);
  
  //     // Reference to the transactions collection
  //     const transactionsRef = collection(db, "transactions");
  //     const q = query(
  //       transactionsRef,
  //       where("userId", "==", userId),
  //       where("testTitle", "==", "JEE MAIN Mock Tests")
  //     );
  
  //     try {
  //       const querySnapshot = await getDocs(q);
  //       console.log("Transaction query completed. Number of results:", querySnapshot.size);
  
  //       if (!querySnapshot.empty) {
  //         console.log("Existing transaction found, navigating to /dashboard");
          
  //       } else {
  //         console.log("No existing transactions found for this user.");
  //         navigate("/dashboard");
  //       }
  //     } catch (error) {
  //       console.error("Error checking existing transactions:", error);
  //     }
  //   };
  
  //   checkExistingTransaction();
  // }, [userId, navigate]); // Dependency array 
   
  

  const legendItems = [
    { color: 'gray', text: 'Not Visited' },
    { color: 'red', text: 'Not Answered' },
    { color: 'green', text: 'Answered' },
    { color: 'purple', text: 'Marked' },
    { color: 'green', text: 'Answered & Marked', dot: true },
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
    if (!isInitialized) return; // Prevents running before loading previous state
    
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
  }, [isInitialized]); // Runs only when initialization is done
  

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

    const handleNumpadInput = useCallback((num) => {
      let newValue;
      if (num === '±') {
        newValue = localValue.startsWith('-') ? localValue.slice(1) : `-${localValue}`;
      } else {
        newValue = localValue + num.toString();
      }
      if (Math.abs(parseInt(newValue) || 0) <= 99999) {
        setLocalValue(newValue);
        handleOptionSelect(question.id, newValue, true);
      }
    }, [localValue, question.id, handleOptionSelect]);

    const handleBackspace = useCallback(() => {
      const newValue = localValue.slice(0, -1);
      setLocalValue(newValue);
      handleOptionSelect(question.id, newValue, true);
    }, [localValue, question.id, handleOptionSelect]);

    const handleClear = useCallback(() => {
      setLocalValue('');
      handleOptionSelect(question.id, '', true);
    }, [question.id, handleOptionSelect]);

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
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 1,
        ml: 2,
        width: "200px",
      }}
    >
      {[7, 8, 9, 4, 5, 6, 1, 2, 3, "±", 0].map((num) => (
        <Button
          key={num}
          variant="outlined"
          onClick={() => onInput(num)}
          sx={{ minWidth: "60px", minHeight: "50px" }} // Ensures equal button size
        >
          {num}
        </Button>
      ))}
  
      <Button
        variant="outlined"
        color="error"
        onClick={onBackspace}
        sx={{ minWidth: "60px", minHeight: "50px" }} // Ensures uniform size
      >
        ⌫
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={onClear}
        sx={{ minWidth: "60px", minHeight: "50px" }} // Ensures uniform size
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
  
    // Add to submitted answers
    setSubmittedAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        userAnswer: selectedAnswers[currentQuestion.id],
      },
    ]);
  
    // Navigate to next question and update visited status
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      if (!visitedQuestions.includes(newIndex)) {
        setVisitedQuestions((prev) => [...prev, newIndex]);
      }
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
    const subjectIndices = {
      Physics: 0,
      Chemistry: 25,
      Mathematics: 50,
    };
  
    setCurrentQuestionIndex(subjectIndices[subject] || 0);
  };

  //-------------------------------------------------------------------- Submit Confirmation handler
  const handleSubmitConfirmation = async () => {  
    if (!userId) {
      console.error("Error: User ID is missing!");
      return;
    }

    const userConfirmed = window.confirm("Are you sure you want to submit your test?");
    if (!userConfirmed) {
      console.log("Submission cancelled by user.");
      return;
    }
    
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(selectedAnswers).length;
    const correctAnswers = questions.filter(
      (q) => selectedAnswers[q.id] === q.correctAnswer
    ).length;

    const questionStatuses = questions.map(q => {
      const isAnswered = selectedAnswers[q.id] !== undefined;
      const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
      const isMarked = markedQuestions[q.id] !== undefined;

      return {
        questionId: String(q.id),
        status: isAnswered
          ? isCorrect
            ? "Correct Solved"
            : "Wrong Solved"
          : isMarked
          ? "Marked"
          : "Not Visited"
      };
    });

    const marksObtained = questionStatuses.filter(q => q.status === "Correct Solved").length;

    const wrongQuestions = questions.filter(q => 
      selectedAnswers[q.id] && 
      selectedAnswers[q.id] !== q.correctAnswer
    ).map(q => {
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
    }).filter(q => q !== null);

    try {
      // Ensure submittedAnswers stores all selected answers
      const updatedSubmittedAnswers = { ...selectedAnswers };
      
      const docRef = await addDoc(collection(db, "testResults"), {
        userId: userId,
        testId: testId,
        marksObtained: marksObtained,
        totalMarks: totalQuestions,
        wrongQuestions: wrongQuestions,
        timestamp: new Date(),
        durationUsed: 3600 - remainingTime,
        selectedAnswers: selectedAnswers,
        submittedAnswers: updatedSubmittedAnswers, // Updated here
        markedQuestions: Object.keys(markedQuestions),
        questionStatuses: questionStatuses,
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
      correctAnswers: marksObtained,
      unansweredQuestions: totalQuestions - answeredQuestions,
      markedQuestions: Object.keys(markedQuestions).length,
      submittedAnswers: updatedSubmittedAnswers, // Updated here
    };
    setTestResults(resultData);
    clearLocalStorage(); 
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
  
    if (isAnswered && isMarkedForReview) return "green";
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
      <Header logo={logo} remainingTime={remainingTime} formatTime={formatTime} />
      <Subheader handleSubjectClick={handleSubjectClick} setIsDrawerOpen={setIsDrawerOpen} handlesubmitclick={handleSubmitConfirmation}/>
      <PreventNavigation /> 
  
       
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
            boxShadow: '3px 3px 3px rgba(0, 0, 0, 0.1)',
            border:'none',
            position: 'relative',
            mb: { xs: 2, md: 0 } 
          }}>
              {/* Question Content */}
              <Box sx={{
                mb: 2,
                p: 1,
                border:'none',
                minHeight: { xs: '75vh', sm: '40vh' },
                maxHeight: { xs: '60vh', sm: '60vh' },
                overflowY: "auto",
                fontSize: { xs: '0.9rem', sm: '1rem' },
                '& .MathJax': { fontSize: '0.9rem !important' } ,// Scale down equations
                whiteSpace: "pre-wrap"
              }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' , fontWeight: 'bold'}}} >
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
                {option.match(/\.(jpg|jpeg|png|gif)$/i) ? (  // Check for any image file
                    <img 
                        src={option.startsWith("http") ? option : `/images/${option}`}  // If not HTTP, assume local
                        alt={`Option ${i}`} 
                        style={{ maxWidth: "100px", maxHeight: "100px" }} 
                        onError={(e) => e.target.style.display = "none"} // Hide broken images
                    />
                ) : (
                    <MathJax dynamic key={`${currentQuestionIndex}-${i}`}>
                        {option.includes("\\") ? `\\(${option}\\)` : `\\text{${option}}`}
                    </MathJax>
                )}
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

                <Box   sx={{
        display: { xs: 'none', md: 'block' },
        position: 'fixed',
        bottom: 32,
        left: 0,
        right: 395,
        bgcolor: 'background.paper',       
        py: 1,
        px: 2,
        borderRadius: 1,
        zIndex: 1000
      }}>
        <Box sx={{
          display: 'flex',
          gap: 2,
          
          maxWidth: 1200,
          margin: '0 auto',
          '& button': {
            width: '140px',
            height:'40px',
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
           <button
        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
        disabled={currentQuestionIndex === 0}
        className="flex items-center gap-2 rounded-full px-4 py-2 bg-[#FF5733] text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowLeft size={16} />
        Previous
      </button>

      

      <button
        onClick={handleMarkForReview}
        className="rounded-full px-4 py-2 bg-[#e3873b] text-white"
      >
        Mark Review
      </button>

      <button
        onClick={handleClearResponse}
        className="rounded-full px-4 py-2 bg-[#E64A19] text-white hover:bg-[#E64A19]/90"
      >
        Clear
      </button>

      <button
        onClick={handleSaveAndNext}
        className="flex items-center gap-2 rounded-full px-4 py-2 bg-[#4fd65e] text-white"
      >
        Save & Next
      </button>

      <button
        onClick={handleNext}
        disabled={currentQuestionIndex === questions.length - 1} 
        sx={{ borderRadius: "50%"}}
        className="flex items-center gap-2 rounded-2xl px-4 py-2 bg-[#646464] text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
        <ArrowRight size={22} />
      </button>
        </Box>
      </Box>
    <Box
  sx={{
    display: "flex",
    display: { xs: "flex", sm: "none" },
    gap: 1,
    justifyContent: "center", // Centers buttons in one line
    alignItems: "center",
    "& button": {
      fontSize: "0.7rem",
      py: 0.5,
      px: 1.5,
      borderRadius: "20px", // Makes buttons rounded
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      minWidth: "unset",
    },
  }}
>
<Button
  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
  disabled={currentQuestionIndex === 0}
  variant="contained"
  sx={{
    backgroundColor: "",
    color: "white",
    borderRadius: "50%",  // Ensures circular shape
    width: "30px",        // Fixed width
    height: "30px",       // Fixed height
    minWidth: "unset",    // Prevents stretching
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
  size="small"
>
  <ArrowBackRoundedIcon />
</Button>

<Button
    onClick={handleClearResponse}
    variant="contained"
    sx={{ backgroundColor: "#FF5733" }}
    size="small"
  >
    Clear
  </Button>

  <Button
    onClick={handleMarkForReview}
    variant="contained"
    sx={{ backgroundColor: "#e3873b", color: "white" }}
    size="small"
  >
    Review
  </Button>

  <Button
    onClick={handleSaveAndNext}
    variant="contained"
    sx={{ backgroundColor: "#4fd65e", color: "white" }}
    size="small"
  >
    Save & Next
  </Button>

  

  <Button
  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev + 1))}
  disabled={currentQuestionIndex === questions.length - 1}
  variant="contained"
  sx={{
    backgroundColor: "",
    color: "",
    borderRadius: "50%",  // Ensures circular shape
    width: "30px",        // Fixed width
    height: "30px",       // Fixed height
    minWidth: "unset",    // Prevents stretching
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
  size="small"
>
  <ArrowForwardRoundedIcon />
</Button>
</Box>


            </Paper>
          </Grid>

          {/* Right Section - Question Navigation */}
<Grid item xs={12} md={3} sx={{ order: { xs: 1, sm: 0 } ,display: { xs: 'none', md: 'block' }, border:'none'}}>
  <Paper elevation={3} sx={{ p: 1, height: { xs: 'auto', sm: '75vh' }, overflowY: 'auto', border:'none'}}>
    <Box sx={{ display: {xs:'block', sm:'none'}, justifyContent: 'flex-end' }}>
      <IconButton onClick={() => setIsPalletOpen(!isPalletOpen)} size="small">
        {isPalletOpen ? <ChevronRight /> : <ChevronLeft />}
      </IconButton>
    </Box>

    {isPalletOpen && (
      <>
        {/* Legend - Modified for mobile */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2,fontSize: '0.7rem'}}>
          {legendItems.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{width: 16,height: 16,borderRadius: '50%', bgcolor: item.color ,position: 'relative'}}>
                {item.dot && (<Box sx={{position: 'absolute',bottom: -2,right: -2,width: 8,height: 8,bgcolor: 'warning.main',borderRadius: '50%'}} />)}
              </Box>
              <Typography variant="caption">{item.text}</Typography>
            </Box>
          ))}
        </Box>

                  {/* Question buttons - Modified grid for mobile */}
        <Box sx={{display: 'grid',gridTemplateColumns: 'repeat(5, 1fr)',gap: 1,'@media (min-width: 400px)': {gridTemplateColumns: 'repeat(7, 1fr)'}}}>
            {questions.map((_, index) => {const status = getQuestionStatus(index);
            
              return (
                  <Button key={index}onClick={() => handleQuestionView(index)}variant="contained"sx={{minWidth: 32,height: 32,p: 0,fontSize: '0.75rem',
                    bgcolor: theme => {
                      if (currentQuestionIndex === index) return '#00000'; // Current question
                        return `${statusColors[status]?.main || '#00000'}` // Default light gray
                    },
                            color: theme => {
                              if (currentQuestionIndex === index) return 'white';
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

          <SwipeableDrawer
  anchor="right"
  open={isDrawerOpen}
  onClose={() => setIsDrawerOpen(false)}
  onOpen={() => setIsDrawerOpen(true)}
  sx={{ 
    '& .MuiDrawer-paper': { 
      width: '80%',
      maxWidth: 300,
      p: 2,
      boxSizing: 'border-box'
    } 
  }}
>
  <Box sx={{ display: 'flex', justifyContent: 'flex-end'}}>
    <IconButton onClick={() => setIsDrawerOpen(false)}>
      <ChevronRight />
    </IconButton>
  </Box>
  
  {/* Reuse the question panel content from desktop */}
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" gutterBottom>
      Question Palette
    </Typography>
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(2, 1fr)', 
      gap: 1,
      fontSize: '0.7rem'
    }}>
      {legendItems.map((item, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            bgcolor:item.color,
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
  </Box>

  <Box sx={{
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 1,
    overflowY: 'auto'
  }}>
    {questions.map((_, index) => {
      const status = getQuestionStatus(index);
      return (
        <Button
          key={index}
          onClick={() => {
            handleQuestionView(index);
            setIsDrawerOpen(false);
          }}
          variant="contained"
          sx={{
            minWidth: 32,
            height: 32,
            p: 0,
            fontSize: '0.75rem',
            bgcolor: theme => {
              if (currentQuestionIndex === index) return "#1976d2"; // A clear blue for active
              return statusColors[status]?.main || "#e0e0e0"; // A neutral default
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
</SwipeableDrawer>
        </Grid>
      </>
    </MathJaxContext>
  );
};

export default React.memo(TestPage);
