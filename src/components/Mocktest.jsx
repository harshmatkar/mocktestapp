import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Grid,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  background: 'linear-gradient(145deg, #f0f4f8, #ffffff)',
  boxShadow: '0 8px 15px rgba(0,0,0,0.1)',
}));

const OptionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(1.5),
  width: '100%',
  justifyContent: 'flex-start',
  textTransform: 'none',
  borderRadius: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

const QuestionGridButton = styled(Button)(({ theme }) => ({
  width: '100%',
  margin: theme.spacing(1, 0),
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  transition: 'background-color 0.3s ease',
  '&.answered': {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  },
  '&.current': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

const MockTest = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(600); // 10-minute timer
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/questions');
        setQuestions(response.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
        alert('Failed to fetch questions. Please check your network or API.');
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOptionClick = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1));
    setSelectedOption(null);
  };

  const handleJumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setSelectedOption(answers[questions[index]?.id] || null);
  };

  const handleSubmit = () => {
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct) {
        score += 1;
      }
    });

    alert(`Test submitted! Your score is ${score}/${questions.length}`);
  };

  if (questions.length === 0) {
    return <LinearProgress />;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const timeRemaining = `${Math.floor(timer / 60).toString().padStart(2, '0')}:${(timer % 60).toString().padStart(2, '0')}`;

  return (
    <Container maxWidth="lg">
      <Grid container spacing={2}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <StyledPaper elevation={3}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" color="primary" gutterBottom>
                JEE Final Mock Test
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </Typography>
                <Typography variant="h6" color="error">
                  Time Left: {timeRemaining}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                {currentQuestion.question}
              </Typography>
              <Grid container spacing={2}>
                {currentQuestion.options.map((option) => (
                  <Grid item xs={12} md={6} key={option}>
                    <OptionButton
                      variant={selectedOption === option ? 'contained' : 'outlined'}
                      color={selectedOption === option ? 'primary' : 'inherit'}
                      onClick={() => handleOptionClick(currentQuestion.id, option)}
                    >
                      {option}
                    </OptionButton>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={handleNextQuestion} 
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next Question
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSubmit} 
                disabled={Object.keys(answers).length < questions.length}
              >
                Submit Test
              </Button>
            </Box>
          </StyledPaper>
        </Grid>

        {/* Right Sidebar: Question Grid */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Jump to Question
            </Typography>
            <Grid container spacing={1}>
              {questions.map((_, index) => (
                <Grid item xs={3} key={index}>
                  <QuestionGridButton
                    className={`${answers[questions[index]?.id] ? 'answered' : ''} ${
                      currentQuestionIndex === index ? 'current' : ''
                    }`}
                    variant="outlined"
                    onClick={() => handleJumpToQuestion(index)}
                  >
                    {index + 1}
                  </QuestionGridButton>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MockTest;
